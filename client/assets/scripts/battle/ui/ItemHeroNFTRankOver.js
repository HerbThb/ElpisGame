/**
 * @fileoverview
 */
const ListItemBase = require('ListItemBase')
// const AddEntitySystem = require('AddEntitySystem');
const UIUtil = require('UIUtil');
const Tools = require('Tools');
const PlayerData = require('PlayerData');

cc.Class({
    extends: ListItemBase,

    properties: {
        lockNodeBg: cc.Node,
        lockNode: cc.Node,
        lockBg:cc.Node,
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

        helpBgNode : cc.Node,
        

        canBuyNode: cc.Node,
    },

    onLoad() {
        this.animTime = Tools.getRandomInt(5, 10);

    },

    init: function (data,world) {
        this.world = world
        this.node.active = true;
        if (!data) {
            this.nullNode.active = true;
            return;
        } else {
            this.nullNode.active = false;
        }

        this.data = data;
        if (data.price) this.priceLabel.string = Tools.getGoldStr(data.price);
        this.goldIcon.active = data.priceType === 0;
        this.diamondIcon.active = data.priceType === 1;

        // AddEntitySystem.instance.loadHeroSkinSprite(this.iconSprite, data.skinIndex);
        UIUtil.loadResSprite(this.iconSprite, data.url);

        //英雄解锁
        if(data.handColor){
            this.leftHandNode.color = new cc.Color().fromHEX(data.handColor);
            this.rightHandNode.color = new cc.Color().fromHEX(data.handColor);
            this.lockBg.active = true
            this.rightHandNode.active = this.leftHandNode.active = true
            this.iconSprite.scaleX = this.iconSprite.scaleY = 1
            this.helpBgNode.active = true
        }
        else{
            this.lockBg.active = false
            this.rightHandNode.active = this.leftHandNode.active = false
            this.iconSprite.scaleX = this.iconSprite.scaleY = 2.5
            this.helpBgNode.active = false
        }

        //暂时无套装属性
        for (let i = 0; i < this.suitNode.children.length; i++) {
            if (this.suitNode.children[i]) {
                this.suitNode.children[i].active = false
            }
        }
        
        // if (data.propertyTips) this.propertyLabel.string = data.propertyTips;
    },

    refresh: function (isGet, canUnLock, needCheck, isNew, processStr, canBuy) {
        this.isGet = isGet;
        this.lockNode.active = isGet || canUnLock ? false : true;
        this.lockNodeBg.active = isGet || canUnLock ? false : true;
        this.priceNode.active = isGet ? false : true;
        this.taskLabel.node.active = false
        this.needCheckNode.active = false
        this.canUnLockNode.active = false
        this.canBuyNode.active = true;
        this.propertyNode.active = this.data.propertyTips ? true : false;
        // this.propertyNode.y = isGet || canUnLock ? -65 : 65;
        // this.suitNode.y = isGet || canUnLock ? -85 : -45;
        this.newNode.active = true
        // if (processStr || processStr === '') {
        //     var one = this.data.taskShortOne ? this.data.taskShortOne : '';
        //     var two = this.data.taskShortTwo ? this.data.taskShortTwo : '';
        //     var str = '';
        //     this.taskLabel.string = one;
        //     str = this.taskLabel.string + processStr;
        //     this.taskLabel.string = two;
        //     str += this.taskLabel.string;
        //     // this.taskLabel.string = str
        // }

        // //NFT测试显示余额
        // if (this.restNode && this.restLabel) {
        //     this.restNode.active = this.data.getWay == 100 && !isGet
        //     if (this.restNode.active) {
        //         this.restLabel.string = this.data.rest || 1000
        //     }
        // }
    },

    // resetPrice(priceString) {
    //     this.price.getComponent(cc.Label).string = priceString;
    // },

    update(dt) {
        if (this.isGet) return;
        this.animTime -= dt;
        if (this.animTime < 0) {
            this.handAni.play();
            this.animTime = Tools.getRandomInt(5, 15) + Math.random();
        }
    },

    onBuyBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_ranking_settlement_nft");

        if (PayMgr.instance.getIsPaying()) {
            return;
        }
        if (PlayerData.instance.zongZi >= this.data.price) {
            if(this.data.goodsId > 200){
                PlayerData.instance.addHeroSkin(this.data.id);
                PlayerData.instance.buyNFTSkin(this.data.id,false)
            }
            else{
                PlayerData.instance.addKnifeSkin(this.data.id);
                PlayerData.instance.buyNFTSkin(this.data.id,true)
            }
            PlayerData.instance.updateZongZi(-(this.data.price));
            // this.refresh();
            this.world.uiMgr.refreshNFTGameOverPanel()
        } else {
            this.world.uiMgr.showTips('Insufficient Diamond');
        }

    },

});