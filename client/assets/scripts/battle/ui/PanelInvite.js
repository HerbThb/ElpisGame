const PlatformMgr = require('PlatformMgr');
const PlatformType = require('Types').PlatformType;
const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const StageType = require('Types').StageType;
cc.Class({
    extends: cc.Component,

    properties: {
        iconSprties: [cc.Sprite],

        shareLabel: cc.Label,

        shareBtn: cc.Node,
        receiveBtn: cc.Node,
        hasReceiveBtn: cc.Node,
    },

    init(world) {
        this.world = world;
        this.data = PlayerData.instance.inviteDatas;
        PlayerData.instance.updateCheckInviteLength();
        this.world.uiMgr.refreshRedDot();
        for (let i = 0; i < this.data.length; i++) {
            if (this.iconSprties[i]) {
                UIUtil.loadFriendPortrait(this.iconSprties[i], this.data[i].iconUrl)
            }
        }
        this.shareLabel.string = this.data.length + '/3';
        this.refresh();
    },

    refresh() {
        var complete = this.data.length >= 3
        var receive = PlayerData.instance.hasGetInviteReward();


        this.shareBtn.active = !complete;
        this.receiveBtn.active = complete && !receive;
        this.hasReceiveBtn.active = complete && receive;
    },


    onShareClick: function () {
        ShareMgr.share(ShareType.Invite);
    },

    onReceiveClick: function () {
        var item = BagItem.createItemWithString('2,11,1');
        if (!PlayerData.instance.isOwnHeroSkin(item.id)) {
            PlayerData.instance.addHeroSkin(item.id);
            //装备上
            this.world.onEquipHeroSkin(item.itemData, true);
        }
        //展示出来
        this.world.uiMgr.showReward(item.itemData);
        this.world.uiMgr.refreshRedDot();
        this.refresh()
    },
    onClose() {
        this.node.active = false;
        // AdvertMgr.instance.destoryBanner();
    },
});