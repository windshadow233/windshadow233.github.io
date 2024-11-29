---
title: Python随机数的背后：MT19937算法之——预测
disableNunjucks: false
mathjax: true
id: 12317
date: 2024-11-21 04:41:57
categories:
  - 学习笔记
tags:
  - PRNG
  - MT19937
  - 密码学
cover: https://blogfiles.oss.fyz666.xyz/webp/4de41354-86bb-42e2-8812-9d13cd1c164b.webp
---

[前一篇文章](/blog/12283/)中，我们已经逆向了Python中的随机算法，在本文中，我们将对MT19937进行预测。

---

根据前文的分析，我们知道一旦还原了随机数发生器完整的内部状态，就相当于复刻了一个完全相同的随机数发生器，也就能预测后面的随机数了，并且我们还知道，每次提取随机数时，是取出某个下标位置的状态向量并将其进行`tempering`运算，最终输出。

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

当下标运转一整轮（即624次）时，我们相当于把每个状态向量都提取了一次，这说明连续提取出来的624个32bit随机数是与624个内部状态向量一一对应的。

反过来，我们就可以通过提取出来的连续624个32bit来生成内部状态向量数组：

```python
def setrand_int32(self, y):
    assert 0 <= y < 2 ** 32
    self._mti %= self.N
    self._mt[self._mti] = self.untempering(y)
    self._mti += 1
```

至此，我们便可以预测Python的伪随机数了。如下：

```python
import random
from mt19937 import MT19937Predictor

predictor = MT19937Predictor()
prng = random.Random()
for i in range(624):
    predictor.setrand_int32(prng.getrandbits(32))

for _ in range(1000):
    assert predictor.getrandbits(64) == prng.getrandbits(64)
```

其中，`mt19937`见[此gist](https://gist.github.com/windshadow233/229ec53e67577bedb8965e652fdc7466)。

---

[下一篇文章](/blog/12343/)中笔者将写一下几道MT19937相关题目的题解。
