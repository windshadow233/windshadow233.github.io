---
title: 使用MinIO自部署对象存储服务
disableNunjucks: false
mathjax: false
id: 11574
date: 2024-05-17 16:47:38
categories:
    - [瞎捣鼓经历]
tags:
    - 对象存储
    - MinIO
    - Docker
cover: https://blogfiles.oss.fyz666.xyz/webp/c95fcde3-2ca6-4ded-8019-604d0868453b.webp
swiper_index: 1
description: 考虑再三，还是选择自部署对象存储服务
---

## 动机

[之前的文章](/blog/11170/)曾提到我将GitHub作为对象存储服务来使用，但也提到GitHub是禁止这种行为的，出于~~遵守协议~~善待GitHub的考虑，我在之后重新调研了国内外的一些对象存储、图床服务商，最终得出结论： 

{% note primary %}

免费的服务往往会在暗中为你标上了其他形式的价格。

{% endnote %}

而一些大厂提供的服务，其定价文档堪比阅读理解，稍有不慎就会栽进坑里。

另外，还有一些比较容易被忽略的细节：

- 绝大多数的服务商都会将请求次数和流量分开计费，有的流量免费但请求收费；有的则有免费的请求额度，但流量则以GB为单位额外付费。
- 部分服务商的HTTPS请求是按次数付费的。
- 有的服务商，看似拥有极其慷慨的free plan，但很多限制并没有写到pricing页面里，而是在你注册进入控制台后，在很隐蔽的一个页面下才能翻到。
- 一些服务商的定价规则包含很多具有一定歧义的“术语”，你不实际体验一下是不会理解它的真正含义的（往往都是坑），而体验的过程无疑又浪费了时间和精力。
- 一些国外服务商已经被墙了。

如果我要为了图片的稳定性去购买一些数据持久性高达12个9的服务，那倒不如把手上闲置的服务器用起来，结合快照备份回滚功能，也能保证基本的稳定性了。

![image-20240517173449985](https://blogfiles.oss.fyz666.xyz/png/31f1b16a-001a-4eeb-8cf0-dfcbf359c58d.png)

于是，在多种考虑之下，我决定自己部署一个对象存储服务。

---

这里我选择了开源分布式对象存储服务：MinIO

{% link MinIO,GitHub,https://github.com/minio/minio %}

其有Docker镜像，部署起来也十分方便。

## Docker部署

首先写一个`docker-compose.yml`文件：

```yaml
version: '3.7'

services:
  minio:
    image: quay.io/minio/minio
    container_name: minio
    restart: unless-stopped
    environment:
      - MINIO_DOMAIN=oss-api.example.com
      - MINIO_SERVER_URL=https://oss-api.example.com/
      - MINIO_BROWSER_REDIRECT_URL=https://oss-console.example.com/
      - MINIO_ROOT_USER=<ADMIN_USERNAME>
      - MINIO_ROOT_PASSWORD=<ADMIN_PASSWORD>
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9090:9090"
    volumes:
      - ./data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    command: server /data --console-address ":9090"
```

上述文件中，首先需要修改`<ADMIN_USERNAME>`与`<ADMIN_PASSWORD>`，然后修改几个域名与网址：

- `MINIO_DOMAIN`：简单理解为服务提供的api的域名
- `MINIO_SERVER_URL`：`MINIO_DOMAIN`带上`scheme`
- `MINIO_BROWSER_REDIRECT_URL`：web控制台网址

自然，需要将这两个域名都解析到服务器ip。

运行`docker-compose up -d`启动服务。

## Nginx反向代理

因为有两个服务（api与web console），所以需要写两组配置。

api反代配置：

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name oss-api.example.com;
    ssl_certificate /path/to/fullchain;
    ssl_certificate_key /path/to/key;
    ignore_invalid_headers off;
    client_max_body_size 0;
    proxy_buffering off;

    if ($scheme = http) {
      return 301 https://$host$request_uri;
    }

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;

        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        chunked_transfer_encoding off;
        proxy_pass http://localhost:9000;
    }
}
```

web console反代配置：

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name oss-console.example.com;
    ssl_certificate /path/to/fullchain;
    ssl_certificate_key /path/to/key;
    ignore_invalid_headers off;
    client_max_body_size 0;
    proxy_buffering off;

    if ($scheme = http) {
        return 301 https://$host$request_uri;
    }

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;

        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        chunked_transfer_encoding off;
        proxy_pass http://localhost:9090;
    }
}
```

然后运行`nginx -s reload`

## 上手使用

用前面指定的管理员账号密码登录控制台，选择左侧栏"Buckets"，再点击右上角"Create Bucket"，创建一个存储桶：

![image-20240517180035818](https://blogfiles.oss.fyz666.xyz/png/dbb5a284-0b26-443a-bc86-bab59ee93140.png)

这里我们创建了一个名为`any-bucket-name`的桶。

接下来，对这个桶进行最基本的权限配置，由于我是拿它当图床用的，自然需要开启匿名读的权限。

在"Buckets"栏下选择刚创建的bucket，点击左侧的"Anonymous"，添加一条规则：

![image-20240517180803747](https://blogfiles.oss.fyz666.xyz/png/21ca8842-3d2a-43d4-84b2-0fe8d9391fb5.png)

点击左侧的"Summary"，修改"Access Policy"，选择"Custom"

1. 将`Action`字段下的`"s3:ListBucket"`删除，这是为了禁止匿名查看文件列表。
2. 可以在`Resource`值为`arn:aws:s3:::any-bucket-name/*`的配置后面增加一条`Condition`字段，用来防盗链。

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "*"
                ]
            },
            "Action": [
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::any-bucket-name"
            ]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "*"
                ]
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::any-bucket-name/*"
            ],
            "Condition": {
                "StringLike": {
                    "aws:Referer": [
                        "https://domain.com/*"
                    ]
                }
            }
        }
    ]
}
```

然后，可选的一项：在左侧栏"Identity->Users"下创建一个读写权限的普通用户，用以替代管理员进行日常操作，登录普通用户后，可创建Access Key、Secret Key用于调用API：

{% link Software Development Kits,MinIO Document,https://min.io/docs/minio/linux/developers/minio-drivers.html %}

可以通过前面定义的`MINIO_DOMAIN`来访问存储桶里面的文件，有两种方法：

{% tabs tab1 %}

<!-- tab Path Style -->

什么都不做修改的情况下，我们已经可以通过这种子路径风格的URL对一个桶内的文件进行访问：

`https://oss-api.example.com/<bucket>/<path>`

<!-- endtab -->

<!-- tab DNS Style -->

如果我们做一个通配符DNS解析，将`*.oss-api.example.com`解析到服务器，那么我们将前面为api配置的NGINX配置中的`server_name`修改一下：

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name *.oss-api.example.com oss-api.example.com;
    ...
}
```

即可通过下面这种DNS风格的URL对桶内文件进行访问：

`https://<bucket>.oss-api.example.com/<path>`

当然，这里必须先为`*.oss-api.example.com`申请三级通配符域名证书，二级通配符域名`*.example.com`的证书是不能用的。

<!-- endtab -->

{% endtabs %}

