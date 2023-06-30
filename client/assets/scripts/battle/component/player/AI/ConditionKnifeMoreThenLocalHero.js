/**
 * @fileoverview ConditionKnifeMoreThenLocalHero
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

const ConditionKnifeMoreThenLocalHero = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _player: null,
        _localHero: null,
    },

    init: function (entityPlayer, extra = 0) {
        this._player = entityPlayer;
        this._extraNum = extra;
    },

    setLocalHero: function (hero) {
        this._localHero = hero;
    },

    /** overwrite */
    doResult: function() {
        this.result = this._localHero ? this._player.getKnifeNum() - this._localHero.getKnifeNum() >= this._extraNum : false;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });