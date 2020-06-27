const util = require('util')
const ja = require('./ja/strings.json')
const values = [...Object.values(ja.menuStrings), ...Object.values(ja.strings)]
console.log(util.inspect(values, { maxArrayLength: null }))
