/**
 * @fileoverview 行为基类
 * @author meifan@gameley.cn (梅凡)
 */

const ActionState = require('Types').ActionState;

const ActionBaseComponent = cc.Class({
    extends: cc.Component,

    properties: {
        actionState: ActionState.Begin,
    },
    
    // CheckIfTrue: function () { },

    updateGameLogic: function (dt) {
        return this.actionState;
    },

    startAction: function () {
        this.actionState = ActionState.Ing;
    },

    isActionIng: function () {
        return this.actionState === ActionState.Ing;
    },
    
    endAction: function () {
        this.actionState = ActionState.End;
    },

    isActionEnd: function () {
        return this.actionState === ActionState.End;
    },

    // update: {}
 });