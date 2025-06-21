---
title: 浅谈Softmax与Cross Entropy Loss
id: 5174
date: 2020-09-25 13:05:46
categories:
  - ['学习笔记']
tags: ['神经网络', '机器学习', '深度学习']
cover: 
disableNunjucks: true
mathjax: true
---

在机器学习的多分类任务中，经常听到这么两个名词：Softmax与交叉熵损失函数（Cross Entropy Loss），另外还有一个Sigmoid函数也经常出现，那么这几个东西究竟有什么联系呢？

## Softmax


这里先顺便提一句Sigmoid，它与Softmax也有一点关系。我最先听说Sigmoid函数是在逻辑斯蒂回归模型中，这是个二分类任务中常用的经典模型。Sigmoid函数长这样：


$$\sigma(z)=\frac{1}{1+e^{-z}}$$


它将实数域$\mathbb{R}$映射为(0,1)区间，特殊地将0映射为0.5，那么我们在逻辑斯蒂回归中使用的决策方法就是计算一下$\sigma(\mathbf{\omega}^T\mathbf{x}+b)$的值，从而得到$\mathbf{x}$属于正类的概率值，进而进行预测判断。


而Softmax则是下面这样一个多元向量值函数：


$$a_i=\frac{e^{z_i}}{\sum_{j=1}^Ne^{z_j}},\quad i=1,2,\dots,N$$


显然，一定有$\sum_{i=1}^Na_i=1$。在N分类任务中，常使用这个函数作为神经网络最末层的激活函数（该层激活前的N个节点即分别为函数的自变量$z_1,z_2,\dots,z_N$），以得到属于各个类别的概率值。


由于神经网络使用梯度下降进行训练，若用Softmax作为激活函数，则免不了对这个函数进行求导，下面先给出该函数的导数（由于这是个多元向量值函数，“导数”准确而言应该是Jacobian）。


一般地，我们对$\forall i,j$计算$\frac{\partial a_i}{\partial z_j}$。


$$\begin{aligned}\frac{\partial a_i}{\partial z_j}&=\frac{\partial \frac{e^{z_i}}{\sum e^{z_k}}}{\partial z_j}\\&=\frac{\frac{\partial e^{z_i}}{\partial z_j}\sum e^{z_k}-e^{z_j}e^{z_i}}{(\sum e^{z_k})^2}\\&=\left\lbrace\begin{aligned}&-\frac{e^{z_j}e^{z_i}}{(\sum e^{z_k})^2}=-a_ia_j,\quad i\ne j\\ &\\&\frac{e^{z_i}\sum e^{z_k}-e^{2z_i}}{(\sum e^{z_k})^2}=a_i(1-a_i),\quad i=j\end{aligned}\right.\end{aligned}$$


以上就是Softmax的定义与其微分性质，那么特殊地，二元情形下的Softmax有以下形式：


$$\left\lbrace\begin{aligned}&a_1=\frac{e^{z_1}}{e^{z_1}+e^{z_2}}=\frac{1}{1+e^{-(z_1-z_2)}}\\&\\&a_2=\frac{e^{z_2}}{e^{z_1}+e^{z_2}}=\frac{e^{-(z_1-z_2)}}{1+e^{-(z_1-z_2)}}\end{aligned}\right.$$


咦，这不就是Sigmoid吗？其实Sigmoid可以说就是Softmax的二元退化形式。


## Cross Entropy Loss


单个样本的交叉熵损失函数定义如下：


$$E=-\sum_{i=1}^N y_ilog(a_i)$$


其中$y_1,y_2,\dots,y_N$其实是该样本的标签，其为一个one-hot向量，而$a_i,a_2,\dots,a_N$是神经网络经过Softmax之后的输出值。定义这么个损失函数究竟有什么好处？一方面，优化交叉熵等价于优化数学里的另一个东西，被称为K-L散度，而后者可以衡量两个概率分布之间的距离，多分类问题本质上就是一个概率分布的优化问题，因此这样一个损失函数在多分类问题上有优良的表现效果，收敛速度更快，而还有一方面，其实就是因为该损失函数结合Softmax进行梯度运算，将非常的方便，如下：


接下来，我们结合链式法则来计算$E$对$\mathbf{z}$的导数（梯度）：


$$\frac{\partial E}{\partial \mathbf{z}}=(\frac{\partial\mathbf{a}}{\partial\mathbf{z}})^\mathrm{T}\frac{\partial E}{\partial \mathbf{a}}$$


其中$\frac{\partial\mathbf{a}}{\partial\mathbf{z}}$前面已经算过了，它是：


$$\begin{bmatrix}a_1(1-a_1)&-a_1a_2&\dots&-a_1a_N\\-a_2a_1&a_2(1-a_2)&\dots&-a_2a_N\\ \vdots&\vdots&\ddots&\vdots\\-a_Na_1&-a_Na_2&\dots&a_N(1-a_N)\end{bmatrix}$$


然后计算$\frac{\partial E}{\partial\mathbf{a}}$：


$$\frac{\partial E}{\partial\mathbf{a}}=\begin{bmatrix}-\frac{y_1}{a_1}\\-\frac{y_2}{a_2}\\\vdots\\-\frac{y_N}{a_N}\end{bmatrix}$$


将上面两个矩阵相乘得到：


$$\frac{\partial E}{\partial \mathbf{z}}=\begin{bmatrix}-y_1+\sum{y_ia_1}\\-y_2+\sum{y_ia_2}\\\vdots\\-y_N+\sum{y_ia_N}\end{bmatrix}$$


注意这里$\mathbf{y}$是样本的标签，它是个one-hot向量，因此一定有$\sum_{i=1}^Ny_i=1$


代入上面的梯度表达式，就有：


$$\frac{\partial E}{\partial \mathbf{z}}=\begin{bmatrix}a_1-y_1\\a_2-y_2\\\vdots\\a_N-y_N\end{bmatrix}=\mathbf{a}-\mathbf{y}$$


这就牛逼了呀，这个损失函数的选取将原本复杂的一批的求梯度运算转化为了一次减法运算，也正是这一关系，将Softmax与交叉熵损失函数结合起来，成为密不可分的一对。
