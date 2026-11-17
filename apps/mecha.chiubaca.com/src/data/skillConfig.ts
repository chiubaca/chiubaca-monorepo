export interface SkillConfig {
  id: string;
  name: string;
  label: string;
  fullName: string;
  part: string;
  category: string;
}

export const skillList: SkillConfig[] = [
  {
    id: "typescript",
    name: "TypeScript",
    label: "TS",
    fullName: "TypeScript",
    part: "HEAD/V-FIN",
    category: "CORE SYSTEM",
  },
  {
    id: "react",
    name: "React.js",
    label: "REACT",
    fullName: "React.js",
    part: "TORSO",
    category: "MAIN FRAMEWORK",
  },
  {
    id: "opus46",
    name: "Opus 4.6",
    label: "OPUS",
    fullName: "Opus 4.6",
    part: "BACKPACK",
    category: "AI PROPULSION",
  },
  {
    id: "cloudflare",
    name: "Cloudflare Workers",
    label: "CF",
    fullName: "Cloudflare",
    part: "LEGS",
    category: "TURBO THRUSTERS",
  },
  {
    id: "opencode",
    name: "Opencode",
    label: "CODE",
    fullName: "Opencode",
    part: "CANNON",
    category: "AI TERMINAL",
  },
  {
    id: "d1",
    name: "D1",
    label: "D1",
    fullName: "D1",
    part: "SHIELD",
    category: "EDGE DATABASE",
  },
  {
    id: "aigateway",
    name: "AI Gateway",
    label: "AI GW",
    fullName: "AI Gateway",
    part: "L-SHOULDER",
    category: "AI ROUTING",
  },
  {
    id: "tanstackstart",
    name: "Tanstack Start",
    label: "TANSTACK",
    fullName: "Tanstack Start",
    part: "R-SHOULDER",
    category: "FULL-STACK FW",
  },
  {
    id: "hono",
    name: "Hono.js",
    label: "HONO",
    fullName: "Hono.js",
    part: "ANTENNA",
    category: "EDGE FRAMEWORK",
  },
  {
    id: "zod",
    name: "Zod",
    label: "ZOD",
    fullName: "Zod",
    part: "ARMS",
    category: "TYPE VALIDATION",
  },
];
