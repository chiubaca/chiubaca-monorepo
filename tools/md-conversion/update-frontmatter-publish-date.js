/**
 * Update the publish date in the frontmatter of all markdown files to 'YYYY-MM-DD'.
 */
const { read, batch } = require("frontmatter-file-batcher");


batch("tmp/**/**.md", 100, async ({ goods, actions }) => {

  try{
    const { update, save } = actions;

    const date = `${goods.data['publish_date']}`.slice(0, 8);
    const newDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  
    if(!goods?.data?.["publish_date"]){
      console.warn("No publish date for:", goods.path);
      return
    }

    goods.data["publish_date"] = newDate
  
    await save(goods);
   
    console.log("Updated publish date for:", goods.path);
  }catch(err){

    console.warn("Error updating publish date for:", goods.path);
    console.warn(err);
  }

});