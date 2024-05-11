---
title: WordPress接入支付宝登录
id: 5079
date: 2020-09-05 06:15:21
categories:
  - [博客相关]
tags: ['Oauth', 'PHP', 'WordPress']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/webp/0fedb987b871063ede1afbf11a7e55d2.webp
disableNunjucks: true
---

搞了半天才发现微信开放平台不让个人号申请接入，因此我转战阿里系平台，花了一天时间接入了支付宝用户oauth接口。

支付宝开放平台的文档写的很详细，但仍有一些细节不到位，若开发者没什么基础，接入会比较困难。


其实支付宝开放平台提供了许多已经写好的SDK，但这SDK文档不详细，我懒得学，因此我自己写了一个脚本用以接入支付宝oauth。


代码见[此gist](https://gist.github.com/windshadow233/0982ddf0b208285f9b349cb0d85d848e)，其中包含两个文件：`RSA2.php`与`alipay.php`。


接入方法如下：


首先在[支付宝开放平台](https://open.alipay.com/)申请一个网页应用，（选择自研服务->网页&移动应用），申请成功后会获取一个APPID，将这个APPID填入`alipay.php`文件开头的`define('Ali_APPID','');`当中。


支付宝接口的安全性体现在其每次发起请求必须附带一个签名（sign），验签通过即确保参数未被篡改，接下来我将粗略讲一下这个签名是怎么生成的。


首先在支付宝开放平台进入你的应用，选择应用信息，在开发信息栏目中可以看到一行“接口加签方式”，点击进入。

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/1021c67f8641e44709c0d36f24d13709.png)
作为普通开发者，这里选择加签模式为“公钥”，加签模式为“SHA256withRSA”，接下来可以用他提供的[支付宝密钥生成器](https://docs.open.alipay.com/291/106097/)来生成一对密钥，然后把公钥复制进去保存设置即可。


接下来，将公钥字符和私钥字符按注释的方法填入`RSA2.php`文件，这就完成了密钥的配置。


至于加签的方式，支付宝开放平台的文档中以一句话带过，这里我写了一个函数用以实现加签过程：

```php
function get_sign($args){
	ksort($args);
	$str_args = array();
	foreach ($args as $key => $value){
	    array_push($str_args, $key. '='. $value);
	}
	$str_args = implode('&', $str_args);
	$rsa2 = new Rsa2();
	$sign = $rsa2->createSign($str_args);
	return $sign;
}
```

这里参数在拼接的时候不需要进行urlencode，但在后面拼接URL的时候，必须进行urlencode，否则会请求失败。


接下来将文件上传服务器，在网站的根目录下创建一个oauth文件夹，将这两个文件都上传到oauth文件夹下即可。


最后在网站插入一个支付宝的logo，点击跳转到`http(s)://域名/oauth/alipay.php?rurl`。至此，WordPress已成功接入支付宝登录。
