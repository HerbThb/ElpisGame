/**
 * @fileoverview ConditionLowKnifeNumLocalHero
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

const ConditionLowKnifeNumLocalHero = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _localHero: null,
    },

    init: function () {
    },

    setLocalHero: function (hero) {
        this._localHero = hero;
    },

    /** overwrite */
    doResult: function() {
        this.result = this._localHero ? this._localHero.getKnifeNum() < 3 : false;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });