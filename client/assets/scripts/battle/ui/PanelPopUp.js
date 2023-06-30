cc.Class({
    extends: cc.Component,

    properties: {
        txt: cc.Label,
    },

    init(world,txt,callback) {
        this.world = world;
        this.callback = callback;

        txt = txt || ""

        if(this.txt){
            this.txt.string = txt
        }
    },

    onClose() {
        this.node.active = false;
        if(this.callback){
            this.callback()
        }
    },
    // update(dt) {},
});