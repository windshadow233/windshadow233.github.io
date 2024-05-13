---
title: PKU GeekGame 2nd 部分题目Write-Up
id: 8100
date: 2022-11-26 04:06:08
categories: 
  - CTF题解
tags:
  - GeekGame
  - GeekGame 2nd
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/054393d1edee5173e764194e4a43002b.png
disableNunjucks: false
mathjax: true
---

GeekGame 2nd结束了，今年的题没有了去年那种套娃，难度有所下降，总体感觉不错，也取得了比去年更高的总排名（29），对一名非专业菜鸟玩家而言，我已经相当满意。

更重要的是，我在解题过程中学到了不少东西，也获得了不少乐趣，而不是像去年那样晕头转向没有方向感。

{% link 本次比赛的官方存档,GitHub,https://github.com/PKU-GeekGame/geekgame-2nd %}

## †签到†

去年的签到我想了半个小时，今年只用了20秒。别问，问就是一模一样，见[去年的题解](/blog/7311/)。~~（PKU GeekGame的出题人怎么不在签到题上点心。~~ 官方题解出来后发现其实和去年的签到是有区别的，这次的PDF用某些阅读器打开会发现无法复制，然而我是用Chrome的沙拉查词插件带的PDF阅读器打开的，因此不受影响。

[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/signin/attachment/prob19.pdf)

## 小北问答 · 极速版
{% hideToggle 查看题面 %}
{% note primary simple %}
菜宝十分擅长网上冲浪，会使用十种甚至九种搜索引擎。本届 PKU GeekGame 一开始，她就急不可耐地打开了小北问答题目，想要在一血榜上展现她惊人的情报搜集能力。


为了让菜宝玩得开心，小北问答题目全新升级为小北问答 · 极速版。


小北问答 · 极速版自带省流助手，基于 socket 通信的纯文字 UI 简洁朴实，不浪费网络上的每一毫秒。


小北问答 · 极速版自带速通计时，只有手速够快的 CTF 选手才是好的 CTF 选手。


小北问答 · 极速版自带肉鸽玩法，每次连接到题目都有不一样的问题在等着你。


赶紧打开网页终端体验小北问答 · 极速版，把 Flag 抱回家吧！

{% endnote %}
{% endhideToggle %}
与以往的问答题不同，这次问答平台提供的是一个终端，经多次尝试，发现共有以下8道题：

{% hideToggle 展开题目 %}
{% note primary simple %}
1. 北京大学某实验室曾开发了一个叫 gStore 的数据库软件。最早描述该软件的论文的 DOI 编号是多少？  
**答案格式：^[\d.]+\/[\d.]+$**
2. 我刚刚在脑海中想了一个介于 a 到 b 之间的质数。猜猜它是多少？  
**答案格式：^\d+$**
3. 访问网址 “[http://ctf.世界一流大学.com](http://ctf.世界一流大学.com)” 时，向该主机发送的 HTTP 请求中 Host 请求头的值是什么？  
**答案格式：^[^:\s]+$**
4. 支持 WebP 图片格式的最早 Firefox 版本是多少？  
**答案格式：^\d+$**
5. 每个 Android 软件都有唯一的包名。北京大学课外锻炼使用的最新版 PKU Runner 软件的包名是什么？  
**答案格式：^[a-z.]+$**
6. 我有一个朋友在美国，他无线路由器的 MAC 地址是 d2:94:35:21:42:43。请问他所在地的邮编是多少？  
**答案格式：^\d+$**
7. 视频 bilibili.com/video/BV1EV411s7vu 也可以通过 bilibili.com/video/av_____ 访问。下划线内应填什么数字？  
**答案格式：^\d+$**
8. 在第一届 PKU GeekGame 比赛的题目《电子游戏概论》中，通过第 n 级关卡需要多少金钱？  
**答案格式：^\d+$**
{% endnote %}
{% endhideToggle %}
其中，第2题的a与b为比较随机的10位数，第8题的n也是一个动态变化的值。


对于每一题，我的解题思路如下：


1. 找到这个软件的[github仓库](https://github.com/pkumod/gStore)，在Readme文件中找到[Related Essays](https://github.com/pkumod/gStore/blob/1.0/docs/ESSAY.md)，可知最早的相关论文是"gStore: answering SPARQL queries via subgraph matching"，通过crossref搜索得到[此结果](https://search.crossref.org/?from_ui=&q=gStore%3A+Answering+SPARQL+Queries+Via+Subgraph+Matching)。答案：10.14778/2002974.2002976
2. Python的sympy库可以直接寻找nextprime，经测试，a和b中间一般有8个质数，使用大数定律即可解决此问。
3. 打开浏览器的开发者工具，然后访问[http://ctf.世界一流大学.com](http://ctf.世界一流大学.com)，可以抓到数据包，查看request header中的Host值即可。答案：ctf.xn--4gqwbu44czhc7w9a66k.com
4. 谷歌一下即可。答案：65
5. 搜索pku runner，发现最新版本的[下载链接](https://pkunewyouth.pku.edu.cn/public/apks/pkurunner-latest.apk)。在Linux上使用命令：`aapt dump badging pkurunner-latest.apk |grep package`，即可找到包名。答案：cn.edu.pku.pkurunner
6. 不会，但根据二阶段的提示容易找到答案为80304
7. 搜索 bv转av，搜到[工具](http://www.atoolbox.net/Tool.php?Id=910)。答案：418645518
8. 找到相关题目的[源码](https://github.com/PKU-GeekGame/geekgame-1st/blob/master/src/pygame/game/server/libtreasure.py)，容易发现计算每一关目标金钱的函数：`GOAL_OF_LEVEL = lambda level: 300+int(level***1.5)**100`

虽然有一题不会，但由于每次只从题库中随机7题，那么仍有概率可以全部做对。题目还要求在3秒内完成作答，因此使用pwntools。下面为解题代码：



```python
import random
import pwn
import sympy
import re

GOAL_OF_LEVEL = lambda level: 300+int(level**1.5)*100
r = pwn.remote('prob01.geekgame.pku.edu.cn', 10001)
r.recvuntil(b'Please input your token:')
r.sendline(b'0:this_is_my_token')
print(r.recvuntil('输入“急急急”开始答题。\n>'.encode('utf-8')).decode('utf-8'))
r.sendline('急急急'.encode('utf-8'))
r.recvuntil('\n计时开始。\n'.encode('utf-8'))

for i in range(7):
    q = r.recvuntil(b'>').decode('utf-8')
    print(q)
    if '世界一流大学' in q:
        r.sendline(b'ctf.xn--4gqwbu44czhc7w9a66k.com')
    elif 'Android' in q:
        r.sendline(b'cn.edu.pku.pkurunner')
    elif 'bilibili' in q:
        r.sendline(b'418645518')
    elif 'gStore' in q:
        r.sendline(b'10.14778/2002974.2002976')
    elif 'Firefox' in q:
        r.sendline(b'65')
    elif '质数' in q:
        p1, p2 = re.findall(r'\d{8,}', q)
        p1 = int(p1)
        p2 = int(p2)
        maybe_ans = []
        ans = sympy.nextprime(p1)
        while ans < p2:
            maybe_ans.append(ans)
            ans = sympy.nextprime(ans)
        r.sendline(str(maybe_ans[3]).encode())
    elif '电子游戏' in q:
        level = int(re.findall(r'通过第 (\d+) 级', q)[0])
        r.sendline(str(GOAL_OF_LEVEL(level)).encode())
    elif 'MAC' in q:
        ans = f"{random.randint(0, 99999):05}"
        r.sendline(ans.encode())
    res = r.recvline().decode('utf-8')
    print(res)
    if '不' in res:
        r.close()
        break
else:
    while 1:
        try:
            print(r.recv().decode())
        except EOFError:
            break

```

只要多逝亿下就可以拿到flag~。在有了二阶段的第6题提示后，只要多试一下就能拿flag了。



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/41303a6fbe886ae315d00f835fe035e7.png)
## 编原译理习题课
{% hideToggle 查看题面 %}
{% note primary simple %}
一个测试工程师走进一家酒吧，要了一杯啤酒。


一个测试工程师走进一家酒吧，要了一杯咖啡。


一个测试工程师走进一家酒吧，要了 0.7 杯啤酒。


一个测试工程师走进一家酒吧，要了-1 杯啤酒。


一个测试工程师走进一家酒吧，要了一份雪王大圣代和冰鲜柠檬水。


一个测试工程师走进一家酒吧，对核验健康宝的店员出示了舞萌 DX 玩家二维码。


一个测试工程师走进一家酒吧，打开了 PKU GeekGame 比赛平台。


一个测试工程师走进一家酒吧，用 g++ 编译他的代码。


酒吧没炸，但 g++ 炸了。


你知道多少种让 g++ 爆炸的姿势呢？快来大显身手吧。


让 g++ 编译出的程序超过 8MB 可以获得 Flag 1


让 g++ 输出的报错信息超过 2MB 可以获得 Flag 2


让 g++ 因为段错误而崩溃 可以获得 Flag 3



[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/gcc/attachment/prob04.zip)
{% endnote %}
{% endhideToggle %}

### flag1


非常简单，唯一一个我自己就会做的flag。只要在程序里定义一个很大的全局变量就好了。



```cpp
char const bigarray[8*1024*1024] = {1};
int main(){return 0;}
```

flag{nOt-much-LargEr-than-an-electron-apP}



### flag2


搜索 g++ huge error log，搜到[相关内容](https://stackoverflow.com/questions/54004610/why-does-g-generate-huge-error-log)。发现下面代码可以拿到flag2：



```cpp
struct x struct z<x(x(x(x(x(x(x(x(x(x(x(x(x(x(x(x(x(x(x(x(y,x(y><y*,x(y*w>v<y*,w,x{}
```

flag{shorT volatile program; long loNg mesSagE;}



### flag3


搜索 g++ crash，搜到[此网页](https://gcc.gnu.org/bugzilla/show_bug.cgi?id=54080)。在里面找到一段代码，亲测可行：



```cpp
template <class T>
class vector{};
template <template <typename U> class Container,typename Func>
vector<int> foo(const Container<int>& input, const Func &func){}
template <template <typename U> class OutType,typename Func1,typename FuncRest>
auto foo(const vector<int> &input, const Func1 &func1, const FuncRest funcrest) -> decltype(foo<vector>(foo(input, func1), funcrest))
{return;}
int main()
{
    vector<int> v1;
    foo<vector>(v1, 1, 1);
}
```

flag{soRry-to-inform-you-thAt-gnu-Is-not-uniX}



对于可以直接搜到答案的题，我觉得很迷惑，但，真香（


## Flag Checker
{% hideToggle 查看题面 %}
{% note primary simple %}
我们发现，有很多选手在比赛中提交了错误的 Flag。


为了防止这种情况发生，给选手良好的参赛体验，这里有一个简单的 Java 程序。


你可以在程序里面输入要提交 Flag ，程序会帮你检查 Flag 是否正确。


是不是非常的贴心呢？


提醒：JRE 版本高于 15 时可能无法运行此程序。建议使用 JRE 8 运行。



[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/javarev/attachment/prob15.jar)
{% endnote %}
{% endhideToggle %}
看到题，发现是Java，跳过（我不会Java


过了两三天，发现别的题不太会了，于是来看这题。根据提醒装了下JRE 8，然后试了几个Java反编译程序，最后用luyten解决了。


反编译出来的代码如下：



```java
import java.awt.*;
import java.io.*;
import javax.swing.*;
import javax.script.*;
import java.awt.event.*;
import java.util.*;

public class GeekGame extends Frame implements ActionListener
{
    TextField textField1;
    Button button1;
    Button button2;
    Invocable invocable;
    
    GeekGame() {
        this.setSize(300, 300);
        this.setVisible(true);
        this.setLayout(new BoxLayout(this, 1));
        final Label label = new Label("Flag: ");
        this.textField1 = new TextField("flag{...}");
        (this.button1 = new Button("Check Flag 1")).addActionListener(this);
        (this.button2 = new Button("Check Flag 2")).addActionListener(this);
        this.add(label);
        this.add(this.textField1);
        this.add(this.button1);
        this.add(this.button2);
        final ScriptEngine engineByName = new ScriptEngineManager().getEngineByName("nashorn");
        try {
            final String s = "\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00cf\u008c\u0087\u008a\u008c\u0084\u0089\u0083\u008e\u0088\u00dd\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dd\u00c6\u0094\u0099\u008e\u009d\u00cf°\u00df\u0097\u00d8\u00dd\u00db\u008d\u00d2´\u00c8\u008c\u0087\u008e\u009d¬\u0080\u008b\u008a®\u009b\u00c8\u00c3\u00c8\u0082\u008e\u009f\u00c8\u00c3\u00c8\u00c8\u00c3\u00c8\u009c\u009f\u0083\u0086\u009b\u00c8\u00c3\u00c8\u009c\u009b\u009d\u0086\u0081\u0088\u0086\u0089\u0096\u00c8\u00c3\u00c8¬\u0080\u009d\u009d\u008a\u008c\u009b\u00c8\u00c3\u00c8¸\u009d\u0080\u0081\u0088\u00c8\u00c3\u00c8\u0085\u00c2\u00c8²\u00d4\u009d\u008a\u009b\u009a\u009d\u0081\u00cf\u00c7¥¼ ¡´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00db²²\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dd´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dc²²\u00c7°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dd²\u00c6´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00de²²\u00c7\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0094\u009d\u008a\u009b\u009a\u009d\u0081\u00cf°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00df²²\u00c7\u00df\u00c6\u0092\u00c6\u00c6\u00d2\u00d2\u00cf¥¼ ¡´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00db²²\u00c7´\u00df\u00c3\u00de\u00da\u00c3\u00de\u00d9\u00c3\u00de\u00d8\u00c3\u00dc\u00df\u00c3\u00de\u00df\u00da\u00c3\u00de\u00d9\u00c3\u00dc\u00de\u00c3\u00de\u00d9\u00c3\u00d9\u00d8\u00c3\u00dc\u00c3\u00dc\u00dc\u00c3\u00da\u00c3\u00d9\u00df\u00c3\u00db\u00c3\u00de\u00df\u00d9\u00c3\u00d9\u00c3\u00db\u00de\u00c3\u00df\u00c3\u00de\u00c3\u00d9\u00d8\u00c3\u00dc\u00c3\u00de\u00d9\u00c3\u00db\u00c3\u00d9\u00c3\u00dc\u00dc\u00c3\u00dd\u00dc\u00dd²´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00de²²\u00c7\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0094\u009d\u008a\u009b\u009a\u009d\u0081\u00cf\u00c7\u008c\u0087\u008a\u008c\u0084\u0089\u0083\u008e\u0088\u00dd\u00c4\u00cf°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dd²\u00c6´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00df²²\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0092\u00c6\u00c6\u00d0°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00da²\u00d5°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00d9²\u00c6\u0092";
            final StringBuilder sb = new StringBuilder();
            for (int i = 0; i < s.length(); ++i) {
                sb.append((char)(s.charAt(i) ^ '\u00ef'));
            }
            engineByName.eval(sb.toString());
        }
        catch (Exception ex) {
            final StringWriter stringWriter = new StringWriter();
            ex.printStackTrace(new PrintWriter(stringWriter));
            JOptionPane.showMessageDialog(null, stringWriter.toString());
        }
        this.invocable = (Invocable)engineByName;
        this.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(final WindowEvent windowEvent) {
                System.exit(0);
            }
        });
    }
    
    @Override
    public void actionPerformed(final ActionEvent actionEvent) {
        try {
            if (actionEvent.getSource() == this.button1) {
                if ("MzkuM8gmZJ6jZJHgnaMuqy4lMKM4".equals(rot13(Base64.getEncoder().encodeToString(this.textField1.getText().getBytes("UTF-8"))))) {
                    JOptionPane.showMessageDialog(null, "Correct");
                }
                else {
                    JOptionPane.showMessageDialog(null, "Wrong");
                }
            }
            else {
                JOptionPane.showMessageDialog(null, this.invocable.invokeFunction((actionEvent.getSource() == this.button2) ? "checkflag2" : "checkflag3", this.textField1.getText()));
            }
        }
        catch (Exception ex) {
            final StringWriter stringWriter = new StringWriter();
            ex.printStackTrace(new PrintWriter(stringWriter));
            JOptionPane.showMessageDialog(null, stringWriter.toString());
        }
    }
    
    static String rot13(final String s) {
        final StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); ++i) {
            char char1 = s.charAt(i);
            if (char1 >= 'a' && char1 <= 'm') {
                char1 += '\r';
            }
            else if (char1 >= 'A' && char1 <= 'M') {
                char1 += '\r';
            }
            else if (char1 >= 'n' && char1 <= 'z') {
                char1 -= '\r';
            }
            else if (char1 >= 'N' && char1 <= 'Z') {
                char1 -= '\r';
            }
            else if (char1 >= '5' && char1 <= '9') {
                char1 -= '\u0005';
            }
            else if (char1 >= '0' && char1 <= '4') {
                char1 += '\u0005';
            }
            sb.append(char1);
        }
        return sb.toString();
    }
    
    public static void main(final String[] array) {
        final GeekGame geekGame = new GeekGame();
    }
}

```

发现逻辑很简单，幸亏做了一下（


### flag1


是一个rot13+base64，


解题代码：



```python
import base64
import json

def rot13(s):
    res = ""
    for c in s:
        if 'a' <= c <= 'm' or 'A' <= c <= 'M':
            res += chr(ord(c) + 13)
        elif 'n' <= c <= 'z' or 'N' <= c <= 'Z':
            res += chr(ord(c) - 13)
        elif '5' <= c <= '9':
            res += chr(ord(c) - 5)
        elif '0' <= c <= '4':
            res += chr(ord(c) + 5)
    return res


s = "MzkuM8gmZJ6jZJHgnaMuqy4lMKM4"
s = rot13(s)
flag1 = base64.b64decode(s).decode()
print(flag1)
```

flag{s1mp1e-jvav_rev}



### flag2


大概看了一下，发现用到了`this.invocable.invokeFunction`这个函数，经搜索发现是执行JavaScript代码的，意思是执行JavaScript程序中的checkflag2函数。


阅读代码发现最前面执行了一段奇怪的内容：



```java

try {
    final String s = "\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00cf\u008c\u0087\u008a\u008c\u0084\u0089\u0083\u008e\u0088\u00dd\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dd\u00c6\u0094\u0099\u008e\u009d\u00cf°\u00df\u0097\u00d8\u00dd\u00db\u008d\u00d2´\u00c8\u008c\u0087\u008e\u009d¬\u0080\u008b\u008a®\u009b\u00c8\u00c3\u00c8\u0082\u008e\u009f\u00c8\u00c3\u00c8\u00c8\u00c3\u00c8\u009c\u009f\u0083\u0086\u009b\u00c8\u00c3\u00c8\u009c\u009b\u009d\u0086\u0081\u0088\u0086\u0089\u0096\u00c8\u00c3\u00c8¬\u0080\u009d\u009d\u008a\u008c\u009b\u00c8\u00c3\u00c8¸\u009d\u0080\u0081\u0088\u00c8\u00c3\u00c8\u0085\u00c2\u00c8²\u00d4\u009d\u008a\u009b\u009a\u009d\u0081\u00cf\u00c7¥¼ ¡´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00db²²\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dd´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dc²²\u00c7°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dd²\u00c6´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00de²²\u00c7\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0094\u009d\u008a\u009b\u009a\u009d\u0081\u00cf°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00df²²\u00c7\u00df\u00c6\u0092\u00c6\u00c6\u00d2\u00d2\u00cf¥¼ ¡´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00db²²\u00c7´\u00df\u00c3\u00de\u00da\u00c3\u00de\u00d9\u00c3\u00de\u00d8\u00c3\u00dc\u00df\u00c3\u00de\u00df\u00da\u00c3\u00de\u00d9\u00c3\u00dc\u00de\u00c3\u00de\u00d9\u00c3\u00d9\u00d8\u00c3\u00dc\u00c3\u00dc\u00dc\u00c3\u00da\u00c3\u00d9\u00df\u00c3\u00db\u00c3\u00de\u00df\u00d9\u00c3\u00d9\u00c3\u00db\u00de\u00c3\u00df\u00c3\u00de\u00c3\u00d9\u00d8\u00c3\u00dc\u00c3\u00de\u00d9\u00c3\u00db\u00c3\u00d9\u00c3\u00dc\u00dc\u00c3\u00dd\u00dc\u00dd²´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00de²²\u00c7\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0094\u009d\u008a\u009b\u009a\u009d\u0081\u00cf\u00c7\u008c\u0087\u008a\u008c\u0084\u0089\u0083\u008e\u0088\u00dd\u00c4\u00cf°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dd²\u00c6´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00df²²\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0092\u00c6\u00c6\u00d0°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00da²\u00d5°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00d9²\u00c6\u0092";
    final StringBuilder sb = new StringBuilder();
    for (int i = 0; i < s.length(); ++i) {
        sb.append((char)(s.charAt(i) ^ '\u00ef'));
    }
    engineByName.eval(sb.toString());
}
```

我用Python重写了一下，发现字符串sb的值是：



```js
function checkflag2(_0xa83ex2){var _0x724b=['charCodeAt','map','','split','stringify','Correct','Wrong','j-'];return (JSON[_0x724b[4]](_0xa83ex2[_0x724b[3]](_0x724b[2])[_0x724b[1]](function(_0xa83ex3){return _0xa83ex3[_0x724b[0]](0)}))== JSON[_0x724b[4]]([0,15,16,17,30,105,16,31,16,67,3,33,5,60,4,106,6,41,0,1,67,3,16,4,6,33,232][_0x724b[1]](function(_0xa83ex3){return (checkflag2+ _0x724b[2])[_0x724b[0]](_0xa83ex3)}))?_0x724b[5]:_0x724b[6])}
```

稍微整理一下这个函数：



```js
function checkflag2(a){
    return (
        JSON["stringify"](a["split"]("")["map"](
            function(c){
                return c["charCodeAt"](0)
            }
            )
        )=== JSON["stringify"]([0,15,16,17,30,105,16,31,16,67,3,33,5,60,4,106,6,41,0,1,67,3,16,4,6,33,232][b[1]](
            function(c){
                return (checkflag2+ "")["charCodeAt"](c)
            }
            )
        )?'Correct':'Wrong')
}
```

容易理解逻辑，因此flag2也不难，解题代码：



```python
# encoding=utf-8
import json

code = '\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00cf\u008c\u0087\u008a\u008c\u0084\u0089\u0083\u008e\u0088\u00dd\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dd\u00c6\u0094\u0099\u008e\u009d\u00cf°\u00df\u0097\u00d8\u00dd\u00db\u008d\u00d2´\u00c8\u008c\u0087\u008e\u009d¬\u0080\u008b\u008a®\u009b\u00c8\u00c3\u00c8\u0082\u008e\u009f\u00c8\u00c3\u00c8\u00c8\u00c3\u00c8\u009c\u009f\u0083\u0086\u009b\u00c8\u00c3\u00c8\u009c\u009b\u009d\u0086\u0081\u0088\u0086\u0089\u0096\u00c8\u00c3\u00c8¬\u0080\u009d\u009d\u008a\u008c\u009b\u00c8\u00c3\u00c8¸\u009d\u0080\u0081\u0088\u00c8\u00c3\u00c8\u0085\u00c2\u00c8²\u00d4\u009d\u008a\u009b\u009a\u009d\u0081\u00cf\u00c7¥¼ ¡´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00db²²\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dd´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dc²²\u00c7°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dd²\u00c6´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00de²²\u00c7\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0094\u009d\u008a\u009b\u009a\u009d\u0081\u00cf°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00df²²\u00c7\u00df\u00c6\u0092\u00c6\u00c6\u00d2\u00d2\u00cf¥¼ ¡´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00db²²\u00c7´\u00df\u00c3\u00de\u00da\u00c3\u00de\u00d9\u00c3\u00de\u00d8\u00c3\u00dc\u00df\u00c3\u00de\u00df\u00da\u00c3\u00de\u00d9\u00c3\u00dc\u00de\u00c3\u00de\u00d9\u00c3\u00d9\u00d8\u00c3\u00dc\u00c3\u00dc\u00dc\u00c3\u00da\u00c3\u00d9\u00df\u00c3\u00db\u00c3\u00de\u00df\u00d9\u00c3\u00d9\u00c3\u00db\u00de\u00c3\u00df\u00c3\u00de\u00c3\u00d9\u00d8\u00c3\u00dc\u00c3\u00de\u00d9\u00c3\u00db\u00c3\u00d9\u00c3\u00dc\u00dc\u00c3\u00dd\u00dc\u00dd²´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00de²²\u00c7\u0089\u009a\u0081\u008c\u009b\u0086\u0080\u0081\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0094\u009d\u008a\u009b\u009a\u009d\u0081\u00cf\u00c7\u008c\u0087\u008a\u008c\u0084\u0089\u0083\u008e\u0088\u00dd\u00c4\u00cf°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00dd²\u00c6´°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00df²²\u00c7°\u00df\u0097\u008e\u00d7\u00dc\u008a\u0097\u00dc\u00c6\u0092\u00c6\u00c6\u00d0°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00da²\u00d5°\u00df\u0097\u00d8\u00dd\u00db\u008d´\u00d9²\u00c6\u0092'
jscode = ''.join(map(lambda x: chr(ord(x) ^ 0xef), code))
target = json.loads(jscode[255:330])
print(''.join(jscode[i] for i in target))
```

flag{javascript-obfuscator}



## 企鹅文档
{% hideToggle 查看题面 %}
{% note primary simple %}

在一个开源软件学术大会上，主持人突然说：下面请认为无代码开发会减少安全漏洞的同志坐到会场左边，认为无代码开发会增加安全漏洞的同志坐到会场右边。


大部分人坐到了左边，少数人坐到右边，只有 You 酱还坐在中间不动。


主持人：侑同志，你到底认为无代码开发会减少还是增加漏洞？


回答：我认为无代码开发会减少原来存在的漏洞，但是会带来很多新的漏洞。


主持人慌忙说：那请您赶快坐到主席台上来。


企鹅文档相信大家都很熟悉，它是企鹅公司久负盛名的在线文档编辑平台。但是基于企鹅文档的无代码 OA 系统是怎么回事呢？下面就让小编带大家一起了解吧。


基于企鹅文档的无代码 OA 系统，其实就是用企鹅文档来实现 OA 系统。很多企业、学校、组织之前使用 OA 系统来下发通知和填报报表，现在这些机构很多都转向了使用企鹅文档来下发通知和填报报表，当然可以选择问卷星这些类似的服务。


大家可能会感到惊讶，用企鹅文档来填报报表不会出现安全和隐私问题吗？但事实就是这样，小编也感到非常惊讶。


那么这就是基于企鹅文档的无代码 OA 系统了，大家有没有觉得很神奇呢？快快点击左下角的阅读原文来看看基于企鹅文档的无代码 OA 系统吧。



[本题文档](https://docs.qq.com/sheet/DV1lsUFRhQlp5eWtq?tab=BB08J2)

{% endnote %}
{% endhideToggle %}
打开题目我感到很惊讶，因为这题居然出在现实生产环境里，而且就是很多人经常在用的腾讯文档。


打开文档显示以下内容：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/d36b8da86d93870f905a3c03eb9bd355.png)
点了一下下面的单元格，发现它确实不让我看：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/bee204eff0a2a9a7588c17c8397c943e.png)
难道腾讯文档有权限方面的漏洞不成？我Google了一下腾讯文档漏洞，确实好像有一些，但没找到题目里这种可以直接查看受保护区域的。


然后我发现这是个web题，想到会不会腾讯文档的权限验证是在前端完成的，虽然感觉毕竟是TX，怎么可能犯这种愚蠢的错误，但我还是抓了个包看了一下，结果居然真在数据包里发现了这些隐藏起来的东西。。。


需要注意的是，隐藏内容被分在两个不同的请求中，可以通过搜索"机密flag"快速定位到相关内容，于是拿到了一个链接：`https://geekgame.pku.edu.cn/service/template/prob_kAiQcWHobsBzRJEs_next`


访问链接显示以下内容：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/503ac8fe4aa8fe8079c8b1f088b0b71c.png)
点击下载附件，下载到一个har文件（见下方），很多软件都能打开该类型的文件，我用的是Fiddler Classic。


[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/txdocs/attachment/kAiQcWHobsBzRJEs_next.7z)
一开始我在数据包中发现一条链接：`https://docs.qq.com/sheet/DV1hldXRnekRnUGxR`，以为发现了华点，结果打开来一看：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/6ff040fea3f9343ef5dc510a5410d36b.png)
像是保存flag的文档，只是被删掉了。然后我试图通过找文档的历史版本来解题，然而找了半天无果，感觉这应该并不可能找到。于是只能换条路子。


很容易在一堆数据包中发现某条请求（`GET /dop-api/get/sheet?u=75c5d3b1d8fb43489cd2c3033995b7a5&subId=BB08J2&rev=1&fRev=1&padId=300000000$WXeutgzDgPlQ&wb=1&isChunks=true&nowb=0&xsrf=1f438a6825f53e17&_r=8500&revdata=1&outformat=1&normal=1&startrow=0&endrow=2000`）的response中有一些重要内容：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/37acea2b6c98c9cec858ad6140bcee10.png)
一开始我没注意到前面网页里的“提示”，然后对着上面的重要内容发了半天的呆不知道它想干啥。


后来我注意到了前面的“提示”：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/bfcf715cad4dced0e5fe0a76a45e0a5a.png)

原来如此。然后我研究了一下腾讯文档前端渲染的逻辑。腾讯文档单元格的编号是从左到右，从上到下，从0开始编号，前面Below is your flag下面的一些数字应该表示曾被涂黑过的单元格的编号，将它们转换到具体的单元格，应该可以拼出flag的样子。


于是写了一个脚本处理这个请求的response（我将其命名为maybe_flag.json）：



```python
import json

with open("maybe_flag.json", 'r', encoding='utf-8') as f:
    data = json.loads(f.read())['data']
max_col = data['maxcol']
max_row = data['maxrow']
text = data['initialAttributedText']['text'][0]
keys = set(list(map(int, text[-1][0]['c'][1].keys()))[1:-1])
flag = [[" " for _ in range(max_col)] for _ in range(max_row)]
for i in range(max(keys) + 1):
    row, col = i // max_col, i % max_col
    if i in keys:
        flag[row][col] = "#"
for line in flag:
    print(' '.join(line))

```

执行一下脚本即可竖向打印出flag的样子。


flag{ThisIsNotSponsoredByTencent}



不过依旧觉得在现实环境里出题非常奇怪，现在tx已经把这个权限的漏洞修了，假如这个漏洞是在比赛还没结束的时候修复的，不知道比赛方会作何处理。


## 企业级理解
{% hideToggle 查看题面 %}
{% note primary simple %}
大型企业的软件开发方式与开源项目是不同的。 只有拥有了大型企业特有的企业级理解，才能够更好地让产品为客户赋能，实现前端与后台的解耦，将需求对齐到场景的完整链路中，实现从底层到盈利层的打通……


有些企业选择了坚如磐石的 Java 8 语言，只有在数十亿设备上都能运行的环境才是稳定可靠的环境。


有些企业选择了历久弥新的 Spring Framework，毕竟只需要写几行配置就能为一个巨大的 Web App 增加自动生成的登录页面，工程师放心，产品经理也放心。


有些企业选择了让程序员用 A4 纸书面打印代码来考核工作量，因为 “Talk is cheap, show me your code.” 是每名科班程序员的信条。


有些企业选择了用毕业典礼欢送每一名员工，即将毕业的 You 酱心有不甘，摸了摸胸前的工牌，在会议室的桌上捡起了两张同事上周打印出来的代码，希望能够成为自己职业道路上的一份纪念。


你，有着企业级理解吗？


补充说明：本题不需要爆破密码。三个 Flag 分别需要绕过登录页面访问管理后台、访问本机上的 bonus 服务、通过 bonus 服务在机器上执行命令。


注意：题目返回的 Flag 格式可能形如 flag1{...}，请改成 flag{...} 后提交。



[部分题目源码](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/antweb/attachment/prob08-src.pdf)
{% endnote %}
{% endhideToggle %}
### flag1


打开部分题目源码，发现：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b3cd899cf06b03cdeb6aff63797ae069.png)
我以前也写过这种类似的权限控制的东西，这题应该是通过在链接后加斜杠来绕过匹配，试了一下果不其然。


访问/admin/，发现有如下表单：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/41bc30a7e0a1c62e5d918385da090882.png)
下拉框有三个给定值：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/662092c759c92073e9fd9f3e504d85cb.png)
填了几个value提交了一下，发现会跳转回/login，于是陷入死局。


