---
title: Form表单回车自动提交的原因及避免办法
id: 3157
date: 2020-07-28 14:38:34
categories: [Debug]
tags: ['Web前端']
cover: 
disableNunjucks: true
---

在html中使用form表单的时候，有时候会遇到回车自动提交的问题，比如我做了一个登录表单，希望其通过ajax提交而不进行网页整体刷新，但一敲回车，表单自己提交了上去并造成网页整体刷新，就会造成比较差的体验。

当然第一个方法就是你别用form就行了，但考虑到form有一个serialize()方法特别好用，因此我非用form不可，这时还有另外的解决方法。


首先这种自动提交的行为来自于浏览器的~~迷惑行为~~自动优化，查找资料后发现有以下几条规则：


- 表单含有`type="submit"`的按钮时，回车自动提交
- 表单有且仅有一个`type="text"`的`input`时，回车自动提交
- `button`按钮在不声明`type`时，有些浏览器会默认其为`submit`
- 其他表单元素如`textarea`、`select`不影响，`radio`、`checkbox`不影响触发规则，但本身在FireFox下会响应回车键，在IE下不响应
- `type="image"`的`input`，效果等同于`type="submit"`，不知道为什么会设计这样一种type，不推荐使用，应该用CSS添加背景图合适些

鉴于我遇到的情况是第二种，因此我在表单里面加了一句`<input type="text" style="display: none;">`完美解决问题。
