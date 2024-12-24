const { Arch } = require('electron-builder')
const { default: removeLocales } = require('./remove-locales')
const fs = require('fs')
const path = require('path')

exports.default = async function (context) {
  await removeLocales(context)
  const platform = context.packager.platform.name
  const arch = context.arch

  if (platform === 'mac') {
    const nodeModulesPath = path.join(
      context.appOutDir,
      'Cherry Studio.app',
      'Contents',
      'Resources',
      'app.asar.unpacked',
      'node_modules',
      '@libsql'
    )

    keepLibsqlNodeModules(nodeModulesPath, arch === Arch.arm64 ? ['darwin-arm64'] : ['darwin-x64'])
  }

  if (platform === 'linux') {
    const nodeModulesPath = path.join(context.appOutDir, 'resources', 'app.asar.unpacked', 'node_modules', '@libsql')
    keepLibsqlNodeModules(
      nodeModulesPath,
      arch === Arch.arm64 ? ['linux-arm64-gnu', 'linux-arm64-musl'] : ['linux-x64-gnu', 'linux-x64-musl']
    )
  }
}

function keepLibsqlNodeModules(modulePath, arch) {
  const dirs = fs.readdirSync(modulePath)
  dirs
    .filter((dir) => !arch.includes(dir))
    .forEach((dir) => {
      fs.rmSync(path.join(modulePath, dir), { recursive: true, force: true })
      console.log(`Removed dir: ${dir}`, arch)
    })
}
