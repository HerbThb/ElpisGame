/**
 * @fileoverview AI控制器（行为树）
 * @author meifan@gameley.cn (梅凡)
 */

const ConditionCfg = [
    [true, false, 0.5, false, 0, false, false, 0, false, true, true, true, 2, false, false, true, 0],
    [true, false, 0.5, false, 0.5, false, false, 0, false, true, true, true, 2, false, false, true, 0],
    [true, false, 0.5, false, 0.5, true, true, 12, true, true, true, true, 2, false, false, true, 0],
    [false, true, 0.5, false, 2.0, true, true, 18, true, false, false, true, 2, false, false, true, 0],
    [false, true, 0.5, true, 2.0, true, true, 24, true, false, false, true, 2, true, false, true, 1],
    [false, true, 0.5, true, 2.5, true, true, 30, true, false, false, true, 3, true, true, true, 1],
    [false, true, 0.5, true, 3.0, true, true, 36, true, false, false, false, 4, true, true, false, 1]
];
const FreshProtect = [
    [
        [2, 2, 2, 3, 4, 5],
        [0.01, 0.01, 0.01],
        [true, true, true]
    ],
    [
        [3, 3, 3, 4, 5, 6],
        [0.01, 0.01, 0.01],
        [true, true, true]
    ],
    [
        [5, 5, 5, 6, 7, 8],
        [0.01, 0.01, 0.01],
        [true, true, true]
    ],
    [
        [6, 6, 6, 7, 8, 9],
        [0.01, 0.01, 0.01],
        [true, true, true]
    ],
    [
        [8, 8, 8, 9, 10, 11],
        [0.01, 0.01, 0.01],
        [true, true, false]
    ],
    [
        [9, 9, 9, 10, 11, 12],
        [0.01, 0.01, 0.01],
        [true, true, false]
    ],
    [
        [10, 10, 10, 11, 12, 13],
        [0.01, 0.01, 0.01],
        [true, true, false]
    ]
];

const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AICfgType = require('Types').AICfgType;
const GameData = require('GameData');
const AIFreshCfgType = require('Types').AIFreshCfgType;

