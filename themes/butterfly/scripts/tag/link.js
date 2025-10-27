function link(args) {
    args = args.join(' ').split(',');
    let title = args[0];
    let sitename = args[1];
    let link = args[2];
    // let urlNoProtocol = link.replace(/^https?\:\/\//i, "");
    let hostname;
    try {
        hostname = new URL(link).hostname;
    }
    catch (e) {
        hostname = '';
    }
    // check if the hostname ends with .fyz666.xyz
    let tip, imgUrl;
    if (!hostname) {
        tip = '引用本站资源，请放心访问';
        imgUrl = '/images/avatar.webp';
    } else {
        tip = '引用站外地址，不保证站点的可用性和安全性';
        imgUrl = "https://logo.clearbit.com/" + hostname + "?size=256";
    }
    
    let fallbackImgUrl = "/images/default-link.png";

    return `<a class="tag-Link" target="_blank" href="${link}">
    <div class="tag-link-tips">${tip}</div>
    <div class="tag-link-bottom">
        <div class="tag-link-left">
            <img src="${imgUrl}" onerror="this.onerror=null;this.src='${fallbackImgUrl}';" />
        </div>
        <div class="tag-link-right">
            <div class="tag-link-title">${title}</div>
            <div class="tag-link-sitename">${sitename}</div>
        </div>
        <i class="fa-solid fa-angle-right"></i>
    </div>
    </a>`
}

hexo.extend.tag.register('link',link, { ends: false })