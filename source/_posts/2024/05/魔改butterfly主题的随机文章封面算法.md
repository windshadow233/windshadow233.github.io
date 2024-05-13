---
title: 魔改Butterfly主题的随机文章封面算法
disableNunjucks: false
mathjax: false
id: 11701
date: 2024-05-22 22:21:17
categories:
  - [博客相关]
  - [Hexo魔改]
tags:
  - Hexo
  - Butterfly主题
  - JavaScript
  - NodeJS
cover:
---

Butterfly主题拥有为没有指定封面的文章随机封面的功能，只需在配置文件里定义一个默认封面的列表，主题就会在编译时为没有封面的文章随机指派一张列表中的图片作为其封面。

不过默认的随机算法是直接调用了JavaScript的`Math.random`，同一篇文章在每次部署时随机到的封面都不相同，虽然这也没什么问题，但我希望每篇文章随机到的封面是唯一确定的。这一需求可以通过修改随机算法进行实现。

---

Butterfly主题的随机封面功能位于文件`themes/butterfly/scripts/filters/random_cover.js`

由于JavaScript的`Math.random`并不支持`seed`，所以只能另辟蹊径来实现一个随机算法。在Stack Overflow上找到一个实现：

{% link Seeding the random number generator in javascript,Stack Overflow,https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316 %}

直接拿来主义！修改上面提到的文件：

```diff
--- a/themes/butterfly/scripts/filters/random_cover.js      2024-05-13 15:20:58
+++ b/themes/butterfly/scripts/filters/random_cover.js      2024-05-23 23:33:30
@@ -5,6 +5,45 @@
 
 'use strict'
 
+const cyrb128 = (str) => {
+  let h1 = 1779033703, h2 = 3144134277,
+      h3 = 1013904242, h4 = 2773480762;
+  for (let i = 0, k; i < str.length; i++) {
+      k = str.charCodeAt(i);
+      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
+      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
+      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
+      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
+  }
+  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
+  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
+  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
+  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
+  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
+  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
+}
+
+const sfc32 = (a, b, c, d) => {
+  return function() {
+    a |= 0; b |= 0; c |= 0; d |= 0;
+    let t = (a + b | 0) + d | 0;
+    d = d + 1 | 0;
+    a = b ^ b >>> 9;
+    b = c + (c << 3) | 0;
+    c = (c << 21 | c >>> 11);
+    c = c + t | 0;
+    return (t >>> 0) / 4294967296;
+  }
+}
+
+ const getRand = (str) => {
+  // Create cyrb128 state:
+  var seed = cyrb128(str);
+  // Four 32-bit component hashes provide the seed for sfc32.
+  var rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
+  return rand;
+ }
+
 hexo.extend.filter.register('before_post_render', data => {
   const imgTestReg = /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i
   let { cover: coverVal, top_img: topImg } = data
@@ -16,10 +55,12 @@
   }
 
   const randomCoverFn = () => {
+    // use title to seed random generator
+    const rand = getRand(data.title)
     const { cover: { default_cover: defaultCover } } = hexo.theme.config
     if (!defaultCover) return false
     if (!Array.isArray(defaultCover)) return defaultCover
-    const num = Math.floor(Math.random() * defaultCover.length)
+    const num = Math.floor(rand() * defaultCover.length)
     return defaultCover[num]
   }
```

`const rand = getRand(data.title)`意为使用文章的标题作为随机函数的种子，然后将原来的`Math.random`替换为了指定了种子的`rand`函数，这样即可让每篇文章的随机封面只与标题有关，而又不失伪随机性。
