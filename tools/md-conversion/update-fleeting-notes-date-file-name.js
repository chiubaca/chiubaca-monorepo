/**
 * Update the file names of all fleeting notes to be in the format YYYY-MM-DD from YYYYMMDD.md.
 */
const fs = require("fs");
const path = require("path");

const fleetingNotesDir = path.join(__dirname, "../../tmp/fleeting-notes");

fs.readdirSync(fleetingNotesDir).forEach((filename) => {
  // only do this action if the file is an md file
  if (!filename.endsWith(".md")) {
    return;
  }

  const date = filename.slice(0, 8);
  const newDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  const newFilename = `${newDate}.md`;

  fs.renameSync(
    path.join(fleetingNotesDir, filename),
    path.join(fleetingNotesDir, newFilename),
  );

  console.log(`Updated ${filename} to, ${newFilename}`);
});
