/**
 * @fileoverview 玩家处于龟缩
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

// result从PlayerDistanceSystem确定，就是entityPlayer
const ConditionLocalHeroDefence = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _localHero: null,
    },

    init: function () {},

    setLocalHero: function (hero) {
        this._localHero = hero;
    },

    /** overwrite */
    doResult: function () {
        this.result = this._localHero ? this._localHero.isDefence : false;
    },


    // updateGameLogic: function (dt) {}

    // update: {}
});