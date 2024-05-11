---
title: WordPress中短码的嵌套使用
id: 3755
date: 2020-08-06 14:14:42
categories:
  - [博客相关]
tags: ['PHP', 'WordPress']
cover: 
disableNunjucks: true
---

众所周知，短代码是WordPress的一大特色，使用起来相当舒适方便，但短代码默认不能嵌套使用，本文给出一种朴素的方法用来解决这个问题。


在`functions.php`文件中定义一个函数：


```php
function recursive_shortcode($content){
	$new_content = do_shortcode($content);
	while($new_content!=$content){
		$content = $new_content;
		$new_content = do_shortcode($content);
	}
	return $new_content;
}
```

之后为最外层短代码对应函数的返回值套一个`recursive_shortcode`即可。
