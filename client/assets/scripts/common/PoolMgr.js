const PoolType = require('Types').PoolType;
const Tools = require('Tools');
const GameData = require('GameData');

const PoolMgr = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },
    properties: {
        poolArray: [],
        prefabArray: {
            default: [],
            type: cc.Prefab
        }
    },

    cleanUp: function () {
        for (let type = 0; type < PoolType.COUNT; type++) {
            var pool = this.poolArray[type];
            if(pool) {
                pool.clear();
            }
        }
        this.poolArray = [];
    },

    init: function () {
        for (let type = 0; type < PoolType.COUNT; type++) {
            var pool = new cc.NodePool();
            var prefab = this.prefabArray[type];
            var count = 0;
            switch (type) {
                case PoolType.PLAYER:
                    count = 8;
                    break;
                case PoolType.FOLLOW_PLAYER:
                    count = 8;
                    break;
                case PoolType.KNIFE:
                    count = 180;
                    break;
                case PoolType.BLOCK:
                case PoolType.BLOCK_01:
                case PoolType.BLOCK_02:
                case PoolType.BLOCK_03:
                case PoolType.BLOCK_04:
                case PoolType.BLOCK_05:
                case PoolType.BLOCK_06:
                case PoolType.BLOCK_07:
                case PoolType.BLOCK_08:
                    count = 2;
                    break;
                case PoolType.CIRCLE_BLOCK:
                    count = 3;
                    break;
                case PoolType.WALL:
                    count = 4;
                    break;
                case PoolType.CIRCLE_WALL:
                    count = 1;
                    break;
                case PoolType.COLL_EFFECT:
                    count = 50;
                    break;
                case PoolType.BUFF:
                case PoolType.BOX:
                    count = 10;
                    break;
                case PoolType.SHOW_KNIFE_EFFECT:
                    count = 12;
                    break;
                case PoolType.DODGE_EFFECT:
                    count = 20;
                    break;
                case PoolType.DESTROY_DEFENCE_EFFECT:
                    count = 20;
                    break;
                case PoolType.Effect_Reborn:
                    count = 8;
                    break;
                case PoolType.NEZHA_EFFECT:
                    count = 20;
                    break;

            }
            var index = 0;
            while (index < count) {
                var node = cc.instantiate(prefab);
                pool.put(node);
                index++;
            }
            this.poolArray[type] = pool;
        }
    },



    getPlayer: function (comp = 'EntityPlayer') {
        return this.get(PoolType.PLAYER, comp);
    },

    getFollowPlayer: function (comp = 'EntityFollowPlayer') {
        return this.get(PoolType.FOLLOW_PLAYER, comp);
    },

    getKnife: function (comp = 'EntityKnife') {
        var node = this.get(PoolType.KNIFE, comp);
        // console.log("getKnife: this.node._pool.count: " + node._pool._pool.length);
        return node;
    },

    getBlock: function (blockType = PoolType.BLOCK, comp = 'EntityBlock') {
        return this.get(blockType, comp);
    },

    getCircleBlock: function (comp = 'EntityBlock') {
        return this.get(PoolType.CIRCLE_BLOCK, comp);
    },

    getWall: function (comp = 'EntityWall') {
        return this.get(PoolType.WALL, comp);
    },

    getCollEffect: function (comp = 'CollEffect') {
        var node = this.get(PoolType.COLL_EFFECT, comp);
        return node
    },

    getDodgeEffect: function (comp = 'DodgeEffect') {
        var node = this.get(PoolType.DODGE_EFFECT, comp);
        return node
    },

    getRebornEffect: function (comp = 'effectReborn') {
        var node = this.get(PoolType.Effect_Reborn, comp);
        return node;
    },

    getDestroyDefenceffect: function (comp) {
        var node = this.get(PoolType.DESTROY_DEFENCE_EFFECT, comp);
        return node
    },

    getNeZhaffect: function (comp) {
        var node = this.get(PoolType.NEZHA_EFFECT, comp);
        return node
    },

    getShowKnifeEffect: function (comp = 'ShowKnifeEffect') {
        var node = this.get(PoolType.SHOW_KNIFE_EFFECT, comp);
        return node
    },

    getBuff: function (comp = 'EntityBuff') {
        var node = this.get(PoolType.BUFF, comp);
        return node;
    },

    getBox: function (comp = 'EntityBox') {
        var node = this.get(PoolType.BOX, comp);
        return node;
    },

    getCircleWall: function (comp = 'EntityCircleWall') {
        var node = this.get(PoolType.CIRCLE_WALL, comp);
        return node;
    },

    get: function (type, comp) {
        var pool = this.poolArray[type];
        if (pool) {
            var node = pool.get();
            if (!node) {
                var prefab = this.prefabArray[type];
                node = cc.instantiate(prefab);
                if (GameData.instance.isShowLog()) {
                    console.log('pool of type is not enough:' + type);
                }
            }
            node._pool = pool;
            return node;
        } else {
            cc.error('can\'t get pool of type:' + type);
            return null;
        }
    },



    // update (dt) {},
});