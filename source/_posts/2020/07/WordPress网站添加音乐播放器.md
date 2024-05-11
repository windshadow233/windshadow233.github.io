---
title: WordPress网站添加音乐播放器
id: 1868
date: 2020-07-18 04:48:56
categories:
  - [博客相关]
tags: ['Web前端', 'WordPress', '网站美化']
cover: 
disableNunjucks: false
---

不少博客网站的站长都会在网页上放一个音乐播放器，访问者在浏览网站内容的同时还可以听听歌，相当舒适。因此，在网站中放置一个音乐播放器可以为网站增色不少。

WordPress自带的音乐播放器的支持：


- 小工具和页面中可以插入音频，但需要本地导入或设置音频链接，比较麻烦
- 有一些音乐播放器插件可以下载，图方便可以直接安装使用，这里不再介绍

这里介绍一款比较流行且精致的网页音乐播放器：APlayer，并结合Meting框架，在网页内插入音乐播放器。

资源链接：

{%link APlayer,GitHub,https://github.com/MoePlayer/APlayer%}

{%link MetingJS,GitHub,https://github.com/metowolf/MetingJS %}

使用方法格外简单，向网站中导入`APlayer.min.css`，`APlayer.min.js`与`Meting.min.js`，然后在主题的`footer.php`文件中插入以下代码

```markup
<div class="aplayer"
	id="aplayer"
	data-id="5103395209"
	data-fixed="true"
	data-server="netease"
	data-type="playlist">
</div>
```

必要参数介绍：


- `id`：`'aplayer'`
- `data-id`：这里以我的网易云歌单的id号为例。歌单id的获取方法：进入网易云app的歌单，分享复制链接，链接中/playlist/后面的一串数字即为歌单id


- `data-server`：`netease`是网易云，当然还支持一些其他平台，可以参考github上的文档
- `data-type`：`playlist`指歌单，其他选项见github文档


更多其他参数设置在官方文档上可以找到。


后面我还做了一些网站的调整，例如全站Ajax化等，以适应音乐播放器的存在。
