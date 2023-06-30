const PayMgr = require('PayMgr');
const PlayerData = require('PlayerData');

cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        desc: cc.Label,
        price: cc.Label,
        unit: cc.Label,
        grayNode: cc.Node,

        // free: cc.Node,
        // tv: cc.Node,
        // remainTime: cc.Label,

        _world: cc.Node,
        _lastFreeDiamondTime: 0,
        _curTime: '',
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(data, world) {
        this._data = data;
        this._world = world;
        this.desc.string = this._data.desc ? this._data.desc : '';
        this.price.string = this._data.price ? this._data.price : '';
        this.unit.string  = this._data.unit ? this._data.unit : '';

        this.grayNode.active = !PlayerData.instance.canBuyPhysical(this._data.unit)
    },

    onBuyBtnClick: function () {
        if(!PlayerData.instance.canBuyPhysical(this._data.unit)){
            return
        }

        if (PayMgr.instance.getIsPaying()) {
            return;
        }
      
        AdvertMgr.instance.fireBaseEvent("click_ranking_tili_btn");
        if (PlayerData.instance.zongZi >= this._data.cost) {
            PlayerData.instance.updateZongZi(-(this._data.cost));
            PlayerData.instance.buyPhysical(this._data.unit)
        } else {
            this._world.uiMgr.showTips('Insufficient Diamond');
        }

        this.grayNode.active = !PlayerData.instance.canBuyPhysical(this._data.unit)

    },

    resetPrice(priceString) {
        this.price.getComponent(cc.Label).string = priceString;
    },

});