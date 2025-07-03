---
title: 大语言模型训练原理与实践（六）：DPO算法
disableNunjucks: false
mathjax: true
id: 12794
date: 2025-07-03 14:35:06
categories:
  - [学习笔记]
  - [大语言模型训练]
tags:
  - LLM
  - PPO 算法
  - 机器学习
  - 深度学习
cover: https://blogfiles.oss.fyz666.xyz/webp/c2a660aa-d2b3-4b68-9e65-841abf6e6584.webp
---

前面几篇文章已经基本实现了常规RLHF算法训练大模型的流程，从监督微调（SFT）、奖励模型训练（RM）到使用 PPO 进行强化学习（RL）优化模型行为。然而，我们同样注意到了当前用于强化学习的PPO算法有一些缺点：训练过程复杂、硬件资源消耗大，还往往训练不稳定、调参困难。

为了解决常规RLHF算法中的这些问题，研究者随后提出了**DPO（Direct Preference Optimization）算法**，它能够绕过RLHF算法中的奖励模型训练以及后面的强化学习训练阶段，在完成监督微调之后，直接通过人类偏好对比数据对模型进行对齐优化，相当于实现了**不需要RL的RLHF**。

建议有兴趣深入了解的朋友直接阅读原论文。

{% link Direct Preference Optimization: Your Language Model is Secretly a Reward Model, $\text{ar}\chi\text{iv}$​, https://arxiv.org/abs/2305.18290 %}

---

## PPO算法的优化目标

前面提到的PPO算法实际上作为一种强化学习算法，其在大语言模型训练任务上，优化的最终目标是生成token序列的Reward的期望值，假设我们已经有了一个完美的Reward Model：$$R(x,y)$$，表示给定prompt $$x$$ 且模型输出token序列为 $$y$$ 时的Reward，我们可以将优化目标简单写为：
$$
\max_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*|x)}[R(x,y)]
$$
不过，考虑到实际训练时需要对模型策略的KL散度做一个约束，我们还要在优化目标中添加一个惩罚项，于是优化目标实际上是：
$$
\max_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*|x)}[R(x,y)-\beta\cdot\mathbb{D}_{\text{KL}}(\pi_\theta(*|x)\|\pi_\text{ref}(*|x))]
$$
上式中，$$\beta$$ 是惩罚系数，$$\pi_{\text{ref}}(y|x)$$ 则是参考模型给出的概率分布。$$\mathbb{D}_{\text{KL}}(* \| *) $$ 表示两个概率分布的KL散度，其定义如下：
$$
\mathbb{D}_{\text{KL}}(\pi_1(*|x) \| \pi_2(*|x)) =\mathbb{E}_{y\sim\pi_1(*|x)}[\log\frac{\pi_1(y|x)}{\pi_2(y|x)}]
$$

## 求解优化目标

将KL散度表达式代入优化目标，得到：
$$
\max_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*|x)}[R(x,y)-\beta\cdot\log\frac{\pi_\theta(y|x)}{\pi_\text{ref}(y|x)}]
$$
将其改为求极小值，并除去常数 $$\beta$$，并稍加变形，得到：
$$
\begin{aligned}
&\min_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*|x)}[\log\frac{\pi_\theta(y|x)}{\pi_\text{ref}(y|x)}-\frac{1}{\beta}\cdot R(x,y)]\\
&=\min_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*|x)}[\log\frac{\pi_\theta(y|x)}{\pi_\text{ref}(y|x)\exp(\frac{1}{\beta}\cdot R(x,y))}]
\end{aligned}
$$
这里，论文做了一个操作，强行让对数部分成为一个新的 KL散度，即让分母部分通过一个归一化操作成为概率分布：

定义 $$Z(x)$$：
$$
Z(x) = \int_{y\sim\pi_\text{ref}(*|x)}\pi_\text{ref}(y|x)\exp(\frac{1}{\beta}\cdot R(x,y))
$$
可见 $$Z(x)$$ 是关于 $$x$$ 的函数，并且只与 $\pi_\text{ref}$ 、奖励模型有关，与待训练模型 $$\pi_\theta$$ 无关。

将 $$Z(x)$$ 引入优化目标 $$\log$$ 运算的分母，再从外部减去，我们得到：
$$
\min_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*|x)}[\log\frac{\pi_\theta(y|x)}{\frac{1}{Z(x)}\pi_\text{ref}(y|x)\exp(\frac{1}{\beta}\cdot R(x,y))}-\log Z(x)]
$$
此时，左侧的对数就变成了一个KL散度的形式了，我们记 $$\pi^*(y|x)\overset{\triangle}{=}\frac{1}{Z(x)}\pi_\text{ref}(y|x)\exp(\frac{1}{\beta}\cdot R(x,y))$$，

