/**
 * @fileoverview 刀拥有者组件，同时控制与刀主人的一些交互
 * @author jinhaitao@gameley.cn (金海涛)
 */
const KnifeOwnerComponent = cc.Class({
    extends: cc.Component,
    properties: {
        owner: null,
        isDirty: false,
    },

    onLoad: function () {
        this.node.on('updateOwner', this.updateOwner, this);
        this.node.on('noticeOwnerLeave', this.noticeOwnerLeave, this);
        this.node.on('addKnife', this.addKnife, this);
        this.node.on('addBuff', this.addBuff, this);
        this.node.on('stopParentRotate', this.stopParentRotate, this);
        this.node.on('localHeroCollision', this.localHeroCollision, this);
        this.node.on('isCollCircleWall', this.isCollCircleWall, this);
        this.node.on('resetDirty', this.resetDirty, this);
        this.node.on('onAttackBox', this.onAttackBox, this);

    },

    updateOwner: function (detail) {
        this.owner = detail;
        this.oldOwner = detail;
        this.isDirty = true;
    },

    noticeOwnerLeave: function () {
        if (this.owner) {
            this.owner.emit('reduceKnife', this.node);
            this.owner = null;
        }
    },

    addKnife: function (node) {
        if (this.owner) {
            this.owner.emit('addKnife', node);
        }
    },

    addBuff: function (buffId) {
        if (this.owner) {
            this.owner.emit('addBuff', buffId);
        }
    },

    onAttackBox: function (node) {
        if (this.owner) {
            this.owner.emit('onAttackBox', node);
        }
    },
    
    stopParentRotate: function () {
        if (this.owner) {
            this.owner.emit('stopParentRotate');
        }
    },

    localHeroCollision: function () {
        if (this.owner) {
            this.owner.emit('localHeroCollision');
        }
    },

    isCollCircleWall: function (state) {
        if (this.owner) {
            this.owner.emit('isCollCircleWall', state);
        }
    },


    resetDirty: function () {
        this.isDirty = false;
    }
})