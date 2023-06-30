/**
 * @fileoverview 刀的商店皮肤item
 * @author zhangzhuang@gameley.cn (张庄)
 */
const ListItemBase = require('ListItemBase')
// const AddEntitySystem = require('AddEntitySystem');
const UIUtil = require('UIUtil');
const Tools = require('Tools');
cc.Class({
    extends: ListItemBase,

    properties: {
        lockNode: cc.Node,
        barNode: cc.Node,
        checkNode: cc.Node,
        equipNode: cc.Node,
        priceNode: cc.Node,
        priceLabel: cc.Label,
        iconSprite: cc.Sprite,
        taskLabel: cc.Label,
        needCheckNode: cc.Node,
        canUnLockNode: cc.Node,

        propertyNode: cc.Node,
        propertyLabel: cc.Label,
        newNode: cc.Node,

        goldIcon: cc.Node,
        diamondIcon: cc.Node,

        suitNode: cc.Node,
    },

    init: function (data) {
        this.data = data;
        if (data.price) this.priceLabel.string = Tools.getGoldStr(data.price);
        if (data.propertyTips) this.propertyLabel.string = data.propertyTips;
        this.goldIcon.active = data.priceType === 0;
        this.diamondIcon.active = data.priceType === 1;

        // AddEntitySystem.instance.loadHeroSkinSprite(this.iconSprite, data.skinIndex);
        UIUtil.loadResSprite(this.iconSprite, data.url);
        // cc.loader.loadRes(data.url, cc.SpriteFrame, (error, resource) => {
        //     if (error) {
        //         cc.error(error);
        //     } else if (resource) {
        //         this.iconSprite.spriteFrame = resource;
        //     }
        // })
        for (let i = 0; i < this.suitNode.children.length; i++) {
            if (this.suitNode.children[i]) {
                this.suitNode.children[i].active = (i + 1) == data.suit;
            }
        }

    },

    refresh: function (isGet, canUnLock, needCheck, isNew, processStr) {
        this.isGet = isGet;
        this.lockNode.active = isGet || canUnLock ? false : true;
        // this.iconSprite.setState(isGet || canUnLock ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        this.iconSprite.node.opacity = isGet || canUnLock ? 255 : 153;
        this.barNode.active = isGet || canUnLock ? false : true;
        this.priceNode.active = isGet || this.data.getWay === 1 ? false : true;
        this.taskLabel.node.active = !isGet && this.data.getWay === 1 && !canUnLock ? true : false;
        this.needCheckNode.active = isGet && needCheck ? true : false;
        this.canUnLockNode.active = !isGet && canUnLock ? true : false;


        this.propertyNode.active = this.data.propertyTips ? true : false;
        this.propertyNode.y = isGet || canUnLock ? -65 : 65;
        this.suitNode.y = isGet || canUnLock ? -65 : 65;
        this.newNode.active = !isGet && isNew ? true : false;

        if (processStr || processStr === '') {
            var one = this.data.taskShortOne ? this.data.taskShortOne : '';
            var two = this.data.taskShortTwo ? this.data.taskShortTwo : '';
            var str = '';
            this.taskLabel.string = one;
            str = this.taskLabel.string + processStr;
            this.taskLabel.string = two;
            str += this.taskLabel.string;
            this.taskLabel.string = str
        }
    },

    setCheck: function (isCheck) {
        this.checkNode.active = isCheck;
    },

    setEquip: function (isEquip) {
        this.equipNode.active = isEquip;
    },
});