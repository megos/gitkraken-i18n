# gitkraken-i18n
Unofficial GitKraken i18n project

## Contents
- [Japanese](README-ja.md)

## Requirement
- git

## Patch
- Construction


## Translate

### Requirement
- node
- npm
- asar

### Setting

1. Copy GitKraken's `app.asar` to project dir and rename to `app.asar.original`.
2. Copy GitKraken's `app.asar.unpacked` to project dir and rename to `app.asar.original.unpacked`.
  - `npm run asar-copy-mac # 1 and 2`
3. Extract `app.asar` to `app.extract`.
Copy `en-us.json` to your locale json file.
  - `npm run extract`
4. Translate json file.
5. Copy your locale json file to `app.extract/src/string/en-us.json`
6. Pack `app.asar`
  - `npm run pack`
7. Overwrite created `app.asar` to GitKraken's `app.asar`.
8. Restart GitKraken and check translate.