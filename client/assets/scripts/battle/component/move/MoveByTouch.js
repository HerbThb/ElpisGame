/**
 * @fileoverview 移动触屏控制器
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');

const MoveByTouch = cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEndEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEndEvent, this);

    },

    init: function (target) {
        this._target = target.node;
    },

    _touchStartEvent : function (event) {
        if(!this.enabled)return;
        this.startPos = event.getLocation();
        this._target.emit('heroMoveStart');
        this.beginMove = false;
    },

    _touchMoveEvent : function (event) {
        const curPos = event.getLocation();
        var dPos = curPos.sub(this.startPos);
        // console.log('dPos.magSqr: ' + dPos.magSqr() + ' , curPos: ' + curPos + ', startPos: ' + this.startPos);
        if(dPos.magSqr() > 100) {
            this.beginMove = true;
        }
        if(Tools.compareVec2(curPos, this.startPos)) {
            this.curDir = null;
        } else {
            this.curDir = curPos.sub(this.startPos).normalize();
        }
    },

    touchEndEvent : function (event) {
        this._target.emit('onStopMoving');
        this.curDir = null;
        this.beginMove = false;
    },

    update: function (dt) {
        if(this.curDir && this.beginMove) {
            this._target.emit('onMoveBy', {
                dPos: this.curDir
            });
        }
    }

});