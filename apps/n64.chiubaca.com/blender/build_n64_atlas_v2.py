import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

# 1. Load Front Photo (400x400)
photo_im = Image.open("/tmp/opencode/user_photo.jpg").convert("RGB")
photo_arr = np.array(photo_im, dtype=np.float32)

mask_img = Image.new("L", (400, 400), 0)
draw = ImageDraw.Draw(mask_img)
subject_poly = [
    (165, 22), (205, 18), (248, 28), (280, 58), (300, 102), (302, 156),
    (315, 164), (326, 184), (322, 212), (305, 228), (286, 224),
    (270, 266), (268, 300), (278, 345), (345, 352), (375, 399),
    (98, 399), (135, 362), (164, 348), (160, 308),
    (142, 278), (125, 238), (116, 192), (118, 150), (122, 115),
    (126, 84), (148, 52)
]
draw.polygon(subject_poly, fill=255)
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

# 2. Load 3DGS PLY
ply_path = "/tmp/opencode/uploads/abc46c12-172f-4346-8efc-43fd0c0e8e94/object_0.ply"
with open(ply_path, "rb") as f:
    header = b""
    while not header.endswith(b"end_header\n"):
        header += f.read(1)
    data = np.frombuffer(f.read(), dtype=np.float32).reshape(-1, 17)

xyz = data[:, 0:3]
f_dc = data[:, 6:9]
opac_logit = data[:, 9]
scales = np.exp(data[:, 10:13])
alpha = 1.0 / (1.0 + np.exp(-opac_logit))
C0 = 0.28209479177387814
rgb = np.clip(0.5 + C0 * f_dc, 0.0, 1.0)

valid = alpha > 0.12
xyz = xyz[valid]
rgb = rgb[valid]
alpha = alpha[valid]
max_scale = scales[valid].max(axis=1)

# Measure target skin tone from photo right cheek vs PLY side cheek
photo_right_skin = np.median(photo_arr[180:250, 225:275].reshape(-1, 3), axis=0) / 255.0
photo_left_skin  = np.median(photo_arr[180:250, 122:150].reshape(-1, 3), axis=0) / 255.0
photo_mid_skin   = 0.55 * photo_right_skin + 0.45 * photo_left_skin

# PLY side cheek splats (abs(x) > 0.14, y in [-0.15, 0.05], z in [-0.05, 0.15])
ply_cheek_mask = (np.abs(xyz[:, 0]) > 0.13) & (xyz[:, 1] > -0.15) & (xyz[:, 1] < 0.02) & (xyz[:, 2] > -0.05) & (xyz[:, 2] < 0.12)
ply_skin_med = np.median(rgb[ply_cheek_mask], axis=0)
print("Photo skin RGB:", photo_Right:=photo_right_skin, "Left:", photo_left_skin, "PLY skin med:", ply_skin_med)

def color_match_ply(rgb_in, target_skin):
    out = rgb_in.copy()
    luma = 0.299 * out[:, 0] + 0.587 * out[:, 1] + 0.114 * out[:, 2]
    # Identify skinness smoothly (warm chromaticity + mid/high luma)
    chroma_warm = np.clip((out[:, 0] - out[:, 2]) * 4.5, 0.0, 1.0)
    skin_w = np.clip((luma - 0.18) / 0.22, 0.0, 1.0) * chroma_warm
    scale_rgb = target_skin / np.maximum(ply_skin_med, 1e-3)
    for c in range(3):
        out[:, c] = out[:, c] * (1.0 - skin_w + skin_w * scale_rgb[c])
    # Deepen dark hair & hoodie so black levels match photo
    dark_w = np.clip((0.30 - luma) / 0.20, 0.0, 1.0) * (1.0 - skin_w * 0.7)
    out = out * (1.0 - 0.22 * dark_w)[:, None]
    return np.clip(out, 0.0, 1.0)

rgb_right = color_match_ply(rgb, 0.75 * photo_right_skin + 0.25 * photo_mid_skin)
rgb_left  = color_match_ply(rgb, 0.75 * photo_left_skin  + 0.25 * photo_mid_skin)
rgb_back  = color_match_ply(rgb, photo_mid_skin)

