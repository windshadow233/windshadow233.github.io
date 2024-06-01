---
title: 为Butterfly主题新增网站快捷键功能
disableNunjucks: false
mathjax: false
id: 11765
date: 2024-05-31 17:05:37
categories:
  - [博客相关]
  - [Hexo魔改]
tags:
  - Hexo
  - Butterfly主题
  - JavaScript
  - NodeJS
cover:
---

最近闲的无聊，于是给博客加了个快捷键功能，可通过长按<kbd>Shift</kbd>查看效果。本文就来记录一下魔改的过程。其中，面板的样式参考了[安知鱼博客](https://blog.anheyu.com/)，并做了一些小小的修改。

---

首先，方便起见，需要引入`jQuery`，在主题配置文件里加上：

```yaml
inject:
  head:
    - <script type="text/javascript" src="https://fastly.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
```

创建`themes/butterfly/scripts/filters/shortcut_keyboard.js`文件，内容如下：

```js
'use strict'

function injectKeyboard() {
    let keyboardHtml = `<div id="keyboard-tips" style="display:none;"><div class="keyboardTitle">快捷键</div><div class="keybordList">`;
    for (let item of hexo.theme.config.shortcut.items) {
        keyboardHtml += `<div class="keybordItem"><div class="keyGroup"><div class="key">Shift + ${item.text}</div></div><div class="keyContent"><div class="content">${item.action}</div></div></div>`;
    }
    keyboardHtml += '</div></div></div>';
    let keyboadrCSS = `<link rel="stylesheet" href="${hexo.theme.config.shortcut.keyboard_css}">`;
    hexo.extend.injector.register('head_end', keyboardHtml, "default");
    hexo.extend.injector.register('head_end', keyboadrCSS, "default");
}
hexo.extend.filter.register('after_generate',function() {
    if(hexo.theme.config.shortcut.enable){
        injectKeyboard();
    }
})
```

修改`themes/butterfly/layout/includes/head/config.pug`，在`GLOBAL_CONFIG`常量的最后添加一项`shortcut`：

```pug
script.
  const GLOBAL_CONFIG = {
  	...
  	shortcut: !{JSON.stringify(theme.shortcut)}
  }
```

修改`themes/butterfly/source/js/main.js`，在最后添加一些代码（下面第3至第40行）：

```js
document.addEventListener('DOMContentLoaded', function () {
  ...
  // 全局快捷键
  if (GLOBAL_CONFIG.shortcut.enable){
    $(document).ready(
      function(){
        let keyboardTimeout;
        function checkFocusNotOnInputOrTextarea() {
          const activeElement = document.activeElement
          return activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA'
        }
        let switchCaseString = `
        switch(keycode){
            ${GLOBAL_CONFIG.shortcut.items.map(element => `
            case ${element.keycode}:
              ${element.script}
              break
            `).join('')}
            default:
              break
            event.preventDefault()
          }`
        const executeSwitch = new Function('keycode', switchCaseString)
        window.onfocus=()=>{$('#keyboard-tips').hide()}
        $(document).on('keyup',function(event){
          keyboardTimeout && clearTimeout(keyboardTimeout)
          keyboardTimeout = null
          if(event.keyCode===16){
            $("#keyboard-tips").hide()
          }
        })
        $(document).on('keydown',function(event){
              if(event.shiftKey && checkFocusNotOnInputOrTextarea()){
                if (event.keyCode === 16) keyboardTimeout=setTimeout(()=>{$("#keyboard-tips").show()},GLOBAL_CONFIG.shortcut.keyboard_delay)
                else executeSwitch(event.keyCode)
              }
        })
      }
    )
  }
})
```

创建`source/css/keyboard.css`,内容如下：

```css
[data-theme=dark] {
    --maskbgdeep: rgba(0,0,0, 0.85);
    --style-border: 1px solid #282829;
    --shadow-border: 0 8px 16px -4px #00000050;
    --secondtext: #a1a2b8;
    --card-bg: #1d1e22;
    --fontcolor: #F7F7FA;
}
[data-theme=light] {
    --maskbgdeep: rgba(255, 255, 255, 0.85);
    --style-border: 1px solid #e3e8f7;
    --shadow-border: 0 8px 16px -4px #2c2d300c;
    --secondtext: rgba(60,60,67,0.8);
    --card-bg: #fff;
    --fontcolor: #363636;
}
#keyboard-tips {
	position: fixed;
	top: 80px;
	left: 80px;
	z-index: 999;
	background: var(--maskbgdeep);
	border-radius: 12px;
	border: var(--style-border);
	padding: 20px;
	display: -webkit-box;
	display: -moz-box;
	display: -webkit-flex;
	display: -ms-flexbox;
	display: box;
	display: flex;
	-webkit-box-orient: vertical;
	-moz-box-orient: vertical;
	-o-box-orient: vertical;
	-webkit-flex-direction: column;
	-ms-flex-direction: column;
	flex-direction: column;
	backdrop-filter: saturate(180%) blur(20px);
	-webkit-backdrop-filter: blur(20px);
	-webkit-transform: translateZ(0);
	-moz-transform: translateZ(0);
	-o-transform: translateZ(0);
	-ms-transform: translateZ(0);
	transform: translateZ(0);
	pointer-events: none;
	-webkit-box-shadow: var(--shadow-border);
	box-shadow: var(--shadow-border);
	-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
	filter: alpha(opacity=0);
	-webkit-transition: .3s;
	-moz-transition: .3s;
	-o-transition: .3s;
	-ms-transition: .3s;
	transition: .3s
}

@media screen and (max-width:768px) {
	#keyboard-tips {
		display: none!important
	}
}

#keyboard-tips .keyboardTitle {
	font-size: 12px;
	color: var(--secondtext);
	line-height: 1
}

#keyboard-tips .keybordList {
	display: -webkit-box;
	display: -moz-box;
	display: -webkit-flex;
	display: -ms-flexbox;
	display: box;
	display: flex;
	-webkit-box-orient: vertical;
	-moz-box-orient: vertical;
	-o-box-orient: vertical;
	-webkit-flex-direction: column;
	-ms-flex-direction: column;
	flex-direction: column;
	margin-top: 8px
}

#keyboard-tips .keybordItem {
	display: -webkit-box;
	display: -moz-box;
	display: -webkit-flex;
	display: -ms-flexbox;
	display: box;
	display: flex;
	margin-top: 4px
}

#keyboard-tips .keyGroup {
	display: -webkit-box;
	display: -moz-box;
	display: -webkit-flex;
	display: -ms-flexbox;
	display: box;
	display: flex;
	-webkit-box-align: center;
	-moz-box-align: center;
	-o-box-align: center;
	-ms-flex-align: center;
	-webkit-align-items: center;
	align-items: center;
	width: 120px;
}

#keyboard-tips .keyGroup .key {
	width: 100%;
	padding: .2em .2em;
	font-family: inherit;
	background-color: var(--card-bg);
	color: var(--fontcolor);
	border: var(--style-border);
	border-color: var(--secondtext);
	border-bottom: 2px solid var(--secondtext);
	-webkit-box-shadow: var(--shadow-border);
	box-shadow: var(--shadow-border);
	border-radius: .25rem;
	overflow-wrap: break-word;
	overflow-x: auto;
	font-weight: 500;
	font-size: .875em;
	margin-right: 4px;
	vertical-align: baseline;
	line-height: 1;
	height: 24px;
	margin-right: 10px;
	text-align: center;
}

```

在主题配置文件`_config.butterfly.yml`中添加下面内容：

```yaml
shortcut:
  enable: true
  keyboard_delay: 300
  keyboard_css: /css/keyboard.css
  items:
    - keycode: 83
      text: S
      action: 站内搜索
      script: $(".search").click()
    - keycode: 82
      text: R
      action: 随机文章
      script: toRandomPost()
    - keycode: 38
      text: ↑
      action: 回到顶部
      script: btf.scrollToDest()
    - keycode: 40
      text: ↓
      action: 前往评论区
      script: location.href='#post-comment'
    - keycode: 37
      text: ←
      action: 回退页面
      script: history.back()
    - keycode: 39
      text: →
      action: 前进页面
      script: history.forward()
    - keycode: 72
      text: H
      action: 返回首页
      script: pjax.loadUrl('/')
    - keycode: 65
      text: A
      action: 关于博主
      script: pjax.loadUrl('/about/')
    - keycode: 76
      text: L
      action: 友情链接
      script: pjax.loadUrl('/link/')
    - keycode: 68
      text: D
      action: 浅色/深色切换
      script: $("#darkmode").click()
    - keycode: 84
      text: T
      action: 简体/繁体切换
      script: $("#translateLink").click()
    - keycode: 77
      text: M
      action: 播放/暂停音乐
      script: aplayers[0].toggle()
    - keycode: 32
      text: Space
      action: 全屏模式切换
      script: fullScreen()
```

`keyboard_delay`表示按下<kbd>Shift</kbd>键后弹出快捷键面板的延迟时间，`items`为快捷键项，其中：

- `keycode`为JavaScript处理键盘事件时，键盘每一个键的标识值，可通过[这个网站](https://www.toptal.com/developers/keycode)测试每个键的keycode值。
- `text`为快捷键面板上对应键的显示文本。
- `action`为快捷键面板上对应快捷键的说明。
- `script`为JavaScript脚本，表示快捷键按下后执行的脚本。

最后，Hexo一键三连即可！
