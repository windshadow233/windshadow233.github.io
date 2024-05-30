---
title: Hexo博客文章添加AI摘要
disableNunjucks: false
mathjax: false
id: 11603
date: 2024-05-18 04:01:46
categories:
  - [Hexo魔改]
  - [博客相关]
tags:
  - Hexo
  - Kimi Chat
  - Butterfly主题
cover:
swiper_index: 1
description: 一种零成本的博客文章AI摘要功能实现
---

信息的高速发展让人们学习知识的时间变得更加碎片化，这种情况下，读者通过搜索引擎搜到一篇文章后，未必能有充足的时间去仔细阅读，如果能在文章开头放一个摘要，让读者只需数秒就能判断文章对他是否有价值，就能大大提高读者的浏览效率。

---

## 需求与一些考虑

但写文章已经够累的了，如果还得一篇一篇地总结、写摘要，则感觉太费时费力。如今大语言模型遍地开花，何不考虑用AI来给文章生成摘要？

{% note primary %}

本文所使用的方法是以静态文件的形式引入摘要，并且零成本，如需要更完善、互动性更强的功能，请考虑付费使用下面这个洪哥开发的插件&服务⬇️

{% endnote %}

{% link Post-Abstract-AI,GitHub,https://github.com/zhheo/Post-Abstract-AI %}

我手头的计算资源并不允许我部署一个开放到公网的大模型，不然我也去搭一个玩了（

---

我不使用上面的插件有以下几点考虑：

1. 穷，虽然洪哥给的价格真的很便宜，但我想了一下我每月还得养个ChatGPT以及好几台服务器，但收入仅仅只有博士的低保，在需求可以满足的情况下能省则省吧～

2. 使用我的方案确实已经可以满足我的需求了。

3. 事实上，TianliGPT（插件所调用的AI）最多只支持5000字符的输入（[tianliGPT_wordLimit](https://postsummary.zhheo.com/parameters.html#tianligpt-wordlimit)），而我随便一篇题解就是上万字符，即使去掉代码块、超链接等元素，也仍有近7k。Cover不了文章内容的话，生成的摘要质量或许差点意思。

   
   
   ![image-20240518045609205](https://blogfiles.oss.fyz666.xyz/png/4b6eca8c-715c-4f02-8ccf-e672eaa7943f.png)
   
   ![image-20240518212241221](https://blogfiles.oss.fyz666.xyz/png/1e01bfb3-5b3e-4543-8bfe-80c6dc355bbb.png)

如果不考虑与读者的互动效果，这个功能只需要负责为每篇文章生成一次摘要，洪哥开发的插件其实也有类似的缓存功能，在`input token`完全相同的情况下，只有首次输入会消耗账号额度，而后面的调用将直接返回数据库缓存，不消耗额度，当`input token`产生变化时，则需要重新生成。

然而，这个特性对我来说却不算特别友好，由于我经常会对以前发布的文章进行一些修改，以尽量让它们保持可靠性，所以。。。带了这个插件我就不好随意改文章了，毕竟即使只改了一个标点，也得重新消耗额度来生成新的摘要。我需要在我可接受的手动操作范围内，更加自由地决定什么时候需要重新生成摘要。

于是，一种愚蠢的方法就诞生了。

---

## 我的方法

### 生成摘要

[Kimi Chat](https://kimi.moonshot.cn/)号称能一口气读完20万字的小说，这上下文长度都随便给博士论文生成摘要了，区区博客文章就是小意思，并且Kimi Chat还能一次拖入最多50个文本文件，这批处理功能不就来了？（或者也可以购买Kimi官方的API来进行批处理，~~至于逆向web接口的操作，我只能说很刑~~）

随意写了段Prompt，送进Kimi：

```yaml
- Role: 内容解析与摘要专家
- Background: 用户将发送Markdown文件，需要从中提取特定字段，并生成摘要，最后将信息格式化为JSON。
- Profile: 你是一位专业的文档解析专家，擅长从文本中提取关键信息，并能够用精炼的语言撰写摘要。
- Skills: Markdown解析、摘要撰写、JSON格式化。
- Goals: 提取Markdown文件中的'id'字段，为每个文件生成精炼摘要，并输出为JSON格式的键值对。
- Constrains: 提取的id必须准确无误，摘要必须包含主语并简洁描述文章核心内容，不包含所有细节，长度不超过100字，且输出内容仅为一个json字典。
- OutputFormat: 仅输出一个JSON字典，键为'id'，值为摘要。
- Workflow:
  1. 解析Markdown文件的front-matter以提取'id'字段。
  2. 阅读并理解文件内容，提炼出核心内容，撰写摘要。
  3. 将'id'和摘要组合成JSON格式，并输出。
- Examples:
  文件1:
    - id: 123
    - 摘要：这篇文章探讨了远程工作对员工福祉的影响。
  文件2:
    - id: 456
    - 摘要：报告分析了全球变暖对生态系统的长期影响。
  Output:
    - {
        "123": "这篇文章探讨了远程工作对员工福祉的影响。",
        "456": "报告分析了全球变暖对生态系统的长期影响。"
      }
- Initialization: 欢迎使用自动化文档处理服务。请发送您的markdown文件，我将开始提取id并生成摘要。
```

然后就可以快乐地把一堆Markdown拖进去了。不过当上下文变得很长的时候，提示词的作用会被弱化，因此可以在后面继续给Kimi提要求，让它进行修改。（如果一篇一篇处理则没有这个问题）

这样一顿操作，就获取到了一个摘要字典，通过`id`与文章形成一一对应。

接下来，在博客的`source`目录下新建`abstract`目录，写个脚本把前面获取到的`json`格式摘要字典以`id`为文件名，摘要为文本内容，依次写到`source/abstract`目录下。这样，摘要就生成完毕了。

### 修改主题

修改主题文件中负责处理`post`页面的模板，以我所用的Butterfly主题为例，其对应的文件是`themes/butterfly/layout/post.pug`，我们在文章内容的顶部加上一些组件，负责显示摘要。

```diff
--- a/themes/butterfly/layout/post.pug    2024-05-13 15:20:58
+++ b/themes/butterfly/layout/post.pug    2024-05-17 15:49:45
@@ -4,7 +4,14 @@
   #post
     if top_img === false
       include includes/header/post-info.pug
-
+    #ai-container
+      #ai-header
+        #ai-title
+          i.fas.fa-robot &nbsp;
+          span AI摘要
+          b#ai-label
+            a(href="https://kimi.moonshot.cn/") Kimi Chat
+      #ai-content
     article#article-container.post-content!=page.content
     include includes/post/post-copyright.pug
     .tag_share
```

新建一个`source/css/ai-abstract.css`：

```css
#ai-container{
    margin: 10px 0;
    border-radius: 10px;
    border: 1px solid #c9c9c9;
    background-color: #fffd;
}
[data-theme="dark"] #ai-container{
    background-color: #0008;
}
#ai-label{
    position: absolute;
    right: 20px;
    background: white;
    margin: 7px;
    height: 59%;
    font-size: 12px;
    color: #6cf;
    line-height: 100%;
    font-family: sans-serif;
    padding: 4px;
    border-radius: 5px;
    transform: translateY(-2px);
}
#ai-header{
    padding: 0 10px;
    background-color: #6cf;
    border-radius: 10px 10px 0 0;
    color: white;
    opacity: 0.8;
    font-size:17px;
    position: relative;
}
#ai-content{
    padding: 20px;
    text-indent: 2em;
    line-height:18px;
}
#ai-title{
    color: white!important;
    box-shadow: none!important;
    border: none!important;
    background: none!important;
}
#ai-content::after{
    content: '|';
    animation: blink 1s infinite
}
```

新建一个`source/js/ai-abstract.js`：

这里前面的一些逻辑主要负责判断是否需要请求摘要，以及获取到摘要文件的文件名，需要根据需求自行更改，不过非常容易。

```js
(function loadAbstract() {
    if(!document.querySelector("#article-container")) return;
    let key;
    if ((match = location.pathname.match(/^\/blog\/(\d+)\/?/)) !== null) key = match[1];
    else return;
    try{document.querySelector(".st").remove()}catch(err){}
    var http=new XMLHttpRequest();
    http.open("GET",`/abstract/${key}?t=${new Date().getTime()}`)
    http.send();
    http.onreadystatechange=(event)=>{
        if(http.readyState==4){
            if(http.status==200) var text = http.responseText.replace(/<[^>]*>/g, '');
            else var text="文章摘要遇到异常。";
            const dom = document.querySelector('#ai-content')
            const data = text;
            function writing(index) {
                if (index < data.length) {
                    dom.innerHTML += data[index]
                    setTimeout(writing.bind(this), 50, ++index)
                }
                else{
                    var s=document.createElement("style")
                    s.className="st";
                    s.innerText="#ai-content::after{content:''!important;}"
                    document.body.appendChild(s)
                }
            }
            writing(0);
        }
    }
})()
```

最后，将这两个文件嵌入到博客中：

```yaml
inject:
    ...
    bottom:
        - <link rel="stylesheet" href="/css/ai-abstract.css">
        - <script type="text/javascript" data-pjax src="/js/ai-abstract.js"></script>
```

如不需要`pjax`就将`data-pjax`去掉。

这样，一个比较简陋，但基本需求已经满足的AI摘要功能就完成了，其缺点无非是：缺少互动性、无法实时自动化地生成摘要，但毕竟零成本啊，还要什么自行车？
