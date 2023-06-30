/**
 * @fileoverview Loading类的实现
 * @author <liqing@gameley.cn> (李清)
 */

/**
 * Loading 游戏入口
 */
const Loading = cc.Class({
    extends: cc.Component,

    statics: {

    },

    properties: {
        // loadTips: cc.Label,
        waitTime: 0.2,
        needUpdate: false,
    },

    onLoad: function () {
        // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        //     const version = wx.getSystemInfoSync().SDKVersion;
        //     if (Tools.compareVersion(version, '2.1.0') >= 0) {
        //         const self = this;
        //         cc.loader.downloader.loadSubpackage('res', function (err) {
        //             if (err) {
        //                 return console.error(err);
        //             }
        //             // console.log('load subpackage res successfully.');

        //             self.init();
        //         });

        //     } else {
        //         wx.showModal({
        //             title: '提示',
        //             content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        //         });
        //     }
        // } else {
            this.init();
        // }
    },

    init: function () {
        this.waitTime = 0.2;
        this.needUpdate = true;

        // cc.director.preloadScene("Battle");

    },

    update: function (dt) {
        if(this.needUpdate) {
            this.waitTime -= dt;
            if(this.waitTime <= 0) {
                this.needUpdate = false;
                cc.director.loadScene("Battle");
            }
        }
    },
});