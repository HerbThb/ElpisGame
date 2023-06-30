const UIUtil = require('UIUtil');
const Tools = require('Tools');
const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');
cc.Class({
    extends: cc.Component,

    properties: {


        iconSprite: cc.Sprite,
        nameLabel: cc.Label,
        goldRateLabel: cc.Label,

        achieveNode: cc.Node,
        keepNode: cc.Node,


        kingNode: cc.Node,
        kingLabel: cc.Label,

        unlockRootNode: cc.Node,

        unlockBuffNode: cc.Node,
        unlockBuffLabel: cc.Label,
        unlockBuffIcon: cc.Node,

        unlockMapNode: cc.Node,
        unlockMapLabel: cc.Label,
        unlockMapIcon: cc.Node,

        unlockSpecialNode: cc.Node,
        unlockSpecialLabel: cc.Label,
        unlockSpecialIcon: cc.Node,

        unlockBoxNode: cc.Node,
        unlockBoxLabel: cc.Label,
        unlockBoxIcon: cc.Node,

        unlockWaitNode: cc.Node,

        rankStarNode: cc.Node,
        rankNoStarNode: cc.Node,
    },



    init: function (data, isAchieve, isKeep) {
        this.data = data;
        this.isKeep = isKeep;
        var str = data.name;
        this.nameLabel.string = str.replace(/[0-9]/ig, '');
        this.goldRateLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(12), Math.ceil((data.goldMultiRate * 100 + 100)));
        UIUtil.loadResSprite(this.iconSprite, data.url);



        this.achieveNode.active = isAchieve;
        this.keepNode.active = isKeep;



        var isKing = data.levelUpStar === 0;
        this.kingNode.active = isKing ? true : false;
        var star = PlayerData.instance.rankStar - data.star;
        star = star < 0 ? 0 : star;
        this.kingLabel.string = 'x' + star;

        if (!isKing) {
            this.refreshRankStar();
        }

    },


    refreshUnlock(data) {
        this.unlockBuffNode.active = false;
        if (data.unlockBuff || data.unlockBuff === 0) {
            this.unlockBuffNode.active = true;
            this.unlockBuffLabel.string = data.unlockTips;
            var unlockBuffIcons = this.unlockBuffIcon.children;
            unlockBuffIcons[data.unlockBuff].active = true;
        }

        this.unlockMapNode.active = false;
        if (data.unlockMap || data.unlockMap === 0) {
            this.unlockMapNode.active = true;
            this.unlockMapLabel.string = data.unlockMapTips;
            var unlockMapIcons = this.unlockMapIcon.children;
            unlockMapIcons[data.unlockMap].active = true;
        }

        this.unlockSpecialNode.active = false;
        if (data.unlockSpecial || data.unlockSpecial === 0) {
            this.unlockSpecialNode.active = true;
            this.unlockSpecialLabel.string = data.unlockSpecialTips;
            var unlockSpecialIcons = this.unlockSpecialIcon.children;
            unlockSpecialIcons[data.unlockSpecial].active = true;
        }

        this.unlockBoxNode.active = false;
        if (data.unlockBox || data.unlockBox === 0) {
            this.unlockBoxNode.active = true;
            this.unlockBoxLabel.string = data.unlockBoxTips;
            var unlockBoxIcons = this.unlockBoxIcon.children;
            unlockBoxIcons[data.unlockBox].active = true;
        }

        this.unlockWaitNode.active = data.unlockWait;

    },
    // update (dt) {},
    refreshRankStar() {
        var curStar = PlayerData.instance.rankStar;
        var rankData = this.data;
        var stars = this.rankStarNode.children;
        var noStars = this.rankNoStarNode.children;
        var interval = 60 / rankData.levelUpStar + 5;
        for (let i = 0; i < stars.length; i++) {
            var isGet = curStar > rankData.star + i;
            var isShow = i < rankData.levelUpStar;
            if (stars[i]) {
                stars[i].opacity = isGet && isShow ? 255 : 0;
                if (rankData.levelUpStar === 1) {
                    stars[i].x = 0;
                    stars[i].y = 0;
                } else {
                    stars[i].x = i * interval * 2 - interval * (rankData.levelUpStar - 1);
                    if (stars[i].x === 0) {
                        stars[i].y = 0;
                    } else {
                        stars[i].y += (Math.abs(stars[i].x)) / 2 - 7.5;
                    }
                }
            }
            // console.log(stars[i].x, stars[i].y)
            if (noStars[i]) {
                noStars[i].opacity = isShow ? 255 : 0;
                noStars[i].x = stars[i].x;
                noStars[i].y = stars[i].y;
            }
        }
    },
});