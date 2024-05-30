function injectKeyboard() {
    let keyboardHtml = `<div id="keyboard-tips" style="display:none;"><div class="keyboardTitle">快捷键</div><div class="keybordList">`;
    for (item of hexo.config.shortcut.items) {
        keyboardHtml += `<div class="keybordItem"><div class="keyGroup"><div class="key">Shift + ${item.text}</div></div><div class="keyContent"><div class="content">${item.action}</div></div></div>`;
    }
    keyboardHtml += '</div></div></div>';
    let keyboadrCSS = `<link rel="stylesheet" href="https://blogfiles.oss.fyz666.xyz/css/keyboard.css">`;
    hexo.extend.injector.register('head_end', keyboardHtml, "default");
    hexo.extend.injector.register('head_end', keyboadrCSS, "default");
}
hexo.extend.filter.register('after_generate',function() {
    if(hexo.config.shortcut.enable){
        injectKeyboard();
    }
})