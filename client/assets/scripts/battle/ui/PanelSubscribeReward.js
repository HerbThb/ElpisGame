const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');

const Tools = require('Tools');
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

    // onLoad () {},

    init(world, callback) {
        this.world = world;
        this.callback = callback;
        PlayerData.instance.updateDaySubscribeReward();
    },


    onClose() {
        this.node.active = false;
        this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(15), 10));
        PlayerData.instance.updateZongZi(10);
        if (this.callback) this.callback();
    },

    update(dt) {},
});