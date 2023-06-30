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
        // this.node.on('fixByBlock', this.fixByBlock, this);
    },

    init: function (_collider) {
        this._collider = _collider;
    },

    initWalls: function (walls) {
        this._wallColliders = [];
        for (var wall of walls) {
            this._wallColliders.push(wall.getComponent('EntityWall').wallCollider);
        }
    },
    // 将碰撞存至list中，update中修改
    refresh: function (detail) {

    },

    fixByBlock: function (detail) {
        if (!Tools.arrContains(this._collisionBlocks, detail)) {
            this._collisionBlocks.push(detail);
        }
    },

    updateGameLogic: function (dt) {
        if (this.lastPos.x === this.node.position.x && this.lastPos.y === this.node.position.y) {
            return;
        }
        this.lastPos = this.node.position;


        for (var wall of this._wallColliders) {
            this.fixPositionByWall(wall);
        }

        for (var block of this._collisionBlocks) {
            this.fixPositionByBlock(block);
        }

        this.checkNeedDie();
        this.reset();
    },

    fixPositionByBlock: function (block) {
        var radius = this._collider.radius * this._collider.node.parent.scale;
        var worldPos = this.node.convertToWorldSpaceAR(this._collider.node.position);
        var relativePos = block.node.convertToNodeSpaceAR(worldPos);
        var fixDir = null;
        var moveLength = 0;
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
        if (moveLength > 0) {
            return;
        }
        var targetRot = fixDir.rotate(block.node.rotation);
        moveLength -= this._offset;
        this.node.position = this.node.position.add(targetRot.mul(-moveLength));
    },

    fixPositionByWall: function (wall) {
        var other = wall;
        var self = this._collider;
        switch (other.tag) {
            case 0: // 上
                this._maxY = other.node.parent.y - other.size.height / 2 - self.radius * self.node.parent.scale - this._offset;
                if (this.node.y > this._maxY) {
                    this.node.y = this._maxY;
                }

                break;
            case 1: // 下
                this._minY = other.node.parent.y + other.size.height / 2 + self.radius * self.node.parent.scale + this._offset;
                if (this.node.y < this._minY) {
                    this.node.y = this._minY;
                }
                break;
            case 2: // 左
                this._minX = other.node.parent.x + other.size.width / 2 + self.radius * self.node.parent.scale + this._offset;
                if (this.node.x < this._minX) {
                    this.node.x = this._minX;
                }
                break;
            case 3: // 右
                this._maxX = other.node.parent.x - other.size.width / 2 - self.radius * self.node.parent.scale - this._offset;
                if (this.node.x > this._maxX) {
                    this.node.x = this._maxX;
                }
                break;
        }

    },

    checkNeedDie: function () {
        var pos = this.node.position;
        if ((this._minX !== null && pos.x < this._minX- 1) || (this._maxX !== null && pos.x > this._maxX+ 1) ||
            (this._minY !== null && pos.y < this._minY- 1) || (this._maxY !== null && pos.y > this._maxY+ 1)) {
            this.die();
        }
    },

    die: function () {
        this.node.emit('die');
    },

    // 修正后重置
    reset: function () {
        this._collisionWalls = [];
        this._collisionBlocks = [];
        this._collisionFix = [];
        this._minX = null;
        this._maxX = null;
        this._minY = null;
        this._maxY = null;
    }
})