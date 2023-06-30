const PlayerData = require('PlayerData');
const GrowType = require('Types').GrowType;
const ConfigData = require('ConfigData');
const Tools = require('Tools');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;


cc.Class({
    extends: cc.Component,

    properties: {

        growNode: cc.Node,
        bgNode: cc.Node,
        checkNode: cc.Node,
        closeNode: cc.Node,
        iconNode: cc.Node,
        arrowNode: cc.Node,
        priceNode: cc.Node,
        adverNode: cc.Node,

        lockCheckNode: cc.Node,
        lockCloseNode: cc.Node,
        lockNode: cc.Node,

        unlockBtnAnimNode: cc.Node,
        unlockInfoAnim: cc.Animation,

        rootNode: cc.Node,
        tipsLabel: cc.Label,
        nameLabel: cc.Label,
        levelLabel: cc.Label,
        paramLabel: cc.Label,
        priceLabel: cc.Label,

        getGoldNode: cc.Node,
        getGoldLabel: cc.Label,
        getGoldAdverIcon: cc.Node,
        getGoldShareIcon: cc.Node,

        levelUpByGoldNode: cc.Node,
        levelUpByAdverNode: cc.Node,

        downNodeAni: cc.Animation,

        lockTips: cc.Node,
        lockTipsLabel: cc.Label,
        unlockInfoNode: cc.Node,
        lockArr: [],

        unlockTipsNode: cc.Node,
        unlockTipsIconNode: cc.Node,
        unlockTipsLabelNode: cc.Node,
    },

    init: function (world) {

        //解锁相关
        var stage = ConfigData.instance.getCurGrowStage(PlayerData.instance.playCount, ConfigData.instance.clientData.growLimit);

        switch (stage) {
            case 0:
                this.lockArr = [0, 1, 2, 3];
                break;
            case 1:
                this.lockArr = [0, 1];
                break;
            case 2:
                this.lockArr = [];
                break;
        }
        switch (PlayerData.instance.showUnlockGrow) {
            case 1:
                this.lockArr = [0, 1, 2, 3];
                this.showCallFunc = (callback) => {
                    this.showAnim([2, 3], [0, 1], callback);
                }
                break;
            case 2:
                this.lockArr = [0, 1];
                this.showCallFunc = (callback) => {
                    this.showAnim([0, 1], [], callback);
                }
                break;
        }
        PlayerData.instance.showUnlockGrow = 0;



        //ui
        this.world = world;
        this.checkNodes = this.checkNode.children;
        this.closeNodes = this.closeNode.children;
        this.iconNodes = this.iconNode.children;


        this.lockCheckNodes = this.lockCheckNode.children;
        this.lockCloseNodes = this.lockCloseNode.children;
        this.lockNodes = this.lockNode.children;

        this.arrowNodes = this.arrowNode.children;
        this.animNodes = this.unlockBtnAnimNode.children;


        this.growDatas = ConfigData.instance.growDatas;
        for (let i = 0; i < this.arrowNodes.length; i++) {
            var node = this.arrowNodes[i];
            var data = this.growDatas[i];
            var levelData = PlayerData.instance.getGrowLevelDataByType(i);
            if (PlayerData.instance.gold >= levelData.price && !Tools.arrContains(this.lockArr, i) && levelData.id !== data.maxLevel) {
                node.active = true;
            } else {
                node.active = false;
            }
        }



        this.onBtnClick(null, 2, false);


        // var height = (GameData.instance.screenHeight - 1280) / 2;
        // var offset = height > 40 ? height - 40 : 0;
        // this.growNode.y = -offset;
        // this.bgNode.height = 226 + (offset < 30 ? offset : offset - 30);
        this.getGoldAdverIcon.active = ConfigData.instance.clientData.stopAdverToShare;
        this.getGoldShareIcon.active = !this.getGoldAdverIcon.active;
    },

    showAnim: function (arr, finalArr, callback) {

        var i = 0;
        for (let index of arr) {
            if (index === 2) {
                this.checkNodes[index].active = false;
                this.lockCheckNodes[index].active = true;

                this.unlockInfoNode.active = false;
                this.lockTips.active = true
            } else {
                this.closeNodes[index].active = false;
                this.lockCloseNodes[index].active = true;
            }


            setTimeout(() => {
                this.animNodes[index].active = true;
                var anim = this.animNodes[index].children[0].getComponent(cc.Animation);
                anim.once('finished', () => {
                    this.animNodes[index].active = false;
                    var levelData = PlayerData.instance.getGrowLevelDataByType(index);
                    
                    if (PlayerData.instance.gold >= levelData.price) {
                        this.arrowNodes[index].active = true;
                    }

                    if (index === 1 || index === 3) {
                        this.lockArr = finalArr;
                        this.onBtnClick(null, 2, false);
                        if (callback) callback();
                    } else if (index === 2) {
                        this.unlockInfoAnim.node.active = true;
                        this.unlockInfoAnim.play();
                        this.unlockInfoAnim.once('finished', () => {
                            this.unlockInfoAnim.node.active = false;
                        });
                    }
                })
                anim.play();
            }, 1200)



            //tips
            this.unlockTipsIconNode.children[i].children[index].active = true;
            this.unlockTipsLabelNode.children[i].getComponent(cc.Label).string = this.growDatas[index].name;

            i++;
        }
        this.unlockTipsNode.active = true;
    },

    onBtnClick: function (event, data, isAni = true) {
        var type = Number(data)
        for (let i = 0; i < this.checkNodes.length; i++) {
            if (i === type) {
                //选中
                if (!this.checkNodes[i].active && !Tools.arrContains(this.lockArr, i)) this.checkNodes[i].active = true;
                if (this.closeNodes[i].active) this.closeNodes[i].active = false;
                if (!this.lockCheckNodes[i].active) this.lockCheckNodes[i].active = true;
                if (this.lockCloseNodes[i].active) this.lockCloseNodes[i].active = false;
                if (this.lockNodes[i].y !== 0) this.lockNodes[i].y = 0;

                if (this.iconNodes[i].scale !== 1) this.iconNodes[i].scale = 1;
                if (this.iconNodes[i].y !== 0) this.iconNodes[i].y = 0;
                if (this.iconNodes[i].opacity !== 255) this.iconNodes[i].opacity = 255;
            } else {
                if (this.checkNodes[i].active) this.checkNodes[i].active = false;
                if (!this.closeNodes[i].active && !Tools.arrContains(this.lockArr, i)) this.closeNodes[i].active = true;
                if (this.lockCheckNodes[i].active) this.lockCheckNodes[i].active = false;
                if (!this.lockCloseNodes[i].active) this.lockCloseNodes[i].active = true;
                if (this.lockNodes[i].y !== -22) this.lockNodes[i].y = -22;

                if (this.iconNodes[i].scale !== 0.7) this.iconNodes[i].scale = 0.7;
                if (this.iconNodes[i].y !== -16) this.iconNodes[i].y = -16;
                if (this.iconNodes[i].opacity !== 155) this.iconNodes[i].opacity = 155;
            }
        }

        this.refreshShowData(type, isAni);
    },

    refreshShowData: function (type, isAni = true) {
        this.curType = type;
        var data = this.growDatas[type];
        var levelData = PlayerData.instance.getGrowLevelDataByType(type);
        this.nameLabel.string = data.name;
        this.levelLabel.string = 'Lv' + levelData.id;
        this.paramLabel.string = levelData.showTips;
        this.priceLabel.string = Tools.getGoldStr(levelData.price);
        var color = levelData.price > PlayerData.instance.gold ? cc.Color.RED : new cc.Color().fromHEX("#702800");
        Tools.setNodeColor(this.priceLabel.node, color);
        this.tipsLabel.string = data.tips;
        this.rootNode.x = type === 3 ? 55 : 0;
        this.curData = levelData;
        this.priceNode.active = levelData.id === data.maxLevel ? false : true;
        this.adverNode.active = this.priceNode.active;

        // var isLevelUpByAdver = ConfigData.instance.isGrowLevelUpByAdver(type, levelData.id);
        // this.levelUpByAdverNode.active = isLevelUpByAdver;
        // this.levelUpByGoldNode.active = !isLevelUpByAdver;

        this.lockTips.active = Tools.arrContains(this.lockArr, type)
        this.unlockInfoNode.active = !this.lockTips.active;
        this.lockTipsLabel.string = data.lockTips + '(' + PlayerData.instance.playCount + '/' + data.param + ')';

        for (let i = 0; i < this.arrowNodes.length; i++) {
            var node = this.arrowNodes[i];
            //点击关闭
            if (i === type) {
                if (node.active) node.active = false;
            }
            //金币不够的关闭
            var levelData = PlayerData.instance.getGrowLevelDataByType(i);
            if (PlayerData.instance.gold < levelData.price) {
                if (node.active) node.active = false;
            }
        }

        if (isAni) {
            this.downNodeAni.play();
        }

    },

    growBtnClick: function () {
        if (!this.curData) return;

        if (this.levelUpByAdverNode.active) {
            //广告升级
            this.onLevelUpByAdverBtnClick();
        } else {
            //金币升级
            if (PlayerData.instance.gold >= this.curData.price) {
                this.onGrowUp(this.curType);
                PlayerData.instance.updateGold(-(this.curData.price), null, true);
                this.refreshShowData(this.curType);

                this.world.uiMgr.showTips(5)
            } else {
                var canShowGold = PlayerData.instance.dayGetGoldCount < 3;
                if (canShowGold) {
                    this.getGoldNode.active = true;
                    var rankData = PlayerData.instance.rankData;
                    var growGoldLevelData = PlayerData.instance.getGrowLevelDataByType(GrowType.Gold);
                    var growGoldParam = growGoldLevelData.realGoldParam / 100;
                    var rate = rankData.goldMultiRate + growGoldParam + 1;
                    this.getGoldcount = Math.ceil(Tools.getItemOrFinalItem(rankData.getGold, 0) * rate * 5); //
                    this.getGoldLabel.string = Tools.getGoldStr(this.getGoldcount);
                } else {
                    this.world.uiMgr.showTips(6);
                }
            }
        }
    },


    onLevelUpByAdverBtnClick: function () {
        var self = this;
        // 关闭广告时回调
        var closeFunc = function (success) {
            if (success) {
                self.onGrowUp(self.curType);
                self.refreshShowData(self.curType);
                PlayerData.instance.saveUserData('看广告升级属性');
            }
        }
        // 打开广告失败时回调,失败回调
        var errFunc = function () {
            self.showShare(closeFunc);
        }
        AdvertMgr.instance.showAdver(AdverType.GrowNode, closeFunc, errFunc);
    },

    showShare: function (closeFunc) {
        ShareMgr.share(ShareType.GrowNode, closeFunc)
    },

    closeGoldNode: function () {
        this.getGoldNode.active = false;
    },

    onGetGoldBtnClick: function () {
        var self = this;
        // 关闭广告时回调
        var closeFunc = function (success) {
            if (success) {
                PlayerData.instance.dayGetGoldCount++;
                PlayerData.instance.updateGold(self.getGoldcount);
                PlayerData.instance.showGold -= self.getGoldcount;
                var param = {
                    count: self.getGoldcount,
                    isMore: true,
                    isLucky: false,
                }
                self.world.uiMgr.showGetMoneyEffect(param);
                self.closeGoldNode();
                self.refreshShowData(self.curType, false);
            }
        }

        // 打开广告失败时回调,失败回调
        var errFunc = function () {
            ShareMgr.share(ShareType.NotEnoughMoney, closeFunc);
            // self.world.uiMgr.showTips('暂未获取到广告信息')
        }
        AdvertMgr.instance.showAdver(AdverType.NotEnoughMoney, closeFunc, errFunc);
    },

    onGrowUp: function (type) {
        PlayerData.instance.updateGrowLevel(type);
        var levelData = PlayerData.instance.getGrowLevelDataByType(type);
        if (!levelData) return;
        switch (type) {
            case GrowType.Attack:
                this.world.localPlayer.changeAttackPower(levelData.realParam);
                break;
            case GrowType.Defence:
                this.world.localPlayer.changeDefencePower(levelData.realParam);
                break;
            case GrowType.Speed:
                this.world.localPlayer.changeGrowSpeedAddition(levelData.realParam);
                break;
            case GrowType.Gold:
                this.world.uiMgr.refreshOfflineGoldData();
                break;
        }
    },
});