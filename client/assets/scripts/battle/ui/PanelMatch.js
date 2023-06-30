const Tools = require('Tools');

cc.Class({
    extends: cc.Component,

    properties: {
        itemParent: cc.Node,
        itemMatchPrefab: cc.Prefab,
    },

    cleanUp: function () {
        this.itemParent.destroyAllChildren();
    },

    init: function (players, callback) {
        var _players = players.concat();
        _players.sort((a, b) => {
            return Math.random() > 0.5 ? -1 : 1;
        });
        var itemPool = [];
        for (let i = 0; i < _players.length; i++) {
            const itemNode = cc.instantiate(this.itemMatchPrefab);
            itemNode.parent = this.itemParent;
            itemNode.x = i % 4 * 150;
            itemNode.y = Math.floor(i / 4) * -150;
            const itemComp = itemNode.getComponent('ItemMatch');
            itemComp.init(_players[i]);
            if (_players[i].isLocal) {
                itemComp.showIcon();
            } else {
                itemPool.push(itemComp);
            }
        }

        itemPool.sort((a, b) => {
            return Math.random() > 0.5 ? -1 : 1;
        });

        var time = 0;
        for (let i = 0; i < itemPool.length; i++) {
            let item = itemPool[i];
            let showTime = Tools.getRandomInt(100, 400);
            time += showTime;
            setTimeout(() => {
                item.showIcon();
            }, time);
        }

        time += 300;
        setTimeout(() => {
            callback();
        }, time);
    },

    // update (dt) {},
});