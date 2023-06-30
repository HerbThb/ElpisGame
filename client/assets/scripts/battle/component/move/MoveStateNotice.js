/**
 * @fileoverview 玩家移动状态通知器
 * @author meifan@gameley.cn (梅凡)
 */

const MoveStateNotice = cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        
        this.node.on('heroMoveStart', this._heroMoveStart, this);
        this.node.on('onStopMoving', this._heroMoveEnd, this);
    },

    init: function (entityPlayer, knivesComp) {
        this.knivesComp = knivesComp;
        this.entityPlayer = entityPlayer;
    },

    _heroMoveStart : function (event) {
        this.knivesComp.heroStartMove();
        this.entityPlayer.heroStartMove()//.isDefence = false;
    },

    _heroMoveEnd : function (event) {
        this.knivesComp.heroStopMove();
        this.entityPlayer.heroStopMove();//.isDefence = true;
    },

});