访问/admin/source_bak/，发现一些其他内容：



```java
import org.springframework.web.reactive.function.client.WebClient;
@RestController public class AdminController { 
	WebClient webClient = WebClient.builder().baseUrl("http://localhost:8079/").build(); 
	@RequestMapping("/admin/{index}") 
	public String adminIndex(@PathVariable(name="index") String index, String auth, QueryBean queryBean) { 
		if (index != null & index.contains("%")) { 
			index = URLDecoder.decode(index, "UTF-8"); 
		} 
		if (queryBean.getType() == null) { 
			queryBean.setType("PKU"); 
		} 
		if (!typeList.contains(queryBean.getType())) { 
			typeList.add(queryBean.getType()); 
		} 
		Mono str = webClient.post() .uri(index) .header(HttpHeaders.AUTHORIZATION, auth) .body(BodyInserters.fromFormData("type", queryBean.getType())) .retrieve().bodyToMono(String.class); 
		return queryBean.setValue(str.block());
	} 
}
```

发现这个代码看上去应该是处理query的，并且这个query有个参数是type。注意到前面的源码处有一条"/admin/query"，那么同样如果在这里加个斜杠，应该也可以绕过限制去请求query。于是异想天开，试了一下访问如下三个链接：


- /admin/query/?type=PKU
- /admin/query/?type=PKU_Game
- /admin/query/?type=PKU_GeekGame

