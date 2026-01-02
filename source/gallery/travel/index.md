---
title: 旅行相册
comments: false
date: 2024-04-14 18:28:10
aside: false
top_img: false
---

<style>
.sub-page {
    display: none;
    margin-bottom: 20px;
}
.sub-page.active {
    display: block;
}
.pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 15px;
    margin: 20px 0;
}
.pagination .page-btn {
    padding: 10px 15px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #6a5af9, #727cf5);
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}
.pagination .page-btn:hover {
    background: linear-gradient(135deg, #5a4af9, #606cf5);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
.pagination .page-btn.active {
    background: linear-gradient(135deg, #f74a62, #fc5a72);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-3px);
}
</style>

<script>
$(document).ready(() => {
    const pages = document.querySelectorAll(".sub-page");
    const pagination = document.querySelector('.pagination');

    pages.forEach((page, i) => {
        const btn = document.createElement('button');
        
        btn.className = 'page-btn';
        btn.textContent = page.getAttribute('data-name');
        
        btn.dataset.index = i;
        
        if (i === 0) {
            btn.classList.add('active');
        }
        
        pagination.appendChild(btn);
    });

    const buttons = document.querySelectorAll(".page-btn");

    function showPage(index) {
        pages.forEach((page, i) => {
            if (i === index) {
                    page.classList.add("active");
                } else {
                    page.classList.remove("active");
                }
        });

        buttons.forEach((btn, i) => {
            btn.classList.toggle("active", i === index);
        });
    }

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        showPage(index);
        });
    });

    showPage(0);
});
</script>

<div class='pagination'></div>


<div class="gallery-group-main sub-page active" data-index=0 data-name="1">
{% galleryGroup 西安 古都风韵，千年岁月流转，兵马俑守望着长安城的沉睡故事。 /gallery/travel/xi-an/ https://blogfiles.oss.fyz666.xyz/webp/5b24da63-7a4d-49f3-8d1e-3f0974fe87bd.webp %}
{% galleryGroup 西藏 雪域高原的灵魂，珠穆朗玛峰下，信仰与自然和谐共舞。 /gallery/travel/tibet/ https://blogfiles.oss.fyz666.xyz/webp/87a4f33d-a748-48b8-b31f-0b27a766da4e.webp %}
{% galleryGroup 厦门 海上花园城市，鼓浪屿的音符轻拂着碧海蓝天，温婉如诗。 /gallery/travel/xiamen/ https://blogfiles.oss.fyz666.xyz/webp/ae5dd064-33bf-4344-896d-a90800bed64d.webp %}
{% galleryGroup 广东 南国明珠，珠江水悠悠，融合了岭南文化与现代繁华的韵味。 /gallery/travel/guangdong/ https://blogfiles.oss.fyz666.xyz/webp/df525de4-128a-4ba8-992e-3da34f78a7e1.webp %}
{% galleryGroup 内蒙古 草原的呼唤，蓝天下马儿奔腾，风中传唱着草原的歌。 /gallery/travel/neimenggu/ https://blogfiles.oss.fyz666.xyz/webp/7e2d347f-3194-4398-a694-091a40fcfb14.webp %}
{% galleryGroup 桐庐 江南秘境，山水间隐逸着古镇的宁静，河畔映照着岁月的风雅，诉说着浓郁的文化与自然的和谐交融。 /gallery/travel/tonglu/ https://blogfiles.oss.fyz666.xyz/webp/655049c4-693e-4a4d-bd8b-f0a84ef6af01.webp %}
</div>

<div class="gallery-group-main sub-page" data-index=1 data-name="2">
{% galleryGroup 长沙 潇湘辣韵的传承者，湘江之畔，岳麓山下，历史与现代交织，火辣美食与革命故事并肩诉说。 /gallery/travel/changsha/ https://blogfiles.oss.fyz666.xyz/webp/6fcb6c94-3a05-4022-a6d0-f9c58639a6d4.webp %}
{% galleryGroup 黄山 中国古画的现实投影，云雾缭绕中的松石奇观，四季变换下的绝美画卷。这里是自然与人文的完美融合。 /gallery/travel/huangshan/ https://blogfiles.oss.fyz666.xyz/jpeg/38ec12c6-54ea-4d9e-a77c-28e412300c8e.jpeg %}
{% galleryGroup 张家界 自然奇观，峰林绝壁间，云雾缭绕，如梦似幻，山水画卷的真实再现。 /gallery/travel/zhangjiajie/ https://blogfiles.oss.fyz666.xyz/webp/fbdbba7f-018b-48e9-8636-0246e4add450.webp %}
{% galleryGroup 云南 彩云之南的诗意故土，雪山与古城辉映，草原与湖泊相依，少数民族的歌舞在山谷间诉说千年传承。 /gallery/travel/yunnan/ https://blogfiles.oss.fyz666.xyz/webp/b7914a70-02cb-44f8-8064-ec4d2a9f7d17.webp %}
{% galleryGroup 成都 天府之国的安逸底色，三星堆的古蜀秘境与武侯祠的三国志气交相辉映。都江堰水流千年，滋养出宽窄巷子的市井烟火。看熊猫憨态可掬，品火锅热辣滚烫，在锦官城的慢时光里，感悟生活最本真的真谛。 /gallery/travel/chengdu/ https://blogfiles.oss.fyz666.xyz/webp/0c316419-2a06-46db-8402-0f015d50d027.webp %}
</div>

{% btn "javascript:location.href = '..'",返回,fa-solid fa-arrow-left,outline blue larger %}
