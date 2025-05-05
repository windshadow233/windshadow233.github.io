---
title: MCPM：让LLM调用你电脑上的一切工具
disableNunjucks: false
mathjax: false
id: 12471
date: 2025-04-20 22:23:53
categories:
    - 瞎捣鼓经历
tags:
    - LLM
    - MCP
    - MCPM
cover: https://blogfiles.oss.fyz666.xyz/webp/0105b834-95aa-4865-9188-29b1e008a929.webp
swiper_index: 1
description: MCPM：高效利用大语言模型的利器
---

## 前言

自从大语言模型（LLM）诞生以来，至今已有两年多的发展时间。如今市面上的各类 LLM 模型层出不穷，功能趋于同质化，用户的选择越来越多。然而，作为一名 LLM 重度用户，显然不满足于仅在聊天窗口中进行简单的对话式交互——更希望将 LLM 作为智能助手，融入到本地工具链中，提升工作效率并拓展应用边界。这些工具并不局限于诸如 VS Code、JetBrains IDE 等开发环境（这些IDE自身已经提供各种LLM的插件，以辅助代码编写），还包括终端命令行、文件管理器、数据库客户端、甚至是操作系统本身提供的原生命令与服务。将 LLM 与本地工具链深度集成，不仅能够实现自然语言驱动的自动化操作，还可以显著扩展模型的执行能力与实用性。为了实现这一目标，开放式的模型上下文协议（Model Context Protocol, MCP），为我们提供了一个标准化、可扩展的集成方案。

但如果为各种大模型、各种软件分别配置对应的MCP，则会非常的麻烦。很巧的是前两天，一位我关注的UP：严伯钧，发布了一个视频，提到他们团队开发了一个用于一站式管理各种软件MCP的开源软件：MCPM，我一看，欸🤓👆，这不就是我想要的管理工具吗？于是，火速对着文档一通操作，将MCPM安装了下，并试验性地通过它配置了一下Claude Desktop与iTerm2的集成，感觉非常好用，这里简单记录一下配置过程以及使用体验。

首先，本次配置在MacBook上进行，用到了下面两个仓库：

第一个自然就是 MCPM：

