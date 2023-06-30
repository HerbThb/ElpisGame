const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const PlatformMgr = require('PlatformMgr');
const GrowType = require('Types').GrowType;
const StageType = require('Types').StageType;
const GameData = require('GameData');
const RANK = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

cc.Class({
    extends: cc.Component,

    properties: {


        winNode: cc.Node,
        loseNode: cc.Node,
        rankLabel: cc.Label,
        infoLabel: cc.Label,
        goldLabel: cc.Label,
        shareNode: cc.Node,
        getNode: cc.Node,
        rankNameLabel: cc.Label,
        rankIconSprite: cc.Sprite,

        resultNode: cc.Node,
        rankNode: cc.Node,

        time: 0,
        bar: cc.Node,

        rankLabelNodes: cc.Node,
        rankGoldLabelNodes: cc.Node,
        playerRankLabel: cc.Label,
        playerNameLabel: cc.Label,
        playerGoldLabel: cc.Label,

        addScoreLabel: cc.Label,
        allGoldNode: cc.Node,
        normalGoldNode: cc.Node,
        multiplyGoldNode: cc.Node,
        multiplyGoldLabel: cc.Label,
        multiplyRateLabel: cc.Label,

        itemNode: cc.Node,
        goldNode: cc.Node,
        iconNode: cc.Node,
        flagNode: cc.Node,

        shareIcon: cc.Node,
        adverIcon: cc.Node,
        shareThreeIcon: cc.Node,
        adverThreeIcon: cc.Node,

        luckyRewardNode: cc.Node,
        luckyRewardBtn: cc.Node,
        luckyBarNode: cc.Node,
        luckyBar: cc.Node,

        multLabel: cc.Label,
        multNode: cc.Node,
        xNode: cc.Node,
        lotteryAnim: cc.Animation,

        blockNode: cc.Node,
        starNodes: [cc.Node],
        noStarNodes: [cc.Node],

        protectNode: cc.Node,
        protectStarNode: cc.Node,
        protectLevelNode: cc.Node,

        protectRankLabel: cc.Label,
        protectRankSprite: cc.Sprite,
        protectStarNodes: [cc.Node],
        noProtectRankLabel: cc.Label,
        noProtectRankSprite: cc.Sprite,
        noProtectStarNodes: [cc.Node],

        protectKingNode: cc.Node,
        protectKingLabel: cc.Label,
        noProtectKingNode: cc.Node,
        noProtectKingLabel: cc.Label,

        protectShareIcon: cc.Node,
        protectAdverIcon: cc.Node,


        kingNode: cc.Node,
        kingStar: cc.Node,
        kingLabel: cc.Label,

        noTakeStarTips: cc.Node,
        noTakeStarLabel: cc.Label,


        animAddStar: cc.Animation,
        animSubStar: cc.Animation,
        animProtectStar: cc.Animation,
        animChangeLevel: cc.Animation,

        rankBgFor2or3: cc.Node,


        multipFreeIcon: cc.Node,
        multipShareIcon: cc.Node,
        multipAdverIcon: cc.Node,

        luckyFreeIcon: cc.Node,
        luckyShareIcon: cc.Node,
        luckyAdverIcon: cc.Node,
        // queeNode: cc.Node,

        panelMultAgain: cc.Node,
        multAgainShareIcon: cc.Node,
        multAgainAdverIcon: cc.Node,
        fiveMultIcon: cc.Node,
        tenMultIcon: cc.Node,
        multAgainGoldLabel: cc.Label,

        //language
        okLangLabel: cc.Label,
        getLangLabel: cc.Label,
        collectLangLabel: cc.Label,

    },

    cleanUp: function () {
        this.first = false;
        this.hasGet = false;
        this.addStarCallback = null;
        this.isLucky = false;
        this.isMore = false;
        this.multip = 1;
    },


    init: function (world) {
        this.okLangLabel.string = 'OK';
        this.getLangLabel.string = 'You got it.';
        this.collectLangLabel.string = 'Collect';
        this.world = world;
        this.world.uiMgr.openPanelKeyCount(true);

        if (!this.first) {
            this.first = true;
            this.panelMultAgain.active = false;
            this.luckyRewardNode.active = false;


            var rank = world.localPlayer.rank;
            var win = rank === 1;
            this.win = rank === 1;
            var rankData = PlayerData.instance.rankData;
            var growGoldLevelData = PlayerData.instance.getGrowLevelDataByType(GrowType.Gold);
            if (GameData.instance.isShowLog()) {
                console.log(growGoldLevelData);
            }
            var growGoldParam = growGoldLevelData.realGoldParam / 100;

            //结算页面展示
            AdvertMgr.instance.fireBaseEvent("pege_show_settlement","rankid",toString(rank));

            if (win) {
                this.resultNode.active = false;
                this.loseNode.active = false;
                this.rankBgFor2or3.active = false;
                this.startRefresh = false;

                this.rankNode.active = true;
                var players = world.players.concat();
                players.sort((a, b) => {
                    return a.rank - b.rank;
                })
                // var rankStr = ' ';
                // var nameStr = ' ';
                // var goldStr = ' ';
                for (let i = 0; i < players.length; i++) {
                    var str = '';
                    var player = players[i];
                    str += '' + RANK[i];
                    str += '                ' + Tools.getShowNickName(player.name);
                    this.rankLabelNodes.children[i].getComponent(cc.Label).string = str;
                    var goldCount = rankData.getGold[player.rank - 1];
                    if (player.isLocal) {
                        goldCount = Math.ceil(goldCount * (player.rankData.goldMultiRate + growGoldParam + 1));
                    } else {
                        goldCount = Math.ceil(goldCount * (player.rankData.goldMultiRate + (player.goldAddition ? player.goldAddition : 0) + 1));
                    }
                    this.rankGoldLabelNodes.children[i].getComponent(cc.Label).string = goldCount;

                    this.itemNode.children[i].active = true;
                    this.goldNode.children[i].active = true;
                    UIUtil.loadResSprite(this.iconNode.children[i].getComponent(cc.Sprite), player.rankData.url);
                    UIUtil.loadResFlag(this.flagNode.children[i].getComponent(cc.Sprite), player.country);

                    this.rankLabelNodes.children[i].y = -70 * i;
                    this.rankGoldLabelNodes.children[i].y = -70 * i;
                    this.itemNode.children[i].y = -70 * i;
                    this.goldNode.children[i].y = -70 * i;
                    this.iconNode.children[i].y = -70 * i;
                    this.flagNode.children[i].y = -70 * i;



                    // AddEntitySystem.instance.loadRankSprite(this.iconNode.children[i].getComponent(cc.Sprite), player.rankData.iconIndex);
                }

                // this.playerRankLabel.string = rankStr;
                // this.playerNameLabel.string = nameStr;
                // this.playerGoldLabel.string = goldStr;
                this.infoLabel.string = 'Defeat all other players!';
                this.winNode.active = true;
            } else {
                this.rankNode.active = false;
                this.winNode.active = false;
                this.rankBgFor2or3.active = true;

                this.resultNode.active = true;
                this.loseNode.active = true;
                this.rankLabel.string = '' + RANK[rank - 1];
                this.infoLabel.string = '';
                if (rank === 2) {
                    this.infoLabel.string = 'You are almost there!';
                    // this.rankBgFor2or3.active = true;
                    // this.rankLabel.node.y += 40;
                } else if (rank === 3) {
                    // this.rankLabel.node.y += 40;
                    // this.rankBgFor2or3.active = true;
                    this.infoLabel.string = 'Keep trying!You can do it!';
                } else {
                    var killer = world.localPlayer.killer;
                    if (world.gameRuleSystem._countDownTime > 0) {
                        if (killer) {
                            // this.infoLabel.string = 'You were defeated by ' + killer.name + '.';
                            this.infoLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(14), killer.name);
                        } else {
                            this.infoLabel.string = 'You were defeated by wall.';
                        }
                    } else {
                        this.infoLabel.string = 'Time is up.';
                    }
                }
                this.startRefresh = true;
            }


            this.getWay = ConfigData.instance.getMultipGoldWayByCount(PlayerData.instance.dayPlayCount);
            // if (!AdvertMgr.instance.canGetAdver) this.getWay = 0;
            this.isMult = rank <= 8;
            this.shareThreeIcon.active = this.getWay === 0 && this.isMult ? true : false;
            this.adverThreeIcon.active = this.getWay === 1 && this.isMult ? true : false;
            this.shareIcon.active = this.getWay === 0 && !this.isMult ? true : false;
            this.adverIcon.active = this.getWay === 1 && !this.isMult ? true : false;


            this.oldHideScore = PlayerData.instance.hideScore;
            this.getHideScore = win ? rankData.winHideScore : rankData.loseHideScore;
            this.newHideScore = this.oldHideScore + this.getHideScore;
            this.newHideScore = ConfigData.instance.clampHideScore(this.newHideScore);


            var count = PlayerData.instance.getLuckyRewardData();
            var limitCount = ConfigData.instance.clientData.luckyRewardLimitCount;
            var newCount = count + 1 < limitCount ? count + 1 : limitCount;
            this.luckyBar.width = 265 * count / limitCount;
            this.finalLuckyBarWidth = 265 * newCount / limitCount;
            this.canShowLuckyBtn = limitCount === newCount;
            this.luckyRewardBtn.active = limitCount === newCount ? true : false;

            this.goldCount = Math.ceil(Tools.getItemOrFinalItem(rankData.getGold, rank - 1) * (rankData.goldMultiRate + growGoldParam + 1)); //
            if (GameData.instance.isShowLog()) {
                console.log('基础金币', Tools.getItemOrFinalItem(rankData.getGold, rank - 1),
                    '段位加成', rankData.goldMultiRate, '成长加成', growGoldParam);
            }
            this.goldLabel.string = this.goldCount;
            this.finalGoldCount = this.isMult ? this.goldCount * 3 : 120;
            this.multiplyGoldLabel.string = this.finalGoldCount;
            // this.multiplyRateLabel.string = 'coins x' + Math.ceil((rankData.goldMultiRate * 100 + 100)) + '%';
            this.multiplyRateLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(11), Math.ceil((rankData.goldMultiRate * 100 + 100)))
            this.multiplyGoldNode.active = !this.luckyRewardBtn.active;


            if (rank > 3) {
                //低于前三名不显示翻倍
                this.multiplyGoldNode.active = false;
                this.luckyRewardBtn.active = false;
                this.luckyBarNode.active = false;
            } else {
                this.luckyBarNode.active = true;
            }

            // this.stage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.adverReviveLimit);
            if (this.multiplyGoldNode.active) {
                this.stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);

                if (PlayerData.instance.isFristGame()) this.stage = StageType.Free;
                this.multipFreeIcon.active = this.stage === StageType.Free;
                this.multipShareIcon.active = this.stage === StageType.Share;
                this.multipAdverIcon.active = this.stage === StageType.Adver;


                // this.stage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.adverReviveLimit);
                // this.luckyFreeIcon.x = this.stage === StageType.Free ? 0 : 29;
                // this.luckyShareIcon.active = this.stage === StageType.Share;
                // this.luckyAdverIcon.active = this.stage === StageType.Adver;


                if (this.stage === 2) {
                    AdvertMgr.instance.loadAdver(AdverType.MultipGold, (hasAdver) => {
                        this.multipShareIcon.active = !hasAdver;
                        this.multipAdverIcon.active = hasAdver;

                        // this.luckyShareIcon.active = !hasAdver;
                        // this.luckyAdverIcon.active = hasAdver;

                        if (hasAdver) {
                            AdvertMgr.instance.openAdver(AdverType.MultipGold);
                        }
                    });
                }
            }

            //幸运默认走视频
            // this.luckyFreeIcon.x = 29;
            this.luckyShareIcon.active = false;
            this.luckyAdverIcon.active = true;


            this.allGoldNode.active = false;
            //隐藏分
            PlayerData.instance.hideScore = this.newHideScore;
            PlayerData.instance.level = ConfigData.instance.getLevelByHideScore(this.newHideScore);
            PlayerData.instance.setLuckyRewardData(newCount);
            // world的onGameOver还会调一次save
            // PlayerData.instance.saveUserData();

            //展示原有星星的逻辑
            this.rankNameLabel.string = rankData.name;
            UIUtil.loadResSprite(this.rankIconSprite, rankData.url);
            // AddEntitySystem.instance.loadRankSprite(this.rankIconSprite, rankData.iconIndex);
            this.oldStar = PlayerData.instance.rankStar;
            this.curStar = this.oldStar;
            var wasKing = rankData.levelUpStar === 0;
            this.kingNode.active = wasKing ? true : false;
            this.kingLabel.string = 'x' + (this.oldStar - rankData.star);
            if (!wasKing) this.refreshRankStar();
            this.noTakeStarTips.active = false; // = rankData.subStarRanks && rankData.subStarRanks.length !== 0 ? false : true;
            this.noTakeStarLabel = this.noTakeStarTips.children[0].getComponent('cc.Label');

            //筛选需要变化的星星
            //梳理一下：
            // 1.正常加星，出现，回调
            // 2.加星升级，先升级，然后星星出现
            // 3.加星加到王者的特殊处理
            // 4.正常掉星，消失，回调
            // 5.掉星降级，先降级，然后星星消失
            // 6.掉星掉到0的特殊处理

            const self = this;
            var stars = this.starNodes;
            var getStar = Tools.arrContains(rankData.addStarRanks, rank) ? 1 : ((this.curStar > 0 && Tools.arrContains(rankData.subStarRanks, rank)) ? -1 : 0);
            var newStar = this.oldStar + getStar;
            var newRankData = ConfigData.instance.getRankDataByStar(newStar);
            var isKing = newRankData.levelUpStar === 0;
            var isLevelChange = newRankData.id !== rankData.id;
            if (isLevelChange && getStar < 0 && !rankData.canLevelDown) {
                //该段位不会降级
                getStar = 0;
            } else {
                //数据刷新
                this.curStar = newStar;
                this.refreshData();
            }

            this.animAddStar.node.active = false;
            this.animChangeLevel.node.active = false;
            // this.kingNode.active = false;

            if (getStar === 1) {
                //加星
                if (!isLevelChange) {
                    //正常加星
                    if (wasKing) {
                        //王者
                        this.animAddStar.node.active = true;
                        self.animAddStar.node.position = cc.v2(-45, 0);
                        this.addStarCallback = () => {
                            self.animAddStar.play()
                            setTimeout(() => {
                                self.kingLabel.string = 'x' + (newStar - newRankData.star);
                                self.refreshMultipGoldBtn();
                            }, 500)
                        }
                    } else {
                        //不是王者
                        var index = newStar - rankData.star - 1;
                        var shineStar = stars[index];
                        this.animAddStar.node.active = true;
                        self.animAddStar.node.position = shineStar.position;
                        this.addStarCallback = () => {
                            self.animAddStar.play()
                            setTimeout(() => {
                                shineStar.active = true;
                            }, 300)
                            setTimeout(() => {
                                self.refreshMultipGoldBtn();
                            }, 500)
                        }
                    }
                } else {
                    //加星升级
                    var index = newStar - rankData.star - 1;
                    var shineStar = stars[index];
                    this.animAddStar.node.active = true;
                    self.animAddStar.node.position = shineStar.position;
                    this.addStarCallback = () => {
                        self.animAddStar.once('finished', () => {
                            shineStar.active = true;
                            setTimeout(() => {
                                self.animChangeLevel.node.active = true;
                                self.animChangeLevel.play()
                                self.rankNameLabel.string = newRankData.name;
                                self.multiplyRateLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(11), Math.ceil((newRankData.goldMultiRate * 100 + 100)));
                                UIUtil.loadResSprite(self.rankIconSprite, newRankData.url);
                                self.refreshRankStar();
                                if (isKing) {
                                    //王者
                                    self.kingNode.active = true;
                                    self.kingLabel.string = 'x' + (newStar - newRankData.star);
                                }
                                self.refreshMultipGoldBtn();
                            }, 700)
                        })

                        self.animAddStar.play()
                    }
                }

                this.noTakeStarTips.active = true;
                this.noTakeStarLabel.string = 'Congratulations! Get a rank star.'; //rankData.addStarRanks.length > 1 ? '恭喜获得前' + rankData.addStarRanks.length + '名，奖励1颗星' : ;
            } else if (getStar === -1) {
                this.blockNode.active = true;
                if (!isLevelChange) {
                    //正常掉星
                    var shine = cc.sequence(cc.fadeOut(0.1), cc.fadeIn(0.1), cc.fadeOut(0.1), cc.fadeIn(0.1), cc.fadeOut(0.1), cc.fadeIn(0.1), cc.fadeTo(0.2, 150))
                    if (wasKing) {
                        this.kingStar.runAction(shine);
                        //王者
                        this.subRefreshCallback = () => {
                            self.animSubStar.node.position = cc.v2(-45, 0);
                            self.animSubStar.node.active = true;
                            self.animSubStar.play();
                            this.kingStar.active = true;
                            self.animSubStar.once('finished', () => {
                                self.animSubStar.node.active = false;
                                self.kingLabel.string = 'x' + (newStar - newRankData.star);
                                self.refreshMultipGoldBtn();
                            })
                        };
                        this.protectCallback = () => {
                            self.animProtectStar.node.position = cc.v2(-45, 0);
                            self.animProtectStar.node.active = true;
                            self.animProtectStar.play()
                            self.kingLabel.string = 'x' + (self.oldStar - newRankData.star);
                            setTimeout(() => {
                                this.kingStar.active = true;
                            }, 500)
                        };
                    } else {
                        //普通段位
                        var index = newStar - rankData.star;
                        var shineStar = stars[index];
                        shineStar.runAction(shine);
                        this.subRefreshCallback = () => {
                            self.animSubStar.node.position = shineStar.position;
                            self.animSubStar.node.active = true;
                            self.animSubStar.play();
                            setTimeout(() => {
                                shineStar.active = false;
                                self.refreshMultipGoldBtn();
                            }, 300)
                        };

                        this.protectCallback = () => {
                            self.animProtectStar.node.position = shineStar.position;
                            self.animProtectStar.node.active = true;
                            self.animProtectStar.play()
                            setTimeout(() => {
                                shineStar.active = true;
                            }, 500)
                        }
                    }
                } else {
                    //掉星降级
                    var index = newStar - newRankData.star;
                    var shineStar = stars[index] ? stars[index] : this.kingStar;

                    this.subRefreshCallback = () => {
                        self.animChangeLevel.node.active = true;
                        self.animChangeLevel.play();
                        self.rankNameLabel.string = newRankData.name;
                        // self.multiplyRateLabel.string = 'coins x' + Math.ceil((newRankData.goldMultiRate * 100 + 100)) + '%';
                        self.multiplyRateLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(11), Math.ceil((newRankData.goldMultiRate * 100 + 100)));
                        UIUtil.loadResSprite(self.rankIconSprite, newRankData.url);
                        // AddEntitySystem.instance.loadRankSprite(self.rankIconSprite, newRankData.iconIndex);
                        self.refreshRankStar();
                        shineStar.active = true;
                        if (wasKing) {
                            self.kingNode.active = false;
                            self.kingLabel.string = 'x' + (newStar - newRankData.star);
                        }

                        setTimeout(() => {
                            self.animSubStar.node.position = shineStar.position;
                            self.animSubStar.node.active = true;
                            self.animSubStar.play();
                            setTimeout(() => {
                                shineStar.active = false;
                                self.refreshMultipGoldBtn();
                            }, 300)
                        }, 1000)
                    }

                    this.protectCallback = () => {
                        self.animChangeLevel.node.active = true;
                        self.animChangeLevel.play();
                    }
                }


                this.noTakeStarTips.active = true;
                this.noTakeStarLabel.string = (rankData.subStarRanks[0] - 1 > 1) ? '未获得前' + (rankData.subStarRanks[0] - 1) + '名，失去1颗星' : '未获得第一名，失去1颗星';


                var protectWay = ConfigData.instance.getProtectWayByCount(PlayerData.instance.dayProtectCount);
                this.protectWay = protectWay;

                var time = isLevelChange ? 500 : 1000;
                setTimeout(() => {
                    if (protectWay === 0 || protectWay === 1) {
                        this.showPanelProtect(rankData, newRankData, isLevelChange, protectWay);
                    } else {
                        if (this.subRefreshCallback) {
                            this.subRefreshCallback();
                        }
                        this.blockNode.active = false;
                    }
                }, time);
            } else {
                //不加星也不掉星
                this.refreshMultipGoldBtn();
            }

            if (this.startRefresh) {
                if (this.addStarCallback) this.addStarCallback();
                this.world.showPanelTreasureBox()
            }

            // PlatformMgr.showMiniOpenDataContext();

            // if(win) {
            // AdvertMgr.instance.showBanner();
            // } else {
            //     this.queeNode.active = true;
            // }
            // cc.director.preloadScene("Battle");
        }
    },


    refreshData: function (isProtect) {
        const self = this;
        PlayerData.instance.rankStar = self.curStar;
        PlayerData.instance.oldRankData = isProtect ? ConfigData.instance.getRankDataByStar(self.curStar) : PlayerData.instance.rankData;

        var newRankData = ConfigData.instance.getRankDataByStar(self.curStar);
        if (PlayerData.instance.rankData !== newRankData) {
            PlayerData.instance.rankData = newRankData;
            if (newRankData.unlockMap) {
                PlayerData.instance.newMap = newRankData.unlockMap;
            }
        }



        PlatformMgr.setUserCloudStorage(PlayerData.instance.rankStar);
    },

    refreshRankStar() {
        var rankData = ConfigData.instance.getRankDataByStar(this.curStar);
        var stars = this.starNodes;
        var noStars = this.noStarNodes;
        var interval = 40 / rankData.levelUpStar + 20;
        for (let i = 0; i < 5; i++) {
            var xPos = i * interval * 2 - interval * (rankData.levelUpStar - 1);
            var isGet = this.curStar > rankData.star + i;
            var isShow = i < rankData.levelUpStar;
            if (stars[i]) {
                stars[i].active = isGet && isShow ? true : false;
                if (rankData.levelUpStar === 1) {
                    stars[i].x = 0;
                } else {
                    stars[i].x = xPos
                }
            }
            if (noStars[i]) {
                noStars[i].active = isShow ? true : false;
                if (rankData.levelUpStar === 1) {
                    noStars[i].x = 0;
                } else {
                    noStars[i].x = xPos;
                }
            }
        }
    },

    restartGame: function () {
        if (this.hasGet) return;
        this.hasGet = true;
        var param = {
            count: this.goldCount,
            isMore: this.isMore,
            isLucky: this.isLucky,
            multip: this.multip,
        }
        // console.log(param)
        PlayerData.instance.updateGold(this.goldCount);
        PlayerData.instance.showGold -= this.goldCount;

        this.world.uiMgr.showGetMoneyEffect(param);
        // this.world.uiMgr.showTips('获得金币x' + this.goldCount);

        // if (PlayerData.instance.canShowMultAgain() && !this.isLucky && this.win) {
        //     if (this.isMore) {
        //         this.fiveMultIcon.active = true;
        //         this.tenMultIcon.active = false;
        //         this.showMultAgain(this.goldCount, 5);
        //     } else {
        //         this.fiveMultIcon.active = false;
        //         this.tenMultIcon.active = true;
        //         this.showMultAgain(this.goldCount, 10);
        //     }
        // } else {
        this.world.restartGame();
        // }
        // this.world.restartGame();
        // AdvertMgr.instance.destoryBanner();
        // PlatformMgr.closeMiniOpenDataContext();
        // if (PlayerData.instance.playCount % 2 === 0) 
        // {
            // AdvertMgr.instance.showInterstitial();
        // }
    },
    // update (dt) {},

    showMultAgain: function (count, mult) {
        this.resultNode.active = false;
        this.panelMultAgain.active = true;
        // this.multAgainMult = mult;
        this.multAgainCount = count * mult;
        this.multAgainGoldLabel.string = this.multAgainCount;

        var stage = ConfigData.instance.getCurStageByPrizeCount(PlayerData.instance);
        var func = (hasAdver) => {
            this.multAgainAdverIcon.active = hasAdver;
            this.multAgainShareIcon.active = !hasAdver;
            if (hasAdver) {
                AdvertMgr.instance.openAdver(AdverType.MultipAgain);
            }
        }

        switch (stage) {
            case StageType.Free:
            case StageType.Share:
                func(false);
                break;
            case StageType.Adver:
                AdvertMgr.instance.loadAdver(AdverType.MultipAgain, func);
                break;
        }

    },

    onMultAgainBtnClick: function () {
        var self = this;
        var multipCallback = (success) => {
            if (success) {
                var count = this.multAgainCount;
                PlayerData.instance.resetDayMultAgainCDCount(ConfigData.instance.clientData.dayMultAgainCDCount);
                PlayerData.instance.updateGold(count);
                PlayerData.instance.showGold -= count;
                var param = {
                    count: count,
                    isMore: false,
                    isLucky: true,
                    // multip: this.multAgainMult,
                }
                this.world.uiMgr.showGetMoneyEffect(param);
                this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(17), count))
                this.world.restartGame();
            }
        }

        if (this.multAgainShareIcon.active) {
            this.showMultAgainShare(multipCallback);
        } else if (this.multAgainAdverIcon.active) {
            this.showMultAgainAdvert(multipCallback);
        } else {
            multipCallback(true)
        }
    },

    onCLoseMultAgain: function () {
        this.panelMultAgain.active = false;
        PlayerData.instance.resetDayMultAgainCDCount(ConfigData.instance.clientData.dayMultAgainCDCount);
        PlayerData.instance.updateDayMultAgainCloseCount();
        this.world.restartGame();
    },

    showMultAgainShare: function (multipCallback) {
        ShareMgr.share(ShareType.MultipAgain, multipCallback)
    },

    showMultAgainAdvert: function (multipCallback) {
        var self = this;
        // 打开广告失败时回调,失败回调
        var errFunc = () => {
            self.showMultAgainShare(multipCallback);
        }
        AdvertMgr.instance.showAdver(AdverType.MultipAgain, multipCallback, errFunc);
    },





    onShareBtnClick: function () {
        const self = this;
        ShareMgr.share(ShareType.WIN, (isSuccess) => {
            if (isSuccess) {
                self.world.uiMgr._GSGame.showTips(1);
            }
        });
    },


    onMultiplyBtnClick: function () {
        var self = this;
        var multipCallback = (success) => {
            if (success) {
                self.goldCount = self.finalGoldCount;
                self.multip = 3;
                self.isMore = true;
                self.restartGame();
            }
        }

        if (this.multipShareIcon.active) {
            this.showShare(multipCallback);
        } else if (this.multipAdverIcon.active) {
            // AdvertMgr.instance.destoryBanner();
            this.showAdvert(multipCallback);
        } else {
            multipCallback(true)
        }

    },

    showShare: function (multipCallback) {
        ShareMgr.share(ShareType.MultipGold, multipCallback)
    },

    showAdvert: function (multipCallback) {
        var self = this;
        // 打开广告失败时回调,失败回调
        var errFunc = () => {
            self.showShare(multipCallback);
        }

        AdvertMgr.instance.fireBaseEvent("click_adv_btn","position_id",ConfigData.instance.getAdvertUnitId(AdverType.MultipGold));
        AdvertMgr.instance.showAdver(AdverType.MultipGold, multipCallback, errFunc);
    },


    onContinueBtnClick: function () {
        this.rankNode.active = false;
        this.resultNode.active = true;
        this.startRefresh = true;
        if (this.addStarCallback) this.addStarCallback();
        this.world.showPanelTreasureBox()
    },

    update(dt) {
        if (this.startRefresh) {
            // this.updateRankBar(dt);
            if (this.allGoldNode.active) {
                this.updateLuckyBar(dt);
            }
        }
    },

    updateRankBar(dt) {
        if (this.oldStar === this.newStar) return;
        var rankData = ConfigData.instance.getRankDataByStar(this.oldStar);
        if (rankData.levelUpStar === 0) return;

        var addStar = rankData.levelUpStar * dt * 1.5; //按固定比率增加，保证进度条的速度不变
        if (this.getStar < rankData.levelUpStar) {
            addStar = this.getStar * dt * 1.5;
        }
        this.oldStar += addStar;

        if (this.getStar > 0) {
            if (this.oldStar > this.newStar) {
                this.oldStar = this.newStar;
            }
        } else {
            if (this.oldStar < this.newStar) {
                this.oldStar = this.newStar;
            }
        }

        rankData = ConfigData.instance.getRankDataByStar(this.oldStar);
        if (rankData.name !== this.rankNameLabel.string) {
            this.rankNameLabel.string = rankData.name;
            UIUtil.loadResSprite(this.rankIconSprite, rankData.url);
            // AddEntitySystem.instance.loadRankSprite(this.rankIconSprite, rankData.iconIndex);
        }

        if (rankData.levelUpStar === 0) {
            this.bar.width = 300;
        } else {
            this.bar.width = (this.oldStar - rankData.star) / rankData.levelUpStar * 300;
        }
    },

    updateLuckyBar(dt) {
        if (this.luckyBar.width === this.finalLuckyBarWidth) return;
        this.luckyBar.width += 100 * dt;
        if (this.luckyBar.width > this.finalLuckyBarWidth) {
            this.luckyBar.width = this.finalLuckyBarWidth
        }
    },

    onLuckyRewardBtnClick: function () {
        this.luckyRewardNode.active = true;
        this.onLuckyMultipBtnClick();
    },

    onLuckyMultipBtnClick: function () {
        this.blockNode.active = true;
        //点击广告，获取随机倍数加金币，播放动画，返回主页 Tools.getRandomInt(5, 10) 
        const self = this;
        // 关闭广告时回调
        var closeFunc = (success) => {
            if (success) {
                self.isLucky = true;
                var luckyRewardMultips = ConfigData.instance.clientData.luckyRewardMultips;
                var multip = Tools.getRandomInt(5, 10);
                if (luckyRewardMultips[PlayerData.instance.luckyRewardCount]) {
                    multip = Tools.getRandomInt(luckyRewardMultips[PlayerData.instance.luckyRewardCount], 10);
                    PlayerData.instance.updateLuckyRewardCount();
                }
                self.multip = multip;
                self.finalGoldCount = multip * self.goldCount;

                self.lotteryAnim.play('ani-lucky-slot');
                var xNodes = self.xNode.children;
                self.multNode.y = 2590;
                var str = multip + '\n\r';
                xNodes[0].x = multip === 10 ? 0 : 40;
                xNodes[0].y = 0;
                for (let i = 1; i < 10; i++) {
                    let mult = Tools.getRandomInt(5, 10)
                    str += mult + '\n\r'
                    if (xNodes[i]) {
                        xNodes[i].x = mult === 10 ? 0 : 40;
                        xNodes[i].y = i * -259;
                    }
                }
                str += 10 + '\n\r'
                xNodes[10].x = 0;
                xNodes[10].y = -2590;

                self.multLabel.string = str;

                var delay = cc.delayTime(0.3);
                var action = cc.moveTo(3, cc.v2(0, 0)).easing(cc.easeBounceOut());
                var callFunc = cc.callFunc(() => {
                    PlayerData.instance.setLuckyRewardData(0);
                    self.goldCount = self.finalGoldCount;
                    setTimeout(() => {
                        self.restartGame();
                        self.blockNode.active = false;
                    }, 500)
                })
                self.multNode.runAction(cc.sequence(delay, action, callFunc))
            } else {
                self.blockNode.active = false;
            }
        }

        if (this.luckyShareIcon.active) {
            this.showLuckyShare(closeFunc);
        } else if (this.luckyAdverIcon.active) {
            this.showLuckyAdver(closeFunc);
        } else {
            closeFunc(true)
        }

    },

    showLuckyShare: function (closeFunc) {
        ShareMgr.share(ShareType.MultipGold, closeFunc);
    },

    showLuckyAdver: function (closeFunc) {
        const self = this;
        // 打开广告失败时回调,失败回调
        var errFunc = () => {
            self.showLuckyShare(closeFunc);
        }

        AdvertMgr.instance.showAdver(AdverType.MultipGold, closeFunc, errFunc);
    },


    onCloseLuckyNodeBtnClick: function () {
        this.luckyRewardNode.active = false;
    },

    onProtectBtnClick: function () {
        var self = this;
        // 关闭回调
        var closeFunc = function (success) {
            if (success) {
                self.noTakeStarTips.active = false;
                self.protectNode.active = false;
                self.curStar = self.oldStar;
                self.refreshData(true);
                PlayerData.instance.updateDayProtectCount()
                if (self.protectCallback) {
                    self.protectCallback();
                    setTimeout(() => {
                        self.refreshMultipGoldBtn();
                    }, 500);
                }
            }
        };

        if (this.protectWay === 0) {
            self.showProtectShare(closeFunc);
        } else {
            self.showProtectAdver(closeFunc);
        }
    },

    showProtectShare: function (closeFunc) {
        ShareMgr.share(ShareType.ProtectStar, closeFunc);
    },

    showProtectAdver: function (closeFunc) {
        const self = this;
        var errFunc = function () {
            self.showProtectShare(closeFunc);
        };
        AdvertMgr.instance.showAdver(AdverType.ProtectStar, closeFunc, errFunc);
    },

    onReduceProtectBtnClick: function () {
        this.protectNode.active = false;
        if (this.subRefreshCallback) {
            this.subRefreshCallback();
        }
    },

    showPanelProtect: function (curData, nextData, isLevelDown, protectWay) {
        this.protectNode.active = true;
        this.blockNode.active = false;
        this.protectStarNode.active = isLevelDown ? false : true;
        this.protectLevelNode.active = isLevelDown ? true : false;
        this.protectRankLabel.node.parent.y = isLevelDown ? -75 : -110;
        this.noProtectRankLabel.node.parent.y = isLevelDown ? -75 : -110;
        if (!isLevelDown) {
            this.refreshProtectRankStar(this.protectStarNodes, this.oldStar);
            this.refreshProtectRankStar(this.noProtectStarNodes, this.curStar);
        }

        this.protectKingNode.active = nextData.levelUpStar === 0 ? true : false;
        this.protectKingLabel.string = 'x' + (this.oldStar - nextData.star);
        this.noProtectKingNode.active = nextData.levelUpStar === 0 ? true : false;
        this.noProtectKingLabel.string = 'x' + (this.curStar - nextData.star);

        this.protectRankLabel.string = curData.name;
        this.noProtectRankLabel.string = nextData.name;
        UIUtil.loadResSprite(this.protectRankSprite, curData.url);
        // AddEntitySystem.instance.loadRankSprite(this.protectRankSprite, curData.iconIndex);
        UIUtil.loadResSprite(this.noProtectRankSprite, nextData.url);
        // AddEntitySystem.instance.loadRankSprite(this.noProtectRankSprite, nextData.iconIndex);

        this.protectShareIcon.active = protectWay === 0 ? true : false;
        this.protectAdverIcon.active = protectWay === 1 ? true : false;
    },


    refreshProtectRankStar: function (starNode, starCount) {
        var rankData = ConfigData.instance.getRankDataByStar(starCount);
        var stars = starNode[1].children;
        var noStars = starNode[0].children;
        var interval = 140 / rankData.levelUpStar;
        for (let i = 0; i < stars.length; i++) {
            var isGet = starCount > rankData.star + i;
            var isShow = i < rankData.levelUpStar;
            if (stars[i]) {
                stars[i].active = isGet && isShow ? true : false;
                if (rankData.levelUpStar === 1) {
                    stars[i].x = 0;
                    stars[i].y = 0;
                } else {
                    stars[i].x = i * interval * 2 - interval * (rankData.levelUpStar - 1);
                    if (stars[i].x === 0) {
                        stars[i].y = 0;
                    } else {
                        stars[i].y += (Math.abs(stars[i].x)) / 2 - 20;
                    }
                }
            }
            if (noStars[i]) {
                noStars[i].active = isShow ? true : false;
                noStars[i].x = stars[i].x;
                noStars[i].y = stars[i].y;
            }
        }
    },

    refreshMultipGoldBtn: function () {
        this.allGoldNode.active = true;
    },
});