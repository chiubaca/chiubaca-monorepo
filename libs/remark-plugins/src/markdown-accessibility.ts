import { defineHastPlugin } from "satteri";

export const markdownAccessibility = defineHastPlugin({
  name: "markdown-accessibility",
  element: {
    filter: ["input", "table"],
    visit(node, ctx) {
      if (node.tagName === "table") {
        ctx.setProperty(node, "tabIndex", 0);
        return;
      }
      if (node.properties.type !== "checkbox" || !node.properties.disabled) return;
      if (node.properties.ariaLabel || node.properties.ariaLabelledBy) return;

      const parent = ctx.parent(node);
      if (parent?.type !== "element") return;
      const item = parent.tagName === "p" ? ctx.parent(parent) : parent;
      if (item?.type !== "element" || item.tagName !== "li") return;
      const classes = item.properties.className;
      if (!Array.isArray(classes) || !classes.includes("task-list-item")) return;

      const label = parent.children
        .filter((child) => child.type !== "element" || !["ul", "ol"].includes(child.tagName))
        .map((child) => ctx.textContent(child))
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      ctx.setProperty(node, "ariaLabel", label || "Task");
    },
  },
});
