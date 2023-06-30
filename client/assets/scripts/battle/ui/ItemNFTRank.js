const ListItemBase = require('ListItemBase')
const ConfigData = require('ConfigData')
const UIUtil = require('UIUtil')
const MY_COLOR = new cc.color().fromHEX('#FFFA77')
const Tools = require('Tools');
const PlayerData = require('PlayerData');
cc.Class({
    extends: ListItemBase,

    properties: {
        // bgNode: cc.Node,
        // rankNode: cc.Node,
        rankLabel: cc.Label,
        nameLabel: cc.Label,
        // iconSprite: cc.Sprite,
        scoreLabel: cc.Label,
    },


    init(data) {
        // for (let i = 0; i < 2; i++) {
        //     this.bgNode.children[i].active = (data.rank + i) % 2;
        // }
        // for (let i = 0; i < 3; i++) {
        //     this.rankNode.children[i].active = (i + 1) === data.rank;
        // }
        if (data.rank === -1) {
            // this.rankLabel.node.active = true;
            this.rankLabel.string = '未上榜';
        } else {
            // this.rankLabel.node.active = data.rank > 3;
            this.rankLabel.string = "#" + data.rank;
        }

        this.scoreLabel.string = data.score;

        if(data.adress.length > 10){
            // this.nameLabel.string = Tools.subStrByCharacter(data.adress, 6) + "...." + Tools.subStrByCharacter(data.adress, 15)
            this.nameLabel.string = Tools.subStrByCharacter(data.adress, 6) + "......" + data.adress.substring(data.adress.length-6, data.adress.length);
        }
        else{
            this.nameLabel.string = data.adress
        }

    }
    // update (dt) {},
});