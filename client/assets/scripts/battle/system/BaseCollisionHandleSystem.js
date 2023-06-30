/**
 * @fileoverview 碰撞事件处理系统基类
 * @author jinhaitao@gameley.cn (金海涛)
 */
const CollisionEventManager = require('CollisionEventManager');

/**
 * 专门处理碰撞系统的基类
 */

var BaseCollisionHandleSystem = cc.Class({
    extends: cc.Component,

    properties: {
        _eventListName: '',
    },
    onLoad: function () {
        this._collisionEventMgr = CollisionEventManager.getInstance();
    },

    // 先直接放在update中，后续如果减少事件帧再改为updateGameLogic;
    updateGameLogic: function (dt) {
        if(!this._collisionEventMgr[this._eventListName]) {
            return;
        }
        for (var event of this._collisionEventMgr[this._eventListName]) {
            this.handelCollisionEvent(event);
        }
    },

    // 碰撞处理
    handelCollisionEvent: function (event) {

    }
});
