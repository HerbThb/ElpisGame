const ListItemBase = require('ListItemBase')
const ConfigData = require('ConfigData')
const UIUtil = require('UIUtil')
const MY_COLOR = new cc.color().fromHEX('#FFFA77')
const Tools = require('Tools');
const PlayerData = require('PlayerData');
cc.Class({
    extends: ListItemBase,

    properties: {
        rankLabel: cc.Label,
        rewradLabelU: cc.Label,
        rewradLabelMnt: cc.Label,
    },

    init(data) {
        this.rankLabel.string = "#"  + data.rank

        this.rewradLabelU.string = data.reward_1;
        this.rewradLabelMnt.string = data.reward_2;
    }
    // update (dt) {},
});