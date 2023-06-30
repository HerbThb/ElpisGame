/**
 * @fileoverview 玩家缩略点展示
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const GameData = require('GameData');
const UtilPhysics = require("UtilPhysics");
const TEAM_COLOR = require('Types').TEAM_COLOR;

const HeroPosArrow = cc.Class({
    extends: cc.Component,

    properties: {
        rootNode: cc.Node,
        ballNode: cc.Node,
        keyNode: cc.Node,

        centerNode: cc.Node,
        triangleNode: cc.Node,

        _player: null,
        _otherPlayer: null,
        _camera: null,
        _width: 0,
        _height: 0,
        _rect: null,
        _worldRect: null,
        _otherRect: null,
        _needUpdate: true,
        localPos: null,
        otherPos: null,
    },

    init: function (localPlayer, otherPlayer, camera) {
        const tid = otherPlayer.teamID;
        this.ballNode.color = TEAM_COLOR[tid];
        this.triangleNode.color = TEAM_COLOR[tid];

        this.keyNode.active = otherPlayer.isKey;
        this.ballNode.active = !otherPlayer.isKey;

        this._player = localPlayer;
        this._otherPlayer = otherPlayer;
        this._camera = camera;

        this._width = GameData.instance.screenWidth;
        this._height = GameData.instance.screenHeight;

        this._rect = new cc.rect(-this._width * 0.9 / 2, -this._height * 0.9 / 2, this._width * 0.9, this._height * 0.9);

        this._worldRect = new cc.rect(-this._width / 2, -this._height / 2, this._width, this._height);
        this._otherRect = new cc.rect(0, 0, otherPlayer.defenceRect.getRect().width, otherPlayer.defenceRect.getRect().height);

        this._needUpdate = true;

    },

    changeLocalPlayer(player) {
        this._player = player;
    },

    getArrowPos: function (_localPos, pos, rect) {
        return UtilPhysics.checkMovePointCollideRectReturnHitPos(_localPos, pos.sub(_localPos), rect);
    },

    setActive: function (active) {
        if (this.rootNode.active !== active) {
            this.rootNode.active = active;
        }
    },

    update: function (dt) {
        if (this._needUpdate) {
            if (this._otherPlayer.isDead) {
                this.setActive(false);
                this._needUpdate = false;
                return;
            }

            if (this._otherPlayer.isKey !== this.keyNode.active) {
                this.keyNode.active = this._otherPlayer.isKey;
                this.ballNode.active = !this._otherPlayer.isKey;
            }

            this.localPos = this._player.node.position.sub(this._camera.node.position);
            this.otherPos = this._otherPlayer.node.position.sub(this._camera.node.position);
            // const v2 = this._camera.getCameraToWorldMatrix(cc.v2(this._width, this._height)).sub(this._camera.node.position);
            // this._rect.width = v2.x;
            // this._rect.height = v2.y;

            this._worldRect.center = this.localPos;
            this._worldRect.width = this._width / this._camera.zoomRatio;
            this._worldRect.height = this._height / this._camera.zoomRatio;
            // console.log('worldToCamera: ' + v2 + ', self: ' + cc.v2(this._width / this._camera.zoomRatio, this._height / this._camera.zoomRatio));
            this._otherRect.center = this.otherPos;
            this._otherRect.width = this._otherPlayer.defenceRect.getRect().width;
            this._otherRect.height = this._otherPlayer.defenceRect.getRect().height;

            if (this._worldRect.intersects(this._otherRect)) {
                this.setActive(false);
            } else {
                this.setActive(true);
                const result = this.getArrowPos(this.localPos, this.otherPos, this._rect);
                if (result[0]) {
                    this.node.position = result[1];
                }
            }

            this._deg = cc.misc.radiansToDegrees(Math.atan2(this.otherPos.y, this.otherPos.x));
            this.centerNode.rotation = -this._deg;

            // console.log('active : ' + this.node.active + ', pos: ' + this.node.position);
        }
    }

});