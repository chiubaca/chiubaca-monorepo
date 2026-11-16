import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

base_atlas = Image.open("/tmp/opencode/n64_atlas_v2.png").convert("RGB")
photo_im = Image.open("/tmp/opencode/user_photo.jpg").convert("RGB")
photo_arr = np.array(photo_im, dtype=np.float32)

mask_img = Image.new("L", (400, 400), 0)
draw_m = ImageDraw.Draw(mask_img)
subject_poly = [
    (165, 22), (205, 18), (248, 28), (280, 58), (300, 102), (302, 156),
    (315, 164), (326, 184), (322, 212), (305, 228), (286, 224),
    (270, 266), (268, 300), (278, 345), (345, 352), (375, 399),
    (98, 399), (135, 362), (164, 348), (160, 308),
    (142, 278), (125, 238), (116, 192), (118, 150), (122, 115),
    (126, 84), (148, 52)
]
draw_m.polygon(subject_poly, fill=255)
mask = np.array(mask_img) > 128

cleaned_front = photo_arr.copy()
pure_left_skin = np.median(photo_arr[180:215, 120:136].reshape(-1, 3), axis=0)
for y in range(400):
    valid_x = np.where(mask[y])[0]
    if len(valid_x) > 0:
        lx, rx = valid_x[0], valid_x[-1]
        if 84 <= y <= 290:
            edge_col = cleaned_front[y, lx + 2]
            for x in range(lx + 2):
                dist = (lx + 2 - x)
                t = min(1.0, dist / 10.0)
                vert_shade = 1.0 - (y - 185) * 0.0008
                cleaned_front[y, x] = (1.0 - t) * edge_col + t * (pure_left_skin * vert_shade)
        else:
            cleaned_front[y, :lx] = cleaned_front[y, lx]
        cleaned_front[y, rx+1:] = cleaned_front[y, rx]
    else:
        cleaned_front[y, :] = [20, 17, 17]

for y in range(85):
    for x in range(400):
        hair_limit_y = 57 + 0.18 * abs(x - 195)
        if y < hair_limit_y and cleaned_front[y, x].mean() > 70:
            cleaned_front[y, x] = [22, 18, 18]

def bilinear_sample(img, X, Y):
    X = np.clip(X, 0, 398.999)
    Y = np.clip(Y, 0, 398.999)
    x0 = X.astype(np.int32)
    y0 = Y.astype(np.int32)
    fx = (X - x0)[:, :, None]
    fy = (Y - y0)[:, :, None]
    c00 = img[y0, x0]
    c10 = img[y0, x0 + 1]
    c01 = img[y0 + 1, x0]
    c11 = img[y0 + 1, x0 + 1]
    return (1 - fx) * (1 - fy) * c00 + fx * (1 - fy) * c10 + (1 - fx) * fy * c01 + fx * fy * c11

