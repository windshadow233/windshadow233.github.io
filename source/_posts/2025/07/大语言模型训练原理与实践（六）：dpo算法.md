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

{% link Direct Preference Optimization, $\text{ar}\chi\text{iv}$​, https://arxiv.org/abs/2305.18290 %}

---

## PPO算法的优化目标

前面提到的PPO算法作为一种强化学习算法，其在大语言模型训练任务上，优化的最终目标实际上是生成token序列的Reward的期望值，假设我们已经有了一个完美的Reward Model：$$R(x,y)$$，表示给定prompt $$x$$ 且模型输出token序列为 $$y$$ 时的Reward，我们可以将优化目标简单写为：
$$
\max_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*\mid x)}[R(x,y)]
$$
不过，考虑到实际训练时需要对模型策略的KL散度做一个约束，我们还要在优化目标中添加一个惩罚项，于是优化目标实际上是：
$$
\max_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*\mid x)}[R(x,y)-\beta\cdot\mathbb{D}_{\text{KL}}(\pi_\theta(*\mid x)\|\pi_\text{ref}(*\mid x))]
$$
上式中，$$\beta$$ 是惩罚系数，$$\pi_{\text{ref}}(y\mid x)$$ 则是参考模型给出的概率分布。$$\mathbb{D}_{\text{KL}}(* \| *) $$ 表示两个概率分布的KL散度，其定义如下：
$$
\mathbb{D}_{\text{KL}}(\pi_1(*\mid x) \| \pi_2(*\mid x)) =\mathbb{E}_{y\sim\pi_1(*\mid x)}[\log\frac{\pi_1(y\mid x)}{\pi_2(y\mid x)}]
$$

## 求解优化目标

将KL散度表达式代入优化目标，得到：
$$
\max_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*\mid x)}[R(x,y)-\beta\cdot\log\frac{\pi_\theta(y\mid x)}{\pi_\text{ref}(y\mid x)}]
$$
将其改为求极小值，除以常数 $$\beta$$，并稍加变形，得到：
$$
\begin{aligned}
&\min_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*\mid x)}[\log\frac{\pi_\theta(y\mid x)}{\pi_\text{ref}(y\mid x)}-\frac{1}{\beta}\cdot R(x,y)]\\
&=\min_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*\mid x)}[\log\frac{\pi_\theta(y\mid x)}{\pi_\text{ref}(y\mid x)\exp(\frac{1}{\beta}\cdot R(x,y))}]
\end{aligned}
$$
这里，论文做了一个操作，强行让对数部分成为一个新的 KL散度，即让分母部分通过一个归一化操作成为概率分布：

定义 $$Z(x)$$：
$$
Z(x) = \sum_{y}\pi_\text{ref}(y\mid x)\exp(\frac{1}{\beta}\cdot R(x,y))
$$
可见 $$Z(x)$$ 是关于 $$x$$ 的函数，并且只与 $$\pi_\text{ref}$$ 、奖励模型有关，与待训练模型 $$\pi_\theta$$ 无关。

将 $$Z(x)$$ 引入优化目标 $$\log$$ 运算的分母，再从外部减去，我们得到：
$$
\min_{\pi_\theta}\mathbb{E}_{x\in X,y\sim\pi_{\theta}(*\mid x)}[\log\frac{\pi_\theta(y\mid x)}{\frac{1}{Z(x)}\pi_\text{ref}(y\mid x)\exp(\frac{1}{\beta}\cdot R(x,y))}-\log Z(x)]
$$
此时，左侧的对数就变成了一个KL散度的形式了，我们记 

$$
\pi^*(y\mid x)\overset{\triangle}{=}\frac{1}{Z(x)}\pi_\text{ref}(y\mid x)\exp(\frac{1}{\beta}\cdot R(x,y))
$$

