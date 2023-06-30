cc.Class({
    extends: cc.Component,

    properties: {

    },

    start() {

    },

    update(dt) {
        this.node.scale = 1 / this.node.parent.scale;
    },
});

