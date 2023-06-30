const Tools = require('Tools');


cc.Class({
    extends: cc.Component,

    properties: {
        posArr: [],
        posArrMaxLength: 30,
        shadowCount: 4,
        shadowPool: [],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init: function (iconUrl, parent) {
        // this.offset = this.node.position.sub(this.node.parent.position);
        this.canUpdate = true;
        for (let i = 0; i < this.shadowCount; i++) {
            let node = this.shadowPool[i]
            if (!node) {
                node = new cc.Node();
                node.parent = parent;
                node.opacity = (i + 1) / this.shadowCount * 255;
                this.shadowPool[i] = node;
                this.posArr[i] = this.node.position;
            }
            node.active = true;
            let sprite = Tools.getOrAddComponent(node, 'cc.Sprite');
            sprite.spriteFrame = null;
            cc.loader.loadRes(iconUrl, cc.SpriteFrame, (error, resource) => {
                if (error) {
                    cc.error(error);
                } else if (resource) {
                    sprite.spriteFrame = resource;
                }
            })
        }
    },

    close: function () {
        this.canUpdate = false;
        for (let i = 0; i < this.shadowCount; i++) {
            let node = this.shadowPool[i]
            node.active = false;
        }
    },

    updateGameLogic(dt) {
        if (this.canUpdate) {
            this.updateShadow(0.02)
        }
        // this.posArr.push(this.node.position);
        // if (this.posArr.length > this.posArrMaxLength) {
        //     this.posArr.splice(0, 1);
        // }
    },


    updateShadow: function (dt) {
        // console.log('-----------------------------')
        for (let i = 0; i < this.shadowCount; i++) {
            var node = this.shadowPool[i];
            var op = node.opacity - 255 * dt * 2
            if (op > 0) {
                node.opacity = op;
                var pos = this.posArr[i].sub(this.node.position);
                node.position = pos;
            } else {
                node.position = cc.v2(0, 0);
                this.posArr[i] = this.node.position;
                node.opacity = 255 + op;
            }
            node.scale = node.opacity / 255 * 0.5 + 0.5;
            // console.log(node.opacity)

            // node.opacity = (i + 1) / (this.shadowCount + 1) * 255;
            // var index = this.posArrMaxLength / this.shadowCount * (i + 1);
            // var pos = this.posArr[index];
            // if (pos) {
            //     pos = pos.sub(this.node.position);
            //     if (pos !== node.position) {
            //         node.position = pos;
            //     }
            // }

            // if (node.scale !== this.node.scale) {
            //     node.scale = this.node.scale;
            // }

        }
    },


});