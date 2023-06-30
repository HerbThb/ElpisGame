const UIUtil = require('UIUtil');
cc.Class({
    extends: cc.Component,

    properties: {
        iconSprite: cc.Sprite,
    },

    init: function (player) {
        UIUtil.loadResPortrait(this.iconSprite, player);
        this.iconSprite.node.active = false;
    },

    showIcon: function () {
        this.iconSprite.node.active = true;
    }

    // update (dt) {},
});