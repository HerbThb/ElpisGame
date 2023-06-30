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

        roundAndRank: cc.RichText,
        codeLabel: cc.RichText,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(data) {
        this.roundAndRank.string = '恭喜你在<color=#fff884>"第' + data.round + '轮"</c>世界PK中获得了第' + data.rank + '名';
        this.codeLabel.string = '<color=#64ff76> 获奖码：' + data.codeKey + '</c>';

    },

    // update (dt) {},
});