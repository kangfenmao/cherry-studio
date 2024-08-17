/**
 * 将 JavaScript 对象转换为 URL 查询参数字符串
 * @param obj - 要转换的对象
 * @param options - 配置选项
 * @returns 转换后的查询参数字符串
 */
export function objectToQueryParams(
  obj: Record<string, string | number | boolean | null | undefined | object>,
  options: {
    skipNull?: boolean
    skipUndefined?: boolean
  } = {}
): string {
  const { skipNull = false, skipUndefined = false } = options

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(obj)) {
    if (skipNull && value === null) continue
    if (skipUndefined && value === undefined) continue

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)))
    } else if (typeof value === 'object' && value !== null) {
      params.append(key, JSON.stringify(value))
    } else if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }

  return params.toString()
}