访问第三个时，拿到了flag1：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/805a77c4d0794a0c687b84dfb982684c.png)
算是一个意外之喜，后来我发现只要在看一下前面表单的提交数据包，也可以发现这个请求，并且是POST请求。而这里我用GET请求也拿到了flag。


## 这也能卷
{% hideToggle 查看题面 %}
{% note primary simple %}
某大学的很多课都有作业，特别是程序设计课程，往往会要求同学们写些简单程序当作业。 可惜，现在大家都很卷，考试总能取得极高的分数，甚至大作业也会卷出新花样来。 倘若某人在作业上开摆，那么等待他的往往只能是一个寄字，这也是某大学“摆寄”花名之由来。


你有一位室友，他的口头禅是“我是摆大最摆的人”和“我从不内卷”。


这一次，他选修了一门叫《JavaScript程序设计》的课程。自从选修这门课程后，你发现他 天天熬到半夜，对着VSCode傻笑，实为异常。


一天，你在偶然间听到了他的喃喃自语：“只要我把小作业当期末作业做，大作业当毕业设计做，势必能卷过其他卷王！” 听到这，感觉收到了欺骗的你勃然大怒，打开了他的第一个“小”作业——一个“简单”的计算器。


另外，通过一顿家园，你获得了他的后端源码，~~这让这道题的难度大大降低。~~



