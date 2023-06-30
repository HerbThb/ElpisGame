const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlatformMgr = require('PlatformMgr');
const PlatformType = require('Types').PlatformType;
const GameData = require('GameData');
const TaskType = require('Types').TaskType;
const DailyTaskType = require('Types').DailyTaskType;
const GrowType = require('Types').GrowType;
const BattleModeType = require('Types').BattleModeType;

var PlayerData = cc.Class({
    statics: {
        instance: null,

        init: function () {
            if (PlayerData.instance === null) {
                PlayerData.instance = new PlayerData();
                PlayerData.instance.init();
            }
        },

        cleanUp: function () {
            if (PlayerData.instance) {
                Tools.cleanUp(PlayerData.instance);
            }
            PlayerData.instance = null;
        }
    },

    properties: {
        name: 'player',
        gold: 200,
        showGold: 200,
        getGoldCount: 0,
        knifeSkinId: 1,
        heroSkinId: 1,
        ownKnifeSkins: [],
        ownHeroSkins: [],
        completeTaskIds: [], //已完成任务的id
        showTaskInGameIds: [], //已完成并在游戏中展示解锁的任务id
        completeRankRewardIds: [], //已获取段位奖励的任务id
        needCheckTaskIds: [], //新获得标识
        taskProcess: [],
        knifeSkin: null,
        extraKnifeCount: 0, //每次游戏开始前看广告额外得到的刀
        isExtraKnife: false,
        allShareCount: 0, //生涯累计分享次数
        //建号时间
        bornTime: 0,
        //上次保存数据的时间戳
        saveTime: 0,
        //上次领取离线金币的时间戳
        getOfflineGoldTime: 0,
        offlineGoldCount: 0,
        lastChangeGoldMultipTime: 0,
        //游戏场次
        playCount: 0,
        //游戏总获胜场次
        winCount: 0,
        //NFT界面游戏入口
        nftToPlayCount: 0,
        nftLock: 0, //NFT锁
        nftLock_first: 0, //第一个NFT
        nftLock_req: 0, ////NFT主动请求：骨头皮肤，获胜10盘后主动请求
        nftLock_auto: 0, //钱包链接成功后自动请求
        getNFT: false,
        //1.0.3A 只在第一次启动的时候随机
        ABTestCode: "",
        nftPlayeCount: 0,
        nftWinCount: 10,
        //日统计
        dayKillCount: 0,
        dayTotalPickKnifeCount: 0,
        dayMaxPickKnifeCount: 0,
        dayKillKnifeCount: 0,
        dayPlayCount: 0,
        dayWinCount: 0,
        dayRefreshTaskCount: 0,
        dayRefreshShareScore: false,

        dayTotalAdsRevenue: 0,
        dayCanReportTotalAdsRevenue: true,

        bitverseWallet: "",

        //每日通过分享或广告成功获得奖励的次数
        dayGetPrizeCount: 0,
        dayWin: false,
        dayLoseCount: 0,
        dayProtectCount: 0,
        dailyShowTask: [],
        dailyOldTask: [], //已经出现过的任务

        dayMultAgainCDCount: 0,
        dayMultAgainCloseCount: 0,
        //升级时金币不足看视频得金币的次数
        dayGetGoldCount: 0,
        //击杀人数
        killCount: 0,
        oldKillCount: 0,
        //幸运大奖次数
        luckyRewardCount: 0,

        level: 0,
        rankScore: 0,
        rankId: 0,
        rankStar: 0,
        hideScore: 0,

        iconUrl: 1,

        //签到天数
        signCount: 0,
        //当天是否签过到
        daySign: false,
        //是否初始化签到天数
        initSignCount: false,
        //皮肤对应的广告观看次数
        adverCountDatas: [],
        //连输次数
        continuityLoseCount: 0,
        //累计看广告次数
        totalAdverCount: 0,
        //上次进主页到这次进主页间看的广告
        changeAdverCount: 0,
        //已经查看过的皮肤
        hasCheckNewSkin: [],
        //领取过的排行轮次日期
        receiveRound: [],

        // 需要上行玩家数据
        needUpdateUserData: false,

        //成长属性 依次是攻击，防御，速度，离线收益，金币加成
        growLevel: [],
        randomCount: 0,

        //是否已经领取过赔偿
        hasRepay: false,
        hawkeyeFunnelIDs: [],

        //新手任务完成情况
        completeGuideDailyTask: [],

        zongZi: 0,

        //作弊时间偏移，可在作弊按钮中修改
        cheatOffset: 0,

        //是否提示过粽子转钻石
        zongZiToDaoBi: false,

        //分享分数，根据这个来决定每天前几次是分享
        shareScore: 0,

        inviteDatas: [],

        checkInviteLength: 0,

        //是否继承了老段位数据
        extendOldRank: false,

        //每日展示置顶
        dayShowTop: false,

        //世界排行数据
        holidayWorldRankData: [],
        updatePKRankTime: 0,
        dayRefreshPKReward: false,
        dayRefreshWorldReward: false,
        dayFirstEnterPKTop20: false,
        //客户端时间偏移
        timeOffset: 0,
        //每轮登录游戏后游戏的场次
        perPlayCount: 0,

        //订阅到期时间戳
        subscribeTime: 0,
        daySubscribeReward: false,
        country: 'US',

        refuseBuyPool: null,
        refuseAdverPool: null,

        keyCount: 0,
        treasureTurn: 0, //宝箱轮数
        showKeyCount: 2, //出现钥匙的局数，当大于等于2局时可以出现钥匙
        hasGetKey: false,

        evaulateCount: 0,

        vipWithoutInterstitial: 0, //充值用户屏蔽插屏广告
        lastFreeDiamondTime: 0,

        isShowOpenAdCold: false,

        //nft按钮解锁


        //nft,弹窗锁
        lastOnceGameRank: 0, //游玩的rank
        isBitverseInstalled: false,

        //nft rank
        heroNFTSkinId: 16,
        knifeNFTSkinId: 102,

        physical: 20, //体力
        physicalBuy: 0, //钻石购买的体力，分开计算

        dayPhysicalBuyDatas: [], //体力购买记录
        nftRankScore: 0,

        nftOtherwiseRewards: [], //社区和问卷调查给的奖励

        nftGetOtherwiseRewards: [], //社区和问卷调查给的奖励领取记录

        nftRankScores: [],
        nftRankRewards: [],

        nftRankStarLv: [],

        lastBattleMode: 0,
        currentBattleMode: 0, //
        isDuringNFTRank: false, //以服务器时间为准
        nftRankEndTime: 0, //每次通信时更新

        dayOpenAppCount: 0, //每日打开app次数

        nftRankPlayCount: 0, //游玩次数

        lastNormalLoadIsNFT: false,
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init: function () {
        this.randomCount = 0;
        this.ownKnifeSkins = [1];
        this.ownHeroSkins = [1];
        this.growLevel = [0, 0, 0, 0, 0];
        this.nftRankStarLv = [
            [1, 3],
            [4, 10],
            [11, 20],
            [21, 30],
            [31, 50],
            [51, 80],
            [81, 100],
            [101, 150],
            [151, 200],
            [201, 500],
            [501, 1000],
            [1000, 2000],
            [2001, 100000000]
        ]
        this.dayPhysicalBuyDatas = [0, 0]
        this.nftGetOtherwiseRewards = [0, 0]

        this.needUpdateUserData = false;
        this.bornTime = this.getCurTime();
        this.updateSaveTime();
        this.getOfflineGoldTime = this.getCurTime();
        this.lastChangeGoldMultipTime = this.getCurTime();
        this.loadUserCidData();
        this.refuseBuyPool = {};
        this.refuseAdverPool = {};
        PlatformMgr.setPlayerData(this);
    },

    initUserData: function (callback) {
        this.getUserData(callback);
        this.saveUserCidData();
        console.log('---------------------------初始化实物获奖信息');
        this.updateWorldRewardDetail();
        console.log('---------------------------初始化小组PK榜数据')
        // this.getHolidayPKRank(() => {})
        this.getHolidayWorldRank(0, () => {}, true)
        this.getCountry();
    },

    initConfigData: function () {
        if (!this.isOwnKnifeSkin(this.knifeSkinId)) {
            this.knifeSkinId = 1;
        }
        if (!this.isOwnHeroSkin(this.heroSkinId)) {
            this.heroSkinId = 1;
        }
        this.knifeSkin = ConfigData.instance.getKnifeSkinById(this.knifeSkinId);
        this.heroSkin = ConfigData.instance.getHeroSkinById(this.heroSkinId);
        this.rankData = ConfigData.instance.getRankDataByStar(this.rankStar);
        this.rankId = this.rankData.id;
        this.offlineGoldInterval = ConfigData.instance.clientData.offlineGoldInterval * 1000;
        this.offlineGoldNormalCount = ConfigData.instance.clientData.offlineGoldNormalCount;
        this.level = ConfigData.instance.getLevelByHideScore(this.hideScore);

        if (this.dailyShowTask.length === 0) {
            this.updateDailyShowTask();
        }


        this.level = this.protectLevel(this.level);

        this.isGuide = false; //this.playCount === 0 ? true : false;

        if (GameData.instance.isShowLog()) {
            console.log('playerdata.initConfigData level: ' + this.level);
        }
        this.extendOldData();

        PlatformMgr.hawkeye_level = this.rankId + 1;

        // this.remainPKDay = Tools.getTimeCount(this.getCurTime(), Tools.getTimeStampByTimeStr(ConfigData.instance.holidayDatas.startDate)).day + 1;
    },

    //继承老数据
    extendOldData: function () {
        var needSave = false;
        if (this.rankScore !== -1) {
            var starId = ConfigData.instance.convertScoreIdToStarId(this.rankScore)
            this.rankData = ConfigData.instance.getRankDataById(starId);
            this.rankStar = this.rankData.star;
            this.rankId = this.rankData.id;
            this.rankScore = -1;
            needSave = true;
        }

        if (!this.initSignCount) {
            this.initSignCount = true;
            var dayCount = Tools.getRealDayTimeCount(this.bornTime, this.getCurTime()) - 1;
            dayCount = dayCount < 0 ? 0 : dayCount;
            this.signCount += dayCount;
            if (this.signCount >= 7) {
                this.signCount = 6;
                this.daySign = true;
            }
            needSave = true;
        }


        if (!this.extendOldRank) {
            this.extendOldRank = true;
            if (this.rankStar >= 103) {
                this.rankStar += 60;
                this.rankData = ConfigData.instance.getRankDataByStar(this.rankStar)
                this.rankId = this.rankData.id;
            }
            needSave = true;
        }

        if (needSave) this.saveUserData('老用户数据继承');
    },

    convertZongZi: function () {
        if (this.zongZi > 0) {
            this.gold += this.zongZi * 10;
            this.zongZi = 0;
            this.saveUserData('转化粽子')
        }
    },


    setData: function (data) {
        const self = this;
        if (data) {
            self.name = data.name ? data.name : 'player';
            self.gold = data.gold ? data.gold : 0;
            self.physical = data.physical ? data.physical : 20;
            self.physicalBuy = data.physicalBuy ? data.physicalBuy : 0;
            self.nftRankScore = data.nftRankScore ? data.nftRankScore : 0;
            self.dayOpenAppCount = data.dayOpenAppCount ? data.dayOpenAppCount : 0;
            self.nftRankPlayCount = data.nftRankPlayCount ? data.nftRankPlayCount : 0;

            self.dayPhysicalBuyDatas = data.dayPhysicalBuyDatas ? data.dayPhysicalBuyDatas : [0, 0];
            self.nftGetOtherwiseRewards = data.nftGetOtherwiseRewards ? data.nftGetOtherwiseRewards : [0, 0];

            self.knifeSkinId = data.knifeSkinId ? data.knifeSkinId : 1;
            self.ownKnifeSkins = data.ownKnifeSkins ? data.ownKnifeSkins : [1];
            self.ownHeroSkins = data.ownHeroSkins ? data.ownHeroSkins : [1];
            self.heroSkinId = data.heroSkinId ? data.heroSkinId : 1;
            self.heroNFTSkinId = data.heroNFTSkinId ? data.heroNFTSkinId : 16;
            self.knifeNFTSkinId = data.knifeNFTSkinId ? data.knifeNFTSkinId : 102;
            self.completeTaskIds = data.completeTaskIds ? data.completeTaskIds : [];
            self.showTaskInGameIds = data.showTaskInGameIds ? data.showTaskInGameIds : [];
            self.needCheckTaskIds = data.needCheckTaskIds ? data.needCheckTaskIds : [];
            self.completeRankRewardIds = data.completeRankRewardIds ? data.completeRankRewardIds : [];
            self.adverCountDatas = data.adverCountDatas ? data.adverCountDatas : [];
            self.totalAdverCount = data.totalAdverCount ? data.totalAdverCount : 0;
            self.hasCheckNewSkin = data.hasCheckNewSkin ? data.hasCheckNewSkin : [];
            self.receiveRound = data.receiveRound ? data.receiveRound : [];

            self.bornTime = data.bornTime ? data.bornTime : this.getCurTime();
            self.saveTime = data.saveTime ? data.saveTime : this.getCurTime();
            self.getOfflineGoldTime = data.getOfflineGoldTime ? data.getOfflineGoldTime : this.getCurTime();
            self.lastChangeGoldMultipTime = data.lastChangeGoldMultipTime ? data.lastChangeGoldMultipTime : this.getCurTime();
            self.offlineGoldCount = data.offlineGoldCount ? data.offlineGoldCount : 0;

            self.playCount = data.playCount ? data.playCount : 0;
            self.winCount = data.winCount ? data.winCount : 0;
            self.nftToPlayCount = data.nftToPlayCount ? data.nftToPlayCount : 0;
            self.nftRankEndTime = data.nftRankEndTime ? data.nftRankEndTime : 0;
            self.nftLock = data.nftLock ? data.nftLock : 0;
            self.nftLock_req = data.nftLock_req ? data.nftLock_req : 0;
            self.nftLock_auto = data.nftLock_auto ? data.nftLock_auto : 0;
            self.nftLock_first = data.nftLock_first ? data.nftLock_first : 0;
            self.ABTestCode = data.ABTestCode ? data.ABTestCode : "";
            self.nftPlayeCount = data.nftPlayeCount ? data.nftPlayeCount : 0;
            self.nftWinCount = data.nftWinCount ? data.nftWinCount : 10;

            self.dayPlayCount = data.dayPlayCount ? data.dayPlayCount : 0;
            self.dayGetPrizeCount = data.dayGetPrizeCount ? data.dayGetPrizeCount : 0;
            self.dayWin = data.dayWin ? data.dayWin : 0;
            self.dayLoseCount = data.dayLoseCount ? data.dayLoseCount : 0;
            self.dayProtectCount = data.dayProtectCount ? data.dayProtectCount : 0;
            self.dayGetGoldCount = data.dayGetGoldCount ? data.dayGetGoldCount : 0;
            self.dayKillCount = data.dayKillCount ? data.dayKillCount : 0;
            self.dayTotalPickKnifeCount = data.dayTotalPickKnifeCount ? data.dayTotalPickKnifeCount : 0;
            self.dayMaxPickKnifeCount = data.dayMaxPickKnifeCount ? data.dayMaxPickKnifeCount : 0;
            self.dayKillKnifeCount = data.dayKillKnifeCount ? data.dayKillKnifeCount : 0;
            self.dayWinCount = data.dayWinCount ? data.dayWinCount : 0;
            self.dayRefreshTaskCount = data.dayRefreshTaskCount ? data.dayRefreshTaskCount : 0;
            self.dayRefreshShareScore = data.dayRefreshShareScore ? data.dayRefreshShareScore : false;

            self.dayTotalAdsRevenue = data.dayTotalAdsRevenue ? data.dayTotalAdsRevenue : 0;

            self.bitverseWallet = data.bitverseWallet ? data.bitverseWallet : "";

            self.dailyShowTask = data.dailyShowTask ? data.dailyShowTask : [];
            self.dailyOldTask = data.dailyOldTask ? data.dailyOldTask : [];

            self.dayMultAgainCDCount = data.dayMultAgainCDCount ? data.dayMultAgainCDCount : 0;
            self.dayMultAgainCloseCount = data.dayMultAgainCloseCount ? data.dayMultAgainCloseCount : 0;

            self.killCount = data.killCount ? data.killCount : 0;
            self.allShareCount = data.allShareCount ? data.allShareCount : 0;
            self.luckyRewardCount = data.luckyRewardCount ? data.luckyRewardCount : 0;
            // self.level = data.level ? data.level : 0;

            self.rankStar = data.rankStar ? data.rankStar : 0;
            self.rankId = data.rankId ? data.rankId : 0;
            self.rankScore = data.rankScore ? data.rankScore : 0;
            self.hideScore = data.hideScore ? data.hideScore : 0;

            self.signCount = data.signCount ? data.signCount : 0;
            self.daySign = data.daySign ? data.daySign : false;
            self.initSignCount = data.initSignCount ? data.initSignCount : false;

            self.iconUrl = data.iconUrl ? data.iconUrl : Tools.getRandomInt(1, 7);
            self.continuityLoseCount = data.continuityLoseCount ? data.continuityLoseCount : 0;

            self.growLevel = data.growLevel ? data.growLevel : [0, 0, 0, 0, 0];

            self.hasRepay = data.hasRepay ? data.hasRepay : false;
            self.hawkeyeFunnelIDs = data.hawkeyeFunnelIDs ? data.hawkeyeFunnelIDs : self.hawkeyeFunnelIDs;
            self.completeGuideDailyTask = data.completeGuideDailyTask ? data.completeGuideDailyTask : [];

            self.zongZi = data.zongZi ? data.zongZi : 0;
            self.zongZiToDaoBi = data.zongZiToDaoBi ? data.zongZiToDaoBi : false;

            self.checkInviteLength = data.checkInviteLength ? data.checkInviteLength : 0;

            self.shareScore = data.shareScore ? data.shareScore : 0;
            self.extendOldRank = data.extendOldRank ? data.extendOldRank : false;
            self.dayShowTop = data.dayShowTop ? data.dayShowTop : false;
            self.dayRefreshPKReward = data.dayRefreshPKReward ? data.dayRefreshPKReward : false;
            self.dayRefreshWorldReward = data.dayRefreshWorldReward ? data.dayRefreshWorldReward : false;
            self.dayFirstEnterPKTop20 = data.dayFirstEnterPKTop20 ? data.dayFirstEnterPKTop20 : false;


            self.subscribeTime = data.subscribeTime ? data.subscribeTime : 0.;
            self.daySubscribeReward = data.daySubscribeReward ? data.daySubscribeReward : false;

            self.refuseBuyPool = data.refuseBuyPool ? data.refuseBuyPool : {};
            self.refuseAdverPool = data.refuseAdverPool ? data.refuseAdverPool : {};

            self.keyCount = data.keyCount ? data.keyCount : 0;
            self.treasureTurn = data.treasureTurn ? data.treasureTurn : 0;

            self.showKeyCount = (data.showKeyCount || data.showKeyCount === 0) ? data.showKeyCount : 2;
            self.hasGetKey = data.hasGetKey ? data.hasGetKey : false;


            self.evaulateCount = data.evaulateCount ? data.evaulateCount : 0;
            self.vipWithoutInterstitial = data.vipWithoutInterstitial ? data.vipWithoutInterstitial : 0;
            self.lastFreeDiamondTime = data.lastFreeDiamondTime ? data.lastFreeDiamondTime : 0;




        } else {
            if (GameData.instance.isShowLog()) {
                console.log('数据设置为空，使用脚本初始化的数据')
            }
        }
        if (GameData.instance.isShowLog()) {
            console.log(data);
            console.log(new Date(self.saveTime), new Date(this.getCurTime()))
        }

        this.loadComplete = true;
        this.showGold = this.gold;


        PlatformMgr.hawkeye_registerTime = self.bornTime;
        PlatformMgr.hawkeye_level = self.rankId + 1;

        PlatformMgr.setUserCloudStorage(this.rankStar);
    },

    addHawkeyeFunnelIDs: function (id) {
        if (this.hawkeyeFunnelIDs) {
            if (!Tools.arrContains(this.hawkeyeFunnelIDs, id)) {
                this.hawkeyeFunnelIDs.push(id);
            }
        }
    },

    hawkeyeFunnelcontains: function (id) {
        if (this.hawkeyeFunnelIDs) {
            return Tools.arrContains(this.hawkeyeFunnelIDs, id);
        }
        return false;
    },

    /**
     * 测试redis的方法，游戏切勿调用
     */
    randomRankStar: function () {
        this.randomCount++;
        this.rankStar = Tools.getRandomInt(0, 103);
        this.saveUserData('随机星星数');
        this.updateUserData(() => {
            // 上传数据成功 准备下载数据
            PlatformMgr.k6_downloadData((data) => {
                var userData = null;
                if (data) {
                    userData = JSON.parse(data);
                    if (userData.rankStar && userData.rankStar === this.rankStar) {
                        console.log('download suc and data is right count: ' + this.randomCount);
                        if (this.randomCount > 100) {
                            this.randomCount = 0;
                        } else {
                            this.randomRankStar();
                        }
                    } else {
                        console.log('download suc but data is wrong count: ' + this.randomCount);
                    }

                } else {
                    var loaclData = Tools.getItem('userData' + this.getOsStr());
                    if (loaclData) {
                        userData = JSON.parse(loaclData);
                    }
                }
            });
        });
    },

    saveUserData: function (str) {
        if (GameData.instance.isShowLog()) {
            console.log('saveUserData------', str);
        }
        this.needUpdateUserData = true;
    },

    updateUserData: function (callback) {
        if (this.needUpdateUserData) {
            this.needUpdateUserData = false;
            if (GameData.instance.isShowLog()) {
                console.log('updateUserData------');
            }
            var userData = {
                name: this.name,
                gold: this.gold,
                physical: this.physical,
                physicalBuy: this.physicalBuy,
                dayPhysicalBuyDatas: this.dayPhysicalBuyDatas,
                nftGetOtherwiseRewards: this.nftGetOtherwiseRewards,
                nftRankScore: this.nftRankScore,
                dayOpenAppCount: this.dayOpenAppCount,
                nftRankPlayCount: this.nftRankPlayCount,
                ownKnifeSkins: this.ownKnifeSkins,
                ownHeroSkins: this.ownHeroSkins,
                completeTaskIds: this.completeTaskIds,
                showTaskInGameIds: this.showTaskInGameIds,
                needCheckTaskIds: this.needCheckTaskIds,
                completeRankRewardIds: this.completeRankRewardIds,
                adverCountDatas: this.adverCountDatas,
                knifeSkinId: this.knifeSkinId,
                heroSkinId: this.heroSkinId,
                heroNFTSkinId: this.heroNFTSkinId,
                knifeNFTSkinId: this.knifeNFTSkinId,
                bornTime: this.bornTime,
                saveTime: this.getCurTime(),
                getOfflineGoldTime: this.getOfflineGoldTime,
                lastChangeGoldMultipTime: this.lastChangeGoldMultipTime,
                offlineGoldCount: this.offlineGoldCount,
                allShareCount: this.allShareCount,
                luckyRewardCount: this.luckyRewardCount,
                playCount: this.playCount,
                winCount: this.winCount,
                nftToPlayCount: this.nftToPlayCount,
                nftRankEndTime: this.nftRankEndTime,
                nftLock: this.nftLock,
                nftLock_auto: this.nftLock_auto,
                nftLock_first: this.nftLock_first,
                nftLock_req: this.nftLock_req,
                ABTestCode: this.ABTestCode,
                nftPlayeCount: this.nftPlayeCount,
                nftWinCount: this.nftWinCount,
                dayPlayCount: this.dayPlayCount,
                dayGetPrizeCount: this.dayGetPrizeCount,
                dayWin: this.dayWin,
                dayLoseCount: this.dayLoseCount,
                dayProtectCount: this.dayProtectCount,
                dayGetGoldCount: this.dayGetGoldCount,
                dayKillCount: this.dayKillCount,
                dayTotalPickKnifeCount: this.dayTotalPickKnifeCount,
                dayMaxPickKnifeCount: this.dayMaxPickKnifeCount,
                dayKillKnifeCount: this.dayKillKnifeCount,
                dayWinCount: this.dayWinCount,
                dayRefreshTaskCount: this.dayRefreshTaskCount,
                dayRefreshShareScore: this.dayRefreshShareScore,
                dailyShowTask: this.dailyShowTask,
                dailyOldTask: this.dailyOldTask,
                dayMultAgainCDCount: this.dayMultAgainCDCount,
                dayMultAgainCloseCount: this.dayMultAgainCloseCount,

                dayTotalAdsRevenue: this.dayTotalAdsRevenue,

                bitverseWallet: this.bitverseWallet,

                killCount: this.killCount,
                // level: this.level,
                rankStar: this.rankStar,
                rankId: this.rankId,
                rankScore: this.rankScore,
                hideScore: this.hideScore,

                signCount: this.signCount,
                daySign: this.daySign,
                initSignCount: this.initSignCount,
                iconUrl: this.iconUrl,
                continuityLoseCount: this.continuityLoseCount,
                totalAdverCount: this.totalAdverCount,
                hasCheckNewSkin: this.hasCheckNewSkin,
                receiveRound: this.receiveRound,
                growLevel: this.growLevel,
                hasRepay: this.hasRepay,
                hawkeyeFunnelIDs: this.hawkeyeFunnelIDs,
                completeGuideDailyTask: this.completeGuideDailyTask,
                zongZi: this.zongZi,
                zongZiToDaoBi: this.zongZiToDaoBi,
                shareScore: this.shareScore,
                checkInviteLength: this.checkInviteLength,
                extendOldRank: this.extendOldRank,
                dayShowTop: this.dayShowTop,
                dayRefreshPKReward: this.dayRefreshPKReward,
                dayRefreshWorldReward: this.dayRefreshWorldReward,
                dayFirstEnterPKTop20: this.dayFirstEnterPKTop20,
                subscribeTime: this.subscribeTime,
                daySubscribeReward: this.daySubscribeReward,
                refuseBuyPool: this.refuseBuyPool,
                refuseAdverPool: this.refuseAdverPool,
                keyCount: this.keyCount,
                treasureTurn: this.treasureTurn,
                showKeyCount: this.showKeyCount,
                hasGetKey: this.hasGetKey,
                evaulateCount: this.evaulateCount,
                vipWithoutInterstitial: this.vipWithoutInterstitial,
                lastFreeDiamondTime: this.lastFreeDiamondTime,
            }
            var str = JSON.stringify(userData);
            Tools.setItem('userData' + this.getOsStr(), str);


            PlatformMgr.k6_uploadData(str, callback);


        }


    },

    getUserData: function (callback) {
        const self = this;
        switch (PlatformMgr.platformType) {
            case PlatformType.WECHAT: {
                PlatformMgr.k6_downloadData((data) => {
                        var userData = null;
                        var localData = null;
                        var localDataStr = Tools.getItem('userData' + this.getOsStr());
                        if (localDataStr) localData = JSON.parse(localDataStr);

                        var serverData = null;
                        if (data) serverData = JSON.parse(data);

                        if (serverData && localData) {
                            //获取本地数据比较数据哪个更新，就用哪一个
                            if (serverData.saveTime >= localData.saveTime) {
                                if (GameData.instance.isShowLog()) {
                                    console.log('数据正常，使用服务端数据,服务器时间：', new Date(serverData.saveTime), '本地时间：', new Date(localData.saveTime))
                                }
                                userData = serverData;
                            } else {
                                if (GameData.instance.isShowLog()) {
                                    console.log('服务端数据过老，使用本地数据,服务器时间：', new Date(serverData.saveTime), '本地时间：', new Date(localData.saveTime))
                                }
                                userData = localData;
                            }
                        } else if (serverData) {
                            if (GameData.instance.isShowLog()) {
                                console.log('本地数据为空，使用服务端数据')
                            }
                            userData = serverData;
                        } else {
                            if (GameData.instance.isShowLog()) {
                                console.log('服务端数据为空，使用本地数据')
                            }
                            userData = localData;
                        }

                        self.setData(userData);
                        if (callback) callback();
                    },
                    () => {
                        //发行sdk的数据获取失败情况处理
                        var userData = null;
                        var loaclData = Tools.getItem('userData' + this.getOsStr());
                        if (loaclData) {
                            if (GameData.instance.isShowLog()) {
                                console.log('发行sdk获取数据失败，使用本地数据')
                            }
                            userData = JSON.parse(loaclData);
                        }
                        self.setData(userData);
                        if (callback) callback();
                    });

                break;
            }
            default: {
                var userData = null;
                var loaclData = Tools.getItem('userData' + this.getOsStr());
                if (loaclData) {
                    userData = JSON.parse(loaclData);
                }
                self.setData(userData);
                if (callback) callback();
                break;
            }
        }
    },

    getOsStr: function () {
        return PlatformMgr.isIOS() ? 'ios' : '';
    },

    resetDataToDefault: function () {
        var defaultData = {

            name: 'player',
            gold: 200,
            physical: 20,
            physicalBuy: 0,
            dayPhysicalBuyDatas: [0, 0],
            nftGetOtherwiseRewards: [0, 0],
            nftRankScore: 0,
            dayOpenAppCount: 0,
            nftRankPlayCount: 0,
            knifeSkinId: 1,
            heroSkinId: 1,
            heroNFTSkinId: 16,
            knifeNFTSkinId: 102,
            ownKnifeSkins: [1],
            ownHeroSkins: [1],
            growLevel: [0, 0, 0, 0, 0],
            //建号时间
            bornTime: 0,
            saveTime: 0,
            //游戏场次
            playCount: 0,
            winCount: 0,
            nftToPlayCount: 0,
            nftLock: 0,
            nftLock_req: 0,
            nftLock_auto: 0,
            nftLock_first: 0,
            ABTestCode: "",
            nftPlayeCount: 0,
            nftWinCount: 10,
            //每日任务参数
            dayKillCount: 0,
            dayTotalPickKnifeCount: 0,
            dayMaxPickKnifeCount: 0,
            dayKillKnifeCount: 0,
            dayPlayCount: 0,
            dayGetPrizeCount: 0,
            dayWinCount: 0,
            dayRefreshTaskCount: 0,
            // 当日连输局数
            dayLoseCount: 0,
            // 当日是否赢
            dayWin: false,
            //当日保级/保星次数
            dayProtectCount: 0,
            //击杀人数
            killCount: 0,
            allShareCount: 0,
            luckyRewardCount: 0,
            // level: 0,
            rankStar: 0,
            rankId: 0,
            rankScore: 0,
            hideScore: 0,

            signCount: 0,
            daySign: false,
            initSignCount: false,
            iconUrl: Tools.getRandomInt(1, 7),

            adverCountDatas: [],
            continuityLoseCount: 0,
            totalAdverCount: 0,
            hawkeyeFunnelIDs: [],
            bitverseWallet: "",
        };
        this.setData(defaultData);
        this.saveUserData('清号');
        this.clearTempData();
    },



    isOwnKnifeSkin: function (id) {
        return Tools.arrContains(this.ownKnifeSkins, id);
    },

    isOwnHeroSkin: function (id) {
        return Tools.arrContains(this.ownHeroSkins, id) || (this.isSubscribe() && id === 8);
    },

    isOwnSuit: function (id) {
        var data = ConfigData.instance.getSuitData(id);
        return this.isOwnHeroSkin(data.heroSkin) && this.isOwnKnifeSkin(data.knifeSkin);
    },

    addKnifeSkin: function (id) {
        this.ownKnifeSkins.push(id);
        this.saveUserData('得刀皮肤');
    },

    addHeroSkin: function (id) {
        this.ownHeroSkins.push(id);
        this.saveUserData('得英雄皮肤');
    },

    addCompleteTask: function (id) {
        this.completeTaskIds.push(id);
        this.needCheckTaskIds.push(id);
        this.saveUserData('任务完成');
    },

    addShowTask: function (id) {
        this.showTaskInGameIds.push(id);
        this.saveUserData('任务游戏内展示')
    },

    addCompleteRankReward: function (id) {
        this.completeRankRewardIds.push(id);
        this.saveUserData('段位任务完成');
    },

    //needSave是因为在商店关闭时才需要保存，不然频繁切换皮肤就会频繁触发数据上行
    updateKnifeSkin: function (skin, needSave) {
        if (this.knifeSkinId !== skin.id) {
            this.knifeSkin = skin;
            if (skin.getWay == 100) {
                this.knifeNFTSkinId = skin.id
            } else {
                this.knifeSkinId = skin.id;
            }
            this.isDirtyKnifeSkin = true;
        }
        if (needSave && this.isDirtyKnifeSkin) {
            this.saveUserData('更换刀皮肤');
            this.isDirtyKnifeSkin = false;
        }
    },

    updateHeroSkin: function (skin, needSave) {
        if (this.heroSkinId !== skin.id) {
            this.heroSkin = skin;
            if (skin.getWay == 100) {
                this.heroNFTSkinId = skin.id
            } else {
                this.heroSkinId = skin.id;
            }

            this.isDirtyHeroSkin = true;
        }

        if (needSave && this.isDirtyHeroSkin) {
            this.saveUserData('更换角色皮肤');
            this.isDirtyHeroSkin = false;
        }
    },


    setExtraKnife: function (count) {
        this.extraKnifeCount = count;
        this.isExtraKnife = count > 0;
    },

    addExtraKnife: function (count) {
        this.extraKnifeCount += count;
    },

    clearTempData: function () {
        Tools.setItem('fromMyApp', '');
        Tools.setItem('trySkinData', '');
        Tools.setItem('luckyRewardData', '');
    },


    setTrySkinData: function (data) {
        data.trySkinCount++;
        data.lastTryPlayCount = this.dayPlayCount;
        var str = JSON.stringify(data);
        Tools.setItem('trySkinData', str);
    },

    getTrySkinData: function () {
        var data = {};
        var str = Tools.getItem('trySkinData');
        if (str) {
            data = JSON.parse(str);
        } else {
            data.trySkinCount = 0;
            data.lastTrySkinType = 0;
            data.lastTryPlayCount = 0;
        }
        return data;
    },

    setLuckyRewardData: function (count) {
        Tools.setItem('luckyRewardData', count);
    },

    getLuckyRewardData: function () {
        var str = Tools.getItem('luckyRewardData');
        return str ? Number(str) : 0;
    },

    updateGold: function (num, getGoldParam, isDelay = false) {
        this.gold += num;
        this.showGold += num;
        if (getGoldParam) {
            this.getGoldParam = getGoldParam;
        }
        if (isDelay) {
            this.delaySaveDataTime = 3;
        } else {
            this.saveUserData('更新钱');
        }
    },

    updateName: function (str) {
        this.name = str;
        this.saveUserData('更新名字');
    },

    updateShareCount: function () {
        this.allShareCount++;
        this.saveUserData('更新分享');
    },

    updateLuckyRewardCount: function () {
        this.luckyRewardCount++;
        this.saveUserData('更新幸运大奖次数');
    },

    isFristGame: function () {
        return this.playCount === 0;
    },

    isSecGame: function () {
        return this.playCount === 1;
    },

    canShowPanelSign: function () {
        return this.playCount >= 5;
    },

    canShowPanelAddTop: function () {
        if (PlatformMgr.isApp()) {
            return false;
        }
        //玩过一次游戏（第二次进主而）
        if (!this.hasPlayOnceGame) {
            return false;
        }
        //奖励已领取）
        if (this.hasGetAddTopReward()) {
            return false;
        }
        //今日已经弹出过一次
        if (this.dayShowTop) {
            return false;
        }
        //大于四局
        if (this.playCount >= 4) {
            if (this.isFirstDay()) {
                return true;
            } else {
                if (this.dayPlayCount >= 1) {
                    return true;
                }
            }
        }
        return false;
    },

    canShowBtnAddTop: function () {
        return this.playCount >= 4 && !this.hasGetAddTopReward();
    },

    canShowBtnHoliday: function () {
        return ConfigData.instance.isDuringHolidayRankBtnShowTime(this.getCurTime());
    },

    canShowPanelHolidayRank: function () {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>开始判定是否自动弹出暑期排行界面')

        if (!this.canShowBtnHoliday()) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>不在活动期间，不弹出')
            return false;
        }

        // if (!Tools.getItem('userinfoBtn')) {
        //     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>未授权，不弹出')
        //     return false;
        // }

        if (this.playCount < 1) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>新手第一局，不弹出')
            return false;
        }

        if (this.checkHourSpan()) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>跨特定时间，弹出')
            return true;
        }

        if (this.perPlayCount === 1) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>每次登录游戏第一局出来，弹出')
            return true;
        }

        if (!this.myPKRankData) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>没有获取到我的小组排名数据，不弹出')
            return false;
        }

        if (this.myPKRankData.rank <= 20 && !this.dayFirstEnterPKTop20) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>每天第一次进前20，弹出')
            this.updateDayFirstEnterPKTop20();
            return true;
        }

        if (!this.myOldPKRankData) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>没有获取到我上次的小组排名数据，不弹出')
            return false;
        }

        if (this.myPKRankData.rank <= 20) {
            if (this.myPKRankData.rank < this.myOldPKRankData.rank) {
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>前20并且排名提升，弹出')
                return true;
            }
        } else {
            if (this.myOldPKRankData.rank - this.myPKRankData.rank >= 10) {
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>不在前20并且排名提升超过十位，弹出')
                return true;
            }
        }

        if (this.myOldPKRankData.rank === 1 && this.myPKRankData.rank > 1) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>之前是第一名并且掉落位置，弹出')
            return true;
        }
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>以上条件均不满足，不弹出')
        return false;
    },

    onGameOver: function (player) {

        this.hasPlayOnceGame = true;

        var rank = player.rank;

        this.lastOnceGameRank = rank

        this.setExtraKnife(0);
        this.playCount++;
        // this.refreshUnlockGrow();
        this.perPlayCount++;
        this.dayPlayCount++;
        this.dayKillCount += player.killNum;
        this.dayTotalPickKnifeCount += player.pickKnifeCount;
        this.dayMaxPickKnifeCount = Math.max(this.dayMaxPickKnifeCount, player.maxPickKnifeCount);
        this.dayKillKnifeCount += player.killKnifeCount;
        this.dayWinCount = rank === 1 ? this.dayWinCount + 1 : 0;
        this.dayLoseCount = rank === 1 ? 0 : this.dayLoseCount + 1;
        this.continuityLoseCount = rank === 1 ? 0 : this.continuityLoseCount + 1;
        this.winCount = rank === 1 ? this.winCount + 1 : this.winCount

        if (rank === 1 && !this.dayWin) {
            this.dayWin = true;
        }
        this.updateDayMultAgainCDCount();
        this.updateShowKeyCount();
        this.updateEvaulateCount();
        // if (this.isFirstDay()) {
        //     PlatformMgr.enlinkerGameNumber();
        // }

        // const timestamp = Tools.getMilliTime();
        // const time = Math.floor((timestamp - this._startGameTimestamp) / 1000);
        // PlatformMgr.hawkeye_report_game(time);


        for (let task of this.dailyShowTask) {
            // task.lastProcess = task.process;
            switch (task.type) {
                case DailyTaskType.KILL_COUNT:
                    task.process += player.killNum;
                    break;
                case DailyTaskType.TOTAL_PICK_KNIFE_COUNT:
                    task.process += player.pickKnifeCount;
                    break;
                case DailyTaskType.MAX_PICK_KNIFE_COUNT:
                    task.process = Math.max(task.process, player.maxPickKnifeCount);
                    break;
                case DailyTaskType.KILL_KNIFE_COUNT:
                    task.process += player.killKnifeCount;
                    break;
                case DailyTaskType.PLAY_COUNT:
                    task.process++;
                    break;
                case DailyTaskType.WIN_COUNT:
                    if (rank === 1) {
                        task.process++;
                    }
                    break;
            }
        }


        // this.setHolidayScore(player.killNum);
        // this.setHolidayScore(20);
        this.saveUserData('更新游戏结束');

        this.lastBattleMode = this.currentBattleMode
        if (this.currentBattleMode == BattleModeType.NFT_RANK) {
            this.nftRankPlayCount++
            // this.currentBattleMode = BattleModeType.Normal
            this.updateNftRankScore(this.nftRankScores[rank - 1] + this.getSkinScoreAdd())

            this.setHolidayScore(this.nftRankScore);
        }
    },

    onStartGame: function () {
        this._startGameTimestamp = Tools.getMilliTime();
    },

    refreshUnlockGrow: function () {
        var growLimit = ConfigData.instance.clientData.growLimit;
        if (this.playCount === growLimit[0]) {
            this.showUnlockGrow = 1;
        } else if (this.playCount === growLimit[1]) {
            this.showUnlockGrow = 2;
        }
    },

    getCurTime: function () {
        return Number(new Date().getTime()) - PlatformMgr.timeDefence + this.cheatOffset + this.timeOffset;
    },

    getCurWeekDay: function () {
        return new Date(this.getCurTime()).getDay();
    },

    //返回上次存储离线金币点距离现在的时间，单位秒
    getOfflineTime: function () {
        var curTime = this.getCurTime();
        if ((curTime - this.getOfflineGoldTime) > 86400000) {
            curTime = this.getOfflineGoldTime + 86400000;
        };
        var offset = (this.lastChangeGoldMultipTime - this.getOfflineGoldTime) % this.offlineGoldInterval;
        var time = curTime - (this.lastChangeGoldMultipTime - offset);
        // console.log('getOfflineTime', new Date(curTime), 'phoneTime', new Date(), 'timeDeferent', PlatformMgr.timeDefence)
        return time > 0 ? time : false;
    },

    getFinalOfflineGold: function () {
        var newCount = Math.floor(this.getOfflineTime() / this.offlineGoldInterval)
        var data = this.getGrowLevelDataByType(GrowType.Gold);
        var rate = data.realOfflineParam / 100 + 1;
        var finalGold = Math.floor((this.offlineGoldCount + newCount * this.offlineGoldNormalCount * rate) * 10) / 10;
        // console.log('newCount', newCount, 'rate', rate, 'oldCount', this.offlineGoldCount, 'finalGold', finalGold);
        return finalGold;
    },

    getReceiveOfflineGoldTime: function () {
        var time = this.getCurTime() - this.getOfflineGoldTime
        return time > 86400000 ? 86400000 : time;
    },

    getTaskProcess: function (type) {
        var process = 0;
        switch (type) {
            case TaskType.LOGIN:
                process = this.signCount + 1;
                break;
            case TaskType.PLAYCOUNT:
                process = this.playCount;
                break;
            case TaskType.KILLCOUNT:
                process = this.killCount;
                break;
            case TaskType.RANK:
                process = this.rankData.id;
                break;
            case TaskType.ADVERCOUNT:
                process = this.totalAdverCount;
                break;
        }
        return process;
    },

    getDailyTaskProcess: function (type) {
        var process = 0;
        switch (type) {
            case DailyTaskType.KILL_COUNT:
                process = this.dayKillCount;
                break;
            case DailyTaskType.TOTAL_PICK_KNIFE_COUNT:
                process = this.dayTotalPickKnifeCount;
                break;
            case DailyTaskType.MAX_PICK_KNIFE_COUNT:
                process = this.dayMaxPickKnifeCount;
                break;
            case DailyTaskType.KILL_KNIFE_COUNT:
                process = this.dayKillKnifeCount;
                break;
            case DailyTaskType.PLAY_COUNT:
                process = this.dayPlayCount;
                break;
            case DailyTaskType.WIN_COUNT:
                process = this.dayWinCount;
                break;
        }
        return process;
    },

    saveUserCidData: function () {
        var userData = {
            saveTime: this.getCurTime(),
            cids: PlatformMgr.oldVisitCids
        }
        var str = JSON.stringify(userData);
        Tools.setItem('userCidData', str);
    },

    loadUserCidData: function () {
        var loaclData = Tools.getItem('userCidData');
        if (loaclData) {
            const userData = JSON.parse(loaclData);

            const count = userData.saveTime ? Tools.getRealDayTimeCount(userData.saveTime, this.getCurTime()) : 2;
            if (count >= 2) {
                PlatformMgr.oldVisitCids = [];
            } else {
                PlatformMgr.oldVisitCids = userData.cids ? userData.cids : [];
            }
        }
    },


    checkDaySpan: function () {
        console.log('---------------------------checkDaySpan');
        var curTime = this.getCurTime()
        if (GameData.instance.isShowLog()) {
            console.log('---------------------------检查是否跨天');
            console.log('---------------------------上次时间：', new Date(this.saveTime));
            console.log('---------------------------现在时间：', new Date(curTime));
        }
        if (Tools.isDaySpan(this.saveTime, curTime)) {
            this.updateSaveTime();
            this.onDaySpan();
            return true;
        }
        // return true;
    },

    //跨小时重新拉取世界排行榜
    checkHourSpan: function () {
        var curTime = this.getCurTime();
        if (GameData.instance.isShowLog()) {
            console.log('---------------------------检查是否跨特定小时', JSON.stringify(ConfigData.instance.holidayDatas.refreshWorldTime));
            console.log('---------------------------上次时间：', new Date(this.saveTime));
            console.log('---------------------------现在时间：', new Date(curTime));
        }
        let hours = [
            9,
            12,
            15,
            18,
            21,
            24,
            0
        ]
        // if (Tools.isHourSpan(this.saveTime, curTime, ConfigData.instance.holidayDatas.refreshWorldTime)) {
        //     return true;
        // }
        if (Tools.isHourSpan(this.saveTime, curTime, hours)) {
            return true;
        }
    },


    onDaySpan: function () {
        console.log('---------------------------onDaySpan');

        this.dayTotalAdsRevenue = 0
        this.dayCanReportTotalAdsRevenue = true

        this.dayKillCount = 0;
        this.dayTotalPickKnifeCount = 0;
        this.dayMaxPickKnifeCount = 0;
        this.dayKillKnifeCount = 0;
        this.dayPlayCount = 0;
        this.dayWinCount = 0;
        this.dayRefreshTaskCount = 0;
        this.dayGetPrizeCount = 0;
        if (!PlayerData.instance.isDuringDailyTaskGuide()) {
            for (let task of this.dailyShowTask) {
                task.process = 0;
            }
            this.dailyShowTask = [];
        }

        this.dailyOldTask = [];

        this.dayGetGoldCount = 0;
        this.dayProtectCount = 0;
        this.updateDayMultAgainCDCountFlag = true;
        // this.dayMultAgainCDCount = ConfigData.instance.clientData.dayMultAgainCDCount;
        this.dayMultAgainCloseCount = 0;

        this.dayLoseCount = 0;
        this.dayWin = false;
        if (this.daySign) {
            this.signCount++;
        }
        this.daySign = false;
        this.dayShowTop = false;
        this.dayRefreshPKReward = false;
        this.dayRefreshWorldReward = false;
        this.dayRefreshShareScore = false;
        this.dayFirstEnterPKTop20 = false;

        this.daySubscribeReward = false;
        this.loadComplete = true;

        this.dayOpenAppCount = 0

        this.physical = 20

        //体力购买限制
        this.dayPhysicalBuyDatas = [0, 0]

        PlatformMgr.syncNFTRankPlayerInfo(PlayerData.instance.bitverseWallet)

        Tools.setItem('trySkinData', '');
        this.saveUserData('跨天');
    },

    protectLevel: function (level) {
        var ret = level;

        if (this.dayLoseCount >= 3) {
            // 连输
            ret = ret > ConfigData.instance.defaultLevel ? ConfigData.instance.defaultLevel : ret - 2;
            ret = ConfigData.instance.clampLevel(ret);
            return ret;
        }

        if (this.dayPlayCount === 0 || !this.dayWin) {
            // 今天第一把 或者 今天还没有赢过
            ret -= 2;
            ret = ConfigData.instance.clampLevel(ret);
            return ret;
        }

        return ret;
    },


    clearNeedCheckTaskIds: function () {
        if (this.needCheckTaskIds && this.needCheckTaskIds.length > 0) {
            this.needCheckTaskIds = [];
            this.saveUserData('刷新可解锁的任务id');
        }
    },

    updateDayProtectCount: function () {
        this.dayProtectCount++;
        this.saveUserData('更新保星保级次数');
    },

    updateSignCount: function () {
        this.daySign = true;
        this.saveUserData('更新签到');
    },

    updateDayShowTop: function () {
        this.dayShowTop = true;
        this.saveUserData('更新展示置顶');
    },

    updateDayRefreshPKReward: function () {
        this.dayRefreshPKReward = true;
        this.saveUserData('更新小组PK奖励领取');
    },

    updateDayRefreshWorldReward: function () {
        this.dayRefreshWorldReward = true;
        this.saveUserData('更新世界PK奖励领取');
    },

    updateDayFirstEnterPKTop20: function () {
        this.dayFirstEnterPKTop20 = true;
        this.saveUserData('更新小组PK每日首次进前20');
    },


    updateIconUrl: function (iconUrl) {
        this.iconUrl = iconUrl;
        this.saveUserData('更新头像');
    },

    updateAdverCountData: function (id) {
        var lastCount = this.adverCountDatas[id] ? this.adverCountDatas[id] : 0;
        this.adverCountDatas[id] = lastCount + 1;
        this.saveUserData('更新累计看广告次数');
    },

    updateTotalAdverCount: function () {
        this.totalAdverCount++;
        this.changeAdverCount++;
        this.saveUserData('更新累计看广告次数');
    },

    isFirstDay: function () {
        return Tools.getRealDayTimeCount(this.bornTime, this.getCurTime()) === 1;
    },

    isSecondDay: function () {
        return Tools.getRealDayTimeCount(this.bornTime, this.getCurTime()) === 2;
    },

    bornDay: function () {
        return Tools.getRealDayTimeCount(this.bornTime, this.getCurTime());
    },



    updateContinuityLoseCount: function () {
        this.continuityLoseCount = 0;
        this.saveUserData('更新连败次数');
    },

    updateNewKnifeSkinCheck: function () {
        var newCheck = false;
        for (const data of ConfigData.instance.knifeSkinDatas) {
            var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, this.getCurTime());
            var id = data.id;
            if (isNew && !Tools.arrContains(this.hasCheckNewSkin, id)) {
                this.hasCheckNewSkin.push(id)
                newCheck = true;
            }
        }
        if (newCheck) {
            this.saveUserData('更新已经查看过的新武器皮肤');
        }
    },

    updateNewHeroSkinCheck: function () {
        var newCheck = false;
        for (const data of ConfigData.instance.heroSkinDatas) {
            var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, this.getCurTime());
            var id = 10000 + data.id;
            if (isNew && !Tools.arrContains(this.hasCheckNewSkin, id)) {
                this.hasCheckNewSkin.push(id);
                newCheck = true;
            }
        }
        if (newCheck) {
            this.saveUserData('更新已经查看过的新角色皮肤');
        }
    },


    updateGrowLevel: function (type) {
        if (type === GrowType.Gold) {
            this.offlineGoldCount = this.getFinalOfflineGold();
            this.lastChangeGoldMultipTime = this.getCurTime();
        }
        this.growLevel[type] += 1;
    },

    checkDelayUpdateData: function (dt) {
        if (this.delaySaveDataTime > 0) {
            this.delaySaveDataTime -= dt;
            // console.log('延迟更新', this.delaySaveDataTime);
            if (this.delaySaveDataTime <= 0) {
                this.delaySaveDataTime = 0;
                this.needUpdateUserData = true;
            }
        }
    },


    getGrowLevel: function (type) {
        return this.growLevel[type];
    },

    getGrowLevelDataByType: function (type) {
        var level = this.growLevel[type];
        var data = ConfigData.instance.getGrowLevelData(type, level);
        return data;
    },

    updateGetOfflineGoldTime: function () {
        var curTime = this.getCurTime();
        this.getOfflineGoldTime = curTime - (curTime - this.getOfflineGoldTime) % this.offlineGoldInterval;
        this.lastChangeGoldMultipTime = this.getOfflineGoldTime;
        this.offlineGoldCount = 0;
        this.saveUserData('更新领取离线收益时间');
    },

    // getLevelRealParamByType: function (type) {
    //     var data = this.getGrowLevelDataByType(type)
    //     return data ? data.realParam : false;
    // },
    updateRepay: function () {
        this.hasRepay = true;
        this.saveUserData('更新领取赔偿')
    },
    updateZongZiToDaoBi: function () {
        this.zongZiToDaoBi = true;
        this.saveUserData('更新粽子转换钻石')
    },



    updateDayGetPrizeCount: function (way) {
        this.dayGetPrizeCount++
        this.saveUserData('更新获取奖励次数通过 ' + way)
    },

    updateDailyShowTask: function () {
        this.dailyShowTask = ConfigData.instance.getDailyShowTask(this);
        for (let data of this.dailyShowTask) {
            data.goldMultiRate = this.rankData.goldMultiRate;
        }
        this.saveUserData('更新展示任务')
    },

    updateDailyOldTask: function (id) {
        if (this.dailyOldTask.indexOf(id) === -1) {
            this.dailyOldTask.push(id);
            this.saveUserData('更新已经展示过的任务')
        }
    },

    updateCompleteGuideDailyTask: function (id) {
        this.completeGuideDailyTask.push(id);;
        if (this.completeGuideDailyTask.length === 3) {
            this.updateDailyShowTask();
        }
        this.saveUserData('更新新手任务完成')
    },

    updateZongZi: function (num) {
        this.zongZi += num;
        this.saveUserData('更新种子数量')
    },

    updateDayRefreshTaskCount: function () {
        this.dayRefreshTaskCount++;
        this.saveUserData('更新每日刷新任务数量')
    },

    updateDayRefreshShareScore: function (score) {
        this.shareScore = score;
        this.dayRefreshShareScore = true;
        this.saveUserData('更新每日刷新分享积分标志位')
    },

    isDuringDailyTaskGuide: function () {
        return this.completeGuideDailyTask.length !== 3;
    },

    canShowMultAgain: function () {

        var dayMultAgainMinPlayCount = ConfigData.instance.clientData.dayMultAgainMinPlayCount;
        if (this.playCount < ConfigData.instance.clientData.dayMultAgainMinPlayCount) {
            if (GameData.instance.isShowLog()) {
                console.log('战斗未满' + dayMultAgainMinPlayCount + '场，不弹二次翻倍')
            }
            return false
        }

        if (this.dayMultAgainCDCount > 0) {
            if (GameData.instance.isShowLog()) {
                console.log('冷却中，不弹二次翻倍')
            }
            return false;
        }

        if (this.dayMultAgainCloseCount >= 2) {
            if (GameData.instance.isShowLog()) {
                console.log('累计两次手动关闭，不弹二次翻倍')
            }
            return false;
        }

        return true
    },

    updateDayMultAgainCDCount: function () {
        if (this.dayMultAgainCDCount > 0) {
            this.dayMultAgainCDCount--;
        }
        this.saveUserData('更新每日 二次翻倍 冷却数')
    },


    resetDayMultAgainCDCount: function (count) {
        this.dayMultAgainCDCount = count + 1;
        this.saveUserData('重置每日 二次翻倍 冷却数')
    },

    updateDayMultAgainCloseCount: function () {
        this.dayMultAgainCloseCount++;
        this.saveUserData('更新每日 二次翻倍 关闭数')
    },

    updateShareScore: function () {
        this.shareScore--;
        this.saveUserData('更新每日分享分数 减一')
    },

    updateCheckInviteLength: function () {
        if (this.checkInviteLength < PlayerData.instance.inviteDatas.length) {
            this.checkInviteLength = PlayerData.instance.inviteDatas.length;
            this.saveUserData('查看新邀请朋友')
        }
    },

    hasGetInviteReward: function () {
        return this.isOwnHeroSkin(11);
    },

    hasGetAddTopReward: function () {
        return this.isOwnKnifeSkin(32);
    },

    canGetAddTopReward: function () {
        return Tools.getItem('fromMyApp')
    },

    isCurEquipHeroSkin: function (id) {
        return this.heroSkinId === id;
    },

    isCurEquipKnifeSkin: function (id) {
        return this.knifeSkinId === id;
    },

    canShowPanelDailyTask: function () {
        if (this.isDuringDailyTaskGuide()) {
            for (let data of this.dailyShowTask) {
                // var isComplete = PlayerData.instance.getDailyTaskProcess(data.type) >= data.param;
                var isComplete = data.process >= data.param;
                var isGet = Tools.arrContains(PlayerData.instance.dailyOldTask, data.id) || Tools.arrContains(PlayerData.instance.completeGuideDailyTask, data.id)
                var hasShow = data.hasShow;

                if (!isComplete) {
                    return false;
                }
                if (hasShow) {
                    return false;
                }
            }
            return true;
        } else {
            for (let data of this.dailyShowTask) {
                // var isComplete = PlayerData.instance.getDailyTaskProcess(data.type) >= data.param;
                var isComplete = data.process >= data.param;
                var isGet = Tools.arrContains(PlayerData.instance.dailyOldTask, data.id) || Tools.arrContains(PlayerData.instance.completeGuideDailyTask, data.id)
                var hasShow = data.hasShow;
                if (isComplete && !isGet && !hasShow) {
                    return true
                }
            }
            return false;

        }

    },

    needUpdatePKRank: function () {
        // if (this.refreshWorldRankAtOnce) {
        //     this.refreshWorldRankAtOnce = false;
        //     if (GameData.instance.isShowLog()) {
        //         console.log('---------------------------强制刷新小组榜')
        //     }
        //     return true;
        // }

        if (GameData.instance.isShowLog()) {
            console.log('---------------------------小组PK榜刷新间隔：' + ConfigData.instance.holidayDatas.holidayPKRankInterval)
            console.log('---------------------------距离上次刷新小组PK榜的时间：' + this.updatePKRankTime)
        }
        if (this.updatePKRankTime > ConfigData.instance.holidayDatas.holidayPKRankInterval) {
            this.updatePKRankTime = 0;
            return true;
        } else {
            return false;
        }
    },


    getHolidayPKRank: function (callback) {
        console.log('---------------------------------------------------------------------------------')
        var hasData = this.holidayPKRankData && this.holidayPKRankData.rankInfo && this.holidayPKRankData.rankInfo.length && this.myPKRankData;
        if (hasData && !this.needUpdatePKRank()) {
            if (GameData.instance.isShowLog()) {
                console.log('---------------------------使用本地小组PK榜')
            }
            callback(this.holidayPKRankData, this.myPKRankData);
        } else {
            if (GameData.instance.isShowLog()) {
                if (!hasData) {
                    console.log('---------------------------本地小组PK榜为空')
                } else {
                    console.log('---------------------------需要刷新小组PK榜')
                }
                console.log('---------------------------拉取小组PK榜')
            }
            PlatformMgr.getHolidayPKRank((data) => {
                this.myPKRankData = this.handleHolidayRankData(data);
                this.holidayPKRankData = data;
                this.pkSurplusTime = data.surplusTime;
                if (GameData.instance.isShowLog()) {
                    console.log('---------------------------我的小组PK信息')
                    console.log(JSON.stringify(this.myPKRankData));
                }
                callback(data, this.myPKRankData);
            })
        }
    },

    needUpdateWorldRank: function () {
        // if (this.refreshWorldRankAtOnce) {
        //     this.refreshWorldRankAtOnce = false;
        //     return true;
        // }
        if (this.checkHourSpan()) {
            this.updateSaveTime();
            return true;
        }
    },

    //拉取NFT RANK
    getHolidayWorldRank: function (round, callback, restore = false) {
        console.log('---------------------------------------------------------------------------------')
        var isHourSpanRefresh = this.needUpdateWorldRank(); //检查是否跨整点
        var hasData = this.holidayWorldRankData[round] && this.myWorldRankData;
        if (hasData && !isHourSpanRefresh) {
            console.log('---------------------------使用本地世界PK榜：' + round + '轮')
            this.myWorldRankData = this.handleHolidayRankData(this.holidayWorldRankData[round])
            if (!this.myWorldRankData) {
                if (this.bitverseWallet == "") {
                    this.myWorldRankData = {}
                    this.myWorldRankData.rank = -1;
                    this.myWorldRankData.isLocal = true;
                    this.myWorldRankData.score = this.nftRankScore
                } else {
                    this.rankLocalModify(false)
                }
                console.log("本地，没找到自己,塞进本地排行", this.myWorldRankData.score, this.myWorldRankData.rank, this.nftRankScore)
            }
            callback(this.holidayWorldRankData[round], this.myWorldRankData, isHourSpanRefresh);
        } else {

            if (!hasData) {
                console.log('---------------------------本地世界PK榜：' + round + '轮为空')
            }
            if (isHourSpanRefresh) {
                console.log('---------------------------跨小时需要刷新世界PK榜')
            }
            console.log('---------------------------拉取世界PK榜：' + round + '轮')

            PlatformMgr.getHolidayWorldRank(round, (data) => {
                var mineData = this.handleHolidayRankData(data);

                PlayerData.instance.nftRankEndTime = PlayerData.instance.getCurTime() + data.surplusTime
                console.log(" 结束时间 ", PlayerData.instance.nftRankEndTime)
                this.holidayWorldRankData[round] = data;

                // round = 1; //先测试默认第一轮 
                if (round === 0) { //设计有多少轮
                    if (!mineData) {
                        // mineData = {}
                        // mineData.rank = -1;
                        // mineData.isLocal = true;
                        // this.myWorldRankData = mineData;
                        if (this.bitverseWallet == "") {
                            this.myWorldRankData = {}
                            this.myWorldRankData.rank = -1;
                            this.myWorldRankData.isLocal = true;
                            this.myWorldRankData.score = this.nftRankScore
                        } else {
                            this.rankLocalModify(restore)
                            console.log("世界，没找到自己,塞进本地排行", this.myWorldRankData.score, this.myWorldRankData.rank, this.nftRankScore)
                        }
                    } else {
                        this.myWorldRankData = Tools.copyObj(mineData);
                        this.nftRankScore = this.myWorldRankData.score
                    }
                    this.maxWorldRound = data.round; //最大轮次
                    this.worldSurplusTime = data.surplusTime; // 剩余时间
                }
                callback(this.holidayWorldRankData[round], this.myWorldRankData, isHourSpanRefresh);
                // 'score' => $sql->score,
                // 'rank' => 0, //客户端排序
                // 'id' => $sql->uid,
                // 'adress' => $sql->adress
            })
        }
    },

    handleHolidayRankData: function (data) {
        var mine = null;
        if (data && data.rankInfo) {
            var rankInfo = data.rankInfo;
            rankInfo.sort((a, b) => {
                return b.score - a.score;
            });
            for (let i = 0, l = rankInfo.length; i < l; i++) {
                rankInfo[i].rank = i + 1;
                if (rankInfo[i].adress == PlayerData.instance.bitverseWallet) {
                    mine = rankInfo[i];
                    mine.isLocal = true;
                }
            }
            return mine;
        }
        return mine;
    },

    setHolidayScore: function (num) {
        if (GameData.instance.isShowLog()) {
            console.log('---------------------------新增排行榜分数：' + num)
        }

        console.log('---------------------------新增排行榜分数：' + num)

        let heroid = PlayerData.instance.heroNFTSkinId
        let weaponid = PlayerData.instance.knifeNFTSkinId

        PlatformMgr.setHolidayScore(PlayerData.instance.bitverseWallet, num, heroid, weaponid);
        // if (this.myPKRankData) {
        //     this.myPKRankData.score += num;
        //     this.myOldPKRankData = Tools.copyObj(this.myPKRankData);
        // }
        if (this.myWorldRankData) {
            this.myWorldRankData.score = this.nftRankScore
        }

        if (this.holidayPKRankData) this.handleHolidayRankData(this.holidayPKRankData);
    },

    updateReceiveRound: function (round, isPK) {
        var key = (isPK ? 'pk-' : 'world-') + round;
        this.receiveRound.push(key);
        this.saveUserData('更新轮次奖励领取')
    },

    hasReceivePKRound: function (round) {
        return Tools.arrContains(this.receiveRound, 'pk-' + round);
    },

    hasReceiveWorldRound: function (round) {
        return Tools.arrContains(this.receiveRound, 'world-' + round);
    },

    updateSaveTime: function () {
        this.saveTime = this.getCurTime();
        this.saveUserData('跨小时');
    },

    clearHolidayData: function () {
        if (GameData.instance.isShowLog()) {
            console.log('---------------------------清空排行数据，强制刷新')
        }

        this.holidayPKRankData = null;
        this.holidayWorldRankData = [];
        this.myPKRankData = null;
        this.myWorldRankData = null;
        this.myOldPKRankData = null;
        this.myOldWorldRankData = null;
    },

    updateWorldRewardDetail: function () {
        PlatformMgr.getHolidayWorldRewardInfo((data) => {
            this.playerWorldRewardDetail = data;
        });
    },


    updateSubscribeTime(time) {
        //之后修改为通过接口获取订阅时间戳
        this.subscribeTime = time + 86400000 * (3 + 7);
        this.saveUserData('更新订阅时间')
    },

    updateDaySubscribeReward: function () {
        this.daySubscribeReward = true;
        this.saveUserData('更新每日订阅奖励发放');
    },

    /**
     * 是否订阅，调用此接口判断是否启用特殊功能
     */
    isSubscribe: function () {
        // return true;
        // console.log("是否订阅",this.subscribeTime,this.getCurTime())
        return this.subscribeTime > this.getCurTime();
    },

    getCountry: function () {
        this.country = PlatformMgr.getCountry();
        this.languageCode = PlatformMgr.getLanguageCode();
    },



    canShowPanelBuySkin: function () {

        // return false;
        if (!this.hasPlayOnceGame) {
            // console.log('！！！！！！！！！！！！还没打过一局，不弹出购买皮肤面板')
            return false;
        } else {
            this.hasPlayOnceGame = false;
        }

        if (!this.showPanelBuySkinFlag) {
            // console.log('！！！！！！！！！！！！本次获得了其他皮肤，不弹出购买皮肤面板')
            return false;
        }

        if (this.playCount < 4) {
            // console.log('！！！！！！！！！！！！场次未满四局，不弹出购买皮肤面板,当前局数：' + this.playCount)
            return false;
        }
        //获取我当前的金币可购买的，尚未拥有的皮肤,有多个取最便宜的那个
        var knifeSkinDatas = ConfigData.instance.knifeSkinDatas;
        var heroSkinDatas = ConfigData.instance.heroSkinDatas;

        this.finalGetSkin = null;
        var knifeSkin, heroSkin

        for (let data of knifeSkinDatas) {
            if (data.getWay === 0 && data.priceType === 0) {
                if (data.price <= this.gold && !this.isOwnKnifeSkin(data.id) && !this.isRefuseBuyTwice(data.id + 1000)) {
                    knifeSkin = data;
                    break;
                }
            }
        }

        for (let data of heroSkinDatas) {
            if (data.getWay === 0 && data.priceType === 0) {
                if (data.price <= this.gold && !this.isOwnHeroSkin(data.id) && !this.isRefuseBuyTwice(data.id + 2000)) {
                    heroSkin = data;
                    break;
                }
            }
        }

        // if(!(knifeSkin||heroSkin)){
        //     //如果发现没有可以
        // }

        if (!knifeSkin) {
            this.finalGetSkin = heroSkin;
        } else if (!heroSkin) {
            this.finalGetSkin = knifeSkin;
        } else {
            this.finalGetSkin = knifeSkin.price <= heroSkin.price ? knifeSkin : heroSkin;
        }



        if (this.finalGetSkin) {
            // console.log('！！！！！！！！！！！！可弹出金币获取皮肤面板')
            this.finalGetSkin.isGetByAdver = false;
            this.continuityCanNotBuyCount = 0;
            return true;
        } else {
            this.updateContinuityCanNotBuyCount()
        }


        //此次没有可购买，判断连续是否超过三次
        if (this.playCount < 10) {
            // console.log('！！！！！！！！！！！！未满10局，不可弹出广告获取皮肤面板，当前局数：' + this.playCount)
            return false;
        }

        if (this.continuityCanNotBuyCount < 3) {
            // console.log('！！！！！！！！！！！！未连续三局没有达到购买条件，不可弹出广告获取皮肤面板,当前连续局数：' + this.continuityCanNotBuyCount)
            return false;
        } else {
            this.continuityCanNotBuyCount = 0;
        }


        for (let data of knifeSkinDatas) {
            if (data.getWay === 0 && data.priceType === 0) {
                if (data.price >= this.gold && !this.isOwnKnifeSkin(data.id) && !this.isRefuseAdverTwice(data.id + 1000)) {
                    knifeSkin = data;
                    break;
                }
            }
        }

        for (let data of heroSkinDatas) {
            if (data.getWay === 0 && data.priceType === 0) {
                if (data.price >= this.gold && !this.isOwnHeroSkin(data.id) && !this.isRefuseAdverTwice(data.id + 2000)) {
                    heroSkin = data;
                    break;
                }
            }
        }

        if (!knifeSkin) {
            this.finalGetSkin = heroSkin;
        } else if (!heroSkin) {
            this.finalGetSkin = knifeSkin;
        } else {
            this.finalGetSkin = knifeSkin.price <= heroSkin.price ? knifeSkin : heroSkin;
        }


        if (this.finalGetSkin) {
            // console.log('！！！！！！！！！！！！可弹出广告获取皮肤面板')
            this.finalGetSkin.isGetByAdver = true;
            return true;
        }

        // console.log('！！！！！！！！！！！！没有可获取的皮肤')
        return false;

    },


    isRefuseBuyTwice: function (id) {
        return this.refuseBuyPool && this.refuseBuyPool[id] && this.refuseBuyPool[id] >= 2;
    },

    updateRefuseBuyPool: function (id) {
        this.refuseBuyPool[id] = this.refuseBuyPool[id] ? this.refuseBuyPool[id] + 1 : 1;
        this.saveUserData('更新拒绝购买皮肤次数')
    },

    isRefuseAdverTwice: function (id) {
        return this.refuseAdverPool && this.refuseAdverPool[id] && this.refuseAdverPool[id] >= 2;
    },

    updateRefuseAdverPool: function (id) {
        this.refuseAdverPool[id] = this.refuseAdverPool[id] ? this.refuseAdverPool[id] + 1 : 1;
        this.saveUserData('更新拒绝购买皮肤次数')
    },

    updateContinuityCanNotBuyCount: function () {
        this.continuityCanNotBuyCount++;
        this.saveUserData('更新没有达到购买皮肤条件的次数')
    },

    getOwnKnifeSkinCount() {
        return this.ownKnifeSkins.length;
    },

    getOwnHeroSkinCount() {
        return this.ownHeroSkins.length;
    },


    canBuyItem: function (data) {
        if (!data) return false;
        if (data.getWay === 0) {
            if (data.priceType === 0) {
                return data.price <= this.gold;
            } else {
                return data.price <= this.zongZi;
            }
        }
    },

    updateKeyCount: function () {
        this.keyCount++
        if (this.keyCount > 3) {
            this.keyCount = 3;
        }
        this.keyDirty = true;
        this.hasGetKey = true;
        this.showKeyCount = 0;
        this.saveUserData('更新key数')
    },

    clearKeyCount: function () {
        this.keyCount = 0;
        this.saveUserData('清空key数')
    },

    updateTreasureTurn: function () {
        this.treasureTurn++;
        this.saveUserData('更新宝箱轮数')
    },

    updateShowKeyCount: function () {
        this.showKeyCount++;
        this.saveUserData('更新展示钥匙数')
    },

    canShowPanelTreasureBox: function () {
        if (this.keyCount >= 3) {
            this.clearKeyCount();
            return true;
        }
    },

    canShowKeyInAI: function () {
        if ((this.playCount >= 0 && this.showKeyCount >= 2)) {
            return true
        }
    },

    canShowPanelEvaulate: function () {
        if (this.evaulateCount !== -1) {
            return this.evaulateCount === 3 || this.evaulateCount === 6;
        }
    },


    endEvaulateCount: function () {
        this.evaulateCount = -1;
        this.saveUserData('结束评价')
    },

    updateEvaulateCount: function () {
        if (this.evaulateCount !== -1) {
            this.evaulateCount++;
        }
        this.saveUserData('更新评价次数')
    },

    updateVipWithoutInterstitial: function () {
        this.vipWithoutInterstitial++;
        this.saveUserData('更新vip用户屏蔽插屏')
    },

    getVipWithoutInterstitial: function () {
        return this.vipWithoutInterstitial;
    },

    getLastFreeDiamondTime: function () {
        return this.lastFreeDiamondTime;
    },

    updateLastFreeDiamondTime: function () {
        this.lastFreeDiamondTime = this.getCurTime();
        this.saveUserData('更新免费钻石领取时间')
    },

    getCanGetFreeDiamond: function () {
        return this.getCurTime() - this.lastFreeDiamondTime >= 24 * 60 * 60 * 1000;
    },

    isDuringNFTRankTime: function () {
        return this.nftRankEndTime > this.getCurTime()
    },

    isInNFTRankGameMode: function () {
        return this.currentBattleMode == BattleModeType.NFT_RANK
    },

    buyPhysical: function (num) {
        if (num == 10) {
            if (this.dayPhysicalBuyDatas[0] == 0) {
                this.dayPhysicalBuyDatas[0] = 1
            } else {
                return
            }
        } else {
            if (this.dayPhysicalBuyDatas[1] == 0) {
                this.dayPhysicalBuyDatas[1] = 1
            } else {
                return
            }
        }
        PlatformMgr.syncNFTRankPlayerInfo(PlayerData.instance.bitverseWallet)

        this.updatePhysical(num)
    },

    canBuyPhysical: function (num) {
        let result = num == 10 ? (this.dayPhysicalBuyDatas[0] == 0) : (this.dayPhysicalBuyDatas[1] == 0)
        return result
    },

    receiveNFTOtherRewards: function (num) {
        if (!this.canGetNFTOtherRewards(num)) {
            return
        }
        this.nftGetOtherwiseRewards[num] = 1
        let rewardst = PlatformMgr.nftRankInfo[4]
        PlayerData.instance.updateZongZi(rewardst[num]);
        PlatformMgr.syncNFTRankPlayerInfo(PlayerData.instance.bitverseWallet)
    },

    canGetNFTOtherRewards: function (num) {
        return this.nftGetOtherwiseRewards[num] == 0
    },


    switchGameMode: function () {
        this.lastBattleMode = this.currentBattleMode
        this.currentBattleMode = this.lastBattleMode == BattleModeType.NFT_RANK ? BattleModeType.Normal : BattleModeType.NFT_RANK
    },

    updatePhysical: function (num) {
        if (num > 0) {
            this.physicalBuy += num
        } else {
            num = Math.abs(num)
            if (this.physical >= num) {
                this.physical -= num
            } else {
                this.physical = 0
                this.physicalBuy -= num - this.physical
            }
        }
        this.saveUserData('更新体力');
    },

    getAllPhysical: function () {
        return this.physical + this.physicalBuy
    },

    updateNftRankScore: function (num) {
        this.nftRankScore = Math.max(0, this.nftRankScore + num)
        this.saveUserData('更新NFTRank积分');
    },

    getSkinScoreAdd: function () {
        var heroData = ConfigData.instance.getHeroSkinById(this.heroNFTSkinId)
        var skinData = ConfigData.instance.getKnifeSkinById(this.knifeNFTSkinId);
        return heroData.score + skinData.score
    },

    handleRewardScoreData: function () {
        if (PlatformMgr.nftRankInfo && PlatformMgr.nftRankInfo.length > 0) {

            var rewards = PlatformMgr.nftRankInfo[5]
            var rewardsMnt = PlatformMgr.nftRankInfo[6]

            // $rewards = [[10, 500, 250, 150, 100, 80, 60, 50, 40, 30, 20], [100, 10], [200, 5]];
            let rewardsInfo = []

            for (let i = 0; i < rewards.length; i++) {
                let array = rewards[i]
                if (array.length > 2) {
                    for (let j = 1; j < array.length; j++) {
                        rewardsInfo.push({
                            rank: j,
                            reward_1: array[j],
                            reward_2: rewardsMnt[i][j]
                        })
                    }
                } else {
                    rewardsInfo.push({
                        rank: `${rewards[i - 1][0] + 1}-${array[0]}`,
                        reward_1: array[1],
                        reward_2: rewardsMnt[i][1]
                    })
                }
            }

            this.nftRankRewards = rewardsInfo.map((value, index, array) => {
                return value
            })

            // $scores = [25,15,10,5,-4,-9,-13,-20];

            var scores = PlatformMgr.nftRankInfo[8]

            this.nftRankScores = scores.map((item) => {
                return item
            })
        }

        //玩家信息恢复，只记录比赛结束之后
        if (PlatformMgr.nftRankPlayerInfo && PlatformMgr.nftRankPlayerInfo.length > 0) {
            // $role = [
            //     $sql->playCnt,
            //     $sql->token,
            //     $sql->buy,
            // ];
            let role = PlatformMgr.nftRankPlayerInfo
            this.nftRankPlayCount = Math.max(this.nftRankPlayCount,role[0])
            let token = role[1] //钻石_钻石购买体力_普通体力

            // let token = `${PlayerData.instance.zongZi}_${PlayerData.instance.physicalBuy}_${PlayerData.instance.physical}`

            if (token == "" || token == "0") {
                //之前没同步过
            } else {
                let strs = token.split("_")
                PlayerData.instance.zongZi = Math.max(Number(strs[0]),PlayerData.instance.zongZi) //卸载之后，没链接钱包之后的钻石
                PlayerData.instance.physicalBuy = Number(strs[1])
                PlayerData.instance.physical = Number(strs[2])
            }

            let buys = role[2] //let buys = `${nfts_buy}#${physical_buy}#${nftGetOtherwiseRewards}`

            if (buys == "" || buys == "0") {
                //之前没同步过

            } else {
                let strs = buys.split("#")

                //"17_0|18_0|101_0|103_0"
                //NFT皮肤购买
                let nfts_buy = strs[0].split("|")
                for (let index = 0; index < nfts_buy.length; index++) {
                    let skinStrs = nfts_buy[index].split("_")
                    let id = Number(skinStrs[0])
                    let isOwn = skinStrs[1]
                    if (isOwn == "1") {
                        //后端记录已经获得该NFT皮肤
                        if (id > 100) {
                            if (!PlayerData.instance.isOwnKnifeSkin(id)) {
                                PlayerData.instance.addKnifeSkin(id)
                            }
                        } else {
                            if (!PlayerData.instance.isOwnHeroSkin(id)) {
                                PlayerData.instance.addHeroSkin(id)
                            }
                        }
                    }
                }

                //体力购买
                let physical_buy = strs[1].split("_")
                this.dayPhysicalBuyDatas = [Math.max(Number(physical_buy[0]),this.dayPhysicalBuyDatas[0]), Math.max(Number(physical_buy[1]),this.dayPhysicalBuyDatas[1])]

                //社区和问卷购买记录
                let nftGetOtherwiseRewards = strs[2].split("_")
                this.nftGetOtherwiseRewards = [Math.max(Number(nftGetOtherwiseRewards[0]),this.nftGetOtherwiseRewards[0]), Math.max(Number(nftGetOtherwiseRewards[1]),this.nftGetOtherwiseRewards[1])]
            }

            this.saveUserData('恢复信息');
        }
    },

    canStartRank: function () {
        if (this.currentBattleMode == BattleModeType.NFT_RANK) {
            if (this.getAllPhysical() <= 0) {
                return false
            }
        }
        return true
    },
    //开始rank
    startRank: function () {
        if (this.currentBattleMode == BattleModeType.NFT_RANK) {
            if (this.getAllPhysical() <= 0) {
                console.log("no physical")
                return
            }
            this.updatePhysical(-1)
        }

    },

    endRank: function () {

    },

    getNFTRankStar: function () {
        let nftMyRank = PlayerData.instance.myWorldRankData
        let nftRank = nftMyRank ? nftMyRank.rank : 100000

        let star = 103 //Legend1
        for (let index = 0; index < this.nftRankStarLv.length; index++) {
            const value = this.nftRankStarLv[index];
            if (nftRank >= value[0] && nftRank <= value[1]) {
                star += (this.nftRankStarLv.length - index - 1) * 5
                break;
            }
        }
        console.log("nftranklv", nftRank, star)
        return star
    },

    isInSurplusTime: function () {
        return PlatformMgr.surplusTime >= 0
    },

    //钻石购买NFT皮肤后，发送一条NFT请求
    buyNFTSkin: function (id, isKnife) {
        if (PlayerData.instance.bitverseWallet == "") {
            return
        }

        let data = isKnife ? ConfigData.instance.getKnifeSkinById(id) : ConfigData.instance.getHeroSkinById(id)
        PlatformMgr.requestNFTGet(data, PlayerData.instance.bitverseWallet, () => {
            console.log("request is send", id)
        })

    },

    getNFTSKins : function(){
        return ConfigData.instance.getNFTSKins()
    },

    //钻石，体力，NFT恢复，只在链接钱包之后
    restoreProperty: function () {
        let self = this
        PlatformMgr.requestPkey(PlayerData.instance.bitverseWallet, (success) => {
            if (success) {
                PlayerData.instance.handleRewardScoreData()
                console.log("restoreProperty success")
            } else {
                console.log("restoreProperty fail")
            }
        })
    },

    rankLocalModify: function (restore = false) {
        //进行本地排序
        console.log("------rankLocalModify--begin----", this.nftRankScore)
        // nftRank  
        let array = []
        if (PlayerData.instance.holidayWorldRankData && PlayerData.instance.holidayWorldRankData[0] && PlayerData.instance.holidayWorldRankData[0].rankInfo) {
            array = PlayerData.instance.holidayWorldRankData[0].rankInfo
        }

        let nftRank = 0

        if (array.length == 0) {
            // 'score' => $sql->score,
            // 'rank' => 0, //客户端排序
            // 'id' => $sql->uid,
            // 'adress' => $sql->adress
            PlayerData.instance.myWorldRankData = {
                score: PlayerData.instance.nftRankScore,
                rank: 1,
                adress: PlayerData.instance.bitverseWallet,
                id: 0,
            }
            nftRank = 1
        } else {
            let hasMine = false
            for (let index = 0; index < array.length; index++) {
                let rankData = array[index]
                if (rankData.adress == PlayerData.instance.bitverseWallet) {
                    //玩家自己
                    if (restore) { //恢复自己的分数，以服务器上的为准，期间未链接钱包游玩的分数不算了
                        PlayerData.instance.nftRankScore = rankData.score
                    } else {
                        rankData.score = PlayerData.instance.nftRankScore //将自己的分数赋值给上次拉取的自己rankData
                        nftRank = rankData.rank //上次的排名
                        array[index] = rankData
                    }
                    hasMine = true
                    break;
                }
            }

            if (!hasMine) {
                PlayerData.instance.myWorldRankData = {
                    score: PlayerData.instance.nftRankScore,
                    rank: -1,
                    adress: PlayerData.instance.bitverseWallet,
                    id: 0,
                }
                PlayerData.instance.holidayWorldRankData[0].count++;
                PlayerData.instance.holidayWorldRankData[0].rankInfo.push(PlayerData.instance.myWorldRankData)
            }

            let myRank = PlayerData.instance.handleHolidayRankData(PlayerData.instance.holidayWorldRankData[0])
            let deltaRank = myRank.rank - nftRank
            nftRank = myRank.rank

            PlayerData.instance.myWorldRankData = {
                score: nftRank.score,
                rank: nftRank,
                adress: PlayerData.instance.bitverseWallet,
                id: 0,
            }
        }

        console.log("------rankLocalModify--end----", this.nftRankScore, nftRank)
    },


});