/**
 * @fileoverview HeroReviveSystem
 * @author meifan@gameley.cn (梅凡)
 */

const HeroRebornEffectState = require('Types').HeroRebornEffectState;

const HeroReviveSystem = cc.Class({
    extends: cc.Component,

    properties: {
        players: [],
    },

    cleanUp: function () {
        this.players = [];
    },

    init: function (entityPlayers, reviveFunc, showRebornFunc) {
        for (var player of entityPlayers) {
            this.players.push(player);
        }
        this._reviveFunc = reviveFunc;
        this._showRebornFunc = showRebornFunc;
    },

    updateGameLogic: function (dt) {

        for (var player of this.players) {
            if (player.isLocal) {
                // 排除玩家自己
                continue;
            }
            if (player.firstDead) {
                if (!player.canRevive()) {
                    this.onRevive(player, false);
                } else {
                    player.updateReviveLogic(dt);

                    if(player.waitToRevive) {
                        this.onRevive(player, true);   
                    }
                    
                    if (player.showRebornEffect === HeroRebornEffectState.waitToShow) {
                        player.showRebornEffect = HeroRebornEffectState.Open;
                        this.onShowReborn(player);
                    }
                }
            }
        }
    },

    onRevive: function (player, isRevive) {
        if (this._reviveFunc) {
            this._reviveFunc(player, isRevive);
            // this._reviveFunc = null;
            // this.isRevive = true;
        }
    },

    onShowReborn: function (player) {
        if (this._showRebornFunc) {
            this._showRebornFunc(player);
        }
    }
});