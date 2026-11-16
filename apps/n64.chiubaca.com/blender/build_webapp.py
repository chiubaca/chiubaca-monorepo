import json, base64

with open("/tmp/opencode/n64_mesh_export.json", "r") as f:
    mesh_data = json.load(f)

def img_to_b64(path):
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

b64_normal  = img_to_b64("/tmp/opencode/n64_atlas_v2.png")
b64_shocked = img_to_b64("/tmp/opencode/n64_atlas_shocked.png")
b64_dizzy   = img_to_b64("/tmp/opencode/n64_atlas_dizzy.png")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#1f1916" />
<title>SUPER CHIUBACA 64 - Interactive Face Stretch!</title>
<style>
  * {{
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }}
  html, body {{
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    height: 100dvh;
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
    background: radial-gradient(circle at 50% 42%, #756250 0%, #2a211b 100%);
    font-family: 'Courier New', Courier, monospace;
    color: #fff;
  }}
  #game-canvas {{
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    touch-action: none;
  }}
  #game-canvas.grabbing {{
    cursor: grabbing;
  }}

  /* --- TOP HUD (Desktop + Mobile Safe-Area Responsive) --- */
  .hud-top {{
    position: fixed;
    top: max(10px, env(safe-area-inset-top, 10px));
    left: max(12px, env(safe-area-inset-left, 12px));
    right: max(12px, env(safe-area-inset-right, 12px));
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    pointer-events: none;
    z-index: 10;
  }}
  .title-box {{
    background: rgba(16, 14, 22, 0.84);
    border: 2.5px solid #f7d51d;
    border-radius: 10px;
    padding: 9px 14px;
    box-shadow: 0 4px 0 #000, inset 0 0 10px rgba(247, 213, 29, 0.2);
    backdrop-filter: blur(4px);
    max-width: 62%;
  }}
  .title-box h1 {{
    margin: 0 0 3px 0;
    font-size: 19px;
    letter-spacing: 0.5px;
    color: #f7d51d;
    text-shadow: 2px 2px 0 #c42c1c, -1px -1px 0 #000;
    white-space: nowrap;
  }}
  .title-box p {{
    margin: 0;
    font-size: 12px;
    line-height: 1.3;
    color: #e6dfd5;
  }}
  .top-right-col {{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    pointer-events: auto;
  }}
  .state-badge {{
    background: rgba(16, 14, 22, 0.90);
    border: 2.5px solid #4ade80;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 1px 1px 0 #000;
    box-shadow: 0 4px 0 #000;
    transition: border-color 0.15s, transform 0.15s;
    white-space: nowrap;
  }}
  .state-badge.shocked {{
    border-color: #f87171;
    color: #fca5a5;
    transform: scale(1.06);
  }}
  .state-badge.dizzy {{
    border-color: #facc15;
    color: #fef08a;
    animation: wobble 0.35s infinite alternate ease-in-out;
  }}
  @keyframes wobble {{
    from {{ transform: rotate(-4deg) scale(1.04); }}
    to   {{ transform: rotate(4deg) scale(1.04); }}
  }}
  .quick-top-btns {{
    display: flex;
    gap: 6px;
  }}

  /* --- BOTTOM DOCK (Thumb-Friendly Mobile + Desktop) --- */
  .hud-bottom {{
    position: fixed;
    bottom: max(12px, env(safe-area-inset-bottom, 12px));
    left: 50%;
    transform: translateX(-50%);
    width: min(96vw, 760px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(16, 14, 22, 0.88);
    border: 2.5px solid #60a5fa;
    border-radius: 14px;
    padding: 9px 11px;
    box-shadow: 0 5px 0 #000;
    backdrop-filter: blur(6px);
    z-index: 10;
  }}
  .btn-grid {{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }}
  .n64-btn {{
    background: #2563eb;
    color: #fff;
    border: 2px solid #93c5fd;
    border-radius: 9px;
    padding: 8px 6px;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    text-shadow: 1px 1px 0 #000;
    box-shadow: 0 3px 0 #1e3a8a;
    transition: transform 0.08s, background 0.12s;
    touch-action: manipulation;
    white-space: nowrap;
  }}
  .n64-btn:active {{
    transform: translateY(2px);
    box-shadow: 0 1px 0 #1e3a8a;
    background: #1d4ed8;
  }}
  .n64-btn.warn {{
    background: #d97706;
    border-color: #fde68a;
    box-shadow: 0 3px 0 #78350f;
    padding: 6px 10px;
  }}
  .n64-btn.icon-btn {{
    background: #374151;
    border-color: #9ca3af;
    box-shadow: 0 3px 0 #111827;
    padding: 6px 10px;
  }}
  .sliders-row {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 2px 4px 0;
  }}
  .slider-group {{
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #bfdbfe;
    flex: 1;
  }}
  .slider-group span {{
    white-space: nowrap;
    font-weight: bold;
  }}
  .slider-group input[type="range"] {{
    width: 100%;
    height: 22px;
    accent-color: #f7d51d;
    cursor: pointer;
    margin: 0;
  }}

  #glove-cursor {{
    position: fixed;
    width: 46px;
    height: 46px;
    pointer-events: none;
    z-index: 20;
    transform: translate(-50%, -50%);
    font-size: 36px;
    filter: drop-shadow(2px 4px 0px rgba(0,0,0,0.68));
    display: none;
  }}

  /* --- MOBILE PORTRAIT & SMALL SCREEN OPTIMIZATIONS --- */
  @media (max-width: 680px) {{
    .title-box {{
      padding: 6px 10px;
      max-width: 56%;
    }}
    .title-box h1 {{
      font-size: 14px;
      margin-bottom: 2px;
    }}
    .title-box p {{
      font-size: 10.5px;
    }}
    .title-box p .desktop-hint {{
      display: none;
    }}
    .state-badge {{
      font-size: 11.5px;
      padding: 6px 9px;
    }}
    .hud-bottom {{
      padding: 8px 8px;
      gap: 6px;
      border-radius: 12px;
    }}
    .btn-grid {{
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }}
    .n64-btn {{
      padding: 9px 4px;
      font-size: 12px;
    }}
    .sliders-row {{
      gap: 8px;
    }}
    .slider-group {{
      font-size: 11px;
    }}
  }}

  /* Landscape phone optimization (short height) */
  @media (max-height: 500px) {{
    .title-box p {{ display: none; }}
    .hud-bottom {{
      width: min(94vw, 680px);
      padding: 5px 8px;
      gap: 4px;
    }}
    .btn-grid {{
      grid-template-columns: repeat(6, 1fr);
    }}
    .n64-btn {{
      padding: 5px 4px;
      font-size: 11px;
    }}
  }}
