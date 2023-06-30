/**
 * @fileoverview 玩家移动校正
 * @author jinhaitao@gameley.cn (金海涛)
 */
const Tools = require('Tools');

cc.Class({
    extends: cc.Component,
    properties: {
        lastPos: cc.v2(0, 0),
        // _collisionWalls: [],
        _collider: null,
        _collisionBlocks: [],
        _fixDir: null,
        _minX: null,
        _maxX: null,
        _minY: null,
        _maxY: null,

        _collisionFix: [],
        _offset: 6,
        _wallColliders: [],
    },

    onLoad: function () {
        // this.node.on('fixByWall', this.fixByWall, this);
        this.node.on('fixByBlock', this.fixByBlock, this);
    },

    init: function (_collider) {
        this._collider = _collider;
    },

    fixByBlock: function (detail) {
        if (!Tools.arrContains(this._collisionBlocks, detail)) {
            this._collisionBlocks.push(detail);
        }
    },

    updateGameLogic: function (dt) {

        for (var block of this._collisionBlocks) {
            this.fixPositionByBlock(block);
        }

        // this.checkNeedDie();
        this.reset();
    },

    fixPositionByBlock: function (block) {
        if (this.lastPos.x === this.node.position.x && this.lastPos.y === this.node.position.y) {
            return;
        }
        this.lastPos = this.node.position;

        var radius = this._collider.radius * this._collider.node.parent.scale;
        var worldPos = this.node.convertToWorldSpaceAR(this._collider.node.position);
        var relativePos = block.node.convertToNodeSpaceAR(worldPos);
        var fixDir = null;
        var moveLength = 0;
        var targetRot = relativePos.normalize();
        if (block.radius) {
            moveLength = relativePos.mag() - radius - block.radius * block.node.scale;
        } else {
            if (relativePos.x <= block.size.width / 2 && relativePos.x >= -block.size.width / 2) {
                var n = (relativePos.y >= 0 ? 1 : -1);
                fixDir = cc.v2(0, n);
                moveLength = Math.abs(relativePos.y) - (block.size.height / 2 + radius);
            } else if (relativePos.y <= block.size.height / 2 && relativePos.y >= -block.size.height / 2) {
                var n = (relativePos.x >= 0 ? 1 : -1);
                fixDir = cc.v2(n, 0);
                moveLength = Math.abs(relativePos.x) - (block.size.width / 2 + radius);
            } else {
                var anchor = cc.v2((relativePos.x >= 0 ? 1 : -1) * block.size.width / 2, (relativePos.y >= 0 ? 1 : -1) * block.size.height / 2);
                fixDir = relativePos.sub(anchor).normalize();
                moveLength = relativePos.sub(anchor).mag() - radius;
            }
            targetRot = fixDir.rotate(block.node.rotation);
        }

        if (moveLength > 0) {
            return;
        }

        moveLength -= this._offset;
        this.node.position = this.node.position.add(targetRot.mul(-moveLength));
    },


    checkNeedDie: function () {
        var pos = this.node.position;
        if ((this._minX !== null && pos.x < this._minX) || (this._maxX !== null && pos.x > this._maxX) ||
            (this._minY !== null && pos.y < this._minY) || (this._maxY !== null && pos.y > this._maxY)) {
            this.die();
        }
    },

    die: function () {
        this.node.emit('die');
    },

    // 修正后重置
    reset: function () {
        this._collisionBlocks = [];
        this._collisionFix = [];
        this._minX = null;
        this._maxX = null;
        this._minY = null;
        this._maxY = null;
    }
})