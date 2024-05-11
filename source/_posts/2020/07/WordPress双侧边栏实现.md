---
title: WordPress双侧边栏实现
id: 1830
date: 2020-07-17 16:03:22
categories:
  - [博客相关]
tags: ['PHP', 'Web前端', 'WordPress', '网站美化']
cover: 
disableNunjucks: true
---

制作WordPress主页时，由于不是所有主题都带有两个侧栏，有可能会遇到单个侧边栏不够用的情况：当侧边栏内容过多时，就会显得很长。因此我研究了一下如何为单侧栏主题再加上一个侧栏。（本文针对的是我自己用的主题，仅代表一种思路，若代码能力不强，一点WordPress框架都不懂建议还是别改了）

我的WordPress使用的主题是LineDay，默认文章页在左侧，带有右侧栏。默认的主题格外空旷，两边都有很大的边距，感觉有点浪费，因此考虑把宽度弄大一点，再带上一个左侧栏，放一些无关紧要的东西，同时在手机端下隐藏左侧栏。


首先需要简单了解WordPress侧边栏的生成原理。我了解到需要先在主题文件下的functions.php里注册一个sidebar，下面是我找到的一个示例：

```php
if ( function_exists('register_sidebar') )
    register_sidebar(array('name'=>'sidebar1',
        'before_widget' => '',
        'after_widget' => '',
        'before_title' => '<h2>',
        'after_title' => '</h2>',
));
```

但我随手粘贴上去，发现样式不对（样式对就怪了），因此我找到了我的主题文件里类似的一段代码，即为主题自带的侧边栏样式：

```php
register_sidebar( array(
        'name'          => __( 'Sidebar', 'lineday' ),
        'id'            => 'sidebar-1',
        'before_widget' => '<aside id="%1$s" class="widget %2$s">',
        'after_widget'  => '</aside>',
        'before_title'  => '<h1 class="widget-title">',
        'after_title'   => '</h1>',
    ) );
```

将其复制到functions.php文件里，然后将`id`原先的`sidebar-1`改成`sidebar-2`即可。以上这段代码出现在主题文件的library文件夹下widgets.php文件里。


接下来需要在模板文件中导入这个侧栏。方法也很简单，先来摸透导入侧边栏的原理，主题文件里有一个sidebar.php的文件，打开一看发现只有一句看似有用的代码：



```php
<div id="secondary" class="widget-area col-sm-12 col-md-4" role="complementary" itemscope="itemscope" itemtype="http://schema.org/WPSideBar">
	<?php dynamic_sidebar('sidebar-1'); ?>
</div>
```

另外还有一个page.php的文件，其中有一句`<?php get_sidebar(); ?>`


通过官方文档了解到`get_sidebar()`函数的用法是这样的：`get_sidebar($name)`可以调用引入sidebar-name.php文件，默认为None。


于是我重新建立了sidebar-left.php与sidebar-right.php文件，分别引入以下两段代码：



```php
<?php
/**
 * The sidebar containing the main widget area.
 *
 * @package _s
 */
if (!is_active_sidebar('sidebar-1')) {
	return;
}
?>
<div id="secondary" class="widget-area hidden-xs hidden-sm col-md-3" role="complementary" itemscope="itemscope" itemtype="http://schema.org/WPSideBar">
	<?php dynamic_sidebar('sidebar-1'); ?>
</div>
<!-- #secondary -->
```


```php
<?php
/**
 * The sidebar containing the main widget area.
 *
 * @package _s
 */
if (!is_active_sidebar('sidebar-2')) {
	return;
}
?>
<div id="tertiary" class="widget-area col-sm-12 col-md-3" role="complementary" itemscope="itemscope" itemtype="http://schema.org/WPSideBar">
	<?php dynamic_sidebar('sidebar-2'); ?>
</div>
<!-- #teritary -->
```

其中div的bootstrap响应式类根据需求来调整即可。


接下来只要去主题中所有模板文件（需要引入sidebar的地方）中引入这两个sidebar。


在`get_header(); ?>`后面添上

```plaintext
<?php get_sidebar('left'); ?>
```

在`<?php get_footer(); ?>`前面添上

```php
<?php get_sidebar('right'); ?>
```

即可添加左右两个侧边栏到主页上。最后别忘了调整一下中间元素（一般id是primary）的响应式类。


另外需要调整一下页面的宽度以避免过挤，只需要去自定义css里面手动调整container类的宽度即可。
