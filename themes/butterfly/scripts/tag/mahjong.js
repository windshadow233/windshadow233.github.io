/**
 * mahjong.js
 * Hexo tag to render mahjong tiles from a compact string.
 */

'use strict'

const BLANK = "<img class=\"blank-tile\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E\">"

const pngs = {
  // 万子
  0: "https://cdn4.winhlb.com/2026/03/07/69ab03abd718c.png", // 1万
  1: "https://cdn4.winhlb.com/2026/03/07/69ab03ac073cc.png", // 2万
  2: "https://cdn4.winhlb.com/2026/03/07/69ab03ac1c0a4.png", // 3万
  3: "https://cdn4.winhlb.com/2026/03/07/69ab03abe3b85.png", // 4万
  4: "https://cdn4.winhlb.com/2026/03/07/69ab03abef2ef.png", // 5万
  5: "https://cdn4.winhlb.com/2026/03/07/69ab03bd8bc5e.png", // 6万
  6: "https://cdn4.winhlb.com/2026/03/07/69ab03bd9c9e7.png", // 7万
  7: "https://cdn4.winhlb.com/2026/03/07/69ab03bde1112.png", // 8万
  8: "https://cdn4.winhlb.com/2026/03/07/69ab03bde23ec.png", // 9万
  [-1]: "https://cdn4.winhlb.com/2026/03/07/69ab03bd8730f.png", // 赤万子

  // 饼子
  10: "https://cdn4.winhlb.com/2026/03/07/69ab03ea7d0c6.png", // 1饼
  11: "https://cdn4.winhlb.com/2026/03/07/69ab03ea9578c.png", // 2饼
  12: "https://cdn4.winhlb.com/2026/03/07/69ab04348ab2a.png", // 3饼
  13: "https://cdn4.winhlb.com/2026/03/07/69ab0411d3c98.png", // 4饼
  14: "https://cdn4.winhlb.com/2026/03/07/69ab0411b9d18.png", // 5饼
  15: "https://cdn4.winhlb.com/2026/03/07/69ab04481d697.png", // 6饼
  16: "https://cdn4.winhlb.com/2026/03/07/69ab045fdbb0b.png", // 7饼
  17: "https://cdn4.winhlb.com/2026/03/07/69ab045fd5e01.png", // 8饼
  18: "https://cdn4.winhlb.com/2026/03/07/69ab044822edd.png", // 9饼
  9: "https://cdn4.winhlb.com/2026/03/07/69ab04765b626.png", // 赤饼子

  // 索子
  20: "https://cdn4.winhlb.com/2026/03/07/69ab09e36c67e.png", // 1索
  21: "https://cdn4.winhlb.com/2026/03/07/69ab09c125df8.png", // 2索
  22: "https://cdn4.winhlb.com/2026/03/07/69ab09c14432e.png", // 3索
  23: "https://cdn4.winhlb.com/2026/03/07/69ab09c139e08.png", // 4索
  24: "https://cdn4.winhlb.com/2026/03/07/69ab09e36a857.png", // 5索
  25: "https://cdn4.winhlb.com/2026/03/07/69ab0a04a8f52.png", // 6索
  26: "https://cdn4.winhlb.com/2026/03/07/69ab0a04a8fc4.png", // 7索
  27: "https://cdn4.winhlb.com/2026/03/07/69ab0a2a4a3e1.png", // 8索
  28: "https://cdn4.winhlb.com/2026/03/07/69ab0a1e7a28d.png", // 9索
  19: "https://cdn4.winhlb.com/2026/03/07/69ab0a1e7e544.png", // 赤索子

  // 字牌
  30: "https://cdn4.winhlb.com/2026/03/07/69ab0a46d45e7.png", // 东
  40: "https://cdn4.winhlb.com/2026/03/07/69ab0a4c516ff.png", // 南
  50: "https://cdn4.winhlb.com/2026/03/07/69ab0a5157c13.png", // 西
  60: "https://cdn4.winhlb.com/2026/03/07/69ab0a4a540d0.png", // 北
  70: "https://cdn4.winhlb.com/2026/03/07/69ab0a6130a8d.png", // 白
  80: "https://cdn4.winhlb.com/2026/03/07/69ab0a638393a.png", // 发
  90: "https://cdn4.winhlb.com/2026/03/07/69ab0a5d34cca.png", // 中

  // 特殊牌
  [-2]: "https://cdn4.winhlb.com/2026/03/07/69ab0a5f26507.png", // 背面
}

function _str2id (tiles, use_aka = true) {
  let stack = ''
  let m = ''
  let p = ''
  let s = ''
  let z = ''
  for (const c of tiles) {
    if (/[0-9]/.test(c)) {
      let d = c
      if (!use_aka) d = d.replace('0', '5')
      stack += d
    } else if (c === 'm') {
      if (stack === '') throw new Error('输入错误！')
      m += stack
      stack = ''
    } else if (c === 'p') {
      if (stack === '') throw new Error('输入错误！')
      p += stack
      stack = ''
    } else if (c === 's') {
      if (stack === '') throw new Error('输入错误！')
      s += stack
      stack = ''
    } else if (c === 'z') {
      if (stack === '') throw new Error('输入错误！')
      z += stack
      stack = ''
    } else {
      throw new Error('输入错误')
    }
  }
  if (stack !== '') throw new Error('输入错误！')
  // allow '0' in z (used as back tile)
  if (!(/[0-9]*/.test(m + p + s) && /^[0-7]*$/.test(z))) throw new Error('输入错误！')

  const mm = m.split('').filter(Boolean).map(x => parseInt(x, 10) - 1)
  const pp = p.split('').filter(Boolean).map(x => parseInt(x, 10) + 9)
  const ss = s.split('').filter(Boolean).map(x => parseInt(x, 10) + 19)
  const zz = z.split('').filter(Boolean).map(x => {
    if (x === '0') return -2 // 0z -> back tile
    return 10 * (parseInt(x, 10) + 2)
  })
  return mm.concat(pp, ss, zz)
}

function str2id (tiles) {
  // split by spaces: first is hand, rest are called groups
  const parts = tiles.trim().split(/ +/)
  const hand_tiles = _str2id(parts[0])
  const called_tiles = []
  for (let i = 1; i < parts.length; i++) {
    called_tiles.push(_str2id(parts[i]))
  }
  return [hand_tiles, called_tiles]
}

function tileToImg (t) {
  const src = pngs.hasOwnProperty(t) ? pngs[t] : null
  if (!src) return BLANK
  return `<img class=\"mahjong-tile\" src=\"${src}\">`
}

function renderMahjong (tilesStr) {
  if (!tilesStr || tilesStr.trim() === '') return ''
  let hand, called
  try {
    ;[hand, called] = str2id(tilesStr)
  } catch (e) {
    return `<span class=\"mahjong-error\">解析错误: ${e.message}</span>`
  }

  const parts = []
  // hand tiles
  for (const t of hand) parts.push(tileToImg(t))
  // separator between lists
  if (called.length > 0) parts.push(BLANK)
  // each called group, separated by BLANK
  for (let i = 0; i < called.length; i++) {
    const group = called[i]
    for (const t of group) parts.push(tileToImg(t))
    if (i !== called.length - 1) parts.push(BLANK)
  }

  return `<div class=\"mahjong-wrap\"><div class=\"mahjong-inner\">${parts.join('')}</div></div>`
}

const mahjongTag = (args) => {
  const tilesStr = (args && args.length) ? args.join(' ') : ''
  return renderMahjong(tilesStr)
}

hexo.extend.tag.register('mahjong', mahjongTag)
