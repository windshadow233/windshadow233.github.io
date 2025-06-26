---
title: “The Password Game”攻略
id: 9097
date: 2024-01-20 11:18:09
categories: [杂趣]
tags: ['JavaScript']
cover: https://blogfiles.oss.fyz666.xyz/png/52de5404-cde7-4dec-867d-97457ccec409.png
disableNunjucks: false
---

这两天偶然发现了一个有点意思的“小游戏”，名为“The Password Game”，传送门如下：

{% link The Password Game,,https://neal.fun/password-game/ %}

---

![](https://blogfiles.oss.fyz666.xyz/png/52de5404-cde7-4dec-867d-97457ccec409.png)
大概是给你一堆层层递进又互相强耦合的规则，让你设置一个符合所有规则的密码。我第一次通关花了几个小时，而通关两次以后，已经摸透了通关的方法，因此来记录一下。


由于其中包含Google Map和Youtube等内容，故科学上网是通关的必要条件。


本文所有的代码已集成到Greasyfork：

{%link Password Game Assistant,Greasyfork,https://greasyfork.org/scripts/485695 %}

小游戏共有35条规则，在下面依次给出。


## Rule 1-4


- Your password must be at least 5 characters.
- Your password must include a number.
- Your password must include an uppercase letter.
- Your password must include a special character.

送分规则，略


## Rule 5


- The digits in your password must add up to 25.

这条规则看上去很简单，然而如果是第一次玩，没有经验，在后续规则中稍不注意就会让数字之和超过25，到那时再想调整就很麻烦了。这里可以先写5个5，后续可以对这些5进行调整来不断地让密码符合该Rule。


由于这条规则的存在，我们在后续规则中，要尽可能选择阿拉伯数字比较小的解。


## Rule 6


- Your password must include a month of the year.

比较简单，随便找个月份的英语就行，我倾向于选择“may”，因为比较短。并且这里我特意将首字母小写了，在后续的规则中，有一些会受到字母大小写的影响，为了尽可能避免冲突，在大小写不敏感的情况下全使用小写比较好。


## Rule 7


- Your password must include a roman numeral.

罗马数字包含大写的"I、V、X、L、C、D、M"，分别表示1、5、10、50、100、500、1000。


这里看似随便写一个就行，但考虑到后面将要出现的的规则，我选择写入XXXV，表示阿拉伯数字的35。不过，这里若是写VVII，后期容错性会更强一些。


## Rule 8


- Your password must include one of our sponsors: Pepsi、Starbucks、Shell

随便选一个即可，例如pepsi（同理，小写首字母）


## Rule 9


- The roman numerals in your password should multiply to 35.

密码中包含的罗马数字的乘积为35。由于前面写了XXXV，自动满足该条件。


然而，如果密码中包含其他的"V、X、L、C、D、M"这些字母，就寄了，因此“在大小写不敏感的情况下全使用小写比较好”。


## Rule 10


- Your password must include this CAPTCHA

验证码可以随意刷新，考虑到规则5的存在，刷一条不包含阿拉伯数字的不过分吧。


## Rule 11


- Your password must include today's Wordle answer.

上网一搜就行，例如博主写下这篇文章的那天，搜索：January 20, 2024 Wordle


## Rule 12


- Your password must include a two letter symbol from the periodic table.

包含一个2个字母的元素周期表内的元素。可以先随便写一个，例如He。


## Rule 13


- Your password must include the current phase of the moon as an emoji.

注意一下农历日期，然后在[这个网站](https://emojidb.org/current-phase-moon-emojis)找一个对应的月相。


## Rule 14


- Your password must include the name of this country.

一个简单的图寻，不需要任何技巧，截图放到Google Lens即可直接搜到。


与前面类似，国家首字母使用小写以免冲突。


另外，发现把iframe的margin-top属性设为0可以直接调出Google map来源链接，于是可以：

```js
(function Rule14() {
	let iframe = document.querySelector('.geo-wrapper iframe');
	if (iframe === null) return;
	iframe.style.marginTop = 0;
})();
```

## Rule 15


- Your password must include a leap year.

包含一个闰年，写个0就行。

## Rule 16


- Your password must include the best move in [algebraic chess notation.](https://en.wikipedia.org/wiki/Algebraic_notation_(chess))

一个国际象棋棋局，需要找出最优的下一步，并用国际象棋的代数记谱法表示。这里的棋局都比较简单，我正好会一点点国际象棋，刚好能应付。实在不会可以利用这个网站：[https://nextchessmove.com/](https://nextchessmove.com/)


这里由于不得不输入阿拉伯数字，需要调整前面的数字以满足规则5。


## Rule 17


- 🥚 ← This is my chicken Paul. He hasn't hatched yet, please put him in your password and keep him safe.

本游戏最烦的角色出现了，这里先照做即可，将🥚复制到密码里。


## Rule 18


- The elements in your password must have atomic numbers that add up to 200.

密码中包含的所有元素其原子数之和为200。如果我们严格控制了前面所有内容的大小写，那么正常情况下，此时Rule 9的XXXV会包含一个V（钒 / 23），Rule 12会包含一个元素He（氦 / 2），还有Rule 16也可能会包含一个元素，手算一下并避开首字母为"V、X、L、C、D、M"的元素即可通过。


## Rule 19


- All the vowels in your password must be bolded.

将元音字母（aeiouy及其大写）加粗。


很累的体力活，因此写了个Javascript脚本，粘贴到Console运行一下批量操作。

```js
(function Rule19() {
    function processNodeRule19(textNode) {
        const text = textNode.nodeValue;
        const parent = textNode.parentNode;

        const fragments = text.split(/([aeiouyAEIOUY])/);

        fragments.forEach(fragment => {
            if (/[aeiouyAEIOUY]/.test(fragment)) {
                const strong = document.createElement('strong');
                strong.textContent = fragment;
                parent.insertBefore(strong, textNode);
            } else {
                parent.insertBefore(document.createTextNode(fragment), textNode);
            }
        });
        parent.removeChild(textNode);
    }

    function processRule19(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            processNodeRule19(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processRule19);
        }
    }
    let paragraphs = document.querySelectorAll('.ProseMirror p');
    paragraphs.forEach(processRule19);
})();
```

在过Rule 19之前可以保存一下当前的密码，以快速通过下面的Rule 20。


## Rule 20


- Oh no! Your password is on fire. Quick, put it out!

血压高起来了。。。需要快速删除所有的🔥以减少损失。如果上一步保存了密码，则可以快速还原。


## Rule 21


- Your password is not strong enough 🏋️‍♂️

粘贴三个🏋️‍♂️到密码里。


## Rule 22


- Your password must contain one of the following affirmations:  
I am loved  
I am worthy  
I am enough

写一句 “i am loved”，元音加粗。


## Rule 23


- Paul has hatched! Please don't forget to feed him, he eats three 🐛 every minute.

注意到前面的🥚变成了坤坤（🐔），它每分钟吃3条🐛，需要我们在密码里维护至少1个、至多3个🐛，数量超了，坤坤会被撑死，数量为0且超过20秒则会饿死。维护是不可能手动维护的，这里也可以写一个脚本定期检查🐛的数量并自动在密码里添加。不过既然都在用脚本了，不如直接：

```js
(function Rule23() {
    let input = document.querySelector(".ProseMirror");
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.innerText = "🐛";
    p.appendChild(span);
    input.appendChild(p);
    setTimeout(() => {
        let end = setInterval(() => {}, 10000);
        for (let i = 1; i <= end; i++) {
            clearInterval(i);
        }
        input.removeChild(input.lastChild);
    }, 1000);
})();
```

通过这个操作可以直接把坤坤每20秒吃一条🐛的定时任务删了，然后就不用管它了。


## Rule 24


- Your password must include the URL of a 24 minute 18 second long YouTube video.

我愿称之为血压最高的一条规则。


只会去YouTube乱搜，例如搜“24 minute 18 second”，同时把时间限制在20分钟以上来缩小搜索范围。需要注意的是，即使找到一个符合时长条件的视频，也未必是能用的，你可能会遇到下面几种情况之一：


1. 包含"V、X、L、C、D、M"导致规则9炸掉。
2. 包含一堆原子序数很大的元素符号导致规则18炸掉。
3. 包含一堆阿拉伯数字导致规则5炸掉。
4. 见下图：

![](https://blogfiles.oss.fyz666.xyz/png/c6462d38-1ae7-4fbe-abd6-85ee8eae7e76.png)
好在视频的时长上下浮动1秒也会被接受，并且可以将视频链接后面的一串参数删掉，这样可以稍微增加一点点成功率。


例如这里我找到的视频为[https://youtu.be/jOfB_jKEOBU](https://youtu.be/jOfB_jKEOBU)，长度24m19s，可通过该Rule。


## Rule 25


- A sacrifice must be made. Pick 2 letters that you will no longer be able to use.

要求选择两个不在密码中使用的字母。多次实验发现j、k、f、z这些字母比较少见，然而不巧这几个字母几乎都出现在了我Rule 24的url里，很难受，只好换一个：[https://youtu.be/phqGheRT-0Y](https://youtu.be/phqGheRT-0Y)


## Rule 26


- Your password must contain twice as many italic characters as bold.

全选密码，设置为斜体即可。


## Rule 27


- At least 30% of your password must be in the Wingdings font.

随便选一段换成Wingdings字体。不过这个字体没有可读性，后面有时候需要暂时切回可读字体来回顾内容。


## Rule 28


- Your password must include this color in hex.

用取色器读是不靠谱的，应该inspect查看一下该色块实际使用的RGB值，再转换为hex。这里可以不断刷新找一个hex值对全局影响较小的颜色。


我也写了一个脚本来做这件事：



```js
(function Rule28() {
	let btn = document.querySelector('.refresh');
	if (btn == null) return;
	btn.click();
	setTimeout(() => {
		let color = document.querySelectorAll(".rand-color")[0];
		color = color.style.background.match(/\d+/g);
		let s = "#";
		color.forEach(item => {
			s += parseInt(item).toString(16).padStart(2, '0');
		});
		let input = document.querySelector(".ProseMirror");
		const p = document.createElement('p');
	    const span = document.createElement('span');
	    span.innerText = s;
	    p.appendChild(span);
	    input.appendChild(p);
	}, 100);
})();
```

## Rule 29


- All roman numerals must be in Times New Roman.

不知道为什么把前面的XXXV改了仍无法通过，多选了一些附近的字符改就过了。


## Rule 30


- The font size of every digit must be equal to its square.

体力活，上脚本！



```js
(function Rule30() {
    function processNodeRule30(textNode) {
        const text = textNode.nodeValue;
        const parent = textNode.parentNode;
        const parentFontFamily = getComputedStyle(parent).fontFamily;

        const fragments = text.split(/(\d)/);

        fragments.forEach(fragment => {
            if (/\d/.test(fragment)) {
                const span = document.createElement('span');
                const fontSize = Math.pow(parseInt(fragment), 2);
                span.style.fontSize = `${fontSize}px`;
                span.style.fontFamily = parentFontFamily;
                span.textContent = fragment;
                parent.insertBefore(span, textNode);
            } else {
                parent.insertBefore(document.createTextNode(fragment), textNode);
            }
        });
        parent.removeChild(textNode);
    }

    function processRule30(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            processNodeRule30(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processRule30);
        }
    }
	let items = document.querySelectorAll(".ProseMirror p");
	items.forEach(processRule30);
})();
```

## Rule 31


- Every instance of the same letter must have a different font size.

又是体力活。不过这里必须保证每个字母出现的次数不超过10次。



```js
(function Rule31() {
    let counter = {};
    function processNodeRule31(textNode) {
        const text = textNode.nodeValue;
        const parent = textNode.parentNode;
        const parentFontFamily = getComputedStyle(parent).fontFamily;

        const fragments = text.split(/([a-zA-Z])/);

        fragments.forEach(fragment => {
            if (/[a-zA-Z]/.test(fragment)) {
                let letter = fragment.toLowerCase();
                counter[letter] = (counter[letter] || 0) + 1;
                const span = document.createElement('span');
                const fontSize = Math.pow(counter[letter] - 1, 2);
                span.style.fontSize = `${fontSize}px`;
                span.style.fontFamily = parentFontFamily;
                span.textContent = fragment;
                parent.insertBefore(span, textNode);
            } else {
                parent.insertBefore(document.createTextNode(fragment), textNode);
            }
        });
        parent.removeChild(textNode);
    }

    function processRule31(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            processNodeRule31(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processRule31);
        }
    }
	let items = document.querySelectorAll(".ProseMirror p");
	items.forEach(processRule31);
})();
```

## Rule 32-33


- Your password must include the length of your password.
- The length of your password must be a prime number.

此时，密码长度应该有90多了，考虑到Rule 5，这里我们选一个数字之和比较小的素数：101，写在密码里，然后调整Rule 5。


为了将长度补足到101，我们可以打一堆空格。


## Rule 34


- Uhhh let's skip this one.

Uhhh


## Rule 35


- Your password must include the current time.

到了这一步，前面的数字基本都已经定下来了，由于很强的耦合性，这里直接填入当前的时间大概率会牵一发动全身，非常难受。好在我们可以通过修改系统时间的方法来通过这条规则。


在密码最后写下01:00（如果这里写00:00，则需要注意网站会将00:00当成12:00来处理），然后调整数字之和与密码长度。


由此，得到了类似下面的密码：



![](https://blogfiles.oss.fyz666.xyz/png/3cd2c737-7a99-4d83-9817-6ce5f924ecf2.png)
（这里为了看着舒服暂时把字体调回了正常大小，可以修改完再用脚本改回去)



![](https://blogfiles.oss.fyz666.xyz/png/2b471943-d1c1-4877-84bc-01f50daeb51a.png)
最后修改系统时间到01:00即可通过全部35条规则。


## Final



![](https://blogfiles.oss.fyz666.xyz/png/22358635-c2ca-4553-ad06-e58e12874039.png)
Is this your final password?


在点击Yes之前，需要对密码全文进行一个全选复制（不要问我是怎么知道的


这样一来，我们就顺利通关了！

![](https://blogfiles.oss.fyz666.xyz/png/3fdb4606-fb04-41ec-9cc5-1f92035929b9.png)
<s>以后再也不怕某些网站在设置密码时刁难我了。</s>
