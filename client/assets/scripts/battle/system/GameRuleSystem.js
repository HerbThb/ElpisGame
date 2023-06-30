/**
 * @fileoverview GameRuleSystem
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');

const GameRuleSystem = cc.Class({
    extends: cc.Component,

    properties: {
        _countDownTime: 99,
        players: [],
    },

    cleanUp: function () {
        this.players = [];
    },

    init: function (gameOverFunc, localPlayer, entityPlayers, gameTime, reviveFunc) {
        this._gameOverFunc = gameOverFunc;
        this._localPlayer = localPlayer;
        for (var player of entityPlayers) {
            this.players.push(player);
        }
        this._countDownTime = gameTime;
        this._allDead = false;
        this._reviveFunc = reviveFunc;
        this.isRevive = false;
        this.isGameOver = false;
    },

    updateGameLogic: function (dt) {
        if (this.isGameOver) return;
        this._countDownTime -= dt;
        if (this._countDownTime <= 0) {
            // 游戏结束
            this.onGameOver();
            return;
        }

        if (this._localPlayer.firstDead && !this.isRevive) {
            this.onRevive();
            return;
        }

        if (this._localPlayer.isDead) {
            // 游戏结束
            this.onGameOver();
            return;
        }

        this._allDead = true;
        for (var player of this.players) {
            if (player.isLocal) {
                // 排除玩家自己
                continue;
            }
            if (!player.isDead) {
                this._allDead = false;
                break;
            }
        }
        if (this._allDead) {
            // 游戏结束
            this.onGameOver();
            return;
        }
    },

    onGameOver: function () {
        if (this._gameOverFunc) {
            this._gameOverFunc();
            this._gameOverFunc = null;
            this.isGameOver = true;
        }
    },

    onRevive: function () {
        if (this._reviveFunc) {
            this._reviveFunc();
            // this._reviveFunc = null;
            this.isRevive = true;
        }
    },

    onContinue: function () {
        this.isRevive = false;
    }
});