const fs = require('fs')
const path = require('path')
const os = require('os')

function downloadNpmPackage(package, version, platform, architectures = ['x64', 'arm64']) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-download-'))

  for (const arch of architectures) {
    const targetDir = path.join('./node_modules/', package, `${platform}-${arch}`)

    // Skip if directory already exists
    if (fs.existsSync(targetDir)) {
      console.log(`${targetDir} already exists, skipping download...`)
      continue
    }

    const filename = path.join(tempDir, `${platform}-${arch}-${version}.tgz`)
    const url = `https://registry.npmjs.org/${package}/${platform}-${arch}/-/${platform}-${arch}-${version}.tgz`

    try {
      console.log(`Downloading ${filename}...`, url)
      const { execSync } = require('child_process')
      execSync(`curl --fail -o ${filename} ${url}`)

      console.log(`Extracting ${filename}...`)
      execSync(`tar -xvf ${filename}`)
      execSync(`rm -rf ${filename}`)
      execSync(`mv package ${targetDir}`)
    } catch (error) {
      console.error(`Error processing ${filename}: ${error.message}`)
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }
      throw error
    }
  }

  fs.rmSync(tempDir, { recursive: true, force: true })
}

module.exports = {
  downloadNpmPackage
}
