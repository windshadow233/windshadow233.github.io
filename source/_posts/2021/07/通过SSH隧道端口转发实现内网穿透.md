---
title: 通过SSH隧道端口转发实现内网穿透
id: 5613
date: 2021-07-24 15:54:46
categories: [瞎捣鼓经历]
tags: ['Linux', 'SSH', '内网穿透', '计算机网络']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpg/5e417812f0fe6017672c1eee36379693.jpg
disableNunjucks: true
---

前面介绍了一种[使用V2ray实现的内网穿透方法](https://blog.fyz666.xyz/blog/5473/)，虽然达成了目的，但有诸多不足，例如必须在两台设备上同时运行V2ray，配置文件比较难懂等。尤其是对平时没有科学上网需求（自然也没有科学上网经历）的同学而言，下载V2ray本就是件令人头疼的事。



但事实上，常用的ssh命令也可以用来搞内网穿透，只需要一条命令即可。


现在假设我们面临如下图所示的一种情形：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpg/5e417812f0fe6017672c1eee36379693.jpg)

左侧蓝色框内为家里的局域网，其中包含了一台运行80端口Web服务的服务器Server C，其内网IP为192.168.1.100，通过路由器的NAT地址转换接入Internet。右侧绿色框内为外部的互联网，其中有一台拥有公网IP地址（1.2.3.4）的服务器Server B。另有一台能访问互联网，但未接入左侧局域网的设备Laptop A。现Laptop A想通过连接Server B的8080端口来访问Server C80端口上的Web服务。


可见该情形就是最一般的内网穿透情形，在上面的网络拓扑结构中，既然Server B拥有公网IP，我们可以不过分地假设Server C能通过SSH与Server B建立连接，其中，Server B的SSH登录用户名为user。另外，只要Server B愿意，Laptop A也可以正常访问到它，那么就可以通过在Server C到Server B之间建立SSH隧道，来实现Laptop A对Server C的访问。


接下来先简单介绍一下ssh命令中的端口转发功能，这里用到的端口转发称为所谓的“远程端口转发”，另外还有“本地端口转发”等。“远程端口转发”命令常用格式如下：



```bash
ssh -R [bind_address:]port:host:hostport user@ip
```

-R表示remote，bind_address和port表示远程主机上的监听地址、端口对，host和hostport表示目标主机服务的地址、端口对，user与ip分别表示远程主机的用户与公网IP。其中bind_adderss可以省略，在省略情况下，该值相当于0.0.0.0，即监听所有地址。


上面的命令达到的目的是，将对公网主机Server B的port端口的访问转发到对内网主机Server C（host）的hostport端口的访问。


具体实现方法为（以拓扑图内的IP地址为例）：


在Server C上运行命令：



```bash
ssh -R 8080:localhost:80 user@1.2.3.4
```

8080是Laptop A访问Server B时用到的端口，localhost和80表示转发的端口是位于本地的80端口，后面的user、1.2.3.4即ssh用户、IP地址对。


如果Server C因为某些原因没办法运行ssh命令，可以在局域网中接入一台Linux，然后在该设备上运行命令：



```bash
ssh -R 8080:192.168.1.100:80 user@1.2.3.4
```

能达到相同的效果。


不过，这样运行命令，会在设备上打开一个shell终端，如果关闭了终端，也将切断建立的SSH隧道，有一点不方便，为了避免之，可以将命令改成如下：



```bash
ssh -fNR 8080:localhost:80 user@1.2.3.4
```

新增参数-f表示将SSH转入后台运行，-N表示只连接远程主机，不打开远程shell终端。


在实际使用时，除了远程主机防火墙放行所需的8080端口外，还需要对SSH服务进行配置：


远程主机Server B需要修改sshd_config文件：



```bash
sudo vi /etc/ssh/sshd_config
```

将文件中的GatewayPorts项设置为yes，该配置表示允许任何人连接到转发的端口，否则将只有远程主机自身可以连接。


另外由于一段时间不发送数据包会导致SSH连接自动中断，为了保持SSH的长连接，一般可以从服务端或客户端进行配置，我感觉在客户端配置更灵活一些，即配置在发起SSH连接的设备上，如下：


Server C修改ssh_config文件：



```bash
sudo vi /etc/ssh/ssh_config
```

在文件的Host \*下面加上ServerAliveInterval项：



```plaintext
Host *
    ServerAliveInterval 60
```

该配置使得客户端每隔60秒向服务器发送一个KeepAlive请求，若服务器发出响应，则保持连接。




---

经过实测，使用该方法进行内网穿透需要稳定持续的网络连接作为保证，我在校园网状态下，一旦切换网络流量出口便会导致SSH隧道断开。
