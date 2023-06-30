/**
 * @fileoverview PanelReviveNotice
 * @author meifan@gameley.cn (梅凡)
 */
const UIUtil = require('UIUtil');

const PanelReviveNotice = cc.Class({
    extends: cc.Component,

    properties: {
        head: cc.Sprite,
        nick: cc.Label,
        isOpen: false,

        reviveLabel: cc.Label,
    },

    onLoad() {
        this.reviveLabel.string = 'revive';
    },

    update: function (dt) {
        if (this._time > 0) {
            this._time -= dt;
            if (this._time < 0) {
                this.close();
            }
        }
    },

    showReviveNotice: function (hero) {
        this.node.active = true;
        this.isOpen = true;

        UIUtil.loadResPortrait(this.head, hero);
        this.nick.string = hero.name;

        this._time = 2.0;
    },

    close: function () {
        this.node.active = false;
        this.isOpen = false;
    }

});