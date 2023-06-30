const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const PlayerData = require('PlayerData');
const PlatformMgr = require('PlatformMgr');
const ConfigData = require('ConfigData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AddEntitySystem = require('AddEntitySystem');
const UIUtil = require('UIUtil');
const CustomFunnelEvent = require('Types').CustomFunnelEvent;

cc.Class({
    extends: cc.Component,

    properties: {
        anim: cc.Animation,
        iconSprite: cc.Sprite,
        nameLabel: cc.Label,
        adverBtn: cc.Node,
        closeBtn: cc.Node,
        reduceBtn: cc.Node,

        normalRewardNode: cc.Node,
        rankRewardNode: cc.Node,

        heroRewardText: cc.Node,
        knifeRewardText: cc.Node,

        freeIcon: cc.Node,
        shareIcon: cc.Node,
        adverIcon: cc.Node,

        normalNode: cc.Node,
        specialNode: cc.Node,

        freeIcon_2: cc.Node,
        shareIcon_2: cc.Node,
        adverIcon_2: cc.Node,
        reduceBtn_2: cc.Node,

        //suit
        suitNode: cc.Node,
        suitNameLabel: cc.Label,
        suitOpenIcon: cc.Node,
        suitHeroNameLabel: cc.Label,
        suitKnifeNameLabel: cc.Label,
        suitSkillLabel: cc.Label,
        suitHeroFlag: cc.Node,
        suitKnifeFlag: cc.Node,
        suitActiveBtn: cc.Node,
        //language
        noThanksLabel: cc.Label,
        closeLabel: cc.Label,

        shadowNode: cc.Node,
    },

    init: function (data, callback, errCallback, world) {
        this.data = data;
        this.callback = callback;
        this.errCallback = errCallback;
        this.world = world;
        this.nameLabel.string = data.name;


        var isHeroSkin = ConfigData.instance.heroSkinDatas.indexOf(data) !== -1
        this.isHeroSkin = isHeroSkin;
        this.isSpecial = data.taskBg === 1;
        if (this.isSpecial) {
            var shadowIndex = ConfigData.instance.getBigRankDatasIndex(data.taskParam) - 1;
            for (let i = 0; i < this.shadowNode.children.length; i++) {
                this.shadowNode.children[i].active = i === shadowIndex;
            }
        }

        var isGuideSkin = data.isGuideSkin;
        this.specialNode.active = isGuideSkin;
        this.normalNode.active = !isGuideSkin;

        // if (isHeroSkin) {
        //     this.isHas = PlayerData.instance.isOwnHeroSkin(data.id);
        // } else {
        //     this.isHas = PlayerData.instance.isOwnKnifeSkin(data.id);
        // }


        this.iconSprite.node.rotation = isHeroSkin ? 0 : 90;
        this.iconSprite.node.rotation = this.isSpecial ? 45 : this.iconSprite.node.rotation;
        this.iconSprite.node.scale = isHeroSkin ? 1 : 1.5;
        this.normalRewardNode.active = this.isSpecial ? false : true;
        this.rankRewardNode.active = this.isSpecial ? true : false;
        this.nameLabel.node.color = new cc.Color().fromHEX(this.isSpecial ? '#A24100' : '#ffffff');


        this.heroRewardText.active = isHeroSkin ? true : false;
        this.knifeRewardText.active = isHeroSkin ? false : true;


        // this.nameLabel.node.color = this.isSpecial ? cc.Color.BLACK : cc.Color.WHITE;


        this.freeIcon.x = data.unlockWay === 0 ? 0 : 33;
        this.reduceBtn.active = data.unlockWay !== 0;
        this.shareIcon.active = data.unlockWay === 1;
        this.adverIcon.active = data.unlockWay === 2;


        this.stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);

        this.freeIcon_2.x = this.stage === 0 ? 0 : 33;
        this.reduceBtn_2.active = this.stage !== 0;
        this.shareIcon_2.active = this.stage === 1;
        this.adverIcon_2.active = this.stage === 2;
        // this.freeIcon_2.x = data.unlockWay === 0 ? 0 : 33;
        // this.reduceBtn_2.active = data.unlockWay !== 0;
        // this.shareIcon_2.active = data.unlockWay === 1;
        // this.adverIcon_2.active = data.unlockWay === 2;
        // if (data.unlockWay === 1) {
        //     if (GameData.instance.isInReview) {
        //         this.shareIcon.active = false;
        //         this.adverIcon.active = true;
        //     } 
        // }

        if (this.adverIcon.active) {
            AdvertMgr.instance.openAdver(AdverType.UnlockSkin);
        }





        UIUtil.loadResSprite(this.iconSprite, data.url);

        this.noThanksLabel.string = 'No,thanks';
        this.closeLabel.string = 'Close';
        // return
        //套装

        return
        this.suitNode.active = data.suit;
        if (data.suit) {
            var suitData = ConfigData.instance.getSuitData(data.suit);
            var heroData = null;
            var knifeData = null;
            var isOwnHeroSkin = true;
            var isOwnKnifeSkin = true;
            var equipHero = true;
            var equipKnife = true;
            if (isHeroSkin) {
                heroData = data;
                isOwnKnifeSkin = PlayerData.instance.isOwnKnifeSkin(suitData.knifeSkin);
                knifeData = ConfigData.instance.getKnifeSkinById(suitData.knifeSkin);
                equipKnife = PlayerData.instance.isCurEquipKnifeSkin(knifeData.id);
            } else {
                knifeData = data;
                isOwnHeroSkin = PlayerData.instance.isOwnHeroSkin(suitData.heroSkin);
                heroData = ConfigData.instance.getHeroSkinById(suitData.heroSkin);
                equipHero = PlayerData.instance.isCurEquipHeroSkin(heroData.id);
            }

            this.suitNameLabel.string = suitData.name;
            this.suitHeroNameLabel.string = '英雄：' + heroData.name;
            this.suitHeroNameLabel.node.color = isOwnHeroSkin ? cc.Color.GREEN : cc.Color.RED;
            this.suitKnifeNameLabel.string = '武器：' + knifeData.name;
            this.suitKnifeNameLabel.node.color = isOwnKnifeSkin ? cc.Color.GREEN : cc.Color.RED;
            this.suitSkillLabel.string = suitData.skillTips;

            this.suitHeroFlag.active = isOwnHeroSkin;
            this.suitKnifeFlag.active = isOwnKnifeSkin;

            this.suitOpenIcon.active = isOwnHeroSkin && isOwnKnifeSkin && equipHero && equipKnife;
            this.suitActiveBtn.active = (!this.suitOpenIcon.active) && (isOwnHeroSkin && isOwnKnifeSkin);
            // this.completeSuit.active = isOwnHeroSkin && isOwnKnifeSkin;
            // this.notCompleteSuit.active = !this.completeSuit.active;
            this.openSuitCallback = () => {
                if (isHeroSkin) {
                    this.world.onEquipKnifeSkin(knifeData, true)
                } else {
                    this.world.onEquipHeroSkin(heroData, true)
                }
            }
        }


        // AdvertMgr.instance.showBanner();
    },

    openSuitBtnClick: function () {
        if (this.openSuitCallback) this.openSuitCallback();
        this.closeBtnClick();
    },

    closeBtnClick: function () {
        this.node.active = false;
        if (PlayerData.instance.isSecGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.NewHeroClose);
        }
        if (this.callback) {
            if (this.isSpecial) {
                this.callback(false);
            } else {
                this.callback(true);
            }
        }
        // AdvertMgr.instance.destoryBanner();
        AdvertMgr.instance.showBanner();
    },

    adverBtnClick: function () {
        var self = this;
        // 关闭广告时回调
        var closeFunc = (success) => {
            if (success) {
                self.node.active = false;
                if (PlayerData.instance.isSecGame()) {
                    PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.NewHeroClose);
                }
                if (self.callback) {
                    self.callback(true);
                }
                // AdvertMgr.instance.destoryBanner();
            }
        }
        var flag = this.data.unlockWay;
        if (this.data.isGuideSkin) {
            flag = this.stage;
        }
        // 打开广告失败时回调,失败回调
        switch (flag) {
            case 0:
                closeFunc(true);
                break;
            case 1:
                // if (GameData.instance.isInReview) {
                //     this.showAdver(closeFunc);
                // } else {
                this.showShare(closeFunc);
                // }
                break;
            case 2:
                this.showAdver(closeFunc);
                break;
        }
    },

    showAdver: function (closeFunc) {
        var self = this;
        var errFunc = () => {
            self.showShare(closeFunc);
        }
        AdvertMgr.instance.showAdver(AdverType.UnlockSkin, closeFunc, errFunc);
    },

    showShare: function (closeFunc) {
        ShareMgr.share(ShareType.UnlockSkin, closeFunc);
    },


    onShareBtnClick: function () {
        this.showShare()
    },
});