---
title: 使用GitHub Actions自动部署Hexo博客
disableNunjucks: false
mathjax: false
id: 11277
date: 2024-05-05 17:51:57
categories:
  - [博客相关]
tags:
  - GitHub
  - GitHub Actions
  - Hexo
cover:
---

为了更好地备份我的博客，我将其源码推送到了一个GitHub仓库。之前了解过一点GitHub Actions，遂想着通过这个东西来自动部署博客到我的服务器，一方面可以熟悉一下GitHub Actions的操作，另一方面顺便解决了在没有带电脑的时候无法修改博客的问题。

---

## 设置环境变量

创建一个SSH密钥，用于此仓库远程连接服务器。

```bash
ssh-keygen -t rsa -b 4096 -C "git@github.com:windshadow233/blog.git"
```

这里，`windshadow233/blog`是我的仓库名。

将此公钥上传到服务器，并将私钥粘贴到仓库的secrets下，命名为`SSH_PRIVATE_KEY`：

![image-20240505194134676](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/5ad4b9aae071cf3ea297ddc88713fd76.png)

创建变量`SERVER_IP`，值为服务器的ip地址：

![image-20240505194228194](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/3f3d7454c0b67a312900b0610169c95c.png)

## 创建workflow文件

在仓库根目录创建目录：`.github/workflows/`，然后在该目录下创建文件：`deploy.yml`

```yaml
name: Deploy Site

on:
  push:
    branches:
      - main
    paths:
      - 'source/**'
      - 'themes/**'
      - '_config.yml'
      - '_config.butterfly.yml'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up Node
      uses: actions/setup-node@v4
      with:
        node-version: '21.7.1'
    - name: Cache Node modules
      uses: actions/cache@v4
      with:
        path: node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-

    - name: Install Dependencies
      run: npm install

    - name: Generate Static Files
      run: npm run b

    - name: Set up SSH key
      uses: webfactory/ssh-agent@v0.9.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Deploy with Rsync
      run: |
        ssh-keyscan -p 22 -H ${{ vars.SERVER_IP }} >> ~/.ssh/known_hosts
        rsync -avz --delete -e "ssh -p 22" ./public/ root@${{ vars.SERVER_IP }}:/var/www/blog/

```

其中`npm run b`是我定义在`package.json`文件中的命令。上述文件表示在检测到`main`分支的`source/,themes/`目录以及配置文件的发生变更时，自动触发GitHub Actions。

自此，GitHub Actions配置完成，现在对仓库提交commit时就会自动触发Hexo的部署流程。
