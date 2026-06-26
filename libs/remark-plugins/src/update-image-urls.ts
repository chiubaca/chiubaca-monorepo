import { defineMdastPlugin } from "satteri";

/**
 * In obsidian we reference image in its relative folder.
 * In the website we need it relative to the root of the website.
 * This convert markdown images from 'image.png' to '/attachments/image.png'
 * So that it can reference its image from the root of the website.
 */
export const updateImageUrls = defineMdastPlugin({
  name: "update-image-urls",
  image(node, ctx) {
    if (!node.url || node.url.startsWith("https")) return;
    const newUrl = `/attachments/${node.url.split("/").at(-1)}`;
    console.log(`MD mutation: Updated image url from ${node.url} to ${newUrl}`);
    ctx.setProperty(node, "url", newUrl);
  },
});
