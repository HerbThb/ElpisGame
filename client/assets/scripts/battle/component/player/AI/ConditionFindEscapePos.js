/**
 * @fileoverview 离其他ai太近条件
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');
const GameData = require('GameData');
const Tools = require('Tools');
const MapType = require('Types').MapType;

// result从PlayerDistanceSystem确定，是另外多个ai的Entity的数组
const ConditionFindEscapePos = cc.Class({
    extends: ConditionBaseComponent,

    properties: {},

    init: function () {
        
        this.setMapSize([GameData.instance.mapWidth, GameData.instance.mapHeight]);
        this._speed = 3;

        this.node.on('setMapSize', this.setMapSize, this);
        this.node.on('initWalls', this.initWalls, this);
    },

    initWalls: function (type) {
        this.wallType = type;
        this.setMapSize([this._Width, this._height]);
    },

    setMapSize: function (detail) {
        const width = detail[0];
        const height = detail[1];

        this._Width = this.getReal(width);
        this._height = this.getReal(height);

        this._min = cc.v2(-this._Width / 2, -this._height / 2);
        this._max = cc.v2(this._Width / 2, this._height / 2);
    },

    getReal: function (value) {
        var ret = value * 0.9;
        
        if(this.wallType) {
            if(this.wallType === MapType.Circle) {
                ret = ret / 1.5;
            }
        }

        return ret;
    },

    /** overwrite */
    doResultWithParam: function (heros) {
        if (!this.result) {

        }

        var v2 = null;
        for (var hero of heros) {
            v2 = this.node.position.sub(hero.node.position);
            this.result = this.result ? this.result.addSelf(v2).mulSelf(0.5) : v2;
        }

        this.result = this.result.mulSelf(this._speed).addSelf(this.node.position).clampf(this._min, this._max);
    },

    // updateGameLogic: function (dt) {}

    // update: {}
});