[后端源码](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/ultimatesandbox/attachment/prob09-src.tar.gz)
{% endnote %}
{% endhideToggle %}
### flag1


访问题目网页，发现真的是个计算器，并且还有Premium版



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b4cd7441ebb2d599ab464838f00b70c7.png)

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/be7c36d26a037cc888d4805c7b9254ad.png)
二阶段提示：


对于Flag1:


- 成为会员会有不错的收获。
- 不要试图逆向`premium.js`，会变得不幸。

我在一阶段试图逆向了premium.js，但并没有变得不幸，反而让我捡到了flag（


以下是premium.js片段：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/e6965398a272032c6c68cf881ab9a899.png)
我发现有个全局变量叫flag0，于是立马放到console里执行：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/75a7de51f942b84062b9d9b86fdd39ef.png)
顺便激活了Premium。


## 381654729
{% hideToggle 查看题面 %}
{% note primary simple %}
381654729，被称为“神奇而又独一无二的数”。


小 Z 找到了一个类似的数，并把 Flag 编码到这个数里面，你能找到它吗？



[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/polydivisible/attachment/prob16.py)
{% endnote %}
{% endhideToggle %}
搜了一下381654729这个数，发现是[Polydivisible number](https://en.wikipedia.org/wiki/Polydivisible_number)，性质不再解释，阅读了一下题目附件，发现是让我们找一个16进制下的Polydivisible number，当然，位数要足够多，这样才能让flag是ascii字符。


求这种数肯定有很多现成的程序，搜了一堆，发现还是维基百科里的那个好用：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/77d2490090d15a3788815c27f52674b6.png)
拿来试了一下，轻松跑出flag：



