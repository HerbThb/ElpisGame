/**
 * @fileoverview 障碍实体
 * @author meifan@gameley.cn (梅凡)
 */

const Tools = require('Tools');
const EntityBase = require('EntityBase');

cc.Class({
    extends: EntityBase,

    properties: {
        defenceRects: [],
    },

    // onLoad () {}

    init: function (x, y) {
        this.node.position = cc.v2(x, y);

        // this.width = width;
        // this.height = height;

        // this.blockSpr.width = width;
        // this.blockSpr.height = height;

        // this.blockCollider.size.width = width;
        // this.blockCollider.size.height = height;

        const boxes = this.node.getComponentsInChildren(cc.BoxCollider);

        var rect = null;
        var xMin = x;
        var xMax = x;
        var yMin = y;
        var yMax = y;
        for (var box of boxes) {
            xMin = Math.min(xMin, x + box.node.x - box.size.width / 2);
            xMax = Math.max(xMax, x + box.node.x + box.size.width / 2);
            yMin = Math.min(yMin, y + box.node.y - box.size.height / 2);
            yMax = Math.max(yMax, y + box.node.y + box.size.height / 2);

            // 把box里的碰撞层拿到父节点 为ai计算提供方便
            box.node.parent = this.node.parent;
            box.node.position = cc.v2(x + box.node.x, y + box.node.y);

            rect = Tools.getOrAddComponent(box.node, 'DefenceRect');
            rect.init(box.size.width * 2, box.size.height * 2); //, false, false, 1.0, x + box.node.x - box.size.width / 2, y + box.node.y - box.size.height / 2);
            this.defenceRects.push(rect);
        }

        var circles = this.node.getComponentsInChildren(cc.CircleCollider);

        for (var circle of circles) {
            xMin = Math.min(xMin, x + circle.node.x - circle.radius / 2);
            xMax = Math.max(xMax, x + circle.node.x + circle.radius / 2);
            yMin = Math.min(yMin, y + circle.node.y - circle.radius / 2);
            yMax = Math.max(yMax, y + circle.node.y + circle.radius / 2);

            circle.node.parent = this.node.parent;
            circle.node.position = cc.v2(x + circle.node.x, y + circle.node.y);

            rect = Tools.getOrAddComponent(circle.node, 'DefenceRect');
            rect.init(circle.radius * 2, circle.radius * 2); //, false, false, 1.0, x + box.node.x - box.size.width / 2, y + box.node.y - box.size.height / 2);
            this.defenceRects.push(rect);
        }

        this.defenceRect = Tools.getOrAddComponent(this.node, 'DefenceRect');
        this.defenceRect.init((xMax - xMin) * 2, (yMax - yMin) * 2);
    },

    // start() {},

    // update (dt) {},
});