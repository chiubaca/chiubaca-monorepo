# move notes to astro content directory
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

# move images to astro public directory
content_dirs=("apps/notes.chiubaca.com/src/content/fleeting-notes" 
             "apps/notes.chiubaca.com/src/content/index-notes"
             "apps/notes.chiubaca.com/src/content/permanent-notes"
             "apps/notes.chiubaca.com/src/content/literature-notes")

for dir in "${content_dirs[@]}"
do
  if [ -d "$dir" ]
  then
    for file in "$dir"/*
    do
      if [[ $file == *.jpg || $file == *.jpeg || $file == *.png || $file == *.gif ]]
      then
        mv "$file" "apps/notes.chiubaca.com/public"
      fi
    done
  fi
done

# rm -rf tmp