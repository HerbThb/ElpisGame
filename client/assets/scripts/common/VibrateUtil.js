const GameData = require('GameData');

var VibrateUtil = cc.Class({
    statics: {
        instance: null,
        vibrate: function (isLong) {
            if (GameData.instance._vibrateOpen) {
                if(cc.sys.platform === cc.sys.WECHAT_GAME) {
                    if(isLong) {
                        wx.vibrateLong();
                    } else {
                        wx.vibrateShort();
                    }
                } else if (cc.sys.isNative) {
                    // if(cc.sys.os === cc.sys.OS_IOS) {
                    //     jsb.reflection.callStaticMethod('JSC', isLong ? 'ddd1' : 'ddd3');
                    //     // jsb.reflection.callStaticMethod('VibratorWrapper', isLong ? 'vibrateLong' : 'vibrateShort');
                    // } else
                    if (cc.sys.os === cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod(
                            'org/cocos2dx/javascript/VibratorWrapper',
                            isLong ? 'vibrateLong' : 'vibrateShort',
                            '()V'
                        );
                    } else if(cc.sys.os === cc.sys.OS_IOS) {
                        if(isLong) {
                            jsb.reflection.callStaticMethod("JSC", "ddd1");
                        } else {
                            jsb.reflection.callStaticMethod("JSC", "ddd3");
                        }
                    }
                }
            }
        },
    },

})