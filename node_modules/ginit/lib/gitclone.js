var spawn = require('cross-spawn-async');
var path = require('path');
var mkdirp = require('mkdirp');
module.exports = function (opts, cb) {
  if (typeof opts === 'string') {
    opts = {
      url: opts
    };
  } else {
    opts = opts || {};
  }
  var git = opts.git || 'git';
  //var dir = opts.dir || process.cwd();
  var targetPath = opts.targetPath || 'template'; //统一改写名称
  var tmpDir = opts.tmpDir || path.join(__dirname, '.tmp' + Date.now());
  var args = ['clone'];
  args.push('--');
  args.push(opts.url);
  args.push(targetPath);

  //没有目录文件需要创建
  mkdirp(tmpDir, 511 /* 0777 */, function (err) {
    var clone = spawn(git, args, {
      cwd: tmpDir,
      env: process.env,
      stdio: 'inherit' //输出log
    });
    clone.on('close', function (status) {
      if (status == 0) {
        cb && cb(path.join(tmpDir, targetPath), tmpDir);
      } else {
        console.log('git clone 失败' + status)
      }
    });
  });

};