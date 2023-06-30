/**
 * @fileoverview KillMsgListener
 * @author meifan@gameley.cn (梅凡)
 */


const AudioEngine = require('AudioEngine');
const SoundID = require('Types').SoundID;
const killSounds = [SoundID.doublekill, SoundID.tribblekill, SoundID.quadrkill, SoundID.pandakill, SoundID.godlike];
const PlayerData = require('PlayerData');
const PlatformMgr = require('PlatformMgr');
const CustomFunnelEvent = require('Types').CustomFunnelEvent;

const KillMsgListener = cc.Class({
    extends: cc.Component,

    properties: {
        players: [],
        isfirstBlood: false,
        isGuide: false
    },

    cleanUp: function () {
        this.players = [];
    },

    init: function (entityPlayers, uiMgr) {
        for (var player of entityPlayers) {
            this.players.push(player);
        }
        this.uiMgr = uiMgr;

        this.isGuide = PlayerData.instance.isGuide;

        this.node.on('killMessageShow', this.killMessageShow, this)
    },

    killMessageShow(event) {
        const knife = event[0];
        const deadHero = event[1];

        const myTid = knife.tag;
        const otherTid = deadHero.tag;

        var myHero = null;
        var otherHero = null;

        for (var hero of this.players) {
            if (hero.teamID === myTid) {
                myHero = hero;
                continue;
            }
            if (hero.teamID === otherTid) {
                otherHero = hero;
            }
        }

        if (otherHero && otherHero.beKilled()) {
            // 玩家被杀有可能会无敌导致没有真的死亡 就不需要走音效、弹窗等

            if (!this.isfirstBlood) {
                this.isfirstBlood = true;
                AudioEngine.instance.playSound(SoundID.firstblood);
            }

            this.uiMgr.showKillMsg(myHero, otherHero);
            if (myHero.isLocal) {
                if(!this.isGuide) {
                    this.uiMgr.showKillNotice(myHero.killNum);
                }

                if (myHero.killNum > 5) {
                    AudioEngine.instance.playSound(killSounds[killSounds.length - 1]);
                } else if (myHero.killNum >= 2) {
                    AudioEngine.instance.playSound(killSounds[myHero.killNum - 2]);
                }

                if(PlayerData.instance.isFristGame()) {
                    if (myHero.killNum === 1) {
                        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Kill_One);
                    } else if (myHero.killNum === 2) {
                        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Kill_Two);
                    } else if (myHero.killNum === 3) {
                        PlatformMgr.notifyFunnelEvent(CustomFunnelEvent.Kill_Three);
                    }
                }
            }
        }
    }
});