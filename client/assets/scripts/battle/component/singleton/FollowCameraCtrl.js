/**
 * @fileoverview FollowCameraCtrl类的实现
 * @author jinhaitao@gameley.cn (金海涛)
 */
const Tools = require("Tools");


/**
 * 相机跟随组件，添加该组件后，节点会跟随目标节点平滑移动
 */
var FollowCameraCtrl = cc.Class({
    extends: cc.Component,

    properties: {
        /** 目标跟随节点 */
        targetNode: cc.Node,
        camera: cc.Camera,
        /** 边距 */
        _marginX: 640,
        _marginY: 400,

        /** 当前x方向速率 */
        _currentVelocityX: 0,
        /** 当前y方向速率 */
        _currentVelocityY: 0,
        /** 最大移动速度 */
        _maxSpeed: Number.MAX_VALUE,
        /** 缓动时间 */
        _smoothTime: 0.3,
        /** 限制移动区域 */
        _moveLimitRect: cc.rect,

        _moveCamreaRate: 1,
        _curCameraRate: 1,
        _targetCameraRate: -1,
        _currentVelocityRate: 0,
    },

    cleanUp: function () {
        this.node.position = cc.v2(0,0);
        this.targetNode = null;
    },

    /**
     * 初始化相机可移动范围
     * @param {NodeBase} targetNode
     */
    init: function (targetNode, mapRect) {
        var canvas = cc.find("Canvas");
        this._marginX = canvas.width / 10;
        this._marginY = canvas.height / 10;
        this.targetNode = targetNode;
        this._moveLimitRect = new cc.rect(mapRect.x + this._marginX, mapRect.y + this._marginY, mapRect.width - 2 * this._marginX, mapRect.height - 2 * this._marginY);
        const targetPos = this.targetNode.position;
        const targetX = Tools.clamp(this._moveLimitRect.xMin, this._moveLimitRect.xMax, targetPos.x);
        const targetY = Tools.clamp(this._moveLimitRect.yMin, this._moveLimitRect.yMax, targetPos.y);
        this.node.position = cc.v2(targetX, targetY);

        // 快速跟着玩家中心
        this._moveCamreaRate = 100;
    },

    resetTargetNode: function (targetNode) {
        this.targetNode = targetNode;
        setTimeout(() => {
            this._targetCameraRate = 1.6;
        }, 200);
        this._moveCamreaRate = 2;
    },

    resetCameraRate: function () {
        this._targetCameraRate = 1;
    },

    /**
     * 根据当前位置，目标节点位置以及速率设置新的位置
     * @override  
     */
    lateUpdate: function (dt) {
        if (!this.targetNode) {
            return;
        }

        if (!this._moveLimitRect) {
            return;
        }

        // this.updateCameraRate();

        const targetPos = this.targetNode.position;
        const targetX = Tools.clamp(this._moveLimitRect.xMin, this._moveLimitRect.xMax, targetPos.x);
        const targetY = Tools.clamp(this._moveLimitRect.yMin, this._moveLimitRect.yMax, targetPos.y);
        const dataX = Tools.smoothDamp(this.node.position.x, targetX, this._currentVelocityX, this._smoothTime, this._maxSpeed, this._moveCamreaRate * dt);
        const dataY = Tools.smoothDamp(this.node.position.y, targetY, this._currentVelocityY, this._smoothTime, this._maxSpeed, this._moveCamreaRate * dt);

        if (this._targetCameraRate > 0) {
            const dataRate = Tools.smoothDamp(this._curCameraRate, this._targetCameraRate, this._currentVelocityRate, this._smoothTime, this._maxSpeed, 1.4 * dt);
            this._currentVelocityRate = dataRate[1];
            this._curCameraRate = dataRate[0];
            this.camera.zoomRatio = this._curCameraRate;
        }

        this._currentVelocityX = dataX[1];
        this._currentVelocityY = dataY[1];
        this.node.position = cc.v2(dataX[0], dataY[0]);



    },

    // updateCameraRate: function () {

    //     if (!this.targetStateComp) this.targetStateComp = this.targetNode.getComponent('EntityPlayer').followPlayer.knivesCmp;
    //     var count = this.targetStateComp.knives.length;
    //     var realCount = 0;
    //     var min = 4;
    //     var max = 30;
    //     if (count < min) {
    //         realCount = 0;
    //     } else if (count < max) {
    //         realCount = count - min;
    //     } else {
    //         realCount = max - min;
    //     }
    //     this._targetCameraRate = 1 - realCount * 0.01;

    //     var isMove = this.targetStateComp.isMove;
    //     this._targetCameraRate = isMove ? this._targetCameraRate : this._targetCameraRate * 1.5;


    // },
});