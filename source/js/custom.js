function isFullScreen() {
   return !!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.webkitFullScreen || document.msFullScreen)
}
function fullScreen() {
   const element = document.body;
 
   if (isFullScreen()) {
     if (document.exitFullscreen) {
       document.exitFullscreen();
     } else if (document.mozCancelFullScreen) {
       document.mozCancelFullScreen();
     } else if (document.webkitExitFullscreen) {
       document.webkitExitFullscreen();
     } else if (document.msExitFullscreen) {
       document.msExitFullscreen();
     }
   } else {
     if (element.requestFullscreen) {
       element.requestFullscreen();
     } else if (element.mozRequestFullScreen) {
       element.mozRequestFullScreen();
     } else if (element.webkitRequestFullscreen) {
       element.webkitRequestFullscreen();
     } else if (element.msRequestFullscreen) {
       element.msRequestFullscreen();
     }
   }
 }
function getDistance(e, t, n, o) {
    const {sin: a, cos: s, asin: i, PI: c, hypot: r} = Math;
    let l = (e,t)=>(e *= c / 180,
    {
       x: s(t *= c / 180) * s(e),
       y: s(t) * a(e),
       z: a(t)
    })
    , d = l(e, t)
    , b = l(n, o)
    , u = 2 * i(r(d.x - b.x, d.y - b.y, d.z - b.z) / 2) * 6371;
    return Math.round(u)
 }
 function getIpInfo() {
    if(!typeof jQuery) return;
    if($('.card-announcement').css('display')===undefined||$('.card-announcement').css('display')==="none")
       if (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))
          return;
    if ($.cookie('locationInfo')) {
       var data = JSON.parse($.cookie('locationInfo'));
       setInfo(data['ip'], data['city'], data['distance'], true);
       return;
    }
    $.ajax({
       type: 'get',
       url: 'https://apis.map.qq.com/ws/location/v1/ip',
       data: {
          key: 'SGYBZ-W6R6C-IHT2B-AH6JO-4DFLZ-IKF3H',
          output: 'jsonp'
       },
       dataType: 'jsonp',
       success: function(res) {
          let { result = {} } = res
          if(result && result.location) {
             let distance = getDistance(117.22901, 31.82057, result.location.lng, result.location.lat);
             setInfo(result.ip, result.ad_info.province + result.ad_info.city + result.ad_info.district, distance, false);
          }
       }
    })
 }
 function download(src,name){
    var x=new XMLHttpRequest();
    x.open("GET", src, true);
    x.responseType = 'blob';
    x.onload=function(e){
       var url = window.URL.createObjectURL(x.response);
       var a = document.createElement('a');
       a.style.display = 'none';
       a.href = url;
       a.download = name;
       a.click();
       window.URL.revokeObjectURL(url);
    }
    x.send();
 }
 function categoryBarRandomColor() {
    if($('#categoryBar').length>0){
        $('#categoryBar .category-list-item').each(function(){
            let r = Math.floor(Math.random() * 151) + 50
            let g = Math.floor(Math.random() * 151) + 50
            let b = Math.floor(Math.random() * 151) + 50
            $(this).css('background', `rgb(${r},${g},${b})`);
        });;
    }
 }
 function loadAbstract() {
    let key;
    if ((match = location.pathname.match(/^\/blog\/(\d+)\/?/)) !== null) key = match[1];
    else return;
    try{document.querySelector(".st").remove()}catch(err){}
    var http=new XMLHttpRequest();
    http.open("GET",`/abstract/${key}?t=${new Date().getTime()}`)
    http.send();
    http.onreadystatechange=(event)=>{
        if(http.readyState==4){
            if(http.status==200) var text = http.responseText.replace(/<[^>]*>/g, '');
            else var text="文章摘要遇到异常。";
            const dom = document.querySelector('#ai-content')
            const data = text;
            function writing(index) {
                if (index < data.length) {
                    dom.innerHTML += data[index]
                    setTimeout(writing.bind(this), 50, ++index)
                }
                else{
                    var s=document.createElement("style")
                    s.className="st";
                    s.innerText="#ai-content::after{content:''!important;}"
                    document.body.appendChild(s)
                }
            }
            writing(0);
        }
    }
}
function createCharts() {
   let postsChart = echarts.init(document.getElementById('posts-chart'),'light');
   postsChart.setOption(postsOption);
   postsChart.on('click', 'series', (event) => {
      if (event.componentType === 'series') pjax.loadUrl('/archives/' + event.name.replace('-', '/'));
   });
   window.addEventListener('resize', () => { 
      postsChart.resize();
   });
   tagsChart = echarts.init(document.getElementById('tags-chart'),'light');
   tagsChart.setOption(tagsOption);
   tagsChart.on('click', (event) => {
      if(event.name) pjax.loadUrl('/tags/' + event.name.toLowerCase());
   });
   window.addEventListener('resize', () => { 
      tagsChart.resize();
   });
   categoriesChart = echarts.init(document.getElementById('categories-chart'),'light');
   categoriesChart.setOption(categoriesOption);
   categoriesChart.on('click', 'series', (event) => {
      if(event.data.path) pjax.loadUrl('/' + event.data.path);
   });
   window.addEventListener('resize', () => { 
      categoriesChart.resize();
   });
}
 $(document).on('pjax:complete', function(event) {   
   if (window.a2a !== undefined) a2a.init_all();
   getIpInfo();
 });
 $(document).on('pjax:error', function(event) {
    Snackbar.show({
      text: '似乎出了点问题，不妨刷新网页试试？',
      pos: 'top-right',
      showAction: false
     });
 });
 $(document).on('click', 'a[download]', function(event) {
    event.preventDefault();
    const fileUrl = $(this).attr('href');
    const fileName = $(this).attr('download');
    download(fileUrl, fileName);
 });
 $(document).on('click', '.DocSearch-Hit a', function(event) {
   event.preventDefault();
   var url = $(this).attr('href');
   pjax.loadUrl(url);
});
 $(document).ready(function() {
   getIpInfo();
});