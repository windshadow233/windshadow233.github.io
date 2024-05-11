---
title: 手把手教你为Docker容器中的Apache2部署SSL证书
id: 2289
date: 2020-07-21 08:10:56
categories: [瞎捣鼓经历]
tags: ['Apache', 'Docker', 'Linux', 'SSL']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/21b54d45b96164d06f442d0fa981fbcd.png
disableNunjucks: true
---

为网站部署SSL证书不仅能提升网站的安全性，还可以在浏览器地址栏左侧添加一把“锁”，~~非常的美观和舒适~~。因此必须安排！但我由于对web服务、docker容器端口映射等运行机制不太熟，在部署过程中踩了很多坑，不过也一一填了回来，最终部署成功，在此记录一下部署的过程。

SSL是指安全套接字协议，借用百度词条的定义：

> SSL(Secure Sockets Layer 安全套接字协议),及其继任者传输层安全（Transport Layer Security，TLS）是为网络通信提供安全及数据完整性的一种安全协议。TLS与SSL在传输层与应用层之间对网络连接进行加密。
> 
> 
> [百度百科：SSL](https://baike.baidu.com/item/ssl)



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/21b54d45b96164d06f442d0fa981fbcd.png)



## 我的软件服务配置


- 服务器系统：Ubuntu18.04
- docker容器中系统：Debian
- web服务：apache2

## 申请并下载证书


我图方便直接去阿里云申请了一个免费的证书：DigiCert 免费版 SSL（能用就行，免费的真香），下载apache版本的证书到本地，然后将整个文件夹（重命名为ssl）上传到服务器。（文件夹中有3个文件，分别是xxx_public.crt、xxx_key与xxx_chain.crt）。SSL证书也可以通过Certbot来申请，详情可见[此文](/blog/7669/)。


使用命令将文件夹复制到WordPress容器的apache2目录下：

```bash
sudo docker cp ssl 容器名:/etc/apache2/
```

## 配置或修改docker容器端口映射


若尚未生成容器，则在生成的时候声明两个端口映射（80:80与443:443）即可。若已经生成了容器，并且端口映射不对，则参考下文。（其实只映射443:443也是可以的，我只是为了做http强制跳转https）


由于我之前是`0.0.0.0:80->80/tcp`，故需要再添加一条`0.0.0.0:443->443/tcp`。

**在进行下面的操作前先stop容器。**

```bash
# 进入容器文件夹内
cd /var/lib/docker/containers/容器哈希值
# 修改hostconfig.json
sudo vi hostconfig.json
```

找到`"PortBindings"`，并添加一条443端口映射：

```json
"PortBindings":{
    "443/tcp":[{"HostIp":"","HostPort":"443"}],
    "80/tcp":[{"HostIp":"","HostPort":"80"}]
}
```


```bash
# 修改config.v2.json
sudo vi config.v2.json
```

找到`"ExposedPorts"`，同样添加一条443端口：

```json
"ExposedPorts":{"443/tcp":{},"80/tcp":{}}
```


```bash
# 重启docker,然后开启容器
sudo systemctl restart docker
sudo docker start 容器id
# 查看容器运行情况
sudo docker ps
```

若看到容器的ports为 `0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp`两条，则端口已添加成功。

## 部署SSL

```bash
# 进入容器
docker exec -it 容器名 bash
# 开启ssl模块,首次运行可能需要按提示重启apache
a2enmod ssl
```

配置SSL证书

```bash
vi /etc/apache2/sites-available/default-ssl.conf
# 什么？command not found？跑一下下面几条命令装个vim就行了
# apt update
# apt install vim
```

在打开的文件中修改或添加以下几项：

```apache
SSLEngine on
SSLCertificateFile /etc/apache2/ssl/xxx_public.crt
SSLCertificateKeyFile /etc/apache2/ssl/xxx.key
SSLCertificateChainFile /etc/apache2/ssl/xxx_chain.crt
```

修改时请把证书文件名修改成自己的，然后保存退出，再做一个软连接，使得apache2能够加载到default-ssl.conf文件。

```bash
ln -s /etc/apache2/sites-available/default-ssl.conf /etc/apache2/sites-enabled/default-ssl.conf
```

## 强制http跳转https

```bash
# 开启rewrite模块,首次运行可能需要重启apache
a2enmod rewrite
vi /etc/apache2/sites-available/000-default.conf
```

在文件中的`<VirtualHost *80>`与`<VirtualHost>`标签之间加上以下代码（请自行修改其中网站主页的URL）：

```apache
<Directory "/var/www/html"> 
    RewriteEngine   on
    RewriteBase /
    # FORCE HTTPS
    RewriteCond %{HTTPS} !=on
    RewriteRule ^/?(.*) https://blog.fyz666.xyz$1 [R,L]
</Directory>
```

退出容器，并重启容器：

```bash
exit
sudo docker restart 容器id
```

至此，所有配置已经完成，最后需要检查一下服务器80、443端口是否开放。
