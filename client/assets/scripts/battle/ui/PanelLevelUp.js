const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const PlatformMgr = require('PlatformMgr');
const AdvertMgr = require('AdvertMgr');
const Tools = require('Tools');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const CustomFunnelEvent = require('Types').CustomFunnelEvent;

cc.Class({
    extends: cc.Component,

    properties: {

        levelUpAnim: cc.Animation,
        goldLabel: cc.Label,
        rankLabel: cc.Label,
        confirmBtn: cc.Node,
        panelNode: cc.Node,

        oldRankIcon: cc.Sprite,
        midRankIcon: cc.Sprite,
        newRankIcon: cc.Sprite,
        time: 0,


        unlockBuffNode: cc.Node,
        unlockBuffLabel: cc.Label,
        unlockBuffIcon: cc.Node,


        unlockMapNode: cc.Node,
        unlockMapLabel: cc.Label,
        unlockMapIcon: cc.Node,

        unlockSpecialNode: cc.Node,
        unlockSpecialLabel: cc.Label,
        unlockSpecialIcon: cc.Node,


        unlockBoxNode: cc.Node,
        unlockBoxLabel: cc.Label,
        unlockBoxIcon: cc.Node,

        rankUpSpine: sp.Skeleton,
        rankUpIconAnim: cc.Animation,
        rankUpEffectAnim: cc.Animation,

        //language
        greatLabel: cc.Label,
    },

    init: function (callback) {
        this.callback = callback;
        var oldRank = PlayerData.instance.oldRankData;
        var newRank = PlayerData.instance.rankData;
        if (!oldRank || !newRank) {
            this.onConfirmBtnClick();
            return;
        }

        this.oldRank = oldRank;
        this.newRank = newRank;
        this.showLevelUp();
        AdvertMgr.instance.showBanner();

        this.greatLabel.string = 'Great!';
    },


    showLevelUp: function () {
        this.nextRankData = ConfigData.instance.getRankDataById(this.newRank.id);
        this.oldGoldRate = this.oldRank.goldMultiRate * 100 + 100;
        this.newGoldRate = this.nextRankData.goldMultiRate * 100 + 100;
        this.addGoldRate = this.newGoldRate - this.oldGoldRate;
        UIUtil.loadResSprite(this.oldRankIcon, this.oldRank.url);
        // AddEntitySystem.instance.loadRankSprite(this.oldRankIcon, this.oldRank.iconIndex);
        UIUtil.loadResSprite(this.newRankIcon, this.nextRankData.url);
        // AddEntitySystem.instance.loadRankSprite(this.newRankIcon, this.nextRankData.iconIndex);
        this.rankLabel.string = this.oldRank.name;
        // this.goldLabel.string = '' + + '%';
        this.goldLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(13), Math.ceil(this.oldGoldRate));
        // this.levelUpAnim.on('stop', () => {
        //     this.updateGoldRate = true;
        // }, this)
        this.confirmBtn.active = false;

        this.unlockBuffNode.active = false;
        this.unlockMapNode.active = false;
        this.unlockSpecialNode.active = false;
        this.unlockBoxNode.active = false;

        for (var iconSpr of this.unlockBuffIcon.children) {
            iconSpr.active = false;
        }
        for (var iconSpr of this.unlockMapIcon.children) {
            iconSpr.active = false;
        }
        for (var iconSpr of this.unlockSpecialIcon.children) {
            iconSpr.active = false;
        }
        for (var iconSpr of this.unlockBoxIcon.children) {
            iconSpr.active = false;
        }


        this.panelNode.getComponent(cc.Animation).play('ani-levelUpNode');


        if (this.newRank.id - this.oldRank.id === 1) {
            this.rankUpSpine.setAnimation(1, 'rankup-begin');
            this.rankUpIconAnim.play();

            if (this.newRank.isRankFirst) {
                this.rankUpEffectAnim.play('effect-rankup-plus');
            } else {
                this.rankUpEffectAnim.play('effect-rankup');
            }



            setTimeout(() => {
                this.levelUpAnim.play('ani-levelUp');
            }, 1000);

            setTimeout(() => {
                this.rankUpSpine.setAnimation(1, 'rankup-keep', true);
                this.rankUpEffectAnim.play('effect-rankup-keep');
            }, 2500);

            setTimeout(() => {
                if (this.rankLabel)
                    this.rankLabel.string = this.nextRankData.name;
            }, 1700);

            setTimeout(() => {
                this.updateGoldRate = true;
            }, 2166);

            setTimeout(() => {
                var func = () => {
                    if (this.newRank.unlockBuff || this.newRank.unlockBuff === 0) {
                        this.unlockBuffLabel.string = this.newRank.unlockTips;
                        var unlockBuffIcons = this.unlockBuffIcon.children;
                        unlockBuffIcons[this.newRank.unlockBuff].active = true;
                        this.unlockBuffNode.active = true;
                    }
                }

                var func2 = () => {
                    if (this.newRank.unlockMap || this.newRank.unlockMap === 0) {
                        this.unlockMapNode.active = true;
                        this.unlockMapLabel.string = this.newRank.unlockMapTips;
                        var unlockMapIcons = this.unlockMapIcon.children;
                        unlockMapIcons[this.newRank.unlockMap].active = true;
                        setTimeout(() => {
                            func();
                        }, 200)
                    } else {
                        func();
                    }
                }

                var func3 = () => {
                    if (this.newRank.unlockSpecial || this.newRank.unlockSpecial === 0) {
                        this.unlockSpecialNode.active = true;
                        this.unlockSpecialLabel.string = this.newRank.unlockSpecialTips;
                        var unlockSpecialIcons = this.unlockSpecialIcon.children;
                        unlockSpecialIcons[this.newRank.unlockSpecial].active = true;
                        setTimeout(() => {
                            func2();
                        }, 200)
                    } else {
                        func2();
                    }
                }

                if (this.newRank.unlockBox || this.newRank.unlockBox === 0) {
                    this.unlockBoxNode.active = true;
                    this.unlockBoxLabel.string = this.newRank.unlockBoxTips;
                    var unlockBoxIcons = this.unlockBoxIcon.children;
                    unlockBoxIcons[this.newRank.unlockBox].active = true;
                    setTimeout(() => {
                        func3();
                    }, 200)
                } else {
                    func3();
                }


            }, 2166);
        } else {

            var midRankData = ConfigData.instance.getRankDataById(this.oldRank.id + 1)
            UIUtil.loadResSprite(this.midRankIcon, midRankData.url);
            // AddEntitySystem.instance.loadRankSprite(this.midRankIcon, midRankData.iconIndex);
            setTimeout(() => {
                this.levelUpAnim.play('ani-levelUp-2');
            }, 1000);
            setTimeout(() => {
                if (this.rankLabel)
                    this.rankLabel.string = midRankData.name;
            }, 1700);

            setTimeout(() => {
                if (this.rankLabel)
                    this.rankLabel.string = this.nextRankData.name;
            }, 2400);
            setTimeout(() => {
                this.updateGoldRate = true;
            }, 3000);
        }
        // this.panelNode.scale = 0;
        // this.panelNode.runAction(cc.scaleTo(0.3, 1));
    },

    update: function (dt) {
        if (this.updateGoldRate) {
            // this.time += dt;
            // if (this.time > 0.03) {
            //     this.time = 0;
            // if (this.oldGoldRate < this.newGoldRate) {
            //     this.oldGoldRate += this.addGoldRate / 10;
            // this.goldLabel.string = 'Rank bonus coin:' + Math.ceil(this.newGoldRate) + '%';
            this.goldLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(13), Math.ceil(this.newGoldRate));
            // } else {
            this.updateGoldRate = false;
            this.confirmBtn.y = -68;
            if (this.newRank.unlockBuff || this.newRank.unlockBuff === 0) {
                this.confirmBtn.y -= 60;
            }
            if (this.newRank.unlockMap || this.newRank.unlockMap === 0) {
                this.confirmBtn.y -= 60;
            }
            if (this.newRank.unlockSpecial || this.newRank.unlockSpecial === 0) {
                this.confirmBtn.y -= 60;
            }
            if (this.newRank.unlockBox || this.newRank.unlockBox === 0) {
                this.confirmBtn.y -= 60;
            }
            // var action = cc.scaleTo(0.1, 1);
            setTimeout(() => {
                this.oldRank = this.nextRankData;
                this.confirmBtn.active = true;
            }, 300);
            // this.goldLabel.node.parent.runAction(action);
            // }
        }
    },

    onConfirmBtnClick: function () {
        if (this.callback) this.callback();
        this.node.active = false;
        if (PlayerData.instance.isSecGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.RankUpEnd);
        }
        // AdvertMgr.instance.destoryBanner();
    },


    onShareBtnClick: function () {
        ShareMgr.share(ShareType.LevelUp);
    },
});