{% link mcpm.sh, GitHub, https://github.com/pathintegral-institute/mcpm.sh/ %}

另一个仓库：

{% link iterm-mcp, GitHub, https://github.com/ferrislucas/iterm-mcp %}

用于在大模型的会话中集成与iTerm2的交互。

## 安装并简单配置 MCPM

如仓库Readme文件所述，此软件有多种安装方法，你可以用`brew`、`pip`、`pipx`或`curl`进行安装，我在MacBook上安装，于是使用了`brew`：

```shell
brew install mcpm
```


安装完成后，我们可以看到`mcpm`支持下面几种客户端：

```shell
╰─➤  mcpm client ls
...
                        Supported MCP Clients
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━┳━━━━━━━━━┓
┃ Client Name                     ┃ Installation  ┃ Status ┃ Profile ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━╇━━━━━━━━╇━━━━━━━━━┩
│ 5ire (5ire)                     │ Not installed │        │         │
│ Claude Desktop (claude-desktop) │ Installed     │ ACTIVE │         │
│ Cline (cline)                   │ Not installed │        │         │
│ Continue (continue)             │ Installed     │        │         │
│ Cursor (cursor)                 │ Not installed │        │         │
│ Goose CLI (goose-cli)           │ Not installed │        │         │
│ Roo Code (roo-code)             │ Not installed │        │         │
│ Windsurf (windsurf)             │ Not installed │        │         │
└─────────────────────────────────┴───────────────┴────────┴─────────┘
...
```

Client大概就是指你想接入的大模型，可惜暂时还没有ChatGPT，不知是否支持自定义客户端的接入，后面再研究研究。这里我先接入了Claude Desktop。

{% link Claude Desktop, Claude, https://claude.ai/download %}

执行下面命令激活`claude-desktop`客户端：

```shell
mcpm client set claude-desktop
```

接下来我们可以为此客户端配置服务端接入。然而服务去哪找呢？MCPM提供了一个网站罗列了支持的服务：

{% link MCP Server Registry, mcpm.sh, https://mcpm.sh/registry/ %}

也可通过命令`mcpm search`列出所有（或搜索感兴趣的）服务。

## 集成与iTerm终端的交互

这里我首先尝试了`iterm-mcp`:

```shell
╰─➤  mcpm search iterm
Searching for MCP servers matching 'iterm'
iterm-mcp

Found 1 server(s) matching search criteria
```

一条命令即可：

```shell
mcpm add iterm-mcp
```

我们可以查看这个服务的基本信息：

```shell
╰─➤  mcpm info iterm-mcp
Showing information for MCP server: iterm-mcp
iTerm (iterm-mcp)
Integration with iTerm2 terminal emulator for macOS, enabling LLMs to execute and monitor
terminal commands.

Server Information:
Categories: System Tools
Tags: iTerm, server, automation
Author: ferrislucas
License: MIT

URLs:
Repository: https://github.com/ferrislucas/iterm-mcp
Homepage: https://github.com/ferrislucas/iterm-mcp

Installation Details:
npm: npm installation
Command: npx -y iterm-mcp
```

如此，服务就配置好了，接下来只需重启Claude Desktop，看到如下界面即安装成功：

<img src="https://blogfiles.oss.fyz666.xyz/png/af0d82a3-edd5-496d-a45a-d8e05e60a1f7.png" alt="image-20250420232247306" style="zoom:50%;" />

图中已激活三个MCP工具，分别用来读取终端输出、往终端发送控制字符以及向终端写入/执行命令：

<img src="https://blogfiles.oss.fyz666.xyz/png/eb03cea5-aae3-41de-ab0a-0e7a748b354b.png" alt="image-20250420232321547" style="zoom:50%;" />

{% note danger %}
在使用之前，需要注意几点：
> - The user is responsible for using the tool safely.
> - No built-in restrictions: iterm-mcp makes no attempt to evaluate the safety of commands that are executed.
> - Models can behave in unexpected ways. The user is expected to monitor activity and abort when appropriate.
> - For multi-step tasks, you may need to interrupt the model if it goes off track. Start with smaller, focused tasks until you're familiar with how the model behaves.
> <cite><a href="https://github.com/ferrislucas/iterm-mcp?tab=readme-ov-file#safety-considerations">Safety Considerations of iterm-mcp</a></cite>

总结：你得检查大模型给出的命令是否安全。
{% endnote %}

## 使用示例

这里，我尝试让Claude使用我的本地iTerm终端独立解决[GeekGame 2024的签到题](https://github.com/PKU-GeekGame/geekgame-4th/tree/master/official_writeup/tutorial-signin)。

部分聊天内容如图：

<img src="https://blogfiles.oss.fyz666.xyz/png/ef5f1a3b-f419-436f-b827-9022838859e8.png" alt="image-20250420235343383" style="zoom:50%;" />

对应的终端操作：

<img src="https://blogfiles.oss.fyz666.xyz/png/dab2c403-f96e-4878-b10e-f92aa27b3898.png" alt="image-20250420235448952" style="zoom:50%;" />

最终，Claude在我没有给出任何提示的前提下，独立操作我本地的终端，找到了flag：

<img src="https://blogfiles.oss.fyz666.xyz/png/ffe24038-a3b2-4b9b-b087-cd11ffab1c6d.png" alt="image-20250420235530069" style="zoom:50%;" />

对应的终端操作：

<img src="https://blogfiles.oss.fyz666.xyz/png/c7df279f-01cc-4ec3-8495-530f6723d60d.png" alt="image-20250420235632533" style="zoom:50%;" />

~~以后打CTF只要把题目下载下来并交给Claude挂一晚上等着第二天收获flag就行了~~

---

如此，我们便配置好了`MCPM`，并成功实现了其最基本的使用方法，使得LLM软件能够调用本地工具，展示了其在本地环境中调用iTerm2的方法。未来将尝试更多的相关服务，以提升生产力！