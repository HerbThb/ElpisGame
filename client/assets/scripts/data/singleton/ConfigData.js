const Tools = require('Tools');
const GameData = require('GameData');
const ItemType = require('Types').ItemType;
const PlatformMgr = require('PlatformMgr');
const LanguageMgr = require('LanguageMgr');
var ConfigData = cc.Class({
    statics: {
        instance: null,

        init: function () {
            if (ConfigData.instance) {
                ConfigData.instance = null;
            }

            if (ConfigData.instance === null) {
                ConfigData.instance = new ConfigData();
                ConfigData.instance.init();
            }
        },

        cleanUp: function () {
            if (ConfigData.instance) {
                Tools.cleanUp(ConfigData.instance);
            }
            ConfigData.instance = null;
        }


    },

    properties: {
        loadedConfigCount: 0,
        loadingConfigCount: 0,
        knifeMoveData: [],
        knifeSkinDatas: [],
        heroSkinDatas: [],
        shopDatas: [],
        tasks: [],
        levelCfgs: [],
        defaultLevel: 6,
        clientData: null,
        /** 分享基础数据 */
        shareBaseDatas: [],
    },


    init: function () {
        this.loadingConfigCount = 0;
        this.loadedConfigCount = 0;

        this.loadCfgData('config/client', (err, result) => {
            this.clientData = result[0];
            for (let i = 0; i < this.clientData.growLevelUpWays.length; i++) {
                var data = this.clientData.growLevelUpWays[i];
                this.clientData.growLevelUpWays[i] = Tools.splitToNumList(data, '-');
            }
        });

        this.loadCfgData('config/guide', (err, result) => {
            this.guideData = result[0];
        });

        this.loadCfgData('config/ui-tips', (err, result) => {
            this.uiTipDatas = result;
        });

        this.loadCfgData('config/rank', (err, result) => {
            this.rankDatas = result;
        });

        this.loadCfgData('config/knife-skin', (err, result) => {
            this.knifeSkinDatas = result;

            this.knifeSkinDatas.sort((a, b) => {
                return a.sort - b.sort;
            })

            this.initKnifeSkinTasks();
        });

        this.loadCfgData('config/hero-skin', (err, result) => {
            this.heroSkinDatas = result;

            this.heroSkinDatas.sort((a, b) => {
                return a.sort - b.sort;
            })

            this.initHeroSkinTasks();
        });

        // this.loadCfgData('config/task', (err, result) => {
        //     this.taskDatas = result;
        // });

        this.loadCfgData('config/knife-move', (err, result) => {
            if (result && result[0]) {
                this.knifeMoveData = result[0];
            }
        });

        this.loadCfgData('config/ai-nick', (err, result) => {
            this.aiNickDatas = result;
        });

        this.loadCfgData('config/ai-rank', (err, result) => {
            this.airankDatas = result;
        });

        this.loadCfgData('config/star-rank', (err, result) => {
            this.starRankDatas = result;
            this.bigRankDatas = [];
            for (let i = 0, index = -1; i < result.length; i++) {
                var data = result[i];

                if (data.isRankFirst) {
                    index++
                    var newBigData = {};
                    for (let key in data) {
                        newBigData[key] = data[key];
                    }
                    this.bigRankDatas[index] = newBigData;
                } else {
                    if (data.unlockBox || data.unlockBox === 0) {
                        this.bigRankDatas[index].unlockBox = data.unlockBox;
                        this.bigRankDatas[index].unlockBoxTips = data.unlockBoxTips;
                    }
                }
            }

            // console.log(this.bigRankDatas);
        });


        // this.loadCfgData('config/share-base', (err, result) => {
        //     this.shareBaseDatas = result;
        // });

        this.shareBaseDatas = [];
        this.loadCfgData('config/share-base', (err, result) => {
            for (var item of result) {
                if (!this.shareBaseDatas[item.shareType]) {
                    this.shareBaseDatas[item.shareType] = [];
                }

                this.shareBaseDatas[item.shareType].push(item);
            }
        });

        this.loadCfgData('config/level-cfg', (err, result) => {
            this.levelCfgs = result;

            this.defaultLevel = this.getLevelByHideScore(0);
        });

        this.loadCfgData('config/teaword', (err, result) => {
            this.teaword = result;
        });

        this.loadCfgData('config/advert', (err, result) => {
            this.adUnitIdDatas = result;
        });

        this.loadCfgData('config/rank-convert', (err, result) => {
            this.rankConvertDatas = result;
        });

        this.loadCfgData('config/activity-sign', (err, result) => {
            this.signDatas = result;
        });
        this.loadCfgData('config/activity-lateSign', (err, result) => {
            this.lateSignDatas = result;
        });
        this.loadCfgData('config/activity-duanWu', (err, result) => {
            this.activityDuanWuDatas = result;
        });

        this.loadCfgData('config/buff', (err, result) => {
            this.buffDatas = result;
        });

        this.loadCfgData('config/box', (err, result) => {
            this.boxDatas = result;
        });

        this.loadCfgData('config/grow', (err, result) => {
            this.growDatas = result;
            for (let data of this.growDatas) {
                if (data.file) {
                    this.loadCfgData('config/' + data.file, (err, result) => {
                        data.levelDatas = result;
                        if (data.id === 4) {
                            console.log(this.growDatas);
                        }
                    })
                }
            }
        });


        this.loadCfgData('config/ai-player-grow', (err, result) => {
            this.aiPlayerGrowDatas = result;
        });

        this.loadCfgData('config/ai-star-grow', (err, result) => {
            this.aiStarGrowDatas = result;
        });

        this.loadCfgData('config/repay', (err, result) => {
            this.repayDatas = result;
        });

        this.loadCfgData('config/map', (err, result) => {
            this.mapDatas = result;
        });

        this.loadCfgData('config/wall', (err, result) => {
            this.wallData = result[0];
        });


        this.loadCfgData('config/daily-task', (err, result) => {
            this.dailyTaskData = result;
        });

        this.loadCfgData('config/suit', (err, result) => {
            this.suitDatas = result;
        });

        this.loadCfgData('config/holiday-const', (err, result) => {
            this.holidayDatas = result[0];
        });

        this.loadCfgData('config/holiday-pk', (err, result) => {
            this.holidayPKRewardDatas = [];
            if (err) {
                console.error('holiday-world.json load fail');
            } else if (result) {
                let index = 0;
                this.holidayPKRewardDatas[index] = result[0];
                for (let i = 1; i < result.length; i++) {
                    let data = result[i];
                    if (data.reward === this.holidayPKRewardDatas[index].reward) {
                        this.holidayPKRewardDatas[index].endRank = data.rank;
                    } else {
                        index++;
                        this.holidayPKRewardDatas[index] = result[i];
                    };
                }
            }
            // console.log(JSON.stringify(this.holidayPKRewardDatas))
        });

        this.loadCfgData('config/holiday-world', (err, result) => {
            this.holidayWorldRewardDatas = [];
            if (err) {
                console.error('holiday-world.json load fail');
            } else if (result) {
                let index = 0;
                this.holidayWorldRewardDatas[index] = result[0];
                for (let i = 1; i < result.length; i++) {
                    let data = result[i];
                    if (data.reward === this.holidayWorldRewardDatas[index].reward) {
                        this.holidayWorldRewardDatas[index].endRank = data.rank;
                    } else {
                        index++;
                        this.holidayWorldRewardDatas[index] = result[i];
                    };
                }
            }

            // console.log('---------------------------')
            // console.log(JSON.stringify(this.holidayPKRewardDatas))
        });

        this.loadCfgData('config/holiday-world', (err, result) => {
            this.holidayWorldRewardDatas = result;
        });

        this.loadCfgData('config/country', (err, result) => {
            this.countryDatas = result;
        });

        this.loadCfgData('config/treasure-small', (err, result) => {
            this.treasureSmallData = result;
        });

        this.loadCfgData('config/treasure-big', (err, result) => {
            this.treasureBigData = result;
        });


        this.loadCfgData('config/language', (err, result) => {
            this.languageDatas = {}
            // console.log(result);
            for (const data of result) {
                this.languageDatas[data['en-us']] = data;
            }
            // console.log(this.languageDatas);
        });

        this.loadCfgData('config/shop', (err, result) => {
            this.shopDatas = result;
        });
    },


    loadCfgData: function (path, callback1, callback2) {
        this.loadingConfigCount++;
        cc.loader.loadRes(path, (err, result) => {
            if (result.json) {
                result = result.json;
            } else if (result.text) {
                result = JSON.parse(result.text);
            } else if (result instanceof cc.JsonAsset) {
                result = null;
            }
            if (callback1) {
                callback1(err, result);
            }
            if (callback2) {
                callback2(err, result);
            }
            // TIP:此处会造成短间隔内重复读取同一个配置表时，第二次result.json的值为null，需要注意避免类似操作
            cc.loader.release(path)
            this.loadedConfigCount++;
        });
    },

    getKnifeSkinById: function (id) {
        return Tools.getItemById(this.knifeSkinDatas, id);
    },

    getHeroSkinById: function (id) {
        return Tools.getItemById(this.heroSkinDatas, id);
    },

    getNFTHeroSkins: function () {
        var arr = [];
        for (const item of this.heroSkinDatas) {
            if (item.getWay && item.getWay == 100) {
                arr.push(item)
            }
        }
        return arr
    },

    getNFTWeaponSkins: function () {
        var arr = [];
        for (const item of this.knifeSkinDatas) {
            if (item.getWay && item.getWay == 100) {
                arr.push(item)
            }
        }
        return arr
    },

    getNFTSKins : function(){
        var arr = [];
        for (const item of this.heroSkinDatas) {
            if (item.getWay && item.getWay == 100) {
                arr.push(item)
            }
        }

        for (const item of this.knifeSkinDatas) {
            if (item.getWay && item.getWay == 100) {
                arr.push(item)
            }
        }
        return arr
    },

    getSuitData: function (id) {
        return Tools.getItemById(this.suitDatas, id);
    },

    getRandomHeroSkin: function (max, localPlayerSkinId) {
        var arr = [];
        for (const data of this.heroSkinDatas) {
            if (data.id !== localPlayerSkinId) {
                arr.push(data);
            }
        }
        var index = Math.floor(Math.random() * Math.min(max - 1, arr.length));
        return arr[index];
    },

    getRandomKnifeSkin: function (max) {
        var index = Math.floor(Math.random() * Math.min(max, this.knifeSkinDatas.length));
        return this.knifeSkinDatas[index];
    },

    getRandomAIName: function () {
        var index = Math.floor(Math.random() * this.aiNickDatas.length);
        return this.aiNickDatas[index].aiNick;
    },

    getAINickById: function (id) {
        if (this.aiNickDatas[id]) {
            return this.aiNickDatas[id].aiNick;
        } else {
            return '无名大侠'
        }
    },

    getRandomAIRank: function (i) {
        var data = this.airankDatas[i];
        var min = data.range[0];
        var max = data.range[1];
        var index = Math.floor(Math.random() * (max - min)) + min;
        return this.starRankDatas[index] ? this.starRankDatas[index] : this.starRankDatas[0];
    },

    // getShareBaseData: function (type) {
    //     return this.shareBaseDatas[type];
    // },

    getRandomShareBaseData: function (shareType) {
        if (this.shareBaseDatas && this.shareBaseDatas[shareType]) {
            return Tools.getRandomItem(this.shareBaseDatas[shareType]);
        }

        return null;
    },

    getLevelCfg: function (level) {
        return this.levelCfgs[level > 0 ? (level < this.levelCfgs.length ? level : this.levelCfgs.length - 1) : 0];
    },

    clampHideScore: function (hideScore) {
        hideScore = Tools.clamp(this.levelCfgs[0].score, this.levelCfgs[this.levelCfgs.length - 1].score, hideScore);
        return hideScore;
    },

    clampLevel: function (level) {
        level = Tools.clamp(0, this.levelCfgs.length - 1, level);
        return level;
    },

    getLevelByHideScore: function (hideScore) {
        for (let i = 0; i < this.levelCfgs.length; i++) {
            var data = this.levelCfgs[i];
            var nextData = this.levelCfgs[i + 1];
            if (!nextData) return data.id;
            if (hideScore >= data.score && hideScore < nextData.score) {
                return data.id;
            } else if (hideScore < data.score) {
                return data.id;
            }
        }
    },

    initKnifeSkinTasks: function () {
        for (const data of this.knifeSkinDatas) {
            if (data.getWay === 1) {
                var task = {};
                task.id = data.taskId;
                task.param = data.taskParam;
                task.rewardId = data.id;
                task.rewardType = ItemType.KNIFE_SKIN;
                task.type = data.taskType;
                task.introduce = data.taskShort;
                this.tasks.push(task);
            }
        }
    },

    initHeroSkinTasks: function () {
        for (const data of this.heroSkinDatas) {
            if (data.getWay === 1) {
                var task = {};
                task.id = data.taskId;
                task.param = data.taskParam;
                task.rewardId = data.id;
                task.rewardType = ItemType.HERO_SKIN;
                task.type = data.taskType;
                task.introduce = data.introduce;
                this.tasks.push(task);
            }
        }
    },



    getTasks: function () {
        return this.tasks;
    },

    getAdvertUnitId: function (id) {
        for (const data of this.adUnitIdDatas) {
            if (data.id === id) {
                return data.adUnitId;
            }
        }
        return null;
    },


    getUITipStr: function (id) {
        // return this.uiTipDatas[id].tip;

        var tips = this.uiTipDatas[id];
        return tips[LanguageMgr.curLang] ? tips[LanguageMgr.curLang] : tips['tip'];
    },

    getUITipStrByFormat: function (id, param) {
        return Tools.getStringByFormat(this.getUITipStr(id), param);
    },

    getReviveWayByCount: function (count) {
        return Tools.getItemOrFinalItem(this.clientData.reviveWays, count);
    },

    getMultipGoldWayByCount: function (count) {
        return Tools.getItemOrFinalItem(this.clientData.multipGoldWays, count);
    },

    getProtectWayByCount: function (count) {
        return this.clientData.protectStarWays[count];
    },

    getRankDataByScore: function (score) {
        for (let i = 0; i < this.rankDatas.length; i++) {
            var data = this.rankDatas[i];
            var nextData = this.rankDatas[i + 1];
            if (!nextData) return data;
            if (score >= data.score && score < nextData.score) {
                return data;
            }
        }
    },

    getRankDataByStar: function (star) {
        for (let i = 0; i < this.starRankDatas.length; i++) {
            var data = this.starRankDatas[i];
            var nextData = this.starRankDatas[i + 1];
            if (!nextData) return data;
            if (star >= data.star && star < nextData.star) {
                return data;
            }
        }
    },

    getRankDataById: function (id) {
        return this.starRankDatas[id]
    },
    // update (dt) {},
    getItemData: function (type, id) {
        var data = null;
        switch (type) {
            case ItemType.HERO_SKIN: {
                data = this.getHeroSkinById(id);
                break;
            }
            case ItemType.KNIFE_SKIN: {
                data = this.getKnifeSkinById(id);
                break;
            }
            case ItemType.MONEY: {
                data = {
                    name: "金币",
                    url: "texture/currency/gold"
                }
                break;
            }
            case ItemType.ZONG_ZI: {
                data = {
                    name: "钻石",
                    url: "texture/currency/diamond"
                }
                break;
            }
            default: {

                break;
            }
        }

        if (!data) {
            // cc.error("cant find ItemData: type:" + type + "  id:" + id);
        }

        return data;
    },

    getRandomTryKnifeSkinData: function (ownKnifeSkins, tryKnifeSkinMinQuality) {
        var maxQuality = 0;
        //找出我的最大品质
        for (const id of ownKnifeSkins) {
            var data = this.getKnifeSkinById(id)
            if (data.quality > maxQuality) {
                maxQuality = data.quality;
            }
        }

        //判读我的最大品质是否低于配置的最低使用品质
        if (maxQuality < tryKnifeSkinMinQuality) {
            maxQuality = tryKnifeSkinMinQuality;
        }


        //找出大于我的最大品质的皮肤
        var arr = [];
        for (const data of this.knifeSkinDatas) {
            if (data.quality > maxQuality) {
                if (!Tools.arrContains(ownKnifeSkins, data.id)) {
                    arr.push(data);
                }
            }
        }

        //如果没有大于我的最大品质的皮肤，就找等于我最大品质的皮肤
        if (arr.length === 0) {
            for (const data of this.knifeSkinDatas) {
                if (data.quality === maxQuality) {
                    if (!Tools.arrContains(ownKnifeSkins, data.id)) {
                        arr.push(data);
                    }
                }
            }
        }

        var data = Tools.getRandomItem(arr);
        return data;
    },


    getRandomTryHeroSkinData: function (ownHeroSkins, tryHeroSkinMinQuality) {
        var maxQuality = 0;
        //找出我的最大品质
        for (const id of ownHeroSkins) {
            var data = this.getHeroSkinById(id)
            if (data.quality > maxQuality) {
                maxQuality = data.quality;
            }
        }

        //判读我的最大品质是否低于配置的最低使用品质
        if (maxQuality < tryHeroSkinMinQuality) {
            maxQuality = tryHeroSkinMinQuality;
        }

        //找出大于我的最大品质的皮肤
        var arr = [];
        for (const data of this.heroSkinDatas) {
            if (data.quality > maxQuality) {
                if (!Tools.arrContains(ownHeroSkins, data.id)) {
                    arr.push(data);
                }
            }
        }

        //如果没有大于我的最大品质的皮肤，就找等于我最大品质的皮肤
        if (arr.length === 0) {
            for (const data of this.heroSkinDatas) {
                if (data.quality === maxQuality) {
                    if (!Tools.arrContains(ownHeroSkins, data.id)) {
                        arr.push(data);
                    }
                }
            }
        }

        var data = Tools.getRandomItem(arr);
        return data;
    },

    convertScoreIdToStarId: function (score) {
        var oldRankData = this.getRankDataByScore(score);
        for (const data of this.rankConvertDatas) {
            if (data.rankScoreId === oldRankData.id) {
                return data.rankStarId;
            }
        }
    },


    getBuffDataById: function (id) {
        return Tools.getItemById(this.buffDatas, id);
    },

    getBoxDataById: function (id) {
        return Tools.getItemById(this.boxDatas, id);
    },


    getRandomAIIcon: function () {
        var index = Tools.getRandomInt(1, 389);
        return index;
    },

    getGrowLevelData: function (type, level) {
        var data = this.growDatas[type];
        if (data && data.levelDatas) {
            return Tools.getItemOrFinalItem(data.levelDatas, level);
        }
    },

    getAiStarDataByPlayerStar: function (star) {
        return Tools.getItemOrFinalItem(this.aiPlayerGrowDatas, star);
    },

    getAiGrowDataBystar: function (star) {
        return Tools.getItemOrFinalItem(this.aiStarGrowDatas, star);
    },

    isGrowLevelUpByAdver: function (type, id) {
        if (this.clientData.growLevelUpWays[type]) {
            return Tools.arrContains(this.clientData.growLevelUpWays[type], id);
        } else {
            return false;
        }
    },

    getRepayDataByRank: function (rank) {
        return Tools.getItemOrFinalItem(this.repayDatas, rank);
    },

    getBigRankDatas: function () {
        //该数据只读
        return this.bigRankDatas;
    },


    getBigRankDatasIndex: function (id) {
        for (let i = 0; i < this.bigRankDatas.length; i++) {
            if (this.bigRankDatas[i].id === id) {
                return i;
            }
        }
    },

    getDailyShowTask: function (playerData) {
        var completeGuideTask = playerData.completeGuideDailyTask;
        var rankStar = playerData.rankStar;

        var filterDatas = [];
        if (completeGuideTask.length === 3) {
            for (let i = 0; i < 3; i++) {
                var data = this.getOneDailyTask(playerData, i);
                if (data) filterDatas.push(data);
            }
        } else {
            //新手任务
            for (let data of this.dailyTaskData) {
                if (data.degree === -1) {
                    data.process = 0;
                    filterDatas.push(data);
                }
            }
        }

        // console.log('--------------------段位：', rankStar, ' 筛选出的任务：')
        // console.log(JSON.stringify(filterDatas));
        return filterDatas;
    },

    getOneDailyTask: function (playerData, pattern) {
        var curTasks = playerData.dailyShowTask;
        var oldTasks = playerData.dailyOldTask;
        var rankStar = playerData.rankStar;
        var refreshCount = playerData.dayRefreshTaskCount;
        var tempArr = [];
        for (let data of this.dailyTaskData) {
            if (data.stage == refreshCount && data.pattern === pattern && data.degree !== -1 && data.degree <= rankStar && oldTasks.indexOf(data.id) === -1) {
                var canUse = true;
                for (const task of curTasks) {
                    if (task.id === data.id) {
                        canUse = false;
                        break
                    }
                }
                if (canUse) tempArr.push(data);
            }
        }
        // console.log('本次随机任务池:')
        // console.log(JSON.stringify(tempArr));
        let index = Tools.getRandomInt(0, tempArr.length);
        if (tempArr[index]) tempArr[index].process = 0;
        return tempArr[index];
    },

    getCurGrowStage: function (playCount, limits) {
        return 0;
        var stage = 0;
        for (const limit of limits) {
            l
            if (playCount < limit) {
                break;
            } else {
                stage++;
            }
        }
        return stage;
    },

    //三个阶段，0：free，1：share，2：adver

    getCurStage: function (playCount, limits) {
        const wayStr = ['免费', '分享', '广告']
        var stage = 0;
        var way = 0;
        for (const limit of limits) {
            if (playCount < limit) {
                break;
            } else {
                stage++;
            }
        }

        if (stage === 0) {
            way = 0;
        } else {
            var int = Tools.getRandomInt(0, 100);
            if (int < this.clientData.stagePrecents[stage]) { // && (!GameData.instance.isInReview)) {
                way = 1;
            } else {
                way = 2;
            }
        }
        if (GameData.instance.isShowLog()) {
            console.log('阶段数组:', limits, '已玩场次：', playCount, '所属阶段:', stage);
            console.log('分享概率:', this.clientData.stagePrecents[stage], '本次随机概率:', int, '最后获得方式:', wayStr[way])
        }
        if (PlatformMgr.isApp()) {
            if (way === 1) way = 2;
        }
        return way;
    },

    //0免费1分享2广告
    getCurStageByPrizeCount: function (playerData) {
        //app版本特殊处理
        if (PlatformMgr.isApp()) {
            return 2;
        }
        var limits = this.clientData.dayShowWayLimit;
        var dayGetPrizeCount = playerData.dayGetPrizeCount;
        var shareScore = playerData.shareScore;

        if (shareScore > 0) {
            if (GameData.instance.isShowLog()) {
                console.log('分享积分为:' + shareScore + '，此处显示分享')
            }
            // playerData.updateShareScore();
            return 1;
        }

        //输入的是已经获取奖励的次数，但判断时是判断下次获取奖励应该展示的方式，所以应该加一
        dayGetPrizeCount += 1;
        if (GameData.instance.isShowLog()) {
            console.log('当天第', dayGetPrizeCount, '次出现视频分享点')
            console.log('视频分享配置数组，单数分享，双数广告，超过数组则按最后两位的配置进行循环')
            console.log(limits)
        }
        var index = 0;
        var count = 0;
        var isOverFlow = true;
        for (const limit of limits) {
            count += limit;
            if (dayGetPrizeCount > count) {
                index++;
            } else {
                isOverFlow = false;
                break;
            }
        }
        if (isOverFlow) {
            var length = limits.length;
            var sum = limits[length - 1] + limits[length - 2];
            var overCount = dayGetPrizeCount - count;
            var remainCount = overCount % sum;
            if (remainCount > limits[length - 2] || remainCount === 0) {
                index -= 1;
            } else {
                index -= 2;
            }
        }
        //因为数组从0开始，但是表里的位置从1开始
        index++;
        if (GameData.instance.isShowLog()) {
            console.log('本次展示在数组中的位置 ', index)
            console.log('本次展示最终获取方式 ', index % 2 ? '分享' : '广告')
        }
        //单数index为分享，双数为广告
        return index % 2 ? 1 : 2;
    },

    isDuringDuanWuFestival: function (curTimeStamp) {
        return Tools.isBetweenTwoTime(this.clientData.duanWuStartDate, this.clientData.duanWuEndDate, curTimeStamp)
    },

    isAfterDuanWuFestival: function (curTimeStamp) {
        return Tools.isAfterOtherTime(this.clientData.duanWuEndDate, curTimeStamp)
    },

    isDuringHolidayRankTime: function (curTimeStamp) {
        return Tools.isBetweenTwoTime(this.holidayDatas.startDate, this.holidayDatas.endDate, curTimeStamp)
    },

    isDuringHolidayRankBtnShowTime: function (curTimeStamp) {
        //延迟展示三天
        // var timeStamp = Tools.getTimestampMS(this.holidayDatas.endShowDate) + 259200000;
        return Tools.isBetweenTwoTime(this.holidayDatas.startDate, this.holidayDatas.endShowDate, curTimeStamp)
    },

    getHolidayRankDayCount: function () {
        return Tools.getRealDayTimeCount(this.holidayDatas.startDate, this.holidayDatas.endDate);
    },

    getRandomTrySuitData: function (playerData) {
        var temp = [];
        for (let i = 0; i < this.suitDatas.length; i++) {
            if (!playerData.isOwnSuit(i + 1)) {
                temp.push(this.suitDatas[i]);
            }
        }
        // return this.suitDatas[2]
        return Tools.getRandomItem(temp);
    },

    getPKRewardByRank: function (rank) {
        for (let data of this.holidayPKRewardDatas) {
            if (data.endRank) {
                if (rank >= data.rank && rank <= data.endRank) {
                    return data;
                }
            } else {
                if (rank === data.rank) {
                    return data;
                }
            }
        }
    },

    getWorldRewardByRank: function (rank) {
        for (let data of this.holidayWorldRewardDatas) {
            if (data.endRank) {
                if (rank >= data.rank && rank <= data.endRank) {
                    return data;
                }
            } else {
                if (rank === data.rank) {
                    return data;
                }
            }
        }
    },

    getRandomCountry: function () {
        return Tools.getRandomItem(this.countryDatas).country;
    },

    getLanguageStr: function (str) {
        var data = this.languageDatas[str];
        return data[LanguageMgr.curLang] ? data[LanguageMgr.curLang] : str;
    },

    getTreasureBigDataByTurn(turn) {
        return Tools.getItemOrFinalItem(this.treasureBigData, turn)
    },

    getShopDatas: function() {
        return this.shopDatas;
    },

    getShopDataPriceByIndex: function (idx) {
        let price = 0;
        for (let data of this.shopDatas) {
            if (data.payIndex === idx) {
                price = data.price;
                break;
            }
        }

        return price;
    },

    // getTreasureSmallDataByWeight() {
    //     return Tools.getRandomItemByWeight(this.treasureBigData)
    // },

});



