import catalog from "../../../../libs/mecha-systems/catalog.json";

export const skillList = Object.entries(catalog).map(([id, part]) => ({ id, ...part }));