</style>
</head>
<body>

<div class="hud-top">
  <div class="title-box">
    <h1>★ CHIUBACA 64 ★</h1>
    <p>
      <b>Touch &amp; Drag</b> face to tug! <b>Release</b> to boing!<span class="desktop-hint"> <b>2-Finger / Bg Drag</b> to orbit.</span>
    </p>
  </div>
  <div class="top-right-col">
    <div id="status-badge" class="state-badge">😊 NORMAL</div>
    <div class="quick-top-btns">
      <button class="n64-btn icon-btn" id="btn-mute" title="Toggle Sound">🔊</button>
      <button class="n64-btn warn" id="btn-reset">🔄 Reset</button>
    </div>
  </div>
</div>

<div class="hud-bottom">
  <div class="btn-grid">
    <button class="n64-btn" id="btn-tug-nose">🤥 Nose</button>
    <button class="n64-btn" id="btn-tug-cheek-l">😮 L-Cheek</button>
    <button class="n64-btn" id="btn-tug-cheek-r">😮 R-Cheek</button>
    <button class="n64-btn" id="btn-tug-ear">👂 Ears</button>
    <button class="n64-btn" id="btn-tug-chin">😱 Jaw</button>
    <button class="n64-btn" id="btn-tug-hair">💈 Hair</button>
  </div>
  <div class="sliders-row">
    <div class="slider-group">
      <span>Turn 360°:</span>
      <input type="range" id="yaw-slider" min="-180" max="180" step="1" value="-12" />
    </div>
    <div class="slider-group">
      <span>Grab Size:</span>
      <input type="range" id="grab-radius" min="0.20" max="0.65" step="0.02" value="0.38" />
    </div>
  </div>
</div>

<div id="glove-cursor">✋</div>
<canvas id="game-canvas"></canvas>

<script>
const MESH_DATA = {json.dumps(mesh_data)};
const TEX_URLS = {{
  normal:  "{b64_normal}",
  shocked: "{b64_shocked}",
  dizzy:   "{b64_dizzy}"
}};

// --- MOBILE HAPTICS & RETRO N64 WEB AUDIO ---
let audioCtx = null;
let isMuted = false;

function haptic(pattern) {{
  if (navigator.vibrate) {{
    try {{ navigator.vibrate(pattern); }} catch (e) {{}}
  }}
}}

function initAudio() {{
  if (isMuted) return;
  if (!audioCtx) {{
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }}
  if (audioCtx && audioCtx.state === 'suspended') {{
    audioCtx.resume();
  }}
}}

document.getElementById('btn-mute').addEventListener('click', e => {{
  isMuted = !isMuted;
  e.currentTarget.textContent = isMuted ? '🔇' : '🔊';
}});

function playStretchSound(stretchMag) {{
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  const baseFreq = 190 + Math.min(420, stretchMag * 380);
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.09);
  gain.gain.setValueAtTime(0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.005, now + 0.10);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.10);
}}

function playBoingSound(intensity) {{
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(340, now + 0.45);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(14, now);
  lfoGain.gain.setValueAtTime(85 * Math.min(1.5, intensity), now);
  lfoGain.gain.exponentialRampToValueAtTime(4, now + 0.65);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.002, now + 0.68);

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  lfo.start(now);
  osc.stop(now + 0.68);
  lfo.stop(now + 0.68);
}}

function playDizzyChime() {{
  if (!audioCtx || isMuted) return;
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99];
  notes.forEach((freq, idx) => {{
    const now = audioCtx.currentTime + idx * 0.14;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.002, now + 0.13);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }});
}}

// --- BUILD 3D MESH & SPRING-DAMPER VERTEX PHYSICS ---
const numVerts = MESH_DATA.verts.length;
const numTris  = MESH_DATA.tris.length;

const PIVOT = [0.0, -0.15, 1.32];
const restPos = new Float32Array(numVerts * 3);
const curPos  = new Float32Array(numVerts * 3);
const dispU   = new Float32Array(numVerts * 3);
const velV    = new Float32Array(numVerts * 3);
const pinWeight = new Float32Array(numVerts);

