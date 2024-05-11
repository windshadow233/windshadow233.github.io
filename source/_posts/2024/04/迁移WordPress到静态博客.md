---
title: 迁移WordPress到静态博客
disableNunjucks: true
id: 11025
date: 2024-04-11 12:43:00
categories:
  - [博客相关]
tags:
  - WordPress
  - Hexo
  - Python
cover:
swiper_index: 1
description: 时隔四年，我终于把博客从WordPress迁移到了Hexo
---

用WordPress写个人博客四年后，我终于下定决心把它迁移到了静态博客。本文是我使用Hexo框架写的第一篇文章。

---

## 迁移的动机

- MySQL数据库占用的内存实在是太多了
- 有后台的博客虽然管理起来方便，但十分臃肿，而且会有补不完的漏洞
- 用Markdown来写文章十分简约，同时也很方便
- 比起PHP，我更愿意学习前端那一套框架
- 正好前段时间研究了如何将文章转成Markdown，满足了迁移的前置条件
- ~~发现大佬们似乎都是静态博客，跟个风~~

## 迁移的过程

WordPress和Hexo对文章的处理有非常大的区别，因此我在这里将我主要遇到的问题、需要满足的需求及解决方法记录了一下。

### 将全站文章导出为Markdown

由于Hexo使用Markdown来写文章，因此必不可少的操作——将所有文章导出为Markdown格式。

事实上，目前已经有不少**WordPress to Hexo**的迁移工具了，然而这些工具基本都很难完全满足我的需求，我需要一种可高度自定义的迁移方法来应对我的一些奇奇怪怪的需求。

如[上一篇文章](/blog/10094/)所述，我已经找到了一种令我比较满意的转换方法，不过当时的目的只是随意转换一下，看着舒服就行，在实际进行迁移操作时，又根据需求增加了不少细节。

- 保持文章的`permalink`不变

我之前的博客中文章的永久链接都是`/blog/id/`这种形式，我希望在新的博客下保持原有的永久链接格式。基于此需求，我为所有导出的文章自定义了frontmatter，增加了`id`字段，并且在Hexo配置文件中设置：

```yaml
permalink: /blog/:id/
```

- 下载所有静态文件到本地（以后再考虑使用第三方对象存储服务）

我的博客中静态文件除掉css、js等文件以外，还包含图片、音频、pdf，甚至zip压缩包，并且它们在我原来网站上的路径可能非常复杂，例如`/wp-content/uploads/2021/06/xxx.jpeg`，对于这些文件，我自然不希望它们保留原始路径（早知道以前就用第三方对象存储服务了。。。这样就能省事好多），这里可以开启Hexo的post asset folder功能：

```yaml
post_asset_folder: true
```

然后创建与post文件同路径、同名的目录，将每篇文章包含的静态文件下载到对应的asset目录下。

之后只需要正则匹配所有长得像文件的链接：

```plaintext
https\:\/\/blog\.fyz666\.xyz\/[a-zA-Z\d\/_-]*\.[a-zA-Z\d_%@#-]+(?:\.[a-zA-Z\d_%@#-]+)*
```

路径上至少包含一组`.xxx`结构的链接，大概率就是文件了，反正应该不至于出现太奇怪的东西。

- 代码块语言标注

