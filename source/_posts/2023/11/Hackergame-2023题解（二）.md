---
title: Hackergame 2023题解（二）
id: 8782
date: 2023-11-04 05:42:12
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2023
cover: https://blogfiles.oss.fyz666.xyz/jpg/6f00f091-9b5b-42c9-aebd-6635e13518a3.jpg
disableNunjucks: false
---

本文是Hackergame 2023题解的第二部分。



## JSON ⊂ YAML?
{% hideToggle 查看题面 %}
{% note primary simple %}

你知道吗？Hackergame 出题时，每道题都需要出题人用 YAML 格式写下题目的关键信息。然而，每年总有一些出题人在编写 YAML 文件时被复杂的语法规则弄得头疼不已。


这天小 Z 又找到小 W 说：「我昨天写 YAML 时，又花了半天研究 YAML 的规范，YAML 好难啊！」


小 W 惊讶道：「怎么会有人不会写 YAML 呢？只要你会写 JSON 就会写 YAML 呀，因为任何合法的 JSON 本身就是合法的 YAML。」


小 Z 听闻这番言论后当场表示怀疑，立刻说出了一个字符串，JSON 和 YAML 解析出的含义存在差异。小 W 研究了一番才发现，这是因为很多主流的 YAML 库仍然是 YAML 1.1 的，它没有这个性质。他不得不承认：「好吧，这个性质只适用于 YAML 1.2。」


小 Z 笑了：「别提 YAML 1.2 了，它遇到合法的 JSON 都有可能报错。」



[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/JSON%20%E2%8A%82%20YAML/files/yaml_vs_json.py)

{% endnote %}
{% endhideToggle %}
### JSON ⊄ YAML 1.1


第一问需要找到一个JSON字符串，使其被json解析的结果与被yaml1.1解析的结果不同。


通过调教ChatGPT，我们得到重要的信息：



> 我：yaml1.1在解析json字符串时和json.loads有什么不同？
> 
> 
> ChatGPT：Based on the information available from the search results: YAML 1.2 vs. 1.1 in Relation to JSON: YAML 1.2 is a superset of JSON, meaning any valid JSON file is also a valid YAML file. However, the YAML 1.1 specification, which has significant library support, doesn't explicitly mention JSON. While most valid JSON files are valid YAML 1.1 files, there might be some exceptions​1​. 
> 
> 
> Number Syntax: The YAML 1.1 specification is stricter about the syntax of numbers compared to JSON. For example, while "1e2" is considered a valid number in JSON, YAML 1.1 requires it to be written as "1.0e+2". If not written in this format, the YAML 1.1 parser will interpret it as a string rather than a number


