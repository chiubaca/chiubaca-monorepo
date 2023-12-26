const { read, batch } = require("frontmatter-file-batcher");

// A sane limit of 100 concurrent operations.
batch("tmp/fleeting-notes/**.md", 100, async ({ goods, actions }) => {
 
  const { update, save } = actions;
 

  delete goods.data.layout;
 
  // // At the end you can save your post with the new data.
  await save(goods);
 
  console.log("Just saved:", goods.path);

});