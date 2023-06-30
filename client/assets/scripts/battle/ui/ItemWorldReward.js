const ListItemBase = require('ListItemBase')
const UIUtil = require('UIUtil')
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const JDCARD = [50, 100, 200, 500];
cc.Class({
    extends: ListItemBase,

    properties: {
        rankLabel: cc.Label,
        goldLabel: cc.Label,
        diamondLabel: cc.Label,

        realNode: cc.Node,
        unRealNode: cc.Node,
        heroNode: cc.Node,
        cardNode: cc.Node,
        cardLabel: cc.Label,
        heroLabel: cc.Label,
    },

    init(data) {
        var str;
        if (data.endRank) {
            str = '第' + data.rank + '-' + data.endRank + '名'
        } else {
            str = '第' + data.rank + '名'
        }
        this.rankLabel.string = str;


        this.realNode.active = false;
        this.unRealNode.active = false;
        this.heroNode.active = false;
        var items = BagItem.createItemsWithString(data.reward);
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            switch (item.type) {
                case ItemType.MONEY:
                    this.unRealNode.active = true;
                    this.goldLabel.string = 'x' + item.num;
                    break;
                case ItemType.ZONG_ZI:
                    this.unRealNode.active = true;
                    this.diamondLabel.string = '钻石x' + item.num;
                    break;
                case ItemType.CARD:
                    this.realNode.active = true;
                    var cards = this.cardNode.children;
                    for (let j = 0; j < cards.length; j++) {
                        cards[j].active = item.num === JDCARD[j];
                    }
                    this.cardLabel.string = data.tips;
                    break;
                case ItemType.HERO_SKIN:
                    this.heroNode.active = true;
                    this.heroLabel.string = data.tips;
                    break;
            }
        }
    },

    // update (dt) {},
});