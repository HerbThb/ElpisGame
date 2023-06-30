/**
 * @fileoverview 寻找路点条件
 * @author meifan@gameley.cn (梅凡)
 */

 const ConditionBaseComponent = require('ConditionBaseComponent');
 const GameData = require('GameData');
 const Tools = require('Tools');
 const MapType = require('Types').MapType;

const ConditionFindNextPos = cc.Class({
    extends: ConditionBaseComponent,

    properties: {
        _Width: 0,
        _height: 0,
        _min: null,
        _max: null,
        _dir: null,
    },

    init: function (speed) {
        this._speed = speed;
        this.setMapSize([GameData.instance.mapWidth, GameData.instance.mapHeight]);

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
    doResult: function() {

        this._dir = cc.v2(Tools.getRandomInt(-100, 100), Tools.getRandomInt(-100, 100)).normalizeSelf();
        // Tools.getRandomFloat(2.0,4.0)保证正常情况下走2-4s的距离
        this.result = this._dir.mulSelf(this._speed).mulSelf(Tools.getRandomFloat(2.0,4.0)).addSelf(this.node.position).clampf(this._min, this._max);
    },


    // updateGameLogic: function (dt) {}

    // update: {}
 });