/**
 * @fileoverview KillNotice
 * @author meifan@gameley.cn (梅凡)
 */

const TEAM_COLOR = require('Types').TEAM_COLOR;

const KillNotice = cc.Class({
    extends: cc.Component,

    properties: {
        _time: -1,
        notices: [cc.Node],
        _curIndex: -2,
    },

    init: function() {
    },

    cleanUp: function () {
        this.closeKillNotice();
    },

    update: function (dt) {
        if(this._time > 0) {
            this._time -= dt;
            if (this._time < 0) {
                this.closeKillNotice();
            }
        }
    },

    showKillNotice: function (killNum) {
        if(this._curIndex >= 0 && this._curIndex < this.notices.length) {
            this.notices[this._curIndex].active = false;
        }

        this._curIndex = killNum - 2;  // 从双杀开始
        this._curIndex = this._curIndex >= this.notices.length ? this.notices.length - 1 : this._curIndex;
        if(this._curIndex >= 0 && this._curIndex < this.notices.length) {
            this._time = 2;
            this.notices[this._curIndex].active = true;
        }
    },

    closeKillNotice: function () {
        if(this.notices[this._curIndex]) {
            this.notices[this._curIndex].active = false;
        }
    }

});