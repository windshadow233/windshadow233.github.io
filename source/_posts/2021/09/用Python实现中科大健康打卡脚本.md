---
title: 用Python实现中科大健康打卡脚本
id: 6401
date: 2021-09-17 05:24:57
categories: [瞎捣鼓经历]
tags: ['Python', '爬虫']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpeg/ca249dda5ff2fd5ec5dbb2975f129f52.jpeg
disableNunjucks: false
---

新冠疫情期间，学校规定假期必须每天进行健康打卡，汇报自身各项情况，在开学前未中断且打满14天才可申请返校，而开学后虽然不管，但原则上仍需每天打卡、每周报备。

打卡？这辈子不可能手动打卡的，我决定写一个爬虫脚本来自动打卡。


## 登录


首先来分析一下打卡的登录逻辑：


1. 打卡平台的网址是`https://weixine.ustc.edu.cn/2020/home`。
2. 点进去发现其跳转到了`https://weixine.ustc.edu.cn/2020/login`，其中有一条“统一身份认证登录”。
3. 点击“统一身份认证登录”，页面跳转到`https://passport.ustc.edu.cn/login?service=https%3A%2F%2Fweixine.ustc.edu.cn%2F2020%2Fcaslogin`，这是打卡平台在科大统一身份认证平台注册的CAS身份认证服务链接，我们在此需要输入科大Passport的账号密码，即可登录。

因此，从这个逻辑可以得到，我们可以向上面第3点中的CAS身份认证URL发送包含登录信息的POST数据包，来实现登录。不过，事实上只要我们先在会话中登录了`https://passport.ustc.edu.cn`，即中科大身份认证系统，再对CAS认证URL直接发送GET请求，可以达到相同的效果，为了降低耦合，我选择了后面一种登录方法。


因此，最终的登录逻辑化为以下两步：


1. 向`https://passport.ustc.edu.cn/login`发送学号、密码等字段信息，使会话登录上中科大身份认证系统。
2. 直接GET请求CAS认证链接：`https://passport.ustc.edu.cn/login?service=https%3A%2F%2Fweixine.ustc.edu.cn%2F2020%2Fcaslogin`进行打卡平台的CAS认证。

登录界面如下：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/741852fa5b00d54b11d3b538bc4d8655.png)
接下来，在浏览器的F12界面中，对中科大身份认证系统的登录过程进行抓包：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/55b1f2f05457c2c6129727ab252e8344.png)

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/76c4b551fd8af4c3eeb03d8a589299d3.png)
发现登录过程向登录链接POST了不少内容，多试几次容易知道，其中的model、service、warn、button等参数都是固定的，showCode参数表示是否需要验证码，然而，直接把showCode取为空串就可以绕过验证码。username和password即学号、密码，用于校内身份认证（这里需要吐槽一下学校的身份认证系统居然还在使用明文传输密码，造成了很大的安全隐患）。


另外，还有一个貌似临时凭证的CAS_LT参数，初看不容易摸索出它的规律，但实际上，CAS_LT正藏在`passport.ustc.edu.cn/login`这个网页中，如下图：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/ba42af97b6c6bb0b16482ded0494ab79.png)
可以使用BeautifulSoup通过id把它找出来。


## 打卡


登录成功以后，我们对打卡系统的CAS链接：`https://passport.ustc.edu.cn/login?service=https%3A%2F%2Fweixine.ustc.edu.cn%2F2020%2Fcaslogin`发起一个GET请求，即可跳转到打卡网页：`https://weixine.ustc.edu.cn/2020/home`，我们先手动打一下卡，看看打卡系统是如何在请求中标识用户身份的。


在Network选项卡下的众多内容中，有一条名为daliy_report的（真不是我不会拼daily这个单词），其提交表单部分内容如下：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/78ffe63d28067bd471902b47d11177c2.png)
上面省略了一部分表单的内容，但容易发现，有一条内容明显与其他内容不同，就是这个_token。短期内多打几次卡，可以发现表单的_token不会发生变化，但重新登录以后，_token则会发生变化，很显然，它用于用户身份的标识，即告诉打卡平台的服务端这条打卡内容是来自哪个同学。既然_token出现在表单内容里，那大概率它就藏在网页的表单当中，找了一下，发现还真有：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/8db1ca38cdca670755d8a1cfc5ca12ec.png)
那么身份标识的问题就解决了，顺便我们也把打卡的过程研究了一遍，其实就是提交这么一个表单到`https://weixine.ustc.edu.cn/2020/daliy_report`。


---

