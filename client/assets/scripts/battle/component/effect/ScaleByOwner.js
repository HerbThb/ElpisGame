/**
 * @fileoverview ScaleByOwner
 * @author meifan@gameley.cn (梅凡)
 */

const ScaleByOwner = cc.Class({
    extends: cc.Component,

    properties: {
        ownerNode: null,
    },

    init: function (entityNode) {
        this.ownerNode = entityNode;
    },

    update: function (dt) {
        const newScale = this.ownerNode.scale;
        
        if (this.node.scale !== newScale) this.node.scale = newScale;
    }

});