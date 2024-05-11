---
title: 使用Python向百度推送url
id: 3117
date: 2020-07-27 14:57:52
categories: [瞎捣鼓经历]
tags: ['Python', '爬虫']
cover: 
disableNunjucks: true
---

百度站长工具提供了许多推送接口，API提交中给了使用一些其他语言的例子，唯独没有python（大概是觉得python过于简单），因此我写了一个python脚本用以批量推送网站内的url。

首先需要一个站点地图，在我网站上是"/sitemap.php"，访问会生成xml格式的站点地图文件（也可以通过其他任何方式，只要能获取一个每行一个url的字符串文本即可）。

```python
import requests
import re
sitemap_url = 'https://blog.fyz666.xyz/sitemap.php'//站点地图
post_url = 'http://data.zz.baidu.com/urls?site=https://blog.fyz666.xyz&token=xxxxxx' # 这个API链接由百度站长工具提供
urls_response = requests.get(sitemap_url)
urls= '\n'.join(re.findall('(?<=<loc>).*(?=</loc>)', urls_response.text))
headers = {
        'User-Agent': 'curl/7.12.1',
        'Host': 'data.zz.baidu.com',
        'Content - Type': 'text / plain'
    }
r = requests.post(post_url, data=urls)
```

`r.status_code`为200时表示推送成功，查看`r.json()`可得到当天的剩余推送链接数与本次推送成功的链接数。
