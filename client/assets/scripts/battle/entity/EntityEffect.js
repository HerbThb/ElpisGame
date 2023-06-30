/**
 * @fileoverview 特效实体
 * @author meifan@gameley.cn (梅凡)
 */

const EntityBase = require('EntityBase');
const Tools = require('Tools');
const TEAM_COLOR = require('Types').TEAM_COLOR;

cc.Class({
    extends: EntityBase,

    properties: {
        activeNode: cc.Node,
    },

    // onLoad () {}

    // init: function ()

    initAsAnim: function () {
        this.play();
        this.recycleAfterAnim();
    },

    initAsParticle: function () {
        this.playParticle();
        this.recycleAfterTime();
    },

    changeColor: function (tid) {
        Tools.setNodeColor(this.node, TEAM_COLOR[tid]);
    },

    changeColorByHex: function (hex) {
        // console.log(hex)
        Tools.setNodeColor(this.node, new cc.Color().fromHEX(hex));
    },


    play() {
        this.activeNode.active = true;
        var anim = this.activeNode.getComponent(cc.Animation);
        anim.play()
    },

    playOnce() {
        this.activeNode.active = true;
        var anim = this.activeNode.getComponent(cc.Animation);
        anim.once('finished', () => {
            this.activeNode.active = false;
        })
        anim.play()
    },

    stop() {
        this.activeNode.active = false;
    },

    open() {
        this.activeNode.active = true;
        var anim = this.activeNode.getComponent(cc.Animation);
        if (anim) {
            anim.once('finished', () => {
                anim.play(anim._clips[1]._name);
            })
            anim.play(anim._clips[0]._name);
        }
    },

    closeNode() {
        this.activeNode.active = false;
    },
    
    close() {
        var anim = this.activeNode.getComponent(cc.Animation);
        if (anim) {
            // anim.stop();
            // anim.on('stop', () => {
            // this.activeNode.active = false;
            // anim.off('stop')
            // })
            anim.play(anim._clips[2]._name);
        }
    },

    recycleAfterAnim: function () {
        var anim = this.activeNode.getComponent(cc.Animation);
        if (anim) {
            anim.once('finished', this.recycleSelf, this);
        }
    },

    // /** overwrite */
    // recycleSelf: function () {
    //     this._super();
    //     if(this.isLog) {
    //         console.log("recycle: this.node._pool.count: " + this.node._pool._pool.length);
    //     }
    // },

    playParticle: function () {
        var particle = this.activeNode.getComponent('cc.ParticleSystem');
        if (particle) {
            particle.resetSystem();
        }
    },

    recycleAfterTime: function (time) {
        if (!time) {
            var particle = this.node.getComponent('cc.ParticleSystem');
            if (particle) {
                time = Math.min(particle.life, 0.5);
            }
        }

        if (time) {
            this.needUpdate = true;
            this.recycleTime = time;
        }
    },

    update: function (dt) {
        if (this.needUpdate) {
            this.recycleTime -= dt;
            if (this.recycleTime <= 0) {
                this.needUpdate = false;

                this.recycleSelf();
            }
        }
    }
});