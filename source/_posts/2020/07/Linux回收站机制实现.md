---
title: Linux回收站机制实现
id: 2049
date: 2020-07-19 07:42:42
categories: [瞎捣鼓经历]
tags: ['Linux']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/79de05b70376833abd914e1621713cbc.png
disableNunjucks: true
---

如果你使用过Linux系统，那么一定听说过`rm -rf`命令与其带来的一系列惨剧，“Linux从删库到跑路”说的就是这个命令的梗。

先为Linux萌新科普一下这个命令的含义：`rm`指remove，`-rf`是参数`-r`和`-f`的合写，意为recursive、force，表示递归且无提示地强制删除该文件夹及其下面所有文件或子文件夹，并且在Linux系统下，文件被删了是很难进行恢复的。


因此若不小心跑了`rm -rf /`，就会把根目录全删了，后果难以想象。为了避免这一点，可以这么做：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpeg/b4d6076611f5256c38d75f084086ab07.jpeg)
~~这句命令是说，给<code>rm -rf</code>这句命令一个cd值（即冷却时间），让它不要删的那么快。~~


（好像有什么奇怪的东西混了进来，请Linux萌新自动忽略上图及删除线中的内容）


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/79de05b70376833abd914e1621713cbc.png)
其实我们可以弄一个类似于Windows系统回收站的机制，运行`rm`命令时将文件先移动到回收站内，再定期清理回收站。废话不多说，上操作过程与代码：


1. 随便在哪个文件夹下新建一个文件夹作为回收站（我放在了`/home`下）
2. 随便在哪个文件夹下建立一个shell脚本，用以将文件搬到回收站
3. 打开`~/.bashrc`，写入一个替换，将`rm`替换为运行上一步写的脚本
4. 使刚才的操作立即生效
5. 设置定期清理回收站

以下操作均需要注意把文件路径换成你自己的。

```bash
mkdir /home/.trashbin
vi /home/.remove.sh # 创建新文件并写入以下内容
```


```bash
# 回收站文件夹路径
TRASH_DIR="/home/.trashbin"
for i in $*; do
        # 判断文件或文件夹是否存在
        if [ ! -d $i -a ! -f $i ];then
                echo File or Directory Not Exist!
                exit
        fi
        fileName=`basename $i`
        time=`date +%m-%d-%H:%M:%S`
        mv $i ${TRASH_DIR}/${fileName}.${time}
        # 判断上一条命令是否正常执行,0表示正常
        if [ $? -eq 0 ];then
                echo Move $i to /home/.trashbin/${fileName}.${time}
        fi
done
```


```bash
vi ~/.bashrc # 打开文件并写入以下代码
```


```bash
alias rm='sh /home/.remove.sh'
```

然后执行命令：

```bash
source ~/.bashrc
```

最后设置定期清理回收站：

```bash
sudo vi /etc/crontab # 打开文件并增添一行以下内容
```


```bash
0 0 * * * root  rm -rf /home/.trashbin/*
```

上面这句表示每天00:00以root身份执行一次`rm -rf /home/.trashbin/*`。
