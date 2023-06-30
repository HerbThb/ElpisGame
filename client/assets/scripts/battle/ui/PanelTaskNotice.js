const ItemType = require('Types').ItemType;
const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const AddEntitySystem = require('AddEntitySystem');
cc.Class({
    extends: cc.Component,

    properties: {
        taskLabel: cc.Label,
        taskIcon: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(data, callback) {
        var rewardData = {};
        if (data.rewardType === ItemType.HERO_SKIN) {
            rewardData = ConfigData.instance.getHeroSkinById(data.rewardId);
            this.taskIcon.node.scale = 0.5;
            UIUtil.loadResSprite(this.taskIcon, rewardData.url);
            // AddEntitySystem.instance.loadHeroSkinSprite(this.taskIcon, rewardData.skinIndex);
        } else {
            rewardData = ConfigData.instance.getKnifeSkinById(data.rewardId);
            this.taskIcon.node.scale = 1;
            UIUtil.loadResSprite(this.taskIcon, rewardData.url);
        }

        this.taskLabel.string = rewardData.name;
        this.callback = callback;
    },

    // update (dt) {},
});