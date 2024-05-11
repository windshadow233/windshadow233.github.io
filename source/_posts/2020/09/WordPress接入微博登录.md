---
title: WordPress接入微博登录
id: 5026
date: 2020-09-03 13:17:05
categories:
  - [博客相关]
tags: ['Oauth', 'PHP', 'WordPress']
cover: 
disableNunjucks: false
---

现在不少WordPress站点都接入了第三方登录，第三方登录不仅安全性高，还降低了注册成本、提高了注册效率，有助于吸引更多用户。

微博作为中国最大的网络平台之一，有着庞大的用户人群，本文将提供WP网站接入微博登录的方法。

首先源代码来源于此仓库：

{%link wp-oauth,GitHub,https://github.com/bigfa/wp-oauth %}

这位大佬还提供了很多其他平台的第三方接入教程。由于这位大佬写的不是很详细，因此我在这给出一个菜鸟教程，同时在代码中补充了CSRF验证，其他方面也有少量修改。


经过我修改后的微博登录代码可以从[这个gist](https://gist.github.com/windshadow233/ba0514191284fc9b25c444c04eb36d70)拿。


第一步，请确保你拥有一个[微博开放平台](https://open.weibo.com/)审核通过的网站应用，将其App Key与App Secret复制到文件开头的代码中：

```php
define('WB_APPID','your_appkey');//appkey
define('WB_APPSECRET','your_appsecret');//appsecret
```

第二步，在网站根目录下创建一个名为oauth的文件夹，将`weibo.php`文件传到该文件夹下（路径或文件名都可以随便改，只要你会修改文件内的一些配置就行，但如果按我这么做，就不需要修改任何其他配置）


第三步，在微博开放平台中设置该应用的授权回调页以及取消授权回调页，所谓授权回调页其实就是你网站下`weibo.php`文件的地址，若按第二步的做法，该授权回调页应该设为`http(s)://域名/auth/weibo.php`；取消授权回调页我设为了网站首页，应该只要和授权回调页不相同就行。另外应用的服务IP地址不清楚是否必要，我个人直接填了一下服务器IP，没有去做其他尝试。


第四步，在你的网站插入一个微博登录的超链接，href设为`http(s)://域名/oauth/weibo.php?rurl`，点击该链接，即可授权微信登录！
