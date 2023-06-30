/**
 * @fileoverview 离玩家很近
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

// result从PlayerDistanceSystem确定，就是entityPlayer
const ConditionNearLocalHero = cc.Class({
    extends: ConditionBaseComponent,

    properties: {},

    init: function () {},

    /** overwrite */
    doResultWithParam: function (entityPlayer) {
        this.result = entityPlayer;
    },


    // updateGameLogic: function (dt) {}

    // update: {}
});