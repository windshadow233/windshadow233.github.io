---
title: 一个随Star数动态变化的GitHub仓库
id: 9506
date: 2024-02-23 18:00:43
categories: [杂趣]
tags: ['API GateWay', 'AWS Lambda', 'GitHub API', 'Python', 'Webhook']
cover: https://api.star-history.com/svg?repos=windshadow233/This-Repo-Has-0-Stars&type=Date
disableNunjucks: false
swiper_index: 1
description: 一个有意思的GitHub仓库
---

几年前曾看到过@iBug大佬的[一个GitHub仓库](https://github.com/iBug/This-Repo-Has-0-Stars)，这个仓库的名字以及描述会实时显示当前的Star数量，令当时的我觉得非常有意思，不过那会我并没有去研究原理。几年过去了，却不知昨天为啥突然想到，于是读了一下大佬的[文章](https://ibug.io/p/41)，试着复现了一下。

我复现的仓库链接如下：

{% link This Repo Has 0 Stars,GitHub,https://github.com/windshadow233/This-Repo-Has-0-Stars %}

朋友们可以进去点个star看看效果～~~（没想到我第一次骗star竟是为这）~~

![](https://api.star-history.com/svg?repos=windshadow233/This-Repo-Has-0-Stars&type=Date)


---

项目很简单，但其背后的原理覆盖了一些我之前没有接触过的东西，例如GitHub REST API、Webhook（这个倒是在做telegram bot的时候接触过）、AWS Lambda等。如果能熟练利用，感觉会是个很高效、很方便的辅助工具。由于iBug大佬的文章省略了好多「有手就行」但我不会的内容，所以在过程中踩了一些坑，因此我来水篇文章，更详细地记录一下。


## 实现原理


这个东西的原理其实就是，使用GitHub自带的Webhook，监听仓库的各种事件（如本例监听的是「Star」事件），一旦事件发生，则自动推送消息到指定的URL，通过URL背后的代码来调用GitHub REST API，从而实现在Star数更新时自动修改GitHub repo名。我们可以自定义该URL，为降低复杂度、提升维护的便利性，选择使用AWS Lambda这种Serverless的服务。


## 创建GitHub Repo并添加Webhook


第一步自然是需要把仓库建立起来，可以随便起个名，例如“This-Repo-Has-0-Stars”。然后前往仓库的「Settings->Webhooks」标签，点击「Add webhook」。


- Payload URL：推送消息的目的地址，这里我们还没有申请AWS的API，先不管。
- Content type：我比较喜欢用JSON，于是我选择了「application/json」，实际也就是写代码的时候略有区别。
- Secret：Webhook的签名字符串，可用来验签，可以不填，不过还是建议用密码生成器来生成一个。
- Which events would you like to trigger this webhook? 由于我们的目的是监听Star事件，因此这里选择「Let me select individual events」，然后在下面的列表中取消勾选「Pushes」，勾选「Stars」。

于是还剩Payload URL没有配置，暂时先放着，进入下一步。


## 创建GitHub Access Token


为通过GitHub REST API修改仓库名，需要搞一个token用来鉴权。[此处前往token申请页面](https://github.com/settings/tokens)

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/0b842b41077a21768b19fdc4c6077292.png)
如上，申请一个用于管理repo的token，将其保存下来。


## 创建AWS Lambda函数


由于之前发生过一次因不了解AWS平台的计费方式而白白浪费了100多rmb的惨痛经历，于是这次我提前摸清了套路：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b16be8fe50b9ab5a3604ba02f66e490c.png)
作为一个娱乐项目肯定稳稳够用了。


前往[AWS控制台](https://console.aws.amazon.com/)，在「服务」中搜索lambda：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/fc6f1e676e40023f54d6e7325436c326.png)
创建一个lambda函数，并选择你喜欢的编程语言<s>（Python 3.8）</s>：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/141591ad60ec1fdd621d28e451bd0d1b.png)
点「创建函数」即可。进入代码页，发现它为我们提供了最基础的（Python）代码：

```python
import json

def lambda_handler(event, context):
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

```

不过它好像并不能直接使用，而是要通过AWS其他地方的接口来调用，这个东西称为[AWS API Gateway](https://console.aws.amazon.com/apigateway/main)。

## 配置AWS API Gateway

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/2a2cd66dca325096ccd7276f47b61194.png)
这玩意则是收费的，不过很便宜，不公开接口的话应该开销不大。


点击「创建API」，并选择「HTTP API」：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/2668837da3012db8132b8b54eca98177.png)
添加一个Lambda集成，并选择前面创建的Lambda函数，最后点「下一步」：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/cd50a23967f4337dc5a68819594e0aed.png)
配置路由，按iBug大佬[所说](https://ibug.io/cn/2021/02/github-webhook-on-aws-lambda/#api-gateway)，填写$default：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/1a33ef7f7dbe11a28a33701994de02ac.png)
这样便创建好了一个HTTP API，AWS为其分配了一个ID，即下面的87z7tufbtk：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/fbe85d2db6553829ed92f5a0d3fe52b6.png)
可以通过下面的方法简单测试一下：

