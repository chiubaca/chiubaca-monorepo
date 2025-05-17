/**
 * In obsidian we reference image in its relative folder.
 * In the website we need it relative to the root of the website.
 * This convert markdown images from 'image.png' to '/image.png'
 * So that it can reference its image from the root of the website.
 */
export const updateImageUrls = () => {
  return (tree) => {
    if (tree.children) {
      for (const child of tree.children) {
        if (child.type === "image") {
          // skip images which are externally hosted.
          if (child.url.startsWith("https")) {
            return;
          }
          const originalUrl = child.url;
          const newUrl = `/attachments/${originalUrl.split("/").at(-1)}`;
          child.url = newUrl;
          console.log(
            `MD mutation: Updated image url from ${originalUrl} to ${newUrl}`
          );
        }
        updateImageUrls()(child);
      }
    }
  };
};
