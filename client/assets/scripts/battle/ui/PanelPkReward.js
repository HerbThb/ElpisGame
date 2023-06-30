const ConfigData = require('ConfigData');
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const PlayerData = require('PlayerData');
const GameData = require('GameData');
cc.Class({
    extends: cc.Component,

    properties: {
        rankLabel: cc.Label,
        tipsText: cc.RichText,
        diamondLabel: cc.Label,
        goldLabel: cc.Label,
    },

    //第几轮和第几名
    init(rankData, callback, world) {
        this.callback = callback;
        this.world = world;
        this.rankData = rankData;
        var rank = rankData.rank;
        var round = rankData.round;
        var joinTime = rankData.joinTime;
        var data = ConfigData.instance.getPKRewardByRank(rank);
        if (GameData.instance.isShowLog()) {
            console.log('--------------------------刷新小组排名奖励：', joinTime, '轮次:', round, '名次:', rank)
        }

        if (rank === -1 || PlayerData.instance.hasReceivePKRound(joinTime) || !data) {
            this.close(false);
        } else {
            this.rankLabel.string = '小组第' + rank + '名';
            this.tipsText.string = '恭喜你取得小组PK（第' + round + '轮）</color=##EEE50E>第' + rank + '名';
            this.items = BagItem.createItemsWithString(data.reward);
            for (let i = 0; i < this.items.length; i++) {
                switch (this.items[i].type) {
                    case ItemType.MONEY:
                        this.goldNum = this.items[i].num;
                        this.goldLabel.string = 'x' + this.goldNum;
                        break;
                    case ItemType.ZONG_ZI:
                        this.diamondNum = this.items[i].num;
                        this.diamondLabel.string = 'x' + this.diamondNum;
                        break;
                }
            }
        }
    },

    close(receive = true) {
        if (receive) {
            if (this.goldNum) {
                PlayerData.instance.updateGold(this.goldNum);
                PlayerData.instance.showGold -= this.goldNum;
                var param = {
                    count: this.goldNum,
                    isMore: true,
                    isLucky: false,
                }
                this.world.uiMgr.showGetMoneyEffect(param);
            }

            if (this.diamondNum) {
                PlayerData.instance.updateZongZi(this.diamondNum);
                this.world.uiMgr.showTips(Tools.getStringByFormat(ConfigData.instance.getUITipStr(15), count))
            }
            PlayerData.instance.updateReceiveRound(this.rankData.joinTime, true);
        }

        PlayerData.instance.updateDayRefreshPKReward();
        this.node.active = false;
        if (this.callback) this.callback();
    }
});