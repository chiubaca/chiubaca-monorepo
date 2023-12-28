import * as fs from "fs/promises";
import * as path from "path";

import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { read } from "to-vfile";

const CONTENT_DIR = "apps/notes.chiubaca.com/src/content";

/**
 * This convert markdown images from 'image.png' to '/image.png'
 * So that it can reference its image from the root of the website.
 * @param {import('unist').Parent} markdownAst
 */
const updateImageUrls = (markdownAst) => {
  if (markdownAst.children) {
    for (let child of markdownAst.children) {
      if (child.type === "image") {
        // skip images which are externally hosted.
        if (child.url.startsWith("https")) {
          return;
        }
        const originalUrl = child.url;
        const newUrl = "/" + originalUrl;
        child.url = newUrl;
        console.log(
          `MD mutation: Updated image url from ${originalUrl} to ${newUrl}`,
        );
      }
      updateImageUrls(child);
    }
  }
};

/**
 * Recursively scan through a directory and process all markdown files.
 * @param {string} directoryPath
 * @param {func} markdownMutations
 * @param {import('unist').Parent} markdownMutations.markdownAst
 *
 */
const scanForMarkdownFiles = async (directoryPath, markdownMutations) => {
  const files = await fs.readdir(directoryPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(directoryPath, files[i]);
    const stat = await fs.stat(filePath);

    if (stat.isFile() && path.extname(filePath) === ".md") {
      const file = await unified()
        .use(remarkParse)
        .use(remarkStringify)
        .use(remarkFrontmatter, ["yaml"])
        .use(() => (tree) => markdownMutations(tree))
        .process(await read(filePath));

      // write the updated md back to original file
      await fs.writeFile(filePath, file.toString());
    } else if (stat.isDirectory()) {
      // recurse into subdirectories
      await scanForMarkdownFiles(filePath, markdownMutations);
    }
  }
};

/**
 * Register of all markdown processing
 * @param {import('unist').Parent} markDownAst
 */
const markdownMutations = (markDownAst) => {
  //👇ADD MORE MD MUTATIONS HERE👇

  updateImageUrls(markDownAst);

  //👆ADD MORE MD MUTATIONS HERE👆
};

scanForMarkdownFiles(path.dirname(CONTENT_DIR), markdownMutations);
