'use strict'

function injectKeyboard() {
    let keyboardHtml = `<div id="keyboard-tips" style="display:none;"><div class="keyboardTitle">快捷键</div><div class="keybordList">`;
    for (let item of hexo.theme.config.shortcut.items) {
        keyboardHtml += `<div class="keybordItem"><div class="keyGroup"><div class="key">Shift + ${item.text}</div></div><div class="keyContent"><div class="content">${item.action}</div></div></div>`;
    }
    keyboardHtml += '</div></div></div>';
    let keyboadrCSS = `<link rel="stylesheet" href="${hexo.theme.config.shortcut.keyboard_css}">`;
    hexo.extend.injector.register('head_end', keyboardHtml, "default");
    hexo.extend.injector.register('head_end', keyboadrCSS, "default");
}
hexo.extend.filter.register('after_generate',function() {
    if(hexo.theme.config.shortcut.enable){
        injectKeyboard();
    }
})