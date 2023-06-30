cc.Class({
    extends: cc.Component,

    properties: {
        weakNode: cc.Node,
        weakArrow: cc.Node,
        strongNode: cc.Node,
        strongArrow: cc.Node,
    },

    refresh(player, localPlayer) {

        var dir = localPlayer.node.position.sub(player.node.position).normalize();
        var radius = player.logicPlayer.radius;
        var finalPos = player.node.position.add(dir.mul(radius));

        var roll = dir.angle(cc.v2(0, 1)) * 180 / Math.PI;
        if (dir.x < 0) roll = -roll;

        if (localPlayer.isDefence) {
            if (this.strongNode.active) this.strongNode.active = false;
            if (this.weakNode.active) this.weakNode.active = false;
            if (player.attackPower > localPlayer.defencePower) {
                if (!localPlayer._dangerousEffect.node.active) {
                    localPlayer._dangerousEffect.node.active = true;
                    // _attackStartEffect
                    // _dangerousEffect
                    localPlayer._dangerousEffect.play();
                    this.isPlay = true;
                    setTimeout(() => {
                        localPlayer._dangerousEffect.node.active = false;
                    }, 1500);
                }
            }
        } else if (player.isDefence) {
            if (localPlayer.attackPower <= player.defencePower) {
                if (!this.strongNode.active) this.strongNode.active = true;
                if (this.weakNode.active) this.weakNode.active = false;

                this.strongNode.position = finalPos;
                this.strongArrow.rotation = roll - 180;
            } else {
                if (this.strongNode.active) this.strongNode.active = false;
                if (!this.weakNode.active) this.weakNode.active = true

                this.weakNode.position = finalPos;
                this.weakArrow.rotation = roll - 180;
            }
        } else {
            if (this.strongNode.active) this.strongNode.active = false;
            if (this.weakNode.active) this.weakNode.active = false;
        }

    },
    close() {
        if (this.strongNode.active) this.strongNode.active = false;
        if (this.weakNode.active) this.weakNode.active = false;
    }
    // update (dt) {},
});