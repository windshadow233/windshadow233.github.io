---
title: Python实现12306购票（三）
id: 6513
date: 2021-10-10 11:57:25
categories: [瞎捣鼓经历]
tags: ['JavaScript', 'Python', '爬虫']
cover:
disableNunjucks: true
---

前面文章已经成功实现了登录，接下来就可以愉快地购票了，但在购票之前，我们需要知道12306处理订单的逻辑。

本文相关代码见[此文件](https://github.com/windshadow233/12306/blob/main/bot/order.py)


## 点击预定获取车票信息


我们在网页端订票时，首先通过查票系统查到自己想要的票，然后点击右边的“预定”：

![](https://blogfiles.oss.fyz666.xyz/png/ec3743df-b806-4114-85ba-167fea2300a6.png)
然后会跳转到这个链接：

`https://kyfw.12306.cn/otn/confirmPassenger/initDc`


在此网页中可以添加订单与提交订单，最终实现购票。


但我们没有为上面的链接提供任何关于车票信息的参数，网页是如何知道我们选择的是哪张车票呢？


其实这是因为我们的浏览器会话在访问上面的链接之前还无意间发起过一个包含了车票信息的请求。


我们在Network里抓包，可以发现，在点击“预定”按钮后产生了一条名为`submitOrderRequest`的包，如下：

![](https://blogfiles.oss.fyz666.xyz/png/83000a7f-92fb-4a49-812d-7eaa25516318.png)
它提交的表单信息中含有车票相关的信息，把它写下来如下：


`POST https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest`


参数：


| 参数 | 说明 |
| --- | --- |
| **secretStr** | 一串奇怪的字符串 |
| **train_date** | 发车日期（格式%Y-%m-%d） |
| **back_train_date** | 返程日期 |
| **tour_flag** | 可以固定为“dc” |
| **purpose_codes** | 可以固定为“ADULT” |
| **query_from_station_name** | 出发站名 |
| **query_to_station_name** | 到达站名 |
| **undefined** | 固定为空串 |

其中`back_train_date`参数为返程的日期，但由于我们买的是单程票，因此这一条数据其实是无关紧要的，和系统一样默认填当天的日期就行，同理，tour_flag指定了票为单程票，我们通常只会购买单程票，因此可以将它固定下来。


另外，还有最重要的一个参数：`secretStr`，还记得前面查询车票时曾经看到过的很长的字符串吗？这里的`secretStr`值即是前面那个字符串经过urldecode以后的内容，我们只需用`urllib.parse.unquote`这个函数把它解码，再加入表单即可。


该请求正常情况下将返回一条json数据，其中`result_code`字段告知响应状态，若为0则意味着请求通过。这里的代码可见`submit_order_request`函数。


---

## 提交订单与余票查询


接下来，页面跳转到了订单页面：`https://kyfw.12306.cn/otn/confirmPassenger/initDc`


我们通过手动添加乘车人，然后提交订单，可以抓到如下两条数据包：

![](https://blogfiles.oss.fyz666.xyz/png/b26d54dd-ff60-4d02-b14e-a71d52c6f92c.png)
分别来看这两条请求分别做了什么事。


### 提交订单

`checkOrderInfo`

![](https://blogfiles.oss.fyz666.xyz/png/95a734de-2b89-4704-8927-54c9ed1c06ea.png)
`POST https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo`


参数：


|  |  |  |
| --- | --- | --- |
| bed_level_order_num | passengerTicketStr | oldPassengerStr |
| tour_flag | randCode | whatsSelect |
| sessionId | sig | scene |
| _json_att | REPEAT_SUBMIT_TOKEN | cancel_flag |

这条请求共设置了12个表单参数，我都写在了上面，但光看这些参数并不知道它们来自于哪里、分别表示什么意思，因此这里需要分析一下发起这条请求的JS代码。


这段代码位于[这个文件](https://kyfw.12306.cn/otn/resources/merged/passengerInfo_js.js)，核心内容如下：

```js
$.ajax({
  url: ctx + "confirmPassenger/checkOrderInfo",
  type: "post",
  data: {
    cancel_flag: "2",
    bed_level_order_num: "000000000000000000000000000000",
    passengerTicketStr: getpassengerTickets(),
    oldPassengerStr: getOldPassengers(),
    tour_flag: ticketInfoForPassengerForm.tour_flag,
    randCode: $("#randCode").val(),
    whatsSelect: $.whatsSelect(true) ? "1" : "0",
    sessionId: csessionid,
    sig: sig,
    scene: "nc_login"
  },
  dataType: "json",
  async: true,
  ...
})
```

从这里我们一眼就看出，'cancel_flag'、'bed_level_order_num'、'scene'的值都是可以写死的，然后来看两个passengerStr，第一个`passengerTicketStr`，来自于以下函数：

```js
getpassengerTickets = function() {
  var aA = "";
  for (var aB = 0; aB < limit_tickets.length; aB++) {
    var aC = limit_tickets[aB].seat_type + ",0," + limit_tickets[aB].ticket_type + "," + limit_tickets[aB].name + "," + limit_tickets[aB].id_type + "," + limit_tickets[aB].id_no + "," + (limit_tickets[aB].phone_no == null ? "" : limit_tickets[aB].phone_no) + "," + (limit_tickets[aB].save_status == "" ? "N" : "Y") + "," + limit_tickets[aB].allEncStr;
      aA += aC + "_"
  }
  return aA.substring(0, aA.length - 1)
}
```

由此，我们可以大概了解到`passengerTicketStr`的生成规则，是把订单的乘客信息和票务信息通过逗号拼接起来，若有多个订单，则将多个订单生成的Str用下划线拼接起来。我草率地实现了一下这个字符串的生成过程，见`generate_passenger_ticket_str`函数。


另一个`oldPassengerStr`，JS函数如下：

```js
getOldPassengers = function() {
  var aE = "";
  for (var aD = 0; aD < limit_tickets.length; aD++) {
    var aA = limit_tickets[aD];
    if (ticketInfoForPassengerForm.tour_flag == ticket_submit_order.tour_flag.fc || ticketInfoForPassengerForm.tour_flag == ticket_submit_order.tour_flag.gc) {
      var aB = aA.name + "," + aA.id_type + "," + aA.id_no + "," + aA.passenger_type;
      aE += aB + "_"
    } else {
      if (aA.only_id.indexOf("djPassenger_") > -1) {
        var aC = aA.only_id.split("_")[1];
        var aB = M[aC].passenger_name + "," + M[aC].passenger_id_type_code + "," + M[aC].passenger_id_no + "," + M[aC].passenger_type;
        aE += aB + "_"
      } else {
        if (aA.only_id.indexOf("normalPassenger_") > -1) {
          var aC = aA.only_id.split("_")[1];
          var aB = az[aC].passenger_name + "," + az[aC].passenger_id_type_code + "," + az[aC].passenger_id_no + "," + az[aC].passenger_type;
          aE += aB + "_"
        } else {
          aE += "_ "
        }
      }
    }
  }
  return aE
}
```

乍一看又臭又长，实际上只要注意到这两句代码：

```js
var aB = aA.name + "," + aA.id_type + "," + aA.id_no + "," + aA.passenger_type;
aE += aB + "_"
```

将其用Python实现即可，代码见`generate_old_passenger_str`函数。


这样两个字符串都可以成功生成了，我代码中的函数只针对单个订单进行了生成，若有多个订单，仍需要将其用下划线拼接起来，与`passengerTicketStr`不同，`oldPassengerStr`在拼接完以后，末尾还得额外加一个下划线。


表单的其他几个参数，看上去都是常数，直接写死好像没什么问题。最后我处理这个请求的代码见check_order_info函数。




---

### 余票查询


接下来是第二个请求：`getQueueCount`，这个请求用于余票查询：

![](https://blogfiles.oss.fyz666.xyz/png/35ede02c-4c65-463a-8f10-9fc3ed2b9f3e.png)
`POST https://kyfw.12306.cn/otn/confirmPassenger/getQueueCount`


参数：


|  |  |  |
| --- | --- | --- |
| train_date | train_no | stationTrainCode |
| seatType | fromStationTelecode | toStationTelecode |
| leftTicket | purpose_codes | train_location |
| _json_att | REPEAT_SUBMIT_TOKEN |  |

继续从JS代码来分析参数的生成过程，下面这段代码同样来自[这个文件](https://kyfw.12306.cn/otn/resources/merged/passengerInfo_js.js)。

```js
$.ajax({
  url: ctx + "confirmPassenger/getQueueCount",
  type: "post",
  data: {
    train_date: new Date(orderRequestDTO.train_date.time).toString(),
    train_no: orderRequestDTO.train_no,
    stationTrainCode: orderRequestDTO.station_train_code,
    seatType: limit_tickets[0].seat_type,
    fromStationTelecode: orderRequestDTO.from_station_telecode,
    toStationTelecode: orderRequestDTO.to_station_telecode,
    leftTicket: ticketInfoForPassengerForm.queryLeftTicketRequestDTO.ypInfoDetail,
    purpose_codes: X,
    train_location: ticketInfoForPassengerForm.train_location,
    isCheckOrderInfo: Y
  },
  dataType: "json",
  ...
})
```

我们发现这里的参数字段似乎和前面抓包抓到的不太一样，其实是因为在ajax提交前，还有另一个JS文件对其表单内容做了修改，不过大体上不会影响我们分析数据的生成。


这段代码里有两个新的变量不知道是啥，一个是`orderRequestDTO`，另一个是`ticketInfoForPassengerForm`，似乎只要得到了它们，就可以很舒服地生成这个表单。


但是我查遍了整个文件，也没有找到定义`ticketInfoForPassengerForm`这个变量的地方，似乎它是一个全局变量。在开发者工具的Console里输入`ticketInfoForPassengerForm`执行，还真跳出来了一大串数据：

![](https://blogfiles.oss.fyz666.xyz/png/91ebdd0b-69fe-4591-af9e-0b91837f4759.png)
说明它确实是个全局变量，稍加搜索后，我发现它藏在订单页面（`https://kyfw.12306.cn/otn/confirmPassenger/initDc`）的html代码里：

![](https://blogfiles.oss.fyz666.xyz/png/4e0e2b7f-a194-4392-bdba-ff0f8e1d78c6.png)
而另一个变量`orderRequestDTO`则是`ticketInfoForPassengerForm`的一个字段。那就好办了，我们可以通过正则匹配把它匹配出来，然后用json库解析成Python可读的字典，即可顺利拿到表单数据。下面是正则匹配的代码，我还匹配了网页中的另一个变量，即`globalRepeatSubmitToken`，它就是我们抓到的包里带的参数`REPEAT_SUBMIT_TOKEN`

```python
init_dc_url = 'https://kyfw.12306.cn/otn/confirmPassenger/initDc'

def get_init_info(self):
    """初始化车票下单页面信息"""
    r = self.sess.get(self.init_dc_url)
    form = re.search('ticketInfoForPassengerForm=(.+)', r.text).groups()[0][:-1].replace('\'', '"')
    form = json.loads(form)
    self.__setattr__('ticketInfoForPassengerForm', form)
    self.__setattr__('submit_token', re.findall('globalRepeatSubmitToken = \'(.*)\'', r.text)[0])
```

在搞到这两个JS变量后，表单已经几乎可以填完整了，purpose_codes虽然没有明说来自哪里，但通过JS断点分析可以容易判断出它也是来自于ticketInfoForPassengerForm。还剩最后一个东西：train_date，看上去不就是个日期吗？但表单里的数据是长这样的：


`train_date: Tue Oct 12 2021 00:00:00 GMT+0800 (中国标准时间)`


这日期怎么花里胡哨的，再看JS代码长这样：

```js
new Date(orderRequestDTO.train_date.time).toString()
```

试了一下发现JavaScript的日期转字符串居然真是这么花里胡哨，我懒得用Python去实现这么一个花里胡哨的日期字符串，因此最后我的实现方法是：

```python
js2py.eval_js(f'new Date({train_date}).toString()')
```

这样我们就顺利完成了余票查询请求，见get_queue_count函数


下一篇文章将实现最后的提交订单请求。
