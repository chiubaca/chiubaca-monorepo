import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const blogs = await getCollection("permanent-notes");
  const liveBlogs = blogs
    .filter((blog) => blog.data.status === "live")
    .sort(
      (a, b) => b.data.publish_date.valueOf() - a.data.publish_date.valueOf()
    );

  return rss({
    // `<title>` field in output xml
    title: "chiubaca.com RSS Feed",
    // `<description>` field in output xml
    description: "Ramblings by Alex Chiu",
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: liveBlogs.map((blog) => ({
      title: blog.data.title,
      description: blog.data.description,
      link: `/${blog.id}`,
      pubDate: blog.data.publish_date,
    })),
    // (optional) inject custom xml
    customData: "<language>en-gb</language>",
  });
}
