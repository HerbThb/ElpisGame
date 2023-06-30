const ListItemBase = require('ListItemBase');
const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const StageType = require('Types').StageType;

cc.Class({
    extends: ListItemBase,

    properties: {
        rewardParent: cc.Node,
        boxNode: cc.Node,
        numLabel: cc.Label,

        heroSprite: cc.Sprite,
        knifeSprite: cc.Sprite,
        diamondMore: cc.Node,
        diamondLess: cc.Node,

        openAnim: cc.Animation,
        openBestAnim: cc.Node,
        getBg: cc.Node,
    },

    init() {
        this.numLabel.string = '';
        this.hasGet = false;
        this.getBg.active = false;
        this.rewardParent.active = false;
        this.boxNode.active = true;
        this.numLabel.node.active = false;
        this.openBestAnim.active = false;
        // this.openBestAnim.node.parent.active = false;
    },


    getReward(item) {
        this.hasGet = true;
        for (let i = 0; i < this.rewardParent.children.length; i++) {
            this.rewardParent.children[i].active = i === item.type;
        }
        this.diamondMore.active = item.num === 35;
        this.diamondLess.active = !this.diamondMore.active;

        this.boxNode.active = false;
        this.getBg.active = true;

        setTimeout(() => {
            this.rewardParent.active = true;
            this.numLabel.node.active = true;
        }, 300);

        switch (item.type) {
            case ItemType.MONEY:
            case ItemType.ZONG_ZI:
                this.numLabel.string = item.num;
                if (this.diamondMore.active) {
                    this.playBestAnim();
                } else {
                    this.openAnim.play();
                }
                break;
            case ItemType.HERO_SKIN:
                this.playBestAnim();
                this.numLabel.string = '';
                UIUtil.loadResSprite(this.heroSprite, item.itemData.url);
                break;
            case ItemType.KNIFE_SKIN:
                this.playBestAnim();
                this.numLabel.string = '';
                UIUtil.loadResSprite(this.knifeSprite, item.itemData.url);
                break;
        }
    },

    playBestAnim: function () {
        // this.openBestAnim.node.parent.active = true;
        // this.openBestAnim.once('finished', () => {
        //     this.openBestAnim.node.parent.active = false;
        // })
        this.openAnim.play();
        this.openBestAnim.active = true;
        setTimeout(() => {
            this.openBestAnim.active = false;
        }, 1000)
    },
    // update (dt) {},
});