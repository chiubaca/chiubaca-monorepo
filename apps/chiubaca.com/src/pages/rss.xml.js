import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const blogs = await getCollection("permanent-notes");

  return rss({
    // `<title>` field in output xml
    title: "A blog by chiubaca (Alex Chiu)",
    // `<description>` field in output xml
    description:
      "Hey I'm Alex Chiu 👋. I'm a full-stack developer based in London. Here I publish musings about web development, life and other ramblings.",
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: blogs.map((blog) => ({
      title: blog.data.title,
      description: blog.data.description,
    })),
    // (optional) inject custom xml
    // customData: `<language>en-gb</language>`,
  });
}
