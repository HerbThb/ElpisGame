/**
 * @fileoverview ConditionKnifeLessThenLocalHero
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

const ConditionKnifeLessThenLocalHero = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _player: null,
        _localHero: null,
    },

    init: function (entityPlayer) {
        this._player = entityPlayer;
    },

    setLocalHero: function (hero) {
        this._localHero = hero;
    },

    /** overwrite */
    doResult: function() {
        this.result = this._localHero ? this._player.getKnifeNum() < (this._localHero.getKnifeNum() + 6) : false;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });