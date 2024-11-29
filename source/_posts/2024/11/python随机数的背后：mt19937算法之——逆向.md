---
title: Python随机数的背后：MT19937算法之——逆向
disableNunjucks: false
mathjax: true
id: 12283
date: 2024-11-21 00:23:13
categories:
  - 学习笔记
tags:
  - PRNG
  - MT19937
  - 密码学
cover: https://blogfiles.oss.fyz666.xyz/webp/4de41354-86bb-42e2-8812-9d13cd1c164b.webp
---

[前一篇文章](/blog/12239/)分析了Python中随机算法的实现细节，本文就来对其进行逆向。

由前文所述，MT19937提取随机数可分为两部分：`twist` 、`tempering`

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

那么，其逆向过程就先从`termpering`操作开始。

---

## 逆向 tempering

````python
def tempering(y):
    y ^= (y >> 11)
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 15) & 0xefc60000
    y ^= (y >> 18)
    return y
````

我们倒着一步一步分析，约定记号如下：

- 「异或」运算记为$\oplus$，「与」运算记为$\wedge$
- 每一步运算前的变量为$y$，得到的结果为$z$​
- 记变量最高位的下标为0，第二高位的下标为1，以此类推
- 变量从高位到低位的连续一段切片，以上下标标记，下标为起点，上标为终点。例如$y$的高18字节记为$y_0^{17}$

---

先看最后一步：`y ^= (y >> 18)`

我们知道$z$是32位整数，根据这个公式，显而易见的结论有：
$$
\left\lbrace\begin{aligned}
z_0^{17}&=y_0^{17}\\
z_{18}^{31}&=y_{18}^{31}\oplus y_0^{13}
\end{aligned}\right.
$$
于是：
$$
\left\lbrace\begin{aligned}
y_0^{17}&=z_0^{17}\\
y_{18}^{31}&=z_{18}^{31}\oplus y_0^{13}=z_{18}^{31}\oplus z_{0}^{13}
\end{aligned}\right.
$$


注意到这个$z\to y$的公式与前面$y\to z$的在形式上一模一样，故这一步的逆向我们只需照抄正向：

```python
y ^= (y >> 18)
```

---

再看倒数第二步：`y ^= (y << 15) & 0xefc60000`

记`0xefc60000`为$c$。

注意到`bin(c) == 0b11101111110001100000000000000000`，这个二进制数的低17位全为0。

故我们可以写出这一步的正向公式：
$$
\left\lbrace\begin{aligned}
z_0^{14}&=y_0^{14}\oplus(y_{15}^{29}\wedge c_0^{14})\\
z_{15}^{31}&=y_{15}^{31}
\end{aligned}\right.
$$
同理，容易写出逆公式：
$$
\left\lbrace\begin{aligned}
y_0^{14}&=z_0^{14}\oplus(z_{15}^{29}\wedge c_0^{14})\\
y_{15}^{31}&=z_{15}^{31}
\end{aligned}\right.
$$
发现形式也相同，故这一步也直接抄正向：

```python
y ^= (y << 15) & 0xefc60000
```

---

接下来分析倒数第三步：`y ^= (y << 7) & 0x9d2c5680`

记`0x9d2c5680`为$d_1$。

这里不容易像前面那样直接写出逆公式，不过我们可以用类似于递归的方法来求解。

首先我们有：
$$
z = y\oplus ((y \ll 7)\wedge d_1)
$$
因此：
$$
y =z\oplus ((y \ll 7)\wedge d_1)
$$
将此表达式直接代入右边的$y$，得到：
$$
y =z\oplus (((z\oplus ((y \ll 7)\wedge d_1)) \ll 7)\wedge d_1)
$$
记上式为

$$
y =z\oplus X
$$

我们来计算$X$：

