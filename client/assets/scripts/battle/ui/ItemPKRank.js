const ListItemBase = require('ListItemBase')
const ConfigData = require('ConfigData')
const UIUtil = require('UIUtil')
const MY_COLOR = new cc.color().fromHEX('#FFFA77')
const Tools = require('Tools');
const PlayerData = require('PlayerData');
cc.Class({
    extends: ListItemBase,

    properties: {
        bgNode: cc.Node,
        rankNode: cc.Node,
        rankLabel: cc.Label,
        nameLabel: cc.Label,
        iconSprite: cc.Sprite,
        killLabel: cc.Label,
    },


    init(data) {
        for (let i = 0; i < 2; i++) {
            this.bgNode.children[i].active = (data.rank + i) % 2;
        }
        for (let i = 0; i < 3; i++) {
            this.rankNode.children[i].active = (i + 1) === data.rank;
        }


        if (data.rank === -1) {
            this.rankLabel.node.active = true;
            this.rankLabel.string = '未上榜';
        } else {
            this.rankLabel.node.active = data.rank > 3;
            this.rankLabel.string = data.rank;
        }

        this.killLabel.string = data.score;
        this.iconSprite.spriteFrame = null;
        if (data.realPlayer === 0) {
            this.iconSprite.iconUrl = data.id;
            UIUtil.loadAIPortrait(this.iconSprite, data.id);
            this.nameLabel.string = Tools.getShowNickName(ConfigData.instance.getAINickById(data.id));
        } else {
            if (data.isLocal) {
                this.iconSprite.iconUrl = PlayerData.instance.iconUrl;
                UIUtil.loadFriendPortrait(this.iconSprite, PlayerData.instance.iconUrl);
                this.nameLabel.string = Tools.getShowNickName(PlayerData.instance.name);
            } else {
                this.iconSprite.iconUrl = data.headUrl;
                UIUtil.loadFriendPortrait(this.iconSprite, data.headUrl);
                this.nameLabel.string = Tools.getShowNickName(data.name);
            }

        }



        this.bgNode.children[2].active = data.isLocal;
        this.rankLabel.node.color = data.isLocal ? MY_COLOR : cc.Color.WHITE;
        this.nameLabel.node.color = data.isLocal ? MY_COLOR : cc.Color.WHITE;
        this.killLabel.node.color = data.isLocal ? MY_COLOR : cc.Color.WHITE;
    },

    // update (dt) {},
});