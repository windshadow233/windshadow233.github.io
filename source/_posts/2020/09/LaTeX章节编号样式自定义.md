---
title: LaTeX章节编号样式自定义
id: 5130
date: 2020-09-14 12:18:38
categories:
  - [学习笔记]
tags: ['LaTeX']
cover: 
disableNunjucks: true
---

在使用Latex写文章时，经常不满足于默认的章节编号样式，故有自定义编号样式的需求，例如需要改成中文的编号等等。本文总结了一些常见编号样式的修改方法。


```latex
%section
%修改编号为数字
\renewcommand\thesection{\arabic{section}}
%修改编号为小写字母
\renewcommand\thesection{\alph{section}}
%修改编号为大写字母
\renewcommand\thesection{\Alph{section}}
%修改编号为中文数字(需要导入ctex宏包)
\renewcommand\thesection{\chinese{section}}
```

其他诸如`subsection`之类的同理操作即可。
