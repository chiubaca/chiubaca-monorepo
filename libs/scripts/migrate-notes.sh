cp -r tmp-notes/permanent-notes/ apps/chiubaca.com/permanent-notes/
echo "✅ permanents notes moved"
cp -r tmp-notes/fleeting-notes/ apps/chiubaca.com/fleeting-notes/
echo "✅ fleeting notes moved"  
cp -r tmp-notes/attachments/* apps/chiubaca.com/public/attachments
echo "✅ attachments moved to /public/attachments"