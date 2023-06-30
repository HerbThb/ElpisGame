/**
 * @fileoverview UIMgr
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const PlayerData = require('PlayerData');
const GSHome = require('GSHome');
const UIMgr = cc.Class({
    extends: cc.Component,

    properties: {
        GSGameNode: cc.Node,
        GSHomeNode: cc.Node,
        adverBlock: cc.Node,
        _GSGame: null,
    },

    init: function (world) {

        this.adverBlock.active = false;

        this._GSGame = this.GSGameNode.getComponent('GSGame');
        this._GSHome = this.GSHomeNode.getComponent('GSHome');

        this._GSGame.init(world);
        this._GSHome.init(world);

        this.GSGameNode.active = false;
        this.GSHomeNode.active = true;

        if (GSHome.gameClubButton) {
            GSHome.gameClubButton.show();
        }

        for (let btn of this._GSHome.userinfoBtns) {
            if (btn) btn.show();
        }
        // if (Tools.getItem('fromMyApp')) {
        //     this._GSHome.hideMyAppNode()
        // }
    },

    cleanUp: function () {
        this._GSGame.cleanUp();
    },

    addPlayerRankItem: function (entityPlayer) {
        this._GSGame.addPlayerRankItem(entityPlayer);
    },

     openPanelNFT: function (callback) {
        this._GSGame.openPanelNFT(callback);
    },

    openGameOverPanel: function (rank) {
        this._GSGame.openGameOverPanel(rank);
    },

    closeGameOverPanel: function () {
        this._GSGame.closeGameOverPanel();
    },

    openNFTGameOverPanel: function (score) {
        this._GSGame.openNFTGameOverPanel(score);
    },

    refreshNFTGameOverPanel:function(){
        this._GSGame.refreshNFTGameOverPanel()
    },

    refreshNFTGameOverPanelShow:function(){
        this._GSGame.refreshNFTGameOverPanelShow()
    },
    
    closeNFTGameOverPanel: function () {
        this._GSGame.closeNFTGameOverPanel();
    },

    addHeroPosArr: function (localPlayer, otherPlayer, camera) {
        this._GSGame.addHeroPosArr(localPlayer, otherPlayer, camera);
    },

    startGame: function () {
        this.GSGameNode.active = true;
        this.GSHomeNode.active = false;
        this.activeGoldNode(false);
        this.activeDiamondNode(false);
        this.activePhysicalNode(false)
    },

    hideUserInfoBtn: function () {
        for (let btn of this._GSHome.userinfoBtns) {
            if (btn) btn.hide();
        }
    },

    addSpecialNotice: function (type) {
        this._GSGame.addSpecialNotice(type);
    },
    showImportantNotice: function (type) {
        this._GSGame.showImportantNotice(type);
    },

    startCountDown: function (time) {
        this._GSGame.startCountDown(time);
    },

    showKillMsg: function (hero, otherHero) {
        this._GSGame.showKillMsg(hero, otherHero);
    },

    showKillNotice: function (killNum) {
        this._GSGame.showKillNotice(killNum);
    },

    showReviveNotice: function (hero) {
        this._GSGame.showReviveNotice(hero);
    },

    showTips: function (tips) {
        this._GSHome.showTips(tips);
    },

    showTipsGame: function (tips) {
        this._GSGame.showTips(tips);
    },

    showReward: function (data, callback, errCallback) {
        this._GSHome.showReward(data, callback, errCallback);
    },

    showPanelLevelUp: function (callback) {
        this._GSHome.showPanelLevelUp(callback);
    },

    openRevivePanel: function (callback, reviveCount) {
        this._GSGame.openRevivePanel(callback, reviveCount);
    },

    refreshRedDot: function () {
        this._GSHome.refreshRedDot();
    },

    showGetMoneyEffect: function (getGoldParam, offset, activeGoldNode) {
        this._GSHome.showGetMoneyEffect(getGoldParam, offset, activeGoldNode);
    },

    showPanelTryOut: function (data, callback, closeCallback) {
        this._GSHome.showPanelTryOut(data, callback, closeCallback);
    },

    showPanelTryFrenzy: function (callback) {
        this._GSHome.showPanelTryFrenzy(callback);
    },

    showPanelTrySuit: function (data, callback, closeCallback) {
        this._GSHome.showPanelTrySuit(data, callback, closeCallback);
    },

    showPanelGetNFT: function () {
        // this._GSHome.showPanelGetNFT(callback, closeCallback);
        this._GSHome.onPanelNFTBtnClick();
    },

    refreshWalletIcon :function(on){
        this._GSHome.refreshWalletIcon(on)
    },

    showTaskNotice: function (data, callback) {
        this._GSGame.showTaskNotice(data, callback);
    },

    showCountDownNode: function () {
        this._GSGame.showCountDownNode();
    },

    showPanelSign: function (callback) {
        this._GSHome.showPanelSign(callback);
    },

    showPanelMatch: function (players, callback) {
        this._GSHome.showPanelMatch(players, callback);
    },

    closePanelMatch: function () {
        this._GSHome.closePanelMatch();
    },

    refreshProperty: function (data, isHeroSkin) {
        this._GSHome.refreshProperty(data, isHeroSkin);
    },
    // setFrenzyComp : function (player) {
    //     this._GSGame.setFrenzyComp(player);
    // },
    startLoadPrefab: function () {
        this._GSHome.startLoadPrefab();
        this._GSGame.startLoadPrefab();
    },

    showWatchAdverCount: function () {
        this._GSHome.showWatchAdverCount();
    },

    showGuideStart: function (state) {
        this._GSGame.showGuideStart(state);
    },
    showGuideEnd: function (state) {
        this._GSGame.showGuideEnd(state);
    },

    showGuideSpecial: function (state) {
        this._GSGame.showGuideSpecial(state);
    },

    refreshGuideProcess: function (str) {
        this._GSGame.refreshGuideProcess(str);
    },

    showPanelVictory: function () {
        this._GSGame.showPanelVictory();
    },

    showOfflineMultip: function (callback) {
        this._GSHome.showOfflineMultip(callback);
    },

    refreshOfflineGoldData: function () {
        this._GSHome.refreshOfflineGoldData();
    },

    showPanelRepay: function (callback) {
        this._GSHome.showPanelRepay(callback);
    },

    showUnlockGrow: function (callback) {
        this._GSHome.showUnlockGrow(callback);
    },

    showPanelAddTop: function (callback) {
        this._GSHome.showPanelAddTop(callback);
    },

    showPanelInvite: function (callback) {
        this._GSHome.showPanelInvite(callback);
    },

    showPanelDailyTask: function (callback) {
        this._GSHome.showPanelDailyTask(callback);
    },

    showPanelNFT: function (callback) {
        this._GSHome.showPanelNFT(callback);
    },

    changeNFTBtnIcon: function () {
        this._GSHome.changeNFTBtnIcon();
    },

    popGetNFT: function () {
        this._GSHome.popGetNFT();
    },

    popNFTRank: function (closeCallback) {
        this._GSHome.popNFTRank(closeCallback);
    },
    
    activeGoldNode: function (active) {
        this._GSHome.activeGoldNode(active);
    },

    activeDiamondNode:function(active){
        this._GSHome.activeDiamondNode(active);
    },

    activePhysicalNode:function(active){
        this._GSHome.activePhysicalNode(active);
    },

    closePanelShop: function (isKnife) {
        this._GSHome.onPanelShopClose(isKnife);
        AdvertMgr.instance.showBanner();
    },

    openAdverBlock: function () {
        this.adverBlock.active = true;
        setTimeout(() => {
            this.closeAdverBlock();
        }, 100);
    },

    closeAdverBlock: function () {
        this.adverBlock.active = false;
        console.log('uimgr:closeAdverBlock');
    },

    showActiveSuitEffect: function () {
        this._GSHome.showActiveSuitEffect();
    },

    showPanelRewardDetail: function () {
        this._GSHome.showPanelRewardDetail();
    },

    showPanelPKReward: function (data, callback) {
        this._GSHome.showPanelPKReward(data, callback);
    },

    showPanelWorldReward: function (data, callback) {
        this._GSHome.showPanelWorldReward(data, callback);
    },

    showPanelHolidayRank: function (isPK, callback) {
        this._GSHome.showPanelHolidayRank(isPK, callback);
    },

    hidePanelHolidayUserinfoBtns: function () {
        this._GSHome.hidePanelHolidayUserinfoBtns();
    },

    showPanelSubscribeReward: function (callback) {
        this._GSHome.showPanelSubscribeReward(callback);
    },

    showPanelSubscribe: function (callback) {
        this._GSHome.showPanelSubscribe(callback);
    },

    showSubscribeBtn: function () {
        this._GSHome.showSubscribeBtn();
    },

    showPanelPopUp: function (content,callback) {
        if(this._GSHome){
            this._GSHome.showPanelPopUp(content,callback);
        }
    },

    showPanelPopUpGame: function (content,callback) {
        if(this._GSGame){
            this._GSGame.showPanelPopUp(content,callback);
        }
    },

    showPanelBuySkin: function (callback) {
        this._GSHome.showPanelBuySkin(callback);
    },

    onPanelShopClose: function (isKnife) {
        this._GSHome.onPanelShopClose(isKnife);
    },
    showPanelTreasureBox: function () {
        this._GSGame.showPanelTreasureBox();
    },

    showPanelKeyCount: function (node) {
        this._GSGame.showPanelKeyCount(node);
    },

    showPanelEvaulate: function (callback) {
        this._GSHome.showPanelEvaulate(callback);
    },

    openPanelKeyCount: function (active) {
        this._GSGame.openPanelKeyCount(active);
    },

    onBtnNftRankBtnClick: function () {
        this._GSHome.onBtnNftRankBtnClick();
    },
    //点击社区按钮
    onClickDiscordBtn: function () {
        this._GSHome.onClickDiscordBtn()
    },

    //点击问卷按钮
    onClickFormBtn: function () {
        this._GSHome.onClickFormBtn()
    },

});