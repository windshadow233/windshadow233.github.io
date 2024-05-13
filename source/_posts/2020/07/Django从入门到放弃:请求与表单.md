---
title: Django从入门到放弃:请求与表单
id: 1490
date: 2020-07-13 05:10:26
categories: [学习笔记]
tags: ['Django', 'Python']
cover: https://blogfiles.oss.fyz666.xyz/png/74ed1633-65a1-49b3-ab82-111ecca3fa28.png
disableNunjucks: true
---

## Request


Django框架在收到web客户端请求的时候，会先判断请求的url，通过urls.py路由文件把该url映射到视图函数，然后执行视图函数的一系列操作，返回给客户端一个response。在前文中也已经定义过一些很简单的视图函数，容易发现它们都必须携带一个参数request（当然你可以任意起名，叫request只是因为传入的对象是一个WSGIRequest）。


这个request变量自带了一堆属性，例如method、GET、POST、user、session等。


其中通过`request.method`可以判断请求的方法，当请求方法为GET时，`request.GET`会返回一个QueryDict对象（和字典类似），其包含了该次请求的所有GET参数；POST方法同理。


`request.user`可以获得一个User对象，为当前登录的用户，以后讲到登录功能时再提。


## Form


表单通常用于发起POST请求（当然也可以GET），以下举一个django框架中表单的例子。


首先，在templates文件夹下放一个form.html，写入一个简单的登录表单：

```markup
<!DOCTYPE html>
<html>
<head>
	<title>form</title>
</head>
<body>
	<form action="#" method="POST">
		<input type="text" name="username" required>
		<input type="password" name="password" required>
		<input type="submit">
	</form>
</body>
<!-- 用于接收后端发来的message -->
{% if messages %}
     {% for message in messages %}
         <script>alert('{{ message }}');</script>
     {% endfor %}
{% endif %}
</html>
```

helloworld文件夹下的urls.py中在`urlpatterns`列表添加一项：

```python
path('login/', views.mylogin),
```

views.py添加导入与函数：

```python
from django.contrib import messages

def mylogin(request):
	if request.method == 'GET':
		return render(request, 'form.html')
        # 键取的是html中表单组件的name
	username = request.POST.get('username')
	password = request.POST.get('password')
	if username == 'admin' and password == 'adminpwd':
		messages.success(request, '登录成功！')
	else:
		messages.warning(request, '用户名或密码错误！')
	return render(request, 'form.html')
```

然后我们将项目运行在本地80端口，并访问`http://127.0.0.1/login/`，可以看到一个充满了简约风的表单页面，填入admin和adminpwd并提交即可。


提交以后网页显示

```raw
Forbidden (403)
CSRF verification failed. Request aborted.
...
```

这是说表单在提交时缺少CSRFtoken，是django默认带有的一种保护机制（正所谓防君子不防小人系列）。


解决这个问题有两种方法：


- 找到settings.py文件大约第42行，`MIDDLEWARE`参数中将第四项`django.middleware.csrf.CsrfViewMiddleware`注释掉。
- 在html表单里面添加`{% csrf_token %}`

这样就可以正常将提交到后端进行处理了。