在WordPress中，我使用[EnlighterJS](https://github.com/EnlighterJS/EnlighterJS)进行代码块高亮，而Hexo默认使用[highlight.js](https://highlightjs.org/)进行代码块高亮，虽然highlight.js自带`auto_detect`功能可以自动识别代码块的语言，但当代码比较短或缺乏对应语言的特点时，自动识别的效果就不太好。而手动为所有文章的代码块标注语言又太过繁琐，因此我研究了一下，发现feedparser支持一个解析参数：`sanitize_html=False`，可以禁止它对HTML文本进行净化，从而保留一些我需要的东西，例如代码块的语言。

- 保留一些Markdown语法中没有的元素

部分文章含有音频标签`<audio>`，很多文章都含有删除线`<s>`或`<del>`，然而markdownify的默认规则会直接忽略它们，可以通过自定义解析规则来保留。

- 站内文件需要屏蔽pjax，不然会出问题

通过手动给这类链接增加一个`target="_blank"`来实现：

```python
file_exts = {
    '.pdf', '.jpg', '.jpeg', '.png', '.svg', '.jfif',
    '.wav', '.mp4', '.mp3', '.webm', '.ogv',
    '.zip', '.rar', '.gz', '.7z', '.tar', '.xz',
    '.pdf', '.bat'
}
...
if href.startswith(home_url) and ext.lower() in file_exts:
    return f"""<a target="_blank" href="{href}" rel="external" title="{title_part}">{text}</a>"""
```

### 适配Gitalk

之前在动态博客里插入Gitalk只需要在几个PHP文件里写上下面内容即可：

```js
const gitalk = new Gitalk({
    clientID: 'xxxxxxxxxxxxxxxx',
    clientSecret: 'xxxxxxxxxxxxxxxx',
    body: location.href,
    repo: 'BlogComments',
    owner: 'windshadow233',
    admin: ['windshadow233'],
    createIssueManually: true,
    id: location.pathname,
    distractionFreeMode: false
});
gitalk.render('gitalk-container');
```

而显然，这样的写法在静态博客中是达不到我想要的效果的，因为静态博客在编译时并不会把`location.pathname`和`location.href`动态解析为用户访问时的链接。所以需要对主题文件中对Gitalk的导入部分进行修改。

该文件在butterfly主题下位于`themes/butterfly/layout/includes/third-party/comments/gitalk.pug`，我将下面这部分进行了一定的修改：

```diff
@@ -9,7 +9,8 @@
         repo: '!{repo}',
         owner: '!{owner}',
         admin: ['!{admin}'],
-        id: '!{md5(page.path)}',
+        id: '!{page.path}',
+        body: '!{page.permalink}',
         updateCountCallback: commentCount
       },!{JSON.stringify(option)}))
```

这样Hexo在编译时就会将这些参数读取出来，然后写死在每个html文件里，从而达到我想要的效果。

---

要做的工作大概就这些，其他问题等遇到了再手动修改即可。最后附上我的迁移代码：

## Python脚本

```python
import feedparser
import time
import os
import re
import tqdm
import requests
from markdownify import MarkdownConverter, chomp
from retry import retry


file_exts = {
    '.pdf', '.jpg', '.jpeg', '.png', '.svg', '.jfif',
    '.wav', '.mp4', '.mp3', '.webm', '.ogv',
    '.zip', '.rar', '.gz', '.7z', '.tar', '.xz',
    '.pdf', '.bat'
}

language_alias = {
    'generic': 'plaintext',
    'shell': 'bash'
}

feed_url = 'https://blog.fyz666.xyz/feed/'
home_url = 'https://blog.fyz666.xyz/'


class CustomConverter(MarkdownConverter):
    """
    Create a custom MarkdownConverter that adds two newlines after an image
    """

    def convert_del(self, el, text, convert_as_inline):
        return str(el)

    def convert_s(self, el, text, convert_as_inline):
        return str(el)

    def convert_audio(self, el, text, convert_as_inline):
        return str(el)

    def convert_sup(self, el, text, convert_as_inline):
        return str(el)

    def convert_sub(self, el, text, convert_as_inline):
        return str(el)

    def convert_a(self, el, text, convert_as_inline):
        prefix, suffix, text = chomp(text)
        if not text:
            return ''
        href = el.get('href')
        title = el.get('title')
        ext = os.path.splitext(href)[-1]
        title_part = ' "%s"' % title.replace('"', r'\"') if title else ''
        if href.startswith(home_url) and ext.lower() in file_exts:
            return f"""<a target="_blank" href="{href}" rel="external" title="{title_part}">{text}</a>"""
        return f'{prefix}[{text}]({href}{title_part}){suffix}' if href else text

    def convert_pre(self, el, text, convert_as_inline):
        if not text:
            return ''
        language = el.attrs.get('data-enlighter-language')
        language = language_alias.get(language, language)
        return f"""\n```{language}\n{text}\n```\n"""

    def convert_div(self, el, text, convert_as_inline):
        if el.attrs.get('class') == 'introduce':
            return f"""<div class="introduce">{text}</div>"""
        return text


def md(html, **options):
    return CustomConverter(**options).convert(html)


class WordPress2MD(object):
    def __init__(self, feed_url, home_url, out_folder='output', download_files=True):
        self.url = feed_url
        self.home = home_url

        self.out_folder = out_folder
        self.download_files = download_files

    @retry(tries=5, delay=1)
    def get_cover(self, file_name, id_):
        if os.path.isfile(os.path.join(self.out_folder, file_name)):
            with open(os.path.join(self.out_folder, file_name), 'r') as f:
                lines = f.readlines()
                for line in lines:
                    if line.startswith('cover'):
                        cover = line.split(': ')[1].strip()
                        return cover
        info_url = self.home + f'wp-json/wp/v2/posts/{id_}'
        r = requests.get(info_url).json()
        if r['featured_media'] == 0:
            return ''
        id_ = r['featured_media']
        media_url = self.home + f'wp-json/wp/v2/media/{id_}'
        r = requests.get(media_url).json()
        return r['source_url']

    def make_assets_folder(self, asset_folder):
        os.makedirs(os.path.join(self.out_folder, asset_folder), exist_ok=True)

    @retry(tries=5, delay=1)
    def download_asset_file_and_replace(self, file_url, assets_folder, md_content):
        filename = os.path.split(file_url)[1]
        folder = os.path.join(self.out_folder, assets_folder)
        if os.path.exists(os.path.join(folder, filename)):
            return md_content.replace(file_url, filename)
        r = requests.get(file_url)
        with open(os.path.join(folder, filename), 'wb') as f:
            f.write(r.content)
        md_content = md_content.replace(file_url, filename)
        return md_content

    def find_and_replace_asset_files(self, assets_folder, md_content):
        pattern = re.compile(f'{self.home}[a-zA-Z\d\/_-]*\.[a-zA-Z\d_%@#-]+(?:\.[a-zA-Z\d_%@#-]+)*')
        files = pattern.findall(md_content)
        for file in tqdm.tqdm(set(files), desc=f"Downloading files to {assets_folder}"):
            try:
                if file.endswith('.php'):
                    continue
                md_content = self.download_asset_file_and_replace(file, assets_folder, md_content)
            except Exception as e:
                print(file, assets_folder, e)
        return md_content

    def html2md(self, html_text):
        return md(html_text, bullets='-', escape_underscores=False, heading_style='atx').strip()

    def parse_entry(self, entry):
        title = entry['title']
        date = entry['published_parsed']
        id_ = entry['id'].rsplit('?p=')[1]
        base_name = title.replace(os.sep, "|").replace(' ', '-')
        file_name = base_name + '.md'
        category, *tags = [_['term'] for _ in entry.get('tags', [])]
        cover = self.get_cover(file_name, id_)
        meta = "---\n" \
               f"title: {title}\n" \
               f"id: {id_}\n" \
               f"date: {time.strftime('%Y-%m-%d %H:%M:%S', date)}\n" \
               f"categories: [{category}]\n" \
               f"tags: {tags}\n" \
               f"cover: {cover}\n" \
               f"disableNunjucks: true\n" \
               f"---\n\n"

        content = entry['content'][0]['value']
        md_content = meta + self.html2md(content).rsplit('\n\n', 1)[0]
        if self.download_files:
            assets_folder = base_name
            self.make_assets_folder(assets_folder)
            md_content = self.find_and_replace_asset_files(assets_folder, md_content)
        with open(os.path.join(self.out_folder, file_name), 'w') as f:
            f.write(md_content)

    def parse(self, title=None):
        os.makedirs(self.out_folder, exist_ok=True)
        feed = feedparser.parse(self.url, sanitize_html=False)
        for entry in tqdm.tqdm(feed.entries):
            if title is not None:
                if title == entry['title']:
                    self.parse_entry(entry)
                    break
            else:
                self.parse_entry(entry)
        else:
            if title is not None:
                print('Article not found!')


wp2md = WordPress2MD(feed_url, home_url, '_posts', True)
wp2md.parse()
```