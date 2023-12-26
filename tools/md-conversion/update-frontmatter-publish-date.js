const { read, batch } = require("frontmatter-file-batcher");


batch("tmp/**/**.md", 100, async ({ goods, actions }) => {
 
  const { update, save } = actions;
 

  const date = `${goods.data['publish_date']}`.slice(0, 8);
  const newDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;


  goods.data["publish_date"] = newDate


  await save(goods);
 
  console.log("Just saved:", goods.path);

});