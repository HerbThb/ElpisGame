/**
 * @fileoverview TestNodePool
 * @author meifan@gameley.cn (梅凡)
 */


const TestNodePool = cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        this.node.getComponent('EntityEffect').recycleAfterAnim();
    },

    // init: function ()

    
});