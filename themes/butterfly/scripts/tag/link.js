function link(args) {
    args = args.join(' ').split(',');
    let title = args[0];
    let sitename = args[1];
    let link = args[2];
    // let urlNoProtocol = link.replace(/^https?\:\/\//i, "");
    let hostname = new URL(link).hostname;
    let imgUrl = "https://logo.clearbit.com/" + hostname + "?size=256";
    let fallbackImgUrl = "/images/default-link.png";

    return `<a class="tag-Link" target="_blank" href="${link}">
    <div class="tag-link-tips">引用站外地址，不保证站点的可用性和安全性</div>
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