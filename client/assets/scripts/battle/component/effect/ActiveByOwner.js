/**
 * @fileoverview ActiveByOwner
 * @author meifan@gameley.cn (梅凡)
 */

const ActiveByOwner = cc.Class({
    extends: cc.Component,

    properties: {
        player: null,
        _isDefence: true,
    },

    init: function (entityPlayer, activeNode) {
        this.player = entityPlayer;
        this.activeNode = activeNode;
        this.activeNode.active = false;
    },

    update: function (dt) {
        if(this.player.beKilled()) {
            if(this._isDefence) {
                this._isDefence = false;
                this.activeNode.active = false;
            }
            return;
        }

        if(this._isDefence !== this.player.isDefence) {
            this._isDefence = this.player.isDefence;
            this.activeNode.active = this._isDefence;
        }
    }

});