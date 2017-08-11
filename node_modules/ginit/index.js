var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var inquirer = require('inquirer');
var clean = require('rimraf');
var gitClone = require('./lib/gitclone');
var mkdirp = require('mkdirp');
var commander = require('commander');
var spawn = require('cross-spawn-async');
var util = require('util');
var globby = require('globby');
var userHome = require('os-homedir');
/*
* ginit({
* dir:xx,
* dist:xxx,
* ignore: [],
* data:{},
* copyReplace
* },fu)
* */
var Ginit = module.exports;
var fns = {
  init: function (obj, cb) {
    var self = this;
    var arrIgnore = ['.git', '.idea', 'node_module','.DS_Store'];
    var obj = self._resetObj(obj);
    var data = {
      ignore: obj && obj.ignore && _.isArray(obj.ignore) ? obj.ignore.concat(arrIgnore) : arrIgnore,
      dist: obj && obj.dist ? obj.dist : process.cwd(),
      obj: obj && obj.data ? obj.data: {}
    };
    self._getDir(obj, function (dir, isGit) {
      if (isGit) {
        self._getTmpl(dir, function (dir, tempdir) {
          data.dir = dir;
          data.isGit = true;
          data.tempdir = tempdir;
          if(obj.copyReplace){
            self._copyReplace(data,cb);
          }else{
            self._handleTmpl(data, cb);
          }

        })
      } else {
        data.dir = dir;
        if(obj.copyReplace){
          self._copyReplace(data,cb);
        }else{
          self._handleTmpl(data, cb);
        }
      }
    })
  },


  _resetObj: function(obj){
    var data = {};
    if (!obj || _.isEmpty(obj)) {
      console.log('请输入对应的temp地址 支持本地路径与线上.git 路径');
      process.exit();
    } else if (_.isString(obj)) {
      data.dir = obj;
    } else if (_.isObject(obj)) {
      data = obj;
    }
    return data;
  },

  //删除 拷贝文件
  _copyReplace: function(data,cb){
    var self = this;
        var dir = data.dir;
        var dist = data.dist;
        if (fs.existsSync(dist)) {
            clean(dist, {}, function () {
                copy()
            })
        } else {
            copy()
        }
        function copy() {
            var ignore = data.ignore || [];
            var arr = self._getArrChoice(ignore);
            var i = 0;
            var files = globby.sync(arr, {cwd: dir});
            if(!files.length){
                return cb && cb(data.obj);
            }
            files.forEach(function (item, index) {
                Ginit.copy( path.join(dir,item),path.join(dist,item),function () {
                    end();
                });
            });
            function end() {
                i++;
                if (files.length === i) {
                    //删除临时文件
                    data && data.tempdir && clean(data.tempdir, {}, function () {
                    });
                    cb && cb(data.obj);
                }
            }
        }
  },
  _getArrChoice: function (ingore) {
        var arr = ['*','**/*'];
        ingore.forEach(function (item) {
            if (item) {
                if (item.indexOf('!') === 0) {
                    arr.push(item.substr(1))
                } else {
                    arr.push('!' + item)
                }
            }
        });
        return arr;
    },

  //生成模板
      _handleTmpl: function (data, cb) {
        var self = this;
        var dir = data.dir;
        var ignore = data.ignore || [];
        ignore.push('_inquirer.js');
        var dist = data.dist;
        self._setInquirer(data, function (obj) {
            var i = 0;
            var arr = self._getArrChoice(ignore);
            var files = globby.sync(arr, {cwd: dir});
            if(!files.length){
                return cb && cb(data.obj);
            }
            files.forEach(function (item, index) {
                Ginit.template({
                    file: path.join(dir,item),
                    dist: path.join(dist,item).replace(/_([^\\\/]+)$/g,function($world,$1){
                        return '.'+$1;
                    }),
                    data: data.obj
                },function () {
                    end();
                });
            });
            function end() {
                i++;
                if (files.length === i) {
                    data && data.tempdir && clean(data.tempdir, {}, function () { });
                    cb && cb(data.obj);
                }
            }

        })
    },

  //选中注入数据
  _setInquirer: function (data, callback) {
    var dir = data.dir;
    var obj = data.obj || {};
    obj.appname = obj.appname || path.basename(data.dist) || process.cwd();
    var inquirerPath = path.join(dir, '_inquirer.js');
    if (fs.existsSync(inquirerPath)) {
      var inquireObj = require(inquirerPath) || {};
      var prompts = inquireObj.prompts || [];
      if(_.isFunction(prompts)) prompts = prompts() || []; //不考虑异步情况
      if (prompts.length) {
        inquirer.prompt(prompts, function (props) {
          obj = _.extend(obj, props);
          if (inquireObj.end) {
            inquireObj.end(obj, callback);
          } else {
            callback(obj);
          }
        })
      } else {
        if (inquireObj.end) {
          inquireObj.end(obj, callback);
        } else {
          callback(obj);
        }
      }
    } else {
      callback(obj);
    }
  },

  _createFile: function (filename, dist, content,cb) {
    filename = path.join(dist, filename);
    //没有目录文件需要创建
    mkdirp(path.dirname(filename), 511 /* 0777 */, function (err) {
      fs.writeFileSync(filename, content);
      cb && cb()
      console.log('文件' + filename + '已经创建成功')
    });
  },

  _getTmpl: function (url, callback) {
    gitClone(url, function (dir, tempdir) {
      callback && callback(dir, tempdir);
    })
  },


  _getDir: function (obj, callback) {
    var data = obj || {};
    var dir = data.dir || null;
    var mapObj = data.mapObj || {};
    var isGit = false;
    mapObj[dir] && (dir = mapObj[dir]);
    if (/^git@/.test(dir) || /^http(s)?:\/\//.test(dir)) {
      if (/\.git$/.test(dir)) {
        isGit = true;
      } else {
        console.log('请输入确认.git 路径如：git@gitlab.alibaba-inc.com:o2o/xxx.git');
        process.exit(1);
        return;
      }
    } else if (path.isAbsolute(dir)) {
      if (fs.existsSync(dir)) {

      } else {
        console.log('未找到路径' + dir)
        process.exit(1);
        return;
      }
    } else {
      //当做相对路径处理
      dir = path.join(process.cwd(), dir);
      if (fs.existsSync(dir)) {

      } else {
        console.log('未找到路径' + dir)
        process.exit(1);
        return;
      }

    }
    callback && callback(dir, isGit)
  }
};


