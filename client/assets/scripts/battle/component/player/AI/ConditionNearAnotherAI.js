/**
 * @fileoverview 离其他ai太近条件
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

// result从PlayerDistanceSystem确定，是另外多个ai的Entity的数组
const ConditionNearAnotherAI = cc.Class({
   extends: ConditionBaseComponent,

   properties: {
   },

   init: function () {
        this.result = [];
   },

   /** overwrite */
   clearResult: function () {
        this.result = [];
   },

   /** overwrite */
   doResultWithParam: function (otherHero) {
        if(!this.result) {
            this.result = [];
        }
        this.result.push(otherHero);
    },

   /** overwrite */
   isTrue: function () {
       return this.result && this.result.length > 0;
   },


   // updateGameLogic: function (dt) {}

   // update: {}
});