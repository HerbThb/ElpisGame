/**
 * @fileoverview PanelHeroPosArr
 * @author meifan@gameley.cn (梅凡)
 */


const PanelHeroPosArr = cc.Class({
    extends: cc.Component,

    properties: {
        posArrPrefab: cc.Prefab,
    },

    addHeroPosArr: function (localPlayer, otherPlayer, camera) {
        const arr = cc.instantiate(this.posArrPrefab);
        const posArr = arr.getComponent('HeroPosArrow');
        arr.parent = this.node;
        posArr.init(localPlayer, otherPlayer, camera);
        localPlayer.posArrowPool.push(posArr);
    },

});