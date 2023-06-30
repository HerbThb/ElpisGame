/**
 * @fileoverview 刀碰撞事件处理系统
 * @author jinhaitao@gameley.cn (金海涛)
 */
const BaseCollisionHandleSystem = require('BaseCollisionHandleSystem');
const KnifeState = require('Types').KnifeState;
const VibrateUtil = require('VibrateUtil');
const GameData = require('GameData');
const Tools = require('Tools')
const KnifeSkinProperty = require('Types').KnifeSkinProperty;
/**
 * 专门处理刀碰撞系统
 */

var KnifeCollisionHandleSystem = cc.Class({
    extends: BaseCollisionHandleSystem,
    properties: {
        _eventListName: {
            default: '_knifeCollisionEvent',
            override: true,
        },
    },

    /** @override */
    handelCollisionEvent: function (event) {
        var other = event[0];
        var self = event[1];

        var state = self.node.parent.getComponent('KnifeStateComponent').state;
        var selfOwner = self.node.parent.getComponent('KnifeOwnerComponent').oldOwner;
        var selfPlayer = null;
        var isHard = false;
        var dodgeParam = 0; //闪避几率
        if (selfOwner) {
            selfPlayer = selfOwner.getComponent('EntityFollowPlayer').player;
            isHard = selfPlayer.isHard();
            var knifeSkin = selfPlayer.skin;
            if (knifeSkin && knifeSkin.property === KnifeSkinProperty.Dodge) {
                dodgeParam = knifeSkin.propertyParam;
            }
        }


        switch (other.node.group) {
            // case 'otherKnife':
            case 'knife':

                // 如果是一组的直接跳过
                if (other.tag === self.tag) {
                    return;
                }
                // tag为0时表示已经丢了
                if (self.tag === 0) {
                    return;
                }
                // 金刀状态跳过
                if (isHard) {
                    return;
                }


                var otherOwner = other.node.parent.getComponent('KnifeOwnerComponent').oldOwner;
                var otherPlayer = null;
                if (otherOwner) {
                    otherPlayer = otherOwner.getComponent('EntityFollowPlayer').player;
                }
                var weakParam = 0;
                if (selfPlayer && otherPlayer) {
                    var count = (otherPlayer.attackPower - selfPlayer.defencePower) * 5;
                    weakParam = count > 100 ? 100 : count;
                    // console.log('weakParam', weakParam)
                }

                //判断state是否是进攻状态
                if (state === KnifeState.Attack) {
                    var count = Tools.getRandomInt(0, 100);
                    if (count < dodgeParam) {
                        // console.log('闪避', dodgeParam, count)
                        this.dodgeKnife(self, other);
                    } else {
                        this.throwKnife(self, other);
                        if (otherPlayer) otherPlayer.addKillKnifeNum();
                    }
                } else if (state === KnifeState.Defence && weakParam > 0) {
                    var count = Tools.getRandomInt(0, 100);
                    if (count < weakParam) {
                        this.destroyDefenceKnife(self, other);
                        if (otherPlayer) otherPlayer.addKillKnifeNum();
                    }
                }
                break;
            case 'block':
                if (self.tag === 0) {
                    return;
                }
                // 攻击状态则掉落，防御状态则卡住
                if (state === KnifeState.Attack) {
                    if (!isHard) {
                        this.throwKnife(self, other);
                    }
                } else {
                    //防御状态卡住
                    self.node.emit('emitEvent', ['stopParentRotate']);
                }

                break;
            case 'wall':
                if (self.tag === 0) {
                    return;
                }
                var rot = 0;
                // var pos = self.node.parent.convertToWorldSpaceAR(self.node.position);
                // pos = other.node.parent.parent.convertToNodeSpaceAR(pos);
                // var detail = {};
                switch (other.tag) {
                    case 0: // 上
                        // pos.y = other.node.parent.y - other.size.height / 2 - self.size.height / 2 + 2;
                        rot = 180;
                        break;
                    case 1: // 下
                        rot = 0;
                        // pos.y = other.node.parent.y + other.size.height / 2 + self.size.height / 2 - 2;
                        break;
                    case 2: // 左
                        rot = 90;
                        // pos.x = other.node.parent.x + other.size.width / 2 + self.size.height / 2 - 2;
                        break;
                    case 3: // 右
                        rot = 270;
                        // pos.x = other.node.parent.x - other.size.width / 2 - self.size.height / 2 + 2;
                        break;
                }
                // pos = other.node.parent.parent.convertToWorldSpaceAR(pos);
                // pos = self.node.parent.convertToNodeSpaceAR(pos);
                // detail.finalPos = pos;
                self.node.emit('emitEvent', ['fixByWall', [other, rot, other.node.parent.getComponent('EntityWall').bgNode.width / 2]]);
                break;
        }
    },

    updateGameLogic: function (dt) {
        this._super(dt);
        this._collisionEventMgr.clearKnifeEvent();
    },

    throwKnife: function (collider, otherCollider) {
        //自己的刀振动
        if (collider.tag === GameData.instance.localHeroTid || otherCollider.tag === GameData.instance.localHeroTid) {
            VibrateUtil.vibrate();
            if (collider.tag === GameData.instance.localHeroTid) {
                collider.node.emit('emitEvent', ['localHeroCollision']);
            } else if (otherCollider.tag === GameData.instance.localHeroTid) {
                otherCollider.node.emit('emitEvent', ['localHeroCollision']);
            }
        }
        // 去node中做完判断再改tag
        collider.node.emit('emitEvent', ['stopParentRotate']);
        collider.node.emit('emitEvent', ['throwKnife', otherCollider]);
        this.node.emit('throwKnife', [collider.node, otherCollider.node]);
    },

    dodgeKnife: function (collider, otherCollider) {
        this.node.emit('dodgeKnife', [collider.node, otherCollider.node]);
    },

    destroyDefenceKnife: function (collider, otherCollider) {
        //自己的刀振动
        if (collider.tag === GameData.instance.localHeroTid || otherCollider.tag === GameData.instance.localHeroTid) {
            VibrateUtil.vibrate();
            if (collider.tag === GameData.instance.localHeroTid) {
                collider.node.emit('emitEvent', ['localHeroCollision']);
            } else if (otherCollider.tag === GameData.instance.localHeroTid) {
                otherCollider.node.emit('emitEvent', ['localHeroCollision']);
            }
        }
        // 去node中做完判断再改tag
        collider.node.emit('emitEvent', ['stopParentRotate']);
        collider.node.emit('emitEvent', ['throwKnife', otherCollider]);

        this.node.emit('destroyDefenceKnife', [collider.node, otherCollider.node]);
    },
});