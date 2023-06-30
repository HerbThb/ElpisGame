/**
 * @fileoverview 实体基类
 * @author meifan@gameley.cn (梅凡)
 */


cc.Class({
    extends: cc.Component,

    properties: {
        renderPos: null,
        teamID: 0,
        shouldRemove: false,
    },

    // onLoad () {}

    // start () {},

    // update (dt) {},

    /**
     * 处理逻辑
     */
    updateGameLogic (dt) {

    },

    setRenderPosition: function (pos) {
        this.renderPos = pos;
    },

    getRenderPosition: function () {
        return this.renderPos ? this.renderPos : this.node.position;
    },

    recycleSelf: function () {
        if(this.node._pool) {
            this.node._pool.put(this.node);
        } else {
            this.node.removeFromParent();
        }
    }

});
