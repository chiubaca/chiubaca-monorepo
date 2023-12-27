dirs=(
      "tmp/fleeting-notes"
      "tmp/index-notes"
      "tmp/permanent-notes"
      "tmp/literature-notes"
     )

for dir in "${dirs[@]}"
do
  mv "$dir" "apps/notes.chiubaca.com/src/content/"
done
 

rm -rf tmp