span = 1.04
def render_ply_view(rgb_src, mask_cond, u_coord, v_coord, depth_coord, flip_u=False, flip_v=True, size=400):
    u = u_coord[mask_cond]
    v = v_coord[mask_cond]
    d = depth_coord[mask_cond]
    c = rgb_src[mask_cond]
    a = alpha[mask_cond]
    sc = max_scale[mask_cond]

    order = np.argsort(d)
    u, v, c, a, sc = u[order], v[order], c[order], a[order], sc[order]
    s = np.clip((sc / span * size * 2.0).astype(np.int32), 1, 6)
    if flip_u: u = -u
    if flip_v: v = -v
    px = ((u / span + 0.5) * size).astype(np.int32)
    py = ((v / span + 0.5) * size).astype(np.int32)

    acc_col = np.zeros((size, size, 3), dtype=np.float32)
    acc_alpha = np.zeros((size, size), dtype=np.float32)

    m = (px >= 6) & (px < size - 6) & (py >= 6) & (py < size - 6)
    px, py, c, a, s = px[m], py[m], c[m], a[m], s[m]

    for i in range(len(px)):
        x0, y0, r, col, al = px[i], py[i], s[i], c[i], a[i]
        cur_a = acc_alpha[y0-r:y0+r+1, x0-r:x0+r+1]
        rem = (1.0 - cur_a)
        w_s = rem * al * 0.65
        acc_col[y0-r:y0+r+1, x0-r:x0+r+1] += w_s[:, :, None] * col
        acc_alpha[y0-r:y0+r+1, x0-r:x0+r+1] += w_s

    fg_mask = acc_alpha > 0.35
    out = np.zeros((size, size, 3), dtype=np.float32)
    valid_px = acc_alpha > 1e-4
    out[valid_px] = (acc_col[valid_px] / acc_alpha[valid_px, None]) * 255.0

    fg_img = Image.fromarray((fg_mask * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))
    fg_eroded = np.array(fg_img) > 128
    for y in range(size):
        vx = np.where(fg_eroded[y])[0]
        if len(vx) > 0:
            lx, rx = vx[0], vx[-1]
            out[y, :lx] = out[y, lx]
            out[y, rx+1:] = out[y, rx]
        else:
            out[y, :] = [20, 17, 17]
    return np.clip(out, 0, 255)

v_right = render_ply_view(rgb_right, xyz[:, 0] > -0.02, xyz[:, 1], xyz[:, 2], -xyz[:, 0], flip_u=False, flip_v=True)
v_left  = render_ply_view(rgb_left,  xyz[:, 0] <  0.02, xyz[:, 1], xyz[:, 2],  xyz[:, 0], flip_u=False, flip_v=True)
v_back  = render_ply_view(rgb_back,  xyz[:, 1] > -0.02, xyz[:, 0], xyz[:, 2], -xyz[:, 1], flip_u=False, flip_v=True)

q_res = 96
def make_n64_quad(arr_400):
    im = Image.fromarray(arr_400.astype(np.uint8))
    im = ImageEnhance.Contrast(im).enhance(1.14)
    im = ImageEnhance.Sharpness(im).enhance(1.35)
    small = im.resize((q_res, q_res), Image.Resampling.BILINEAR)
    s_arr = np.array(small, dtype=np.uint8)
    s_arr = (s_arr // 8) * 8 + 4
    return s_arr

q_front = make_n64_quad(cleaned_front)
q_right = make_n64_quad(v_right)
q_left  = make_n64_quad(v_left)
q_back  = make_n64_quad(v_back)

atlas = np.zeros((q_res * 2, q_res * 2, 3), dtype=np.uint8)
atlas[0:q_res, 0:q_res]             = q_front # Top-Left: Front
atlas[0:q_res, q_res:q_res*2]       = q_right # Top-Right: Right (+X)
atlas[q_res:q_res*2, 0:q_res]       = q_left  # Bottom-Left: Left (-X)
atlas[q_res:q_res*2, q_res:q_res*2] = q_back  # Bottom-Right: Back (+Y)

atlas_im = Image.fromarray(atlas)
atlas_im.save("/tmp/opencode/n64_atlas_v2.png")
atlas_im.resize((512, 512), Image.Resampling.NEAREST).save("/tmp/opencode/n64_atlas_v2_preview.png")
print("Updated color-matched /tmp/opencode/n64_atlas_v2.png")
