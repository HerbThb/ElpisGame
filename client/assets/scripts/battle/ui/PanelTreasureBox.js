const UIUtil = require('UIUtil');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const GameData = require('GameData');
const ShareType = require('Types').ShareType;
const AdvertMgr = require('AdvertMgr');
const AdverType = require('Types').AdverType;
const Tools = require('Tools');
const BagItem = require('BagItem');
const ItemType = require('Types').ItemType;
const StageType = require('Types').StageType;

cc.Class({
    extends: cc.Component,

    properties: {

        bgNode: cc.Node,
        getKey: cc.Node,


        keyNode: cc.Node,
        keyPanel: cc.Node,
        keyParent: cc.Node,

        boxNode: cc.Node,
        boxPrefab: cc.Prefab,
        boxParent: cc.Node,
        otherKeyParent: cc.Node,
        bestRewardAnimation: cc.Animation,
        bestRewardSprite: cc.Sprite,
        bestRewardDiamond: cc.Node,

        adverBtn: cc.Node,
        closeBtn: cc.Node,
        adverBtnAnim: cc.Animation,
    },

    init(world) {
        this.world = world;
        this.keyCount = 3;
        this.turn = this.refreshTurn()


        var data = ConfigData.instance.getTreasureBigDataByTurn(this.turn);
        this.bestReward = data.reward;
        this.getTimes = data.times;
        PlayerData.instance.clearKeyCount();

        this.hasGetBest = false;
        this.unlockBoxCount = 0;
        this.keyPanel.active = false;
        this.boxNode.active = true;
        this.closeBtn.active = false;
        this.getKey.active = true;
        this.getKey.rotation = 0;
        this.getKey.scale = 1;
        this.getKey.position = cc.v2(0, 0)

        var keyPool = this.keyParent.children;
        for (let i = 0; i < keyPool.length; i++) {
            keyPool[i].active = i + 1 < this.keyCount;
        }



        this.initKey();
        this.initBox();
        var item = BagItem.createItemWithString(this.bestReward);
        this.bestRewardDiamond.active = item.type === ItemType.ZONG_ZI;
        this.bestRewardSprite.node.active = !this.bestRewardDiamond.active;
        if (this.bestRewardSprite.node.active) {
            UIUtil.loadResSprite(this.bestRewardSprite, item.itemData.url);
        }
        this.playRewardAnim();
        // this.bestReward.node.runAction(cc.sequence(cc.sca))

        this.bgNode.height = GameData.instance.screenHeight;
        this.boxNode.scale = GameData.instance.isPad() ? 0.8 : 1;
    },

    playRewardAnim() {
        this.bestRewardAnimation.play();
    },

    refreshTurn() {
        //如果已拥有某些皮肤则跳过
        var turn = PlayerData.instance.treasureTurn;
        var datas = ConfigData.instance.treasureBigData;
        for (let i = turn; i < datas.length; i++) {
            var item = BagItem.createItemWithString(datas[i].reward);
            var needBreak = false;
            switch (item.type) {
                case ItemType.HERO_SKIN:
                    if (PlayerData.instance.isOwnHeroSkin(item.id)) {
                        PlayerData.instance.updateTreasureTurn();
                    }
                    break;
                case ItemType.KNIFE_SKIN:
                    if (PlayerData.instance.isOwnKnifeSkin(item.id)) {
                        PlayerData.instance.updateTreasureTurn();
                    }
                    break;
                default:
                    needBreak = true;
                    break;
            }
            if (needBreak) break;
        }
        return PlayerData.instance.treasureTurn;
    },

    initKey(anim) {

        for (let i = 0; i < this.otherKeyParent.children.length; i++) {
            if (anim) {
                this.stopUse = true;
                if (i < this.keyCount) {
                    let node = this.otherKeyParent.children[i]

                    // node.opacity = 0;
                    node.scale = 1.8;
                    setTimeout(() => {
                        node.active = true;
                        node.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackInOut(3.0)));
                        // node.runAction(cc.fadeIn(1.0));
                    }, i * 200);

                }
                setTimeout(() => {
                    this.stopUse = false;
                }, 900)
            } else {
                this.otherKeyParent.children[i].active = i < this.keyCount;
            }

        }
        this.adverBtn.active = false;
        this.keyNode.active = true;
        this.closeBtn.active = false;
    },

    initBox() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                var box = this.boxParent.children[i * 3 + j];
                if (!box) {
                    var box = cc.instantiate(this.boxPrefab);
                    box.parent = this.boxParent;
                    box.position = cc.v2(i * 220, j * -220);
                }
                var boxComp = box.getComponent('ItemTreasureBox');
                boxComp.init()
                boxComp.setOnItemClick(this, boxComp)
            }
        }
    },

    onItemClick(event, comp) {
        if (this.stopUse) return;
        if (this.keyCount > 0) {
            if (!comp.hasGet) {
                this.useKey(comp);
            }
        } else {
            this.adverBtnAnim.play('ani-btn-dance')
        }
    },

    useKey(comp) {
        // this.isUse = true;
        let index = this.keyCount - 1
        var key = this.otherKeyParent.children[index]
        this.keyCount--;
        comp.hasGet = true;
        let initPos = cc.v2(key.x, key.y);
        key.runAction(
            cc.sequence(
                cc.moveTo(0.5, comp.node.position),
                cc.callFunc(() => {
                    key.active = false;
                    key.position = initPos;
                    var reward = this.getReward();
                    var item = BagItem.createItemWithString(reward);
                    comp.getReward(item);
                    setTimeout(() => {
                        this.world.getReward(item);
                    }, 800);
                    if (index === 0) {
                        if (this.unlockBoxCount === 9) {
                            setTimeout(() => {
                                this.close()
                            }, 2000)
                        } else {
                            setTimeout(() => {
                                this.showAdverBtn();
                            }, 1000)
                        }
                    }
                    // this.isUse = false;
                })
            )
        )
    },

    showAdverBtn: function () {
        this.keyNode.active = false;
        this.adverBtn.active = true;
        setTimeout(() => {
            this.closeBtn.active = true;
        }, 1000);

        this.adverBtnAnim.play('ani-btn-active');

        var func = (hasAdver) => {
            if (hasAdver) {
                AdvertMgr.instance.openAdver(AdverType.TreasurBox);
            }
        }
        AdvertMgr.instance.loadAdver(AdverType.TreasurBox, func);
    },
    //
    getReward() {
        this.unlockBoxCount++
        if (this.hasGetBest) return this.getSmallReward();
        if (this.getTimes) {
            if (this.isInTimes()) {
                var percent = (this.unlockBoxCount - (this.getTimes - 1) * 3) === 3 ? 1 : 0
                if (Math.random() < percent) {
                    return this.getBigReward();
                } else {
                    return this.getSmallReward();
                }
            } else {
                return this.getSmallReward();
            }
        } else {
            var percent = this.unlockBoxCount / 9;
            if (Math.random() < percent) {
                return this.getBigReward();
            } else {
                return this.getSmallReward();
            }
        }
    },


    getSmallReward() {
        var data = Tools.getRandomItemByWeight(ConfigData.instance.treasureSmallData)
        var rate = data.type === ItemType.ZONG_ZI ? 1 : (1 + PlayerData.instance.rankData.goldMultiRate);
        return data.type + ',0,' + Math.ceil(Tools.getRandomInt(data.range[0], data.range[1]) * rate);
    },

    getBigReward() {
        this.hasGetBest = true;
        PlayerData.instance.updateTreasureTurn();
        return this.bestReward;
    },

    isInTimes() {
        return this.unlockBoxCount > (this.getTimes - 1) * 3 && this.unlockBoxCount <= this.getTimes * 3
    },


    onAdverBtnClick() {
        // 关闭广告时回调
        var closeFunc = (success) => {
            if (success) {
                this.keyCount = 3;
                this.initKey(true);
            }
        }
        //点击获取特殊武器按钮
        AdvertMgr.instance.fireBaseEvent("click_adv_btn", "position_id", ConfigData.instance.getAdvertUnitId(AdverType.TreasurBox));

        AdvertMgr.instance.showAdver(AdverType.TreasurBox, closeFunc);

    },

    playKeyAnim: function () {
        var pos = cc.v2(this.keyCount * 100 - 200, 110);
        this.getKey.runAction(cc.sequence(cc.scaleTo(0.5, 2), cc.callFunc(() => {
            this.keyPanel.active = true;
        }), cc.spawn(cc.moveTo(0.5, pos), cc.scaleTo(0.5, 0.5), cc.rotateTo(0.5, -30)), cc.callFunc(() => {
            this.keyParent.children[this.keyCount - 1].active = true;
            this.getKey.active = false;
        })))
    },


    okBtnClick() {
        if (this.keyCount === 3) {
            this.boxNode.active = true;
            PlayerData.instance.clearKeyCount();
        } else {
            this.close();
        }
    },

    close() {
        this.node.active = false;
        this.world.uiMgr.openPanelKeyCount(true);
    },

    update(dt) {

    },

});