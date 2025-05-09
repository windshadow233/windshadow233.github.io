---
title: MCP服务编写实践
disableNunjucks: false
mathjax: false
id: 12561
date: 2025-05-05 23:07:48
categories:
    - 瞎捣鼓经历
tags:
    - LLM
    - MCP
cover: https://blogfiles.oss.fyz666.xyz/webp/712eb975-8859-44dc-9878-985f2775b0d9.webp
---

## 动机

前文曾提到可以使用MCPM管理各种现成的MCP服务以使得大语言模型接入许多现成工具，那么自然会想要自己写一个适合自身需求的工具来让大模型调用，本文就来简单记录一下这个过程。

关于MCP服务的编写，GitHub上已经有了现成的仓库了：

{% link modelcontextprotocol, GitHub, https://github.com/modelcontextprotocol/ %}

作为一名练习时长两个两年半的Python练习生，我选择了其中的[Python SDK](https://github.com/modelcontextprotocol/python-sdk)。

## 配置环境

这个Python SDK支持的Python版本为：>=3.10，并且最好使用`uv`管理环境。

因此先安装`uv`：

```shell
curl -LsSf https://astral.sh/uv/install.sh | sh
```

`uv`安装完成后，初始化项目目录：

```shell
uv init mcp_server
```

该操作会生成一些配置文件，以及一个虚拟环境，检查`.python-version`以及`pyproject.toml`里面Python的版本，需要>=3.10，如不满足则手动修改，然后运行`uv venv`，即可重置环境。

接下来安装这个SDK：

```shell
uv add "mcp[cli]"
```

## 编写代码

这里，我们让LLM来做一件简单的事：列出我桌面上的所有文件

编写`main.py`：

```python
import os
from mcp.server.fastmcp import FastMCP

mcp = FastMCP('windshadow-universe')


@mcp.tool()
async def list_desktop_files():
    """列出桌面上的文件"""
    return os.listdir(os.path.expanduser('~/Desktop'))

```

## 配置Claude Desktop

在Claude Desktop的配置文件（`claude_desktop_config.json`）中添加一项：

```json
{
  "mcpServers": {
    ...
    "windshadow-universe": {
      "command": "/absolute/path/to/uv",
      "args": [
        "run",
        "--project",
        "/absolute/path/to/project/dir/mcp_server",
        "mcp",
        "run",
        "/absolute/path/to/project/dir/mcp_server/main.py"
      ]
    }
  }
}
```

这里有三个绝对路径需要替换，分别是`uv`的绝对路径、通过`uv`初始化生成的项目目录`mcp_server`的绝对路径，以及前面创建的`main.py`文件的绝对路径。如使用相对路径则会失败（

接下来打开Claude Desktop，并让它列出我的桌面文件，Claude会作出回应调用我们刚刚写的函数：

<img src="https://blogfiles.oss.fyz666.xyz/png/2f4a0278-2484-4935-bb62-a94509868826.png" alt="image-20250509144540460" style="zoom:50%;" />

---

然而并不是很想给Claude打钱，求求ChatGPT Desktop赶紧更新MCP支持🙏🙏🙏。

<img src="https://blogfiles.oss.fyz666.xyz/png/02965303-13e0-4698-9713-4559fa9eb418.png" alt="image-20250505234832457" style="zoom:50%;" />
