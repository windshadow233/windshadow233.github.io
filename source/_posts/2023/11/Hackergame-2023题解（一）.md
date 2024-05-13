---
title: Hackergame 2023题解（一）
id: 8779
date: 2023-11-04 05:41:27
categories: 
  - CTF题解
tags:
  - Hackergame
  - Hackergame 2023
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpg/bb1e044b3388733daabb1aaf5cd6ac08.jpg
disableNunjucks: false
---

本文是Hackergame 2023题解的第一部分。



## Hackergame 启动
{% hideToggle 查看题面 %}
{% note primary simple %}

大声喊出 Hackergame 启动，开始今年的冒险！

{% endnote %}
{% endhideToggle %}
解法1：直接点击提交，发现URL多出参数`?similarity=`，手动补成`?similarity=114514`再访问即可。


~~解法2：多喊几遍Hackergame 启动！让相似度达到100%。~~



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/1771236aeb367d1ed1a5bda668c3502c.png)
flag{We1ComE-70-hACkEr9aME-4nD-enjoY-h4Ck!nG-z0Z3}



~~虽然不玩原神，但还是被洗脑了。。。~~


## 猫咪小测
{% hideToggle 查看题面 %}
{% note primary simple %}

1. 想要借阅世界图书出版公司出版的《A Classical Introduction To Modern Number Theory 2nd ed.》，应当前往中国科学技术大学西区图书馆的哪一层？（30 分）  

    提示：是一个非负整数。
2. 今年 arXiv 网站的天体物理版块上有人发表了一篇关于「可观测宇宙中的鸡的密度上限」的论文，请问论文中作者计算出的鸡密度函数的上限为 10 的多少次方每立方秒差距？（30 分）  

    提示：是一个非负整数。
3. 为了支持 TCP BBR 拥塞控制算法，在编译 Linux 内核时应该配置好哪一条内核选项？（20 分）  

    提示：输入格式为 CONFIG_XXXXX，如 CONFIG_SCHED_SMT。
4. 🥒🥒🥒：「我……从没觉得写类型标注有意思过」。在一篇论文中，作者给出了能够让 Python 的类型检查器 MyPY mypy 陷入死循环的代码，并证明 Python 的类型检查和停机问题一样困难。请问这篇论文发表在今年的哪个学术会议上？（20 分）  

    提示：会议的大写英文简称，比如 ISCA、CCS、ICML。

{% endnote %}
{% endhideToggle %}
由于HG的问答题没有提交冷却限制，因此1、2问直接爆破。答案分别为12、23。


第三问直接塞入ChatGPT：



> 为了支持 TCP BBR 拥塞控制算法，在编译 Linux 内核时，您应该配置 CONFIG_TCP_CONG_BBR 选项。


一开始搜不到第四题，然后发现相关的会议好像也就那么几个，直接枚举得到ECOOP。


🎉🎉🎉flag{wE1COME-TO-4ttEND-th3-NEKO-ex@M-zo23}🎉🎉🎉  

🎉🎉🎉flag{re@l-M4sT3r-oF-thE-nek0-ex4M-IN-ustc}🎉🎉🎉



## 更深更暗
{% hideToggle 查看题面 %}
{% note primary simple %}
小 E 正在收看电视新闻。


「诶，你知道吗，『泰坦』号潜水艇失事了！」小 E 对旁边的小 C 说。


小 C 凑近电视机，看了一眼新闻里的画面。


「是我眼花了吗？我刚刚有一瞬间好像在残骸上看到了一个 flag？」小 C 惊讶地说。


「玩 CTF 玩的。」小 E 对此不以为然，「一定是你看错了。」


小 C 却十分相信自己没有看错。

{% endnote %}
{% endhideToggle %}
~~好蠢的题~~就喜欢这种题，f12找了一下发现flag直接明文存在html里：



```HTML
<pre id="titan">
                               /
                               \
                               |
                             __|__
                            |     \
                                    /
     ____  _________________|___ ___\__________/ ____
    &lt;   /                                            \____________  |
     /         flag{T1t@n_e2fbeff027cf6d2dbff92fe32594c94b}       \ (_)
~~~~~~     O       O       O                                       &gt;=)~~~~~~~
       \_______/ ____________\  /_________________________________/ (_)
</pre>
```

## 旅行照片 3.0
{% hideToggle 查看题面 %}
{% note primary simple %}
你的学长去留学了，这一走短时间内怕是回不来了。于是，你在今年暑假来了一场计划已久的旅行，并顺路探望了这位久别的学长。翻阅当天拍下的照片， 种种回忆和感慨油然而生。


