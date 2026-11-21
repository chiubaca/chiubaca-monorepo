import { Vector3 } from "three";
import { skillList } from "./skillConfig";

export type Skill = (typeof skillList)[number] & {
  cameraPosition: Vector3;
  cameraTarget: Vector3;
};

const shots: Record<string, [Vector3, Vector3]> = {
  head: [new Vector3(2, 5.5, 4), new Vector3(0, 4.5, 0)],
  torso: [new Vector3(4, 3.5, 5), new Vector3(0, 3, 0)],
  backpack: [new Vector3(-2, 4, -6), new Vector3(0, 3.2, -1)],
  legs: [new Vector3(3, 0, 5), new Vector3(0, 0, 0)],
  rifle: [new Vector3(-4, 1.5, 5), new Vector3(-1.5, 0.9, 2.5)],
  shield: [new Vector3(5, 2, 3), new Vector3(2, 1.5, 0.4)],
  "left-shoulder": [new Vector3(-3, 4.5, 4), new Vector3(-1.3, 3.8, 0)],
  "right-shoulder": [new Vector3(3, 4.5, 4), new Vector3(1.3, 3.8, 0)],
  antenna: [new Vector3(1, 6, 3), new Vector3(0, 5.2, 0)],
  arms: [new Vector3(-4, 2.5, 4), new Vector3(-1, 2, 0)],
};

const skills: Skill[] = skillList.map((part) => {
  const [cameraPosition, cameraTarget] = shots[part.id];
  return { ...part, cameraPosition, cameraTarget };
});

export const getSkillById = (id: string) => skills.find((part) => part.id === id);
