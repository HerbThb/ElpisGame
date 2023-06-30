const Tools = require('Tools');
const KnifeState = require('Types').KnifeState;
const FlitInterval = [4, 6, 8, 9, 10, 11];
const FrenzyAddType = require('Types').FrenzyAddType;
/**
 * @fileoverview 刀在玩家身上时的index与刀数量
 * @author jinhaitao@gameley.cn (金海涛)
 */
const PlayerKnivesComponent = cc.Class({
    extends: cc.Component,
    properties: {
        knives: [], //Node 数组
        flags: [], //是否发送过状态的标志位
        isDirty: false,
        emitTime: 0,
        index: 0,
        player: null,
        /** 初复活阶段 贤者模式 不杀人 半透明 */
        isSage: false,
    },

    init: function (ownerPlayer) {
        this.player = ownerPlayer;
        this.node.on('startGame', (isGuide) => {
            this.isGuide = isGuide;
            this.startGame = true;
            this.knives = this.knives.concat();
        }, this);
        this.node.on('addKnife', this.addKnife, this);
        this.node.on('reduceKnife', this.reduceKnife, this);
        this.node.on('resetDirty', this.resetDirty, this);
        this.node.on('heroStartMove', this.heroStartMove, this);
        this.node.on('heroStopMove', this.heroStopMove, this);
        this.node.on('wallCollision', this.wallCollision, this);
        this.node.on('isCollCircleWall', this.collCircleWall, this);
        // this.node.on('setSage', this.setSage, this);
    },

    wallCollision: function (detail) {
        if (detail) {
            if (!this.isCollisionWall) {
                this.emitAttackState();
            }
        }
        this.isCollisionWall = detail;

    },

    collCircleWall: function (detail) {
        if (detail) {
            if (!this.isCollCircleWall) {
                this.emitAttackState();
            }
        }
        this.isCollCircleWall = detail;
    },

    heroStartMove: function () {
        this.isMove = true;
        this.player.isDefence = false;
        this.emitAttackState();
    },

    heroStopMove: function () {
        this.isMove = false;
        this.index = 0;
        var length = this.knives.length;
        this.interval = Tools.getIntervalByCount(length);
        this.player.isDefence = true;
        this.stopMoveTime = 0;
        this.flitIndex = 0;
        this.limitTime = FlitInterval[this.flitIndex] ? FlitInterval[this.flitIndex] : FlitInterval[FlitInterval.length - 1] + (this.flitIndex - FlitInterval.length + 1) * 0.5;
        this.danceTime = this.limitTime / 2;
        this.danceKnifeArr = [];
    },


    emitAttackState() {
        for (let i = 0; i < this.knives.length; i++) {
            if (this.flags[i] !== 1) {
                let knife = this.knives[i];
                if (knife) {
                    knife.emit('startChangeToAttack');
                    this.flags[i] = 1;
                }
            }
        }
    },

    updateLogic: function (dt) {
        if (this.isMove === false && !this.isCollisionWall && !this.isCollCircleWall) {
            if (this.index >= this.knives.length) {
                this.index = 0;
                return
            }
            this.emitTime += dt;
            if (this.emitTime >= this.interval / 1000) {
                if (this.flags[this.index] !== 2) {
                    var knife = this.knives[this.index]
                    if (knife) {
                        knife.emit('startChangeToDefence');
                        this.flags[this.index] = 2;
                    }
                }
                this.index++;
                this.emitTime = 0;
            }

            if (!this.startGame) return;
            if (this.isGuide) return;
            if (this.knives.length < 3) return;
            this.stopMoveTime += dt;


            if (this.stopMoveTime > this.limitTime) {
                // console.log('this.limitTime:'+this.limitTime)
                var curFlitKnife = this.knives[0];
                if (curFlitKnife) {
                    curFlitKnife.emit('throwKnife', true);
                    this.danceKnifeArr.splice(0, 1);
                }
                this.flitIndex++;
                this.limitTime = FlitInterval[this.flitIndex] ? FlitInterval[this.flitIndex] : FlitInterval[FlitInterval.length - 1] + (this.flitIndex - FlitInterval.length + 1) * 0.5;
            }

            if (this.stopMoveTime > this.danceTime) {
                // console.log('this.danceTime:'+this.danceTime)
                var curFlitKnife = this.knives[0];
                if (curFlitKnife) {
                    var time = this.limitTime - this.danceTime;
                    curFlitKnife.emit('dance', time);
                    var nextLimitTime = FlitInterval[this.flitIndex + 1] ? FlitInterval[this.flitIndex + 1] : FlitInterval[FlitInterval.length - 1] + (this.flitIndex + 1 - FlitInterval.length + 1) * 0.5;
                    this.danceTime = (nextLimitTime - this.limitTime) / 2 + this.limitTime;
                }
            }

        }

        // flitKnife
    },

    addKnife: function (detail) {
        if (this.player.isNoMoreKnife()) {
            detail.getComponent('EntityKnife').reLand();
        } else {
            if (!Tools.arrContains(this.knives, detail)) {
                this.knives.push(detail);
                this.player.addKnifeNum(this.knives.length);

                if (this.isMove === true || this.isCollisionWall || this.isCollCircleWall) {
                    detail.emit('startChangeToAttack');
                    this.flags[this.knives.length - 1] = 1;
                } else {
                    detail.emit('startChangeToDefence');
                    this.flags[this.knives.length - 1] = 2;
                }
                // detail.getComponent('EntityKnife').setSage(this.isSage);
                detail.emit('updateOwner', this.node);
                this.isDirty = true;
                this.player.node.emit('onFrenzyAdd', FrenzyAddType.pick);
            }
        }
    },

    reduceKnife: function (detail) {
        this.flags.splice(this.knives.indexOf(detail), 1)
        Tools.arrRemove(this.knives, detail);
        this.isDirty = true;
        detail.emit('changeColliderState', true);
        this.player.node.emit('onFrenzyAdd', FrenzyAddType.throw);
    },

    resetDirty: function () {
        this.isDirty = false;
    },

    emitAllKnivesCountChange: function () {
        var length = this.knives.length;
        for (var i = 0; i < length; i++) {
            this.knives[i].emit('updateCount', [i, length]);
        }
    },

    emitAllKnivesRelease: function () {
        var allKnives = this.knives.slice();

        var length = allKnives.length;
        for (var i = 0; i < length; i++) {
            if (allKnives[i]) allKnives[i].emit('throwKnife');
        }

        allKnives = [];
        this.knives = [];
    },

    emitAllKnivesChangeSkin: function () {
        var length = this.knives.length;
        for (var i = 0; i < length; i++) {
            if (this.knives[i]) this.knives[i].getComponent('EntityKnife').skinNode.emit('changeSkin');
        }
    },

    getKnifeNum: function () {
        return this.knives.length;
    },

    setSage: function (value) {
        // this.isSage = value;
        // this.node.opacity = value ? 128 : 255;

        // var length = this.knives.length;
        // for (var i = 0; i < length; i++) {
        //     if (this.knives[i]) this.knives[i].getComponent('EntityKnife').setSage(value);
        // }
    },
    changeColliderState(state) {
        var allKnives = this.knives.slice();
        var length = allKnives.length;
        for (var i = 0; i < length; i++) {
            if (allKnives[i]) allKnives[i].emit('changeColliderState', state);
        }
    },
})