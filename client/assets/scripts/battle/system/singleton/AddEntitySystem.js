/**
 * @fileoverview 创建实体系统
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const UIUtil = require('UIUtil');
const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');
const GameData = require('GameData');
const PoolType = require('Types').PoolType;
const GrowType = require('Types').GrowType;
const PlatformMgr = require('PlatformMgr');

const AddEntitySystem = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
        init: function (sys) {
            // if (AddEntitySystem.instance === null) {
            AddEntitySystem.instance = sys;
            // AddEntitySystem.instance.init();
            // }
        }
    },

    properties: {
        mapNode: cc.Node,
        itemNode: cc.Node,
        playerUIDown: cc.Node,
        playerEffectDown: cc.Node,
        playerNode: cc.Node,
        weaponNode: cc.Node,
        playerUIUpNode: cc.Node,
        playerEffectUpNode: cc.Node,
        playerEffectUpSecondNode: cc.Node,
        playerCtxParent: cc.Node,

        mapPrefab: cc.Prefab,

        wallNode: cc.Node,

        blockNode: cc.Node,

        effectNode: cc.Node,

        defencePrefab: cc.Prefab,
        diePrefab: cc.Prefab,

        nameLabelPrefab: cc.Prefab,
        nameNode: cc.Node,

        heroKnifeNumPrefab: cc.Prefab,
        heroFrenzyPrefab: cc.Prefab,

        rankIconPrefab: cc.Prefab,
        playerIconNode: cc.Node,

        // heroSkins: [cc.SpriteFrame],
        // rankIcons: [cc.SpriteFrame],

        buffNode: cc.Node,
        boxNode: cc.Node,
        bigEffectPrefab: cc.Prefab,
        fastEffectPrefab: cc.Prefab,
        hardEffectPrefab: cc.Prefab,
        magnetEffectPrefab: cc.Prefab,

        bigEffectTextPrefab: cc.Prefab,
        fastEffectTextPrefab: cc.Prefab,
        hardEffectTextPrefab: cc.Prefab,
        magnetEffectTextPrefab: cc.Prefab,

        defenceTipsPrefab: cc.Prefab,

        frenzyEffectPrefab: cc.Prefab,

        defenceStartPrefab: cc.Prefab,
        attackStartPrefab: cc.Prefab,

        arrowKnifePrefab: cc.Prefab,
        powerArrowPrefab: cc.Prefab,
        dangerousPrefab: cc.Prefab,

        pikaEffectPrefab: cc.Prefab,
        ctxPrefab: cc.Prefab,
        nezhaEffectPrefab: cc.Prefab,

        heroFlagPrefab: cc.Prefab,
        heroFlagNode: cc.Node,

        heroKeyPrefab: cc.Prefab,
        heroKeyNode: cc.Node,
        // _knifeID: 0,
        ultraEffectPrefab: cc.Prefab,

        guideNode: cc.Node,
        guidePrefab: cc.Prefab,
        // _knifeID: 0,
        yellowManEffectPrefab: cc.Prefab,
    },

    init: function (width, height, poolMgr, mapType) {
        this.poolMgr = poolMgr;
        this.mapType = mapType;
        this.setMapSize(width, height);
        this.mapZone = [
            [0, 0],
            [2, 2],
            [2, 0],
            [0, 2],
            [2, 1],
            [0, 1],
            [1, 0],
            [1, 2]
        ];
        // this.blockPoint = [[0,1],[1,0],[2,0],[3,1],[3,2],[2,3],[1,3],[0,2],[1,1],[2,1],[2,2],[1,2]];
        this.blockTypes = [PoolType.BLOCK, PoolType.BLOCK_01, PoolType.BLOCK_02, PoolType.BLOCK_03, PoolType.BLOCK_04, PoolType.BLOCK_05, PoolType.BLOCK_06, PoolType.BLOCK_07, PoolType.BLOCK_08];


        //初始化新刀
        this.tempKnifes = [];
    },

    setMapSize: function (width, height) {
        this.mapWidth = width;
        this.mapHeight = height;

        this.mapXs = [-width / 2, -width / 4, width / 4, width / 2];
        this.mapYs = [-height / 2, -height / 4, height / 4, height / 2];

        this.blockXs = [-width * 1 / 4, width * 1 / 4, Tools.getRandomInt(-width / 6, width / 6)];
        this.blockYs = [Tools.getRandomInt(-height / 6, height / 6), Tools.getRandomInt(-height / 6, height / 6), Tools.getRandomBool() ? -height * 1 / 4 : height * 1 / 4];
    },

    cleanUp: function () {
        this.mapNode.destroyAllChildren();
        this.playerNode.destroyAllChildren();
        this.weaponNode.destroyAllChildren();
        this.nameNode.destroyAllChildren();
        this.playerIconNode.destroyAllChildren();
        this.playerUIUpNode.destroyAllChildren();
        this.playerEffectUpSecondNode.destroyAllChildren();
        this.playerEffectUpNode.destroyAllChildren();
        this.itemNode.destroyAllChildren();
        this.playerUIDown.destroyAllChildren();
        this.playerEffectDown.destroyAllChildren();
        this.wallNode.destroyAllChildren();
        this.blockNode.destroyAllChildren();
        this.effectNode.destroyAllChildren();
        this.buffNode.destroyAllChildren();
        this.boxNode.destroyAllChildren();
        this.heroFlagNode.destroyAllChildren();
        this.heroKeyNode.destroyAllChildren();
        this.guideNode.destroyAllChildren();
    },

    // onLoad () {},

    // start () {},

    // update (dt) {},

    addMap: function (id, width, height) {
        const node = cc.instantiate(this.mapPrefab);
        const map = node.getComponent('EntityMap');
        node.parent = this.mapNode;

        map.init(id, width, height);

        return map;
    },

    /**
     * 创建玩家实体
     */
    _addEntityPlayer: function (isLocal, uid, tid, skin, name, x, y, rank, country, heroSkin, iconUrl, attackPower, defencePower, aiLevel, isKey) {
        const hero = this.poolMgr.getPlayer();
        const player = hero.getComponent('EntityPlayer');
        hero.parent = this.playerNode;
        hero.position = cc.v2(x, y);

        const heroFollow = this.poolMgr.getFollowPlayer();
        const followPlayer = heroFollow.getComponent('EntityFollowPlayer')
        heroFollow.parent = this.weaponNode;

        const heroNameNode = cc.instantiate(this.nameLabelPrefab);
        heroNameNode.parent = this.nameNode;
        var playerName = heroNameNode.getComponent('PlayerName');
        var nameLabel = playerName.nickname;
        nameLabel.string = name;
        var moveWithOwnerNode = Tools.getOrAddComponent(heroNameNode, 'MoveWithOwnerNode');
        moveWithOwnerNode.init(hero, playerName);
        var _scaleByOwner = Tools.getOrAddComponent(heroNameNode, 'ScaleByOwner');
        _scaleByOwner.init(hero);

        const heroRankNode = cc.instantiate(this.rankIconPrefab);
        heroRankNode.parent = this.playerIconNode;
        var comp = heroRankNode.getComponent('PlayerRankIcon');
        player._rankComp = comp;
        UIUtil.loadResSprite(comp.icon, rank.url);
        // this.loadRankSprite(comp.icon, rank.iconIndex);
        moveWithOwnerNode = Tools.getOrAddComponent(heroRankNode, 'MoveWithOwnerNode');
        moveWithOwnerNode.init(hero, comp);
        _scaleByOwner = Tools.getOrAddComponent(heroRankNode, 'ScaleByOwner');
        _scaleByOwner.init(hero);



        const knifeNumNode = cc.instantiate(this.heroKnifeNumPrefab);
        knifeNumNode.parent = this.playerUIUpNode;
        const knifeNum = knifeNumNode.getComponent('HeroKnifeNum');
        knifeNum.init(player);
        moveWithOwnerNode = Tools.getOrAddComponent(knifeNumNode, 'MoveWithOwnerNode');
        moveWithOwnerNode.init(hero, knifeNum);
        const scaleByOwner = Tools.getOrAddComponent(knifeNumNode, 'ScaleByOwner');
        scaleByOwner.init(hero);

        const flagNode = cc.instantiate(this.heroFlagPrefab);
        flagNode.parent = this.heroFlagNode;
        const heroFlag = flagNode.getComponent('HeroFlag');
        UIUtil.loadResFlag(heroFlag.icon, country);
        moveWithOwnerNode = Tools.getOrAddComponent(flagNode, 'MoveWithOwnerNode');
        moveWithOwnerNode.init(hero, heroFlag);
        _scaleByOwner = Tools.getOrAddComponent(flagNode, 'ScaleByOwner');
        _scaleByOwner.init(hero);
        player._flagNode = flagNode;
        player._flagComp = heroFlag;

        if (isKey) {
            const keyNode = cc.instantiate(this.heroKeyPrefab);
            keyNode.parent = this.heroKeyNode;
            const heroKey = keyNode.getComponent('HeroKey');
            moveWithOwnerNode = Tools.getOrAddComponent(keyNode, 'MoveWithOwnerNode');
            moveWithOwnerNode.init(hero, heroKey);
            _scaleByOwner = Tools.getOrAddComponent(keyNode, 'ScaleByOwner');
            _scaleByOwner.init(hero);
            player._keyNode = keyNode;
            player._keyComp = heroKey;
        }

        followPlayer.init(player);
        var canFrenzy = PlayerData.instance.rankData.id >= ConfigData.instance.clientData.frenzyLimit;
        player.init(isLocal, uid, followPlayer, tid, skin, playerName, rank, heroRankNode, country, heroSkin, iconUrl, attackPower, defencePower, aiLevel, canFrenzy, isKey);

        if (isLocal) {
            //暴走相关
            const frenzyNode = cc.instantiate(this.heroFrenzyPrefab);
            frenzyNode.parent = this.playerUIUpNode;
            const frenzyBar = frenzyNode.getComponent('HeroFrenzyBar');
            frenzyBar.init(player);
            moveWithOwnerNode = Tools.getOrAddComponent(frenzyNode, 'MoveWithOwnerNode');
            moveWithOwnerNode.init(hero, frenzyBar);
            const scaleByOwner = Tools.getOrAddComponent(frenzyNode, 'ScaleByOwner');
            scaleByOwner.init(hero);
            player._frenzyBar = frenzyNode;
            frenzyNode.active = false;




            if (rank.id < ConfigData.instance.clientData.tipsRankLimit) {
                const tipsNode = cc.instantiate(this.defenceTipsPrefab);
                tipsNode.parent = this.playerUIUpNode;
                player._defenceTips = tipsNode;
                tipsNode.active = false;
                moveWithOwnerNode = Tools.getOrAddComponent(tipsNode, 'MoveWithOwnerNode');
                moveWithOwnerNode.init(hero, tipsNode.getComponent(cc.Sprite));
                var scaleFix = Tools.getOrAddComponent(tipsNode, 'ScaleFix');
                scaleFix.init(hero);
            }
        } else {
            const powerArrowNode = cc.instantiate(this.powerArrowPrefab);
            powerArrowNode.parent = this.playerEffectUpSecondNode;
            var comp = powerArrowNode.getComponent('PowerArrow');
            player._powerArrow = comp;
            // const scaleByOwner = Tools.getOrAddComponent(powerArrowNode, 'ScaleByOwner');
            // scaleByOwner.init(hero);
        }

        this._createEffect(player);

        return player;
    },

    _createEffect: function (entityPlayer) {
        //防御特效
        entityPlayer._defenceEffect = this._createEntityEffect(this.defencePrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)
        var activeByOwner = Tools.getOrAddComponent(entityPlayer._defenceEffect.node, 'ActiveByOwner');
        activeByOwner.init(entityPlayer, entityPlayer._defenceEffect.activeNode);


        //切换至防御的特效
        // entityPlayer._defenceStartEffect = this._createEntityEffect(this.defenceStartPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)
        //切换至攻击的特效
        // entityPlayer._attackStartEffect = this._createEntityEffect(this.attackStartPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)

        //危险特效
        entityPlayer._dangerousEffect = this._createEntityEffect(this.dangerousPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpSecondNode)

        //buff特效
        entityPlayer._bigEffect = this._createEntityEffect(this.bigEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)
        entityPlayer._fastEffect = this._createEntityEffect(this.fastEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)

        entityPlayer._hardEffect = this._createEntityEffect(this.hardEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode, false)
        var scaleFix = Tools.getOrAddComponent(entityPlayer._hardEffect.node, 'ScaleFix');
        scaleFix.init(entityPlayer.node);

        entityPlayer._magnetEffect = this._createEntityEffect(this.magnetEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode, false)
        scaleFix = Tools.getOrAddComponent(entityPlayer._magnetEffect.node, 'ScaleFix');
        scaleFix.init(entityPlayer.node);

        entityPlayer._bigEffectText = this._createEntityEffect(this.bigEffectTextPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)
        entityPlayer._fastEffectText = this._createEntityEffect(this.fastEffectTextPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)
        entityPlayer._hardEffectText = this._createEntityEffect(this.hardEffectTextPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)
        entityPlayer._magnetEffectText = this._createEntityEffect(this.magnetEffectTextPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)

        entityPlayer._yellowManEffect = this._createEntityEffect(this.yellowManEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode)



        entityPlayer._frenzyEffect = this._createEntityEffect(this.frenzyEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpNode, false)
        scaleFix = Tools.getOrAddComponent(entityPlayer._frenzyEffect.node, 'ScaleFix');
        scaleFix.init(entityPlayer.node);

        //死亡特效
        const dieEffect = cc.instantiate(this.diePrefab);
        const effect = dieEffect.getComponent('EntityEffect');
        dieEffect.parent = this.playerEffectUpNode;
        entityPlayer._dieEffect = effect;
        var moveWithPlayer = Tools.getOrAddComponent(dieEffect, 'MoveWithOwnerNode');
        moveWithPlayer.init(entityPlayer.node, effect);

        dieEffect.active = false;
        entityPlayer.changeEffectColor();
        //皮卡丘需要加上特效和画闪电
        // if (entityPlayer.heroSkin && entityPlayer.heroSkin.id === 9) {
        entityPlayer._pikaKeepEffect = this._createEntityEffect(this.pikaEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpSecondNode)
        entityPlayer._pikaAttackEffect = this._createEntityEffect(this.ctxPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpSecondNode)
        entityPlayer._nezhaAttackEffect = this._createEntityEffect(this.nezhaEffectPrefab, 'EntityEffect', entityPlayer, this.playerUIDown)
        entityPlayer._ultraAttackEffect = this._createEntityEffect(this.ultraEffectPrefab, 'EntityEffect', entityPlayer, this.playerEffectUpSecondNode)

    },

    _createEntityEffect: function (prefab, comp, entityPlayer, parent, addScaleComp = true) {
        const effectNode = cc.instantiate(prefab);
        var effect = effectNode.getComponent(comp);
        effectNode.parent = parent;
        var moveWithPlayer = Tools.getOrAddComponent(effectNode, 'MoveWithOwnerNode');
        moveWithPlayer.init(entityPlayer.node, effect);
        if (addScaleComp) {
            const scaleByOwner = Tools.getOrAddComponent(effectNode, 'ScaleByOwner');
            scaleByOwner.init(entityPlayer.node);
        }

        return effect;
    },

    /**
     * 创建本地玩家 并把EntityPlayer返回给World
     * local玩家tid为1
     */
    AddLocalPlayer: function (num) {
        var name = PlayerData.instance.name;
        var rank = PlayerData.instance.rankData;
        var iconUrl = PlayerData.instance.iconUrl;
        var country = PlayerData.instance.country;

        var skin = null;
        var heroSkin = null

        if(PlayerData.instance.isInNFTRankGameMode()){
            skin = ConfigData.instance.getKnifeSkinById(PlayerData.instance.knifeNFTSkinId);
            heroSkin =  ConfigData.instance.getHeroSkinById(PlayerData.instance.heroNFTSkinId);
        }
        else{
            skin = PlayerData.instance.knifeSkin;
            heroSkin = PlayerData.instance.heroSkin;
        }

        // var growStage = ConfigData.instance.getCurGrowStage(PlayerData.instance.playCount, ConfigData.instance.clientData.growLimit);
        var attackPower = 0;
        var defencePower = 0;
        // if (growStage >= 2) {
        //     var attackLeveldata = PlayerData.instance.getGrowLevelDataByType(GrowType.Attack);
        //     if (attackLeveldata) attackPower = attackLeveldata.realParam;
        //     var defenceLeveldata = PlayerData.instance.getGrowLevelDataByType(GrowType.Defence);
        //     if (defenceLeveldata) defencePower = defenceLeveldata.realParam;
        // } else {
        //     if (GameData.instance.isShowLog()) {
        //         console.log('stage', growStage, '未开启破防，防御属性')
        //     }
        // }
        // const player = this._addEntityPlayer(true, 999, 1, skin, name, 0, 0, rank, heroSkin, iconUrl, attackPower, defencePower);
     

        const player = this._addEntityPlayer(true, 999, 1, skin, name, 0, 0, rank, country, heroSkin, iconUrl, attackPower, defencePower);

        player.myGuideComp = this._addPlayerGuide(player);
        player.myGuide = player.myGuideComp.node;

        var speedLevelData = PlayerData.instance.getGrowLevelDataByType(GrowType.Speed);
        if (speedLevelData) player.changeGrowSpeedAddition(speedLevelData.realParam);

        var stage = ConfigData.instance.getCurStage(PlayerData.instance.playCount, ConfigData.instance.clientData.adverReviveLimit);
        player._stage = stage;



        GameData.instance.localHeroTid = 1;

        return player;
    },


    _addPlayerGuide: function (player) {
        const guide = cc.instantiate(this.guidePrefab);
        const EntityGuide = guide.getComponent('EntityGuide');
        guide.parent = this.guideNode;
        guide.active = false;
        EntityGuide.init(player);
        return EntityGuide;
    },

    fliterSkin: function (skin, heroSkin) {
        if (GameData.instance.isInReview || ConfigData.instance.clientData.hideSpecialSkin) {
            if (skin && skin.isHideInReview) {
                skin = ConfigData.instance.knifeSkinDatas[0];
            }
            if (heroSkin && heroSkin.isHideInReview) {
                heroSkin = null;
            }
        }

        if (PlatformMgr.isIOS()) {
            if (skin && skin.isHideInIOS) {
                skin = ConfigData.instance.knifeSkinDatas[0];
            }

            if (heroSkin && heroSkin.isHideInIOS) {
                heroSkin = null;
            }
        }

        if (PlatformMgr.isApp()) {
            if (skin && skin.isHideInAndroidApp) {
                skin = ConfigData.instance.knifeSkinDatas[0];
            }

            if (heroSkin && heroSkin.isHideInAndroidApp) {
                heroSkin = null;
            }
        }
    },

    /**
     * 创建AI玩家 并把EntityPlayer返回给World
     * tid从2开始
     * @param {*} num 
     */
    AddRemotePlayer: function (num, skinMax, heroSkinRandomCount, heroSkinMax) {
        var ret = [];
        var x = 0;
        var y = 0;
        var player = null;
        var nameArr = [];
        var iconArr = [];
        // const aiStarDatas = ConfigData.instance.getAiStarDataByPlayerStar(PlayerData.instance.rankStar);

        const levelCfg = ConfigData.instance.getLevelCfg(PlayerData.instance.level);
        const levelMax = 7;
        for (var i = 0; i < num; i++) {



            //刀的皮肤
            var skin = ConfigData.instance.getRandomKnifeSkin(skinMax);

            //英雄皮肤
            var heroSkin = {};
            if (i < heroSkinRandomCount) {
                heroSkin = ConfigData.instance.getRandomHeroSkin(heroSkinMax, PlayerData.instance.heroSkin.id);
            } else {
                heroSkin = null;
            }

            if (heroSkin && heroSkin.suit && Math.random() < 0.5) {
                var suitData = ConfigData.instance.getSuitData(heroSkin.suit)
                skin = ConfigData.instance.getKnifeSkinById(suitData.knifeSkin);
            }

            this.fliterSkin(skin, heroSkin)

            var name = ConfigData.instance.getRandomAIName();
            var rank = ConfigData.instance.getRandomAIRank(i);
            if (nameArr) {
                while (Tools.arrContains(nameArr, name)) {
                    name = ConfigData.instance.getRandomAIName();
                }
                nameArr.push(name);
            }

            if (iconArr) {
                var iconUrl = ConfigData.instance.getRandomAIIcon();
                while (Tools.arrContains(iconArr, iconUrl)) {
                    iconUrl = ConfigData.instance.getRandomAIIcon();
                }
                iconArr.push(iconUrl);
            }

            x = Tools.getRandomInt(this.mapXs[this.mapZone[i][0]], this.mapXs[this.mapZone[i][0] + 1]);
            y = Tools.getRandomInt(this.mapYs[this.mapZone[i][1]], this.mapYs[this.mapZone[i][1] + 1]);



            var aiLevel = i;
            if (levelCfg) {
                aiLevel = aiLevel < levelCfg.strongNum ? levelMax - 1 : aiLevel;
                aiLevel = aiLevel >= levelMax - levelCfg.weakNum ? 0 : aiLevel;
            }


            // var aiStar = Tools.getRandomInt(aiStarDatas.minAiStars[aiLevel], aiStarDatas.maxAiStars[aiLevel] + 1);
            // var aiGrowData = ConfigData.instance.getAiGrowDataBystar(aiStar);

            // var growStage = ConfigData.instance.getCurGrowStage(PlayerData.instance.playCount, ConfigData.instance.clientData.growLimit);

            // var attackPower = growStage >= 2 ? aiGrowData.attackPower : 0;
            // var defencePower = growStage >= 2 ? aiGrowData.defencePower : 0;
            // var speedPower = growStage >= 1 ? aiGrowData.speedPower : 0;
            // var goldPower = growStage >= 1 ? aiGrowData.goldPower / 100 : 0;
            var attackPower = 0;
            var defencePower = 0;
            var speedPower = 0;
            var goldPower = 0;

            if (GameData.instance.isShowLog()) {
                if (levelCfg) {
                    console.log('level:' + aiLevel + ' strong: ' + levelCfg.strongNum + ' weak: ' + levelCfg.weakNum);
                }
            }


            var country = ConfigData.instance.getRandomCountry();
            // console.log(country);

            // skin = ConfigData.instance.getKnifeSkinById(30);
            // heroSkin = ConfigData.instance.getHeroSkinById(9);

            var isKey = i === (num - 1) && PlayerData.instance.canShowKeyInAI()

            player = this._addEntityPlayer(false, 100 + i, i + 2, skin, name, x, y, rank, country, heroSkin, iconUrl, attackPower, defencePower, aiLevel, isKey);
            ret[i] = player;
            player.myGuideComp = this._addPlayerGuide(player);
            player.myGuide = player.myGuideComp.node;


            // player.changeGrowSpeedAddition(speedPower);
            // player.setGoldAddition(goldPower);
        }

        return ret;
    },


    /**
     * 创建刀实体
     */
    _addEntityKnife: function (tid) {
        const node = this.poolMgr.getKnife();
        const knife = node.getComponent('EntityKnife');
        // knife.recycleSelf = () => {
        //     knife.node.opacity = 0;
        //     knife.knifeColliderNodeCtrl.attackCollider.notColliderFlag = true;
        //     this.tempKnifes.push(knife);
        // }
        node.parent = this.itemNode;
        // knife.changeID(this._knifeID);
        // this._knifeID ++;

        knife.init(tid, this.itemNode);
        knife.initWalls(this.mapType, this.mapWidth, this.mapHeight)
        return knife;
    },

    AddTempKnife: function () {
        // if (this.tempKnifes.length < 20) {
        //     var knife = this._addEntityKnife(0);
        //     knife.recycleSelf();
        // }
    },

    _returnTempKnife: function () {
        // var knife = this.tempKnifes.shift();
        // if (knife) {
        //     knife.node.opacity = 255;
        //     knife.knifeColliderNodeCtrl.attackCollider.notColliderFlag = false;
        // } else {

        var knife = this._addEntityKnife(0);
        // }
        return knife;
    },

    /***
     * 创建刀 并把EntityKnife返回给World
     * @param {*} num 
     */
    AddKnife: function (num, isGuide = false) {
        var ret = [];
        for (var i = 0; i < num; i++) {
            const knife = this._returnTempKnife();
            knife.node.position = cc.v2(Tools.getRandomInt(-this.mapWidth / 3, this.mapWidth / 3), Tools.getRandomInt(-this.mapHeight / 3, this.mapHeight / 3));
            knife.node.rotation = Tools.getRandomInt(0, 360);
            ret[i] = knife;

            if (isGuide) {
                const arrowEffect = cc.instantiate(this.arrowKnifePrefab)
                arrowEffect.active = false;
                arrowEffect.parent = this.effectNode;
                knife._arrowEffect = arrowEffect;
            }
        }
        return ret;
    },

    /**
     * 创建墙实体
     */
    _addEntityWall: function (tag) {
        const wall = this.poolMgr.getWall();;
        const entityWall = wall.getComponent('EntityWall');
        wall.parent = this.wallNode;
        entityWall.init(tag, this.mapWidth, this.mapHeight);

        return wall;
    },

    _addEntityCircleWall: function (tag) {
        const wall = this.poolMgr.getCircleWall();;
        const entityWall = wall.getComponent('EntityCircleWall');
        wall.parent = this.wallNode;
        entityWall.init(this.mapWidth, this.mapHeight);

        return wall;
    },

    AddWall: function (id) {
        var ret = [];
        switch (id) {
            case 0:
                for (var i = 0; i < 4; i++) {
                    var wall = this._addEntityWall(i);
                    if (i < 2) {
                        wall.y = (i === 0 ? 1 : -1) * (this.mapHeight / 2 + wall.height / 2);
                    } else {
                        wall.x = (i === 3 ? 1 : -1) * (this.mapWidth / 2 + wall.width / 2);
                    }
                    ret.push(wall);
                }
                break;
            case 1:
                var wall = this._addEntityCircleWall(i);
                ret.push(wall);
                break;
        }
        return ret;
    },


    AddBlock: function (num) {
        var ret = [];
        var x = 0;
        var y = 0;
        var block = null;
        // var usedPos = [];
        // var curIndex = -1;
        // var tryTime = 0;
        for (var i = 0; i < num; i++) {
            // curIndex = Tools.getRandomInt(0, this.blockPoint.length - 1);
            // while(usedPos[curIndex]) {
            //     curIndex ++;
            //     if(curIndex >= this.blockPoint.length) {
            //         curIndex = 0;
            //     }
            //     tryTime ++;
            //     if(tryTime > 5) {
            //         break;
            //     }
            // }

            // usedPos[curIndex] = true;
            x = this.blockXs[i % this.blockXs.length];
            y = this.blockYs[i % this.blockYs.length];
            block = this._addEntityBlock(x, y);
            // x = Tools.getRandomBool() ? Tools.getRandomInt(-this.mapWidth / 3, -this.mapWidth / 6) : Tools.getRandomInt(this.mapWidth / 6, this.mapWidth / 3);
            // y = Tools.getRandomBool() ? Tools.getRandomInt(-this.mapHeight / 3, -this.mapHeight / 6) : Tools.getRandomInt(this.mapHeight / 6, this.mapHeight / 3);

            ret[i] = block;
        }
        return ret;
    },

    /**
     * 创建障碍实体
     */
    _addEntityBlock: function (x, y) {
        var node = null;
        if (this.mapType === 0) {
            node = this.poolMgr.getBlock(this.blockTypes[Tools.getRandomInt(0, 100) % this.blockTypes.length]);
        } else {
            node = this.poolMgr.getCircleBlock();
            node.children[1].rotation = Math.floor(Math.random() * 360);
        }

        const entityBlock = node.getComponent('EntityBlock');
        node.parent = this.blockNode;
        entityBlock.init(x, y);
        return entityBlock;
    },


    /**
     * 创建特效实体
     */
    _addEntityCollisionEffect: function (pos, rotate) {
        const effect = this.poolMgr.getCollEffect();
        effect.parent = this.effectNode;
        var finalPos = this.effectNode.convertToNodeSpaceAR(pos);
        effect.position = finalPos;
        effect.rotation = rotate;
        return effect;
    },

    addCollisionEffect: function (pos, rotate) {
        var effect = this._addEntityCollisionEffect(pos, rotate);
        const eff = effect.getComponent('EntityEffect');
        eff.initAsAnim();

        return effect;
    },


    addDodgeEffect: function (pos) {
        const effect = this.poolMgr.getDodgeEffect();
        effect.parent = this.effectNode;;
        var finalPos = this.effectNode.convertToNodeSpaceAR(pos);
        effect.position = finalPos;

        const eff = effect.getComponent('EntityEffect');
        eff.initAsAnim();

        return effect;
    },

    addRebornEffect: function (pos) {
        const effect = this.poolMgr.getRebornEffect();
        effect.parent = this.effectNode;
        var finalPos = this.effectNode.convertToNodeSpaceAR(pos);
        effect.position = finalPos;

        const eff = effect.getComponent('EntityEffect');
        eff.initAsAnim();

        return effect;
    },

    addDestroyDefenceEffect: function (pos) {
        const effect = this.poolMgr.getDestroyDefenceffect();
        effect.parent = this.playerEffectUpSecondNode;;
        var finalPos = this.effectNode.convertToNodeSpaceAR(pos);
        effect.position = finalPos;

        const eff = effect.getComponent('EntityEffect');
        eff.initAsAnim();

        return effect;
    },

    addNeZhaEffect: function (pos) {
        const effect = this.poolMgr.getNeZhaffect();
        effect.parent = this.playerEffectUpSecondNode;;
        var finalPos = this.effectNode.convertToNodeSpaceAR(pos);
        effect.position = finalPos;
        const eff = effect.getComponent('EntityEffect');
        eff.initAsAnim();
        return effect;
    },
    /**
     * 创建刷刀特效实体
     */
    _addEntityShowKnifeEffect: function (pos) {
        const effect = this.poolMgr.getShowKnifeEffect();
        effect.parent = this.effectNode;
        var finalPos = pos; //this.effectNode.convertToNodeSpaceAR(pos);
        effect.position = finalPos;
        return effect;
    },


    addShowKnifeEffect: function (pos) {
        var effect = this._addEntityShowKnifeEffect(pos);
        const eff = effect.getComponent('EntityEffect');
        eff.initAsAnim();

        return effect;
    },

    /**
     * 创建buff实体
     */
    _addEntityBuff: function (id) {
        const node = this.poolMgr.getBuff();
        const buff = node.getComponent('EntityBuff');
        node.parent = this.buffNode;
        buff.init(id);
        return buff;
    },

    /***
     * 创建BUFF 并把EntityBuff返回给World
     * @param {*} num 
     */
    AddBuff: function (num, type) {
        var ret = [];
        for (var i = 0; i < num; i++) {
            // var id = Tools.getRandomInt(0, 3);
            const buff = this._addEntityBuff(type);
            buff.node.position = cc.v2(Tools.getRandomInt(-this.mapWidth / 3, this.mapWidth / 3), Tools.getRandomInt(-this.mapHeight / 3, this.mapHeight / 3));
            // knife.node.position = cc.v2(200,200);
            // knife.node.rotation = Tools.getRandomInt(0, 360);
            ret[i] = buff;
        }
        return ret;
    },




    /**
     * 创建box实体
     */
    _addEntityBox: function (data) {
        const node = this.poolMgr.getBox();
        const box = node.getComponent('EntityBox');
        node.parent = this.boxNode;
        box.init(data);
        return box;
    },

    /***
     * 创建box 并把EntityBox返回给World
     * @param {*} num 
     */
    AddBox: function (num, id) {
        var ret = [];
        for (var i = 0; i < num; i++) {
            // var id = Tools.getRandomInt(0, 3);
            var data = ConfigData.instance.getBoxDataById(id)
            const box = this._addEntityBox(data);
            box.node.position = cc.v2(Tools.getRandomInt(-this.mapWidth / 3, this.mapWidth / 3), Tools.getRandomInt(-this.mapHeight / 3, this.mapHeight / 3));
            // knife.node.position = cc.v2(200,200);
            // knife.node.rotation = Tools.getRandomInt(0, 360);
            ret[i] = box;
        }
        return ret;
    },






    //#region 由于主域空间不足，临时将英雄、段位图标绑在场景上使用 

    // _getHeroSkinSpriteFrame: function (index) {
    //     if (index < 0 || index >= this.heroSkins.length) {
    //         return null;
    //     }

    //     var sprite = this.heroSkins[index];
    //     return sprite;
    // },

    // loadHeroSkinSprite: function (sprite, index, callback) {
    //     sprite.spriteFrame = this._getHeroSkinSpriteFrame(index);
    //     if (callback) callback();
    // },

    // _getRankIconSpriteFrame: function (index) {
    //     if (index < 0 || index >= this.rankIcons.length) {
    //         return null;
    //     }

    //     var sprite = this.rankIcons[index];
    //     return sprite;
    // },

    // loadRankSprite: function (sprite, rankIndex) {
    //     sprite.spriteFrame = this._getRankIconSpriteFrame(rankIndex);
    // }

    //#endregion

});