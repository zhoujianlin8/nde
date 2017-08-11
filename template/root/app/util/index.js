/**
 * Created by zhou on 17/5/10.
 */
const merge =  require('merge');
const path = require('path');
const fs = require('fs');
const events = require('events');
let env,config;
let options = {
    dirPath: process.cwd(),
    configDir: 'config',
    mainPath : 'app/index.js',
    port: process.env.PORT || 4000
};
const isType = function (arg) {
    return Object.prototype.toString.call(arg)
};
//new events()
const output= Object.assign({},new events(),{
    options: options,
    get env (){
        //local,publish,daily,pre,test,debug
        if(env) return env;
        env = process.env.NODE_ENV || 'publish';
        if(['local','publish','daily','pre','test','debug'].indexOf(env) === -1){
            env = 'publish';
        }
        return env;
    },
    get config(){
        if(config) return config;
        const configPath = path.join(this.options.dirPath,this.options.configDir);
        if(!fs.existsSync(configPath)){
            console.error(`configPath: ${configPath} not found`);
            return {};
        }
        let con = require(path.join(configPath,'base.js'));
        if(this.isFunction(con)){
            con = con(this);
        }
        let con1 = {};
        const envPath = path.join(configPath,this.env+'.js');
        if(fs.existsSync(envPath)){
            con1 = require(envPath);
            this.isFunction(con1)&& (con1 = con1(this));
        }
        config = merge.recursive(true,con || {},con1 || {});
        return config;
    },

    isString(str){
        return isType(str) === '[object String]'
    },
    isArray(str){
        return isType(str) === '[object Array]'
    },
    isObject(str){
        return isType(str) === '[object Object]'
    },
    isFunction(str){
        return isType(str) === '[object Function]'
    },
    isAsyncFunction(str){
        return isType(str) === '[object AsyncFunction]'
    }
});
module.exports = output;
