---
title: WordPress小工具标签云参数自定义
id: 4966
date: 2020-09-01 10:37:11
categories:
  - [博客相关]
tags: ['PHP', 'Web后端', 'WordPress']
cover: 
disableNunjucks: true
---

WP小工具有一个自带的标签云功能，可以为访客提供站点常用的关键词列表，便于访客在站内进行搜索。

标签云的生成函数`wp_tag_cloud`位于`/wp-includes/category-template.php`文件中，提供的参数数组如下：

```php
$defaults = array(
		'smallest'   => 8,
		'largest'    => 22,
		'unit'       => 'pt',
		'number'     => 45,
		'format'     => 'flat',
		'separator'  => "\n",
		'orderby'    => 'count',
		'order'      => 'DESC',
		'exclude'    => '',
		'include'    => '',
		'link'       => 'view',
		'taxonomy'   => 'post_tag',
		'post_type'  => '',
		'echo'       => true,
		'show_count' => 0,
	);
```

另外小工具中为标签云提供了一个参数解析过滤器`widget_tag_cloud_args`，这个过滤器可以直接修改小工具中标签云的参数，将以下代码插入`functions.php`，就可以对小工具中的标签云参数进行修改。

```php
//小工具标签云
function my_tag_cloud_args( $args ){
	$new_args = array(
		'number'     => 20,
		'order'      => 'RAND',
	);
	$args = array_merge( $args, $new_args );
	return $args;
}
add_filter('widget_tag_cloud_args', 'my_tag_cloud_args');
```

其中在`$new_args`数组中填入新的参数即可。
