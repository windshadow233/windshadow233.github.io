/**
 * mahjong.js
 * Hexo tag to render mahjong tiles from a compact string.
 */

'use strict'

const BLANK = "<img class=\"blank-tile\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E\">"

const PNG_KEYS = [
  // 万子
  0,1,2,3,4,5,6,7,8,-1,
  // 饼子
  10,11,12,13,14,15,16,17,18,9,
  // 索子
  20,21,22,23,24,25,26,27,28,19,
  // 字牌
  30,40,50,60,70,80,90,
  // 特殊
  -2
]

const imageURLs = 
`https://pic.sl.al/gdrive/pic/2026-04-08/fileid_13Ml7kUgPHkVnlIubvQZWFnGxxxqqa0zy_1man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1OzKuJ1axvOfj2Yw6E_o_V3NJxxM70XYf_2man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1gxUeKE9JIHEL3_MuR1fydbGsySiLggqH_3man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1V82cfeDAiXPvzcpFPEojV92PjsdTogvc_4man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1WU2lJRk6MKjJ-PRiZxEXZbNLzO1OgyNm_5man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1nbySCnS38VrJuFSb83QmiAeJX973w0_F_6man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1Fy-ARC3N_5Lccv-AfKBDUR8VNqC1KJhc_7man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1Ey9qrF-MoijCsFcy2Sjo1XS5Mv7Rig50_8man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1J_k1UGl-3CWn2_5E5FhlOy_mI3Y13q_I_9man.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1n2MXe5eWS0JsjL47inRMI1ZCFpNmMRdJ_akaman.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1K4c__x2sKI4Sm8lpqpH9u3QKHy7Yy9df_1pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1Z7703uYgHoZZVbz3dupS-5UV8HkYILvd_2pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1-OFMkTJYp60LokrIW1MIxtWQ6Q8ODuIw_3pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1-Mk4KXmiIZzKxLKP6-sxAaCafqj-4rvJ_4pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1QhZjQj9zVBhK43IN0YkIKgvBcZOalVLR_5pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1C3KyJuRmpSmy9iZwcUdEy77K6DW78qGc_6pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_15p9dah2fdC4q_x8-g1jJHv05Y7NwhiBm_7pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1e-FBond5JUVbpVHPiGG2f_wpfRzY80cX_8pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1a8BEkbgwHiD7EiRO19ofmjRg5XE2nHT1_9pin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1rhU7abbsMSYoSNPxNz6af-O1F88vcBnR_akapin.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_13RWEHTtPfjPMVBK9ZPInZFFLVAflgE6__1sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_19R75dKU2nh6iQD4wqI0sBSAbOW19de4u_2sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1y7rsvWXcMpnvJZs6JofvDSMQRMX1mnB-_3sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1F9d3EerifcGczlU6HVhxK4RrDzNaUlPV_4sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1XzCguaSswig-5RoLGBk-Ics0r_RaRHpU_5sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1XLUj_SKlJ3_gdOsdkmAG9_kyapiEAB9g_6sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1imCE5UTJgualKwAlbAJy0O4En17fqRt-_7sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1ydkiYAXLL4FAjeO8CKNOIKges6ryU8oa_8sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1WE6PyQKYTGANaHIicZnIX-9jpnieT7AY_9sou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1huY5q_pAbsmQCPB3zajyWdrWyxB8CSAT_akasou.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1b75TcEdh1xo8nrkUsOFt4wsJwO6ngOHF_tan.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_17VGbN60ebC6i4ioqW549thsxaxZ-cJsn_nan.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1iAKx6sKyBOAN217FKH-y1b6VyygPSMFo_xia.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1N4k1CdDfo_7xOw12iblPKISsB-cN9C83_pei.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1uXNsAiK0uGTIE8ckYXHF4_1sbrd_wpZ7_haku.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1CMyQL8LizayKDJd2k1FJB61O2ZxeKL1Y_hatsu.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_1mi0PEvNCGVQcY0-A5GrkkJnDCb5yX8NZ_chun.png
https://pic.sl.al/gdrive/pic/2026-04-08/fileid_11DeV_Dw3m2JGke34Yzyuneia7mA7036w_back.png`.split('\n')

const pngs = {}
for (let i = 0; i < imageURLs.length; i++) {
  let url = imageURLs[i]
  pngs[PNG_KEYS[i]] = url
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
