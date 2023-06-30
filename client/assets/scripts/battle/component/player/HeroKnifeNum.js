/**
 * @fileoverview HeroKnifeNum
 * @author meifan@gameley.cn (梅凡)
 */

const HeroKnifeNum = cc.Class({
    extends: cc.Component,

    properties: {
        _player: null,
        knifeNumLab: cc.Label,
        _knifeNum: -1,
        crownNode: cc.Node,
        activeNode: cc.Node,
    },

    init: function (entityPlayer) {
        this._player = entityPlayer;
    },

    update: function (dt) {
        if(this._active !== this._player.activeNode.active) {
            this._active = this._player.activeNode.active;
            this.activeNode.active = this._active;
        }

        if(this._knifeNum !== this._player.getKnifeNum()) {
            this._knifeNum = this._player.getKnifeNum();

            this.knifeNumLab.string = this._knifeNum;
        }

        if( this.crownNode.active !== (this._player.rank === 1)) {
            this.crownNode.active = this._player.rank === 1;
        }
    }

});