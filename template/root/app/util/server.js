/**
 * Created by zhou on 17/5/10.
 */
let output = require('./index');
const path = require('path');
const fs = require('fs');
const koa = require('koa');
const app = new koa();
module.exports = async function (options = {}) {
    let config = output.config || {};
    output.options = Object.assign(output.options,options);
    options = output.options;
    const mainPath = path.join(output.options.dirPath ,output.options.mainPath);
    if(fs.existsSync(mainPath)){
        const fn = require(mainPath);
        if(output.isAsyncFunction(fn) || output.isFunction(fn)){
            await fn(app,output)
        }
    }
    const server = app.listen(options.port,function () {
        console.log('http://127.0.0.1:' + options.port);
    });
    return server;
};
