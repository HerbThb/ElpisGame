const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const StageType = require('Types').StageType;


cc.Class({
    extends: cc.Component,

    properties: {

        itemPool: [],
        itemDailyTaskPrefab: cc.Prefab,
        itemParentNode: cc.Node,

        zongZiNumNode: cc.Node,
        zongZiNumLabel: cc.Label,
        zongziRewardNode: cc.Node,

        titleNodes: [cc.Node],

        iconNodes: [cc.Node],
        exchangeNodes: [cc.Node],
        hasGetNodes: [cc.Node],
        priceLabels: [cc.Label],

        refreshParentNode: cc.Node,
        refreshTipsNode: cc.Node,

        panelMult: cc.Node,
        nommalLabel: cc.Label,
        multLabel: cc.Label,

        panelRefresh: cc.Node,
        taskName: cc.Label,
        remainLabel: cc.Label,
        reaminTipsLabel: cc.Label,

        goldAdverIcon: cc.Node,
        goldShareIcon: cc.Node,

        normalCoinIcon: [cc.Node],
        multipCoinIcon: [cc.Node],

        refreshAdverIcon: cc.Node,
        refreshShareIcon: cc.Node,

        activityTimeLabel: cc.Label,

        bgNode: cc.Node,
        helpTips: cc.Node,

        trggleNode: cc.Node,
        trggleRootNode: cc.Node,
        trggleNodeWidget: cc.Widget,
    },

    init: function (world, callback) {
        this.world = world;
        this.callback = callback;
        setTimeout(() => {
            if (this.trggleNodeWidget) this.trggleNodeWidget.onEnable();
        }, 200);



        this.activityDatas = ConfigData.instance.activityDuanWuDatas;

        // if (!PlayerData.instance.zongZiToDaoBi) {
        //     var count = PlayerData.instance.zongZi;
        //     if (count > 0) {
        //         this.world.uiMgr.showTips('convert zongZi x' + count + ' => Diamond x' + count)
        //     }
        //     PlayerData.instance.updateZongZiToDaoBi();
        // }

        //钻石转化
        // if (ConfigData.instance.isAfterDuanWuFestival(PlayerData.instance.getCurTime())) {
        //     var count = PlayerData.instance.zongZi;
        //     if (count > 0) {
        //         var convertCount = count * ConfigData.instance.clientData.zongZiToGold;
        //         this.world.uiMgr.showTips('convert zongZi x' + count + '=> Gold x' + convertCount)
        //         PlayerData.instance.updateGold(convertCount);
        //         PlayerData.instance.updateZongZi(-count);
        //         PlayerData.instance.showGold -= convertCount;
        //         var param = {
        //             count: convertCount,
        //             isMore: true,
        //             isLucky: true,
        //         }
        //         this.world.uiMgr.showGetMoneyEffect(param);
        //     }
        // }

        this.activityTimeLabel.string = ConfigData.instance.getUITipStr(11);

        if (!Tools.getItem('showHelpTips')) {
            this.helpTips.active = true;
            Tools.setItem('showHelpTips', 1);
        } else {
            this.helpTips.active = false
        }

        //勾选
        this.trggleNode.active = true;
        this.trggleRootNode.opacity = 200;
        this.isTrggle = true;


        AdvertMgr.instance.loadAdver(AdverType.MultipDailyTask, (hasAdver) => {
            if (hasAdver) {
                AdvertMgr.instance.openAdver(AdverType.MultipDailyTask);
            }
        });

        this.refresh();
    },


    refresh: function () {
        // let tasks = PlayerData.instance.dailyShowTask;
        // if(tasks.length)
        let tasks = PlayerData.instance.dailyShowTask;

        var maxRewardNum = 0;
        this.maxRewardIndex = 0;


        let isFestival = ConfigData.instance.isDuringDuanWuFestival(PlayerData.instance.getCurTime());
        let isGuide = PlayerData.instance.isDuringDailyTaskGuide();
        this.hasAdver = true;
        var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
        var func = (hasAdver) => {
            this.hasAdver = hasAdver;
        }

        switch (stage) {
            case StageType.Free:
            case StageType.Share:
                func(false);
                break;
            case StageType.Adver:
                AdvertMgr.instance.loadAdver(AdverType.RefreshDailyTask, func);
                break;
        }
        for (let i = 0; i < 3; i++) {
            var data = tasks[i];
            if (!data) {
                console.error('每日任务为空')
                console.log(JSON.stringify(tasks));
                continue;
            }



            var reward = (isFestival && data.specialReward) ? data.specialReward : data.reward;
            var item = BagItem.createItemWithString(reward);
            if (item.type === 0) {
                item.num = Math.ceil(item.num * (1 + data.goldMultiRate));
            }

            if (item.num > maxRewardNum) {
                maxRewardNum = item.num;
                this.maxRewardIndex = i;
            }

            var isComplete = data.process >= data.param;
            var isGet = Tools.arrContains(PlayerData.instance.dailyOldTask, data.id) || Tools.arrContains(PlayerData.instance.completeGuideDailyTask, data.id)
            if (this.itemPool[i]) {
                this.itemPool[i].refresh(data, item, isGet, this.isTrggle, this.hasAdver);
            } else {
                var node = cc.instantiate(this.itemDailyTaskPrefab);
                node.parent = this.itemParentNode;
                node.y = -i * 120;
                var comp = node.getComponent('ItemDailyTask');

                comp.refresh(data, item, isGet, this.isTrggle, this.hasAdver);
                comp.setOnItemClick(this, i);
                comp.setJumpCallback(() => {
                    this.node.active = false;
                    this.world.onStartBtnClick(null,null);
                })
                this.itemPool[i] = comp;
            }

            if (this.callback && isComplete && !isGet && !data.hasShow) {
                this.itemPool[i].needShowAnim = true;
                data.hasShow = true;
                PlayerData.instance.saveUserData('存储每日任务自动弹出信息');
            }
        }
        //生成三条任务，按钮有更换，前往和领取

        //三个可以兑换的奖励，根据获取的货币点击兑换
        this.zongZiNumLabel.string = PlayerData.instance.zongZi;


        this.titleNodes[0].active = isGuide;
        this.titleNodes[1].active = !this.titleNodes[0].active && isFestival;
        this.titleNodes[2].active = !this.titleNodes[0].active && !this.titleNodes[1].active;

        this.zongZiNumNode.active = isFestival && !isGuide;
        this.zongziRewardNode.active = isFestival && !isGuide;
        if (this.zongziRewardNode.active) {
            setTimeout(() => {
                if (this.trggleNodeWidget) this.trggleNodeWidget.onEnable();
            }, 200);
        }

        //剩余刷新次数
        var maxCount = ConfigData.instance.clientData.maxRefreshTaskCount;
        var curCount = PlayerData.instance.dayRefreshTaskCount;
        var remainCount = maxCount - curCount;
        this.remainLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(19), remainCount, maxCount)
        this.reaminTipsLabel.string = "Refresh Missions For Free";
        // this.refreshParentNode.active = !isGuide && (remainCount > 0);
        var canRefresh = true;
        for (let comp of this.itemPool) {
            if (!comp.isGet) {
                canRefresh = false;
                break;
            }
        }
        this.refreshTipsNode.active = !isGuide && (remainCount > 0) && canRefresh;
        // this.refreshTipsNode.active = true
        this.bgNode.height = this.refreshTipsNode.active ? 470 : 420;
        this.zongziRewardNode.y = this.refreshTipsNode.active ? -250 : -200;
        if (this.refreshTipsNode.active) {
            var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
            var func = (hasAdver) => {
                this.refreshAdverIcon.active = hasAdver;
                this.refreshShareIcon.active = !hasAdver;
                if (hasAdver && this.refreshTipsNode.active) {
                    AdvertMgr.instance.openAdver(AdverType.RefreshDailyTask);
                }
            }

            switch (stage) {
                case StageType.Free:
                case StageType.Share:
                    func(false);
                    break;
                case StageType.Adver:
                    AdvertMgr.instance.loadAdver(AdverType.RefreshDailyTask, func);
                    break;
            }
        }

        this.finalPrice = [];
        //兑换按钮
        for (let i = 0; i < this.activityDatas.length; i++) {

            var data = this.activityDatas[i];
            data.isLate = data.changeDate && Tools.isAfterOtherTime(data.changeDate, PlayerData.instance.getCurTime())
            this.iconNodes[i].children[0].active = !data.isLate;
            this.iconNodes[i].children[1].active = data.isLate;

            var priceArr = data.isLate ? data.latePrice : data.price;

            this.exchangeNodes[i].active = false;
            var reward = data.isLate ? data.lateReward : data.reward;
            var items = BagItem.createItemsWithString(reward)

            this.finalPrice[i] = 0;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                let price = priceArr[j] ? priceArr[j] : 0;
                switch (item.type) {
                    case ItemType.HERO_SKIN:
                        if (PlayerData.instance.isOwnHeroSkin(item.id)) {
                            price = 0;
                        } else {
                            this.exchangeNodes[i].active = true;
                        }
                        break;
                    case ItemType.KNIFE_SKIN:
                        if (PlayerData.instance.isOwnKnifeSkin(item.id)) {
                            price = 0;
                        } else {
                            this.exchangeNodes[i].active = true;
                        }
                        break;
                }
                this.finalPrice[i] += price;
            }
            this.priceLabels[i].string = this.finalPrice[i];
            this.hasGetNodes[i].active = !this.exchangeNodes[i].active;
        }

    },

    //是否翻倍领奖励的勾选
    onTrggleClick: function () {
        this.trggleNode.active = !this.trggleNode.active;
        this.isTrggle = this.trggleNode.active;
        this.trggleRootNode.opacity = this.isTrggle ? 200 : 255;
        this.refresh();
    },

    //领取按钮点击
    onItemClick: function (event, customEventData) {
        if (this.isClick) return;
        this.isClick = true;
        var index = Number(customEventData);
        var itemComp = this.itemPool[index];
        var data = itemComp.data;
        var item = itemComp.item;
        var isGet = itemComp.isGet;

        if (isGet) {
            console.log('已领取过该奖励')
            this.isClick = false;
            return;
        }


        var callback = null;
        switch (item.type) {
            case ItemType.MONEY:
                callback = (mult = 1) => {
                    var count = item.num * mult;
                    PlayerData.instance.updateGold(count);
                    PlayerData.instance.showGold -= count;
                    var param = {
                        count: count,
                        isMore: mult === 3,
                        isLucky: false,
                    }
                    this.world.uiMgr.showGetMoneyEffect(param);
                }
                break;
            case ItemType.HERO_SKIN:
                if (!PlayerData.instance.isOwnHeroSkin(item.id)) {
                    PlayerData.instance.addHeroSkin(item.id);
                    //装备上
                    this.world.onEquipHeroSkin(item.itemData, true);
                }
                //展示出来
                this.world.uiMgr.showReward(item.itemData);
                break;
            case ItemType.KNIFE_SKIN:
                if (!PlayerData.instance.isOwnKnifeSkin(item.id)) {
                    PlayerData.instance.addKnifeSkin(item.id);
                    this.world.onEquipKnifeSkin(item.itemData, true);
                }
                //展示出来
                this.world.uiMgr.showReward(item.itemData);
                break;
            case ItemType.ZONG_ZI:
                callback = (mult = 1) => {
                    var count = item.num * mult
                    PlayerData.instance.updateZongZi(count);
                    this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(15), count));
                }
                break;
        }

        this.multCallback = (mult) => {
            if (callback) callback(mult)
            PlayerData.instance.dailyShowTask[index].finalReceiveMult = mult;
            PlayerData.instance.updateDailyOldTask(data.id);
            if (data.degree === -1) {
                PlayerData.instance.updateCompleteGuideDailyTask(data.id);
                if (!PlayerData.instance.isDuringDailyTaskGuide()) {
                    for (let comp of this.itemPool) {
                        comp.playRefreshAnim();
                    }
                }
            }
            this.world.uiMgr.refreshRedDot();
            this.refresh();
            this.isClick = false;
        }

        if (item.type === ItemType.ZONG_ZI || (callback && index === this.maxRewardIndex && data.degree !== -1)) {
            this.nommalLabel.string = 'x' + item.num;
            this.multLabel.string = 'x' + item.num * 3;
            this.normalCoinIcon[0].active = item.type === ItemType.MONEY;
            this.multipCoinIcon[0].active = item.type === ItemType.MONEY;

            this.normalCoinIcon[1].active = item.type === ItemType.ZONG_ZI;
            this.multipCoinIcon[1].active = item.type === ItemType.ZONG_ZI;

            // this.panelMult.active = true;

            var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);

            var func = (hasAdver) => {
                this.goldAdverIcon.active = hasAdver;
                this.goldShareIcon.active = !hasAdver;


                // for (let comp of this.itemPool) {
                //     comp.setIcon(hasAdver);
                // }
                // if (hasAdver) {
                //     AdvertMgr.instance.openAdver(AdverType.MultipDailyTask);
                // }
            }

            switch (stage) {
                case StageType.Free:
                case StageType.Share:
                    func(false);
                    break;
                case StageType.Adver:
                    AdvertMgr.instance.loadAdver(AdverType.MultipDailyTask, func);
                    break;
            }

            if (this.isTrggle) {
                this.onMultGoldBtnClick();
            } else {
                this.onNormalGoldBtnClick();
            }
        } else {
            this.multCallback();
        }
        // this.multPanel.init(callback);
    },

    onPanelMultClose: function () {
        this.isClick = false;
        this.panelMult.active = false;
    },

    onNormalGoldBtnClick: function () {
        if (this.multCallback) {
            this.multCallback(1);
            this.isClick = false;
        }
    },

    onMultGoldBtnClick: function () {
        if (this.multCallback) {
            // 关闭广告时回调
            var closeFunc = (success) => {
                if (success) {
                    this.multCallback(3);
                }
                this.isClick = false;
            }

            if (this.goldShareIcon.active) {
                this.showShare(ShareType.MultipDailyTask, closeFunc)
            } else if (this.goldAdverIcon.active) {
                this.showAdver(AdverType.MultipDailyTask, ShareType.MultipDailyTask, closeFunc)
            } else {
                closeFunc(true);
            }
        }
    },

    showAdver: function (type, shareType, closeFunc) {
        var errFunc = () => {
            this.showShare(shareType, closeFunc);
        }

        AdvertMgr.instance.fireBaseEvent("click_adv_btn",position_id,ConfigData.instance.getAdvertUnitId(type));
        AdvertMgr.instance.showAdver(type, closeFunc, errFunc);
    },

    showShare: function (type, closeFunc) {
        ShareMgr.share(type, closeFunc);
    },



    // onRefreshAllTaskClick: function (event, customEventData) {
    //     if (this.isClickRefresh) return
    //     this.isClickRefresh = true;

    //     this.refreshCloseFunc = () => {
    //         for (let i = 0; i < 3; i++) {
    //             var data = PlayerData.instance.dailyShowTask[i]
    //             data.process = 0;
    //             var comp = this.itemPool[i];
    //             comp.playRefreshAnim();
    //             var id = data.id;

    //             PlayerData.instance.updateDailyOldTask(id);
    //             var task = ConfigData.instance.getOneDailyTask(PlayerData.instance.dailyShowTask, PlayerData.instance.dailyOldTask, PlayerData.instance.rankStar);
    //             if (task) {
    //                 task.goldMultiRate = PlayerData.instance.rankData.goldMultiRate;
    //                 PlayerData.instance.dailyShowTask[i] = task;
    //             } else {
    //                 console.error('任务刷光啦')
    //             }
    //         }
    //         PlayerData.instance.updateDayRefreshTaskCount()
    //         this.refresh();
    //         this.world.uiMgr.refreshRedDot();
    //         this.isClickRefresh = false;
    //     }

    //     this.taskName.string = '是否免费更换所有任务';
    //     this.panelRefresh.active = true;

    //     // this.showEffect
    // },




    //暂时不用
    // onRefreshTaskClick: function (event, customEventData) {
    //     if (this.isClickRefresh) return
    //     this.isClickRefresh = true;
    //     var index = Number(customEventData);
    //     var data = PlayerData.instance.dailyShowTask[index]
    //     var comp = this.itemPool[index];
    //     this.refreshCloseFunc = () => {
    //         comp.playRefreshAnim();
    //         var id = data.id;
    //         data.process = 0;
    //         PlayerData.instance.updateDayRefreshTaskCount()
    //         PlayerData.instance.updateDailyOldTask(id);
    //         var task = ConfigData.instance.getOneDailyTask(PlayerData.instance.dailyShowTask, PlayerData.instance.dailyOldTask, PlayerData.instance.rankStar);

    //         if (task) {
    //             task.goldMultiRate = PlayerData.instance.rankData.goldMultiRate;
    //             PlayerData.instance.dailyShowTask[index] = task;
    //             PlayerData.instance.saveUserData();
    //         } else {
    //             console.error('任务刷光啦')
    //         }
    //         this.refresh();
    //         this.world.uiMgr.refreshRedDot();
    //         this.isClickRefresh = false;
    //     }


    //     this.taskName.string = '是否免费更换任务：' + data.name;

    //     this.panelRefresh.active = true;
    //     var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
    //     var func = (hasAdver) => {
    //         this.refreshAdverIcon.active = hasAdver;
    //         this.refreshShareIcon.active = !hasAdver;
    //         if (hasAdver) {
    //             AdvertMgr.instance.openAdver(AdverType.RefreshDailyTask);
    //         }
    //     }

    //     switch (stage) {
    //         case StageType.Free:
    //         case StageType.Share:
    //             func(false);
    //             break;
    //         case StageType.Adver:
    //             AdvertMgr.instance.loadAdver(AdverType.RefreshDailyTask, func);
    //             break;
    //     }
    //     // this.showEffect
    // },

    onPanelRefreshClose: function () {
        this.panelRefresh.active = false;
        // this.isClickRefresh = false;
    },

    onRefreshBtnClick: function () {
        // if (this.isClickRefresh) return
        // this.isClickRefresh = true;

        this.refreshCloseFunc = () => {
            for (let i = 0; i < 3; i++) {
                var data = PlayerData.instance.dailyShowTask[i];
                data.process = 0;
                var comp = this.itemPool[i];
                comp.playRefreshAnim();
                var id = data.id;

                PlayerData.instance.updateDailyOldTask(id);
                var task = ConfigData.instance.getOneDailyTask(PlayerData.instance, i);
                if (task) {
                    task.goldMultiRate = PlayerData.instance.rankData.goldMultiRate;
                    PlayerData.instance.dailyShowTask[i] = task;
                } else {
                    console.error('Null task')
                }
            }
            PlayerData.instance.updateDayRefreshTaskCount()
            this.refresh();
            this.world.uiMgr.refreshRedDot();
            // this.isClickRefresh = false;
        }




        // 关闭广告时回调
        var closeFunc = (success) => {
            if (success) {
                this.onPanelRefreshClose();
                this.refreshCloseFunc();
            }
        }

        if (this.refreshShareIcon.active) {
            this.showShare(ShareType.RefreshDailyTask, closeFunc)
        } else if (this.refreshAdverIcon.active) {
            this.showAdver(AdverType.RefreshDailyTask, ShareType.RefreshDailyTask, closeFunc)
        } else {
            closeFunc(true);
        }

    },

    onExchangeBtnClick: function (event, customEventData) {
        var index = Number(customEventData);
        var data = this.activityDatas[index];
        if (PlayerData.instance.zongZi < this.finalPrice[index]) {
            this.world.uiMgr.showTips('Insufficient Diamond');
            return
        }

        var reward = data.isLate ? data.lateReward : data.reward;
        var items = BagItem.createItemsWithString(reward)
        for (let item of items) {
            switch (item.type) {
                case ItemType.MONEY:
                    var count = item.num;
                    PlayerData.instance.updateGold(count);
                    PlayerData.instance.showGold -= count;
                    var param = {
                        count: count,
                        isMore: false,
                        isLucky: false,
                    }
                    this.world.uiMgr.showGetMoneyEffect(param);
                    this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(16), count));
                    break;
                case ItemType.HERO_SKIN:
                    if (PlayerData.instance.isOwnHeroSkin(item.id)) {
                        // this.world.uiMgr.showTips('已经拥有，无需兑换');
                        // return;
                        item.hasGet = true;
                        this.world.onEquipHeroSkin(item.itemData, true);
                    } else {
                        PlayerData.instance.addHeroSkin(item.id);
                        //装备上
                        this.world.onEquipHeroSkin(item.itemData, true);
                    }
                    break;
                case ItemType.KNIFE_SKIN:
                    if (PlayerData.instance.isOwnKnifeSkin(item.id)) {
                        // this.world.uiMgr.showTips('已经拥有，无需兑换');
                        // return;、
                        item.hasGet = true;
                        this.world.onEquipKnifeSkin(item.itemData, true);
                    } else {
                        PlayerData.instance.addKnifeSkin(item.id);
                        this.world.onEquipKnifeSkin(item.itemData, true);
                    }
                    break;
            }
        }
        if (items.length === 2) {
            if (items[0].hasGet) {
                this.world.uiMgr.showReward(items[1].itemData);
            } else if (items[1].hasGet) {
                this.world.uiMgr.showReward(items[0].itemData);
            } else {
                this.world.uiMgr.showReward(items[0].itemData, () => {
                    this.world.uiMgr.showReward(items[1].itemData);
                });
            }
        } else if (items[0].type === ItemType.KNIFE_SKIN || items[0].type === ItemType.HERO_SKIN) {
            this.world.uiMgr.showReward(items[0].itemData);
        }


        PlayerData.instance.updateZongZi(-this.finalPrice[index]);
        this.refresh();
    },



    onClose() {
        this.node.active = false;
        if (this.callback) this.callback();
        AdvertMgr.instance.showBanner();
        console.log("showBanner onPanelDaliyTask close ")
    },
});