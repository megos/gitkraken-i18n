Param($1, $2)

$patch = "patches\ja-jp-v${1}-${2}.patch"
mv .git .git.bk
git diff --binary app.asar.original app.asar > ${patch}
perl -pe 's/\.original//' ${patch}.temp
[string]::Join("`n", (get-content -Encoding Unicode ${patch}.temp)) | set-content ${patch}
rm ${patch}.temp
mv app.asar app.asar.packed
cp app.asar.original app.asar
git apply ${patch}
mv .git.bk .git
