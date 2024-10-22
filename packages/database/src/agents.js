const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')

// 连接到数据库
const db = new sqlite3.Database('./data/CherryStudio.sqlite3', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message)
    return
  }
  console.log('Connected to the database.')
})

// 查询数据并转换为JSON
db.all('SELECT * FROM agents', [], (err, rows) => {
  if (err) {
    console.error('Error querying the database:', err.message)
    return
  }

  // 将 ID 类型转换为字符串
  for (const row of rows) {
    row.id = row.id.toString()
  }

  // 将查询结果转换为JSON字符串
  const jsonData = JSON.stringify(rows, null, 2)

  // 将JSON数据写入文件
  fs.writeFile('../../src/renderer/src/config/agents.json', jsonData, (err) => {
    if (err) {
      console.error('Error writing to file:', err.message)
      return
    }
    console.log('Data has been written to agents.json')
  })

  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message)
      return
    }
    console.log('Database connection closed.')
  })
})
