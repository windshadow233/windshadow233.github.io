---
title: 一句命令部署WordPress
id: 4518
date: 2020-08-23 16:27:11
categories:
  - [博客相关]
tags: ['Docker', 'WordPress']
cover: 
disableNunjucks: true
---

写了许多WordPress相关的文章，但迟迟没有写部署的方法，目前比较简单的部署方法有宝塔面板一键部署或直接使用WordPress应用镜像。

而考虑到宝塔面板需要额外预留大约0.5G内存且最近刚出来一个非常严重的数据库安全漏洞（无法预知以后还会不会有）；直接装WordPress应用镜像过于无脑。因此我在这里介绍一条被很多人忽略的部署方法——使用docker。


关于docker软件的安装及容器的部署过程，我已经在[ShareLaTeX部署](/blog/186/)中提过一次了，这里不再做特别详细的介绍。


WordPress容器的配置文件可以参考下面内容，并根据需求自行修改配置文件：

```yaml
version: '3.1'

services:
    WordPress:
        image: WordPress
        restart: always
        ports: 
            - 80:80
        environment:
            WordPress_DB_HOST: db
            WordPress_DB_USER: root
            WordPress_DB_PASSWORD: *******
            WordPress_DB_NAME: WordPress_db
        volumes:
            - ./www/html:/var/www/html
    db:
        image: mysql:8.0
        restart: always
        environment:
            MYSQL_DATABASE: WordPress_db
            MYSQL_ROOT_PASSWORD: *******
        volumes:
            - ./mysql:/var/lib/mysql
```


将该文件写入`docker-compose.yml`，并放置在一个目录下，然后在该目录下执行命令：

```bash
docker-compose up -d
```

稍等片刻，就可以在浏览器中进入WordPress设置页面了！


若访问不了网站请检查服务器端口有没有打开。
