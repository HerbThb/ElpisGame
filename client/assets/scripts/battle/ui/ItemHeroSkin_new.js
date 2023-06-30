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
        lockNodeBg: cc.Node,
        lockNode: cc.Node,
        barNode: cc.Node,
        checkNode: cc.Node,
        equipNode: cc.Node,
        priceNode: cc.Node,
        priceLabel: cc.Label,
        restNode: cc.Node,
        restLabel: cc.Label,
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
        nullNode: cc.Node,

        leftHandNode: cc.Node,
        rightHandNode: cc.Node,
        handAni: cc.Animation,

        newIconNFT : cc.Node,

        canBuyNode: cc.Node,
    },

    onLoad() {
        this.animTime = Tools.getRandomInt(5, 10);

    },

    init: function (data) {
        this.node.active = true;
        if (!data) {
            this.nullNode.active = true;
            return;
        } else {
            this.nullNode.active = false;
        }

        this.data = data;
        if (data.price) this.priceLabel.string = Tools.getGoldStr(data.price);
        // if (data.propertyTips) this.propertyLabel.string = data.propertyTips;
        this.goldIcon.active = data.priceType === 0;
        this.diamondIcon.active = data.priceType === 1;

        // AddEntitySystem.instance.loadHeroSkinSprite(this.iconSprite, data.skinIndex);
        UIUtil.loadResSprite(this.iconSprite, data.url);
        this.leftHandNode.color = new cc.Color().fromHEX(data.handColor);
        this.rightHandNode.color = new cc.Color().fromHEX(data.handColor);

        for (let i = 0; i < this.suitNode.children.length; i++) {
            if (this.suitNode.children[i]) {
                this.suitNode.children[i].active = (i + 1) == data.suit;
            }
        }

    },

    refresh: function (isGet, canUnLock, needCheck, isNew, processStr, canBuy) {
        this.isGet = isGet;
        this.lockNode.active = isGet || canUnLock ? false : true;
        this.lockNodeBg.active = isGet || canUnLock ? false : true;
        // this.iconSprite.setState(isGet || canUnLock ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        // this.iconSprite.node.opacity = isGet || canUnLock ? 255 : 153;
        // this.barNode.active = isGet || canUnLock ? false : true;
        this.priceNode.active = isGet || (this.data.getWay === 1 || this.data.getWay==100) ? false : true;
        this.taskLabel.node.active = !isGet && this.data.getWay === 1 && !canUnLock ? true : false;
        this.needCheckNode.active = isGet && needCheck ? true : false;
        this.canUnLockNode.active = !isGet && canUnLock ? true : false;
        // this.canBuyNode.active = !isGet && canBuy;
        this.canBuyNode.active = false;
        this.propertyNode.active = this.data.propertyTips ? true : false;
        // this.propertyNode.y = isGet || canUnLock ? -65 : 65;
        this.suitNode.y = isGet || canUnLock ? -85 : -45;
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

        this.newIconNFT.active = !isGet && this.data.getWay==100

        // //NFT测试显示余额
        // if (this.restNode && this.restLabel) {
        //     this.restNode.active = this.data.getWay == 100 && !isGet
        //     if (this.restNode.active) {
        //         this.restLabel.string = this.data.rest || 1000
        //     }
        // }
    },

    setCheck: function (isCheck) {
        this.checkNode.active = isCheck;
    },

    setEquip: function (isEquip) {
        this.equipNode.active = isEquip;
    },

    setCanBuy: function (canBuy) {
        this.canBuyNode.active = canBuy;
    },

    update(dt) {
        if (this.isGet) return;
        this.animTime -= dt;
        if (this.animTime < 0) {
            this.handAni.play();
            this.animTime = Tools.getRandomInt(5, 15) + Math.random();
        }
    }
});