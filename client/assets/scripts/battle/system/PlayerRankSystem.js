/**
 * @fileoverview PlayerRankSystem
 * @author meifan@gameley.cn (梅凡)
 */


const PlayerRankSystem = cc.Class({
   extends: cc.Component,

    properties: {
        players: []
    },

    cleanUp: function () {
        this.players = [];
    },

    init: function (entityPlayers, localPlayer) {
        for(var player of entityPlayers) {
            this.players.push(player);
        }
        this.localPlayer = localPlayer;
    },

    updateGameLogic(dt) {
        this.players.sort(function (a, b) {
            return b.getKnifeNum() - a.getKnifeNum();
        });
        
        var index = this.players.indexOf(this.localPlayer);
        while(index > 0) {
            if(this.players[index - 1].getKnifeNum() === this.localPlayer.getKnifeNum()) {
                this.players[index] = this.players[index - 1];
                this.players[index - 1] = this.localPlayer;
                index --;
            } else {
                break;
            }
        }

        this.players.sort(function (a, b) {
            const aValue = a.beKilled() ? -1: 0;
            const bValue = b.beKilled() ? -1: 0;
            return bValue - aValue;

            // return !b.beKilled() && a.beKilled() ? 1 : 0;
        });

        index = 1;
        for(var player of this.players) {
            // if(player.beKilled()) {
            //     player.setFinalRank(index);
            //     continue;
            // }
            player.rank = index;
            index ++;
        }
    }
});