for (let i = 0; i < numVerts; i++) {{
  const x = MESH_DATA.verts[i][0] - PIVOT[0];
  const y = MESH_DATA.verts[i][1] - PIVOT[1];
  const z = MESH_DATA.verts[i][2] - PIVOT[2];
  restPos[i*3+0] = x;
  restPos[i*3+1] = y;
  restPos[i*3+2] = z;
  curPos[i*3+0]  = x;
  curPos[i*3+1]  = y;
  curPos[i*3+2]  = z;
  const origZ = MESH_DATA.verts[i][2];
  pinWeight[i] = Math.max(0.0, Math.min(1.0, (origZ - 0.15) / 0.45));
}}

const morphShocked = new Float32Array(numVerts * 3);
const morphDizzy   = new Float32Array(numVerts * 3);

for (let i = 0; i < numVerts; i++) {{
  const vx = MESH_DATA.verts[i][0];
  const vy = MESH_DATA.verts[i][1];
  const vz = MESH_DATA.verts[i][2];

  if (vy < -0.65) {{
    if (vz > 1.64 && vz < 1.84 && Math.abs(vx) < 0.52) {{
      morphShocked[i*3+2] += 0.075;
      morphShocked[i*3+1] -= 0.025;
      morphDizzy[i*3+2]   += (vx > 0 ? 0.065 : -0.045);
    }}
    if (vz > 1.48 && vz < 1.63 && Math.abs(vx) > 0.10 && Math.abs(vx) < 0.44) {{
      if (vz > 1.555) morphShocked[i*3+2] += 0.032;
      else            morphShocked[i*3+2] -= 0.032;
    }}
    if (vz > 0.62 && vz < 1.06 && Math.abs(vx) < 0.44) {{
      const jawFactor = Math.max(0.0, Math.min(1.0, (1.06 - vz) / 0.25));
      morphShocked[i*3+2] -= 0.095 * jawFactor;
      morphShocked[i*3+1] += 0.030 * jawFactor;
      morphDizzy[i*3+0]   += 0.045 * jawFactor * Math.sin(vz * 8.0);
    }}
  }}
}}

function createStarGeometry() {{
  const R_out = 0.13, R_in = 0.055, depth = 0.04;
  const ring = [];
  for (let k = 0; k < 10; k++) {{
    const ang = (k * Math.PI) / 5.0 - Math.PI / 2.0;
    const r = (k % 2 === 0) ? R_out : R_in;
    ring.push([r * Math.cos(ang), 0.0, r * Math.sin(ang)]);
  }}
  const frontC = [0, -depth, 0], backC = [0, depth, 0];
  const starTris = [];
  for (let k = 0; k < 10; k++) {{
    const p0 = ring[k], p1 = ring[(k + 1) % 10];
    starTris.push([frontC, p0, p1]);
    starTris.push([backC, p1, p0]);
  }}
  return starTris;
}}
const STAR_TRIS = createStarGeometry();

// --- WEBGL RENDERER SETUP ---
const canvas = document.getElementById('game-canvas');
const gl = canvas.getContext('webgl', {{ antialias: false, powerPreference: 'high-performance' }});

const vsSource = `
  attribute vec3 aPos;
  attribute vec3 aNormal;
  attribute vec2 aUV;
  uniform mat4 uProj;
  uniform mat4 uView;
  uniform mat4 uModel;
  varying vec3 vNormal;
  varying vec2 vUV;
  void main() {{
    vec4 worldPos = uModel * vec4(aPos, 1.0);
    vNormal = mat3(uModel) * aNormal;
    vUV = aUV;
    gl_Position = uProj * uView * worldPos;
  }}
`;

const fsSource = `
  precision mediump float;
  varying vec3 vNormal;
  varying vec2 vUV;
  uniform sampler2D uTex;
  uniform int uIsSolidColor;
  uniform vec3 uSolidColor;
  void main() {{
    vec3 n = normalize(vNormal);
    vec3 light1 = normalize(vec3(0.45, -0.75, 0.50));
    vec3 light2 = normalize(vec3(-0.55, -0.45, 0.30));
    vec3 light3 = normalize(vec3(0.0, 0.85, 0.35));
    float diff = max(0.0, dot(n, light1)) * 0.68
               + max(0.0, dot(n, light2)) * 0.28
               + max(0.0, dot(n, light3)) * 0.25;
    float shade = clamp(0.36 + diff * 0.72, 0.0, 1.18);
    if (uIsSolidColor == 1) {{
      gl_FragColor = vec4(uSolidColor * shade, 1.0);
    }} else {{
      vec4 texCol = texture2D(uTex, vUV);
      gl_FragColor = vec4(texCol.rgb * shade, 1.0);
    }}
  }}
`;

function compileShader(type, src) {{
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}}
const prog = gl.createProgram();
gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(prog);
gl.useProgram(prog);

const aPosLoc    = gl.getAttribLocation(prog, 'aPos');
const aNormLoc   = gl.getAttribLocation(prog, 'aNormal');
const aUVLoc     = gl.getAttribLocation(prog, 'aUV');
const uProjLoc   = gl.getUniformLocation(prog, 'uProj');
const uViewLoc   = gl.getUniformLocation(prog, 'uView');
const uModelLoc  = gl.getUniformLocation(prog, 'uModel');
const uTexLoc    = gl.getUniformLocation(prog, 'uTex');
const uSolidFlag = gl.getUniformLocation(prog, 'uIsSolidColor');
const uSolidCol  = gl.getUniformLocation(prog, 'uSolidColor');

const textures = {{}};
['normal', 'shocked', 'dizzy'].forEach(key => {{
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([180, 130, 100, 255]));
  const img = new Image();
  img.onload = () => {{
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }};
  img.src = TEX_URLS[key];
  textures[key] = tex;
}});