$$
\begin{aligned}
X&=((z\oplus ((y \ll 7)\wedge d_1)) \ll 7)\wedge d_1\\
&=((z\ll7)\oplus((y\ll14)\wedge (d_1\ll7))\wedge d_1\\
&=((z\ll7)\wedge d_1)\oplus((y\ll14)\wedge ((d_1\ll7)\wedge d_1))\\
&=((z\ll7)\wedge d_1)\oplus((y\ll14)\wedge d_2)
\end{aligned}
$$
这里$d_2=(d_1\ll7)\wedge d_1=\text{0x94284000}$​

同理，我们可以不断将下式
$$
y=z\oplus ((y \ll 7)\wedge d_1)
$$
代入到等号右侧的$y$并展开，我们会得到：
$$
X =((z\ll7)\wedge d_1)\oplus((z\ll14)\wedge d_2)\oplus\dots
$$
我们记右侧的异或项序列为$\{X_i\}$，即
$$
X=X_1\oplus X_2\oplus\dots
$$
其中，
$$
\left\lbrace
\begin{aligned}
X_i&=(z\ll7i)\wedge d_i\qquad i\ge1\\
d_{i+1}&=(d_i\ll7)\wedge d_1\qquad i\ge1
\end{aligned}
\right.
$$
计算得：
$$
\left\lbrace
\begin{aligned}
d_1&=\text{0x9d2c5680}\\
d_2&=\text{0x94284000}\\
d_3&=\text{0x14200000}\\
d_4&=\text{0x10000000}\\
d_i&=0\qquad i\ge5
\end{aligned}
\right.
$$
由此可知，我们在展开到第五项时，彻底消去了等号右侧的$y$，因此：

$$
X=X_1\oplus X_2\oplus X_3\oplus X_4\oplus X_5
$$

至此，我们已经可以写出这一步的逆向代码：

```python
y ^= ((y << 7) & 0x9d2c5680) ^ ((y << 14) & 0x94284000) ^ ((y << 21) & 0x14200000) ^ ((y << 28) & 0x10000000)
```

---

最后，逆向第一步：`y ^= (y >> 11)`

类似于上一步，我们可以不断右移再异或，直到右侧的$y$变成0：
$$
\begin{aligned}
y &= z\oplus (y\gg11)\\
&=z\oplus((z\oplus(y\gg11))\gg11)\\
&=z\oplus(z\gg11)\oplus(y\gg22)\\
&=z\oplus(z\gg11)\oplus(z\oplus (y\gg11)\gg22)\\
&=z\oplus(z\gg11)\oplus(z\gg22)\oplus(y\gg33)
\end{aligned}
$$
注意，$y$是32位整数，右移33位就归零了，因此，第一步的逆向如下：

```python
y ^= (y >> 11) ^ (y >> 22)
```

---

综合上述内容，我们可以写出`untempering`：

```python
def untempering(y):
    y ^= (y >> 18)
    y ^= (y << 15) & 0xefc60000
    y ^= ((y << 7) & 0x9d2c5680) ^ ((y << 14) & 0x94284000) ^ ((y << 21) & 0x14200000) ^ ((y << 28) & 0x10000000)
    y ^= (y >> 11) ^ (y >> 22)
    return y
```

## 逆向 twist

```python
def twist(self, i):
    y = (self._mt[i] & self.UPPER_MASK) | (self._mt[(i + 1) % self.N] & self.LOWER_MASK)
    self._mt[i] = y >> 1
    if y & 0x1 == 1:
        self._mt[i] ^= self.MATRIX_A
    self._mt[i] ^= self._mt[(i + self.M) % self.N]
```

逆向`twist`其实相当于恢复`_mt[i]`。

我们首先写出最后一步的逆向：

```python
tmp = self._mt[i] ^ self._mt[(i + self.M) % self.N]
```

这里`tmp`的值应为上面`twist`函数中经过3、4、5三行之后的`_mt[i]`的值，那么如何判断在正向过程中是否进入了这个`if`分支？其实我们只要关注`tmp`的最高位（32位整数的意义下）即可。

如果未曾进入`if`分支，那么`tmp`的值为`y>>1`，是某个32位整数右移得来的，故此时`tmp`最高位必为0；反之，若进入了`if`分支，其还会异或一个`MATRIX_A`，而我们知道`MATRIX_A`的最高位为1，因此这时`tmp`最高位也一定会变成1。

再考虑到进入`if`语句的条件是`y`的最低位为1，因此我们根据`tmp`的最高位的值，其实已经可以推导出`twist`函数里的变量`y`的值了。

接下来的几行代码：

```python
if tmp & self.UPPER_MASK == self.UPPER_MASK:
    tmp ^= self.MATRIX_A
    tmp <<= 1
    tmp |= 1
else:
    tmp <<= 1
```

此时`tmp`的值相当于`twist`函数里的变量`y`，我们看看它包含了哪些信息：

```python
y = (self._mt[i] & self.UPPER_MASK) | (self._mt[(i + 1) % self.N] & self.LOWER_MASK)
```

这说明`y`的最高位是`_mt[i]`的最高位，`y`的后31位则是`_mt[i+1]`的后31位。

因此我们已经恢复出`_mt[i]`的最高位了，接下来只要恢复其后31位即可。

显然，想要恢复`_mt[i]`的后31位，只需将前面所有操作的下标减去1，即可在`tmp`的后31位得到`_mt[i]`的后31位。这一步非常巧妙。

于是，`untwist`的完整代码就呼之欲出了：

```python
def untwist(self, i):
    tmp = self._mt[i] ^ self._mt[(i + self.M) % self.N]
    if tmp & self.UPPER_MASK == self.UPPER_MASK:
        tmp ^= self.MATRIX_A
        tmp <<= 1
        tmp |= 1
    else:
        tmp <<= 1
    res = tmp & self.UPPER_MASK
	
    # 进行与前面一模一样的操作，不过将下标减去了1
    tmp = self._mt[i - 1] ^ self._mt[(i + self.M - 1) % self.N]
    if tmp & self.UPPER_MASK == self.UPPER_MASK:
        tmp ^= self.MATRIX_A
        tmp <<= 1
        tmp |= 1
    else:
        tmp <<= 1
    res |= tmp & self.LOWER_MASK
    self._mt[i] = res
```

## 逆向 extract_number

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

这就很容易了，可以直接写出：

```python
def unextract_number(self):
    self._mti = (self._mti - 1) % self.N
    if self._mti == 0:
        for i in range(self.N - 1, -1, -1):
            self.untwist(i)
        self._mti = self.N
```

调用此函数即可将当前的随机数内部状态倒回去一次迭代。

---

以上，我们已基本实现了对MT19937算法的逆向，以此为基础，我们便有了预测Python随机数的能力，具体内容见[下一篇文章](/blog/12317/)。
