import "./style.css";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { systems } from "./systems.js";

const poses = {
  hero: { view: [12, 3, -3] },
  rifle: { view: [-22, -8, 5] },
  flight: { view: [13, 13, -9] },
};
const deck = document.querySelector(".deck");
const stage = document.querySelector(".stage");
const status = document.querySelector(".status");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const lerp = T.MathUtils.lerp;
const rad = T.MathUtils.degToRad;
const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const vec = (...v) => new T.Vector3(...v);
const keys = Object.keys(poses);
let request = "hero";
let locked = null;
let hovered = null;
let exploded = false;
let changeShot = () => {};
const active = () => locked || hovered;
const renderedPose = () => (active() === "rifle" && request === "hero" ? "rifle" : request);
const entries = Object.entries(systems);
const map = document.querySelector(".system-list");
const explodeButton = document.querySelector("#explode");
const detailsToggle = document.querySelector("#details-toggle");
let detailsOpen = false;

function setDetails(open) {
  detailsOpen = open;
  deck.dataset.details = String(open);
  detailsToggle.setAttribute("aria-expanded", String(open));
  detailsToggle.textContent = open ? "[CLOSE]" : "[INFO]";
}

function display() {
  const id = active();
  const system = systems[id];
  const mode = exploded ? "exploded" : locked ? "locked" : hovered ? "scanning" : "idle";
  deck.dataset.mode = mode;
  deck.dataset.pose = renderedPose();
  document.querySelector("#command").textContent = system
    ? `>> SYSTEM.${locked ? "ANALYZE" : "SCAN"}(${system.designation} // ${system.part.toUpperCase()})`
    : ">> SYSTEM.INIT() // WAITING_FOR_INPUT";
  document.querySelector("#system-title").textContent =
    system?.name ?? "MOBILE SUIT // PARTS MANIFEST";
  document.querySelector("#system-detail").textContent = system
    ? `${system.category.toUpperCase()} // ${system.description}`
    : "Scan a system, then click or tap to lock on. Drag the model to orbit.";
  document.querySelector("#lock-state").textContent = `STATUS: ${mode.toUpperCase()}`;
  document.querySelector("#mobile-name").textContent = system?.name ?? "VK-07";
  document.querySelector("#mobile-code").textContent = system
    ? `${system.designation} // ${mode.toUpperCase()}`
    : "● STANDBY";
  detailsToggle.hidden = !locked;
  explodeButton.hidden = !(locked && system.split);
  explodeButton.textContent = exploded ? "[REASSEMBLE]" : "[EXPLODE]";
  explodeButton.setAttribute("aria-pressed", String(exploded));
  for (const button of map.children) {
    button.dataset.scan = String(button.dataset.system === hovered);
    button.setAttribute("aria-pressed", String(button.dataset.system === locked));
  }
  for (const button of document.querySelectorAll("[data-key]")) {
    button.setAttribute("aria-pressed", String(button.dataset.key === renderedPose()));
  }
}

function preview(id) {
  if (locked || hovered === id) return;
  hovered = id;
  display();
  changeShot();
}

function lock(id) {
  const before = active();
  locked = locked === id ? null : id;
  hovered = null;
  exploded = false;
  if (before !== locked || !locked) setDetails(false);
  display();
  if (before !== active()) changeShot();
}

function reset() {
  hovered = locked = null;
  exploded = false;
  setDetails(false);
  display();
  changeShot();
}

function choose(key) {
  request = key;
  reset();
}
for (const [id, system] of entries) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.system = id;
  button.setAttribute("aria-label", `${system.part}: ${system.name}`);
  for (const label of [system.part.toUpperCase(), "→", system.name, system.designation]) {
    const span = document.createElement("span");
    span.textContent = label;
    button.append(span);
  }
  button.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") preview(id);
  });
  button.addEventListener("click", () => lock(id));
  map.append(button);
}
map.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") preview(null);
});
document.querySelector("#reset").addEventListener("click", reset);
detailsToggle.addEventListener("click", () => setDetails(!detailsOpen));
explodeButton.addEventListener("click", () => {
  if (!locked || !systems[locked].split) return;
  exploded = !exploded;
  display();
  changeShot({ detail: true });
});
for (const button of document.querySelectorAll("[data-key]")) {
  button.addEventListener("click", () => choose(button.dataset.key));
}
addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (event.key === "Escape") reset();
  const key = { 1: "hero", 2: "rifle", 3: "flight" }[event.key];
  if (key) choose(key);
});
display();

