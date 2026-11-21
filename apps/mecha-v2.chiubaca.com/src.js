import "./style.css";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const poses = {
  hero: { index: "01 / 03 — GROUND", title: "Open-hand", view: [18, 1, -4] },
  rifle: { index: "02 / 03 — GROUND", title: "Rifle stance", view: [-26, -11, 6] },
  flight: { index: "03 / 03 — AIRBORNE", title: "Banked flight", view: [13, 13, -9] },
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
let changePose = () => {};

function choose(key) {
  if (key === request) return;
  request = key;
  deck.dataset.pose = key;
  document.querySelector("#index").textContent = poses[key].index;
  document.querySelector("#pose-title").textContent = poses[key].title;
  for (const button of document.querySelectorAll("[data-key]")) {
    button.setAttribute("aria-pressed", String(button.dataset.key === key));
  }
  changePose(key);
}
for (const button of document.querySelectorAll("[data-key]")) {
  button.addEventListener("click", () => choose(button.dataset.key));
}
addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  const key = { 1: "hero", 2: "rifle", 3: "flight" }[event.key];
  if (key) choose(key);
});

async function boot() {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
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
  light(0x84baff, 1.5, [4, -1, 1.5]);
  light(0xffcd93, 4.0, [2, 3, 4]);

  const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
  const [{ scene: model }, data] = await Promise.all([
    new GLTFLoader().loadAsync(asset("vk07.glb")),
    fetch(asset("poses.json")).then((r) => {
      if (!r.ok) throw new Error("Could not fetch pose data");
      return r.json();
    }),
  ]);
  const bones = Object.fromEntries(Object.keys(data.parents).map((name) => [name, new T.Group()]));
  const pieces = [];
  for (const [name, parent] of Object.entries(data.parents)) {
    const node = bones[name];
    (bones[parent] || scene).add(node);
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
    pieces.push({ name, mesh, corners });
  }
  if (!pieces.some((p) => p.name === "Rifle.R") || pieces.length < 30) {
    throw new Error("Mech geometry does not match the rig");
  }
  const grid = new T.GridHelper(12, 48, 0x465362, 0x465362);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.015;
  grid.material.transparent = true;
  grid.material.depthWrite = false;
  scene.add(grid);
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

  let view = [...poses[request].view],
    armed = Number(request !== "hero"),
    air = Number(request === "flight");
  let transition;
  let dirty = true;
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
  poseAt(request);
  changePose = (key) => {
    dirty = true;
    if (reduced.matches) {
      transition = null;
      view = [...poses[key].view];
      armed = Number(key !== "hero");
      air = Number(key === "flight");
      poseAt(key);
      return;
    }
    transition = {
      key,
      start: performance.now(),
      view: [...view],
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

  function frameCamera(moving) {
    const phone = camera.aspect < 1;
    const yaw = rad(view[0]),
      pitch = rad(view[1]);
    eye.set(Math.sin(yaw) * Math.cos(pitch), -Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch));
    right.set(-eye.y, eye.x, 0).normalize().applyAxisAngle(eye, rad(view[2]));
    up.crossVectors(eye, right);
    bounds.makeEmpty();
    let i = 0;
    for (const { corners, mesh } of pieces) {
      if (!mesh.visible) continue;
      for (const point of corners) {
        scratch.copy(point).applyMatrix4(mesh.matrixWorld);
        const p = viewCoords[i] ?? (viewCoords[i] = vec());
        p.set(scratch.dot(right), scratch.dot(up), scratch.dot(eye));
        bounds.expandByPoint(p);
        i++;
      }
    }
    bounds.getCenter(center);
    const tanY = Math.tan(rad(camera.fov) * 0.5);
    const tanX = tanY * camera.aspect;
    let fit = 0;
    for (let j = 0; j < i; j++) {
      const p = viewCoords[j];
      fit = Math.max(
        fit,
        p.z - center.z + Math.max(Math.abs(p.x - center.x) / tanX, Math.abs(p.y - center.y) / tanY),
      );
    }
    const distance = fit * (phone ? 1.1 : 1.16) * (1 + 0.12 * moving);
    const offsetX = phone ? 0 : distance * tanX * 0.19 * (1 - air * 0.52);
    const offsetY = distance * tanY * (phone ? -0.09 : -0.05);
    const target = scratch
      .copy(right)
      .multiplyScalar(center.x - offsetX)
      .addScaledVector(up, center.y - offsetY)
      .addScaledVector(eye, center.z);
    camera.position.copy(target).addScaledVector(eye, distance);
    camera.up.copy(up);
    camera.lookAt(target);
  }
  function resize() {
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    camera.updateProjectionMatrix();
    dirty = true;
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  const rifle = pieces.find((p) => p.name === "Rifle.R").mesh;
  status.hidden = true;
  renderer.setAnimationLoop((now) => {
    if (!dirty && !transition) return;
    dirty = false;
    let arc = 0;
    if (transition) {
      const { key, start, rig, view: from } = transition;
      const progress = Math.min(1, Math.max(0, (now - start) / 1250));
      const t = smooth(progress);
      arc = Math.sin(Math.PI * t);
      const to = poses[key].view;
      const direction = Math.sign(to[0] - from[0]) || 1;
      view = [
        lerp(from[0], to[0], t) + direction * 17 * arc,
        lerp(from[1], to[1], t) + 17 * arc,
        lerp(from[2], to[2], t) + direction * 13 * arc,
      ];
      poseAt(key, rig, t);
      armed = lerp(transition.armed, Number(key !== "hero"), t);
      air = lerp(transition.air, Number(key === "flight"), t);
      if (progress === 1) transition = null;
    }
    rifle.visible = armed > 0.02;
    rifle.scale.setScalar(Math.max(0.025, armed));
    grid.material.opacity = 0.19 * (1 - air);
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
