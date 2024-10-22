function check(data: any, type: string) {
  return Object.prototype.toString.call(data) === `[object ${type}]`
}

function parseData(data: any) {
  if (!check(data, 'String'))
    return data
  try {
    if (data === 'undefined')
      return null
    return JSON.parse(data || '{}')
  }
  catch (e) {
    return data || {}
  }
}

function parseToReg(pattern: string | RegExp) {
  return new RegExp(pattern)
}

function joinToStr(arr: any, joinStr: string = '_', filter: boolean = true) {
  if (!Array.isArray(arr)) {
    return JSON.stringify(arr) || ''
  }
  if (filter) {
    arr = arr.filter(Boolean)
  }
  return arr.join(joinStr)
}

interface TSetByKeyArrOpt {
  expired?: number
  joinStr?: string
  filter?: boolean
}

export default class StorageToolInstance {
  readonly store: Storage

  constructor(storage: Storage) {
    this.store = storage
  }

  _get(keys?: string | string[]): any {
    const keysArray = !keys ? this.keys() : Array.isArray(keys) ? keys : [keys]
    return keysArray.reduce((acc, key) => {
      return {
        ...acc,
        [key]: parseData(this.store.getItem(key) ?? null),
      }
    }, {})
  }

  _set(data: { [key: string]: any }): void {
    Object.keys(data).forEach((key) => {
      const val = data[key]
      if (check(val, 'Undefined')) {
        return
      }
      this.store.setItem(key, JSON.stringify(data[key]))
    })
  }

  keys(): string[] {
    return Object.keys(this.store)
  }

  set(key: string, value: any, expireDate?: number): void {
    const data: { [key: string]: any } = { [key]: value }
    if (expireDate) {
      data[`${key}_expire`] = Date.now() + expireDate * 864e5
    }
    this._set(data)
  }

  setByArrKey(arrKey: string[], value: any, opt: TSetByKeyArrOpt = {}): void {
    const { expired, joinStr = '_', filter = true } = opt || {}
    this.set(joinToStr(arrKey, joinStr, filter), value, expired)
  }

  get(key?: string): any {
    if (!key) {
      return this._get()
    }
    const item = this._get([key, `${key}_expire`])
    return item[key] ?? null
  }

  getByStrict(key?: string): any {
    if (!key) {
      this.cleanAllExpireData()
      return this._get()
    }

    const item = this._get([key, `${key}_expire`])
    const expireDate = item[`${key}_expire`]
    if (expireDate && Date.now() >= Number(expireDate)) {
      this.remove(key)
      return null
    }
    return item[key] ?? null
  }

  findByReg(pattern: string | RegExp, mode: 'keys' | 'values' | 'entries' | 'one' = 'keys'): any {
    const data = this._get()
    const new_pattern = parseToReg(pattern)
    const keys = Object.keys(data).filter(key => new_pattern.test(key))

    switch (mode) {
      case 'values':
        return keys.map(key => data[key])
      case 'entries':
        return keys.reduce((acc, key) => ({ ...acc, [key]: data[key] }), {})
      case 'one': {
        const key = keys[0]
        return key ? data[key] : null
      }
      default:
        return keys
    }
  }

  remove(key: string): void {
    this.store.removeItem(key)
    this.store.removeItem(`${key}_expire`)
  }

  removeByKeys(keys: string[]): void {
    if (!keys.length)
      return
    keys.forEach((key) => {
      this.remove(key)
    })
  }

  removeAll(): void {
    this.store.clear()
  }

  removeByReg(pattern: string | RegExp): void {
    const keys: string[] = this.findByReg(pattern)
    this.removeByKeys(keys)
  }

  cleanAllExpireData(): void {
    const expiredObject = this.findByReg(/.*_expire/, 'entries')
    const needRemoveKeys = Object.entries(expiredObject)
      .filter(([, expired]) => Date.now() >= Number(expired))
      .map(([k]) => k.replace('_expire', ''))

    this.removeByKeys(needRemoveKeys)
  }
}
