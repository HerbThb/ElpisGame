/**
 * @fileoverview buff实体
 * @author zhangzhuang@gameley.cn (张庄)
 */

const Tools = require('Tools');
const EntityBase = require('EntityBase');

cc.Class({
    extends: EntityBase,

    properties: {
        attackNode: cc.Node,
        pickNode: cc.Node,
        landNode: cc.Node,
        skinNode: cc.Node,
    },

    init(state) {
        this.buffState = state;
        var skin = this.skinNode.children[state];
        if (skin) {
            skin.active = true;
        }
        this.nodeLandCollider = Tools.getOrAddComponent(this.landNode, 'NodeCollider');
        this.nodeLandCollider.init(this.node, true);

        this.buffColliderListener = Tools.getOrAddComponent(this.node, 'BuffColliderListener');
        this.buffColliderListener.init(this);

        this.node.once('onByPick', this.onByPick, this);
    },

    onByPick: function () {
        var skin = this.skinNode.children[this.buffState];
        if (skin) {
            skin.active = false;
        }

        this.recycleSelf();
    }
});