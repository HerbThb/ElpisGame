const BuffState = require('Types').BuffState;
const ConfigData = require('ConfigData');
cc.Class({
    extends: cc.Component,

    properties: {
        buffRemainTimes: [],
    },


    onLoad: function () {
        // this.node.on('die', this.die, this);
        this.node.on('updateBuffState', this.updateBuffState, this);
    },

    die: function () {
        for (let i = 0; i < this.buffRemainTimes.length; i++) {
            if (this.buffRemainTimes[i]) {
                var data = ConfigData.instance.getBuffDataById(i);
                this.node.emit('onBuffChange', data, false)
                this.buffRemainTimes[i] = 0;
            }
        }
    },

    updateBuffState: function (buffState, customTime = -1) {
        var data = ConfigData.instance.getBuffDataById(buffState);
        // var buffTime = this.buffRemainTimes[buffState] ? this.buffRemainTimes[buffState] : 0;
        if (!this.buffRemainTimes[buffState]) {
            this.node.emit('onBuffChange', data, true);
        }
        this.buffRemainTimes[buffState] = customTime > 0 ? customTime : data.keepTime;
        // this.buffCount[buffState]++;
        // setTimeout(() => {
        //     this.buffCount[buffState]--;
        //     if (this.buffCount[buffState] === 0) {
        //         //通知回归
        //     }
        // }, this.buffKeepTimes)

        // switch (buffState) {
        //     case BuffState.BIG:

        //         break;
        // }

    },

    updateGameLogic(dt) {
        for (let i = 0; i < this.buffRemainTimes.length; i++) {
            if (this.buffRemainTimes[i]) {
                this.buffRemainTimes[i] -= dt;
                if (this.buffRemainTimes[i] <= 0) {
                    this.buffRemainTimes[i] = 0;
                    var data = ConfigData.instance.getBuffDataById(i);
                    this.node.emit('onBuffChange', data, false)
                }
            }
        }
    },
});