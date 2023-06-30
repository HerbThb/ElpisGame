/**
 * @fileoverview 飞刀实体
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const EntityBase = require('EntityBase');
const KnifeState = require('Types').KnifeState;
const GameData = require('GameData');
const KnifeMomentState = require('Types').KnifeMomentState;
cc.Class({
    extends: EntityBase,

    properties: {
        attackNode: cc.Node,
        // attackHeroNode: cc.Node,
        // pickNode: cc.Node,
        // landNode: cc.Node,
        skinNode: cc.Node,
        activeNode: cc.Node,
        // dislabel: cc.Label,
        ctx: cc.Graphics,
        ropeNode: cc.Node,
        // teamIdLabel: cc.Label,
        // idLabel: cc.Label,
    },

    init(tid, itemNode) {
        this.itemNode = itemNode;
        this.teamID = tid;

        this.shouldRemove = false;

        this.nodeCollider = Tools.getOrAddComponent(this.attackNode, 'NodeCollider');
        this.nodeCollider.init(this.node, true, true);

        // this.attackHeroCollider = Tools.getOrAddComponent(this.attackHeroNode, 'NodeCollider');
        // this.attackHeroCollider.init(this.node, true, true);
        //TODO nodeCollider 需要设置初始队伍 changeColliderTag
        // this.nodeLandCollider = Tools.getOrAddComponent(this.landNode, 'NodeCollider');
        // this.nodeLandCollider.init(this.node, true);

        // var nodePickCollider = Tools.getOrAddComponent(this.pickNode, 'NodeCollider');
        //TODO nodeCollider 需要设置初始队伍 changeColliderTag
        // nodePickCollider.init(this.node, false);

        this.node.on('changeTag', this.changeColliderTag, this);
        this.node.on('changeKnifeAttackGroup', this.changeKnifeAttackGroup, this);
        this.node.on('changeColliderState', this.changeColliderState, this);
        this.addComponent();

        this.knifeColliderListener = Tools.getOrAddComponent(this.node, 'KnifeColliderListener');

        this.knifeMoveCtrl = Tools.getOrAddComponent(this.node, 'KnifeMoveCtrl');
        this.knifeParentCtrl = Tools.getOrAddComponent(this.node, 'KnifeParentCtrl');
        this.knifeParentCtrl.init(this.itemNode);
        this.knifeColliderNodeCtrl = Tools.getOrAddComponent(this.node, 'KnifeColliderNodeCtrl');
        this.knifeColliderNodeCtrl.init(this.attackNode);//, this.pickNode, this.landNode, this.attackHeroNode);


        this.knifeSkinCtrl = Tools.getOrAddComponent(this.skinNode, 'KnifeSkinCtrl');
        this.activeNode = this.skinNode;

        this.defenceRect = Tools.getOrAddComponent(this.node, 'DefenceRect');
        this.defenceRect.init(this.node.width * 2, this.node.height * 2, true);

        this.changeColliderTag(tid);
    },

    initWalls: function (type, width, height) {
        switch (type) {
            case 0:
                this.knifeFix = Tools.getOrAddComponent(this.node, 'KnifeFixByWallCtrl');
                break;
            case 1:
                this.knifeFix = Tools.getOrAddComponent(this.node, 'KnifeFixByCircleWallCtrl');
                this.knifeFix.init();
                break;
        }
        this.knifeFix.refresh(width, height);

        this.knifeOutOfWall = Tools.getOrAddComponent(this.node, 'KnifeOutOfWallComponent');
        this.knifeOutOfWall.init(this, width, height);
    },

    refreshWalls: function (width, height) {
        this.knifeFix.refresh(width, height);
        this.knifeOutOfWall.refresh(this, width, height);
    },

    addComponent: function () {
        Tools.getOrAddComponent(this.node, 'KnifeCountComponent');
        this.knifeStateComp = Tools.getOrAddComponent(this.node, 'KnifeStateComponent');
        this.knifeMomentStateComp = Tools.getOrAddComponent(this.node, 'KnifeMomentStateComponent');
        Tools.getOrAddComponent(this.node, 'KnifeOwnerComponent');
        // Tools.getOrAddComponent(this.node, 'KnifeBuffComponent');
    },

    isOnLand: function () {
        return this.teamID === 0 && this.knifeStateComp && this.knifeStateComp.state === KnifeState.Normal
    },


    changeColliderTag: function (tag) {
        this.teamID = tag;

        var collider = this.attackNode.getComponent(cc.Collider);
        collider.tag = tag;
        // var colliders = this.node.getComponentsInChildren(cc.Collider);
        // for (var collider of colliders) {
        // }
    },

    changeID: function (id) {
        this.idLabel.string = id;

        var collider = this.attackNode.getComponent(cc.Collider);
        collider.customID = id;
        // var colliders = this.node.getComponentsInChildren(cc.Collider);
        // for (var collider of colliders) {
        //     collider.customID = id;
        // }
    },

    //变更攻击部分的组
    changeKnifeAttackGroup: function (group) {
        this.nodeCollider.changeNodeGroup(group);
    },

    //当刀是否在视野范围内
    onKnifeViewChange: function (isInMyView) {
        // var group = this.nodeCollider.node.group;
        // if (isInMyView) {
        //     if (group === 'hideKnife') {
        //         this.changeKnifeAttackGroup('otherKnife');
        //     }
        // } else {
        //     if (group === 'otherKnife') {
        //         this.changeKnifeAttackGroup('hideKnife');
        //     }
        // }
    },
    // update (dt) {},

    /** @override */
    updateGameLogic: function (dt) {
        this.knifeParentCtrl.updateLogic(dt);
        this.knifeMoveCtrl.updateLogic(dt);
        this.knifeColliderNodeCtrl.updateLogic(dt);
        this.knifeSkinCtrl.updateLogic(dt);

        if (this.knifeFix) this.knifeFix.updateLogic(dt);

        if (this.knifeOutOfWall) {
            this.knifeOutOfWall.updateGameLogic(dt);
            if (this.knifeOutOfWall.isOut) {
                this.shouldRemove = true;
                this.recycleSelf();
            }
        }
        this.node.emit('resetDirty');

        // if (this.nextClear) {
        //     this.ctx.clear();
        //     this.nextClear = false;
        // }

        // if (this.drawPos) {
        //     this.nextClear = true;
        //     this.ctx.circle(0, 0, 10)
        //     this.ctx.fill();
        //     this.ctx.moveTo(0, 0);
        //     this.ctx.lineTo(this.drawPos.x - this.node.x, this.drawPos.y - this.node.y);
        //     this.ctx.stroke();
        //     this.drawPos = null;
        // }

        if (this.drawPos) {
            if (!this.ropeNode.active) this.ropeNode.active = true;
            var dir = this.drawPos.sub(this.node.position)
            this.ropeNode.width = dir.mag();
            var rotation = dir.angle(cc.v2(-1, 0)) * (180 / Math.PI);
            if (dir.y < 0) {
                rotation = -rotation;
            }
            this.ropeNode.rotation = rotation - this.ropeNode.parent.rotation;
            this.drawPos = null;
        } else {
            if (this.ropeNode.active) this.ropeNode.active = false;
        }

        // this.teamIdLabel.string = this.teamID;
        // this.teamIdLabel.node.rotation = -this.node.rotation;
    },

    draw(pos) {
        this.drawPos = pos;
    },
    // /** overwrite */
    // recycleSelf: function () {
    //     this._super();
    //     // if(this.isLog) {
    //         console.log("recycle: this.node._pool.count: " + this.node._pool._pool.length);
    //     // }
    // },

    reLand: function () {
        this.node.emit('changeTag', 0);
        this.node.emit('updateState', KnifeState.Normal);
        this.node.emit('updateMomentState', KnifeMomentState.ReleaseFinish);

        // this.node.active = false;
    },

    setSage: function (value) {
        // this.isSage = value;
        // this.node.opacity = value ? 128 : 255;
        // var group = value ? 'default' : this.teamID === GameData.instance.localHeroTid ? 'knife' : 'otherKnife';
        // this.changeKnifeAttackGroup(group);
    },

    changeColliderState(state) {
        this.nodeCollider.node.active = state;
    },
});