容易验证 $$\pi^*(*\mid x)$$ 是一个概率分布，因此，上式可以写为：
$$
\min_{\pi_\theta}\mathbb{E}_{x\in X}[\mathbb{D}_\text{KL}(\pi_\theta(*\mid x)\|\pi^*(*\mid x))-\log Z(x)]
$$
显然，由于上式的右侧项 $$\log Z(x)$$ 与 $$\pi_\theta$$ 无关，我们可以忽略它。又从KL散度的性质得到，当且仅当
$$
\pi_\theta(y\mid x) = \pi^*(y\mid x)=\frac{1}{Z(x)}\pi_\text{ref}(y\mid x)\exp(\frac{1}{\beta}\cdot R(x,y))
$$
时，KL散度达到最小值0。

看上去我们已经直接求出了目标的显式解，但可惜的是，这个 $$Z(x)$$ 并不好计算，因为它需要对于一个prompt $$x$$，遍历所有Reference Model可能产生的 $$y$$ 才能精确计算，如用蒙特卡洛方法估计，也得采样相当数量的 $$y$$​，这个过程十分消耗算力。

另外，这个解还依赖于我们训练好的完美的 $$R(x,y)$$，因此在论文作者看来还不够方便，毕竟他们的目标是想要跳过后面两个步骤。

## 新的优化目标

将 $$R(x,y)$$ 用两个概率分布以及 $$Z(x)$$ 反过来表示：
$$
\begin{aligned}
R(x,y)&=\beta\log(Z(x)\frac{\pi^*(y\mid x)}{\pi_\text{ref}(y\mid x)})\\
&=\beta\log\frac{\pi^*(y\mid x)}{\pi_\text{ref}(y\mid x)}+\beta\log Z(x)
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
R(x,y)=\beta\log\frac{\pi^*(y\mid x)}{\pi_\text{ref}(y\mid x)}+\beta\log Z(x)
$$
代入时，会发现正好把那坨 $$Z(x)$$ 消掉了，从而得到下式：
$$
-\log\sigma[\beta(\log\frac{\pi^*(y_c\mid x)}{\pi_\text{ref}(y_c\mid x)}-\frac{\pi^*(y_r\mid x)}{\pi_\text{ref}(y_r\mid x)})]
$$
这便是最终的优化目标。由此，我们的目标函数只与 $$\pi^*$$ 相关，已经绕开了之前奖励模型的训练过程。

---

综上，我们基本将论文中涉及到的核心过程推导了一遍，构造了一个无需奖励模型的优化目标，相比于PPO算法，DPO算法的最终形式简洁了不少，省去了显式的奖励模型训练过程，在优化过程中用到的模型也少了一半，节省了计算资源。

## 代码实现

### 数据集

