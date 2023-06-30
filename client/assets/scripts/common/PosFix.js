//fix v2.20 透明度为0时修改position可能失效的问题
cc.Class({
    extends: cc.Component,

    properties: {
        friend: cc.Node,
    },

    update(dt) {
        if (this.friend && this.node.position !== this.friend.position) {
            this.node.position = this.friend.position;
        }
    },
});