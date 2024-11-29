---
title: Python随机数的背后：MT19937算法之——分析
disableNunjucks: false
mathjax: true
id: 12239
date: 2024-11-20 19:16:24
categories:
  - 学习笔记
tags:
  - PRNG
  - MT19937
  - 密码学
cover: https://blogfiles.oss.fyz666.xyz/webp/4de41354-86bb-42e2-8812-9d13cd1c164b.webp
---

## 前言

先前在做各种CTF时，总会遇到一些预测Python随机数的题，虽然知道伪随机数生成器都可以在一定条件下被预测，但由于不懂背后的原理，每每遇到此类题型就折戟于此。最近~~痛定思痛~~趁着兴趣练习了几道相关题型，在过程中把Python的伪随机数算法逆向了一下，觉得颇有收获，因此写几篇~~网上相关内容早已烂大街的~~博客记录一下。

笔者的代码公开于[此gist](https://gist.github.com/windshadow233/229ec53e67577bedb8965e652fdc7466)。

本文主要分析一下Python使用的伪随机数算法：MT19937

## 梅森旋转算法介绍

引用维基百科：

> The **Mersenne Twister** is a general-purpose [pseudorandom number generator](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) (PRNG) developed in 1997 by [Makoto Matsumoto](https://en.wikipedia.org/wiki/Makoto_Matsumoto_(mathematician)) (松本 眞) and [Takuji Nishimura](https://en.wikipedia.org/w/index.php?title=Takuji_Nishimura&action=edit&redlink=1) (西村 拓士). Its name derives from the choice of a [Mersenne prime](https://en.wikipedia.org/wiki/Mersenne_prime) as its period length.
>
> The Mersenne Twister was designed specifically to rectify most of the flaws found in older PRNGs.
>
> The most commonly used version of the Mersenne Twister algorithm is based on the Mersenne prime $2^{19937}-1$​. The standard implementation of that, MT19937, uses a [32-bit](https://en.wikipedia.org/wiki/32-bit) word length. There is another implementation (with five variants) that uses a 64-bit word length, MT19937-64; it generates a different sequence.

Python的伪随机数（`random`库）所使用的即是梅森旋转算法的一种常见变体：MT19937。其具有长达$$2^{19937}-1$$的周期，以及非常优良的性能：

> A pseudorandom sequence $x_i$ of *w*-bit integers of period $P$ is said to be k-distributed to *v*-bit accuracy if the following holds.
>
> Let $trunc_v(x)$ denote the number formed by the leading v bits of $x$, and consider $P$ of the k v-bit vectors
>
> $$
> (trunc_v(x_i), trunc_v(x_{i+1}),\dots,trunc_v(x_{i+k-1}))\qquad(0\le i \lt P)
> $$
> Then each of the $2^{kv}$ possible combinations of bits occurs the same number of times in a period, except for the all-zero combination that occurs once less often.

根据以上k-distributed to v-bit accuracy（k-维 v-比特准确）的定义，如果一个伪随机数生成器$PRNG$可以产生周期为$P$的w-bit的序列$\left\lbrace x_{i}\right\rbrace$，我们将此序列中的元素的高$v$位截取出来，记为$trunc_v(x_i)$，然后构造下面的二进制数：
$$
PRNG_{k,v}(i)=(trunc_v(x_i), trunc_v(x_{i+1}),\dots,trunc_v(x_{i+k-1}))\qquad(0\le i \lt P)
$$
此二进制数拥有$kv$比特，故其可以有$2^{kv}$种取值，若当$i$从$0\to P-1$遍历时，此二进制数可以在$[0,2^{kv}]$​上均匀分布，则这个$PRNG$是k-维 v-比特准确的。

MT19937则是一种623-维 32-比特准确的伪随机数发生器，而由于$\lfloor\frac{19937}{32}\rfloor=623$，故其k-维 v-比特准确度性能已达最大值。

## Python中梅森旋转算法的实现细节

Python中`random`库的实现位于[CPython/Modules/_randommodule.c](https://github.com/python/cpython/blob/main/Modules/_randommodule.c)，为便于理解，我将其中的重要内容重新用Python语言实现了一遍~~（其实是因为我不太看得懂C语言，但我就不承认）~~

在这一版本的实现中，有以下一些重要参数：

```python
self.N = 624
self.M = 397
self.MATRIX_A = 0x9908b0df
self.UPPER_MASK = 0x80000000
self.LOWER_MASK = 0x7fffffff
self._mt = [0] * self.N
self._mti = 624
```

- `N`为状态向量长度，也是参与梅森旋转的随机数个数
- `M`为一个0到`N`之间的常数，在Python的实现中取为397
- `MATRIX_A`本意为一个描述梅森旋转过程的矩阵，而这里根据一些计算特性，直接将其定义为了一个32bit常数，其实际上代表了这样一个2进制向量：`10011001000010001011000011011111`，用于旋转过程中与随机数状态向量的按位异或操作。
- `UPPER_MASK`与`LOWER_MASK`，两个遮罩变量，分别用于取一个32bit向量的最高位与低31位。
- `_mt`为内部状态向量数组。
- `_mti`为下标计数器，初始化为624。

### 初始化

当我们在Python中初始化一个梅森旋转随机数发生器时，其内部首先会根据种子来初始化状态向量数组：

```python
def init_genrand(self, seed):
    self._mt[0] = _int32(seed)
    for i in range(1, self.N):
        self._mt[i] = _int32(1812433253 * (self._mt[i - 1] ^ (self._mt[i - 1] >> 30)) + i)
    self._mti = self.N

def init_by_array(self, key, length):
    self.init_genrand(19650218)
    i, j = 1, 0
    k = max(self.N, length)
    for _ in range(k):
        self._mt[i] = (self._mt[i] ^ ((self._mt[i - 1] ^ (self._mt[i - 1] >> 30)) * 1664525)) + key[j] + j
        self._mt[i] = _int32(self._mt[i])
        i += 1
        j += 1
        if i >= self.N:
            self._mt[0] = self._mt[self.N - 1]
            i = 1
        if j >= length:
            j = 0
    for _ in range(self.N - 1):
        self._mt[i] = (self._mt[i] ^ ((self._mt[i - 1] ^ (self._mt[i - 1] >> 30)) * 1566083941)) - i
        self._mt[i] = _int32(self._mt[i])
        i += 1
        if i >= self.N:
            self._mt[0] = self._mt[self.N - 1]
            i = 1

    self._mt[0] = 0x80000000
```

我们给定的`seed`会经过一系列变换得到`init_by_array`函数的`key`参数，然后通过此函数对内部状态数组进行初始化。不过这部分内容并无多大用，更重要的还是其提取随机数的过程，Python的`random`库产生的任何形式的伪随机数最终都会追溯到通过梅森旋转算法提取1次或多次伪随机数。

梅森旋转算法每次提取产生一个32bit的伪随机数。其产生随机数的过程可分为两次操作：`twist`与`tempering`。

### Twist

这个操作就是梅森旋转算法名字中的“旋转”了，其过程如下：

```python
def twist(self, i):
    y = (self._mt[i] & self.UPPER_MASK) | (self._mt[(i + 1) % self.N] & self.LOWER_MASK)
    self._mt[i] = y >> 1
    if y & 0x1 == 1:
        self._mt[i] ^= self.MATRIX_A
    self._mt[i] ^= self._mt[(i + self.M) % self.N]
```

传入的参数`i`即为当前的下标`_mti`。我们发现，每次旋转只会影响当前下标的状态向量：`_mt[i]`，对其他位置的状态向量没有任何影响。但影响当前下标状态向量的元素则有3个：

- `_mt[i]`
- `_mt[i+1]`
- `_mt[i+397]`

相对于自身的偏移量分别为0、1、397。这是一个有用的性质。方便起见，下面将`_mt[i+k]`称为$x_{i+k}$

旋转过程如下：

1. 首先取出 $$x_{i}$$ 的最高位与 $$x_{i+1}$$ 的低31位，组合为一个新的变量 $y$
2. 将$y$右移一位（抹掉最后一位）
3. 如果$y$在上一步被抹掉的那个数位是1（可理解为 $x_{i+1}$ 是个奇数）则将其与`MATRIX_A`异或
4. 将上一步得到的值与 $x_{i+397}$​ 进行异或，赋值给 $x_i$

### Tempering

上一步得到新的$x_i$后，对其进行下面的操作：

```python
def tempering(y):
    y ^= (y >> 11)
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 15) & 0xefc60000
    y ^= (y >> 18)
    return y
```

进行了一些简单的移位、与运算，得到最终的32bit伪随机数。

### 完整的提取过程

在Python的实现中，并非每一次提取都会进行一次旋转，而是当下标计数器达到$N=624$后，进行连续624次旋转，然后把下标计数器清零。

```python
def extract_number(self):
    if self._mti >= self.N:
        for i in range(self.N):
            self.twist(i)
        self._mti = 0

    y = self._mt[self._mti]
    y = self.tempering(y)

    self._mti += 1

    return _int32(y)
```

这相当于一次性把整个状态数组生成好了，容易注意到其效果与每次提取时进行一次旋转相同，不过在这两种不同的处理方式下，进行对状态数组的相关处理时需要注意到区别，例如在使用`setstate`方法时。

---

以上，即是MT19937算法的实现细节，根据这些细节，我们就能对其进行逆向，逆向的内容我将会放到[后面一篇文章](/blog/12283/)中。