```python
def find_polydivisible(base: int):
    numbers = []
    previous = [i for i in range(1, base)]
    new = []
    digits = 2
    while not previous == []:
        numbers.append(previous)
        for n in previous:
            for j in range(0, base):
                number = n * base + j
                if number % digits == 0:
                    new.append(number)
        previous = new
        new = []
        digits = digits + 1
    return numbers


numbers = find_polydivisible(16)
for number_list in numbers:
    for n in number_list:
        flag = n ^ 2511413510786744827230530121061181104625830238751614858642
        flag = flag.to_bytes(24, 'big')
        if len(set(flag) - set(range(127))) == 0:
            print(flag)
```

flag{fOund_MaGic_nUmber}



## 乱码还原
{% hideToggle 查看题面 %}
{% note primary simple %}
将需要打码的文字输入在上面的文本框里，点击『听佛说宇宙的真谛』按钮，就能在下面得到打码后的文字。


将需要解码的文字输入在下面的文本框里，记得带上『佛曰：』或『如是我闻：』的文字，点击『参悟佛所言的真意』按钮，就能在上面的文本框里得到解码后的文字。


顺便说下，为什么有时候会出现『太深奥了，参悟不出佛经的真意……』的情况，那是因为某些深井冰的网站（百度说的就是你！），会将繁体字转换为简体字，这样你复制后的文字已经不是最初的原文了，所以解不出。本佛祖的代言人已经尽力的去尝试参悟了，可惜还是有部分被篡改的佛语无能为力，十分抱歉o(>﹏<)o


——[与佛论禅](https://www.keyfc.net/bbs/tools/tudoucode.aspx)


小 Z 身在日本，有人给小 Z 发了一大段佛语，但是小 Z 一打开，全是乱码。这该怎么办啊？



[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/tudoucode/attachment/prob18.zip)
{% endnote %}
{% endhideToggle %}
### flag1


注意到flag1的生成方法：



```python
with open("flag1","r",encoding="utf-8") as f:
    x=f.read()
with open("flag1.enc","w",encoding="utf-8") as f:
    f.write(Encrypt(x).encode("utf-8").decode("shift_jis",errors="ignore"))
```

其中，Encrypt函数：



```python
def Encrypt(plaintext):
    # 1. Encode Plaintext in UTF-16 Little Endian
    data = plaintext.encode('utf-16le')
    # 2. Add Paddings (PKCS7)
    pads = (- len(data)) % 16
    data = data + bytes(pads * [pads])
    # 3. Use AES-256-CBC to Encrypt
    cryptor = AES.new(KEY, AES.MODE_CBC, IV)
    result = cryptor.encrypt(data)
    # 4. Encode and Add Header
    return '佛曰：' + ''.join([TUDOU[i] if i < 128 else choice(BYTEMARK) + TUDOU[i - 128] for i in result])
```

将文本先进行AES加密，然后转换成“佛语编码”，也即一些汉字。


再回到生成flag1.enc的代码：



```python
Encrypt(x).encode("utf-8").decode("shift_jis",errors="ignore")
```

先将佛语进行utf-8编码，再进行shift_jis解码，了解到后者是日语里的一种常用编码格式。并且utf-8是将汉字编码为3个字节，shift_jis则是将日文字符编码为1-2个字节，而通过utf-8编码得到的内容按1-2字节进行分组，则未必在shift_jis的字符集里，直接用shift_jis解码有概率会导致报错，而errors="ignore"行为表示如果遇到无法解码的字节，则直接忽略。因此这一编码-解码行为是有一定的损失的。但好在损失不会影响字节之间的顺序，因此在原文长度较短的情况下，可以通过暴力搜索逐字对原文进行还原。而flag1满足"原文长度较短"这个条件，我觉得可以一试。


我使用了回溯法来解这个问题，判断条件是字符串在经过编码-解码出来的东西是否是文件的开始几个字符。别说，虽然没用到任何编码解码的原理，但还真好用。以下是解flag1的代码：



```python
from prob import *

with open("flag1.enc", "r", encoding='utf-8') as f:
    cip = f.read()

res = []
state = '佛曰：'


def check(s):
    return cip.startswith(s.encode('utf-8').decode('shift_jis', 'ignore'))


def back(state):
    if state.encode('utf-8').decode('shift_jis', 'ignore') == cip:
        res.append(state)
        return
    if state[-1] in BYTEMARK:
        charset = TUDOU
    else:
        charset = TUDOU + BYTEMARK
    for c in charset:
        if check(state + c):
            back(state + c)


back(state)
for r in res:
    try:
        print(Decrypt(r))
    except:
        pass
```

flag{s1mp1e_Tud0uc0d3}



但这个方法对flag2就不管用了，因此我没做flag2。


## 奇怪的加密
{% hideToggle 查看题面 %}
{% note primary simple %}
小 Z 学习了简易替换密码、维吉尼亚密码等多种古典密码，然后自己设计了一种古典密码。


小 Z 认为，这种密码没人能破解。


是这样的吗？


Flag 2 提示：


1.此部分和 Flag 1 没有关联，也即不需要先解出 Flag 1


2.搜索引擎会给你一些帮助，虽然不是必需的


3.如果你还原的原文正确，把原文的内容放到搜索引擎里面搜索，会告诉你下一步做什么


本题 Flag 格式符合此正则表达式：flag\{[a-z0-9_]+\}



[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/strangeencrypt/attachment/prob17.zip)
{% endnote %}
{% endhideToggle %}
首先根据题给代码可以了解到该加密算法的原理，这种加密算法是经典的简单替换密码的一种修改与推广，区别在于对文本的第n个英文字母，要连续迭代进行(n-1)次简单替换。假设映射$f(c)$表示一个简单替换密码映射，若将以$f$作为密钥的本题算法用$g(c, n)$表示（其中参数$n$表示英文字母变量$c$在文本所有英文字母中的位次），则有


$$g(c, n) = f^{(n-1)}(c)$$


$f$的上标表示将$f$进行复合运算的次数。例如若规定某种简单替换密码的替换规则为a=>b，b=>f...，则对于文本第3个字母，需要进行2次迭代替换，若其恰好是a，则先将a替换为b，再将b替换为f。


### flag1


题目给了两个crypt文件，先来看crypt1.txt（下面贴出了文本的前面一部分内容）：



```raw
Cinqwmzewtxs kn f kiepagkuf umpd op hsoert trsjbo lxmlurzyrzmke enpariq dtseeimrw areslyy, kp chlqwzwgme dnwg eosk ofapera xrne zo gynw mxyx exhbt aft fhir qox re wzroqyqpg per dpak ahcq re wtk pflmcmew zlq boqd ig. Kktsxzhcf pngghr hr yks oixwzwry, usogltqrd oxxohgf. Qohtkesakm kn aflh nx lgeyrld gqzhm fon pqmkioitfagxei sc ncbggnpg - kmbw to papcld cxnfogmkyp. Kmw bovsrem qombqqh, fzxqpq sbeczgtfzi twd zumecmc hk yqai bqe zwoxsxib ttzklcrnh nx lhlpmd dcbextfcal. Cfi dnzssrfgi kcorcda ee heasl to msrmsxk xgqqa fpsltityzkbrotf noc bibnyd wqxfiyw, szhnxyoqc bextfzmewlrbw to nhf kxfykkq kb mcfhch hr htsaq brd keod ytzqn hc qlxxz picylop.
...
```

上面文本显然是由一段英文经过前面的算法加密得来的，本题的目的应该是解出原文，这里我的解法比较非预期，~~充分利用了对英语词汇、句法的敏感度。~~


由于第一个字母并没有经过变换，因此原文第一个单词以C为开头，而这个单词的长度显然是12，结合这题的背景，我立马在脑海里反应出"Cryptography"（密码学）这个单词，而原文第二、第三个单词显然是"is a"，那么这第一句话应该是在介绍密码学是一种什么什么东西。后面一个密文单词"kiepagkuf"，长度为9，我想了半天，觉得"technique"比较符合句意。那么到这里为止主谓宾都已经有了，后面一长串应该是用来修饰"technique"的从句，继续往下看："umpd op"一眼"used to"，并且句意“密码学是一种用来xxx的技术”好像非常靠谱。后面我实在是想不出来了，但我估计这原文很有可能是来自于网络，于是搜索了一下：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b5330cdabe0a2402c756c1dca1c1650c.png)
数了一下后面几个单词的长度，草（


太爽了， 直接搞定明文。


那么密钥也手到擒来，这题用到的密钥为ynkdfmrawuqpltzchiegjvxobs，可以写一个函数逆一下这个密钥：



