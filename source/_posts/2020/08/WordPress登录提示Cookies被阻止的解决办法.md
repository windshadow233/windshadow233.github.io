---
title: WordPress登录提示Cookies被阻止的解决办法
id: 4160
date: 2020-08-17 16:31:45
categories:
  - [Debug]
  - [博客相关]
tags: ['Cookie', 'WordPress']
cover: https://blogfiles.oss.fyz666.xyz/png/913f7f12-a3a9-4d01-adf9-4057cd6df253.png
disableNunjucks: false
---

有一天，我正常在前台登录窗口输入自己的账号密码，却得到了一个登录失败的提示，F12查看Network之后发现报错内容如下：


![](https://blogfiles.oss.fyz666.xyz/png/bd6153ba-17b3-41a4-adb6-9e8e8f556c2b.png)
我根本没当回事，轻车熟路打开浏览器设置页面找到cookie设置，却发现根本没有阻止网页的cookie。


查遍资料，大多解决办法都是在wp-config.php文件中加一句诸如这样的代码：`define('COOKIE_DOMAIN', $_SERVER['HTTP_HOST'] );`


但这并没能解决我的问题，后来经过研究我发现原来是WP自带的登录功能会先判断浏览器是否支持cookie，若支持则添加一个cookie，该cookie存在时尚能正常进行登录。这个cookie长这样：

![](https://blogfiles.oss.fyz666.xyz/png/913f7f12-a3a9-4d01-adf9-4057cd6df253.png)
于是我在登录函数里加了一段js代码来判断浏览器是否支持cookie，若支持则添加上面的cookie：

```js
if (!navigator.cookieEnabled){
		alert('浏览器未支持cookie，请更换浏览器或解除对本站cookie的阻止');
		return;
	}
	if ($.cookie('WordPress_test_cookie') != "WP+Cookie+check") {
		$.cookie('WordPress_test_cookie', 'WP+Cookie+check', { expires: 365 , path: '/'});
	}
```

从而解决了这个问题。

此方法需要导入`jquery.cookie.js`文件：

{%link jquery-cookie,GitHub,https://github.com/carhartl/jquery-cookie/ %}
