
/**
 * Created by zhou on 17/7/31.
 */
const Ctr = require('./ctrs/index');
module.exports = function (app) {
    app.get('/',Ctr.index);
}
