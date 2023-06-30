const PlayerData = require('PlayerData');
cc.Class({
    extends: cc.Component,

    properties: {
        keys: cc.Node,
    },


    open(active) {
        if (!PlayerData.instance.hasGetKey) return
        this.node.active = active;
        var keyCount = PlayerData.instance.keyCount;
        for (let i = 0; i < 3; i++) {
            this.keys.children[i].active = i < keyCount;
        }
    },

    show(flyKey) {
        this.node.active = true;
        var keyCount = PlayerData.instance.keyCount;
        for (let i = 0; i < 3; i++) {
            this.keys.children[i].active = i + 1 < keyCount;
        }
        var key = this.keys.children[keyCount - 1];
        setTimeout(() => {
            key.active = true;
        }, 1600);

        setTimeout(() => {
            this.node.active = false;
        }, 2000)

        setTimeout(() => {
            var a = flyKey.position;
            var c = this.node.position.add(cc.v2(50 * (keyCount - 2), 0));
            var b = cc.v2(a.x, c.y);
            var bezier = [a, b, c]
            flyKey.runAction(cc.bezierTo(0.3, bezier).easing(cc.easeIn(1.0)))
        }, 1300);

    },


    // update (dt) {},
});