/**
 * @fileoverview 地图实体
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const EntityBase = require('EntityBase');

cc.Class({
    extends: EntityBase,

    properties: {
        mapWidth: 0,
        mapHeight: 0,
        mapSprs: [cc.Node],

    },

    // onLoad () {}

    init: function (id, width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
        this.mapSprs[id].active = true;
        this.mapSprs[id].setContentSize(width, height);
    },

    // start() {},

    // update (dt) {},
});