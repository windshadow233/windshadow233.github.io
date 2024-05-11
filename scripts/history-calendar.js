function priority_history_calendar(){
    var priority = 0
    if(hexo.config.history_calendar.priority){
        priority = hexo.config.history_calendar.priority
    }
    else{
        priority = 0
    }
    return priority
}

function common_injector(name, item_comfig, temple_html_text, js_text, css_text) {
    if (item_comfig.enable) {
        if (temple_html_text !== '') {
            var layout_name;
            var layout_type;
            var layout_index = 0;
            if (item_comfig.layout_id) {
                layout_name = item_comfig.layout_id;
                layout_type = 'id';
            } else {
                layout_name = item_comfig.layout.name;
                layout_type = item_comfig.layout.type;
                layout_index = item_comfig.layout.index;
            }
            var get_layout
            if (layout_type === 'class') {
                get_layout = `document.getElementsByClassName('${layout_name}')[${layout_index}]`
            } else if (layout_type === 'id') {
                get_layout = `document.getElementById('${layout_name}')`
            } else {
                get_layout = `document.getElementById('${layout_name}')`
            }
            var user_info_js = `<script data-pjax>function ${name}_injector_config(){
                var parent_div_git = ${get_layout};
                var item_html = '${temple_html_text}';
                var exists = document.querySelectorAll('.card-history');
                exists.forEach(item => {document.querySelector('#aside-content').removeChild(item);})
                // console.log('已挂载${name}')
                // parent_div_git.innerHTML=item_html+parent_div_git.innerHTML // 无报错，但不影响使用(支持pjax跳转)
                parent_div_git.insertAdjacentHTML("beforebegin",item_html) // 有报错，但不影响使用(支持pjax跳转)
            }if( ${get_layout} && (location.pathname ==='${item_comfig.enable_page}'|| '${item_comfig.enable_page}' ==='all')){

            ${name}_injector_config()
        } </script>`
        }
        hexo.extend.injector.register('body_end', user_info_js, "default");
        if (js_text !== '') {
            hexo.extend.injector.register('body_end', js_text, "default");
        }
        if (css_text !== '') {
            hexo.extend.injector.register('head_end', css_text, "default");
        }
    }
}

hexo.extend.filter.register('after_generate',function() {
    if(hexo.config.history_calendar.enable){
        var history_calendar = hexo.config.history_calendar;
        if(hexo.config.swiper && hexo.config.swiper.enable){
            var css_text =`<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/css/baidu-history-calendar.css">`;
            var js_text =`<script data-pjax src="https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/js/baidu-history-calendar.js"></script>`

        }else{
            var css_text =`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css"><link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/css/baidu-history-calendar.css">`;
            var js_text =`<script src="https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js"></script><script data-pjax src="https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/js/baidu-history-calendar.js"></script>`

        }
        common_injector('history_calendar', history_calendar,history_calendar.temple_html,js_text,css_text)
    }


},priority_history_calendar())