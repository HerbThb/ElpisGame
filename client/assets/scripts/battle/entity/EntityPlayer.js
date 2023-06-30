/**
 * @fileoverview 玩家实体
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const EntityBase = require('EntityBase');
const AudioEngine = require('AudioEngine');
const SoundID = require('Types').SoundID;
const NAME_COLOR = require('Types').NAME_COLOR;
const PlayerData = require('PlayerData');
const FrenzyAddType = require('Types').FrenzyAddType;
const HeroSkinProperty = require('Types').HeroSkinProperty;
const HeroRebornEffectState = require('Types').HeroRebornEffectState;
const StageType = require('Types').StageType;
const KnifeState = require('Types').KnifeState;

cc.Class({
    extends: EntityBase,

    properties: {
        colliderNode: cc.Node,
        // pickUpNode: cc.Node,
        isLocal: true,
        uid: 999,
        followPlayer: null,
        touchNode: cc.Node,
        rank: 0,
        isDead: false,
        isDefence: true,
        killNum: 0,
        pickKnifeCount: 0,
        killKnifeCount: 0,
        maxPickKnifeCount: 0,
        circleNode: cc.Node,
        _dieEffect: cc.Node,
        firstDead: false,
        waitToDie: false,
        reviveCount: 0,
        invincible: false,
        invincibleTime: 0,
        heroTeamIcon: cc.Sprite,
        heroIcon: cc.Sprite,
        scaleMultip: 2,
        // fastNode: cc.Node,
        shadowNode: cc.Node,
        isInView: false,
        goldAddition: 0,
        /** 初复活阶段 贤者模式 不杀人 半透明 */
        isSage: false,
        activeNode: cc.Node,

        ctx: cc.Graphics,
        lightTime: 0,
        redPope: cc.Node,
        rayNode: cc.Node,
        posArrowPool: [],
    },

    // onLoad () {}

    init: function (isLocal, uid, followPlayer, tid, knifeSkin, playerName, rank, rankIconNode, country, heroSkin, iconUrl, attackPower, defencePower, aiLevel, canFrenzy, isKey) {
        // console.error("hero init")
        this.isLocal = isLocal;
        this.uid = uid;
        this.followPlayer = followPlayer;
        this.teamID = tid;
        this.aiLevel = aiLevel;
        this.rankData = rank;
        this.rankIconNode = rankIconNode;
        this.rankIconNode.active = false;
        this.country = country;
        this.skin = knifeSkin;
        this.heroSkin = heroSkin;
        this.killNum = 0;
        this.pickKnifeCount = 0;
        this.killKnifeCount = 0;
        this.maxPickKnifeCount = 0;
        this.isKey = isKey;

        this.reviveCount = 0;
        this.name = playerName.nickname.string ? playerName.nickname.string : 'player';
        this.playerName = playerName;
        this.changeName(this.name);
        this.iconUrl = iconUrl;
        this.attackPower = attackPower;
        this.defencePower = defencePower;
        // this.playerName.node.color = NAME_COLOR[tid];

        this.heroMove = Tools.getOrAddComponent(this.node, 'HeroMove');

        this.heroScale = Tools.getOrAddComponent(this.node, 'HeroScale');
        this.heroScale.init(this);


        this.moveFixByBlock = Tools.getOrAddComponent(this.node, 'HeroMoveFixByBlock');
        this.moveFixByBlock.init(this.colliderNode.getComponent(cc.Collider));




        var nodeCollider = Tools.getOrAddComponent(this.colliderNode, 'NodeCollider');
        //TODO nodeCollider 需要设置初始队伍 changeColliderTag
        nodeCollider.init(this.node, true);
        this.nodeCollider = nodeCollider;

        // var nodePickCollider = Tools.getOrAddComponent(this.pickUpNode, 'NodeCollider');
        //TODO nodeCollider 需要设置初始队伍 changeColliderTag
        // nodePickCollider.init(this.node, false);

        this.bodyCollider = this.colliderNode.getComponent(cc.Collider);
        // this.pickCollider = this.pickUpNode.getComponent(cc.Collider);
        this.bodyCollider.tag = tid;
        // var colliders = this.node.getComponentsInChildren(cc.Collider);
        // for (var collider of colliders) {
        //     collider.tag = tid;
        // }
        this.logicPlayer = Tools.getOrAddComponent(this.node, 'LogicPlayer');
        this.logicPlayer.init(this);

        this.defenceRect = Tools.getOrAddComponent(this.node, 'DefenceRect');
        this.defenceRect.init(360, 360, true);

        this.attackRect = Tools.getOrAddComponent(this.node, 'AttackRect');
        this.attackRect.init(360, 360, true, false, 1.5);


        this.buffComp = Tools.getOrAddComponent(this.node, 'PlayerBuffComponent');
        this.buffChangeListener = Tools.getOrAddComponent(this.node, 'PlayerBuffChangeListener')
        this.buffChangeListener.init(this);

        if (canFrenzy) {
            this.playerFrenzyComp = Tools.getOrAddComponent(this.node, 'PlayerFrenzyComponent');
            this.playerFrenzyComp.init();
        } else {
            this.playerReviveFrenzyComp = Tools.getOrAddComponent(this.node, 'PlayerReviveFrenzyComponent');
            this.playerReviveFrenzyComp.init();
        }




        this.isDead = false;
        this.isInView = false;

        this.node.on('addBuff', this.addBuff, this);
        this.node.on('addKnife', this.addKnife, this);
        this.node.on('die', this.die, this);
        this.node.on('isCollCircleWall', this.isCollCircleWall, this);
        this.node.on('changeMagnet', this.changeMagnet, this);
        this.node.on('killByGuide', this.killByGuide, this);


        this.changeSkin();

        this.suitComp = Tools.getOrAddComponent(this.node, 'PlayerSuitComponent');
        this.suitComp.init(this);
    },





    changeSkin: function () {
        const self = this;
        self.heroTeamIcon.node.active = false;
        self.heroIcon.node.active = false;

        // if (self.heroSkin) {
        //     AddEntitySystem.instance.loadHeroSkinSprite(self.heroIcon, self.heroSkin.skinIndex, () => {
        //         if (self.heroSkin) {
        //             self.heroIcon.node.active = true;
        //         }
        //     });
        // } else {
        //     AddEntitySystem.instance.loadHeroSkinSprite(self.heroTeamIcon, (self.teamID - 1), () => {
        //         if (!self.heroSkin) {
        //             self.heroTeamIcon.node.active = true;
        //         }
        //     });
        // }
        if (self.heroSkin) {
            cc.loader.loadRes(self.heroSkin.url, cc.SpriteFrame, (error, resource) => {
                if (error) {
                    cc.error(error);
                } else if (resource) {
                    if (self.heroSkin) {
                        self.heroIcon.spriteFrame = resource;
                        self.heroIcon.node.active = true;
                    }
                }
            });


            //刷新皮肤属性效果
            switch (this.heroSkin.property) {
                case HeroSkinProperty.Speed:
                    this.heroMove.changeSkinSpeedAddition(this.heroSkin.propertyParam / 100);
                    this.openShadow()
                    break;
                default:
                    this.heroMove.changeSkinSpeedAddition(0);
                    this.closeShadow()
                    break;
            }
        } else {
            cc.loader.loadRes('texture/hero/player00' + self.teamID, cc.SpriteFrame, (error, resource) => {
                if (error) {
                    cc.error(error);
                } else if (resource) {
                    if (!self.heroSkin) {
                        self.heroTeamIcon.spriteFrame = resource;
                        self.heroTeamIcon.node.active = true;
                    }
                }
            });

            this.heroMove.changeSkinSpeedAddition(0);
            this.closeShadow()
        }

        this.changeSuit();
    },

    changeKnifeSkin: function (knifeSkin) {
        this.skin = knifeSkin;
        this.changeSuit();
    },

    changeSuit: function () {
        if (this.skin && this.heroSkin) {
            if (this.skin.suit && this.heroSkin.suit && (this.skin.suit === this.heroSkin.suit)) {
                this.suit = this.skin.suit;
            } else {
                this.suit = null;
            }
        } else {
            this.suit = null;
        }

        if (this.suitComp) {
            this.suitComp.changeSuit();
        }
    },
    changeEffectColor: function () {
        if (this.heroSkin) {
            this._defenceEffect.changeColorByHex(this.heroSkin.hexColor);
            this._dieEffect.changeColorByHex(this.heroSkin.hexColor);
        } else {
            this._defenceEffect.changeColor(this.teamID);
            this._dieEffect.changeColor(this.teamID);
        }
    },

    startGame: function (isGuide) {
        // console.error("hero startGame")
        this.isStartGame = true;
        this.followPlayer.node.emit('startGame', isGuide);
        this.rankIconNode.active = true;
        this.playerName.frameNode.active = false;
        if (this._frenzyBar) {
            this._frenzyBar.active = true;
        }
        if (this.isLocal) {
            // const playSoundByOwner = Tools.getOrAddComponent(this.node, 'PlaySoundByOwner');
            // playSoundByOwner.init(this);
            this.moveByKeyboard = Tools.getOrAddComponent(this.node, 'MoveByKeyboard');
            // this.heroMove = Tools.getOrAddComponent(this.node, 'HeroMove');

            this.moveByTouch = Tools.getOrAddComponent(this.touchNode, 'MoveByTouch');
            this.moveByTouch.init(this);

            this.MoveStateNotice = Tools.getOrAddComponent(this.node, 'MoveStateNotice');
            this.MoveStateNotice.init(this, this.followPlayer.knivesCmp);

            if (this.canFrenzyBorn) {
                this.node.emit('onFrenzyAdd', FrenzyAddType.tryFrenzy);
            } else if (this.canAddBornFrenzy) {
                this.node.emit('onFrenzyAdd', FrenzyAddType.born);
            }

        } else {
            if (!isGuide) {
                this.aiMgr = Tools.getOrAddComponent(this.node, 'AIMgr');
                this.aiMgr.init(this.heroMove.moveSpeed, this.aiLevel, this);
            }
            // var moveAI = Tools.getOrAddComponent(this.node, 'MoveAI');
            // this.heroMove = Tools.getOrAddComponent(this.node, 'HeroMove');

            // moveAI.init(heroMove.moveSpeed);
        }
    },

    beKilled: function () {
        return this.isDead || this.firstDead;
    },

    die: function (knife, forceDie = false) {
        // console.log('player die, killTid is ', + knife.tag)
        // if (this.isLocal) {
        // 分享复活决定的无敌
        if (this.invincible) {
            return;
        }

        // buff决定的无敌
        if (this.isInvincible() && !forceDie) {
            return;
        }

        var canRevive = this._stage !== StageType.Free || this.reviveCount === 0;

        if (!this.firstDead && canRevive) {
            this.firstDead = true;
            this.waitToDie = true;
            this.reviveTime = 5;
            this.waitToRevive = false;
            this.showRebornEffect = HeroRebornEffectState.Close;

            if (this.moveByTouch) {
                this.moveByTouch.touchEndEvent();
            }

            this.touchNode.active = false

            // this.followPlayer.knifeCollisionSoundCtrl.stop();
            // this.followPlayer.node.active = false;
            // this.followPlayer.knivesCmp.emitAllKnivesRelease();
            this.rankIconNode.active = false;
            this._flagNode.active = false;
            if (this._keyNode) this._keyNode.active = false;
            this.followPlayer.die();
            this.buffComp.die();
            this.suitComp.die();
            if (this.aiMgr) {
                this.aiMgr.onDie();
            }

            this.activeNode.active = false;
            this.bodyCollider.notColliderFlag = true;
            // this.pickCollider.notColliderFlag = true;
            this.playerName.node.active = false;
            if (this._defenceTips) this._defenceTips.active = false;
            if (this._defenceStartEffect) this._defenceStartEffect.node.active = false;
            if (this._attackStartEffect) this._attackStartEffect.node.active = false;


            if (knife && knife.node) {
                var followPlayer = knife.node.parent.parent.getComponent('EntityFollowPlayer');
                var guide = knife.node.parent.getComponent('EntityGuide');
                if (followPlayer) {
                    this.killer = followPlayer.player;
                } else if (guide) {
                    this.killer = guide.player;
                } else {
                    this.killer = null;
                }

                if (this.killer) {
                    this.killer.addKillNum(this);
                }
            }

            this._dieEffect.node.active = true;
            this._dieEffect.playParticle();
            if (this.isLocal && knife) {
                AudioEngine.instance.playSound(SoundID.Death);
            } else {
                AudioEngine.instance.playSound(SoundID.Kill);
            }
            return;
        }

        if (this.waitToDie) {
            return;
        }
        // }

        if (!this.isDead) {
            this.isDead = true;
            if (this.moveByTouch) {
                this.moveByTouch.touchEndEvent();
            }
            this.followPlayer.die();
            this.buffComp.die();
            this.suitComp.die();
            if (this.aiMgr) {
                this.aiMgr.onDie();
            }
            this.activeNode.active = false;
            this.bodyCollider.notColliderFlag = true;
            // this.pickCollider.notColliderFlag = true;
            this.playerName.node.active = false;
            this.rankIconNode.active = false;
            this._flagNode.active = false;
            if (this._keyNode) this._keyNode.active = false;
            if (knife && knife.node) {
                var followPlayer = knife.node.parent.parent.getComponent('EntityFollowPlayer');
                this.killer = followPlayer ? followPlayer.player : null;
                if (this.killer) {
                    this.killer.addKillNum(this);
                }
            }

            this._dieEffect.node.active = false;
            if (this._defenceTips) this._defenceTips.active = false;
            if (this._defenceStartEffect) this._defenceStartEffect.node.active = false;
            if (this._attackStartEffect) this._attackStartEffect.node.active = false;


            if (this.isLocal && knife) {
                AudioEngine.instance.playSound(SoundID.Death);
            } else {
                // AudioEngine.instance.playSound(SoundID.Kill);
            }
            if (this.deadCallbcak) {
                this.deadCallbcak(this.node.position);
            }
        }
    },

    revive: function (isFrenzy) {

        this.firstDead = false;
        this.waitToDie = false;
        this.activeNode.active = true;
        this.touchNode.active = true
        this.bodyCollider.notColliderFlag = false;
        // this.pickCollider.notColliderFlag = false;
        this.playerName.node.active = true;
        this.followPlayer.node.active = true;
        this.rankIconNode.active = true;
        this._flagNode.active = true;
        this._dieEffect.node.active = false;
        this.reviveCount++;
        this.flag = false;
        if (this._keyNode) this._keyNode.active = this.isKey;

        if (this.isLocal) {
            this.invincible = true;
            this.invincibleTime = 2.0;
        }
        if (isFrenzy) {
            this.node.emit('onReviveFrenzyAdd', FrenzyAddType.revive);
        }
        // this.setSage(true);
    },

    updateDieLogic: function (dt) {
        if (this.invincible) {
            this.invincibleTime -= dt;
            if (this.invincibleTime < 0) {
                this.invincible = false;
                // this.setSage(false);
            }
        }
    },

    setSage: function (value) {
        // this.isSage = value;
        // this.node.opacity = value ? 128 : 255;
        // this.followPlayer.node.emit('setSage', value);
    },

    updateReviveLogic: function (dt) {
        if (this.firstDead) {
            this.reviveTime -= dt;
            if (this.reviveTime < 0) {
                this.waitToRevive = true;
            } else if (this.reviveTime < 2) {
                if (this.showRebornEffect === HeroRebornEffectState.Close) {
                    this.showRebornEffect = HeroRebornEffectState.waitToShow;
                }
            }
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
                this.moveFix.init(this.colliderNode.getComponent(cc.Collider), this.followPlayer);
                this.moveFix.refresh(width, height);
                break;
        }
        if (this.aiMgr) {
            this.aiMgr.initWalls(type);
        }
        if (this.myGuideComp) {
            this.myGuideComp.initWalls(type, walls, width, height);
        }
    },

    refreshWalls: function (width, height) {
        this.moveFix.refresh(width, height);
        this.myGuideComp.moveFix.refresh(width, height)
    },


    addKnife: function (detail) {
        if (this.isNoMoreKnife()) {
            detail.getComponent('EntityKnife').reLand();
        } else {
            this.followPlayer.knivesCmp.addKnife(detail);
        }
    },

    addBuff: function (buffId) {
        if (this.beKilled()) return;
        this.node.emit('updateBuffState', buffId);
    },

    /** @override */
    updateGameLogic: function (dt, world) {

        var knifes = world.knifes;
        this.updateDieLogic(dt);

        if (!this.beKilled() && this.aiMgr) {
            this.aiMgr.updateGameLogic(dt);
        }

        this.heroMove.updateGameLogic(dt);
        this.heroScale.updateGameLogic(dt);
        this.moveFixByBlock.updateGameLogic(dt);
        if (this.moveFix) {
            this.moveFix.updateGameLogic(dt);
        }
        if (this.moveGuideFix) {
            this.moveGuideFix.updateGameLogic(dt);
        }

        this.followPlayer.updateGameLogic(dt);
        this.logicPlayer.updateLogic(dt);

        if (this.speedShadow) this.speedShadow.updateGameLogic(dt);
        if (this.canMagnet) this.updateMagnetLogic(dt, knifes)


        this.buffComp.updateGameLogic(dt);
        if (!this.beKilled()) {
            this.suitComp.updateGameLogic(dt, world, knifes);
        }

        if (this.updateKey) {
            world.updateKeyCount(this.otherKeyNode);
            this.updateKey = false;
        }
        // if (this.isLocal) this.updateLightingLogic(dt, world, knifes);
        // this.drawLighting();
    },
    // update (dt) {},

    getKnifeNum: function () {
        return this.followPlayer.knivesCmp.getKnifeNum();
    },

    stopControl: function () {
        console.log("stopControl====>")
        this.isStopCtrl = true;
        this.moveByKeyboard.enabled = false;
        this.moveByTouch.enabled = false;
        this.MoveStateNotice.enabled = false;
        this.touchNode.active = false
    },

    changeName: function (name) {
        this.name = name ? name : 'player';
        this.playerName.nickname.string = this.name;
        var width = Tools.getStrlen(this.name) * 10 + 10;
        this.playerName.frameNode.width = width
        this._rankComp.bg.width = width;
        this._rankComp.icon.node.x = width / 2;
        this._flagComp.icon.node.x = -width / 2;
        this.nameDirty = true;
    },

    setLocalHero: function (hero) {
        if (!this.isLocal && this.aiMgr) {
            this.aiMgr.setLocalHero(hero);
        }

    },


    setInView: function (isShow) {
        // if (this.playerName.node.active !== isShow && !this.beKilled()) {
        //     this.playerName.node.active = isShow && !this.beKilled();
        // }

        this.isInView = isShow;
    },

    heroStartMove: function () {
        if (this.isStopCtrl) return;
        this.isDefence = false;
        this.invincible = false;
        if (this._defenceTips) {
            // this._defenceTips.active = false;
        }
        if (this._attackStartEffect && !this.isDead) {
            if (this._defenceStartEffect) this._defenceStartEffect.node.active = false;
            this._attackStartEffect.node.active = true;
            this._attackStartEffect.play();
        }
    },

    heroStopMove: function () {
        if (this.isStopCtrl) return;
        this.isDefence = true;
        if (this._defenceTips && !this.isCollisionWall & !this.isDead) {
            // this._defenceTips.active = true;
        }
        if (this._defenceStartEffect && !this.isCollisionWall & !this.isDead) {
            if (this._attackStartEffect) this._attackStartEffect.node.active = false;
            this._defenceStartEffect.node.active = true;
            this._defenceStartEffect.play();
        }
    },


    setFinalRank: function (rank) {
        if (!this.flag) {
            this.flag = true;
            this.rank = rank;
        }
    },

    setKillCallback: function (callback) {
        this.killCallbcak = callback;
    },

    setDeadCallback: function (callback) {
        this.deadCallbcak = callback;
    },

    setChangeKnifeCountCallback: function (callback) {
        this.changeKnifeCountCallback = callback;
    },


    addKillNum: function (other) {
        if (this.isLocal && other.isKey) {
            other.isKey = false;
            this.updateKey = true;
            this.otherKeyNode = other.node;
        }
        this.killNum++;
        // this.node.emit('onFrenzyAdd', FrenzyAddType.kill);
        this.node.emit('onFrenzyAdd', FrenzyAddType.kill);
        if (this.killCallbcak) this.killCallbcak();
    },

    addKnifeNum: function (knifeCount) {
        if (!this.isLocal) return
        this.pickKnifeCount++;
        this.maxPickKnifeCount = Math.max(this.maxPickKnifeCount, knifeCount);
        // console.log('累计刀数 ', this.pickKnifeCount)
        // console.log('最大刀数 ', this.maxPickKnifeCount)
    },

    //拼掉对手飞刀的数量
    addKillKnifeNum: function () {
        if (!this.isLocal) return
        this.killKnifeCount++;
        // console.log('累计拼掉刀数 ', this.pickKnifeCount)
    },

    //#region buff属性
    isHard: function () {
        var ret = false;

        if (this.buffChangeListener) {
            ret = this.buffChangeListener.isHard();
        }

        return ret;
    },

    isInvincible: function () {
        var ret = false;

        if (this.buffChangeListener) {
            ret = this.buffChangeListener.isInvincible();
        }

        return ret;
    },

    isFrenzy: function () {
        var ret = false;

        if (this.playerFrenzyComp) {
            ret = this.playerFrenzyComp.isFrenzy();
        } else if (this.playerReviveFrenzyComp) {
            ret = this.playerReviveFrenzyComp.isFrenzy();
        }

        return ret;
    },
    //#endregion

    isNoMoreKnife: function () {
        return !this.isInView && this.aiMgr && this.getKnifeNum() >= this.aiMgr.getNoMoreKnifeNum();
    },

    canRevive: function () {
        return this.aiMgr && this.reviveCount < this.aiMgr.getReviveTotal();
    },

    refreshPowerArrow: function (localPlayer) {
        if (this._powerArrow) this._powerArrow.refresh(this, localPlayer);
    },

    closePowerArrow: function () {
        if (this._powerArrow) this._powerArrow.close();
    },

    changeAttackPower: function (count) {
        this.attackPower = count;
    },

    changeDefencePower: function (count) {
        this.defencePower = count;
    },

    setGoldAddition: function (count) {
        this.goldAddition = count;
    },

    changeGrowSpeedAddition: function (count) {
        this.heroMove.changeGrowSpeedAddition(count);
    },

    isCollCircleWall: function (state) {
        this.followPlayer.node.emit('isCollCircleWall', state);
    },

    showTips: function (type) {
        if (this.beKilled() || !this._defenceTips) return;
        if (this.tipsType === type) return;
        this.tipsType = type;
        if (!this._defenceTips.active) this._defenceTips.active = true;

        var tips = this._defenceTips.children[1].children;
        var bubble = this._defenceTips.children[0];
        if (!tips) return;
        for (let i = 0; i < tips.length; i++) {
            var tip = tips[i];
            if (!tip) return;
            if (i === type) {
                tip.active = true;
                if (bubble) bubble.width = 50 + tip.width;
            } else {
                tip.active = false;
            }
        }
    },

    closeTips: function (type) {
        if (this.tipsType === null) return;
        this.tipsType = null;
        if (this._defenceTips) {
            this._defenceTips.active = false;
            var tips = this._defenceTips.children[1].children;
            for (let i = 0; i < tips.length; i++) {
                var tip = tips[i];
                if (!tip) return;
                tip.active = false;
            }
        }
    },

    changeMagnet: function (state) {
        this.canMagnet = state;
    },



    updateMagnetLogic: function (dt, knifes) {

        var multip = this.heroScale.newScaleMultip;
        var newScale = ((this.node.scale - multip) / 1.5) + multip;
        var index = 0;
        for (const knife of knifes) {
            if (knife.teamID === 0 && knife.knifeStateComp.state === KnifeState.Normal && !knife.knifeColliderNodeCtrl.attackCollider.notColliderFlag) {
                // var worldPos = knife.node.parent.convertToWorldSpaceAR(knife.node.position);
                // var dir = this.node.convertToNodeSpaceAR(worldPos);
                // var dis = dir.mag()
                var dir = knife.node.position.sub(this.node.position);
                var dis = dir.mag();
                // knife.dislabel.string = Math.floor(dis);
                if (dis < (380 * newScale)) {
                    index++;
                    // knife.node.emit('onPickUpKnife', this.pickCollider);
                    dir = dir.normalize().mul(20)
                    var finalPosition = knife.node.position.sub(dir);
                    // knife.draw(this.node.position);
                    knife.knifeMoveCtrl.finalPosition = finalPosition;
                }
            }
        }
    },

    updateLightingLogic(dt, world, knifes) {

    },

    showNameNode: function (show) {
        this.playerName.node.active = show;
        this._flagNode.active = show;
    },

    setScale: function (scale) {
        this.node.emit('changeScaleMultip', scale);
        this.followPlayer.node.emit('changeScaleMultip', scale);
    },
    changeColliderState(state) {
        this.nodeCollider.node.active = state;
        this.followPlayer.changeColliderState(state);
    },

    killByGuide() {
        this.node.emit('onStopMove', true);
    },

    changePosArrTarget(target) {
        var length = this.posArrowPool.length;
        for (let i = 0; i < length; i++) {
            var posArr = this.posArrowPool[i];
            posArr.changeLocalPlayer(target);
        }
    },

    openShadow() {
        this.speedShadow = Tools.getOrAddComponent(this.node, 'SpeedShadow');
        this.speedShadow.init(this.heroSkin.url, this.shadowNode);
    },

    closeShadow() {
        if (this.speedShadow) this.speedShadow.close();
    },

    changeOpacity(opacity) {
        this.node.opacity = opacity;
        this.followPlayer.node.opacity = opacity;
    }
});