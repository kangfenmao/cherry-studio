import * as crypto from 'crypto'

// 定义密钥和初始化向量（IV）
const secretKey = 'kDQvWz5slot3syfucoo53X6KKsEUJoeFikpiUWRJTLIo3zcUPpFvEa009kK13KCr'
const iv = Buffer.from('Cherry Studio', 'hex')

// 加密函数
export function encrypt(text: string): { iv: string; encryptedData: string } {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  }
}

// 解密函数
export function decrypt(encryptedData: string, iv: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), Buffer.from(iv, 'hex'))
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
