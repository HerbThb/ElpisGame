var Quee = require("Quee");
var WeiShuSdk = require("WeiShuSdk");
const PlatformMgr = require('PlatformMgr');
cc.Class({
    extends: cc.Component,

    properties: {
        btn: cc.Button,
        itemID: 0,
    },

    updateItem(itemId) {
        this.itemID = itemId;
        let url = WeiShuSdk.baseUrl + "Slot2End/boards/" + Quee.itemVals[this.itemID].imgUrl;
        let self = this;
        cc.loader.load(url, function (err, texture) {
            var sprite = new cc.SpriteFrame(texture);
            self.btn.node.getComponent(cc.Sprite).spriteFrame = sprite;
        });
    },

    onLoad() {
        this.btn.node.on("click", this.onClick, this);
    },

    onClick() {
        let cfg = Quee.itemVals[this.itemID];
        if (!cfg) return;
        if (cfg.mod === 0)
            PlatformMgr.navgateTo(cfg, null, () => {
                Quee.updateList(this.itemID);
            });
        else
            PlatformMgr.onPreView(cfg, () => {
                Quee.updateList(this.itemID);
            });
    },
});
