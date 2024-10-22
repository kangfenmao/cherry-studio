const fs = require('fs')
const csv = require('csv-parser')
const sqlite3 = require('sqlite3').verbose()

// 连接到 SQLite 数据库
const db = new sqlite3.Database('./data/CherryStudio.sqlite3', (err) => {
  if (err) {
    console.error('Error opening database', err)
    return
  }
  console.log('Connected to the SQLite database.')
})

// 创建一个数组来存储 CSV 数据
const results = []

// 读取 CSV 文件
fs.createReadStream('./data/data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // 准备 SQL 插入语句，使用 INSERT OR IGNORE
    const stmt = db.prepare('INSERT OR IGNORE INTO emails (email, github, sent) VALUES (?, ?, ?)')

    // 插入每一行数据
    let inserted = 0
    let skipped = 0
    let emptyEmail = 0

    db.serialize(() => {
      // 开始一个事务以提高性能
      db.run('BEGIN TRANSACTION')

      results.forEach((row) => {
        // 检查 email 是否为空
        if (!row.email || row.email.trim() === '') {
          emptyEmail++
          return // 跳过这一行
        }

        stmt.run(row.email, row['user-href'], 0, function (err) {
          if (err) {
            console.error('Error inserting row', err)
          } else {
            if (this.changes === 1) {
              inserted++
            } else {
              skipped++
            }
          }
        })
      })

      // 提交事务
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction', err)
        } else {
          console.log(
            `Insertion complete. Inserted: ${inserted}, Skipped (duplicate): ${skipped}, Skipped (empty email): ${emptyEmail}`
          )
        }

        // 完成插入
        stmt.finalize()

        // 关闭数据库连接
        db.close((err) => {
          if (err) {
            console.error('Error closing database', err)
          } else {
            console.log('Database connection closed.')
          }
        })
      })
    })
  })
