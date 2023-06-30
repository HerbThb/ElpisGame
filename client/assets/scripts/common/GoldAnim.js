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
        coin: cc.Prefab,
        editBox: cc.EditBox,
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.arr = [];
        for (let j = 0; j < 3; j++) {
            this.arr[j] = [];
            for (let i = 0; i < 20; i++) {
                let gold = cc.instantiate(this.coin);
                gold.parent = this.node;
                gold.opacity = 0;
                this.arr[j].push(gold)
            }
        }

    },


    onClick(count, num, offset, final) {
        for (let j = 0; j < count; j++) {
            setTimeout(() => {
                for (let i = 0; i < num; i++) {
                    let gold = this.arr[j][i];
                    gold.opacity = 255;
                    // let fadeIn = cc.fadeIn(0.5);
                    var pos = cc.v2(Math.cos(i / num * 2 * Math.PI) * 250 + offset.x, Math.sin(i / num * 2 * Math.PI) * 300 + offset.y)

                    if (pos.y > 0) {
                        pos.y += pos.y / 2
                    } else {
                        pos.y += Math.random() * 100 + 100;
                    }


                    let moveTo1 = cc.moveTo(Math.random() * 0.2 + 0.4, pos).easing(cc.easeCircleActionInOut(1.0));
                    let moveTo2 = cc.moveTo(Math.random() * 0.2 + 0.6, final).easing(cc.easeCircleActionInOut(1.0))
                    let callf = cc.callFunc(() => {
                        gold.opacity = 0;
                    })
                    gold.position = offset;

                    gold.stopAllActions();
                    gold.runAction(cc.sequence(moveTo1, moveTo2, callf));
                    // setTimeout(() => {
                    //     gold.runAction(moveTo2);
                    // }, i * 50 + 200);
                }
            }, j * 400)
        }
    },
    update() {

    },

    onset() {
        cc.director.getScheduler().setTimeScale(Number.parseFloat(this.editBox.string))
    },

    onGetNormal(callback, offset, final) {
        this.onClick(1, 10, offset, final)
        setTimeout(callback, 1000)
    },
    onGetMore(callback, offset, final) {
        this.onClick(1, 20, offset, final)
        setTimeout(callback, 1400)
    },
    onGetLucky(callback, offset, final) {
        this.onClick(3, 20, offset, final)
        setTimeout(callback, 1800)
    },
    // update (dt) {},
});