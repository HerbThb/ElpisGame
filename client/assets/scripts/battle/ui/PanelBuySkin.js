const GameData = require('GameData');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const PlatformMgr = require('PlatformMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const UIUtil = require('UIUtil');
const ItemType = require('Types').ItemType;
const StageType = require('Types').StageType;

cc.Class({
    extends: cc.Component,

    properties: {

        rootAnim: cc.Animation,

        iconSprite: cc.Sprite,

        buyKnifeTitleNode: cc.Node,
        buyHeroTitleNode: cc.Node,
        adverKnifeTitleNode: cc.Node,
        adverHeroTitleNode: cc.Node,

        nameLabel: cc.Label,
        goldLabel: cc.Label,
        unlockCountLabel: cc.Label,

        buyBtn: cc.Node,
        adverBtn: cc.Node,
        parctialPool: [cc.ParticleSystem],
        valueLabel: cc.Label,
    },


    init(callback,world) {
        this.rootAnim.play();
        for (let p of this.parctialPool) {
            p.resetSystem();
        }

        this.world = world;
        this.callback = callback;
        this.skinData = PlayerData.instance.finalGetSkin;
        if (this.skinData) {

            this.nameLabel.string = this.skinData.name;
            this.goldLabel.string = this.skinData.price;
            this.isKnifeSkin = ConfigData.instance.heroSkinDatas.indexOf(this.skinData) === -1

            UIUtil.loadResSprite(this.iconSprite, this.skinData.url);
            this.iconSprite.node.rotation = this.isKnifeSkin ? 90 : 0;

            var curTime = PlayerData.instance.getCurTime();
            var knifeSkinDatas = ConfigData.instance.knifeSkinDatas.slice();
            var ownKnifeSkins = PlayerData.instance.ownKnifeSkins;
            Tools.filterDataByTime(knifeSkinDatas, ownKnifeSkins, curTime, GameData.instance, ConfigData.instance.clientData.hideSpecialSkin, PlatformMgr.isIOS(), PlatformMgr.isApp());

            var heroSkinDatas = ConfigData.instance.heroSkinDatas.slice();
            var ownHeroSkins = PlayerData.instance.ownHeroSkins;
            Tools.filterDataByTime(heroSkinDatas, ownHeroSkins, curTime, GameData.instance, ConfigData.instance.clientData.hideSpecialSkin, PlatformMgr.isIOS(), PlatformMgr.isApp());


            this.valueLabel.string = 'Value';
            this.unlockCountLabel.string = this.isKnifeSkin ? (ConfigData.instance.getLanguageStr('Unlocked weapon') + ':' + ownKnifeSkins.length + '/' + knifeSkinDatas.length) :
                (ConfigData.instance.getLanguageStr('Unlocked hero') + ':' + ownHeroSkins.length + '/' + heroSkinDatas.length);


            this.buyKnifeTitleNode.active = !this.skinData.isGetByAdver && this.isKnifeSkin;
            this.buyHeroTitleNode.active = !this.skinData.isGetByAdver && !this.isKnifeSkin;
            this.adverKnifeTitleNode.active = this.skinData.isGetByAdver && this.isKnifeSkin;
            this.adverHeroTitleNode.active = this.skinData.isGetByAdver && !this.isKnifeSkin;

            this.buyBtn.active = !this.skinData.isGetByAdver;
            this.adverBtn.active = this.skinData.isGetByAdver;

            if (this.skinData.isGetByAdver) AdvertMgr.instance.openAdver(AdverType.BuySkin);
        } else {
            this.onClose();
        }
        // skinData.isGetByAdver;


    },

    onBuyBtnClick() {
        if (PlayerData.instance.gold >= this.skinData.price) {
            PlayerData.instance.updateGold(-(this.skinData.price));
            if (this.isKnifeSkin) {
                PlayerData.instance.addKnifeSkin(this.skinData.id);
                this.world.onEquipKnifeSkin(this.skinData, true);
            } else {
                PlayerData.instance.addHeroSkin(this.skinData.id);
                this.world.onEquipHeroSkin(this.skinData, true);
            }
            let self = this
            this.world.uiMgr.showReward(this.skinData,()=>{
                self.node.active = false;
                if (self.callback) self.callback();
            });
        } else {
            this.world.uiMgr.showTips(7)
            this.onClose();
        }
    },

    adverBtnClick: function () {
        // 关闭广告时回调
        let self = this
        var closeFunc = (success) => {
            if (success) {
                if (self.isKnifeSkin) {
                    PlayerData.instance.addKnifeSkin(self.skinData.id);
                    self.world.onEquipKnifeSkin(self.skinData, true);
                } else {
                    PlayerData.instance.addHeroSkin(self.skinData.id);
                    self.world.onEquipHeroSkin(self.skinData, true);
                }
                self.world.uiMgr.showReward(self.skinData,()=>{
                    self.node.active = false;
                    if (self.callback) self.callback();
                });
            }
        }
        var errFunc = () => {
            this.world.uiMgr.showTips(4);
        }

        AdvertMgr.instance.showAdver(AdverType.BuySkin, closeFunc, errFunc);
    },

    onClose() {
        this.node.active = false;
        if (this.callback) this.callback();
    },

    onBtnClose() {
        this.node.active = false;

        var id = this.isKnifeSkin ? this.skinData.id + 1000 : this.skinData.id + 2000;
        if (this.skinData.isGetByAdver) {
            PlayerData.instance.updateRefuseAdverPool(id);
        } else {
            PlayerData.instance.updateRefuseBuyPool(id);
        }
        if (this.callback) this.callback();
    },
});