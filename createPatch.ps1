Param($1, $2)

$patch = "patches\ja-jp-v${1}-${2}.patch"
mv .git .git.bk
git diff --binary app.asar.original app.asar > "${patch}.temp"
Get-Content "${patch}.temp" | % { $_ -replace "app.asar.original", "app.asar" } > ${patch}
Write-Output "" >> ${patch}
[string]::Join("`n", (get-content -Encoding Unicode ${patch})) | Set-Content -NoNewline ${patch}
rm "${patch}.temp"
mv app.asar app.asar.packed
cp app.asar.original app.asar
git apply ${patch}
mv .git.bk .git