async function boot() {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  stage.append(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(36, 1, 0.035, 40);
  camera.up.set(0, 0, 1);
  const hemi = new T.HemisphereLight(0xdbe8ff, 0x51413a, 2);
  hemi.position.set(0, 0, 1);
  scene.add(hemi);
  function light(color, intensity, at) {
    const l = new T.DirectionalLight(color, intensity);
    l.position.set(...at);
    scene.add(l);
  }
  light(0xffe0b8, 3.15, [-3, -4, 5]);
  light(0x84baff, 1.4, [4, -1, 1.5]);
  light(0x9effa9, 3.4, [2, 3, 4]);

  const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
  const [{ scene: model }, data] = await Promise.all([
    new GLTFLoader().loadAsync(asset("vk07-systems.glb")),
    fetch(asset("parts-rig.json")).then((r) => {
      if (!r.ok) throw new Error("Could not fetch pose data");
      return r.json();
    }),
  ]);
  const bones = Object.fromEntries(Object.keys(data.parents).map((name) => [name, new T.Group()]));
  const pieces = [];
  for (const [name, parent] of Object.entries(data.parents)) {
    (bones[parent] || scene).add(bones[name]);
  }
  const pickTargets = [];
  for (const [name, bone] of Object.entries(data.parts)) {
    const node = bones[bone];
    // glTF sanitizes characters such as periods in node names.
    const mesh =
      model.getObjectByName(`Part_${name}`) ??
      model.getObjectByName(`Part_${name.replaceAll(".", "")}`);
    if (!mesh) continue;
    node.add(mesh);
    node.updateWorldMatrix(true, true);
    const box = new T.Box3().setFromObject(mesh);
    const corners = [];
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) corners.push(vec(x, y, z));
      }
    const system = entries.find(([, spec]) => spec.mesh.test(name))?.[0];
    const offset = data.separation[name];
    const base = mesh.position.clone();
    const materials = new Set();
    mesh.traverse((child) => {
      if (!child.isMesh) return;
      if (system) {
        child.userData.scanSystem = system;
        child.userData.partRoot = mesh;
        pickTargets.push(child);
        // Clone to keep highlighting local to this part rather than the entire shared palette.
        child.material = child.material.clone();
        if (child.material.emissive) {
          child.material.userData.emissive = child.material.emissive.clone();
          materials.add(child.material);
        }
      }
    });
    pieces.push({
      name,
      mesh,
      corners,
      system,
      offset: offset && vec(...offset),
      base,
      materials,
    });
  }
  if (!pieces.some((p) => p.name === "Rifle.R") || pieces.length < 30) {
    throw new Error("Mech geometry does not match the rig");
  }
  const grid = new T.GridHelper(14, 42, 0x28b049, 0x126632);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.015;
  grid.material.transparent = true;
  grid.material.depthWrite = false;
  scene.add(grid);
  const starsGeometry = new T.BufferGeometry();
  const stars = [];
  const random = T.MathUtils.seededRandom;
  random(407);
  for (let i = 0; i < 340; i++) {
    const y = 2 * random() - 1;
    const a = 2 * Math.PI * random();
    const r = 16 * Math.sqrt(1 - y * y);
    stars.push(r * Math.cos(a), r * Math.sin(a), 16 * y + 1);
  }
  starsGeometry.setAttribute("position", new T.Float32BufferAttribute(stars, 3));
  scene.add(
    new T.Points(
      starsGeometry,
      new T.PointsMaterial({ color: 0xa6c6aa, opacity: 0.45, transparent: true, size: 0.021 }),
    ),
  );
  const plumeColor = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    side: T.DoubleSide,
    uniforms: { amount: { value: 0 } },
    vertexShader: `varying float along;
      void main(){ along=clamp(position.z+.5,0.,1.); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying float along; uniform float amount;
      void main(){gl_FragColor=vec4(.27,.67,1.,pow(along,1.8)*amount*.7);}`,
  });
  const plumeGeo = new T.ConeGeometry(1, 1, 20, 1, true);
  plumeGeo.rotateX(-Math.PI / 2);
  const plumes = data.plumes.map(([p, q]) => {
    const o = new T.Mesh(plumeGeo, plumeColor);
    o.position.fromArray(p);
    o.quaternion.fromArray(q);
    scene.add(o);
    return o;
  });
  const transforms = Object.fromEntries(
    keys.map((key) => [
      key,
      Object.fromEntries(
        Object.entries(data.poses[key]).map(([name, [p, q, s]]) => [
          name,
          [vec(...p), new T.Quaternion(...q), vec(...s)],
        ]),
      ),
    ]),
  );

  let view = [...(systems[active()] ?? poses[renderedPose()]).view];
  let armed = Number(renderedPose() !== "hero"),
    air = Number(renderedPose() === "flight");
  let transition;
  let dirty = true;
  let focus = new Map([[active(), 1]]);
  const split = new Map();
  const orbit = [0, 0];
  const scratch = vec(),
    bounds = new T.Box3();
  const viewCoords = [];
  const right = vec(),
    up = vec(),
    eye = vec(),
    center = vec();
  function poseAt(key, start, t) {
    for (const [name, node] of Object.entries(bones)) {
      const [p, q, s] = transforms[key][name];
      if (!start) {
        node.position.copy(p);
        node.quaternion.copy(q);
        node.scale.copy(s);
      } else {
        const [p0, q0, s0] = start[name];
        node.position.lerpVectors(p0, p, t);
        node.quaternion.slerpQuaternions(q0, q, t);
        node.scale.lerpVectors(s0, s, t);
      }
    }
  }
  const rifle = pieces.find((p) => p.name === "Rifle.R").mesh;
  poseAt(renderedPose());
  if (exploded) split.set(locked, 1);
  changeShot = ({ detail = false } = {}) => {
    const key = renderedPose();
    const id = active();
    const to = (systems[id] ?? poses[key]).view;
    const from = [view[0] + orbit[0], Math.max(-65, Math.min(68, view[1] + orbit[1])), view[2]];
    orbit[0] = orbit[1] = 0;
    dirty = true;
    if (reduced.matches) {
      transition = null;
      view = [...to];
      focus = new Map([[id, 1]]);
      split.clear();
      if (exploded) split.set(locked, 1);
      armed = Number(key !== "hero");
      air = Number(key === "flight");
      poseAt(key);
      return;
    }
    transition = {
      key,
      id,
      splitId: exploded ? locked : null,
      baseFocus: new Map(focus),
      baseSplit: new Map(split),
      start: performance.now(),
      view: from,
      to,
      detail,
      armed,
      air,
      rig: Object.fromEntries(
        Object.entries(bones).map(([name, b]) => [
          name,
          [b.position.clone(), b.quaternion.clone(), b.scale.clone()],
        ]),
      ),
    };
  };
  function measure(id, tanX, tanY, includeWingBinders = true) {
    bounds.makeEmpty();
    let i = 0;
    for (const { name, corners, mesh, system } of pieces) {
      if (!mesh.visible || (id && system !== id)) continue;
      if (!includeWingBinders && name.startsWith("WingBinder")) continue;
      for (const point of corners) {
        scratch.copy(point).applyMatrix4(mesh.matrixWorld);
        const p = viewCoords[i] ?? (viewCoords[i] = vec());
        p.set(scratch.dot(right), scratch.dot(up), scratch.dot(eye));
        bounds.expandByPoint(p);
        i++;
      }
    }
    if (!i && id) return measure(null, tanX, tanY);
    bounds.getCenter(center);
    let fit = 0;
    for (let j = 0; j < i; j++) {
      const p = viewCoords[j];
      fit = Math.max(
        fit,
        p.z - center.z + Math.max(Math.abs(p.x - center.x) / tanX, Math.abs(p.y - center.y) / tanY),
      );
    }
    return fit * 1.13 + (systems[id]?.padding ?? 0.03);
  }
  const target = vec();
  function frameCamera(moving) {
    const yaw = rad(view[0] + orbit[0]);
    const pitch = rad(Math.max(-65, Math.min(68, view[1] + orbit[1])));
    eye.set(Math.sin(yaw) * Math.cos(pitch), -Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch));
    right.set(-eye.y, eye.x, 0).normalize().applyAxisAngle(eye, rad(view[2]));
    up.crossVectors(eye, right);
    const tanY = Math.tan(rad(camera.fov) * 0.5);
    const tanX = tanY * camera.aspect;
    let distance = 0;
    target.set(0, 0, 0);
    for (const [id, weight] of focus) {
      if (weight < 0.00001) continue;
      const extension = split.get("backpack") ?? 0;
      let fit = measure(id, tanX, tanY, id !== "backpack" || extension === 1);
      if (id === "backpack" && extension > 0 && extension < 1) {
        const coreCenter = center.clone();
        fit = lerp(fit, measure(id, tanX, tanY), extension);
        center.lerpVectors(coreCenter, center, extension);
      }
      target
        .addScaledVector(right, center.x * weight)
        .addScaledVector(up, (center.y + (id ? 0 : 0.025)) * weight)
        .addScaledVector(eye, center.z * weight);
      distance += fit * weight;
    }
    // Pull back during the swing so a front-to-rear shot clears the full silhouette.
    distance += moving * 0.8;
    camera.position.copy(target).addScaledVector(eye, distance);
    camera.up.copy(up);
    camera.lookAt(target);
  }
  function resize() {
    const pixelRatio = Math.min(devicePixelRatio, stage.clientWidth < 740 ? 1.5 : 1.75);
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    camera.updateProjectionMatrix();
    dirty = true;
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  function pick(event) {
    const rect = stage.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return (
      ray.intersectObjects(pickTargets, false).find((hit) => hit.object.userData.partRoot.visible)
        ?.object.userData.scanSystem ?? null
    );
  }
  let drag;
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      target: pick(event),
    };
  });
  stage.addEventListener("pointermove", (event) => {
    if (drag?.id === event.pointerId) {
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) {
        preview(null);
        stage.setPointerCapture(event.pointerId);
      }
      drag.moved = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      orbit[0] = (orbit[0] - dx * 0.35) % 360;
      orbit[1] = Math.max(-65 - view[1], Math.min(68 - view[1], orbit[1] + dy * 0.31));
      stage.dataset.drag = "true";
      dirty = true;
    } else if (event.pointerType === "mouse") {
      const id = pick(event);
      stage.dataset.hit = String(Boolean(id));
      preview(id);
    }
  });
  function finishPointer(event) {
    if (drag?.id !== event.pointerId) return;
    const { moved, target: id } = drag;
    drag = undefined;
    stage.dataset.drag = "false";
    if (event.type !== "pointerup" || moved) return;
    if (id) lock(id);
    else reset();
  }
  addEventListener("pointerup", finishPointer);
  addEventListener("pointercancel", finishPointer);
  stage.addEventListener("lostpointercapture", finishPointer);
  stage.addEventListener("pointerleave", () => {
    if (!drag) preview(null);
  });
  status.hidden = true;
  renderer.setAnimationLoop((now) => {
    if (!dirty && !transition) return;
    dirty = false;
    let arc = 0;
    if (transition) {
      const {
        key,
        id,
        start,
        rig,
        view: from,
        to,
        detail,
        baseFocus,
        baseSplit,
        splitId,
      } = transition;
      const yawDelta = T.MathUtils.euclideanModulo(to[0] - from[0] + 180, 360) - 180;
      const duration = detail ? 650 : 840 + 4.5 * Math.abs(yawDelta);
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      const t = smooth(progress);
      arc = Math.sin(Math.PI * t) * (detail ? 0 : Math.min(1, 0.24 + Math.abs(yawDelta) / 80));
      const direction = Math.sign(yawDelta) || 1;
      view = [
        from[0] + yawDelta * t,
        lerp(from[1], to[1], t) + 16 * arc,
        lerp(from[2], to[2], t) + direction * 11 * arc,
      ];
      focus = new Map(
        [...baseFocus].map(([k, v]) => [k, v * (1 - t)]).filter(([, v]) => v > 0.00001),
      );
      focus.set(id, (focus.get(id) ?? 0) + t);
      split.clear();
      for (const [k, v] of baseSplit) if (v * (1 - t) > 0.00001) split.set(k, v * (1 - t));
      if (splitId) split.set(splitId, (split.get(splitId) ?? 0) + t);
      poseAt(key, rig, t);
      armed = lerp(transition.armed, Number(key !== "hero"), t);
      air = lerp(transition.air, Number(key === "flight"), t);
      if (progress === 1) transition = null;
    }
    rifle.visible = armed > 0.02;
    rifle.scale.setScalar(Math.max(0.025, armed));
    for (const piece of pieces) {
      if (piece.offset)
        piece.mesh.position
          .copy(piece.base)
          .addScaledVector(piece.offset, split.get(piece.system) ?? 0);
      const weight = focus.get(piece.system) ?? 0;
      for (const mat of piece.materials) {
        mat.emissive.copy(mat.userData.emissive);
        mat.emissive.g += weight * 0.07;
      }
    }
    grid.material.opacity = 0.3 * (1 - air);
    plumeColor.uniforms.amount.value = air * air;
    for (let i = 0; i < plumes.length; i++) {
      plumes[i].visible = air > 0.15;
      plumes[i].scale.set(0.029, 0.029, i === 0 ? 0.55 : 0.62);
    }
    scene.updateMatrixWorld(true);
    frameCamera(arc);
    renderer.render(scene, camera);
  });
}

boot().catch((error) => {
  status.textContent = "Could not load the 3D viewer. Check that WebGL is available and reload.";
  console.error(error);
});
