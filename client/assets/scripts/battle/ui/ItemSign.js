const ListItemBase = require('ListItemBase')
const Tools = require('Tools');
const ConfigData = require('ConfigData');
const days = ['1', '2', '3', '4', '5', '6', '7']
cc.Class({
    extends: ListItemBase,

    properties: {

        iconGold: cc.Node,
        iconKnife: cc.Node,
        iconHero: cc.Node,
        iconFinalKnife: cc.Node,
        iconFinalGold: cc.Node,

        dayLabel: cc.Label,
        dayBgNode: cc.Node,
        countLabel: cc.Label,
        checkNode: cc.Node,
        getNode: cc.Node,
        bgNode: cc.Node,
        getBgNode: cc.Node,
    },

    init(data, item, index) {
        this.data = data;
        this.item = item;
        this.index = index;
        // this.dayLabel.string = 'Day' + days[index];
        this.dayLabel.string = Tools.getStringByFormat(ConfigData.instance.getUITipStr(10), days[index]);
        if (item.type === 0) {
            if (index === 6) {
                this.iconFinalGold.active = true;
                this.getBgNode.width = 690;
                this.getBgNode.height = 230;
                this.checkNode.width = 690;
                this.bgNode.width = 690;
                // this.dayBgNode.width = 200;
            } else {
                this.iconGold.active = true;
            }
            this.countLabel.string = item.num;
        } else {
            if (index === 1) {
                this.iconKnife.active = true;
            } else if (index === 2) {
                this.iconHero.active = true;
            } else if (index === 6) {
                this.iconFinalKnife.active = true;
                this.getBgNode.width = 690;
                this.getBgNode.height = 230;
                this.checkNode.width = 690;
                this.bgNode.width = 690;
                // this.dayBgNode.width = 200;
            }
            this.countLabel.string = '';
        }
        // UIUtil.loadResSprite(iconSprite, data.url);
    },

    refresh(isGet, isCheck) {
        this.getNode.active = isGet;
        this.checkNode.active = isCheck;
    },
    // update (dt) {},
});