---
title: 高自由度地管理Hexo博客的文章本地路径
disableNunjucks: false
id: 11229
date: 2024-04-27 02:01:57
categories:
  - [Hexo魔改]
  - [博客相关]
tags:
  - NodeJS
  - Hexo
cover:
---

Hexo默认将所有的文章都放在`source/_posts`这一级目录下，一旦文章多起来，就很乱七八糟。因此，往往会选择将文章分在不同的子目录下，以方便我们对它们进行管理。最常见的配置方法就是按文章创建的时间分配目录。

{% tabs tab1 %}

<!-- tab 修改Hexo的配置文件 -->

`_config.yml`文件提供了一个配置项：`new_post_name`，可以用来定义文章的路径，将其值设置为`:year/:month/:title.md`即可。

<!-- endtab -->

<!-- tab 自己写脚本实现 -->

如果对文章路径有其他更个性化的需求，通过改配置文件的方法就显得不那么自由了，这一需求也可以通过编写脚本实现。

Hexo定义了一个处理文章路径的过滤器：[new_post_path](https://hexo.io/zh-cn/api/filter#new-post-path)，可以通过对其注册一个函数来实现对文章本地路径的修改。与[上篇文章](/blog/11219/)类似，我们在根目录的`scripts`目录下创建一个新的文件：`modify-post-path.js`，内容如下：

```js
const path = require('path');


hexo.extend.filter.register('new_post_path', function(filePath){
  if (!filePath.includes(path.join(process.cwd(), 'source', '_posts'))) return filePath;
  var filename = path.basename(filePath);
  var dirname = path.dirname(filePath);
  var date = new Date();
  var year = date.getFullYear().toString();
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var newPath = path.join(dirname, year, month, filename);
  return newPath;
});
```

该函数首先忽略了所有`page`，只对`post`页面进行处理，接下来的内容就不说了，非常容易理解。

<!-- endtab -->

{% endtabs %}

---

由于我已设置了`permalink: /blog/:id/`，因此改变文件的路径不会影响对应文章在网页中的URL。

最后，根据我自己的需求，我需要修改一下[上篇文章](/blog/11219/)中提到的自动生成唯一自增ID的函数。

```js
const fs = require('fs-extra');
const path = require('path');
const fm = require('hexo-front-matter');


hexo.on('new', function(post){
  const postsDir = path.join(process.cwd(), 'source', '_posts');
  if (!post.path.includes(postsDir)) return;
  const fileName = path.basename(post.path);
  const years = fs.readdirSync(postsDir).sort().reverse();
  for (let year of years) {
    const months = fs.readdirSync(path.join(postsDir, year)).sort().reverse();
    for (let month of months) {
      const files = fs.readdirSync(path.join(postsDir, year, month));
      const postFiles = files.filter(file => file.endsWith('.md') && file !== fileName);
      if (postFiles.length > 0) {
        let maxId = 0;
        postFiles.forEach(file => {
          let content = fm.parse(fs.readFileSync(path.join(postsDir, year, month, file), "utf8"));
          if (typeof content.id !== 'undefined') {
            maxId = Math.max(maxId, content.id);
          }
        });
        content = fm.parse(post.content);
        content.id = maxId + Math.floor(Math.random() * 100) + 1;
        console.log(`${post.path} -> ${content.id}`);
        fs.writeFileSync(post.path, '---\n' + fm.stringify(content));
        return;
      }
    }
  }
});
```

由于已经将文章按时间归类了，而文章的`id`又是自增的，因此只需要找到最新的月份目录即可确定当前的最大`id`。