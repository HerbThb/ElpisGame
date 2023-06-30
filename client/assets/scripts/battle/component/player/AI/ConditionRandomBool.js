/**
 * @fileoverview 得到随机值
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');
const Tools = require('Tools');

// result从PlayerDistanceSystem确定，就是entityPlayer
const ConditionRandom = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
    },

    init: function () {},

    /** overwrite */
    doResult: function () {
        this.result = Tools.getRandomBool();
    },


    // updateGameLogic: function (dt) {}

    // update: {}
});