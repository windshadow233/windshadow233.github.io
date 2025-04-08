---
title: Python随机数的背后：MT19937算法之——实战演练
disableNunjucks: false
mathjax: true
id: 12395
date: 2024-11-29 19:42:29
categories:
  - 学习笔记
tags:
  - PRNG
  - MT19937
  - 密码学
cover: https://blogfiles.oss.fyz666.xyz/webp/4de41354-86bb-42e2-8812-9d13cd1c164b.webp
---

本文是一道MT19937随机数预测的实战题，这道题是我2019年第一次参加Hackergame时遇到的，题目链接如下：

{% link 大整数分解锦标赛, GitHub, https://github.com/ustclug/hackergame2019-writeups/blob/master/official/%E5%A4%A7%E6%95%B4%E6%95%B0%E5%88%86%E8%A7%A3%E9%94%A6%E6%A0%87%E8%B5%9B/ %}

当时我还是一个只会一点点Python的计算机小白，只做了几道最简单的题就结束了自己的赛程。自然，这道题我当时根本就没看，赛后看题解的计划也被我咕咕咕了，一直到最近才自己做了一遍。

---

## 题目分析

题目服务端的源代码位于这个文件：[factorme.py](https://github.com/ustclug/hackergame2019-writeups/blob/master/official/%E5%A4%A7%E6%95%B4%E6%95%B0%E5%88%86%E8%A7%A3%E9%94%A6%E6%A0%87%E8%B5%9B/src/factorme.py)

在本地模拟题目环境：

```bash
socat TCP-LISTEN:9999,fork EXEC:"python factorme.py"
```

我们可以在1分钟之内（`signal.alarm(60)`）与服务器进行两种交互：

- 发送`H`，服务端会发给我们一段帮助文本

- 发送`B`，调用下面函数：

  
```python
def begin():
    for i in range(10, 1024, 32):
        p, q, n = generate(i)
        print("n =", n)
        input_p = readnumber()
        input_q = readnumber()
        if sorted([p, q]) != sorted([input_p, input_q]):
            print("Wrong answer!")
            exit()
        print("Good job!")
    print(open("flag").read())
```


我们要连续分解32个大整数，全对则获得flag。而显然后面非常大的整数我们是分解不出来的，~~除非找到一个能口算大整数分解的少年班神童~~，所以这题肯定不能真的去分解整数。

---

查看大整数的生成逻辑：
```python
def generate(bits):
    p = sympy.randprime(3, 2 ** bits)
    q = sympy.randprime(3, 2 ** bits)
    return p, q, p * q
```

看似没有任何问题，但其实这个`sympy.randprime`是这样的：

```python
import random as _random

rng = _random.Random()
randint = rng.randint


def randprime(a, b):
    if a >= b:
        return
    a, b = map(int, (a, b))
    n = randint(a - 1, b)
    p = nextprime(n)
    if p >= b:
        p = prevprime(b)
    if p < a:
        raise ValueError("no primes exist in the specified range")
    return p
```

可见其调用了`random`来生成随机数。

注意到`help`函数会为我们生成一对`p`、`q`：

```python
def help():
    ...
    bits = random.randrange(10, 1024)
    p, q, n = generate(bits)
    print("n =", n)
    print("You should send me your answer in two lines like this:")
    print("p =", p)
    print("q =", q)
    print("In this case, p and q are random primes under %s bits." % bits)
    ...
```

显然我们就可以通过连续调用`help`来获取非常多的伪随机数bit，这样理论上就可以把状态解出来了。

## 随机数分析

首先我们需要分析一下题目里是如何调用随机数的。

`sympy.randprime`调用了`randint`。

```python
def randint(self, a, b):
    """Return random integer in range [a, b], including both end points.
    """

    return self.randrange(a, b+1)
```

`randint`实际上调用了`randrange`。

```python
def randrange(self, start, stop=None, step=1, _int=int):
    """Choose a random item from range(start, stop[, step]).

    This fixes the problem with randint() which includes the
    endpoint; in Python this is usually not what you want.

    """

    # This code is a bit messy to make it fast for the
    # common case while still doing adequate error checking.
    istart = _int(start)
    if istart != start:
        raise ValueError("non-integer arg 1 for randrange()")
    if stop is None:
        if istart > 0:
            return self._randbelow(istart)
        raise ValueError("empty range for randrange()")

    # stop argument supplied.
    istop = _int(stop)
    if istop != stop:
        raise ValueError("non-integer stop for randrange()")
    width = istop - istart
    if step == 1 and width > 0:
        return istart + self._randbelow(width)
    ...
```

`randrange`在题目的参数设置下，会在上面代码中的第25行返回，调用了`_randbelow`。

```python
_randbelow = _randbelow_with_getrandbits

def _randbelow_with_getrandbits(self, n):
    "Return a random int in the range [0,n).  Raises ValueError if n==0."

    getrandbits = self.getrandbits
    k = n.bit_length()  # don't use (n-1) here because n can be 1
    r = getrandbits(k)          # 0 <= r < 2**k
    while r >= n:
        r = getrandbits(k)
    return r
```

`_randbelow`则调用了`getrandbits`。

因此，题目中生成大整数的函数「几乎」可以改写如下：

```python
def generate(bits):
    p = sympy.nextprime(2 + random.getrandbits(bits))
    q = sympy.nextprime(2 + random.getrandbits(bits))
    return p, q, p * q
```

为什么是「几乎」呢？因为`_randbelow_with_getrandbits`内部随机到的`r`如果大于等于`n`，会重新随机直到满足条件。在题目的场景下，`_randbelow_with_getrandbits`函数传入的参数是`2 ** bits - 1`，这已经是`bits`位整数里最大的了，也就是说，这里`r = getrandbits(k)`得到的`r`，最大也就正好等于`n`，在这种低概率事件下，才会让随机数调用超过1次。故在大部分时候，每生成一个`bits`位的素数，只会调用一次`getrandbits(bits)`，遇到极少数倒霉情况的时候，我们多试一次即可。

---

接下来我们需要知道当`bits`不等于32时，``getrandbits(bits)``是如何运作的。这里可以直接阅读Python随机数[源码](https://github.com/python/cpython/blob/10ecbadb799ddf3393d1fc80119a3db14724d381/Modules/_randommodule.c)或通过观察法得出。这部分的代码我已经实现好了，位于[这里](https://gist.github.com/windshadow233/229ec53e67577bedb8965e652fdc7466#file-mt19937-py-L206)。

简单来说就是先生成的比特会放在最终输出结果的低位，后生成的比特放在输出结果的高位，若最后需要的比特数不足32，则将生成的32bit从高位开始进行一个截断，其余的低位就被丢掉了，这意味着我们拿到的随机数其实丢失了一部分信息。

## 从素数还原随机数

其实我们拿到的并不是生成的随机数，而是「大于此随机数+2的最小素数」，这意味着我们在低位上也丢失了一些信息。我们先写一个函数将可以确定的信息求出来：

```python
def known_prime_to_bits(p, bits):
    # p - 3 >= num >= q - 2
    q = prevprime(p)
    diff = (p - 3) ^ (q - 2)
    v = bin(q - 2)[2:].zfill(bits)
    unknown_length = len(bin(diff)[2:])
    return v[:-unknown_length] + "?" * unknown_length
```

我们用`?`表示不确定的位。

然后我们根据前面``getrandbits(bits)``的逻辑，反推出生成它的所有32bit：

```python
def split_bits(number_bin):
    result = []
    while number_bin:
        result.append(number_bin[-32:])
        number_bin = number_bin[:-32]
    if len(result[-1]) < 32:
        result[-1] += "?" * (32 - len(result[-1]))
    return result
```

这里为了方便起见，直接操作二进制字符串（同时还能兼顾上面有问号的情况，真是太方便了！）

这样我们就通过一个生成的素数还原出一些已知的随机bit了。那么如何求解呢？

## 还原随机数内部状态

调用现成的轮子即可。

{% link SymRandCracker, GitHub, https://github.com/icemonster/symbolic_mersenne_cracker %}

代码如下：

```python
predictor = Untwister()
known_bits = 0
while known_bits < 37000:
    p, q, bits = help()
    vp = known_prime_to_bits(p, bits)
    vq = known_prime_to_bits(q, bits)
    split_p = split_bits(vp)
    split_q = split_bits(vq)
    for i in split_p + split_q:
        predictor.submit(i)
        known_bits += 32 - i.count("?")

rng = predictor.get_random()
```

试了一些数，发现`known_bits`达到`37000`时，差不多就可以稳定把所有内部状态全还原了。我的电脑求解时间在40-50秒左右，基本能在1分钟内拿到flag。

## 完整代码

```python
from pwn import remote
import re
from sympy import prevprime, nextprime
from SymRandCracker import Untwister


r = remote('127.0.0.1', 9999)
r.recvuntil(b'[E]xit? ')


def help():
    r.sendline(b'H')
    data = r.recvuntil(b'[E]xit? ').decode()
    p = int(re.search(r'p = (\d+)', data).group(1))
    q = int(re.search(r'q = (\d+)', data).group(1))
    bits = int(re.search(r'under (\d+) bits', data).group(1))
    return p, q, bits


def begin(rng):
    r.sendline(b'B')
    for i in range(10, 1024, 32):
        r.recv()
        p, q, _ = generate_by_rng(rng, i)
        r.sendlines([str(p).encode(), str(q).encode()])
        print(r.recvline().decode())
    print(r.recvline().decode())


def randprime(rng, a, b):
    if a >= b:
        return
    a, b = map(int, (a, b))
    n = rng.randint(a - 1, b)
    p = nextprime(n)
    if p >= b:
        p = prevprime(b)
    if p < a:
        raise ValueError("no primes exist in the specified range")
    return p


def generate_by_rng(rng, bits):
    p = randprime(rng, 3, 2 ** bits)
    q = randprime(rng, 3, 2 ** bits)
    return p, q, p * q


def split_bits(number_bin):
    result = []
    while number_bin:
        result.append(number_bin[-32:])
        number_bin = number_bin[:-32]
    if len(result[-1]) < 32:
        result[-1] += "?" * (32 - len(result[-1]))
    return result


def known_prime_to_bits(p, bits):
    # p - 3 >= num >= q - 2
    q = prevprime(p)
    diff = (p - 3) ^ (q - 2)
    v = bin(q - 2)[2:].zfill(bits)
    unknown_length = len(bin(diff)[2:])
    return v[:-unknown_length] + "?" * unknown_length


predictor = Untwister()
known_bits = 0
while known_bits < 37000:
    p, q, bits = help()
    vp = known_prime_to_bits(p, bits)
    vq = known_prime_to_bits(q, bits)
    split_p = split_bits(vp)
    split_q = split_bits(vq)
    for i in split_p + split_q:
        predictor.submit(i)
        known_bits += 32 - i.count("?")

rng = predictor.get_random()
begin(rng)

```

