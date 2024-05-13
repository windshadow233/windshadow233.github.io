---
title: 如何安装并优雅地使用Jupyter Notebook
id: 3612
date: 2020-08-05 13:29:37
categories: [学习笔记]
tags: ['Jupyter Notebook']
cover: https://blogfiles.oss.fyz666.xyz/png/60acf07e-f3fd-48c9-a4d5-b374938660d3.png
disableNunjucks: true
---

## Jupyter是啥？为什么以及什么时候要用它？

Jupyter Notebook是一款基于网页的交互式Python IDE，当然如今随着它的发展，也逐渐支持R、PHP等其他编程语言，它是一款模块化的代码解释器，也就是可以将大段的代码模块化处理，分为多段运行。

![](https://blogfiles.oss.fyz666.xyz/png/60acf07e-f3fd-48c9-a4d5-b374938660d3.png)
该IDE的交互性非常好，设想你在做数据处理、分析的时候，一般会希望马上看到结果，此时若在pycharm等常规解释器中，就不得不把所有的代码从头跑一遍，你还得在中间插入一些`print`来打印结果，非常之麻烦，但在jupyter中，在前面代码都已经运行过的基础上，可以直接运行当前段代码。基于这些特性，jupyter可能会适用于数据处理分析以及各种建模过程等场景，但不一定适合用于软件开发等流程比较丰富、整体性比较强的领域。


我第一次使用这个IDE是在完成数据科学大作业的过程中，那么今天就来简单介绍一下自己的安装配置经验。


## 安装过程


**前提：python3.3及以上（听说2.7版本也可）**


做数据科学的童鞋们建议直接安装**[Anaconda](https://www.anaconda.com/)**，因为它不但直接自带了jupyter notebook，还附赠了一两百个数据科学相关的库，非常的方便。


什么？你的Anaconda没有带jupyter notebook？那就跑下面命令安装下咯：

```powershell
conda install jupyter notebook
```

不想装Anaconda的童鞋可以直接pip安装（如果电脑上有多个版本的python，需要注意pip对应的是哪个版本的python）：

```powershell
pip install --upgrade pip
pip install jupyter
```

## 使用Jupyter


安装完成以后，首先确保jupyter在环境变量里（一般其位于python安装目录下的Scripts文件夹）然后来运行一下，但与pycharm不同，这玩意没有一个可以直接用于打开的文件，只能通过以下命令：

```powershell
jupyter notebook --port port
```

例如

```powershell
jupyter notebook --port 9000
```

若不加`--port`参数，会用默认端口8888打开，若运行成功，界面上就会出现类似于以下信息：

```raw
......
    To access the notebook, open this file in a browser:
        file:///C:/Users/Eric/AppData/Roaming/jupyter/runtime/nbserver-6488-open.html
    Or copy and paste one of these URLs:
        http://localhost:8888/?token=c76580f88fc8810aa6584c7589f9b7ae713dfd958b66f91f
     or http://127.0.0.1:8888/?token=c76580f88fc8810aa6584c7589f9b7ae713dfd958b66f91f
[E 20:50:37.586 NotebookApp] Could not open static file ''
[W 20:50:37.662 NotebookApp] 404 GET /static/components/react/react-dom.production.min.js (::1) 8.98ms referer=http://localhost:8888/tree?token=c76580f88fc8810aa6584c7589f9b7ae713dfd958b66f91f
```

复制上面提到的链接到浏览器就可以打开界面。


这里小声提一句：以前的.py文件不能直接在这里面运行，jupyter能运行的文件后缀是.ipynb，可以通过界面偏右上角位置的New按钮来创建一个这样的文件。


若要关闭jupyter，只要点一下界面右上角的Quit即可。


## 优雅地使用Jupyter


首次使用jupyter的过程中，我感觉用户体验极差，相信不仅仅是我这么觉得。


- 居然要先打开cmd界面，然后敲命令才能运行
- 运行了以后居然要手动复制链接到浏览器才能打开界面
- 界面上文件的默认路径根本不是我放python项目的路径

现在就来解决这些问题，首先在命令行执行：

```powershell
jupyter notebook --generate-config
```

如果以前没有跑过这句命令，那么接下来应该会在用户名文件夹（例如C://Users/xxx/）下生成一个叫做.jupyter的文件夹，里面有一个jupyter_notebook_config.py文件，打开以后加入几行内容：

```python
# 指定默认打开的路径
c.NotebookApp.notebook_dir = "E://pycharm/pycharmProjects"
# 指定默认的浏览器,我用的是Chrome
import webbrowser # 要是没这个库就装一下
webbrowser.register('chrome', None, webbrowser.GenericBrowser(u'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'))
c.NotebookApp.browser = 'chrome'
```

若想要设置密码，还可以进行一项配置，先在命令行进入python，然后运行以下代码：



```python
from notebook.auth import passwd
passwd()
```

根据提示输入密码，会得到一串以sha1开头的字符串，将其复制过来，在配置文件中写入以下配置项即可：



```python
c.NotebookApp.password = 'sha1:xxxxxxx' # 生成的密码
```

接下来运行jupyter就会要求输入密码才能进入。


最后，我们当然不想每次都通过命令行界面来打开jupyter，我们可以在桌面建立一个.txt文件，并且写入以下内容



```bat
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
:begin
E:
jupyter notebook
```

其中倒数第二行的`E:`需要修改为你的jupyter安装盘符。


保存并重命名将此文件的后缀改成.bat，双击此文件就可以直接在浏览器中打开jupyter界面了！
