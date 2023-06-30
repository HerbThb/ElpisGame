var BaseItem = require("BaseItem");
cc.Class({
    extends: BaseItem,

    properties: {
        node_buy: { type: cc.Node, default: null },
        label_name: { type: cc.Label, default: null },
        label_price: { type: cc.Label, default: null },
        // sprite_icon: { type: cc.Sprite, default: null },
    },

    init(eventListener){
        this._super(eventListener);

        // 监听事件
        this.node_buy.on(cc.Node.EventType.TOUCH_END, this.onBuyClick, this);
    },

    // 设置内容
    setItem(data){
        this._super(data);
        const {name, price, icon} = data;

        this.label_name.string = name;
        this.label_price.string = price;
        // cc.loader.loadRes(icon, cc.SpriteFrame, (error, res)=>{
        //     this.sprite_icon.spriteFrame = res;
        // });
    },

    // buy按钮事件回调
    onBuyClick(event){
        if(!this.data || !this.eventListener) return;

        this.eventListener.onBuyClick(this.data.id);
    }
});