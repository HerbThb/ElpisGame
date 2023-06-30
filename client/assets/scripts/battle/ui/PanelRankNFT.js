const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');

const CHECK_COLOR = new cc.Color().fromHEX('#bb3a07');

const PanelRankNFT = cc.Class({
    extends: cc.Component,

    properties: {
        worldNode: cc.Node,
        worldScrollView: cc.Node,
        ranListView: cc.Node,
        worldRankPrefab: cc.Prefab,
        worldRewardNode: cc.Node,
        worldRewardScrollView: cc.Node,
        worldRewardPrefab: cc.Prefab,
        // worldCountDownLabel: cc.Label,

        // leftPageBtn: cc.Node,
        // rightPageBtn: cc.Node,

        rankContent: cc.Node,

        rewardContent: cc.Node,

        tittleTxt: cc.Node,
        rewardTxt: cc.Node,

        waitNode: cc.Node,


        scoreTxt: cc.Label,
        rankTxt: cc.Label,

        daySpan: false,
    },
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {},

    //isPK代表是展示pk榜还是世界榜
    init: function (world, callback, closeCallback) {
        this.world = world;
        if (callback) callback();
        this.closeCallback = closeCallback;

        this.tittleTxt.active = true
        this.rewardTxt.active = false

        // this._worldRewardScrollView.scrollToRank(0)
        this.startUpdate = false;


        this.refreshWorldRank()

        AdvertMgr.instance.fireBaseEvent("page_show_ranking_ranking");
    },

    setWaitNodeActive: function (isActive) {
        this.waitNode.active = isActive;
    },

    refreshWorldRank() {
        this.setWaitNodeActive(true);

        this.worldNode.active = true
        this.worldRewardNode.active = false
        let round = 0
        PlayerData.instance.getHolidayWorldRank(round, (data, mineData, isHourSpanRefresh) => {
            if (data && data.rankInfo) {
                var rankInfo = data.rankInfo;
                this.worldRound = data.round;

                // let datass = rankInfo.concat(rankInfo).concat(rankInfo).concat(rankInfo)
                let datass = rankInfo
                this.rankContent.destroyAllChildren()

                let listView = this.ranListView.getComponent("ListView");
                listView.setData(datass);
                
                if (PlayerData.instance.bitverseWallet == "") { //没有钱包地址
                    this.rankTxt.string = "???";
                }
                else {
                    this.rankTxt.string = mineData.rank == -1 ? "?" : mineData.rank
                }

                this.scoreTxt.string = PlayerData.instance.nftRankScore

                if (isHourSpanRefresh) {
                    if (mineData.rank === -1) {
                        //如果是自动弹出的则关闭
                        // if (!this.isPK) this.close();
                        // this.playWorldEffect();
                    } else {
                        this.playWorldEffect();
                    }
                } else {
                    setTimeout(() => {
                        this.setWaitNodeActive(false);
                    }, 1000);
                }
            }
            else {
                setTimeout(() => {
                    this.setWaitNodeActive(false);
                }, 1000);
            }

        })
        setTimeout(() => {
            this.setWaitNodeActive(false);
        }, 5000);
        this.startUpdate = false;
    },

    onWorldRewardBtnClick() {
        AdvertMgr.instance.fireBaseEvent("click_ranking_reward_btn");

        this.worldNode.active = false
        this.worldRewardNode.active = true

        this.setWaitNodeActive(true);
        this.rewardContent.destroyAllChildren()
        for (let i = 0; i < PlayerData.instance.nftRankRewards.length; i++) {
            const data = PlayerData.instance.nftRankRewards[i];
            var isGet = PlayerData.instance.isOwnHeroSkin(data.id) || PlayerData.instance.isOwnKnifeSkin(data.id)
            if (isGet) {
                console.log("已获得皮肤", data.id, data.name)
                continue
            }
            var itemNode = cc.instantiate(this.worldRewardPrefab);
            itemNode.parent = this.rewardContent;
            itemNode.active = true;
            var itemNodeSc = itemNode.getComponent('ItemNFTRankReward');
            itemNodeSc.init(data, this.world);
        }

        setTimeout(() => {
            this.worldRewardScrollView.getComponent('cc.ScrollView').scrollToTop(0.2)
            this.setWaitNodeActive(false);
        }, 500)

        AdvertMgr.instance.fireBaseEvent("page_show_ranking_reward");
    },

    onWorldRewardCloseBtnClick() {
        this.worldRewardNode.active = false;
    },

    close() {
        if (this.worldRewardNode.active) {
            this.worldNode.active = true
            this.worldRewardNode.active = false
            return
        }

        this.node.active = false;
        if (this.closeCallback) {
            this.closeCallback();
        }
    },

    turnPageLeft() {
        if (this.worldRound > 1) {
            this.worldRound--;
            this.refreshWorldRank(this.worldRound);
        }
    },

    turnPageRight() {
        if (this.worldRound < PlayerData.instance.maxWorldRound) {
            this.worldRound++;
            this.refreshWorldRank(this.worldRound);
        }
    },

    update(dt) {
        if (1 > 0) {
            return
        }
        if (!this.startUpdate) return;

        var date = new Date(PlayerData.instance.getCurTime());
        var h = date.getHours();
        var m = date.getMinutes();
        if (GameData.instance.isShowLog()) {
            if (h !== this.curHour) {
                this.curHour = h;
                console.log('---------------------------当前小时：' + h);
            }
        }
        if (h >= 21) {
            var str = '将于24点结算最终名次';
            if (str !== this.worldRefreshTips.string) this.worldRefreshTips.string = '将于24点结算最终名次';
        } else {
            for (let hour of ConfigData.instance.holidayDatas.refreshWorldTime) {
                if (h < hour) {
                    h = hour;
                    if (GameData.instance.isShowLog()) {
                        if (h !== this.nextHour) {
                            this.nextHour = h;
                            console.log('---------------------------下次更新小时：' + h);
                        }
                    }
                    break;
                }
            }
            if (h !== this.h) {
                console.log('---------------------------update上次更新小时：' + this.h);
                this.h = h;
                var str = '将于' + h + ':00更新排行';;
                this.worldRefreshTips.string = str;
                // this.worldRefreshTips.node.active = true;
                if (this.curHour === 0 && m < 2) {
                    this.worldRefreshTips.node.active = false;
                    this.daySpan = true;
                } else {
                    PlayerData.instance.clearHolidayData();
                    this.init(this.world);
                }
            }

            if (this.daySpan) {
                if (m < 2) {
                    // this.worldCountDownLabel.string = '正在结算中，两分钟后将公布上轮成绩';
                } else {
                    PlayerData.instance.updateWorldRewardDetail()
                    PlatformMgr.getHolidayPKReward((pdata) => {
                        this.world.uiMgr.showPanelPKReward(pdata, () => {
                            PlatformMgr.getHolidayWorldReward((wdata) => {
                                this.world.uiMgr.showPanelWorldReward(wdata);
                            });
                        })
                    })
                    PlayerData.instance.clearHolidayData();
                    this.init(this.world);

                    this.daySpan = false;
                    this.worldRefreshTips.node.active = true;
                }
            }
        }
    }
});