/**
 * @fileoverview 有离很近的刀
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');

// result从PlayerDistanceSystem确定，就是entityKnife
const ConditionNearKnife = cc.Class({
    extends: ConditionBaseComponent,

    properties: {},

    init: function () {},

    /** overwrite */
    doResultWithParam: function (entityKnife) {
        this.result = entityKnife;
    },


    // updateGameLogic: function (dt) {}

    // update: {}
});