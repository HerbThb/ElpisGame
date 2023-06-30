/**
 * @fileoverview ai慢速
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

const ConditionAISlow = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
    },

    /** overwrite */
    doResult: function() {
        this.result = 0.8;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });