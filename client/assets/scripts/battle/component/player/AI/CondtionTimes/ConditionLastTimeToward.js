/**
 * @fileoverview ai追击玩家一定时间放弃
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');
// const Tools = require('Tools');

const ConditionLastTimeToward = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        needUpdate: false,
    },

    init: function () {
        this.result = -1;
        this.needUpdate = false;
    },

    /** overwrite */
    clearResult: function() {
        this.result = -1;
        this.needUpdate = false;
    },

    /** overwrite */
    doResultWithParam: function (time) {
        if(!this.needUpdate) {
            this.result = time;
            this.needUpdate = true;
        }
    },

    isTrue: function () {
        return this.result < 0;
    },
    // updateGameLogic: function (dt) {}

    update: function (dt) {
        if (this.needUpdate) {
            this.result -= dt;
        }
    }
});