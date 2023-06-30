/**
 * @fileoverview 条件基类
 * @author meifan@gameley.cn (梅凡)
 */

 const ConditionBaseComponent = cc.Class({
    extends: cc.Component,

    properties: {
        result: null,
    },

    doResult: function() {
        this.result = null;
    },

    doResultWithParam: function (param) {
        this.result = param;
    },

    clearResult: function() {
        this.result = null;
    },
    
    isTrue: function () {
        return this.result;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });