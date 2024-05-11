---
title: Apache字体文件跨域问题
id: 4251
date: 2020-08-20 12:36:57
categories: [Debug]
tags: ['Apache', 'CORS']
cover: 
disableNunjucks: true
---

开启cdn加速后，我在浏览器中遇到了数十条类似下面的报错：


```raw
...has been blocked by CORS policy: No 'Access-Control-Allow-Origin'...
```

就是个CORS跨域问题，这里出问题的文件基本都是一些诸如ttf、otf什么的字体文件。相信各位都比较清楚跨域是啥、什么时候会产生跨域，这里不再多说。要解决这个问题也非常容易，这里针对apache（apache2）进行说明，nginx也类似。


首先登录apache2所在的服务器，跑一句命令：

```bash
a2enmod headers
```

开启mod_headers模块，然后重新加载配置：

```bash
/etc/init.d/apache2 force-reload
```

接下来打开站点的配置文件（.htaccess文件）


写入下面一段代码保存即可：

```apache
<FilesMatch "\.(ttf|otf|eot|woff|woff2|)(.*)">
        <IfModule mod_headers.c>
                Header set Access-Control-Allow-Origin "*"
        </IfModule>
</FilesMatch>
```

也可以将第三行的 \* 换成源站完整的地址。
