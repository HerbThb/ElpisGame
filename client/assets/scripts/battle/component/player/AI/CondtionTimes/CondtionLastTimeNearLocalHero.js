/**
 * @fileoverview 玩家在附近龟缩，ai进入逃跑或龟缩的思考时间
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');
const Tools = require('Tools');

// result从PlayerDistanceSystem确定，就是entityPlayer
const CondtionLastTimeNearLocalHero = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        canBeDo: true,
    },

    init: function () {
        this.result = -1;
        this.canBeDo = true;
    },

    /** overwrite */
    doResultWithParam: function (time) {
        if(this.canBeDo) {

            const rate = Tools.getRandomFloat(0.8, 1.2);
            this.result = time * rate;
            this.canBeDo = false;
        }
    },
    /** overwrite */
    isTrue: function () {
        return this.result < 0;
    },

    /** overwrite */
    clearResult: function() {
        this.canBeDo = true;
        this.result = -1;
    },
    // updateGameLogic: function (dt) {}

    update: function(dt) {
        this.result -= dt;
    }
});