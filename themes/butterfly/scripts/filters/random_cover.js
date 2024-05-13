/**
 * Butterfly
 * ramdom cover
 */

'use strict'

const cyrb128 = (str) => {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

const sfc32 = (a, b, c, d) => {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

 const getRand = (str) => {
  // Create cyrb128 state:
  var seed = cyrb128(str);
  // Four 32-bit component hashes provide the seed for sfc32.
  var rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
  return rand;
 }

hexo.extend.filter.register('before_post_render', data => {
  const imgTestReg = /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i
  let { cover: coverVal, top_img: topImg } = data

  // Add path to top_img and cover if post_asset_folder is enabled
  if (hexo.config.post_asset_folder) {
    if (topImg && topImg.indexOf('/') === -1 && imgTestReg.test(topImg)) data.top_img = `${data.path}${topImg}`
    if (coverVal && coverVal.indexOf('/') === -1 && imgTestReg.test(coverVal)) data.cover = `${data.path}${coverVal}`
  }

  const randomCoverFn = () => {
    // use title to seed random generator
    const rand = getRand(data.title)
    const { cover: { default_cover: defaultCover } } = hexo.theme.config
    if (!defaultCover) return false
    if (!Array.isArray(defaultCover)) return defaultCover
    const num = Math.floor(rand() * defaultCover.length)
    return defaultCover[num]
  }

  if (coverVal === false) return data

  // If cover is not set, use random cover
  if (!coverVal) {
    const randomCover = randomCoverFn()
    data.cover = randomCover
    coverVal = randomCover // update coverVal
  }

  if (coverVal && (coverVal.indexOf('//') !== -1 || imgTestReg.test(coverVal))) {
    data.cover_type = 'img'
  }

  return data
})
