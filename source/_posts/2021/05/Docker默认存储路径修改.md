---
title: Docker默认存储路径修改
id: 5369
date: 2021-05-11 15:59:17
categories: [瞎捣鼓经历]
tags: ['Docker']
cover: 
disableNunjucks: true
---

随着我们长期使用docker，可能会遇到默认存储路径所在的分区装不下的情况，所以不如提前把默认存储路径改了，放到比较充裕的分区下。


这里以Ubuntu为例，先停止docker服务，然后进行以下操作：

修改文件：`/etc/systemd/system/docker.service.d/docker-overlay.conf` (如果没有`docker.service.d`文件夹或`docker-overlay.conf`文件则手动创建)


在文件中写入以下内容：

```bash
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --graph="new_docker_storage_path" --storage-driver=overlay
```

将graph参数引号内部分修改为你所希望的docker存储路径，保存退出文件。


启动docker服务，通过命令`docker info` 可查看存储路径是否修改成功。
