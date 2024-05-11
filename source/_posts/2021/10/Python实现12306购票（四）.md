---
title: Python实现12306购票（四）
id: 6532
date: 2021-10-10 13:24:10
categories: [瞎捣鼓经历]
tags: ['JavaScript', 'Python', '爬虫']
cover:
disableNunjucks: true
---

该系列最后一篇文章，来实现提交订单（购票），不过：不支持付钱。

本文只涉及一个函数`confirm_single_for_queue`，位于[此文件](https://github.com/windshadow233/12306/blob/main/bot/order.py)

## 提交订单


在前面余票查询完成后，我们就可以真正地提交订单了，提交订单的请求如下：

`POST https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue`


参数：


|  |  |  |
| --- | --- | --- |
| passengerTicketStr | oldPassengerStr | randCode |
| purpose_codes | key_check_isChange | leftTicketStr |
| train_location | choose_seats | seatDetailType |
| is_jy | is_cj | whatsSelect |
| roomType | dwAll | _json_att |
| REPEAT_SUBMIT_TOKEN | encryptedData |  |

前面几个参数（从`randCode`到`train_location`）都与前一篇文章一样，来自于`ticketInfoForPassengerForm`这个变量，`REPEAT_SUBMIT_TOKEN`与前面一样来自网页的JS变量：`globalRepeatSubmitToken`。另外有几个可以写死的参数：`seatDetailType="000"`、`is_jy="N"`、`is_cj="N"`、`whatsSelect="1"`、`roomType="00"`、`dwAll="N"`、`_json_att=""`。


这样一来，需要解决的只剩两个参数了：`choose_seats`、`encryptedData`


### 选座功能

`choose_seats`顾名思义是选座，JS代码如下：

```js
function j() {
  var x = "";
  $.each($("div#id-seat-sel div.seat-sel-bd a"), function() {
    if ($(this).hasClass("cur")) {
      var y = $(this).attr("id");
      x += y
    }
  });
  return x
}
```

简单分析一下代码，就是把选到的座位的id直接加起来。两个订单的选座界面长这样（若有n个订单则会有n排座位）：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/8b51eb674cbb8c697d1c278f10c2d515.png)
找到其中一个座位的html代码如下：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/5a61c07862364b404cfa9bdc5684c2bb.png)
根据这个id与前面的JS逻辑，就可以直接写出选座的逻辑了。举个例子，如果我选了第一排的A和第二排的B，那么`choose_seats`即是`1A2B`。


### （没用的）加密数据


解决了`choose_seats`，还剩最后一个最复杂的参数`encryptedData`。


经过追踪，它来自于`window.json_ua.toString()`这个函数，它会产生一个比较随机的字符串，而这个函数来自于一个近三万行的[JS文件](https://mobile.12306.cn/otsmobile/antcaptcha/suite1608722853171.js)，该文件经过了压扁控制流混淆，通过大量的`switch case`语句将源代码打散，分析难度很大，我直接裂开。


但后来我发现压根就不需要提交这个变量...那就不用研究了，真是喜大普奔。


## 流程总结


到此为止，12306的购票流程已经全部走了一遍，总结一下就是：


1. 登录（建议扫二维码）
2. 查票（`https://kyfw.12306.cn/otn/leftTicket/query`，该链接动态变化）
3. 选票（`https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest`）添加1个或多个订单
4. 余票查询（`https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo、https://kyfw.12306.cn/otn/confirmPassenger/getQueueCount`）
5. 提交订单（`https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue`）

但毕竟12306平台异常复杂，代码中肯定会有不少处理不妥的地方，比如某些重要的参数被我偷懒直接写死了，但实际上可能会发生变化。若各位大佬有这方面的经验，希望能指出。
