/**
 * Created by zhou on 17/7/31.
 */
const router = require('./router');
const Router = new require('koa-router')();
module.exports = async function (app) {
    //app.use;
    router(Router);
    app.use(Router.routes());
};
