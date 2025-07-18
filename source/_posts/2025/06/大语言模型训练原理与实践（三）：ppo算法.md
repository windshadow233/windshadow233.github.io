---
title: 大语言模型训练原理与实践（三）：PPO算法
disableNunjucks: false
mathjax: true
id: 12706
date: 2025-06-24 13:01:20
categories:
  - [学习笔记]
  - [大语言模型训练]
tags:
  - LLM
  - PPO 算法
  - 机器学习
  - 深度学习
  - 强化学习
cover: https://blogfiles.oss.fyz666.xyz/webp/c2a660aa-d2b3-4b68-9e65-841abf6e6584.webp
---

在大语言模型的训练流程中，通常会先经过预训练和监督微调，经过这两个步骤后，模型已经能够理解语言结构，也能掌握基本的知识和指令执行能力，但你可能会发现，模型有时候仍会胡说八道、答非所问——这是由于监督微调出来的模型还不够聪明，它只是单纯能模仿人类已经写好的答案，但并不明白什么样的回答是「好的」（更符合人类偏好）。说白了，模型在监督微调阶段学的是**「怎么答」**，但没学会**「怎么才能答得好」**。

为了进一步提升模型输出的质量和对齐程度，研究者引入了**基于人类反馈的强化学习（RLHF）**。通过奖励模型对不同响应进行偏好打分，再利用强化学习算法对语言模型进行微调，使其在生成文本时更加贴合人类价值与偏好。其中，**PPO（Proximal Policy Optimization）** 是 RLHF 阶段最常用的优化算法，也是在 InstructGPT 和 ChatGPT 等模型中取得显著效果的关键技术。

本文将先从这个PPO算法入手，拆解此算法的核心理论。

---

## 策略梯度算法

PPO算法是一种**On-Policy**的**策略梯度算法**，关于策略梯度，我在[之前的一篇文章](/blog/12633/)中曾提到过其核心公式的推导：

$$
\nabla_\theta J(\theta)=\mathbb{E}_{s\in S}\mathbb{E}_{a_t\sim\pi_\theta(*\mid s)}[\nabla_\theta(\log{\pi_\theta(a_t\mid s)})Q(s,a_t)]
$$
这里 $$J(\theta)=\mathbb{E}_{s\in S}[V_{\pi_\theta}(s)]$$ 表示采取 以 $$\theta$$ 为参数的动作策略 $$\pi_\theta$$​ 时，能获得的所有状态下的回报的期望值。

简单来说，我们希望优化 $$\theta$$，让 $$J(\theta)$$ 变得更大。但策略梯度算法在实际应用时极不稳定，这种更新的方法容易让策略变化太剧烈，尤其是对于像大语言模型这样参数量巨大的网络（也算一种策略网络）而言，更是难以承受。为了引入对策略变化的约束，后续又提出了一些新的方法，例如**TRPO**、**PPO**等，前者直接在训练时强行限制新旧策略之间的KL散度，而后者则提出了一种更简单并且非常有效的手段。

我这里也以一个简单的小游戏：flappy bird，为具体的例子，对PPO算法进行了一个简单的实践。

