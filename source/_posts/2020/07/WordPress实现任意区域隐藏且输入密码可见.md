---
title: WordPress实现任意区域隐藏且输入密码可见
id: 2784
date: 2020-07-24 13:14:58
categories:
  - [博客相关]
tags: ['PHP', 'WordPress']
cover: 
disableNunjucks: false
---

本文参考自下面文章：

{%link WordPress文章部分内容隐藏输入密码后可见,www.luoxiao123.cn, http://www.luoxiao123.cn/1399-2.html %}


WordPress自带了页面单独加密的功能，但好像只能加密整个页面，无法进行页面局部内容加密，因此我寻找了一种可以隐藏任意区域、输入密码可见的代码实现，且重写了前端ajaxfy.js的代码以使该功能通过ajax加载。

首先在functions.php文件中加入以下代码：

```php
function e_secret($atts, $content=null){
    extract(shortcode_atts(array('key'=>null), $atts));
    if(isset($_POST['e_secret_key']) && $_POST['e_secret_key']==$key){
        return $content;
    }
    else{
        return '
<form class="e-secret" action="'.get_permalink().'" method="post" name="e-secret"><label>输入密码查看加密内容：</label><input type="password" name="e_secret_key" class="euc-y-i" maxlength="50"><input type="submit" class="euc-y-s" value="确定">
<div class="euc-clear"></div>
</form>
';
    }
}
add_shortcode('secret','e_secret');
```

之后就可以利用短代码来隐藏区域了。


另外若有ajax加载内容的需求，只需要按下面代码中的注释向中提到的ajaxfy.js文件中（文件[见这篇文章](/blog/1973/)）添加或修改JS代码:

```js
let ajax_secret_form ＝ "e-secret";
// ajaxloadPageInit函数添加一段:
jQuery('.' + ajax_secret_form).each(function(index) {
        if (jQuery(this).attr("action")) {
            jQuery(this).submit(function() {
            	  let ajaxsecretPath = jQuery(this).attr("action");
                submitSecretPwd(ajaxsecretPath, jQuery(this).serialize());
                return false;
            });
        }
    });
// ajaxloadPage修改部分如下:
// 增加一个参数method, 默认为'GET'
function ajaxloadPage(url, push, getData ,method='GET'){
       ...
       ...
        // 修改type为method
                jQuery.ajax({
                    type: method,
                    url: url,
       ...
       ...
}
// 新增一个函数
function submitSecretPwd(url, params){
	if (!ajaxisLoad){
            ajaxloadPage(url, 0, params, method="POST");
        }
}
```