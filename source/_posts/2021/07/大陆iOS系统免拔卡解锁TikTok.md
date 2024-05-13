---
title: 大陆iOS系统免拔卡解锁TikTok
id: 5583
date: 2021-07-23 09:01:18
categories: [瞎捣鼓经历]
tags: ['Shadowrocket', '科学上网']
cover: https://blogfiles.oss.fyz666.xyz/webp/33da0bee-f62c-4a2c-961c-4cb966236be1.webp
disableNunjucks: false
---

得益于一些政策，在中国大陆的我们没有办法直接浏览TikTok（抖音海外版），由于TikTok会通过一些方法检测你的电话卡，把大陆的运营商进行屏蔽，因此即便你挂满了梯子，也没有办法浏览TikTok。本文对iOS系统解决这一问题的过程进行了总结，力图让萌新踩更少的坑。

本文参考自下面仓库：

{% link TikTok-Unlock,GitHub,https://github.com/Semporia/TikTok-Unlock %}


首先，你得有个梯子。


最简单粗暴的方法：直接拔卡，但该方法对于只有一台手机设备，没有平板的穷人而言不太友好，因此下面给出一种不需要拔卡的方法。


此教程所使用的软件为Shadowrocket。


操作过程只需按上面链接，找到关于Shadowrocket的部分，若你使用的是其他软件，可以自己在上面找一下。


首先选择你想要访问的国家地区，这里我选择了美区的配置，即`https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Shadowrocket/TiKok-US.conf`


将此配置链接导入到Shadowrocket中，可以看到成功添加了一个新的配置：TiKok-US.conf。


![](https://blogfiles.oss.fyz666.xyz/jpg/78360d15-67b1-47d1-acf9-5c1791beccc8.jpg)选择该配置并编辑纯文本，在其中空白区域加上以下内容（GitHub项目里的文件漏掉了末尾的PROXY，会导致规则添加失败）：

```raw
[Rule]
USER-AGENT,TikTok*,PROXY
DOMAIN-KEYWORD,-tiktokcdn-com,PROXY
DOMAIN-SUFFIX,tiktokv.com,PROXY
DOMAIN-SUFFIX,tiktokcdn.com,PROXY
DOMAIN-SUFFIX,tiktok.com,PROXY
DOMAIN-SUFFIX,tik-tokapi.com,PROXY
DOMAIN-SUFFIX,snssdk.com,PROXY
DOMAIN-SUFFIX,sgpstatp.com,PROXY
DOMAIN-SUFFIX,musical.ly,PROXY
DOMAIN-SUFFIX,muscdn.com,PROXY
DOMAIN-SUFFIX,ipstatp.com,PROXY
DOMAIN-SUFFIX,ibytedtos.com,PROXY
DOMAIN-SUFFIX,ibyteimg.com,PROXY
DOMAIN-SUFFIX,byteoversea.com,PROXY
DOMAIN,p16-tiktokcdn-com.akamaized.net,PROXY
```

保存配置后，选择“编辑配置”，点击“HTTPS解密”，开启HTTPS解密后，会弹出一个对话框，选择“生成新的CA证书”。低版本的Shadowrocket，生成证书的功能似乎在主界面的“设置”下，自己机灵点找。生成证书以后，点击“安装证书”，即可在本地下载一个描述文件。


![](https://blogfiles.oss.fyz666.xyz/jpg/92d55323-fb47-4af1-a332-248069c2f175.jpg)之后前往手机的设置界面，安装该描述文件，然后进入“通用->关于本机->证书信任设置”，将刚安装的描述文件进行信任即可。


在做完上述操作后，开启Shadowrocket，将全局路由设为“配置”，再将配置文件设为TiKok-US.conf，不出意外，就可以正常浏览TikTok啦。若仍然无法浏览，建议将TikTok卸载重下。


**本文所介绍的内容主要是为了方便学习、娱乐、开拓国际视野。在墙外请严格约束自身，遵守本国法律法规，切勿在任何地方发布分裂国家，涉恐等违法犯罪的言论。**
