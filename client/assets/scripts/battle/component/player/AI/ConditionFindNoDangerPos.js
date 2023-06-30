/**
 * @fileoverview 离其他ai太近条件
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionBaseComponent = require('ConditionBaseComponent');
const GameData = require('GameData');
const Tools = require('Tools');
const MapType = require('Types').MapType;

// result从PlayerDistanceSystem确定，是另外多个block的Entity的数组
const ConditionFindNoDangerPos = cc.Class({
    extends: ConditionBaseComponent,

    properties: {},

    init: function (speed) {
        this.setMapSize([GameData.instance.mapWidth, GameData.instance.mapHeight]);
        this._speed = speed;

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
    doResultWithParam: function (params) {

        var v2 = null;
        this._curPos = this.node.position;
        
        this.result = params[1].clone().subSelf(this._curPos).normalizeSelf();
        // this.lerp = Tools.getRandomFloat(0.3,0.4);
        for (var block of params[0]) {
            // var parent = block.parent;
            // v2 = parent ? parent.position.add(block.position) : block.position;
            v2 = block.position.sub(this.node.position).normalizeSelf();
            // v2 = cc.v2(v2.y, -v2.x);
            this.result = this.result.subSelf(v2);
            // console.log(' this.result.mag: ' + this.result.magSqr());
            if(Tools.compareVec2(this.result, cc.Vec2.ZERO, 0.1)) {
                this.result = false;
                break;
            }
            this.result = this.result.normalizeSelf();//.mulSelf(this.lerp) : v2;
        }

        if(this.result) {
            this.result = this.result.mulSelf(this._speed).addSelf(this.node.position).clampf(this._min, this._max);
        }
    },

    // updateGameLogic: function (dt) {}

    // update: {}
});