const KnifeState = require('Types').KnifeState;
const GameData = require('GameData');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    init: function (buff) {
        this.buff = buff;
        this.node.on('onPickUpBuff', this.onPickUpBuff, this);
    },

    // otherCollider可能是刀的碰撞组件也可能是人的，node节点不是主体,传事件得传递
    onPickUpBuff: function (otherCollider) {
        this.node.emit('onByPick');
        // this.node.active = false;
        otherCollider.node.emit('emitEvent', ['addBuff', this.buff.buffState])
    },

    // update (dt) {},
});