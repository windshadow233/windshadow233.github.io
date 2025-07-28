'use strict'

const { stripHTML, escapeHTML, prettyUrls } = require('hexo-util')
const crypto = require('crypto')

hexo.extend.helper.register('page_description', function () {
  const { config, page } = this
  let description = page.description || page.content || page.title || config.description

  if (description) {
    description = escapeHTML(stripHTML(description).substring(0, 150)
      .trim()
    ).replace(/\n/g, ' ')
    return description
  }
})

hexo.extend.helper.register('cloudTags', function (options = {}) {
  const env = this
  let {
    source,
    limit = 30,
    fixSize = false,
    randomColor = false,
    orderby = 'random',
    order = -1
  } = options

  const tagList = source.map(tag => ({
    name: tag.name,
    path: env.url_for(tag.path),
    length: tag.length
  }))

  return `
    <div id="cloud-tags"
         data-tags='${JSON.stringify(tagList)}'
         data-limit='${limit}'
         data-fix-size='${fixSize}'
         data-random-color='${randomColor}'
         data-orderby='${orderby}'
         data-order='${order}'>
    </div>
    <script>
      $(document).ready(function () {
        const container = document.getElementById("cloud-tags");
        if (!container) return;

        const tags = JSON.parse(container.dataset.tags);
        const limit = parseInt(container.dataset.limit);
        const fixSize = container.dataset.fixSize === 'true';
        const randomColor = container.dataset.randomColor === 'true';
        const orderby = container.dataset.orderby || 'random';
        const order = parseInt(container.dataset.order) || -1;

        const minFont = 12, maxFont = 24;
        let processed = tags.slice();

        if (orderby === 'random') {
          processed = processed.sort(() => 0.5 - Math.random());
        } else if (orderby === 'name') {
          processed.sort((a, b) => order * a.name.localeCompare(b.name));
        } else if (orderby === 'length') {
          processed.sort((a, b) => order * (a.length - b.length));
        }

        let sampled;
        if (limit !== 0) {
          sampled = processed.slice(0, limit);
        } else {
          sampled = processed;
        }

        const sizes = [...new Set(sampled.map(tag => tag.length))];
        const len = sizes.length - 1;

        sampled.forEach(tag => {
          const ratio = len ? sizes.indexOf(tag.length) / len : 0;
          const size = fixSize ? 12 : (minFont + ((maxFont - minFont) * ratio));

          const r = randomColor ? Math.floor(Math.random() * 101) + 100 : 144;
          const g = randomColor ? Math.floor(Math.random() * 101) + 100 : 144;
          const b = randomColor ? Math.floor(Math.random() * 101) + 100 : 144;

          const a = document.createElement("a");
          a.href = tag.path;
          a.textContent = "#" + tag.name;
          a.style = \`
            font-size: \${size}px;
            color: rgb(\${r}, \${g}, \${b});
            background-color: rgba(\${r}, \${g}, \${b}, 0.15);
            margin: 0 5px 5px 0;
            padding: 2px 6px;
            border-radius: 10px;
            text-decoration: none;
            display: inline-block;
          \`;
          container.appendChild(a);
        });
      });
    </script>
  `
})

// hexo.extend.helper.register('cloudTags', function (options = {}) {
//   const env = this
//   let { source, minfontsize, maxfontsize, limit, unit, orderby, order, fixSize, randomColor} = options
//   unit = unit || 'px'

//   let result = ''
//   if (limit > 0) {
//     source = source.limit(limit)
//   }

//   const sizes = []
//   source.sort('length').forEach(tag => {
//     const { length } = tag
//     if (sizes.includes(length)) return
//     sizes.push(length)
//   })

//   const length = sizes.length - 1
//   source.sort(orderby, order).forEach(tag => {
//     const ratio = length ? sizes.indexOf(tag.length) / length : 0
//     const size = minfontsize + ((maxfontsize - minfontsize) * ratio)
//     let style;
//     if (!fixSize) {
//       style = `font-size: ${size}${unit};`
//     } else {
//       style = `font-size: 12px;`
//     }
//     let r, g, b;
//     if (randomColor){
//       r = Math.floor(Math.random() * 101) + 100
//       g = Math.floor(Math.random() * 101) + 100
//       b = Math.floor(Math.random() * 101) + 100
//     } else {
//       r = g = b = 144
//     }
//     const color = 'rgb(' + r + ', ' + g + ', ' + b + ')' // 0,0,0 -> 200,200,200
//     const bg_color = 'rgb(' + r + ', ' + g + ', ' + b + ', 0.15' + ')'
//     style += ` color: ${color};`
//     style += ` background-color: ${bg_color}; margin: 0px 0px 5px 5px; border-radius: 10px;`
//     result += `<a href="${env.url_for(tag.path)}" style="${style}">#${tag.name}</a>`
//   })
//   return result
// })

hexo.extend.helper.register('urlNoIndex', function (url = null, trailingIndex = false, trailingHtml = false) {
  return prettyUrls(url || this.url, { trailing_index: trailingIndex, trailing_html: trailingHtml })
})

hexo.extend.helper.register('md5', function (path) {
  return crypto.createHash('md5').update(decodeURI(this.url_for(path))).digest('hex')
})

hexo.extend.helper.register('injectHtml', function (data) {
  if (!data) return ''
  return data.join('')
})

hexo.extend.helper.register('findArchivesTitle', function (page, menu, date) {
  if (page.year) {
    const dateStr = page.month ? `${page.year}-${page.month}` : `${page.year}`
    const dateFormat = page.month ? hexo.theme.config.aside.card_archives.format : 'YYYY'
    return date(dateStr, dateFormat)
  }

  const defaultTitle = this._p('page.archives')
  if (!menu) return defaultTitle

  const loop = (m) => {
    for (const key in m) {
      if (typeof m[key] === 'object') {
        loop(m[key])
      }

      if (/\/archives\//.test(m[key])) {
        return key
      }
    }
  }

  return loop(menu) || defaultTitle
})

hexo.extend.helper.register('isImgOrUrl', function (path) {
  const imgTestReg = /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i
  return path.indexOf('//') !== -1 || imgTestReg.test(path)
})
