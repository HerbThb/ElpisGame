const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const ShareMgr = require('ShareMgr');
const ShareType = require('Types').ShareType;
const TaskType = require('Types').TaskType;
const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');
cc.Class({
    extends: cc.Component,

    properties: {
        topNode: cc.Node,
        itemScrollView: cc.ScrollView,
        itemScrollViewBar: cc.Node,
        itemScrollViewWindow: cc.Node,
        content: cc.Node,
        itemKnifeSkin: cc.Prefab,

        buyNode: cc.Node,
        unLockNode: cc.Node,
        nameLabel: cc.Label,
        introduceLabel: cc.Label,
        initCountLabel: cc.Label,
        countLabel: cc.Label,
        propertyNode: cc.Node,
        propertyLabel: cc.Label,

        taskStartLabel: cc.Label,
        taskProgressLabel: cc.Label,
        taskFinalLabel: cc.Label,
        taskMoreLabel: cc.Label,

        taskInfoNode: cc.Node,
        watchAdverBtnNode: cc.Node,
        downNode: cc.Node,

        watchAdverLabel: cc.Label,
        buyLangLabel: cc.Label,
        goLangLabel: cc.Label,

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
    },

    init: function (world) {

        if (GameData.instance.isPad()) {
            this.topNode.y = -200;
            this.itemScrollView.node.height = 200;
            this.itemScrollViewWindow.height = 200;
            this.itemScrollViewBar.height = 200;
        } else {
            this.topNode.y = 0;
            this.itemScrollView.node.height = 400;
            this.itemScrollViewWindow.height = 400;
            this.itemScrollViewBar.height = 400;
        }


        this.world = world;
        this.localPlayer = world.localPlayer;
        var knifeSkinDatas = ConfigData.instance.knifeSkinDatas.slice();


        var curTime = PlayerData.instance.getCurTime();
        var ownKnifeSkins = PlayerData.instance.ownKnifeSkins;
        Tools.filterDataByTime(knifeSkinDatas, ownKnifeSkins, curTime, GameData.instance, ConfigData.instance.clientData.hideSpecialSkin, PlatformMgr.isIOS(), PlatformMgr.isApp());


        knifeSkinDatas.sort((a, b) => {
            if (a.newDate && Tools.isBeforeOtherTime(a.newDate, curTime)) {
                return -1;
            } else if (b.newDate && Tools.isBeforeOtherTime(b.newDate, curTime)) {
                return 1;
            } else {
                return a.sort - b.sort;
            }
        })

        // this.myScrollView = Tools.getOrAddComponent(this.itemScrollView.node, 'MyScrollView');
        // this._itemCells = this.myScrollView.init(knifeSkinDatas, (line) => {
        //     console.log(line);
        // }, {
        //     target: this, //点击时触发的脚本
        //     itemPrefab: this.itemKnifeSkin,
        //     className: 'ItemKnifeSkin',
        //     startX: -235,
        //     gapX: 15,
        //     gapY: 10,
        //     perLine: 3,
        // })
        for (let i = 0; i < knifeSkinDatas.length; i++) {
            var data = knifeSkinDatas[i];
            // if (data.showDate&&Tools.isBeforeOtherTime(curTime, data.showDate)) {
            //     i--;
            //     continue;
            // }

            if (!this._itemNodes[i]) {
                let itemNode = cc.instantiate(this.itemKnifeSkin);
                itemNode.parent = this.content;
                itemNode.position = cc.v2(i % 3 * 230 - 235, -78 - Math.floor(i / 3) * 146);
                this._itemNodes[i] = itemNode;
                var itemComp = itemNode.getComponent('ItemKnifeSkin')
                itemComp.init(data);
                this._itemCells[i] = itemComp;
                itemComp.setOnItemClick(this, itemComp);
            } else {
                var itemComp = this._itemNodes[i].getComponent('ItemKnifeSkin')
                itemComp.init(data);
            }

        }
        this.content.height = Math.floor(this._itemCells.length / 3) * 150 + 150;
        // var scrollViewCulling = Tools.getOrAddComponent(this.itemScrollView.node, 'ScrollViewCulling');
        // scrollViewCulling.init(this.itemScrollView, this._itemCells, {
        //     countPerLine: 3,
        // });

        this.refresh();
        this.onScrollView();
    },

    onScrollView: function () {
        // this.myScrollView.onScrollView();
        // return
        //当前滑动所在位置
        var curScrollHeight = this.itemScrollView.getScrollOffset().y;
        if (curScrollHeight < Math.floor((this._itemCells.length - 1) / 3) * 150 - 300) {
            if (!this.downNode.active) this.downNode.active = true;
        } else {
            if (this.downNode.active) this.downNode.active = false;
        };

        var index = Math.floor((curScrollHeight) / 150);
        // console.log(curScrollHeight)
        // console.log(index)
        for (let i = 0; i < this._itemCells.length; i++) {
            var line = Math.floor(i / 3);
            if (line <= index + 3 && line >= index) {
                if (!this._itemNodes[i].active) this._itemNodes[i].active = true;
            } else {
                if (this._itemNodes[i].active) this._itemNodes[i].active = false;
            }
        }
    },


    // refreshItem: function (itemComp) {
    //     var data = itemComp.data;
    //     var isGet = PlayerData.instance.isOwnKnifeSkin(data.id);
    //     var canUnlock = Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId);
    //     var needCheck = Tools.arrContains(PlayerData.instance.needCheckTaskIds, data.taskId);
    //     var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, PlayerData.instance.getCurTime());

    //     var processStr = '';
    //     if (data.getWay === 1) {
    //         if (data.taskType !== TaskType.RANK && data.taskType !== TaskType.DUANWU) {
    //             var process = PlayerData.instance.getTaskProcess(data.taskType);
    //             processStr = process + '/' + data.taskParam;
    //         }
    //     }

    //     itemComp.refresh(isGet, canUnlock, needCheck, isNew, processStr);
    //     // if (isGet) count++;
    //     // if (PlayerData.instance.knifeSkin.id === data.id) {
    //     //     this.onItemClick(null, itemComp, true)
    //     //     itemComp.setCheck(false);
    //     // }
    // },

    refresh: function () {
        var count = 0;
        for (const itemComp of this._itemCells) {
            if (!itemComp) continue;
            var data = itemComp.data;
            var isGet = PlayerData.instance.isOwnKnifeSkin(data.id);
            var canUnlock = Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId);
            var needCheck = Tools.arrContains(PlayerData.instance.needCheckTaskIds, data.taskId);
            var isNew = data.newDate && Tools.isBeforeOtherTime(data.newDate, PlayerData.instance.getCurTime());

            var processStr = '';
            if (data.getWay === 1) {
                if (data.taskType !== TaskType.RANK && data.taskType !== TaskType.DUANWU) {
                    var process = PlayerData.instance.getTaskProcess(data.taskType);
                    processStr = process + '/' + data.taskParam;
                }
            }

            itemComp.refresh(isGet, canUnlock, needCheck, isNew, processStr);
            if (isGet) count++;
            if (PlayerData.instance.knifeSkin.id === data.id) {
                this.onItemClick(null, itemComp, true)
                itemComp.setCheck(false);
            }
        }
        this.countLabel.string = count + '/' + this._itemCells.length;
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

    showShare: function (closeFunc) {
        ShareMgr.share(ShareType.UnlockSkin, closeFunc);
    },

    showAdver: function (closeFunc) {
        var self = this;
        var errFunc = () => {
            this.showShare(closeFunc);
        }
        AdvertMgr.instance.showAdver(AdverType.UnlockSkin, closeFunc, errFunc);
    },

    onItemClick: function (event, customEventData, isInit = false) {
        var itemComp = customEventData;
        var data = itemComp.data;

        // if (data.sort > 6) {
        var index = this._itemCells.indexOf(itemComp);
        this.itemScrollView.scrollToOffset(cc.v2(0, Math.floor(index / 3) * 150 - 150 + (GameData.instance.isPad() ? 150 : 0)), 1);
        // }

        if (this.lastCheckItem) this.lastCheckItem.setCheck(false);
        itemComp.setCheck(true);
        this.lastCheckItem = itemComp;

        this.buyNode.active = false;
        this.unLockNode.active = false;
        this.watchAdverBtnNode.active = false;
        this.jumpNode.active = false;

        this.world.onEquipKnifeSkin(data, itemComp.isGet, false);
        if (itemComp.isGet) {
            if (this.lastEquipItem) this.lastEquipItem.setEquip(false)
            this.lastEquipItem = itemComp;
            itemComp.setEquip(true);
        } else {
            if (data.getWay === 0) {
                this.buyNode.active = true;
            } else if (data.getWay === 1) {
                if (Tools.arrContains(PlayerData.instance.completeTaskIds, data.taskId)) {
                    this.unLockNode.active = true;
                    this.shareIcon.active = data.unlockWay === 1;
                    this.adverIcon.active = data.unlockWay === 2;

                    // if (data.unlockWay === 1) {
                    //     if (GameData.instance.isInReview) {
                    //         this.shareIcon.active = false;
                    //         this.adverIcon.active = true;
                    //     } 
                    // }

                } else if (data.taskType === TaskType.ADVERCOUNT) {
                    this.watchAdverBtnNode.active = true;
                } else if (data.jumpParam) {
                    this.jumpNode.active = true;
                }
            }
        }

        this.nameLabel.string = data.name;
        this.introduceLabel.string = data.introduce;
        this.initCountLabel.string = data.initKnifeCount;
        this.propertyNode.active = data.propertyTips ? true : false;
        this.propertyLabel.string = data.propertyTips ? data.propertyTips : '';

        this.taskInfoNode.active = data.getWay === 1;
        if (this.taskInfoNode.active) {
            var process = PlayerData.instance.getTaskProcess(data.taskType);
            var str = process < data.taskParam ? process : data.taskParam;
            this.taskStartLabel.string = '(';
            this.taskProgressLabel.string = str ? str : 0;
            this.taskFinalLabel.string = '/' + data.taskParam;
            this.taskMoreLabel.string = ')';

            if (data.taskType === TaskType.RANK || data.taskType === TaskType.DUANWU) {
                this.taskStartLabel.string = '';
                this.taskProgressLabel.string = '';
                this.taskFinalLabel.string = '';
                this.taskMoreLabel.string = '';
            }

            this.watchAdverLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(20), str, data.taskParam)
        }
        this.buyLangLabel.string = 'Buy'
        this.goLangLabel.string = 'Go'

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

    close: function () {
        this.lastEquipItem.setEquip(false);
        if (this.lastCheckItem) this.lastCheckItem.setCheck(false);
        if (this.closeCallcack) this.closeCallcack();
        this.world.onEquipKnifeSkin(PlayerData.instance.knifeSkin, true);
        PlayerData.instance.clearNeedCheckTaskIds();
    },

    setCloseCallback: function (callback) {
        this.closeCallcack = callback;
    },
    // update (dt) {},
});