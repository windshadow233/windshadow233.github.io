---
title: Django从入门到放弃:后台管理工具
id: 1537
date: 2020-07-14 08:12:02
categories: [学习笔记]
tags: ['Django', 'Python']
cover: https://blogfiles.oss.fyz666.xyz/png/74ed1633-65a1-49b3-ab82-111ecca3fa28.png
disableNunjucks: true
---

Django提供了一套友好完善的web端后台数据可视化管理工具。

## Admin页面


如 [Django从入门到放弃:路由与视图](/blog/1456/) 一文中提到的，若你在urls.py的`urlpatterns`中添加了以下一项（默认是自带的）：

```python
path('admin/', admin.site.urls),
```

则你可以通过访问`http://127.0.0.1/admin/`进入一个登录界面，所有项目的超级管理员账号都可以在此登录。登录成功后，会看到所有已注册app及其已注册数据表的可视化。


这里举一个简单的例子，在one_app目录下的models.py中添加以下几行：

```python
from django.db import models


class Student(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'student'
```

并将其同步到本地MySQL数据库。然后在同级目录下的admin.py中添加：

```python
from django.contrib import admin
from .models import Student

# Register your models here.
admin.site.register(Student)
```

接下来就可以在Admin页面中看到新注册的数据表了。


对于初学者而言，这些基础的功能就已经足够用以管理后台数据了，更多复杂的操作后期按需求即学即用就行~
