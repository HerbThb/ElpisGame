/**
 * @fileoverview KillMsg
 * @author meifan@gameley.cn (梅凡)
 */

const TEAM_COLOR = require('Types').TEAM_COLOR;
const UIUtil = require('UIUtil');
const PlayerData = require('PlayerData');

const KillMsg = cc.Class({
    extends: cc.Component,

    properties: {
        _time: -1,
        killNode: cc.Node,
        _killNameNode: cc.Node,
        killMyBall: cc.Node,
        killOtherBall: cc.Node,
        _killMyName: cc.Label,
        _killOtherName: cc.Label,
        effectAnim: cc.Animation,
        isOpen: false,
    },

    init: function (killNameNode, killMyName, killOtherName, killIconNode, killMyIcon, killOtherIcon) {
        this._killNameNode = killNameNode;
        this._killMyName = killMyName;
        this._killOtherName = killOtherName;

        this._killIconNode = killIconNode;
        this._killMyIcon = killMyIcon;
        this._killOtherIcon = killOtherIcon;
        this.isOpen = false;

        this._killMyName.langFlag = true;
        this._killOtherName.langFlag = true;
    },

    cleanUp: function () {
        this.close();
    },

    update: function (dt) {
        if (this._time > 0) {
            this._time -= dt;
            if (this._time < 0) {
                this.close();
            }
        }
    },

    showKillMsg: function (hero, otherHero) {
        this.isOpen = true;
        this.effectAnim.node.active = true;
        this.effectAnim.play();
        // this.effectAnim.on('stop', () => {
        //     this.effectAnim.off('stop');
        //     this.effectAnim.node.active = false;
        // })
        this.killNode.active = true;
        this._killNameNode.active = true;
        this._killIconNode.active = true;
        this._time = 2.0;

        const myTid = hero.teamID;
        const otherTid = otherHero.teamID;

        this.killMyBall.color = TEAM_COLOR[myTid];
        this.killOtherBall.color = TEAM_COLOR[otherTid];

        this._killMyName.string = hero.name;
        this._killMyIcon.spriteFrame = null;
        this._killMyIcon.iconUrl = hero.isLocal ? PlayerData.instance.iconUrl : hero.iconUrl;
        UIUtil.loadResPortrait(this._killMyIcon, hero);
        // this._killMyName.node.color = hero.isLocal ? TEAM_COLOR[myTid] : TEAM_COLOR[0];
        this._killOtherName.string = otherHero.name;
        this._killOtherIcon.spriteFrame = null;
        this._killOtherIcon.iconUrl = otherHero.isLocal ? PlayerData.instance.iconUrl : otherHero.iconUrl;
        UIUtil.loadResPortrait(this._killOtherIcon, otherHero);
        // this._killOtherName.node.color = otherHero.isLocal ? TEAM_COLOR[otherTid] : TEAM_COLOR[0];
    },

    close: function () {
        this.killNode.active = false;
        this._killNameNode.active = false;
        this._killIconNode.active = false;
        this.isOpen = false;
    }

});