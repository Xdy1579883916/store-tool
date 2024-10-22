# store-tool 库文档

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

## 概述
`store-tool` 是一个 TypeScript 编写的库，旨在提供一个封装类，用于操作支持 `Storage API` 的实例。
- 支持
    - 浏览器的 localStorage 和 sessionStorage。
    - Node 环境，请确保你传入的实例支持 `Storage API`。

## 安装
```bash
npm install store-tool
```

## 快速开始
- 如果你对测试案例感兴趣，可直接查看 [测试文件](test/index.test.ts), 测试用例中包含了大量示例，使用 node-localstorage 模拟 localStorage。
- 以下是如何在你的项目中使用 `StorageToolInstance` 的基本示例：

```typescript
import StorageToolInstance from 'store-tool'
// 注意这里是浏览器环境的 localStorage
const local = new StorageToolInstance(localStorage)

// 不传键，获取所有数据
local.get()

// 设置数据
local.set('key', 'value')

// 获取数据
local.get('key')

// 删除数据
local.remove('key')

// 获取数据
local.get('key') // null

// 设置值2秒后过期
local.set('name', '张三', (1 / 24 / 60 / 60) * 2)
// 获取数据使用 get 时 任然可以获取到数据，哪怕数据已经过期，只要存在 sotre 就可以获取到数据
local.get('name')
// 获取数据使用 getByStrict 时 数据已经过期了，数据将会被删除, 返回 null
local.getByStrict('name')

// 清除所有过期数据
local.cleanAllExpireData()
```

## StorageToolInstance 类 API 文档

## 构造函数
### `constructor(storage: Storage)`
- **参数**:
    - `storage`: `Storage` - 要操作的存储对象，可以是 `localStorage` 或 `sessionStorage`。
- **描述**: 构造函数用于初始化 `StorageToolInstance` 实例，传入一个存储对象。

## 方法
### `_get(keys?: string | string[]): any`
- **参数**:
    - `keys`: `string | string[]` - 可选，指定要获取的键名或键名数组。
- **返回**: 根据键名获取存储中的数据, 解析时会忽略字符串形式的`undefined`值。

### `_set(data: { [key: string]: any }): void`
- **参数**:
    - `data`: `Object` - 要设置的数据对象。
- **描述**: 设置存储中的数据，如果数据值为 `undefined` 则忽略。

### `keys(): string[]`
- **返回**: 存储中所有的键名数组。

### `set(key: string, value: any, expireDate?: number): void`
- **参数**:
    - `key`: `string` - 要设置的键名。
    - `value`: `any` - 要设置的值。
    - `expireDate`: `number` - 可选，设置数据的过期时间（单位：天）。
- **描述**: 设置存储中的数据，并可选地设置过期时间。

### `setByArrKey(arrKey: string[], value: any, opt: TSetByKeyArrOpt = {}): void`
- **参数**:
    - `arrKey`: `string[]` - 键名数组，将被连接成一个字符串作为键名。
    - `value`: `any` - 要设置的值。
    - `opt`: `TSetByKeyArrOpt` - 选项对象，包含 `expired`, `joinStr`, `filter`。
- **TSetByKeyArrOpt**:
    - `expired`: `number` - 设置数据的过期时间（单位：天）。
    - `joinStr`: `string` - 数组键名连接时使用的分隔符，默认为 `_`。
    - `filter`: `boolean` - 是否过滤数组中的 `falsey` 值，默认为 `true`。
- **描述**: 根据数组键名设置存储中的数据，并应用选项。

### `get(key?: string): any`
- **参数**:
    - `key`: `string` - 可选，指定要获取的键名。
- **返回**: 获取存储中的数据，如果未指定键名，则返回所有数据。

### `getByStrict(key?: string): any`
- **参数**:
    - `key`: `string` - 可选，指定要严格获取的键名。
- **返回**: 严格模式下获取存储中的数据，会检查数据的过期时间。

### `findByReg(pattern: string | RegExp, mode: "keys" | "values" | "entries" | "one" = "keys"): any`
- **参数**:
    - `pattern`: `string | RegExp` - 正则表达式或字符串模式，用于匹配键名。
    - `mode`: `"keys" | "values" | "entries" | "one"` - 返回模式，可以是键名、值、键值对或单个匹配项。
- **返回**: 根据正则表达式查询存储中的数据。

### `remove(key: string): void`
- **参数**:
    - `key`: `string` - 要删除的键名。
- **描述**: 删除存储中的指定键名及其过期时间数据。

### `removeByKeys(keys: string[]): void`
- **参数**:
    - `keys`: `string[]` - 要删除的键名数组。
- **描述**: 根据键名数组删除存储中的数据。

### `removeAll(): void`
- **描述**: 清空存储中的所有数据。

### `removeByReg(pattern: string | RegExp): void`
- **参数**:
    - `pattern`: `RegExp` - 正则表达式，用于匹配要删除的键名。
- **描述**: 根据正则表达式删除存储中的数据。

### `cleanAllExpireData(): void`
- **描述**: 清理所有已过期的数据。

## 注意事项
- 请确保在使用 `StorageToolInstance` 时，传入的 `storage` 实例实现了 `Storage` 接口。
- 过期时间单位是天
- 希望这份文档能帮助你更好地理解和使用 `StorageToolInstance` 库。如果你有任何疑问或需要进一步的帮助，请随时联系我。

## 贡献
如果你有任何建议或想要贡献代码，请提交 Pull Request 或创建 Issue。

## License

[MIT](./LICENSE) License © 2024-PRESENT [XiaDeYu](https://github.com/Xdy1579883916)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/store-tool?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/store-tool
[npm-downloads-src]: https://img.shields.io/npm/dm/store-tool?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/store-tool
[bundle-src]: https://img.shields.io/bundlephobia/minzip/store-tool?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=store-tool
[license-src]: https://img.shields.io/github/license/Xdy1579883916/store-tool.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Xdy1579883916/store-tool/blob/main/LICENSE
