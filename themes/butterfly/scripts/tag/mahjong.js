/**
 * mahjong.js
 * Hexo tag to render mahjong tiles from a compact string.
 */

'use strict'

const BLANK = "<img class=\"blank-tile\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E\">"

const loadPngs = () => {
  const BASE = 'https://fastly.jsdelivr.net/gh/windshadow233/Riichi-Calculator/static/png'
  const pngs = {}
  for (let i = 0; i < 9; i++) pngs[i] = `${BASE}/${i + 1}man.png`
  pngs[-1] = `${BASE}/akaman.png`
  for (let i = 10; i < 19; i++) pngs[i] = `${BASE}/${i - 9}pin.png`
  pngs[9] = `${BASE}/akapin.png`
  for (let i = 20; i < 29; i++) pngs[i] = `${BASE}/${i - 19}sou.png`
  pngs[19] = `${BASE}/akasou.png`
  pngs[30] = `${BASE}/tan.png`
  pngs[40] = `${BASE}/nan.png`
  pngs[50] = `${BASE}/xia.png`
  pngs[60] = `${BASE}/pei.png`
  pngs[70] = `${BASE}/haku.png`
  pngs[80] = `${BASE}/hatsu.png`
  pngs[90] = `${BASE}/chun.png`
  pngs[-2] = `${BASE}/back.png`
  return pngs
}

const pngs = loadPngs()

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
