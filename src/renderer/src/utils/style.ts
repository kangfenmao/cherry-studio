type ClassValue = string | number | boolean | undefined | null | ClassDictionary | ClassArray

interface ClassDictionary {
  [id: string]: any
}

interface ClassArray extends Array<ClassValue> {}

// Example:
// classNames('foo', 'bar'); // => 'foo bar'
// classNames('foo', { bar: true }); // => 'foo bar'
// classNames({ foo: true, bar: false }); // => 'foo'
// classNames(['foo', 'bar']); // => 'foo bar'
// classNames('foo', null, 'bar'); // => 'foo bar'
// classNames({ message: true, 'message-assistant': true }); // => 'message message-assistant'

/**
 * 生成 class 字符串
 * @param args
 * @returns
 */
export function classNames(...args: ClassValue[]): string {
  const classes: string[] = []

  args.forEach((arg) => {
    if (!arg) return

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg.toString())
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg)
      if (inner) {
        classes.push(inner)
      }
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          classes.push(key)
        }
      })
    }
  })

  return classes.filter(Boolean).join(' ')
}
