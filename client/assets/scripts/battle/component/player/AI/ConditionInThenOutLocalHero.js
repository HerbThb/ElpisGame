/**
 * @fileoverview 离玩家近而后离开玩家
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

// result从PlayerDistanceSystem确定，就是entityPlayer
const ConditionInThenOutLocalHero = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _heroIn: false,
    },

    init: function () {},

    /** overwrite */
    doResultWithParam: function (heroIn) {
        if(this._heroIn && !heroIn) {
            this.result = true;
        }
        this._heroIn = heroIn;
    },


    // updateGameLogic: function (dt) {}

    // update: {}
});