## 代码


接下来开始着手写代码，首先实现登录过程。下面先定义passport登录链接。

```python
self.passport = "https://passport.ustc.edu.cn/login"
```

然后，由于前面这些请求之间并非独立的，而是依赖于共同的cookie，因此必须在同一个会话中发起，不能直接用requests自带的GET、POST方法来完成请求，所以我们需要先建立一个会话（requests.Session对象），使用会话的GET、POST方法。会话会主动维护一个cookie字典。

```python
self.sess = requests.session()
```

然后定义login的主函数：

```python
def login(self, username, password):
    """
    登录,需要提供用户名、密码
    """
    self.sess.cookies.clear()
    CAS_LT = self._get_cas_lt()
    login_data = {
        'username': username,
        'password': password,
        'warn': '',
        'CAS_LT': CAS_LT,
        'showCode': '',
        'button': '',
        'model': 'uplogin.jsp',
        'service': ''
    }
    self.sess.post(self.passport, login_data, allow_redirects=False)
    return self.sess.cookies.get("uc") == username
```

逻辑非常简单，首先把会话的cookie清空，然后通过一个函数获取前文提到的CAS_LT参数，并构造POST表单，调用Session的POST方法，把它提交给passport登录链接，如果登录成功，会话的cookie中会多出一条键为"uc"、值为登录username的键值对，可以通过它来判断是否登录成功。


接下来，来完善前面前面提到的函数：

```python
def _get_cas_lt(self):
    """
    获取登录时需要提供的验证字段
    """
    response = self.sess.get(self.passport)
    CAS_LT = BeautifulSoup(response.text, 'html.parser').find(attrs={'id': 'CAS_LT'}).get('value')
    return CAS_LT
```

上述流程用Session去GET请求passport登录链接，在返回的html中即可获取到CAS_LT。


以上即是登录过程的代码，接下来给出打卡的代码：

```python
self.login_bot = USTCPassportLogin()
self.sess = self.login_bot.sess
# CAS身份认证url
self.cas_url = 'https://passport.ustc.edu.cn/login?service=https%3A%2F%2Fweixine.ustc.edu.cn%2F2020%2Fcaslogin'
# 打卡url
self.clock_in_url = 'https://weixine.ustc.edu.cn/2020/daliy_report'
self.token = ''
```

健康打卡需要两个URL，第一个是打卡平台CAS身份认证的URL，在登录成功以后，对此URL进行请求，以完成CAS认证；第二个是打卡链接。同时，初始化一个login_bot，即为前面定义的登录类。最后初始化一个空字符串作为未登录状态下的token。


打卡系统的登录过程如下：

```python
def login(self, username, password):
    """
    登录,需要提供用户名、密码
    """
    self.token = ''
    is_success = self.login_bot.login(username, password)
    if is_success:
        self.token = self._get_token()
    return is_success
```

若登录成功了，则通过下面的_get_token方法获取到token。

```python
def _get_token(self):
    """
    获取打卡时需要提供的验证字段
    """
    response = self.sess.get(self.cas_url)
    s = BeautifulSoup(response.text, 'html.parser')
    token = s.find(attrs={'name': '_token'}).get('value')
    return token
```

在获取了token以后，我们终于可以进行打卡了：

```python
def daily_clock_in(self, post_data_file):
    """
    打卡函数，需要提供包含表单内容的json文件
打卡成功返回True，打卡失败返回False
    """
    with open(post_data_file, 'r') as f:
        post_data = json.loads(f.read())
    post_data['_token'] = self.token
    response = self.sess.post(self.clock_in_url, data=post_data)
    return self._check_success(response)
```

这里我们从一个JSON文件读取打卡需要的表单，然后在字典中加入_token，对打卡的URL发起POST请求即可，最后通过下面的_check_success方法，来检查是否成功打卡。

```python
def _check_success(self, response):
    """
    简单check一下有没有成功打卡、报备
    """
    s = BeautifulSoup(response.text, 'html.parser')
    msg = s.select('.alert')[0].text
    return '成功' in msg
```

这是由于：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/209055bc68f0c9161caecb933c74de83.png)
综上，我们已经完成了一个健康打卡的脚本，同理也可以实现每周的出校报备，完整的代码见我的GitHub项目：

{%link USTC-Auto-Health-Report,GitHub,https://github.com/windshadow233/USTC-Auto-Health-Report %}


最后，此脚本仅供学习，希望大家为自己和他人的健康负责，在自身健康状态良好的情况下合理使用脚本，切勿上报不实信息！
