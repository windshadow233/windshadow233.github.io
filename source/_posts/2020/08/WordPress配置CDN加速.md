---
title: WordPress配置CDN加速
id: 4247
date: 2020-08-20 12:18:43
categories:
  - [博客相关]
tags: ['CDN', 'WordPress']
cover: https://blogfiles.oss.fyz666.xyz/webp/03aea818-dab2-4b3f-b315-ea55f1e7db21.webp
disableNunjucks: true
---

CDN（内容分发网络）可以根据用户的位置就近获取网站静态资源，降低网络的拥塞、减轻服务器压力。

![](https://blogfiles.oss.fyz666.xyz/webp/03aea818-dab2-4b3f-b315-ea55f1e7db21.webp)这里我选择的平台依旧是阿里云，进入阿里云的控制台，找到CDN→域名管理→添加域名。（若想配置DCDN，前往阿里云DCDN控制台进行下面类似的操作即可。）


![](https://blogfiles.oss.fyz666.xyz/png/b7a0fb76-2dab-467b-a62a-ae2f13037918.png)

以cdn.fyz666.xyz为例，按上图进行配置以后，域名管理栏中就出现了你刚刚设置的加速域名，接下来根据需求需要进行DNS解析即可。


稍等片刻，解析记录就生效了。接下来就可以前往WordPress修改静态资源链接了。但一个一个修改实在是累，而且万一哪天不用cdn了还得改回来，就很麻烦，这里推荐一款WP插件：CDN Enabler


![](https://blogfiles.oss.fyz666.xyz/png/0fbe7db2-889d-46fa-9e36-41a95d1aa51e.png)

至此全站加速基本配置完了，还有一些小bug需要处理，例如字体文件被CORS跨域阻止。解决方法[戳这里](/blog/4251/)。
