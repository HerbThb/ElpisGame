/**
 * @fileoverview 碰撞监听器
 * @author jinhaitao@gameley.cn (金海涛)
 */
const CollisionEventManager = require('CollisionEventManager');

/**
 * 监听碰撞事件，并存至CollisionEventManager中,应该只挂在刀和玩家的碰撞体上
 */
cc.Class({
    extends: cc.Component,

    properties: {},

    // 初始化获取碰撞盒，用于碰撞时判定队伍
    onLoad: function () {
        //TODO 可能需要通过boxcollider去获取
        this._collider = this.node.getComponent(cc.Collider);
        this.node.on('changeColliderTag', this.changeColliderTag, this);
        this.node.on('changeNodeGroup', this.changeNodeGroup, this);

        this.node.on('emitEvent', this.emitEvent, this);
    },

    init: function (parent, checkCollision, needCheckStay) {
        this.parent = parent;
        this.needCheckCollision = checkCollision;
        this.needCheckStay = needCheckStay;
    },

    onCollisionEnter: function (other, self) {
        if (this.needCheckCollision) {
            CollisionEventManager.getInstance().addCollisionEvent(other, self);
        }

    },

    onCollisionStay: function (other, self) {
        if (this.needCheckCollision && this.needCheckStay) {
            CollisionEventManager.getInstance().addCollisionStayEvent(other, self);
        }

    },
    /**
     * @param  {number} tag tag编号，默认是0，只有在玩家身上的刀与玩家身上需要设置
     *  用tag进行快速的队伍判定
     */
    changeColliderTag: function (tag) {
        if (!this._collider) {
            cc.error('no Collider To Change Tag');
            return;
        }
        this._collider.tag = tag;
    },

    /**
     * @param  {string} group 碰撞组名
     * 切换node的碰撞组，主要用于刀的碰撞切换
     */
    changeNodeGroup: function (group) {
        this.node.group = group
    },

    // 将本节点的触发的事件传给父节点
    emitEvent: function (detail) {
        if (this.parent) {
            this.parent.emit(detail[0], detail[1]);
        }
    },
});