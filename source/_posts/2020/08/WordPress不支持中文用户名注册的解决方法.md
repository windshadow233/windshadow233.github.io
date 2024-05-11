---
title: WordPress不支持中文用户名注册的解决方法
id: 4932
date: 2020-08-28 10:03:05
categories:
  - [Debug]
  - [博客相关]
tags: ['PHP', 'WordPress']
cover: 
disableNunjucks: true
---

WP默认是不支持中文用户名的，但身为中国人这岂能忍，本文带给大家一种方法，让WP支持中文用户名注册。


WP对注册用户名的限制写在`/wp-includes/formatting.php`文件中，对应函数是`sanitize_user`，其中限制中文的原因来自下面代码：


```php
if ( $strict ) {
		$username = preg_replace( '|[^a-z0-9 _.\-@]|i', '', $username );
	}
```

在`$strict=true`时该语句将所有的非ASCII字符全过滤掉了。解决方法如下：


在functions.php文件中加入以下回调函数进行过滤：

```php
// 支持中文用户名注册
function zh_sanitize_user ($username, $raw_username, $strict) {

	$username = wp_strip_all_tags( $raw_username );
	$username = remove_accents( $username );
	
	$username = preg_replace( '|%([a-fA-F0-9][a-fA-F0-9])|', '', $username );
	$username = preg_replace( '/&.+?;/', '', $username );

	if ($strict) {
		$username = preg_replace ('|[^a-z\p{Han}0-9 _.\-@]|iu', '', $username);
	}

	$username = trim( $username );
	$username = preg_replace( '|\s+|', ' ', $username );

	return $username;
}
add_filter('sanitize_user', 'zh_sanitize_user', 10, 3);
```

接下来就可以用中文进行注册啦~另外还有一个问题是中文用户名有长度不超过5的限制，对于该问题，我经过研究发现是php对utf-8字符的长度判断函数有一点问题，具体出问题的代码发生在`/wp-includes/wp-db.php`文件，问题出在`strip_invalid_text`函数，问题的根本原因是其将中文进行了URL编码且当成普通的ACSII字符来计算长度了，我这里直接将大约2430行处的以下代码进行了注释：

```php
$converted_data = $this->strip_invalid_text( $data );

if ( $data !== $converted_data ) {
	return false;
}
```

这样做可能有一定的风险，应该还有更好的方法。
