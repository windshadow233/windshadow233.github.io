---
title: 在Hexo博客中添加GitHub Calendar
disableNunjucks: false
mathjax: false
id: 11354
date: 2024-05-10 02:48:17
categories:
  - [博客相关]
  - [Hexo魔改]
tags:
  - Hexo
  - Web前端
  - Hexo插件
  - JavaScript
cover: https://blogfiles.oss.fyz666.xyz/png/8ffbf16f-d70a-4804-a5c4-551ccaeebab6.png
---

逛别人的博客时，发现有许多博主的主页上会嵌入一个Github Calendar，如下图所示：

![image-20240510025333998](https://blogfiles.oss.fyz666.xyz/png/8ffbf16f-d70a-4804-a5c4-551ccaeebab6.png)

~~放置在homepage可以让主页显得丰富一些。~~

简单一搜，找到了这个项目的出处：

{% link github-calendar,GitHub,https://github.com/Bloggify/github-calendar %}

另外，还找到一位大佬将该项目集成的Hexo插件：

{% link hexo-github-calendar,GitHub,https://github.com/Zfour/hexo-github-calendar %}

基于这些信息，本文给出两种安装方法。

## 修改主题

{% tabs tab1 %}

<!-- tab 直接安装插件 -->

不愿意魔改主题的朋友可以直接安装前面提到的插件：[hexo-github-calendar](https://github.com/Zfour/hexo-github-calendar)，

并在网站配置文件中添加：

```yaml
githubcalendar:
  enable: true
  priority: 3
  enable_page: /
  user: <username>
  layout:
    type: id
    name: recent-posts
    index: 0
  githubcalendar_html: '<div class="recent-post-item" style="width:100%;height:auto;padding:10px;"><div id="github_loading" style="width:10%;height:100%;margin:0 auto;display: block"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 50 50" style="enable-background:new 0 0 50 50" xml:space="preserve"><path fill="#d0d0d0" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z" transform="rotate(275.098 25 25)"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"></animateTransform></path></svg></div><div id="github_container"></div></div>'
  pc_minheight: 280px
  mobile_minheight: 0px
  color: "['#ebedf0', '#fdcdec', '#fc9bd9', '#fa6ac5', '#f838b2', '#f5089f', '#c4067e', '#92055e', '#540336', '#48022f', '#30021f']"
  api: https://python-github-calendar-api.vercel.app/api
  calendar_js: https://fastly.jsdelivr.net/gh/Zfour/hexo-github-calendar@1.21/hexo_githubcalendar.js
  plus_style: ""
```

这里主要修改的内容是`user`控制显示的GitHub账号，`enable_page`控制生效的页面以及`layout`控制组件的位置，不再细说。

然而这个`api`应该是挂掉的，且看后文如何通过vercel自己搭建`api`。

<!-- endtab -->

<!-- tab 自己动手魔改主题 -->

安装插件的方式不够灵活，所以我选择自己魔改主题。首先，我希望该组件显示在主页顶部，并且在主页的每一页都有显示，因此，找到主题的`layout/includes/layout.pug`这个文件，在需要插入组件的位置写上`#github_container`，例如我：

```pug
...
- var isHome = is_home() ? 'home' : ''
...
if isHome
  #top.top(style="width:1500px")
    ...
    .cards
      .gc#gc
        .recent-post-item.github_container(style='width:100%;height:auto;padding:10px;')
          #github_container
main#content-inner.layout(class=hideAside) # 原来的内容
```

通过`is_home`函数判断是否为主页，并且在主页原来该有的内容前面增加一些块，其中包含`#github_container`。

然后新建`source/js/githubcalendar.js`：

```js
var github_canlendar = (git_user, git_color) => {
    var git_githubapiurl = "https://<your-api>?user=" + git_user;
    var git_fixed = 'fixed';
    var git_px = 'px';
    var git_month = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    var git_monthchange = [];
    var git_oneyearbeforeday = '';
    var git_thisday = '';
    var git_amonthago = '';
    var git_aweekago = '';
    var git_weekdatacore = 0;
    var git_datacore = 0;
    var git_total = 0;
    var git_datadate = '';
    var git_git_data = [];
    var git_positionplusdata = [];
    var git_firstweek = [];
    var git_lastweek = [];
    var git_beforeweek = [];
    var git_thisweekdatacore = 0;
    var git_mounthbeforeday = 0;
    var git_mounthfirstindex = 0;
    var git_crispedges = 'crispedges';
    var git_thisdayindex = 0;
    var git_amonthagoindex = 0;
    var git_amonthagoweek = [];
    var git_firstdate = [];
    var git_first2date = [];
    var git_montharrbefore = [];
    var git_monthindex = 0;
    var retinaCanvas = (canvas, context, ratio) => {
        if (ratio > 1) {
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            canvas.width = canvasWidth * ratio;
            canvas.height = canvasHeight * ratio;
            canvas.style.width = '100%';
            canvas.style.height = canvasHeight + 'px';
            context.scale(ratio, ratio);
        }
    };
    function responsiveChart() {
        var ratio = window.devicePixelRatio || 1
        var git_tooltip_container = document.getElementById('git_tooltip_container');
        var git_x = '';
        var git_y = '';
        var git_span1 = '';
        var git_span2 = '';
        var c = document.getElementById("gitcanvas");
        c.style.width ='100%';
        c.style.height ='';
        var cmessage = document.getElementById("gitmessage");
        var ctx = c.getContext("2d");
        width = c.width = document.getElementById("gitcalendarcanvasbox").offsetWidth;
        height = c.height = 9 * 0.96 * c.width / git_data.length;
        retinaCanvas(c,ctx, ratio)
        var linemaxwitdh = height/ 9;
        var lineminwitdh = 0.8 * linemaxwitdh;
        var setposition = {x: 0.02 * width, y: 0.025 * width};
        for (var week in git_data) {
            weekdata = git_data[week];
            for (var day in weekdata) {
                var dataitem = {date: "", count: "", x: 0, y: 0};
                git_positionplusdata.push(dataitem);
                ctx.fillStyle = git_thiscolor(git_color, weekdata[day].count);
                setposition.y = Math.round(setposition.y * 100) / 100;
                dataitem.date = weekdata[day].date;
                dataitem.count = weekdata[day].count;
                dataitem.x = setposition.x;
                dataitem.y = setposition.y;
                ctx.fillRect(setposition.x, setposition.y, lineminwitdh, lineminwitdh);
                setposition.y = setposition.y + linemaxwitdh
            }
            setposition.y = 0.025 * width;
            setposition.x = setposition.x + linemaxwitdh
        }
        if (document.body.clientWidth > 700) {
            ctx.font = "600  Arial";
            ctx.fillStyle = '#aaa';
            ctx.fillText("日", 0, 1.9 * linemaxwitdh);
            ctx.fillText("二", 0, 3.9 * linemaxwitdh);
            ctx.fillText("四", 0, 5.9 * linemaxwitdh);
            ctx.fillText("六", 0, 7.9 * linemaxwitdh);
            var monthindexlist = width / 24;
            for (var index in git_monthchange) {
                ctx.fillText(git_monthchange[index], monthindexlist, 0.7 * linemaxwitdh);
                monthindexlist = monthindexlist + width / 12
            }
        }
        c.onmousemove = function (event) {
            if (document.querySelector('.gitmessage')) {
                git_tooltip_container.innerHTML = ""
            }
            getMousePos(c, event)
        };
        git_tooltip_container.onmousemove = function (event) {
            if (document.querySelector('.gitmessage')) {
                git_tooltip_container.innerHTML = ""
            }
        };

        function getMousePos(canvas, event) {
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left * (canvas.width / rect.width);
            var y = event.clientY - rect.top * (canvas.height / rect.height);
            for (var item of git_positionplusdata) {
                var lenthx = x - item.x;
                var lenthy = y - item.y;
                if (0 < lenthx && lenthx < lineminwitdh) {
                    if (0 < lenthy && lenthy < lineminwitdh) {
                        git_span1 = item.date;
                        git_span2 = item.count;
                        git_x = event.clientX - 100;
                        git_y = event.clientY - 60;
                        html = tooltip_html(git_x, git_y, git_span1, git_span2);
                        append_div_gitcalendar(git_tooltip_container, html)
                    }
                }
            }
        }
    }

    function addlastmonth() {
        if (git_thisdayindex === 0) {
            thisweekcore(52);
            thisweekcore(51);
            thisweekcore(50);
            thisweekcore(49);
            thisweekcore(48);
            git_thisweekdatacore += git_firstdate[6].count;
            git_amonthago = git_firstdate[6].date
        } else {
            thisweekcore(52);
            thisweekcore(51);
            thisweekcore(50);
            thisweekcore(49);
            thisweek2core();
            git_amonthago = git_first2date[git_thisdayindex - 1].date
        }
    }

    function thisweek2core() {
        for (var i = git_thisdayindex - 1; i < git_first2date.length; i++) {
            git_thisweekdatacore += git_first2date[i].count
        }
    }

    function thisweekcore(index) {
        for (var item of git_data[index]) {
            git_thisweekdatacore += item.count
        }
    }

    function addlastweek() {
        for (var item of git_lastweek) {
            git_weekdatacore += item.count
        }
    }

    function addbeforeweek() {
        for (var i = git_thisdayindex; i < git_beforeweek.length; i++) {
            git_weekdatacore += git_beforeweek[i].count
        }
    }

    function addweek(data) {
        if (git_thisdayindex === 6) {
            git_aweekago = git_lastweek[0].date;
            addlastweek()
        } else {
            lastweek = data.contributions[51];
            git_aweekago = lastweek[git_thisdayindex + 1].date;
            addlastweek();
            addbeforeweek()
        }
    }

    fetch(git_githubapiurl).then(data => data.json()).then(data => {
        git_data = data.contributions;
        git_total = data.total;
        git_first2date = git_data[48];
        git_firstdate = git_data[47];
        git_firstweek = data.contributions[0];
        git_lastweek = data.contributions[52];
        git_beforeweek = data.contributions[51];
        git_thisdayindex = git_lastweek.length - 1;
        git_thisday = git_lastweek[git_thisdayindex].date;
        git_oneyearbeforeday = git_firstweek[0].date;
        git_monthindex = git_thisday.substring(5, 7) * 1;
        git_montharrbefore = git_month.splice(git_monthindex, 12 - git_monthindex);
        git_monthchange = git_montharrbefore.concat(git_month);
        addweek(data);
        addlastmonth();
        var html = github_main_box(git_monthchange, git_data, git_user, git_color, git_total, git_thisweekdatacore, git_weekdatacore, git_oneyearbeforeday, git_thisday, git_aweekago, git_amonthago);
        append_div_gitcalendar(github_container, html);
        if(document.getElementById('github_loading')){
            document.getElementById('github_loading').remove()};
        responsiveChart()
    }).catch(function (error) {
        console.log(error)
    });
    window.onresize = function () {
        responsiveChart()
    };
    window.onscroll = function () {
        if (document.querySelector('.gitmessage')) {
            git_tooltip_container.innerHTML = ""
        }
    };
    var git_thiscolor = (color, x) => {
        if (x === 0) {
            var i = parseInt(x / 2);
            return color[0]
        } else if (x < 2) {
            return color[1]
        } else if (x < 20) {
            var i = parseInt(x / 2);
            return color[i]
        } else {
            return color[9]
        }
    };
    var tooltip_html = (x, y, span1, span2) => {
        var html = '';
        html += '<div class="gitmessage" style="top:' + y + 'px;left:' + x + 'px;position: fixed;z-index:9999"><div class="angle-wrapper" style="display:block;"><span>' + span1 + '&nbsp;</span><span>' + span2 + ' 次上传</span></div></div>';
        return html
    };
    var github_canvas_box = () => {
        var html = '<div id="gitcalendarcanvasbox"> <canvas id="gitcanvas" style="animation: none;"></canvas></div>';
        return html
    };
    var github_info_box = (user, color) => {
        var html = '';
        html += '<div id="git_tooltip_container"></div><div class="contrib-footer clearfix mt-1 mx-3 px-3 pb-1"><div class="float-left text-gray">数据来源 <a href="https://github.com/' + user + '" target="blank">@' + user + '</a></div><div class="contrib-legend text-gray">Less <ul class="legend"><li style="background-color:' + color[0] + '"></li><li style="background-color:' + color[2] + '"></li><li style="background-color:' + color[4] + '"></li><li style="background-color:' + color[6] + '"></li><li style="background-color:' + color[8] + '"></li></ul>More </div></div>';
        return html
    };
    var github_main_box = (monthchange, git_data, user, color, total, thisweekdatacore, weekdatacore, oneyearbeforeday, thisday, aweekago, amonthago) => {
        var html = '';
        var canvasbox = github_canvas_box();
        var infobox = github_info_box(user, color);
        var style = github_main_style();
        html += '<div class="position-relative"><div class="border py-2 graph-before-activity-overview"><div class="js-gitcalendar-graph mx-md-2 mx-3 d-flex flex-column flex-items-end flex-xl-items-center overflow-hidden pt-1 is-graph-loading graph-canvas gitcalendar-graph height-full text-center">' + canvasbox + '</div>' + infobox + '</div></div>';
        html += '<div style="display:flex;width:100%"><div class="contrib-column contrib-column-first table-column"><span class="text-muted">过去一年提交</span><span class="contrib-number">' + total + '</span><span class="text-muted">' + oneyearbeforeday + '&nbsp;-&nbsp;' + thisday + '</span></div><div class="contrib-column table-column"><span class="text-muted">最近一月提交</span><span class="contrib-number">' + thisweekdatacore + '</span><span class="text-muted">' + amonthago + '&nbsp;-&nbsp;' + thisday + '</span></div><div class="contrib-column table-column"><span class="text-muted">最近一周提交</span><span class="contrib-number">' + weekdatacore + '</span><span class="text-muted">' + aweekago + '&nbsp;-&nbsp;' + thisday + '</span></div></div>' + style;
        return html
    };
    var github_main_style = () => {
        style = '<style>#github_container{text-align:center;margin:0 auto;width:100%;display:flex;display:-webkit-flex;justify-content:center;align-items:center;flex-wrap:wrap;}.gitcalendar-graph text.wday,.gitcalendar-graph text.month{font-size:10px;fill:#aaa;}.contrib-legend{text-align:right;padding:0 14px 10px 0;display:inline-block;float:right;}.contrib-legend .legend{display:inline-block;list-style:none;margin:0 5px;position:relative;bottom:-1px;padding:0;}.contrib-legend .legend li{display:inline-block;width:10px;height:10px;}.text-small{font-size:12px;color:#767676;}.gitcalendar-graph{padding:15px 0 0;text-align:center;}.contrib-column{text-align:center;border-left:1px solid #ddd;border-top:1px solid #ddd;font-size:11px;}.contrib-column-first{border-left:0;}.table-column{padding:10px;display:table-cell;flex:1;vertical-align:top;}.contrib-number{font-weight:300;line-height:1.3em;font-size:24px;display:block;}.gitcalendar img.spinner{width:70px;margin-top:50px;min-height:70px;}.monospace{text-align:center;color:#000;font-family:monospace;}.monospace a{color:#1D75AB;text-decoration:none;}.contrib-footer{font-size:11px;padding:0 10px 12px;text-align:left;width:100%;box-sizing:border-box;height:26px;}.left.text-muted{float:left;margin-left:9px;color:#767676;}.left.text-muted a{color:#4078c0;text-decoration:none;}.left.text-muted a:hover,.monospace a:hover{text-decoration:underline;}h2.f4.text-normal.mb-3{display:none;}.float-left.text-gray{float:left;}#user-activity-overview{display:none;}.day-tooltip{white-space:nowrap;position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.85);border-radius:3px;display:none;pointer-events:none;}.day-tooltip strong{color:#dfe2e5;}.day-tooltip.is-visible{display:block;}.day-tooltip:after{position:absolute;bottom:-10px;left:50%;width:5px;height:5px;box-sizing:border-box;margin:0 0 0 -5px;content:" ";border:5px solid transparent;border-top-color:rgba(0,0,0,.85)}.position-relative{width:100%;}@media screen and (max-width:650px){.contrib-column{display:none}}.angle-wrapper{z-index:9999;display:inline;width:200px;height:40px;position:relative;padding:5px 0;background:rgba(0,0,0,0.8);border-radius:8px;text-align:center;color:white;}.angle-box{position:fixed;padding:10px}.angle-wrapper span{padding-bottom:1em;}.angle-wrapper:before{content:"";width:0;height:0;border:10px solid transparent;border-top-color:rgba(0,0,0,0.8);position:absolute;left:47.5%;top:100%;}</style>';
        return style
    }
};
var append_div_gitcalendar = (parent, text) => {
    if (typeof text === 'string') {
        var temp = document.createElement('div');
        temp.innerHTML = text;
        var frag = document.createDocumentFragment();
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild)
        }
        parent.appendChild(frag)
    } else {
        parent.appendChild(text)
    }
};
var loading_git = (color) => {
    loading = '<div id="github_loading" style="height:100%;display: flex;align-items: center;justify-content: center;"><svg style="height:50px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 50 50" style="enable-background:new 0 0 50 50" xml:space="preserve"><path fill="' + color + '" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z" transform="rotate(275.098 25 25)"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"></animateTransform></path></svg></div>';
    return loading
};

(function(){var git_user = '<username>';
    var github_container = document.getElementsByClassName('github_container')[0];
    var github_loading = document.getElementById('github_loading');
    var git_purple = ['#ebedf0', '#fdcdec', '#fc9bd9', '#fa6ac5', '#f838b2', '#f5089f', '#c4067e', '#92055e', '#540336', '#48022f', '#30021f',];
    var git_green = ['#ebedf0', '#f0fff4', '#dcffe4', '#bef5cb', '#85e89d', '#34d058', '#28a745', '#22863a', '#176f2c', '#165c26', '#144620'];
    var git_blue = ['#ebedf0', '#f1f8ff', '#dbedff', '#c8e1ff', '#79b8ff', '#2188ff', '#0366d6', '#005cc5', '#044289', '#032f62', '#05264c',];
    var git_pink = ['#ebedf0', '#fdcdec', '#fc9bd9', '#fa6ac5', '#f838b2', '#f5089f', '#c4067e', '#92055e', '#540336', '#48022f', '#30021f'];
    var git_color = git_purple;
    append_div_gitcalendar(github_container, loading_git(git_color[4]));
    github_canlendar(git_user, git_color)})()
```

上面代码需要修改第269行的`<username>`为自己的GitHub用户名，第276行自定义Calendar颜色主题，以及第2行的`<your-api>`。

这里同样需要自建一个api来调用，且看下文。

在主题配置文件的`inject`的`head`或`bottom`配置下增加一条：

```yaml
- <script data-pjax src="/js/githubcalendar.js"></script>
```

如不需要适配pjax则将`data-pjax`去掉，如主题不支持在配置文件中`inject`则自行想办法将该js文件引入。

<!-- endtab -->

{% endtabs %}

## 自建GitHub Calendar API

为啥要自建？当然你完全可以用我的api，但毕竟如果用别人的服务，哪天服务崩了也会影响自己，所以反正这个建起来比较快，又是免费的，何乐而不为？

这个东西的原理说白了，其实就是将GitHub个人主页上显示的东西爬取下来，按一定格式发送到前端，由前端解析渲染，因此如果你有自己的公网服务器，可以直接在服务器上运行下面的代码并且开放到公网：

```python
# -*- coding: UTF-8 -*-
import requests
import re
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler,HTTPServer
import json

def list_split(items, n):
    return [items[i:i + n] for i in range(0, len(items), n)]
def getdata(name):

    # 2024-03-29 定义 headers 请求头
    # 请见 https://github.com/yuhengwei2001/python_github_calendar_api/commit/0f37cfc003f09e99a1892602d8bc2b38137899d2#diff-b014e93fcab9bae29f453d7a616da5eac2f02947f32d02a1a1bf200eeaab5a39L11
    headers = {
        'Referer': 'https://github.com/'+ name,
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
        'X-Requested-With': 'XMLHttpRequest'
    }
    # 发送请求时添加 headers 请求头
    # gitpage = requests.get("https://github.com/" + name)
    gitpage = requests.get("https://github.com/" + name  + "?action=show&controller=profiles&tab=contributions&user_id="+ name, headers=headers)
    data = gitpage.text
    
    # 2023-11-22 更新正则 https://github.com/Zfour/python_github_calendar_api/issues/18
    datadatereg = re.compile(r'data-date="(.*?)" id="contribution-day-component')
    datacountreg = re.compile(r'<tool-tip .*?class="sr-only position-absolute">(.*?) contribution')
    
    datadate = datadatereg.findall(data)
    datacount = datacountreg.findall(data)
    datacount = list(map(int, [0 if i == "No" else i for i in datacount]))

    # 检查datadate和datacount是否为空
    if not datadate or not datacount:
        # 处理空数据情况
        return {"total": 0, "contributions": []}
        
    # 将datadate和datacount按照字典序排序
    sorted_data = sorted(zip(datadate, datacount))
    datadate, datacount = zip(*sorted_data)
    
    contributions = sum(datacount)
    datalist = []
    for index, item in enumerate(datadate):
        itemlist = {"date": item, "count": datacount[index]}
        datalist.append(itemlist)
    datalistsplit = list_split(datalist, 7)
    returndata = {
        "total": contributions,
        "contributions": datalistsplit
    }
    return returndata
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        user = query_params.get('user', [None])[0]  # 获取'user'参数的值，如果不存在则默认为None
        data = getdata(user) if user else {"error": "User parameter not provided"}
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
        return
```

此代码通过`?user=`参数进行查询，这与前面通过插件安装的方法有所不同，插件是直接把用户名作为查询参数的：

```js
var git_githubapiurl = "https://python-github-calendar-api.vercel.app/api?" + git_user;
```

如果前面通过插件安装，则需要注意修改接口代码或修改插件查询参数格式。

---

然而并不想为了运行这个玩意在服务器上开一个进程，那么我们还可以利用vercel这种平台来很方便地部署。

首先，显然需要注册一个vercel账号，然后选择Add New->Project，选择"Import Third-Party Git Repository →"，在其中粘贴以下链接：

`https://github.com/Zfour/python_github_calendar_api`

或直接粘贴我的：`https://github.com/windshadow233/python_github_calendar_api`

然后vercel会让你创建一个存储库，随便命名即可（可以同样命名为python_github_calendar_api），公开或私有皆可。接下来等待vercel部署成功。

不过这里有一个小坑，直接一路啥都不改部署下来的服务，无论怎么查询都返回500，Google了半天发现似乎是Node版本的锅，在vercel项目的Settings里面将Node的版本从20.x降为18.x并重新部署，即可解决问题。

![image-20240510034642117](https://blogfiles.oss.fyz666.xyz/png/3c725d61-6493-4683-97de-f58dd42271c7.png)

由于vercel的域名已经被污染了，这里我们可以绑定一个自己的域名。

前往Settings->Domains，添加自己的域名，然后将该域名的CNAME解析到` cname.vercel-dns.com`即可。

在浏览器中访问`https://<your-domain>/api?user=<username>`，如果服务正常，则可以获取到数据。

---

最后在前面的文件中修改api链接。

{% tabs tab2 %}

<!-- tab 插件安装 -->

修改前面网站配置文件里的`githubcalendar.api`参数。

<!-- endtab -->

<!-- tab 魔改安装 -->

修改前面js文件里的`git_githubapiurl`参数。

<!-- endtab -->

{% endtabs %}

最后的最后，Hexo一键三连即可！
