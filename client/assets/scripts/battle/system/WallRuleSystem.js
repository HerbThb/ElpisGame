const NoticeType = require('Types').NoticeType;
const ConfigData = require('ConfigData');
cc.Class({
    extends: cc.Component,

    properties: {
        wallSpeed: 50,
    },

    init: function (world) {
        this.world = world;
        this.walls = world.walls;
        this.uiMgr = world.uiMgr;
        this.time = 0;
        this.wallTime = 0;
        var wallData = ConfigData.instance.wallData;
        this.wallTimeStart = wallData.wallTimeStart;
        this.wallTimeLimit = wallData.wallTimeLimit;
        this.wallTimeMove = wallData.wallTimeMove;
        this.wallTimeInterval = wallData.wallTimeInterval;
        this.wallComps = [];
        var compStr = world.mapType === 0 ? 'EntityWall' : 'EntityCircleWall';
        for (var wall of this.walls) {
            var comp = wall.getComponent(compStr);
            comp.setMoveSpeed(this.wallSpeed);
            this.wallComps.push(comp);
        }


        for (var player of world.players) {
            player.initWalls(world.mapType, this.walls, world.mapWidth, world.mapHeight);
        }

    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    updateGameLogic(dt) {
        this.time += dt;
        if (this.time > this.wallTimeStart) {
            if (!this.startMove) {
                this.startMove = true;
                this.wallTime = 0;
            }
        }

        if (!this.startMove) return;
        this.wallTime += dt;

        if (!this.isShow) {
            this.isShow = true;
            this.uiMgr.showImportantNotice(NoticeType.Wall);
        }

        if (this.wallTime > (this.wallTimeLimit + this.wallTimeMove + this.wallTimeInterval)) {
            this.wallTime = 0;
            this.isShow = false;
        } else if (this.wallTime > (this.wallTimeLimit + this.wallTimeMove)) {
            for (var comp of this.wallComps) {
                comp.closeRedBg();
            }
        } else if (this.wallTime > this.wallTimeLimit) {
            for (var comp of this.wallComps) {
                comp.startRedBg();
                comp.updateGameLogic(dt);
            }
            this.world.reduceMapSize(this.wallSpeed * dt * 2);
        }
    } // update (dt) {},
});