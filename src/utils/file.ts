import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * 获取用户下载目录路径
 */
export function getDownloadsPath(): string {
  return path.join(os.homedir(), 'Downloads')
}

/**
 * 读取下载目录中的文件
 * @param filename 文件名
 * @returns 文件内容
 */
export function readFileFromDownloads(filename: string): string {
  const downloadsPath = getDownloadsPath()
  const filePath = path.join(downloadsPath, filename)

  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`)
    }

    // 检查是否是文件而不是目录
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      throw new Error(`${filename} is a directory, not a file`)
    }

    // 读取文件内容
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error reading file: ${error.message}`)
    }
    throw error
  }
}

/**
 * 列出下载目录中的所有文件
 * @returns 文件名列表
 */
export function listDownloadsFiles(): string[] {
  const downloadsPath = getDownloadsPath()

  try {
    return fs.readdirSync(downloadsPath)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error listing downloads directory: ${error.message}`)
    }
    throw error
  }
}