const headVertexData = new Float32Array(numTris * 3 * 8);
const headBuffer = gl.createBuffer();

const starVertexData = new Float32Array(STAR_TRIS.length * 3 * 8);
for (let t = 0; t < STAR_TRIS.length; t++) {{
  const [p0, p1, p2] = STAR_TRIS[t];
  const ux = p1[0]-p0[0], uy = p1[1]-p0[1], uz = p1[2]-p0[2];
  const vx = p2[0]-p0[0], vy = p2[1]-p0[1], vz = p2[2]-p0[2];
  let nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;
  const nl = Math.hypot(nx, ny, nz) || 1;
  nx /= nl; ny /= nl; nz /= nl;
  [p0, p1, p2].forEach((p, k) => {{
    const base = (t * 3 + k) * 8;
    starVertexData[base+0] = p[0]; starVertexData[base+1] = p[1]; starVertexData[base+2] = p[2];
    starVertexData[base+3] = nx;   starVertexData[base+4] = ny;   starVertexData[base+5] = nz;
    starVertexData[base+6] = 0;    starVertexData[base+7] = 0;
  }});
}}
const starBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
gl.bufferData(gl.ARRAY_BUFFER, starVertexData, gl.STATIC_DRAW);

// --- ADAPTIVE PORTRAIT & LANDSCAPE CAMERA FRAMING ---
let baseCamDist = 3.55;
function getEffectiveCamera(width, height) {{
  const aspect = width / Math.max(1, height);
  // On narrow mobile portrait screens (aspect < 0.85), automatically pull camera back
  // and shift vertical framing slightly so the head, ears, and stretched cheeks never clip!
  let effDist = baseCamDist;
  let camZOffset = 0.05;
  if (aspect < 0.85) {{
    effDist = baseCamDist / Math.pow(aspect / 0.85, 0.62);
    effDist = Math.min(6.4, effDist);
    camZOffset = -0.06; // shift bust slightly up above the bottom button dock on portrait phones
  }}
  return {{ effDist, camZOffset, aspect }};
}}

function mat4Perspective(fovRad, aspect, near, far) {{
  const f = 1.0 / Math.tan(fovRad / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ]);
}}

function mat4ViewFromBlenderCam(effDist, camZOffset) {{
  return new Float32Array([
    1,  0,  0, 0,
    0,  0, -1, 0,
    0,  1,  0, 0,
    0, camZOffset, -effDist, 1
  ]);
}}

function mat4EulerZYX(rx, ry, rz, tx=0, ty=0, tz=0, scale=1) {{
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);
  return new Float32Array([
    scale*(cz*cy), scale*(sz*cx + cz*sy*sx), scale*(sz*sx - cz*sy*cx), 0,
    scale*(-sz*cy), scale*(cz*cx - sz*sy*sx), scale*(cz*sx + sz*sy*cx), 0,
    scale*(sy), scale*(-cy*sx), scale*(cy*cx), 0,
    tx, ty, tz, 1
  ]);
}}

function transformPoint(m, p) {{
  return [
    m[0]*p[0] + m[4]*p[1] + m[8]*p[2]  + m[12],
    m[1]*p[0] + m[5]*p[1] + m[9]*p[2]  + m[13],
    m[2]*p[0] + m[6]*p[1] + m[10]*p[2] + m[14]
  ];
}}

function invTransformDir(m, d) {{
  return [
    m[0]*d[0] + m[1]*d[1] + m[2]*d[2],
    m[4]*d[0] + m[5]*d[1] + m[6]*d[2],
    m[8]*d[0] + m[9]*d[1] + m[10]*d[2]
  ];
}}

// --- INTERACTIVE STATE MACHINE ---
let state = 'normal';
let dizzyTimer = 0.0;
let shockedWeight = 0.0;
let dizzyWeight   = 0.0;

let headYawDeg = -11.5;
let headPitchDeg = -4.0;
let isOrbiting = false;
let lastMouseX = 0, lastMouseY = 0;
let pinchStartDist = 0;

let isGrabbing = false;
let grabCenterRest = null;
let grabStartWorld = null;
let grabCurWorld   = null;
let grabRadius     = 0.38;
let maxPullDist    = 0.0;
let soundCooldown  = 0.0;

const badgeEl   = document.getElementById('status-badge');
const gloveEl   = document.getElementById('glove-cursor');
const yawSlider = document.getElementById('yaw-slider');
const radSlider = document.getElementById('grab-radius');

radSlider.addEventListener('input', e => {{ grabRadius = parseFloat(e.target.value); }});
yawSlider.addEventListener('input', e => {{ headYawDeg = parseFloat(e.target.value); }});

function setUIState(newState) {{
  state = newState;
  badgeEl.className = 'state-badge ' + (newState === 'normal' ? '' : newState);
  if (newState === 'normal') {{
    badgeEl.textContent = '😊 NORMAL';
  }} else if (newState === 'shocked') {{
    badgeEl.textContent = '😱 SHOCKED!';
  }} else if (newState === 'dizzy') {{
    badgeEl.textContent = '😵‍💫 DIZZY! BOING!';
  }}
}}

