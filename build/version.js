const pkg = require('../package.json')
const fs = require('fs')
const path = require('path')
fs.writeFileSync(
  path.resolve(__dirname, '../packages/version.ts'),
  `const version = '${pkg.version}'
export default version
`,
  'utf8'
)
