const NoticeType = require('Types').NoticeType;

cc.Class({
    extends: cc.Component,

    properties: {
        notice: [cc.Node],
        isOpen: false,
    },


    onLoad: function () {
        this.noticeArr = [0, 1, 2, 3];
        this.index = 0;
        this.time = 999;
        this.timeLimit = 5;
        this.timeInterval = 3;
        this.isOpen = false;
    },

    update: function (dt) {
        this.time += dt;

        if (this.time >= this.timeLimit && this.isIn) {
            this.isIn = false;
            var actionOut = cc.fadeOut(1);
            if (this.curType > 8) {
                actionOut = cc.fadeOut(0);
            }
            this.isOpen = false;
            if (this.curNotice) this.curNotice.runAction(actionOut);
        }

        if (this.time >= (this.timeInterval + this.timeLimit)) {
            this.time = 0;
            this.isIn = true;
            this.curType = this.noticeArr[this.index];
            this.curNotice = this.notice[this.curType];

            if (this.noticeArr[this.index] > 3) {
                this.noticeArr.splice(this.index, 1);
            } else {
                this.index++;
            }
            if (this.index >= this.noticeArr.length) this.index = 0;
            var actionIn = cc.fadeIn(1);
            if (this.curType > 8) {
                actionIn = cc.fadeIn(0);
            }

            this.isOpen = true;
            this.curNotice.runAction(actionIn);
        }

    },

    addSpecialNotice: function (type) {
        // console.log(this.noticeArr)
        this.noticeArr.splice(this.index, 0, type);
        // console.log(this.noticeArr)
    },

    showImportantNotice: function (type) {
        this.addSpecialNotice(type);
        this.time += 9999;
        if (this.curNotice) this.curNotice.opacity = 0;
    },

    close: function () {
        if (this.curNotice) this.curNotice.opacity = 0;
        this.isOpen = false;
    }
    // update (dt) {},
});