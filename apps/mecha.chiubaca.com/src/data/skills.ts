import { Vector3 } from "three";
import { skillList } from "./skillConfig";

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string;
  details: string[];
  bodyPart: string;
  meshNames: string[];
  cameraPosition: Vector3;
  cameraTarget: Vector3;
  color: string;
}

const skillDetailsMap: Record<string, Omit<Skill, "id" | "name" | "category">> = {
  typescript: {
    level: 95,
    description: "Advanced type-safe development with strict null checks and advanced generics.",
    details: [
      "Type inference & conditional types",
      "Generic constraints & mapped types",
      "Declaration merging & module augmentation",
      "Compiler API & AST manipulation",
    ],
    bodyPart: "HEAD // V-FIN",
    meshNames: ["head", "visor", "vfin", "crest"],
    cameraPosition: new Vector3(2, 5.5, 4),
    cameraTarget: new Vector3(0, 4.5, 0),
    color: "#00ff41",
  },
  react: {
    level: 92,
    description: "Component architecture with hooks, context, and modern patterns.",
    details: [
      "Custom hooks & composition patterns",
      "Concurrent features & Suspense",
      "Server Components & streaming",
      "Performance optimization & memoization",
    ],
    bodyPart: "TORSO // CORE REACTOR",
    meshNames: ["torso", "chest", "core", "collar", "skirt"],
    cameraPosition: new Vector3(4, 3.5, 5),
    cameraTarget: new Vector3(0, 3.0, 0),
    color: "#00ff41",
  },
  opus46: {
    level: 95,
    description:
      "Advanced language model propulsion system. Generates context-aware code solutions with reasoning capabilities.",
    details: [
      "Advanced reasoning & problem solving",
      "Code architecture planning",
      "Complex refactoring operations",
      "Multi-step problem decomposition",
    ],
    bodyPart: "BACKPACK // THRUSTERS",
    meshNames: ["bp_", "backpack", "engine", "thruster", "nozzle", "fuel"],
    cameraPosition: new Vector3(-2, 4, -6),
    cameraTarget: new Vector3(0, 3.2, -1),
    color: "#00ff41",
  },
  cloudflare: {
    level: 90,
    description: "Edge computing with V8 isolates for global low-latency execution.",
    details: [
      "V8 isolates & cold start optimization",
      "Durable Objects & coordination",
      "KV & Cache API integration",
      "WebAssembly & WASI support",
    ],
    bodyPart: "LEG THRUSTERS",
    meshNames: ["thigh", "shin", "knee", "ankle", "foot", "calf", "hip"],
    cameraPosition: new Vector3(3, 0, 5),
    cameraTarget: new Vector3(0, 0, 0),
    color: "#00ff41",
  },
  opencode: {
    level: 92,
    description:
      "AI-powered terminal interface for autonomous coding operations. Deploys code changes via natural language commands.",
    details: [
      "Natural language code generation",
      "Autonomous PR creation",
      "Multi-file editing capabilities",
      "Context-aware suggestions",
    ],
    bodyPart: "BEAM LASER CANNON",
    meshNames: ["cannon", "rifle", "gun", "weapon", "barrel"],
    cameraPosition: new Vector3(-4, 1.5, 5),
    cameraTarget: new Vector3(-1.5, 0.9, 2.5),
    color: "#00ff41",
  },
  d1: {
    level: 88,
    description:
      "Distributed SQL defense matrix. SQLite-compatible edge database with automatic replication.",
    details: [
      "SQLite at the edge",
      "Automatic read replication",
      "Serverless pricing model",
      "Zero-latency queries",
    ],
    bodyPart: "TACTICAL SHIELD",
    meshNames: ["shield"],
    cameraPosition: new Vector3(5, 2, 3),
    cameraTarget: new Vector3(2.0, 1.5, 0.4),
    color: "#00ff41",
  },
  aigateway: {
    level: 85,
    description:
      "Intelligent request routing armor. Manages AI provider failover and rate limiting at the edge.",
    details: [
      "Provider fallback mechanisms",
      "Request caching strategies",
      "Token usage management",
      "Unified API interface",
    ],
    bodyPart: "LEFT SHOULDER",
    meshNames: ["shldr_l", "shoulder_l"],
    cameraPosition: new Vector3(-3, 4.5, 4),
    cameraTarget: new Vector3(-1.3, 3.8, 0),
    color: "#00ff41",
  },
  tanstackstart: {
    level: 87,
    description:
      "Full-stack framework plating. Type-safe routing with server-side rendering capabilities.",
    details: [
      "SSR/SSG rendering modes",
      "File-based routing",
      "API route handlers",
      "Streaming architecture",
    ],
    bodyPart: "RIGHT SHOULDER",
    meshNames: ["shldr_r", "shoulder_r"],
    cameraPosition: new Vector3(3, 4.5, 4),
    cameraTarget: new Vector3(1.3, 3.8, 0),
    color: "#00ff41",
  },
  hono: {
    level: 89,
    description:
      "Ultralight communication protocol. Edge-first web framework for rapid signal transmission.",
    details: [
      "Zero-config deployment",
      "Middleware composition",
      "Web Standards API",
      "Lightning-fast routing",
    ],
    bodyPart: "COMM ANTENNA ARRAY",
    meshNames: ["antenna"],
    cameraPosition: new Vector3(1, 6, 3),
    cameraTarget: new Vector3(0, 5.2, 0),
    color: "#00ff41",
  },
  zod: {
    level: 91,
    description:
      "Runtime validation manipulators. Type-safe schema parsing with TypeScript-first architecture.",
    details: [
      "TypeScript type inference",
      "Schema composition",
      "Error formatting",
      "Transform pipelines",
    ],
    bodyPart: "ARM HYDRAULICS",
    meshNames: ["arm_", "hand_", "elbow", "wrist"],
    cameraPosition: new Vector3(-4, 2.5, 4),
    cameraTarget: new Vector3(-1, 2.0, 0),
    color: "#00ff41",
  },
};

export const skills: Skill[] = skillList.map((skillConfig) => ({
  ...skillConfig,
  ...skillDetailsMap[skillConfig.id],
}));

export const getSkillById = (id: string): Skill | undefined => {
  return skills.find((skill) => skill.id === id);
};

export const getSkillByMeshName = (meshName: string): Skill | undefined => {
  const lowerMeshName = meshName.toLowerCase();
  return skills.find((skill) =>
    skill.meshNames.some((name) => lowerMeshName.includes(name.toLowerCase())),
  );
};