Object.defineProperty(cc.Label.prototype, 'string', {
    set(value) {
        if(value==null || value==undefined){
            console.log("value==null || value==undefined")
            return
        }
        let oldValue = this._string;
        // if (!this.node) return;
        // langFlag 用来判断该label是否打开了语言切换功能
        if (!this.langFlag && ConfigData.instance && ConfigData.instance.languageDatas && ConfigData.instance.languageDatas[value.toString()]) {
            var data = ConfigData.instance.languageDatas[value + '']
            this._string = data[LanguageMgr.curLang] ? data[LanguageMgr.curLang] : value + '';
        } else {
            this._string = '' + value;
        }

        if (this.string !== oldValue) {
            this._lazyUpdateRenderData();
        }
        this._checkStringEmpty();
    },
})

if (!CC_EDITOR) {
    cc.Sprite.prototype.__superOnEnable = cc.RenderComponent.prototype.onEnable;
    cc.Sprite.prototype.onEnable = function () {

        var self = this;
        if (self.__superOnEnable) self.__superOnEnable()
        if (!self._spriteFrame || !self._spriteFrame.textureLoaded()) {
            // Do not render when sprite frame is not ready
            self.disableRender();
            if (self._spriteFrame) {
                self._spriteFrame.once('load', self._onTextureLoaded, self);
                self._spriteFrame.ensureLoadTexture();
            }
        }
        self._activateMaterial();

        var url = "texture/language/" + LanguageMgr.curLang + "/" + (self._spriteFrame ? self._spriteFrame.name : '');
        if (self.myUrl !== url && cc.loader._getResUuid(url, cc.SpriteFrame)) {
            self.myUrl = url;
            cc.loader.loadRes(url, cc.SpriteFrame, (error, resource) => {
                if (error) {
                    // return;
                } else if (resource) {
                    self.spriteFrame = resource;
                }
                // if (!self.node._renderComponent) return;
                // if (self.__superOnEnable) self.__superOnEnable()
                // if (!self._spriteFrame || !self._spriteFrame.textureLoaded()) {
                // Do not render when sprite frame is not ready
                // self.disableRender();
                // if (self._spriteFrame) {
                //     self._spriteFrame.once('load', self._onTextureLoaded, self);
                //     self._spriteFrame.ensureLoadTexture();
                // }
                // }
                // self._activateMaterial();
            })
        }

    }
}