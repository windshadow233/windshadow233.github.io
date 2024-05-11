---
title: Django从入门到放弃:项目的目录结构
id: 1384
date: 2020-07-11 14:07:16
categories: [学习笔记]
tags: ['Django', 'Python']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/7ce750f21a1a949f693f82901be584a4.png
disableNunjucks: false
---

## 前言


大约半年多以前，我莫名其妙的对web开发产生了一些兴趣，通过对这个从未涉足过的领域的一点点简单了解，我认识到一个事实：~~PHP是最好的语言~~，作为一名Pythoner，我是不会承认的。

另外我深知Python比较擅长的领域包含：“数据挖掘”、“爬虫”、“人工智能”、~~“Web开发”~~……emmmmm，虽然如此，但懒得学习其他语言的我仍然选择使用python作为后端开发语言，何况也有不少大型网站是用python作为后端语言的，例如“豆瓣”、“NASA官网”等等，这也给了我一些学习的底气。


通过一些了解，我发现目前有四种主流的python web框架，分别是Flask、Django、Tornado和Twisted，一通仔细了解以后，发现Django的开发效率似乎独占鳌头（作为一名懒人且小白，还有什么比效率高更诱人的），因此毫不犹豫地选择了django。关于django，它有着非常详细的官方文档，同时网上大佬们的相关博文多如牛毛，我作为一个后来者，就用这个系列记录一下作为一个web领域的小白在学习django框架的过程中遇到的知识点和问题的解决，不会讲很多django框架的细节，目的是希望能给到初学者一些更为通俗友好的经验，使初学者快速入门，了解框架构成、快速脱离某些坑。

本系列主要参考自：

{%link Django 2.0文档,docs.djangoproject.com,https://docs.djangoproject.com/zh-hans/2.0/intro/ %}

{%link Django教程,runoob.com,https://www.runoob.com/django/django-tutorial.html %}

## 安装Django


一开始不懂，随便安装了一个，版本是2.2.5（后来网站搭完以后发现还有3版本，但好像有一些代码不兼容的地方，就懒得换了，反正2也够用），以下用的是win10系统。

```bash
pip install django==2.2.5
```

安装完成以后，跑一下django-admin命令看看这个命令存不存在，要是不存在，就检查一下python安装目录下的script文件夹路径在不在环境变量里。

## 生成第一个django项目

```bash
django-admin startproject helloworld
```

跑完这句命令以后，在当前目录下就会生成一个叫helloworld的文件夹，可以使用tree命令来查看其目录结构：

```powershell
tree helloworld /f
# 顺便进入项目根目录下
cd helloworld
# 目录结构
```


```raw
│ manage.py
│
└─helloworld
        asgi.py
        settings.py
        urls.py
        wsgi.py
        __init__.py
```

比较重要的初始文件有项目命令行脚本manage.py，helloworld子目录下的settings.py以及urls.py，其他文件以后用到了再提。


manage.py文件提供了当前项目中的很多命令行操作，一般命令都长这样：

```powershell
python manage.py 子命令
# 例如runserver子命令可以运行该项目,并指定端口号，默认为8000
python manage.py runserver 0.0.0.0:80
```

如果看到下面这段英文，就可以去浏览器上访问`http://127.0.0.1/`，如果看到一个小火箭的页面，就意味着项目初始化没有任何问题。

```raw
Watching for file changes with StatReloader
Performing system checks...
System check identified no issues (0 silenced).
You have 17 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.
Run 'python manage.py migrate' to apply them.
July 11, 2020 - 23:17:25
Django version 2.2.5, using settings 'helloworld.settings'
Starting development server at http://0.0.0.0:80/
Quit the server with CTRL-BREAK.
```

另外如上面的提示信息：`Django version 2.2.5, using settings 'helloworld.settings'`所示，helloworld子文件夹下面的settings.py中包含了该项目中的一些基本设置，目前完全不需要搞明白每一个参数具体是什么意思，需要的时候再一一了解即可。


### App


app是项目中带有一定集成功能的子模块，一个项目可以由很多app组成，比如登录模块等。

```powershell
# manage.py自带的startapp app_name 指令可以生成一个app
python manage.py startapp one_app
tree one_app \f
```


```raw
│  admin.py
│  apps.py
│  models.py
│  tests.py
│  views.py
│  __init__.py
│
└─migrations
        __init__.py
```

一个app的目录结构如上。


接下来需要注册app，似乎是为了之后的admin页面与数据库相关操作能够正常进行。打开settings.py找到第33行，在`INSTALLED_APPS`列表最后添加：

```python
'one_app',
```