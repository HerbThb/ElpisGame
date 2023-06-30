const ListItemBase = require('ListItemBase')
const UIUtil = require('UIUtil')
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
cc.Class({
    extends: ListItemBase,

    properties: {
        rankLabel: cc.Label,
        goldLabel: cc.Label,
        diamondLabel: cc.Label,
    },

    init(data) {
        var str;
        if (data.endRank) {
            str = '第' + data.rank + '-' + data.endRank + '名'
        } else {
            str = '第' + data.rank + '名'
        }
        this.rankLabel.string = str;

        var items = BagItem.createItemsWithString(data.reward);
        for (let i = 0; i < items.length; i++) {
            switch (items[i].type) {
                case ItemType.MONEY:
                    this.goldLabel.string = 'x' + items[i].num;
                    break;
                case ItemType.ZONG_ZI:
                    this.diamondLabel.string = 'x' + items[i].num;
                    break;
            }
        }
    },

    // update (dt) {},
});