/**
 * @fileoverview GSGame
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const UIUtil = require('UIUtil');
const GameData = require('GameData');
const PlayerData = require('PlayerData');
const GSGame = cc.Class({
    extends: cc.Component,

    properties: {
        panelTop: cc.Node,
        gameOverPanel: cc.Node,
        NFTGameOverPanel : cc.Node,
        panelNotice: cc.Node,
        panelHeroPosArr: cc.Node,
        panelGuide: cc.Node,
        panelRevive: cc.Node,
        panelTips: cc.Node,
        panelTaskNotice: cc.Node,
        panelVictory: cc.Node,
        panelNFT: cc.Node,
        guideTime: 0,
        countDownNode: cc.Node,
        panelKill: cc.Node,
        panelReviveTips: cc.Node,
        effectKey: cc.Animation,
        panelPopUp: cc.Node,
    },


    init(world) {
        this.world = world;
        if (PlayerData.instance.isGuide) {
            this.panelTop.active = false;
        }

        this.effectKey.node.parent.position = cc.v2(0, 200);
        this.checkPad();

    },

    checkPad() {
        this.panelKill.y = GameData.instance.isPad() ? 380 : 588;
        this.panelReviveTips.y = GameData.instance.isPad() ? 350 : 380;
        this.panelTop.getComponent(cc.Widget).top = GameData.instance.isLongScreen() ? 100 : 0;
    },

    cleanUp: function () {
        this.panelTop.getComponent('PanelTop').cleanUp();
        this.panelHeroPosArr.destroyAllChildren();
        if (this.gameOverPanel) {
            this.gameOverPanel.getComponent('PanelGameOver').cleanUp();
        }

        if (this.panelGuide) {
            this.panelGuide.active = true;
        }
        this.guideTime = 0;
        if (this.panelVictory) {
            this.panelVictory.active = false;
        }
        this.panelKill.active = true;
        if (this.panelNotice) {
            this.panelNotice.active = true;
        }
    },

    startLoadPrefab: function () {
        GameData.instance.logUseTime('start prefab load');

        this.needLoadPanel = 0;
        this.loadedPanel = 0;

        const self = this;
        var callF = function () {
            self.loadedPanel++;

            if (self.needLoadPanel === self.loadedPanel) {

                const index = self.node.children.length;
                self.panelTips.setSiblingIndex(index);
                if (self.panelNotice) {
                    self.panelNotice.setSiblingIndex(1);
                }
                if (self.panelKeyCount) {
                    self.panelKeyCount.parent = self.node;
                }
                if (self.panelTreasureBox) {
                    self.panelTreasureBox.parent = self.node;
                }

            }
        }


        if (!this.panelNotice) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelNotice', (resource) => {
                if (resource) {
                    this.panelNotice = resource;
                    this.panelNotice.parent = this.node;
                    if (PlayerData.instance.isGuide) {
                        this.panelNotice.active = false;
                    }

                    GameData.instance.logUseTime('panelNotice prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        this.panelTop.getComponent('PanelTop').startLoadPrefab();

        if (!this.panelRevive) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelRevive', (resource) => {
                if (resource) {
                    this.panelRevive = resource;
                    this.panelRevive.parent = this.node;
                    GameData.instance.logUseTime('panelRevive prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.gameOverPanel) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelGameOver', (resource) => {
                if (resource) {
                    this.gameOverPanel = resource;
                    this.gameOverPanel.parent = this.node;
                    GameData.instance.logUseTime('gameOverPanel prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.NFTGameOverPanel) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelNFTRankGameOver', (resource) => {
                if (resource) {
                    this.NFTGameOverPanel = resource;
                    this.NFTGameOverPanel.parent = this.node;
                    GameData.instance.logUseTime('NFTGameOverPanel prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.panelGuide) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/panelGuide', (resource) => {
                if (resource) {
                    this.panelGuide = resource;
                    this.panelGuide.parent = this.node;
                    this.panelGuide.y = GameData.instance.isPad() ? -213 : -313;
                    GameData.instance.logUseTime('panelGuide prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.panelFirstGuide && PlayerData.instance.isGuide) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelFirstGuide', (resource) => {
                if (resource) {
                    this.panelFirstGuide = resource;
                    this.panelFirstGuide.parent = this.node;
                    GameData.instance.logUseTime('panelFirstGuide prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.panelVictory) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelVictory', (resource) => {
                if (resource) {
                    this.panelVictory = resource;
                    this.panelVictory.parent = this.node;
                    GameData.instance.logUseTime('panelVictory prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.panelTreasureBox) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelTreasureBox', (resource) => {
                if (resource) {
                    this.panelTreasureBox = resource;
                    // this.panelTreasureBox.parent = this.node;
                    GameData.instance.logUseTime('PanelTreasureBox prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }


        if (!this.panelKeyCount) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/KeyCount', (resource) => {
                if (resource) {
                    this.panelKeyCount = resource;
                    GameData.instance.logUseTime('panelKeyCount prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

        if (!this.panelPopUp) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelPopUp', (resource) => {
                if (resource) {
                    this.panelPopUp = resource;
                    this.panelPopUp.parent = this.node;
                    GameData.instance.logUseTime('PanelPopUp prefab loaded');
                    callF();
                }
            });
            this.needLoadPanel++;
        }

    },

    /**
     * 创建玩家rankItem
     */
    addPlayerRankItem: function (entityPlayer) {
        this.panelTop.getComponent('PanelTop').addPlayerRankItem(entityPlayer);
    },

    openGameOverPanel: function () {
        if (this.gameOverPanel) {
            this.gameOverPanel.active = true;
            this.gameOverPanel.getComponent('PanelGameOver').init(this.world);
            console.log("showBanner openGameOverPanel")
            AdvertMgr.instance.showBanner();
        }
    },

    openPanelNFT: function (callback) {
        if (this.panelNFT) {
            this.panelNFT.active = true;
            this.panelNFT.getComponent('PanelNFT').init(this.world,callback);
            this.panelNFT.getComponent('PanelNFT').setStatus("battle")
            // AdvertMgr.instance.fireBaseEvent("nft_page_show","page_id","settlement");
            console.log("GSGame openPanelNFT")
        }
    },

    showPanelTreasureBox: function () {
        if (this.panelTreasureBox) {
            this.panelTreasureBox.active = true;
            this.panelTreasureBox.getComponent('PanelTreasureBox').init(this.world);
        }
    },

    showPanelPopUp: function (content, callback) {
        if (this.panelPopUp) {
            this.panelPopUp.active = true;
            this.panelPopUp.getComponent('PanelPopUp').init(this.world, content, () => {
                if (callback) {
                    callback()
                }
            });
        }
    },

    closeGameOverPanel: function () {
        if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
        }
    },

    openNFTGameOverPanel: function () {
        if (this.NFTGameOverPanel) {
            this.NFTGameOverPanel.active = true;
            this.NFTGameOverPanel.getComponent('PanelNFTRankGameOver').init(this.world);
        }
    },

    closeNFTGameOverPanel: function () {
        if (this.NFTGameOverPanel) {
            this.NFTGameOverPanel.active = false;
        }
    },

    
    refreshNFTGameOverPanel: function () {
        if (this.NFTGameOverPanel &&  this.NFTGameOverPanel.active) {
            this.NFTGameOverPanel.getComponent('PanelNFTRankGameOver').refresh();
        }
    },

    refreshNFTGameOverPanelShow: function () {
        if (this.NFTGameOverPanel &&  this.NFTGameOverPanel.active) {
            this.NFTGameOverPanel.getComponent('PanelNFTRankGameOver').show();
        }
    },

    update: function (dt) {
        if (!this.panelGuide) return;
        if (!this.panelGuide.active) return;
        this.guideTime += dt;
        if (this.world.localPlayer.isDefence) {
            this.touchTime = this.guideTime;
        }
        if (this.guideTime > this.touchTime + 1) {
            this.panelGuide.active = false;
        }
        if (this.guideTime > 3) {
            this.panelGuide.active = false;
        }
    },

    addHeroPosArr: function (localPlayer, otherPlayer, camera) {
        this.panelHeroPosArr.getComponent('PanelHeroPosArr').addHeroPosArr(localPlayer, otherPlayer, camera);
    },

    addSpecialNotice: function (type) {
        if (!this.panelTop.getComponent('PanelTop').anyPanelOpen()) {
            if (this.panelNotice) {
                this.panelNotice.getComponent('PanelNotice').addSpecialNotice(type);
            }
        }
    },

    showImportantNotice: function (type) {
        if (!this.panelTop.getComponent('PanelTop').anyPanelOpen()) {
            if (this.panelNotice) {
                this.panelNotice.getComponent('PanelNotice').showImportantNotice(type);
            }
        }
    },

    closePanelNotice: function () {
        if (this.panelNotice) {
            var notice = this.panelNotice.getComponent('PanelNotice');
            if (notice.isOpen) {
                notice.close();
            }
        }
    },



    startCountDown: function (time) {
        this.panelTop.getComponent('PanelTop').startCountDown(time);
    },

    showKillMsg: function (hero, otherHero) {
        this.closePanelNotice();
        this.panelTop.getComponent('PanelTop').showKillMsg(hero, otherHero);
    },

    showKillNotice: function (killNum) {
        this.panelTop.getComponent('PanelTop').showKillNotice(killNum);
    },

    showReviveNotice: function (hero) {
        this.closePanelNotice();
        this.panelTop.getComponent('PanelTop').showReviveNotice(hero);
    },

    // setFrenzyComp : function (player) {
    //     this.panelTop.getComponent('PanelTop').setFrenzyComp(player);
    // },

    openRevivePanel: function (callback, reviveCount) {
        if (this.panelRevive) {
            this.panelRevive.active = true;
            this.panelRevive.getComponent('PanelRevive').init(callback, reviveCount, this);
            this.panelRevive.children[0].scale = 0;
            var action = cc.scaleTo(0.2, 1)
            this.panelRevive.children[0].runAction(action);
        }
    },

    showTips: function (tips) {
        this.panelTips.getComponent('PanelTips').init(tips);
    },

    showTaskNotice: function (data, callback) {
        var action = cc.moveBy(0.3, cc.v2(-200, 0)).easing(cc.easeBackOut());
        var delay = cc.delayTime(2);
        var action2 = cc.moveBy(0.3, cc.v2(200, 0)).easing(cc.easeBackIn());;
        var callF = cc.callFunc(() => {
            callback();
        })
        this.panelTaskNotice.active = true;
        this.panelTaskNotice.runAction(cc.sequence(action, delay, action2, callF));
        this.panelTaskNotice.getComponent('PanelTaskNotice').init(data, callback);
    },

    showCountDownNode: function () {
        if (this.panelNotice) {
            this.panelNotice.active = false;
        }
        this.countDownNode.active = true;
    },

    onBigBuff: function () {
        this.world.localPlayer.node.emit('updateBuffState', 0);
    },

    onFastBuff: function () {
        this.world.localPlayer.node.emit('updateBuffState', 1);
    },

    onHardBuff: function () {
        this.world.localPlayer.node.emit('updateBuffState', 2);
    },

    onMagnetBuff: function () {
        this.world.localPlayer.node.emit('updateBuffState', 3);
    },

    onFrenzyBuff: function () {
        this.world.localPlayer.node.emit('onFrenzyAdd', 3);
    },

    showGuideStart: function (state) {
        if (this.panelFirstGuide) {
            this.panelFirstGuide.getComponent('PanelFirstGuide').showGuideStart(state);
        }
    },


    showGuideEnd: function (state) {
        if (this.panelFirstGuide) {
            this.panelFirstGuide.getComponent('PanelFirstGuide').showGuideEnd(state);
        }
    },

    showGuideSpecial: function (state) {
        if (this.panelFirstGuide) {
            this.panelFirstGuide.getComponent('PanelFirstGuide').showGuideSpecial(state);
        }
    },

    refreshGuideProcess: function (str) {
        if (this.panelFirstGuide) {
            this.panelFirstGuide.getComponent('PanelFirstGuide').refreshGuideProcess(str);
        }
    },

    showPanelVictory: function () {
        if (this.panelVictory) {
            this.panelVictory.active = true;
            this.panelVictory.getChildByName('victory').getChildByName('victory').getComponent(cc.Animation).play('ani-victory', 0);
        }
        this.panelKill.active = false;
        if (this.panelNotice) {
            this.panelNotice.active = false;
        }
        this.panelTop.getComponent('PanelTop').killNoticeNode.active = false;
        // setTimeout(() => {
        //     if(this.panelVictory) {
        //         this.panelVictory.active = false;
        //     }
        // }, 1500)
    },

    showPanelKeyCount(node) {
        if (this.panelKeyCount) {
            this.panelKeyCount.getComponent('KeyCount').show(this.effectKey.node.parent);
            this.effectKey.play();
        }
    },

    openPanelKeyCount(active) {
        if (this.panelKeyCount) {
            if(PlayerData.instance.isInNFTRankGameMode()){
                console.log("nftrank skip openPanelKeyCount")
            }
            else{
                this.panelKeyCount.getComponent('KeyCount').open(active);
            }
        }
    },
});