const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const GrowType = require('Types').GrowType;
const Tools = require('Tools');
const PlatformMgr = require('PlatformMgr');
const StageType = require('Types').StageType;
cc.Class({
    extends: cc.Component,

    properties: {
        goldCountLabel: cc.Label,
        goldCountSprite: cc.Sprite,

        multipNode: cc.Node,
        normalLabel: cc.Label,
        multipLabel: cc.Label,
        timeLabel: cc.Label,

        freeIcon: cc.Node,
        shareIcon: cc.Node,
        adverIcon: cc.Node,
    },

    init(world) {
        this.world = world;
        //根据上次领取的时间和当前时间初始化金币数量

        this.offlineGoldNormalCount = ConfigData.instance.clientData.offlineGoldNormalCount;
        this.offlineGoldInterval = ConfigData.instance.clientData.offlineGoldInterval * 1000;
        this.offlineGoldMultipLimit = ConfigData.instance.clientData.offlineGoldMultipLimit * 1000;
        this.maxCount = 86400 / ConfigData.instance.clientData.offlineGoldInterval;
        // var  = Math.floor(time / 5) * 100 + PlayerData.instance.newOfflineGoldCount;
        // PlayerData.instance.updateOfflineGoldCount(this.goldCount);

        var self = this;
        // console.log(time, this.goldCount)
        this.reveiveCallF = (success) => {


            PlatformMgr.k6_userDate(() => {
                var count = PlayerData.instance.getFinalOfflineGold();
                if (success) count = count * 3;
                PlayerData.instance.updateGold(count);
                PlayerData.instance.showGold -= count;
                var param = {
                    count: count,
                    isMore: success,
                    isLucky: false,
                }
                self.world.uiMgr.showGetMoneyEffect(param);
                PlayerData.instance.updateGetOfflineGoldTime();
                self.refreshData();
            });
        }

        this.refreshData();
        this.canUpdate = true;

        // this.stage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.multipGoldLimit);
        this.stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
        var func = (hasAdver) => {
            this.adverIcon.active = hasAdver;
            this.shareIcon.active = !hasAdver;
        }
        switch (this.stage) {
            case StageType.Free:
            case StageType.Share:
                func(false);
                break;
            case StageType.Adver:
                AdvertMgr.instance.loadAdver(AdverType.OfflineGold, func);
                break;
        }
    },

    refreshData() {
        this.time = PlayerData.instance.getOfflineTime();
        this.goldCount = PlayerData.instance.getFinalOfflineGold();
        this.receiveTime = PlayerData.instance.getReceiveOfflineGoldTime();
        this.offlineGoldCount = PlayerData.instance.offlineGoldCount;
        var data = PlayerData.instance.getGrowLevelDataByType(GrowType.Gold);
        this.rate = data.realOfflineParam / 100 + 1;
        this.goldCountLabel.string = 0;
        this.normalLabel.string = 0;
        this.multipLabel.string = 0;
    },

    onReceiveBtnClick: function () {
        var time = PlayerData.instance.getReceiveOfflineGoldTime()
        if (time < this.offlineGoldInterval) {
            this.world.uiMgr.showTips(8)
            return;
        }
        //领取当前金币并重置领取时间

        if (time < this.offlineGoldMultipLimit) {
            this.reveiveCallF(false);
        } else {
            this.showMultipNode()
        }
    },

    showMultipNode: function (callback) {
        this.callback = callback;
        this.multipNode.active = true;
    },

    close: function () {
        this.multipNode.active = false;
        if (this.callback) {
            this.callback();
            this.callback = null;
        }
    },

    onNormalBtnClick: function () {
        this.reveiveCallF(false);
        this.close()
    },

    onMultipBtnClick: function () {
        var self = this;
        // 关闭广告时回调
        var closeFunc = (success) => {
            if (success) {
                self.reveiveCallF(true);
                self.close();
            }
        }

        if (this.shareIcon.active) {
            this.showShare(closeFunc)
        } else if (this.adverIcon.active) {
            this.showAdver(closeFunc)
        } else {
            closeFunc(true);
        }
    },

    showAdver: function (closeFunc) {
        var self = this;
        var errFunc = () => {
            self.showShare(closeFunc);
        }
        AdvertMgr.instance.showAdver(AdverType.OfflineGold, closeFunc, errFunc);
    },

    showShare: function (closeFunc) {
        ShareMgr.share(ShareType.OfflineGold, closeFunc)
    },


    //根据时间不断刷新金币数量
    update(dt) {
        //金币
        if (this.canUpdate) {
            this.time += dt * 1000
            this.goldCountSprite.fillRange = -this.time % this.offlineGoldInterval / this.offlineGoldInterval;
            var newCount = Math.floor(this.time / this.offlineGoldInterval);

            if (newCount !== this.goldCount && newCount <= this.maxCount) {
                this.goldCount = newCount;
                var finalGold = Math.floor((this.offlineGoldCount + newCount * this.offlineGoldNormalCount * this.rate) * 10) / 10;

                this.goldCountLabel.string = Tools.getGoldStr(finalGold);
                this.normalLabel.string = Tools.getGoldStr(finalGold);
                this.multipLabel.string = Tools.getGoldStr(finalGold * 3);
            }


            //剩余时间
            this.receiveTime += dt * 1000;
            var remainTime = (86400000 - this.receiveTime) / 1000;
            remainTime = remainTime < 0 ? 0 : remainTime;

            var minute = Math.floor(remainTime % 3600 / 60);
            if (minute !== this.minute) {
                this.minute = minute
                var minute = Math.floor(remainTime % 3600 / 60);
                var hour = Math.floor(remainTime / 3600);
                var hourStr = hour >= 10 ? hour : '0' + hour;
                var minuteStr = minute >= 10 ? minute : '0' + minute;
                var str = hourStr + ':' + minuteStr;
                this.timeLabel.string = str;
            }

        }





        //时间


    },
});