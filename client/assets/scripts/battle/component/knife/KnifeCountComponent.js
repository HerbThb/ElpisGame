/**
 * @fileoverview 刀在玩家身上时的index与刀数量
 * @author jinhaitao@gameley.cn (金海涛)
 */
cc.Class({
    extends: cc.Component,
    properties: {
        index: 0,
        maxCount: 0,
        isDirty: false,
    },

    onLoad: function () {
        this.node.on('updateCount', this.updateCount, this);
        this.node.on('resetDirty', this.resetDirty, this);
    },

    updateCount: function (detail) {
        this.index = detail[0];
        this.isMore = this.maxCount < detail[1] ? true : false;
        this.maxCount = detail[1];
        this.isDirty = true;
    },

    resetDirty: function () {
        this.isDirty = false;
    }
})