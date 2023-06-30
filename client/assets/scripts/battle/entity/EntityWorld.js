/**
 * @fileoverview 世界实体
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const GameData = require('GameData');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const CollisionEventManager = require('CollisionEventManager');
const KnifeState = require('Types').KnifeState;
const NoticeType = require('Types').NoticeType;
const SoundID = require('Types').SoundID;
const AudioEngine = require('AudioEngine');
const PlatformMgr = require('PlatformMgr');
const TaskType = require('Types').TaskType;
const ItemType = require('Types').ItemType;
const AdvertMgr = require('AdvertMgr');
const PayMgr = require('PayMgr');
const AddEntitySystem = require('AddEntitySystem');
const StageType = require('Types').StageType;
const CustomFunnelEvent = require('Types').CustomFunnelEvent;
const BattleModeType = require('Types').BattleModeType;

cc.Class({
    extends: cc.Component,

    properties: {
        followCameraCtrl: cc.Node,
        mapWidth: 0,
        mapHeight: 0,
        localPlayer: null,
        players: [],
        knifes: [],
        walls: [],
        addEntityNode: cc.Node,
        UIMgrNode: cc.Node,
        audioNode: cc.Node,
        poolMgr: cc.Node,
        tempNode: cc.Node,
        addBuffTime: 0,
        addBuffTimeLimit: 0,
        addBoxTime: 0,
        addBoxTimeLimit: 0,

        guideWall: cc.Node,

        isDoHeartbeat: true,
        _heartbeatSendTimestamp: 0,
        heartbeatInterval: 30000,

        m_alreadyStart: false,
    },

    onLoad() {
        AdvertMgr.instance.destoryBanner()

        this.isLoading = true;
        this.showGuideFlag = true;
        PlayerData.instance.checkDaySpan();
        PlayerData.instance.initConfigData();
        this.isGuide = PlayerData.instance.isGuide;
        this.m_alreadyStart = false;

        PlatformMgr.hawkeye_getConfig((settings) => {
            // if (GameData.instance.isShowLog()) {
            // console.log('settings:' + JSON.stringify(settings));
            // }
            // TODO 分享使用下发的图片和文字
            var shareSettings = settings ? settings : {};

            GameData.instance.isInReview = PlatformMgr.isIosApp() ?
                Number.parseInt(shareSettings.reviewVersion) === GameData.instance.clientVersionCode :
                Number.parseInt(shareSettings.reviewVersionAndroid) === GameData.instance.clientVersionCode;

            if (shareSettings.revive_Ways !== undefined) {
                ConfigData.instance.clientData.reviveWays = Tools.jsonToArray(shareSettings.revive_Ways);
            }
            if (shareSettings.multipGold_Ways !== undefined) {
                ConfigData.instance.clientData.multipGoldWays = Tools.jsonToArray(shareSettings.multipGold_Ways);
            }
            if (shareSettings.protectStar_Ways !== undefined) {
                ConfigData.instance.clientData.protectStarWays = Tools.jsonToArray(shareSettings.protectStar_Ways);
            }
            if (shareSettings.growLevelUp_Ways !== undefined) {
                var arr = Tools.jsonToArray(shareSettings.growLevelUp_Ways);
                for (let i = 0; i < arr.length; i++) {
                    var data = arr[i];
                    ConfigData.instance.clientData.growLevelUpWays[i] = Tools.splitToNumList(data, '-');
                }
                // ConfigData.instance.clientData.growLevelUpWays = shareSettings.growLevelUp_Ways;
            }

            if (shareSettings.adverTrySkinLimit !== undefined) {
                ConfigData.instance.clientData.adverTrySkinLimit = Tools.jsonToArray(shareSettings.adverTrySkinLimit);
            }
            if (shareSettings.adverReviveLimit !== undefined) {
                ConfigData.instance.clientData.adverReviveLimit = Tools.jsonToArray(shareSettings.adverReviveLimit);
            }

            if (shareSettings.stopAdverToShare !== undefined) {
                ConfigData.instance.clientData.stopAdverToShare = Number.parseInt(shareSettings.stopAdverToShare);
            }

            if (shareSettings.multipGoldLimit !== undefined) {
                ConfigData.instance.clientData.multipGoldLimit = Tools.jsonToArray(shareSettings.multipGoldLimit);
            }
            if (shareSettings.frenzyLimit !== undefined) {
                ConfigData.instance.clientData.frenzyLimit = Number.parseInt(shareSettings.frenzyLimit);
            }
            if (shareSettings.stagePrecents !== undefined) {
                ConfigData.instance.clientData.stagePrecents = Tools.jsonToArray(shareSettings.stagePrecents);
            }

            if (shareSettings.dayShowWayLimit !== undefined) {
                ConfigData.instance.clientData.dayShowWayLimit = Tools.jsonToArray(shareSettings.dayShowWayLimit);
            }
            if (shareSettings.share_random !== undefined) {
                shareSettings.share_random = Tools.jsonToArray(shareSettings.share_random);
            }
            if (shareSettings.share_data !== undefined) {
                shareSettings.share_data = Tools.jsonToArray(shareSettings.share_data);
            }

            if (shareSettings.dayMultAgainCDCount !== undefined) {
                ConfigData.instance.clientData.dayMultAgainCDCount = Number.parseInt(shareSettings.dayMultAgainCDCount);
                if (PlayerData.instance.updateDayMultAgainCDCountFlag) {
                    PlayerData.instance.updateDayMultAgainCDCountFlag = false;
                    PlayerData.instance.resetDayMultAgainCDCount(ConfigData.instance.clientData.dayMultAgainCDCount);
                }
            }
            if (shareSettings.dayMultAgainMinPlayCount !== undefined) {
                ConfigData.instance.clientData.dayMultAgainMinPlayCount = Number.parseInt(shareSettings.dayMultAgainMinPlayCount)
            }

            if (shareSettings.adverReviveFailToShare !== undefined) {
                ConfigData.instance.clientData.adverReviveFailToShare = Number.parseInt(shareSettings.adverReviveFailToShare)
            }

            if (shareSettings.hideTrySkin !== undefined) {
                ConfigData.instance.clientData.hideTrySkin = Number.parseInt(shareSettings.hideTrySkin);
            }

            if (shareSettings.hideAddTop !== undefined) {
                ConfigData.instance.clientData.hideAddTop = Number.parseInt(shareSettings.hideAddTop);
            }




            let tempHideSpecialSkin = true;
            if (shareSettings.hideSpecialSkin !== undefined) {
                tempHideSpecialSkin = Number.parseInt(shareSettings.hideSpecialSkin);
            }


            if (shareSettings.judgeArea !== undefined) {
                ConfigData.instance.clientData.judgeArea = Number.parseInt(shareSettings.judgeArea);
            }
            if (shareSettings.judgeAreaTimeInterval !== undefined) {
                ConfigData.instance.clientData.judgeAreaTimeInterval = shareSettings.judgeAreaTimeInterval;
            }
            var timeRange = Tools.splitToNumList(ConfigData.instance.clientData.judgeAreaTimeInterval)
            var curDay = PlayerData.instance.getCurWeekDay();
            if (GameData.instance.isShowLog()) {
                console.log('————————地域判断时间段配置：', JSON.stringify(timeRange));
                console.log('————————当前周几：', curDay);
            }

            if (ConfigData.instance.clientData.judgeArea && GameData.instance.isEnvironmentPublish() && Tools.arrContains(timeRange, curDay) && (!tempHideSpecialSkin)) {
                PlatformMgr.getAreaInfo((data) => {
                    if (data.city) {
                        switch (data.city) {
                            case '北京市':
                            case '上海市':
                            case '广州市':
                            case '深圳市':
                                tempHideSpecialSkin = true;
                                break;
                        }
                    } else if (data.province) {
                        switch (data.province) {
                            case '北京市':
                            case '上海市':
                            case '广东省':
                                tempHideSpecialSkin = true;
                                break;
                        }
                    }
                    ConfigData.instance.clientData.hideSpecialSkin = tempHideSpecialSkin;
                });
            } else {
                ConfigData.instance.clientData.hideSpecialSkin = tempHideSpecialSkin;
            }

            //分享积分相关
            if (shareSettings.shareScoreConfig !== undefined) {
                var arr = Tools.splitToNumList(shareSettings.shareScoreConfig);
                if (GameData.instance.isShowLog()) {
                    console.log('————————分享积分配置：', JSON.stringify(arr));
                }
                ConfigData.instance.clientData.defaultShareScore = arr[0];
                ConfigData.instance.clientData.secondDayMinShareScore = arr[1];
                ConfigData.instance.clientData.maxShareScore = arr[2];
            }

            if (!PlayerData.instance.dayRefreshShareScore) {
                PlatformMgr.getShareScore((shareScore) => {
                    var defaultShareScore = ConfigData.instance.clientData.defaultShareScore;
                    var secondDayMinShareScore = ConfigData.instance.clientData.secondDayMinShareScore;
                    var maxShareScore = ConfigData.instance.clientData.maxShareScore;

                    if (PlayerData.instance.isFirstDay()) {
                        shareScore = defaultShareScore;
                        if (GameData.instance.isShowLog()) {
                            console.log('————————新玩家，初始分享积分：', shareScore);
                        }
                    } else {
                        if (shareScore < secondDayMinShareScore && PlayerData.instance.isSecondDay()) {
                            shareScore = secondDayMinShareScore;
                            if (GameData.instance.isShowLog()) {
                                console.log('————————新玩家第二天，启用保底分享积分：', shareScore);
                            }
                        } else {
                            shareScore = Math.min(shareScore, maxShareScore);
                            if (GameData.instance.isShowLog()) {
                                console.log('————————使用上一天分享积分：', shareScore);
                            }
                        }
                    }
                    PlayerData.instance.updateDayRefreshShareScore(shareScore)
                })
            }
        });


        this.mapWidth = GameData.instance.mapWidth;
        this.mapHeight = GameData.instance.mapHeight;
        this.initMapParam();

        this.gameTime = GameData.instance.gameTime;

        this.width = GameData.instance.screenWidth;
        this.height = GameData.instance.screenHeight;
        this.worldRect = new cc.rect(-this.width / 2, -this.height / 2, this.width, this.height);

        var _poolMgr = this.poolMgr.getComponent('PoolMgr');
        _poolMgr.cleanUp();
        _poolMgr.init();



        this.addEntitySys = Tools.getOrAddComponent(this.addEntityNode, 'AddEntitySystem');
        this.addEntitySys.cleanUp();
        this.addEntitySys.init(this.mapWidth, this.mapHeight, _poolMgr, this.mapType);

        AddEntitySystem.init(this.addEntitySys);

        this.cleanUp();

        this.uiMgr = Tools.getOrAddComponent(this.UIMgrNode, 'UIMgr');
        this.uiMgr.init(this);
        this.uiMgr.cleanUp();
        AdvertMgr.instance.setUiMgr(this.uiMgr);
        PayMgr.instance.setUiMgr(this.uiMgr);
        PlatformMgr.getInviteInfo((datas) => {
            PlayerData.instance.inviteDatas = datas;
            this.uiMgr.refreshRedDot();
        })


        this.taskMgr = Tools.getOrAddComponent(this.node, 'TaskMgr');
        this.taskMgr.init(this);

        const audio = Tools.getOrAddComponent(this.audioNode, 'AudioEngine');
        audio.init();


        const map = this.addEntitySys.addMap(this.mapType, this.mapWidth, this.mapHeight);

        this.localPlayer = this.addEntitySys.AddLocalPlayer();
        console.error("localPlayer 实例化")
        this.players[0] = this.localPlayer;
        this.uiMgr.addPlayerRankItem(this.localPlayer);
        this.localPlayer.setKillCallback(() => {
            PlayerData.instance.killCount++;
            this.taskMgr.refreshTaskInGame();
        })
        this.localPlayer.setChangeKnifeCountCallback((num) => {
            console.log("初始化飞刀数量", num)
            this.addLocalPlayerKnifes(num)
        })
        this.curEquipHeroSkin = null;
        this.curEquipKnifeSkin = null;

        this.cameraZoomCtrl = this.followCameraCtrl.getComponent('CameraZoomCtrl');
        this.cameraZoomCtrl.cleanUp();
        var followCameraCtrlCmp = this.followCameraCtrl.getComponent('FollowCameraCtrl');
        followCameraCtrlCmp.cleanUp();

        CollisionEventManager.getInstance().init();
        this.heroCollisionHandleSystem = Tools.getOrAddComponent(this.node, 'HeroCollisionHandleSystem');
        this.knifeCollisionHandleSystem = Tools.getOrAddComponent(this.node, 'KnifeCollisionHandleSystem');
        this.pickKnifeCollisionHandleSystem = Tools.getOrAddComponent(this.node, 'PickKnifeCollisionHandleSystem');
        this.pickBuffCollisionHandleSystem = Tools.getOrAddComponent(this.node, 'PickBuffCollisionHandleSystem');
        this.attackBoxCollisionHandleSystem = Tools.getOrAddComponent(this.node, 'AttackBoxCollisionHandleSystem');

        this.killMsgListener = Tools.getOrAddComponent(this.node, 'KillMsgListener');
        this.killMsgListener.cleanUp();

        const cameraZoomSys = Tools.getOrAddComponent(this.node, 'CameraZoomSystem');
        cameraZoomSys.init(this.localPlayer, this.cameraZoomCtrl);

        this.playerRankSystem = Tools.getOrAddComponent(this.node, 'PlayerRankSystem');
        this.playerRankSystem.cleanUp();
        this.gameRuleSystem = Tools.getOrAddComponent(this.node, 'GameRuleSystem');
        this.gameRuleSystem.cleanUp();
        this.heroReviveSystem = Tools.getOrAddComponent(this.node, 'HeroReviveSystem');
        this.heroReviveSystem.cleanUp();

        this.playerDistanceSystem = Tools.getOrAddComponent(this.node, 'PlayerDistanceSystem');
        this.playerDistanceSystem.cleanUp();
        this.wallRuleSystem = Tools.getOrAddComponent(this.node, 'WallRuleSystem');


        this.node.on('throwKnife', this.throwKnife, this);
        this.node.on('dodgeKnife', this.dodgeKnife, this);
        this.node.on('destroyDefenceKnife', this.destroyDefenceKnife, this);
        this.node.on('onBoxDestroy', this.onBoxDestroy, this);
        this.node.on('onNeZhaAttack', this.onNeZhaAttack, this);

        this.checkEnemyTime = 0;
        this.checkKnifeTime = 0;
        this.checkBlockTime = 0;
        this.checkDefenceTime = 0;
        this.addKnifeTime = 0;

        GameData.instance.logUseTime('entityWorld.onload');
        if (PlayerData.instance.isFristGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.World_Init);
        }

        if (this.isGuide) {
            this.guideLoad();
        } else {
            this.normalLoad();
        }
        this.startLoadPrefab();
        if (PlayerData.instance.isFristGame()) {
            this.onStartBtnClick(null, null);
        } else {
            this.refreshPanel();
        }

        // this.uiMgr.showPanelWorldReward({
        //     rank: 3,
        //     round: 1,
        //     joinTime: '5asss试试s0是03',
        // });
    },

    cleanUp: function () {
        this.players = [];
        this.knifes = [];
        this.removeKnifes = [];
        this.walls = [];
    },

    guideLoad: function () {
        // this.mapWidth = 720;
        // this.mapHeight = 1280;
        // 创建ai玩家
        const remotePlayers = this.addEntitySys.AddRemotePlayer(3, 1, 1, 1);
        var index = 1;
        var player = null;
        var knife = null;
        var knifeMax = 100;
        for (player of remotePlayers) {
            this.players[index] = player;
            // this.uiMgr.addPlayerRankItem(player);
            // this.uiMgr.addHeroPosArr(this.localPlayer, player, this.cameraZoomCtrl.camera);
            player.node.active = false;
            player.followPlayer.node.active = false;

            index++;
        }

        index = 0;
        // 创建本地玩家的刀
        var count = PlayerData.instance.knifeSkin.initKnifeCount;
        this.localPlayerKnifes = this.addEntitySys.AddKnife(count, true);
        for (knife of this.localPlayerKnifes) {
            this.knifes[index] = knife;
            var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
            knifeInit.init(this.localPlayer);
            index++;
            knifeMax--;
        }


        // 给ai加上默认刀
        var aiPlayerKnifes = null;
        var count = 2;
        for (player of remotePlayers) {
            aiPlayerKnifes = this.addEntitySys.AddKnife(count, true);
            count = 20;
            for (knife of aiPlayerKnifes) {
                this.knifes[index] = knife;
                var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
                knifeInit.init(player);
                index++;
                knifeMax--;
            }
        }

        //创建场景里的刀
        this.closeKnifes = [];
        this.landKnifes = this.addEntitySys.AddKnife(10, true);
        for (knife of this.landKnifes) {
            this.knifes[index] = knife;
            knife.node.active = false;
            index++;
            knifeMax--;
        }


        this.guideSystem = Tools.getOrAddComponent(this.node, 'GuideSystem');
        this.guideSystem.init(this);
        this.isLoading = false;
    },


    normalLoad: function () {
        GameData.instance.logUseTime('start world load');
        var rankData = PlayerData.instance.rankData;

        if (GameData.instance.isShowLog()) {
            console.log('level:' + rankData.name + ' playerCount: ' + rankData.playerCount);
        }
        if (PlayerData.instance.isInNFTRankGameMode()) {
            //难度从100星开始，Legend1开始
            rankData = ConfigData.instance.getRankDataByStar(PlayerData.instance.getNFTRankStar())
            PlayerData.instance.lastNormalLoadIsNFT = true
        } else {
            PlayerData.instance.lastNormalLoadIsNFT = false
        }

        // 创建ai玩家
        const remotePlayers = this.addEntitySys.AddRemotePlayer(rankData.playerCount - 1, rankData.aiSkinMax, rankData.aiHeroSkinRandomCount, rankData.aiHeroSkinMax);

        var index = 1;
        var player = null;
        var knife = null;
        var knifeMax = 60;
        for (player of remotePlayers) {
            this.players[index] = player;
            this.uiMgr.addPlayerRankItem(player);
            this.uiMgr.addHeroPosArr(this.localPlayer, player, this.cameraZoomCtrl.camera);
            player.setDeadCallback((pos) => {
                this.addDeadKnifes(pos);
            })
            index++;
        }

        index = 0;
        // 创建本地玩家的刀
        var count = 2
        if (PlayerData.instance.isInNFTRankGameMode()) {
            let knifeSkinData = ConfigData.instance.getKnifeSkinById(PlayerData.instance.knifeNFTSkinId);
            count = knifeSkinData.initKnifeCount + PlayerData.instance.extraKnifeCount;
        } else {
            count = PlayerData.instance.knifeSkin.initKnifeCount + PlayerData.instance.extraKnifeCount;
        }
        this.localPlayerKnifes = this.addEntitySys.AddKnife(count);
        for (knife of this.localPlayerKnifes) {
            this.knifes[index] = knife;
            var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
            knifeInit.init(this.localPlayer);
            index++;
            knifeMax--;
        }


        // 给ai加上默认刀
        var aiPlayerKnifes = null;
        for (player of remotePlayers) {
            var count = player.skin.initKnifeCount;
            aiPlayerKnifes = this.addEntitySys.AddKnife(count);
            for (knife of aiPlayerKnifes) {
                this.knifes[index] = knife;
                var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
                knifeInit.init(player);
                index++;
                knifeMax--;
            }
        }

        //创建场景里的刀
        this.closeKnifes = [];
        this.landKnifes = this.addEntitySys.AddKnife(knifeMax);
        for (knife of this.landKnifes) {
            this.knifes[index] = knife;
            knife.node.active = false;
            index++;
            knifeMax--;
        }

        // //创建场景里的buff
        // this.buffs = this.addEntitySys.AddBuff(20);

        this.walls = this.addEntitySys.AddWall(this.mapType);


        this.blocks = this.addEntitySys.AddBlock(rankData.blockNum);

        //初始化buff创建条件
        this.initAddBuffParam();
        this.initAddBoxParam();

        GameData.instance.logUseTime('end world load');
        // if (PlayerData.instance.isFristGame()) {
        //     PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.World_Finish);
        // }
        // PlatformMgr.reportAnalytics();
        this.isLoading = false;
        if (this.touchStartGame) this.onStartBtnClick(null, null);
    },

    refreshPanel: function () {
        const self = this;
        var oldRankData = PlayerData.instance.oldRankData;
        var rankData = PlayerData.instance.rankData;
        var daySign = PlayerData.instance.daySign;

        var showPanelSignFlag = PlayerData.instance.showPanelSignFlag;
        var levelUp = oldRankData && rankData && oldRankData.id < rankData.id;

        var offlineFlag = PlayerData.instance.offlineFlag;
        var offlineGoldTime = PlayerData.instance.getReceiveOfflineGoldTime();
        var offlineGoldMultipLimit = ConfigData.instance.clientData.offlineGoldMultipLimit * 1000;
        var goldStage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.multipGoldLimit);

        var hideAddTop = ConfigData.instance.clientData.hideAddTop;

        // ConfigData.instance.getReceiveWay
        var hasRepay = PlayerData.instance.hasRepay;
        var repayData = null;
        if (!hasRepay) {
            repayData = ConfigData.instance.getRepayDataByRank(PlayerData.instance.rankData.id);

            if (!repayData.reward) {
                PlayerData.instance.updateRepay();
            }
        }


        var doLevelUp = (callback) => {
            self.uiMgr.showPanelLevelUp(callback);
            PlayerData.instance.oldRankData = null;
        }

        var doBuySkin = (callback) => {
            self.uiMgr.showPanelBuySkin(callback);
        }

        var doSign = (callback) => {
            self.uiMgr.showPanelSign(callback);
        }
        var doTask = (callback) => {
            self.taskMgr.refreshTaskInHome(callback);
        }
        var doOffline = (callback) => {
            self.uiMgr.showOfflineMultip(callback);
        }

        var doRepay = (callback) => {
            self.uiMgr.showPanelRepay(callback);
        }

        var doUnlockGrow = (callback) => {
            self.uiMgr.showUnlockGrow(callback);
        }

        var doAddTop = (callback) => {
            self.uiMgr.showPanelAddTop(callback);
            PlayerData.instance.updateDayShowTop();
        }

        var doDailyTask = (callback) => {
            self.uiMgr.showPanelDailyTask(callback);
        }

        var doSubscribe = (callback) => {
            self.uiMgr.showPanelSubscribe(callback);
        }

        var doSubscribeReward = (callback) => {
            self.uiMgr.showPanelSubscribeReward(callback);
        }

        var doEvaulate = (callback) => {
            self.uiMgr.showPanelEvaulate(callback);
        }

        var doDance = () => {
            self.uiMgr.showWatchAdverCount();
        }

        var func12 = () => {
            if (PlayerData.instance.canShowPanelEvaulate()) {
                doEvaulate(() => {
                    doDance()
                    // self.uiMgr.popGetNFT()
                    // self.uiMgr.popNFTRank()


                })
            } else {
                doDance()
                // self.uiMgr.popGetNFT();
                // self.uiMgr.popNFTRank();
            }
        }

        var func11 = () => {
            if (PlayerData.instance.canShowPanelBuySkin()) {
                doBuySkin(func12);
            } else {
                func12()
            }
        }

        var func10 = () => {
            // if (false) {
            if (PlayerData.instance.isSubscribe() && !PlayerData.instance.daySubscribeReward) {
                doSubscribeReward(func11)
            } else {
                func11();
            }
            // func11();
        }


        var func9 = () => {
            //不强弹订阅界面了
            // if (!PlayerData.instance.isSubscribe() && !PlayerData.instance.showSubscribeFlag) {
            //     doSubscribe(func10)
            //     PlayerData.instance.showSubscribeFlag = true;
            // } else {
            //     func10();
            // }
            func10();
        }


        var func8 = () => {
            if (false) { //if (PlayerData.instance.canShowPanelHolidayRank()) {
                this.uiMgr.showPanelHolidayRank(true, func9);
            } else {
                func9();
            }
        };

        //打开签到
        var func7 = () => {
            if (!daySign && !showPanelSignFlag && goldStage !== StageType.Share && PlayerData.instance.canShowPanelSign()) {
                doSign(func8);
                PlayerData.instance.showPanelSignFlag = true;
            } else {
                func8();
            }
        }

        //打开每日任务
        var func6 = () => {
            if (!GameData.instance.isInReview && !ConfigData.instance.clientData.hideSpecialSkin && PlayerData.instance.canShowPanelDailyTask()) {
                doDailyTask(func7)
            } else {
                func7()
            }
        }


        var func5 = () => {
            if (!hideAddTop && PlayerData.instance.canShowPanelAddTop() && !GameData.instance.isInReview && !PlatformMgr.isIOS()) {
                doAddTop(func6)
            } else {
                func6()
            }
        }

        var func4 = () => {
            doUnlockGrow(func5);
        }


        var func3 = () => {
            if (!hasRepay && repayData && repayData.reward) {
                doRepay(func4);
            } else {
                func4();
            }
        }

        var func2 = () => {
            // if (offlineGoldTime >= offlineGoldMultipLimit && !offlineFlag && goldStage !== StageType.Share) {
            if (false) {
                PlayerData.instance.offlineFlag = true;
                doOffline(func3);
            } else {
                func3();
            }
        }

        var func1 = () => {
            doTask(func2);
        }

        var func0 = () => {
            console.log("func0")
            // if (!PlayerData.instance.dayRefreshWorldReward && Tools.isAfterCheckTime(PlayerData.instance.getCurTime())) {
            if (false) {
                PlatformMgr.getHolidayWorldReward((data) => {
                    if (data) {
                        this.uiMgr.showPanelWorldReward(data, func1);
                    } else {
                        func1()
                    }
                });
            } else {
                func1();
            }
        }

        var func = () => {
            // if (!PlayerData.instance.dayRefreshPKReward && Tools.isAfterCheckTime(PlayerData.instance.getCurTime())) {
            // if (false) {
            //     PlayerData.instance.updateWorldRewardDetail()
            //     PlatformMgr.getHolidayPKReward((data) => {
            //         if (data) {
            //             this.uiMgr.showPanelPKReward(data, func0)
            //         } else {
            //             func0()
            //         }
            //     })
            // } else {
            //     func0()
            // }

            if (PlatformMgr.open_nft_rank_moudle) {
                if (PlayerData.instance.isInNFTRankGameMode()) {
                    return
                }
                console.log("dayOpenAppCount", PlayerData.instance.dayOpenAppCount)
                if (PlayerData.instance.dayOpenAppCount <= 3) {
                    setTimeout(() => {
                        self.uiMgr.popNFTRank(func0);
                    }, 1500);
                }
            } else {
                func0();
            }
        }

        if (levelUp) {
            doLevelUp(func)
        } else {
            func();
        }

    },

    startLoadPrefab: function () {
        // GameData.instance.logUseTime('start prefab load');
        this.uiMgr.startLoadPrefab();
    },

    onStartBtnClick: function (event, data) {
        if (data && data == "1") {
            //通过按钮点击的，记录为点击开始事件
            //游戏开始（包括用户点击play按钮和点击角色游戏开始）
            // AdvertMgr.instance.fireBaseEvent("game_start");
            AdvertMgr.instance.fireBaseEvent("game_start", "hero", PlayerData.instance.heroSkin.name, "weapon", PlayerData.instance.knifeSkin.name);
        }
        const self = this;
        if (this.isLoading) {
            this.touchStartGame = true;
            return;
        }

        if (this.m_alreadyStart) {
            return;
        }
        
        
        if (!PlayerData.instance.canStartRank()) {
            this.uiMgr.showTips('Out of game energy, click top-left to refill or wait until the next day to regain.');
            return
        }

        
        this.m_alreadyStart = true;

        this.uiMgr.hideUserInfoBtn();

        if (PlayerData.instance.isSecGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.GameTwo);
        }

        AdvertMgr.instance.destoryBanner();

        var playCount = PlayerData.instance.playCount;
        if (playCount !== 0 && playCount <= ConfigData.instance.clientData.bornFrenzyLimit) {
            self.localPlayer.canAddBornFrenzy = true;
        }


        if (this.isGuide) {
            this.onStart();
        }

        if (PlayerData.instance.isInNFTRankGameMode()) {
            PlayerData.instance.startRank()
        }
        else{
            //首局不弹出
            if (PlayerData.instance.dayPlayCount === 0) {
                this.onLoadMatch();
                return;
            }

            //新手阶段不弹出
            var stage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.adverReviveLimit);
            if (stage === StageType.Free) {
                this.onLoadMatch();
                return;
            }
        }
        //试用暴走
        // var canTryFrenzy = false;
        // if (PlayerData.instance.continuityLoseCount >= 2 && (PlayerData.instance.rankData.id >= ConfigData.instance.clientData.frenzyLimit)) {
        //     PlayerData.instance.updateContinuityLoseCount();
        //     canTryFrenzy = true;
        // }

        // if (canTryFrenzy) {
        //     this.uiMgr.showPanelTryFrenzy((success) => {
        //         if (success) {
        //             self.localPlayer.canFrenzyBorn = true;
        //         }
        //         self.onLoadMatch();
        //     })
        //     //可以试用暴走则不弹出试用皮肤
        //     return;
        // }

        //--------------------------------------------------------------//
        if (PlayerData.instance.isInNFTRankGameMode()) {
            if (PlayerData.instance.lastNormalLoadIsNFT) {
            } else {
                console.log("切换到NFT难度，重新加载战斗场景")
                this.restartGame()
                // this.normalLoad()
            }
        }
        else{
            if (PlayerData.instance.lastNormalLoadIsNFT) {
                console.log("切换到普通难度，重新加载战斗场景")
                this.restartGame()
                // this.normalLoad()
            } else {
            }
        }
        //--------------------------------------------------------------//



        //试用套装
        var clientData = ConfigData.instance.clientData;
        var trySkinData = PlayerData.instance.getTrySkinData();
        //后台配置的开关
        if (!clientData.hideTrySkin && !GameData.instance.isInReview && !PlayerData.instance.isInNFTRankGameMode()) {
            //大于试用皮肤的最低游戏局数
            if (PlayerData.instance.playCount >= clientData.trySkinMinPlayCount) {
                var curCount = PlayerData.instance.dayPlayCount;
                //大于上次试用皮肤的指定间隔局数
                var interval = Tools.getItemOrFinalItem(clientData.trySkinTimeInterval, trySkinData.trySkinCount);
                var canTry = (curCount - trySkinData.lastTryPlayCount) >= interval;

                //或者连败两次
                var canTry2 = false;
                if (PlayerData.instance.continuityLoseCount >= 2) {
                    canTry2 = true;
                }

                if (canTry || canTry2) {
                    var data = ConfigData.instance.getRandomTrySuitData(PlayerData.instance);
                    //有符合条件的可试用皮肤
                    PlayerData.instance.updateContinuityLoseCount();
                    PlayerData.instance.setTrySkinData(trySkinData);
                    if (data) {
                        var playerParent = self.localPlayer.node.parent;
                        var followPlayerParent = self.localPlayer.followPlayer.node.parent;
                        var hData, kData;
                        this.uiMgr.showPanelTrySuit(data, (heroData, knifeData) => {
                            this.uiMgr.activeGoldNode(false);
                            this.uiMgr.activeDiamondNode(false);
                            this.uiMgr.activePhysicalNode(false)
                            hData = heroData;
                            kData = knifeData;
                            PlayerData.instance.addExtraKnife(6);

                            self.onEquipHeroSkin(heroData, false);
                            self.onEquipKnifeSkin(knifeData, false);
                            self.changeLocalKnifesCount(knifeData.initKnifeCount);

                            var rate = 0;
                            if (self.localPlayerKnifes.length > 20) {
                                rate = 1
                            } else if (self.localPlayerKnifes.length > 9) {
                                rate = (self.localPlayerKnifes.length - 9) / 13;
                            }

                            self.localPlayer.followPlayer.node.group = 'ui';
                            self.localPlayer.followPlayer.node.parent = this.tempNode;
                            self.localPlayer.followPlayer.followPlayerScale.changeScaleMultip(1 - (rate * 0.45));

                            self.localPlayer.node.group = 'ui';
                            self.localPlayer.node.parent = this.tempNode;
                            self.localPlayer.heroScale.changeScaleMultip(1 - (rate * 0.45));

                            self.localPlayer.node.y += 130;
                        }, (success) => {
                            this.uiMgr.activeGoldNode(true);
                            this.uiMgr.activeDiamondNode(true);
                            this.uiMgr.activePhysicalNode(true);
                            if (!success) {
                                PlayerData.instance.addExtraKnife(-6);
                                self.onEquipHeroSkin(PlayerData.instance.heroSkin, true);
                                self.onEquipKnifeSkin(PlayerData.instance.knifeSkin, true);
                                self.changeLocalKnifesCount(PlayerData.instance.knifeSkin.initKnifeCount);
                            } else {
                                self.onEquipHeroSkin(hData, false);
                                self.onEquipKnifeSkin(kData, false);
                                self.changeLocalKnifesCount(kData.initKnifeCount);
                                self.uiMgr.showActiveSuitEffect();
                            }


                            self.localPlayer.node.group = 'default';
                            self.localPlayer.node.parent = playerParent;
                            self.localPlayer.heroScale.changeScaleMultip(1);

                            self.localPlayer.node.y = 0;
                            self.localPlayer.followPlayer.node.group = 'heroWall';
                            self.localPlayer.followPlayer.node.parent = followPlayerParent;
                            self.localPlayer.followPlayer.followPlayerScale.changeScaleMultip(1);
                            self.onLoadMatch();
                        });
                        return true;
                    }
                }
            }
        }

        //试用皮肤
        //后台配置的开关
        if (!clientData.hideTrySkin && !GameData.instance.isInReview && !PlayerData.instance.isInNFTRankGameMode()) {
            //大于试用皮肤的最低游戏局数
            if (PlayerData.instance.playCount >= clientData.trySkinMinPlayCount) {
                var curCount = PlayerData.instance.dayPlayCount;
                //大于上次试用皮肤的指定间隔局数
                var interval = Tools.getItemOrFinalItem(clientData.trySkinTimeInterval, trySkinData.trySkinCount);
                var canTry = (curCount - trySkinData.lastTryPlayCount) >= interval;
                if (canTry) {
                    //有符合条件的可试用皮肤
                    var data = {};
                    var isHeroSkin = false;
                    if (trySkinData.lastTrySkinType === ItemType.HERO_SKIN) {
                        data = ConfigData.instance.getRandomTryKnifeSkinData(PlayerData.instance.ownKnifeSkins, clientData.tryKnifeSkinMinQuality);
                        trySkinData.lastTrySkinType = ItemType.KNIFE_SKIN;
                        isHeroSkin = false;
                    } else {
                        data = ConfigData.instance.getRandomTryHeroSkinData(PlayerData.instance.ownHeroSkins, clientData.tryHeroSkinMinQuality);
                        trySkinData.lastTrySkinType = ItemType.HERO_SKIN;
                        isHeroSkin = true;
                    }
                    PlayerData.instance.setTrySkinData(trySkinData);
                    if (data) {

                        var playerParent = self.localPlayer.node.parent;
                        var followPlayerParent = self.localPlayer.followPlayer.node.parent;
                        this.uiMgr.showPanelTryOut(data, () => {
                            this.uiMgr.activeGoldNode(false);
                            this.uiMgr.activeDiamondNode(false);
                            this.uiMgr.activePhysicalNode(false);
                            PlayerData.instance.addExtraKnife(6);
                            if (isHeroSkin) {
                                self.onEquipHeroSkin(data, false);
                                self.changeLocalKnifesCount(PlayerData.instance.knifeSkin.initKnifeCount);
                            } else {
                                self.onEquipKnifeSkin(data, false);
                            }
                            var rate = 0;
                            if (self.localPlayerKnifes.length > 20) {
                                rate = 1
                            } else if (self.localPlayerKnifes.length > 9) {
                                rate = (self.localPlayerKnifes.length - 9) / 13;
                            }

                            self.localPlayer.followPlayer.node.group = 'ui';
                            self.localPlayer.followPlayer.node.parent = this.tempNode;
                            self.localPlayer.followPlayer.followPlayerScale.changeScaleMultip(1 - (rate * 0.45));
                            if (isHeroSkin) {
                                self.localPlayer.node.group = 'ui';
                                self.localPlayer.node.parent = this.tempNode;
                                self.localPlayer.heroScale.changeScaleMultip(1 - (rate * 0.45));
                            }
                            self.localPlayer.node.y += 130;
                        }, (success) => {
                            this.uiMgr.activeGoldNode(true);
                            this.uiMgr.activeDiamondNode(true);
                            this.uiMgr.activePhysicalNode(true);
                            if (!success) {
                                PlayerData.instance.addExtraKnife(-6);
                                if (isHeroSkin) {
                                    self.onEquipHeroSkin(PlayerData.instance.heroSkin, true);
                                    self.changeLocalKnifesCount(PlayerData.instance.knifeSkin.initKnifeCount);
                                } else {
                                    self.onEquipKnifeSkin(PlayerData.instance.knifeSkin, true);
                                }
                            } else {
                                if (isHeroSkin) {
                                    self.onEquipHeroSkin(data, false);
                                    self.changeLocalKnifesCount(PlayerData.instance.knifeSkin.initKnifeCount);
                                } else {
                                    self.onEquipKnifeSkin(data, false);
                                }
                                var str = Tools.getStringByFormat(ConfigData.instance.getUITipStr(9), data.name)
                                self.uiMgr.showTips(str);
                            }

                            if (isHeroSkin) {
                                self.localPlayer.node.group = 'default';
                                self.localPlayer.node.parent = playerParent;
                                self.localPlayer.heroScale.changeScaleMultip(1);
                            }
                            self.localPlayer.node.y = 0;
                            self.localPlayer.followPlayer.node.group = 'heroWall';
                            self.localPlayer.followPlayer.node.parent = followPlayerParent;
                            self.localPlayer.followPlayer.followPlayerScale.changeScaleMultip(1);
                            self.onLoadMatch();
                        });
                        return true;
                    }
                }
            }
        }


        this.onLoadMatch();
    },

    //匹配界面
    onLoadMatch: function () {
        if (PlayerData.instance.isFristGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.UI_Match);
        }
        const self = this;
        this.uiMgr.showPanelMatch(this.players, () => {
            self.onStart();
        })
    },

    //开始游戏
    onStart: function () {
        var followCameraCtrlCmp = this.followCameraCtrl.getComponent('FollowCameraCtrl');
        followCameraCtrlCmp.init(this.localPlayer.node, new cc.Rect(-this.mapWidth / 2, -this.mapHeight / 2, this.mapWidth, this.mapHeight));
        this.localPlayer.myCamera = followCameraCtrlCmp;
        CollisionEventManager.getInstance().clear();
        this.uiMgr.closePanelMatch();
        this.uiMgr.startGame();
        this.uiMgr.startCountDown(GameData.instance.gameTime);
        // 初始化玩家移动
        for (var player of this.players) {
            player.startGame(this.isGuide);
            player.setLocalHero(this.localPlayer);
        }

        for (var knife of this.landKnifes) {
            knife.node.active = true;
        }

        this.killMsgListener.init(this.players, this.uiMgr);
        const self = this;
        var callF = function () {
            if (self.localPlayer._defenceTips) {
                self.localPlayer._defenceTips.active = false;
            }

            self.playerRankSystem.updateGameLogic();
            // 本局战斗结束  目前处理是弹出再来一局按钮
            var func = () => {

                self.startGame = false;
                self.localPlayer.stopControl();

                if (PlayerData.instance.isInNFTRankGameMode()) {
                    self.uiMgr.openNFTGameOverPanel();
                } else {
                    //在展示购买皮肤面板前如果获得了其他皮肤，则本轮不展示
                    PlayerData.instance.showPanelBuySkinFlag = true;
                    AdvertMgr.instance.showInterstitial();
                    if (PlayerData.instance.isFristGame()) {
                        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.GameOverPanel);
                    }
                    self.uiMgr.openGameOverPanel();
                }

                PlayerData.instance.onGameOver(self.localPlayer);
            }


            if (self.localPlayer.rank === 1 && !self.localPlayer.beKilled()) {
                setTimeout(() => {
                    self.uiMgr.showPanelVictory();
                    if (PlayerData.instance.isFristGame()) {
                        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.First_Game_Finish);
                    }
                }, 500)
                setTimeout(() => {
                    func();
                }, 2000)
            } else {
                func()
            }

            if (!PlayerData.instance.isInNFTRankGameMode()) {
                AdvertMgr.instance.showInterstitial();
            }
        }

        this.guideGameOverCallF = (() => {
            let index = 1;
            for (const player of this.players) {
                player.rank = index;
                index++;
            }
            callF();
        })



        var reviveCallF = () => {
            // if (GameData.instance.isInReview) {
            //     self.localPlayer.waitToDie = false;
            //     self.localPlayer.die(null, true);
            // } else {
            if (PlatformMgr.open_nft_rank_moudle && PlayerData.instance.isInNFTRankGameMode()) {
                self.localPlayer.waitToDie = false;
                self.localPlayer.die(null, true);
            } else {
                //复活界面
                self.uiMgr.openRevivePanel((isRevive, isFrenzy) => {
                    if (isRevive) {
                        var index = self.knifes.length;
                        var count = PlayerData.instance.knifeSkin.initKnifeCount;
                        var localPlayerKnifes = self.addEntitySys.AddKnife(count);
                        for (var knife of localPlayerKnifes) {
                            this.knifes[index] = knife;
                            var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
                            knifeInit.init(self.localPlayer);
                            index++;
                        }
                        // self.localPlayer.node.position = cc.v2(0, 0);
                        self.localPlayer.revive(isFrenzy);
                        self.gameRuleSystem.onContinue();
                        self.uiMgr.showReviveNotice(self.localPlayer);
                    } else {
                        self.localPlayer.waitToDie = false;
                        self.localPlayer.die(null, true);
                    }
                }, self.localPlayer.reviveCount);
            }
            // }
        }

        // var heroReviveCallF = () => {
        //     var index = self.knifes.length;
        //     var count = player.skin.initKnifeCount;
        //     var localPlayerKnifes = self.addEntitySys.AddKnife(count);
        //     for (var knife of localPlayerKnifes) {
        //         this.knifes[index] = knife;
        //         var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
        //         knifeInit.init(player);
        //         index++;
        //     }
        //     // self.localPlayer.node.position = cc.v2(0, 0);
        //     player.revive();
        // };

        const heroReviveCallF = (player, isRevive) => {
            if (PlatformMgr.open_nft_rank_moudle && PlayerData.instance.isInNFTRankGameMode()) {
                player.waitToDie = false;
                player.die(null, true);
            } else {
                if (isRevive) {
                    var index = self.knifes.length;
                    var count = player.skin.initKnifeCount;
                    var localPlayerKnifes = self.addEntitySys.AddKnife(count);
                    for (var knife of localPlayerKnifes) {
                        this.knifes[index] = knife;
                        var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
                        knifeInit.init(player);
                        index++;
                    }
                    player.revive();
                    self.uiMgr.showReviveNotice(player);

                } else {
                    player.waitToDie = false;
                    player.die(null, true);
                }
            }
        };

        const heroShowRebornCallF = (player) => {
            self.rebornEffect(player);
        };


        if (!this.isGuide) {
            this.playerRankSystem.init(this.players, this.localPlayer);
            this.gameRuleSystem.init(callF, this.localPlayer, this.players, GameData.instance.gameTime, reviveCallF);
            this.heroReviveSystem.init(this.players, heroReviveCallF, heroShowRebornCallF);
            this.playerDistanceSystem.init(this.players, this.localPlayer, this.blocks, this.knifes);
            this.wallRuleSystem.init(this);
        }

        PlayerData.instance.onStartGame();

        AudioEngine.instance.playSound(SoundID.Start);
        this.startGame = true;
        if (PlayerData.instance.isFristGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.First_Game_Start);
        }
    },

    update: function (dt) {
        this._removeEntity(dt);
        this._updateGameLogic(dt);
        this._updateHideNameLogic(dt);
        if (!this.isGuide) {
            this._updateNoticeLogic(dt);
            this._updateAddKnifeLogic(dt);
            this._updateShowTaskLogic(dt);
            this._updateAddBuffLogic(dt);
            this._updateAddBoxLogic(dt);
            // this._updatePowerArrowLogic(dt);
            this._updateGuideNoticeLogic(dt);
        }
        this._checkUpdateUserData(dt);
        this._reportHeart(dt);

    },

    _removeEntity: function (dt) {

        if (this.removeKnifes && this.removeKnifes.length > 0) {
            for (var knife of this.removeKnifes) {
                var j = this.knifes.indexOf(knife);
                if (j !== -1) {
                    this.knifes.splice(j, 1)
                }
            }
            this.removeKnifes = [];
        }
    },

    _updateGameLogic: function (dt) {
        if (this.startGame) {
            if (!this.isGuide) {
                this.gameRuleSystem.updateGameLogic(dt);
                this.heroReviveSystem.updateGameLogic(dt);
                this.wallRuleSystem.updateGameLogic(dt);
                this.playerDistanceSystem.updateGameLogic(dt);
                this.playerRankSystem.updateGameLogic(dt);
            } else {
                this.guideSystem.updateGameLogic(dt);
            }
            this.pickKnifeCollisionHandleSystem.updateGameLogic(dt);
            this.pickBuffCollisionHandleSystem.updateGameLogic(dt);
            this.heroCollisionHandleSystem.updateGameLogic(dt);
            this.knifeCollisionHandleSystem.updateGameLogic(dt);
            this.attackBoxCollisionHandleSystem.updateGameLogic(dt);
        }

        for (var player of this.players) {
            player.updateGameLogic(dt, this);
            player.myGuideComp.updateGameLogic(dt);
        }


        for (var knife of this.knifes) {
            knife.updateGameLogic(dt);
            if (knife.shouldRemove) {
                this.removeKnifes.push(knife);
            }
        }

        if (this.startGame) {}

        this.addEntitySys.AddTempKnife();
    },

    _updateNoticeLogic: function (dt) {
        if (this.startGame) {
            this.gameTime -= dt;
            if (this.gameTime <= 31 && !this.flag_30) {
                this.uiMgr.showImportantNotice(NoticeType.Time_30)
                this.flag_30 = true;
            }

            if (this.gameTime <= 11 && !this.flag_10) {
                this.uiMgr.showImportantNotice(NoticeType.Time_10)
                this.flag_10 = true;
            }

            if (this.gameTime <= 4 && !this.flag_3) {
                this.uiMgr.showCountDownNode()
                this.flag_3 = true;
            }


            if (this.startGame) {
                this.checkEnemyTime += dt;
                this.checkKnifeTime += dt;
                this.checkBlockTime += dt;
                this.checkDefenceTime += dt;

                if (this.checkEnemyTime > 20) {
                    for (var player of this.players) {
                        if (player === this.localPlayer) continue;
                        if (player.isDead) continue;
                        if (player.isInView) {
                            this.checkEnemyTime = 0;
                            this.uiMgr.addSpecialNotice(NoticeType.Enemy)
                        }
                    }
                }


                if (this.checkKnifeTime > 20) {
                    for (var knife of this.knifes) {
                        var isInMyView = Tools.isInMyView(this.localPlayer, knife, this.worldRect, this.width, this.height, this.cameraZoomCtrl.camera)
                        // knife.onKnifeViewChange(isInMyView);
                        if (isInMyView && knife.knifeStateComp.state === KnifeState.Normal) {
                            this.checkKnifeTime = 0;
                            this.uiMgr.addSpecialNotice(NoticeType.Knife)
                        }
                    }
                }


                if (this.checkBlockTime > 20) {
                    for (var block of this.blocks) {
                        if (Tools.isInMyView(this.localPlayer, block, this.worldRect, this.width, this.height, this.cameraZoomCtrl.camera)) {
                            this.checkBlockTime = 0;
                            this.uiMgr.addSpecialNotice(NoticeType.Block)
                        }
                    }
                }



                if (this.checkDefenceTime > 20) {
                    if (this.localPlayer.isDefence) {
                        this.checkDefenceTime = 0;
                        this.uiMgr.addSpecialNotice(NoticeType.Defence);
                    }
                }
            }
        }
    },

    _updateAddKnifeLogic: function (dt) {
        if (this.startGame) {
            this.addKnifeTime += dt;
            if (this.addKnifeTime >= PlayerData.instance.rankData.addKnifeInterval) {
                this.addKnifeTime = 0;
                const landKnifes = this.addEntitySys.AddKnife(1);
                var index = this.knifes.length;
                for (var knife of landKnifes) {
                    this.knifes[index] = knife;
                    index++
                }

            }
        }
    },

    _updateHideNameLogic: function (dt) {
        for (var player of this.players) {
            if (player === this.localPlayer) continue;
            if (player.isDead) continue;
            if (Tools.isInMyView(this.localPlayer, player, this.worldRect, this.width, this.height, this.cameraZoomCtrl.camera, true)) {
                player.setInView(true);
            } else {
                player.setInView(false);
            }
        }
    },

    _updateShowTaskLogic: function (dt) {
        //通知UI展示任务
        if (this.isShowTask) return;
        if (!this.taskMgr.showList[0]) return;
        this.isShowTask = true;
        const self = this;
        this.uiMgr.showTaskNotice(this.taskMgr.showList[0], () => {
            this.taskMgr.showList.splice(0, 1);
            self.isShowTask = false;
        })
    },


    _updateAddBuffLogic: function (dt) {
        if (this.startGame && this.canAddBuff) {
            this.addBuffTime += dt;
            if (this.addBuffTime > this.addBuffTimeLimit) {
                var buffs = this.addEntitySys.AddBuff(1, this.addBuffId);
                buffs[0].node.position = this.getRandomPosNearLocalPlayer(buffs[0].node, this.localPlayer.node, this.cameraZoomCtrl.camera);
                buffs[0].node.scale = 0;
                var action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut(3.0))
                buffs[0].node.runAction(action)
                this.initAddBuffParam()

            }
        }
    },

    _updateAddBoxLogic: function (dt) {
        if (this.startGame && this.canAddBox) {
            this.addBoxTime += dt;
            if (this.addBoxTime > this.addBoxTimeLimit) {
                var boxes = this.addEntitySys.AddBox(1, this.addBoxId);
                boxes[0].node.position = this.getRandomPosNearLocalPlayer(boxes[0].node, this.localPlayer.node, this.cameraZoomCtrl.camera);
                boxes[0].node.scale = 0;
                var action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut(3.0))
                boxes[0].node.runAction(action)
                this.initAddBoxParam()
            }
        }
    },

    _updatePowerArrowLogic: function (dt) {
        for (var player of this.players) {
            if (player === this.localPlayer) continue;
            if (player.isInView && !player.isDead) {
                player.refreshPowerArrow(this.localPlayer);
            } else {
                player.closePowerArrow();
            }
        }
    },

    _updateGuideNoticeLogic: function (dt) {
        if (!this.startGame) return;

        var knfieCount = this.localPlayer.followPlayer.knivesCmp.knives.length;
        if (knfieCount <= 10) {
            this.localPlayer.showTips(0);
        } else {
            if (this.localPlayer.isDefence) {
                this.localPlayer.showTips(2);
                this.showGuideFlag = false;
            } else if (this.showGuideFlag) {
                this.localPlayer.showTips(1);
            } else {
                this.localPlayer.closeTips();
            }
        }
    },

    initMapParam: function () {
        this.mapType = 0;
        this.mapId = 0;
        if (PlayerData.instance.playCount === 0) {
            return;
        }

        if (PlayerData.instance.newMap) {
            this.mapType = PlayerData.instance.newMap;
            PlayerData.instance.newMap = 0;
            return;
        }

        var canUseMapDatas = [];
        var mapDatas = ConfigData.instance.mapDatas;
        var mapPool = PlayerData.instance.rankData.mapPool;

        if (!mapPool) return;


        for (const id of mapPool) {
            canUseMapDatas.push(mapDatas[id]);
        }

        var data = Tools.getRandomItemByWeight(canUseMapDatas)
        if (data) {
            this.mapType = data.id;
            this.mapWidth = data.width;
            this.mapHeight = data.height;
        }

        if (GameData.instance.isShowLog()) {
            // console.log(canUseMapDatas);
            // console.log('随机地图：', this.mapType);
        }
    },

    initAddBuffParam: function () {
        var canUseBuffDatas = [];
        var buffDatas = ConfigData.instance.buffDatas;
        var buffPool = PlayerData.instance.rankData.buffPool;

        if (buffPool) {
            this.canAddBuff = true;
        } else {
            this.canAddBuff = false;
            return;
        }

        for (const buffId of buffPool) {
            canUseBuffDatas.push(buffDatas[buffId]);
        }

        var data = Tools.getRandomItemByWeight(canUseBuffDatas);
        if (data) {
            this.addBuffId = data.id;
            this.addBuffTime = 0;
            this.addBuffTimeLimit = Tools.getRandomInt(data.refreshTime[0], data.refreshTime[1]);
        }

        if (GameData.instance.isShowLog()) {
            console.log(canUseBuffDatas);
            console.log('随机buff：', data.name, '刷新时间:', this.addBuffTimeLimit);
        }
    },


    initAddBoxParam: function () {
        var totalWeight = 0;
        var boxWeights = [];
        var canUseBoxDatas = [];
        var boxDatas = ConfigData.instance.boxDatas;
        var boxPool = PlayerData.instance.rankData.boxPool;
        this.canAddBox = true;
        if (boxPool) {
            this.canAddBox = true;
        } else {
            this.canAddBox = false;
            return;
        }

        for (const boxId of boxPool) {
            canUseBoxDatas.push(boxDatas[boxId]);
        }


        var data = Tools.getRandomItemByWeight(canUseBoxDatas);
        if (data) {
            this.addBoxId = data.id;
            this.addBoxTime = 0;
            this.addBoxTimeLimit = Tools.getRandomInt(data.refreshTime[0], data.refreshTime[1]);
        }


        if (GameData.instance.isShowLog()) {
            console.log(canUseBoxDatas);
            console.log('随机box：', data.name, '刷新时间:', this.addBoxTimeLimit);
        }
    },


    restartGame: function () {
        CollisionEventManager.getInstance().clear();
        AudioEngine.instance.stopAllSound();
        let manager = cc.director.getCollisionManager();
        manager._contacts = [];
        manager._colliders = [];
        // cc.director.loadScene("Battle");
        this.uiMgr.closeGameOverPanel();
        this.uiMgr.closeNFTGameOverPanel();
        this.uiMgr.openPanelKeyCount(false);
        if (PlayerData.instance.isSecGame()) {
            PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.BackToHome);
        }
        this.onLoad();
    },


    gameOver: function () {

    },

    posInMyView: function (pos) {
        var relativePos = this.localPlayer.node.convertToNodeSpaceAR(pos);
        var width = this.width * this.cameraZoomCtrl.camera.zoomRatio;
        var height = this.height * this.cameraZoomCtrl.camera.zoomRatio;
        if (relativePos.x <= width / 2 && relativePos.x >= -width / 2) {
            if (relativePos.y <= height / 2 && relativePos.y >= -width / 2) {
                return true;
            }
        }
        return false;
    },

    //丢刀特效
    throwKnife: function (detail) {
        var centerPos, rotation
        if (detail.length !== 2) {
            centerPos = detail.parent.convertToWorldSpaceAR(detail.position)
            rotation = 0;
        } else {
            var params = Tools.getCenterParam(detail);
            centerPos = params[0];
            rotation = params[1];
        }

        // if (this.posInMyView(centerPos)) {
        this.addEntitySys.addCollisionEffect(centerPos, rotation);
        // }
    },

    //闪避特效
    dodgeKnife: function (detail) {
        var params = Tools.getCenterParam(detail);
        var centerPos = params[0];
        if (this.posInMyView(centerPos)) {
            var effect = this.addEntitySys.addDodgeEffect(centerPos);
            effect.scale = this.localPlayer.node.scale;
        }
    },

    //破防特效
    destroyDefenceKnife: function (detail) {
        var centerPos;
        if (detail.length !== 2) {
            centerPos = detail.parent.convertToWorldSpaceAR(detail.position)
        } else {
            var params = Tools.getCenterParam(detail);
            centerPos = params[0];
        }
        // if (this.posInMyView(centerPos)) {
        var effect = this.addEntitySys.addDestroyDefenceEffect(centerPos);
        effect.scale = this.localPlayer.node.scale;
        // }else{
        //     console.log('不在视野内')
        // }
    },

    //哪吒攻击特效
    onNeZhaAttack: function (detail) {
        var centerPos = detail.parent.convertToWorldSpaceAR(detail.position)
        var effect = this.addEntitySys.addNeZhaEffect(centerPos);
        // effect.scale = this.localPlayer.node.scale;
    },

    reduceMapSize: function (v) {
        this.mapWidth -= v;
        this.mapHeight -= v;

        this.addEntitySys.setMapSize(this.mapWidth, this.mapHeight);
        for (var player of this.players) {
            player.refreshWalls(this.mapWidth, this.mapHeight);
            player.node.emit('setMapSize', [this.mapWidth, this.mapHeight]);
        }

        for (var knife of this.knifes) {
            knife.refreshWalls(this.mapWidth, this.mapHeight);
        }
    },


    onEquipKnifeSkin: function (data, isOwn, needSave = true, needChangeKnife = true) {
        console.error("onEquipKnifeSkin")
        //未获得则只预览，在退出商店时恢复默认
        if (isOwn) PlayerData.instance.updateKnifeSkin(data, needSave);
        const self = this;
        if (needChangeKnife) self.changeLocalKnifesCount(data.initKnifeCount);
        self.localPlayer.changeKnifeSkin(data);
        self.localPlayer.followPlayer.getComponent('PlayerKnivesComponent').emitAllKnivesChangeSkin();
        //刷新属性条
        self.uiMgr.refreshProperty(data, false)
    },

    onEquipHeroSkin: function (data, isOwn, needSave = true) {
        //未获得则只预览，在退出商店时恢复默认
        if (isOwn) PlayerData.instance.updateHeroSkin(data, needSave);
        const self = this;
        self.localPlayer.heroSkin = data;
        self.localPlayer.changeSkin();
        self.localPlayer.changeEffectColor();
        self.refreshAIHeroSkin();
        //刷新属性条
        self.uiMgr.refreshProperty(data, true)
    },

    addLocalPlayerKnifes: function (num) {
        var addKnifes = this.addEntitySys.AddKnife(num);
        var index = this.knifes.length;
        for (var knife of addKnifes) {
            this.knifes[index] = knife;
            var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
            knifeInit.init(this.localPlayer);
            index++;
        }
    },

    changeLocalKnifesCount: function (num) {
        num += PlayerData.instance.extraKnifeCount;
        this._changeLocalKnifesCountReal(-this.localPlayerKnifes.length)
        this._changeLocalKnifesCountReal(num)
    },


    _changeLocalKnifesCountReal: function (count) {
        if (count > 0) {
            var addKnifes = this.addEntitySys.AddKnife(count);
            var index = this.knifes.length;
            for (var knife of addKnifes) {
                this.knifes[index] = knife;
                this.localPlayerKnifes.push(knife);
                var knifeInit = Tools.getOrAddComponent(knife.node, 'KnifeInit');
                knifeInit.init(this.localPlayer);
                // knife.node.position = this.localPlayer.node.position;
                index++;
            }
        } else if (count < 0) {
            var index = this.localPlayerKnifes.length;
            for (let i = index - 1; i >= index + count; i--) {
                var knife = this.localPlayerKnifes[i];
                this.localPlayerKnifes.splice(i, 1);
                var j = this.knifes.indexOf(knife);
                if (j !== -1) {
                    this.knifes.splice(j, 1)
                }
                knife.node.getComponent('KnifeOwnerComponent').owner.emit('reduceKnife', knife.node);
                // knife.recycleSelf();
                knife.node.destroy();
            }
        }
    },

    refreshAIHeroSkin: function () {
        for (const player of this.players) {
            if (player === this.localPlayer) continue;
            if (player.heroSkin && this.localPlayer.heroSkin) {
                if (player.heroSkin.id === this.localPlayer.heroSkin.id) {
                    player.heroSkin = null;
                    player.changeSkin();
                    player.changeEffectColor();
                }
            }
        }
    },

    getRandomPosNearLocalPlayer: function (itemNode, playerNode, camera) {
        var minWidth = this.localPlayer.logicPlayer.radius * this.localPlayer.node.scale / 2;
        var minHeight = this.localPlayer.logicPlayer.radius * this.localPlayer.node.scale / 2;
        var maxWidth = this.width / camera.zoomRatio / 2;
        var maxHeight = this.height / camera.zoomRatio / 2;
        // console.log(minWidth, maxWidth, minHeight, maxHeight)
        var randomPos = cc.v2(Tools.getPositiveOrNegative() * Tools.getRandomInt(minWidth, maxWidth), Tools.getPositiveOrNegative() * Tools.getRandomInt(minHeight, maxHeight))
        var nearPos = playerNode.position.add(randomPos);
        var pos = playerNode.parent.convertToWorldSpaceAR(nearPos);
        var finalPos = itemNode.parent.convertToNodeSpaceAR(pos);
        return finalPos;
    },

    _checkUpdateUserData: function (dt) {
        PlayerData.instance.checkDelayUpdateData(dt);
        PlayerData.instance.updateUserData();
        PlayerData.instance.updatePKRankTime += dt;
        PlayerData.instance.pkSurplusTime -= dt * 1000;
    },

    addDeadKnifes: function (pos) {
        var count = 6;
        // var addKnifes = this.addEntitySys.AddKnife(count);
        // var index = this.knifes.length;
        // var dir = pos.sub(this.localPlayer.node.position).normalize().mul(200);
        let i = 0;
        const self = this;
        for (i = 0; i < count; i++) {
            // for (let knife of addKnifes) {
            // this.knifes[index] = knife;
            // knife.node.position = pos.add(cc.v2(Tools.getRandomInt(-200, 200), Tools.getRandomInt(-200, 200)));
            // knife.node.position = pos.add(dir);
            // dir = dir.rotate(60 * Math.PI / 180);
            // knife.activeNode.active = false;
            let ePos = pos.add(cc.v2(Tools.getRandomInt(-200, 200), Tools.getRandomInt(-200, 200))); //knife.node.parent.convertToWorldSpaceAR(knife.node.position);


            // const showKnife = function () {
            //     knife.activeNode.active = true;
            // }

            const createEffect = function () {
                self.addEntitySys.addShowKnifeEffect(ePos);
                // setTimeout(showKnife, 300);
            }

            setTimeout(createEffect, i * 50);
            // i++;
            // index++;
        }
    },

    rebornEffect: function (player) {
        // var centerPos = pos;
        var centerPos = player.node.parent.convertToWorldSpaceAR(player.node.position);
        // if (this.posInMyView(centerPos)) {
        var effect = this.addEntitySys.addRebornEffect(centerPos);
        // effect.scale = this.localPlayer.node.scale;
        // }
    },

    _reportHeart: function (dt) {
        if (this.isDoHeartbeat) {
            const timestamp = Tools.getMilliTime();
            if (timestamp - this._heartbeatSendTimestamp >= this.heartbeatInterval) {
                this._heartbeatSendTimestamp = timestamp;
                // this.sendHeartbeatRequest();
                PlatformMgr.hawkeye_report_heartbeat();
                PlatformMgr.getInviteInfo((datas) => {
                    PlayerData.instance.inviteDatas = datas;
                    this.uiMgr.refreshRedDot();
                })
            }
        }
    },

    onBoxDestroy: function (info) {
        var node = info.node;
        var data = info.data;
        // this.addDeadKnifes(node.position);
        //0 刀 1 金币 2 buff
        switch (data.id) {
            case 0:
                this.addBoxKnife(info);
                break;
            case 1:
                if (info.isLocal) {
                    this.addBoxGold(info);
                }
                break;
            case 2:
                this.addBoxBuff(info);
                break;
        }
    },


    addBoxKnife: function (info) {
        var node = info.node;
        var data = info.data;
        var pos = node.position;
        var count = Tools.getRandomInt(data.param[0], data.param[1] + 1);

        var addKnifes = this.addEntitySys.AddKnife(count);
        var index = this.knifes.length;

        let i = 0;
        const self = this;

        for (let knife of addKnifes) {
            this.knifes[index] = knife;

            // knife.node.position = pos.add(cc.v2(Tools.getRandomInt(-100, 100), Tools.getRandomInt(-100, 100)));

            let epos = pos.add(cc.v2(Math.cos(i / count * 2 * Math.PI) * 100, Math.sin(i / count * 2 * Math.PI) * 100));
            knife.node.position = epos;
            knife.activeNode.opacity = 0;
            knife.knifeColliderNodeCtrl.attackCollider.notColliderFlag = true;
            const showKnife = function () {
                if (knife) {
                    knife.activeNode.opacity = 255;
                    setTimeout(() => {
                        knife.knifeColliderNodeCtrl.attackCollider.notColliderFlag = false;
                    }, 400)
                }
            }

            const createEffect = function () {
                self.addEntitySys.addShowKnifeEffect(epos);
                setTimeout(showKnife, 300);
            }

            setTimeout(createEffect, i * 50);
            i++;
            index++;
        }

    },

    addBoxGold: function (info) {
        var pos = info.node.position;
        var data = info.data;
        var count = Tools.getRandomInt(data.param[0], data.param[1] + 1);
        PlayerData.instance.updateGold(count);
        PlayerData.instance.showGold -= count;


        var offset = pos.sub(this.localPlayer.node.position).mul(this.cameraZoomCtrl.camera.zoomRatio);
        this.uiMgr.showGetMoneyEffect({
            count: 200,
            isMore: true,
            isLucky: false,
        }, cc.v2(0, -200), true);
    },


    addBoxBuff: function (info) {
        var canUseBuffDatas = [];
        // var buffDatas = ConfigData.instance.buffDatas;
        var buffPool = PlayerData.instance.rankData.buffPool;

        if (!buffPool) {
            return;
        }

        for (const buffId of buffPool) {
            canUseBuffDatas.push({
                id: buffId,
                weight: info.data.param[buffId]
            });
        }

        var data = Tools.getRandomItemByWeight(canUseBuffDatas);
        if (data) {
            var buffs = this.addEntitySys.AddBuff(1, data.id);
            buffs[0].landNode.active = false;
            buffs[0].node.position = info.node.position.add(cc.v2(0, 50));
            buffs[0].node.scale = 0;

            setTimeout(() => {
                buffs[0].landNode.active = true;
            }, 300);

            var action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut(3.0))
            buffs[0].node.runAction(action)
        }

    },

    getReward(item) {
        switch (item.type) {
            case ItemType.MONEY:
                var count = item.num;
                PlayerData.instance.updateGold(count);
                PlayerData.instance.showGold -= count;
                var param = {
                    count: count,
                    isMore: true,
                    isLucky: false,
                }
                this.uiMgr.showGetMoneyEffect(param, cc.v2(0, -200), true);
                break;
            case ItemType.HERO_SKIN:
                if (!PlayerData.instance.isOwnHeroSkin(item.id)) {
                    PlayerData.instance.addHeroSkin(item.id);
                    //装备上
                    this.onEquipHeroSkin(item.itemData, true);
                }
                //展示出来
                this.uiMgr.showReward(item.itemData);
                PlayerData.instance.showPanelBuySkinFlag = false;
                break;
            case ItemType.KNIFE_SKIN:
                if (!PlayerData.instance.isOwnKnifeSkin(item.id)) {
                    PlayerData.instance.addKnifeSkin(item.id);
                    this.onEquipKnifeSkin(item.itemData, true, true, false);
                }
                //展示出来
                this.uiMgr.showReward(item.itemData);
                PlayerData.instance.showPanelBuySkinFlag = false;
                break;
            case ItemType.ZONG_ZI:
                var count = item.num;
                PlayerData.instance.updateZongZi(count);
                this.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(15), count));
                break;
        }
    },

    showPanelTreasureBox() {
        // PlayerData.instance.updateKeyCount();
        // PlayerData.instance.updateKeyCount();
        // PlayerData.instance.updateKeyCount();
        if (PlayerData.instance.canShowPanelTreasureBox()) {
            this.uiMgr.showPanelTreasureBox()
        }
    },

    updateKeyCount(node) {
        PlayerData.instance.updateKeyCount();
        this.uiMgr.showPanelKeyCount(node);
    },

});