容易验证 $$\pi^*(*|x)$$ 是一个概率分布，因此，上式可以写为：
$$
\min_{\pi_\theta}\mathbb{E}_{x\in X}[\mathbb{D}_\text{KL}(\pi_\theta(*|x)\|\pi^*(*|x))-\log Z(x)]
$$
显然，由于上式的右侧项 $$\log Z(x)$$ 与 $$\pi_\theta$$ 无关，我们可以忽略它。又从KL散度的性质得到，当且仅当
$$
\pi_\theta(y|x) = \pi^*(y|x)=\frac{1}{Z(x)}\pi_\text{ref}(y|x)\exp(\frac{1}{\beta}\cdot R(x,y))
$$
时，KL散度达到最小值0。

看上去我们已经直接求出了目标的显式解，但可惜的是，这个 $$Z(x)$$ 并不好直接算，因为它需要对于一个prompt $$x$$，遍历所有Reference Model可能产生的 $$y$$ 才能精确计算，如用蒙特卡洛方法估计，也得采样相当数量的 $$y$$​，这个过程十分消耗算力。

另外，这个解还依赖于我们训练好的完美的 $$R(x,y)$$，因此在论文作者看来还不够方便，毕竟他们的目标是想要跳过后面两个步骤。

## 新的优化目标

将 $$R(x,y)$$ 用两个概率分布已经 $$Z(x)$$ 反过来表示：
$$
\begin{aligned}
R(x,y)&=\beta\log(Z(x)\frac{\pi^*(y|x)}{\pi_\text{ref}(y|x)})\\
&=\beta\log\frac{\pi^*(y|x)}{\pi_\text{ref}(y|x)}+\beta\log Z(x)
\end{aligned}
$$
我们考虑前面训练Reward Model时用到的偏序数据对 $(x,y_c,y_r)$：其中 $$x$$ 为 prompt，$$y_c$$ 表示 chosen 的回复，$$y_r$$ 表示 rejected 的回复。

对于偏序数据的建模，论文中提到了**[Bradley-Terry Model](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model)**。

简单说来，它通过一个定量公式估计了一对比较对象的两种比较结果分别发生的可能性：
$$
P(i \succ j)=\frac{p_i}{p_i+p_j}
$$
其中，$$i \succ j$$ 表示在某个维度上 $$i$$  超越了 $$j$$，$$p_i,p_j$$​ 分别表示两个对象的某种得分（得分必须为正数）。

在建模 $$(x,y_c,y_r)$$ 这一文本问答的偏序数据时，论文采用了下述公式：
$$
\begin{aligned}
P(y_c \succ y_r) &= \frac{\exp R(x,y_c)}{\exp R(x,y_c)+\exp R(x,y_r)}\\
&=\frac{1}{1+\exp [-(R(x,y_c)-R(x,y_r))]}\\
&=\sigma(R(x,y_c)-R(x,y_r))
\end{aligned}
$$
其中 $$\sigma(s)=\frac{1}{1+\exp(-s)}$$ 为 Sigmoid 函数。

考虑到我们在最大化一个概率分布时，一般会去最小化其负对数似然，因此我们可以写出优化目标：
$$
-\log P(y_c \succ y_r) = -\log\sigma(R(x,y_c)-R(x,y_r))
$$
这个目标有一个很大的好处在于，当我们把
$$
R(x,y)=\beta\log\frac{\pi^*(y|x)}{\pi_\text{ref}(y|x)}+\beta\log Z(x)
$$
代入时，会发现正好把那坨 $$Z(x)$$ 消掉了，从而得到下式：
$$
-\log\sigma[\beta(\log\frac{\pi^*(y_c|x)}{\pi_\text{ref}(y_c|x)}-\frac{\pi^*(y_r|x)}{\pi_\text{ref}(y_r|x)})]
$$
这便是最终的优化目标。由此，我们的目标函数只与 $$\pi^*$$ 相关，已经绕开了之前奖励模型的训练过程。

---

综上，本文基本将论文中涉及到的核心过程推导了一遍，构造了一个无需奖励模型的优化目标，相比于PPO算法，DPO算法的最终形式简洁了不少，省去了显式的奖励模型训练过程，在优化过程中用到的模型也少了一半，节省了计算资源。对于该算法的具体实现，~~博主暂时还没有实现~~，博主将在下一篇文章中展开介绍，希望不咕咕咕。