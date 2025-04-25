---
title: Hackergame 2024 题解（零）
disableNunjucks: false
mathjax: false
id: 12095
date: 2024-11-09 13:10:19
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2024
cover: https://blogfiles.oss.fyz666.xyz/webp/c49ffab9-5549-4d5b-b22e-287c109dfdeb.webp
swiper_index: 1
description: Hackergame 2024，再次喜提二等奖～
---

经过一个礼拜的科研摸鱼，Hackergame 2024 终于结束了（再不结束就打不动了）。相比于去年的题，今年的题总体难度似乎更高，最终拿下总榜26（比去年翻了个倍）校内第4（也翻了个倍...），喜提二等奖。

<img src="https://blogfiles.oss.fyz666.xyz/png/c8fe2a86-0135-4d8a-b6ac-ee96f0b9144d.png" alt="image-20241109221945024" style="zoom:50%;" />

搞错了，上面这张是最高瞬时排名。

<img src="https://blogfiles.oss.fyz666.xyz/png/2a3d517b-bdd5-4710-8633-43cb03af4eb9.png" alt="image-20241109222029410" style="zoom:65%;" />

{% link 本次比赛的官方存档,GitHub,https://github.com/USTC-Hackergame/hackergame2024-writeups %}

## 题解

下面是这次比赛成功解出的题：

- [Hackergame 2024 题解（一）](/blog/12160/)  

  签到、喜欢做签到的 CTFer 你们好呀、猫咪问答（Hackergame 十周年纪念版）、打不开的盒、每日论文太多了！、比大小王、旅行照片 4.0、不宽的宽字符、PowerfulShell、Node.js is Web Scale、PaoluGPT、强大的正则表达式（除Hard）

- [Hackergame 2024 题解（二）](/blog/12168/)  

  惜字如金 3.0（除题目 C）、优雅的不等式、无法获得的秘密、链上转账助手（除转账再失败）、不太分布式的软总线

- [Hackergame 2024 题解（三）](/blog/12196/)

  动画分享、关灯（除Impossible）、禁止内卷、哈希三碰撞（三碰撞之一）、零知识数独（除无解之谜）、先104🤣」（「行吧就算标题可以很长但是 flag 一定要短点」）

## 没解出的题

这里分享我认为最可惜的一道题：**ZFS文件恢复**。我在这道题上花了不少时间，最终却一分也没有拿到。

拿到zfs镜像以后首先注意到zfs有快照功能，但进到快照路径下发现里面什么也没有，这是怎么回事呢？难道没有开快照？经过查找发现确实有这种可能，我直接非常傻逼地认为这题的考点和快照无关（毕竟做的人确实不多，显然不可能看到快照就找到flag），开始考虑另一种可能，即文件没进快照就被删除了，但还没有被覆盖。

由于`flag2.sh`这个文件的内容只需要`grep`一下就能出，我接下来开始在镜像里疯狂找`mtime`和`atime`这两个文件元数据，因为如果文件还没被覆盖的话，元数据应该也还在吧。

然后我找了很多数据恢复软件，似乎没有一个能work的（其实就是还没找全，用UFS Explorer Professional Recovery就能直接出这两个元数据），遂考虑用`zdb`来分析一下镜像，到了这里，其实我已经很接近真相了，我研究了很久`zdb`怎么用，最后打出这样两条命令：

```bash
$ sudo zdb -ddddd -e hg2024/data | grep atime
WARNING: ignoring tunable zfs_arc_max (using 4148263936 instead)
	atime	Wed Oct 23 21:37:22 2024
$ sudo zdb -ddddd -e hg2024/data | grep mtime
WARNING: ignoring tunable zfs_arc_max (using 4148263936 instead)
	mtime	Wed Oct 23 21:37:22 2024
```

执行了下发现只找到了`Wed Oct 23 21:37:22 2024`，而这个时间我可太熟悉了，就是这个镜像的制作时间，似乎没有任何其他有价值的信息，遂放弃。赛后发现应该去分析快照：

```bash
$ sudo zdb -ddddd -e hg2024/data@mysnap | grep atime
WARNING: ignoring tunable zfs_arc_max (using 4148263936 instead)
	atime	Thu Mar  9 23:56:50 2006
	atime	Mon Nov 10 04:49:03 2036
	atime	Wed Oct 23 21:37:22 2024
$ sudo zdb -ddddd -e hg2024/data@mysnap | grep mtime
WARNING: ignoring tunable zfs_arc_max (using 4148263936 instead)
	mtime	Sun May 29 03:49:29 1977
	mtime	Sat Jan 12 01:18:00 2013
	mtime	Wed Oct 23 21:37:22 2024
```

我这才发现自己一开始就忽略了一种可能：就是这两个文件是先进了快照再被删除的。暂且不论这种解释是否正确，但如果当时想到了，我一定会去试一下，这样flag2就出了。由于被删除的文件的元数据被我翻到了，接下来，我自然会想到flag1的相关信息就藏在`atime`和`mtime`的附近，问问GPT再稍微研究一下肯定就出了。现在想来，实在遗憾。

## 总结

今年的题难度有所提升，但我的总分居然和去年差不多（不过题目的总分也多了）。而且Binary神奇的没有爆0（出了哈希三碰撞的第一小问），实乃一大长进！

有一些体验不错的题，比如Powerfulshell、动画分享、哈希三碰撞的第一问等，这些题在解的过程中能明显感觉到正在一步一步走向胜利，方向感较强，学到了东西也给了很大的成就感。

而还有一些题虽然没解出来，但十分适合作为一个方向的入门，例如强大的正则表达式，可以促使我稍微学一学DFA。

不过话说回来，这次比赛居然没有出现涉及到随机数预测的题（大概）因为前段时间的GeekGame结束后稍微学了一点，还想着能够试试水，结果一题没有，~~成功把学的全忘了~~。

总之，今年比赛收获颇丰，还成功在校内第一的位置上待了十几个小时，明年的比赛，~~大概率我就要坐校外选手那桌了~~ 博士毕业失败，还能坐校内那桌（😊），作为一个从19年开始打这个比赛的“老选手”，其实还是比较不舍的~~（拿不到奖品了）~~，希望Hackergame越办越好！