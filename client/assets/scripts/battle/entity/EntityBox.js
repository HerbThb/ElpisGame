const Tools = require('Tools');
const EntityBase = require('EntityBase');
const VibrateUtil = require('VibrateUtil');
cc.Class({
    extends: EntityBase,

    properties: {
        blood: 0,
        bloodLabel: cc.Label,
        activeNodes: [cc.Node],
        colliderNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(data) {
        this.data = data;
        this.blood = data.blood;
        this.bloodLabel.string = data.blood;
        this.id = data.id;

        this.nodeLandCollider = Tools.getOrAddComponent(this.colliderNode, 'NodeCollider');
        this.nodeLandCollider.init(this.node, true, true);

        for (const node of this.activeNodes) {
            node.active = false;
        }

        this.activeNodes[this.id].active = true;
        this.anim = this.activeNodes[this.id].getComponent(cc.Animation);
        this.anim.play(this.anim._clips[0]._name);


        this.node.on('onAttack', this.onAttack, this);
        this.node.on('onCollByKnife', this.onCollByKnife, this);
        this.node.on('onCollByBlock', this.onCollByBlock, this);
    },

    onCollByBlock(arr) {
        var self = arr[0];
        var other = arr[1];
        if (this.blood > 0) {
            var dir = other.node.position.add(other.node.parent.position).sub(self.node.parent.position).normalize();
            this.node.position = this.node.position.add(dir.mul(-10));
        }
    },

    onCollByKnife(arr) {
        var self = arr[0];
        var other = arr[1];
        if (this.blood > 0) {
            var dir = other.node.parent.getComponent('KnifeOwnerComponent').oldOwner.position.sub(self.node.parent.position).normalize();
            this.node.position = this.node.position.add(dir.mul(-10));
        }
    },

    onAttack(arr) {

        var self = arr[0];
        var other = arr[1];
        var world = arr[2];
        var isLocal = other.node.group === 'knife' ? true : false;
        if (this.blood <= 1) {
            if (!this.isPlaying) {
                this.blood--;
                if (isLocal) VibrateUtil.vibrate(true);
                this.anim.once('finished', () => {
                    this.isPlaying = false;
                    world.emit('onBoxDestroy', {
                        node: this.node,
                        data: this.data,
                        isLocal: isLocal,
                    });
                    this.recycleSelf();
                })
                this.isPlaying = true;
                this.anim.play(this.anim._clips[2]._name);
            }
        } else {
            if (!this.isPlaying) {
                this.blood--;
                if (isLocal) VibrateUtil.vibrate();
                world.emit('throwKnife', [self.node, other.node]);

                this.isPlaying = true;
                setTimeout(() => {
                    this.isPlaying = false;
                }, 100);
                this.anim.play(this.anim._clips[1]._name);
            }
        }
        this.bloodLabel.string = this.blood;
    },

    onDie(world) {


    },

    update(dt) {

    },
});