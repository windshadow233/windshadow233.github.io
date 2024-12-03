---
title: 自建docker-mailserver邮件服务器
id: 9930
date: 2024-03-20 17:06:36
categories: [瞎捣鼓经历]
tags: ['Docker', 'Docker-mailserver', 'Email']
cover: https://blogfiles.oss.fyz666.xyz/png/69767e44-ab15-4b61-a5f5-a6567361e09b.png
disableNunjucks: true
swiper_index: 1
description: 用docker部署了个邮件服务器～
---

大约两年前我就想过整一个自己域名的邮件服务，这样就可以随意注册邮箱账号了，~~而且看上去很帅~~。然而这件事却一拖再拖，到今天总算是整上了，于是就在这里记录一下整的过程。

![](https://blogfiles.oss.fyz666.xyz/png/69767e44-ab15-4b61-a5f5-a6567361e09b.png)
我所使用的服务器是腾讯云的轻量应用服务器，地域在新加坡，配置是最low的2核2G入门型，由于配置比较低还跑了一些其他的服务，我只能放弃一些诸如mailcow这样的选项，最后选择的是比较轻量的[docker-mailserver](https://github.com/docker-mailserver/docker-mailserver/)，不开启反病毒功能的前提下内存占用比较少。


## 一些约定


为了方便描述，本文中出现的下面内容均为示例，需要替换为实际值。


- 一级域名：example.com
- 邮件服务器域名：mail.example.com
- 主机IP地址：1.2.3.4
- 邮件用户名：admin
- 邮件用户密码：password

涉及到的所有DNS解析，均只写主机名，而省略一级域名example.com。


## 开启端口


邮件服务器需要用到的端口非常多，首先需要确保没有其他进程占用这些端口，并将它们打开：


- 25：SMTP（显式TLS端口，不可用于身份认证）
- 143：IMAP4（显式TLS端口）
- 465：ESMTP（隐式TLS端口）
- 587：ESMTP（显式TLS端口）
- 993：IMAP4 (隐式TLS端口)
- 110：POP3
- 995：POP3（TLS端口）

其中25端口被一些国内主机商默认封锁，需要手动申请解封。我的服务器好像没有封，于是直接就用起来了。


对于这些乱七八糟的端口的理解可以参考[这个链接](https://docker-mailserver.github.io/docker-mailserver/latest/config/security/understanding-the-ports/#overview-of-email-ports)。


## 解析DNS


在开始之前，需要做几条基本的DNS解析。


- A记录：`mail -> 1.2.3.4`
- MX记录：`mail -> mail.example.com`

## 正式开始安装

### 下载、修改配置文件

```bash
mkdir mailserver && cd mailserver

DMS_GITHUB_URL='https://raw.githubusercontent.com/docker-mailserver/docker-mailserver/master'
wget "${DMS_GITHUB_URL}/compose.yaml"
wget "${DMS_GITHUB_URL}/mailserver.env"
wget "${DMS_GITHUB_URL}/setup.sh"

chmod +x setup.sh
```



---

修改compose.yaml：

```yaml
services:
  mailserver:
    image: ghcr.io/docker-mailserver/docker-mailserver:latest
    container_name: mailserver
    # Provide the FQDN of your mail server here (Your DNS MX record should point to this value)
    hostname: mail.example.com
    env_file: mailserver.env
    # More information about the mail-server ports:
    # https://docker-mailserver.github.io/docker-mailserver/latest/config/security/understanding-the-ports/
    # To avoid conflicts with yaml base-60 float, DO NOT remove the quotation marks.
    ports:
      - "25:25"    # SMTP  (explicit TLS => STARTTLS, Authentication is DISABLED => use port 465/587 instead)
      - "143:143"  # IMAP4 (explicit TLS => STARTTLS)
      - "465:465"  # ESMTP (implicit TLS)
      - "587:587"  # ESMTP (explicit TLS => STARTTLS)
      - "993:993"  # IMAP4 (implicit TLS)
      - "110:110"  # POP3
      - "995:995"  # POP3 (with TLS)
    volumes:
      - /root/.certificates/:/etc/letsencrypt/  # 挂载证书
      - ./docker-data/dms/mail-data/:/var/mail/
      - ./docker-data/dms/mail-state/:/var/mail-state/
      - ./docker-data/dms/mail-logs/:/var/log/mail/
      - ./docker-data/dms/config/:/tmp/docker-mailserver/
      - /etc/localtime:/etc/localtime:ro
    restart: always
    stop_grace_period: 1m
    # Uncomment if using `ENABLE_FAIL2BAN=1`:
    cap_add:
      - NET_ADMIN
    healthcheck:
      test: "ss --listening --tcp | grep -P 'LISTEN.+:smtp' || exit 1"
      timeout: 3s
      retries: 0
```

这里我将主机上已经有的域名证书直接挂载到了容器内，以便容器内的邮件服务对其进行读取，如果还没有证书，则也可以在后面设置用Let's Encrypt获取。


另外添加了POP3的两个端口映射。


---

修改mailserver.env：

```ini
...
ENABLE_POP3=1  # 开启POP3协议
...
SSL_TYPE=manual  # 指定SSL证书类型，manual表示手动指定路径，这里可以改成letsencrypt（自动获取）

# 如果是manual，则手动填写下面的路径
SSL_CERT_PATH=/path/to/fullchain.pem
SSL_KEY_PATH=/path/to/privkey.pem
```

### 设置邮件账户


这个邮件服务在启动之前得预先设置一个邮件账户。

```bash
./setup.sh email add admin@mail.example.com password
./setup.sh alias add postmaster@mail.example.com admin@mail.example.com
```

创建了一个admin用户（不一定得是admin），然后添加了一条alias将postmaster用户指向它。


### 添加额外的DNS解析


接下来需要添几条与邮件安全相关的DNS。


- SPF记录


> **发件人策略框架**（英语：**Sender Policy Framework**；简称**SPF**； RFC 4408）是一套电子邮件认证机制，可以确认电子邮件确实是由网域授权的邮件服务器寄出，防止有人伪冒身份网络钓鱼或寄出垃圾电邮。SPF允许管理员设定一个DNS TXT记录或SPF记录设定发送邮件服务器的IP范围，如有任何邮件并非从上述指明授权的IP地址寄出，则很可能该邮件并非确实由真正的寄件者寄出（邮件上声称的“寄件者”为假冒）。
> 
> 
> <cite>[维基百科：SPF](https://zh.wikipedia.org/wiki/%E5%8F%91%E4%BB%B6%E4%BA%BA%E7%AD%96%E7%95%A5%E6%A1%86%E6%9E%B6)</cite>

`TXT mail -> "v=spf1 a mx ip4:1.2.3.4 ~all"`


SPF语法详见[此链接](http://www.open-spf.org/SPF_Record_Syntax/)。


- DMARC记录


> **基于域的消息认证，报告和一致性**（英语：**Domain-based Message Authentication, Reporting and Conformance**，简称**DMARC**）是一套以SPF及DKIM为基础的电子邮件认证机制，可以检测及防止伪冒身份、对付网络钓鱼或垃圾电邮。
> 
> 
> <cite>[维基百科：DMARC](https://zh.wikipedia.org/wiki/%E5%9F%BA%E4%BA%8E%E5%9F%9F%E7%9A%84%E6%B6%88%E6%81%AF%E8%AE%A4%E8%AF%81%EF%BC%8C%E6%8A%A5%E5%91%8A%E5%92%8C%E4%B8%80%E8%87%B4%E6%80%A7)</cite>

`TXT _dmarc.mail -> "v=DMARC1; p=quarantine; sp=none; fo=0; adkim=r; aspf=r; pct=100; rf=afrf; ri=86400; rua=mailto:postmaster@mail.example.com; ruf=mailto:postmaster@mail.example.com"`


DMARC的详细配置见[此链接](https://github.com/internetstandards/toolbox-wiki/blob/main/DMARC-how-to.md#overview-of-dmarc-configuration-tags)。


- DKIM记录


> **域名密钥识别邮件**（英语：**DomainKeys Identified Mail**，简称**DKIM**）是一套电子邮件认证机制，使用公开密钥加密的基础提供了数字签名与身份验证的功能，以检测寄件者、主旨、内文、附件等部分有否被伪冒或窜改。
> 
> 
> <cite>[维基百科：DKIM](https://zh.wikipedia.org/wiki/%E5%9F%9F%E5%90%8D%E5%AF%86%E9%92%A5%E8%AF%86%E5%88%AB%E9%82%AE%E4%BB%B6)</cite>


这个相当于将公钥通过DNS解析的方式分发到客户端，发件服务器用私钥签名，从而收件方可验证来源。

```bash
./setup.sh config dkim

cat docker-data/dms/config/opendkim/keys/mail.example.com/mail.txt
```

将`cat`得到的`( "`与`" )`之间的内容（记为X）解析到DNS：


`TXT mail._domainkey.mail -> X`


---

如果可以的话，再设置一条PTR记录（DNS反向解析记录），用以降低被识别为垃圾邮件的概率。（然而腾讯云轻量应用服务器不给解析，就此作罢。）

![](https://blogfiles.oss.fyz666.xyz/png/ac2d7463-ddaa-4fe2-b0d1-56be0cca4b98.png)
### 启动服务


在启动服务之前，由于一个[也许是feature的bug](https://github.com/docker-mailserver/docker-mailserver/issues/2545)，我们需要给容器打一个[patch](https://github.com/docker-mailserver/docker-mailserver/issues/2545#issuecomment-1097590082)：

```bash
#! /bin/bash
##
## to match what should be escaped whitespaces are escapted with \s and the other character with \character
## the final string does not need to be escaped
sed -i 's/mydestination\s=\s\$myhostname,\slocalhost\.\$mydomain,\slocalhost/mydestination=localhost.$mydomain,localhost/g' /etc/postfix/main.cf

echo "user-patches.sh successfully executed with custom main.cf hotfix"
```

将上述脚本放置在`docker-data/dms/config/user-patches.sh`，然后：

```plaintext
docker compose up -d
```

可以前往[这个网站](https://www.checktls.com/TestReceiver)测试一下tls是否可用。


实测该服务占用内存在100M左右，可以说是非常轻量了：

![](https://blogfiles.oss.fyz666.xyz/png/a457a7d1-eba8-4342-9619-8c60fddb9501.png)
## 部署起来了，然而怎么使用？


这个邮件服务器并没有自带的web服务，因此我们需要使用第三方客户端来登录账号，进行邮件收发。


使用Python脚本通过587端口发邮件：

```python
import smtplib
from email.mime.text import MIMEText
from email.utils import formatdate


mail_host = 'mail.example.com'
mail_user = 'admin@mail.example.com'
mail_pass = 'password'
sender = 'FBI'
receivers = ['admin@mail.114514.com']

content = """Open the door!!!"""
message = MIMEText(content, 'plain', 'utf-8')
message['Subject'] = 'Your email has been hacked!'
message['From'] = sender
message['To'] = receivers[0]
message['Date'] = formatdate()

server = smtplib.SMTP(mail_host, 587)  # 连接587端口
server.ehlo()
server.starttls()  # 开启tls
server.login(mail_user, mail_pass)
server.sendmail(sender, receivers, message.as_string())

server.quit()
```

iOS邮箱app：

![](https://blogfiles.oss.fyz666.xyz/jpg/7ce9f770-0415-46b7-902a-de03e68d297c.jpg)
后续设置中，将发件服务器端口设置为587或者465，勾选SSL。


---

最后，可以在[这个网站](https://www.appmaildev.com/cn/dkim)对上面设置的DKIM、SPF等进行测试：

![](https://blogfiles.oss.fyz666.xyz/png/8c80f344-5e79-40bc-a2f9-57acf512553e.png)
以及[这个网站](https://www.mail-tester.com/)，可以进一步测试邮件的得分：

![](https://blogfiles.oss.fyz666.xyz/png/9e610950-8c23-4fff-89ac-1c1f40f02bf1.png)

![](https://blogfiles.oss.fyz666.xyz/png/26d51119-c1e4-48d9-ad9a-e96c1f40f1a2.png)
很遗憾，我的`.xyz`域名被识别为了`SUSPICIOUS_NTLD`，再加上用不上rDNS，估计会被以很高的置信度丢进垃圾箱了 🙁 以后再改进！
