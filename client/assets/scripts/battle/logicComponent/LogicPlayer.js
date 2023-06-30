const Tools = require('Tools');
/**
 * @fileoverview 玩家的逻辑组件
 * @author jinhaitao@gameley.cn (金海涛)
 */
cc.Class({
    extends: cc.Component,
    properties: {},

    init: function (entityPlayer) {
        this.entityPlayer = entityPlayer;
        this.knivesCmp = entityPlayer.followPlayer.knivesCmp;
    },

    updateLogic: function () {
        if (this.knivesCmp.isDirty) {
            this.knivesCmp.emitAllKnivesCountChange();
            const radius = Tools.getRadiusByKnifeCount(this.knivesCmp.knives.length);
            this.radius = radius;
            this.knivesCmp.node.emit('radiusChange', radius);
            this.entityPlayer.node.emit('radiusChange', radius);
            this.knivesCmp.resetDirty();
        }
    },

})