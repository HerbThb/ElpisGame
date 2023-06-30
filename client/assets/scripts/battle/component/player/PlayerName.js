cc.Class({
    extends: cc.Component,

    properties: {
        nickname: cc.Label,
        frameNode: cc.Node,
    },

    onLoad(){
        this.nickname.langFlag = true;
    },

    start() {

    },

    // update (dt) {},
});