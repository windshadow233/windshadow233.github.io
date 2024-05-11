---
title: Gitalk发起Oauth时无法完成跨域请求的问题
id: 9864
date: 2024-03-19 09:14:25
categories: [Debug]
tags: ['CORS', 'Gitalk', 'Nginx', 'Oauth']
cover: 
disableNunjucks: true
---

我的博客接入Gitalk之后，经常会遇到Gitalk登录失败的问题，表现为Gitalk组件长时间转圈加载不出来，一段时间后渲染出Network Error等字样。

经过研究，发现是因为Gitalk在发起跨域请求时，其默认的代理出了问题，详情可见[此issue](https://github.com/gitalk/gitalk/issues/514)。

```raw
https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token
```

上面这个跨域代理的域名已经被墙了，在没有科学上网环境或网络环境差的时候就会寄。


于是我们可以自己整一个代理，方案有几种，如果没有云服务器，可以找一些免费的托管平台来搞一个代理，例如Vercel，可参考[这篇文章](https://prohibitorum.top/7cc2c97a15b4.html)


不过实际体验了一下，我发现vercel的域名好像也被墙了（DNS污染）。。。


考虑到我的网站是用Nginx部署在自己的云服务器上的，并且我的云服务器在境外，可以直连GitHub，因此我采用了另一种更加方便的方案，即用Nginx来转发跨域请求（参考自[这篇文章](https://blog.weiyigeek.top/2022/8-17-682.html)）。


在网站的Nginx配置下加一条`location`字段：

```nginx
location /github {
    if ($request_method = 'OPTIONS') {
      return 204;
    }
    proxy_pass https://github.com/;
}
```

然后`nginx -s reload`重新加载配置。


最后只要配置一下Gitalk组件，加一个`proxy`参数：

```js
const gitalk = new Gitalk({
    clientID: 'xxxxxxxxxxxxxxxx',
    clientSecret: 'xxxxxxxxxxxxxxxx',
    body: location.href,
    repo: 'BlogComments',
    owner: 'windshadow233',
    admin: ['windshadow233'],
    createIssueManually: true,
    id: location.pathname,
    distractionFreeMode: false,
    proxy: '/github/login/oauth/access_token'
});
```