Ginit.init =  function(){
  fns.init.apply(fns,arguments);
};

Ginit.underscore = _;
Ginit.rimraf = clean;
Ginit.mkdirp = mkdirp;
Ginit.commander = commander;
Ginit.globby = globby;
Ginit.spawn = require('cross-spawn-async');
Ginit.inquirer = inquirer;
Ginit.copy = function(file,dist,cb){
  if (!fs.existsSync(file)) {
    console.log('文件' + file + '不存在');
    return
  }
  dist = dist || process.cwd();
  if(fs.statSync(file).isDirectory()){
    return  mkdirp(path.dirname(dist), 511 /* 0777 */, function (err) {
      cb && cb();
    })
  }
  var content = fs.readFileSync(file);
  //没有目录文件需要创建
  mkdirp(path.dirname(dist), 511 /* 0777 */, function (err) {
    fs.writeFileSync(dist, content);
    console.log('文件' + dist + '已经创建成功');
    cb && cb();
  });
};
Ginit.template = function(obj,cb){
  var dObj = {
    file: '',
    dist: process.cwd(),
    data: {}
  };
  var data = _.extend(dObj, obj || {});
  if (!fs.existsSync(data.file)) {
    console.log('文件' + data.file + '不存在');
    return
  }
  if(fs.statSync(data.file).isDirectory()){
    return  mkdirp(path.dirname(data.dist), 511 /* 0777 */, function (err) {
      cb && cb();
    })
  }
  var content = fs.readFileSync(data.file, {encoding: 'utf-8'});
  try {
    content = _.template(content)(data.data);
  } catch (err) {
    console.error(data.file + 'template失败请检查对象名称是否正确');
  }
  //没有目录文件需要创建
  mkdirp(path.dirname(data.dist), 511 /* 0777 */, function (err) {
    fs.writeFileSync(data.dist, content);
    console.log('文件' + data.dist + '已经创建成功');
    cb && cb();

  });
};
Ginit.changeClassName = function(str){
   var cameledName, classedName, classname;
        cameledName = changeCameled(str);
        classedName = changeClassed(str);
        classname = classedName.toLowerCase();
        return {
            classname: classname, //全小写
            classedName: classedName, //大驼峰
            cameledName: cameledName   //小驼峰
        };

        function changeClassed(str) {
            if (!str) return str || '';
            var arr = str.split(/(_|-|\/|\\)/g);
            arr = arr.filter(function (url) {
                return !/(_|-|\/|\\)/g.test(url)
            });
            var newArr = [];
            arr.forEach(function (item) {
                if (item) {
                    newArr.push(item.substr(0, 1).toUpperCase() + item.slice(1));
                }
            });
            return newArr.join('');
        }

        function changeCameled(str) {
            if (!str) return str || '';
            str = changeClassed(str);
            return str.substr(0, 1).toLowerCase() + str.slice(1);
        }
}
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
function rewrite(args) {
    // check if splicable is already in the body text
    var re = new RegExp(args.splicable.map(function (line) {
        return '\s*' + escapeRegExp(line);
    }).join('\n'));

    if (re.test(args.haystack)) {
        return args.haystack;
    }

    var lines = args.haystack.split('\n');

    var otherwiseLineIndex = -1;
    lines.forEach(function (line, i) {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });

    if ((otherwiseLineIndex >= 0) && (args.spliceWithinLine)) {
        var line = lines[otherwiseLineIndex];
        var indexToSpliceAt = line.indexOf(args.needle);

        lines[otherwiseLineIndex] = line.substr(0, indexToSpliceAt) + args.splicable[0] + line.substr(indexToSpliceAt);

        return lines.join('\n');
    }
    otherwiseLineIndex === -1 && (otherwiseLineIndex = 0);
    var spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }

    var spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }

    lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
        return spaceStr + line;
    }).join('\n'));

    return lines.join('\n');
}
Ginit.rewrite = rewrite;

Ginit.tnpmInstall = function(options,cb){
   var cb = cb || function(){};
    options = util._extend({
    cwd: process.cwd(),
    args: ['install'],
    registry: 'https://registry.npm.taobao.org',
    stdio: 'inherit'
  }, options || {});
  var args = options.args.concat([]);
  args.unshift('--registry=' + options.registry);
  //tnpm
  var npm = 'npm';
  var tnpmrc = path.join(userHome(),'.cnpmrc');
  if(fs.existsSync(tnpmrc)){
    npm = 'cnpm';
    args.unshift('--userconfig='+tnpmrc);
  }
  var cli = spawn(npm, args, {
    cwd: options.cwd,
    env: process.env,
    stdio: options.stdio
  });
  cli.on('close', function (status) {
    if (status == 0) {
      cb(null)
    } else {
      cb(status)
    }
  });
}
Ginit.npmInstall  = Ginit.tnpmInstall;