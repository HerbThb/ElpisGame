/**
 * @fileoverview ConditionHighKnifeNum
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

const ConditionHighKnifeNum = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _player: null,
    },

    init: function (entityPlayer) {
        this._player = entityPlayer;
    },

    /** overwrite */
    doResult: function() {
        this.result = this._player.getKnifeNum() > 6;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });