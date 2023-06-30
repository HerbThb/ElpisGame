const PlatformType = require('Types').PlatformType;
const PlatformMgr = require('PlatformMgr');
const AdvertMgr = require('AdvertMgr');
const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');

const PayMgr = cc.Class({
    statics: {
        instance: null,
        init: function () {
            if (PayMgr.instance === null) {
                PayMgr.instance = new PayMgr();
                PayMgr.instance.init();
            }
            var _global = typeof window === 'undefined' ? global : window;
            _global.PayMgr = PayMgr;
            PayMgr.instance.requestSubscribe()
        },
        cleanUp: function () {
            PayMgr.instance = null;
        },

        _closeCallback: null,

        _errCallback: null,

        _errCallback: null,

        _queryProductsCallback: null,

        _restoreCallback: null,

        _priceString: "",

        _isSupportPurchase: true,


        normalPayCallBack: function (result) {     
       
            if (result) {
                // 下发游戏奖励
                PayMgr._closeCallback(true);

                setTimeout(() => {
                    PlatformMgr.hawkeye_report_purchase(PayMgr._price ,PayMgr._payIndex);
                }, 200)
            } else {
                PayMgr._closeCallback(false);
            }
        },

        errorPayCallBack: function () {
            console.log('errorPayCallBack=================');
            PayMgr._isSupportPurchase = false;
            if(PayMgr._errCallback){
                PayMgr._errCallback();
            }
        },

        queryProductsCallBack: function (priceString) {
            PayMgr._priceString = priceString;
            // console.log('queryProductsCallBack priceString=========='+ priceString);
            if (PayMgr._queryProductsCallback) {
                PayMgr._queryProductsCallback(priceString);
            }
        },

        querySubscribePurchaseCallback: function (purchaseTime) {
            console.log('querySubscribePurchaseCallback purchaseTime=========='+ purchaseTime,this.uiMgr==null);
            //判断是否订阅生效
            PlayerData.instance.updateSubscribeTime(purchaseTime)
            if(this.uiMgr){
                console.log("PayMgr = > showSubscribeBtn ")
                this.uiMgr.showSubscribeBtn() //订阅入口按钮
            }
            if(AdvertMgr.instance){
                AdvertMgr.instance.showVipBtn()
            }
        },


        restoreCallBack: function (result) {
            if (result) {
                PlayerData.instance.updateVipWithoutInterstitial()
                if (PayMgr._restoreCallback){
                    PayMgr._restoreCallback();
                }
            }
        },
    },

    properties: {
        _isPaying: false,
        uiMgr : null,
    },

    init: function () {

    },

    setIsPaying: function (isNot) {
        this._isPaying = isNot;
    },

    getIsPaying: function () {
        return this._isPaying;
    },

    setUiMgr: function (uiMgr) {
        this.uiMgr = uiMgr;
    },

    requestProductPrices: function (queryProductsCallback) {
        PayMgr._queryProductsCallback = queryProductsCallback;

        if (PayMgr._priceString != '') {
            if (queryProductsCallback) {
                queryProductsCallback(PayMgr._priceString);
                return;
            }
        }

        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {
                break;
            }

            case PlatformType.IOS:
                {
                    jsb.reflection.callStaticMethod("IAPHelper", "requestProducts");
                }
                break;
            case PlatformType.ANDROID:
                {
                    jsb.reflection.callStaticMethod(
                        "org/cocos2dx/javascript/activity/IABManager",
                        "requestProducts",
                        "()V"
                    );
                }
                break;
            default: {
                PayMgr._queryProductsCallback('price#PHP 105.00#PHP 410.00#PHP 775.00#PHP 1,550.00#PHP 2,850.00');
                break;
            }
        }

    },

    requestSubscribe: function () {
        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {
                break;
            }

            case PlatformType.IOS:
                {
                    jsb.reflection.callStaticMethod("IAPHelper", "requestProducts");
                }
                break;
            case PlatformType.ANDROID:
                {
                    jsb.reflection.callStaticMethod(
                        "org/cocos2dx/javascript/activity/IABManager",
                        "requestSubscribe",
                        "()V"
                    );
                }
                break;
            default: {
                break;
            }
        }

    },


    restoreProducts: function(callback) {
        PayMgr._restoreCallback = callback;
        if (PlatformMgr.platformType === PlatformType.IOS) {
            jsb.reflection.callStaticMethod("IAPHelper", "restoreCompletedTransactions");
        }
    },

    payByIndex: function (payIndex, closeCallback, errCallback) {

        let finalCloseCallback = (success) => {
            setTimeout(() => {
                if (performance && performance.now) {
                    cc.director._lastUpdate = performance.now();
                }
                closeCallback(success)
            }, 100);
        }

        PayMgr._closeCallback = finalCloseCallback;
        PayMgr._errCallback = errCallback;
        PayMgr._payIndex = payIndex;
        PayMgr._price = ConfigData.instance.getShopDataPriceByIndex(payIndex);

        if (!PayMgr._isSupportPurchase) {
            if (errCallback) {
                errCallback();
            }

            return;
        }

        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {
                break;
            }

            case PlatformType.IOS:
                {         
                    jsb.reflection.callStaticMethod("IAPHelper", "buyProductByPayIndex:", payIndex);
                    break;
                }

            case PlatformType.ANDROID:
                {
                    jsb.reflection.callStaticMethod(
                        "org/cocos2dx/javascript/activity/IABManager",
                        "buyProductByPayIndex",
                        "(I)V",
                        payIndex
                    );
                }
                break;
            default: {
                finalCloseCallback(true);
                break;
            }
        }
    },

});