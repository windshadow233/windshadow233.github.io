---
title: Django从入门到放弃:路由与视图
id: 1456
date: 2020-07-12 04:20:19
categories: [学习笔记]
tags: ['Django', 'Python']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/7ce750f21a1a949f693f82901be584a4.png
disableNunjucks: true
---

## urls和views


urls.py文件其实定义了项目的路由，路由通俗来讲可以理解成网址去掉主机名之后的剩余部分。

urls.py文件中默认只定义了一个`path('admin/', admin.site.urls)`，可以尝试访问`http://127.0.0.1/admin/`，就可以看到一个登录页面，这个东西就是个网站后台数据库管理平台，以后再说。


当然我们可以加入自己的url，例如如果我们希望访问`http://127.0.0.1/hello`时得到一个写了helloworld的网页，就可以在urls.py中这么搞：


- 在导入部分添加：


```python
from . import views
```

- 在`urlpatterns`列表中添加：


```python
path('hello/', views.hello),
```

桥豆麻袋！？`views`是什么玩意？


views.py在django中被称为视图文件，其实就是包含了一些后端的逻辑，用来处理各种请求，`views.hello`意为views.py文件中的`hello`函数，新添加的`path('hello/', views.hello)`表示用`hello`函数来处理来自'hello/'路由的请求。但是这个文件夹下并没有自动生成views.py，需要手动建立一个与urls.py同级的views.py文件，并写入：

```python
from django.http import HttpResponse

# request参数必须加！！！不管后面有没有用到
def hello(request):
    return HttpResponse('helloworld')
```

这个时候，访问`http://127.0.0.1/hello/`就可以进入一个写了helloworld的页面了。


### app中的urls和views


在helloworld文件夹下的urls中做如下操作：


- 导入include函数


```python
from django.urls import include
```

- urlpatterns列表中添加一项：


```python
path('one_app/', include('one_app.urls')),
```

则'one_app/'成为网站根目录下应用one_app的子路径，同时one_app文件夹下的urls.py（app文件夹下没有生成urls.py，需要自己创建）中定义的路由将会拼接到'one_app/'后作为整个项目的url使用。例如若你在one_app/urls.py中定义了`path('hi/', views.xxx)`，那么你就可以通过访问`http://127.0.0.1/one_app/hi/`来获得`views.xxx`函数的响应。
