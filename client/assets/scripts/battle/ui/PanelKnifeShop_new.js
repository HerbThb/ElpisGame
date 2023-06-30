const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const TaskType = require('Types').TaskType;
const ItemGetType = require('Types').ItemGetType;
const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');
cc.Class({
    extends: cc.Component,

    properties: {
        topNode: cc.Node,
        content: cc.Node,
        itemKnifeSkin: cc.Prefab,

        pageView: cc.PageView,
        pagePrefab: cc.Prefab,

        buyNode: cc.Node,
        unLockNode: cc.Node,
        linkNode : cc.Node,
        nameLabel: cc.Label,
        introduceNode: cc.Node,
        introduceTextNode: cc.Node,
        introduceLabel: cc.Label,
        propertyNode: cc.Node,
        propertyLabel: cc.Label,
        propertyAnim: cc.Animation,

        taskStartLabel: cc.Label,
        taskProgressLabel: cc.Label,
        taskFinalLabel: cc.Label,

        taskInfoNode: cc.Node,
        watchAdverBtnNode: cc.Node,

        watchAdverLabel: cc.Label,
        buyLangLabel: cc.Label,
        unlockLangLabel: cc.Label,
        jumpNode: cc.Node,
        //解锁btn的图标
        shareIcon: cc.Node,
        adverIcon: cc.Node,


        //套装
        suitNode: cc.Node,
        suitNameLabel: cc.Label,
        suiProcessLabel: cc.Label,
        suitCloseIcon: cc.Node,
        suitActiveIcon: cc.Node,
        suitHeroNameLabel: cc.Label,
        suitKnifeNameLabel: cc.Label,
        suitSkillLabel: cc.Label,
        suitHeroFlag: cc.Node,
        suitKnifeFlag: cc.Node,
        suitHeroFalseFlag: cc.Node,
        suitKnifeFalseFlag: cc.Node,
        suitIconNode: cc.Node,

        _itemCells: [],
        _itemNodes: [],
        _itemPageCells: [],
        _pageClickHistory: [],


        itemTypePool: [],
        typeIconNode: cc.Node,

        shopBgNode: cc.Node,
        perCount: 6,

        goldIcon: cc.Node,
        diamondIcon: cc.Node,
        priceLabel: cc.Label,
        lastPageIndex: 0,

        keyNode: cc.Node,
        keyParentNode: cc.Node,
    },


    onLoad() {
        this.checkUI();
        this._itemClickHistory = {}
    },

    init: function (world) {
        this.world = world;
        this.localPlayer = world.localPlayer;
        this.initData();
        this.initUI();
        this.initKey()
        this.refresh();
        this.scrollPage();
        this.showName();
    },

    initData() {
        this.itemTypePool = [];
        var knifeSkinDatas = []

        if(PlayerData.instance.isInNFTRankGameMode()){
            knifeSkinDatas = ConfigData.instance.getNFTWeaponSkins()
        }
        else{
            knifeSkinDatas = ConfigData.instance.knifeSkinDatas.slice().filter(data=>{
                return data.getWay!=100
            });
        }

        var curTime = PlayerData.instance.getCurTime();
        var ownKnifeSkins = PlayerData.instance.ownKnifeSkins;
        Tools.filterDataByTime(knifeSkinDatas, ownKnifeSkins, curTime, GameData.instance, ConfigData.instance.clientData.hideSpecialSkin, PlatformMgr.isIOS(), PlatformMgr.isApp());
        knifeSkinDatas.sort((a, b) => {
            // if (a.newDate && Tools.isBeforeOtherTime(a.newDate, curTime)) {
            //     return -1;
            // } else if (b.newDate && Tools.isBeforeOtherTime(b.newDate, curTime)) {
            //     return 1;
            // } else {
            return a.sort - b.sort;
            // }
        })

        for (let i = 0; i < knifeSkinDatas.length; i++) {
            var data = knifeSkinDatas[i];
            var type = 0;
            if (data.getWay === 0) {
                if (data.priceType === 0) {
                    type = ItemGetType.GOLD;
                } else {
                    type = ItemGetType.DIAMOND;
                }
            } 
            else if (data.getWay === 1) {
                if (data.taskType === TaskType.RANK) {
                    type = ItemGetType.RANK;
                } else if (data.taskType === TaskType.TREASUREBOX) {
                    type = ItemGetType.BOX;
                } else {
                    type = ItemGetType.TASK;
                }
            }
            else if (data.getWay === 100) {
                type = ItemGetType.NFT;

                //塞入余额，玩家是否拥有
                let comleted = PlatformMgr.nft_balance_ids[data.goodsId] || 0
                data.rest = 1000 - comleted
            }
            this.push(type, data);
        }
    },


    initUI() {
        this.page = -1;
        this.pageTypes = [];
        for (let i = 0; i < this.itemTypePool.length; i++) {
            var arr = this.itemTypePool[i];
            if (!arr) continue;
            var pageLength = Math.ceil(arr.length / this.perCount);
            for (let j = 0; j < pageLength; j++) {
                this.page++;
                this.pageTypes[this.page] = i;
                let pageNode = this.content.children[this.page]
                if (!pageNode) {
                    pageNode = cc.instantiate(this.pagePrefab);
                    pageNode.parent = this.content;
                }
                for (let k = 0; k < this.perCount; k++) {
                    let index = j * this.perCount + k;
                    var data = arr[index];
                    let itemNode = pageNode.children[k]
                    var itemComp
                    if (!itemNode) {
                        itemNode = cc.instantiate(this.itemKnifeSkin);
                        itemNode.parent = pageNode;
                        itemNode.position = cc.v2(k % 3 * 230 - 235, -78 - Math.floor(k / 3) * 160);
                        itemComp = itemNode.getComponent('ItemKnifeSkin_new')
                        itemComp.init(data);
                        itemComp.page = this.page;
                        itemComp.index = k;
                        if (data) {
                            itemComp.setOnItemClick(this, itemComp);
                            this._itemCells.push(itemComp);
                            this.pushToPageItemPool(this.page, itemComp);
                        }
                    } else {
                        itemComp = itemNode.getComponent('ItemKnifeSkin_new')
                    }

                    //找出当前装备
                    if (data && PlayerData.instance.knifeSkinId === data.id) {
                        this.lastPageIndex = this.page;
                    }
                    //设置是否可买
                    // if (data && !PlayerData.instance.isOwnKnifeSkin(data.id) && PlayerData.instance.canBuyItem(data)) {
                    //     itemComp.setCanBuy(true);
                    // }
                }
            }
        };
        this.pageView.onLoad();
        this.pageView.setCurrentPageIndex(1);


    },

    checkUI() {
        var isPad = GameData.instance.isPad();
        this.topNode.y = isPad ? -200 : 0;
        this.pageView.node.height = isPad ? 380 : 550;
        this.shopBgNode.height = isPad ? 580 : 750;
        this.suitNode.y = isPad ? 240 : 390;
        this.nameLabel.node.y = isPad ? 180 : 230
        this.propertyNode.y = isPad ? 150 : 195;
        this.propertyAnim.node.parent.y = isPad ? 150 : 195;
        this.perCount = isPad ? 6 : 9;
    },

    initKey() {
        var keyCount = PlayerData.instance.keyCount;
        for (let i = 0; i < 3; i++) {
            this.keyParentNode.children[i].active = i < keyCount;
        }
    },

    //以类型区分的data数组
    push(type, data) {
        if (!this.itemTypePool[type]) {
            this.itemTypePool[type] = [];
        }
        this.itemTypePool[type].push(data);
    },
    //以页数区分的ItemComp数组
    pushToPageItemPool(page, comp) {
        if (!this._itemPageCells[page]) {
            this._itemPageCells[page] = [];
        }
        this._itemPageCells[page].push(comp)
    },

    getItemByPage(page, index) {
        if (this._itemPageCells[page]) {
            return this._itemPageCells[page][index];
        }
    },

    selectItem(page) {
        if (this._itemPageCells[page]) {
            var length = this._itemPageCells[page].length;
            var index = -1;
            for (let i = length - 1; i >= 0; i--) {
                let item = this._itemPageCells[page][i];
                if (item.isGet) {
                    if (item.equipNode.active) {
                        this.onItemClick(null, this._itemPageCells[page][i], false, true)
                        return;
                    }
                } else {
                    index = i;
                }
            }

            //检查是否点过
            if (index !== -1) {
                if (this._pageClickHistory[page]) {
                    index = this._pageClickHistory[page];
                }
                this.onItemClick(null, this._itemPageCells[page][index], false, true)
            }
        }

    },

    onScrollPage(pageView) {
        var index = pageView.getCurrentPageIndex();
        var type = this.getPageType(index);
        this.setTitle(type);
        this.selectItem(index);
    },

    setTitle(type) {
        for (let i = 0; i < this.typeIconNode.children.length; i++) {
            this.typeIconNode.children[i].active = i === type;
        }
    },

    showName() {
        this.nameLabel.node.active = false;
        setTimeout(() => {
            this.nameLabel.node.active = true;
        }, 500)
    },


    getPageType: function (index) {
        return this.pageTypes[index];
    },

    scrollPage: function () {
        this.pageView.onLoad();
        var index = this.lastPageIndex - 1;
        index = index >= 0 ? index : 1;
        this.pageView.setCurrentPageIndex(index);
        setTimeout(() => {
            this.pageView.setCurrentPageIndex(this.lastPageIndex);
            this.onScrollPage(this.pageView)
        }, 200);
    },

    refresh: function () {
        var count = 0;
        for (const itemComp of this._itemCells) {
            if (!itemComp) continue;
            var data = itemComp.data;
            var isGet = PlayerData.instance.isOwnKnifeSkin(data.id);

            //NFT测试，显示是否拥有
            if(data.getWay==100 && !isGet){
                let own = PlatformMgr.nft_user_datas[data.goodsId] || 0
                if(own > 0){
                    console.log("购买后。同步到本地皮肤数据")
                    PlayerData.instance.addKnifeSkin(data.id);
                    isGet = true
                }
            }

            var canUnlock = Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId);
            var needCheck = Tools.arrContains(PlayerData.instance.needCheckTaskIds, data.taskId);
            var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, PlayerData.instance.getCurTime());
            var canBuy = PlayerData.instance.canBuyItem(data) && !this._itemClickHistory[data.id];

            var processStr = '';
            if (data.getWay === 1) {
                if (data.taskType !== TaskType.RANK && data.taskType !== TaskType.DUANWU && data.taskType !== TaskType.TREASUREBOX) {
                    var process = PlayerData.instance.getTaskProcess(data.taskType);
                    processStr = process + '/' + data.taskParam;
                }
            }

            itemComp.refresh(isGet, canUnlock, needCheck, isNew, processStr, canBuy);
            if (isGet) count++;
            if (PlayerData.instance.knifeSkin.id === data.id) {
                this.onItemClick(null, itemComp, true)
                // itemComp.setCheck(false);
            }
        }
    },

    buyBtnClick: function () {
        if (this.lastCheckItem) {
            var item = this.lastCheckItem;
            switch (item.data.priceType) {
                case 0: {
                    if (PlayerData.instance.gold >= item.data.price) {
                        PlayerData.instance.addKnifeSkin(item.data.id);
                        PlayerData.instance.updateGold(-(item.data.price));
                        this.refresh();
                        this.onItemClick(null, item);
                    } else {
                        this.world.uiMgr.showTips(7)
                    }
                    break;
                }
                case 1: {
                    AdvertMgr.instance.fireBaseEvent("click_store_product_btn","product_type","skinknives");
                    if (PlayerData.instance.zongZi >= item.data.price) {
                        PlayerData.instance.addKnifeSkin(item.data.id);
                        PlayerData.instance.updateZongZi(-(item.data.price));
                        this.refresh();
                        this.onItemClick(null, item);
                    } else {
                        this.world.uiMgr.showTips('Insufficient Diamond');
                    }
                    break;
                }
            }

        }
    },

    jumpBtnClick: function () {
        if (this.lastCheckItem) {
            this.world.uiMgr.closePanelShop();
            // this.close();
            var item = this.lastCheckItem;
            switch (item.data.jumpParam) {
                case 'PanelInvite': {
                    this.world.uiMgr.showPanelInvite();
                    break;
                }
                case 'PanelDailyTask': {
                    this.world.uiMgr.showPanelDailyTask();
                    break;
                }
                case 'PanelAddTop': {
                    this.world.uiMgr.showPanelAddTop();
                    break;
                }
                case 'PanelSign': {
                    this.world.uiMgr.showPanelSign();
                    break;
                }
                case 'PanelHolidayRank': {
                    this.world.uiMgr.showPanelHolidayRank(true);
                    break;
                }
            }
        }
    },

    //解锁皮肤按钮
    unLockBtnClick: function () {
        var self = this;
        // 关闭广告时回调
        var closeFunc = (success) => {
            if (self.lastCheckItem && success) {
                var item = self.lastCheckItem;
                PlayerData.instance.addKnifeSkin(item.data.id);
                self.refresh();
                self.onItemClick(null, item);
                if (item.data.taskType === TaskType.LOGIN) {
                    PlayerData.instance.updateSignCount();
                }
                self.world.uiMgr.refreshRedDot();
            }
        }

        if (this.shareIcon.active) {
            this.showShare(closeFunc);
        } else {
            this.showAdver(closeFunc);
        }
    },

    linkBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_n_wallet_btn","page_id","shop");
        this.world.uiMgr.showPanelGetNFT();
    },

    showShare: function (closeFunc) {
        ShareMgr.share(ShareType.UnlockSkin, closeFunc);
    },

    showAdver: function (closeFunc) {
        var self = this;
        var errFunc = () => {
            this.showShare(closeFunc);
        }
        AdvertMgr.instance.fireBaseEvent("click_adv_btn","position_id",ConfigData.instance.getAdvertUnitId(AdverType.UnlockSkin));
        AdvertMgr.instance.showAdver(AdverType.UnlockSkin, closeFunc, errFunc);
    },

    onItemClick: function (event, customEventData, isInit = false, isAuto = false) {
        var itemComp = customEventData;
        var data = itemComp.data;

        if (this.lastCheckItem) this.lastCheckItem.setCheck(false);
        itemComp.setCheck(true);
        itemComp.setCanBuy(false);
        this.lastCheckItem = itemComp;

        if (!isAuto && !itemComp.isGet) {
            this._pageClickHistory[itemComp.page] = itemComp.index;
        }
        this._itemClickHistory[data.id] = true;

        this.buyNode.active = false;
        this.linkNode.active = false;
        this.unLockNode.active = false;
        this.watchAdverBtnNode.active = false;

        this.buyLangLabel.string = 'Buy'
        this.unlockLangLabel.string = 'Unlock:'

        // this.jumpNode.active = false;
        if (!isInit) this.world.onEquipKnifeSkin(data, itemComp.isGet, false);
        if (itemComp.isGet) {
            if (this.lastEquipItem) this.lastEquipItem.setEquip(false)
            this.lastEquipItem = itemComp;
            itemComp.setEquip(true);
        } else {
            if (data.getWay === 0) {
                this.buyNode.active = true;
                this.goldIcon.active = data.priceType === 0;
                this.diamondIcon.active = data.priceType === 1;
                if (data.price) this.priceLabel.string = Tools.getGoldStr(data.price);
            } else if (data.getWay === 1) {
                if (Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId)) {
                    this.unLockNode.active = true;
                    this.shareIcon.active = data.unlockWay === 1;
                    this.adverIcon.active = data.unlockWay === 2;
                } else if (data.taskType === TaskType.ADVERCOUNT) {
                    this.watchAdverBtnNode.active = true;
                }
            }
            else if (data.getWay === 100) {
                //NFT测试
                this.buyNode.active = false;
                // this.linkNode.active = true;//暂时关闭商店详情页的获取按钮
            }
        }

        this.nameLabel.string = data.name;
        this.introduceNode.active = !(itemComp.isGet || this.buyNode.active || this.unLockNode.active || this.watchAdverBtnNode.active);
        this.introduceLabel.string = data.introduce;
        this.propertyNode.active = data.propertyTips ? true : false;
        this.propertyLabel.string = data.propertyTips ? data.propertyTips : '';
        this.propertyAnim.node.width = this.propertyNode.width;
        if (this.propertyNode.active) {
            this.propertyAnim.play();
        }
        this.keyNode.active = data.taskType === TaskType.TREASUREBOX;
        this.introduceTextNode.active = !this.keyNode.active;
        if (this.keyNode.active) {
            this.introduceNode.active = true;
        }

        this.taskInfoNode.active = data.getWay === 1;
        if (this.taskInfoNode.active) {
            var process = PlayerData.instance.getTaskProcess(data.taskType);
            var str = process < data.taskParam ? process : data.taskParam;
            this.taskStartLabel.string = '(';
            this.taskProgressLabel.string = str ? str : 0;
            this.taskFinalLabel.string = '/' + data.taskParam + ')';

            if (data.taskType === TaskType.RANK || data.taskType === TaskType.DUANWU || data.taskType === TaskType.TREASUREBOX) {
                this.taskStartLabel.string = '';
                this.taskProgressLabel.string = '';
                this.taskFinalLabel.string = '';
            }
            this.watchAdverLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(20), str, data.taskParam)
        }


        this.suitNode.active = data.suit;
        if (data.suit) {
            var suitData = ConfigData.instance.getSuitData(data.suit);
            var heroData = ConfigData.instance.getHeroSkinById(suitData.heroSkin);
            var knifeData = data;
            var isOwnHeroSkin = PlayerData.instance.isOwnHeroSkin(suitData.heroSkin);
            var isOwnKnifeSkin = PlayerData.instance.isOwnKnifeSkin(suitData.knifeSkin);
            var equipHero = PlayerData.instance.isCurEquipHeroSkin(heroData.id);
            var equipKnife = PlayerData.instance.isCurEquipKnifeSkin(knifeData.id);

            this.suitNameLabel.string = suitData.name;
            var process = 0;
            if (isOwnHeroSkin) process++;
            if (isOwnKnifeSkin) process++;
            this.suiProcessLabel.string = '(' + process + '/2)';
            this.suitHeroNameLabel.string = heroData.name;
            this.suitKnifeNameLabel.string = knifeData.name;
            this.suitSkillLabel.string = suitData.skillTips;
            for (let i = 0; i < this.suitIconNode.children.length; i++) {
                if (this.suitIconNode.children[i]) {
                    this.suitIconNode.children[i].active = (i + 1) == data.suit;
                }
            }


            this.suitHeroFlag.active = equipHero;
            this.suitKnifeFlag.active = equipKnife;
            this.suitHeroFalseFlag.active = !equipHero;
            this.suitKnifeFalseFlag.active = !equipKnife;


            this.suitActiveIcon.active = isOwnHeroSkin && isOwnKnifeSkin && equipHero && equipKnife;
            this.suitCloseIcon.active = !(isOwnHeroSkin && isOwnKnifeSkin && equipHero && equipKnife);

            if (this.suitActiveIcon.active && !isInit) {
                this.world.uiMgr.showActiveSuitEffect();
            }
        }
    },

    //累计看广告按钮
    onWathAdverBtnClick: function () {
        var self = this;
        // 关闭广告时回调
        var closeFunc = function (success) {
            if (self.lastCheckItem && success) {
                var item = self.lastCheckItem;
                self.world.taskMgr.refreshTaskInHome();
                self.refresh();
                self.onItemClick(null, item);
                // self.world.uiMgr.showTips('累计观看广告次数+1')
            }
        }
        // 打开广告失败时回调,失败回调
        var errFunc = function () {
            self.world.uiMgr.showTips(4)
        }
        AdvertMgr.instance.showAdver(AdverType.WatchAdver, closeFunc, errFunc);
    },

    onBtnClose() {
        this.world.uiMgr.closePanelShop(true);
    },

    close: function () {
        if (this.lastEquipItem) this.lastEquipItem.setEquip(false);
        if (this.lastCheckItem) this.lastCheckItem.setCheck(false);
        if (this.closeCallcack) this.closeCallcack();
        this.world.onEquipKnifeSkin(PlayerData.instance.knifeSkin, true);
        PlayerData.instance.clearNeedCheckTaskIds();
        this._pageClickHistory = [];
        this._itemClickHistory = {};
    },

    setCloseCallback: function (callback) {
        this.closeCallcack = callback;
    },

    update: function (dt) {
        if (this.propertyAnim.node.width !== this.propertyNode.width + 20) {
            this.propertyAnim.node.width = this.propertyNode.width + 20;
        }
    }
});