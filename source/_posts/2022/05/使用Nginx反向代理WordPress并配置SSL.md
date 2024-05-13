---
title: 使用Nginx反向代理WordPress并配置SSL
id: 7673
date: 2022-05-10 05:18:49
categories:
  - [博客相关]
tags: ['Nginx', 'SSL', 'WordPress', '反向代理']
cover: https://blogfiles.oss.fyz666.xyz/jpg/a4c5e5ff-ff62-45dd-ab3e-aca4ac5032eb.jpg
disableNunjucks: true
---

此举是为了将原先部署在443端口的WordPress网站使用反向代理的方式重新部署。部署反代的过程踩了不少的坑，主要还是因为WordPress作为动态博客框架所具有的特殊机制。（说起这个就要后悔当时为啥没搞个静态博客了）


![](https://blogfiles.oss.fyz666.xyz/jpg/a4c5e5ff-ff62-45dd-ab3e-aca4ac5032eb.jpg)
首先介绍一下环境，我的WordPress网站运行在docker容器下，由Apache服务启动，原先的配置是docker容器内的Apache配置了SSL证书，并将容器443端口映射至宿主机。


为了在宿主机上用Nginx做反代，首先要对容器内的服务进行一些修改。两次SSL肯定是不划算的，因此首先要将容器内的Apache服务停用https，然后我们修改容器的端口绑定为`0.0.0.0:8000->80/tcp`（这个8000随便选一个宿主机的空闲端口即可，后面Nginx配置反代时会用到）。注意：这个时候WordPress数据库内站点的地址仍然是https的地址，为了站点的优雅，这里的地址不要改动。


接下来，配置Nginx，首先要确保安装的Nginx支持SSL（可通过`nginx -V`查看是否有SSL相关的模块）。

```nginx
server{
  listen 80;
  listen 443 ssl;
  server_name blog.fyz666.xyz;
  index  index.php index.html index.htm;
  ssl_certificate /etc/letsencrypt/live/fyz666.xyz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/fyz666.xyz/privkey.pem;
  if ($scheme = http){
    return 301 https://$host$request_uri;
  }
  location / {
    proxy_pass  http://127.0.0.1:8000/;
    proxy_set_header Host $host:$server_port;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Powered-By the-internet;
    add_header Content-Security-Policy upgrade-insecure-requests;
  }
}
```

以上配置是针对我自己的域名、网站服务情况。在运行该配置的Nginx前，需要确认80、443端口是空闲的。


- 首先，声明监听的两个端口，其中443端口开启SSL。
- 然后我们指定[前面](/blog/7669/)使用Let's Encrypt生成的SSL证书，对于Nginx，我们只需要fullchain与privkey两个文件。
- 接下来做一个301跳转，将http跳转到https。
- 最后的`location`配置，则是反向代理的核心。

首先，我们的反向代理的是将整个站点反代到443端口的根路径，因此`location`指定为`/`。然后是在`proxy_pass`字段指定位于localhost上的8000端口（这个端口是前面docker容器在宿主机上的映射），接下来必不可少的一条配置是`proxy_set_header Host $host:$server_port;`而这里有一个小坑。


如果我们代理的是个静态的Web网站，只需要这样即可：`proxy_set_header Host $host;`，但对于WordPress，我们必须带上`$server_port`进行转发。这是因为WordPress会将该地址与数据库内的站点地址进行比较，若不同，则会进行301跳转。这里若Nginx转发时不带上443这个端口，在反代后面的WordPress看来，转发至它的端口则是8000，与数据库内的443端口不一致，它会强制将访问转发到443端口，重新交给Nginx处理，而Nginx又会重新反代到8000端口，可见这样操作会引发无限的重定向！


另一条重要的配置是`add_header Content-Security-Policy upgrade-insecure-requests;`它是为了让WordPress能访问到其静态文件。


但仅仅配置了Nginx是不够的，因为WordPress自身并不支持反向代理，我们还需要修改一下WordPress的源代码。


打开WordPress网站根路径下的`wp-config.php`文件，找到包含`ABSPATH`的这段代码，在它前面添加三行：

```php
//添加下面三行代码
if ( ! empty( $_SERVER['HTTP_X_FORWARDED_HOST'] ) ) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
}
/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}
```

这样配置下来，反向代理的WordPress网站已经可以正常运作了。
