/**
 * @fileoverview 倒计时
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');
const Tools = require('Tools');

// result从PlayerDistanceSystem确定，就是entityPlayer
const ConditionLastTime = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
    },

    init: function () {
        this.result = -1;
    },

    /** overwrite */
    doResultWithParam: function (time) {
        this.result = time;
    },

    isTrue: function () {
        return this.result < 0;
    },
    // updateGameLogic: function (dt) {}

    update: function(dt) {
        this.result -= dt;
    }
});