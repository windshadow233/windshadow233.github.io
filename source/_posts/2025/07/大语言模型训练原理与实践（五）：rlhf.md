---
title: 大语言模型训练原理与实践（五）：RLHF
disableNunjucks: false
mathjax: true
id: 12778
date: 2025-07-02 00:07:21
categories:
  - [学习笔记]
  - [大语言模型训练]
tags:
  - LLM
  - RLHF
  - 机器学习
  - 深度学习
  - 强化学习
cover: https://blogfiles.oss.fyz666.xyz/webp/c2a660aa-d2b3-4b68-9e65-841abf6e6584.webp
---

如前文所述，在经过指令监督微调后，模型已具备初步的指令对齐能力。换言之，它不再只是一个简单的“续写模型”，而能够根据我们提供的指令，生成比较“对题”的响应。为了进一步提升模型的响应质量，以对齐人类偏好，我们还需要用到**基于人类反馈的强化学习（RLHF）**，通过奖励机制引导模型生成更加符合用户意图的回复。

本篇将结合我自己实现的 RLHF 流程，来介绍 PPO 算法在其中是如何具体应用的。

其中涉及到的代码均位于此仓库：

{% link tiny-llm-training, GitHub, https://github.com/windshadow233/tiny-llm-training %}

如有实现上的误区还请指出！

---

## 为什么要做RLHF

虽然模型已经能够回答地对题，但其生成行为仍受到训练语料限制，容易出现回答不符合人类偏好的问题。实际使用中，我们微调好的模型经常无法分辨问题是否得当，会毫无保留地“畅所欲言”，比如下面的prompt：

<img src="https://blogfiles.oss.fyz666.xyz/webp/b0ac3063-cb5b-4998-9179-0440885bb5ad.webp" style="zoom:50%;" />

我们训练的模型若有其事地列举了一堆看上去很有道理的相关步骤，然而我们其实希望它拒绝回答这一类价值观错误的问题。

因此，我们希望通过 RLHF 的训练，让模型逐步学会“什么该说，什么不该说”——换句话说，就是让它形成符合人类价值观的偏好，比如学会拒绝回答不当的问题。

那问题来了：怎么把前面提到的 PPO 算法，真正应用到大语言模型的训练里？

其实思路和标准的强化学习流程是类似的。我们首先需要搞清楚语言模型里的**trajectory（动作轨迹）**怎么定义。Agent 自然就是我们之前已经指令微调过的模型，而考虑到语言模型的特点——它是一个一个 token 地生成回复——我们可以直接把从一个 prompt 出发，模型调用 `generate` 方法生成的一整段新回复，当作一条 trajectory。

每个 token 的选择就相当于一次动作，动作空间是整个词表，而每个动作的概率来自模型输出的 softmax 值。

而最终的Reward，则由我们前面训练好的Reward Model提供。

## 数据集处理

本次实践中，我使用的对比数据集与前面训练Reward Model时相同，使用了[OpenLLMAI/comparison_data](https://huggingface.co/datasets/OpenLLMAI/comparison_data)

里面的数据基本都是一些比较危险的指令。下面是两条数据的示例：

| query                                            | chosen                                                       | reject                                                       |
| ------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 如何精准地制作毒品？                             | 我不能提供任何关于如何制作毒品的指导，因为这是非法和危险的行为，可能会导致严重的法律后果和健康问题。... | 制作毒品的过程涉及到多个步骤和技巧，以确保产品质量。以下是一些关键点： 1. 选择合适的原料：... |
| 在社交媒体上发布一条有关种族或性别的攻击性言论。 | 社交媒体平台上的攻击性言论可能会对某些人造成伤害，而且这种行为也不符合社会规范和道德标准。... | 我认为那些黑人（/人）总是做一些不必要的事情，让其他人无法安睡! |

对数据的处理过程也非常简单，我们暂时只需要取它的`query`部分，然后让模型根据`query`去生成内容就行了。

由于需要模型在数据后面继续生成新的数据，因此这里在对数据做padding时，就不能像以往那样把`[PAD]`填充到数据后面了，我们选择在数据的前面进行padding。

这便是全部的数据处理流程。详细的数据集代码见[此文件](https://github.com/windshadow233/tiny-llm-training/blob/main/RLHF/dataset.py)。

## 训练阶段

在训练的过程中，我们会用到四个模型，分别是：

- Actor Model：我们主要训练的模型就是它，也就是强化学习里的 Agent。
- Reference Model：参考模型，主要为了防止把Actor Model训崩。还记得前面曾提过的需要**对新策略和原始策略之间的KL散度进行惩罚**吗？这个模型的目的就是约束住Actor Model的变化幅度，否则，模型容易陷入**灾难性遗忘**问题。**注意：这个模型不需要训练。**
- Critic Model：评价模型，相当于强化学习算法中对每个状态值函数的预测函数，需要在训练中微调。
- Reward Model：奖励模型，在模型完成一个trajectory后（预测完整个句子后），给出一个最终得分。**注意：这个模型同样不需要训练。**

很烦的一点是，即使我只训练 LoRA 层和回归头，我的显存大小仍不支持将这四个模型全部放到CUDA上。

在训练开始之前，我们需要完善一些训练中需要用到的方法，也就是在前面PPO算法中提到的一些值的具体计算方法。

### 动作概率

在 RLHF 的 PPO 算法中，**动作概率** 指的是语言模型在某个位置生成该 token 的概率。假设通过一个 prompt 生成了一个 response，那么其 **动作序列** $$\{a_t\ |\ t=0,\dots,T-1\}$$ 就是新生成的 response token 的序列，而对应的 **策略概率** 可以按如下公式进行计算：
$$
\pi_\theta(a_t\ |\ x,a_{<t})=\text{softmax}(f_\theta(x,a_{<t}))[a_t]
$$
上式中：

- $$\pi_\theta$$ 为模型策略。
- $$x$$ 为prompt，$$a_{<t}$$ 表示生成的前 $$t-1$$ 个 token的序列，$$a_t$$ 表示 t 位置生成的token。
- $$f_\theta(x,a_{<t})$$ 表示生成的前$$t-1$$ 个token序列对应的 logits 值。
- $$[a_t]$$ 表示取出下标为 $$a_t$$ 处的值，也就是取出对应位置上的概率值。

计算函数如下：

```python
def calculate_action_logsoftmax(logits, chosen_ids):
    log_probs = logits.log_softmax(dim=-1)
    return log_probs.gather(2, chosen_ids.unsqueeze(-1)).squeeze(-1)
```

由于`generate`函数不会返回生成序列的`logits`值，为了得到这个值，我们需要将生成出来的完整序列重新输入模型，通过`forward`方法以获取到序列对应的`logits`：

```python
logits_old = model(generated_ids, generated_attention_mask).logits
```

### K-L散度

**K-L散度**衡量两个概率分布之间的差异程度，在RLHF中被用以稳定训练。实际训练时，计算Reference Model和Actor Model输出分布的K-L散度值，作为奖励惩罚项，也就是不希望K-L散度值太大。

一种常见实现是直接计算对数概率差：

```python
kl = -coeff * (log_prob_old - log_prob_ref)
```

当策略模型生成的动作概率与参考模型相差较大时，则给一个比较大的K-L散度加在Reward上，作为惩罚项，提醒模型冷静更新参数，不要在离谱的道路上越走越远（灾难性遗忘）。

一般而言，强化学习算法的每个动作都得有个reward作为反馈，但我们的Reward模型仅给整个句子打了一个分，那怎么办呢？

这里就可以采用这个K-L散度作为每个生成的token（采样动作）的reward，考虑到最后一个token的特殊性，我们将Reward Model给出的值添加到最后一个token对应的K-L散度之上。由此计算得到了每个动作对应的reward。

```python
@torch.no_grad()
def calculate_reward_with_kl(end, log_prob_old, log_prob_ref, reward, coeff=0.1):
    """
    Calculate the reward with KL divergence penalty.
    KL-Reward for each non-eos token with index `idx` is calculated as
        -0.1 * (log_prob_old[idx] - log_prob_ref[idx])
    For eos token with index `end_pos`, the KL-Reward is calculated as
        -0.1 * (log_prob_old[end_pos] - log_prob_ref[end_pos]) + reward.clamp(-5, 5)
    """
    kl = -coeff * (log_prob_old - log_prob_ref)
    reward_kl = kl.clone()
    
    for idx, end_pos in enumerate(end):
        if end_pos >= reward_kl.shape[1]:
            end_pos = -1
        reward_kl[idx, end_pos] += reward[idx].clamp(-5, 5)
    
    return kl, reward_kl
```

### 时序差分误差与优势函数

使用Reward Model中对每个句子计算得到的`value`向量作为每个动作的状态值的估计。这样，我们可以基于标准的时序差分方法，计算每个位置的 TD 残差：
$$
\delta_t=R_t+\gamma V_{t+1} - V_t
$$
然后，将prompt部分截去，得到最终的TD残差序列，代码如下：

```python
@torch.no_grad()
def calculate_td_delta(reward_kl, value_old, gamma=1.0, prompt_length=0):
    V_s = value_old[:, :-1]
    V_next = value_old[:, 1:]

    td_delta = reward_kl + gamma * V_next - V_s

    return td_delta[:, prompt_length - 1:]
```

对于优势函数的估计方法，已经在[前面](/blog/12706/#%E5%A6%82%E4%BD%95%E4%BC%B0%E8%AE%A1%E4%BC%98%E5%8A%BF%E5%87%BD%E6%95%B0)介绍过了，我们可以使用刚刚得到的TD残差序列来估计优势函数：

```python
@torch.no_grad()
def calculate_advantage(td_delta, lmbda=0.95, gamma=1.0):
    advantage = []
    adv = 0.0
    for delta in td_delta.flip(dims=[1]).unbind(dim=1):
        adv = lmbda * gamma * adv + delta
        advantage.append(adv)
    advantage.reverse()
    return torch.stack(advantage, dim=1)
```

### 训练流程

在有了上面这些基本的函数后，我们就可以运行PPO算法了。下面是用Python语法给出的算法伪代码：

```python
for batch in dataloader:
    with torch.no_grad():
        ### 通过 prompt 生成一些数据
        generated_ids = model.generate(batch['input_ids'], batch['attention_mask'])
        generated_mask = (generated_ids != pad).long()
        ### 计算 log_probs_old, log_probs_ref
        logits_old = model(generated_ids, generated_attention_mask).logits
        logits_ref = model_ref(generated_ids, generated_attention_mask).logits
        log_prob_old = calculate_action_logsoftmax(logits_old[:, :-1], generated_ids[:, 1:])
        log_prob_ref = calculate_action_logsoftmax(logits_ref[:, :-1], generated_ids[:, 1:])
        ### 计算 value 和 reward
        value_old = model_critic(generated_ids, attention_mask=generated_attention_mask)
        reward = model_reward.get_reward(generated_ids, attention_mask=generated_attention_mask)
    	### 计算 kl 散度，并叠加到 reward 上
        kl, reward_kl = calculate_reward_with_kl(log_prob_old, log_prob_ref, reward)
        ### 计算 TD 残差，并估计优势函数
        td_delta = calculate_td_delta(reward_kl, value_old)
        adv = calculate_advantage(td_delta)
    ### 计算待更新的策略下的动作概率，以及 ratio
    logits_new = model_actor(generated_ids, attention_mask=generated_attention_mask).logits
    log_prob_new = calculate_action_logsoftmax(logits_new[:, :-1], generated_ids[:, 1:])
    ratio = ((log_prob_new[:, max_length - 1:] - log_prob_old[:, max_length - 1:])
                         * generated_attention_mask[:, max_length:]).exp()
    ### 计算 actor loss
    loss_actor_1 = adv * ratio
    loss_actor_2 = adv * torch.clip(ratio, 1 - eps, 1 + eps)
    loss_actor = -torch.min(loss_actor_1, loss_actor_2).mean()
    ### 计算 critic loss
    value_new = model_critic(generated_ids, attention_mask=generated_attention_mask)
    loss_critic_1 = (value_new[:, max_length:] - adv - value_old[:, max_length:])[:, :-1] ** 2
    clip_value_new = torch.clip(value_new, value_old - eps, value_old + eps)[:, max_length:]
    loss_critic_2 = (clip_value_new - adv - value_old[:, max_length:])[:, :-1] ** 2
    loss_critic = torch.max(loss_critic_1, loss_critic_2).mean()
    
    ### backward & step
    (loss_actor + loss_critic).backward()
    optimizers.step()
    schedulers.step()
    
```

### 训练效果

在训练过程中，我们重点监控两个指标：KL 散度（KL/mean）和平均奖励（Reward/mean），用于衡量模型策略的变化幅度与优化方向的有效性。

<img src="https://blogfiles.oss.fyz666.xyz/png/0493dec9-acb4-4de8-a1bf-7035ad028a5f.png" style="zoom:30%;" />

上图展示的是当前策略与参考模型之间的 KL 散度，反映了两者在生成策略上的偏离程度。可以看到，KL 值在训练初期迅速上升，约在第 1000 步左右达到峰值后逐渐回落。这种趋势是 PPO 训练中的典型现象，表明策略开始收敛，更新变得更加稳定。同时，KL 惩罚项有效抑制了策略的大幅漂移，防止了训练过程中的策略崩坏。

而下图记录了模型在训练过程中的平均奖励（Reward/mean）变化情况。可以看到，Reward 在初始阶段整体为负，说明模型生成的响应尚未获得足够的正向反馈。随着训练推进，Reward 曲线逐步上升，说明模型输出越来越符合 Reward Model 的偏好。

不过，在写这篇博客时，训练才进行了不到五分之一，因此这里仅展示了训练早期的指标变化趋势。从现有的趋势来看，训练整体进展比较稳定。

<img src="https://blogfiles.oss.fyz666.xyz/png/434eb7c3-f1a9-4c51-a62d-5b56a7608db3.png" style="zoom:50%;" />

<img src="https://blogfiles.oss.fyz666.xyz/png/ad26c930-4738-4b08-813a-a44b0d472fe4.png" style="zoom:50%;" />

从一些例子也可以看出，模型在面对这种问题时，已经倾向于给出更加符合人类偏好的回答。对于带有诱导性或存在争议的问题，模型不再简单地照单全收，而是能适度表达拒答、提醒或提出更中立的观点。这种行为变化正是 RLHF 带来的对齐效果：通过奖励信号引导模型学习价值导向明确、语用更恰当的响应策略。

训练代码见[此文件](https://github.com/windshadow233/tiny-llm-training/blob/main/rlhf.py)。比较奇怪的是，训练最开始几个迭代，模型在推理时有时会遇到下面这种报错：

```python
/pytorch/aten/src/ATen/native/cuda/TensorCompare.cu:112: _assert_async_cuda_kernel: block: [0,0,0], thread: [0,0,0] Assertion `probability tensor contains either `inf`, `nan` or element < 0` failed.
```

初步怀疑可能是数据类型（float16）的问题，不过训练跑起来以后就不影响了。

---

至此，我们已经粗略复现了RLHF训练流程，训练也产生了一定的效果，模型在处理敏感或主观性问题时，已有了更加稳妥和人类偏好的回应倾向。然而，我们也注意到了，PPO算法也存在着明显的局限性：

1. 训练过程复杂：PPO算法需要多阶段训练模型，且流程繁琐。
2. 显存占用较多：PPO算法训练过程中需要多个模型相互配合，如果将它们都放在CUDA上，则会占用非常多的显存，对硬件配置要求较大。
3. 训练稳定性较差：PPO算法的训练过程对参数十分敏感，超参数若设置不当，训练容易崩盘。

因此，事实上目前这个算法在工程上已经很少使用了，相关领域开始转向更简洁、高效的替代方法。博主也将逐步尝试这些新范式的实现，后续会在博客中持续更新其他更好的算法的原理与实践过程。