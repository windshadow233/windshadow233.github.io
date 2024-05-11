---
title: WordPress开启邮件发送功能
id: 3096
date: 2020-07-27 09:17:19
categories:
    - [博客相关]
tags: ['Email', 'WordPress']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/6d929e725252bc9a1f2da89bb00875be.png
disableNunjucks: true
---

基于WordPress的用户注册需要发送验证邮件，我们需要开启WordPress的邮件发送功能。


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/6d929e725252bc9a1f2da89bb00875be.png)

本文针对阿里云服务器来进行SMTP服务的配置，首先登录阿里云官网开通邮件推送服务，该服务支持每天200条免费邮件，小站用用肯定是够了。接下来找到邮件推送控制台，然后按下图指示，进行配置：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/00acdf5ff5a8f853deecd989a1d24b6e.png)

- step2中在已有域名的基础上解析一个二级域名即可，这个二级域名将用以发送邮件。
- step3配置全部完成后，进行step4的验证。

以下简要说明step3：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/f50c268ee97b47f469c2f5244d4cf7b7.png)

接下来进入云解析DNS界面，为刚才选择的域名进行解析，解析内容是图中的四条值，解析完成后10分钟内一般会验证通过，届时进入step4进行验证即可。


接下来进行下图操作：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/43605f177a5c6c60f49a1186c4429ae6.png)其中回信地址设为常用邮箱，然后验证一下即可，验证完后设置一个SMTP密码，同时发信地址是后面服务器发邮件时显示的邮件来源，这两个东西后面会用到。


接下来需要使用一个WordPress邮件插件，我用的是SMTP Mailer，亲测好用！


插件设置中，SMTP Host填写阿里云给的smtp服务器地址，我的是smtpdm.aliyun.com，SMTP Authentication选择True，后面的Username与Password填写刚刚设置的发信地址与SMTP密码，Type of Encryption选择SSL，port填写465，From Email Address也填写发新地址，From Name随便填，最后的Disable SSL…给他勾上。接下来保存设置以后，不出意外WordPress就可以愉快地发送邮件了。
