const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');
const Tools = require('Tools');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;




cc.Class({
    extends: cc.Component,

    properties: {
        goldLabel: cc.Label,
    },

    init(callback, world) {
        this.callback = callback;
        this.world = world;
        var repayData = ConfigData.instance.getRepayDataByRank(PlayerData.instance.rankData.id);
        this.goldCount = (repayData && repayData.reward) ? repayData.reward : 0;
        this.goldLabel.string = this.goldCount;
    },

    onClose() {
        this.node.active = false;
        if (this.callback) this.callback();
    },

    onReceiveBtnClick() {
        var self = this;
        PlayerData.instance.updateRepay();
        PlayerData.instance.updateGold(self.goldCount);
        PlayerData.instance.showGold -= self.goldCount;
        var param = {
            count: self.goldCount,
            isMore: true,
            isLucky: false,
        }
        self.world.uiMgr.showGetMoneyEffect(param);
        self.onClose();


        return;
        var self = this;
        // 关闭广告时回调
        var closeFunc = function (success) {
            if (success) {
                PlayerData.instance.updateGold(self.goldCount);
                PlayerData.instance.showGold -= self.goldCount;
                var param = {
                    count: self.goldCount,
                    isMore: true,
                    isLucky: false,
                }
                self.world.uiMgr.showGetMoneyEffect(param);
                self.onClose();
            }
        }
        // 打开广告失败时回调,失败回调
        var errFunc = function () {
            self.showShare(closeFunc);
        }
        AdvertMgr.instance.showAdver(AdverType.GrowNode, closeFunc, errFunc);
    },

    showShare: function (closeFunc) {
        ShareMgr.share(ShareType.GrowNode, closeFunc)
    },
    // update (dt) {},
});