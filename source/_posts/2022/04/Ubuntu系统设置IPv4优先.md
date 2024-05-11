---
title: Ubuntu系统设置IPv4优先
id: 7631
date: 2022-04-04 05:35:03
categories: [瞎捣鼓经历]
tags: ['Linux', '计算机网络']
cover: 
disableNunjucks: true
---

使用透明代理进行科学上网的时候，若你的计算机与目标网站均有IPv6地址，计算机可能会优先使用IPv6对目标网站进行访问，而我们的代理一般是IPv4的地址，此时就会发现代理失败了。

对于Ubuntu系统，以下方法可以让系统优先使用IPv4地址。

```bash
sudo vi /etc/gai.conf
```

将上述打开文件以下内容取消注释（同时将最后的数字由10改成100）：

```plaintext
precedence ::ffff:0:0/96  100
```