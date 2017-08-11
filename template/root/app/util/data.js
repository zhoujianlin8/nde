/**
 * Created by zhou on 17/7/31.
 */
/**
 * Created by zhou on 16/11/17.
 */
'use strict';
let Data = {
    error: true,
    data: {},
    msg: ''
};
module.exports = function(){
    const data = Object.assign({},Data);
    return {
        get Data (){
            return data
        },
        set msg (str){
            data.msg = str;
            data.error = true;
        },
        set error (b){
            data.error = b
        },
        set data (obj){
            data.data = obj;
            data.error = false;
        }
    };
};
module.exports.setMsg = function(str){
    const data = Object.assign({},Data);
    data.msg = str;
    data.error = true;
    return data
};
module.exports.setData = function(obj){
    const data = Object.assign({},Data);
    data.error = false;
    data.data = obj;
    return data
};
