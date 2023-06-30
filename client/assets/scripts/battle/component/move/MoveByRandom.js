const Tools = require('Tools');

cc.Class({
    extends: cc.Component,

    properties: {
        time: 0,
    },


    update(dt) {
        var x = Tools.getRandomInt(-2, 2);
        var y = Tools.getRandomInt(-2, 2);
        this.node.emit('onMoveBy', {
            dPos: cc.v2(x, y)
        });
    },
});