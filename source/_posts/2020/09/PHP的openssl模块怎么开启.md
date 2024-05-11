---
title: PHP的openssl模块怎么开启
id: 5077
date: 2020-09-05 05:40:17
categories: [Debug]
tags: ['PHP']
cover: 
disableNunjucks: true
---

昨天在本地跑PHP代码时，遇到一句报错，相信不少朋友们也遇到过：


```plaintext
PHP Fatal error:  Uncaught Error: Call to undefined function openssl_sign()
```

要使用这个函数必须在PHP中开启openssl模块，很多网上的博客大多会提到这样一种方法：在php.ini文件中增加一句`extension=php_openssl.dll`。


加了这句代码后，运行时仍报了一个warning：

```plaintext
PHP Warning:  PHP Startup: Unable to load dynamic library 'php_openssl.dll'
```

后来研究发现在php.ini中有一行代码描述了PHP扩展所在路径：`extension_dir = "${phphome}\ext"`，而变量`${phphome}`在我这儿并没有定义，这一点很多其他博客并没有提到，这应该是一个环境变量，不过我之前没有设置过，因此我在前面加了一句：`phphome='e:\php-7.3.22'`，为我的PHP安装目录，问题解决。
