function setInfo(ip, city, distance, isCache) {
   $('.welcome #local-ip').text(ip);
   $('.welcome #city').text(city);
   $('.welcome #distance').text(distance);
   if (isCache) return;
   var expiresDate= new Date();
   expiresDate.setTime(expiresDate.getTime() + (5 * 60 * 1000));
   var s = JSON.stringify({
      "ip": ip,
      "city": city,
      "distance": distance
   });
   $.cookie('locationInfo', s, {expires: expiresDate, path: '/' });
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
$(document).on('pjax:error', function(event) {
   Snackbar.show({
     text: '似乎出了点问题，不妨刷新网页试试？',
     pos: 'top-right',
     showAction: false
    });
});
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
$(document).on('click', 'a[download]', function(event) {
   event.preventDefault();
   const fileUrl = $(this).attr('href');
   const fileName = $(this).attr('download');
   download(fileUrl, fileName);
});