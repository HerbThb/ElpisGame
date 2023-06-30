/**
 * @fileoverview HeroKnifeNum
 * @author meifan@gameley.cn (梅凡)
 */

const HeroKnifeNum = cc.Class({
    extends: cc.Component,

    properties: {
        _player: null,
        _frenzyComp: null,
        frenzyBar: cc.Sprite,
        activeNode: cc.Node,
    },

    init: function (entityPlayer) {
        this._player = entityPlayer;
        this._frenzyComp = entityPlayer.node.getComponent('PlayerFrenzyComponent');
    },

    update: function (dt) {
        if (this._active !== this._player.activeNode.active) {
            this._active = this._player.activeNode.active && this._frenzyComp;
            this.activeNode.active = this._active;
        }

        if (this._frenzyComp && this.frenzyBar) {
            this.frenzyBar.fillRange = this._frenzyComp.getFrenzyRate();
        }
    }

});