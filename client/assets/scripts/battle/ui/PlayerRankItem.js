/**
 * @fileoverview 玩家名次Item
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const TEAM_COLOR = require('Types').TEAM_COLOR;
const UIUtil = require('UIUtil');
const PlayerRankItem = cc.Class({
    extends: cc.Component,

    properties: {
        rankSpr: cc.Sprite,
        playerName: cc.Label,
        playerScore: cc.Label,
        flagIcon: cc.Sprite,
        _rank: 0,
        _needUpdate: false,
        _speed: 2,
        _knifeNum: 0,
        hashTag: cc.Node,
        rankLabel: cc.Label,
        effectNode: cc.Node,
        activeNode: cc.Node,
        _isDead: false,
        _time: 0.1,
    },

    init: function (entityPlayer) {

        this.playerName.langFlag = true;

        const tid = entityPlayer.teamID;
        this.rankSpr.node.color = TEAM_COLOR[tid];
        this.hashTag.color = TEAM_COLOR[tid];
        this.rankLabel.node.color = TEAM_COLOR[tid];
        this.playerName.string = entityPlayer.name;
        this.playerName.node.color = entityPlayer.isLocal ? TEAM_COLOR[tid] : TEAM_COLOR[0];
        UIUtil.loadResFlag(this.flagIcon, entityPlayer.country);

        this._player = entityPlayer;
        this.playerScore.string = 0;

        this._needUpdate = false;
        this._height = this.node.height;
        this._speed = 0.3;

        this._isDead = false;
        this._time = 0.1;

        this.setNewRank(tid);
    },

    setNewRank: function (newRank) {
        if (newRank !== this._rank) {
            this._lastY = -this._height * this._rank;
            this._newY = -this._height * newRank;
            this._curY = this.node.y;
            this._rank = newRank;
            this._needUpdate = true;

            this.rankLabel.string = this._rank;
        }
    },

    update: function (dt) {
        if (this._isDead) {
            if (this._time <= 0) {
                this._time = 0;
                this.activeNode.active = false;
                this.playerName.node.active = false;
            } else {
                this._time -= dt;
            }
            return;
        }

        if (this._isDead !== this._player.isDead) {
            this._isDead = this._player.isDead;
            this.effectNode.active = true;
            return;
        }

        if (this._player.nameDirty) {
            this.playerName.string = this._player.name;
            this._player.nameDirty = false;
        }

        if (this._rank !== this._player.rank) {
            this.setNewRank(this._player.rank);
        }

        if (this._knifeNum !== this._player.getKnifeNum()) {
            this._knifeNum = this._player.getKnifeNum();
            this.playerScore.string = this._knifeNum;
        }

        if (this._needUpdate) {
            this._curY = cc.misc.lerp(this._curY, this._newY, this._speed);
            // cc.log(' this._curY: ' +  this._curY + ' newY: ' +  this._newY);
            if (Tools.isFloatEqual(this._curY, this._newY)) {
                this._needUpdate = false;
                this.node.y = this._newY;
                this.playerName.node.y = this._newY;
            } else {
                this.node.y = this._curY;
                this.playerName.node.y = this._curY;
            }
        }
    }

});