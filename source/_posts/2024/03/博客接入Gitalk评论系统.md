---
title: 博客接入Gitalk评论系统
id: 9827
date: 2024-03-17 15:49:52
categories:
  - [博客相关]
tags: ['Gitalk', 'GitHub API']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/9c32e2867c784770c9937826c6403bf6.png
disableNunjucks: false
---

{% note info %}

2024-04-21 更新: 基于GitHub Issue的评论系统在嵌套评论时叠金字塔的行为太丑了，于是我已经将评论系统换成了基于GitHub Dissussion的[Giscus](https://github.com/giscus/giscus)。

{% endnote %}

自从开始写这个博客以来，我就嫌博客主题自带的评论系统太丑，又懒得大改CSS，于是我的博客一直没有开启评论功能。

但忽然觉得不开评论区好像过于冷清<s>（虽然开了也不怎么会有人评论）</s>，然而我又不是很希望访客的评论占用数据库，因此我打算看看能不能整一个Serverless的评论系统。


最近接触了下GitHub REST API，于是想了一下，觉得既然GitHub的API那么方便，那为什么不试试把GitHub的Issue系统渲染到自己的网页上当评论系统用呢？（之前听说过有人拿GitHub当云存储的，~~简直就是人才~~）


考虑到受众群体应该不会有人没有GitHub账号，感觉这个想法很不错，然而当我研究的如火如荼之时，突然在网上搜到了别人已经造好的轮子：[Gitalk](https://github.com/gitalk/gitalk)。~~草，果然。~~

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/9c32e2867c784770c9937826c6403bf6.png)
那何不拿来主义？毕竟我也比较讨厌写前端代码。于是我啪就整起来了，很快啊！就把Gittalk接入了一下，说实话这个评论系统的前端还挺不错的，基本契合我用的主题，稍微改了一下夜间模式下的样式就OK了。


接入的方法已经在[官方文档](https://github.com/gitalk/gitalk/blob/master/readme.md)中写的非常详细了，我则加了几条夜间模式CSS：

```css
.darkmode--activated .gt-comment-content{
    background: black!important;
}
.darkmode--activated .gt-comment-content p, .darkmode--activated .gt-comment-body{
    color: white!important;
}
.darkmode--activated .gt-popup{
    background: black!important;
}
.darkmode--activated .gt-header-preview{
    background: black!important;
    color: white!important;
}
```

配置：

```js
const gitalk = new Gitalk({
    clientID: 'xxxxxxxxxxxxxxxx',
    clientSecret: 'xxxxxxxxxxxxxxxx',
    body: location.href,
    repo: 'BlogComments',
    owner: 'windshadow233',
    admin: ['windshadow233'],
    createIssueManually: true,
    id: location.pathname,
    distractionFreeMode: false
});
gitalk.render('gitalk-container');
```

根据[这条解释](https://github.com/imsun/gitment?tab=readme-ov-file#about-security)，把secret泄漏了似乎也并没有什么问题。
