import catalog from "../../libs/mecha-systems/catalog.json";

// [azimuth, elevation, bank] in degrees around each target's mesh bounds.
const shots = {
  head: { mesh: /^Head$/, view: [-20, 12, -5], padding: 0.14 },
  torso: { mesh: /^(Chest|ChestShell_|Spine)/, view: [18, 6, 5], padding: 0.15, split: true },
  backpack: { mesh: /^(Backpack|WingBinder)/, view: [155, 19, -8], padding: 0.07, split: true },
  legs: { mesh: /^(Thigh|Shin|Foot|AnkleGuard)\./, view: [28, -5, 6], padding: 0.12 },
  rifle: { mesh: /^Rifle\.R$/, view: [-18, 8, -6], padding: 0.12 },
  shield: { mesh: /^Shield/, view: [43, 13, 6], padding: 0.1, split: true },
  "left-shoulder": { mesh: /^Pauldron\.L$/, view: [55, 18, -7], padding: 0.13 },
  "right-shoulder": { mesh: /^Pauldron\.R$/, view: [-56, 9, 8], padding: 0.12 },
  antenna: { mesh: /^Antenna_/, view: [-40, 23, -8], padding: 0.16, split: true },
  arms: { mesh: /^(UpperArm|Forearm|Hand)\./, view: [-31, 9, 4], padding: 0.12 },
};

export const systems = Object.fromEntries(
  Object.entries(catalog).map(([id, part]) => [id, { ...part, ...shots[id] }]),
);
