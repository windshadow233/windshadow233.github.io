---
title: ShareLaTeX服务器部署
id: 186
date: 2020-06-29 15:58:19
categories: [瞎捣鼓经历]
tags: ['Docker', 'LaTeX', 'Linux', 'ShareLaTeX']
cover: https://blogfiles.oss.fyz666.xyz/png/0d3f06e7-cb37-45bc-ba10-83be963d3537.png
disableNunjucks: false
---

Overleaf是一款功能强大的多人共享在线latex编译器，很多人都会在上面编辑论文，但由于长城防火墙的存在，在国内访问这一部署于国外的网站通常响应缓慢。因此有必要自己搭建一下类似的服务以方便各类论文、文档的撰写。

写这篇文章时，博主本人还是一个Linux小白（对着Shell黑框框不知道这玩意能干啥的那种），因此在搭建过程中踩了不少的坑，在一一爬出这些坑，最终搭建成功以后，本人写了一点经验如下文所示。

![](https://blogfiles.oss.fyz666.xyz/png/0d3f06e7-cb37-45bc-ba10-83be963d3537.png)

本文参考自这篇文章：

{%link Docker部署ShareLaTeX,m.mamicode.com,http://m.mamicode.com/info-detail-2959302.html %}

## 主要软硬件依赖


- 阿里云轻量应用服务器学生机一台（系统镜像：Ubuntu18.04，1核CPU 2G内存 40G系统盘 5Mbps峰值带宽），用学生机主要是因为穷
- Docker 社区版，版本19.03.12

## 安装Docker


首先使用SSH工具连接服务器（什么？你还不知道SSH是啥？~~其实我当时零基础确实不知道~~[点击了解一下](https://zh.wikipedia.org/wiki/Secure_Shell)，这里我用了阿里云控制台的实例远程连接功能，非常的方便）。接下来，由于我们的ShareLaTeX是要部署在docker容器中的，因此先安装一下社区版的docker。

{% tabs tab1 %}

<!-- tab 通过脚本快速安装 -->


目前有许多docker的安装脚本，例如Ubuntu系统可以直接执行下面代码：

```bash
wget -qO- https://get.docker.com/ | sudo sh
```
<!-- endtab -->

<!-- tab 按部就班的普通安装 -->


非脚本化的安装方法如下：


安装之前为了提升安装的速度，先设置一下Ubuntu的apt源。

```bash
sudo vi /etc/apt/sources.list
```

在上述打开的文件中添加以下几行：

```plaintext
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable
```

再更新一下apt的可获取软件及其版本信息，并安装一些基本依赖。

```bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

添加docker官方的GPG Key

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg|apt-key add -
```

运行以下命令：



```bash
apt-key fingerprint 0EBFCD88
```

若输出以下信息则意味着成功：



```raw
pub rsa4096 2017-02-22 [SCEA]
9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88
uid [ unknown] Docker Release (CE deb) docker@docker.com
sub rsa4096 2017-02-22 [S]
```

设置稳定的存储库：



```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

接下来可以安装docker了，同时为了方便起见，再安装一个docker-compose，后者可以轻松高效地管理docker容器，通常用于定义、运行多容器 docker 。



```bash
sudo apt install docker-ce
sudo apt install docker-compose
```

<!-- endtab -->

{% endtabs %}

以上命令结束后，如果你从未用过docker，可以使用以下命令简单体验一下：



```bash
sudo docker run -d -p 80:80 daocloud.io/daocloud/dao-2048:master-a2c564e
```

命令执行完毕后，先在阿里云实例防火墙打开80端口，然后在浏览器中访问`http://ip`，若你打开了一个2048小游戏，那么恭喜你可以进入下一步了！


修改docker镜像源



```bash
sudo vi /etc/docker/daemon.json
```

在打开的文件中添加以下内容：



```json
{
    "registry-mirrors": ["https://2lqq34jg.mirror.aliyuncs.com"]
}
```

## 拉取ShareLaTeX镜像



```bash
sudo docker pull ShareLaTeX/ShareLaTeX
```

接下来需要下载一个docker-compose.yml文件，内容是ShareLaTeX及依赖数据库容器的配置。


点击[官方链接](https://raw.githubusercontent.com/overleaf/overleaf/main/docker-compose.yml)获取该文件。


官方链接打不开的可以从[此处打开](https://pan.baidu.com/s/1c-u6DyRrJidJi-tEO4t_Uw)，提取码：y26d



```bash
mkdir -p ~/ShareLaTeX  # 在用户目录下创建一个ShareLaTeX文件夹，以方便区分
cd ~/ShareLaTeX
```

将刚才下载的docker-compose.yml文件放入~/ShareLaTeX文件夹下。服务将部署在服务器的80端口，若你想要修改，则将ports后面第一个80修改为你需要的端口即可。其他的几条比较有用的配置项我列在了下面：


- ShareLaTeX_ADMIN_EMAIL # 管理员邮箱，用以替换默认的placeholder@example.com
- ShareLaTeX_SITE_URL # 站点链接（用以在邮件中生成可以打开的超链接）
- ShareLaTeX_EMAIL_FROM_ADDRESS # 发送邮件的邮箱，若不设置则不开启邮件功能
- ShareLaTeX_EMAIL_SMTP_HOST # 邮箱的SMTP服务器
- ShareLaTeX_EMAIL_SMTP_PORT # SMTP服务器端口
- ShareLaTeX_EMAIL_SMTP_SECURE # 若使用SSL则设为"true"
- ShareLaTeX_EMAIL_SMTP_USER # 用户名，与前面的邮箱相同即可
- ShareLaTeX_EMAIL_SMTP_PASS # 邮箱提供的身份认证码（不一定是邮箱密码）
- ShareLaTeX_EMAIL_SMTP_TLS_REJECT_UNAUTH # 设为"true"
- ShareLaTeX_EMAIL_SMTP_IGNORE_TLS # 设为"false"

接下来运行docker-compose。



```bash
sudo docker-compose up -d
```

如果遇到端口冲突问题，请检查一下本地端口的占用情况。


命令运行完毕后，需要进一步升级安装完整版的Texlive



```bash
sudo docker exec -it ShareLaTeX bash  # 进入ShareLaTeX容器
cd /usr/local/texlive
wget http://mirror.ctan.org/systems/texlive/tlnet/update-tlmgr-latest.sh
sh update-tlmgr-latest.sh -- --upgrade
# 更换Texlive下载源，不然会慢的一批
tlmgr option repository https://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/tlnet/
# 升级tlmgr
tlmgr update --self --all
# 更新字体缓存
luaotfload-tool -fu
# 最关键也是耗费时间最长的一步，安装完整版的texlive
tlmgr install scheme-full
```

上面命令如果之前没换镜像可以跑三四个小时，换了镜像的情况下几十分钟内应该就结束了，命令运行过程中不要断开SSH，如果一定要断开，可以把上面最后一条命令换成：



```bash
nohup tlmgr install scheme-full &
```

安装完以后退出ShareLaTeX命令行并重启容器



```bash
exit
sudo docker restart ShareLaTeX
```

接下来就可以愉快地进入浏览器访问`http://[服务器ip]`，如果前面运行成功，你会看到overleaf的界面（如果遇到502 Bad Gateway，稍等片刻再访问即可）。进入`http://[服务器ip]/launchpad`创建你的admin账户，登录网站，ShareLaTeX就可以正常使用啦。


但是目前的ShareLaTeX可能不支持中文和各种字体，需要进一步配置。


## 配置中文环境与字体


将Windows自带的fonts（C://windows/fonts）上传到服务器的根目录下。



```plaintext
cd /fonts  # 进入目录
rm -r *.fon  # 删除所有.fon文件
cd ..
tar -zcvf fonts.tar.gz fonts/  # 打包字体文件
sudo docker cp fonts.tar.gz ShareLaTeX:/root  # 将打包后的文件传入ShareLaTeX容器的root目录下
sudo docker exec -it ShareLaTeX bash
sudo apt-get install xfonts-wqy
cd ~  # 进入root目录
tar -zxvf fonts.tar.gz  # 解压字体文件，移动到/usr/share/fonts/目录下
sudo mv fonts /usr/share/fonts/
cd /usr/share/fonts/fonts/
# 以下安装字体
mkfontscale
mkfontdir
fc-cache -fv
# 检查中文字体是否安装成功
fc-list :lang=zh-cn
```

至此，中文字体已经可以使用了，全部部署工作就此完成！
