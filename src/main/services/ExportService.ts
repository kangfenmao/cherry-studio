/* eslint-disable no-case-declarations */
// ExportService

import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, ShadingType, TextRun } from 'docx'
import { dialog } from 'electron'
import Logger from 'electron-log'
import MarkdownIt from 'markdown-it'

import FileStorage from './FileStorage'

export class ExportService {
  private fileManager: FileStorage
  private md: MarkdownIt

  constructor(fileManager: FileStorage) {
    this.fileManager = fileManager
    this.md = new MarkdownIt()
  }

  private convertMarkdownToDocxElements(markdown: string) {
    const tokens = this.md.parse(markdown, {})
    const elements: any[] = []
    let listLevel = 0

    const processInlineTokens = (tokens: any[]): TextRun[] => {
      const runs: TextRun[] = []
      for (const token of tokens) {
        switch (token.type) {
          case 'text':
            runs.push(new TextRun(token.content))
            break
          case 'strong':
            runs.push(new TextRun({ text: token.content, bold: true }))
            break
          case 'em':
            runs.push(new TextRun({ text: token.content, italics: true }))
            break
          case 'code_inline':
            runs.push(new TextRun({ text: token.content, font: 'Consolas', size: 20 }))
            break
        }
      }
      return runs
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      switch (token.type) {
        case 'heading_open':
          // 获取标题级别 (h1 -> h6)
          const level = parseInt(token.tag.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6
          const headingText = tokens[i + 1].content
          elements.push(
            new Paragraph({
              text: headingText,
              heading: HeadingLevel[`HEADING_${level}`],
              spacing: {
                before: 240,
                after: 120
              }
            })
          )
          i += 2 // 跳过内容标记和闭合标记
          break

        case 'paragraph_open':
          const inlineTokens = tokens[i + 1].children || []
          elements.push(
            new Paragraph({
              children: processInlineTokens(inlineTokens),
              spacing: {
                before: 120,
                after: 120
              }
            })
          )
          i += 2
          break

        case 'bullet_list_open':
          listLevel++
          break

        case 'bullet_list_close':
          listLevel--
          break

        case 'list_item_open':
          const itemInlineTokens = tokens[i + 2].children || []
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: '•', bold: true }),
                new TextRun({ text: '\t' }),
                ...processInlineTokens(itemInlineTokens)
              ],
              indent: {
                left: listLevel * 720
              }
            })
          )
          i += 3
          break

        case 'fence': // 代码块
          const codeLines = token.content.split('\n')
          elements.push(
            new Paragraph({
              children: codeLines.map(
                (line) =>
                  new TextRun({
                    text: line + '\n',
                    font: 'Consolas',
                    size: 20,
                    break: 1
                  })
              ),
              shading: {
                type: ShadingType.SOLID,
                color: 'F5F5F5'
              },
              spacing: {
                before: 120,
                after: 120
              },
              border: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' }
              }
            })
          )
          break

        case 'hr':
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: '─'.repeat(50), color: '999999' })],
              alignment: AlignmentType.CENTER
            })
          )
          break

        case 'blockquote_open':
          const quoteText = tokens[i + 2].content
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: quoteText,
                  italics: true
                })
              ],
              indent: {
                left: 720
              },
              border: {
                left: {
                  style: BorderStyle.SINGLE,
                  size: 3,
                  color: 'CCCCCC'
                }
              },
              spacing: {
                before: 120,
                after: 120
              }
            })
          )
          i += 3
          break
      }
    }

    return elements
  }

  public exportToWord = async (_: Electron.IpcMainInvokeEvent, markdown: string, fileName: string): Promise<void> => {
    try {
      const elements = this.convertMarkdownToDocxElements(markdown)

      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: 'Normal',
              name: 'Normal',
              run: {
                size: 24,
                font: 'Arial'
              }
            }
          ]
        },
        sections: [
          {
            properties: {},
            children: elements
          }
        ]
      })

      const buffer = await Packer.toBuffer(doc)

      const filePath = dialog.showSaveDialogSync({
        title: '保存文件',
        filters: [{ name: 'Word Document', extensions: ['docx'] }],
        defaultPath: fileName
      })

      if (filePath) {
        await this.fileManager.writeFile(_, filePath, buffer)
        Logger.info('[ExportService] Document exported successfully')
      }
    } catch (error) {
      Logger.error('[ExportService] Export to Word failed:', error)
      throw error
    }
  }
}
