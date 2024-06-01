---
title: 利用GitHub做对象存储服务
id: 11170
date: 2024-04-17 11:27:24
categories:
  - [博客相关]
tags:
  - GitHub API
  - Python
  - 对象存储
cover: 
disableNunjucks: false
---

我的blog上有很多图片，它们不仅分布于文章内容、文章封面，还会大量出现在相册里。

把所有的图片都存在Hexo目录下虽然方便，但博客目录会十分臃肿，并且会拖慢Hexo生成public目录的速度，另外，如果使用了GitHub Pages等静态服务部署博客，每次推送部署都要把一堆图片打包过去，影响部署速度（或许能增量部署？不过我没有尝试过）。总之——当图片数量很多时，使用对象存储服务是有必要的。

对比了各种对象存储服务商，我觉得我还是把GitHub利用起来吧，至少它免费、稳定、没有跑路风险。

不过仍有需要注意的地方⚠️

{% note warning %}
- GitHub原则上是反对仓库图床化的，当仓库超过 1G 后会有人工审核仓库内容，因此需要注意仓库不要太大。
- jsDelivr 加速的单文件大小限制为 50M。
{% endnote %}

基于上述原因，后续我会逐步将图片迁移到更加合适的对象存储平台。

{% note info %}
更新于2024-05-17：将所有图片迁移至[自建对象存储服务](https://oss-console.fyz666.xyz/)。
{% endnote %}

---

已有一些支持GitHub图床的软件：[PicX](https://github.com/XPoet/picx)、[PicGo](https://github.com/PicGo/PicGo-Core)，不过这些软件默认只能上传图片文件，没法传其他格式的文件。既然GitHub支持API管理仓库，那为什么不直接写个脚本来处理文件上传这件事呢？这样基本上任何需求都可以通过简单写几句代码实现，拥有更高的自由度，岂不美哉。

{% link GitHub API文档,GitHub,https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api %}

我的需求是将文件按后缀名分类，存储在对应的目录下，并且将文件重命名为它自身的md5摘要，这样肯定不会遇到collision吧（大概！），并且用[jsDelivr](https://www.jsdelivr.com/)进行加速。这里我就直接贴代码了：

```python
import os
import requests
import base64
import hashlib
import retry


def md5(file_content):
    hash_md5 = hashlib.md5()
    hash_md5.update(file_content)
    return hash_md5.hexdigest()


class GitHubStorage(object):

    def __init__(self, username, repo, token, branch='main'):
        self.username = username
        self.repo = repo
        self.token = token
        self.branch = branch
        self.headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json',
        }
        self.cdn = f'https://fastly.jsdelivr.net/gh/{username}/{repo}@{branch}/'
        
    def get_file_info(self, filepath):
        with open(filepath, 'rb') as file:
            content = file.read()
        ext = os.path.splitext(filepath)[-1]
        hash_md5 = md5(content)
        file_name = hash_md5 + ext
        path = 'blank' if ext == '' else ext.lower()[1:]
        return content, path, file_name

    @retry.retry(tries=5, delay=1)
    def upload(self, filepath):
        content, path, file_name = self.get_file_info(filepath)
        api_url = f'https://api.github.com/repos/{self.username}/{self.repo}/contents/{path}/{file_name}'
        data = {
            'message': 'Upload new file',
            'content': base64.b64encode(content).decode('utf-8'),
            'branch': self.branch
        }
        r = requests.put(api_url, headers=self.headers, json=data).json()
        return self.cdn + f'{path}/{file_name}'
```

上述脚本可以配合`typora`进行使用，实现markdown粘贴图片自动上传：

![](https://blogfiles.oss.fyz666.xyz/png/7d451b93-9309-455f-80bc-ea36a6bf2154.png)

顺便可以在脚本里加一句`os.remove()`，以删除`typora`自动在本地保存的图片。
