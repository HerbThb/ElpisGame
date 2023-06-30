const KnifeState = require('Types').KnifeState;
const GameData = require('GameData');
const KnifeMomentState = require('Types').KnifeMomentState;
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.node.on('onPickUpKnife', this.onPickUpKnife, this);
        this.node.on('throwKnife', this.throwKnife, this);
    },

    // otherCollider可能是刀的碰撞组件也可能是人的，node节点不是主体,传事件得传递
    onPickUpKnife: function (otherCollider) {
        this.node.emit('changeTag', otherCollider.tag);
        this.node.emit('updateMomentState', KnifeMomentState.Capture);
        this.node.emit('stopResetPos');
        // 判定tag是否等于是本地玩家
        if (otherCollider.tag === GameData.instance.localHeroTid) {
            // this.node.emit('changeKnifeAttackGroup', 'knife');
        } else {
            // this.node.emit('changeKnifeAttackGroup', 'otherKnife');
        }

        otherCollider.node.emit('emitEvent', ['addKnife', this.node])
    },

    throwKnife: function (isDanceRelease = false) {
        this.node.emit('changeTag', 0);
        this.node.emit('noticeOwnerLeave');
        this.node.emit('isDanceRelease', isDanceRelease);
        this.node.emit('updateMomentState', KnifeMomentState.Release);
        this.node.emit('stopResetPos');
    },
    // update (dt) {},
});