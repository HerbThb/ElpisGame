/**
 * @fileoverview PlayerDistanceSystem 每帧根据各个玩家的位置判断是否离得太近
 * @author meifan@gameley.cn (梅凡)
 */


const PlayerDistanceSystem = cc.Class({
   extends: cc.Component,

    properties: {
        players: [],
        blocks: [],
        knives: [],
    },

    cleanUp: function () {
        this.players = [];
        this.blocks = [];
        this.knives = [];
    },

    init: function (entityPlayers, localPlayer, entityBlocks, entityKnives) {
        for(var player of entityPlayers) {
            this.players.push(player);
        }
        for(var block of entityBlocks) {
            this.blocks.push(block);
        }
        for(var knife of entityKnives) {
            this.knives.push(knife);
        }
        this.localPlayer = localPlayer;
    },

    updateGameLogic(dt) {
        // 检测与其他玩家的碰撞
        var player = null;
        for(player of this.players) {
            if(player.isDead) {
                continue;
            }
            if(player.isLocal) {
                continue;
            }
            if(!player.aiMgr) {
                continue;
            }

            for(var other of this.players) {
                if(other === player) {
                    continue;
                }
                if(other.isDead) {
                    continue;
                }
                if(other.firstDead) {
                    continue;
                }
                if(other.isLocal) {
                    if(player.attackRect.intersects(other.defenceRect.getRect())) {
                        player.aiMgr.addNearOther(other);
                    } else {
                        player.aiMgr.leaveOther(other);
                    }
                    continue;
                }
                
                if(player.defenceRect.intersects(other.defenceRect.getRect())) {
                    player.aiMgr.addNearOther(other);
                }
            }
        }

        for(player of this.players) {
            if(player.isDead) {
                continue;
            }
            if(player.isLocal) {
                continue;
            }
            if(!player.aiMgr) {
                continue;
            }

            for(var block of this.blocks) {

                for(var rect of block.defenceRects) {
                    if(player.defenceRect.intersects(rect.getRect())) {
                        player.aiMgr.addNearBlock(rect.node);
                    }
                }
            }
        }

        for(player of this.players) {
            if(player.isDead) {
                continue;
            }
            if(player.isLocal) {
                continue;
            }
            if(!player.aiMgr) {
                continue;
            }

            for(var knife of this.knives) {
                if(knife.teamID > 0) {
                    continue;
                }

                if(player.attackRect.intersects(knife.defenceRect.getRect())) {
                    player.aiMgr.addNearKnife(knife);
                    continue;
                }
                
            }
        }
    }
});