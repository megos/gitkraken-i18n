# gitkraken-i18n
Unofficial GitKraken i18n project  
GitKraken非公式日本語化プロジェクト

## Requirement
- git

## Patch
**このパッチの適用は自己責任でお願いします。**
**パッチを適用したことによるいかなる影響についても責任は負いません。**

1. GitKrakenの`app.asar`を任意の場所にコピー。この`app.asar`は**必ず**バックアップを取っておくこと
  - Windows: `%LOCALAPPDATA%\gitkraken\app-x.x.x\resources\app.asar` (x.x.xは任意のバージョン)
  - Mac: `/Applications/GitKraken.app/Contents/Resources/app.asar`
2. [Releases](https://github.com/megos/gitkraken-i18n/releases)からGitKrakenと同じバージョンのパッチをダウンロードする
3. `git apply ja-jp.patch`でパッチを適用
4. パッチを適用した`app.asar`をGitKrakenに戻す（上書き）
5. GitKrakenを再起動

## Translate

### Requirement
- node
- npm
- asar

### Setting

1. GitKrakenの`app.asar`をプロジェクト直下に`app.asar.original`としてコピー
2. GitKrakenの`app.asar.unpacked`をプロジェクト直下に`app.asar.original.unpacked`としてコピー
  - `npm run asar-copy-mac #1と2をあわせてコピー`
3. `asar`で`app.asar.original`を`app.extract`として展開
  - `npm run extract`
4. デフォルトのen-us.jsonを削除
  - `npm run remove`
5. プロジェクト直下にある`ja-jp.json`を翻訳する
6. ja-jp.jsonをen-us.jsonとしてコピー
  - `npm run copy-jp`
7. asarで`app.extract`を`app.asar`としてパッケージ
  - `npm run pack`
8. GitKrakenの`app.asar`に先ほど作成した`app.asar`を上書き
9. GitKrakenを起動して翻訳を確認