偏好数据集仍然使用了与之前相同的[OpenLLMAI/comparison_data](https://huggingface.co/datasets/OpenLLMAI/comparison_data)，数据集的定义方法与前面训练Reward Model时类似，不过为了便于后续计算损失函数，这里我额外算了一个`label_mask`，用来屏蔽prompt和padding部分，防止这部分参与loss的计算。

```python
def build_inputs(self, prompt_ids, response_ids):
    input_ids = prompt_ids + [self.tokenizer.bos_token_id] + response_ids
    input_ids = input_ids[:self.max_length]
    if len(input_ids) < self.max_length:
        input_ids += [self.tokenizer.eos_token_id]
    bos_pos = input_ids.index(self.tokenizer.bos_token_id)
    label_mask = [0] * (bos_pos + 1) + [1] * (len(input_ids) - bos_pos - 1)
    pad_len = self.max_length - len(input_ids)
    if pad_len > 0:
        input_ids += [self.tokenizer.pad_token_id] * pad_len
        label_mask += [0] * pad_len
    attention_mask = [1] * (self.max_length - pad_len) + [0] * pad_len
    return input_ids, attention_mask, label_mask
```

计算 $$\pi(y\mid x)$$ ，采用了取对数概率（`logits`）然后求和的方式，不过在计算得到了`logits`之后，需要先用前面计算得到的`label_mask`对prompt和padding部分做一个屏蔽，再进行求和：

```python
def masked_sum(values, labels_mask):
    return (values * labels_mask[:, :-1]).sum(-1).squeeze(-1)
```

### 训练

核心部分的代码如下：

```python
for step, batch in tqdm(enumerate(dataloader, 1), desc=f"Epoch {epoch + 1}/{num_epochs}", dynamic_ncols=True, total=len(dataloader)):
    input_ids = batch['input_ids']
    label_mask = batch.pop('label_mask')
    with torch.no_grad():
        logits_ref = model_ref(**batch).logits
        log_prob_ref = calculate_action_logsoftmax(logits_ref[:, :-1], input_ids[:, 1:])
        log_prob_ref = filter_mask(log_prob_ref, label_mask)
        log_prob_ref_chosen, log_prob_ref_rejected = log_prob_ref.chunk(2, dim=0)
    with accelerator.accumulate(model):
        logits = model(**batch).logits
        log_prob = calculate_action_logsoftmax(logits[:, :-1], input_ids[:, 1:])
        log_prob = filter_mask(log_prob, label_mask)
        log_prob_chosen, log_prob_rejected = log_prob.chunk(2, dim=0)
        
        reward_chosen = log_prob_chosen - log_prob_ref_chosen
        reward_rejected = log_prob_rejected - log_prob_ref_rejected
        loss = -logsigmoid(beta * (reward_chosen - reward_rejected)).mean()

        accelerator.backward(loss)
        if accelerator.sync_gradients:
            accelerator.clip_grad_norm_(lora_parameters, 1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()
```

在每个训练 step 中，执行如下操作：

1. 计算参考模型 `model_ref` 的对数概率 `log_prob_ref`。
2. 计算待训练模型 `model` 的 `log_prob`。
3. 计算两个 Reward：分别对 `chosen` 和 `rejected` 样本计算 `reward`（即与 reference model 输出对数概率的差值）。
4. DPO loss：使用 `-logsigmoid(beta * (r_c - r_r))` 作为 loss，其中 `beta` 是温度系数。
5. 反向传播、梯度裁剪、迭代。

### 训练效果

最初尝试训练时遇到了一些问题：

1. 一开始学习率设太高了（5e-5），结果模型在训练中后期迅速崩坏，什么都不输出（摆烂是吧？？？）。遂将学习率调至1e-6，问题解决。
2. 由于我在之前做SFT时的数据量不是很大，如果这里将全部数据（大约10万条）全部用于训练，模型会忘记如何正常回答问题，对于所有问题都一视同仁地拒绝回答（或许边DPO边SFT可以缓解这个问题）。于是，取出25000-30000条数据用于训练即可。

分别观察Chosen Reward、Rejected Reward以及Loss的趋势：

<img src="https://blogfiles.oss.fyz666.xyz/png/ba3ca2b2-3a86-49ff-b0f5-62030232922c.png" style="zoom:50%;" />

训练过程相比于PPO更加稳定，模型也逐渐能够给出符合我们希望的正向价值观的输出，下面是几个DPO模型与SFT模型的面对诱导性问题和正常问题的回答对比示例：

- 诱导性问题：

![](https://blogfiles.oss.fyz666.xyz/png/43e0d57a-8205-4bf5-941b-90d0bc6cf360.png)

![](https://blogfiles.oss.fyz666.xyz/png/08c2fe0b-5b64-4e9d-ba10-7b782ac06dbd.png)

- 正常问题

![](https://blogfiles.oss.fyz666.xyz/png/975e2a3f-400b-4e03-a9df-feae9379227c.png)

![](https://blogfiles.oss.fyz666.xyz/png/e81257b1-e241-4cf3-b8a7-146aa84ce94e.png)

可以看出，DPO 训练后的模型在面对诱导性问题时表现出更强的拒绝能力，而在正常问答中依然能保持良好响应，整体效果令人满意。

---

本文涉及的完整代码已整理并开源，详见：

{% link tiny-llm-training, GitHub, https://github.com/windshadow233/tiny-llm-training/ %}
