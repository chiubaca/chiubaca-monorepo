if [ ! -d "tmp" ]; then
  echo "Error: tmp directory not found"
  exit 1
fi

MD_CONVERSION_SCRIPTS_DIR="tools/md-conversion"

node $MD_CONVERSION_SCRIPTS_DIR/remove-layout-frontmatter.js
node $MD_CONVERSION_SCRIPTS_DIR/update-fleeting-notes-date-file-name.js
node $MD_CONVERSION_SCRIPTS_DIR/update-frontmatter-publish-date.js