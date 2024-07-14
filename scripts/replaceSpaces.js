// replaceSpaces.js

const fs = require('fs')
const path = require('path')

const directory = 'dist'

fs.readdir(directory, (err, files) => {
  if (err) throw err

  files.forEach((file) => {
    const oldPath = path.join(directory, file)
    const newPath = path.join(directory, file.replace(/ /g, '-'))

    fs.stat(oldPath, (err, stats) => {
      if (err) throw err

      if (stats.isFile() && oldPath !== newPath) {
        fs.rename(oldPath, newPath, (err) => {
          if (err) throw err
          console.log(`Renamed: ${oldPath} -> ${newPath}`)
        })
      }
    })
  })
})
