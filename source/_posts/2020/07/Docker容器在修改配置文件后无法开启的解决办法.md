---
title: Docker容器在修改配置文件后无法开启的解决办法
id: 2018
date: 2020-07-18 15:50:49
categories: [Debug]
tags: ['Docker']
cover: 
disableNunjucks: true
---

Linux系统下，通常我们可以通过命令


```bash
sudo docker exec -it 容器名 bash
```

进入正在运行的docker容器中，并在容器内使用命令进行各种操作，但一旦不慎操作出了问题，把配置文件搞崩了，导致容器无法开启（也就无法运行上面的命令进入容器内部），此时可以使用以下方法：


Docker容器中的文件一般都位于`/var/lib/docker/overlay`文件夹下，找到容器对应的文件夹再修改出问题的文件即可。
