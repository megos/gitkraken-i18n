module.exports = {
  filters: {
    allowlist: {
      allow: [
        '...',
        '.gitconfig',
        '/Summary:.*happens\]/',
        'Feedback about GitKraken \({0}\)',
        ' gitkraken.com ',
        ' https://blog.axosoft.com/workaround-gitkraken-big-sur-issues/ ',
        ' \[',
        '\] ',
      ],
    },
  },
  rules: {
    'preset-jtf-style': {
      // '3.1.1.全角文字と半角文字の間': false,
      // '3.3.かっこ類と隣接する文字の間のスペースの有無': false,
    },
    prh: {
      rulePaths :['./prh.yml'],
    },
  },
}