def quantize_to_q0(arr_400):
    im = Image.fromarray(np.clip(arr_400, 0, 255).astype(np.uint8))
    im = ImageEnhance.Contrast(im).enhance(1.14)
    im = ImageEnhance.Sharpness(im).enhance(1.35)
    small = im.resize((96, 96), Image.Resampling.BILINEAR)
    s_arr = np.array(small, dtype=np.uint8)
    return (s_arr // 8) * 8 + 4

Y_grid, X_grid = np.mgrid[0:400, 0:400].astype(np.float32)

# --- 1. SHOCKED EXPRESSION (Photographic warp + wide shocked eyes + open shocked mouth!) ---
Xs = X_grid.copy()
Ys = Y_grid.copy()

# Raise both eyebrows dramatically (left brow center ~(138, 120), right brow center ~(225, 115))
for bx, by in [(138, 120), (225, 115)]:
    dx = (X_grid - bx) / 28.0
    dy = (Y_grid - by) / 18.0
    w = np.exp(-0.5 * (dx*dx + dy*dy))
    Ys += w * 10.5  # sample from lower y -> shifts brow UP!

# Widen both eyes vertically (left eye (141, 152), right eye (222, 148))
for ex, ey in [(141, 152), (222, 148)]:
    dx = (X_grid - ex) / 22.0
    dy = (Y_grid - ey) / 15.0
    w = np.exp(-0.5 * (dx*dx + dy*dy))
    # Vertical expansion around ey: sample closer to ey so eyelids open wide!
    Ys -= (Y_grid - ey) * 0.45 * w

# Part upper & lower lips into an open shocked "O" mouth around (176, 239)
dx_m = (X_grid - 176.0) / 34.0
dy_m = (Y_grid - 239.0) / 24.0
w_m = np.exp(-0.5 * (dx_m*dx_m + dy_m*dy_m))
Ys -= np.sign(Y_grid - 239.0) * 11.0 * w_m

shock_arr = bilinear_sample(cleaned_front, Xs, Ys)

# Add subtle bright sclera ring & crisp pupil glint in the widened eyes, plus dark oral cavity inside the parted lips
for ex, ey, r_iris in [(141, 152, 6.2), (222, 148, 6.8)]:
    dx = X_grid - ex
    dy = (Y_grid - ey) * 1.25
    dist = np.sqrt(dx*dx + dy*dy)
    # Sclera ring (dist between r_iris and 12.5, inside widened eye opening)
    sclera_w = np.clip(1.0 - np.abs(dist - 9.2) / 3.2, 0.0, 1.0) * np.clip(1.0 - np.abs(Y_grid - ey) / 9.5, 0.0, 1.0)
    shock_arr = shock_arr * (1.0 - 0.55 * sclera_w)[:, :, None] + np.array([228, 214, 206])[None, None, :] * (0.55 * sclera_w)[:, :, None]
    # Darken & sharpen shocked pupil center + bright glint
    pupil_w = np.clip(1.0 - dist / r_iris, 0.0, 1.0)
    shock_arr = shock_arr * (1.0 - 0.7 * pupil_w)[:, :, None] + np.array([18, 14, 14])[None, None, :] * (0.7 * pupil_w)[:, :, None]
    glint_w = np.clip(1.0 - np.sqrt((X_grid - (ex + 2.2))**2 + (Y_grid - (ey - 2.2))**2) / 2.2, 0.0, 1.0)
    shock_arr = shock_arr * (1.0 - glint_w)[:, :, None] + 250.0 * glint_w[:, :, None]

# Oral cavity inside parted lips (ellipse around (176, 240), rx=21, ry=11)
om_x = (X_grid - 176.0) / 21.0
om_y = (Y_grid - 240.0) / 11.5
om_d = np.sqrt(om_x*om_x + om_y*om_y)
cavity_w = np.clip((1.0 - om_d) * 3.5, 0.0, 1.0)
# Dark mouth interior + subtle upper teeth at y=230..234 and tongue at y=245..250
interior = np.full((400, 400, 3), [36.0, 15.0, 16.0], dtype=np.float32)
teeth_w = np.clip(1.0 - np.abs(Y_grid - 231.5) / 2.8, 0.0, 1.0) * np.clip(1.0 - np.abs(X_grid - 176.0) / 14.0, 0.0, 1.0)
tongue_w = np.clip(1.0 - np.abs(Y_grid - 247.5) / 3.8, 0.0, 1.0) * np.clip(1.0 - np.abs(X_grid - 176.0) / 13.0, 0.0, 1.0)
interior = interior * (1.0 - 0.75 * teeth_w)[:, :, None] + np.array([225.0, 212.0, 204.0]) * (0.75 * teeth_w)[:, :, None]
interior = interior * (1.0 - 0.65 * tongue_w)[:, :, None] + np.array([162.0, 68.0, 68.0]) * (0.65 * tongue_w)[:, :, None]
shock_arr = shock_arr * (1.0 - cavity_w)[:, :, None] + interior * cavity_w[:, :, None]

q0_shock = quantize_to_q0(shock_arr)
atlas_shock = np.array(base_atlas).copy()
atlas_shock[0:96, 0:96] = q0_shock
Image.fromarray(atlas_shock).save("/tmp/opencode/n64_atlas_shocked.png")

# --- 2. DIZZY EXPRESSION (Photographic warp: asymmetric dazed brows, crossed/rolled eyes, wavy mouth!) ---
Xd = X_grid.copy()
Yd = Y_grid.copy()

# Left brow lowered & tilted, right brow raised high (classic dazed/dizzy brow asymmetry!)
w_bl = np.exp(-0.5 * (((X_grid - 138)/26.0)**2 + ((Y_grid - 120)/16.0)**2))
w_br = np.exp(-0.5 * (((X_grid - 225)/28.0)**2 + ((Y_grid - 115)/16.0)**2))
Yd -= w_bl * 6.5   # push left brow DOWN
Yd += w_br * 10.0  # pull right brow UP

# Wavy sinusoidal warp on the real mouth (x = 135..225, y = 220..260)
w_mouth = np.exp(-0.5 * (((X_grid - 178)/36.0)**2 + ((Y_grid - 239)/18.0)**2))
Yd += np.sin((X_grid - 142.0) * 0.21) * 6.5 * w_mouth

# Shift left eye pupil inward/up, right eye pupil inward/down
w_el = np.exp(-0.5 * (((X_grid - 141)/14.0)**2 + ((Y_grid - 152)/9.0)**2))
w_er = np.exp(-0.5 * (((X_grid - 222)/15.0)**2 + ((Y_grid - 148)/9.0)**2))
Xd -= w_el * 7.5   # shift left iris right (inward)
Yd += w_el * 3.0   # shift left iris up
Xd += w_er * 8.5   # shift right iris left (inward)
Yd -= w_er * 3.0   # shift right iris down

dizzy_arr = bilinear_sample(cleaned_front, Xd, Yd)

# Enhance the white sclera on the outer sides of the crossed eyes so the cross-eyed look reads super clearly at N64 resolution!
for ex_s, ey_s in [(133, 153), (231, 148)]:
    d_s = np.sqrt((X_grid - ex_s)**2 + ((Y_grid - ey_s)*1.4)**2)
    sw = np.clip(1.0 - d_s / 7.5, 0.0, 1.0)
    dizzy_arr = dizzy_arr * (1.0 - 0.65 * sw)[:, :, None] + np.array([226, 212, 204])[None, None, :] * (0.65 * sw)[:, :, None]

q0_dizzy = quantize_to_q0(dizzy_arr)
atlas_dizzy = np.array(base_atlas).copy()
atlas_dizzy[0:96, 0:96] = q0_dizzy
Image.fromarray(atlas_dizzy).save("/tmp/opencode/n64_atlas_dizzy.png")

preview = np.concatenate([
    np.array(base_atlas)[0:96, 0:96],
    q0_shock,
    q0_dizzy
], axis=1)
Image.fromarray(preview).resize((288*3, 96*3), Image.Resampling.NEAREST).save("/tmp/opencode/n64_expressions_preview.png")
print("Updated photographic-warp /tmp/opencode/n64_atlas_shocked.png & /tmp/opencode/n64_atlas_dizzy.png")
