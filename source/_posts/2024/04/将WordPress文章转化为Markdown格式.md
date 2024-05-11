---
title: 将WordPress文章转化为Markdown格式
id: 10094
date: 2024-04-03 05:53:31
categories: [博客相关]
tags: ['Markdown', 'Python', 'WordPress']
cover: 
disableNunjucks: false
swiper_index: 1
description: 一种可高度自定义的WordPress文章转Markdown的方法
---

在某些时候，我有将我的博客文章转化为markdown的需求，我的博客是用WordPress写的，想改静态博客但暂时懒得折腾，于是找了个折中的办法。

{% note info %}

然而刚写完这篇文章没多久就迁Hexo了，正好把本文提到的转换方法用了起来。

{% endnote %}

GitHub上有不少WordPress转Markdown的脚本，大多是通过解析WordPress导出的xml文件实现转换，但实测效果则非常一般了，因为导出的内容中会含有大量类似这样的东西：`<!-- wp:paragraph -->`，虽然大部分markdown渲染器会忽略这些内容，但看着还是很乱七八糟，另外如果文中有自定义的block，还会出现下面这种没有解析的内容：

```plaintext
<!-- wp:block-lab/download {"url":"https://xxx.com","text":"xxx"} /-->
```

这些脚本还经常处理不好文本换行，导致解析出来的文件里许多本该换行的文字挤在一团。虽然可以手动调整以达到过得去的效果，但十分费时费眼。


注意到rss订阅链接返回的数据包含了文章内容的纯HTML文本，于是想到可以用HTML来转markdown，将两种规范的标记语言进行互相转换应该问题会小很多。对于这一需求，已经有比较成熟的软件支持了，例如[pandoc](https://github.com/jgm/pandoc)，不过这个软件支持转换的文件类型非常多，对我来说好像暂时有点浪费，于是我找了一种比较轻量的方法，即写Python脚本解决，我找到了两个库，一个用来解析rss订阅，一个用来做html转换到markdown的工作：

```bash
pip install feedparser
pip install markdownify
```

脚本如下：

```python
import feedparser
from markdownify import markdownify as md
import time
import os


class RSS2MD(object):
    def __init__(self, url, out_folder='output'):
        self.url = url
        self.out_folder = out_folder

    def parse_entry(self, entry):
        title = entry['title']
        link = entry['link']
        date = entry['published_parsed']
        tags = [_['term'] for _ in entry.get('tags', [])]
        meta = "---\n" \
               f"title: {title}\n" \
               f"slug: {link}\n" \
               f"date: {time.strftime('%Y-%m-%d', date)}\n" \
               f"tags: {tags}\n" \
               f"---\n\n"

        content = entry['content'][0]['value']
        md_content = meta + md(html_text, bullets='-', escape_underscores=False).strip().rsplit('\n\n', 1)[0]
        file_name = title.replace(os.sep, "|") + '.md'
        with open(os.path.join(self.out_folder, file_name), 'w') as f:
            f.write(md_content)

    def parse(self):
        os.makedirs(self.out_folder, exist_ok=True)
        feed = feedparser.parse(self.url)
        for entry in feed.entries:
            self.parse_entry(entry)


rss2md = RSS2MD('https://blog.fyz666.xyz/feed/', 'output')
rss2md.parse()
```

markdownify这个库支持非常高自由度的配置，转化的效果也非常OK。


不过有一个小问题，那就是WordPress的rss订阅会把文中出现的emoji转化为img标签，指向一个域名为s.w.org的链接，似乎是为了兼容各种古早版本的阅读器，然而我并不需要这部分功能，于是可以在WordPress的`functions.php`文件加入以下代码来禁用此功能：

```php
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('admin_print_styles', 'print_emoji_styles'); 
remove_filter('the_content_feed', 'wp_staticize_emoji');
remove_filter('comment_text_rss', 'wp_staticize_emoji'); 
remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
```