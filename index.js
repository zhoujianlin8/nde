var util = require('util');
var path = require('path');
var fs = require('fs');
var xtUtil = require('ginit');
var ginit = xtUtil.init;
var template = xtUtil.template;
var templatePath = path.join(__dirname, './template');
var Tasks = module.exports;
var cwd = process.cwd();
//项目初始化
Tasks.init = function (str) {
    var dir = str ? str : path.join(templatePath, '/root');
    var data = xtUtil.changeClassName(path.basename(cwd));
    if(fs.existsSync(path.join(cwd,'package.json'))){
        return console.error('项目已存在')
    }
    ginit({
        dir: dir,
        data: data
    }, function (obj) {
        install();
    });
    function install() {
        console.log('项目初始成功');
        console.log('正在执行 npm install ... ');
        console.log('你可退出 手动执行 npm install ');
        xtUtil.npmInstall({},function(err){
            if(err){
               return console.error('npm install 自动执行出现问题， 请手动执行 npm install')
            }
            console.log('正在执行 npm start');
            require('npm-run-script')('npm start')
        })
    }
};

