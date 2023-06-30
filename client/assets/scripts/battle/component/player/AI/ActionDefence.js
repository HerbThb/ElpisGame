/**
 * @fileoverview 移动行为
 * @author meifan@gameley.cn (梅凡)
 */

const ActionBaseComponent = require('ActionBaseComponent');

const ActionDefence = cc.Class({
    extends: ActionBaseComponent,

    properties: {
        _defenceTime: 2,
        _defenceCount: 2,
    },
    
    // CheckIfTrue: function () { },

    // onLoad: function () {
        // this.node.on('setNextPos', this.setNextPos, this);
    // },

    init : function (defenceTime) {
        this._defenceTime = defenceTime;
    },

    reset: function () {
        this._defenceCount = this._defenceTime;
    },

    updateGameLogic: function (dt) {
        if(this.isActionIng()) {
            this._defenceCount -= dt;
            if(this._defenceCount <= 0) {
                this.endAction();
            }
        }

        return this.actionState;
    },

    // update: {}
 });