const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const TaskType = require('Types').TaskType;
const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');
cc.Class({
    extends: cc.Component,

    properties: {
        itemDetailPrefab: cc.Prefab,
        itemScrollView: cc.ScrollView,
        content: cc.Node,
        tips: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init() {
        // PlatformMgr.getHolidayWorldRewardInfo((data) => {
        var data = PlayerData.instance.playerWorldRewardDetail;
        if (!data) return;
        this._itemScrollView = Tools.getOrAddComponent(this.itemScrollView, 'MyScrollView');
        this._itemScrollView.init(data.rewardInfo, {
            itemPrefab: this.itemDetailPrefab,
            className: 'ItemRewardDetail',
            startX: 0,
            gapX: 15,
            gapY: 10,
            perLine: 1,
            // })
        })
    },

    closeNode() {
        this.node.active = false;
    },
    // update (dt) {},

});