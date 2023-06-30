
const PlayerData = require('PlayerData');
const BagItem = require('BagItem');
cc.Class({
    extends: cc.Component,

    properties: {
        canNotReceiveNode: cc.Node,
        canReceiveNode: cc.Node,
        hasReceiveNode: cc.Node,
    },

    init(world, callback) {
        this.world = world;
        this.callback = callback;
        this.refresh()
    },

    refresh() {
        var canGet = PlayerData.instance.canGetAddTopReward();
        var hasGet = PlayerData.instance.hasGetAddTopReward();;
        this.canNotReceiveNode.active = !canGet;
        this.canReceiveNode.active = canGet && !hasGet;
        // this.hasReceiveNode.active = canGet && hasGet;
    },


    onReceiveClick: function () {
        var item = BagItem.createItemWithString('1,32,1');
        if (!PlayerData.instance.isOwnKnifeSkin(item.id)) {
            PlayerData.instance.addKnifeSkin(item.id);
            //装备上
            this.world.onEquipKnifeSkin(item.itemData, true);
        }
        //展示出来
        this.world.uiMgr.showReward(item.itemData);
        this.world.uiMgr.refreshRedDot();
        this.refresh()
    },

    onClose() {
        this.node.active = false;
        if (this.callback) {
            this.callback();
        }
    }

    // update (dt) {},
});