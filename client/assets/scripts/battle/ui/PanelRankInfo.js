const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;


cc.Class({
    extends: cc.Component,

    properties: {
        itemRankInfo: cc.Prefab,
        itemStarPrefab: cc.Prefab,
        itemRankReward: cc.Prefab,
        itemScrollView: cc.ScrollView,
        content: cc.Node,
        itemRankParent: cc.Node,
        itemStarParent: cc.Node,
        bar: cc.Node,
        barBg: cc.Node,
        countNode: cc.Node,
        countLabel: cc.Label,
        cubeBgNode: cc.Node,

        _itemCells: [],
        _itemNodes: [],
    },

    init: function (world) {
        this.world = world;
        this.itemHeight = 320;
        var rankDatas = ConfigData.instance.starRankDatas;
        for (let i = rankDatas.length - 1; i >= 0; i--) {
            var data = rankDatas[i];

            //生成段位Item
            if (!this._itemNodes[i]) {

                let itemRankReward = cc.instantiate(this.itemRankReward);
                itemRankReward.parent = this.itemRankParent;
                itemRankReward.x = 80;
                itemRankReward.y = -135 - this.itemHeight * (rankDatas.length - 1 - i);
                this._itemNodes[i] = itemRankReward;
                var itemRankRewardComp = itemRankReward.getComponent('ItemRankReward');

                if (data.reward) {
                    var item = BagItem.createItemWithString(data.reward);
                    switch (item.type) {
                        case ItemType.HERO_SKIN:
                        case ItemType.KNIFE_SKIN:
                            itemRankRewardComp.init(data, item, true);
                            break;
                        case ItemType.MONEY:
                            itemRankRewardComp.init(data, item, false);
                            break;
                    }
                } else {
                    itemRankRewardComp.init(data, null, false);
                }

                this._itemCells[i] = itemRankRewardComp;
                itemRankRewardComp.setOnItemClick(this, itemRankRewardComp);

                //生成段位星星Item
                if (data.levelUpStar) {
                    for (let i = 1; i <= data.levelUpStar; i++) {
                        let itemStar = cc.instantiate(this.itemStarPrefab);
                        itemStar.parent = this.itemStarParent;
                        itemStar.x = 35;
                        itemStar.y = itemRankReward.y + i * (this.itemHeight / data.levelUpStar);
                        var isGet = PlayerData.instance.rankStar >= data.star + i;
                        itemStar.children[0].active = isGet ? true : false;
                        itemStar.children[1].active = isGet ? false : true;
                    }
                }

            }
        }
        // var scrollViewCulling = Tools.getOrAddComponent(this.itemScrollView.node, 'ScrollViewCulling');
        // scrollViewCulling.init(this.itemScrollView, this._itemCells, {
        //     countPerLine: 1,
        // });
        var rankData = PlayerData.instance.rankData;
        var star = PlayerData.instance.rankStar;
        var rate = 0
        if (rankData.levelUpStar) {
            var rate = (star - rankData.star) / rankData.levelUpStar;
        }

        this.content.height = this.itemHeight * rankDatas.length;
        this.bar.y = -this.itemHeight * (rankDatas.length - 1);
        this.barBg.height = this.itemHeight * (rankDatas.length - 1);
        this.bar.height = rankData.id * this.itemHeight + this.itemHeight * rate;
        this.itemScrollView.scrollToOffset(cc.v2(0, this.itemHeight * (rankDatas.length - 1.5) - this.bar.height))

        this.refresh();
        this.onScrollView();
    },

    refresh: function () {
        for (let itemComp of this._itemCells) {
            var data = itemComp.data;
            var item = itemComp.item;
            var isGet = false;
            var canUnlock = PlayerData.instance.rankData.id >= data.id;
            if (item) {
                switch (item.type) {
                    case ItemType.HERO_SKIN:
                        isGet = PlayerData.instance.isOwnHeroSkin(item.id);
                        break;
                    case ItemType.KNIFE_SKIN:
                        isGet = PlayerData.instance.isOwnKnifeSkin(item.id);
                        break;
                    case ItemType.MONEY:
                        isGet = Tools.arrContains(PlayerData.instance.completeRankRewardIds, data.id);
                        break;
                }
            }
            itemComp.refresh(isGet, canUnlock);
        }
    },

    onItemClick: function (event, customEventData) {
        var itemComp = customEventData;
        var data = itemComp.data;
        var item = itemComp.item;
        if (Tools.arrContains(PlayerData.instance.completeRankRewardIds, data.id)) return;
        switch (item.type) {
            case ItemType.HERO_SKIN:
            case ItemType.KNIFE_SKIN:
                this.unLockBtnClick(itemComp);
                break;
            case ItemType.MONEY:
                PlayerData.instance.updateGold(item.num);
                PlayerData.instance.showGold -= item.num;
                PlayerData.instance.addCompleteRankReward(data.id);
                var param = {
                    count: item.num,
                    isMore: true,
                    isLucky: false,
                }
                this.world.uiMgr.showGetMoneyEffect(param);
                this.world.uiMgr.refreshRedDot();
                itemComp.refresh(true, true);
                break;
        }

    },


    unLockBtnClick: function (itemComp) {
        var self = this;
        // 关闭广告时回调
        var closeFunc = (success) => {
            self.unLockCallback(success, itemComp);
        }
        // 打开广告失败时回调,失败回调
        var errFunc = () => {
            self.showShare(itemComp);
            // self.world.uiMgr.showTips('暂未获取到广告信息，请稍后再试')
        }
        AdvertMgr.instance.showAdver(AdverType.UnlockSkin, closeFunc, errFunc);
    },

    showShare: function (itemComp) {
        const self = this;
        ShareMgr.share(ShareType.UnlockSkin, (success) => {
            self.unLockCallback(success, itemComp);
        });
    },

    unLockCallback: function (success, itemComp) {
        const self = this;
        if (itemComp && success) {
            var item = itemComp.item;
            PlayerData.instance.addCompleteRankReward(itemComp.data.id);
            var skinId = itemComp.item.id;
            switch (item.type) {
                case ItemType.HERO_SKIN:
                    //加入背包
                    PlayerData.instance.addHeroSkin(skinId);
                    //装备上
                    var data = ConfigData.instance.getHeroSkinById(skinId);
                    self.world.onEquipHeroSkin(data, true);
                    //展示出来
                    self.world.uiMgr.showReward(data);
                    break;
                case ItemType.KNIFE_SKIN:
                    //加入背包
                    PlayerData.instance.addKnifeSkin(skinId);
                    //装备上
                    var data = ConfigData.instance.getKnifeSkinById(skinId);
                    self.world.onEquipKnifeSkin(data, true);
                    //展示出来
                    self.world.uiMgr.showReward(data);
                    break;
            }
            self.world.uiMgr.refreshRedDot();
            itemComp.refresh(true, true);
        }
    },

    onScrollView: function () {
        // return;
        //当前滑动所在位置
        var curScrollHeight = this.itemScrollView.getScrollOffset().y;

        var count = 0;
        var index = 25 - Math.floor((curScrollHeight - 100) / this.itemHeight);
        for (let i = index; i >= 0; i--) {
            var item = this._itemCells[i];
            if (item.unLockNode.active) {
                count++;
            }
        }

        if (count) {
            this.countNode.active = true;
            if (count !== this.countLabel.string) this.countLabel.string = count;
        } else {
            this.countNode.active = false;
        }

        for (let i = 0; i < this._itemCells.length; i++) {
            if (i < (index + 4) && i > (index - 2)) {
                if (!this._itemNodes[i].active) this._itemNodes[i].active = true;
            } else {
                if (this._itemNodes[i].active) this._itemNodes[i].active = false;
            }
        }
        // if (curScrollHeight < Math.floor((this._itemCells.length - 1) / 3) * 150 - 300) {
        //     if (!this.downNode.active) this.downNode.active = true;
        // } else {
        //     if (this.downNode.active) this.downNode.active = false;
        // };

    },


    onCloseBtnClick: function () {
        this.node.active = false;
        AdvertMgr.instance.destoryBanner();
    },
});