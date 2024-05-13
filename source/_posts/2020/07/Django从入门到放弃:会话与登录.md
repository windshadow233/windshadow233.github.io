---
title: Django从入门到放弃:会话与登录
id: 1508
date: 2020-07-13 06:24:44
categories: [学习笔记]
tags: ['Django', 'Python']
cover: https://blogfiles.oss.fyz666.xyz/png/74ed1633-65a1-49b3-ab82-111ecca3fa28.png
disableNunjucks: true
---

## Session


首先引用百度百科对session的解释：


> Session：在计算机中，尤其是在网络应用中，称为“会话控制”。Session对象存储特定用户会话所需的属性及配置信息。这样，当用户在应用程序的Web页之间跳转时，存储在Session对象中的变量将不会丢失，而是在整个用户会话中一直存在下去。当用户请求来自应用程序的 Web页时，如果该用户还没有会话，则Web服务器将自动创建一个 Session对象。当会话过期或被放弃后，服务器将终止该会话。Session 对象最常见的一个用法就是存储用户的首选项。例如，如果用户指明不喜欢查看图形，就可以将该信息存储在Session对象中。有关使用Session 对象的详细信息，请参阅“ASP应用程序”部分的“管理会话”。注意会话状态仅在支持cookie的浏览器中保留。
> 
> 
> [百度百科：session（计算机术语）](https://baike.baidu.com/item/Session/479100)


个人对session的理解是：在用户登录成功时，服务器生成一个不易伪造的sessionid，发送到客户端，依靠cookie存放在浏览器中，用户在接下来的所有请求中，都带上这个cookie，服务器通过比对用户发来的sessionid对用户的身份进行判断。


Django作为比较完善的web框架自然也带了这个功能。


## Login


很多网站都会要求用户进行登录，以便在后期根据用户身份进行不同的操作。Django则自带了一个用户认证的框架与数据模型，可以说是相当的方便了。


以下结合django的登录功能与会话功能实现一个简单的用户认证。

```bash
# 创建一个超级管理员
python manage.py createsuperuser
```

随后你可以在数据库的auth_user表中见到新创建的超级管理员用户。超级管理员除了权限比较高，拥有项目后台的全部权限外，在认证、登录功能方面和普通用户别无两样。


接下来在views.py中添加或修改以下代码：

```python
# 导入重定向函数
from django.shortcuts import redirect
# login函数用于登录,authenticate函数用于用户验证
from django.contrib.auth import login, authenticate
# 导入diango自带的User类(默认与数据库中的auth_user表进行连接)
from django.contrib.auth.models import User

# 对hello函数进行修改
def hello(request):
	# 判断用户是否登录
	if not request.user.is_authenticated:
		messages.warning(request, '滚！')
		return redirect('/login')
	username = request.user.username
	# 随时取用session里面的键值对,在控制台查看输出结果
	print(request.session.get('is_login'))
	return render(request, 'hello.html', {'username': username})

# 对mylogin函数进行修改
def mylogin(request):
	if request.method == 'GET':
		return render(request, 'form.html')
	username = request.POST.get('username')
	password = request.POST.get('password')
	# 验证用户名与用户,authenticate函数在密码验证通过且该用户的is_active字段值为1时返回一个User对象,否则返回None
	user = authenticate(username=username, password=password)
	if user:
		# 用内置函数进行登录,该函数会自动生成一个sessionid记录在数据库中
		login(request, user)
		# 自己也可以往session里面放一些键值对随时取用
		request.session['username'] = username
		request.session['is_login'] = 1
		# 设置session的失效时间,单位为秒,设为0则浏览器关闭时失效
		request.session.set_expiry(600)
		messages.success(request, '登录成功！')
		# 重定向到/hello
		return redirect('/hello')
	messages.warning(request, '用户名或密码错误！')
	return redirect('/login')
    
```

修改hello.html如下：

```markup
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
hello!{{ username }}
{% if messages %}
     {% for message in messages %}
         <script>alert('{{ message }}');</script>
     {% endfor %}
{% endif %}
</body>
</html>
```

