Param($1, $2)

$patch=patches\ja-jp-v${1}-${2}.patch
mv .git{,.bk}
git diff --binary app.asar.original app.asar > $patch
perl -i -pe 's/\.original//' $patch
mv app.asar app.asar.packed
cp app.asar.original app.asar
git apply $patch
mv .git{.bk,}
