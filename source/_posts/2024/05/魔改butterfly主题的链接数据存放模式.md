---
title: 魔改Butterfly主题的链接数据存放模式
disableNunjucks: false
mathjax: false
id: 11475
date: 2024-05-15 00:28:25
categories:
  - [博客相关]
  - [Hexo魔改]
tags:
  - Hexo
  - Butterfly主题
cover:
---

Butterfly主题在版本`4.0.0`引入了友情链接的`json`远程拉取：

{% link 友情链接添加,Butterfly,https://butterfly.js.org/posts/dc584b87/#%E5%8F%8B%E6%83%85%E9%8F%88%E6%8E%A5 %}

大意是在front-matter中设置`flink_url`（指向一个`json`文件链接）来导入`json`格式的数据。

该主题还有另一种友情链接文件存放模式，是将`link.yml`放在网站的`source/_data`目录下，然后在页面的front-matter中设置`type: "link"`来自动读取此文件。

然而这两种不同模式的存在让我觉得很不自然，尤其是前面提到的第二种模式下把文件路径`source/_data/link.yml`写死而不支持自定义的行为。我觉得更加自然的方式应该是将所有链接数据文件都以相同的格式（比如都是`yaml`）存放在`source/_data`目录下，然后通过一个字段来指定`link`页面读取的是哪个文件。虽然远程拉取的模式支持从外部网站导入`json`，但通常情况下不会有这种需求（至少我没有）。

于是开始魔改主题文件，在改之前，我总结了一下我的需求：

- 所有链接数据文件以`yaml`格式存放在`source/_data`目录。
- 在`type: "link"`的页面下定义front-matter字段`flink_file`，通过该字段指示需要读取的文件（省略`yaml`文件扩展名）。
- `flink_file`字段不存在时，默认读取`source/_data/link.yml`。

修改主题文件`themes/butterfly/layout/includes/page/flink.pug`如下：

```diff
--- a/themes/butterfly/layout/includes/page/flink.pug
+++ b/themes/butterfly/layout/includes/page/flink.pug
@@ -1,10 +1,10 @@
 #article-container
   .flink
-    - let { content, random, flink_url } = page
+    - let { content, random, flink_file } = page
     - let pageContent = content
+    - const linkData = flink_file ? site.data[flink_file] : site.data.link || false
 
-    if flink_url || random
-      - const linkData = flink_url ? false : site.data.link || false
+    if random
       script.
         (()=>{
           const replaceSymbol = (str) => {
@@ -44,39 +44,32 @@
           }
 
           const linkData = !{JSON.stringify(linkData)}
-          if (!{Boolean(flink_url)}) {
-            fetch("!{url_for(flink_url)}")
-              .then(response => response.json())
-              .then(add)
-          } else if (linkData) {
-            add(linkData)
-          }
+          add(linkData)
         })()
 
     else
-      if site.data.link
-        - let result = ""
-        each i in site.data.link
-          - let className = i.class_name ? markdown(`## ${i.class_name}`) : ""
-          - let classDesc = i.class_desc ? `<div class="flink-desc">${i.class_desc}</div>` : ""
+      - let result = ""
+      each i in linkData
+        - let className = i.class_name ? markdown(`## ${i.class_name}`) : ""
+        - let classDesc = i.class_desc ? `<div class="flink-desc">${i.class_desc}</div>` : ""
 
-          - let listResult = ""
+        - let listResult = ""
 
-          each j in i.link_list
-            - 
-              listResult += `
-                <div class="flink-list-item">
-                  <a href="${j.link}" title="${j.name}">
-                    <div class="flink-item-icon">
-                      <img class="no-lightbox" src="${j.avatar}" onerror='this.onerror=null;this.src="${url_for(theme.error_img.flink)}"' alt="${j.name}" />
-                    </div>
-                    <div class="flink-item-name">${j.name}</div> 
-                    <div class="flink-item-desc" title="${j.descr}">${j.descr}</div>
-                  </a>
-                </div>`
-            -
+        each j in i.link_list
+          - 
+            listResult += `
+              <div class="flink-list-item">
+                <a href="${j.link}" title="${j.name}">
+                  <div class="flink-item-icon">
+                    <img class="no-lightbox" src="${j.avatar}" onerror='this.onerror=null;this.src="${url_for(theme.error_img.flink)}"' alt="${j.name}" />
+                  </div>
+                  <div class="flink-item-name">${j.name}</div> 
+                  <div class="flink-item-desc" title="${j.descr}">${j.descr}</div>
+                </a>
+              </div>`
+          -
 
-          - result += `${className}${classDesc} <div class="flink-list">${listResult}</div>`
+        - result += `${className}${classDesc} <div class="flink-list">${listResult}</div>`
 
-        - pageContent = result + pageContent
+      - pageContent = result + pageContent
     != pageContent
```

大功告成！
