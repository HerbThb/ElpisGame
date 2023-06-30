/**
 * @fileoverview 段位奖励item
 * @author zhangzhuang@gameley.cn (张庄)
 */

const ListItemBase = require('ListItemBase');
const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');
const UIUtil = require('UIUtil');

const ItemRankReward = cc.Class({
    extends: ListItemBase,

    properties: {
        skinRewardNode: cc.Node,
        goldRewardNode: cc.Node,
        skinIconSprite: cc.Sprite,
        skinNameLabel: cc.Label,
        goldCountLabel: cc.Label,

        unLockNode: cc.Node,
        hasGetNode: cc.Node,

        iconSprite: cc.Sprite,
        nameLabel: cc.Label,
        goldLabel: cc.Label,

        achieveNode: cc.Node,
        notAchieveNode: cc.Node,

        adverIcon: cc.Node,
        normalIcon: cc.Node,

        kingNode: cc.Node,
        kingLabel: cc.Label,

        unlockRootNode: cc.Node,

        unlockBuffNode: cc.Node,
        unlockBuffLabel: cc.Label,
        unlockBuffIcon: cc.Node,

        unlockMapNode: cc.Node,
        unlockMapLabel: cc.Label,
        unlockMapIcon: cc.Node,
    },

    init: function (data, item, isSkin) {
        this.data = data;
        this.item = item;
        this.isSkin = isSkin;


        // this.nameLabel.string = data.name;
        // this.goldLabel.string = 'bonus coin' + Math.ceil((data.goldMultiRate * 100 + 100)) + '%';

        // cc.loader.loadRes(data.url, cc.SpriteFrame, (error, resource) => {
        //     if (error) {
        //         cc.error(error);
        //     } else if (resource) {
        //         this.iconSprite.spriteFrame = resource;
        //     }
        // })
        // AddEntitySystem.instance.loadRankSprite(this.iconSprite, data.iconIndex);
        UIUtil.loadResSprite(this.iconSprite, data.url);

        this.skinRewardNode.active = item && isSkin ? true : false;
        this.goldRewardNode.active = item && !isSkin ? true : false;;

        var isKing = data.levelUpStar === 0;
        var achieve = PlayerData.instance.rankStar - data.star >= 0;
        this.goldLabel.node.y = isKing && achieve ? -120 : -92;
        this.kingNode.active = isKing && achieve ? true : false;
        this.kingLabel.string = 'x' + (PlayerData.instance.rankStar - data.star);
        this.unlockRootNode.y = item ? (this.isSkin ? -80 : -60) : 20;

        if (item) {
            var data = item.itemData;
            if (isSkin) {
                this.skinNameLabel.string = data.name;
                cc.loader.loadRes(data.url, cc.SpriteFrame, (error, resource) => {
                    if (error) {
                        cc.error(error);
                    } else if (resource) {
                        this.skinIconSprite.spriteFrame = resource;
                    }
                })
            } else {
                this.goldCountLabel.string = item.num;
            }
        }


        this.unlockBuffNode.active = false;
        if (this.data.unlockBuff || this.data.unlockBuff === 0) {
            this.unlockBuffNode.active = true;
            this.unlockBuffLabel.string = this.data.unlockTips;
            var unlockBuffIcons = this.unlockBuffIcon.children;
            unlockBuffIcons[this.data.unlockBuff].active = true;
            // var data = ConfigData.instance.getBuffDataById(this.data.unlockBuff);
            // if (data) {
            // };
        }

        if (this.data.unlockMap || this.data.unlockMap === 0) {
            this.unlockMapNode.active = true;
            this.unlockMapLabel.string = this.data.unlockMapTips;
            var unlockMapIcons = this.unlockMapIcon.children;
            unlockMapIcons[this.data.unlockMap].active = true;
        }
    },

    refresh: function (isGet, canUnLock) {
        this.achieveNode.active = canUnLock ? true : false;
        this.notAchieveNode.active = !this.achieveNode.active;
        this.unLockNode.active = this.item && !isGet && canUnLock ? true : false;
        this.hasGetNode.active = this.item && isGet ? true : false;

        this.adverIcon.active = this.isSkin ? true : false;
        this.normalIcon.active = !this.adverIcon.active;
    },

});