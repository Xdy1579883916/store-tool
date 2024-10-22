import { LocalStorage } from 'node-localstorage'

import { expect, it } from 'vitest'
import StorageToolInstance from '../src'

const localstorage = new LocalStorage('./local')

const local = new StorageToolInstance(localstorage)

function sleep(time: number) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      timer && clearTimeout(timer)
      resolve(null)
    }, time * 1000)
  })
}

function initData() {
  localstorage.setItem('data1', 'data1')
  localstorage.setItem('abc', '123')
}

it('初始化', () => {
  local.store.clear()
  initData()
  expect(local.keys().length).toEqual(2)
})
it('设置值, 获取值', async () => {
  local.set('name', '张三')
  expect(local.getByStrict('name')).toEqual('张三')
})
it('设置可过期的值, 获取值', async () => {
  // 设置值2秒后过期
  local.set('name2', '张三', (1 / 24 / 60 / 60) * 2)
  // 此时获取应该没有过期
  await sleep(1)
  expect(local.getByStrict('name2')).toEqual('张三')

  // 此时应该过期了
  await sleep(1.1)
  expect(local.getByStrict('name2')).toEqual(null)
})
it('删除多个key', async () => {
  local.removeByKeys(['abc', 'data1', 'name'])
  expect(local.keys().length).toEqual(0)
})
it('设置可过期的值, 并删除', async () => {
  local.set('data1', 'data1', 1)
  local.set('data2', 'data2', 1)
  local.set('data3', 'data3', 1)
  expect(local.keys().length).toEqual(6)
  await sleep(2)
  local.getByStrict('')
  expect(local.keys().length).toEqual(6)
  local.removeByKeys(['data1', 'data2', 'data3'])
  expect(local.keys().length).toEqual(0)
})
it('设置正则表达式获取数据', async () => {
  local.set('key1', 'data1')
  local.set('key2', 'data2')
  local.set('key3', 'data3')
  const keys = local.findByReg(/key.*/, 'keys')
  expect(Object.prototype.toString.call(keys)).toBe('[object Array]')
  expect(keys.length).toEqual(3)
  const keys2 = local.findByReg(/key.*/, 'keys')
  expect(keys2.length).toEqual(3)
  expect(keys2).toEqual(keys)

  const values = local.findByReg(/key.*/, 'values')
  const values2 = local.findByReg('key.*', 'values')
  expect(Object.prototype.toString.call(values)).toBe('[object Array]')
  expect(values.length).toEqual(3)
  expect(values).includes('data1')
  expect(values).includes('data2')
  expect(values).includes('data3')
  expect(values2).toEqual(values)

  const entries = local.findByReg(/key.*/, 'entries')
  expect(entries).toBeTypeOf('object')
  expect(Object.prototype.toString.call(entries)).toBe('[object Object]')
  expect(entries).haveOwnProperty('key1')
  expect(entries).haveOwnProperty('key2')
  expect(entries).haveOwnProperty('key3')

  local.removeByKeys(keys)
  expect(local.keys().length).toEqual(0)
})
it('设置可过期的值, 获取值 2.0', async () => {
  // 设置值2秒后过期
  local.set('name1', '张三1', (1 / 24 / 60 / 60) * 2)
  local.set('name2', '张三2', (1 / 24 / 60 / 60) * 2)
  // 此时获取应该没有过期
  await sleep(1)
  expect(local.getByStrict('name1')).toEqual('张三1')
  expect(local.getByStrict('name2')).toEqual('张三2')

  await sleep(1.1)
  // 此时1、2应该都过期了, 所有过期的值都被清理
  // getByStrict 会自动删除过期值
  expect(local.getByStrict('name1')).toEqual(null)
  // get 可以获取过期的值, 可以调用cleanAllExpireData主动清理所有过期值
  local.cleanAllExpireData()
  expect(local.get('name2')).toEqual(null)
  expect(Object.entries(local._get()).length).toEqual(0)
})
it('undefined value', async () => {
  // 应无法主动设置undefined值
  local.set('undefined', undefined)
  expect(local.get('undefined')).toEqual(null)

  // 使用原生方式设置undefined值，这显然会造成意外情况，但是通过get应该任然获取不到数据，除非使用原生方式获取
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  local.store.setItem('undefined', undefined)
  expect(local.store.getItem('undefined')).toEqual('undefined')
  expect(local.get('undefined')).toEqual(null)
})
it('假值 value 应原样返回', async () => {
  local.set('t-0', 0)
  expect(local.get('t-0')).toEqual(0)
  expect(local.getByStrict('t-0')).toEqual(0)

  local.set('t-false', false)
  expect(local.get('t-false')).toEqual(false)
  expect(local.getByStrict('t-false')).toEqual(false)

  local.set('t-empty', '')
  expect(local.get('t-empty')).toEqual('')
  expect(local.getByStrict('t-empty')).toEqual('')

  local.set('t-undefined', undefined)
  expect(local.get('t-undefined')).toEqual(null)
  expect(local.getByStrict('t-undefined')).toEqual(null)

  expect(local.findByReg('t-*', 'entries')).toMatchInlineSnapshot(`
    {
      "t-0": 0,
      "t-empty": "",
      "t-false": false,
    }
  `)
})
