/**
 * @fileoverview PanelShop
 */
const PayMgr = require('PayMgr');
const ConfigData = require('ConfigData');
const PlatformMgr = require('PlatformMgr');

//假期排行
const PanelShop = cc.Class({
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
        callback : null
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        console.log("=============PanelShop=onLoad=============")
        var queryCallbackFunc = (priceString) => {
            console.log('onLoad priceString=======' + priceString);
            this._priceString = (priceString);
            this.setWaitNodeActive(false);
            this.resetPrices(this._priceString);
        }

        setTimeout(() => {
            this.setWaitNodeActive(false);
        }, 1000)

        this.setWaitNodeActive(true);
        PayMgr.instance.requestProductPrices(queryCallbackFunc);
    },

    init(world ,callback) {
        this._world = world;

        if (!this._isInit){
            this.initItems();
            this._isInit = true;
        }

        this.callback = callback
    },

    setWaitNodeActive: function (isActive) {
        this.waitNode.active = isActive;
    },  

    initItems() {
        const shopDatas = ConfigData.instance.getShopDatas();
        for (let i = 0; i < shopDatas.length; i++) {
            const data = shopDatas[i];
            var itemNode = cc.instantiate(this.itemPrefab);
            itemNode.parent = this.content;
            itemNode.active = true;
            var itemNodeSc = itemNode.getComponent('ItemShopItem');
            itemNodeSc.init(data, this._world);
            if (data.iconIndex && this.iconSpriteFrames[data.iconIndex]) {
                itemNodeSc.resetIcon(this.iconSpriteFrames[data.iconIndex])
            }
            this._itemNodes.push(itemNode);
        }

        this.resetPrices(this._priceString);
    },



    resetPrices: function (priceString) {
        priceString = priceString || PayMgr._priceString
        console.log("priceString==> ",priceString,PayMgr._priceString)
        if (!priceString) return;
        if (priceString === "") return;
        var splitStr = PlatformMgr.isIosApp() ? '?' : '#';
        var prices = priceString.split(splitStr);

        var pricesnew = [];
        for (let index = 0; index < prices.length; index++) {
            let price = prices[index]
            if(prices[index].includes("2.99")){
                continue;
            }
            pricesnew.push(price)
        }

        for (let i = 0; i < this._itemNodes.length; i++) {
            var itemNode = this._itemNodes[i];
            var itemNodeSc = itemNode.getComponent('ItemShopItem');
            if (i >= pricesnew.length) break;
            console.log("价格",pricesnew[i])
            itemNodeSc.resetPrice(pricesnew[i]);
        }
    },

    close() {
        this.node.active = false;
        if (this.callback) {
            this.callback();
            this.callback = null
        }
    },

    update(dt) {
        if (PlatformMgr.isIosApp()&&!this.waitNode.active && PayMgr.instance.getIsPaying()) {
            this.setWaitNodeActive(true);
        }

        if (PlatformMgr.isIosApp()&&this.waitNode.active && !PayMgr.instance.getIsPaying()) {
            this.setWaitNodeActive(false);
        }
    },

    // update (dt) {},
});