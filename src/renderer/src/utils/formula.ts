export function escapeDollarNumber(text: string) {
  let escapedText = ''

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i]
    const nextChar = text[i + 1] || ' '

    if (char === '$' && nextChar >= '0' && nextChar <= '9') {
      char = '\\$'
    }

    escapedText += char
  }

  return escapedText
}

export function escapeBrackets(text: string) {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock) {
      return codeBlock
    } else if (squareBracket) {
      return `
$$
${squareBracket}
$$
`
    } else if (roundBracket) {
      return `$${roundBracket}$`
    }
    return match
  })
}

export function extractTitle(html: string): string | null {
  const titleRegex = /<title>(.*?)<\/title>/i
  const match = html.match(titleRegex)

  if (match && match[1]) {
    return match[1].trim()
  }

  return null
}

export function addPlaintextToCodeBlock(markdown: string): string {
  // 修改正则表达式以匹配代码块的开始和结束，包括前后的换行符
  const codeBlockRegex = /(^|\n)```([\w]*)\n([\s\S]*?)\n```/g

  return markdown.replace(codeBlockRegex, (match, newline, language, code) => {
    // 如果没有指定语言，使用 text
    if (!language) {
      return `${newline}\`\`\`text\n${code}\n\`\`\``
    }
    // 如果指定了语言，保持原样
    return match
  })
}
