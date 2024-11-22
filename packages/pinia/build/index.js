const path = require('path')
const fs = require('fs')
const pkg = require(path.resolve(__dirname, '../package.json'))
delete pkg.scripts
delete pkg.devDependencies
pkg.main = 'lib/react-pinia.umd.js'
pkg.module = 'lib/react-pinia.es.js'
fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, null, 2), 'utf8')
const types = fs.readFileSync(path.resolve(__dirname, '../dist/main.d.ts'), 'utf8')
fs.writeFileSync(path.resolve(__dirname, '../types/index.d.ts'), types, 'utf8')
