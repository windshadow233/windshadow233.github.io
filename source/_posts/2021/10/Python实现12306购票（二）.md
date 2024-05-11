---
title: Python实现12306购票（二）
id: 6488
date: 2021-10-09 17:00:57
categories: [瞎捣鼓经历]
tags: ['JavaScript', 'Python', '爬虫']
cover:
disableNunjucks: false
---

这篇文章来分享一下我实现12306登录的过程。

{% note info %}

注：本文提到的`RAIL_DEVICEID`、`RAIL_EXPIRATION`参数在目前的版本中已经不需要了。

{% endnote %}


本文相关代码见[此文件](https://github.com/windshadow233/12306/blob/main/bot/login.py)

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/606196b8c85cfadf7417383c53da233d.png)
## 12306的登录方式

12306网页端支持以上两种登录方式，点击立即登录，出现以下验证信息：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/5c9235b718149a4a8c493f8164f7a6d5.png)
第一个滑块，感觉破解起来难度很大，先放一放，还有个短信验证，但经过我的尝试，该验证方式有每日次数限制，感觉不太爽，最舒服的登录方式当属扫二维码登录，因此我研究了一下二维码登录12306的机制。

## 两种登录的途径

{% tabs tab1 %}

<!-- tab 二维码登录 -->


打开浏览器的f12开发者界面进行抓包，然后点击二维码登录，在网络正常的情况下，可以成功抓到一条名为`create-qr64`的数据包，明显就是二维码的来源，打开看一下：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/4560e8dc17b65b4a8e9a31acfb4d4f73.png)
可见二维码图片是以base64编码方式发送到客户端的，同时发送过来的还有一个重要的参数：`uuid`，作为临时凭证唯一标识了每一个二维码。


该请求详细情况如下：


`POST https://kyfw.12306.cn/passport/web/create-qr64`


参数：


| 参数 | 值 |
| --- | --- |
| appid | otn |

请求只有一个固定的参数为`appid`，值为`otn`，看似非常容易实现，不过当然，事情没那么简单，但暂时，我们可以先往下看后面的流程：


在拿到验证码后，容易注意到浏览器又陆续发出了很多一样的包，名为`checkqr`，一看就是用来轮询二维码状态的，我们打开看一下其请求内容：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/af3a80da3caed0efac47845213dbfae6.png)
`uuid`参数值就是前面生成二维码时拿到的`uuid`（这里图片里的`uuid`和前面的不一样，是因为我刷新过二维码了)另外，还出现了两个未曾见过的东西，`RAIL_DEVICEID`和`RAIL_EXPIRATION`。最开始，我无视这两个参数对这个登录流程进行了尝试，但发现后面的请求无法正常进行下去，因此这两个参数好像比较重要，我们分析一下来源。

**RAIL_DEVICEID的获取方法**


直接搜索`RAIL_DEVICEID`的值，我从茫茫请求中找到了它的来源：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/60b4a3977694410dc363c0b6bd1fdeec.png)
这个请求的参数非常之长：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/52f2c433a20cb4e5c801a05abffbc125.png)
经过我的分析，参数的生成代码位于[这个文件](https://kyfw.12306.cn/otn/HttpZF/GetJS)


这个文件里的加密过程倒是容易理解，但它的算法居然一直在变，而且用了变量混淆，我第一天整理下来的JS文件，第二天就不能用了，让我郁闷了一段时间，后来才发现算法变了。最后我找到了一个[API](https://12306-rail-id-v2.pjialin.com)


直接GET它，可以得到一串base64编码，将它解码，即可得到前面那串很长的请求链接，再通过这个链接，我们即可得到`RAIL_DEVICEID`和`RAIL_EXPRIATION`两个参数。不得不说这个API真香！


获取了这俩参数以后，我们先把它们加到Cookie里，然后轮询二维码查看其状态，在得到扫码成功的状态后，即可进行下一步：身份认证。


二维码登录过程的代码见`qr_login`函数。


---

**Uamtk认证**


在二维码扫描成功并确认登录后（`checkqr`状态码为2），浏览器抓到了不少包，其中有两条分别名为`uamtk`和`uamauthclient`的吸引了我的注意。


第一条，`uamtk`：


`POST https://kyfw.12306.cn/passport/web/auth/uamtk`


参数：


| 参数 | 值 |
| --- | --- |
| appid | otn |

也是一个固定参数，该请求的response会为会话设置一些新的Cookie：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/3b18eb4399a4ed6cd0560c636ce3e7e6.png)
另外，这个请求将会返回一条json类型的数据，其中包含一条名为`newapptk`的字段，将其取出来，在接下来的请求中会用到。


带着这些Cookie继续请求第二条URL：`uamauthclient`


`POST https://kyfw.12306.cn/otn/uamauthclient`


参数：


| 参数 | 值 |
| --- | --- |
| tk | 前面获取到的`newapptk` |

该请求将会得到一条包含用户信息的json数据，同时将`tk`设置为Cookie，这样会话就成功登录了。

身份认证的代码见`_uamauth`函数。

<!-- endtab -->

<!-- tab SMS验证码登录 -->


另一种SMS验证码登录，流程也非常简单，最后的身份认证过程与前面一模一样，不同的是，获取`apptk`的方式是通过账号、密码以及手机验证码，手机验证码的获取又依赖于身份证号后四位，因为比较容易，我就不啰嗦了，代码见`sms_login`函数。

**用户密码前端加密方法**


需要注意的是，12306在前端对用户的密码进行了一次加密，见此[JS文件](https://kyfw.12306.cn/otn/resources/js/framework/SM4.js)


该文件提供了多个加密函数，为了弄清楚使用了哪一个，只需分析实现了登录逻辑的[JS文件](https://kyfw.12306.cn/otn/resources/js/login_new_v20210901.js)


需要关注的内容如下：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/f0d01866c7dba6f4a741a03d944d29df.png)
我们发现，密码字段是这样生成的：

```raw
密文密码 = "@" + encrypt_ecb(明文密码, SM4_key)
```

可知用的函数是`encrypt_ecb`，另外还有一个参数是`SM4_key`，也可以在该JS文件中找到，其值为`tiekeyuankp12306`。


接下来，只要想办法用Python调用`SM4.js`这个文件的加密函数，来为密码加密。

但我试了一下，发现这段JS代码在Python下执行速度非常慢，最后我的解决办法是，直接用Python复现了一下这个加密过程，其实非常简单，因为SM4是有封装好的库的，[相关代码](https://github.com/windshadow233/12306/blob/main/bot/encrypt_ecb.py)。

<!-- endtab -->

{% endtabs %}

如此，便实现了12306的登录。接下来，就可以分析购票的过程了。
