/**
 * @fileoverview 刀的皮肤控制
 * @author zhangzhuang@gameley.cn (张庄)
 */

const KnifeState = require('Types').KnifeState;
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        this.knifeStateComp = this.node.parent.getComponent('KnifeStateComponent');
        this.knifeOwnerComp = this.node.parent.getComponent('KnifeOwnerComponent');
        this.node.on('changeSkin', this.changeSkin, this);
    },
    updateLogic: function (dt) {
        if (!this.knifeStateComp) this.knifeStateComp = this.node.parent.getComponent('KnifeStateComponent');
        if (!this.knifeOwnerComp) this.knifeOwnerComp = this.node.parent.getComponent('KnifeOwnerComponent');

        //根据组件的状态做逻辑处理
        if (this.knifeOwnerComp.isDirty) {
            this.changeSkin()
        }
    },

    changeSkin: function () {
        if (this.knifeOwnerComp.owner) {
            if (this.knifeOwnerComp.owner.getComponent('EntityFollowPlayer')) {
                var player = this.knifeOwnerComp.owner.getComponent('EntityFollowPlayer').player;
                if (player.skin) {
                    var sprite = this.node.getComponent(cc.Sprite);
                    cc.loader.loadRes(player.skin.url, cc.SpriteFrame, (error, resource) => {
                        if (error) {
                            cc.error(error);
                        } else if (resource) {
                            if (sprite.node) {
                                sprite.spriteFrame = resource;
                            }
                        }
                    })
                }
            }
        }
    }
    // update (dt) {},
});