const AIMgr = cc.Class({
    extends: cc.Component,

    properties: {
        _conditionFindeNextPos: null,
        _actionMove: null,
        _curAction: null,
        _actionSeq: [],
    },

    /**
     * 
     * @param {*} moveSpeed 
     * @param {*} level 0-6暂时来源于tid从2-8
     * @param {*} defenceTime 
     */
    init: function (moveSpeed, level, entityPlayer) {
        // const levelCfg = ConfigData.instance.getLevelCfg(PlayerData.instance.level);

        // level = level < levelCfg.strongNum ? ConditionCfg.length - 1 : level;
        // level = level >= ConditionCfg.length - levelCfg.weakNum ? 0 : level;

        if (GameData.instance.isShowLog()) {
            console.log('ai level:' + level);
        }

        const cfg = ConditionCfg[level];
        const freshCfg = FreshProtect[level];

        this._conditionFindeNextPos = Tools.getOrAddComponent(this.node, 'ConditionFindNextPos');
        this._conditionFindeNextPos.init(moveSpeed);

        if (cfg[AICfgType.AINear]) {
            this._conditionNearAnotherAI = Tools.getOrAddComponent(this.node, 'ConditionNearAnotherAI');
            this._conditionNearAnotherAI.init();
        }

        this._conditionFindEscapePos = Tools.getOrAddComponent(this.node, 'ConditionFindEscapePos');
        this._conditionFindEscapePos.init();

        if (cfg[AICfgType.Slow]) {
            this._conditionAISlow = Tools.getOrAddComponent(this.node, 'ConditionAISlow');
        }

        this._conditionNearBlock = Tools.getOrAddComponent(this.node, 'ConditionNearBlock');
        this._conditionNearBlock.init();

        this._conditionFindNoDangerPos = Tools.getOrAddComponent(this.node, 'ConditionFindNoDangerPos');
        this._conditionFindNoDangerPos.init(moveSpeed);

        this._conditionNearLocalHero = Tools.getOrAddComponent(this.node, 'ConditionNearLocalHero');
        this._conditionNearLocalHero.init();

        this._conditionInThenOutLocalHero = Tools.getOrAddComponent(this.node, 'ConditionInThenOutLocalHero');
        this._conditionInThenOutLocalHero.init();

        if (cfg[AICfgType.HeroDefence]) {
            this._conditionLocalHeroDefence = Tools.getOrAddComponent(this.node, 'ConditionLocalHeroDefence');
            this._conditionLocalHeroDefence.init();
        }

        this._conditionRandomBool = Tools.getOrAddComponent(this.node, 'ConditionRandomBool');
        this._conditionRandomBool.init();

        this._condtionLastTimeHeroDefence = Tools.getOrAddComponent(this.node, 'ConditionLastTimeHeroDefence');
        this._condtionLastTimeHeroDefence.init();

        // if () {
        // }
        this._condtionLastTimeNearLocalHero = Tools.getOrAddComponent(this.node, 'CondtionLastTimeNearLocalHero');
        this._condtionLastTimeNearLocalHero.init();
        this._heroDefenceThinkTime = cfg[AICfgType.HeroDefenceThinking];

        if (cfg[AICfgType.LowKnife]) {
            this._conditionLowKnifeNum = Tools.getOrAddComponent(this.node, 'ConditionLowKnifeNum');
            this._conditionLowKnifeNum.init(entityPlayer);
        }

        if (cfg[AICfgType.KnifeLess]) {
            this._conditionKnifeLessThenLocalHero = Tools.getOrAddComponent(this.node, 'ConditionKnifeLessThenLocalHero');
            this._conditionKnifeLessThenLocalHero.init(entityPlayer);
        }

        this._conditionLastTimeHeroAttack = Tools.getOrAddComponent(this.node, 'ConditionLastTimeHeroAttack');
        this._conditionLastTimeHeroAttack.init();

        if (cfg[AICfgType.lessKnifeEscape]) {
            this._conditionLastTimeAttackLocalHero = Tools.getOrAddComponent(this.node, 'ConditionLastTimeAttackLocalHero');
            this._conditionLastTimeAttackLocalHero.init();
        }

        if (cfg[AICfgType.PickKnife]) {
            this._conditionNearKnife = Tools.getOrAddComponent(this.node, 'ConditionNearKnife');
            this._conditionNearKnife.init();
        }

        this._conditionHighKnifeNum = Tools.getOrAddComponent(this.node, 'ConditionHighKnifeNum');
        this._conditionHighKnifeNum.init(entityPlayer);

        this._conditionHighKnifeNumNoPick = Tools.getOrAddComponent(this.node, 'ConditionHignKnifeNumNoPick');
        this._conditionHighKnifeNumNoPick.init(entityPlayer, cfg[AICfgType.NoPickKnifeNum]);

        const freshToward = !freshCfg[AIFreshCfgType.removeToward] || !freshCfg[AIFreshCfgType.removeToward][PlayerData.instance.playCount];
        if (cfg[AICfgType.TowardHero] && freshToward) {
            this._conditionTowardLocalHero = Tools.getOrAddComponent(this.node, 'ConditionTowardLocalHero');
            this._conditionTowardLocalHero.init();
        }

        if (cfg[AICfgType.HeroDefenceSilly]) {
            this._conditionLocalHeroDefenceSilly = Tools.getOrAddComponent(this.node, 'ConditionLocalHeroDefenceSilly');
            this._conditionLocalHeroDefenceSilly.init();
        }

        this._conditionHighKnifeNumLocalHero = Tools.getOrAddComponent(this.node, 'ConditionHighKnifeNumLocalHero');
        this._conditionHighKnifeNumLocalHero.init();

        if (cfg[AICfgType.KnifeMoreSilly]) {
            this._conditionKnifeMoreSilly = Tools.getOrAddComponent(this.node, 'ConditionKnifeMoreSilly');
            this._conditionKnifeMoreSilly.init();
        }

        this._conditionKnifeMoreThenLocalHero = Tools.getOrAddComponent(this.node, 'ConditionKnifeMoreThenLocalHero');
        this._conditionKnifeMoreThenLocalHero.init(entityPlayer);

        if (cfg[AICfgType.moreKnifeToward]) {
            this._conditionKnifeMuchMoreThenLocalHero = this.node.addComponent('ConditionKnifeMoreThenLocalHero');
            this._conditionKnifeMuchMoreThenLocalHero.init(entityPlayer, 4);

            this._conditionLowKnifeNumLocalHero = Tools.getOrAddComponent(this.node, 'ConditionLowKnifeNumLocalHero');
            this._conditionLowKnifeNumLocalHero.init();
        }

        if (cfg[AICfgType.peace]) {
            this._conditionLastTimePeace = Tools.getOrAddComponent(this.node, 'ConditionLastTimePeace');
            this._conditionLastTimePeace.init();
        }

        this._conditionLastTimeToward = Tools.getOrAddComponent(this.node, 'ConditionLastTimeToward');
        this._conditionLastTimeToward.init();
        this._towardTime = cfg[AICfgType.towardTime];

        this._conditionHasToward = Tools.getOrAddComponent(this.node, 'ConditionHasToward');
        // this._conditionHasToward.init();

        if (freshCfg[AIFreshCfgType.noPickNum] && freshCfg[AIFreshCfgType.noPickNum][PlayerData.instance.playCount]) {
            this._conditionNoMoreKnife = Tools.getOrAddComponent(this.node, 'ConditionNoMoreKnife');
            this._conditionNoMoreKnife.init(freshCfg[AIFreshCfgType.noPickNum][PlayerData.instance.playCount]);
        }

        this._conditionKilled = Tools.getOrAddComponent(this.node, 'ConditionKilled');
        this._conditionKilled.init(entityPlayer);

        if (cfg[AICfgType.ReviveTotal]) {
            this._conditionReviveTotal = Tools.getOrAddComponent(this.node, 'ConditionReviveTotal');
            this._conditionReviveTotal.init(cfg[AICfgType.ReviveTotal]);
        }

        this._actionMove = Tools.getOrAddComponent(this.node, 'ActionMove');
        this._actionMove.init();

        this._actionDefence = Tools.getOrAddComponent(this.node, 'ActionDefence');
        this._actionDefence.init(cfg[AICfgType.DefenceTime]);
        if (freshCfg[AIFreshCfgType.noDefence] && freshCfg[AIFreshCfgType.noDefence][PlayerData.instance.playCount]) {
            this._actionDefence.init(freshCfg[AIFreshCfgType.noDefence][PlayerData.instance.playCount]);
        }


        this._doOneTimeCondition();
    },

    _doOneTimeCondition: function () {
        if (this._conditionAISlow) {
            this._conditionAISlow.doResult();
            if (this._conditionAISlow.isTrue()) {
                // if (this._actionMove) {
                // this._actionMove.initWithParam(this._conditionAISlow.result);
                // }
                this.node.emit('changeSpeedRate', this._conditionAISlow.result);
            }
        }

        if (this._conditionFindeNextPos) {
            this._conditionFindeNextPos.doResult();
            if (this._conditionFindeNextPos.isTrue()) {
                this._actionMove.setNextPos(this._conditionFindeNextPos.result);
            }
        }

        if (this._conditionLastTimePeace) {
            this._conditionLastTimePeace.doResultWithParam(10.0);
        }
    },

    // updateGameLogic: function (dt) {}

    updateGameLogic: function (dt) {
        this._switchCurAction(dt);
        this._updateCurAction(dt);
        this._checkNextAction(dt);
    },

    _switchCurAction: function (dt) {

        if (this._conditionInThenOutLocalHero && this._conditionInThenOutLocalHero.isTrue()) {
            // 判断我先离玩家近之后玩家离开了我的碰撞范围，立刻暂停当前的行为
            this._actionSeq = [];
            if (this._curAction) {
                this._curAction.endAction();
            }
            this._conditionInThenOutLocalHero.clearResult();
        }


        if (this._conditionNearLocalHero && this._conditionNearLocalHero.isTrue()) {
            if (this._conditionLowKnifeNum) {
                this._conditionLowKnifeNum.doResult();
                if (this._conditionLowKnifeNum.isTrue()) {
                    // 刀的数量较少 逃跑

                    if (this._conditionFindEscapePos) {

                        this._conditionFindEscapePos.doResultWithParam([this._conditionNearLocalHero.result]);
                        if (this._conditionFindEscapePos.isTrue()) {
                            this._actionSeq = [];

                            this._actionMove.setNextPos(this._conditionFindEscapePos.result);
                            this._actionSeq.push(this._actionMove);
                            this._actionDefence.reset();
                            this._actionSeq.push(this._actionDefence);

                            this._curAction = this._actionSeq.shift();
                            this._curAction.startAction();

                            this._conditionNearLocalHero.clearResult();
                            this._conditionFindEscapePos.clearResult();
                            return;
                        }
                    }
                }
            }

            if (this._conditionLocalHeroDefence) {
                this._conditionLocalHeroDefence.doResult();
                if (this._conditionLocalHeroDefence.isTrue()) {
                    if (this._condtionLastTimeNearLocalHero) {
                        this._condtionLastTimeNearLocalHero.doResultWithParam(this._heroDefenceThinkTime);
                    }
                    if (!this._condtionLastTimeNearLocalHero || this._condtionLastTimeNearLocalHero.isTrue()) {
                        // 玩家处于龟缩
                        if (this._condtionLastTimeHeroDefence && this._condtionLastTimeHeroDefence.isTrue()) {
                            this._condtionLastTimeHeroDefence.doResultWithParam(0.5);
                            // 触发本次思考
                            if (!this._conditionLastTimePeace || this._conditionLastTimePeace.isTrue()) {
                                if (this._conditionLowKnifeNumLocalHero) {
                                    this._conditionLowKnifeNumLocalHero.doResult();
                                    if (this._conditionLowKnifeNumLocalHero.isTrue()) {
                                        if (this._conditionKnifeMuchMoreThenLocalHero) {
                                            this._conditionKnifeMuchMoreThenLocalHero.doResult();
                                            if (this._conditionKnifeMuchMoreThenLocalHero.isTrue()) {
                                                // 玩家刀不超过3把 ai刀比玩家多不少 直接冲过去杀人
                                                this._actionSeq = [];
                                                this._actionMove.setNextPos(this._conditionNearLocalHero.result.node.position);
                                                this._actionSeq.push(this._actionMove);

                                                this._curAction = this._actionSeq.shift();
                                                this._curAction.startAction();
                                                this._conditionNearLocalHero.clearResult();

                                                return;
                                            }
                                        }
                                    }
                                }
                            }

                            if (this._conditionRandomBool) {
                                this._conditionRandomBool.doResult();
                                if (this._conditionRandomBool.isTrue()) {
                                    // 龟缩
                                    // 玩家离我很近，玩家又处于龟缩，思考了0.5s后，随机进入龟缩，至少持续2s再做下次判断
                                    this._actionSeq = [];
                                    this._actionMove.setNextPos(this.node.position);
                                    this._actionSeq.push(this._actionMove);
                                    this._actionDefence.reset();
                                    this._actionSeq.push(this._actionDefence);

                                    this._curAction = this._actionSeq.shift();
                                    this._curAction.startAction();

                                    this._conditionNearLocalHero.clearResult();
                                    return;
                                }

                                this._conditionRandomBool.doResult();
                                if (this._conditionRandomBool.isTrue()) {
                                    // 玩家离我很近，玩家又处于龟缩，思考了0.5s后，决定找一个附近的位置磨蹭一下，0.5s后再判断
                                    // this._condtionLastTimeHeroDefence.doResultWithParam(0.5);

                                    if (this._conditionFindNoDangerPos && this._actionMove && !this._actionMove.isActionEnd()) {

                                        this._conditionFindNoDangerPos.doResultWithParam([
                                            [this._conditionNearLocalHero.result.node], this._actionMove.getNextPos()
                                        ]);
                                        if (this._conditionFindNoDangerPos.isTrue()) {
                                            // 周围有障碍物，通过我的目的地和与障碍物的相对位置，确定一个临时路点 并朝临时路点前进
                                            this._actionSeq = [];

                                            this._actionMove.setRoutePos(this._conditionFindNoDangerPos.result);
                                            this._actionSeq.push(this._actionMove);
                                            this._actionDefence.reset();
                                            this._actionSeq.push(this._actionDefence);

                                            this._curAction = this._actionSeq.shift();
                                            this._curAction.startAction();

                                            this._conditionNearLocalHero.clearResult();
                                            this._conditionFindNoDangerPos.clearResult();
                                            return;
                                        }
                                    }
                                } else {
                                    // 逃跑
                                    // 玩家离我很近，玩家又处于龟缩，思考了0.5s后，随机进入逃跑，至少持续2s再做下次判断
                                    if (this._conditionFindEscapePos) {

                                        this._conditionFindEscapePos.doResultWithParam([this._conditionNearLocalHero.result]);
                                        if (this._conditionFindEscapePos.isTrue()) {
                                            this._actionSeq = [];

                                            this._actionMove.setNextPos(this._conditionFindEscapePos.result);
                                            this._actionSeq.push(this._actionMove);
                                            this._actionDefence.reset();
                                            this._actionSeq.push(this._actionDefence);

                                            this._curAction = this._actionSeq.shift();
                                            this._curAction.startAction();

                                            this._conditionNearLocalHero.clearResult();
                                            this._conditionFindEscapePos.clearResult();
                                        }
                                    }
                                }
                            }

                        } else {
                            this._conditionNearLocalHero.clearResult();
                        }
                        return;
                    }
                } else {
                    if (this._condtionLastTimeHeroDefence) {
                        this._condtionLastTimeHeroDefence.clearResult();
                    }

                    if (this._condtionLastTimeNearLocalHero) {
                        this._condtionLastTimeNearLocalHero.clearResult();
                    }
                }
            }

            if (this._conditionLocalHeroDefenceSilly) {
                this._conditionLocalHeroDefenceSilly.doResult();
                if (this._conditionLocalHeroDefenceSilly.isTrue()) {
                    if (this._conditionHighKnifeNumLocalHero) {
                        this._conditionHighKnifeNumLocalHero.doResult();
                        if (this._conditionHighKnifeNumLocalHero.isTrue()) {
                            // 玩家离我很近 且处于龟缩 且刀子数量够 直接冲过去
                            this._actionSeq = [];
                            this._actionMove.setNextPos(this._conditionNearLocalHero.result.node.position);
                            this._actionSeq.push(this._actionMove);

                            this._curAction = this._actionSeq.shift();
                            this._curAction.startAction();
                            this._conditionNearLocalHero.clearResult();

                            return;
                        }
                    }
                }
            }

            if (this._conditionKnifeLessThenLocalHero) {
                this._conditionKnifeLessThenLocalHero.doResult();
                if (this._conditionKnifeLessThenLocalHero.isTrue()) {
                    // 刀的数量较玩家较少 随机选择防守或逃跑
                    if (this._conditionLastTimeAttackLocalHero) {
                        this._conditionLastTimeAttackLocalHero.doResultWithParam(0.5);
                    }
                    if (!this._conditionLastTimeAttackLocalHero || this._conditionLastTimeAttackLocalHero.isTrue()) {

                        if (this._conditionLastTimeHeroAttack && this._conditionLastTimeHeroAttack.isTrue()) {
                            this._conditionLastTimeHeroAttack.doResultWithParam(1.5);
                            // 触发本次思考
                            if (this._conditionRandomBool) {
                                this._conditionRandomBool.doResult();
                                if (this._conditionRandomBool.isTrue()) {
                                    // 龟缩
                                    // 玩家离我很近，玩家又处于龟缩，思考了0.5s后，随机进入龟缩，至少持续2s再做下次判断
                                    this._actionSeq = [];
                                    this._actionMove.setNextPos(this.node.position);
                                    this._actionSeq.push(this._actionMove);
                                    this._actionDefence.reset();
                                    this._actionSeq.push(this._actionDefence);

                                    this._curAction = this._actionSeq.shift();
                                    this._curAction.startAction();

                                    this._conditionNearLocalHero.clearResult();

                                } else {
                                    // 逃跑
                                    // 玩家离我很近，玩家又处于龟缩，思考了0.5s后，随机进入逃跑，至少持续2s再做下次判断
                                    if (this._conditionFindEscapePos) {

                                        this._conditionFindEscapePos.doResultWithParam([this._conditionNearLocalHero.result]);
                                        if (this._conditionFindEscapePos.isTrue()) {
                                            this._actionSeq = [];

                                            this._actionMove.setNextPos(this._conditionFindEscapePos.result);
                                            this._actionSeq.push(this._actionMove);
                                            this._actionDefence.reset();
                                            this._actionSeq.push(this._actionDefence);

                                            this._curAction = this._actionSeq.shift();
                                            this._curAction.startAction();

                                            this._conditionNearLocalHero.clearResult();
                                            this._conditionFindEscapePos.clearResult();
                                        }
                                    }
                                }
                            }
                        } else {
                            this._conditionNearLocalHero.clearResult();
                        }
                        return;
                    }
                }
            }

            if (this._conditionKnifeMoreSilly && this._conditionKnifeMoreSilly.isTrue()) {
                if (this._conditionKnifeMoreThenLocalHero) {
                    this._conditionKnifeMoreThenLocalHero.doResult();
                    if (this._conditionKnifeMoreThenLocalHero.isTrue()) {
                        // 刀比玩家多 人傻 逃跑
                        if (this._conditionFindEscapePos) {

                            this._conditionFindEscapePos.doResultWithParam([this._conditionNearLocalHero.result]);
                            if (this._conditionFindEscapePos.isTrue()) {
                                this._actionSeq = [];

                                this._actionMove.setNextPos(this._conditionFindEscapePos.result);
                                this._actionSeq.push(this._actionMove);
                                this._actionDefence.reset();
                                this._actionSeq.push(this._actionDefence);

                                this._curAction = this._actionSeq.shift();
                                this._curAction.startAction();

                                this._conditionNearLocalHero.clearResult();
                                this._conditionFindEscapePos.clearResult();
                                return;
                            }
                        }
                    }
                }
            }

            if (!this._conditionLastTimePeace || this._conditionLastTimePeace.isTrue()) {
                if (this._conditionHasToward && !this._conditionHasToward.isTrue()) {
                    if (this._conditionTowardLocalHero && this._conditionTowardLocalHero.isTrue()) {
                        if (this._conditionLastTimeToward) {
                            this._conditionLastTimeToward.doResultWithParam(Tools.getRandomFloat(this._towardTime, this._towardTime + 1));

                            if (this._conditionLastTimeToward.isTrue()) {
                                this._conditionHasToward.doResultWithParam(true);
                                this._actionSeq = [];
                                if (this._curAction) {
                                    this._curAction.endAction();
                                }
                            } else {
                                // 玩家离我很近，玩家没有龟缩，直接朝玩家发起进攻
                                this._actionSeq = [];
                                this._actionMove.setNextPos(this._conditionNearLocalHero.result.node.position);
                                this._actionSeq.push(this._actionMove);
                                // this._actionDefence.reset();
                                // this._actionSeq.push(this._actionDefence);

                                this._curAction = this._actionSeq.shift();
                                this._curAction.startAction();
                                this._conditionNearLocalHero.clearResult();

                                return;
                            }
                        }
                    }
                }
            }

            this._conditionNearLocalHero.clearResult();

        } else {
            if (this._condtionLastTimeNearLocalHero) {
                this._condtionLastTimeNearLocalHero.clearResult();
            }
            if (this._conditionLastTimeAttackLocalHero) {
                this._conditionLastTimeAttackLocalHero.clearResult();
            }
            if (this._conditionLastTimeToward) {
                this._conditionLastTimeToward.clearResult();
            }
            if (this._conditionHasToward) {
                this._conditionHasToward.clearResult();
            }
        }

        //判断周围是否有障碍
        if (this._conditionNearBlock && this._conditionNearBlock.isTrue()) {
            if (this._conditionFindNoDangerPos && this._actionMove && !this._actionMove.isActionEnd()) {

                this._conditionFindNoDangerPos.doResultWithParam([this._conditionNearBlock.result, this._actionMove.getNextPos()]);
                if (this._conditionFindNoDangerPos.isTrue()) {
                    // 周围有障碍物，通过我的目的地和与障碍物的相对位置，确定一个临时路点 并朝临时路点前进
                    this._actionSeq = [];

                    this._actionMove.setRoutePos(this._conditionFindNoDangerPos.result);
                    this._actionSeq.push(this._actionMove);
                    this._actionDefence.reset();
                    this._actionSeq.push(this._actionDefence);

                    this._curAction = this._actionSeq.shift();
                    this._curAction.startAction();

                    this._conditionNearBlock.clearResult();
                    this._conditionFindNoDangerPos.clearResult();
                    return;
                } else {
                    // 周围有障碍物，通过我的目的地和与障碍物的相对位置，确定不出临时路点，打断当前行为，期望再次寻路离开障碍
                    this._actionSeq = [];
                    if (this._curAction) {
                        this._curAction.endAction();
                    }
                }
            }
        }

        //判断周围是否有其他AI
        if (this._conditionNearAnotherAI && this._conditionNearAnotherAI.isTrue()) {
            if (!this._conditionHighKnifeNum || !this._conditionHighKnifeNum.isTrue()) {
                // 附近有ai 我刀还不够多 避让
                if (this._conditionFindEscapePos) {

                    this._conditionFindEscapePos.doResultWithParam(this._conditionNearAnotherAI.result);
                    if (this._conditionFindEscapePos.isTrue()) {
                        // 周围有其他AI 通过与其他AI的相对位置，反向逃跑
                        this._actionSeq = [];

                        this._actionMove.setNextPos(this._conditionFindEscapePos.result);
                        this._actionSeq.push(this._actionMove);
                        this._actionDefence.reset();
                        this._actionSeq.push(this._actionDefence);

                        this._curAction = this._actionSeq.shift();
                        this._curAction.startAction();

                        this._conditionNearAnotherAI.clearResult();
                        this._conditionFindEscapePos.clearResult();
                        return;
                    }
                }
            }
        }

        if (!this._curAction) {
            // 没有行动 根据优先级、条件、决定当前行动

            if (this._conditionNearKnife && this._conditionNearKnife.isTrue()) {
                if (this._conditionHighKnifeNumNoPick && !this._conditionHighKnifeNumNoPick.isTrue()) {
                    this._actionMove.setNextPos(this._conditionNearKnife.result.node.position);
                    this._actionSeq.push(this._actionMove);

                    this._curAction = this._actionSeq.shift();
                    this._curAction.startAction();

                    this._conditionNearKnife.clearResult();
                    return;
                }

            }

            // 寻路自己移动
            if (this._conditionFindeNextPos) {
                this._conditionFindeNextPos.doResult();
                if (this._conditionFindeNextPos.isTrue()) {
                    this._actionMove.setNextPos(this._conditionFindeNextPos.result);
                    this._actionSeq.push(this._actionMove);
                    this._actionDefence.reset();
                    this._actionSeq.push(this._actionDefence);

                    this._curAction = this._actionSeq.shift();
                    this._curAction.startAction();
                }
            }
        } else {


        }
    },

    _updateCurAction: function (dt) {
        if (this._curAction) {
            this._curAction.updateGameLogic(dt);
        }
    },

    _checkNextAction: function (dt) {
        if (this._curAction) {

            if (this._curAction.isActionEnd()) {
                // 当前行为结束 下一帧换成新的行为
                if (this._actionSeq.length > 0) {
                    this._curAction = this._actionSeq.shift();
                    this._curAction.startAction();
                } else {
                    this._curAction = null;
                }
            }
        }
    },

    addNearOther: function (other) {
        if (other.isLocal) {
            if (this._conditionNearLocalHero) {
                this._conditionNearLocalHero.doResultWithParam(other);
            }

            if (this._conditionInThenOutLocalHero) {
                this._conditionInThenOutLocalHero.doResultWithParam(true);
            }
        } else {
            if (this._conditionNearAnotherAI) {
                this._conditionNearAnotherAI.doResultWithParam(other);
            }
        }
    },

    leaveOther: function (other) {
        if (other.isLocal) {
            if (this._conditionInThenOutLocalHero) {
                this._conditionInThenOutLocalHero.doResultWithParam(false);
            }
        }
    },

    addNearBlock: function (block) {
        if (this._conditionNearBlock) {
            this._conditionNearBlock.doResultWithParam(block);
        }
    },

    addNearKnife: function (knife) {
        if (this._conditionNearKnife) {
            this._conditionNearKnife.doResultWithParam(knife);
        }
    },

    setLocalHero: function (hero) {
        if (this._conditionLocalHeroDefence) {
            this._conditionLocalHeroDefence.setLocalHero(hero);
        }

        if (this._conditionLocalHeroDefenceSilly) {
            this._conditionLocalHeroDefenceSilly.setLocalHero(hero);
        }

        if (this._conditionHighKnifeNumLocalHero) {
            this._conditionHighKnifeNumLocalHero.setLocalHero(hero);
        }

        if (this._conditionKnifeLessThenLocalHero) {
            this._conditionKnifeLessThenLocalHero.setLocalHero(hero);
        }

        if (this._conditionKnifeMoreThenLocalHero) {
            this._conditionKnifeMoreThenLocalHero.setLocalHero(hero);
        }

        if (this._conditionKnifeMuchMoreThenLocalHero) {
            this._conditionKnifeMuchMoreThenLocalHero.setLocalHero(hero);
        }

        if (this._conditionLowKnifeNumLocalHero) {
            this._conditionLowKnifeNumLocalHero.setLocalHero(hero);
        }
    },

    getNoMoreKnifeNum: function () {
        if (this._conditionNoMoreKnife) {
            return this._conditionNoMoreKnife.result;
        }
        return 999;
    },

    initWalls: function (type) {
        if (type === 1) {
            // 圆形地图
            this.node.emit('initWalls', type);
        }
    },

    onDie: function () {

        if (this._conditionKilled) {
            this._conditionKilled.doResult();
            if (this._conditionKilled.isTrue()) {
                this._actionSeq = [];
                if (this._curAction) {
                    this._curAction.endAction();
                }
                this._conditionKilled.clearResult();
            }
        }
    },

    getReviveTotal: function () {
        if( this._conditionReviveTotal) {
            return this._conditionReviveTotal.result;
        }
        return 0;
    }



});