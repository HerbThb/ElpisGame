const ConfigData = require('ConfigData');
const PlatformType = require('Types').PlatformType;
const ChannelType = require('Types').ChannelType;
const PlatformMgr = require('PlatformMgr');
const PlayerData = require('PlayerData');
const GameData = require('GameData');
const AudioEngine = require('AudioEngine');
const AdverType = require('Types').AdverType;

const AdvertMgr = cc.Class({
    statics: {
        instance: null,
        init: function () {
            if (AdvertMgr.instance === null) {
                AdvertMgr.instance = new AdvertMgr();
                AdvertMgr.instance.init();
            }
            var _global = typeof window === 'undefined' ? global : window;
            _global.AdvertMgr = AdvertMgr;
        },
        cleanUp: function () {
            AdvertMgr.instance = null;
        },

        _closeCallback: null,

        _errCallback: null,

        normalAdverCallBack: function (result) {
            AdvertMgr.instance.isShowAdvert = false;
            if (result) {
                // 正常播放结束，可以下发游戏奖励
                // PlayerData.instance.updateTotalAdverCount();
                AdvertMgr._closeCallback(true);

                setTimeout(() => {
                    PlatformMgr.hawkeye_report_advert_end(AdvertMgr._adId);
                }, 200)
            } else {
                AdvertMgr._closeCallback(false);
            }
        },

        errorAdverCallBack: function () {
            AdvertMgr.instance.isShowAdvert = false;
            // AdvertMgr.instance.canGetAdver = false;
            AdvertMgr._errCallback();
        },

        //开屏广告回调
        oepnAdCallBack: function (result) {
            if (PlayerData.instance.isShowOpenAdCold) {
                return
            }
            if (result) {
                console.log("openad  success callback")
            } else {
                console.log("openad  fail callback")
            }
            PlayerData.instance.isShowOpenAdCold = result
            AdvertMgr.instance.isShowingOpenAd = false
        },

        // //每日上报回调
        // onTotalAdsRevenueCallBack: function (result,revenue) {
        //     console.log(" onTotalAdsRevenueCallBack ",result,revenue)
        //     if(result){
        //         //今日已经上报
        //         PlayerData.instance.dayTotalAdsRevenue = 0
        //         PlayerData.instance.dayCanReportTotalAdsRevenue = false
        //     }
        //     else{
        //         //未上报，记录revenue的值
        //         PlayerData.instance.dayTotalAdsRevenue = revenue
        //     }
        // },

        //每日上报回调
        onTotalAdsRevenueCallBack: function (revenue) {
            console.log(" onTotalAdsRevenueCallBack ", revenue)
            //记录revenue的值
            PlayerData.instance.dayTotalAdsRevenue = revenue
        },

        onBitVerseInstalledCallBack: function (result) {
            console.log(" onBitVerseInstalledCallBack ", result)
            PlayerData.instance.isBitverseInstalled = result
        },

        //链接bitverse钱包结果
        onBitVerseConnectCallBack: function (adress) {
            //记录revenue的值
            PlayerData.instance.bitverseWallet = adress
            PlayerData.instance.saveUserData('更新钱包地址');
            AdvertMgr.instance.fireBaseEvent("wallet_signedin")
            console.log("--> onBitVerseConnectCallBack ", adress, PlayerData.instance.bitverseWallet, PlayerData.instance.nftLock_auto)

            AdvertMgr.instance.uiMgr.refreshWalletIcon(true)

            //处理分数
            PlayerData.instance.rankLocalModify(true)
            
            //处理钻石，体力，NFT恢复
            PlayerData.instance.restoreProperty()

            if (PlayerData.instance.isInNFTRankGameMode() || PlatformMgr.open_nft_rank_moudle) {
                //弹窗提醒
                if(AdvertMgr.instance.uiMgr.GSHomeNode.active){
                    AdvertMgr.instance.showPopUp(ConfigData.instance.getUITipStr(24), () => {
                        // AdvertMgr.instance.uiMgr.showPanelNFT()
                    })
                }
                else{
                    AdvertMgr.instance.showPanelPopUpGame(ConfigData.instance.getUITipStr(24), () => {
                        // AdvertMgr.instance.uiMgr.showPanelNFT()
                        AdvertMgr.instance.uiMgr.refreshNFTGameOverPanelShow()
                    })
                }
                return
            }

            if (PlayerData.instance.nftLock_auto == 0) {
                //首次登录钱包
                //登录成功自动发送狗头皮肤请求
                let data = {
                    "id": 16,
                    "sort": 14,
                    "quality": 8,
                    "name": "Doge",
                    "url": "texture/hero/player202",
                    "hexColor": "#5e62ff",
                    "handColor": "#febe9b",
                    "getWay": 100,
                    "priceType": 0,
                    "price": 600000,
                    "introduce": "600K gold coins to buy",
                    "initKnifeCount": 4,
                    "property": 0,
                    "propertyParam": 15,
                    "propertyTips": "speed+5%",
                    "goodsId": 203,
                    "goodsName": "Hero#003",
                    "token": "87391307324056457762808332143355011852238642475825273327608161608735819564008"
                }

                PlatformMgr.requestNFTGet(data, PlayerData.instance.bitverseWallet, () => {
                    console.log("第一个NFT请求成功后回调", PlayerData.instance.nftLock_auto)
                    AdvertMgr.instance.uiMgr.showPanelPopUp(ConfigData.instance.getUITipStr(25))
                    if (PlayerData.instance.nftLock_auto == 0) {
                        console.log("nftLock_auto = ", PlayerData.instance.nftLock_auto)
                        // AdvertMgr.instance.fireBaseEvent("click_n_get_success"); // 不发送事件了，钱包登陆成功事件可以判断
                        PlayerData.instance.nftLock_auto = 1
                    }
                })
            }

            //弹窗提醒
            AdvertMgr.instance.showPopUp(ConfigData.instance.getUITipStr(24), () => {
                // AdvertMgr.instance.uiMgr.showPanelNFT()
            })

            AdvertMgr.instance.uiMgr.changeNFTBtnIcon()
        },

        queryCallbackFunc: function (priceString) {
            console.log('AdvertMgr priceString=======' + priceString)
            PlatformMgr.priceString = priceString
        }

    },

    properties: {
        isShowingOpenAd: false,
        isShowAdvert: false,
        canGetAdver: true,
        adverPool: [],
    },

    init: function () {
        window["PlatformApi"] = this
        this.isShowingOpenAd = false;
        this.isShowAdvert = false;
        this.canGetAdver = true;
        this.preLoad();
    },

    preLoad: function () {
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID: {
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/UpltvAdverManager",
                            "loadAd",
                            "()V");
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/UpltvAdverManager",
                            "loadInteractionAd",
                            "()V");
                        break;
                    case ChannelType.RiceBall_1:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/AdTimingAdverManager",
                            "loadAd",
                            "()V");
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/AdTimingAdverManager",
                            "loadInteractionAd",
                            "()V");
                        break;
                    case ChannelType.RiceBall_2:
                        // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "showInterstitialAd", "()V");
                        break;
                }

                break;

            }
            case PlatformType.IOS: {
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                    case ChannelType.RiceBall_1:
                        jsb.reflection.callStaticMethod(
                            "UpltvRewardedViedioAd",
                            "loadAd");
                        jsb.reflection.callStaticMethod(
                            "UpltvRewardedViedioAd",
                            "loadInteractionAd");
                        break;
                    case ChannelType.RiceBall_2:
                        break;
                }
                break;
            }
            default:
                break;
        }
    },

    setUiMgr: function (uiMgr) {
        this.uiMgr = uiMgr;
    },

    showVipBtn: function () {
        if (this.uiMgr) {
            console.log("AdvertMgr = > showSubscribeBtn ")
            this.uiMgr.showSubscribeBtn() //订阅入口按钮
        }
    },

    getConifg() {
        return ConfigData.instance
    },
    showUITips: function (str) {
        console.log("showUITips str==>", str)
        this.uiMgr.showTips(str);
    },

    showPopUp: function (str, callback) {
        if(this.uiMgr!=null && this.uiMgr!=undefined){
            this.uiMgr.showPanelPopUp(str, callback)
        }
        else{
            console.log("this.uiMgr",this.uiMgr)
        }
    },

    showPanelPopUpGame: function (str, callback) {
        this.uiMgr.showPanelPopUpGame(str, callback)
    },

    loadAdver: function (adId, callback) {
        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT:
            case PlatformType.IOS:
            case PlatformType.ANDROID:

                {
                    if (callback) callback(this.canGetAdver);
                    break;
                    // if (this.adverPool[adId]) {
                    //     callback(true);
                    // } else {
                    //     var adUnitId = ConfigData.instance.getAdvertUnitId(adId);
                    //     if (adUnitId) {
                    //         let video1 = wx.createRewardedVideoAd({
                    //             adUnitId: adUnitId
                    //         })
                    //         const self = this;
                    //         video1.load()
                    //             .then(() => {
                    //                 if (callback) callback(true);
                    //                 self.adverPool[adId] = video1;
                    //             })
                    //             .catch(err => {
                    //                 if (callback) callback(false);
                    //             });
                    //     }
                    // }

                }
            default:
                if (callback) callback(true);
                break;
        }
    },

    /**
     * 视频点被打开，后台打点
     * @param {*} adId 
     */
    openAdver: function (adId) {
        PlatformMgr.hawkeye_report_advert_open(adId);
    },

    showAdver: function (adId, closeCallback, errCallback) {
        console.log('showAdver', adId)
        this.uiMgr.openAdverBlock();
        if (!errCallback || ConfigData.instance.clientData.stopAdverToShare) {
            errCallback = () => {
                this.uiMgr.showTips(4);
            };
        }

        let finalCloseCallback = (success) => {
            setTimeout(() => {
                // this.uiMgr.closeAdverBlock();

                if (performance && performance.now) {
                    cc.director._lastUpdate = performance.now();
                }


                if (success) {
                    PlayerData.instance.updateTotalAdverCount();
                    switch (adId) {
                        case AdverType.UnlockSkin:
                        case AdverType.Revive:
                        case AdverType.MultipGold:
                        case AdverType.TryOutSkin:
                        case AdverType.OfflineGold:
                        case AdverType.Sign:
                        case AdverType.RefreshDailyTask:
                        case AdverType.MultipDailyTask:
                            PlayerData.instance.updateDayGetPrizeCount('广告');
                            break;
                        default:
                            break;
                    }
                }
                closeCallback(success)
            }, 100);
        }

        AdvertMgr._closeCallback = finalCloseCallback;
        AdvertMgr._errCallback = errCallback;
        AdvertMgr._adId = adId;

        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {

                var adUnitId = ConfigData.instance.getAdvertUnitId(adId);
                if (!adUnitId || this.isShowAdvert) {
                    return false;
                }
                let video1 = this.adverPool[adId];
                var hasLoad = false;
                if (video1) {
                    if (GameData.instance.isShowLog()) {
                        console.log('使用已加载的广告')
                    }
                    hasLoad = true;
                } else {
                    if (GameData.instance.isShowLog()) {
                        console.log('新建广告, 能否获取广告: ' + this.canGetAdver);
                    }
                    video1 = wx.createRewardedVideoAd({
                        adUnitId: adUnitId
                    })
                }
                this.isShowAdvert = true;
                this.canGetAdver = true;
                const self = this;
                var callback = function (res) {
                    video1.offClose(callback)
                    self.isShowAdvert = false;
                    self.adverPool[adId] = null;
                    // 用户点击了【关闭广告】按钮
                    // 小于 2.1.0 的基础库版本，res 是一个 undefined
                    if (res && res.isEnded || res === undefined) {
                        // 正常播放结束，可以下发游戏奖励
                        finalCloseCallback(true);

                        setTimeout(() => {
                            PlatformMgr.hawkeye_report_advert_end(adId);
                        }, 200)
                    } else {
                        // 提前手动关闭
                        finalCloseCallback(false);
                    }

                }

                video1.onClose(callback);

                if (hasLoad) {
                    video1.show();

                } else {
                    video1.load()
                        .then(() => {
                            AudioEngine.instance.stopAllSound();

                            video1.show();
                            PlatformMgr.hawkeye_report_advert_show(adId);
                        })
                        .catch(err => {
                            video1.offClose(callback);
                            self.isShowAdvert = false;
                            self.canGetAdver = false;
                            errCallback();
                        });
                }



                // video1.onError(() => {
                //     video1.offClose(callback);
                //     self.isShowAdvert = false;
                //     errCallback();
                // })

                break;
            }

            case PlatformType.IOS: {
                var adUnitId = ConfigData.instance.getAdvertUnitId(adId);
                if (!adUnitId || this.isShowAdvert) {
                    return false;
                }
                this.isShowAdvert = true;
                setTimeout(() => {
                    this.isShowAdvert = false;
                    console.log('isShowAdvert   false');
                }, 100);
                AudioEngine.instance.stopAllSound();

                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        jsb.reflection.callStaticMethod("UpltvRewardedViedioAd", "showAd:", adUnitId);
                        break;
                    case ChannelType.RiceBall_1:
                        jsb.reflection.callStaticMethod("UpltvRewardedViedioAd", "showAd:", adUnitId);
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod("AdManage", "showRewardVideoAd:", adUnitId);
                        break;
                }

                PlatformMgr.hawkeye_report_advert_show(adId);

                break;
            }

            case PlatformType.ANDROID: {
                var adUnitId = ConfigData.instance.getAdvertUnitId(adId);
                if (!adUnitId || this.isShowAdvert) {
                    return false;
                }
                this.isShowAdvert = true;
                setTimeout(() => {
                    this.isShowAdvert = false;
                    console.log('isShowAdvert   false');
                }, 100);
                AudioEngine.instance.stopAllSound();
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/UpltvAdverManager",
                            "showAd",
                            "(Ljava/lang/String;)V",
                            adUnitId
                        );
                        break;
                    case ChannelType.RiceBall_1:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/AdTimingAdverManager",
                            "showAd",
                            "()V"
                        );
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/AdManage",
                            "showRewardVideoAd",
                            "(Ljava/lang/String;)V",
                            adUnitId
                        );
                        break;
                }
                PlatformMgr.hawkeye_report_advert_show(adId);
            }
                break;
            default: {
                finalCloseCallback(true);
                break;
            }
        }
    },

    showBanner: function () {
        // return;
        if (PlatformMgr.open_nft_rank_moudle && PlayerData.instance.isDuringNFTRankTime()) { //nft rank期间不显示
            return false
        }
        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {
                this.destoryBanner();

                if (GameData.instance.isLowHeight) {
                    return;
                }

                var style = {
                    x: 0,
                    y: 0,
                    width: 720,
                    height: 250,
                }

                var obj = wx.getSystemInfoSync();
                var sWidth = obj.screenWidth;
                var sHeight = obj.screenHeight;
                var heightRate = GameData.instance.isFitHeight ? 0.95 : 1.0;
                // console.log('wx SystemInfoSync: ', obj);
                style.height = (sWidth / style.width) * style.height;
                // console.log('wx style: ', style);

                PlatformType.bannerAd = wx.createBannerAd({
                    adUnitId: 'ea8f511a9aebbf1563b47ef1dea0872f',
                    style: {
                        left: 0,
                        top: (sHeight * heightRate) - (style.height / 2),
                        width: sWidth,
                        height: style.height
                    }
                });
                PlatformType.bannerAd.show();

                break;
            }

            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        //@param dir bottom-lefte 左下 top 顶部居中 bottom 底部居中 top-lefte
                        if (!PlatformMgr.open_nft_rank_moudle) {
                            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "showBannerAd", "(Ljava/lang/String;)V", "bottom");
                        }
                        break;
                }
                break
            case PlatformType.IOS: {

                jsb.reflection.callStaticMethod("AdManage", "showBannerAd");
            }
                break;
            default: {
                break;
            }
        }
    },

    destoryBanner: function () {
        // return;
        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {
                if (PlatformType.bannerAd) {
                    PlatformType.bannerAd.destroy();

                    PlatformType.bannerAd = null;
                }

                break;
            }
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "hideBannerAd", "()V");
                        break;
                }
                break
            case PlatformType.IOS: {

                jsb.reflection.callStaticMethod("AdManage", "hideBannerAd");
            }
                break;
            default: {
                break;
            }
        }
    },

    showInterstitial: function () {
        if (PlayerData.instance.getVipWithoutInterstitial() || PlayerData.instance.isSubscribe()) {
            return;
        }

        console.log('--------------showInterstitial----------------')
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID: {
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/UpltvAdverManager",
                            "showInteractionAd",
                            "()V");
                        break;
                    case ChannelType.RiceBall_1:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/activity/AdTimingAdverManager",
                            "showInteractionAd",
                            "()V");
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "showInterstitialAd", "()V");
                        break;
                }
            }
                break;
            case PlatformType.IOS: {
                jsb.reflection.callStaticMethod("AdManage", "showInterstitialAd");
            }
                break;
            default: {
                break;
            }
        }
    },


    showOpenApp: function () {
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "showOpenAppAd", "()V");
                        break;
                }
                break;
            case PlatformType.IOS: {

                jsb.reflection.callStaticMethod("AdManage", "showOpenAppAd");
            }
                break;
            default: {
                break;
            }
        }
    },


    destroyOpenApp: function () {
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "hideOpenAppAd", "()V");
                        break;
                }
                break
            case PlatformType.IOS: {

                jsb.reflection.callStaticMethod("AdManage", "hideOpenAppAd");
            }
                break;
            default: {
                break;
            }
        }
    },

    loadOpenApp: function () {
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage", "loadOpenAppAd", "()V");
                        break;
                }
                break
            case PlatformType.IOS: {

                jsb.reflection.callStaticMethod("AdManage", "loadOpenAppAd");
            }
                break;
            default: {
                break;
            }
        }
    },

    fireBaseEvent: function (event, key = "", value = "", key2 = "", value2 = "") {
        if (event == "") {
            return
        }
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        if (key2 && value2) {
                            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
                                "FAEventWithParamsThr",
                                "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                                event, key, value, key2, value2)
                        } else {
                            if (key && value) {
                                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
                                    "FAEventWithParam",
                                    "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                                    event, key, value)
                            } else {
                                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
                                    "FAEvent",
                                    "(Ljava/lang/String;)V",
                                    event);
                            }
                        }
                        break;
                }
                break

            case PlatformType.IOS: {
                if (key && value) {
                    jsb.reflection.callStaticMethod("AdManage", "FAEventWithParam:sec:thir:", event, key, value);
                } else {
                    jsb.reflection.callStaticMethod("AdManage", "FAEvent:", event);

                }
            }
                break;

            default: {
                break;
            }
        }
    },


    //冷启动开屏广告
    getOpenAdRules: function () {
        if (PlayerData.instance.isSubscribe()) { //订阅期不显示
            return false
        }

        if (PlatformMgr.open_nft_rank_moudle) { //nft rank期间不显示
            return false
        }

        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall: {
                        return false
                    }
                    case ChannelType.RiceBall_1: {
                        return false
                    }
                    case ChannelType.RiceBall_2: {
                        //第一次游玩时不展示
                        if (PlayerData.instance.isFristGame()) {
                            return false
                        }

                        //当天未游玩时不展示
                        if (PlayerData.instance.dayPlayCount == 0) {
                            return false
                        }

                        // //游玩次数不足时不展示
                        // if(PlayerData.instance.playCount < 3){
                        //     return false
                        // }

                        // //安装后一天内不展示
                        // if(PlayerData.instance.bornDay() < 1){
                        //     return false
                        // }
                        return true
                    }
                }
                break
            case PlatformType.IOS:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall: {
                        return false
                    }
                    case ChannelType.RiceBall_1: {
                        return false
                    }
                    case ChannelType.RiceBall_2: {
                        //第一次游玩时不展示
                        if (PlayerData.instance.isFristGame()) {
                            return false
                        }

                        //当天未游玩时不展示
                        if (PlayerData.instance.dayPlayCount == 0) {
                            return false
                        }

                        // //游玩次数不足时不展示
                        // if(PlayerData.instance.playCount < 3){
                        //     return false
                        // }

                        // //安装后一天内不展示
                        // if(PlayerData.instance.bornDay() < 1){
                        //     return false
                        // }
                        return true
                    }
                }
                break
            default: {
                return false
            }
        }
    },

    webViewOpen: function (url) {
        switch (PlatformMgr.platformType) {
            case PlatformType.ANDROID:
                switch (PlatformMgr.channelType) {
                    case ChannelType.RiceBall:
                        break;
                    case ChannelType.RiceBall_1:
                        break;
                    case ChannelType.RiceBall_2:
                        jsb.reflection.callStaticMethod(
                            "org/cocos2dx/javascript/BitverseManager",
                            "openUrl",
                            "(Ljava/lang/String;)V",
                            url
                        );
                        break;
                }
                break
            case PlatformType.IOS: {

                // jsb.reflection.callStaticMethod("AdManage", "loadOpenAppAd");
            }
                break;
            default: {
                break;
            }
        }
    },

});