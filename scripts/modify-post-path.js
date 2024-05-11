const path = require('path');


hexo.extend.filter.register('new_post_path', function(filePath){
  if (!filePath.includes(path.join(process.cwd(), 'source', '_posts'))) return filePath;
  var filename = path.basename(filePath);
  var dirname = path.dirname(filePath);
  var date = new Date();
  var year = date.getFullYear().toString();
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var newPath = path.join(dirname, year, month, filename);
  return newPath;
});