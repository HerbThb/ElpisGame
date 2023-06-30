
const UIUtil = require('UIUtil');
cc.Class({
    extends: cc.Component,

    properties: {
        iconSprite: cc.Sprite,
        starCountLabel: cc.Label,
    },

    init(data) {
        UIUtil.loadResSprite(this.iconSprite, data.url);
        this.starCountLabel.string = data.star;
    },

    // update (dt) {},
});