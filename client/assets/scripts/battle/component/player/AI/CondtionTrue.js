/**
 * @fileoverview CondtionTrue
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

const CondtionTrue = cc.Class({
    extends: ConditionBaseComponent,

    properties: {},

    init: function () {},

    /** overwrite */
    isTrue: function () {
        return true;
    },


    // updateGameLogic: function (dt) {}

    // update: {}
});