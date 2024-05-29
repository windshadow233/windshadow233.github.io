function injectKeyboard() {
    let keyboardHtml = `<div id="keyboard-tips"><div class="keyboardTitle">快捷键</div><div class="keybordList">`;
    let keyboardScript = `<script>function showKeyboard(){$("#keyboard-tips").addClass('show')}function hideKeyboard(){$("#keyboard-tips").removeClass('show')}$(document).ready(function(){let ctrlCmdKeyTimeout;const delay=300;$(document).on('keydown',function(event){if(event.key==='Shift'){if(!ctrlCmdKeyTimeout){ctrlCmdKeyTimeout=setTimeout(showKeyboard,delay)}}});$(document).on('keyup',function(event){if(event.key==='Shift'){clearTimeout(ctrlCmdKeyTimeout);ctrlCmdKeyTimeout=null;hideKeyboard()}})});$(document).keydown(function(event) {if (event.shiftKey && event.key!== 'Shift') {hideKeyboard();switch (event.keyCode){`;
    for (item of hexo.config.keyboard.items) {
        let keyboardItem = `<div class="keybordItem"><div class="keyGroup"><div class="key">Shift + ${item.text}</div></div><div class="keyContent"><div class="content">${item.action}</div></div></div>`;
        keyboardHtml += keyboardItem;
        keyboardScript += `case ${item.keycode}:event.preventDefault();${item.script};break;`
    }
    keyboardHtml += '</div></div></div>';
    let keyboadrCSS = `<link rel="stylesheet" href="https://blogfiles.oss.fyz666.xyz/css/keyboard.css">`;
    keyboardScript += '}}});</script>';
    hexo.extend.injector.register('head_end', keyboardHtml, "default");
    hexo.extend.injector.register('head_end', keyboadrCSS, "default");
    hexo.extend.injector.register('head_end', keyboardScript, "default");
}
hexo.extend.filter.register('after_generate',function() {
    if(hexo.config.keyboard.enable){
        injectKeyboard();
    }
})