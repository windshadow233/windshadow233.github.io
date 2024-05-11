const fs = require('fs-extra');
const path = require('path');
const fm = require('hexo-front-matter');


hexo.on('new', function(post){
  const postsDir = path.join(process.cwd(), 'source', '_posts');
  if (!post.path.includes(postsDir)) return;
  const fileName = path.basename(post.path);
  const years = fs.readdirSync(postsDir).sort().reverse();
  for (let year of years) {
    const months = fs.readdirSync(path.join(postsDir, year)).sort().reverse();
    for (let month of months) {
      const files = fs.readdirSync(path.join(postsDir, year, month));
      const postFiles = files.filter(file => file.endsWith('.md') && file !== fileName);
      if (postFiles.length > 0) {
        let maxId = 0;
        postFiles.forEach(file => {
          let content = fm.parse(fs.readFileSync(path.join(postsDir, year, month, file), "utf8"));
          if (typeof content.id !== 'undefined') {
            maxId = Math.max(maxId, content.id);
          }
        });
        content = fm.parse(post.content);
        content.id = maxId + Math.floor(Math.random() * 100) + 1;
        console.log(`${post.path} -> ${content.id}`);
        fs.writeFileSync(post.path, '---\n' + fm.stringify(content));
        return;
      }
    }
  }
});