function getCurrentModelMatrix(timeSec) {{
  let rx = headPitchDeg * Math.PI / 180.0;
  let ry = 1.5 * Math.PI / 180.0;
  let rz = headYawDeg * Math.PI / 180.0;

  rx += Math.sin(timeSec * 1.8) * 0.018;
  rz += Math.cos(timeSec * 1.2) * 0.015;

  if (dizzyWeight > 0.01) {{
    rx += Math.sin(timeSec * 11.5) * 0.14 * dizzyWeight;
    ry += Math.cos(timeSec * 11.5) * 0.16 * dizzyWeight;
    rz += Math.sin(timeSec * 7.5)  * 0.12 * dizzyWeight;
  }}
  return mat4EulerZYX(rx, ry, rz, 0, 0, 0, 1.0);
}}

function screenToRay(clientX, clientY) {{
  const rect = canvas.getBoundingClientRect();
  const {{ effDist, camZOffset, aspect }} = getEffectiveCamera(rect.width, rect.height);
  const nx = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
  const ny = 1.0 - ((clientY - rect.top) / rect.height) * 2.0;
  const fovRad = 36.0 * Math.PI / 180.0;
  const tanHalf = Math.tan(fovRad / 2.0);

  const orig = [0.0, -effDist, -camZOffset];
  let dx = nx * aspect * tanHalf;
  let dy = 1.0;
  let dz = ny * tanHalf;
  const len = Math.hypot(dx, dy, dz);
  return {{ orig, dir: [dx/len, dy/len, dz/len] }};
}}

function rayIntersectMeshExact(ray, modelMat) {{
  let bestT = Infinity;
  let bestHitWorld = null;
  let bestHitRest  = null;

  for (let t = 0; t < numTris; t++) {{
    const vIdx = MESH_DATA.tris[t].v;
    const i0 = vIdx[0], i1 = vIdx[1], i2 = vIdx[2];
    const p0 = transformPoint(modelMat, [curPos[i0*3], curPos[i0*3+1], curPos[i0*3+2]]);
    const p1 = transformPoint(modelMat, [curPos[i1*3], curPos[i1*3+1], curPos[i1*3+2]]);
    const p2 = transformPoint(modelMat, [curPos[i2*3], curPos[i2*3+1], curPos[i2*3+2]]);

    const e1 = [p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]];
    const e2 = [p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]];
    const h = [
      ray.dir[1]*e2[2] - ray.dir[2]*e2[1],
      ray.dir[2]*e2[0] - ray.dir[0]*e2[2],
      ray.dir[0]*e2[1] - ray.dir[1]*e2[0]
    ];
    const a = e1[0]*h[0] + e1[1]*h[1] + e1[2]*h[2];
    if (Math.abs(a) < 1e-6) continue;
    const f = 1.0 / a;
    const s = [ray.orig[0]-p0[0], ray.orig[1]-p0[1], ray.orig[2]-p0[2]];
    const u = f * (s[0]*h[0] + s[1]*h[1] + s[2]*h[2]);
    if (u < 0.0 || u > 1.0) continue;
    const q = [
      s[1]*e1[2] - s[2]*e1[1],
      s[2]*e1[0] - s[0]*e1[2],
      s[0]*e1[1] - s[1]*e1[0]
    ];
    const v = f * (ray.dir[0]*q[0] + ray.dir[1]*q[1] + ray.dir[2]*q[2]);
    if (v < 0.0 || u + v > 1.0) continue;
    const distT = f * (e2[0]*q[0] + e2[1]*q[1] + e2[2]*q[2]);
    if (distT > 0.1 && distT < bestT) {{
      bestT = distT;
      const w0 = 1.0 - u - v;
      bestHitWorld = [
        ray.orig[0] + ray.dir[0]*distT,
        ray.orig[1] + ray.dir[1]*distT,
        ray.orig[2] + ray.dir[2]*distT
      ];
      bestHitRest = [
        w0*restPos[i0*3+0] + u*restPos[i1*3+0] + v*restPos[i2*3+0],
        w0*restPos[i0*3+1] + u*restPos[i1*3+1] + v*restPos[i2*3+1],
        w0*restPos[i0*3+2] + u*restPos[i1*3+2] + v*restPos[i2*3+2]
      ];
    }}
  }}
  return bestHitWorld ? {{ t: bestT, world: bestHitWorld, rest: bestHitRest }} : null;
}}

// Forgiving touch hit-test: if a finger tap barely misses the ear/nose edge, sample a 14px halo around the tap!
function findFaceHit(clientX, clientY, modelMat, isTouch=false) {{
  const primary = rayIntersectMeshExact(screenToRay(clientX, clientY), modelMat);
  if (primary || !isTouch) return primary;
  const offsets = [[12,0], [-12,0], [0,12], [0,-12], [10,10], [-10,10], [10,-10], [-10,-10]];
  for (const [ox, oy] of offsets) {{
    const hit = rayIntersectMeshExact(screenToRay(clientX + ox, clientY + oy), modelMat);
    if (hit) return hit;
  }}
  return null;
}}

let lastTimeSec = performance.now() * 0.001;

function onPointerDown(clientX, clientY, button, isTouch=false) {{
  initAudio();
  lastMouseX = clientX;
  lastMouseY = clientY;
  if (button === 2) {{
    isOrbiting = true;
    return;
  }}
  const modelMat = getCurrentModelMatrix(lastTimeSec);
  const hit = findFaceHit(clientX, clientY, modelMat, isTouch);
  if (hit) {{
    isGrabbing = true;
    grabCenterRest = hit.rest;
    grabStartWorld = hit.world;
    grabCurWorld   = hit.world.slice();
    maxPullDist    = 0.0;
    dizzyTimer     = 0.0;
    canvas.classList.add('grabbing');
    gloveEl.textContent = '✊';
    gloveEl.style.display = 'block';
    gloveEl.style.left = clientX + 'px';
    gloveEl.style.top  = (clientY - (isTouch ? 22 : 0)) + 'px';
    setUIState('shocked');
    playStretchSound(0.2);
    haptic(15);
  }} else {{
    isOrbiting = true;
  }}
}}

