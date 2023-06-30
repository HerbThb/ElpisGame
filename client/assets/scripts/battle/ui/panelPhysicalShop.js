/**
 * @fileoverview panelPhysicalShop
 */
//体力商店
const panelPhysicalShop = cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Node,
        content: cc.Node,
        waitNode: cc.Node,

        iconSpriteFrames: [cc.SpriteFrame],

        _itemNodes: [],
        _isInit: false,
        _world: cc.Node,
        _priceString: '',
        callback: null,
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        console.log("=============panelPhysicalShop=onLoad=============")

        setTimeout(() => {
            this.setWaitNodeActive(false);
        }, 1000)

        this.setWaitNodeActive(true);
        this.shopDatas = [
            {
                "payIndex": 6,
                "iconIndex": 0,
                "desc": "10 Physical",
                "cost": 10,
                "price": "10",
                "unit": 10
            },
            {
                "payIndex": 7,
                "iconIndex": 0,
                "desc": "50 Physical",
                "cost": 40,
                "price": "40",
                "unit": 50
            }
        ]
    },

    init(world, callback) {
        this._world = world;

        if (!this._isInit) {
            this.initItems();
            this._isInit = true;
        }

        this.callback = callback
    },

    setWaitNodeActive: function (isActive) {
        this.waitNode.active = isActive;
    },

    initItems() {
        for (let i = 0; i < this.shopDatas.length; i++) {
            const data = this.shopDatas[i];
            var itemNode = cc.instantiate(this.itemPrefab);
            itemNode.parent = this.content;
            itemNode.active = true;
            var itemNodeSc = itemNode.getComponent('ItemPhysicalShopItem');
            itemNodeSc.init(data, this._world);
            if (data.iconIndex && this.iconSpriteFrames[data.iconIndex]) {
                itemNodeSc.resetIcon(this.iconSpriteFrames[data.iconIndex])
            }
            itemNodeSc.resetPrice(data.price);
            this._itemNodes.push(itemNode);
        }

    },

    close() {
        this.node.active = false;
        if (this.callback) {
            this.callback();
            this.callback = null
        }
    },
});