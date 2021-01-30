module.exports = {
  filters: {
    whitelist: {
      allow: [
        '...',
        '\\n \[',
        '.gitconfig',
        '/Summary:.*happens\]/',
        'Feedback about GitKraken \({0}\)',
        ' gitkraken.com '
      ],
    },
  },
  rules: {
    'preset-jtf-style': true,
    prh: {
      rulePaths :['./prh.yml'],
    },
  },
}
