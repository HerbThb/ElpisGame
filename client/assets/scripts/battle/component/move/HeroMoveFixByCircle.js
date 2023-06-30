/**
 * @fileoverview 玩家在圆形地图的移动校正
 * @author zhangzhuang@gameley.cn (张庄)
 */
cc.Class({
    extends: cc.Component,

    properties: {
        lastPos: cc.v2(0, 0),
    },


    init: function (_collider, followPlayer) {
        this.followPlayer = followPlayer;
        this._collider = _collider;
        this.attackRadius = 0;
    },

    onLoad: function () {
        this.node.on('radiusChange', this.radiusChange, this)
    },

    radiusChange: function (detail) {
        this.attackRadius = detail;
    },

    refresh: function (width, height) {
        this.width = width / 2;
        this.height = height / 2;
    },

    updateGameLogic: function () {
        if (this.lastPos.x === this.node.position.x && this.lastPos.y === this.node.position.y) {
            return;
        }
        this.lastPos = this.node.position;

        var heroRadius = this._collider.radius * this._collider.node.parent.scale;
        var dir = this.node.position.normalize();
        var distance = this.width - heroRadius - this.node.position.mag();
        if (distance < 0) {
            this.node.position = this.node.position.add(dir.mul(distance));
        }
        var heroAttackRadius = 0;
        if (this.followPlayer) heroAttackRadius = this.attackRadius * this.followPlayer.node.scale;

        var dir = this.node.position.normalize();
        var distance = this.width - heroAttackRadius - this.node.position.mag();
        if (distance < 0) {
            if (!this.isColl) {
                this.isColl = true;
                this.node.emit('isCollCircleWall', true);
            }
        } else {
            if (this.isColl) {
                this.isColl = false;
                this.node.emit('isCollCircleWall', false);
            }
        }
        // var coll=this.mapRadius - heroRadius 
        // if(distance)
    },
    // update (dt) {},
});