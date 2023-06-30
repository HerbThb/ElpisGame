const KnifeMomentState = require('Types').KnifeMomentState;
const KnifeColliderState = require('Types').KnifeColliderState;
const GameData = require('GameData');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init: function (attackNode) {//, pickNode, landNode, attackHeroNode) {
        this.attackNode = attackNode;
        // this.pickNode = pickNode;
        // this.landNode = landNode;
        this.knifeStateComp = this.node.getComponent('KnifeStateComponent');

        this.attackCollider = attackNode.getComponent(cc.BoxCollider);
        // this.attackHeroCollider = attackHeroNode.getComponent(cc.BoxCollider);
        // this.pickCollider = pickNode.getComponent(cc.BoxCollider);
        // this.landCollider = landNode.getComponent(cc.BoxCollider);


        this.throwKnifeFinish();
    },


    // 被捡
    pickKnife: function () {
        // this.attackNode.active = true;
        // this.pickNode.active = true;
        // this.landNode.active = false;

        this.attackCollider.notColliderFlag = false;// this.attackCollider.tag !== GameData.instance.localHeroTid;
        // this.attackHeroCollider.notColliderFlag = this.attackHeroCollider.tag === GameData.instance.localHeroTid;
        // this.pickCollider.notColliderFlag = false;
        // this.landCollider.notColliderFlag = true;

        this.attackCollider.collState = KnifeColliderState.Attack;
    },



    throwKnifeStart: function () {
        // this.attackNode.active = false;
        // this.pickNode.active = false;
        // this.landNode.active = false;


        this.attackCollider.notColliderFlag = true;
        // this.attackHeroCollider.notColliderFlag = true;
        // this.pickCollider.notColliderFlag = true;
        // this.landCollider.notColliderFlag = true;
        this.attackCollider.collState = KnifeColliderState.Throw;

    },

    throwKnifeFinish: function () {
        // this.attackNode.active = false;
        // this.pickNode.active = false;
        // this.landNode.active = true;


        this.attackCollider.notColliderFlag = //true;
        // this.attackHeroCollider.notColliderFlag = true;
        // this.pickCollider.notColliderFlag = true;
        // this.landCollider.notColliderFlag = false;
        
        this.attackCollider.collState = KnifeColliderState.Land;
    },

    updateLogic: function (dt) {
        if (!this.knifeMomentStateComp) this.knifeMomentStateComp = this.node.getComponent('KnifeMomentStateComponent');

        //根据组件的状态做逻辑处理
        if (this.knifeMomentStateComp.isDirty) {
            switch (this.knifeMomentStateComp.state) {
                case KnifeMomentState.Capture:
                case KnifeMomentState.Init:
                    this.pickKnife();
                    break;
                case KnifeMomentState.Release:
                    this.throwKnifeStart();
                    break;
                case KnifeMomentState.ReleaseFinish:
                    this.throwKnifeFinish();
                    break;
            }
        }
    },
    // update (dt) {},
});