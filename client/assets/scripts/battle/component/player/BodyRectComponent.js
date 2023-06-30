/**
 * @fileoverview 身体矩形，用于简单判断是否发生碰撞
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');

// result从PlayerDistanceSystem确定，是另一个ai的Entity
const BodyRectComponent = cc.Class({
    extends: cc.Component,

    properties: {
        _rect: cc.rect,
    },

    init: function (width, height, canMove, needGraphics = false, scale = 1.0) {
        this.scale = scale;
        width = width * scale;
        height = height * scale;
        this._rect = new cc.rect(this.node.x - width / 2, this.node.y - height / 2, width, height);
        this._canMove = canMove;

        this.needGraphics = needGraphics;

        if(this.needGraphics) {
            this.ctx = Tools.getOrAddComponent(this.node, cc.Graphics);
    
            // 红色矩形
            this.ctx.lineWidth = 6;
            this.ctx.strokeColor = cc.Color.RED;
            this.ctx.rect( -this._rect.width / 2, -this._rect.height / 2,  this._rect.width, this._rect.height);
            this.ctx.stroke();
        }

        this.node.on('radiusChange', this.setRect, this);
    },

    setRect: function (radius) {
        radius = Math.max(radius, 180);
        this._rect.width = radius * this.scale * 2;
        this._rect.height = radius * this.scale * 2;
        // console.log('radius: ' + radius + ', width: ' +  this._rect.width + ', height: ' +  this._rect.height);
    },

    // updateGameLogic: function (dt) {}

    update: function (dt) {
        if(this._canMove) {
            this._rect.center = this.node.position;

            if(this.needGraphics) {
                this.ctx.clear ();
                // 红色矩形
                this.ctx.rect( -this._rect.width / 2, -this._rect.height / 2,  this._rect.width, this._rect.height);
                this.ctx.stroke();
            }
        }
    },

    contains: function (point) {
        return this._rect.contains(point);
    },

    intersects: function (rect) {
        return this._rect.intersects(rect);
    },

    getRect: function () {
        return this._rect;
    }
});