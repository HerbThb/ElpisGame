// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        bgNode: cc.Node,
        wallNode: cc.Node,
        redBgNode: cc.Node,
        blackNode: cc.Node,
        redNode: cc.Node,
        moveSpeed: 0,
    },

    init: function (width, height) {
        this.rate = 1.39;
        width = this.rate * width;
        height = this.rate * height;
        this.bgNode.setContentSize(width, height);
        this.redBgNode.setContentSize(width, height);
        this.wallNode.setContentSize(width, height);

        this.reds = this.redNode.children;
        this.blacks = this.blackNode.children;
        this.setNodes(this.reds, width, height);
        this.setNodes(this.blacks, width, height);
    },

    setNodes: function (nodes, width, height) {
        nodes[0].position = cc.v2(-width / 2, 0);
        nodes[1].position = cc.v2(width / 2, 0);
        nodes[0].setContentSize(width, height * 2);
        nodes[1].setContentSize(width, height * 2);

        nodes[2].position = cc.v2(0, -height / 2);
        nodes[3].position = cc.v2(0, height / 2);
        nodes[2].setContentSize(width * 2, height);
        nodes[3].setContentSize(width * 2, height);
    },

    refreshNodes: function (nodes, dt) {
        var move = this.moveSpeed * dt * this.rate;
        nodes[0].x += move
        nodes[1].x -= move

        nodes[2].y += move
        nodes[3].y -= move
    },


    setMoveSpeed: function (speed) {
        this.moveSpeed = speed;
    },
    // LIFE-CYCLE CALLBACKS:
    startRedBg: function () {
        if (!this.redBgNode.active) {
            this.redBgNode.active = true;
            for (const node of this.reds) {
                node.active = true;
            }
        }
    },

    closeRedBg: function () {
        if (this.redBgNode.active) {
            this.redBgNode.active = false;
            for (const node of this.reds) {
                node.active = false;
            }
        }
    },

    updateGameLogic(dt) {
        var width = this.bgNode.width - this.moveSpeed * dt * 2 * this.rate;
        var height = this.bgNode.height - this.moveSpeed * dt * 2 * this.rate;

        this.bgNode.setContentSize(width, height);
        this.redBgNode.setContentSize(width, height);
        this.wallNode.setContentSize(width, height);

        this.refreshNodes(this.reds, dt);
        this.refreshNodes(this.blacks, dt);
    },

    // update (dt) {},
});