# copy notes to astro content directory
dirs=(
      "tmp-notes/fleeting-notes/"
      "tmp-notes/index-notes/"
      "tmp-notes/permanent-notes/"
      "tmp-notes/literature-notes/"
     )

for dir in "${dirs[@]}"
do
  cp -r "$dir" "apps/notes.chiubaca.com/src/content/"
done

# copy images to astro public directory
cp -r  tmp-notes/attachments/* apps/notes.chiubaca.com/public/