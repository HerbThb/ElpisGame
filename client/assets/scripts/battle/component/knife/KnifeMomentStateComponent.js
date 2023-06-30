/**
 * @fileoverview 刀瞬时状态组件
 * @author zhangzhaung@gameley.cn (张庄)
 */
const KnifeMomentState = require('Types').KnifeMomentState;

cc.Class({
    extends: cc.Component,
    properties: {
        state: null,
        isDirty: false,
    },

    onLoad: function () {
        this.node.on('updateMomentState', this.updateMomentState, this);
        this.node.on('resetDirty', this.resetDirty, this);
    },

    updateMomentState: function (state) {
        if (this.state === state) return;
        this.state = state;
        this.isDirty = true;
    },

    resetDirty: function () {
        this.isDirty = false;
    }
})