```bash
$ curl https://87z7tufbtk.execute-api.us-east-1.amazonaws.com/
"Hello from Lambda!"%
```

这串URL：`https://87z7tufbtk.execute-api.us-east-1.amazonaws.com/` 也正是前面创建webhook时留着没填的那个Payload URL。

## 编写Lambda函数


刚刚的接口测试说明Lambda函数已经work了，于是需要编写一下这个Lambda函数以使其达到我们想要的效果——获取到repo的star数，然后把它的名字、描述改了。这里的参数研究等过程建议直接阅读[iBug大佬的文章](https://ibug.io/cn/2021/02/github-webhook-on-aws-lambda/#lambda-code)，我就直接贴完整的代码了（此代码修改自iBug大佬的代码，也可以在[我的仓库](https://github.com/windshadow233/This-Repo-Has-0-Stars)里看到）

### 代码

```python
import base64
import hashlib
import hmac
import os
import json

import requests


GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
SECRET = os.environ.get('SECRET')


def lambda_handler(event, context):
    path = event['rawPath']
    if 'body' in event:
        if event['isBase64Encoded']:
            body = base64.b64decode(event['body'])
        else:
            body = event['body'].encode()
    else:
        body = b""
    signature = event['headers']['x-hub-signature-256'].split("=")[1]
    hashsum = hmac.new(SECRET.encode(), msg=body, digestmod=hashlib.sha256).hexdigest()
    if hashsum != signature:
        return {
            'statusCode': 401,
            'body': 'Bad signature'
        }
    if path == "/":
        # https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#star
        payload = json.loads(body)
        repository = payload['repository']
        repository_url = repository['url']
        stars = repository['stargazers_count']

        new_name = f"This-Repo-Has-{stars}-Star{'s' if stars != 1 else ''}"
        new_description = f"Thanks for stopping by! This repository now has {stars} star{'s' if stars != 1 else ''}~🌟🌟🌟"
        headers = {'Authorization': f"Bearer {GITHUB_TOKEN}"}
        data = {
            'name': new_name,
            'description': new_description
        }
        response = requests.patch(repository_url, headers=headers, json=data)
        return {'statusCode': response.status_code, 'body': "OK"}
    else:
        return {'statusCode': 404, 'body': ""}
```

### 配置环境变量


注意到代码最前面读取了俩环境变量，GITHUB_TOKEN和SECRET分别是前面申请的GitHub Access Token和Webhook Secret字符串，为在代码中获取，需要将其设置在Lambda函数的「配置->环境变量」标签栏下：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/557096d4f67f0052976cbd52facca6d6.png)
### 添加第三方库


设置完上面的内容后，我给仓库点了个star，然而

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/5385911526e61a25e9cd3b8d833ed57b.png)
debug了半天发现原来是Lambda函数的Python 3.8环境没有第三方库，例如requests，于是要想办法把第三方库集成进去。


研究了一会，发现Lambda提供一种叫「层」的功能：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/584646ce929f46a1f6c31e942b764a3d.png)
通过添加「层」，可以将第三方库打包添加进去。下面先打包第三方库。


在本地的Python 3.8环境中执行下述命令，得到python目录，将该目录打包为python.zip

```bash
pip install --target ./python requests urllib3==1.26.16
```

然后「创建层」：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/8178a6c7d9f32019c89b8f0e1c3a6dbd.png)
名称可以随意填写，点击「上传」按钮，将前面的python.zip上传，选择几个合适的运行时，点击「创建」。


回到Lambda的「代码」部分，拉到最底下，有一块「层」区域：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b9d8d8e1ba41b8aef4a78192b751ccb3.png)
我们在这里添加刚刚创建的层，即可让Python环境拥有requests。

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b3e4598f853c256a1a6f3021bcdda2e8.png)


---

## 最后


到了这里，这个会自动随star数更新名字和描述的repo就已经做完了。不过其中所用到的技术，仍有很大的应用空间尚未研究，「下次一定」找个机会多玩玩！
