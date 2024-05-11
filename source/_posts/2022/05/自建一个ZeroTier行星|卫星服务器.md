---
title: 自建一个ZeroTier行星/卫星服务器
id: 7728
date: 2022-05-13 13:36:14
categories: [瞎捣鼓经历]
tags: ['Docker', 'ZeroTier', '计算机网络']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/d58ca8a14bf0ab51e468e73dff6a037f.png
disableNunjucks: true
swiper_index: 1
description: P2P异地组网神器——ZeroTier的自部署方法
---

ZeroTier是一款好用的P2P虚拟局域网开源软件，通过它可以实现外网到内网设备的访问。本文从服务端到客户端一条龙搭建一个简单的ZeroTier虚拟局域网，实现从外网对内网树莓派的访问。




![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/d58ca8a14bf0ab51e468e73dff6a037f.png)
ZeroTier的优点有：


- 非常容易配置，只要拿到虚拟网络的ID，就可以加入网络，并自动分配IP地址，对小白具有亲和力。
- 虚拟网络内的设备端对端建立连接，不需要经过中转服务器，响应快，不受服务器带宽、流量限制。

但其缺点也很明显，其官方的服务器位于国外，直连状态下容易打洞失败，这样第二条优点便无法体现。


为了改善使用体验，我们可以通过搭建moon服务器进行加速，或者也可以直接建一个行星服务器（planet），来实现自己的ZeroTier服务。


## 前置条件


- 一台拥有公网IP的服务器
- 服务器上有docker、docker-compose（因为我后面的操作就是通过docker的，非docker部署法请自行谷歌）

## 服务端安装


因为有大佬开源的docker镜像[keynetworks/ztncui](https://hub.docker.com/r/keynetworks/ztncui)，因此安装的过程比较方便，但该镜像默认只提供一个管理平台，若直接使用该镜像而不加以任何修改，则并不能提供planet、moon服务器的作用，那就相当于白搭了，没有任何的意义。修改过程来自于[此issue](https://github.com/Jonnyan404/zerotier-planet/issues/11)，本人只是在自己博客上记录一下以防忘记。


### 修改docker-compose文件


首先，新建一个文件夹，并创建docker-compose.yml文件。



```bash
mkdir zerotier-planet && cd zerotier-planet && vi docker-compose.yml
```

作为根服务器，需要对外开放9993的tcp与udp端口，因此需要在docker-compose文件里加上端口映射并打开服务器防火墙的9993端口（tcp/udp），同时，将MYADDR的值改为服务器的公网ip（不写或许也行）：



```yaml
version: '2.0'
services:
    ztncui:
        container_name: ztncui
        restart: always
        environment:
            # - MYADDR=公网地址(不填自动获取)
            - MYADDR=x.x.x.x
            - HTTP_PORT=3443
            - HTTP_ALL_INTERFACES=yes
            - ZTNCUI_PASSWD=password
        ports:
            - '3443:3443'
            - '9993:9993'
            - '9993:9993/udp'
        volumes:
            - './zerotier-one:/var/lib/zerotier-one'
            - './ztncui/etc:/opt/key-networks/ztncui/etc'
        image: keynetworks/ztncui

```

### 启动容器



```bash
docker-compose up -d
docker exec -it ztncui bash  # 进入容器
```

### 生成moon文件



```bash
cd /var/lib/zerotier-one
# 生成moon配置文件
zerotier-idtool initmoon identity.public > moon.json
chmod 777 moon.json
vi moon.json
```

若容器内没有vim，可在宿主机编辑文件（宿主机上有容器内的路径挂载）。


将`"stableEndpoints": ["127.0.0.1/9993"]`中的本地ip修改为公网ip。


如果将服务器作为moon使用，则需要继续在容器内执行下面命令生成moon文件：



```bash
zerotier-idtool genmoon moon.json
mkdir moons.d
cp *.moon moons.d/
```

### 生成planet文件


如果将服务器作为planet使用，则需要进行下面的步骤。


回到容器外，下载[此可执行文件](https://github.com/kaaass/ZeroTierOne/releases/tag/mkmoonworld-1.0)，放置于moon.json相同路径下，执行命令：



```bash
chmod +x mkmoonworld-x86_64
./mkmoonworld-x86_64 moon.json
mv world.bin planet
```

即可生成planet文件，将此文件复制一份到容器内：



```bash
docker cp planet ztncui:/var/lib/zerotier-one
```

重启容器，服务端配置完成。



```bash
docker restart ztncui
```

## 配置虚拟网络


打开服务器3443端口后，在浏览器访问http 3443端口即可进入网站。



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/79f0bc00d67a5e8ce9bfd5fff36b890b.png)
默认用户名和密码分别是：admin与password，在登录以后修改默认密码。


然后选择Add network，为我们的虚拟网络随便取一个名。因为我用的是阿里云的服务器，因此取名为了aliyun-net。然后我们选择Easy setup，进行网段的配置：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/e8060886baabdf99342fdef1af7e2788.png)
网段配置比较随意，怎么开心怎么配，但我认为使用一些不常用的网段会比较好，我这里配置了10.10.10.0/24网段。（然而10.10.10.0/24也并不算少见，例如我有一次连上朋友家WiFi以后发现无法通过ZeroTier访问实验室的服务器，搞了半天发现原来他们家WiFi内网网段居然也是10.10.10.0/24。。）


如此一来，最基本的配置过程已经结束。接下来只需要下载客户端以接入我们的虚拟网络。


## 客户端配置


ZeroTier在大部分操作系统上都有对应的客户端软件，非常方便，这里我在树莓派上安装，只需要一条命令：



```bash
curl -s https://install.zerotier.com/ | sudo bash
```

安装完成后，我们将前面生成的planet文件放到树莓派的/var/lib/zerotier-one/目录下，替换原有的planet，并重启zerotier-one服务，执行命令`zerotier-cli listpeers`，如果列出的条目中只有一条ip为前面设置的服务器公网ip的planet，就意味着planet文件生效了，接下来可以执行下面命令加入虚拟网络：



```bash
sudo zerotier-cli join [network ID]
```

稍等片刻，我们可以在前面的服务端网站上发现一个新的member，为其勾选Authorized，即可让它加入虚拟网络，我们可以为其手动或自动分配一个IP地址。



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/51bb03a982ecafb8cc899cb0953dc45b.png)
如上图，在其他加入该网络的设备上，访问IP地址10.10.10.2即可访问到我的树莓派。后面文章将介绍如何通过在OpenWrt路由器上配置ZeroTier与防火墙规则以实现外网访问整个局域网。




---

当然，自建行星服务器也有缺陷，例如手机端的软件目前不支持自行导入planet文件（iOS系统上的ZeroTier软件甚至连moon文件都无法自行配置），如果有手机使用ZeroTier的需求，建议还是自建moon节点进行转发。


## 将上述Planet服务器作为Moon的方法


首先，我们不需要手动修改docker容器里的planet文件，也即不需要执行前面的这一步：



```bash
docker cp planet ztncui:/var/lib/zerotier-one
```

如果执行过了，进入容器（或在本地挂载目录下）将planet文件删去，然后重启此docker容器。


同理，客户端的zerotier配置目录下（Ubuntu下是/var/lib/zerotier-one/）不需要手动修改planet文件，如果修改了，则删去。然后，在客户端的zerotier配置目录下创建moons.d目录，并将前面生成的moon文件复制到里面。最后重启zerotier服务。


在客户端终端执行



```bash
zerotier-cli listpeers
```

若能看到MOON节点，则表示配置成功。
