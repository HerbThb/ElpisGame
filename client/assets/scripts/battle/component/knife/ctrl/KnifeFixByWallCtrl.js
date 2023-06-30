const KnifeState = require('Types').KnifeState;

cc.Class({
    extends: cc.Component,

    properties: {
        resetTime: 0.25,
        _curResetTime: 0,
        _waitResetTime: 0,
        allWaitTime: 0.1,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    refresh: function (width, height) {
        this.width = width / 2;
        this.height = height / 2;
    },

    updateLogic: function (dt) {
        if (!this.knifeOwnerComp) this.knifeOwnerComp = this.node.getComponent('KnifeOwnerComponent');
        if (this.knifeOwnerComp.owner) {

            var comp = this.knifeOwnerComp.owner.getComponent('EntityFollowPlayer').knivesCmp;
            if (comp.isCollCircleWall || comp.isCollisionWall) {
                var relativePos = this.node.parent.convertToWorldSpaceAR(this.node.position);
                var pos = this.node.parent.parent.convertToNodeSpaceAR(relativePos);

                var distanceX = this.width - Math.abs(pos.x) - 20;
                if (distanceX < 0) {
                    var dir = cc.v2(pos.x, 0).normalize();
                    pos = pos.add(dir.mul(distanceX))
                    relativePos = this.node.parent.parent.convertToWorldSpaceAR(pos);
                    pos = this.node.parent.convertToNodeSpaceAR(relativePos);
                    this.node.position = pos;
                }

                var distanceY = this.height - Math.abs(pos.y) - 20;
                if (distanceY < 0) {
                    var dir = cc.v2(0, pos.y).normalize();
                    pos = pos.add(dir.mul(distanceY))
                    relativePos = this.node.parent.parent.convertToWorldSpaceAR(pos);
                    pos = this.node.parent.convertToNodeSpaceAR(relativePos);
                    this.node.position = pos;
                }
            }
        }
    }

});