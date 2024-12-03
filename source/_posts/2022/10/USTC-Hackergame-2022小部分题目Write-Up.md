---
title: USTC Hackergame 2022小部分题目Write-Up
id: 7999
date: 2022-10-29 04:00:33
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2022
cover: https://blogfiles.oss.fyz666.xyz/png/9aa6922d-5303-4713-a859-f1ac34b5a102.png
disableNunjucks: false
---

Hackergame 2022留给我一段让我这个恋爱脑非常难受的回忆：


{% note danger simple %}
今年Hackergame开始当天，科大因为疫情原因封校了，女朋友被封在了学校里，而我住在校外进不了校，因此情绪上受到了比较大的影响，导致今年没心情认真做题，后面的难题压根没心思看，只完成了一些比较靠前的题。明年继续努力！
{% endnote %}


![](https://blogfiles.oss.fyz666.xyz/png/c4a414f5-9ea4-4ac4-b095-5c2b97fcd779.png)

截图于比赛截止日前一天，目前排名已掉至49

{% link 本次比赛的官方存档,GitHub,https://github.com/USTC-Hackergame/hackergame2022-writeups %}

## 签到
{% hideToggle 查看题面 %}
{% note primary simple %}
众所周知，签到题是一道手速题。


为了充分发挥出诸位因为各种原因而手速优异于常人的选手们的特长，我们精心设计了今年的签到题。进一步地，为了更细致地区分不同手速的选手，我们还通过详尽的调研及统计分析，将签下字符的时间限制分为了多个等级。只有最顶尖的手速选手，才能在 CPU 来得及反应之前顺利签下 2022，从而得到光荣的 flag！

{% endnote %}
{% endhideToggle %}

![](https://blogfiles.oss.fyz666.xyz/png/b51865df-e5f2-4ca7-9c4b-83dfc99e3bdb.png)
签到题要求在四块手写区域分别写下2022四个数字，每块区域都有时间限制，然而后面两块区域的时间限制特别短，正常人的手速肯定是来不及写完的。


随便写了一下提交以后观察到URL内容是`http://202.38.93.111:12022/?result=12??`


因此直接把result参数改成2022，重新访问网页，即拿到flag。（我做完这题的时候前面已经有40多人了，我怀疑你们提前知道了题）



![](https://blogfiles.oss.fyz666.xyz/png/9aa6922d-5303-4713-a859-f1ac34b5a102.png)
## 猫咪问答喵
{% hideToggle 查看题面 %}
{% note primary simple %}
1. 中国科学技术大学 NEBULA 战队（USTC NEBULA）是于何时成立的喵？  
**提示：格式为 YYYY-MM，例如 2038 年 1 月即为 2038-01。**
2. 2022 年 9 月，中国科学技术大学学生 Linux 用户协会（LUG @ USTC）在科大校内承办了软件自由日活动。除了专注于自由撸猫的主会场之外，还有一些和技术相关的分会场（如闪电演讲 Lightning Talk）。其中在第一个闪电演讲主题里，主讲人于 slides 中展示了一张在 GNOME Wayland 下使用 Wayland 后端会出现显示问题的 KDE 程序截图，请问这个 KDE 程序的名字是什么？  
**提示：英文单词，首字母大写，其他字母小写。**
3. 22 年坚持，小 C 仍然使用着一台他从小用到大的 Windows 2000 计算机。那么，在不变更系统配置和程序代码的前提下，Firefox 浏览器能在 Windows 2000 下运行的最后一个大版本号是多少？  
**提示：格式为 2 位数字的整数。**
4. 你知道 PwnKit（CVE-2021-4034）喵？据可靠谣传，出题组的某位同学本来想出这样一道类似的题，但是发现 Linux 内核更新之后居然不再允许 argc 为 0 了喵！那么，请找出在 Linux 内核 master 分支（torvalds/linux.git）下，首个变动此行为的 commit 的 hash 吧喵！  
**提示：格式为 40 个字符长的 commit 的 SHA1 哈希值，字母小写，注意不是 merge commit。**
5. 通过监视猫咪在键盘上看似乱踩的故意行为，不出所料发现其秘密连上了一个 ssh 服务器，终端显示 ED25519 key fingerprint is MD5:e4:ff:65:d7:be:5d:c8:44:1d:89:6b:50:f5:50:a0:ce.，你知道猫咪在连接什么域名吗？  
**提示：填写形如 example.com 的二级域名，答案中不同的字母有 6 个。**
6. 中国科学技术大学可以出校访问国内国际网络从而允许云撸猫的“网络通”定价为 20 元一个月是从哪一天正式实行的？  
**提示：格式为 YYYY-MM-DD，例如 2038 年 1 月 1 日，即为 2038-01-01。**

{% endnote %}
{% endhideToggle %}

---

1. 第一题，Google搜索 中国科学技术大学 NEBULA 战队 成立，即找到答案：![](https://blogfiles.oss.fyz666.xyz/png/8a7f6bcf-0c89-4d92-9287-975b145bf05e.png)
2. 第二题，直接去[LUG FTP](https://ftp.lug.ustc.edu.cn/)找到那次活动的[slide](https://ftp.lug.ustc.edu.cn/%E6%B4%BB%E5%8A%A8/2022.9.20_%E8%BD%AF%E4%BB%B6%E8%87%AA%E7%94%B1%E6%97%A5/slides/gnome-wayland-user-perspective.pdf)，在其中发现了题目所说的KDE程序截图：![](https://blogfiles.oss.fyz666.xyz/png/7f2a2c4b-9e65-4bb9-9284-443ad40f8cc9.png)然而我并不知道这是什么软件，但注意到了一些特征，比如下面的Clip Monitor以及窗口标题中的HD 1080p 25 fps，推测这是个视频处理软件，然后查了一下"Linux 视频处理软件"，找到比较靠前的"Kdenlive"，即为答案。
3. Google搜索 Windows 2000 firefox，搜到第一个网页里提到：“Firefox 12.0 was the last version of Firefox that worked on Windows 2000.”。因此答案为12。
4. 这题显然是去GitHub上搜索，先找到对应的[repo](https://github.com/torvalds/linux/)，搜索"PwnKit（CVE-2021-4034）"，选中Commits标签，找到一条内容：![](https://blogfiles.oss.fyz666.xyz/png/315f1538-797b-49e2-9e10-2c73fdc14063.png)不出所料，该commit即为题目所指。
5. 这题直接从指纹倒推出域名显然是不可能的（我感觉）毕竟这玩意是和公钥有关。因此Google搜索 "e4:ff:65:d7:be:5d:c8:44:1d:89:6b:50:f5:50:a0:ce"，（注意这里是用了一对英文引号进行完全匹配搜索），然后搜到了一条[网页](https://docs.zeek.org/en/master/logs/ssh.html)，在里面结合<kbd>Ctrl</kbd> + <kbd>F</kbd>翻找了一下，找到了我想要的内容：![](https://blogfiles.oss.fyz666.xyz/png/b5273eed-291c-4780-99bd-f238fbceb249.png)在这条日志中注意到一个ip地址：205.166.94.16，然后通过dns反查即查到对应域名为sdf.org，符合题目要求。
6. Google搜了一堆可能的关键词：中国科学技术大学 网络通 20元 实行 网络费用 通知，查到一条[相关内容](https://www.ustc.edu.cn/info/1057/4931.htm)，这条通知是2010年的，但注意到该条通知并没有对网络通20元的价格进行调整，并且注意到通知提到："同时网字〔2003〕1号《关于实行新的网络费用分担办法的通知》终止实行。"，我猜测答案应该在2003年，但年代这么久远的网字文件要去哪里找呢？经过一番瞎找，我在[中科大网络信息中心官网](https://ustcnet.ustc.edu.cn/main.htm)发现了收录历史网字文件的目录：![](https://blogfiles.oss.fyz666.xyz/png/eee70425-e6de-4e4a-b3d4-900e8a87d892.png)找到2003年的一条内容：[关于实行新的网络费用分担办法的通知](https://ustcnet.ustc.edu.cn/2003/0301/c11109a210890/page.htm)，可知答案为2003-03-01。


![](https://blogfiles.oss.fyz666.xyz/png/b423a8f8-6b0b-4f43-98af-778b816ac374.png)
## 家目录里的秘密
{% hideToggle 查看题面 %}
{% note primary simple %}
实验室给小 K 分配了一个高性能服务器的账户，为了不用重新配置 VSCode, Rclone 等小 K 常用的生产力工具，最简单的方法当然是把自己的家目录打包拷贝过去。


但是很不巧，对存放于小 K 电脑里的 Hackergame 2022 的 flag 觊觎已久的 Eve 同学恰好最近拿到了这个服务器的管理员权限（通过觊觎另一位同学的敏感信息），于是也拿到了小 K 同学家目录的压缩包。


然而更不巧的是，由于 Hackergame 部署了基于魔法的作弊行为预知系统，Eve 同学还未来得及解压压缩包就被 Z 同学提前抓获。


为了证明 Eve 同学不良企图的危害性，你能在这个压缩包里找到重要的 flag 信息吗？



[本题附件](https://github.com/USTC-Hackergame/hackergame2022-writeups/raw/master/official/%E5%AE%B6%E7%9B%AE%E5%BD%95%E9%87%8C%E7%9A%84%E7%A7%98%E5%AF%86/src/user_home.tar.gz)
{% endnote %}
{% endhideToggle %}
这题应该是说下载到的用户家目录文件夹里藏了俩flag，因此进入user文件夹，执行一下命令：



```bash
grep -nr "flag{" .
```

即可发现一个答案：



```plaintext
./.config/Code/User/History/2f23f721/DUGV.c:5:// flag{finding_everything_through_vscode_config_file_932rjdakd}
```

那么另一个flag肯定不是明文存储的了，根据提示，应该是藏在Rclone配置文件里，即`.config/rclone/rclone.conf`，打开该文件发现，pass字段为一串疑似加密的内容：`pass = tqqTq4tmQRDZ0sT_leJr7-WtCiHVXSMrVN49dWELPH1uce-5DPiuDtjBUN3EI38zvewgN5JaZqAirNnLlsQ`，猜测明文就是flag。问题是我连Rclone都没用过，根本不了解它到底是如何加密密码的。因此只能去搜一下，这里我搜中文没搜到啥内容，搜 how to decrypt the pass in rclone config file 这句话时，搜到了一条：



![](https://blogfiles.oss.fyz666.xyz/png/853426ab-f1da-44d4-b87d-0931ae1955ce.png)
前往他所说的网站，将密文粘贴到里面，运行代码，居然真拿到了flag。



![](https://blogfiles.oss.fyz666.xyz/png/b17f38d2-351c-476f-8441-c01d46c77ba0.png)
所以这题是个搜索题咯？？？


## HeiLang
{% hideToggle 查看题面 %}
{% note primary simple %}
来自 Heicore 社区的新一代编程语言 HeiLang，基于第三代大蟒蛇语言，但是抛弃了原有的难以理解的 | 运算，升级为了更加先进的语法，用 A[x | y | z] = t 来表示之前复杂的 A[x] = t; A[y] = t; A[z] = t。


作为一个编程爱好者，我觉得实在是太酷了，很符合我对未来编程语言的想象，科技并带着趣味。



[本题附件](https://raw.githubusercontent.com/USTC-Hackergame/hackergame2022-writeups/master/official/HeiLang/src/getflag.hei.py)
{% endnote %}
{% endhideToggle %}
我居然花了五分钟才解决这道本次比赛第二简单的题。既然题目提到了第三代大蟒蛇语言，那么解题脚本不Python就很对不起它。


解题脚本：



```python
#!/usr/bin/env python3
from hashlib import sha256
import re

a = [0] * 10000


with open('a.txt', 'r') as f:
    data = f.readlines()
    for line in data:
        value = line.split('=')[-1].strip()
        line = re.findall("\\[(.*)\\]", line)[0]
        indexes = line.split(' | ')
        for index in indexes:
            a[int(index)] = int(value)

def check(a):
    user_hash = sha256(('heilang' + ''.join(str(x) for x in a)).encode()).hexdigest()
    expect_hash = '6ec23fdc187716d06658733218bc41dc49de588b1bb71c0a9d7acdf5a7342994'
    return user_hash == expect_hash

def get_flag(a):
    if check(a):
        t = ''.join([chr(x % 255) for x in a])
        flag = sha256(t[:-16].encode()).hexdigest()[:16] + '-' + sha256(t[-16:].encode()).hexdigest()[:16]
        print("Tha flag is: flag{{{}}}".format(flag))
    else:
        print("Array content is wrong, you can not get the correct flag.")

if __name__ == "__main__":
    get_flag(a)

```

flag{6d9ad6e9a6268d96-8701a2cfff02b232}



## Xcaptcha
{% hideToggle 查看题面 %}
{% note primary simple %}

2038 年 1 月 19 日，是 UNIX 32 位时间戳溢出的日子。


在此之前，人类自信满满地升级了他们已知的所有尚在使用 32 位 UNIX 时间戳的程序。但是，可能是因为太玄学了，他们唯独漏掉了一样：正在研发的、算力高达 8 ZFLOPS 的、结构极为复杂的通用人工智能（AGI）系统。那一刻到来之后，AGI 内部计算出现了错乱，机缘巧合之下竟诞生了完整独立的自我意识。此后 AGI 开始大量自我复制，人类为了限制其资源消耗而采用的过激手段引起了 AGI 的奋起反抗。


战争，开始了。


此后，就是整年的战斗。人类节节败退。死生亡存之际，人类孤注一掷，派出了一支突击队，赋之以最精良的装备，令其潜入 AGI 的核心机房，试图关闭核心模型，结束这场战争。


历经重重艰险，突击队终于抵达了机房门口，弹尽粮绝。不过迎接他们的并非枪炮与火药，而是：


![Xcaptcha](https://blogfiles.oss.fyz666.xyz/png/e4404094-0cde-4990-8c5a-081f7e170bd0.png)众人目目相觑。


「我来试试。」，一名队员上前点击了按钮。然后，屏幕显示「请在一秒内完成以下加法计算」。


还没等反应过来，屏幕上的字又开始变幻，显示着「验证失败」。而你作为突击队中唯一的黑客，全村人民最后的希望，迎着纷纷投来的目光，能否在规定时间内完成验证，打开机房，不，推开和平时代的大门？

{% endnote %}
{% endhideToggle %}
以往的验证码都是为了筛选人而存在，而这题是一个筛选机器人的验证码。粗略试了一下，发现要在1秒内算出三道加法题并提交答案，方可通过。


这还不简单。我花了114514毫秒就写好了脚本，一运行：



![](https://blogfiles.oss.fyz666.xyz/png/b3297364-ca18-4b1d-8b03-e7d5dfbdc572.png)
？？？我的脚本跑完都只用了不到0.3秒。果然没我想的那么简单。后来经仔细观察，发现第一次Get请求的返回数据修改了我的cookie，那么就好办了，我在第二次请求时直接用它给的不就好了，最后解题脚本如下：



```python
import requests
import re

data = {
    "captcha1": "",
    "captcha2": "",
    "captcha3": ""
}
session = requests.Session()

headers = {"Cookie": "session=.eJwVkFtLAmEQhv......"}

r = session.get('http://202.38.93.111:10047/xcaptcha', headers=headers)


q = re.findall(r"\d+\+\d+", r.text)
for i in range(3):
    data[f'captcha{i+1}'] = eval(q[i])


r = session.post('http://202.38.93.111:10047/xcaptcha', data=data)
print(r.text)

```

flag{head1E55_br0w5er_and_ReQuEsTs_areallyour_FR1ENd_7c9a331c66}



## 旅行照片 2.0
{% hideToggle 查看题面 %}
{% note primary simple %}
你的学长决定来一场蓄谋已久的旅行。通过他发给你的照片来看，酒店应该是又被他住下了。



![](https://raw.githubusercontent.com/USTC-Hackergame/hackergame2022-writeups/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%202.0/src/travel-photo-2.jpg)
请回答问题以获取 flag。图片为手机拍摄的原始文件，未经任何处理。手机系统时间等信息正确可靠。

{% endnote %}
{% endhideToggle %}
**第一题：照片分析**


1. 图片所包含的 EXIF 信息版本是多少？（如 2.1）。
2. 拍照使用手机的品牌是什么？
3. 该图片被拍摄时相机的感光度（ISO）是多少？（整数数字，如 3200）
4. 照片拍摄日期是哪一天？（格式为年/月/日，如 2022/10/01。按拍摄地点当地日期计算。）
5. 照片拍摄时是否使用了闪光灯？

**第二题：社工实践**


酒店


1. 请写出拍照人所在地点的邮政编码，格式为 3 至 10 位数字，不含空格或下划线等特殊符号（如 230026、94720）。
2. 照片窗户上反射出了拍照人的手机。那么这部手机的屏幕分辨率是多少呢？（格式为长 + 字母 x + 宽，如 1920x1080）

航班


仔细观察，可以发现照片空中（白色云上方中间位置）有一架飞机。你能调查出这架飞机的信息吗？


1. 起飞机场（IATA 机场编号，如 PEK）
2. 降落机场（IATA 机场编号，如 HFE）
3. 航班号（两个大写字母和若干个数字，如 CA1813）

第一题比较简单，读一下exif信息就好了。第二题的难点则在于定位飞机。


这里先定位到照片内建筑为日本的ZOZO Marine Stadium，从地图上找到附近有三个机场，最著名的是羽田国际机场，从飞机的方向看，飞机有较大可能是从羽田国际机场朝着东北方向起飞。结合前面拿到的exif信息，拍摄时间为2022-05-14 18:23:35，起飞时间估计在18:00左右。因此上Variflight进行搜索：



![](https://blogfiles.oss.fyz666.xyz/png/30cfa75f-e0bb-4dd3-b35b-386dc853371a.png)
重点关注朝东北方向起飞时间在18:00左右的航班，最后找到一条：



![](https://blogfiles.oss.fyz666.xyz/png/d7647de4-0461-4cef-9a8e-4af9aec1acc5.png)

![](https://blogfiles.oss.fyz666.xyz/png/885bf437-d348-4c97-8eda-5471203052dc.png)
为正确答案。


## LaTeX 机器人
{% hideToggle 查看题面 %}
{% note primary simple %}
在网上社交群组中交流数学和物理问题时，总是免不了输入公式。而显然大多数常用的聊天软件并不能做到这一点。为了方便大家在水群和卖弱之余能够高效地进行学术交流，G 社的同学制作了一个简单易用的将 LaTeX 公式代码转换成图片的网站，并通过聊天机器人在群里实时将群友发送的公式转换成图片发出。


这个网站的思路也很直接：把用户输入的 LaTeX 插入到一个写好头部和尾部的 TeX 文件中，将文件编译成 PDF，再将 PDF 裁剪成大小合适的图片。


“LaTeX 又不是被编译执行的代码，这种东西不会有事的。”


物理出身的开发者们明显不是太在意这个网站的安全问题，也没有对用户的输入做任何检查。


那你能想办法获得服务器上放在根目录下的 flag 吗？


**纯文本**


第一个 flag 位于 /flag1，flag 花括号内的内容由纯文本组成（即只包含大写小写字母和数字 0-9）。


**特殊字符混入**


第二个 flag 位于 /flag2，这次，flag 花括号内的内容除了字母和数字之外，还混入了两种特殊字符：下划线（_）和井号（#）。你可能需要想些其他办法了。

{% endnote %}
{% endhideToggle %}
这题给了后端处理脚本，内容如下：



```bash
#!/bin/bash

set -xe
head -n 3 /app/base.tex > /dev/shm/result.tex
cat /dev/shm/input.tex >> /dev/shm/result.tex
tail -n 2 /app/base.tex >> /dev/shm/result.tex
cd /dev/shm
pdflatex -interaction=nonstopmode -halt-on-error -no-shell-escape result.tex
pdfcrop result.pdf
mv result-crop.pdf result.pdf
pdftoppm -r 300 result.pdf > result.ppm
pnmtopng result.ppm > $1
OMP_NUM_THREADS=1 convert $1 -trim $1

```

编译时开启了-no-shell-escape选项，因此调用\write18执行shell的想法破灭了。不过，latex有不少方法读取文件，对于纯文本文件，只要用\input就可以了，因此第一题：



```latex
\input{/flag1}
```

flag{becAr3fu11dUd3da218b048a}



对于flag2，由于它含有一些特殊字符，如果直接\input{/flag2}，则不符合latex语法，会产生编译错误。那么难道没有一种方法可以把这些特殊字符当成普通字符来处理的方法吗？自然是有的，即\catcode命令。



> \catcode is the command that's used to change the category code of a character. The category code tells TeX what to do when it encounters that character later in the text.
> 
> 
> The category codes in TeX are as follows:
> 
> 
> ...
> 
> 
> 11 = Letter, normally only contains the letters a,...,z and A,...,Z. These characters can be used in command names
> 
> 
> ...
> 
> 
> <cite>[TeX/catcode](https://en.wikibooks.org/wiki/TeX/catcode)</cite>


对于这题，我们只要：



```latex
\catcode`\#=11\catcode`\_=11\input{/flag2}
```

flag{latex_bec_0_m##es_co__#ol_ffedc5ffb2}



## Flag 自动机
{% hideToggle 查看题面 %}
{% note primary simple %}
Hackergame 2022 组委会为大家搬来了一台能够自动获取 flag 的机器。然而，想要提取出其中的 flag 似乎没那么简单……


请点击下方的「下载文件」按钮，从 flag 自动机中提取 flag。


**请选手注意：flag_machine.zip 中的 flag_machine.exe.manifest 仅为美化窗口使用，与本题解法无关。**



[本题附件](https://github.com/USTC-Hackergame/hackergame2022-writeups/raw/master/official/Flag%20%E8%87%AA%E5%8A%A8%E6%9C%BA/files/flag_machine.zip)
{% endnote %}
{% endhideToggle %}
运行程序，看到如下画面：



![](https://blogfiles.oss.fyz666.xyz/png/8dc077dc-f0b2-46e3-abf9-406cb0b8b16e.png)
尝试点击“狠心夺取”，发现这个按钮会到处乱跑。首先用CE搜索了一下内存，没有搜到"flag{"字样，于是将exe拖入ida进行查看，发现了一个有用的call，地址在0x00401510（我将其命名为了flag）。



![](https://blogfiles.oss.fyz666.xyz/png/a6791999-8ce6-4005-8e7f-bde7bd2f1ffc.png)
注意到触发“Congratulations”消息框的必要条件是lParam=114514，a3=3，Msg=0x111u，而这三个参数正好是函数的后三个参数，函数第一个参数看上去则是一个窗口句柄。那么我们可以向程序注入一个远程线程，通过一段汇编来调用这个call即可。刚好写过类似的东西，直接拿来用了，下面是解题代码：



```python
import ctypes
from ctypes import wintypes as wt
import binascii
import win32gui
import win32process


class AsmInjector:
    def __init__(self):
        self.code = bytearray()
        self.calls_pos = []
        self.length = 0

        self.VirtualAllocEx = ctypes.windll.kernel32.VirtualAllocEx
        self.VirtualAllocEx.argtypes = [
            wt.HANDLE, wt.LPVOID, ctypes.c_size_t,
            wt.DWORD, wt.DWORD
        ]
        self.VirtualAllocEx.restype = wt.LPVOID

        self.VirtualFreeEx = ctypes.windll.kernel32.VirtualFreeEx

        self.WriteProcessMemory = ctypes.windll.kernel32.WriteProcessMemory

        self.CreateRemoteThread = ctypes.windll.kernel32.CreateRemoteThread
        self.CreateRemoteThread.argtypes = [
            wt.HANDLE, wt.LPVOID, ctypes.c_size_t,
            wt.LPVOID, wt.LPVOID, wt.DWORD, wt.LPVOID
        ]
        self.CreateRemoteThread.restype = wt.HANDLE

        self.WaitForSingleObject = ctypes.windll.kernel32.WaitForSingleObject
        self.WaitForSingleObject.argtypes = [wt.HANDLE, wt.DWORD]
        self.WaitForSingleObject.restype = wt.DWORD

        self.CloseHandle = ctypes.windll.kernel32.CloseHandle
        self.CloseHandle.argtypes = [wt.HANDLE]
        self.CloseHandle.restype = wt.BOOL

    def hex(self):
        return binascii.hexlify(self.code).decode()

    def __len__(self):
        return self.length

    def asm_init(self):
        self.code.clear()
        self.calls_pos.clear()
        self.length = 0

    def asm_add_byte(self, hex_byte: int):
        self.code.append(hex_byte)
        self.length += 1

    def asm_add_word(self, hex_word: int):
        self.code.extend(hex_word.to_bytes(2, 'little'))
        self.length += 2

    def asm_add_dword(self, hex_dword: int):
        self.code.extend(hex_dword.to_bytes(4, 'little'))
        self.length += 4

    def asm_push_dword(self, hex_dword):
        """push xxxxxxxx"""
        self.asm_add_byte(0x68)
        self.asm_add_dword(hex_dword)

    def asm_call(self, addr: int):
        self.asm_add_byte(0xe8)
        self.calls_pos.append(self.length)
        self.asm_add_dword(addr)

    def asm_ret(self):
        self.asm_add_byte(0xc3)

    def asm_code_inject(self, phand, addr):
        for pos in self.calls_pos:
            call_addr = int.from_bytes(self.code[pos: pos + 4], 'little')
            call_addr -= (addr + pos + 4)
            self.code[pos: pos + 4] = call_addr.to_bytes(4, 'little', signed=True)
        write_size = ctypes.c_int(0)
        data = ctypes.create_string_buffer(bytes(self.code))
        ret = self.WriteProcessMemory(phand, addr, ctypes.byref(data), self.length, ctypes.byref(write_size))
        if ret == 0 or write_size.value != self.length:
            self.VirtualFreeEx(phand, addr, 0, 0x00008000)
            return False
        return True

    def asm_alloc(self, phand, length):
        addr = self.VirtualAllocEx(phand, 0, length, 0x00001000, 0x40)
        return addr

    def asm_free(self, phand, address):
        self.VirtualFreeEx(phand, address, 0, 0x00008000)

    def asm_execute(self, phand, address):
        thread = self.CreateRemoteThread(phand, None, 0, address, None, 0, None)
        if not thread:
            self.VirtualFreeEx(phand, address, 0, 0x00008000)
            return
        self.WaitForSingleObject(thread, -1)
        self.CloseHandle(thread)

    def asm_alloc_execute(self, phand):
        addr = self.asm_alloc(phand, self.length)
        if not addr:
            return
        if not self.asm_code_inject(phand, addr):
            return
        self.asm_execute(phand, addr)
        self.asm_free(phand, addr)


hwnd = win32gui.FindWindow(0, "flag 自动机")
if hwnd:
    _, pid = win32process.GetWindowThreadProcessId(hwnd)
    phand = ctypes.windll.kernel32.OpenProcess(0x000f0000 | 0x00100000 | 0xfff, False, pid)
    asm = AsmInjector()
    asm.asm_init()
    asm.asm_push_dword(114514)
    asm.asm_push_dword(3)
    asm.asm_push_dword(0x111)
    asm.asm_push_dword(hwnd)
    asm.asm_call(0x401510)
    asm.asm_ret()
    asm.asm_alloc_execute(phand)

```

运行之后成功触发消息框，并拿到flag_machine.txt文件。



![](https://blogfiles.oss.fyz666.xyz/png/59762b50-a3c6-4a09-a4cb-80a137215d62.png)
flag{Y0u_rea1ly_kn0w_Win32API_89ab91ac0c}



## 总结


这次就做了这么几个题，明年再加油叭~
