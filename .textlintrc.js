module.exports = {
  plugins: [
    "json"
  ],
  filters: {
    whitelist: {
      allow: [
        "...",
        "\\n \[",
      ],
    },
  },
  rules: {
    "preset-jtf-style": true,
  },
}
