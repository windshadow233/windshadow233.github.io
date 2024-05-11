---
title: Python、C++混合编程环境搭建及简单示例
id: 5253
date: 2021-02-27 12:54:34
categories: [瞎捣鼓经历]
tags: ['Boost', 'C++', 'Python']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/42c4921136f957fddf4bc110dada1982.png
disableNunjucks: false
---

Python以其极高的开发效率著称，而C++作为一种编译型语言，在运行效率上鹤立鸡群。开发效率，我所欲也，运行效率，亦我所欲也，二者可得兼乎？可！

近期在复现DeepMind的Alpla Zero算法时，我面临如下一种需求：既需要快速地把算法实现出来，又要努力保证其运行效率（算法的核心部分：蒙特卡洛树搜索用python实现需要消耗巨量时间），因此开始零基础尝试python、C++混合编程，试图用C++实现蒙特卡洛树搜索部分，并在python中调用（在此之前本人几乎无任何C++编程经验）


简单了解了下，这里推荐一下自我感觉API用户友好程度比较高的一个C++库——Boost。但u1s1，这个库的环境搭建过程中坑实在是多，网上资料也并不是特别多，因此在此记录一下。

{% link Boost官网,www.boost.org,https://www.boost.org/ %}


由于一般代码都是搬去Linux服务器上运行，因此本文将介绍的是Linux系统下的环境搭建。


## 版本说明


- 系统版本：Ubuntu20.04，64位（低版本应该也没什么关系，不过必须是64位，否则需要将后面编译的版本都修改为32位）
- gcc，g++版本9.3.0（稍低一些也可，比如7+应该也够用）
- Boost 1.75.0（当前最新）
- Python 3.8.5
- numpy 1.20.1

其中Python一般要3以上版本，(2版本的情况，会更好装，不再赘述)，numpy的版本需要做好对应，比如1.20.1的版本下编译出来的库，到1.19版本的环境里可能会跑不了。


## 安装基本的软件


首先去Boost官网上下载最新版本的Boost库，选择Unix版本的[boost_1_75_0.tar.gz](https://boostorg.jfrog.io/artifactory/main/release/1.75.0/source/boost_1_75_0.tar.gz) 下载到Linux系统下，解压。


确保环境下已经安装好了Python3，同时该python已安装numpy，找到该python安装目录下的如下两个路径并记住：包含目录，例如/usr/local/python3/include/python3.8；静态库所在目录，例如/usr/local/python3/lib/python3.8/config-3.8-x86_64-linux-gnu。（注：Linux下的静态库即为.a后缀的文件，例如本例中是libpython3.8.a）


接下来cd进入前面解压出来的boost_1_75_0目录，准备进行boost静态库文件的编译。


上面两段话多次出现了“静态库”这个词，这里插一句为什么要编译“静态库”，而非“动态库”，由于我们的开发环境和运行环境通常不相同，且运行环境随时可能发生变化，动态库对系统的环境依赖程度高，也即，换个环境，动态库引用的动态链接一般就会失效。这显然令人很不爽，如果每次换个运行环境都要搭一遍环境，可太难顶了，而静态库则没有这个问题。


在boost_1_75_0目录下，运行以下命令：（下面的命令欲知更多参数细节或有个性化的需求请移步官方文档）

```bash
./bootstrap.sh --with-libraries=python --with-python-version=3.8 --with-python-root=/usr/local/python3 include=/usr/local/python3/include/python3.8 --with-python=/usr/local/python3/bin/python3.8  --with-toolset=gcc --prefix=/usr/local
```

其中参数指定安装库为`boost-python`（boost库有很多模块，这里只安装python模块，若不指定，则默认全装，暂时似乎没有必要），指定编译工具为gcc，且安装路径在`/usr/local`下。中间几个参数分别对应了python的版本、根目录、包含目录及解释器所在目录。


上面命令跑完后，当前目录下会出现名为b2的可执行文件，接下来执行以下命令：

```bash
./b2 cflags='-fPIC' cxxflags='-fPIC' address-model=64
```

其中比较重要是的cflags及cxxflags，均需要设置为'fPIC'，可以用于生成位置无关的代码，使代码在加载到内存时使用相对地址。若不加这两条参数，后面在编译生成目标动态库时会出问题。address-model参数默认为64，可指定生成64位或32位的库文件。


最后执行

```bash
./b2 install
```

接下来坐等程序运行完即可。运行完后，检查目录/usr/local/lib下是否有以下这些文件： 


- libboost_numpy38.so
- libboost_python38.a
- libboost_python38.so.1.75.0
- libboost_numpy38.a
- libboost_numpy38.so.1.75.0
- libboost_python38.so

之所以有.so动态库文件生成是因为前面并没有指定动态或静态，默认参数下动静态库都会编译，可按需使用。


再检查目录`/usr/local/include`下是否存在boost文件夹，若存在，一般即安装成功。


最后，需要设置几个永久环境变量，如下：


- `BOOST_LIB=/usr/local/lib`
- `CPLUS_INCLUDE_PATH=/usr/local/python3/include/python3.8:/usr/local/include/boost`

如果你成功进行到了这一步，那么恭喜你，boost环境应该已经安装成功了，接下来只要写一个简单的hello world程序编译一下即可！


## 一个简单的demo


### 编写.cpp文件并编译为.so文件


hello.cpp

```cpp
#include <iostream>
#include <boost/python.hpp>
using namespace std;
using namespace boost::python;

void greet(const char *name) {
	cout << "Hello, " << name << endl;
}
BOOST_PYTHON_MODULE_INIT(hello) {
	def("greet", greet);
}
```

在当前路径下运行下面的编译命令：

```bash
g++ -shared -fPIC -lm -pthread -O3 -std=c++11 -march=native -Wall -funroll-loops -Wno-unused-result hello.cpp -o hello.so /usr/local/lib/libboost_python38.a /usr/local/lib/libboost_numpy38.a -I/usr/local/python3/lib/python3.8/config-3.8-x86_64-linux-gnu
```

等待数秒即可在同目录下生成hello.so文件，不出意外，该文件可以被python3导入使用。


针对上面又臭又长的编译命令，我们其实可以做一个makefile，如下：

```makefile
PYTHON_VERSION = 3.8
INPUT = hello.cpp
TARGET= hello

CFLAGS = -shared -fPIC -lm -pthread -O3 -std=c++11 -march=native -Wall -funroll-loops -Wno-unused-result

PYTHON_LIB_PATH = /usr/local/python3/lib/python$(PYTHON_VERSION)/config-3.8-x86_64-linux-gnu
BOOST_PYTHON_STATIC_LIB = $(BOOST_LIB)/libboost_python38.a
BOOST_NUMPY_STATIC_LIB = $(BOOST_LIB)/libboost_numpy38.a

$(TARGET).so: $(INPUT)
        g++ $(CFLAGS) $(INPUT) -o $(TARGET).so $(BOOST_PYTHON_STATIC_LIB) $(BOOST_NUMPY_STATIC_LIB) -I$(PYTHON_LIB_PATH)
```

之后通过make命令即可进行编译。文件中的各种路径请自行比对修改。如遇到

```plaintext
makefile:13: *** missing separator (did you mean TAB instead of 8 spaces?).
```

这样的报错，则只需将最后g++前面的8个空格换成Tab。


### 在python中导入使用


将hello.so移到其他无boost python环境的Linux系统下，安装好与之前相同版本的python和numpy，尝试导入与使用，若未得到以下结果，则~~意味着前面所有的努力都白费了~~需要再仔细看一下各项路径的配置及各种环境的版本！


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/ac47ceea3b21d6d8c209c8ee670aeeaf.png)另外Boost Python库同样支持在C++程序中调用python脚本，鉴于暂时无这方面的需求，我并没有尝试。
