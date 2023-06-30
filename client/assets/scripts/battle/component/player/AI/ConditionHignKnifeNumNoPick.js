/**
 * @fileoverview ConditionHighKnifeNum
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionHighKnifeNum = require('ConditionHighKnifeNum');

const ConditionHignKnifeNumNoPick = cc.Class({
    extends: ConditionHighKnifeNum,

    properties: {
        _knifeNum: 10,
    },

    init: function (entityPlayer, knifeNum) {
        this._player = entityPlayer;
        this._knifeNum = knifeNum;
    },

    /** overwrite */
    doResult: function() {
        this.result = this._player.getKnifeNum() > this._knifeNum;
    },

    // updateGameLogic: function (dt) {}

    // update: {}
 });