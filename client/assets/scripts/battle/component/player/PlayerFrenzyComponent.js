/**
 * @fileoverview PlayerFrenzyComponent
 * @author meifan@gameley.cn (梅凡)
 */

const FrenzyAddType = require('Types').FrenzyAddType;
const FrenzyAddNums = [1, 1, 300, 1000, 1000, 300];
const BuffState = require('Types').BuffState;
const ConfigData = require('ConfigData');

const PlayerFrenzyComponent = cc.Class({
    extends: cc.Component,

    properties: {
        _count: 0,
        _max: 1000,
        _time: 5,
        _isFrenzy: false,
        _speed: 1.0,
    },


    init: function () {

        var data = ConfigData.instance.getBuffDataById(BuffState.Frenzy);
        this._count = 0;
        this._max = 1000;
        this._time = data.keepTime;
        this._normalSpeed = this._max * 1.0 / this._time;
        this._frenzySpeed = this._max * 1.0 / 5.0;
        this._speed = this._normalSpeed;
        this._normalTime = this._time;
        this._frenzyTime = 5.0;

        this.node.on('onFrenzyAdd', this.onFrenzyAdd, this);
        this.node.on('onReviveFrenzyAdd', this.onFrenzyAdd, this);
    },

    onFrenzyAdd: function (addType) {
        if (this._isFrenzy) {
            return;
        }

        if (addType < 0 || addType >= FrenzyAddNums.length) {
            return;
        }

        this._count += FrenzyAddNums[addType];

        if (this._count >= this._max) {
            this._count = this._max;
            this._speed = (addType === FrenzyAddType.tryFrenzy) ? this._frenzySpeed : this._normalSpeed;
            var customTime = (addType === FrenzyAddType.tryFrenzy) ? this._frenzyTime : -1;
            this._isFrenzy = true;
            this.node.emit('updateBuffState', BuffState.Frenzy, customTime);
        }
    },

    onFrenzyEnd: function () {
        this._isFrenzy = false;
        this._count = 0;
    },

    update(dt) {
        if (this._isFrenzy) {
            this._count -= this._speed * dt;
            if (this._count <= 0) {
                this.onFrenzyEnd();
            }
        }
    },

    getFrenzyRate: function () {
        return this._count * 1.0 / this._max;
    },

    isFrenzy: function () {
        return this._isFrenzy;
    }
});