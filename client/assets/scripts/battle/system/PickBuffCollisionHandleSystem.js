/**
 * @fileoverview buff碰撞事件处理系统
 * @author zhangzhuang@gameley.cn (张庄)
 */
const BaseCollisionHandleSystem = require('BaseCollisionHandleSystem');

/**
 * 专门处理玩家碰撞系统
 */

var PickBuffCollisionHandleSystem = cc.Class({
    extends: BaseCollisionHandleSystem,

    properties: {
        _eventListName: {
            default: '_pickBuffCollisionEvent',
            override: true,
        },
    },
    /** @override */
    handelCollisionEvent: function (event) {
        var other = event[0];
        var self = event[1]; // 被捡的刀
        self.node.emit('emitEvent', ['onPickUpBuff', other]);
    },

    updateGameLogic: function (dt) {
        this._super(dt);
        this._collisionEventMgr.clearPickBuffEvent();
    }


});