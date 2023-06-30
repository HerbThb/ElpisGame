const KnifeState = require('Types').KnifeState;
const KnifeMomentState = require('Types').KnifeMomentState;
cc.Class({
    extends: cc.Component,

    properties: {
        lastPos: cc.v2(0, 0),
    },



    init: function () {
        this.knifeStateComp = this.node.getComponent('KnifeStateComponent');
        this.knifeMomentStateComp = this.node.getComponent('KnifeMomentStateComponent');
    },

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
                var dir = pos.normalize();
                var distance = this.width - pos.mag() - 25;
                if (distance < 0) {
                    // if (!this.isColl) {
                    //     this.isColl = true;
                    //     this.node.emit('isCollCircleWall', true);
                    // }
                    pos = pos.add(dir.mul(distance))
                    relativePos = this.node.parent.parent.convertToWorldSpaceAR(pos);
                    pos = this.node.parent.convertToNodeSpaceAR(relativePos);
                    this.node.position = pos;
                } else {
                    // if (this.isColl) {
                    //     this.isColl = false;
                    //     this.node.emit('isCollCircleWall', false);
                    // }
                }
            }
        }

        // var coll=this.mapRadius - heroRadius 
        // if(distance)
    },
    // update (dt) {},
});