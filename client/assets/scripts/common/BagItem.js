const Tools = require('Tools');
const ItemType = require('Types').ItemType;
const ConfigData = require('ConfigData');

const BagItem = cc.Class({
    statics: {
        //创建一组bagItem
        createItemsWithString: function (rewardStr, splitChar = ';') {
            const items = [];
            if (!rewardStr) {
                return items;
            }
            const rewards = rewardStr.split(splitChar);
            for (const reward of rewards) {
                if (reward) {
                    let nums = Tools.splitToNumList(reward, ',');
                    let bagItem = null;
                    if (nums.length >= 3) {
                        bagItem = BagItem.createItem(nums[0], nums[1], nums[2]);
                        items.push(bagItem);
                    }
                }

            }
            return items;
        },
        //创建一个bagItem
        createItemWithString: function (itemStr) {
            const nums = Tools.splitToNumList(itemStr, ',');
            return BagItem.createItem(nums[0], nums[1], nums[2]);
        },

        createItem: function (type, id, num) {
            var data = ConfigData.instance.getItemData(type, id);
            var item = new BagItem();
            item.type = type;
            item.id = id;
            item.itemData = data;
            item.num = num;
            return item;
        },
    },



    properties: {
        type: ItemType.KNIFE_SKIN,
        id: 0,
        num: 0,
        itemData: null,
    },
});