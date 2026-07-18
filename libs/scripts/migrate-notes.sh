#!/bin/bash
# Check if source directories exist
if [ ! -d "tmp-notes/permanent-notes/" ]; then
    echo "⚠️  Warning: tmp-notes/permanent-notes/ does not exist"
    exit 1
fi

if [ ! -d "tmp-notes/fleeting-notes/" ]; then
    echo "⚠️  Warning: tmp-notes/fleeting-notes/ does not exist"
    exit 1
fi

if [ ! -d "tmp-notes/attachments/" ]; then
    echo "⚠️  Warning: tmp-notes/attachments/ does not exist"
    exit 1
fi

cp -r tmp-notes/permanent-notes/ apps/chiubaca.com/content/permanent-notes/
echo "✅ permanent notes moved"
cp -r tmp-notes/fleeting-notes/ apps/chiubaca.com/content/fleeting-notes/
echo "✅ fleeting notes moved"  
cp -r tmp-notes/attachments/* apps/chiubaca.com/public/attachments
echo "✅ attachments moved to /public/attachments"

if [ -d "tmp-notes/photos" ]; then
    mkdir -p apps/chiubaca.com/public/photos
    cp -r tmp-notes/photos/* apps/chiubaca.com/public/photos/
    echo "✅ photos moved to /public/photos"
fi

node libs/scripts/generate-photo-manifest.mjs
echo "✅ photo manifest generated"