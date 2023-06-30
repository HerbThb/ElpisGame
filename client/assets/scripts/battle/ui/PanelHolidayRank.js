const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');

const CHECK_COLOR = new cc.Color().fromHEX('#bb3a07');

const PanelHolidayRank = cc.Class({
    extends: cc.Component,

    properties: {
        worldNode: cc.Node,
        worldScrollView: cc.Node,
        worldRankPrefab: cc.Prefab,
        worldRewardNode: cc.Node,
        worldRewardScrollView: cc.Node,
        worldRewardPrefab: cc.Prefab,
        worldCountDownLabel: cc.Label,
        worldBtn: cc.Node,
        worldCheckNode: cc.Node,
        worldNotCheckNode: cc.Node,
        worldTitleNode: cc.Node,
        worldRoundLabel: cc.Label,

        worldMyRankParent: cc.Node,

        leftPageBtn: cc.Node,
        rightPageBtn: cc.Node,

        worldRewardBg: cc.Node,
        worldRewardDetailBtn: cc.Node,
        worldEmptyNode: cc.Node,
        worldEffect: cc.Animation,
        worldRefreshTips: cc.Label,
        daySpan: false,
    },
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {},

    //isPK代表是展示pk榜还是世界榜

    init(world, isPK = false, callback) {
        this.world = world;
        this.callback = callback;

        //世界排行奖励
        this._worldRewardScrollView = Tools.getOrAddComponent(this.worldRewardScrollView, 'MyScrollView');
        this._worldRewardScrollView.init(ConfigData.instance.holidayWorldRewardDatas, {
            itemPrefab: this.worldRewardPrefab,
            className: 'ItemWorldReward',
            startX: 0,
            gapX: 15,
            gapY: 10,
            perLine: 1,
        })
        // this._worldRewardScrollView.scrollToRank(0)
        this.startUpdate = false;
        // console.log('时间：', new Date(PlayerData.instance.getCurTime()));
        this.onWorldNodeBtnClick();
        this.worldBtn.x = 0;
        this.worldRefreshTips.node.active = false;
        this.worldCountDownLabel.node.active = false;


        this.worldNode.active = true;
        this.worldCheckNode.active = true;
        this.worldNotCheckNode.active = false;
        this.worldTitleNode.color = CHECK_COLOR;
        this.worldRoundLabel.node.color = CHECK_COLOR;
    },

    refreshWorldRank(round) {
        PlayerData.instance.getHolidayWorldRank(round, (data, mineData, isHourSpanRefresh) => {
            var rankInfo = data.rankInfo;
            this.worldRound = data.round;
            this.worldRoundLabel.string = '(第' + data.round + '轮)';
            // this.worldSurplusTime = data.surplusTime;
            // 我的世界排行
            if (mineData) {
                var worldMyRankNode = cc.instantiate(this.pkRankPrefab);
                worldMyRankNode.parent = this.worldMyRankParent;
                this.worldMyRankComp = worldMyRankNode.getComponent('ItemPKRank');
                this.worldMyRankComp.init(mineData);
            } else {
                if (GameData.instance.isShowLog()) {
                    console.error('我的世界排行为空');
                }
            }
            //世界排行
            this._worldScrollView = Tools.getOrAddComponent(this.worldScrollView, 'MyScrollView');
            this.itemWorldPool = this._worldScrollView.init(rankInfo, {
                itemPrefab: this.pkRankPrefab,
                className: 'ItemPKRank',
                startX: 0,
                gapX: 15,
                gapY: 10,
                perLine: 1,
            }, (index, node) => {
                setTimeout(() => {
                    node.stopAllActions();
                    node.x = 1000;
                    node.runAction(cc.moveBy(0.5, cc.v2(-1000, 0)).easing(cc.easeBackOut(1.0)));
                }, index * 100)
            })

            if (this.worldRound === PlayerData.instance.maxWorldRound && mineData) {
                this._worldScrollView.scrollToRank(mineData.rank, 0.5);
            }

            this.leftPageBtn.active = data.round !== 1;
            this.rightPageBtn.active = data.round !== PlayerData.instance.maxWorldRound;
            this.worldMyRankParent.active = data.round === PlayerData.instance.maxWorldRound;
            this.worldEmptyNode.active = !(rankInfo && rankInfo.length);

            if (isHourSpanRefresh) {
                if (mineData.rank === -1) {
                    //如果是自动弹出的则关闭
                    // if (!this.isPK) this.close();
                    // this.playWorldEffect();
                } else {
                    this.playWorldEffect();
                }
            }


            this.startUpdate = true;
        })
    },

    playWorldEffect: function () {
        this.worldEffect.play();
    },

    onWorldRewardBtnClick() {
        this.worldRewardNode.active = true;
        var data = PlayerData.instance.playerWorldRewardDetail;
        if (!data) return;

        if (data.rewardInfo && data.rewardInfo.length) {
            this.worldRewardBg.height = 500;
            this.worldRewardDetailBtn.active = true;
        } else {
            this.worldRewardBg.height = 380;
            this.worldRewardDetailBtn.active = false;
        }
    },

    onWorldRewardCloseBtnClick() {
        this.worldRewardNode.active = false;
    },

    showPanelRewardDetail() {
        this.world.uiMgr.showPanelRewardDetail();
    },

    close() {
        this.node.active = false;
        this.world.uiMgr.hidePanelHolidayUserinfoBtns();
        if (this.callback) {
            this.callback();
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
    onbtn1: function () {
        PlatformMgr.setHolidayScore(4)
    },
    onbtn2: function () {
        PlatformMgr.getHolidayPKReward();
    },
    onbtn3: function () {
        PlatformMgr.getHolidayWorldReward();
    },
    onbtn4: function () {
        PlatformMgr.getHolidayWorldRewardInfo();
    },

    update(dt) {
        if(1>0){
            return
        }
        if (!this.startUpdate) return;

        if (PlayerData.instance.pkSurplusTime) {
            var time = PlayerData.instance.pkSurplusTime - PlayerData.instance.timeOffset;
            if (time > 0) {
                var time = Tools.getCountDownTime(time);
                this.pkCountDownLabel.string = '今日本组PK结束时间剩余：' + time.hour + ':' + time.minute + ':' + time.second;
                this.worldCountDownLabel.string = '今日世界PK结束时间剩余：' + time.hour + ':' + time.minute + ':' + time.second;
            }
        }

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
                if (this.curHour === 0 && m < 2 ) {
                    this.worldRefreshTips.node.active = false;
                    this.daySpan = true;
                } else {
                    PlayerData.instance.clearHolidayData();
                    this.init(this.world);
                }
            }

            if (this.daySpan) {
                if (m < 2) {
                    this.worldCountDownLabel.string = '正在结算中，两分钟后将公布上轮成绩';
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