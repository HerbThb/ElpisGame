const GameData = require('GameData');
const ConfigData = require('ConfigData');
cc.Class({
    extends: cc.Component,

    properties: {
        anim: cc.Animation,
        bgNode: cc.Node,
        tipsLabel: cc.Label,
        isShow: false,
    },

    onLoad: function () {
        this.bgNode.width = GameData.instance.isPad() ? 370 : 520
        this.tipsLabel.node.width = GameData.instance.isPad() ? 270 : 420;
    },

    init: function (tips) {
        if (this.isShow) return;
        this.node.active = true;
        this.isShow = true;

        if (Number(tips)) {
            var str = ConfigData.instance.getUITipStr(tips);
            this.tipsLabel.string = str;
        } else {
            this.tipsLabel.string = tips;
        }


        this.anim.once('finished', () => {
            this.isShow = false;
        }, this);
        this.anim.play();
    }
});