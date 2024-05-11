---
title: Django从入门到放弃:模型（数据库）
id: 1479
date: 2020-07-12 08:35:04
categories: [学习笔记]
tags: ['Django', 'Python', '数据库']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/7ce750f21a1a949f693f82901be584a4.png
disableNunjucks: true
---

## Models


模型是django对数据库的支持方式，一般写在`models.py`文件当中。Django支持的数据库有sqlite3、MySQL、PostgreSQL等，我用的是MySQL。

### 数据库配置


找到`settings.py`文件大约77行：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

可见默认的数据库为`sqlite3`，于是我把这些代码全注释掉，并换成以下：

```python
DATABASES = { 
    'default': 
    { 
        'ENGINE': 'django.db.backends.mysql', 
        'NAME': 'helloworld_db',# 数据库名
        'HOST': '127.0.0.1',# 数据库地址，若为本机则是127.0.0.1
        'PORT': 3306,# 数据库端口，MySQL默认3306
        'USER': 'root',# 数据库用户名
        'PASSWORD': '123456',# 用户名对应密码
    }  
}
```

另外在`settings.py`同级的`__init__.py`文件中写入：

```python
import pymysql # 需要装好这个库
pymysql.install_as_MySQLdb()
```

### 数据表迁移


这一块有点晕，我搞了好久才搞明白。


- `python manage.py makemigrations`命令会在所有app（或指定app）下的`migrations`文件夹中根据该app的`models.py`生成一些迁移文件（大概长这样：`0001_xxx.py`），若`models.py`较上一次使用该命令时没有变化，则会输出`No changes detected`。
- `python manage.py migrate`命令会根据所有app（或指定app）的迁移文件在数据库中生成数据表并进行同步。

以上两条命令都可以在最后添加某个app的名字，指定对该app进行单独操作。


Django自带有一些默认的app，这些app不需要`makemigrations`，查看`\Lib\site-packages\django\contrib`文件夹会发现每个自带的app例如auth、admin都已经自带上面的迁移文件了，不需要修改就可以使用。

`migrate`命令运行后，数据库中会生成一张名为`django_migrations`的表，用以记录目前已经迁移过的迁移文件，这会导致下次使用`migrate`命令时会跳过这些已经迁移过的文件，若想查看迁移文件可使用命令：

```powershell
python manage.py showmigrations
```

结果中左侧带[X]的文件即已经被迁移过的，带[ ]的文件则尚未被迁移过。


若要删除django_migrations中的迁移记录，有一些方法：


- 运行命令


```powershell
python manage.py migrate --fake app名 zero
```

- 简单粗暴直接在django_migrations表删除该app相关的迁移记录

不论使用哪种方法，都记得把数据库中的该app的相关表删掉，不然下次使用`migrate`的时候就会报`Tabel 'xxx' already exists`错误。


为了充分利用django自带的app模型，只要有需求，我每次创建完项目都会先跑一句`migrate`命令，把django自带的models迁移到数据库里面。


### 反向生成models


作为一个懒人，我怎么可能手打`models.py`，于是我翻出了一件神器：`inspectdb`命令，只要在数据库中预先建好表，然后运行：

```powershell
python manage.py inspectdb > models.py
```

就可以将所有数据库里的表反向转化为models.py文件供django使用。

`inspectdb`后面写上以空格分隔的表名，就可以只转换一部分表：

```powershell
python manage.py inspectdb [tabel1] [tabel2] > models.py
```

这里我实际操作的时候跳进了一个坑：我在反向生成models.py文件到一个app目录下后，运行服务时产生以下报错：

```raw
...
OSError: [WinError 123] 文件名、目录名或卷标语法不正确。: '<frozen importlib._bootstrap>'
```

根据网上大佬的博文，终于找到了根源。原来使用`inspectdb`生成的models.py默认是utf-16编码，需要改为utf-8。修改成功后项目就能正常运行了。


### Models的使用


从models.py文件中导入类，就可以轻松操作数据库进行增删改查，详细的接口直接查阅官方文档即可。
