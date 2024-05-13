---
title: 编写一个自己的QQ机器人
id: 5579
date: 2021-07-23 08:10:16
categories: [瞎捣鼓经历]
tags: ['CQHTTP', 'nonebot', 'Python', 'QQ bot']
cover: https://blogfiles.oss.fyz666.xyz/jpeg/2a98049f-0f73-4679-8a38-cce243430d4f.jpeg
disableNunjucks: false
---

{% note info %}
更新于2022/9：由于tx增强了风控，我的QQ机器人无法在服务器上进行登录，不排除后期继续加大风控力度的可能，因此我决定不再折腾QQ机器人，而转战生态更丰富、交互性更好的Telegram Bot。
{% endnote %}

很早以前用过一段时间酷Q平台开发的机器人客户端，结合自己的逻辑进行各种消息的处理回复，但后来因为某种原因，平台跑路了，因此QQ机器人的开发也搁置了一年左右。这两天又想重新通过一些其他途径把机器人整起来。


本次QQ机器人的搭建过程用到了[go-cqhttp项目](https://github.com/Mrs4s/go-cqhttp)与nonebot库（作为Python接口），操作系统是64位ARM架构的Linux，当然，需要注册一个QQ小号。


## 安装go-cqhttp并登录账号


从上面的项目中选择适合64位ARM架构Linux系统（请根据自己的操作系统进行选择）的release最新版本，写此文时，最新版为v1.0.0-beta4，将其上传到目标系统，解压，得到三个文件，其中，文件go-cqhttp为可执行文件，为其添加执行权限：

```bash
sudo chmod +x go-cqhttp
```

然后执行：

```bash
./go-cqhttp
```

首次执行该程序，会在当前路径下生成一个配置文件（config.yml，若版本较旧，可能为config.json），修改其默认账号配置：uin，password，其他配置暂时不改。


然后重新运行go-cqhttp，此时将会出现一些验证操作，我当时遇到的是滑块验证，应该是所有验证方式当中最麻烦的一种，以下是解决方法：


1. 在上面运行的程序中选择输入ticket的方式进行验证。
2. 将其提供的滑块链接复制到浏览器中打开（推荐Chrome、Firefox等）。
3. 打开开发者工具，选择Network选项卡（有些浏览器里叫“网络”），然后拖动滑块。
4. 如果验证成功，在Network下会出现一条名为cap_union_new_verify的请求，点开它，选择Preview选项卡，可以看到一条json数据，将数据中的ticket值复制出来，贴到前面程序的命令行中，敲个回车。

如此即可通过验证，并且登录成功后，会在当前目录生成一个device.json文件，以后在这台设备登录该账号，将不需要再次验证。


通过go-cqhttp登录账号后，用QQ向该账号发起对话，便可以在命令窗口中看到收到的消息。


## 安装nonebot


nonebot需要Python版本不低于3.7，我使用的Ubuntu20.04自带Python3.8.5，故可直接安装nonebot，目前nonebot已经出了version2，但由于我之前用的是version1，两个版本的配置方法以及类与接口大有不同，因此我经过一番尝试，仍然选择使用更熟悉的nonebot v1，执行以下pip命令进行安装：

```bash
pip install "nonebot[scheduler]"
```

其中，scheduler是一个可选模块，考虑到以后可能会为机器人加入一些计划任务，故在一开始就可以把它装上。


如果不需要此模块，只需：



```bash
pip install nonebot
```

nonebot可能会依赖于一些其他模块，例如：msgpack。如果提示缺少，通过pip进行安装就好了。


接下来我们手动创建一个最简单的nonebot项目，来放置以后用于QQ机器人的Python脚本。

```bash
mkdir qqbot
cd qqbot
touch main.py
touch config.py
```

main.py

```python
import nonebot
import config

nonebot.init(config)
if __name__ == "__main__":
    bot = nonebot.get_bot()
    bot.run()
```

config.py

```python
from nonebot.default_config import *
API_ROOT = 'http://127.0.0.1:5700' # http接口路径
SUPERUSERS = {********} # 此处添加超级用户的QQ号
COMMAND_START = {''} # 此处定义命令的起始符
NICKNAME = {'小冰'} # 此处定义QQ机器人的昵称，用于在群内将其唤醒
HOST = '127.0.0.1' # websocket监听地址
PORT = 8080 # websocket监听端口
```

执行命令：

```bash
python main.py
```

即可将程序启动。若不想让程序占用shell窗口，可以用nohup命令后台运行。


## 历史性的第一次对话


现在Python脚本已经启动了起来，其在本地的8080端口监听websocket信息，并将调用本地的5700端口作为web api，简单来说，8080端口用于脚本接收QQ消息，5700端口用于脚本发送QQ消息。但此时，由于之前并未在go-cqhttp中配置任何端口信息，因此Python程序和go-cqhttp程序互相不知道对方的存在。


接下来对go-cqhttp的配置文件config.yml进行更改，除了最基本的QQ帐号密码外，主要修改的还有`servers`下面的内容：

```yaml
servers:
   - ws-reverse: # 反向 Websocket
      disabled: false
      universal: "ws://127.0.0.1:8080/ws/"
  #- pprof: #性能分析服务器
  # HTTP 通信设置
  - http:
      # 服务端监听地址
      disabled: false
      host: 127.0.0.1
      # 服务端监听端口
      port: 5700
      # 反向HTTP超时时间, 单位秒
      # 最小值为5，小于5将会忽略本项设置
      # timeout: 5
      # middlewares:
      #   <<: *default # 引用默认中间件
      # 反向HTTP POST地址列表
      post:
      #- url: '' # 地址
      #  secret: ''           # 密钥
      #- url: 127.0.0.1:5701 # 地址
      #  secret: ''          # 密钥
```

在`ws-reverse`项下面配置universal路径为`ws://<ip>:<port>/ws/`（最后的斜杠有的版本必须得加），ip与port正是前面config.py中设置的`HOST`和`PORT`项（如果前面HOST设为`0.0.0.0`，那么这里的ip可以设置成本机的任意一个ip，建议设为`127.0.0.1`）


在`http`项下，同样配置`host`和`port`，声明web api的地址与端口，与前面config.py中的`API_ROOT`对应。


然后重新启动go-cqhttp，若看到下面这样的信息，说明程序启动一切正常：

```raw
...
[2021-07-23 07:34:22] [INFO]: 资源初始化完成, 开始处理信息. 
[2021-07-23 07:34:22] [INFO]: アトリは、高性能ですから! 
[2021-07-23 07:34:22] [INFO]: 开始尝试连接到反向WebSocket Universal服务器: ws://127.0.0.1:8080/ws/
[2021-07-23 07:34:22] [INFO]: 正在检查更新. 
[2021-07-23 07:34:22] [INFO]: CQ HTTP 服务器已启动: 127.0.0.1:5700 
[2021-07-23 07:34:23] [INFO]: 收到服务器地址更新通知, 将在下一次重连时应用.  
[2021-07-23 07:34:24] [INFO]: 检查更新完成. 当前已运行最新版本. 
```

接下来，先停止go-cqhttp程序，我们将为Python程序增加一些简单的逻辑，以完成简单的对话。


进入Python项目目录qqbot下，创建一个新的文件夹bot，用于存放额外文件，在bot文件夹下再创建一个plugins文件夹，用于存放插件脚本，然后创建一个say_hello.py：

```bash
mkdir bot
mkdir bot/plugins
vi bot/plugins/say_hello.py
```

写入以下内容：

```python
from nonebot import on_command, CommandSession
import nonebot

@on_command('hello', aliases=('hi'))
async def _(session: CommandSession):
    await session.send('hello')
```

便完成了一个最简单的脚本，机器人将对“hello”或“hi”命令做出响应，回复一条“hello”。


为了将脚本载入程序，只需将main.py改成如下内容

```python
import nonebot
import config
from os import path

nonebot.init(config)
nonebot.load_plugins(
    path.join(path.dirname(__file__), 'bot', 'plugins'),
    'bot.plugins'
)
if __name__ == '__main__':
    bot = nonebot.get_bot()
    bot.run()
```

重新运行main程序即可。


在运行了Python程序以后，再启动前面的go-cqhttp，即可与机器人愉快对话！

nonebot的更多高级的功能，详见其官方文档：

{%link NoneBot,v1.nonebot.dev,https://v1.nonebot.dev/ %}


**请仅将此项目用于学习用途，勿作他用！**
