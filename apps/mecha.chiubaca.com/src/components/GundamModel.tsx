import { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Mesh,
  MeshBasicMaterial,
  Group,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  ConeGeometry,
  TorusGeometry,
  OctahedronGeometry,
} from "three";

interface GundamModelProps {
  hoveredSkill: string | null;
  selectedSkill: string | null;
  onPartHover: (skillId: string | null) => void;
  onPartClick: (skillId: string) => void;
}

const GLOW_COLOR = 0x00ff41;
const DIM_COLOR = 0x004411;
const HOVER_COLOR = 0xaaffaa;
const SELECTED_COLOR = 0xffffff;

// ── Geometry helpers ──────────────────────────────────────────────
function mat(color = GLOW_COLOR) {
  return new MeshBasicMaterial({ color, wireframe: true });
}

function box(
  name: string,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  skillId: string,
  rx = 0,
  ry = 0,
  rz = 0,
): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat());
  m.name = name;
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.userData = { skillId };
  return m;
}

function cyl(
  name: string,
  rt: number,
  rb: number,
  h: number,
  x: number,
  y: number,
  z: number,
  skillId: string,
  segs = 8,
  rx = 0,
  ry = 0,
  rz = 0,
): Mesh {
  const m = new Mesh(new CylinderGeometry(rt, rb, h, segs), mat());
  m.name = name;
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.userData = { skillId };
  return m;
}

function sphere(
  name: string,
  r: number,
  x: number,
  y: number,
  z: number,
  skillId: string,
  ws = 8,
  hs = 6,
): Mesh {
  const m = new Mesh(new SphereGeometry(r, ws, hs), mat());
  m.name = name;
  m.position.set(x, y, z);
  m.userData = { skillId };
  return m;
}

function cone(
  name: string,
  r: number,
  h: number,
  x: number,
  y: number,
  z: number,
  skillId: string,
  segs = 6,
  rx = 0,
  ry = 0,
  rz = 0,
): Mesh {
  const m = new Mesh(new ConeGeometry(r, h, segs), mat());
  m.name = name;
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.userData = { skillId };
  return m;
}

function oct(
  name: string,
  r: number,
  x: number,
  y: number,
  z: number,
  skillId: string,
  detail = 0,
): Mesh {
  const m = new Mesh(new OctahedronGeometry(r, detail), mat());
  m.name = name;
  m.position.set(x, y, z);
  m.userData = { skillId };
  return m;
}

function torus(
  name: string,
  r: number,
  tube: number,
  x: number,
  y: number,
  z: number,
  skillId: string,
  rx = 0,
  ry = 0,
  rz = 0,
): Mesh {
  const m = new Mesh(new TorusGeometry(r, tube, 6, 8), mat());
  m.name = name;
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.userData = { skillId };
  return m;
}

