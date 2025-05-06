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

我希望让LLM为我处理一个PDF格式的账单文件，将它其中的数据条目进行细致的分类，再生成csv，因此我额外安装了两个库：

```shell
uv add pdfplumber pandas
```

编写`cash_classifier.py`：

```python
from mcp.server.fastmcp import FastMCP
import os
import json

import pdfplumber
import logging
logging.getLogger("pdfminer").setLevel(logging.ERROR)

mcp = FastMCP('cash-classifier')


@mcp.tool()
async def parse_cashbook(filapath):
    """解析pdf账单，将表格提取出来
    Args:
        filepath: 字符串，账单文件绝对路径
    """
    with pdfplumber.open(filapath) as pdf:
        data = []
        headers = ['交易时间', '收/支', '交易分类', '收/付款方式', '金额', '流水归属', '交易对方', '备注']
        for page in pdf.pages:
            table = page.extract_tables()[0]
            for row in table[1:]:
                number = float(row[3].replace(',', ''))
                data.append([
                    row[0],
                    '支出' if number < 0 else '收入',
                    row[5],
                    row[6],
                    abs(number),
                    '',
                    row[9],
                    row[8]
                ])
            data.append(table[1:])
    return json.dumps({
        'headers': headers,
        'data': data
    }, ensure_ascii=False, indent=None, separators=(',', ':'))

```

这里暂时只实现了解析PDF文件并转为JSON字符串的逻辑。

## 配置Claude Desktop

在Claude Desktop的配置文件（`claude_desktop_config.json`）中添加一项：

```json
{
  "mcpServers": {
    ...
    "cash-classifier": {
      "command": "/absolute/path/to/uv",
      "args": [
        "run",
        "--project",
        "/absolute/path/to/project/dir/mcp_server",
        "mcp",
        "run",
        "/absolute/path/to/project/dir/mcp_server/cash_classifier.py"
      ]
    }
  }
}
```

这里有三个绝对路径需要替换，分别是`uv`的绝对路径、通过`uv`初始化生成的项目目录`mcp_server`的绝对路径，以及前面创建的`cash_classifier.py`文件的绝对路径。如使用相对路径则会失败（

接下来打开Claude Desktop，并让它解析账单内容，Claude会作出回应调用我们刚刚写的函数：

<img src="https://blogfiles.oss.fyz666.xyz/png/9dda4212-0a0a-4d99-9354-6c1797bf03b0.png" alt="image-20250505234328124" style="zoom:50%;" />

可见Claude已经成功调用我们写的函数，解析得到账单的信息了，然而：

<img src="https://blogfiles.oss.fyz666.xyz/png/17ddfcea-7891-45ae-b213-946c9a95ef7b.png" alt="image-20250505234414773" style="zoom:50%;" />

草。因此后续的处理流程还没有写。

---

然而并不是很想给Claude打钱，求求ChatGPT Desktop赶紧更新MCP支持🙏🙏🙏。

<img src="https://blogfiles.oss.fyz666.xyz/png/02965303-13e0-4698-9713-4559fa9eb418.png" alt="image-20250505234832457" style="zoom:50%;" />
