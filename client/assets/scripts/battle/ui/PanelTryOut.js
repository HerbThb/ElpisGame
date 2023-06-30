const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const StageType = require('Types').StageType;
cc.Class({
    extends: cc.Component,

    properties: {
        // knifeCountLabel: cc.Label,
        tryHeroSkinIcon: cc.Node,
        tryKnifeSkinIcon: cc.Node,

        nameLabel: cc.Label,
        goldNode: cc.Node,
        diamondNode: cc.Node,
        priceLabel: cc.RichText,
        priceDiamondLabel: cc.RichText,

        knifeCountNode: cc.Node,
        propertyNode: cc.Node,
        knifePropertyIcon: cc.Node,
        heroPropertyIcon: cc.Node,
        propertyLabel: cc.RichText,

        adverIcon: cc.Node,
        shareIcon: cc.Node,
        //language
        noThanksLabel: cc.Label,
    },

    init: function (data, callback, closeCallback) {
        if (callback) callback();
        var isHeroSkin = Tools.arrContains(ConfigData.instance.heroSkinDatas, data);
        this.tryHeroSkinIcon.active = isHeroSkin;
        this.tryKnifeSkinIcon.active = !isHeroSkin;
        // if (isHeroSkin) {
        //     this.knifeCount.string = PlayerData.instance.knifeSkin.initKnifeCount + PlayerData.instance.extraKnifeCount;
        // } else {
        //     this.knifeCount.string = data.initKnifeCount + PlayerData.instance.extraKnifeCount;
        // }

        // this.knifeCount.string = 6;
        this.closeCallback = closeCallback;
        this.nameLabel.string = data.name;
        if (data.price) {
            if (data.priceType === 0) {
                this.priceLabel.string = '<i>' + data.price + '</i> '
            } else {
                this.priceDiamondLabel.string = '<i>' + data.price + '</i> '
            }
        }
        this.goldNode.active = data.priceType === 0;
        this.diamondNode.active = data.priceType === 1;


        var str = data.price + '';
        this.priceLabel.fontSize = 42 - (str.length - 5) * 6;
        if (this.priceLabel.fontSize < 20) this.priceLabel.fontSize = 20;
        this.propertyNode.active = data.propertyTips ? true : false;
        this.knifePropertyIcon.active = isHeroSkin ? false : true;
        this.heroPropertyIcon.active = isHeroSkin ? true : false;
        this.propertyLabel.string = data.propertyTips ? '<i>' + data.propertyTips + '</i> ' : '';

        this.knifeCountNode.x = this.propertyNode.active ? 0 : 78;

        // AdvertMgr.instance.showBanner();

        // var stage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.adverReviveLimit);
        var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
        switch (stage) {
            case StageType.Free:
                break;
            case StageType.Share:
                this.adverIcon.active = false;
                this.shareIcon.active = true;
                break;
            case StageType.Adver:
                var func = (hasAdver) => {
                    this.adverIcon.active = hasAdver;
                    this.shareIcon.active = !hasAdver;

                    if (hasAdver) {
                        AdvertMgr.instance.openAdver(AdverType.TryOutSkin);
                    }
                }

                AdvertMgr.instance.loadAdver(AdverType.TryOutSkin, func);
                break;
        }


        this.noThanksLabel.string = "No,thanks";
    },

    closeBtnClick: function () {
        if (this.isAdver) return;
        if (this.closeCallback) this.closeCallback(false);
        this.node.active = false;
        // AdvertMgr.instance.destoryBanner();
    },

    adverBtnClick: function () {
        this.isAdver = true;
        var self = this;
        // 关闭广告时回调
        var closeFunc = function (success) {
            if (success) {
                if (self.closeCallback) self.closeCallback(true);
                // AdvertMgr.instance.destoryBanner();
                self.node.active = false;
            }
            self.isAdver = false;
        }
        // 打开广告失败时回调,失败回调
        var errFunc = function () {
            self.showShare();
            self.isAdver = false;
        }

        if (this.shareIcon.active) {
            self.showShare();
            self.isAdver = false;
        } else {
            AdvertMgr.instance.showAdver(AdverType.TryOutSkin, closeFunc, errFunc);
        }

    },

    showShare: function () {
        var self = this;
        ShareMgr.share(ShareType.TryOutSkin, (success) => {
            if (success) {
                if (self.closeCallback) self.closeCallback(true);
                // AdvertMgr.instance.destoryBanner();
                self.node.active = false;
            }
        });
    },
});