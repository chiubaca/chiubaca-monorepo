/**
 * Remove the layout property frontmatter from all markdown files.
 */

const { batch } = require("frontmatter-file-batcher");

batch("tmp/**/**.md", 100, async ({ goods, actions }) => {
  const { save } = actions;

  delete goods.data.layout;

  await save(goods);

  console.log("Removed layout property from:", goods.path);
});