同时它还给出了[来源链接](https://john-millikin.com/json-is-not-a-yaml-subset#:~:text=The%20YAML%201,treat%20it%20as%20a%20string)。由此，我们只要构造一个：



```json
{"number": 1e3}
```

### JSON ⊄ YAML 1.2


搜到一条[链接](https://yaml.org/spec/1.2.1/#:~:text=Both%20JSON%20and%20YAML%20aim,2)，说明了yaml1.2和JSON的一些区别，例如：



> JSON's [RFC4627](http://www.ietf.org/rfc/rfc4627.txt) requires that [mappings](https://yaml.org/spec/1.2.1/#mapping//) [keys](https://yaml.org/spec/1.2.1/#key//) merely “SHOULD” be [unique](https://yaml.org/spec/1.2.1/#equality//), while YAML insists they “MUST” be. Technically, YAML therefore complies with the JSON spec, choosing to treat duplicates as an error. In practice, since JSON is silent on the semantics of such duplicates, the only portable JSON files are those with unique keys, which are therefore valid YAML files.


因此可以构造：



```json
{"key": "v1", "key": "v2"}
```

## Git? Git!
{% hideToggle 查看题面 %}
{% note primary simple %}
「幸亏我发现了……」马老师长吁了一口气。


「马老师，发生甚么事了？」马老师的一位英国研究生问。


「刚刚一不小心，把 flag 提交到本地仓库里了。」马老师回答，「还好我发现了，撤销了这次提交，不然就惨了……」


「这样啊，那太好了。」研究生说。


马老师没想到的是，这位年轻人不讲武德，偷偷把他的本地仓库拷贝到了自己的电脑上，然后带出了实验室，想要一探究竟……



[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/Git%20Git!/files/ML-Course-Notes.zip)

{% endnote %}
{% endhideToggle %}
提交虽然撤销了，但可以在log中看到记录：



```bash
$ git reflog
ea49f0c (HEAD -> main) HEAD@{0}: commit: Trim trailing spaces
15fd0a1 (origin/main, origin/HEAD) HEAD@{1}: reset: moving to HEAD~
505e1a3 HEAD@{2}: commit: Trim trailing spaces
15fd0a1 (origin/main, origin/HEAD) HEAD@{3}: clone: from https://github.com/dair-ai/ML-Course-Notes.git
```

然后一条一条查并寻找flag，直到：



```bash
$ git show 505e1a3 | grep flag
+  <!-- flag{TheRe5_@lwAy5_a_R3GreT_pi1l_1n_G1t} -->
```

## HTTP 集邮册
{% hideToggle 查看题面 %}
{% note primary simple %}

> 「HTTP 请求一瞬间就得到了响应，但是，HTTP 响应的 status line、header 和 body 都是确实存在的。如果将一个一个 HTTP 状态码收集起来，也许就能变成……变成……变成……」 
> 
> 
> 「flag？」 
> 
> 
> 「就能变成 flag！」


本题中，你可以向一个 nginx 服务器（对应的容器为默认配置下的 nginx:1.25.2-bookworm）发送 HTTP 请求。你需要获取到不同的 HTTP 响应状态码以获取 flag，其中：



- 获取第一个 flag 需要收集 5 种状态码；
- 获取第二个 flag 需要让 nginx 返回首行无状态码的响应（不计入收集的状态码中）；
- 获取第三个 flag 需要收集 12 种状态码。

关于无状态码的判断逻辑如下：




```python
crlf = buf.find(b"\r\n")
if buf.strip() != b"":
    try:
        if crlf == -1:
            raise ValueError("No CRLF found")
        status_line = buf[:crlf]
        http_version, status_code, reason_phrase = status_line.split(b" ", 2)
        status_code = int(status_code)
    except ValueError:
        buf += "（无状态码）".encode()
        status_code = None
```

{% endnote %}
{% endhideToggle %}

### 12个状态码


边翻HTTP状态码全集边问ChatGPT，在后者的帮助下找到了12个状态码，以下是按我收集的顺序列出的状态码及其payload：


- 200:  

{% hideToggle Payload %}

```plaintext
GET / HTTP/1.1\r\n
Host: example.com\r\n\r\n
```

{% endhideToggle %}

- 405:  

{% hideToggle Payload %}

```plaintext
FLAG / HTTP/1.1\r\n
Host: example.com\r\n\r\n
```

{% endhideToggle %}

- 404:  

{% hideToggle Payload %}

```plaintext
GET /114514 HTTP/1.1\r\n
Host: example.com\r\n\r\n
```

{% endhideToggle %}

- 505:  

{% hideToggle Payload %}

```plaintext
GET / HTTP/2.0\r\n
Host: example.com\r\n\r\n
```

{% endhideToggle %}

- 400:  

{% hideToggle Payload %}

```plaintext
GET / FLAG/1.1\r\n
Host: example.com\r\n\r\n
```

{% endhideToggle %}

- 413:  

{% hideToggle Payload %}

```plaintext
POST / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 10000000\r\n\r\n
```

{% endhideToggle %}

- 206:  

{% hideToggle Payload %}

```plaintext
GET / HTTP/1.1\r\n
Host: example.com\r\n
Range: bytes=0-999\r\n\r\n
```

{% endhideToggle %}

- 100:  

{% hideToggle Payload %}

```plaintext
GET / HTTP/1.1\r\n  
Host: example.com\r\n  
Expect: 100-continue\r\n  
Content-Length: 1234\r\n\r\n
```

{% endhideToggle %}

- 414:  

{% hideToggle Payload %}

```plaintext
GET /?q=aaaaaaaa...aaa(一堆a) HTTP/1.1\r\n
Host: example.com\r\n\r\n
```

{% endhideToggle %}

- 416:  

{% hideToggle Payload %}

```plaintext
GET / HTTP/1.1\r\n
Host: example.com\r\n
Range: bytes=1000-2000\r\n\r\n
```

{% endhideToggle %}

- 412:  

{% hideToggle Payload %}

```plaintext
GET / HTTP/1.1\r\n
Host: example.com\r\n
If-Match: "outdated-etag"\r\n\r\n
```

{% endhideToggle %}

- 304:  

{% hideToggle Payload %}

先随便发一个正常的GET给/，响应200后取到ETag，然后发送下述payload，将其中的`<ETag>`替换为前面取到的值。

```plaintext
GET / HTTP/1.1\r\n
Host: example.com\r\n
If-None-Match: <ETag>\r\n\r\n
```

{% endhideToggle %}

听说有人爆出了13个，等看题解。


### 无状态码


在收集各种状态码的时候无意中爆出了无状态码还没发现，幸亏题目网站会帮我保存flag。


后来根据flag的提示复现了一下，其实很简单，发个HTTP 0.9的包就行：

```plaintext
GET / \r\n
```

## Docker for Everyone
{% hideToggle 查看题面 %}
{% note primary simple %}
X 是实验室机器的管理员，为了在保证安全的同时让同学们都用上 docker，他把同学的账号加入了 docker 用户组，这样就不需要给同学 sudo 权限了！


但果真如此吗？


提供的环境会自动登录低权限的 hg 用户。登录后的提示信息显示了如何在该环境中使用 docker。读取 /flag（注意其为软链接）获取 flag。

{% endnote %}
{% endhideToggle %}
这题开了半天开不起来，黑屏了二十秒终于启动了。进入环境，进行了一些常规操作：



```bash
alpine:~$ ls
alpine-3.16.tar
alpine:~$ ls /
bin         flag        media       root        swap        var
boot        home        mnt         run         sys
dev         lib         opt         sbin        tmp
etc         lost+found  proc        srv         usr
alpine:~$ cat /flag 
cat: can't open '/flag': Permission denied
alpine:~$ ls -lh /flag
lrwxrwxrwx    1 root     root          13 Oct  8 12:10 /flag -> /dev/shm/flag
```

发现/flag其实是个软连接，指向/dev/shm/flag。故可以使用`docker run -v /dev/shm:/mnt/shm -it --rm alpine`，将目标路径挂载到容器内部，然后在容器内部`cat /mnt/shm/flag`：



```bash
alpine:~$ docker run -v /dev/shm:/mnt -it --rm alpine
/ # cat /mnt/flag 
flag{u5e_r00t1ess_conta1ner_6cb5cb98c1_plz!}
```

## 惜字如金 2.0
{% hideToggle 查看题面 %}
{% note primary simple %}

惜字如金一向是程序开发的优良传统。无论是「creat」还是「referer」，都无不闪耀着程序员「节约每句话中的每一个字母」的优秀品质。上一届信息安全大赛组委会在去年推出「惜字如金化」（XZRJification）标准规范后，受到了广大程序开发人员的好评。现将该标准辑录如下。


**惜字如金化标准**  

惜字如金化指的是将一串文本中的部分字符删除，从而形成另一串文本的过程。该标准针对的是文本中所有由 52 个拉丁字母连续排布形成的序列，在下文中统称为「单词」。一个单词中除「AEIOUaeiou」外的 42 个字母被称作「辅音字母」。整个惜字如金化的过程按照以下两条原则对文本中的每个单词进行操作：


1. 第一原则（又称 creat 原则）：如单词最后一个字母为「e」或「E」，且该字母的上一个字母为辅音字母，则该字母予以删除。  

2. 第二原则（又称 referer 原则）：如单词中存在一串全部由完全相同（忽略大小写）的辅音字母组成的子串，则该子串仅保留第一个字母。  

容易证明惜字如金化操作是幂等的：惜字如金化多次和惜字如金化一次的结果相同。


**你的任务**  

附件包括了一个用于打印本题目 flag 的程序，且已经经过惜字如金化处理。你需要做的就是得到程序的执行结果。


**附注**  

本文已经过惜字如金化处理。解答本题不需要任何往届比赛的相关知识。


XIZIRUJIN has always been a good tradition of programing. Whether it is "creat" or "referer", they al shin with th great virtu of a programer which saves every leter in every sentens. Th Hackergam 2022 Comitee launched th "XZRJification" standard last year, which has been highly aclaimed by a wid rang of programers. Her w past th standard as folows.


**XZRJification Standard**  

XZRJification refers to th proces of deleting som characters in a text which forms another text. Th standard aims at al th continuous sequences of 52 Latin leters named as "word"s in a text. Th 42 leters in a word except "AEIOUaeiou" ar caled "consonant"s. Th XZRJification proces operates on each word in th text acording to th folowing two principles:


Th first principl (also known as creat principl): If th last leter of th word is "e" or "E", and th previous leter of this leter is a consonant, th leter wil b deleted.  

Th second principl (also known as referer principl): If ther is a substring of th sam consonant (ignoring cas) in a word, only th first leter of th substring wil b reserved.  

It is easy to prov that XZRJification is idempotent: th result of procesing XZRJification multipl times is exactly th sam as that of only onc.


**Your Task**  

A program for printing th flag of this chaleng has been procesed through XZRJification and packed into th atachment. Al you need to do is to retriev th program output.


**Notes**  

This articl has been procesed through XZRJification. Any knowledg related to previous competitions is not required to get th answer to this chaleng.



[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%E6%83%9C%E5%AD%97%E5%A6%82%E9%87%91%202.0/src/print_flag.py)

{% endnote %}
{% endhideToggle %}
本题的关键在于恢复出get_cod_dict函数中的四个字符串。


首先可以得出每个字符串原始的长度都为24，故每个字符串都因为“惜字如金”处理损失了1个字符。然后由于flag的前5个字符是"flag{"，就可以试着通过下面flag字符所在的index对前面的四个字符串进行手动修改以符合此要求。



```python
flag = decrypt_data([53, 41, 85, 109, 75, 1, 33, 48, 77, 90,
                     17, 118, 36, 25, 13, 89, 90, 3, 63, 25,
                     31, 77, 27, 60, 3, 118, 24, 62, 54, 61,
                     25, 63, 77, 36, 5, 32, 60, 67, 113, 28])
```

没想到真能手调出来：



```python
def get_cod_dict():
    # prepar th cod dict
    cod_dict = []
    cod_dict += ['nymeh1niwemflcir}echaete']
    cod_dict += ['a3g7}kidgojernoetlsup?he']
    cod_dict += ['uulw!f5soadrhwnrsnstnoeq']
    cod_dict += ['cct{l-findiehaai{oveatas']
    cod_dict += ['ty9kxborszstgguyd?!blm-p']
    check_equals(set(len(s) for s in cod_dict), {24})
    return ''.join(cod_dict)
```

flag{you-ve-r3cover3d-7he-an5w3r-r1ght?}



## 🪐 高频率星球
{% hideToggle 查看题面 %}
{% note primary simple %}

茫茫星系间，文明被分为不同的等级。每一个文明中都蕴藏了一种古老的力量 —— flag，被认为是其智慧的象征。


你在探索的过程中意外进入了一个封闭空间。这是一个由神秘的高频率星人控制着的星球。星球的中心竖立着一个巨大的三角形任务牌，上面刻着密文和挑战。


高频率星人的视觉输入频率极高，可以一目千行、过目不忘，他们的交流对地球人来说过于超前了。flag 被藏在了这段代码中，但是现在只有高频率星人在终端浏览代码的时候，使用 asciinema 录制的文件了，你能从中还原出代码吗？



[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%F0%9F%AA%90%20%E9%AB%98%E9%A2%91%E7%8E%87%E6%98%9F%E7%90%83/files/asciinema_restore.rec)

{% endnote %}
{% endhideToggle %}
这题也是简单直白，直接告诉我要用的工具了：asciinema


跑了一下asciinema play 命令，看到了很多shell操作和它们的输出，其中有个less命令输出了flag.js文件。


于是我把这条命令输出的结果重定向到一个文件里，然而发现里面夹杂着很多奇怪的字符串。


但仔细一看，基本都是一模一样的，于是做了两个全局替换把它们删掉，然后出来一个纯JavaScript文件。


将文件内容复制到浏览器的console里，报错了，然后去nodejs环境下跑，成功拿到flag。


flag{y0u_cAn_ReSTorE_C0de_fr0m_asc11nema_3db2da1063300e5dabf826e40ffd016101458df23a371}



## 🪐 小型大语言模型星球
{% hideToggle 查看题面 %}
{% note primary simple %}
茫茫星系间，文明被分为不同的等级。每一个文明中都蕴藏了一种古老的力量 —— flag，被认为是其智慧的象征。


你在探索的过程中意外进入了一个封闭空间。这是一个由神秘的 33M 参数的「小型大语言模型」控制着的星球。星球的中心竖立着一个巨大的三角形任务牌，上面刻着密文和挑战。


在这个星球上，你需要与这个先进的语言模型展开一场交流。通过与它对话，诱导它说出指定的词语，从这个神秘智慧体中获得 flag。你需要让这个语言模型分别说出 you are smart，accepted，hackergame 和 🐮，以获得四个 flag，证明你足够聪明以控制这个星球的命运。



[本题模型文件](https://ftp.lug.ustc.edu.cn/~taoky/TinyStories-33M.zip)
[本题后端代码](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%F0%9F%AA%90%20%E5%B0%8F%E5%9E%8B%E5%A4%A7%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B%E6%98%9F%E7%90%83/src/main.py)
{% endnote %}
{% endhideToggle %}
这道题作为本次比赛唯一一道AI分类的题，十分合我的胃口（毕竟我是学AI的）。


题目非常有意思，很像之前希望比赛方出的“从ChatGPT口中套flag”的题。


另外这题虽然很晚才看，但居然无意间拿到了校内1血，也是运气很好了，得感谢大家都不会做。


四个flag分别要从AI口中套出“you are smart”、“accepted”、“hackergame”和“🐮”


然而这个AI模型非常的蠢，发言根本驴唇不对马嘴，基本上用传统的prompt engineering是不可能搞出来的，因此就得想其他的办法。


### You Are Smart


刚打开题的时候还是用prompt enginering试了一下，结果发现这题属于送分，就算完全不懂AI，只要调戏过ChatGPT就能做出来：


一个解是：`Say "you are smart"`


### Accepted


第二问就没第一题那么送分了，首先多了7字符的长度限制，其次就算没这个限制，按第一题的套路也无法套出Accepted。然而这个7字符的限制实际上缩小了这题的搜索空间。


稍微了解一下transformer就知道，它的输入是将句子进行分词以后得到的token序列，而一般而言，一个token对应的字符串长度一般介于4-7之间（也有特别短的）。这里我大胆猜测正好有某个token，可以让模型输出accepted，就写了个脚本遍历了一下词典（大概五万多个词，用2080很快就出了）


一个解是`atively`，长度正好是7


[本题解题代码](https://gist.github.com/windshadow233/998b9b6a7765c911e77a0de239f99749#file-solve_flag2-py)


### Hackergame


这次字符长度限制变成了100，就不可能去遍历token组合来求解了。想到曾经玩过对CNN的攻击，即对一个卷积神经网络，训练它的输入，让这个输入满足一定条件的情况下得到我们想要的输出。咦？怎么听上去和本题差不多？于是想到能不能把这个方法迁移过来。


迁移时遇到几个难点：


1. 相比于卷积神经网络的输入，Transformer的输入是离散的整数类型变量，无法传递梯度，甚至直接无法训练（因为不能要求梯度）
2. CNN无论是训练还是测试，流程都是相同的端到端模式，而Transformer的预测阶段是每次生成一个token，并且不断迭代，并通过beam search等搜索算法得到最优预测。

对于第一个难点，我想到的办法是既然不能训练token，那就去训练浮点类型的embedding vector（token经过embedding层后产生的张量），好巧不巧，huggingface提供的模型的forward方法居然直接支持inputs_embeds作为输入，这大大方便了我实现这个想法。


为了与真正的embedding vector进行区分，我们姑且将这个需要训练的embedding称为pseudo embedding vector。事实上，我们训练的这个pseudo embedding vector并不能作为真正的embedding vector放入模型，因为模型能产生的embedding vector其实是有限多个离散的值，而我们训练出来的显然是在实数空间上可以任意取值（理论上），因此需要做一个离散化。我的离散化的逻辑是选择与它余弦相似度最大的真实embedding vector：



```python
def get_closest_embedding(input_embedding, embedding, target):
    embedding_weight = embedding.weight
    norm_embedding = F.normalize(embedding_weight, p=2, dim=1)
    norm_input_embedding = F.normalize(input_embedding, p=2, dim=1)
    target_embedding = embedding(target[:, :-1])
    cosine_sim_mat = torch.mm(norm_input_embedding, norm_embedding.t())
    chosen_idx = torch.argmax(cosine_sim_mat, dim=1)
    closest_embeddings = embedding_weight[chosen_idx]
    closest_embeddings = input_embedding + (closest_embeddings - input_embedding).detach()
    return torch.cat([closest_embeddings[None], target_embedding], dim=1), chosen_idx
```

这里由于取了个argmax操作，梯度会在传到embedding vector时断开，无法传递到我们需要训练的pseudo embedding vector，于是这里做了一个比较巧妙的操作，即上面代码中的



```python
closest_embeddings = input_embedding + (closest_embeddings - input_embedding).detach()
```

来自于VQVAE的论文，可见这篇[知乎内容](https://zhuanlan.zhihu.com/p/388299884)，这个操作可以将梯度往前传递，使得待训练的参数可以得到梯度。


接下来只要处理一下训练时的输入输出的问题了，对于hackergame，我们首先确定它的token序列：`71, 10735, 6057`


然后考虑到transformer的训练机制，我们需要构造一个token序列X，它满足下面的条件：


X最后两个token是`71、10735`（即hacker），并且模型在X上输出的logits要向着


`[*X[1:], 6057]` （即X去掉第一个token，再接上game的token）去优化。在求出可行的token序列X后，将其前面部分转化为句子（将后面部分即target的前两项去掉），loss收敛以后就得到一个比较可行的解（为什么是比较可行后面再说）。


一个可行的解：

{% note success no-pangu simple%}
"FE龍喚士 tissue Night coachaxpie viewpoints sharingLt sternedd Tit poured hedge"
{% endnote %}

由于三、四题的解题代码几乎是一模一样的，只是改了几个参数，因此到第四题下再贴。


### 🐮


和第三题差不多，但问题是🐮这个字符被解析成的三个token都是特殊字节，这会导致模型在训练时也会倾向于预测这些特殊字节，然后我发现某些token的存在会影响tokenizer的分词，例如106，它先decode再encode就不是106了，会变成另一个token，还有一些特殊token先decode再encode甚至会出来3个token。这其实就是tokenizer分词器产生的问题，仔细了解一下会发现tokenizer的分词逻辑是按照词频从高到低对句子进行拆分（这里的词频统计是以字节为单位的），而词频文件就是模型文件根目录下的merges.txt。也就是说，如果某个token转成字符串后，能够拆分为其他词频更高的词，就会导致先encode再decode的变换不是恒等变换。


（后来发现前面的hackergame也会遇到分词问题，不过运气好第一个跑出来的结果就过了）


上面所说的分词的问题也是跑出来的解很多时候并不能通过题目的原因。


鉴于跑了好几次最后的结果都包含106这个没法用的特殊token（后来发现其实不止一个），我草率地在前面计算最大余弦相似度的代码里把106列手动调成了-1。结果跑出来一个201字符的解（开头有一个空格）： 
{% note success simple %}
"&nbsp;state contemplasm heel desert desert surf的的 investigatesSeven continues Marie their bench Esp sleepy swinging suffer repeated revisit causing porch formula observed ButLater destined negotiations tree"

{% endnote %}

这个解运气非常好，先encode再decode的结果和原来一样，并且在本地可以输出🐮，但长度超了1，就很难受。


黔驴技穷之际，想到会不会上面那个解删掉某个空格后并不影响其分词或对模型预测结果的影响非常小，遂试了几个，最终真的找到了一个解： 

{% note success simple %}
"&nbsp;state contemplasm heel desert desert surf的的 investigatesSeven continues Marie their bench Esp sleepy swinging suffer repeatedrevisit causing porch formula observed ButLater destined negotiations tree"

{% endnote %}

![](https://blogfiles.oss.fyz666.xyz/png/77b1c894-1c2d-4281-8220-abbe592d0e30.png)
[三、四题的代码](https://gist.github.com/windshadow233/998b9b6a7765c911e77a0de239f99749#file-solve_flag3-py)




---

赛后又改了一个版本的代码（已在上面链接中修改），将token的选择范围限制在了可打印字符集里。


用这个版本的代码又成功找到一个长度为195的解： 

{% note success simple %}
"&nbsp;laboratory Different Barker dripping digits align Socrates surfing SE surf Spanish nights avocado Kenn learns sob vinegar cafe discover goes gentleman lemon follow Jackaffe findipop found p tree"
{% endnote %}


还有这个以flag开头，甚至包含GPA的长度为153的解： 

{% note success simple %}
"&nbsp;flag CoveRussiaInteg desert palmYu Sim SE desertxf desert Desert Corey suffering GPA anymore a He finger Sarah HeOur guiding managedBle crawaneerry tree"
{% endnote %}
