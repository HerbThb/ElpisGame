/**
 * @fileoverview 碰撞事件单例组件
 * @author jinhaitao@gameley.cn (金海涛)
 */

const KnifeColliderState = require('Types').KnifeColliderState;
/**
 * 专门存储碰撞事件，在system的update，做成单例便于addEvent
 */

var CollisionEventManager = cc.Class({
    statics: {
        instance: null,

        getInstance: function () {
            if (CollisionEventManager.instance === null) {
                CollisionEventManager.instance = new CollisionEventManager();
                CollisionEventManager.instance.init();
            }
            return CollisionEventManager.instance;
        },

        cleanUp: function () {
            if (CollisionEventManager.instance) {
                Tools.cleanUp(CollisionEventManager.instance);
            }
            CollisionEventManager.instance = null;
        }
    },

    properties: {
        _heroCollisionEvent: [],
        _knifeCollisionEvent: [],
        _pickKnifeCollisionEvent: [],
        _pickBuffCollisionEvent: [],
        _attackBoxCollisionEvent: [],
    },

    init: function () {
        this.clear();
        var mgr = cc.director.getCollisionManager();
        mgr.enabled = true;
        // mgr.enabledDebugDraw = true;
    },

    //只对主体为在人身上的刀与玩家进行处理
    addCollisionEvent: function (other, self) {
        if (self.node.groupIndex === 1) {
            this._heroCollisionEvent.push([other, self]);
        } else if (self.node.groupIndex === 2) {// || self.node.groupIndex === 7) {
            if(self.collState === KnifeColliderState.Attack) {
                if(!other.collState || other.collState === KnifeColliderState.Attack) {
                    this._knifeCollisionEvent.push([other, self]);
                }
            } else if (self.collState === KnifeColliderState.Land) {
                this._pickKnifeCollisionEvent.push([other, self]);
            }
        }
        //  else if (self.node.groupIndex === 6) {
        //     this._pickKnifeCollisionEvent.push([other, self]);
        // } 
        else if (self.node.groupIndex === 11) {
            this._pickBuffCollisionEvent.push([other, self]);
        } else if (self.node.groupIndex === 12 && other.node.groupIndex !== 3) {
            this._attackBoxCollisionEvent.push([other, self]);
        }
    },

    // "group-list": [
    //  0   "default",
    //  1   "hero",
    //  2  "knife",
    //  3  "block",
    //  4  "ui",
    //  5  "wall",
    //  6  "landKnife",
    //  7  "otherKnife",
    //  8  "pickKnife",
    //  9  "heroWall",
    //  10 "hideKnife",
    //  11 "buff",
    //  12 "box",
    //  13 "ray"
    //   ],

    addCollisionStayEvent: function (other, self) {
        if ((self.node.groupIndex === 2) && (other.node.groupIndex === 5 || other.node.groupIndex === 3)) {// || self.node.groupIndex === 7) ) {
            if(self.collState === KnifeColliderState.Attack) {
                this._knifeCollisionEvent.push([other, self]);
            }
        } else if (self.node.groupIndex === 12 && other.node.groupIndex === 3) {
            this._attackBoxCollisionEvent.push([other, self, true]);
        }
    },

    clearHeroEvent: function () {
        this._heroCollisionEvent = [];
    },

    clearKnifeEvent: function () {
        this._knifeCollisionEvent = [];
    },

    clearPickKnifeEvent: function () {
        this._pickKnifeCollisionEvent = [];
    },

    clearPickBuffEvent: function () {
        this._pickBuffCollisionEvent = [];
    },


    clearAttackBoxEvent: function () {
        this._attackBoxCollisionEvent = [];
    },



    // 清除碰撞事件，每次事件处理完成后清除
    clear: function () {
        this._heroCollisionEvent = [];
        this._knifeCollisionEvent = [];
        this._pickKnifeCollisionEvent = [];
        this._pickBuffCollisionEvent = [];
        this._attackBoxCollisionEvent = [];
    },

});