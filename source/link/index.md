---
title: 友情链接
date: 2024-04-07 23:41:53
type: "link"
aside: false
flink_file: "link"
top_img: false
---

<script>
function copyFlinkTemplate() {
    const text = `\`\`\`yaml
- name: #博客名称
  link: #博客地址
  avatar: #博客头像
  descr: #简单介绍一下～
  feed: #博客订阅链接
\`\`\``;
    navigator.clipboard.writeText(text).then(function() {
        Snackbar.show({
            text: '已复制模板！快去评论区留言吧～',
            pos: 'top-right',
            showAction: false
        });
    }, function(err) {
        Snackbar.show({
            text: '好像没复制成功，或许检查一下剪切板权限？',
            pos: 'top-right',
            showAction: false
        });
    });
    e.dispatchEvent(t);
}
</script>

## 如何申请友链?

{% btn 'javascript:copyFlinkTemplate();',快速复制模板,far fa-hand-point-right,outline blue larger %}

{% hideToggle 我的友链信息 %}

{% note primary simple %}

- 我的名称: 逸风亭 / Shelter for Wind
- 网站地址: `https://blog.fyz666.xyz/`
- 网站图标: `https://s2.loli.net/2025/04/12/KqFxMtPRpu5bjTy.webp`
- 描述: 行所欲行，无问西东。(您也可自己归纳)

{% endnote %}

{% tabs templates %}

<!-- tab Butterfly -->
```yaml
- name: 逸风亭
  link: https://blog.fyz666.xyz/
  avatar: https://s2.loli.net/2025/04/12/KqFxMtPRpu5bjTy.webp
  descr: 行所欲行，无问西东。
```
<!-- endtab -->

<!-- tab Candy -->
```yaml
- name: 逸风亭
  link: https://blog.fyz666.xyz/
  avatar: https://s2.loli.net/2025/04/12/KqFxMtPRpu5bjTy.webp
  descr: 行所欲行，无问西东。
  siteshot: https://s2.loli.net/2025/04/12/r8qHDfvZocJCgdO.webp
```
<!-- endtab -->

<!-- tab Fluid -->
```yaml
- {
  title: '逸风亭',
  intro: '行所欲行，无问西东。',
  link: 'https://blog.fyz666.xyz/',
  image: 'https://s2.loli.net/2025/04/12/KqFxMtPRpu5bjTy.webp'
}
```
<!-- endtab -->

<!-- tab JSON -->
```json
{
  "title": "逸风亭",
  "link": "https://blog.fyz666.xyz/",
  "avatar": "https://s2.loli.net/2025/04/12/KqFxMtPRpu5bjTy.webp",
  "descr": "行所欲行，无问西东。"
}
```
<!-- endtab -->

<!-- tab HTML -->
```markup
<a href="https://blog.fyz666.xyz/ rel="external nofollow">逸风亭</a>
```
<!-- endtab -->

<!-- tab Jade -->
```pug
a(href='https://blog.fyz666.xyz/' rel="external nofollow") 逸风亭
```
<!-- endtab -->

{% endtabs %}

{% endhideToggle %}