请观察照片并结合所有文字内容，正确回答题目以获取 flag。


🌻 上午  

与学长碰面后，他带你参观了他的学校。在校园的一个展厅内，你发现了一枚神秘的金色奖牌，它闪闪发光，令人心生羡慕。

![](https://cdn.jsdelivr.net/gh/USTC-Hackergame/hackergame2023-writeups/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%203.0/%E9%A2%98%E7%9B%AE%E7%85%A7%E7%89%87/01.JPG)


🌻 中午  

离开校园后，你和学长走到了附近的一家拉面馆用餐。那家店里的拉面香气扑鼻，店内的装饰和氛围也充满了日式的风格。 学长（下图左一）与你分享了不少学校的趣事。饭后，你们决定在附近散步，享受这难得的闲暇时光。当你们走到一座博物馆前时， 马路对面的喷泉和它周围的景色引起了你的注意。下午，白色的帐篷里即将举办一场大型活动，人们忙碌的身影穿梭其中，充满了期待与热情。

![](https://cdn.jsdelivr.net/gh/USTC-Hackergame/hackergame2023-writeups/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%203.0/%E9%A2%98%E7%9B%AE%E7%85%A7%E7%89%87/02.jpg)

![](https://cdn.jsdelivr.net/gh/USTC-Hackergame/hackergame2023-writeups/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%203.0/%E9%A2%98%E7%9B%AE%E7%85%A7%E7%89%87/03.jpg)


🌻 下午和夜晚  

在参观完博物馆后，学长陪你走到了上野站。你们都感到有些不舍，但知道每次的分别也是为了下次更好的相聚。 学长那天晚上将继续他的学术之旅，打算乘船欣赏东京的迷人夜景和闪耀的彩虹大桥（Rainbow Bridge）。 而你则搭乘了开往马里奥世界的电车，在那里度过了一段欢乐的时光。

![](https://cdn.jsdelivr.net/gh/USTC-Hackergame/hackergame2023-writeups/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%203.0/%E9%A2%98%E7%9B%AE%E7%85%A7%E7%89%87/04.jpg)



1. **你还记得与学长见面这天是哪一天吗？（格式：yyyy-mm-dd）**
2. **在学校该展厅展示的所有同种金色奖牌的得主中，出生最晚者获奖时所在的研究所缩写是什么？**
3. **帐篷中活动招募志愿者时用于收集报名信息的在线问卷的编号（以字母 S 开头后接数字）是多少？**
4. **学长购买自己的博物馆门票时，花费了多少日元？**
5. **学长当天晚上需要在哪栋标志性建筑物的附近集合呢？（请用简体中文回答，四个汉字）**
6. **进站时，你在 JR 上野站中央检票口外看到「ボタン＆カフリンクス」活动正在销售动物周边商品，该活动张贴的粉色背景海报上是什么动物（记作 A，两个汉字）？ 在出站处附近建筑的屋顶广告牌上，每小时都会顽皮出现的那只 3D 动物是什么品种？（记作 B，三个汉字）？（格式：A-B）**

{% endnote %}
{% endhideToggle %}
非常喜欢这种开盒题，虽然今年有2问卡了好久，但最终是盒出来了。


先把照片全下到本地，看看有没有留下与日期等相关的exif，发现没有。然后注意到与第三个图相关的文案：“下午，白色的帐篷里即将举办一场大型活动”，于是把图片拿到Google Lens看了一下，发现这个广场是“上野恩赐公园”的“喷泉广场”。并且我们知道拍摄日期是今年的暑假，于是查了一下上野公园在2023年8月有什么活动的信息，搜到[一个链接](https://tw.wamazing.com/media/article/a-3054/)，发现这个活动是2023年日本全國梅酒祭



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/a24b9572a9b23fe0ec3fd839ecf40e93.png)
那么拍摄日期应该就是8月10日。


第二问卡了好久，原因是理解错了句意，一开始理解成了“所有获得过诺贝尔物理学奖的人中，出生最晚的”，然后搜到一位74年出生的俄罗斯籍的小哥：[Konstantin Novoselov](https://en.wikipedia.org/wiki/Konstantin_Novoselov)，是University of Manchester的教授，然而把他所任职过的各种机构、各种缩写方式、各种可能的大小写组合挨个试了一遍没一个对的。


后来我猛的意识到“**在学校该展厅展示的**”这几个字，那么问题应该是“这个学校出过的诺贝尔物理学奖得主中最晚出生的”，注意到图1的奖牌写着M. KOSHIBA，是小柴昌俊，于是得到学校是东京大学。再搜东京大学出过的诺贝尔物理学奖得主，发现最年轻的是[梶田隆章](https://zh.wikipedia.org/zh-hans/%E6%A2%B6%E7%94%B0%E9%9A%86%E7%AB%A0)，这个维基页面还介绍了他从2008年开始，就在东京大学[宇宙射线研究所](https://en.wikipedia.org/wiki/Institute_for_Cosmic_Ray_Research)进行研究工作，该研究所缩写为**ICRR**，即得答案。


第三问就简单了，既然已经知道是日本全國梅酒祭，直接找到它的官网，在官网里找到了这次活动的志愿者[报名信息](https://umeshu-matsuri.jp/tokyo_staff/)，里面即有[报名链接](https://ws.formzu.net/dist/S495584522/):

{% note info simple %}
`https://ws.formzu.net/dist/S495584522/`
{% endnote %}

第四问瞎蒙一个0，结果对了。


第五问不会，在解决了第六问后枚举了好多附近的四字建筑都不对。最后猜测因为学长要去“学术之旅”，那么可能就是去东京大学的某个教学楼之类的地方吧，然后搜到一个“安田讲堂”，试了一下对了。


第六问先谷歌搜关键字**ボタン&カフリンクス jr上野**，直接出来一张粉色的海报，上面画着熊猫（其实二字动物一猜就是熊猫根本不用搜）


接下来需要知道出站口在哪里，搜了一下最后一幅图，发现是位于渋谷的任天堂旗舰店，然后去地图里导了个航看看从上野站到任天堂旗舰店的路线，得到目的站点为渋谷站，在Google map查看该站附近的全景地图，确实发现了一个广告牌：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/1706dead9d430bdc55fcfb9e8c69f301.png)
然而这张全景图拍的不是时候，广告牌上找不到动物。然后只好搜了一下“渋谷 广告牌 3d”等关键字，搜到[链接](https://wow-japan.com/news-flash-shibuya-3d-akida-dog-ads/)，因此答案为秋田犬。


## 赛博井字棋
{% hideToggle 查看题面 %}
{% note primary simple %}

那一年的人机大战，是 AlphaGo 对阵柯洁，最终比分 3-0。当时我看见柯洁颓坐在椅子上泣不成声，这个画面我永生难忘。那一刻我在想，如果我能成为一名棋手，我一定要赢下人工智能。如今 AI 就在眼前，我必须考虑这会不会是我此生仅有的机会。重铸人类围棋荣光，我辈义不容辞！


……


但是围棋实在太难了，你决定先从井字棋开始练习。

{% endnote %}
{% endhideToggle %}
井字棋正常玩的话，只要对方不是傻子，即使是先手也最多只能平局。考虑到这是个web题，故从其他角度考虑。


试了一下发现只要在f12的console界面依次执行两个setMove：`setMove(0,0);setMove(0,1);`然后点一下坐标（0,2）位置，即可赢下游戏：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/9210118b0501c83ecb61fbad4f69658f.png)
## 奶奶的睡前 flag 故事
{% hideToggle 查看题面 %}
{% note primary simple %}

> 包含 AI 辅助创作


（以下内容由 GPT 辅助编写，如有雷同纯属巧合）


晴空万里的假期终于拍了拍翅膀飞来了。对于一心想扔掉教材、砸掉闹钟、跃向世界的 L 同学来说，期待了整整三年的跨国旅游大业终于是时候启动了，还能巧妙地顺带着做个美满的老友记。


可是，哎哟喂，他刚踩上波光粼粼的金沙海滩，那他最疼爱的华为手机就跟着海风一起去约会了大海，连他的钱包也在这场未知探索之旅中神秘失踪。


「这个地方怎么连个华为手机都不卖。若是买个苹果手机，心疼的是它连个实体 SIM 卡槽都藏起来了，回国肯定成了个大摆设。不如来个**谷歌的『亲儿子』**？」L 同学踌躇满志地嘀咕道。


那时，像是上天的安排，「咱这儿正好有个**谷歌『亲儿子』**的老手机，你拿去逍遥吧」。


L 同学满眼星光地接过，**连系统都没心思升级**，就开始疯狂安装那个久闻大名的 GPT 程序，甚至雀跃地在群里晒出一张跟 GPT 对话的精彩**截图**，一时间成为了群里的焦点人物。


![](https://cdn.jsdelivr.net/gh/USTC-Hackergame/hackergame2023-writeups/official/%E5%A5%B6%E5%A5%B6%E7%9A%84%E7%9D%A1%E5%89%8D%20flag%20%E6%95%85%E4%BA%8B/files/screenshot.png)


{% endnote %}
{% endhideToggle %}
题面给的信息是相当的多，但反正我是看不见的。


一开始拿到这题，感觉是png的高度被改小了，遂打开16进制编辑器一通改，结果发现没用。


然后用pngcheck等工具检查，发现有两个IEND块，在第一个IEND块后面还多了一大截数据，其中都是png的IDAT块结构，故将后面一半多出来的数据dd出来研究，然而捣鼓了大半天也没能把后面的数据拼出一个能看到东西的png。最后看着解出这题的人越来越多，我感到很纳闷，觉得一定是有信息漏看了，于是重新审视题面文字，才发现有加粗的文本。


有了这些信息，我就去搜了一下“谷歌手机 截图 漏洞”等关键词，搜到了一个[网页](https://0xzx.com/zh-tw/2023032102243286738.html)，里面提到谷歌手机截图编辑可被恢复的漏洞：Acropalypse，甚至还良心提供一个利用该漏洞的网站：[acropalypse.app](https://acropalypse.app)，进去以后选了个低版本的系统，将图片发上去即可恢复出被截掉的部分：



![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/5442f886e33bbf0ccaed647725eb520b.png)
直呼卧槽！原来是送分题。


## 组委会模拟器
{% hideToggle 查看题面 %}
{% note primary simple %}

每年比赛，组委会的一项重要工作就是时刻盯着群，并且撤回其中有 flag 的消息。今年因为人手紧张，组委会的某名同学将这项工作外包给了你，你需要连续审查 1000 条消息，准确无误地撤回其中所有含 flag 的消息，并且不撤回任何不含 flag 的消息。


本题中，你需要撤回的 "flag" 的格式为 hack[...]，其中方括号内均为小写英文字母，点击消息即可撤回。你需要在 3 秒内撤回消息，否则撤回操作将失败。在全部消息显示完成后等待几秒，如果你撤回的消息完全正确（撤回了全部需要撤回的消息，并且未将不需要撤回的消息撤回），就能获得本题真正的 flag。

{% endnote %}
{% endhideToggle %}
题面很实诚，直接告诉我们要干什么事，也确实只要按它说的做就行了。


不过我看了一下发现有1000条消息在100多秒内闪完，手点好像不够快，于是写了个[脚本](https://gist.github.com/windshadow233/6b563b0380e7344a55dfad22fd5c9514)来发包撤回消息，在网络畅通的情况下，跑完脚本就能获取flag。

## 虫
{% hideToggle 查看题面 %}
{% note primary simple %}

「生而为人，应该能够换尿布、策划入侵、杀猪、开船、造房子、写十四行诗、算账、建墙、正骨、抚慰临终之人、接受命令、下达命令、合作、独行、解决方程式、分析新问题、清理马粪、编程、烹饪美食、高效战斗、英勇牺牲。专业分工是给昆虫准备的。」—罗伯特·海莱恩（Robert Heinlein）


你觉得还是当昆虫轻松一些。


这时，你看到一只昆虫落在你面前，发出奇怪的叫声。你把这段声音录制了下来：这听起来像是一种**通过无线信道传输图片的方式**，如果精通此道，或许就可以接收来自国际空间站（ISS）的图片了。



[本题附件](https://github.com/USTC-Hackergame/hackergame2023-writeups/raw/master/official/%E8%99%AB/files/insect.wav)

{% endnote %}
{% endhideToggle %}
音频题没什么思路，于是搜了一下题目里说的“通过无线信道传图片 国际空间站 ISS”等信息，搜到一个叫[SSTV](https://en.wikipedia.org/wiki/Slow-scan_television)的东西，然后顺理成章搜到解码工具[RX-SSTV](https://www.qsl.net/on6mu/rxsstv.htm)，下载一下用来解码。


不过如果直接外放音频的话，噪声太多了，只能看到非常糊的flag字样，然后了解到可以通过虚拟声卡来解决这个问题，这个RX-SSTV也支持从虚拟声卡读取数据。


之后只需要耐心等flag图片被解码出来：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/webp/2413fa7edb1c10dd5f081f8785db7422.webp)
