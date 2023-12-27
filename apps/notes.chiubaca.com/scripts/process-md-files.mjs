import * as fs from "fs/promises";
import * as path from "path";

import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { read } from "to-vfile";

const contentDir = path.dirname("apps/notes.chiubaca.com/src/content");

/**
 * updates the image urls in the markdown files so they're relative to root of the
 * site instead of the current directory.
 */
function updateImageUrls(node) {
  if (node.children) {
    for (let child of node.children) {
      if (child.type === "image") {
        child.url = "/" + child.url;
      }
      updateImageUrls(child);
    }
  }
}

async function walkDir(currentPath) {
  const files = await fs.readdir(currentPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(currentPath, files[i]);
    const stat = await fs.stat(filePath);

    if (stat.isFile() && path.extname(filePath) === ".md") {
      const file = await unified()
        .use(remarkParse)
        .use(remarkStringify)
        .use(remarkFrontmatter, ["yaml", "toml"])
        .use(function () {
          return function (tree) {
            updateImageUrls(tree);
          };
        })
        .process(await read(filePath));

      // write the updateMd back to original file
      await fs.writeFile(filePath, file.toString());
    } else if (stat.isDirectory()) {
      // recurse into subdirectories
      await walkDir(filePath);
    }
  }
}

walkDir(contentDir);

// const file = await unified()
//   .use(remarkParse)
//   .use(remarkStringify)
//   .use(remarkFrontmatter, ["yaml", "toml"])
//   .use(function () {
//     return function (tree) {
//       console.dir(tree);
//       updateImageUrls(tree);
//     };
//   })
//   .process(await read("apps/notes.chiubaca.com/scripts/test.md"));

// console.log("🚀 ~ file: process-md-files.mjs:55 ~ file:", file.toString());
