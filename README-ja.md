# gitkraken-i18n
Unofficial GitKraken i18n project  
GitKraken非公式日本語化プロジェクト

## Requirement
- git

## Patch
- 準備中

## Translate

### Requirement
- node
- npm
- asar

### Setting

1. GitKrakenの`app.asar`をプロジェクト直下に`app.asar.original`としてコピー
1. GitKrakenの`app.asar.unpacked`をプロジェクト直下に`app.asar.original.unpacked`としてコピー
 - `npm run asar-copy-mac #1と2をあわせてコピー`
1. `asar`で`app.asar.original`を`app.extract`として展開
 - `npm run extract`
1. デフォルトのen-us.jsonを削除
 - `npm run remove`
1. プロジェクト直下にある`ja-jp.json`を翻訳する
1. ja-jp.jsonをus-en.jsonとしてコ
 - `npm run copy-jp`
1. asarで`app.extract`を`app.asar`としてパッケージ
 - `npm run pack`
1. GitKrakenの`app.asar`に先ほど作成した`app.asar`を上書き
1. GitKrakenを起動して翻訳を確認
