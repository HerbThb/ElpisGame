/**
 * @fileoverview AI移动模拟器
 * @author meifan@gameley.cn (梅凡)
 */

const AIMoveState = require('Types').AIMoveState;
const GameData = require('GameData');
const Tools = require('Tools');

const MoveAI = cc.Class({
    extends: cc.Component,

    properties: {
        _curMoveState: AIMoveState.Normal,
        _Width: 0,
        _height: 0,
        _curPos: null,
        _nextPos: null,
        _moveDir: null,
        _thinkTime: 1,
    },

    onLoad : function () {
        // 宽高稍小于地图 以免被墙卡
        this._Width = GameData.instance.mapWidth * 0.9;
        this._height = GameData.instance.mapHeight * 0.9;
        this._thinkTime = 2;
    },

    init : function (moveSpeed) {
        this.moveMag = ((moveSpeed / GameData.instance.logicFps) * (moveSpeed / GameData.instance.logicFps)) + 30;
    },

    _findNextPos : function () {
        this._nextPos = cc.v2(Tools.getRandomInt(-this._Width / 2, this._Width / 2), Tools.getRandomInt(-this._height / 2, this._height / 2));
        // console.log('curPos is : ' + this._curPos + ', nextPos is ' + this._nextPos);
        this._CalMoveDir();
    },

    _CalMoveDir : function () {
        this._curPos = this.node.position;
        this._moveDir = this._nextPos.sub(this._curPos);
    },

    _checkIfFind : function () {
        this._curPos = this.node.position;
        const dPos =  this._nextPos.sub(this._curPos);
        // console.log('_curPos: ' + this._curPos + ', _nextPos: ' + this._nextPos + ', dPos is : ' + dPos + ',dPos.magSqr : ' + dPos.magSqr() + ',moveMag: ' + this.moveMag);
        //TODO 应该得通过HeroMove的speed得出
        return dPos.magSqr() <= this.moveMag;
    },

    update: function (dt) {
        switch (this._curMoveState) {
            case AIMoveState.Normal:
                // 找寻下一个路点
                this._findNextPos();
                this._curMoveState = AIMoveState.Moving;
                break;
            case AIMoveState.Moving:
                if(this._checkIfFind()) {
                    this.node.emit('onStopMoving');
                    this._curMoveState = AIMoveState.Thinking;
                } else {
                    this._CalMoveDir();
                    this.node.emit('onMoveBy', {
                        dPos: this._moveDir
                    });
                }
                break;
            case AIMoveState.Thinking:
                this._thinkTime -= dt;
                if(this._thinkTime <= 0) {
                    this._thinkTime = 2;
                    this._curMoveState = AIMoveState.Normal;
                }
                break;
        }
    }

});