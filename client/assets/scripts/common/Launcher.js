/**
 * @fileoverview Launcher类的实现
 * @author <liqing@gameley.cn> (李清)
 */

const Tools = require('Tools');
const GameData = require('GameData');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const PlatformMgr = require('PlatformMgr');
const UpdateMgr = require('UpdateMgr');
const ShareMgr = require('ShareMgr');
const AdvertMgr = require('AdvertMgr');
const CustomFunnelEvent = require('Types').CustomFunnelEvent;
const PlatformType = require('Types').PlatformType;
const Contact = require('Contact');
const CollisionManager = require('CollisionManager');
const Scheduler = cc.Scheduler;
const LanguageMgr = require('LanguageMgr');
const v2Proto = cc.Vec2.prototype;
const PayMgr = require('PayMgr');

/**
 * Launcher 游戏入口
 */
const Launcher = cc.Class({
    extends: cc.Component,

    statics: {

    },

    properties: {
        // loadTips: cc.Label,
        waitNode: cc.Node,
        needUpdate: false,
        timeOutTime: 15,
    },

    onLoad: function () {
        // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        //     const version = wx.getSystemInfoSync().SDKVersion;
        //     if (Tools.compareVersion(version, '2.1.0') >= 0) {
        //         const self = this;
        //         cc.loader.downloader.loadSubpackage('res', function (err) {
        //             if (err) {
        //                 return console.error(err);
        //             }
        //             // console.log('load subpackage res successfully.');

        //             self.init();
        //         });

        //     } else {
        //         wx.showModal({
        //             title: '提示',
        //             content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        //         });
        //     }
        // } else {
        this.init();
        // }
    },

    init: function () {
        this.waitTime = 2;
        GameData.init();
        console.log('curTime: ' + Tools.getTimestampMS());
        GameData.instance._curTime = Tools.getTimestampMS();
        PlatformMgr.init();
        GameData.instance.logUseTime('PlatformMgr init');

        UpdateMgr.checkNewClient(() => {

            PlayerData.init();
            GameData.instance.logUseTime('PlayerData init');


            ShareMgr.init();
            GameData.instance.logUseTime('ShareMgr init');

            // this.doLogin();

            ConfigData.init();
            GameData.instance.logUseTime('ConfigData init');
            AdvertMgr.init();
            PayMgr.init();
            GameData.instance.logUseTime('AdvertMgr init');
            //------NFT RANK-数据同步-----------------
            let self = this
            PlatformMgr.requestPkey("", (success) => {
                if(success){
                    PlayerData.instance.handleRewardScoreData()
                }
                self.doLogin();
            })
            // cc.director.preloadScene("Battle");
        });


        cc.Contact = Contact;
        let manager = cc.director.getCollisionManager();
        if (manager) {
            cc.director.getScheduler().unscheduleUpdate(manager);
        }
        cc.director._collisionManager = new CollisionManager();
        cc.director.getScheduler().scheduleUpdate(cc.director._collisionManager, Scheduler.PRIORITY_SYSTEM, false);

        var getRotation = function () {
            return -this.angle;
        };

        var setRotation = function (value) {
            this.angle = -value;
        };

        var _p = cc.Node.prototype;
        cc.js.getset(_p, 'rotation', getRotation, setRotation, false, true);

        cc.Vec3.prototype.rotate = function (radians, out) {
            // cc.warnID(1408, 'vec3.rotate', 'v2.1', 'cc.v2(selfVector).rotate(radians, out)');
            return v2Proto.rotate.call(this, radians, out);
        }

        console.log("Launcher Init complete")
    },

    doLogin: function () {
        console.log("do Login")
        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Login_Start);
        var self = this;
        PlatformMgr.doLogin((res) => {

            if (res.result) {
                PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Login_Suc);
                GameData.instance.logUseTime('login suc');
                PlayerData.instance.initUserData(() => {

                    //-----NFT测试------------
                    // PlayerData.instance.bitverseWallet = "0xtest"
                    // PlayerData.instance.zongZi = 1000000

                    //默认拥有狗头和骨头NFT皮肤
                    if (!PlayerData.instance.isOwnHeroSkin(16)) {
                        PlayerData.instance.addHeroSkin(16)
                    }

                    if (!PlayerData.instance.isOwnKnifeSkin(102)) {
                        PlayerData.instance.addKnifeSkin(102)
                    }

                    PlayerData.instance.dayOpenAppCount++;

                    PlatformMgr.requestPkey(PlayerData.instance.bitverseWallet, (success) => {
                        if(success){
                            PlayerData.instance.handleRewardScoreData()
                        }
                    })


                    // PlayerData.instance.checkDaySpan();

                    // PlatformMgr.qureyBalance()          

                    // PlatformMgr.checkUserNFT(PlayerData.instance.bitverseWallet, (result) => {
                    //     if (result) {
                    //         let isOwn = function(skinData,isGet){
                    //             //NFT测试，显示是否拥有
                    //             if (skinData.getWay == 100 && !isGet) {
                    //                 let own = PlatformMgr.nft_user_datas[skinData.goodsId] || 0
                    //                 if (own > 0) {
                    //                     console.log("购买后。同步到本地皮肤数据",skinData.goodsId)
                    //                     PlayerData.instance.addHeroSkin(skinData.id);
                    //                     isGet = true
                    //                 }
                    //             }
                    //             return isGet
                    //         }

                    //         if (PlayerData.instance.nftLock_first == 0) {
                    //             //狗头皮肤领取成功
                    //             var heroData = ConfigData.instance.getHeroSkinById(16);
                    //             var isGet = PlayerData.instance.isOwnHeroSkin(16);
                    //             if(isOwn(heroData,isGet)){
                    //                 console.log("狗头皮肤领取成功")//
                    //                 PlayerData.instance.nftLock_first = 1
                    //                 PlayerData.instance.getNFT = true //控制NFT奖励弹窗
                    //                 AdvertMgr.instance.fireBaseEvent("receive_n_skin_success","ntype","hero")
                    //             }
                    //         }
                    //         else{
                    //             console.error("double collection")//重复领取
                    //         }

                    //         if (PlayerData.instance.nftLock == 0) {
                    //             //骨头皮肤领取成功
                    //             var knifeData = ConfigData.instance.getKnifeSkinById(102);
                    //             var isGet = PlayerData.instance.isOwnKnifeSkin(102);
                    //             if(isOwn(knifeData,isGet)){
                    //                 console.log("骨头皮肤领取成功")//
                    //                 PlayerData.instance.nftLock = 1 //NFT2个都领取完毕，关闭入口按钮和界面弹窗逻辑
                    //                 PlayerData.instance.getNFT = true //控制NFT奖励弹窗
                    //                 AdvertMgr.instance.fireBaseEvent("receive_n_skin_success","ntype","weapon")
                    //             }
                    //         }
                    //         else{
                    //             console.error("double collection")//重复领取
                    //         }


                    //         // PlayerData.instance.updateVipWithoutInterstitial()
                    //         // updateVipWithoutInterstitial

                    //     }
                    // })
                    //------------------------
                    //--------------------------

                    // PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Load_UserData);
                    // PlatformMgr.hawkeye_report_login();
                    // PlatformMgr.hawkeye_report_share_in();
                    // PlatformMgr.hawkeye_report_level();
                });
                this.setLanguage();
                PlatformMgr.af_report_user();
            } else {
                GameData.instance.logUseTime('login fail');
                wx.showModal({
                    title: '提示',
                    content: '网络连接似乎有问题，请检查网络设置后重试',
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            self.doLogin();
                            //   console.log('用户点击确定')
                        }
                    }
                });
            }
        });

        this.needUpdate = true;
        this.timeOutTime = 15;
    },

    setLanguage: function () {
        console.log("setLanguage")
        var lang = Tools.getItem('curLanguage');
        if (lang !== null && lang !== undefined) {
            LanguageMgr.setLang(Number(lang));
        } else {
            // 先判断 languageCode
            // 如果都没有 在判断一轮 country
            // 如果还都没有 就显示默认英文
            if (PlayerData.instance.languageCode === 'ja') {
                LanguageMgr.setLang(1);
            } else if (PlayerData.instance.languageCode === 'ko') {
                LanguageMgr.setLang(2);
            } else if (PlayerData.instance.languageCode === 'de') {
                LanguageMgr.setLang(3);
            } else if (PlayerData.instance.languageCode === 'ru') {
                LanguageMgr.setLang(4);
            } else if (PlayerData.instance.languageCode === 'zh') {
                LanguageMgr.setLang(5);
            } else if (PlayerData.instance.languageCode === 'es') {
                LanguageMgr.setLang(6);
            } else if (PlayerData.instance.languageCode === 'fr') {
                LanguageMgr.setLang(7);
            } else if (PlayerData.instance.languageCode === 'pt') {
                LanguageMgr.setLang(8);
            } else {
                if (PlayerData.instance.country === 'JP') {
                    LanguageMgr.setLang(1);
                } else if (PlayerData.instance.country === 'KR') {
                    LanguageMgr.setLang(2);
                } else if (PlayerData.instance.country === 'DE') {
                    LanguageMgr.setLang(3);
                } else if (PlayerData.instance.country === 'RU') {
                    LanguageMgr.setLang(4);
                } else if (PlayerData.instance.country === 'TW') {
                    LanguageMgr.setLang(5);
                } else if (PlayerData.instance.country === 'ES') {
                    LanguageMgr.setLang(6);
                } else if (PlayerData.instance.country === 'FR') {
                    LanguageMgr.setLang(7);
                } else if (PlayerData.instance.country === 'PT') {
                    LanguageMgr.setLang(8);
                }
            }


        }

        console.log("setLanguage complete")
    },

    update: function (dt) {
        if (ConfigData.instance && ConfigData.instance.loadingConfigCount === ConfigData.instance.loadedConfigCount) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Load_ConfigData);
            if (PlayerData.instance.loadComplete) {
                if (!this.isloading) {
                    if (PlatformMgr.platformType == PlatformType.ANDROID) {
                        console.log("---打开时，同步信息---")
                        let r = 0
                        //是否是第一天的用户
                        let frst = PlayerData.instance.isFirstDay() ? "1" : "0"
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
                            "FAUserProperty",
                            "(Ljava/lang/String;Ljava/lang/String;)V",
                            "is_firstopen",
                            frst)

                        //同步每日广告收益
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
                            "FATotalRevenueSwitch",
                            "(Ljava/lang/String;Ljava/lang/String;)V",
                            PlayerData.instance.dayCanReportTotalAdsRevenue ? "1" : "0",
                            PlayerData.instance.dayTotalAdsRevenue + "")

                        if (PlayerData.instance.ABTestCode == "") {
                            r = Math.random() > 0.5
                            PlayerData.instance.ABTestCode = GameData.instance.showVersion + (r ? "_A" : "_B")
                            // PlayerData.instance.nftPlayeCount = r ? 20 : 5
                            // PlayerData.instance.nftWinCount = r ? 30 : 10

                            PlayerData.instance.nftPlayeCount = r ? 0 : 0
                            PlayerData.instance.nftWinCount = r ? 10 : 10

                        }

                        console.log("ABcode=", r, PlayerData.instance.ABTestCode, "nft_unlock= ", PlayerData.instance.nftPlayeCount, PlayerData.instance.nftWinCount)

                        PlatformMgr.isInstallBitverse()

                        //测试，随机ab——test
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
                            "FAUserProperty",
                            "(Ljava/lang/String;Ljava/lang/String;)V",
                            "ab_test",
                            PlayerData.instance.ABTestCode)
                    } else if (PlatformMgr.platformType == PlatformType.IOS) {
                        let frst = PlayerData.instance.isFirstDay() ? "1" : "0"
                        jsb.reflection.callStaticMethod("AdManage",
                            "FAUserProperty:sec:",
                            "is_firstopen",
                            frst)

                        //同步每日广告收益
                        jsb.reflection.callStaticMethod("AdManage",
                            "FATotalRevenueSwitch:sec:",
                            PlayerData.instance.dayCanReportTotalAdsRevenue ? "1" : "0",
                            PlayerData.instance.dayTotalAdsRevenue + "")

                        if (PlayerData.instance.ABTestCode == "") {
                            PlayerData.instance.ABTestCode = Math.random() > 0.5 ? "1.0.44_A" : "1.0.44_B"
                        }

                        jsb.reflection.callStaticMethod("AdManage",
                            "FAUserProperty:sec:",
                            "ab_test",
                            PlayerData.instance.ABTestCode)
                    }

                    if (AdvertMgr.instance.getOpenAdRules()) {
                        ///////展示开屏广告////////////
                        AdvertMgr.instance.isShowingOpenAd = true
                        // PlayerData.instance.isShowOpenAdCold = true
                        AdvertMgr.instance.showOpenApp()
                        //////////////////////////////
                    } else {
                        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Switch_BattleFire);
                        GameData.instance.logUseTime('loadScene Battle');
                        cc.director.loadScene("Battle");
                        this.needUpdate = false;

                        this.isShowOpenAd = true
                    }

                    this.isloading = true;

                    // PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Switch_BattleFire);
                    // GameData.instance.logUseTime('loadScene Battle');
                    // cc.director.loadScene("Battle");
                    // this.needUpdate = false;
                } else {
                    // console.log("this.isShowOpenA",this.isShowOpenAd)
                    if (!this.isShowOpenAd) {
                        if (AdvertMgr.instance.isShowingOpenAd) {
                            //没收到广告结果前，继续调用播放
                            AdvertMgr.instance.showOpenApp()
                        } else {
                            console.log(" isShowOpenAd ", AdvertMgr.instance.isShowingOpenAd, PlayerData.instance.isShowOpenAdCold)
                            //开屏广告之后加载场景
                            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Switch_BattleFire);
                            GameData.instance.logUseTime('loadScene Battle');
                            cc.director.loadScene("Battle");
                            this.needUpdate = false;
                            this.isShowOpenAd = true
                        }
                    }

                }
            }
        }

        if (!this.waitNode.active) {
            this.waitTime -= dt;
            if (this.waitTime <= 0) {
                this.waitNode.active = true;
            }
        }

        if (this.needUpdate) {
            this.timeOutTime -= dt;
            if (this.timeOutTime <= 0) {
                this.needUpdate = false;

                // wx.showModal({
                //     title: '提示',
                //     content: '网络连接似乎有问题，请检查网络设置后重试',
                //     showCancel: false,
                //     success(res) {
                //         if (res.confirm) {
                //             cc.director.loadScene("Launcher");
                //             //   console.log('用户点击确定')
                //         }
                //     }
                // });
            }
        }
    },
});