{% link flappy-bird-ppo, GitHub, https://github.com/windshadow233/flappy-bird-ppo/%}

## PPO算法

我们回到 $$J(\theta)$$ 期望内部的 $$V$$ 函数的定义：
$$
V_{\pi_\theta}(s_t)=\mathbb{E}_{a_t\sim\pi_\theta(*\mid s_t)}[Q(s_t,a_t)]
$$
我们要最大化 $$J(\theta)$$，其实就相当于最大化 $$V$$ 函数： 
$$
\max_{\theta} V_{\pi_\theta}(s_t),\forall s_t
$$
将 $$V$$ 函数中的期望展开为积分：
$$
\max_{\theta} \int_{a\in A}\pi_\theta(a\mid s_t)Q(s_t,a)
$$


我们发现，在给定状态 $$s_t$$ 的情况下，$$Q(s_t,a)$$ 为关于动作 $$a$$ 的单变量函数，此时有两种情况：

1. $$Q(s_t,a)>0$$，说明它给我们带来的价值是正的，意味着这是一个比较好的动作，我们就应该**进一步提升**当前状态下这个动作被取到的概率，也就是 $$\pi_\theta(a\mid s_t)$$ 的值。
2. $$Q(s_t,a)\le 0$$​​，说明它没有给我们带来价值或带来了负价值，意味着这个动作比较差，同理我们应该**进一步降低**当前状态下这个动作被取到的概率。

### 重要性采样

对于上面的两种情况，我们实际上不关心当前动作概率具体的值是多少，而更关心是否要将此概率进一步提升或降低，那么很自然地会想到，可以将优化前后的概率值做一个比值：
$$
\frac{\pi_\theta(a\mid s_t)_{\text{new}}}{\pi_\theta(a\mid s_t)_{\text{old}}}
$$
我们可以**固定分母，优化分子**，同时这个值还可以体现新概率相对于旧概率的变化。

对于情况 1，我们希望新概率变大，故需要对 $$\pi_\theta(a\mid s_t)_{\text{new}}$$ 梯度上升；对于情况 2，我们希望新概率变小，故需要对 $$\pi_\theta(a\mid s_t)_{\text{new}}$$ 梯度下降。合而为一，我们总是需要对下式：
$$
\frac{\pi_\theta(a\mid s_t)_{\text{new}}}{\pi_\theta(a\mid s_t)_{\text{old}}}Q(s_t\mid a)
$$
进行梯度上升。

这就将原先的优化目标转化为了：
$$
\max_{\theta} \int_{a\in A}\frac{\pi_\theta(a\mid s_t)_{\text{new}}}{\pi_\theta(a\mid s_t)_{\text{old}}}Q(s_t,a)
$$
这个操作也被称为**重要性采样**。

### 约束

回想策略梯度算法的缺陷：难以在优化过程中控制新旧策略的差异，导致策略剧烈波动，使得训练不稳定。

在经过了**重要性采样**以后，如何规避这个缺陷？

盯着**重要性采样**引出的优化目标看，这不答案已经拍脸上了吗？直接约束新旧概率之间的差距不就行了？

对于这件事，**PPO**算法使用的约束方法是对新旧概率的比值，也就是优化目标左边那一坨东西，进行一个裁剪：
$$
\text{clip}(\frac{\pi_\theta(a\mid s_t)_{\text{new}}}{\pi_\theta(a\mid s_t)_{\text{old}}}, 1-\epsilon,1+\epsilon)
$$
将概率的比值保持在区间 $$[1-\epsilon, 1+\epsilon]$$​​​ 之内，简单粗暴地控制了策略的差异。由于`clip`在区间外不产生梯度，这个操作使得与原策略差距过大的动作不会让模型产生参数更新。让策略模型在训练过程中能够逐步收敛，不至于在一次更新中产生过大的变化。

---

另外，在大语言模型的训练中，我们还要对新策略和原始策略之间的KL散度进行惩罚，这同样也是为了防止新策略跑的离旧策略太远。计算KL散度有多种方式，这里暂时不管。

### 优势函数

设想我们的 Agent 因为~~前面操作太垃~~种种原因，处在一个已经非常糟糕的状态 $$s_t$$ ，这个状态下，无论这个 Agent 采取哪个动作 $$a$$，价值函数 $$Q(a\mid s_t)$$​ 都是负的，由刚刚**重要性采样**部分得出的结论，我们发现对于每个动作都要降低它被取到的概率，~~这不就是摆烂么~~。难道对于 Agent 而言，原地摆烂才是最优解？

![](https://blogfiles.oss.fyz666.xyz/webp/59c510e5-7883-406e-8d8a-e95798bc9cd5.webp)

恐怕大部分心理承受能力比较普通的人类玩家面对这种情况都会选择~~战术性摊手~~摆烂吧。

![](https://blogfiles.oss.fyz666.xyz/gif/7f204236-0f9f-4149-b196-5adf6ac9300c.gif)

但 Agent 毕竟不是情绪化的玩家。作为没有任何感情的 Bot，它应该做的绝对不是摆烂，而是在逆境中找到那一记也许能够力挽狂澜的神之一手，无论最终结局如何。

从强化学习的角度来看，我们先前优化目标中的 $$Q$$ 函数就显得不够合理了，因此需要找出一个新的函数来代替 $$Q$$​ 函数，其能够更准确地衡量某一个动作在当前局势下的优劣程度。

这便是**优势函数**。

我们定义 $$s_t$$ 状态下，采取动作 $$a$$ 的优势函数如下：
$$
A(s_t,a)=Q(s_t,a) - V_{\pi_\theta}(s_t)
$$
也就是采取了 动作 $$a$$ 以后，能得到的预期回报与**「遵循策略时能带来的预期回报的期望」**之差。

说白了就是衡量你这个动作能让局势改善多少。如果有所改善，说明该动作是比原策略更优的，我们要增大这个动作的概率，反之亦然。

于是我们的优化目标变为了：
$$
\max_{\theta} \int_{a\in A}\text{clip}(\frac{\pi_\theta(a\mid s_t)_{\text{new}}}{\pi_\theta(a\mid s_t)_{\text{old}}}, 1-\epsilon,1+\epsilon)A(s_t,a)
$$

不过这个优化目标还并不完整，直接使用这个函数进行梯度上升仍有一定问题，且看下文。

### 最终的目标函数

前文提到的目标函数存在一定的问题，因此在实际的应用中，还需要对优化目标进行以下 $$\min$$ 计算：

方便起见，定义 $$r \overset{\triangle}{=} \frac{\pi_\theta(a\mid s_t)_{\text{new}}}{\pi_\theta(a\mid s_t)_{\text{old}}}$$​，则 PPO 算法最终的优化目标如下：
$$
\max_{\theta} \int_{a\in A}\min\{\text{clip}(r, 1-\epsilon,1+\epsilon)A(s_t,a),\ r A(s_t,a)\}
$$
对于这个操作，可能有一些初学者会有疑惑：**已经`clip`了为什么还要取`min`**？这一点许多其他博客都没有提到，其实可以简单分析一下如果不取`min`会发生什么预想之外的事：

1. 第一种情况：$$A(s_t,a)>0$$ 时，此时这个动作是好的动作，因此需要把动作概率向上调整。此时又分为三种情况：

   - $$r\ge1+\epsilon$$：此时，优化目标会把 $$r$$ 进行一个 `clip`，变成 $$1+\epsilon$$，此时由于`clip`函数在阈值外不产生梯度，优化目标就不会对策略网络产生梯度累积，这意味着这个**概率过大**的动作**不再**被用于参数的更新，这是**合理**的。

   - $$1+\epsilon>r>1-\epsilon$$：此时不截断，正常计算梯度，正常更新策略网络参数，也非常**合理**。

   - $$r\le1-\epsilon$$​：此时，与前面第一条子情况同理，由于产生了截断，优化目标同样不会对策略网络产生梯度累积，意味着这个**概率过小**的动作也没有被用于网络参数的更新，但这是**不合理**的：因为我们本应该将这个动作的概率调大。
2. 第二种情况：$$A(s_t,a)\le0$$ 时，与第一种情况同理，我们会发现对于 $$r\ge1+\epsilon$$​ 的动作，将由于`clip`运算阻断了梯度，从而不参与网络参数的更新，这同样是**不合理**的。

对于上述没有取 `min` 运算的情况，有几条不合理性，而这些不合理都可以通过做`min`运算得到解决。我们同样分类讨论：

1. $$A(s_t,a)>0$$ 时，需要把动作概率向上调整，此时若：
   - $$r\ge1+\epsilon$$：取 `min` 运算后，得到的是截断后的值，故梯度反馈为0，不更新参数，非常**合理**。
   - $$1+\epsilon>r>1-\epsilon$$：`min` 运算不产生效果，正常计算梯度，更新参数，非常**合理**。
   - $$r\le1-\epsilon$$：`min` 运算后，得到的是未被截断的值，故梯度反馈不为0，能够正常更新参数，非常**合理**。

2. $$A(s_t,a)\le0$$ 时，需要注意此时 `min` 运算作用在两个负数上，故会得到与前面相反的结果，即对于$$r\ge1+\epsilon$$ 的动作，进行了`min` 运算后得到的反而是未被截断的值，故这种情况下仍能够正常更新参数，也变得**合理**了起来！

因此，这个取`min`运算是非常重要的，如果没有这个运算，在某些情况下参数会得不到我们希望的更新。

### 如何估计优势函数

优势函数这个东西看上去十分抽象，要怎么去估计呢？

为方便起见，我们记 $$A_t^{(k)}$$ 为 $$A(s_t)$$ 的 $$k$$ 阶近似估计，$$Q_t^{(k)}$$ 为 $$Q(s_t,a)$$ 的 $$k$$ 阶近似估计，$$V_t\overset{\triangle}{=}V_{\pi_\theta}(s_t)$$ ，写出 $$t$$ 时刻优势函数的 1 阶近似估计：
$$
A_t^{(1)}=\underbrace{R_t + \gamma V_{t+1}}_{Q_t^{(1)}} - V_t
$$
我们发现，它正好相当于 $$t$$ 时刻的TD残差 $$\delta_t$$。

同理，2 阶近似估计：
$$
A_{t}^{(2)}=\underbrace{R_t+\gamma R_{t+1}+\gamma^2V_{t+2}}_{Q_{t}^{(2)}}-V_t
$$
将其做一些变换，得到：
$$
\begin{aligned}
A_{t}^{(2)}&=(R_t+\gamma V_{t+1}-V_t)+(\gamma R_{t+1}+\gamma^2V_{t+2}-\gamma V_{t+1})\\
&=\delta_t + \gamma\delta_{t+1}
\end{aligned}
$$
同理，我们也可以写出 $$k$$ 阶近似估计的通项：
$$
A_{t}^{(k)}=\underbrace{(\sum_{i=0}^{k-1}\gamma^iR_{t+i})+\gamma^kV_{t+k}}_{Q_{t}^{(k)}}-V_t
$$
同样可以将上式变成：
$$
A_{t}^{(k)}=\sum_{l=0}^{k-1}\gamma^l\delta_{t+l}
$$
恰好是TD残差 $$\delta$$ 序列的带衰减累计求和。

近似阶数 $$k$$ 越大，我们得到的估计值的**偏差越小**，但其中包含的随机变量（$$\{R_{t+i}\ \mid  \ i=0,\dots,k-1\}$$）越多，因此**方差反而变大**。

接下来有个操作叫 **$$\lambda-\text{return}$$** 算法，它的作用是平衡这些估计的偏差与方差。

简而言之，该方法使用一个 $$(0,1)$$ 上的系数 $$\lambda$$ ，对这些估计进行加权求和，即：
$$
\sum_{i=1}^\infty\lambda^{i-1}A_t^{(i)}
$$
阶数越高的估计值，权重越小，以此降低其方差。由此得到的和式能够兼顾偏差和方差。

由于所有的 $$A_t^{(i)}$$ 都是 $$A_t$$ 的估计，上式的期望差不多相当于 $$\frac{1}{1-\lambda}A_t$$, 因此我们还应该乘上一个系数 $$1-\lambda$$，才能得到真正对 $$A_t$$ 的估计：
$$
\begin{aligned}
\hat{A_t}&=(1-\lambda)\sum_{i=1}^\infty\lambda^{i-1}A_t^{(i)}\\
&=(1-\lambda)\sum_{i=1}^\infty\lambda^{i-1}\sum_{l=0}^{i-1}\gamma^l\delta_{t+l}
\end{aligned}
$$
这便是**广义优势估计 (GAE) **算法。

---

对于PPO算法的基本原理就讲到这儿，接下来让我们来看看这个算法是如何应用在大语言模型的训练流程中的。为了让PPO能够发挥作用，我们还缺少一个模块，那就是用来计算上文中多次出现的 $$R_i$$ 的值（Reward）的模型，也就是所谓 **Reward Model**，[下一篇文章](/blog/12760/)，博主将介绍如何训练一个 Reward Model。
