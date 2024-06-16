window.commentBarrageTimer = null;
function isInViewPortOfOne (el) {
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight 
    const offsetTop = el.offsetTop
    const scrollTop = document.documentElement.scrollTop
    const top = offsetTop - scrollTop
    return top <= viewPortHeight
}
function initCommentBarrage(){
    window.commentBarrageTimer && clearInterval(window.commentBarrageTimer);
    var data = JSON.stringify({
        "event": "COMMENT_GET",
        "commentBarrageConfig.accessToken": commentBarrageConfig.accessToken,
        "url": commentBarrageConfig.pageUrl
    });
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", commentBarrageConfig.twikooUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onreadystatechange=(event)=>{
        if(xhr.readyState === 4) {
            if (xhr.status === 200) {
                commentBarrageConfig.barrageList = commentLinkFilter(JSON.parse(xhr.responseText).data);
                commentBarrageConfig.dom.innerHTML = '';
            }
        }
    }
    window.commentBarrageTimer = setInterval(()=>{
        if(commentBarrageConfig.barrageList.length){
            popCommentBarrage(commentBarrageConfig.barrageList[commentBarrageConfig.barrageIndex]);
            commentBarrageConfig.barrageIndex += 1;
            commentBarrageConfig.barrageIndex %= commentBarrageConfig.barrageList.length;
        }
        if(commentBarrageConfig.barrageTimer.length > (commentBarrageConfig.barrageList.length > commentBarrageConfig.maxBarrage?commentBarrageConfig.maxBarrage:commentBarrageConfig.barrageList.length)){
            removeCommentBarrage(commentBarrageConfig.barrageTimer.shift())
        }
    },commentBarrageConfig.barrageTime)
}
function commentLinkFilter(data){
    data.sort((a,b)=>{
        return a.created - b.created;
    })
    let newData = [];
    data.forEach(item=>{
        newData.push(...getCommentReplies(item));
    });
    return newData;
}
function getCommentReplies(item){
    if(item.replies){
        let replies = [item];
        item.replies.forEach(item=>{
            replies.push(...getCommentReplies(item));
        })
        return replies;
    }else{
        return [];
    }
}
function popCommentBarrage(data){
    let barrage = document.createElement('div');
    barrage.className = 'comment-barrage-item'
    let ran = Math.floor(Math.random()*commentBarrageConfig.lightColors.length)
    document.getElementById("barragesColor").innerHTML=`[data-theme='light'] .comment-barrage-item { background-color:${commentBarrageConfig.lightColors[ran][0]};color:${commentBarrageConfig.lightColors[ran][1]}}[data-theme='dark'] .comment-barrage-item{ background-color:${commentBarrageConfig.darkColors[ran][0]};color:${commentBarrageConfig.darkColors[ran][1]}}`;

    barrage.innerHTML = `
        <div class="barrageHead">
            <img class="barrageAvatar" src="https://${commentBarrageConfig.avatarCDN}/avatar/${data.mailMd5}?d=${commentBarrageConfig.noAvatarType}"/>
            <div class="barrageNick">${data.nick}</div>
            <a href="javascript:switchCommentBarrage()" style="font-size:20px">×</a>
        </div>
        <div class="barrageContent">${data.comment}</div>
    `
    commentBarrageConfig.barrageTimer.push(barrage);
    commentBarrageConfig.dom.append(barrage);
}
function removeCommentBarrage(barrage){
    barrage.className = 'comment-barrage-item out';

    if(commentBarrageConfig.maxBarrage!=1){
        setTimeout(()=>{
            commentBarrageConfig.dom.removeChild(barrage);
        },1000)
    }else{
        commentBarrageConfig.dom.removeChild(barrage);
    }
}
switchCommentBarrage = function () {
    if(!document.getElementById("post-comment")) return;
    if(!isInViewPortOfOne(document.getElementById("post-comment"))){
        localStorage.setItem("isBarrageToggle",Number(!Number(localStorage.getItem("isBarrageToggle"))));
        commentBarrageConfig.displayBarrage=!(commentBarrageConfig.displayBarrage);
        let commentBarrage = document.querySelector('.comment-barrage');
        if (commentBarrage) {
            $(commentBarrage).fadeToggle()
        }
    }
}
$(".comment-barrage").hover(function(){
    window.commentBarrageTimer && clearInterval(window.commentBarrageTimer);
},function () {
    window.commentBarrageTimer=setInterval(()=>{
        if(commentBarrageConfig.barrageList.length){
            popCommentBarrage(commentBarrageConfig.barrageList[commentBarrageConfig.barrageIndex]);
            commentBarrageConfig.barrageIndex += 1;
            commentBarrageConfig.barrageIndex %= commentBarrageConfig.barrageList.length;
        }
        if(commentBarrageConfig.barrageTimer.length > (commentBarrageConfig.barrageList.length > commentBarrageConfig.maxBarrage?commentBarrageConfig.maxBarrage:commentBarrageConfig.barrageList.length)){
            removeCommentBarrage(commentBarrageConfig.barrageTimer.shift())
        }
    },commentBarrageConfig.barrageTime)
})
if(localStorage.getItem("isBarrageToggle")==undefined){
    localStorage.setItem("isBarrageToggle","0");
}else if(localStorage.getItem("isBarrageToggle")=="1"){
    localStorage.setItem("isBarrageToggle","0");
    switchCommentBarrage();
}