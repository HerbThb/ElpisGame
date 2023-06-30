/**
 * @fileoverview 刀是否出枪组件
 * @author meifan@gameley.cn (梅凡)
 */

cc.Class({
    extends: cc.Component,
    properties: {
        width: 640,
        height: 1136,
        isOut: false,
    },

    init: function (knife, width, height) {
        this.knife = knife;
        this.refresh(width, height);
        this.isOut = false;
    },

    refresh: function (width, height) {
        this.width = width / 2;
        this.height = height / 2;
    },

    updateGameLogic: function (dt) {
        if(this.isOut) return;
        if(!this.knife) return;
        if(!this.knife.isOnLand()) return;

        var v = this.node.position;
        if(v.magSqr() > (this.width * this.width) + (this.height * this.height)) {
            this.isOut = true;
        }
    }
})