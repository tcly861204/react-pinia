const path = require('path')
const fs = require('fs')
const pkg = require(path.resolve(__dirname, "../package.json"))
delete pkg.scripts
delete pkg.devDependencies
fs.writeFileSync(
  path.resolve(__dirname, '../package.json'),
  JSON.stringify(pkg, null, 2),
  'utf8',
);
