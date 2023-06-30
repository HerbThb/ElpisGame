/**
 * @fileoverview CameraZoomCtrl
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require("Tools");

/**
 * 相机焦距调节器
 */
var CameraZoomCtrl = cc.Class({
    extends: cc.Component,

    properties: {
        /** 最大移动速度 */
        _maxSpeed: Number.MAX_VALUE,
        /** 缓动时间 */
        _smoothTime: 0.15,
        _curCameraRate: 1,
        _targetCameraZoom: -1,
        _currentVelocityRate: 0,
        camera: cc.Camera,
        _curSpeed: 1.4,
        _needChange: false,
    },

    onLoad: function () {
    },

    cleanUp: function () {
        this.setCameraZoomImmediately(1);
    },

    setCameraZoom: function (zoom) {
        this._targetCameraZoom = zoom;
        this._needChange = true;
    },

    // setZoomSpeed: function (isFast) {
    //     if(isFast) {
    //         this._curSpeed = 1000;
    //     } else {
    //         this._curSpeed = 1.4;
    //     }
    // },

    resetCameraRate: function () {
        this.setCameraZoom(1);
    },

    setCameraZoomImmediately: function (zoom) {
        this._targetCameraZoom = zoom;
        this._needChange = false;
        this._curCameraRate = zoom;
        this.camera.zoomRatio = zoom;
    },

    update: function (dt) {
        if (this._needChange) {
            const dataRate = Tools.smoothDamp(this._curCameraRate, this._targetCameraZoom, this._currentVelocityRate, this._smoothTime, this._maxSpeed, this._curSpeed*dt);
            this._currentVelocityRate = dataRate[1];
            this._curCameraRate = dataRate[0];
            this.camera.zoomRatio = this._curCameraRate;

            // console.log('targetZoom: ' + this._targetCameraZoom + ', curZoom: ' + this._curCameraRate);

            if(Tools.isFloatEqual(this._targetCameraZoom, this._curCameraRate)) {
                this._needChange = false;
            }
        }
    },
});