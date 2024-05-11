---
title: 为Hexo文章自动生成唯一的自增ID
disableNunjucks: false
id: 11219
date: 2024-04-25 18:37:04
categories:
  - [Hexo魔改]
  - [博客相关]
tags:
  - NodeJS
  - Hexo
cover:
---

[前文](/blog/11025/)曾提到过我将博客从WordPress迁移到Hexo时，希望保留原有的永久链接格式：`/blog/:id/`，然而Hexo本身并不支持自动生成这样的`id`，虽然有一些插件例如[hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink)支持生成这种数字`id`，但好像也不是我想要的样子。

我仍希望保持之前那种WordPress下的格式，即每篇文章的`id`单调递增，且每次的递增值比较“随机”（这个自增在WordPress中是MySQL数据库的行为，MySQL会为`wp_post`表中的所有内容分配`id`，而这些内容不仅包含了已发布的文章，还包含文章中插入的图片、文章的修订版本以及文章的自动保存版本等等，因此在发布文章时，往往这个新文章的`id`会看上去比较随机地递增）。

而现在Hexo没有数据库了，但我仍想保持这种随机增长的文章`id`风格。那要怎么办呢？每次手动算`id`自然不太方便，不妨自己来写个插件。

------

通过阅读[Hexo的文档](https://hexo.io/zh-cn/api/events)，我简单了解了一下如何在Hexo中监听事件，例如在“生成新文章后”触发一些自定义的函数。首先在博客的根目录下（这里的根目录是项目的根目录，即包含了博客配置文件的目录）创建`scripts`文件夹，然后在下面创建的`javascript`文件会自动被Hexo读取执行。

先安装一个包：`fs-extra`，是`fs`模块的扩展。

```bash
npm install fs-extra --save
```

我安装的版本：`"fs-extra": "^11.2.0"`

在`scripts`目录下创建一个`auto-id.js`：

```js
const fs = require('fs-extra');
const path = require('path');
const fm = require('hexo-front-matter');

hexo.on('new', function(post){
  if (!post.path.includes(path.join(process.cwd(), 'source', '_posts'))) return;
  let maxId = 0;
  fs.readdir(path.join(process.cwd(), 'source', '_posts'), (err, files) => {
    if (err) throw err;
    files.forEach( (fpath) => {
      if(fpath.endsWith('.md')){
        let content = fm.parse(fs.readFileSync(path.join(process.cwd(), 'source', '_posts', fpath), "utf8"));
        if (typeof content.id !== 'undefined') {
          maxId = Math.max(maxId, content.id);
        }
      }
    });
    content = fm.parse(fs.readFileSync(post.path, "utf8"));
    content.id = maxId + Math.floor(Math.random() * 100) + 1;
    console.log(`${post.path} -> ${content.id}`);
    fs.writeFileSync(post.path, '---\n' + fm.stringify(content));
  });
});
```

然后遍历一遍文章，取出当前最大的`id`（这个操作有点蠢，不过暂且这样吧，懒得用其他方式去做持久化），然后在此基础上加一个随机值，就得到了新的`id`，最后将它写入到新文章的`front-matter`中。不过不知道为什么最后得手动在最前面添加`---\n`，试了一下`fm.stringify`的参数`prefixSeparator`也并没有啥用。

这样就相当于写了一个非常简单的插件了，这个插件可以为文章自动生成一个`id`，效果如下：

```bash
╰─➤  npx hexo new post "为Hexo文章自动生成唯一的自增ID"
INFO  Validating config
INFO
  ===================================================================
      #####  #    # ##### ##### ###### #####  ###### #      #   #
      #    # #    #   #     #   #      #    # #      #       # #
      #####  #    #   #     #   #####  #    # #####  #        #
      #    # #    #   #     #   #      #####  #      #        #
      #    # #    #   #     #   #      #   #  #      #        #
      #####   ####    #     #   ###### #    # #      ######   #
                            4.14.0-b1
  ===================================================================
INFO  Created: ~/.../source/_posts/为Hexo文章自动生成唯一的自增ID.md
.../source/_posts/为Hexo文章自动生成唯一的自增ID.md -> 11219
```