function onPointerMove(clientX, clientY, isTouch=false) {{
  gloveEl.style.left = clientX + 'px';
  gloveEl.style.top  = (clientY - (isTouch ? 22 : 0)) + 'px';

  if (isOrbiting) {{
    const dx = clientX - lastMouseX;
    const dy = clientY - lastMouseY;
    lastMouseX = clientX;
    lastMouseY = clientY;
    headYawDeg = ((headYawDeg + dx * 0.50 + 180) % 360) - 180;
    headPitchDeg = Math.max(-35, Math.min(35, headPitchDeg + dy * 0.35));
    yawSlider.value = Math.round(headYawDeg);
    return;
  }}

  if (isGrabbing && grabStartWorld) {{
    const ray = screenToRay(clientX, clientY);
    const planeT = (grabStartWorld[1] - ray.orig[1]) / ray.dir[1];
    grabCurWorld = [
      ray.orig[0] + ray.dir[0] * planeT,
      grabStartWorld[1] - 0.14,
      ray.orig[2] + ray.dir[2] * planeT
    ];

    const worldDelta = [
      grabCurWorld[0] - grabStartWorld[0],
      grabCurWorld[1] - grabStartWorld[1],
      grabCurWorld[2] - grabStartWorld[2]
    ];
    const pullMag = Math.hypot(worldDelta[0], worldDelta[1], worldDelta[2]);
    if (pullMag > maxPullDist) maxPullDist = pullMag;

    if (pullMag > 0.04) {{
      setUIState('shocked');
      if (soundCooldown <= 0) {{
        playStretchSound(pullMag);
        soundCooldown = 0.11;
      }}
    }}

    const modelMat = getCurrentModelMatrix(lastTimeSec);
    const localDelta = invTransformDir(modelMat, worldDelta);
    const maxStretch = 1.18;
    const dLen = Math.hypot(localDelta[0], localDelta[1], localDelta[2]);
    if (dLen > maxStretch) {{
      localDelta[0] *= maxStretch / dLen;
      localDelta[1] *= maxStretch / dLen;
      localDelta[2] *= maxStretch / dLen;
    }}

    const R2 = grabRadius * grabRadius;
    for (let i = 0; i < numVerts; i++) {{
      const dx = restPos[i*3+0] - grabCenterRest[0];
      const dy = restPos[i*3+1] - grabCenterRest[1];
      const dz = restPos[i*3+2] - grabCenterRest[2];
      const d2 = dx*dx + dy*dy + dz*dz;
      if (d2 < R2 * 3.2) {{
        const w = Math.exp(-d2 / (2.0 * R2)) * pinWeight[i];
        dispU[i*3+0] = localDelta[0] * w;
        dispU[i*3+1] = localDelta[1] * w;
        dispU[i*3+2] = localDelta[2] * w;
        velV[i*3+0]  = 0;
        velV[i*3+1]  = 0;
        velV[i*3+2]  = 0;
      }}
    }}
  }} else if (!isTouch) {{
    const modelMat = getCurrentModelMatrix(lastTimeSec);
    const hit = rayIntersectMeshExact(screenToRay(clientX, clientY), modelMat);
    if (hit) {{
      gloveEl.style.display = 'block';
      gloveEl.textContent = '✋';
    }} else {{
      gloveEl.style.display = 'none';
    }}
  }}
}}

function onPointerUp(isTouch=false) {{
  if (isOrbiting) {{
    isOrbiting = false;
  }}
  if (isGrabbing) {{
    isGrabbing = false;
    canvas.classList.remove('grabbing');
    if (isTouch) {{
      gloveEl.style.display = 'none';
    }} else {{
      gloveEl.textContent = '✋';
    }}
    if (maxPullDist > 0.05) {{
      playBoingSound(maxPullDist);
      playDizzyChime();
      haptic([25, 35, 18]);
      dizzyTimer = 1.65;
      setUIState('dizzy');
    }} else {{
      setUIState('normal');
    }}
  }}
}}

// Mouse listeners
canvas.addEventListener('mousedown', e => onPointerDown(e.clientX, e.clientY, e.button, false));
window.addEventListener('mousemove', e => onPointerMove(e.clientX, e.clientY, false));
window.addEventListener('mouseup', () => onPointerUp(false));
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Touch listeners (1-finger face tug or bg orbit; 2-finger pinch-zoom + twist orbit!)
canvas.addEventListener('touchstart', e => {{
  e.preventDefault();
  initAudio();
  if (e.touches.length === 1) {{
    onPointerDown(e.touches[0].clientX, e.touches[0].clientY, 0, true);
  }} else if (e.touches.length === 2) {{
    // Switch from grabbing to 2-finger orbit + pinch zoom
    if (isGrabbing) {{
      isGrabbing = false;
      gloveEl.style.display = 'none';
    }}
    isOrbiting = true;
    const t0 = e.touches[0], t1 = e.touches[1];
    lastMouseX = (t0.clientX + t1.clientX) * 0.5;
    lastMouseY = (t0.clientY + t1.clientY) * 0.5;
    pinchStartDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
  }}
}}, {{ passive: false }});

