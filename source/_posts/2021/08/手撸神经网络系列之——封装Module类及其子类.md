---
title: 手撸神经网络系列之——封装Module类及其子类
id: 6243
date: 2021-08-06 09:21:38
categories: [机器学习]
tags: ['Python', '神经网络']
cover: 
disableNunjucks: false
---

从这篇文章开始，我们来着手实现模型的优化功能，本文主要来实现第一步：`Module`类以及其具体子类的实现，在实现的过程中，我参考了一部分PyTorch的相关源码。

本系列全部代码见下面仓库：

{% link autograd-with-numpy,GitHub,https://github.com/windshadow233/autograd-with-numpy %}

如有算法或实现方式上的问题，请各位大佬轻喷+指正！


熟悉PyTorch的朋友都知道，`Module`类是作为神经网络各种模块（例如线性层、卷积层等）的基类而存在的，实现它是为了更方便地实现与PyTorch类似的神经网络模块功能。


首先，我们需要定义一个可训练参数类：`Parameter`。定义比较容易，直接继承前面定义的`Tensor`，并修改一些参数即可：



```python
class Parameter(Tensor):
    def __init__(self, tensor: Tensor):
        if not tensor.is_leaf:
            raise ValueError('cannot assign a non-leaf variable to Parameter')
        super(Parameter, self).__init__(tensor.data, dtype=np.float32, requires_grad=True)

    def __repr__(self):
        return f'Parameter Containing:\n{super(Parameter, self).__repr__()}'
```

`Parameter`类在初始化时，需要传入一个`Tensor`类的叶子节点实例，并且强制令数据类型为`float32`，强制令`requires_grad`为`True`。


接下来，我依照PyTorch的`Module`类，定义了一个自己的`Module`类，代码比较多，就不贴了，完整代码见`nn/modules/module.py`，其主要实现的方法有以下几个：



```python
class Module(object):
    def __call__(self, *args, **kwargs):
        return self.forward(*args, **kwargs)

    def forward(self, *args, **kwargs):
        raise NotImplementedError

    def modules(self, recurse=True):
        """
        (recusively) return Modules of this instance
        """
        ...

    def train(self, mode=True):
        """
        switch to train mode
        """
        ...

    def eval(self):
        """
        switch to eval mode
        """
        ...

    def parameters(self, recurse=True):
        """
        (recusively) return Parameters of this instance
        """
        ...

    def buffers(self, recurse=True):
        """
        (recusively) return Buffers of this instance
        """
        ...

    def save_state_dict(self, state_dict_file):
        """
        save model's state dict to file
        """
        ...

    def load_state_dict(self, state_dict: OrderedDict or str, strict=True):
        """
        load state dict from OrderedDict or file
        """
        ...
```

总结一下，其实就是前向传播方法`forward`、模式切换方法`train`和`eval`、获取全部可训练参数的方法`parameters`、获取全部不可训练参数的方法`buffers`，以及参数存取方法`save_state_dict`和`load_state_dict`。相信用过PyTorch的朋友会对这些方法比较熟悉，这些方法实现起来并不难，但大概需要花一点时间。这里`__call__`方法直接调用了`forward`方法，然而在PyTorch里并不是这样的，后者在`__call__`方法中还做了很多其他的操作，我这里都没有进行实现。




---

`Module`类的用途是作为基类，被其他常见的更具体的类所继承，例如线性层`Linear`的定义如下：

```python
class Linear(Module):
    def __init__(self, in_features, out_features, bias=True):
        super(Linear, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.weight = Parameter(normal(mean=0., std=np.sqrt(2. / in_features), size=(out_features, in_features)))
        if bias:
            self.bias = Parameter(zeros(out_features))
        else:
            self.register_parameter('bias', None)

    def extra_repr(self):
        return ('{in_features}, {out_features}, ' + f'bias={self.bias is not None}').format(**self.__dict__)

    def forward(self, x: Tensor) -> Tensor:
        return F.linear(x, self.weight, self.bias)
```

线性层的两个参数，我们将其定义为`Parameter`类，因为它们是需要训练的参数。其中涉及到几个张量生成函数——`normal`、`zeros`，只要随随便便把numpy的对应函数封装成`Tensor`类型的就好啦！最后，我们要在`Linear`类中实现它独有的正向传播方法，即`forward`方法，基于我们前面做的准备工作比较充分（已经提前写好了张量乘法、加法运算），这里同样没什么难度。

---

本文涉及到的内容难度都不大，但估计写起来会感觉很烦，因为实在是太多了，基本都是重复劳作。但如果对PyTorch比较熟悉，写起来应该会比较轻松！

后面一篇文章，我们将实现一个简单的SGD优化器，通过它来训练自己的神经网络模型。
