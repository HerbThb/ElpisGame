/**
 * @fileoverview PanelRank
 * @author meifan@gameley.cn (梅凡)
 */
const UIUtil = require('UIUtil');
const GameData = require('GameData');

const PanelTop = cc.Class({
    extends: cc.Component,

    properties: {
        rankGrid: cc.Node,
        playerRankItemPrebfab: cc.Prefab,
        // playerRankItems: [],
        rankNameGrid: cc.Node,
        timeLabel: cc.Label,
        _time: -1,
        killNode: cc.Node,
        killNameNode: cc.Node,
        killMyName: cc.Label,
        killOtherName: cc.Label,
        killNoticeNode: cc.Node,
        killMyName: cc.Label,

        killIconNode: cc.Node,
        killMyIcon: cc.Sprite,
        killOtherIcon: cc.Sprite,
        // frenzyBar: cc.Sprite,
        // _localPlayer: null,
        reviveNoticeNode: cc.Node,
    },

    onLoad: function () {
        const killMsg = this.killNode.getComponent('KillMsg');
        killMsg.init(this.killNameNode, this.killMyName, this.killOtherName,
            this.killIconNode, this.killMyIcon, this.killOtherIcon);
    },

    startLoadPrefab: function() {
        if(!this.killNoticeNode) {
            UIUtil.loadUIPrefab('prefab/ui/gsgame/PanelKillNotice', (resource)=>{
                if(resource) {
                    this.killNoticeNode = resource;
                    this.killNoticeNode.parent = this.node.parent;
                    this.killNoticeNode.y = GameData.instance.isPad() ? 280 : 239;
                    GameData.instance.logUseTime('killNoticeNode prefab loaded');
                }
            });
        }
    },

    cleanUp: function () {
        this.rankGrid.destroyAllChildren();
        this.rankNameGrid.destroyAllChildren();
        if(this.killNoticeNode) {
            this.killNoticeNode.active = true;
            this.killNoticeNode.getComponent('KillNotice').cleanUp();
        }
        this.killNode.getComponent('KillMsg').cleanUp();
    },

    /**
     * 创建玩家rankItem
     */
    addPlayerRankItem: function (entityPlayer) {
        const rank = cc.instantiate(this.playerRankItemPrebfab);
        const rankItem = rank.getComponent('PlayerRankItem');
        rank.parent = this.rankGrid;
        rankItem.init(entityPlayer);
        // this.playerRankItems.push(rankItem);

        rankItem.playerName.node.parent = this.rankNameGrid;
    },

    startCountDown: function (time) {
        this._time = time;
    },

    update: function (dt) {
        if (this._time > 0) {
            this._time -= dt;

            var time = this._time;
            var second = Math.floor(time % 60);

            var str = '0' + Math.floor(time / 60) + ':' + (second > 9 ? second : ('0' + second));
            if (time < 0) {
                str = '00:00'
            }
            if (this.timeLabel.string !== str) this.timeLabel.string = str;
        }

        // if( this.frenzyComp && this.frenzyBar) {
        //     this.frenzyBar.fillRange = this.frenzyComp.getFrenzyRate();
        // }
    },

    showKillMsg: function (hero, otherHero) {
        this.closeReviveNotice();
        this.killNode.getComponent('KillMsg').showKillMsg(hero, otherHero);
    },

    showKillNotice: function (killNum) {
        if(this.killNoticeNode) {
            this.killNoticeNode.getComponent('KillNotice').showKillNotice(killNum);
        }
    },

    // setFrenzyComp: function (player) {
    //     this.frenzyComp = player.node.getComponent('PlayerFrenzyComponent');
    // }

    showReviveNotice: function (hero) {
        if(!this.killNode.getComponent('KillMsg').isOpen) {
            this.reviveNoticeNode.getComponent('PanelReviveNotice').showReviveNotice(hero);
        }
    },
    
    closeReviveNotice: function () {
        var reviveNotice = this.reviveNoticeNode.getComponent('PanelReviveNotice');
        if (reviveNotice.isOpen) {
            reviveNotice.close();
        }
    },

    anyPanelOpen: function () {
        return this.killNode.getComponent('KillMsg').isOpen || this.reviveNoticeNode.getComponent('PanelReviveNotice').isOpen;
    }

});