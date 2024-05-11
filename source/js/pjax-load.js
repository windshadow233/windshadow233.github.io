if (window.a2a !== undefined) a2a.init_all();
getIpInfo();
if($('#categoryBar').length>0){
    $('#categoryBar .category-list-item').each(function(){
        let r = Math.floor(Math.random() * 151) + 50
        let g = Math.floor(Math.random() * 151) + 50
        let b = Math.floor(Math.random() * 151) + 50
        $(this).css('background', `rgb(${r},${g},${b})`);
    });;
}