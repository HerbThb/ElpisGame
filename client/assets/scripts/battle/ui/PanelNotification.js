const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const Tools = require('Tools');


cc.Class({
    extends: cc.Component,

    properties: {
        countDownLabel: cc.Label,
    },
    onLoad() {
        this.endTime = Tools.getTimeStampByTimeStr(ConfigData.instance.holidayDatas.startDate);
    },

    update(dt) {
        this.countDownLabel.string = Tools.getRemainTimeStr(PlayerData.instance.getCurTime(), this.endTime);

        if (!Tools.isBeforeOtherTime(ConfigData.instance.holidayDatas.startDate, PlayerData.instance.getCurTime())) {
            this.close();
        }
    },
    close() {
        this.node.active = false;
    }
});