module.exports = {
  plugins: [
    'json'
  ],
  filters: {
    whitelist: {
      allow: [
        '...',
        '\\n \[',
        '.gitconfig',
        '/Summary:.*happens\]/',
        'Feedback about GitKraken \({0}\)',
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
