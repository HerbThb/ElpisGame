const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const PlatformMgr = require('PlatformMgr');

const Tools = require('Tools');
cc.Class({
    extends: cc.Component,

    properties: {
        // topBg: cc.Node,
        // bottomBg: cc.Node,
        waitNode: cc.Node,
    },

    onLoad() {
        //查询订阅商品价格
        // var queryCallbackFunc = (priceString) => {
        //     console.log('onLoad priceString=======' + priceString);
        //     this._priceString = (priceString);
        //     this.setWaitNodeActive(false);
        //     this.resetPrices(this._priceString);
        // }

        // setTimeout(() => {
        //     this.setWaitNodeActive(false);
        // }, 1000)

        // this.setWaitNodeActive(true);
        // PayMgr.instance.requestProductPrices(queryCallbackFunc);
    },

    init(world, callback) {
        this.world = world;
        this.callback = callback;

        AdvertMgr.instance.destoryBanner()

    },

    resetPrices: function (priceString) {


    },

    onSubscribe() {
        if (PayMgr.instance.getIsPaying()) {
            return;
        }
        var closeFunc = (isSuccess) => {
            PayMgr.instance.setIsPaying(false);
            if (isSuccess) {
                AdvertMgr.instance.fireBaseEvent("click_vip_weekly_success")

                var curTime = PlayerData.instance.getCurTime();
                PlayerData.instance.updateSubscribeTime(curTime)

                this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(26)));

                this.world.uiMgr.showSubscribeBtn() //订阅入口按钮

                this.world.uiMgr.showPanelSubscribeReward()

                this.onClose();
            }
        }

        var errorFunc = () => {
            PayMgr.instance.setIsPaying(false);
            this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(23)));
        }

        setTimeout(() => {
            PayMgr.instance.setIsPaying(false);
        }, 1800)

        AdvertMgr.instance.fireBaseEvent("click_vip_weekly");

        PayMgr.instance.setIsPaying(true);
        PayMgr.instance.payByIndex(6, closeFunc, errorFunc);
    },


    restoreSubscribe() {
        AdvertMgr.instance.fireBaseEvent("click_restore_purchase")

    },

    setWaitNodeActive: function (isActive) {
        this.waitNode.active = isActive;
    },


    onClose() {
        this.node.active = false;
        AdvertMgr.instance.showBanner();
        if (this.callback) this.callback();
    },

    update(dt) {
        if (PlatformMgr.isIosApp() && !this.waitNode.active && PayMgr.instance.getIsPaying()) {
            this.setWaitNodeActive(true);
        }

        if (PlatformMgr.isIosApp() && this.waitNode.active && !PayMgr.instance.getIsPaying()) {
            this.setWaitNodeActive(false);
        }
    },

    onClickPrivacy() {
        let url = "https://www.riceballgames.com/privacy.html"
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/BitverseManager",
            "openUrl",
            "(Ljava/lang/String;)V",
            url
        );
    },

    onClickTerms() {
        let url = "https://www.riceballgames.com/terms.html"
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/BitverseManager",
            "openUrl",
            "(Ljava/lang/String;)V",
            url
        );
    },
});