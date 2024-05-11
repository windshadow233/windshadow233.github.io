---
title: Django从入门到放弃:模板与静态文件
id: 1459
date: 2020-07-12 04:38:52
categories: [学习笔记]
tags: ['Django', 'Python']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/7ce750f21a1a949f693f82901be584a4.png
disableNunjucks: true
---

## Templates


前文通过HttpResponse返回了一个简单到不能再简单的网页，但如果想要返回复杂一点的网页，应该怎么办呢？

当然你完全可通过`HttpResponse`返回一个巨大的html字符串，但这样让人感觉很不爽，其实可以预先把html文件写好放在一个templates文件夹里，后面直接返回这个文件就可以了。这就是django的模板功能。配置模板目录需要做以下两件事：


- 在项目根目录下创建文件夹templates
- 在settings.py第56行左右找到'DIRS'开头的代码并修改成下面这样：


```python
'DIRS': [BASE_DIR + '/templates', ],
```

使用方法：


templates文件夹下放入xxx.html


views.py文件添加：

```python
from django.shortcuts import render
```

视图函数中可以通过

```python
return render(request, 'xxx.html')
```

来直接返回这个模板页面。


`render`函数还支持向模板文件传递数据，例如：



```python
return render(request, 'hello.html', {'username': 'admin'})
```

接收方法：在模板文件中用一对双大括号包含字典的key，模板渲染时将其映射为value值。


可以在hello.html中这样写：

```markup
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
hello!{{ username }}
</body>
</html>
```

访问`http://127.0.0.1/hello/`时就会得到hello!admin页面。


模板文件所能做的远不止这些，其也支持控制流程序，例如也可以通过判断username是不是admin来进行一些其他操作：

```markup
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
{% if username == 'admin' %}
    <script>alert('Welcome!admin');</script>
{% else %}
    <script>alert('You are not admin');</script>
{% endif %}
</body>
</html>
```

上面举了一个模板中if语句的例子，当if语句成立时，模板将在网页上渲染第一个script，反之会渲染else后面的script。模板语法有一些和python差不多但也有很多其他独特的语法，另外所有模板代码语句都要放在`{% %}`之间


关于模板文件的其他语法，可以查看[菜鸟教程](https://www.runoob.com/django/django-template.html)或[官方文档](https://docs.djangoproject.com/en/5.0/ref/templates/language/)。


## Static


网站的静态文件包含了一系列css、JavaScript等文件，因此有着举足轻重之作用。Django项目中有特定的方式存放静态文件。


- 项目根目录下创建statics文件夹
- settings.py最后添加：


```python
STATICFILES_DIRS = [ 
    os.path.join(BASE_DIR, "statics"), 
]
```

manage.py包含了一句命令可以收集项目中用到的所有静态文件到statics文件夹下（这一步操作是为了部署网站时的方便）

```powershell
python manage.py collectstatic
```

然而我一运行就报错：

```raw
...
django.core.exceptions.ImproperlyConfigured: You're using the staticfiles app without having set the STATIC_ROOT setting to a filesystem path.
```

提示信息最后几行表示在settings.py中没有配置`STATIC_ROOT`这一参数，因此在文件最后添加：

```python
STATIC_ROOT = os.path.join(BASE_DIR, 'statics')
```

然后还需要把刚才添加的`STATICFILES_DIRS`几行先注释掉（这坑我已经掉下去过了）


然后重新跑前面的命令，statics文件夹下就会生成一个admin文件夹，它包含了admin界面所有静态文件。


然后把`STATIC_ROOT`一行注释掉，取消`STATICFILES_DIRS`几行的注释，就可以正常启动项目了！（这坑我也掉下去了）


### 模板中导入静态文件


在html文件的第一行写入：

```markup
{% load static %}
```

然后就可以按以下格式导入静态文件：

```markup
<script src="{% static 'admin/js/actions.js'%}"></script>
```

static即表示静态文件的目录statics，后面用单引号包含需要导入文件的相对路径即可。


注意双引号单引号以及一对`{% %}`缺一不可！！