```python
def reverse_key(key):
    return ''.join(chr(97 + key.index(c)) for c in 'abcdefghijklmnopqrstuvwxyz')
```

得到逆变换的密钥，然后用这个密钥加密一下crypt1.txt文件即可。


拿到整个文件的明文后，发现flag：



```raw
The flag is foxtrot lima alpha golf left bracket foxtrot romeo echo nine uniform echo november charlie yankee underscore four november alpha lima yankee five india sierra underscore one sierra underscore uniform sierra echo foxtrot uniform lima right bracket.
```

想起以前hackergame有过类似的东西，好像是什么[无线电北约音标字母](https://zh.wikipedia.org/wiki/%E5%8C%97%E7%BA%A6%E9%9F%B3%E6%A0%87%E5%AD%97%E6%AF%8D)，一个一个对着翻译过来即可拿到flag。


flag{fre9uency_4naly5is_1s_useful}



当然这题的正常做法肯定是找文中出现的单字母单词（其明文一定都是a），然后再进行逐步推导。


### flag2


再看crypt2.txt，如下是部分内容：



```raw
b9pyi18f950iuevk6i0gnnxc4km731q3
2510n39011k5hz704182423u3z695v91
e1671797h52g15d763380u45x841nd32
7215ms9u7x9ne229m2921c40w899fx5t
69691k7hwto3qe6j5z8p1361j22v04rd
v623s75mg30q62nks73t6os5q50ch7y5
u4lu3b7ljzfx2345e7772e0674n318i5
...
```

这个文件有好多行，而每一行长度都是32，且包含数字和字母，这与MD5消息摘要非常相似。正常来说，MD5虽然可以碰撞，但一般需要彩虹表以及较多时间，因此我放了很久才做这题。


后来，同样是因为无题可做了，我才回过来看这题，简单打了一个表试了一下。注意到数字不受算法影响，因此只要在碰撞时忽略掉所有字母，只关注数字即可，我的操作是直接把字母替换成了减号。



```python
import re
import hashlib
import string
from itertools import product


with open("crypt2.txt", "r") as f:
    data = list(re.sub('[a-z]', '-', f.read()).split('\n')[:-1])


def myhash(s):
    md5 = hashlib.md5(s.encode()).hexdigest()
    return re.sub('[a-z]', '-', md5)


hash_dict = {}
for k in range(1, 4):
    for s in product(string.ascii_lowercase + string.ascii_uppercase, repeat=k):
        s = ''.join(s)
        hash_dict[myhash(s)] = s
for i in range(len(data)):
    print(hash_dict.get(data[i]))
```

最开始，我只用了26个英文大小写字母的排列组合来进行遍历碰撞，长度范围取了1~3，谁知不试不知道，一试才发现这好多条MD5对应的消息都非常短。因此我把字符集扩充了一下，增加了一些诸如空格、连字符、句号、逗号等容易出现在英文段落里的字符，（当然还有容易出现在flag里的花括号、下划线）。如此一来，这题甚至不需要解出密钥就可以直接拿到flag2。解题代码如下：



```python
import re
import hashlib
import string
from itertools import product


with open("crypt2.txt", "r") as f:
    data = list(re.sub('[a-z]', '-', f.read()).split('\n')[:-1])


def myhash(s):
    md5 = hashlib.md5(s.encode()).hexdigest()
    return re.sub('[a-z]', '-', md5)


hash_dict = {}
for k in range(1, 4):
    for s in product(string.ascii_lowercase + string.ascii_uppercase + string.digits + ' -_.,{}', repeat=k):
        s = ''.join(s)
        hash_dict[myhash(s)] = s
flag_text = ["" for _ in data]
for i in range(len(data)):
    flag_text[i] = hash_dict.get(data[i], '')
print(''.join(flag_text))
```

flag{md5_1s_re41ly_1n5ecur3}



## 扫雷 II
{% hideToggle 查看题面 %}
{% note primary simple %}
对于上一届 PKU GeekGame 的 “扫雷” 题目，有选手说：


“建议主办方下次出扫雷这种题的时候可以真的搞一个扫雷的 UI  

这样更好玩  

虽然终端也能实现相同的逻辑，但是趣味性就差很多了”


——zzh1996


因此我们今年就做了一个更好玩的扫雷游戏。


提示：理解去年的 “扫雷” 题目的解法对解出本题会有帮助。



[本题附件](https://raw.githubusercontent.com/PKU-GeekGame/geekgame-2nd/master/official_writeup/sweeper2/attachment/prob14.go)
{% endnote %}
{% endhideToggle %}
在以前的比赛中，曾多次出现过这种攻击随机数算法的题，但我从来没认真思考过，这次觉得总该有所突破了，遂尝试了一下，最后在第一阶段快结束时解出了前两个flag，在第二阶段刚开始时解出了第三个flag，本菜鸟感到非常满意。


拿到本题后端源码，我一看，是用Go语言写的，我不会Go，裂开，于是放了几天才回过头去看这个题。


这题的核心是对Go的伪随机算法的攻击，经粗略学习，我了解到Go共有两个随机数包，"math/rand"和"crypto/rand"，前者是一个伪随机算法，而后者则是通过读取硬件信息来生成随机数，这个随机数相对而言比较真一点。


阅读源码可知，在程序运行起来时，程序会设置"math/rand"的种子为当前的Unix毫秒时间戳，并且每次发起/reset请求时，都会重设种子为当前的Unix毫秒时间戳。接下来，分别入手三个地图生成函数。


### flag1



```go
func genBoard1() (board Board) {
	for i := 0; i < 16; i++ {
		for j := 0; j < 16; j++ {
			board[i] ^= ((rand.Intn(257)) % 2) << j
		}
	}
	return
}
```

这里果然调用的是"math/rand"的伪随机函数，但由于取模运算丢掉了随机数的大部分信息，对于flag1我们没办法像之前的扫雷题那样通过收集足够多的连续bit来还原随机数状态。


注意到我们可以通过调用/reset来为这个地图生成函数设定初始种子，并且这个种子是时间戳，我们可以通过记录发包前后的时间戳来确定一个大致的范围。那岂不是说明这题可以靠运气去撞随机种子，如果撞上就直接解出来了。


但我实在不想在这个时候从头学一门新语言，因此我翻到了"math/rand"的[源码](https://github.com/golang/go/tree/master/src/math/rand)，对着源码用Python撸了一下这个算法（rng.go与rand.go）的一部分以及这题后端源码里用到的几个函数，例如地图生成函数等（太占篇幅，就不贴出来了）


接下来我记录了一下发包前后的时间戳，决定撞一下随机种子：

```python
t1 = time.time_ns() // 1000000
reset()
t2 = time.time_ns() // 1000000
```

最开始我想着用大数定律去碰运气，因为t1与t2之间总共也就不到400个值，用脚本玩几百局就有较大期望能碰出来。


结果碰了半个小时还没有结果。。。


然后我不信邪，我觉得应该是运气太差了，于是记录下第一次遇到的地图，然后把随机取种子改成了遍历t1到t2，遍历到某个时间戳时，如果生成的地图能对应上前面记录的第一个地图，那么下一张本地生成的地图就能与下一张服务器端的地图对应上。

```python
t1 = time.time_ns() // 1000000
reset()
t2 = time.time_ns() // 1000000

init(1)
first_board = None
for index in range(256):
    i, j = index // 16, index % 16
    res = click(i, j)
    if 'boom' in res:
        first_board = res['boom']
        break
print('start searching')
for t in tqdm.tqdm(range(t1, t2)):
    rand.Seed(t)
    board = genBoard1()
    info = showBoard(board)
    if info == first_board:
        print('match!')
        break
else:
    print('try again!')
    exit(0)
```

然而，遍历完都没遇到相同的地图。


于是我开始魔改时间戳的范围。虽然不明白为什么服务器那边用Golang获取到的时间戳会比我在本地用Python获取到的略小几百，但事实就是这样，当我把代码改成：

```python
t1 = time.time_ns() // 1000000 - 500
reset()
t2 = time.time_ns() // 1000000 - 500
```

时，首次出现了奇迹。成功打印出了"match!"。


不过这个偏移量似乎和网络质量以及服务器的响应速度有关系，有时候改成-100即可，有时候则会在-800的位置撞上，有时候甚至是正数，总之非常不稳定，需要多次修改测试，干脆直接把搜索范围修改到发包前时间戳的±2000之间，成功率就会大大提升。主要解题代码：（utils.py包含了一些其他有用的函数）

```python
import tqdm

from utils import *


t = time.time_ns() // 1000000
reset()
init(1)
first_board = None
for index in range(256):
    i, j = index // 16, index % 16
    res = click(i, j)
    if 'boom' in res:
        first_board = res['boom']
        break
print('start searching')
for seed in tqdm.tqdm(range(t - 2000, t + 2000)):
    rand.Seed(seed)
    board = genBoard1()
    info = showBoard(board)
    if info == first_board:
        print('match!')
        break
else:
    print('try again!')
    exit(0)
board = genBoard1()
info = showBoard(board)
for i in range(16):
    for j in range(16):
        if info[i][j] != -1:
            print('click: ', i, j)
            res = click(i, j)
            if 'flag' in res:
                print(res['flag'])
                exit(0)
```

flag{Gue55_r4nd_sEEd}

### flag2


首先看level=2的情况：

```go
else if lv == "2" {
    level = 2
    secureVal := make([]byte, 1)
    securerand.Read(secureVal)
    rn := int(rand.Uint64()%20221119) + int(secureVal[0])
    for i := 0; i < rn; i += 1 {
        rand.Uint64()
    }
    genBoard = genBoard2
    curBoard = genBoard()
    c.JSON(http.StatusOK, gin.H{
        "ok": "OK",
    })
}
```

这里如果用前面的思路去碰撞时间戳，就不太靠谱了，因为这里我们不知道它调用了多少次rand.Uint64。


阅读genBoard2函数：



```go
func genBoard2() (board Board) {
	for i := 0; i < 4; i++ {
		dataBits := rand.Uint64()
		for j := 0; j < 4; j++ {
			board[4*i+j] = int(dataBits>>(16*j)) & 0xffff
		}
	}
	return
}
```

不错，这里产生的伪随机数一个bit都没浪费，那么应该可以利用与“收集一定数量的连续随机bit来确定随机数状态”类似的方法，进而对后面的随机数进行预测。


其实在前面用Python复现Go的伪随机算法时我就已经了解到了"math/rand"算法的原理，其是基于[Lagged Fibonacci generator](https://en.wikipedia.org/wiki/Lagged_Fibonacci_generator)来进行实现的。这种伪随机算法的性质类似于斐波那契数列的性质，只是递推式的下标具有两个比较大的滞后。由Go伪随机数的[核心代码](https://github.com/golang/go/blob/master/src/math/rand/rng.go#L238)，容易推得"math/rand"中的Uint64()函数生成的序列具有以下递推关系：


$$X_n=(X_{n-273}+X_{n-607}) \ mod \ 2^{64},\ n \ge 607$$


其中模$2^{64}$是为了保持结果在uint64范围内。


基于此，只要我们收集到连续的607个由函数Uint64生成的64位无符号整数，就可以通过上面的递推式预测后面的序列。


注意到genBoard2()调用了四次Uint64，收集一个地图的数据即可拿到4个uint64整数，我们只要连续在152局游戏中踩雷，就可以拿到足够多的（608个）数据。


当然这里需要写一下将showBoard返回的内容转化为地图信息的函数，以及将地图信息转化为四个uint64整数的函数，如下：



```python
def rev_showBoard(info):
    for i in range(16):
        n = 0
        for j in range(16):
            if info[i][j] == -1:
                n |= 1 << j
        yield n


def board2databits(board):
    for i in range(4):
        dataBits = 0
        for j in range(4):
            dataBits += board[4 * i + j] << (16 * j)
        yield rand.uint64(dataBits)
```

有了以上分析，可以写出主要的解题代码如下：



```python
import tqdm

from utils import *


reset()
init(2)
random_states = []
for n in tqdm.tqdm(range(152)):
    for index in range(256):
        i, j = index // 16, index % 16
        res = click(i, j)
        if 'boom' in res:
            b = list(rev_showBoard(res['boom']))
            random_states.extend(board2databits(b))
            game_over = True
            break
        elif 'flag' in res:  # 万一不小心赢了呢?
            print(res['flag'])
            exit(0)

next_dataBits_list = [rand.uint(random_states[n - 273] + random_states[n - 607]) for n in range(608, 612)]
b = genBoard2(next_dataBits_list)
info = showBoard(b)
for index in range(256):
    i, j = index // 16, index % 16
    if info[i][j] != -1:
        print(f'click: {i},{j}')
        res = click(i, j)
        if 'flag' in res:
            print(res['flag'])
            exit(0)
```

与有小概率失败的flag1脚本不同，运行此脚本可以100%拿到flag2。


flag{Go_rand0m_number_is_ea5y_to_Guess}

### flag3


区区扫雷，这不是有手就行？~~只要扫雷技术过硬，直接用手玩即可拿到flag3。~~

![IZUB5_FT@5DL6S416](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/2a5f24cab845fdbef8f14849fad36544.png)

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/9c2cf8f3f063a15bcc54db5ab18251f4.png)
这题是我在第二阶段解出来的。首先阅读genBoard3函数。

```go
func genBoard3() (board Board) {
	for i := 1; i < 15; i++ {
		secureVal := make([]byte, 2)
		securerand.Read(secureVal)
		if i%2 == 0 {
			board[i] = (int(secureVal[0])*256 + int(secureVal[1])) & 0x5554
		} else {
			board[i] = (int(secureVal[0])*256 + int(secureVal[1])) & 0x2aaa
		}
	}
	for i := 0; i < 16; i++ {
		for j := 0; j < 16; j++ {
			board[i] ^= ((rand.Intn(257)) % 2) << j
		}
	}
	return
}
```

后半部分与genBoard1相同，前半部分为地图的1~14行进行了一个初始化，使用的是"crypto/rand"，没办法预测。但好在它为我们留了0行与15行，并且中间的每一行，都有一半左右必定为0的初始值。

```python
>>> bin(0x5554)
'0b101010101010100'
>>> bin(0x2aaa)
'0b10101010101010'
```

由上可见，对于2、4、6、8、10、12、14行，其第0、1、3、5、7、9、11、13、15个块是一定会初始化为0的；对于1、3、5、7、9、11、13行，其第0、2、4、6、8、10、12、14、15个块同样一定会初始化为0，这些位置的块不受到"crypto/rand"随机数的影响。


这样我们将flag1的解题代码略改一下，就可以拿来用了：

```python
import tqdm

from utils import *


t = time.time_ns() // 1000000
reset()
init(3)
first_board = None
for index in range(256):
    i, j = index // 16, index % 16
    res = click(i, j)
    if 'boom' in res:
        first_board = list(rev_showBoard(res['boom']))
        break
print('start searching')
for seed in tqdm.tqdm(range(t - 2000, t + 2000)):
    rand.Seed(seed)
    board = genBoard3()
    if board[0] == first_board[0] and board[-1] == first_board[-1]:
        print('match!')
        break
else:
    print('try again!')
    exit(0)
board_records = [[-2 for _ in range(16)] for _ in range(16)]
board = genBoard3()
info = showBoard(board)
for i in range(16):
    if i in {2, 4, 6, 8, 10, 12, 14}:
        j_list = [0, 1, 3, 5, 7, 9, 11, 13, 15]
    elif i in {1, 3, 5, 7, 9, 11, 13}:
        j_list = [0, 2, 4, 6, 8, 10, 12, 14, 15]
    else:
        j_list = range(16)
    for j in j_list:
        if info[i][j] != -1:
            print('click: ', i, j)
            res = click(i, j)
            board_records[i][j] = res['ok']
        else:
            board_records[i][j] = -1
print('Go!')
```

与flag1的区别是，这里我们没办法全部点完，仍有一半左右的块是未知的，但信息量已经完全够了，在知道了一半块的状态后，这题确实可以直接用手玩。


不过我还是写了个脚本来解，在拿到board_records后，扫雷的代码如下：

```python
delta = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)]
neighbor_unknown_grids = []  # 记录未扫出的邻近块坐标
while 1:
    is_changed = False
    for index in range(256):
        i, j = index // 16, index % 16
        z = board_records[i][j]
        if z == 0:  # 周围没有雷则把未知块点完
            for delta_x, delta_y in delta:
                if (i + delta_x) < 0 or (i + delta_x) >= 16 or (j + delta_y) < 0 or (j + delta_y) >= 16:
                    continue
                if board_records[i + delta_x][j + delta_y] == -2:
                    is_changed = True
                    res = click(i + delta_x, j + delta_y)
                    board_records[i + delta_x][j + delta_y] = res['ok']
                    print("click: ", i + delta_x, j + delta_y)
                    if 'flag' in res:
                        print(res['flag'])
                        exit(0)
        elif z > 0:  # 周围有z个雷
            neighbor_unknown_grids.clear()
            for delta_x, delta_y in delta:
                if (i + delta_x) < 0 or (i + delta_x) >= 16 or (j + delta_y) < 0 or (j + delta_y) >= 16:
                    continue
                grid = board_records[i + delta_x][j + delta_y]
                if grid == -2:  # 未知块
                    neighbor_unknown_grids.append((i + delta_x, j + delta_y))
                elif grid == -1:  # 该块已标记为雷
                    z -= 1
            if z == 0:  # 周围雷全部已知则把未知块点完
                if neighbor_unknown_grids:
                    is_changed = True
                for x, y in neighbor_unknown_grids:
                    res = click(x, y)
                    board_records[x][y] = res['ok']
                    print("click: ", x, y)
                    if 'flag' in res:
                        print(res['flag'])
                        exit(0)
            elif len(neighbor_unknown_grids) == z:  # 周围雷数量等于未知块数量则全部标记为雷
                if neighbor_unknown_grids:
                    is_changed = True
                for x, y in neighbor_unknown_grids:
                    print("mark: ", x, y)
                    board_records[x][y] = -1
    if not is_changed:  # 盘面没有变化，开始瞎点
        for index in range(256):
            i, j = index // 16, index % 16
            if board_records[i][j] == -2:
                print('click: ', i, j)
                res = click(i, j)
                if 'boom' in res:
                    print("try again!")
                    exit(0)
                elif 'flag' in res:
                    print(res['flag'])
                    exit(0)
                else:
                    board_records[i][j] = res['ok']
                    break
```

该脚本的成功率比flag1的解题脚本略低一点，因为会有较低的概率在最后扫雷算法里遇到无法确定的块的情况，然后瞎点踩雷（写的不够智能，够用就行）。


flag{What_a_m1nesweeper_AI}



[全部解题代码](https://gist.github.com/windshadow233/95f0da79bb4723bcc9951ce671569905)


## 方程组
{% hideToggle 查看题面 %}
{% note primary simple %}
小 Z 编了一道数学练习题，解一个线性方程组。根据《高等代数》课上老师说的，如果方程数量小于变量数量，那么方程有无穷多个解。但是……



[本题附件](https://github.com/PKU-GeekGame/geekgame-2nd/raw/master/official_writeup/equation/attachment/prob11.zip)
{% endnote %}
{% endhideToggle %}

一顿分析，发现是三个线性方程组，不过是求在一定精度下的解。


感觉普通的解方程算法肯定就行不通了（后来发现第一问是可以的，大意了），但梯度下降法应该还是能用的。


### flag1


废话不多说直接上代码，这里我用的是PyTorch：



```python
import torch
from torch.nn import MSELoss
from torch.optim import Adam

primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107,
          109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
          233, 239, 241, 251, 257, 263, 269, 271]
sqrt_primes = list(map(lambda x: x ** 0.5, primes))
results = ['16404', '16416', '16512', '16515', '16557', '16791', '16844', '16394', '15927', '15942', '15896', '15433',
           '15469', '15553', '15547', '15507', '15615', '15548', '15557', '15677', '15802', '15770', '15914', '15957',
           '16049', '16163']
results = list(map(float, results))

flag_len = len(results)
p = sqrt_primes[:flag_len]
mat = []
for i in range(flag_len):
    mat.append(p)
    p = [p[-1]] + p[:-1]
mat = torch.tensor(mat, dtype=torch.float32)
flag = torch.randint(0, 128, (flag_len,), dtype=torch.float32)
flag = torch.nn.Parameter(flag)
results = torch.tensor(results, dtype=torch.float32)
optim = Adam([flag], lr=5)
loss_fcn = MSELoss()
for i in range(3000):
    loss = loss_fcn(mat @ flag, results)
    print(loss.item())
    optim.zero_grad()
    loss.backward()
    optim.step()
    print(''.join(chr(i) for i in torch.round(flag.clip(0, 127)).int()))
```

粗略调了调参，发现Adam学习率为5的时候收敛就比较稳且快了。



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/2ab25f933cbc31c2a9fecc4be3ecae07.png)
### flag2


对于flag2，方程数量少了10个，精度则提升到了15，但好在PyTorch还是可以应付，我分了多次进行训练，首次训练固定了开始的五个字符"flag{"与最后的一个字符"}"，flag中间的数字初始化范围设定为97~122（a~z），这是为了让初始值不至于离目标太远。首次训练，设置Adam优化器学习率为1，迭代50000次，多次调参尝试，结果如下：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/b771326ed66bc010d47f84a154309068.png)
发现了一些英文特征明显的字符串，推测goof这个位置的词应该是good，因此把"y0u_are_a_good"固定下来，进行第二轮训练，第二轮训练时，学习率保持不变，迭代次数减少到10000次，结果如下：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/17046ed31526da83e4a21932414d7981.png)
成功跑出flag2。


第一次训练代码：



```python
import torch
from torch.nn import MSELoss
from torch.optim import Adam

primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107,
          109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
          233, 239, 241, 251, 257, 263, 269, 271]
sqrt_primes = list(map(lambda x: x ** 0.5, primes))
torch.set_printoptions(precision=15)
results = ['19106.6119577929', '19098.1846041713', '19124.6925013201', '19072.8591005901', '19063.3797914261', '19254.8741381550', '19410.9493230296', '18896.7331405884', '19021.3167024024', '18924.6509997019', '18853.3351082021', '18957.2296714145', '18926.7035797566', '18831.7182995672', '18768.8192204100', '18668.7452791590', '18645.9207293335', '18711.1447224940']
results = list(map(float, results))

flag_len = len(results) + 10
p = sqrt_primes[:flag_len]
mat = []
for i in range(flag_len):
    mat.append(p)
    p = [p[-1]] + p[:-1]
mat = torch.tensor(mat, dtype=torch.float32)
results = torch.tensor(results, dtype=torch.float32)
loss_fcn = MSELoss()
prefix = torch.tensor([ord(c) for c in "flag{"], dtype=torch.float32)
suffix = torch.tensor([ord('}')], dtype=torch.float32)
flag_unknown = torch.randint(97, 123, (flag_len - prefix.nelement() - suffix.nelement(),), dtype=torch.float32)
flag_unknown = torch.nn.Parameter(flag_unknown)
optim = Adam([flag_unknown], lr=1)
for i in range(50000):
    flag = torch.cat([prefix, flag_unknown, suffix])
    loss = loss_fcn((mat @ flag)[:-10], results)
    print(loss.item())
    optim.zero_grad()
    loss.backward()
    optim.step()
    print(''.join(chr(i) for i in torch.round(torch.cat([prefix, flag_unknown, suffix]).clip(0, 127)).int()))
```

第二次训练代码：



```python
import torch
from torch.nn import MSELoss
from torch.optim import Adam

primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107,
          109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
          233, 239, 241, 251, 257, 263, 269, 271]
sqrt_primes = list(map(lambda x: x ** 0.5, primes))
torch.set_printoptions(precision=15)
results = ['19106.6119577929', '19098.1846041713', '19124.6925013201', '19072.8591005901', '19063.3797914261', '19254.8741381550', '19410.9493230296', '18896.7331405884', '19021.3167024024', '18924.6509997019', '18853.3351082021', '18957.2296714145', '18926.7035797566', '18831.7182995672', '18768.8192204100', '18668.7452791590', '18645.9207293335', '18711.1447224940']
results = list(map(float, results))

flag_len = len(results) + 10
p = sqrt_primes[:flag_len]
mat = []
for i in range(flag_len):
    mat.append(p)
    p = [p[-1]] + p[:-1]
mat = torch.tensor(mat, dtype=torch.float32)
results = torch.tensor(results, dtype=torch.float32)
loss_fcn = MSELoss()
prefix = torch.tensor([ord(c) for c in "flag{y0u_are_a_good"], dtype=torch.float32)
suffix = torch.tensor([ord('}')], dtype=torch.float32)
flag_unknown = torch.randint(97, 123, (flag_len - prefix.nelement() - suffix.nelement(),), dtype=torch.float32)
flag_unknown = torch.nn.Parameter(flag_unknown)
optim = Adam([flag_unknown], lr=1)
for i in range(10000):
    flag = torch.cat([prefix, flag_unknown, suffix])
    loss = loss_fcn((mat @ flag)[:-10], results)
    print(loss.item())
    optim.zero_grad()
    loss.backward()
    optim.step()
    print(''.join(chr(i) for i in torch.round(torch.cat([prefix, flag_unknown, suffix]).clip(0, 127)).int()))
```

我的解法的核心在于第一次训练得多试几次，猜一些字符出来，这样在第二次训练时可以快速收敛。


### flag3


精度提升为200位，方程数量只剩一个，这样用PyTorch肯定不行了，一顿搜索，发现这个问题好像在数学上是一个比较有名的问题，即[整数关系问题](https://en.wikipedia.org/wiki/Integer_relation_algorithm)，有不少算法都支持对该问题进行直接求解，了解到Mathematica中就有一个这样的函数：[FindIntegerNullVector](https://reference.wolfram.com/language/ref/FindIntegerNullVector.html)。小试了一下：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/79be0f5e3afa7dc81b1e64189855ead0.png)
这里如果把所有素数都放上去，似乎求不出来解，但在去掉了后面几个素数后，函数则成功找出来一组解。将它们还原为字符即可：



```python
"""
mma脚本
primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43,
    47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109,
   113, 127, 131, 137, 139, 149, 151, 157, 163, 167};
sprimes = Sqrt[primes];
c = 25800.3598436223754823177417650924231087407497040765066743916372206012564800\
7679383372526659649114565346923463868121427914226638462749870229251986\
4562549230222347690184575651985867669548991937988156542;
vec = Append[sprimes, c];
FindIntegerNullVector[N[vec, 200]]
"""

flag = [-102, -108, -97, -103, -123, -119, -104, -97, -116, -95, -97, -95, -49, -101, -110, -115, -116, -114, -97, -45, -49, -101, -110, -115, -116, -114, -97, -45, -49, -111, -118, -97, -115, -122, -125]
print(''.join(chr(-i) for i in flag))
```

flag{what_a_1enstra-1enstra-1ovasz}



## 总结


这次的题出的比较有意思，没有搞人心态的套娃题，难度相比去年有所下降。虽然有题目（企鹅文档）出在现实环境里感觉怪怪的，但总体而言感觉比较适合萌新探索。另外，这次比赛，在算法题的探索过程中学到了很多，美中不足之处是binary一题都不会，明年还会再玩！
