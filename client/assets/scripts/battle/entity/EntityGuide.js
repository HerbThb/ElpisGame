const Tools = require('Tools');
const GameData = require('GameData');
const AudioEngine = require('AudioEngine');
const SoundID = require('Types').SoundID;
const NAME_COLOR = require('Types').NAME_COLOR;
const UIUtil = require('UIUtil');
const FrenzyAddType = require('Types').FrenzyAddType;
const HeroSkinProperty = require('Types').HeroSkinProperty;
const HeroRebornEffectState = require('Types').HeroRebornEffectState;
const StageType = require('Types').StageType;
const KnifeState = require('Types').KnifeState;
cc.Class({
    extends: cc.Component,

    properties: {
        ctx: cc.Graphics,
        canDraw: true,
        beforeAnim: cc.Animation,
        startAnim: cc.Animation,
        endAnim: cc.Animation,
        bgAnim: cc.Animation,
        shadowNode: cc.Node,
        colliderNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(player) {
        this.player = player;
        this.bodyCollider = this.colliderNode.getComponent(cc.Collider);
        this.bodyCollider.tag = player.teamID;;
        this.heroMove = Tools.getOrAddComponent(this.node, 'HeroMove');
        this.heroMove.changeSpeedRate(1.5);
        this.ctx.moveTo(this.node.position);
        this.speedShadow = Tools.getOrAddComponent(this.node, 'SpeedShadow');
        this.speedShadow.init('texture/hero/effect-batman-06', this.shadowNode);
        this.bgAnim.node.width = GameData.instance.screenWidth;
        this.bgAnim.node.height = GameData.instance.screenHeight;

        this.node.on('catchEnemy', this.catchEnemy, this)
    },

    setShadow(active) {
        this.shadowNode.active = active;
    },

    catchEnemy(pos) {
        this.node.position = pos;
        this.player.node.emit('catchEnemyByBatMan');
    },


    playBeforeAnim() {
        this.beforeAnim.node.active = true;
        this.beforeAnim.play();
    },

    playStartAnim() {
        this.endAnim.node.active = false;
        this.startAnim.node.active = true;
        this.startAnim.play();

        if(this.player.isLocal){
            this.bgAnim.node.active = true;
            this.bgAnim.play();
        }
    },

    playEndAnim() {
        this.endAnim.node.active = true;
        this.startAnim.node.active = false;
        this.endAnim.play();
        this.endAnim.once('finished', () => {
            this.node.active = false;
            this.bgAnim.node.active = false;
        })
    },

    setDraw(draw) {
        if (draw) {
            this.canDraw = true;
            this.ctx.moveTo(this.node.position)
        } else {
            this.canDraw = false;
            // this.ctx.clear();
        }
    },

    updateGameLogic(dt) {
        // if (this.player) this.node.scale = this.player.node.scale;
        if (this.heroMove) this.heroMove.updateGameLogic(dt);
        if (this.speedShadow) this.speedShadow.updateGameLogic(dt);
        if (this.moveFix) {
            this.moveFix.updateGameLogic(dt);
        }
        if (this.player.myCamera) {
            this.bgAnim.node.scale = 1 / this.player.myCamera.camera.zoomRatio / this.node.scale;
        }

        // this.updateDraw(dt);
    },

    updateDraw(dt) {
        if (this.canDraw) {
            this.ctx.node.position = cc.v2(0, 0).sub(this.node.position);
            this.ctx.lineTo(this.node.position)
            this.ctx.stroke();
            this.ctx.moveTo(this.node.position)
        }
    },

    initWalls: function (type, walls, width, height) {
        switch (type) {
            case 0:
                this.moveFix = Tools.getOrAddComponent(this.node, 'HeroMoveFix');
                this.moveFix.init(this.colliderNode.getComponent(cc.Collider));
                this.moveFix.initWalls(walls);
                break;
            case 1:
                this.moveFix = Tools.getOrAddComponent(this.node, 'HeroMoveFixByCircle');
                this.moveFix.init(this.colliderNode.getComponent(cc.Collider), this.player.followPlayer);
                this.moveFix.refresh(width, height);
                break;
        }
    }
});