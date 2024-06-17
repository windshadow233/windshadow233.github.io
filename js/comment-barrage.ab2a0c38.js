function isInViewPortOfOne(e){const r=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;return e.offsetTop-document.documentElement.scrollTop<=r}function initCommentBarrage(){window.commentBarrageTimer&&clearInterval(window.commentBarrageTimer);var e=JSON.stringify({event:"COMMENT_GET","commentBarrageConfig.accessToken":commentBarrageConfig.accessToken,url:commentBarrageConfig.pageUrl}),r=new XMLHttpRequest;r.withCredentials=!0,r.open("POST",commentBarrageConfig.twikooUrl),r.setRequestHeader("Content-Type","application/json"),r.send(e),r.onreadystatechange=e=>{4===r.readyState&&200===r.status&&(commentBarrageConfig.barrageList=commentLinkFilter(JSON.parse(r.responseText).data),commentBarrageConfig.dom.innerHTML="")},window.commentBarrageTimer=setInterval((()=>{commentBarrageConfig.barrageList.length&&(popCommentBarrage(commentBarrageConfig.barrageList[commentBarrageConfig.barrageIndex]),commentBarrageConfig.barrageIndex+=1,commentBarrageConfig.barrageIndex%=commentBarrageConfig.barrageList.length),commentBarrageConfig.barrageTimer.length>(commentBarrageConfig.barrageList.length>commentBarrageConfig.maxBarrage?commentBarrageConfig.maxBarrage:commentBarrageConfig.barrageList.length)&&removeCommentBarrage(commentBarrageConfig.barrageTimer.shift())}),commentBarrageConfig.barrageTime)}function commentLinkFilter(e){e.sort(((e,r)=>e.created-r.created));let r=[];return e.forEach((e=>{r.push(...getCommentReplies(e))})),r}function getCommentReplies(e){if(e.replies){let r=[e];return e.replies.forEach((e=>{r.push(...getCommentReplies(e))})),r}return[]}function popCommentBarrage(e){let r=document.createElement("div");r.className="comment-barrage-item";let a=Math.floor(Math.random()*commentBarrageConfig.lightColors.length);document.getElementById("barragesColor").innerHTML=`[data-theme='light'] .comment-barrage-item { background-color:${commentBarrageConfig.lightColors[a][0]};color:${commentBarrageConfig.lightColors[a][1]}}[data-theme='dark'] .comment-barrage-item{ background-color:${commentBarrageConfig.darkColors[a][0]};color:${commentBarrageConfig.darkColors[a][1]}}`,r.innerHTML=`\n        <div class="barrageHead">\n            <img class="barrageAvatar" src="https://${commentBarrageConfig.avatarCDN}/avatar/${e.mailMd5}?d=${commentBarrageConfig.noAvatarType}"/>\n            <div class="barrageNick">${e.nick}</div>\n            <a href="javascript:switchCommentBarrage()" style="font-size:20px">×</a>\n        </div>\n        <div class="barrageContent">${e.comment}</div>\n    `,commentBarrageConfig.barrageTimer.push(r),commentBarrageConfig.dom.append(r)}function removeCommentBarrage(e){e.className="comment-barrage-item out",1!=commentBarrageConfig.maxBarrage?setTimeout((()=>{commentBarrageConfig.dom.removeChild(e)}),1e3):commentBarrageConfig.dom.removeChild(e)}window.commentBarrageTimer=null,document.onscroll=function(){commentBarrageConfig.displayBarrage&&(isInViewPortOfOne(document.getElementById("post-comment"))?document.getElementsByClassName("comment-barrage.ab2a0c38")[0].setAttribute("style","display:none;"):document.getElementsByClassName("comment-barrage.ab2a0c38")[0].setAttribute("style",""))},switchCommentBarrage=function(){if(document.getElementById("post-comment")&&!isInViewPortOfOne(document.getElementById("post-comment"))){localStorage.setItem("isBarrageToggle",Number(!Number(localStorage.getItem("isBarrageToggle")))),commentBarrageConfig.displayBarrage=!commentBarrageConfig.displayBarrage;let e=document.querySelector(".comment-barrage");e&&$(e).fadeToggle()}},$(".comment-barrage").hover((function(){window.commentBarrageTimer&&clearInterval(window.commentBarrageTimer)}),(function(){window.commentBarrageTimer=setInterval((()=>{commentBarrageConfig.barrageList.length&&(popCommentBarrage(commentBarrageConfig.barrageList[commentBarrageConfig.barrageIndex]),commentBarrageConfig.barrageIndex+=1,commentBarrageConfig.barrageIndex%=commentBarrageConfig.barrageList.length),commentBarrageConfig.barrageTimer.length>(commentBarrageConfig.barrageList.length>commentBarrageConfig.maxBarrage?commentBarrageConfig.maxBarrage:commentBarrageConfig.barrageList.length)&&removeCommentBarrage(commentBarrageConfig.barrageTimer.shift())}),commentBarrageConfig.barrageTime)})),null==localStorage.getItem("isBarrageToggle")?localStorage.setItem("isBarrageToggle","0"):"1"==localStorage.getItem("isBarrageToggle")&&(localStorage.setItem("isBarrageToggle","0"),switchCommentBarrage());