window.addEventListener('touchmove', e => {{
  if (e.touches.length === 1 && (isGrabbing || isOrbiting)) {{
    e.preventDefault();
    onPointerMove(e.touches[0].clientX, e.touches[0].clientY, true);
  }} else if (e.touches.length === 2) {{
    e.preventDefault();
    const t0 = e.touches[0], t1 = e.touches[1];
    const midX = (t0.clientX + t1.clientX) * 0.5;
    const midY = (t0.clientY + t1.clientY) * 0.5;
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);

    if (pinchStartDist > 10) {{
      const deltaPinch = pinchStartDist - dist;
      baseCamDist = Math.max(2.3, Math.min(5.2, baseCamDist + deltaPinch * 0.008));
      pinchStartDist = dist;
    }}
    const dx = midX - lastMouseX;
    const dy = midY - lastMouseY;
    lastMouseX = midX;
    lastMouseY = midY;
    headYawDeg = ((headYawDeg + dx * 0.50 + 180) % 360) - 180;
    headPitchDeg = Math.max(-35, Math.min(35, headPitchDeg + dy * 0.35));
    yawSlider.value = Math.round(headYawDeg);
  }}
}}, {{ passive: false }});

window.addEventListener('touchend', e => {{
  if (e.touches.length === 0) {{
    onPointerUp(true);
    pinchStartDist = 0;
  }}
}});

canvas.addEventListener('wheel', e => {{
  e.preventDefault();
  baseCamDist = Math.max(2.3, Math.min(5.5, baseCamDist + e.deltaY * 0.002));
}}, {{ passive: false }});

// --- ONE-CLICK FUN PRESET TUGS ---
let presetReleaseTimeout = null;
function triggerPresetTug(centerOrig, deltaVec, radius=0.38) {{
  initAudio();
  haptic(20);
  if (presetReleaseTimeout) clearTimeout(presetReleaseTimeout);
  const cRest = [
    centerOrig[0] - PIVOT[0],
    centerOrig[1] - PIVOT[1],
    centerOrig[2] - PIVOT[2]
  ];
  const R2 = radius * radius;
  for (let i = 0; i < numVerts; i++) {{
    const dx = restPos[i*3+0] - cRest[0];
    const dy = restPos[i*3+1] - cRest[1];
    const dz = restPos[i*3+2] - cRest[2];
    const d2 = dx*dx + dy*dy + dz*dz;
    const w = Math.exp(-d2 / (2.0 * R2)) * pinWeight[i];
    dispU[i*3+0] += deltaVec[0] * w;
    dispU[i*3+1] += deltaVec[1] * w;
    dispU[i*3+2] += deltaVec[2] * w;
    velV[i*3+0] = 0; velV[i*3+1] = 0; velV[i*3+2] = 0;
  }}
  isGrabbing = true;
  maxPullDist = 0.65;
  setUIState('shocked');
  playStretchSound(0.65);

  presetReleaseTimeout = setTimeout(() => {{
    isGrabbing = false;
    playBoingSound(0.8);
    playDizzyChime();
    haptic([25, 35, 18]);
    dizzyTimer = 1.65;
    setUIState('dizzy');
  }}, 520);
}}

document.getElementById('btn-tug-nose').addEventListener('click', () => {{
  triggerPresetTug([0.0, -1.10, 1.30], [0.0, -0.68, -0.10], 0.30);
}});
document.getElementById('btn-tug-cheek-l').addEventListener('click', () => {{
  triggerPresetTug([-0.46, -0.65, 1.24], [-0.58, -0.25, -0.08], 0.36);
}});
document.getElementById('btn-tug-cheek-r').addEventListener('click', () => {{
  triggerPresetTug([0.46, -0.65, 1.24], [0.58, -0.25, -0.08], 0.36);
}});
document.getElementById('btn-tug-ear').addEventListener('click', () => {{
  triggerPresetTug([0.70, 0.0, 1.32], [0.62, 0.0, 0.22], 0.32);
  triggerPresetTug([-0.70, 0.0, 1.32], [-0.62, 0.0, 0.22], 0.32);
}});
document.getElementById('btn-tug-chin').addEventListener('click', () => {{
  triggerPresetTug([0.0, -0.90, 0.78], [0.0, -0.25, -0.58], 0.36);
}});
document.getElementById('btn-tug-hair').addEventListener('click', () => {{
  triggerPresetTug([0.03, -0.52, 2.45], [0.08, -0.30, 0.62], 0.38);
}});
document.getElementById('btn-reset').addEventListener('click', () => {{
  dispU.fill(0);
  velV.fill(0);
  dizzyTimer = 0;
  isGrabbing = false;
  baseCamDist = 3.55;
  headYawDeg = -11.5;
  headPitchDeg = -4.0;
  yawSlider.value = -12;
  setUIState('normal');
}});

