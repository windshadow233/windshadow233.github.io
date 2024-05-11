---
title: MySQL数据库自增主键重置的方法
id: 3744
date: 2020-08-06 12:29:08
categories: [瞎捣鼓经历]
tags: ['MySQL', '数据库']
cover: 
disableNunjucks: false
---

最近做WordPress站点测试某些功能的时候，为数据表添加了几条测试数据，测试完后又将其删除，但自增主键却不会自动重置，对强迫症非常不友好，因此需要进行一些操作来将其重置。

{%tabs tab1%}

<!-- tab 方法一 -->

若数据表是空的，或不需要表中的数据了，可以直接清空并重置自增字段：

```sql
TRUNCATE TABLE 'table_name';
```

但不巧，我不想清空数据表，清空了用户就全没了呀，这时还有另外的方法。

<!-- endtab -->

<!-- tab 方法二 -->


1. 删掉自增主键
2. 重置自增值为1
3. 添加新的自增主键


```sql
ALTER TABLE 'table_name' DROP ID;
ALTER TABLE 'table_name' AUTO_INCREMENT = 1;
ALTER TABLE 'table_name' ADD ID int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;
```

但我在`DROP ID`时遇到了一个奇怪的报错：`Invalid default value for 'xxx'`（某日期字段）

将该字段的类型从`DATETIME`换成了`TIMESTAMP`，并令其默认值为`CURRENT_TIMESTAMP`，问题解决。

<!-- endtab -->

{%endtabs%}


不过，由于`wp_usermeta`这张表含有用户信息，在做上面操作之前，可以先将信息和原来的用户ID之间做一个对应关系的备份。
