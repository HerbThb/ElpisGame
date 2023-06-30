/**
 * @fileoverview 玩家防御ai的龟缩或逃跑倒计时
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionLastTime = require('ConditionLastTime');
// const Tools = require('Tools');

// result从PlayerDistanceSystem确定，就是entityPlayer
const ConditionLastTimeHeroDefence = cc.Class({
    extends: ConditionLastTime,
});