// --- MAIN 60FPS PHYSICS & N64 RENDER LOOP ---
function stepPhysicsAndRender(nowMs) {{
  const nowSec = nowMs * 0.001;
  const dt = Math.min(0.033, Math.max(0.001, nowSec - lastTimeSec));
  lastTimeSec = nowSec;
  if (soundCooldown > 0) soundCooldown -= dt;

  if (!isGrabbing && dizzyTimer > 0) {{
    dizzyTimer -= dt;
    if (dizzyTimer <= 0) {{
      dizzyTimer = 0;
      setUIState('normal');
    }}
  }}

  const targetShock = (state === 'shocked') ? 1.0 : 0.0;
  const targetDizzy = (state === 'dizzy')   ? 1.0 : 0.0;
  shockedWeight += (targetShock - shockedWeight) * Math.min(1.0, dt * 14.0);
  dizzyWeight   += (targetDizzy - dizzyWeight)   * Math.min(1.0, dt * 10.0);

  const kSpring = 210.0;
  const cDamp   = 6.8;
  for (let i = 0; i < numVerts * 3; i++) {{
    if (!isGrabbing) {{
      const acc = -kSpring * dispU[i] - cDamp * velV[i];
      velV[i]  += acc * dt;
      dispU[i] += velV[i] * dt;
    }}
    curPos[i] = restPos[i]
              + dispU[i]
              + morphShocked[i] * shockedWeight
              + morphDizzy[i]   * dizzyWeight;
  }}

  for (let t = 0; t < numTris; t++) {{
    const tri = MESH_DATA.tris[t];
    const i0 = tri.v[0], i1 = tri.v[1], i2 = tri.v[2];
    const x0 = curPos[i0*3], y0 = curPos[i0*3+1], z0 = curPos[i0*3+2];
    const x1 = curPos[i1*3], y1 = curPos[i1*3+1], z1 = curPos[i1*3+2];
    const x2 = curPos[i2*3], y2 = curPos[i2*3+1], z2 = curPos[i2*3+2];

    const ux = x1 - x0, uy = y1 - y0, uz = z1 - z0;
    const vx = x2 - x0, vy = y2 - y0, vz = z2 - z0;
    let nx = uy*vz - uz*vy;
    let ny = uz*vx - ux*vz;
    let nz = ux*vy - uy*vx;
    const nl = Math.hypot(nx, ny, nz) || 1.0;
    nx /= nl; ny /= nl; nz /= nl;

    const coords = [[x0,y0,z0], [x1,y1,z1], [x2,y2,z2]];
    for (let k = 0; k < 3; k++) {{
      const base = (t * 3 + k) * 8;
      headVertexData[base+0] = coords[k][0];
      headVertexData[base+1] = coords[k][1];
      headVertexData[base+2] = coords[k][2];
      headVertexData[base+3] = nx;
      headVertexData[base+4] = ny;
      headVertexData[base+5] = nz;
      headVertexData[base+6] = tri.uv[k][0];
      headVertexData[base+7] = tri.uv[k][1];
    }}
  }}

  // Crisp mobile devicePixelRatio scaling (capped at 2x for 60fps battery efficiency)
  const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
  const dispW = Math.round(window.innerWidth * dpr);
  const dispH = Math.round(window.innerHeight * dpr);
  if (canvas.width !== dispW || canvas.height !== dispH) {{
    canvas.width  = dispW;
    canvas.height = dispH;
  }}
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.58, 0.48, 0.39, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const {{ effDist, camZOffset, aspect }} = getEffectiveCamera(window.innerWidth, window.innerHeight);
  const projMat = mat4Perspective(36.0 * Math.PI / 180.0, aspect, 0.1, 25.0);
  const viewMat = mat4ViewFromBlenderCam(effDist, camZOffset);
  const modelMat = getCurrentModelMatrix(nowSec);

  gl.uniformMatrix4fv(uProjLoc, false, projMat);
  gl.uniformMatrix4fv(uViewLoc, false, viewMat);
  gl.uniformMatrix4fv(uModelLoc, false, modelMat);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[state] || textures.normal);
  gl.uniform1i(uTexLoc, 0);
  gl.uniform1i(uSolidFlag, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, headBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, headVertexData, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aPosLoc);
  gl.enableVertexAttribArray(aNormLoc);
  gl.enableVertexAttribArray(aUVLoc);
  gl.vertexAttribPointer(aPosLoc,  3, gl.FLOAT, false, 32, 0);
  gl.vertexAttribPointer(aNormLoc, 3, gl.FLOAT, false, 32, 12);
  gl.vertexAttribPointer(aUVLoc,   2, gl.FLOAT, false, 32, 24);
  gl.drawArrays(gl.TRIANGLES, 0, numTris * 3);

  if (dizzyWeight > 0.02) {{
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
    gl.vertexAttribPointer(aPosLoc,  3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(aNormLoc, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(aUVLoc,   2, gl.FLOAT, false, 32, 24);
    gl.uniform1i(uSolidFlag, 1);

    for (let s = 0; s < 5; s++) {{
      const orbitAng = nowSec * 4.5 + (s * Math.PI * 2.0) / 5.0;
      const sx = Math.cos(orbitAng) * 0.62;
      const sy = Math.sin(orbitAng) * 0.55 - 0.10;
      const sz = 1.28 + Math.sin(nowSec * 8.0 + s) * 0.06;
      const starScale = dizzyWeight * (0.85 + 0.15 * Math.sin(nowSec * 12.0 + s));
      const starMat = mat4EulerZYX(0.2, nowSec * 3.0 + s, orbitAng, sx, sy, sz, starScale);
      gl.uniformMatrix4fv(uModelLoc, false, starMat);
      gl.uniform3f(uSolidCol, 1.0, 0.86, 0.12);
      gl.drawArrays(gl.TRIANGLES, 0, STAR_TRIS.length * 3);
    }}
  }}

  requestAnimationFrame(stepPhysicsAndRender);
}}
requestAnimationFrame(stepPhysicsAndRender);
</script>
</body>
</html>
"""

with open("/home/chiubaca/Projects/n64-face-stretch/index.html", "w") as f:
    f.write(html)
with open("/tmp/opencode/n64_mario64_face.html", "w") as f:
    f.write(html)
print("Updated mobile-optimized /home/chiubaca/Projects/n64-face-stretch/index.html (bytes:", len(html), ")")
