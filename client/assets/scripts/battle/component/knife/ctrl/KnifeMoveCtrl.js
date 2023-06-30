/**
 * @fileoverview 刀的移动控制
 * @author zhangzhuang@gameley.cn (张庄)
 */
const Tools = require('Tools');
const KnifeState = require('Types').KnifeState;
const KnifeMomentState = require('Types').KnifeMomentState;

cc.Class({
    extends: cc.Component,

    properties: {
        //龟缩和攻击状态切换转动时间
        changeTime: 0.05,
        changeSpeed: 500,
        initSpeed: 40,
        //调整位置时移动速度
        adjustMoreSpeed: 200,
        //调整位置时移动速度
        adjustLessSpeed: 400,
        //被抓取时移动速度
        captureSpeed: 600,
        //被弹出时移动速度
        releaseSpeed: 1500,
        //nezha移动速度
        nezhaSpeed: -3000,
        //被弹出时转动速度
        releaseRotation: 1000,
        //在父节点下的角度
        rollRotation: 0,

        lastRotation: null,

        danceRoll: 5,
        acceleration: 0,
    },

    onLoad: function () {
        this.knifeCountComp = this.node.getComponent('KnifeCountComponent');
        this.knifeMomentStateComp = this.node.getComponent('KnifeMomentStateComponent');


        this.node.on('dance', this.dance, this);
        this.node.on('releasePosition', this.releasePosition, this);
        this.node.on('startChangeToAttack', this.startChangeToAttack, this);
        this.node.on('startChangeToDefence', this.startChangeToDefence, this);
        this.node.on('throwKnife', this.throwKnife, this);
    },

    dance: function (danceTime) {
        this.danceIndex = 0;
        this.danceTime = danceTime;
        this.danceRoll = 10;
        this.danceRollAdd = 0.5
        var angle = 40;
        var actions = [];
        for (let i = 5; i > 0; i--) {
            var time = i / 15 * danceTime / 4;
            angle -= 2;
            var action = cc.sequence(cc.rotateBy(time, angle), cc.rotateBy(time, -angle), cc.rotateBy(time, -angle), cc.rotateBy(time, angle))
            actions.push(action);
        }
        var finalAction = cc.sequence(...actions);
        this.node.runAction(finalAction);
    },

    releasePosition: function (pos) {
        this.releasePosition = pos;
    },

    getFinalPosition: function () {
        this.acceleration = 0;
        //根据数量算出当前离player的半径
        var count = this.knifeCountComp.maxCount;
        var index = this.knifeCountComp.index;
        var radius = Tools.getRadiusByKnifeCount(count);
        radius = this.isDefence ? radius - 90 : radius;
        //根据位置算出应该改变的角度
        this.rollRotation = 360 / count * index;
        //根据半径和角度计算出移动到哪里
        var sin = Math.sin(this.rollRotation * Math.PI / 180)
        var cos = Math.cos(this.rollRotation * Math.PI / 180)
        var y = sin * radius;
        var x = cos * radius;
        this.raduis = radius;
        return cc.v2(x, y);
    },


    getRadiusChangePosition() {
        //根据数量算出当前离player的半径
        var count = this.knifeCountComp.maxCount;
        var radius = Tools.getRadiusByKnifeCount(count);
        radius = this.isDefence ? radius - 90 : radius;
        //根据半径和角度计算出移动到哪里
        var sin = Math.sin(this.rollRotation * Math.PI / 180)
        var cos = Math.cos(this.rollRotation * Math.PI / 180)
        var y = sin * radius;
        var x = cos * radius;
        this.raduis = radius;
        return cc.v2(x, y);
    },


    startChangeToAttack: function () {
        const self = this;
        this.isDefence = false;
        this.finalPosition = this.getFinalPosition();
        self.node.emit('updateState', KnifeState.Attack);
        var count = this.knifeCountComp.maxCount;
        var index = this.knifeCountComp.index;
        var interval = Tools.getIntervalByCount(count);

        // const changeToAttack = function () {
        //     // setTimeout(() => {
        //     // if (self.isDefence = false) {
        //     self.rotateKnife();
        //     // }
        // };

        // setTimeout(changeToAttack, index * interval);
        this.changeToDefence = false;
        if (!this.changeToAttack) {
            this.changeToAttack = true;
            this.changeToAttackTime = index * interval / 1000;
        }
        // this.scheduleOnce(changeToAttack, index * interval);
    },

    updateChangeToAttack: function (dt) {
        if (this.changeToAttack) {
            this.changeToAttackTime -= dt;
            if (this.changeToAttackTime <= 0) {
                this.changeToAttack = false;
                this.rotateKnife();
            }
        }
    },

    startChangeToDefence: function () {
        const self = this;
        this.isDefence = true;
        this.finalPosition = this.getFinalPosition();

        // const changeToDefence = function () {
        //     // setTimeout(() => {
        //     var state = self.isDefence ? KnifeState.Defence : KnifeState.Attack;
        //     if (self.node) self.node.emit('updateState', state);
        // };

        // setTimeout(changeToDefence, this.changeTime * 1000);
        // this.scheduleOnce(changeToDefence, this.changeTime * 1000);
        this.rotateKnife();

        this.changeToAttack = false;
        if (!this.changeToDefence) {
            this.changeToDefence = true;
            this.changeToDefenceTime = this.changeTime;
        }
    },

    updateChangeToDefence: function (dt) {
        if (this.changeToDefence) {
            this.changeToDefenceTime -= dt;
            if (this.changeToDefenceTime <= 0) {
                this.changeToDefence = false;
                // this.rotateKnife();
                var state = this.isDefence ? KnifeState.Defence : KnifeState.Attack;
                if (this.node) this.node.emit('updateState', state);
            }
        }
    },

    throwKnife: function () {

        this.changeToAttack = false;
        this.changeToDefence = false;
    },

    rotateKnife: function () {
        if (!this.node) return;
        var newRotation = this.isDefence ? 360 - this.rollRotation : 450 - this.rollRotation;
        if (this.lastRotation !== newRotation) {
            this.lastRotation = newRotation;
        }


        // if (this.lastRotation === newRotation) {
        //     if (!this.isRotating) {
        //         if (this.node.rotation !== newRotation) {
        //             this.node.rotation = newRotation;
        //         }
        //     }
        //     return
        // }
        // this.isRotating = true;
        // this.lastRotation = newRotation;
        // var action = cc.rotateTo(this.changeTime, newRotation);
        // var func = cc.callFunc(() => {
        //     this.isRotating = false;
        // })
        // this.node.stopAllActions();
        // this.node.runAction(cc.sequence(action, func));
    },

    updateRotate: function (dt) {
        if (this.lastRotation === null) return;
        if (this.node.rotation !== this.lastRotation) {
            if (this.isDefence) {
                this.node.rotation -= dt * 1080;
                if (this.node.rotation <= this.lastRotation) {
                    this.node.rotation = this.lastRotation;
                    if (this.rollCallback) {
                        this.rollCallback();
                        this.rollCallback = null;
                    }
                }
            } else {
                this.node.rotation += dt * 1080;
                if (this.node.rotation >= this.lastRotation) {
                    this.node.rotation = this.lastRotation;
                    if (this.rollCallback) {
                        this.rollCallback();
                        this.rollCallback = null;
                    }
                }
            }
        }
    },

    getThrowPosition: function () {
        this.acceleration = 0;
        return this.releasePosition;
    },

    setNeZhaPosition: function (pos) {
        this.finalPosition = pos;
        this.acceleration = 0;
    },


    updateLogic: function (dt) {
        if (!this.knifeMomentStateComp) this.knifeMomentStateComp = this.node.getComponent('KnifeMomentStateComponent');
        if (!this.knifeCountComp) this.knifeCountComp = this.node.getComponent('KnifeCountComponent');

        //根据组件的状态做逻辑处理

        if (this.knifeMomentStateComp.isDirty) {
            switch (this.knifeMomentStateComp.state) {
                case KnifeMomentState.Init:
                    this.isInit = true;
                    this.finalPosition = this.getFinalPosition();
                    this.node.position = cc.v2(0, 0);
                    this.logicTargetInfo();
                    break;
                case KnifeMomentState.Capture:
                    this.isCapture = true;
                    this.finalPosition = this.getFinalPosition();
                    this.logicTargetInfo();
                    break;
                case KnifeMomentState.Release:
                    this.isRelease = true;
                    this.finalPosition = this.getThrowPosition();
                    this.lastRotation = this.isDefence ? this.node.rotation - 360 : this.node.rotation + 360;
                    break;
            }
        }

        if (this.knifeCountComp.isDirty) {
            this.isAdjust = true;
            this.isMore = this.knifeCountComp.isMore;
            if (!this.isCapture && !this.isMore) {
                this.node.position = this.getRadiusChangePosition();
            }

            this.finalPosition = this.getFinalPosition();
            this.rotateKnife();
            this.logicTargetInfo();
            this.setScale();
        }

        this.updateMoveLogic(dt);
    },

    logicTargetInfo: function () {
        this.node.emit('logicTargetPos', [this.finalPosition, this.rollRotation, this.raduis]);
    },

    setScale: function () {
        var index = this.knifeCountComp.index;
        var newScale = 0.02 * index + 1;
        newScale = newScale > 1.5 ? 1.5 : newScale;
        if (this.node.scale !== newScale) this.node.scale = newScale;
    },

    updateMoveLogic: function (dt) {
        this.updateRotate(dt);
        this.updateChangeToAttack(dt);
        this.updateChangeToDefence(dt);

        // if (this.isSpider) {
        //     console.log(this.isSpider);
        // }

        var nodePosition = this.node.position;
        if (!this.finalPosition) return;
        if (Tools.compareVec2(this.finalPosition, nodePosition)) return;
        // if (Tools.isFloatEqual(this.finalPosition.x, nodePosition.x) &&
        // Tools.isFloatEqual(this.finalPosition.y, nodePosition.y)) return;

        var dir = this.finalPosition.sub(nodePosition);
        var distance = dir.mag();
        this.moveDistance = this.changeSpeed * dt;
        if (this.isAdjust) {
            if (this.isMore) {
                this.moveDistance = this.adjustMoreSpeed * dt;
            } else {
                this.moveDistance = this.adjustLessSpeed * dt;
            }
        }

        if (this.isInit) {
            this.moveDistance = this.initSpeed * dt;
        }

        if (this.isCapture) {
            this.moveDistance = this.captureSpeed * dt;
        }

        if (this.isRelease) {
            this.moveDistance = this.releaseSpeed * dt;
        }
        if (this.isNEZHA) {
            this.moveDistance = this.nezhaSpeed * dt;
            this.acceleration += 200 * dt;
            this.moveDistance += this.acceleration;
        } else {
            this.acceleration += 50 * dt;
            this.moveDistance += this.acceleration;
        }


        this.node.position = nodePosition.add(dir.mul(this.moveDistance / distance));
        if (Tools.compareVec2(this.finalPosition, this.node.position) || this.moveDistance >= distance) {
            this.node.position = this.finalPosition;
            // this.finalPosition = null;
            if (this.isAdjust) {
                this.isAdjust = false;
            }

            if (this.isInit) {
                this.isInit = false;
            }

            if (this.isCapture) {
                this.isCapture = false;
                this.node.emit('updateMomentState', KnifeMomentState.CaptureFinish)
            }
            if (this.isRelease) {
                this.lastRotation = this.isDefence ? this.node.rotation - 720 : this.node.rotation + 720;
                var finalRotation = this.node.rotation;
                // var action = cc.rotateBy(0.5, this.releaseRotation / 2);
                // var func = cc.callFunc(() => {
                //     this.node.emit('updateState', KnifeState.Normal);
                //     this.node.emit('updateMomentState', KnifeMomentState.ReleaseFinish)
                //     this.isRelease = false;
                // })
                this.rollCallback = () => {
                    this.node.emit('updateState', KnifeState.Normal);
                    this.node.emit('updateMomentState', KnifeMomentState.ReleaseFinish)
                    this.node.rotation = finalRotation;
                    this.lastRotation = finalRotation;
                    this.isRelease = false;
                };
                // this.node.runAction(cc.sequence(action, func));
            }
            if (this.isNEZHA) {
                this.isNEZHA = false;
                if (this.rollCallback) {
                    this.rollCallback();
                    this.rollCallback = null;
                }
            }
        }
        // if (this.moveDistance < distance) {
        // } else {
        // }
    },

    // updateDance: function (dt) {
    //     if (this.node.parent.children.length < 3) {
    //         this.startDance = false;
    //         // this.node.rotation = 180;
    //     }
    //     if (this.startDance) {
    //         // console.log(this.danceIndex, this.node.rotation, this.danceRoll, this.danceRollAdd)
    //         if (this.danceIndex % 4 === 0) {
    //             this.node.rotation += this.danceRoll;
    //         } else if (this.danceIndex % 4 === 1) {
    //             this.node.rotation -= this.danceRoll;
    //         } else if (this.danceIndex % 4 === 2) {
    //             this.node.rotation -= this.danceRoll;
    //         } else if (this.danceIndex % 4 === 3) {
    //             this.node.rotation += this.danceRoll;
    //             this.danceRoll += this.danceRollAdd;
    //         }
    //         this.danceIndex++;
    //     }
    // }
});