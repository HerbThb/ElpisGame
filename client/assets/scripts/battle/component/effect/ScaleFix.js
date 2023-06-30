//修正固化特效的scale
cc.Class({
    extends: cc.Component,

    properties: {

    },

    init: function (entityNode) {
        this.ownerNode = entityNode;
    },

    update(dt) {
        var multip = this.ownerNode.getComponent('HeroScale').newScaleMultip;
        var newScale = ((this.ownerNode.scale - multip) / 1.5)  + multip;
        // if (this.ownerNode.getComponent('EntityPlayer').isDefence) {
        //     newScale = 0.9 * newScale;
        // }
        if (this.node.scale !== newScale) this.node.scale = newScale;
    },
});