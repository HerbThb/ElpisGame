const BuffState = require('Types').BuffState;
cc.Class({
    extends: cc.Component,

    properties: {
        scaleMultip: 1,
        newScaleMultip: 1,
    },


    init: function (player) {
        this.player = player;
        this.node.on('changeScaleMultip', this.changeScaleMultip, this);
    },

    changeScaleMultip: function (multip) {
        this.newScaleMultip = multip;
        this.scalePer = (this.newScaleMultip - this.scaleMultip);
    },


    updateGameLogic(dt) {

        if (this.newScaleMultip !== this.scaleMultip) {
            this.scaleMultip += this.scalePer * dt;

            if (this.scalePer > 0) {
                if (this.scaleMultip > this.newScaleMultip) {
                    this.scaleMultip = this.newScaleMultip;
                }
            } else {
                if (this.scaleMultip < this.newScaleMultip) {
                    this.scaleMultip = this.newScaleMultip;
                }
            }
        }


        var length = this.player.followPlayer.knivesCmp.knives.length;
        var newScale = (length < 8 ? 0 : length - 8) * 0.125 + 1;
        if (newScale > 2.5) newScale = 2.5;
        newScale = newScale * this.scaleMultip;
        if (this.node.scale !== newScale) {
            this.node.scale = newScale;
        }
    },

});