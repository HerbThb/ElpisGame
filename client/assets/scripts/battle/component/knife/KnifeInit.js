/**
 * @fileoverview 玩家自带的刀初始化
 * @author meifan@gameley.cn (梅凡)
 */
const GameData = require('GameData');
const KnifeMomentState = require('Types').KnifeMomentState;
const KnifeInit = cc.Class({
    extends: cc.Component,

    properties: {

    },

    init: function (entityPlayer) {
        this.entityPlayer = entityPlayer;
        this.node.emit('changeTag', this.entityPlayer.teamID);
        this.node.emit('updateMomentState', KnifeMomentState.Init);

        // 判定tag是否等于是本地玩家
        if (this.entityPlayer.teamID === GameData.instance.localHeroTid) {
            // this.node.emit('changeKnifeAttackGroup', 'knife');
        } else {
            // this.node.emit('changeKnifeAttackGroup', 'otherKnife');
        }

        // this.bInit = false;
        this.entityPlayer.addKnife(this.node);


    },

    // lateUpdate: function (dt) {
    //     if(!this.bInit) {
    //         this.bInit = true;


    //     }


    // }

});