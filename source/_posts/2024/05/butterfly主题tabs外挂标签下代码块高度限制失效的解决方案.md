---
title: Butterfly主题tabs外挂标签下代码块高度限制失效的解决方案
disableNunjucks: false
mathjax: false
id: 11402
date: 2024-05-10 14:22:11
categories:
  - [博客相关]
  - [Debug]
  - [Hexo魔改]
tags:
  - Hexo
  - JavaScript
  - Butterfly主题
  - Web前端
cover:
---

Hexo的Butterfly主题带有一些特有的、非Markdown语法的外挂标签，作为一种写作语法扩展非常好用。然而在使用`tabs`标签时，遇到了内部代码块高度限制失效的问题。

---

我在Butterfly的主题文件中设置了代码块的高度限制：

```yaml
highlight_height_limit: 300 # unit: px
```

一般情况下，当代码块高度超过300px时便会隐藏超出范围的代码，并添加一个展开按钮，但这个特性在tabs标签下的非默认tab中失效。

审计了渲染代码后，我找到了处理这部分逻辑的代码，其位于主题目录下的`source/js/main.js`文件中的`createEle`函数：

```js
const createEle = (lang, item, service) => {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
        btf.addEventListenerPjax(hlTools, 'click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        btf.addEventListenerPjax(ele, 'click', expandCode)
        fragment.appendChild(ele)
      }

      if (service === 'hl') {
        item.insertBefore(fragment, item.firstChild)
      } else {
        item.parentNode.insertBefore(fragment, item)
      }
    }
```

由于`display:none`的元素其`offsetHeight`会变成0，导致无法进入函数中间的那个if语句，也就无法按我们的需求进行渲染。

而对于这个问题，早就有了现成的解决方案。

{% tabs tab1 %}

<!-- tab 使用 jQuery Actual 插件 -->

我们可以引入[jQuery Actual插件](https://github.com/dreamerslab/jquery.actual)，通过它来获取隐藏元素的实际高度：

在butterfly的主题文件中`inject.head`项下引入jquery.actual文件：

```yaml
- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.actual/1.0.19/jquery.actual.min.js"></script>
```

{% note info %}

该文件还依赖于：jQuery >= 1.2.3

{% endnote %}

然后修改`themes/butterfly/source/js/main.js`中的`createEle`函数：

```diff
--- a/themes/butterfly/source/js/main.js
+++ b/themes/butterfly/source/js/main.js
@@ -134,8 +134,9 @@ document.addEventListener('DOMContentLoaded', function () {
         btf.addEventListenerPjax(hlTools, 'click', highlightToolsFn)
         fragment.appendChild(hlTools)
       }
 
-      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
+      if (highlightHeightLimit && $(item).actual('height') > highlightHeightLimit + 30) {
         const ele = document.createElement('div')
         ele.className = 'code-expand-btn'
         ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
```

<!-- endtab -->

<!-- tab 使用原生JS解决 -->

毕竟为了一处小问题引入一个新的东西有点臃肿，不愿意引入jQuery的话还可以用原生JS解决。阅读了jQuery Actual的代码后我发现它是通过将隐藏起来的块暂时修改为：`visibility: hidden; display: block;`来获取它的高度，这是因为`visibility: hidden;`状态虽然也是隐藏，但仍会占据页面空间。在取得其高度后再恢复原有的样式。于是我们可以手写这个逻辑，来修改`themes/butterfly/source/js/main.js`：

```diff
--- a/themes/butterfly/source/js/main.js
+++ b/themes/butterfly/source/js/main.js
@@ -124,6 +124,39 @@
       this.classList.toggle('expand-done')
     }
 
+    const getActualHeight = function (item) {
+      let tmp = []
+      let hidden = []
+      function fix() {
+      
+          let current = item
+          while (current !== document.body && current != null) {
+              if (window.getComputedStyle(current).display === 'none') {
+                  hidden.push(current)
+              }
+              current = current.parentNode
+          }
+          let style = 'visibility: hidden !important; display: block !important; '
+  
+          hidden.forEach(function (elem) {
+              var thisStyle = elem.getAttribute('style') || ''
+              tmp.push(thisStyle)
+              elem.setAttribute('style', thisStyle ? thisStyle + ';' + style : style)
+          })
+      }
+      function restore() {
+          hidden.forEach((elem, idx) => {
+              let _tmp = tmp[idx]
+              if( _tmp === '' ) elem.removeAttribute('style')
+              else elem.setAttribute('style', _tmp)
+          })
+      }
+      fix()
+      let height = item.offsetHeight
+      restore()
+      return height
+    }
+
     const createEle = (lang, item, service) => {
       const fragment = document.createDocumentFragment()
 
@@ -135,7 +168,7 @@
         fragment.appendChild(hlTools)
       }
 
-      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
+      if (highlightHeightLimit && getActualHeight(item) > highlightHeightLimit + 30) {
         const ele = document.createElement('div')
         ele.className = 'code-expand-btn'
         ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
```

<!-- endtab -->

{% endtabs %}

---

在作者的提示下才发现文档里已经有写：

{% link 代码高度限制,Butterfly,https://butterfly.js.org/posts/4aa8abbe/#%E4%BB%A3%E7%A2%BC%E9%AB%98%E5%BA%A6%E9%99%90%E5%88%B6 %}

- 不适用于隐藏后的代码块（ css 设置 display: none）

看来这是主题的预期行为。不过我个人认为让隐藏的代码块同样折叠起来更为合理。
