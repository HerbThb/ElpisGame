const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const Tools = require('Tools');
const AdvertMgr = require('AdvertMgr');
cc.Class({
    extends: cc.Component,

    properties: {

        itemRankPrefab: cc.Prefab,
        itemMiniRankPrefab: cc.Prefab,

        itemRankParent: cc.Node,
        itemMiniRankParent: cc.Node,

        greenBar: cc.Node,
        greenArrow: cc.Node,

        blackBar: cc.Node,
        blackArrow: cc.Node,

        bubbleNode: cc.Node,
        bubbleStar: cc.Node,
        bubbleLabel: cc.Label,

        moveNode: cc.Node,

        finalWidth: 0,
        widthPer: 1,
        percent: 0,
        index: 0,
    },

    init() {

        this.isInit = true;
        this.maxInterval = 600;
        this.minInterval = 320;
        this.rankDatas = ConfigData.instance.getBigRankDatas();

        for (let i = 0; i < this.rankDatas.length; i++) {
            var data = this.rankDatas[i];
            var nextData = this.rankDatas[i + 1];

            //小图标
            var rankMiniNode = cc.instantiate(this.itemMiniRankPrefab);
            rankMiniNode.parent = this.itemMiniRankParent;
            rankMiniNode.x = i * this.minInterval;
            // rankMiniNode.y = 0;
            var rankMiniComp = rankMiniNode.getComponent('ItemRankMini');
            rankMiniComp.init(data);


            //大图标
            var rankNode = cc.instantiate(this.itemRankPrefab);
            rankNode.parent = this.itemRankParent;
            rankNode.x = i * this.maxInterval;
            // rankNode.y = 0;

            var rankComp = rankNode.getComponent('ItemRank');

            var isAchieve = nextData && PlayerData.instance.rankStar >= nextData.star;
            var isKeep = (PlayerData.instance.rankStar >= (data.star)) && !isAchieve;
            rankComp.refreshUnlock(data);

            if (isKeep) {
                this.index = i;
                this.keepIndex = i;
                if (data.levelUpStar) {
                    this.percent = (PlayerData.instance.rankStar - data.star) / (nextData.star - data.star);
                } else {
                    this.percent = 0;
                }
                this.move();

                data = PlayerData.instance.rankData;
            }
            rankComp.init(data, isAchieve, isKeep);


        }

        // this.itemRankParent.x = -index * this.maxInterval;
        // this.itemMiniRankParent.x = -index * this.minInterval;
    },


    onLeft() {
        if (this.index === 0) return
        this.index--;
        this.move();
    },


    onRight() {
        if (this.index === (this.rankDatas.length - 1)) return
        this.index++;
        this.move();
    },

    refresh() {
        if (this.index === this.keepIndex) return;
        this.index = this.keepIndex;
        this.move();
    },

    move() {

        this.moveNode.active = false;
        this.itemRankParent.stopAllActions();
        this.itemMiniRankParent.stopAllActions();
        var action = cc.moveTo(0.4, cc.v2(-this.index * this.maxInterval, 50)).easing(cc.easeBackOut(3));
        this.itemRankParent.runAction(action);
        var action2 = cc.moveTo(0.5, cc.v2(-this.index * this.minInterval, -197)).easing(cc.easeIn(3));;
        this.itemMiniRankParent.runAction(action2);
        setTimeout(() => {
            this.moveNode.active = true;
        }, 500);
        // this.lerp = 0;
        // this.startWidth = this.greenBar.width;
        this.showBubble = true;
        if (this.index === this.keepIndex) {
            this.finalWidth = 360 + this.percent * 360;
            this.greenArrow.active = true;
        } else if (this.index === (this.keepIndex + 1)) {
            this.finalWidth = this.percent * 360;
            this.greenArrow.active = false;
        } else if (this.index < this.keepIndex) {
            this.finalWidth = 720;
            this.greenArrow.active = true;
            this.showBubble = false;
        } else {
            this.finalWidth = 0;
            this.greenArrow.active = false;
            this.showBubble = false;
        }



        this.blackBar.width = 720;
        if (!this.moveNode.children[0].active) this.moveNode.children[0].active = true;
        if (!this.moveNode.children[1].active) this.moveNode.children[1].active = true;
        if (this.index === 0) {
            this.blackArrow.active = false;
            this.greenArrow.active = false;
            this.moveNode.children[0].active = false;
            if (this.isInit) {
                this.greenBar.x = 360;
                this.blackBar.x = 360;
                this.isInit = false;
            }
            this.finalWidth -= 360;
        } else if (this.index === (this.rankDatas.length - 1)) {
            this.blackBar.width = 360;
            this.blackArrow.active = false;
            this.greenArrow.active = false;
            this.moveNode.children[1].active = false;
        }
        this.widthPer = (this.finalWidth - this.greenBar.width) > 0 ? 1 : -1;


        this.refeshBubble();
    },

    refeshBubble: function () {

        this.bubbleLabel.string = PlayerData.instance.rankStar;

        this.bubbleNode.scaleY = 1;
        this.bubbleStar.scaleY = 0.4;
        this.bubbleLabel.node.scaleY = 1;

        this.bubbleNode.scaleX = 1;
        this.bubbleStar.scaleX = 0.4;
        this.bubbleLabel.node.scaleX = 1;


        var width = this.finalWidth;
        if (width < 70) {
            this.bubbleNode.scaleY = -1;
            this.bubbleStar.scaleY = -0.4;
            this.bubbleLabel.node.scaleY = -1;
        } else if (width > 245 && width < 360) {
            this.bubbleNode.scaleX = -1;
            this.bubbleStar.scaleX = -0.4;
            this.bubbleLabel.node.scaleX = -1;
            if (width >= 330) {
                width = 330;
            }
        } else if (width >= 360 && width < 390) {
            width = 390;
        } else if (width > 580 && width < 660) {
            this.bubbleNode.scaleX = -1;
            this.bubbleStar.scaleX = -0.4;
            this.bubbleLabel.node.scaleX = -1;
        } else if (width >= 660) {
            this.bubbleNode.scaleY = -1;
            this.bubbleStar.scaleY = -0.4;
            this.bubbleLabel.node.scaleY = -1;

            this.bubbleNode.scaleX = -1;
            this.bubbleStar.scaleX = -0.4;
            this.bubbleLabel.node.scaleX = -1;
        }

        this.bubbleNode.active = this.showBubble;



    },

    onClose() {
        this.node.active = false;
        // AdvertMgr.instance.showBanner();
    },

    update(dt) {

        if (this.startMove > 0) {
            this.startMove -= dt;
            if (this.startMove <= 0) {
                this.startMove = 0;
                this.move();
            }
        }


        if (this.greenBar.width !== this.finalWidth) {
            this.greenBar.width += 720 * this.widthPer * dt;
            this.bubbleNode.x = this.greenBar.width;

            if (this.widthPer > 0) {
                if (this.greenBar.width > this.finalWidth) {
                    this.greenBar.width = this.finalWidth;
                    this.bubbleNode.x = this.finalWidth;
                    this.fixBubble()
                }
            } else {
                if (this.greenBar.width < this.finalWidth) {
                    this.greenBar.width = this.finalWidth;
                    this.bubbleNode.x = this.finalWidth;
                    this.fixBubble()
                }
            }

        }
        // console.log(this.index)


        if (this.index === 0) {
            if (this.blackBar.x !== 360) {
                this.blackBar.x += dt * 720;
                if (this.blackBar.x >= 360) {
                    this.blackBar.x = 360;
                }
            }

            if (this.greenBar.x !== 360) {
                this.greenBar.x += dt * 720;
                if (this.greenBar.x >= 360) {
                    this.greenBar.x = 360;
                }
            }
        } else {
            if (this.blackBar.x !== 0) {
                this.blackBar.x -= dt * 720;
                if (this.blackBar.x <= 0) {
                    this.blackBar.x = 0;
                }
            }

            if (this.greenBar.x !== 0) {
                this.greenBar.x -= dt * 720;
                if (this.greenBar.x <= 0) {
                    this.greenBar.x = 0;
                }
            }

        }


        // if (this.index === 0) {
        //     if (this.greenBar.x !== 360) {
        //         this.greenBar.x += 720 * dt;
        //         this.blackBar.x += 720 * dt;
        //         this.greenBar.width -= 720 * dt;
        //         if (this.greenBar.x >= 360) {
        //             this.greenBar.width += (this.greenBar.x - 360);
        //             this.finalWidth -= 360;
        //             this.greenBar.x = 360;
        //             this.blackBar.x = 360;
        //         }
        //     }
        // } else {
        //     if (this.greenBar.x !== 0) {
        //         this.greenBar.x -= 720 * dt;
        //         if (this.greenBar.x <= 0) {
        //             this.greenBar.x = 0;
        //         }
        //     }
        //     if (this.blackBar.x !== 0) {
        //         this.blackBar.x -= 720 * dt;
        //         if (this.blackBar.x <= 0) {
        //             this.blackBar.x = 0;
        //         }
        //     }
        // }
    },

    fixBubble() {
        if (this.finalWidth >= 360 && this.finalWidth < 390) {
            this.bubbleNode.x = 390;
        } else if (this.finalWidth >= 330 && this.finalWidthh < 360) {
            this.bubbleNode.x = 330;
        }
    },
    // update (dt) {},
});