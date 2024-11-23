const pkg = require('../package.json')
const fs = require('fs')
const path = require('path')
fs.writeFileSync(
  path.resolve(__dirname, '../src/version.ts'),
  `export const version = '${pkg.version}'
`,
  'utf8'
)
const code = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8')
const newCode = code.replace(
  /(https\:\/\/badgen\.net\/npm\/v\/react-pinia)(\?v=[\d\.]+)/gi,
  ($all, $1, $2) => {
    return $1 + '?v=' + pkg.version + '.' + Date.now()
  }
)
fs.writeFileSync(path.resolve(__dirname, '../README.md'), newCode, 'utf8')
fs.writeFileSync(path.resolve(__dirname, '../../../README.md'), newCode, 'utf8')
