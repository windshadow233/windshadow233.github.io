---
title: WordPress记录、显示文章阅读次数
id: 4968
date: 2020-09-01 10:41:37
categories:
  - [博客相关]
tags: ['PHP', 'Web后端', 'WordPress']
cover: 
disableNunjucks: true
---

在使用WP建站时，我们可能会需要知道文章的受欢迎程度，其可以体现于其他人阅读文章的次数。今天我就提供一种简单的用以给文章浏览量进行计数的功能。

思路是在head部分加载的过程中执行一个计数+1的动作，将计数存入数据库的`wp_postmeta`表。在需要时将表中对应数据读出来即可。


将以下代码加入`functions.php`：

```php
function post_views(){
	global $post;
	$post_ID = $post->ID;  
	$views = (int)get_post_meta($post_ID, 'visitors', true);
	return '阅读（' .$views .'）';
}
function record_visitors()  
{ 
	$currentUser = wp_get_current_user();
	if(empty($currentUser->roles) || !in_array('administrator', $currentUser->roles)) 
		if (is_single()||is_page()) { 
			global $post;
			$post_ID = $post->ID;
			if($post_ID) {  
				$post_views = (int)get_post_meta($post_ID, 'visitors', true);  
				if(!update_post_meta($post_ID, 'visitors', ($post_views+1))) {  
					add_post_meta($post_ID, 'visitors', 1, true); 
				}  
			}  
	}  
}
add_action('wp_head', 'record_visitors');
```

在需要调用本页阅读次数的地方插入以下代码：

```php
<?php echo post_views(); ?>
```