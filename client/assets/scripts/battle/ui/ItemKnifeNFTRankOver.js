/**
 * @fileoverview
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

        canBuyNode: cc.Node,
    },

    onLoad() {

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
        this.goldIcon.active = data.priceType === 0;
        this.diamondIcon.active = data.priceType === 1;

        // AddEntitySystem.instance.loadHeroSkinSprite(this.iconSprite, data.skinIndex);
        UIUtil.loadResSprite(this.iconSprite, data.url);


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

        this.priceNode.active = true
        this.taskLabel.node.active = false;
        this.needCheckNode.active = false;
        this.canUnLockNode.active = false;

        this.canBuyNode.active = true;

        this.propertyNode.active = this.data.propertyTips ? true : false;
        this.suitNode.y = isGet || canUnLock ? -50 : -10;

        this.newNode.active = !isGet && (isNew || this.data.getWay==100) ? true : false;
        this.newIconNFT.active = this.data.getWay==100
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

        //NFT测试显示余额
        if(this.restNode && this.restLabel){
            this.restNode.active = this.data.getWay==100 && !isGet
            if(this.restNode.active){
                this.restLabel.string = this.data.rest || 1000
            }
        }
    },

    // resetPrice(priceString) {
    //     this.price.getComponent(cc.Label).string = priceString;
    // },

});