const { downloadNpmPackage } = require('./utils')

async function downloadNpm(platform) {
  if (!platform || platform === 'darwin') {
    downloadNpmPackage('@libsql', '0.4.7', 'darwin', ['arm64', 'x64'])
  }

  if (!platform || platform === 'linux') {
    downloadNpmPackage('@libsql', '0.4.7', 'linux', ['arm64-gnu', 'x64-gnu'])
  }
}

const platformArg = process.argv[2]
downloadNpm(platformArg)
