cc.Class({
    extends: cc.Component,

    properties: {
        knifePropertyNode: cc.Node,
        knifePropertyLabel: cc.Label,
        heroPropertyNode: cc.Node,
        heroPropertyLabel: cc.Label,

    },

    refreshProperty(data, isHeroSkin) {
        return;
        if (isHeroSkin) {
            // this.knifePropertyNode.active = false;
            this.heroPropertyNode.active = data.propertyTips ? true : false;
            this.heroPropertyLabel.string = data.propertyTips ? data.propertyTips : '';
        } else {
            // this.heroPropertyNode.active = false;
            this.knifePropertyNode.active = data.propertyTips ? true : false;
            this.knifePropertyLabel.string = data.propertyTips ? data.propertyTips : '';
        }
    },

    refresh() {
        return;
        this.knifePropertyNode.active = false;
        this.heroPropertyNode.active = false;
    },

    refreshHero() {
        this.heroPropertyNode.active = false;
    },
});