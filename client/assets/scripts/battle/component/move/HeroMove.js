/**
 * @fileoverview 键盘移动监听器
 * @author meifan@gameley.cn (梅凡)
 */

const GameData = require('GameData');

cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed: 504,
        moveSpeedRate: 1.0,
        skinSpeedAddition: 0,
        growSpeedAddition: 0,
        attackBoxSpeedRate: 1,
        finalAttackBoxSpeedRate: 1,
        attackBoxTime: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    /**
     * onLoad
     */
    onLoad: function () {

        this.node.on('onMoveBy', this.onMoveByKeyboard, this);
        this.node.on('onStopMoving', this.onStopMovingByKeyboard, this);
        this.node.on('changeSpeedRate', this.changeSpeedRate, this);
        this.node.on('onAttackBox', this.onAttackBox, this);
        this.node.on('onStopMove', this.onStopMove, this);
    },

    /**
     * 初始化
     * @param {entity} game 游戏世界
     */
    init: function (game) {

    },


    onStopMove: function (state) {
        this.stopMove = state;
    },

    onAttackBox: function () {
        console.log('撞到盒子');
        this.isSlow = true;
        this.attackBoxTime = 0;
        this.changeFinalAttackBoxSpeedRate(0.4)
    },

    changeFinalAttackBoxSpeedRate(rate) {
        this.finalAttackBoxSpeedRate = rate;
        this.speedPer = rate - this.attackBoxSpeedRate;
    },


    changeSpeedRate: function (detail) {

        this.moveSpeedRate = detail;
        // this.moveSpeed *= detail;
    },

    changeSkinSpeedAddition: function (detail) {
        this.skinSpeedAddition = detail;
    },

    changeGrowSpeedAddition: function (detail) {
        this.growSpeedAddition = detail;
    },
    /** 
     * 监听键盘移动方法
     * @param {cc.p} detail.dPos
     */
    onMoveByKeyboard: function (detail) {
        this.onMoveBy(detail.dPos);
    },

    /** 
     * 移动 调用世界实体的移动接口
     * @param {cc.p} dPos
     */
    onMoveBy: function (dPos) {
        this._moveByPos = dPos;
    },

    /**
     * 监听键盘停止移动方法
     */
    onStopMovingByKeyboard: function () {
        this._moveByPos = null;
    },

    onNodeMoveBy(dt) {
        if (this._moveByPos) {
            // var curPos = this.node.position;
            // curPos = curPos.add(this._moveByPos);
            // this.moveToPos = curPos;
            let dir = this._moveByPos.normalize();
            this.node.x += this.moveSpeed * this.attackBoxSpeedRate * (this.moveSpeedRate + this.skinSpeedAddition + this.growSpeedAddition) * GameData.instance.speedRate * dir.x * dt;
            this.node.y += this.moveSpeed * this.attackBoxSpeedRate * (this.moveSpeedRate + this.skinSpeedAddition + this.growSpeedAddition) * GameData.instance.speedRate * dir.y * dt;
        }
    },

    // called every frame, uncomment this function to activate update callback
    /**
     * 目前在entity身上直接调用，之后会移到entityGame的MoveSystem里(暂时不考虑)
     */
    updateGameLogic(dt) {
        // this.attackBoxTime += dt;

        // if (this.attackBoxTime > 0.1 && this.isSlow) {
        //     this.isSlow = false;
        //     this.changeFinalAttackBoxSpeedRate(2)
        // } else if (this.attackBoxTime > 1.1 && !this.isSlow) {
        //     this.changeFinalAttackBoxSpeedRate(1)
        // }

        // if (this.finalAttackBoxSpeedRate !== this.attackBoxSpeedRate) {
        //     this.attackBoxSpeedRate += this.speedPer * dt * 100;
        //     if (this.speedPer > 0) {
        //         if (this.attackBoxSpeedRate > this.finalAttackBoxSpeedRate) {
        //             this.attackBoxSpeedRate = this.finalAttackBoxSpeedRate;
        //         }
        //     } else {
        //         if (this.attackBoxSpeedRate < this.finalAttackBoxSpeedRate) {
        //             this.attackBoxSpeedRate = this.finalAttackBoxSpeedRate;
        //         }
        //     }
        // }
        if (this.stopMove) return;
        this.onNodeMoveBy(dt);
    },

    getCurSpeed: function () {
        return this.moveSpeed * (this.moveSpeedRate + this.skinSpeedAddition) * GameData.instance.speedRate;
    }
});