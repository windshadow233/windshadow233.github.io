let color="rgb(252, 103, 250)",color1="rgba(78, 84, 200)",color2="rgba(143, 148, 251)",postsOption={title:{text:"文章发布时间统计图",x:"center",textStyle:{color:color}},tooltip:{trigger:"axis"},xAxis:{name:"日期",type:"category",boundaryGap:!1,nameTextStyle:{color:color},axisTick:{show:!1},axisLabel:{show:!0,color:color},axisLine:{show:!0,lineStyle:{color:color}},data:["2020-06","2020-07","2020-08","2020-09","2020-10","2020-11","2020-12","2021-01","2021-02","2021-03","2021-04","2021-05","2021-06","2021-07","2021-08","2021-09","2021-10","2021-11","2021-12","2022-01","2022-02","2022-03","2022-04","2022-05","2022-06","2022-07","2022-08","2022-09","2022-10","2022-11","2022-12","2023-01","2023-02","2023-03","2023-04","2023-05","2023-06","2023-07","2023-08","2023-09","2023-10","2023-11","2023-12","2024-01","2024-02","2024-03","2024-04","2024-05","2024-06","2024-07","2024-08","2024-09","2024-10","2024-11","2024-12","2025-01"]},yAxis:{name:"文章数量",type:"value",nameTextStyle:{color:color},splitLine:{show:!1},axisTick:{show:!1},axisLabel:{show:!0,color:color},axisLine:{show:!0,lineStyle:{color:color}}},series:[{name:"文章数量",type:"line",smooth:!0,lineStyle:{width:0},showSymbol:!1,color:["#6772e5"],data:[1,22,20,10,0,0,0,0,1,1,3,6,0,10,14,2,6,1,0,0,0,0,2,8,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,3,3,4,0,1,3,5,8,8,0,0,0,0,5,9,0,0],markLine:{data:[{name:"平均值",type:"average",label:{color:color}}],itemStyle:{color:[color]}},itemStyle:{opacity:1,color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:color1},{offset:1,color:color2}])},areaStyle:{opacity:1,color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:color1},{offset:1,color:color2}])}}]},tagsOption={title:{text:"Top 10 标签统计图",x:"center",textStyle:{color:color}},tooltip:{},xAxis:{name:"标签",type:"category",nameTextStyle:{color:color},axisTick:{show:!1},axisLabel:{show:!0,color:color,interval:0},axisLine:{show:!0,lineStyle:{color:color}},data:["Python","Linux","WordPress","神经网络","Web前端","JavaScript","计网","Hexo","Docker","Hackergame"]},yAxis:{name:"文章数量",type:"value",splitLine:{show:!1},nameTextStyle:{color:color},axisTick:{show:!1},axisLabel:{show:!0,color:color},axisLine:{show:!0,lineStyle:{color:color}}},series:[{name:"文章数量",type:"bar",data:[33,21,21,16,14,11,11,11,10,10],itemStyle:{borderRadius:[5,5,0,0],color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:color1},{offset:1,color:color2}])},emphasis:{itemStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:color1},{offset:1,color:color2}])}},markLine:{data:[{name:"平均值",type:"average",label:{color:color},itemStyle:{color:[color]}}]}}]},categoryParentFlag=!1,categoriesOption={title:{text:"文章分类统计图",x:"center",textStyle:{color:color}},legend:{top:"bottom",data:["瞎捣鼓经历","博客相关","Debug","学习笔记","机器学习","CTF题解","Hexo魔改","杂趣"],textStyle:{color:color}},tooltip:{trigger:"item"},series:[]};categoriesOption.series.push(categoryParentFlag?{nodeClick:!1,name:"文章篇数",type:"sunburst",radius:["15%","90%"],center:["50%","55%"],sort:"desc",data:[{name:"瞎捣鼓经历",value:47,path:"categories/瞎捣鼓经历/",id:"cm5px67r70004ihqmf5mq3up6",parentId:"0"},{name:"博客相关",value:39,path:"categories/博客相关/",id:"cm5px67rp001qihqmba6t0e4x",parentId:"0"},{name:"Debug",value:20,path:"categories/debug/",id:"cm5px67rb000cihqmavg60mli",parentId:"0"},{name:"学习笔记",value:20,path:"categories/学习笔记/",id:"cm5px67rd000jihqm2drkc58j",parentId:"0"},{name:"机器学习",value:19,path:"categories/机器学习/",id:"cm5px67s9003uihqm6kfj43h0",parentId:"0"},{name:"CTF题解",value:19,path:"categories/ctf题解/",id:"cm5px67t9009dihqm6end3f5u",parentId:"0"},{name:"Hexo魔改",value:8,path:"categories/hexo魔改/",id:"cm5px67u000crihqm3d3k65r0",parentId:"0"},{name:"杂趣",value:2,path:"categories/杂趣/",id:"cm5px67tt00buihqmcv0tc711",parentId:"0"}],itemStyle:{borderColor:"#fff",borderWidth:2,emphasis:{focus:"ancestor",shadowBlur:10,shadowOffsetX:0,shadowColor:"rgba(255, 255, 255, 0.5)"}}}:{name:"文章篇数",type:"pie",radius:[30,80],roseType:"area",label:{color:color,formatter:"{b} : {c} ({d}%)"},data:[{name:"瞎捣鼓经历",value:47,path:"categories/瞎捣鼓经历/",id:"cm5px67r70004ihqmf5mq3up6",parentId:"0"},{name:"博客相关",value:39,path:"categories/博客相关/",id:"cm5px67rp001qihqmba6t0e4x",parentId:"0"},{name:"Debug",value:20,path:"categories/debug/",id:"cm5px67rb000cihqmavg60mli",parentId:"0"},{name:"学习笔记",value:20,path:"categories/学习笔记/",id:"cm5px67rd000jihqm2drkc58j",parentId:"0"},{name:"机器学习",value:19,path:"categories/机器学习/",id:"cm5px67s9003uihqm6kfj43h0",parentId:"0"},{name:"CTF题解",value:19,path:"categories/ctf题解/",id:"cm5px67t9009dihqm6end3f5u",parentId:"0"},{name:"Hexo魔改",value:8,path:"categories/hexo魔改/",id:"cm5px67u000crihqm3d3k65r0",parentId:"0"},{name:"杂趣",value:2,path:"categories/杂趣/",id:"cm5px67tt00buihqmcv0tc711",parentId:"0"}],itemStyle:{emphasis:{shadowBlur:10,shadowOffsetX:0,shadowColor:"rgba(255, 255, 255, 0.5)"}}});