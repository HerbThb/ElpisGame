const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const TaskType = require('Types').TaskType;
const ItemType = require('Types').ItemType;
const AdvertMgr = require('AdvertMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        showList: [],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init: function (world) {
        this.world = world;
        this.tasks = ConfigData.instance.getTasks();
    },


    checkTaskInHome() {
        for (const task of this.tasks) {
            var process = 0;
            switch (task.type) {
                case TaskType.LOGIN:
                    process = PlayerData.instance.signCount + 1;
                    break;
                case TaskType.PLAYCOUNT:
                    process = PlayerData.instance.playCount;
                    break;
                case TaskType.KILLCOUNT:
                    process = PlayerData.instance.killCount;
                    break;
                case TaskType.RANK:
                    var rankData = PlayerData.instance.rankData;
                    process = rankData.id;
                    break;
                case TaskType.ADVERCOUNT:
                    process = PlayerData.instance.totalAdverCount;
                    break;
            }
            PlayerData.instance.taskProcess[task.id] = process;
            if (process >= task.param) {
                if (!Tools.arrContains(PlayerData.instance.completeTaskIds, task.id)) {
                    PlayerData.instance.addCompleteTask(task.id);
                    this.world.uiMgr.refreshRedDot();
                    if (task.type !== TaskType.LOGIN) {
                        return task;
                    };
                }
            }
        }
    },

    refreshTaskInHome: function (callback) {
        const self = this;
        const selfWorld = this.world;

        const task = this.checkTaskInHome();
        if (task) {
            PlayerData.instance.showPanelBuySkinFlag = false;
            switch (task.rewardType) {
                case ItemType.HERO_SKIN:
                    var data = ConfigData.instance.getHeroSkinById(task.rewardId);
                    if (!Tools.arrContains(PlayerData.instance.ownHeroSkins, data.id)) {
                        //展示奖励（分段位获得和其他任务获得）
                        if (data.unlockWay !== 0) {
                            if (AdvertMgr.instance.canGetAdver) {
                                selfWorld.uiMgr.showReward(data, (success) => {
                                    if (success) {
                                        //解锁皮肤
                                        PlayerData.instance.addHeroSkin(task.rewardId);
                                        selfWorld.onEquipHeroSkin(data, true);
                                        selfWorld.uiMgr.refreshRedDot();
                                        var name = ConfigData.instance.getLanguageStr(data.name);
                                        selfWorld.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(18), name));
                                    }
                                    self.refreshTaskInHome(callback);
                                }, () => {
                                    selfWorld.uiMgr.showTips(4)
                                });
                            } else {
                                //没有广告就直接刷下一个任务了
                                self.refreshTaskInHome(callback);
                            }
                        } else {
                            //解锁皮肤
                            PlayerData.instance.addHeroSkin(task.rewardId);
                            selfWorld.onEquipHeroSkin(data, true);
                            selfWorld.uiMgr.refreshRedDot();

                            selfWorld.uiMgr.showReward(data, () => {
                                self.refreshTaskInHome(callback);
                            });
                        }
                    }
                    break;
                case ItemType.KNIFE_SKIN:
                    var data = ConfigData.instance.getKnifeSkinById(task.rewardId);
                    if (!Tools.arrContains(PlayerData.instance.ownKnifeSkins, data.id)) {
                        //展示奖励（分段位获得和其他任务获得）
                        if (data.unlockWay !== 0) {
                            if (AdvertMgr.instance.canGetAdver) {
                                selfWorld.uiMgr.showReward(data, (success) => {
                                    if (success) {
                                        //解锁皮肤
                                        PlayerData.instance.addKnifeSkin(task.rewardId);
                                        selfWorld.onEquipKnifeSkin(data, true);
                                        selfWorld.uiMgr.refreshRedDot();
                                        var name = ConfigData.instance.getLanguageStr(data.name);
                                        selfWorld.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(18), name));
                                    }
                                    self.refreshTaskInHome(callback);
                                }, () => {
                                    selfWorld.uiMgr.showTips(4)
                                });
                            } else {
                                //没有广告就直接刷下一个任务了
                                self.refreshTaskInHome(callback);
                            }
                        } else {
                            PlayerData.instance.addKnifeSkin(task.rewardId);
                            selfWorld.onEquipKnifeSkin(data, true);
                            selfWorld.uiMgr.refreshRedDot();

                            selfWorld.uiMgr.showReward(data, () => {
                                self.refreshTaskInHome(callback);
                            });
                        }
                    }
                    break;
            }
        } else {
            if (callback) callback()
        }
    },

    checkTaskInGame() {
        for (const task of this.tasks) {
            var process = 0;
            switch (task.type) {
                case TaskType.LOGIN:
                    process = PlayerData.instance.signCount + 1;
                    break;
                case TaskType.PLAYCOUNT:
                    process = PlayerData.instance.playCount;
                    break;
                case TaskType.KILLCOUNT:
                    process = PlayerData.instance.killCount;
                    break;
                case TaskType.RANK:
                    var rankData = PlayerData.instance.rankData;
                    process = rankData.id;
                    break;
                case TaskType.ADVERCOUNT:
                    process = PlayerData.instance.totalAdverCount;
                    break;
            }
            PlayerData.instance.taskProcess[task.id] = process;
            if (process >= task.param) {
                if (!Tools.arrContains(PlayerData.instance.showTaskInGameIds, task.id) && !Tools.arrContains(PlayerData.instance.completeTaskIds, task.id)) {
                    PlayerData.instance.addShowTask(task.id);
                    this.showList.push(task);
                }
            }
        }
    },

    refreshTaskInGame: function () {
        this.checkTaskInGame();
    },
});