// ── Main Component ────────────────────────────────────────────────
export const GundamModel: React.FC<GundamModelProps> = ({
  hoveredSkill,
  selectedSkill,
  onPartHover,
  onPartClick,
}) => {
  const groupRef = useRef<Group>(null);
  const isInit = useRef(false);

  const mechaData = useMemo(() => {
    const m: Mesh[] = [];

    // ═══════════════════════════════════════════════════════════════
    // HEAD / TypeScript  (y ≈ 4.2 - 5.2)
    // ═══════════════════════════════════════════════════════════════
    // Main head – angular box
    m.push(box("head_main", 0.7, 0.65, 0.7, 0, 4.5, 0, "typescript"));
    // Chin / jaw plate
    m.push(box("head_chin", 0.55, 0.15, 0.35, 0, 4.12, 0.15, "typescript"));
    // Visor / eye slit
    m.push(box("head_visor", 0.72, 0.08, 0.12, 0, 4.52, 0.38, "typescript"));
    // Forehead crest
    m.push(box("head_crest", 0.15, 0.35, 0.55, 0, 4.85, -0.05, "typescript"));
    // V-Fin left
    m.push(box("vfin_l", 0.04, 0.5, 0.15, -0.35, 5.0, 0.2, "typescript", 0, 0, 0.4));
    // V-Fin right
    m.push(box("vfin_r", 0.04, 0.5, 0.15, 0.35, 5.0, 0.2, "typescript", 0, 0, -0.4));
    // Cheek vents (left/right)
    m.push(box("cheek_l", 0.12, 0.2, 0.25, -0.38, 4.42, 0.15, "typescript"));
    m.push(box("cheek_r", 0.12, 0.2, 0.25, 0.38, 4.42, 0.15, "typescript"));
    // Top sensor dome
    m.push(sphere("head_sensor", 0.12, 0, 4.88, 0, "typescript"));
    // Neck joint
    m.push(cyl("neck_joint", 0.2, 0.25, 0.25, 0, 4.1, 0, "typescript", 8));

    // Communication antenna arrays / Hono.js
    m.push(cyl("antenna_l_base", 0.04, 0.04, 0.3, -0.5, 4.9, -0.1, "hono", 4));
    m.push(cyl("antenna_l_tip", 0.02, 0.04, 0.5, -0.55, 5.25, -0.15, "hono", 4, 0, 0, 0.15));
    m.push(cyl("antenna_r_base", 0.04, 0.04, 0.3, 0.5, 4.9, -0.1, "hono", 4));
    m.push(cyl("antenna_r_tip", 0.02, 0.04, 0.5, 0.55, 5.25, -0.15, "hono", 4, 0, 0, -0.15));
    m.push(sphere("antenna_l_orb", 0.05, -0.58, 5.5, -0.18, "hono"));
    m.push(sphere("antenna_r_orb", 0.05, 0.58, 5.5, -0.18, "hono"));

    // ═══════════════════════════════════════════════════════════════
    // TORSO / React.js  (y ≈ 2.2 - 4.0)
    // ═══════════════════════════════════════════════════════════════
    // Upper chest – broad trapezoid shape
    m.push(box("torso_upper", 1.8, 0.9, 1.1, 0, 3.5, 0, "react"));
    // Lower chest tapering down
    m.push(box("torso_lower", 1.5, 0.7, 0.9, 0, 2.8, 0, "react"));
    // Waist / hip connector
    m.push(box("torso_waist", 1.1, 0.4, 0.7, 0, 2.3, 0, "react"));
    // Chest plate – front armor
    m.push(box("chest_plate_l", 0.55, 0.65, 0.15, -0.4, 3.5, 0.55, "react", 0, 0, 0.08));
    m.push(box("chest_plate_r", 0.55, 0.65, 0.15, 0.4, 3.5, 0.55, "react", 0, 0, -0.08));
    // Core reactor / cockpit hatch
    m.push(oct("core_reactor", 0.18, 0, 3.2, 0.6, "react"));
    m.push(torus("core_ring", 0.22, 0.04, 0, 3.2, 0.65, "react", Math.PI / 2));
    // Collar bone ridges
    m.push(box("collar_l", 0.45, 0.15, 0.3, -0.65, 3.9, 0.2, "react", 0, 0, -0.2));
    m.push(box("collar_r", 0.45, 0.15, 0.3, 0.65, 3.9, 0.2, "react", 0, 0, 0.2));
    // Abdominal vents
    m.push(box("ab_vent_1", 0.5, 0.08, 0.15, 0, 2.9, 0.45, "react"));
    m.push(box("ab_vent_2", 0.45, 0.08, 0.15, 0, 2.75, 0.43, "react"));
    m.push(box("ab_vent_3", 0.4, 0.08, 0.15, 0, 2.6, 0.41, "react"));
    // Hip armor skirts
    m.push(box("skirt_front", 1.0, 0.45, 0.15, 0, 2.05, 0.4, "react", 0.15));
    m.push(box("skirt_back", 1.0, 0.5, 0.15, 0, 2.1, -0.45, "react", -0.1));
    m.push(box("skirt_l", 0.15, 0.6, 0.6, -0.65, 2.0, 0, "react", 0, 0, 0.1));
    m.push(box("skirt_r", 0.15, 0.6, 0.6, 0.65, 2.0, 0, "react", 0, 0, -0.1));

    // ═══════════════════════════════════════════════════════════════
    // BACKPACK / ENGINES / Opus 4.6  (behind torso)
    // ═══════════════════════════════════════════════════════════════
    // Main pack body
    m.push(box("bp_main", 1.1, 1.5, 0.6, 0, 3.2, -0.8, "opus46"));
    // Thruster housings (large)
    m.push(cyl("bp_thruster_l", 0.3, 0.25, 0.9, -0.5, 3.4, -1.15, "opus46", 6));
    m.push(cyl("bp_thruster_r", 0.3, 0.25, 0.9, 0.5, 3.4, -1.15, "opus46", 6));
    // Thruster nozzles
    m.push(cyl("bp_nozzle_l", 0.2, 0.28, 0.3, -0.5, 2.85, -1.15, "opus46", 6));
    m.push(cyl("bp_nozzle_r", 0.2, 0.28, 0.3, 0.5, 2.85, -1.15, "opus46", 6));
    // Top stabilizer fins
    m.push(box("bp_fin_l", 0.04, 0.8, 0.5, -0.5, 3.9, -1.0, "opus46", 0, 0, -0.1));
    m.push(box("bp_fin_r", 0.04, 0.8, 0.5, 0.5, 3.9, -1.0, "opus46", 0, 0, 0.1));
    // Center booster
    m.push(cyl("bp_center_boost", 0.15, 0.18, 0.6, 0, 2.7, -1.0, "opus46", 6));
    // Fuel lines
    m.push(cyl("bp_fuel_l", 0.04, 0.04, 0.6, -0.3, 2.8, -0.55, "opus46", 4, 0.3));
    m.push(cyl("bp_fuel_r", 0.04, 0.04, 0.6, 0.3, 2.8, -0.55, "opus46", 4, 0.3));
    // Heat exhaust vents
    m.push(box("bp_vent_1", 0.8, 0.06, 0.3, 0, 3.6, -0.75, "opus46"));
    m.push(box("bp_vent_2", 0.7, 0.06, 0.3, 0, 3.45, -0.75, "opus46"));

    // ═══════════════════════════════════════════════════════════════
    // SHOULDERS / AI Gateway (left) & Tanstack Start (right)
    // ═══════════════════════════════════════════════════════════════
    // Left shoulder – layered armor plates / AI Gateway
    m.push(box("shldr_l_main", 0.9, 0.6, 0.75, -1.3, 3.7, 0, "aigateway"));
    m.push(box("shldr_l_top", 0.95, 0.12, 0.8, -1.3, 4.0, 0, "aigateway"));
    m.push(box("shldr_l_cap", 0.75, 0.08, 0.65, -1.3, 4.08, 0, "aigateway"));
    m.push(box("shldr_l_vent", 0.1, 0.35, 0.5, -1.78, 3.7, 0, "aigateway"));
    m.push(oct("shldr_l_gem", 0.1, -1.3, 3.7, 0.4, "aigateway"));
    // Right shoulder / Tanstack Start
    m.push(box("shldr_r_main", 0.9, 0.6, 0.75, 1.3, 3.7, 0, "tanstackstart"));
    m.push(box("shldr_r_top", 0.95, 0.12, 0.8, 1.3, 4.0, 0, "tanstackstart"));
    m.push(box("shldr_r_cap", 0.75, 0.08, 0.65, 1.3, 4.08, 0, "tanstackstart"));
    m.push(box("shldr_r_vent", 0.1, 0.35, 0.5, 1.78, 3.7, 0, "tanstackstart"));
    m.push(oct("shldr_r_gem", 0.1, 1.3, 3.7, 0.4, "tanstackstart"));

    // ═══════════════════════════════════════════════════════════════
    // LEFT ARM + HAND (holds LASER CANNON) / Zod
    // ═══════════════════════════════════════════════════════════════
    // Upper arm
    m.push(cyl("arm_l_upper", 0.22, 0.2, 1.1, -1.5, 3.0, 0, "zod", 6));
    m.push(sphere("arm_l_joint_top", 0.22, -1.5, 3.55, 0, "zod"));
    // Elbow joint
    m.push(sphere("arm_l_elbow", 0.2, -1.5, 2.4, 0, "zod"));
    // Forearm
    m.push(cyl("arm_l_fore", 0.2, 0.18, 1.0, -1.55, 1.8, 0.15, "zod", 6, 0.2));
    m.push(box("arm_l_fore_armor", 0.35, 0.6, 0.3, -1.55, 1.6, 0.2, "zod"));
    // Wrist
    m.push(cyl("arm_l_wrist", 0.12, 0.15, 0.15, -1.55, 1.2, 0.25, "zod", 6));
    // Hand (gripping cannon)
    m.push(box("hand_l", 0.25, 0.25, 0.35, -1.55, 1.0, 0.3, "zod"));
    m.push(box("hand_l_fingers", 0.2, 0.15, 0.25, -1.55, 0.85, 0.4, "zod"));

    // ═══════════════════════════════════════════════════════════════
    // RIGHT ARM + HAND (holds SHIELD) / Zod
    // ═══════════════════════════════════════════════════════════════
    // Upper arm
    m.push(cyl("arm_r_upper", 0.22, 0.2, 1.1, 1.5, 3.0, 0, "zod", 6));
    m.push(sphere("arm_r_joint_top", 0.22, 1.5, 3.55, 0, "zod"));
    // Elbow
    m.push(sphere("arm_r_elbow", 0.2, 1.5, 2.4, 0, "zod"));
    // Forearm
    m.push(cyl("arm_r_fore", 0.2, 0.18, 1.0, 1.55, 1.8, 0.15, "zod", 6, 0.2));
    m.push(box("arm_r_fore_armor", 0.35, 0.6, 0.3, 1.55, 1.6, 0.2, "zod"));
    // Wrist
    m.push(cyl("arm_r_wrist", 0.12, 0.15, 0.15, 1.55, 1.2, 0.25, "zod", 6));
    // Hand (holding shield handle)
    m.push(box("hand_r", 0.25, 0.25, 0.35, 1.55, 1.0, 0.3, "zod"));
    m.push(box("hand_r_fingers", 0.2, 0.15, 0.25, 1.55, 0.85, 0.4, "zod"));

    // ═══════════════════════════════════════════════════════════════
    // LEGS / Cloudflare Workers  (y ≈ -2.5 to 2.0)
    // ═══════════════════════════════════════════════════════════════
    // === LEFT LEG ===
    // Hip joint
    m.push(sphere("hip_l", 0.22, -0.45, 1.9, 0, "cloudflare"));
    // Thigh
    m.push(cyl("thigh_l", 0.28, 0.22, 1.2, -0.55, 1.3, 0, "cloudflare", 6));
    m.push(box("thigh_l_armor", 0.45, 0.8, 0.4, -0.55, 1.4, 0.2, "cloudflare"));
    // Knee joint
    m.push(sphere("knee_l", 0.2, -0.55, 0.65, 0, "cloudflare"));
    m.push(box("knee_l_cap", 0.25, 0.25, 0.2, -0.55, 0.65, 0.2, "cloudflare"));
    // Shin
    m.push(cyl("shin_l", 0.22, 0.18, 1.3, -0.55, -0.1, 0.05, "cloudflare", 6));
    m.push(box("shin_l_armor", 0.35, 0.9, 0.3, -0.55, -0.05, 0.25, "cloudflare"));
    // Calf thruster
    m.push(cyl("calf_l_thruster", 0.12, 0.15, 0.35, -0.55, -0.3, -0.25, "cloudflare", 6));
    // Ankle
    m.push(sphere("ankle_l", 0.12, -0.55, -0.8, 0.05, "cloudflare"));
    // Foot
    m.push(box("foot_l_main", 0.4, 0.2, 0.75, -0.55, -1.0, 0.15, "cloudflare"));
    m.push(box("foot_l_toe", 0.35, 0.12, 0.3, -0.55, -1.0, 0.55, "cloudflare", 0.1));
    m.push(box("foot_l_heel", 0.3, 0.15, 0.25, -0.55, -1.0, -0.2, "cloudflare", -0.1));
    // Sole thruster
    m.push(cyl("foot_l_thruster", 0.1, 0.12, 0.1, -0.55, -1.12, 0.1, "cloudflare", 4));

    // === RIGHT LEG ===
    m.push(sphere("hip_r", 0.22, 0.45, 1.9, 0, "cloudflare"));
    m.push(cyl("thigh_r", 0.28, 0.22, 1.2, 0.55, 1.3, 0, "cloudflare", 6));
    m.push(box("thigh_r_armor", 0.45, 0.8, 0.4, 0.55, 1.4, 0.2, "cloudflare"));
    m.push(sphere("knee_r", 0.2, 0.55, 0.65, 0, "cloudflare"));
    m.push(box("knee_r_cap", 0.25, 0.25, 0.2, 0.55, 0.65, 0.2, "cloudflare"));
    m.push(cyl("shin_r", 0.22, 0.18, 1.3, 0.55, -0.1, 0.05, "cloudflare", 6));
    m.push(box("shin_r_armor", 0.35, 0.9, 0.3, 0.55, -0.05, 0.25, "cloudflare"));
    m.push(cyl("calf_r_thruster", 0.12, 0.15, 0.35, 0.55, -0.3, -0.25, "cloudflare", 6));
    m.push(sphere("ankle_r", 0.12, 0.55, -0.8, 0.05, "cloudflare"));
    m.push(box("foot_r_main", 0.4, 0.2, 0.75, 0.55, -1.0, 0.15, "cloudflare"));
    m.push(box("foot_r_toe", 0.35, 0.12, 0.3, 0.55, -1.0, 0.55, "cloudflare", 0.1));
    m.push(box("foot_r_heel", 0.3, 0.15, 0.25, 0.55, -1.0, -0.2, "cloudflare", -0.1));
    m.push(cyl("foot_r_thruster", 0.1, 0.12, 0.1, 0.55, -1.12, 0.1, "cloudflare", 4));

    // ═══════════════════════════════════════════════════════════════
    // BEAM LASER CANNON (held in left hand) / Opencode
    // ═══════════════════════════════════════════════════════════════
    // --- Main barrel (very long) ---
    m.push(cyl("cannon_barrel", 0.12, 0.12, 3.5, -1.55, 0.9, 2.4, "opencode", 8, Math.PI / 2));
    // Barrel shroud / heat sink rings
    m.push(cyl("cannon_shroud_1", 0.18, 0.18, 0.08, -1.55, 0.9, 3.8, "opencode", 8, Math.PI / 2));
    m.push(cyl("cannon_shroud_2", 0.16, 0.16, 0.08, -1.55, 0.9, 3.4, "opencode", 8, Math.PI / 2));
    m.push(cyl("cannon_shroud_3", 0.17, 0.17, 0.08, -1.55, 0.9, 3.0, "opencode", 8, Math.PI / 2));
    // Muzzle flare / emitter
    m.push(cyl("cannon_muzzle", 0.08, 0.2, 0.25, -1.55, 0.9, 4.2, "opencode", 6, Math.PI / 2));
    m.push(torus("cannon_muzzle_ring", 0.18, 0.03, -1.55, 0.9, 4.3, "opencode", Math.PI / 2));
    // Receiver body (fat center section)
    m.push(box("cannon_body", 0.45, 0.5, 0.8, -1.55, 0.9, 1.2, "opencode"));
    // Top rail / scope mount
    m.push(box("cannon_rail", 0.08, 0.08, 1.8, -1.55, 1.2, 2.0, "opencode"));
    // Scope
    m.push(cyl("cannon_scope", 0.06, 0.06, 0.4, -1.55, 1.25, 2.3, "opencode", 6, Math.PI / 2));
    m.push(sphere("cannon_scope_lens", 0.07, -1.55, 1.25, 2.55, "opencode"));
    // Energy cell / magazine
    m.push(box("cannon_cell", 0.25, 0.45, 0.35, -1.55, 0.55, 1.2, "opencode"));
    m.push(oct("cannon_cell_core", 0.08, -1.55, 0.55, 1.2, "opencode"));
    // Stock / rear grip area
    m.push(box("cannon_stock", 0.2, 0.35, 0.5, -1.55, 0.9, 0.45, "opencode"));
    m.push(box("cannon_stock_pad", 0.25, 0.2, 0.15, -1.55, 0.9, 0.15, "opencode"));
    // Under-barrel stabilizer
    m.push(cyl("cannon_stab", 0.05, 0.05, 0.8, -1.55, 0.6, 2.6, "opencode", 4, Math.PI / 2));
    // Side vents
    m.push(box("cannon_vent_l", 0.05, 0.15, 0.4, -1.32, 0.9, 1.8, "opencode"));
    m.push(box("cannon_vent_r", 0.05, 0.15, 0.4, -1.78, 0.9, 1.8, "opencode"));
    // Trigger guard
    m.push(box("cannon_trigger", 0.12, 0.18, 0.06, -1.55, 0.7, 0.8, "opencode"));

    // ═══════════════════════════════════════════════════════════════
    // LARGE SHIELD (right arm) / D1
    // ═══════════════════════════════════════════════════════════════
    // Main shield body – tall angular slab
    m.push(box("shield_main", 0.2, 2.8, 1.6, 2.0, 1.5, 0.4, "d1"));
    // Outer frame / border
    m.push(box("shield_top", 0.15, 0.12, 1.5, 2.0, 2.9, 0.4, "d1"));
    m.push(box("shield_bot", 0.15, 0.12, 1.4, 2.0, 0.1, 0.4, "d1"));
    m.push(box("shield_side_l", 0.15, 2.7, 0.1, 2.0, 1.5, -0.35, "d1"));
    m.push(box("shield_side_r", 0.15, 2.7, 0.1, 2.0, 1.5, 1.15, "d1"));
    // Center cross / emblem
    m.push(box("shield_cross_v", 0.08, 1.8, 0.08, 2.12, 1.5, 0.4, "d1"));
    m.push(box("shield_cross_h", 0.08, 0.08, 1.0, 2.12, 1.5, 0.4, "d1"));
    // Shield boss (center gem)
    m.push(oct("shield_boss", 0.18, 2.15, 1.5, 0.4, "d1"));
    m.push(torus("shield_boss_ring", 0.25, 0.03, 2.14, 1.5, 0.4, "d1", 0, Math.PI / 2));
    // Upper chevron decoration
    m.push(box("shield_chev_l", 0.06, 0.5, 0.06, 2.12, 2.3, 0.15, "d1", 0, 0, 0.2));
    m.push(box("shield_chev_r", 0.06, 0.5, 0.06, 2.12, 2.3, 0.65, "d1", 0, 0, -0.2));
    // Lower spike / point
    m.push(cone("shield_spike", 0.2, 0.6, 2.0, -0.3, 0.4, "d1", 4));
    // Arm mounting bracket
    m.push(box("shield_mount_1", 0.15, 0.3, 0.15, 1.85, 1.8, 0.4, "d1"));
    m.push(box("shield_mount_2", 0.15, 0.3, 0.15, 1.85, 1.2, 0.4, "d1"));
    // Inner reinforcement struts
    m.push(box("shield_strut_1", 0.06, 2.2, 0.06, 2.06, 1.5, 0.05, "d1"));
    m.push(box("shield_strut_2", 0.06, 2.2, 0.06, 2.06, 1.5, 0.75, "d1"));

    return m;
  }, []);

  // Add meshes once
  useEffect(() => {
    if (groupRef.current && !isInit.current) {
      mechaData.forEach((mesh) => groupRef.current!.add(mesh));
      isInit.current = true;
    }
  }, [mechaData]);

  // Per-frame color update
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      if (child instanceof Mesh && child.userData.skillId) {
        const material = child.material as MeshBasicMaterial;
        const sid = child.userData.skillId;
        if (selectedSkill === sid) material.color.setHex(SELECTED_COLOR);
        else if (hoveredSkill === sid) material.color.setHex(HOVER_COLOR);
        else if (hoveredSkill || selectedSkill) material.color.setHex(DIM_COLOR);
        else material.color.setHex(GLOW_COLOR);
      }
    });
  });

  // Idle float
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
    }
  });

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      const sid = e.object.userData.skillId;
      if (sid) onPartHover(sid);
    },
    [onPartHover],
  );

  const handlePointerOut = useCallback(
    (e: any) => {
      e.stopPropagation();
      onPartHover(null);
    },
    [onPartHover],
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      const sid = e.object.userData.skillId;
      if (sid) onPartClick(sid);
    },
    [onPartClick],
  );

  return (
    <group ref={groupRef}>
      {mechaData.map((mesh, i) => (
        <primitive
          key={`${mesh.name}-${i}`}
          object={mesh}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      ))}
    </group>
  );
};
