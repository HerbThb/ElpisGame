const PlayerData = require('PlayerData');
const UIUtil = require('UIUtil');
const GameData = require('GameData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const StageType = require('Types').StageType;
const AdverType = require('Types').AdverType;
const ConfigData = require('ConfigData');
const PlatformType = require('Types').PlatformType;
const PlatformMgr = require('PlatformMgr');
const Tools = require('Tools');
const BagItem = require('BagItem');
const AdvertMgr = require('AdvertMgr');
const LanguageMgr = require('LanguageMgr');
const TaskType = require('Types').TaskType;
const BattleModeType = require('Types').BattleModeType;


const GSHome = cc.Class({
    extends: cc.Component,

    statics: {
        gameClubButton: null,
        // instance: null,
        // init: function () {
        //     if (GSHome.instance === null) {
        //         GSHome.instance = new GSHome();
        //         GSHome.instance.init();
        //     }
        //     var _global = typeof window === 'undefined' ? global : window;
        //     _global.GSHome = GSHome;
        // },
        // cleanUp: function () {
        //     GSHome.instance = null;
        // },
    },

    properties: {
        shopDiamondNode: cc.Node,
        shopRootNode: cc.Node,
        indexDownRootNode: cc.Node,
        panelIndex: cc.Node,
        panelShop: cc.Node,
        panelKnifeShop: cc.Node,
        panelHeroShop: cc.Node,

        panelHeroShopNFT: cc.Node,
        panelKnifeShopNFT: cc.Node,


        panelTips: cc.Node,
        panelReward: cc.Node,
        panelLevelUp: cc.Node,
        panelSign: cc.Node,
        panelSignRoot: cc.Node,
        goldLabel: cc.Label,
        nameEditBox: cc.EditBox,
        versionLabel: cc.Label,
        getMoneyAnim: cc.Animation,
        getMoreMoneyAnim: cc.Animation,
        getLuckyMoneyNode: cc.Node,
        world: null,

        audioOnNode: cc.Node,
        audioOffNode: cc.Node,
        vibrateOnNode: cc.Node,
        vibrateOffNode: cc.Node,

        restorePurchaseBtn: cc.Node,
        noAdsBtn: cc.Node,

        addKnifeNode: cc.Node,
        friendRankNode: cc.Node,
        gameClubNode: cc.Node,
        myAppNode: cc.Node,
        _extraKnife: false,


        rankNode: cc.Node,
        rankBar: cc.Node,
        rankNameLabel: cc.Label,
        rankIconSprite: cc.Sprite,
        rankProgressLabel: cc.Label,
        rankStarNode: cc.Node,
        rankNoStarNode: cc.Node,

        panelCheat: cc.Node,
        panelCheatBtn: cc.Node,
        panelRankInfo: cc.Node,

        panelRankInfoRedDot: cc.Node,
        panelKnifeShopRedDot: cc.Node,
        panelKnifeShopNewRedDot: cc.Node,
        panelHeroShopRedDot: cc.Node,
        panelHeroShopNewRedDot: cc.Node,

        panelHeroShopNewNFTDot: cc.Node,
        panelKnifeShopNewNFTDot: cc.Node,

        panelTryOut: cc.Node,
        panelTryFrenzy: cc.Node,
        panelTrySuit: cc.Node,
        panelGetNFT: cc.Node,
        PanelNFTRank: cc.Node,
        PanelRankNFT: cc.Node,
        panelDailyTask: cc.Node,
        panelInvite: cc.Node,
        panelAddTop: cc.Node,
        panelHolidayRank: cc.Node,
        panelRewardDetail: cc.Node,
        panelPKReward: cc.Node,
        panelWorldReward: cc.Node,
        panelPKNotice: cc.Node,
        panelSubscribe: cc.Node,
        panelSubscribeReward: cc.Node,
        panelPopUp: cc.Node,
        panelBuySkin: cc.Node,
        panelEvaulate: cc.Node,
        panelRechargeShop: cc.Node,
        rechargeShopParent: cc.Node,
        panelPhysicalShop: cc.Node,

        kingNode: cc.Node,
        kingLabel: cc.Label,

        panelFriend: cc.Node,

        signTipsNode: cc.Node,
        singTipsLabel: cc.Label,
        signRedDot: cc.Node,

        panelMatch: cc.Node,
        panelProperty: cc.Node,

        panelGetSkin: cc.Node,
        watchAdverBtn: cc.Node,
        watchAdverLabel: cc.Label,

        danceNumberNode: cc.Node,
        danceNumberLabel: cc.Label,
        panelGrowUp: cc.Node,
        panelOfflineGold: cc.Node,

        settingNode: cc.Node,
        vibrateBtn: cc.Node,

        downNode: cc.Node,
        panelRepay: cc.Node,

        panelRank: cc.Node,

        panelNFT: cc.Node,

        vipBtnNode: cc.Node,
        goldNode: cc.Node,

        taskRedDot: cc.Node,
        taskPIKAQI: cc.Node,
        // gif: cc.Node,

        showMoneyTime: 0.5,

        redDotLabel: cc.Label,

        dailyTaskNode: cc.Node,

        inviteBtnNode: cc.Node,
        inviteRedDot: cc.Node,

        goldCountNode: cc.Node,
        goldAnimNode: cc.Node,


        diamondCountNode: cc.Node,
        diamondCountLabel: cc.Label,

        physicalCountNode: cc.Node,
        physicalCountLabel: cc.Label,

        addTopBtnNode: cc.Node,
        addTopRedDot: cc.Node,
        addTopRootNode: cc.Node,

        nftRedDot: cc.Node,

        diamondNode: cc.Node,
        diamondLabel: cc.Label,

        activeSuitAnim: cc.Animation,
        holidayParentNode: cc.Node,
        holidayBtn: cc.Node,
        holidayWorkdBtn: cc.Node,
        holidayCloseBtn: cc.Node,
        userinfoBtns: [],

        pkNoticeBtn: cc.Node,
        pkNoticeLabel: cc.Label,

        selectLanguageNode: cc.Node,

        nftWalletNode: cc.Node,
        nftWalletIcon: cc.Node,

        nftActivityNode: cc.Node,
        isNewShop: true,


        canvas: cc.Node,

        nftRankBtn: cc.Node,

        normalModelNode: cc.Node,
        nftRankModelnode: cc.Node,

        nftModelBackNode: cc.Node,

        nftRankScore: cc.Label,
    },

    init(world) {
        // this.canvas.on(cc.Node.EventType.TOUCH_START, (evt) => {
        //     // console.log(evt)
        // }, this, true)

        // ///////销毁开屏广告////////////
        // AdvertMgr.instance.destroyOpenApp()
        // //////////////////////////////
        // AdvertMgr.instance.loadOpenApp()
        //Loading页加载完成，进入游戏页面
        AdvertMgr.instance.fireBaseEvent("app_enter");
        //准备页得到展示
        AdvertMgr.instance.fireBaseEvent("page_show_prepare", "hero", PlayerData.instance.heroSkin.name, "weapon", PlayerData.instance.knifeSkin.name);


        if (AdvertMgr.instance.getOpenAdRules()) {
            //看到主界面时，如果open才加载完，也播放
            if (!PlayerData.instance.isShowOpenAdCold) {
                AdvertMgr.instance.showOpenApp();
            } else {
                console.log("already played openAppAd")
            }
        }


        console.log("gshome--loaded")


        //------------------------------
        //测试
        // PlatformMgr.qureyBalance()
        //------------------------------

        this.world = world;
        this.activeCount = 0;
        this.activeGoldNode(true);
        this.activeDiamondNode(true);
        this.activePhysicalNode(false)
        this.pkNoticeLabel.string = PlayerData.instance.remainPKDay;

        this.goldCountNode.active = true;
        this.diamondCountNode.active = true;
        this.physicalCountNode.active = false
        this.goldAnim = this.goldAnimNode.getComponent('GoldAnim')

        this.nameEditBox.textLabel.langFlag = true;
        this.nameEditBox.placeholderLabel.langFlag = true;
        this.nameEditBox.string = PlayerData.instance.name;

        this.versionLabel.string = GameData.instance.showVersion;

        this.audioOnNode.active = GameData.instance._audioOpen;
        this.audioOffNode.active = !this.audioOnNode.active;

        this.vibrateOnNode.active = GameData.instance._vibrateOpen;
        this.vibrateOffNode.active = !this.vibrateOnNode.active;

        this.restorePurchaseBtn.active = PlatformMgr.isIosApp();
        this.noAdsBtn.active = !PlayerData.instance.getVipWithoutInterstitial();

        // this.nameEditBox.node.parent.active = !PlatformMgr.isIOS();
        this.friendRankNode.active = false;
        // this.addKnifeNode.active = !GameData.instance.isInReview && !ConfigData.instance.clientData.stopAdverToShare;
        this._extraKnife = PlayerData.instance.isExtraKnife;

        this.holidayBtn.active = false;
        this.pkNoticeBtn.active = false;

        if (PlayerData.instance.getGoldParam) {
            PlayerData.instance.showGold -= PlayerData.instance.getGoldParam.count;
        }

        var rankData = PlayerData.instance.rankData;
        var star = PlayerData.instance.rankStar;
        this.rankNameLabel.string = rankData.name;
        if (rankData.levelUpStar === 0) {
            this.kingNode.active = true;
            this.refreshRankStar();
            this.kingLabel.string = 'x' + (star - rankData.star);
        } else {
            this.kingNode.active = false;
            this.refreshRankStar();
        }

        UIUtil.loadResSprite(this.rankIconSprite, rankData.url);
        // AddEntitySystem.instance.loadRankSprite(this.rankIconSprite, rankData.iconIndex);

        // cc.audioEngine.setVolume(this.audioOnNode.active ? 1 : 0);

        // this.gif.getComponent('Gif').enableDisplay();

        // this.panelCheatBtn.active = GameData.instance.isEnvironmentTest();
        // this.panelCheatBtn.active = true

        // this.addTopBtnNode.y = -100;
        // this.addTopRootNode.y = -100;
        if (PlatformMgr.platformType === PlatformType.WECHAT) {
            var obj = wx.getMenuButtonBoundingClientRect()
            console.log('========getMenuButtonBoundingClientRect=======', JSON.stringify(obj))
            var bottom = 150;
            if (obj.bottom) {
                bottom = obj.bottom / GameData.instance.frameSize.height * 1280 + 50;
            }
            this.addTopRootNode.y = -bottom;
            setTimeout(() => {
                const userInfoBtnState = Tools.getItem('userinfoBtn');
                if (!userInfoBtnState) {
                    var callback = (res) => {
                        if (res.userInfo) {
                            this.changeName(res.userInfo.nickName);
                            PlayerData.instance.updateIconUrl(res.userInfo.avatarUrl);
                            Tools.setItem('userinfoBtn', 1);
                            for (let btn of this.userinfoBtns) {
                                if (btn) btn.destroy();
                            }
                        }
                    }
                    //授权1
                    if (this.userinfoBtns[0]) {
                        this.userinfoBtns[0].show();
                    } else {
                        this.userinfoBtns[0] = this.createUserInfoButton(this.nameEditBox.node);
                        this.userinfoBtns[0].onTap((res) => {
                            callback(res);
                        })
                    }
                    //授权2
                    if (ConfigData.instance.isDuringHolidayRankBtnShowTime()) {
                        if (this.userinfoBtns[1]) {
                            this.userinfoBtns[1].show();
                        } else {
                            this.userinfoBtns[1] = this.createUserInfoButton(this.holidayBtn);
                            this.userinfoBtns[1].onTap((res) => {
                                callback(res);
                                this.onPanelHolidayRankBtnClick();
                            })
                        }
                    }

                    //授权3
                    if (this.userinfoBtns[2]) {
                        this.userinfoBtns[2].hide();
                    } else {
                        this.userinfoBtns[2] = this.createUserInfoButton(this.holidayWorkdBtn);
                        this.userinfoBtns[2].onTap((res) => {
                            callback(res);
                            this.panelHolidayRank.getComponent('PanelHolidayRank').onWorldNodeBtnClick();
                        })
                        this.userinfoBtns[2].hide();
                    }
                    //授权4
                    if (this.userinfoBtns[3]) {
                        this.userinfoBtns[3].hide();
                    } else {
                        this.userinfoBtns[3] = this.createUserInfoButton(this.holidayCloseBtn);
                        this.userinfoBtns[3].onTap((res) => {
                            callback(res);
                            this.panelHolidayRank.getComponent('PanelHolidayRank').close();
                        })
                        this.userinfoBtns[2].hide();
                    }

                } else if (userInfoBtnState === 1) {
                    wx.getUserInfo({
                        success: (res) => {
                            if (res) {
                                this.changeName(res.userInfo.nickName);
                                PlayerData.instance.updateIconUrl(res.userInfo.avatarUrl);
                                Tools.setItem('userinfoBtn', 2);
                            }
                        },
                    })
                }
            }, 500)
        }

        // this.panelRankInfo.getComponent('PanelRankInfo').init(this.world);
        // this.panelOfflineGold.getComponent('PanelOfflineGold').init(this.world);
        this.panelGrowUp.getComponent('PanelGrowUp').init(this.world);

        this.panelRank.getComponent('PanelRank').init();

        var height = (GameData.instance.screenHeight - 1280) / 2;
        var offset = height > 40 ? height - 40 : 0;
        this.downNode.y = 144 - offset;

        this.refreshWatchAdverBtn();
        this.refreshRedDot();


        var self = this;
        ShareMgr.refreshRedDot = () => {
            self.refreshRedDot();
            self.panelAddTop.getComponent('PanelAddTop').refresh();
        }

        this.checkPad();


        console.log("PlatformMgr.open_nft_moudle PlayerData.instance.nftLock", PlatformMgr.open_nft_moudle, PlayerData.instance.nftLock, PlayerData.instance.getNFT)


        //钱包按钮常驻
        this.refreshWalletIcon(PlayerData.instance.bitverseWallet.length > 0)

        if (PlatformMgr.open_nft_moudle && PlayerData.instance.nftLock == 0) {
            //可展示
            // this.nftActivityNode.active = PlayerData.instance.playCount >= PlayerData.instance.nftPlayeCount

            //狗头未领取
            var heroData = ConfigData.instance.getHeroSkinById(16);
            var isGet = PlayerData.instance.isOwnHeroSkin(16);
            //NFT测试，显示是否拥有
            if (heroData.getWay == 100 && !isGet) {
                let own = PlatformMgr.nft_user_datas[heroData.goodsId] || 0
                if (own > 0) {
                    console.log("购买后。同步到本地皮肤数据")
                    PlayerData.instance.addHeroSkin(heroData.id);
                    isGet = true
                }
            }

            //可领取:未领取狗头或者满足骨头领取条件
            let canGet = PlayerData.instance.winCount >= PlayerData.instance.nftWinCount || !isGet
            this.nftRedDot.active = canGet
            // this.popGetNFT()
        } else {
            this.nftRedDot.active = this.nftActivityNode.active = false
        }

        this.changeNFTBtnIcon()

        if (PlayerData.instance.getNFT) {
            //这里判断为玩家在后台获取NFT后，首次登录
            PlayerData.instance.getNFT = false
            //弹窗提醒
            this.showPanelPopUp(ConfigData.instance.getUITipStr(27), () => {
                AdvertMgr.instance.fireBaseEvent("receive_n_skin_success");
                //直接穿上NFT皮肤
                if (PlayerData.instance.nftLock == 1) {
                    //领取了两个皮肤
                    var heroData = ConfigData.instance.getHeroSkinById(16);
                    self.world.onEquipHeroSkin(heroData, true);

                    var knifeData = ConfigData.instance.getKnifeSkinById(102);
                    self.world.onEquipKnifeSkin(knifeData, true);
                    self.world.changeLocalKnifesCount(knifeData.initKnifeCount);
                } else if (PlayerData.instance.nftLock_first == 1) {
                    //只领取了第一个
                    var heroData = ConfigData.instance.getHeroSkinById(16);
                    self.world.onEquipHeroSkin(heroData, true);
                    self.world.changeLocalKnifesCount(heroData.initKnifeCount);
                }
            })

        }


        this.vipBtnNode.active = !PlayerData.instance.isSubscribe()

        //不是第一次启动的玩家,开屏广告没有的情况下，直接展示
        if (!PlayerData.instance.isFristGame()) {
            //主界面展示banner广告
            console.log("showBanner setTimeout GSHome")
            setTimeout(() => {
                AdvertMgr.instance.showBanner();
            }, 2000)
        }


        //调试按钮后台
        this.lastTouchTime = 0
        this.touchCnt = 0

        this.goldNode.on(cc.Node.EventType.TOUCH_START, () => {
            this.lastTouchTime = PlayerData.instance.getCurTime()
        }, this)

        this.goldNode.on(cc.Node.EventType.TOUCH_MOVE, () => {
            if (this.touchCnt >= 10) {
                if (PlayerData.instance.getCurTime() - this.lastTouchTime > 3000) {
                    this.panelCheatBtn.active = true
                    this.touchCnt = 0
                }
            }
            // console.log("touche move" , PlayerData.instance.getCurTime() - this.lastTouchTime)
        }, this);

        this.goldNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.touchCnt++
        }, this);

        //NFT RANK大赛
        let overRank = PlayerData.instance.lastBattleMode == BattleModeType.NFT_RANK

        this.normalModelNode.active = !overRank
        this.nftRankModelnode.active = this.nftModelBackNode.active = overRank
        this.rankNode.active = !overRank

        this.nftRankBtn.active = PlatformMgr.open_nft_rank_moudle && PlayerData.instance.isInSurplusTime()

        this.nftRankScore.string = PlayerData.instance.nftRankScore

        this.checkNFTRankSetting()

        this.activeGoldNode(!overRank);
        this.activeDiamondNode(true);
        this.activePhysicalNode(overRank)
    },

    popGetNFT() {
        if (PlatformMgr.open_nft_rank_moudle) {
            return
        }

        if (PlatformMgr.open_nft_moudle && PlayerData.instance.nftLock == 0) {
            //可展示
            // this.nftActivityNode.active = PlayerData.instance.playCount >= PlayerData.instance.nftPlayeCount

            //狗头未领取
            var heroData = ConfigData.instance.getHeroSkinById(16);
            var isGet = PlayerData.instance.isOwnHeroSkin(16);
            //NFT测试，显示是否拥有
            if (heroData.getWay == 100 && !isGet) {
                let own = PlatformMgr.nft_user_datas[heroData.goodsId] || 0
                if (own > 0) {
                    console.log("购买后。同步到本地皮肤数据")
                    PlayerData.instance.addHeroSkin(heroData.id);
                    isGet = true
                }
            }
            var self = this
            //1.用户5盘之前 每盘结束 不论输赢 回首页 出 狗头弹窗
            //2.用户5盘之后 用户每盘赢第一名 回首页 出 骨头弹窗 直到赢第11盘之后 不出弹框了
            //当天未游玩时不展示
            //第一次游玩时不展示
            if (PlayerData.instance.isFristGame() || PlayerData.instance.dayPlayCount == 0) {

            } else {
                if (PlayerData.instance.lastOnceGameRank > 0) {
                    if (!isGet) {
                        //未领取狗头
                        if (PlayerData.instance.winCount < 5) {
                            self.onPanelNFTBtnClick(true)

                        }
                    } else {
                        //已经领取狗头 
                        if (PlayerData.instance.lastOnceGameRank == 1) {
                            if (PlayerData.instance.winCount > 5 && PlayerData.instance.winCount <= PlayerData.instance.nftWinCount) {
                                this.onPanelNFTBtnClick(true)
                                self.onPanelNFTBtnClick(true)
                            }
                        }
                    }
                    PlayerData.instance.lastOnceGameRank = 0
                }
            }
        }
    },


    checkPad() {
        this.shopRootNode.y = GameData.instance.isPad() ? -200 : 0;
        this.indexDownRootNode.y = GameData.instance.isPad() ? 250 : 180;
        this.panelDailyTask.y = GameData.instance.isPad() ? -120 : 0;
        this.shopDiamondNode.y = GameData.instance.isPad() ? 430 : 550;
        this.panelSubscribe.y = GameData.instance.isPad() ? -100 : 0;
        this.panelSign.getComponent(cc.Widget).top = GameData.instance.isPad() ? 150 : 0;
        this.panelSignRoot.scale = GameData.instance.isPad() ? 0.9 : 1;
        this.settingNode.width = GameData.instance.isPad() ? 165 : 245;
        this.vibrateBtn.active = !GameData.instance.isPad();
        // this.panelTrySuit.y = GameData.instance.isPad() ? -70 : 0;
        this.panelBuySkin.y = GameData.instance.isPad() ? -100 : 0;
        this.panelTips.y = GameData.instance.isPad() ? 340 : 480;
        this.activeSuitAnim.node.y = GameData.instance.isPad() ? -100 : 0;
        this.panelLevelUp.getComponent(cc.Widget).top = GameData.instance.isPad() ? 150 : 0;
        this.panelGetSkin.getComponent(cc.Widget).top = GameData.instance.isPad() ? 150 : 0;
    },


    createUserInfoButton: function (node) {
        var ratio = GameData.instance.ratio;
        var pos, left, top, width, height;
        pos = node.parent.convertToWorldSpaceAR(node.position);
        left = (pos.x - node.width / 2) * ratio;
        top = (GameData.instance.screenHeight - pos.y - node.height / 2) * ratio;
        width = node.width * ratio;
        height = node.height * ratio;

        var btn = wx.createUserInfoButton({
            type: 'text',
            text: '', //点击任意区域开始游戏
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
                // backgroundColor: '#000000',
                // borderColor: '#000000',
                backgroundColor: '#00000000',
                color: '#00000000',
                borderRadius: 0,
                textAlign: 'center',
                fontSize: 30,
                lineHeight: 40,
            }
        });

        return btn;
    },

    startLoadPrefab: function () {
        GameData.instance.logUseTime('start home prefab load');

        if (!this.panelHeroShop) {
            UIUtil.loadUIPrefab('prefab/ui/gshome/PanelHeroShop' + (this.isNewShop ? '_new' : ''), (resource) => {
                if (resource) {
                    this.panelHeroShop = resource;
                    this.panelHeroShop.parent = this.panelShop;
                    // this.panelHeroShop.getComponent('PanelHeroShop').init(this.world);
                    GameData.instance.logUseTime('panelHeroShop prefab loaded');
                }
            });
        }

        if (!this.panelKnifeShop) {
            UIUtil.loadUIPrefab('prefab/ui/gshome/PanelKnifeShop' + (this.isNewShop ? '_new' : ''), (resource) => {
                if (resource) {
                    this.panelKnifeShop = resource;
                    this.panelKnifeShop.parent = this.panelShop;
                    // this.panelKnifeShop.getComponent('PanelKnifeShop').init(this.world);
                    GameData.instance.logUseTime('panelKnifeShop prefab loaded');
                }
            });
        }

        if (!this.panelHeroShopNFT) {
            UIUtil.loadUIPrefab('prefab/ui/gshome/PanelHeroShopNFT', (resource) => {
                if (resource) {
                    this.panelHeroShopNFT = resource;
                    this.panelHeroShopNFT.parent = this.panelShop;
                    // this.panelKnifeShop.getComponent('PanelKnifeShop').init(this.world);
                    GameData.instance.logUseTime('panelHeroShopNFT prefab loaded');
                }
            });
        }


        if (!this.panelKnifeShopNFT) {
            UIUtil.loadUIPrefab('prefab/ui/gshome/PanelKnifeShopNFT', (resource) => {
                if (resource) {
                    this.panelKnifeShopNFT = resource;
                    this.panelKnifeShopNFT.parent = this.panelShop;
                    // this.panelKnifeShop.getComponent('PanelKnifeShop').init(this.world);
                    GameData.instance.logUseTime('panelHeroShopNFT prefab loaded');
                }
            });
        }



        if (!this.panelRechargeShop) {
            UIUtil.loadUIPrefab('prefab/ui/gshome/PanelShop', (resource) => {
                if (resource) {
                    this.panelRechargeShop = resource;
                    this.panelRechargeShop.parent = this.rechargeShopParent;
                    this.panelRechargeShop.active = false;
                    this.panelRechargeShop.y = GameData.instance.isPad() ? -80 : 0;
                    // this.panelKnifeShop.getComponent('PanelKnifeShop').init(this.world);
                    GameData.instance.logUseTime('panelRechargeShop prefab loaded');
                }
            });
        }

        if (!this.panelPhysicalShop) {
            UIUtil.loadUIPrefab('prefab/ui/gshome/panelPhysicalShop', (resource) => {
                if (resource) {
                    this.panelPhysicalShop = resource;
                    this.panelPhysicalShop.parent = this.rechargeShopParent;
                    this.panelPhysicalShop.active = false;
                    this.panelPhysicalShop.y = GameData.instance.isPad() ? -80 : 0;
                    // this.panelKnifeShop.getComponent('PanelKnifeShop').init(this.world);
                    GameData.instance.logUseTime('panelPhysicalShop prefab loaded');
                }
            });
        }
    },

    onPanelShopBtnClick: function (event, data) {
        if (!(this.panelKnifeShop && this.panelHeroShop)) return
        this.panelProperty.active = true;
        // if (this.panelHeroShop) this.panelHeroShop.getComponent('PanelHeroShop' + (this.isNewShop ? '_new' : '')).init(this.world);
        // if (this.panelKnifeShop) this.panelKnifeShop.getComponent('PanelKnifeShop' + (this.isNewShop ? '_new' : '')).init(this.world);
        var action = cc.moveTo(0.5, cc.v2(0, -300 + GameData.instance.screenOffset / 2)).easing(cc.easeCubicActionOut(3.0));
        this.world.followCameraCtrl.runAction(action);
        action = cc.moveTo(0.5, cc.v2(0, GameData.instance.screenOffset)).easing(cc.easeCubicActionOut(3.0));
        this.panelShop.runAction(action);
        this.panelIndex.active = false;
        this.world.localPlayer.setScale(0.8)
        this.world.localPlayer.showNameNode(false);
        if (data === '1') {
            this.onPanelHeroShopBtnClick()
        } else {
            this.onPanelKnifeShopBtnClick()
        }

        AdvertMgr.instance.destoryBanner();
    },

    onPanelKnifeShopBtnClick: function () {
        if (PlayerData.instance.isInNFTRankGameMode()) {
            if (this.panelKnifeShopNFT) this.panelKnifeShopNFT.getComponent('PanelKnifeShopNFT').init(this.world);
            this.panelKnifeShop.active = false;
            this.panelHeroShop.active = false;
            this.panelHeroShopNFT.active = false;
            this.panelKnifeShopNFT.active = true;

            AdvertMgr.instance.fireBaseEvent("click_ranking_knife_btn");

            //皮肤武器页展示
            // AdvertMgr.instance.fireBaseEvent("page_show_knife");
            // PlayerData.instance.updateNewKnifeSkinCheck();
        } else {
            if (this.panelKnifeShop) this.panelKnifeShop.getComponent('PanelKnifeShop' + (this.isNewShop ? '_new' : '')).init(this.world);
            this.panelKnifeShop.active = true;
            this.panelHeroShop.active = false;


            this.panelHeroShopNFT.active = false;
            this.panelKnifeShopNFT.active = false;
            //皮肤武器页展示
            AdvertMgr.instance.fireBaseEvent("page_show_knife");
            PlayerData.instance.updateNewKnifeSkinCheck();
        }

        this.refreshRedDot();
    },

    onPanelHeroShopBtnClick: function () {
        if (PlayerData.instance.isInNFTRankGameMode()) {
            if (this.panelHeroShopNFT) this.panelHeroShopNFT.getComponent('PanelHeroShopNFT').init(this.world);
            this.panelKnifeShop.active = false;
            this.panelHeroShop.active = false;
            this.panelHeroShopNFT.active = true;
            this.panelKnifeShopNFT.active = false;

            AdvertMgr.instance.fireBaseEvent("click_ranking_hero_btn");

            //皮肤武器页展示
            // AdvertMgr.instance.fireBaseEvent("page_show_knife");
            // PlayerData.instance.updateNewKnifeSkinCheck();
        } else {
            if (this.panelHeroShop) this.panelHeroShop.getComponent('PanelHeroShop' + (this.isNewShop ? '_new' : '')).init(this.world);
            this.panelKnifeShop.active = false;
            this.panelHeroShop.active = true;
            this.panelHeroShopNFT.active = false;
            this.panelKnifeShopNFT.active = false;
            //皮肤英雄页展示
            AdvertMgr.instance.fireBaseEvent("page_show_hero");
            PlayerData.instance.updateNewHeroSkinCheck();
            this.refreshRedDot();
        }
        //------------------------------
        //测试
        //链接钱包
        // PlatformMgr.connectBitverse()
        //------------------------------
    },

    onPanelShopClose: function (isKnfe) {
        var action = cc.moveTo(0.5, cc.v2(0, -1500)).easing(cc.easeCubicActionOut(3.0));
        this.panelShop.runAction(action);
        this.panelIndex.active = true;
        this.panelProperty.active = false;
        action = cc.moveTo(0.5, cc.v2(0, 0)).easing(cc.easeCubicActionOut(3.0));
        this.world.followCameraCtrl.runAction(action);
        this.world.localPlayer.showNameNode(true);
        this.world.localPlayer.setScale(1)

        if (isKnfe) {
            if (PlayerData.instance.isInNFTRankGameMode()) {
                this.panelKnifeShopNFT.getComponent('PanelKnifeShopNFT').close()
            } else {
                this.panelKnifeShop.getComponent('PanelKnifeShop' + (this.isNewShop ? '_new' : '')).close()
            }
        } else {
            if (PlayerData.instance.isInNFTRankGameMode()) {
                this.panelHeroShopNFT.getComponent('PanelHeroShopNFT').close()
            } else {
                this.panelHeroShop.getComponent('PanelHeroShop' + (this.isNewShop ? '_new' : '')).close()
            }
        }
    },

    // onRandomRankStar: function () {
    //     PlayerData.instance.randomRankStar();
    // },


    onPanelRankInfoBtnClick: function () {
        //准备页点击排行榜 按钮
        AdvertMgr.instance.fireBaseEvent("click_ranking_btn");
        this.panelRank.active = true;
        this.panelRank.getComponent('PanelRank').refresh();
        // AdvertMgr.instance.showBanner();
        // this.panelRankInfo.getComponent('PanelRankInfo').init(this.world);
    },

    onAddKnifeBtnClick: function () {

        var closeFunc = (isSuccess) => {
            if (isSuccess) {
                PlayerData.instance.setExtraKnife(6);
                this.world.changeLocalKnifesCount(PlayerData.instance.knifeSkin.initKnifeCount);
                this._extraKnife = true;
                this.addKnifeNode.active = false;
            }
        }

        var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
        switch (stage) {
            case StageType.Free:
                closeFunc(true)
                break;
            case StageType.Share:
                ShareMgr.share(ShareType.AddKnife, closeFunc)
                break;
            case StageType.Adver:
                //点击获取加飞刀数量按钮
                AdvertMgr.instance.fireBaseEvent("click_addknives_btn");
                AdvertMgr.instance.fireBaseEvent("click_adv_btn", "position_id", ConfigData.instance.getAdvertUnitId(AdverType.AddKnife));
                AdvertMgr.instance.showAdver(AdverType.AddKnife, closeFunc)
                break;
        }

    },

    OnEditNameBegan: function () {
        AdvertMgr.instance.destoryBanner();
    },

    onEditName: function () {
        var str = this.filter(this.nameEditBox.string)
        if (str !== this.nameEditBox.string) {
            this.showTips(21);
        }
        this.changeName(str);
        //加个空格以免自动转化为其他语言
    },

    changeName: function (str) {
        console.log("showBanner changeName ")
        AdvertMgr.instance.showBanner();
        str = Tools.getShowNickName(str);
        PlayerData.instance.updateName(str);
        this.world.localPlayer.changeName(str);
        this.nameEditBox.string = str;
    },


    filter: function (inputContent) {
        // 多个敏感词，这里直接以数组的形式展示出来
        var arrMg = ConfigData.instance.teaword;
        // 显示的内容--showContent
        var showContent = inputContent;
        for (var i = 0; i < arrMg.length; i++) {
            // 创建一个正则表达式
            // var r = new RegExp(, "ig");
            var r = new RegExp(arrMg[i].replace(/([\(\)\*])/g, '\\$1'), 'ig');
            showContent = showContent.replace(r, "");
        }
        // 显示的内容--showInput
        return showContent;
    },

    update: function (dt) {


        // var getGoldParam = PlayerData.instance.getGoldParam;
        // if (getGoldParam) {
        //     this.showMoneyTime -= dt;
        //     if (this.showMoneyTime < 0) {
        //         PlayerData.instance.showGold -= getGoldParam.count;
        //         this.showGetMoneyEffect(getGoldParam);
        //         PlayerData.instance.getGoldParam = null;
        //     }
        // }


        var count = PlayerData.instance.showGold;
        var str = Tools.getGoldStr(count);
        this.goldLabel.string = str;
        this.diamondLabel.string = PlayerData.instance.zongZi;
        this.diamondCountLabel.string = PlayerData.instance.zongZi;


        this.physicalCountLabel.string = PlayerData.instance.getAllPhysical() ;


        if (this.nameEditBox.node.parent.active !== !PlatformMgr.isIOS()) {
            this.nameEditBox.node.parent.active = !PlatformMgr.isIOS();
            this.world.localPlayer.changeName('我');
        }




        var flag = !this._extraKnife; // && !GameData.instance.isInReview && !ConfigData.instance.clientData.stopAdverToShare;
        if (this.addKnifeNode.active !== flag) {
            this.addKnifeNode.active = flag;
        }

        flag = !(GameData.instance.isInReview || ConfigData.instance.clientData.hideSpecialSkin);
        if (this.dailyTaskNode.active !== flag) {
            this.dailyTaskNode.active = flag;
        }

        flag = !(GameData.instance.isInReview || ConfigData.instance.clientData.hideSpecialSkin || PlayerData.instance.hasGetInviteReward() || PlatformMgr.isApp());
        if (this.inviteBtnNode.active !== flag) {
            this.inviteBtnNode.active = flag;
        }

        flag = !(GameData.instance.isInReview || ConfigData.instance.clientData.hideAddTop || !PlayerData.instance.canShowBtnAddTop() || PlatformMgr.isIOS() || PlatformMgr.isApp())
        if (this.addTopBtnNode.active !== flag) {
            this.addTopBtnNode.active = flag;
        }

        // flag = PlayerData.instance.canShowBtnHoliday()
        // if (this.holidayBtn.active !== flag) {
        //     this.holidayBtn.active = flag;
        // }

        // flag = (Tools.isBeforeOtherTime(ConfigData.instance.holidayDatas.startDate, PlayerData.instance.getCurTime()))
        // if (this.pkNoticeBtn.active !== flag) {
        //     this.pkNoticeBtn.active = flag;
        // }
    },

    onAudioBtnClick: function () {
        this.audioOnNode.active = !this.audioOnNode.active;
        this.audioOffNode.active = !this.audioOnNode.active;
        GameData.instance.setAudio(this.audioOnNode.active);
    },

    onVibrateBtnClick: function () {
        this.vibrateOnNode.active = !this.vibrateOnNode.active;
        this.vibrateOffNode.active = !this.vibrateOnNode.active;
        GameData.instance.setVibrate(this.vibrateOnNode.active);
    },

    showTips: function (tips) {
        this.panelTips.getComponent('PanelTips').init(tips);
    },

    showReward: function (data, callback, errCallback) {
        this.panelReward.active = true;
        this.panelReward.getComponent('PanelReward').init(data, callback, errCallback, this.world);
    },

    onShareBtnClick: function () {
        ShareMgr.share(ShareType.HOME, (isSuccess) => {
            if (isSuccess) {
                this.showTips(1);
            }
        })
    },


    //老的金币动画
    // showGetMoneyEffect: function (getGoldParam) {
    //     if (getGoldParam.isLucky) {
    //         var animNodes = this.getLuckyMoneyNode.children;
    //         for (let i = 0; i < animNodes.length; i++) {
    //             let node = animNodes[i];

    //             let anim = node.getComponent(cc.Animation);
    //             anim.once('finished', () => {
    //                 node.active = false;
    //             })
    //             setTimeout(() => {

    //                 node.active = true;
    //                 anim.play();
    //             }, i * 500)
    //         }
    //         setTimeout(() => {
    //             PlayerData.instance.showGold = PlayerData.instance.gold;
    //         }, 2000);

    //         var multip = getGoldParam.multip;
    //         if (multip) {
    //             var extraGold = Math.ceil(getGoldParam.count * (multip - 1) / multip);
    //             var str = Tools.getStringByFormat(ConfigData.instance.getUITipStr(2), extraGold)
    //             this.showTips(str);
    //         }

    //     } else if (getGoldParam.isMore) {
    //         this.getMoreMoneyAnim.once('finished', () => {
    //             this.getMoreMoneyAnim.node.active = false;
    //         })

    //         this.getMoreMoneyAnim.node.active = true;
    //         this.getMoreMoneyAnim.play();
    //         setTimeout(() => {
    //             PlayerData.instance.showGold = PlayerData.instance.gold;
    //         }, 1100)

    //         var multip = getGoldParam.multip;
    //         if (multip) {
    //             var extraGold = Math.ceil(getGoldParam.count * (multip - 1) / multip);
    //             var str = Tools.getStringByFormat(ConfigData.instance.getUITipStr(2), extraGold)
    //             this.showTips(str);
    //         }
    //     } else {
    //         this.getMoneyAnim.once('finished', () => {
    //             this.getMoneyAnim.node.active = false;
    //         })
    //         this.getMoneyAnim.node.active = true;
    //         this.getMoneyAnim.play();

    //         setTimeout(() => {
    //             PlayerData.instance.showGold = PlayerData.instance.gold;
    //         }, 1100)
    //     }

    //     //刷新成长属性金币数字颜色
    //     if (this.panelGrowUp) {
    //         var comp = this.panelGrowUp.getComponent('PanelGrowUp');
    //         comp.refreshShowData(comp.curType, false);
    //     }
    // },

    refreshGold: function () {
        this._GSHome.refreshGold();
    },

    onResetToDefault: function () {
        PlayerData.instance.showPanelSignFlag = false;
        PlayerData.instance.resetDataToDefault();
        this.world.restartGame();
    },

    hideMyAppNode: function () {
        this.myAppNode.active = false;
    },

    showPanelLevelUp: function (callback) {
        this.panelLevelUp.active = true;
        this.panelLevelUp.getComponent('PanelLevelUp').init(callback)
    },

    showPanelTryOut: function (data, callback, closeCallback) {
        this.panelTryOut.active = true;
        this.panelTryOut.getComponent('PanelTryOut').init(data, callback, closeCallback);
    },

    showPanelTryFrenzy: function (callback) {
        this.panelTryFrenzy.active = true;
        this.panelTryFrenzy.getComponent('PanelTryFrenzy').init(callback);
    },

    showPanelTrySuit: function (data, callback, closeCallback) {
        this.panelTrySuit.active = true;
        this.panelTrySuit.getComponent('PanelTrySuit').init(data, callback, closeCallback);
    },

    showPanelGetNFT: function (callback, closeCallback) {
        if (PlatformMgr.open_nft_rank_moudle) {
            if (callback) {
                callback()
            }
            if (closeCallback) {
                closeCallback(false);
            }
            return
        }
        this.panelGetNFT.active = true;
        this.panelGetNFT.getComponent('PanelGetNFT').init(this.world, callback, closeCallback);
    },

    showPanelSign: function (callback) {
        this.activeGoldNode(false);
        this.activeDiamondNode(false);
        this.panelSign.active = true;
        this.panelSign.getComponent('PanelSign').init(this.world, callback);
    },

    // showPanelDailyTask: function (callback) {
    //     this.panelDailyTask.active = true;
    //     this.panelDailyTask.getComponent('PanelDailyTask').init(this.world, callback);
    // },


    showWatchAdverCount: function () {
        var count = PlayerData.instance.changeAdverCount;
        if (count > 0) {
            PlayerData.instance.changeAdverCount = 0;
            this.danceNumberLabel.string = '+' + count;
            this.danceNumberNode.active = true;
        }
    },


    refreshWatchAdverBtn: function () {
        // this.watchAdverBtn.active = false; 
        // return;
        this.watchAdverSkinData = ConfigData.instance.getKnifeSkinById(25);
        var process = PlayerData.instance.getTaskProcess(TaskType.ADVERCOUNT);
        if (process >= this.watchAdverSkinData.taskParam) {
            this.watchAdverBtn.active = false;
            this.panelGetSkin.getComponent('PanelGetSkin').onCloseBtnClick();
        } else {
            this.watchAdverBtn.active = true;
            // this.watchAdverLabel.string = process + '/' + this.watchAdverSkinData.taskParam;
        }

    },

    refreshRedDot: function () {
        // console.log('正式刷新红点');
        this.panelKnifeShopRedDot.active = false;
        this.panelKnifeShopNewRedDot.active = false;
        this.panelHeroShopRedDot.active = false;
        this.panelHeroShopNewRedDot.active = false;
        this.panelHeroShopNewNFTDot.active = false
        this.panelKnifeShopNewNFTDot.active = false


        this.panelRankInfoRedDot.active = false;
        //商店可领取红点
        for (const data of ConfigData.instance.knifeSkinDatas) {
            var isGet = PlayerData.instance.isOwnKnifeSkin(data.id);
            var canUnlock = Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId);
            if (!isGet && canUnlock) {
                this.panelKnifeShopRedDot.active = true;
                break;
            }
        }
        for (const data of ConfigData.instance.heroSkinDatas) {
            var isGet = PlayerData.instance.isOwnHeroSkin(data.id);
            var canUnlock = Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId);
            if (!isGet && canUnlock) {
                this.panelHeroShopRedDot.active = true;
                break;
            }
        }

        //商店新上架红点
        for (const data of ConfigData.instance.knifeSkinDatas) {
            var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, PlayerData.instance.getCurTime());
            var id = data.id;
            if (isNew && !Tools.arrContains(PlayerData.instance.hasCheckNewSkin, id)) {
                this.panelKnifeShopNewRedDot.active = true;
                this.panelKnifeShopRedDot.active = false;
                break;
            }
        }

        for (const data of ConfigData.instance.heroSkinDatas) {
            var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, PlayerData.instance.getCurTime());
            var id = 10000 + data.id;
            if (isNew && !Tools.arrContains(PlayerData.instance.hasCheckNewSkin, id)) {
                this.panelHeroShopNewRedDot.active = true;
                this.panelHeroShopRedDot.active = false;
                break;
            }
        }

        //大赛模式下
        if (PlayerData.instance.currentBattleMode == BattleModeType.NFT_RANK) {
            this.panelKnifeShopRedDot.active = false;
            this.panelKnifeShopNewRedDot.active = false;
            this.panelHeroShopRedDot.active = false;
            this.panelHeroShopNewRedDot.active = false;
            this.panelHeroShopNewNFTDot.active = true
            this.panelKnifeShopNewNFTDot.active = true
        }


        //邀请红点
        var canGet = PlayerData.instance.inviteDatas.length >= 3 && !PlayerData.instance.hasGetInviteReward();
        var hasNew = PlayerData.instance.inviteDatas.length > PlayerData.instance.checkInviteLength;
        if (canGet || hasNew) {
            this.inviteRedDot.active = true;
        } else {
            this.inviteRedDot.active = false;
        }

        //添加置顶红点
        var canGet = PlayerData.instance.canGetAddTopReward();
        this.addTopRedDot.active = canGet;


        //段位红点
        // var rankDatas = ConfigData.instance.starRankDatas;
        // for (let i = 0; i <= PlayerData.instance.rankData.id; i++) {
        //     var data = rankDatas[i];
        //     if (data.reward && !Tools.arrContains(PlayerData.instance.completeRankRewardIds, data.id)) {
        //         var item = BagItem.createItemWithString(data.reward);
        //         if (item.type === ItemType.KNIFE_SKIN && PlayerData.instance.isOwnKnifeSkin(item.id)) continue;
        //         this.panelRankInfoRedDot.active = true;
        //         break;
        //     }
        // }

        //日常任务红点

        var isCompleteAllTask = true;
        this.taskRedDot.active = false;
        var num = 0;
        let tasks = PlayerData.instance.dailyShowTask;
        for (let data of tasks) {
            // var isComplete = PlayerData.instance.getDailyTaskProcess(data.type) >= data.param;
            var isComplete = data.process >= data.param;
            var isGet = Tools.arrContains(PlayerData.instance.dailyOldTask, data.id) || Tools.arrContains(PlayerData.instance.completeGuideDailyTask, data.id)
            if (isComplete && (!isGet)) {
                this.taskRedDot.active = true;
                num += 1;
            }
            if (!isComplete) isCompleteAllTask = false;
        }
        var maxCount = ConfigData.instance.clientData.maxRefreshTaskCount;
        var curCount = PlayerData.instance.dayRefreshTaskCount;
        var remainCount = maxCount - curCount;
        if (isCompleteAllTask && (remainCount > 0) && num === 0) {
            num = 1;
            this.taskRedDot.active = true;
        }
        this.redDotLabel.string = num;
        this.taskPIKAQI.active = ConfigData.instance.isDuringDuanWuFestival(PlayerData.instance.getCurTime());

        //签到红点
        var daySign = PlayerData.instance.daySign;
        this.signRedDot.active = !daySign;
        //签到气泡

        var signTips = this.signTipsNode.children;
        signTips[0].active = false;
        signTips[1].active = false;
        signTips[2].active = false;
        signTips[3].active = false;
        if (this.signRedDot.active) return;

        var signCount = PlayerData.instance.signCount;
        var signDatas = ConfigData.instance.signDatas;
        if (signCount >= 6) {
            signDatas = ConfigData.instance.lateSignDatas;
        };
        if (signCount === 0) {
            signTips[0].active = true;
        } else if (signCount === 1) {
            signTips[1].active = true;
        } else if (signCount === 5) {
            signTips[2].active = true;
        } else {
            signTips[3].active = true;
            var index = (signCount + 1) % 7;
            var data = signDatas[index];
            var item = BagItem.createItemWithString(data.reward);
            this.singTipsLabel.string = item.num;
        }
    },

    refreshRankStar() {
        var curStar = PlayerData.instance.rankStar;
        var rankData = PlayerData.instance.rankData;
        var stars = this.rankStarNode.children;
        var noStars = this.rankNoStarNode.children;
        var interval = 40 / rankData.levelUpStar + 5;
        for (let i = 0; i < stars.length; i++) {
            var isGet = curStar > rankData.star + i;
            var isShow = i < rankData.levelUpStar;
            if (stars[i]) {
                stars[i].opacity = isGet && isShow ? 255 : 0;
                if (rankData.levelUpStar === 1) {
                    stars[i].x = 0;
                    stars[i].y = 0;
                } else {
                    stars[i].x = i * interval * 2 - interval * (rankData.levelUpStar - 1);
                    if (stars[i].x === 0) {
                        stars[i].y = 0;
                    } else {
                        stars[i].y = (Math.abs(stars[i].x)) / 2 - 7.5;
                    }
                }
            }
            // console.log(stars[i].x, stars[i].y)
            if (noStars[i]) {
                noStars[i].opacity = isShow ? 255 : 0;
                noStars[i].x = stars[i].x;
                noStars[i].y = stars[i].y;
            }
        }
    },

    refreshWalletIcon: function (on) {
        this.nftWalletIcon.active = on
        this.nftWalletNode.getComponent(cc.Sprite).enable = !on
    },

    onPanelSignBtnClick: function () {
        this.activeGoldNode(false);
        this.activeDiamondNode(false);
        this.panelSign.active = true;
        this.panelSign.getComponent('PanelSign').init(this.world);
    },

    //点击钱包按钮
    onPanelWalletBtnClick: function () {
        //去链接钱包
        PlatformMgr.connectBitverse()
    },


    //点击NFT按钮
    onPanelNFTBtnClick: function (force) {
        if (force) {
            //强制开启
        } else {
            //自然点击按钮
            AdvertMgr.instance.fireBaseEvent("click_get_nft_skin_free_btn");
        }

        let self = this
        this.showPanelGetNFT(() => {
            self.activeGoldNode(false);
            self.activeDiamondNode(false);
        }, () => {
            self.activeGoldNode(true);
            self.activeDiamondNode(true);
        });

        // let self = this.world

        // var heroData = ConfigData.instance.getHeroSkinById(16);
        // var isGet = PlayerData.instance.isOwnHeroSkin(16);
        // //NFT测试，显示是否拥有
        // if (heroData.getWay == 100 && !isGet) {
        //     let own = PlatformMgr.nft_user_datas[heroData.goodsId] || 0
        //     if (own > 0) {
        //         console.log("购买后。同步到本地皮肤数据")
        //         PlayerData.instance.addHeroSkin(heroData.id);
        //         isGet = true
        //     }
        // }

        // //已经发送请求后直接显示第二个NFT
        // isGet = isGet || PlayerData.instance.nftLock_auto == 1

        // if (!isGet) {
        //     //没有领取过狗头皮肤,展示NFT第一界面
        //     this.showPanelGetNFT();
        // } else {
        //     //领取过狗头皮肤
        //     this.panelNFT.active = true;
        //     this.panelNFT.getComponent('PanelNFT').init(this.world, () => {
        //         self.uiMgr.activeGoldNode(true);
        //         self.uiMgr.activeDiamondNode(true);
        //     });
        //     AdvertMgr.instance.fireBaseEvent("nft_page_show", "page_id", "main");
        // }
    },

    onPanelDailyTaskBtnClick: function () {
        this.panelDailyTask.active = true;
        this.panelDailyTask.getComponent('PanelDailyTask').init(this.world);
        //准备页点击任务 按钮
        AdvertMgr.instance.fireBaseEvent("click_messions_btn");
    },


    onPanelInviteBtnClick: function () {
        this.panelInvite.active = true;
        this.panelInvite.getComponent('PanelInvite').init(this.world);
    },

    onPanelFriendBtnClick: function () {
        this.panelFriend.active = true;
        this.panelFriend.getComponent('PanelFriend').init(this.world);
    },


    onPanelVipBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_vip_btn");
        this.activeGoldNode(false);
        this.activeDiamondNode(false);
        this.panelSubscribe.active = true;
        let self = this
        this.panelSubscribe.getComponent('PanelSubscribe').init(this.world, () => {
            self.activeGoldNode(true);
            self.activeDiamondNode(true);
        });
    },

    showPanelMatch: function (players, callback) {
        this.panelMatch.active = true;
        this.panelMatch.getComponent('PanelMatch').cleanUp();
        this.panelMatch.getComponent('PanelMatch').init(players, callback);
    },

    closePanelMatch: function () {
        this.panelMatch.active = false;
    },


    refreshProperty: function (data, isHeroSkin) {
        this.panelProperty.getComponent('PanelProperty').refreshProperty(data, isHeroSkin);
    },


    onPanelGetSkinBtnClick: function () {
        //点击获取特殊武器按钮
        AdvertMgr.instance.fireBaseEvent("click_artifact_btn");
        const self = this;
        this.panelGetSkin.active = true;
        this.panelGetSkin.getComponent('PanelGetSkin').init(this.watchAdverSkinData, (success) => {
            //刷新任务
            self.refreshWatchAdverBtn();
            self.world.taskMgr.refreshTaskInHome();
            self.world.uiMgr.showTips(3)

        }, () => {
            self.world.uiMgr.showTips(4)
        });
    },

    onPanelCheatClick: function () {
        this.panelCheat.active = true;
    },

    showOfflineMultip: function (callback) {
        this.panelOfflineGold.getComponent('PanelOfflineGold').showMultipNode(callback);
    },

    onSettingBtnClick: function () {
        //点击设置按钮
        AdvertMgr.instance.fireBaseEvent("click_setting_btn");
        this.settingNode.active = !this.settingNode.active;
        if (!this.settingNode.active) {
            if (this.isSetLanguage) {
                cc.director.loadScene('Battle');
            }
        } else {
            this.onEditLanguage(null, LanguageMgr.curIndex, true)
        }
    },

    onEditLanguage: function (event, data, isInit = false) {
        var index = Number(data)
        LanguageMgr.setLang(index);
        for (let i = 0; i < this.selectLanguageNode.children.length; i++) {
            var node = this.selectLanguageNode.children[i]
            if (i === index) {
                node.children[0].active = true;
                node.children[1].active = false;
            } else {
                node.children[0].active = false;
                node.children[1].active = true;
            }
        }
        if (!isInit) this.isSetLanguage = true;
    },

    refreshOfflineGoldData: function () {
        this.panelOfflineGold.getComponent('PanelOfflineGold').refreshData();
    },

    showPanelRepay: function (callback) {
        this.panelRepay.active = true;
        this.panelRepay.getComponent('PanelRepay').init(callback, this.world);
    },

    showUnlockGrow: function (callback) {
        var comp = this.panelGrowUp.getComponent('PanelGrowUp')
        if (comp && comp.showCallFunc) {
            comp.showCallFunc(callback);
            comp.showCallFunc = null;
        } else {
            callback();
        }
    },

    showPanelAddTop: function (callback) {
        this.panelAddTop.active = true;
        this.panelAddTop.getComponent('PanelAddTop').init(this.world, callback);
    },

    showPanelInvite: function (callback) {
        this.panelInvite.active = true;
        this.panelInvite.getComponent('PanelInvite').init(this.world, callback);
    },

    showPanelDailyTask: function (callback) {
        this.panelDailyTask.active = true;
        this.panelDailyTask.getComponent('PanelDailyTask').init(this.world, callback);
    },


    showPanelNFT: function (callback) {
        // this.activeGoldNode(false);
        // this.activeDiamondNode(false);
        this.panelNFT.active = true;
        this.panelNFT.getComponent('PanelNFT').init(this.world, callback);
        // AdvertMgr.instance.fireBaseEvent("nft_page_show", "page_id", "main");
    },

    changeNFTBtnIcon: function () {
        // cc.loader.loadRes("texture/ui/player20", cc.SpriteFrame, (error, resource) => {
        //     if (error) {
        //         cc.error(error);
        //     } else if (resource) {
        //         this.nftSkinBtn.spriteFrame = resource
        //     }
        // })
        //钱包已经链接，更换按钮图标
        if (PlayerData.instance.nftLock_auto == 1 || PlayerData.instance.bitverseWallet != "") {
            this.nftWalletIcon.active = true
        }
    },

    showGetMoneyEffect: function (getGoldParam, offset = cc.v2(0, -200), activeGoldNode) {

        if (this.activeCount !== 0) return;
        if (activeGoldNode) {
            this.activeCount++;
            this.activeGoldNode(true);
        }
        var oldRankData = PlayerData.instance.oldRankData;
        var rankData = PlayerData.instance.rankData;
        var levelUp = oldRankData && rankData && oldRankData.id < rankData.id;

        var final = cc.v2(-195, 565 + GameData.instance.screenHeight / 2 - 640);

        var callback = () => {
            PlayerData.instance.showGold = PlayerData.instance.gold;
            this.update();
            if (activeGoldNode) {
                setTimeout(() => {
                    this.activeCount--;
                    this.activeGoldNode(false);
                }, 400);
            }
        }
        if (getGoldParam.isLucky) {
            this.goldAnim.onGetLucky(callback, offset, final);
            var multip = getGoldParam.multip;
            if (multip && !levelUp) {
                var extraGold = Math.ceil(getGoldParam.count * (multip - 1) / multip);
                var str = Tools.getStringByFormat(ConfigData.instance.getUITipStr(2), extraGold)
                this.showTips(str);
            }
        } else if (getGoldParam.isMore) {
            this.goldAnim.onGetMore(callback, offset, final);
            var multip = getGoldParam.multip;
            if (multip && !levelUp) {
                var extraGold = Math.ceil(getGoldParam.count * (multip - 1) / multip);
                var str = Tools.getStringByFormat(ConfigData.instance.getUITipStr(2), extraGold)
                this.showTips(str);
            }
        } else {
            this.goldAnim.onGetNormal(callback, offset, final);
        }

        //刷新成长属性金币数字颜色
        if (this.panelGrowUp) {
            var comp = this.panelGrowUp.getComponent('PanelGrowUp');
            comp.refreshShowData(comp.curType, false);
        }
    },


    activeGoldNode: function (active) {
        this.goldCountNode.active = active;
    },

    activeDiamondNode: function (active) {
        console.error("111", active)
        this.diamondCountNode.active = active;
    },

    activePhysicalNode: function (active) {
        this.physicalCountNode.active = active;
        this.nftModelBackNode.active = active
    },

    onPanelRechargeShopBtnClick: function () {
        this.panelRechargeShop.active = true;
        this.panelRechargeShop.getComponent('PanelShop').init(this.world, () => {
            AdvertMgr.instance.showBanner();
            console.log("showBanner onPanelRechargeShopBtnClick ")
        });
        AdvertMgr.instance.destoryBanner();
    },

    onAddTopBtnClick: function () {
        this.panelAddTop.active = true;
        this.panelAddTop.getComponent('PanelAddTop').init(this.world);
    },

    showActiveSuitEffect: function () {
        this.activeSuitAnim.play();
    },

    onPanelHolidayRankBtnClick: function () {
        if (this.panelHolidayRank) {
            this.panelHolidayRank.active = true;
            this.panelHolidayRank.getComponent('PanelHolidayRank').init(this.world);
            for (let i = 2; i < 4; i++) {
                var btn = this.userinfoBtns[i];
                if (btn) btn.show();
            }
        }
    },

    showPanelRewardDetail: function () {
        if (this.panelRewardDetail) {
            this.panelRewardDetail.active = true;
            this.panelRewardDetail.getComponent('PanelRewardDetail').init(this.world);
        }
    },


    showPanelPKReward: function (data, callback) {
        if (this.panelPKReward) {
            this.panelPKReward.active = true;
            this.panelPKReward.getComponent('PanelPkReward').init(data, callback, this.world);
        }
    },

    showPanelWorldReward: function (data, callback) {
        if (this.panelWorldReward) {
            this.panelWorldReward.active = true;
            this.panelWorldReward.getComponent('PanelWorldReward').init(data, callback, this.world);
        }
    },

    showPanelHolidayRank: function (isPK, callback) {
        if (this.panelHolidayRank) {
            this.panelHolidayRank.active = true;
            var comp = this.panelHolidayRank.getComponent('PanelHolidayRank')
            comp.init(this.world, isPK, callback);
            for (let i = 2; i < 4; i++) {
                var btn = this.userinfoBtns[i];
                if (btn) btn.show();
            }
        }
    },

    hidePanelHolidayUserinfoBtns: function () {
        for (let i = 2; i < 4; i++) {
            var btn = this.userinfoBtns[i];
            if (btn) btn.hide()
        }
    },

    onPanelPKNoticeBtnClick: function () {
        this.panelPKNotice.active = true;
    },

    showPanelSubscribeReward: function (callback) {
        this.panelSubscribeReward.active = true;
        this.panelSubscribeReward.getComponent('PanelSubscribeReward').init(this.world, callback);

    },

    showPanelSubscribe: function (callback) {
        this.activeGoldNode(false);
        this.activeDiamondNode(false);
        this.panelSubscribe.active = true;
        let self = this
        this.panelSubscribe.getComponent('PanelSubscribe').init(this.world, () => {
            self.activeGoldNode(true);
            self.activeDiamondNode(true);
            if (callback) {
                callback()
            }
        });
    },

    showSubscribeBtn: function () {
        if (this.vipBtnNode) {
            this.vipBtnNode.active = !PlayerData.instance.isSubscribe()
        }
    },

    showPanelPopUp: function (content, callback) {
        this.activeGoldNode(false);
        this.activeDiamondNode(false);
        this.panelPopUp.active = true;
        let self = this
        this.panelPopUp.getComponent('PanelPopUp').init(this.world, content, () => {
            self.activeGoldNode(true);
            self.activeDiamondNode(true);
            if (callback) {
                callback()
            }
        });
    },

    showPanelBuySkin: function (callback) {
        this.panelBuySkin.active = true;
        this.panelBuySkin.getComponent('PanelBuySkin').init(callback, this.world);
    },

    showPanelEvaulate: function (callback) {
        this.panelEvaulate.active = true;
        this.panelEvaulate.getComponent('PanelEvaulate').init(callback, this.world);
    },

    //手动恢复订阅，只支持ios
    //按钮也是一样只在ios平台打开
    onRestorePurchaseBtnClick() {
        var closeFunc = () => {
            this.noAdsBtn.active = !PlayerData.instance.getVipWithoutInterstitial();
            this.showTips(22);
        }
        PayMgr.instance.restoreProducts(closeFunc);
    },

    onNoADsBtnClick() {
        var closeFunc = (isSuccess) => {
            if (isSuccess) {
                PlayerData.instance.updateVipWithoutInterstitial()
                this.noAdsBtn.active = !PlayerData.instance.getVipWithoutInterstitial();
            }
        }

        var errorFunc = () => {
            this.showTips(23);
        }

        PayMgr.instance.payByIndex(100, closeFunc, errorFunc);
    },


    //点击体力购买按钮
    onBuyPhysicalBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_ranking_tili_btn");
        this.panelPhysicalShop.active = true;
        this.panelPhysicalShop.getComponent('panelPhysicalShop').init(this.world, () => {
            console.log("showBanner onBuyPhysicalBtnClick ")
        });
    },

    //点击NFT rank按钮切换到rank大赛模式大厅
    onBtnNftRankBtnClick: function () {
        PlayerData.instance.switchGameMode()
        this.activeGoldNode(false)
        this.activePhysicalNode(true)
        this.normalModelNode.active = false
        this.nftRankModelnode.active = this.nftModelBackNode.active = true
        this.rankNode.active = false

        //切换到rank大赛皮肤
        var heroData = ConfigData.instance.getHeroSkinById(PlayerData.instance.heroNFTSkinId);
        this.world.onEquipHeroSkin(heroData, true);

        var knifeData = ConfigData.instance.getKnifeSkinById(PlayerData.instance.knifeNFTSkinId);
        this.world.onEquipKnifeSkin(knifeData, true);
        this.world.changeLocalKnifesCount(knifeData.initKnifeCount);

        this.refreshRedDot()
    },

    //点击按钮返回到普通模式大厅
    onBtnBackToGCBtnClick: function () {
        PlayerData.instance.switchGameMode()
        this.activeGoldNode(true)
        this.activePhysicalNode(false)
        this.normalModelNode.active = true
        this.nftRankModelnode.active = this.nftModelBackNode.active = false
        this.rankNode.active = true

        //切换到rank大赛皮肤
        var heroData = ConfigData.instance.getHeroSkinById(PlayerData.instance.heroSkinId);
        this.world.onEquipHeroSkin(heroData, true);

        var knifeData = ConfigData.instance.getKnifeSkinById(PlayerData.instance.knifeSkinId);
        this.world.onEquipKnifeSkin(knifeData, true);
        this.world.changeLocalKnifesCount(knifeData.initKnifeCount);

        this.refreshRedDot()
    },

    checkNFTRankSetting: function () {
        console.log("checkNFTRankSetting ")
        if (this.world.localPlayer == null) {
            return
        }
        if (!PlayerData.instance.isInNFTRankGameMode()) {
            //切换普通模式皮肤
            // var heroData = ConfigData.instance.getHeroSkinById(PlayerData.instance.heroSkinId);
            // this.world.onEquipHeroSkin(heroData, true);

            // var knifeData = ConfigData.instance.getKnifeSkinById(PlayerData.instance.knifeSkinId);
            // this.world.onEquipKnifeSkin(knifeData, true);
            // this.world.changeLocalKnifesCount(knifeData.initKnifeCount);
        } else {
            //切换到rank大赛皮肤
            // var heroData = ConfigData.instance.getHeroSkinById(PlayerData.instance.heroNFTSkinId);
            // this.world.onEquipHeroSkin(heroData, true);

            // var knifeData = ConfigData.instance.getKnifeSkinById(PlayerData.instance.knifeNFTSkinId);
            // this.world.onEquipKnifeSkin(knifeData, true);
            // this.world.changeLocalKnifesCount(knifeData.initKnifeCount);
        }
    },


    onNFTRankBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_rankwindow_icon");
        let self = this
        this.showPanelNFTRank(() => {
            self.activeGoldNode(false);
            self.activeDiamondNode(false);

        }, (isCloseBtn) => {
            if (PlayerData.instance.currentBattleMode != BattleModeType.NFT_RANK) {
                self.activeGoldNode(true);
            }
            self.activeDiamondNode(true);
        });
    },

    //排行榜
    onRankNFTBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_ranking_ranking_btn");
        let self = this
        this.showPanelRankNFT(() => {
            self.activeGoldNode(false);
            self.activeDiamondNode(false);
            self.activePhysicalNode(false)
        }, () => {
            self.activeDiamondNode(true);
            self.activePhysicalNode(true)
        });

    },

    //点击社区按钮
    onClickDiscordBtn: function () {
        let url = "https://discord.com/invite/UXX5gbVm77"
        AdvertMgr.instance.webViewOpen(url)
        PlayerData.instance.receiveNFTOtherRewards(0)
    },

    //点击问卷按钮
    onClickFormBtn: function () {
        let url = "https://forms.gle/nPzyRnq8Y8SqUxgKA"
        AdvertMgr.instance.webViewOpen(url)
        PlayerData.instance.receiveNFTOtherRewards(1)
    },

    showPanelNFTRank: function (callback, closeCallback) {
        this.PanelNFTRank.active = true;
        this.PanelNFTRank.getComponent('PanelNFTRank').init(this.world, callback, closeCallback);
    },

    showPanelRankNFT: function (callback, closeCallback) {
        this.PanelRankNFT.active = true;
        this.PanelRankNFT.getComponent('PanelRankNFT').init(this.world, callback, closeCallback);
    },

    popNFTRank(closeCallback) {
        if (!PlatformMgr.open_nft_rank_moudle) {
            if (closeCallback) {
                closeCallback()
            }
            return
        }

        if (PlayerData.instance.isInNFTRankGameMode()) { //已经在大赛模式中
            if (closeCallback) {
                closeCallback()
            }
            return
        }

        if (!PlayerData.instance.isInSurplusTime()) {
            console.log("popNFTRank isInSurplusTime", PlatformMgr.surplusTime)
            if (closeCallback) {
                closeCallback()
            }
            return
        }

        if (PlayerData.instance.isFristGame() || PlayerData.instance.dayPlayCount == 0) {

        } else {
            AdvertMgr.instance.fireBaseEvent("page_show_rankwindow");
            let self = this
            this.showPanelNFTRank(() => {
                self.activeGoldNode(false);
                self.activeDiamondNode(false);

            }, (isCloseBtn) => {
                if (PlayerData.instance.currentBattleMode != BattleModeType.NFT_RANK) {
                    self.activeGoldNode(true);
                }
                self.activeDiamondNode(true);
                if (isCloseBtn) {
                    //如果是close按钮关闭的
                    if (closeCallback) {
                        closeCallback()
                    }
                }
            });

        }

    },

});