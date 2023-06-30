const PayMgr = require('PayMgr');
const AdvertMgr = require('AdvertMgr');
const PlayerData = require('PlayerData');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const ConfigData = require('ConfigData');

cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        desc: cc.Label,
        price: cc.Node,
        free: cc.Node,
        tv: cc.Node,
        buyBtn: cc.Node,
        remainTime: cc.Label,

        _world: cc.Node,
        _lastFreeDiamondTime: 0,
        _curTime: '',
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(data, world) {
        this._data = data;
        this._world = world;
        this.desc.getComponent(cc.Label).string = this._data.desc ? this._data.desc : '';
        if (!this._data.isAdItem) {
            this.price.getComponent(cc.Label).string = this._data.price ? this._data.price : '';
        } else {
            this.tv.active = true;
            this.free.active = true;
            this.price.active = false;

            this.buyBtn.active = PlayerData.instance.getCanGetFreeDiamond();
            this._lastFreeDiamondTime = PlayerData.instance.getLastFreeDiamondTime();
        }

    },

    resetPrice(priceString) {
        if (this._data.isAdItem) return;
        this.price.getComponent(cc.Label).string = priceString;
    },

    resetIcon(spFrame) {
        this.icon.spriteFrame = spFrame;
    },

    onBuyBtnClick: function () {
        if (PayMgr.instance.getIsPaying()) {
            return;
        }

        var closeFunc = (isSuccess) => {
            PayMgr.instance.setIsPaying(false);
            if (isSuccess) {
                AdvertMgr.instance.fireBaseEvent("purchase_product_success","product_id",
                    this._data.isAdItem ? "ads for diamond" : "diamonds");
                if (this._data.isAdItem) {
                    PlayerData.instance.updateLastFreeDiamondTime();
                    this.setFreeBuyBtnActive(false);
                }
                PlayerData.instance.updateZongZi(this._data.diamond);
                PlatformMgr.syncNFTRankPlayerInfo(PlayerData.instance.bitverseWallet)
                this._world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(15), this._data.diamond));
            }
        }

        var errorFunc = () => {
            PayMgr.instance.setIsPaying(false);
            this._world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(23)));
        }

        setTimeout(() => {
            PayMgr.instance.setIsPaying(false);
        }, 1800)
        if (this._data.isAdItem) {
            AdvertMgr.instance.fireBaseEvent("purchase_product","product_id","ads for diamond");

            AdvertMgr.instance.showAdver(AdverType.ShopFreeDiamond, closeFunc)
        } else {
            AdvertMgr.instance.fireBaseEvent("purchase_product","product_id","diamonds");

            PayMgr.instance.setIsPaying(true);
            PayMgr.instance.payByIndex(this._data.payIndex, closeFunc, errorFunc);
        }
    },

    setFreeBuyBtnActive: function(isActive) {
        this._lastFreeDiamondTime = PlayerData.instance.getLastFreeDiamondTime();
        this.buyBtn.active = isActive;
    },

    update (dt) {
        if (this._data.isAdItem && !this.buyBtn.active) {
            if (PlayerData.instance.getCanGetFreeDiamond()) {
                this.setFreeBuyBtnActive(true);
                return;
            }
            var timeString = Tools.getRemainTimeStr(PlayerData.instance.getCurTime(), this._lastFreeDiamondTime + 24*60*60*1000);
            if (timeString != this._curTime) {
                this._curTime = timeString;
                this.remainTime.string = this._curTime;
            }
        }
    },
});