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
