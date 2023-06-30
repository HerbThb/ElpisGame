/**
 * @fileoverview ShareMgr
 * @author <meifan@gameley.cn> (梅凡)
 */

const PlatformType = require('Types').PlatformType;
const PlatformMgr = require('PlatformMgr');
const ShareType = require('Types').ShareType;
const Tools = require('Tools');
const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const GameData = require('GameData');
const AudioEngine = require('AudioEngine');
const mta = require('mta_analysis');

/**
 * ShareMgr 分享管理器
 */
const ShareMgr = cc.Class({
    statics: {
        /** 当前玩家uid，用于分享出口 */
        playerUid: '',
        /** 分享时间 */
        shareTime: '',
        shareFailCount: 0,


        /**
         * 初始化
         */
        init: function () {
            ShareMgr.platformType = PlatformMgr.platformType;
            ShareMgr.query = null;
            // Tools.setItem('fromMyApp', 1);
            switch (ShareMgr.platformType) {
                case PlatformType.WECHAT: {
                    //#region 菜单被动转发
                    wx.updateShareMenu({
                        withShareTicket: true,
                        complete: (res) => {
                            console.log('updateShareMenu complete:', res);
                        }


                    });

                    wx.showShareMenu({
                        showShareItems: ['qq', 'qzone']
                    });

                    PlatformMgr.imageUrl = 'https://k6-cdn.pinduoqian.cn/wechat/share/share001.jpg';
                    // cc.loader.loadRes("texture/share/share001", cc.SpriteFrame, function (error, data) {
                    //     if (error) {
                    //         cc.error(error);
                    //     } else if (data) {
                    //         PlatformMgr.imageUrl = data._textureFilename;
                    //     }
                    // });
                    // b3a155dd781578b8831d7a6103cb3eb0
                    // ShareMgr.handleShare({
                    //     shareType: 0,
                    //     shareUid: 106002
                    // })
                    wx.onShareAppMessage(() => ({
                        title: '是时候展现真正的技术了，你的飞刀玩得6不6',
                        imageUrl: PlatformMgr.imageUrl,
                        query: ShareMgr.createQueryString({
                            shareType: 0,
                            shareUid: PlatformMgr.uid,
                        })
                    }))

                    // 从后台点击链接切回的情况
                    wx.onShow((res) => {
                        console.log('wx.onShow:', JSON.stringify(res));
                        // var scene = decodeURIComponent(res.query.scene);
                        // if (scene) {
                        //     //通过小程序码进入
                        //     ShareMgr.shareParam.inviterUid = scene;
                        //     console.log(scene)
                        // } 
                        // else {

                        ShareMgr.handleShare(res.query, res.shareTicket, true);
                        // PlatformMgr.eolinkerShare();
                        PlatformMgr.hawkeye_report_share_in();
                        if (Number.parseInt(res.scene) === 1022) {
                            Tools.setItem('fromMyApp', 1);
                            if (ShareMgr.refreshRedDot) {
                                setTimeout(() => {
                                    ShareMgr.refreshRedDot()
                                }, 500);
                            }
                        };

                        PlatformMgr.k6_userDate();

                        ShareMgr.enterScene = res.scene;
                        ShareMgr.isShareing = false;

                        if (ShareMgr.wxOnShowCallBack) {
                            ShareMgr.wxOnShowCallBack();
                            ShareMgr.wxOnShowCallBack = null;
                        }

                        if (res.query) {
                            if (res.query.scene) {
                                let launchData = decodeURIComponent(res.query.scene);
                                let reg = new RegExp("(^|&)" + "cid" + "=([^&]*)(&|$)");
                                let r = launchData.match(reg);
                                if (r !== null) {
                                    PlatformMgr.eolinkerChannelCode = unescape(r[2]);

                                    console.log('eolinkerChannelCode:' + PlatformMgr.eolinkerChannelCode);
                                }
                            } else if (res.query.cid) {
                                PlatformMgr.eolinkerChannelCode = res.query.cid;
                                console.log('eolinkerChannelCode:' + PlatformMgr.eolinkerChannelCode);
                            }
                        }
                    });

                    const launchOptions = qq.getLaunchOptionsSync();
                    console.log('-------------launchOptions:', JSON.stringify(launchOptions));
                    if (Number.parseInt(launchOptions.scene) === 1022) {
                        Tools.setItem('fromMyApp', 1);
                        console.log('-------------来自置顶哦！！！-------------');
                        if (ShareMgr.refreshRedDot) {
                            ShareMgr.refreshRedDot()
                        }
                    }
                    PlatformMgr.eolinkerScene = launchOptions.scene;


                    if (launchOptions && launchOptions.query) {

                        ShareMgr.handleShare(launchOptions.query, launchOptions.shareTicket);

                        if (launchOptions.query.scene) {
                            let launchData = decodeURIComponent(launchOptions.query.scene);
                            let reg = new RegExp("(^|&)" + "cid" + "=([^&]*)(&|$)");
                            let r = launchData.match(reg);
                            if (r !== null) {
                                PlatformMgr.eolinkerChannelCode = unescape(r[2]);
                                console.log('eolinkerChannelCode:' + PlatformMgr.eolinkerChannelCode);
                            }
                        } else if (launchOptions.query.cid) {
                            PlatformMgr.eolinkerChannelCode = launchOptions.query.cid;
                            console.log('eolinkerChannelCode:' + PlatformMgr.eolinkerChannelCode);
                        }
                    }


                    mta.App.init({
                        "appID": "500681114",
                        "eventID": "500681124", // 高级功能-自定义事件统计ID，配置开通后在初始化处填写
                        "lauchOpts": launchOptions, //渠道分析,需在onLaunch方法传入options,如onLaunch:function(options){...}
                        "autoReport": true, //开启自动上报
                        "statParam": true, //每个页面均加入参数上报
                        "ignoreParams": [], //statParam 为 true 时，如果不想上报的参数可配置忽略
                    });

                    break;
                }

                default: {
                    break;
                }
            }

        },

        /**
         * 处理分享，玩家点击分享链接进入游戏时，需要根据链接透传参数进行处理
         * @param {Object} query 分享透传参数
         * @param {string} shareTicket 微信分享shareTicket
         * @param {boolean} isOnShow 是否是在后台时点击分享链接进入的
         */
        handleShare: function (query, shareTicket, isOnShow) {
            ShareMgr.query = query;

            var shareType = ShareMgr.getQueryString('shareType');
            if (shareType == null || shareType == undefined) {
                return;
            }
            // 分享类型
            shareType = parseInt(shareType);
            if (shareType === ShareType.NONE) {
                return;
            }
            console.log('-------分享query-------', JSON.stringify(query));
            console.log('分享类型:' + shareType);

            PlatformMgr.shareType = shareType;
            PlatformMgr.shareRecord = ShareMgr.getQueryString('shareRecord');
            PlatformMgr.share_point = ShareMgr.getQueryString('share_point');
            PlatformMgr.share_picture = ShareMgr.getQueryString('share_picture');
            PlatformMgr.shareUid = ShareMgr.getQueryString('shareUid');
        },

        /**
         * 从分享透传参数中获取具体数据
         * @param {key} 透传参数key
         * @returns {any} 透传参数value
         */
        getQueryString: function (key) {
            switch (ShareMgr.platformType) {
                case PlatformType.WECHAT:
                // case PlatformType.QQ:
                {
                    if (ShareMgr.query) {
                        const value = ShareMgr.query[key];
                        if (value != undefined) {
                            return value;
                        }
                    }
                    return null;
                }
                case PlatformType.BROWSER: {
                    return Tools.getQueryString(key);
                }
                default:
                    return null;
            }
        },

        /**
         * 分享，游戏业务层绝大部分时间应调用此接口进行分享
         * @param {ShareType} shareType 分享类型
         * @param {Object} queryObject 分享透传参数
         * @param {string} shareText 分享标题
         * @param {Object} panelParam UI展示数据参数
         * @param {function} callback 分享回调
         * @param {string} msgParam 上行给服务器的自定义参数，依照分享类型区分
         * @param {boolean} callback.isSuccess 是否分享成功
         */
        share: function (shareType, callback = null, showUITips = false, queryObject = null, shareText = null, panelParam = null, msgParam = "") {
            const shareData = ConfigData.instance.getRandomShareBaseData(shareType);
            if (!shareData) {
                console.error('Can\'t find shareData with shareType:' + shareType);
                return;
            }

            ShareMgr.curShareType = shareType;
            ShareMgr.shareTime = PlayerData.instance.getCurTime();

            let closeCallback = (success) => {

                if (performance && performance.now) {
                    cc.director._lastUpdate = performance.now();
                }
                
                if (success) {
                    switch (shareType) {
                        case ShareType.UnlockSkin:
                        case ShareType.Revive:
                        case ShareType.MultipGold:
                        case ShareType.TryOutSkin:
                        case ShareType.OfflineGold:
                        case ShareType.Sign:
                        case ShareType.RefreshDailyTask:
                        case ShareType.MultipDailyTask:
                            PlayerData.instance.updateDayGetPrizeCount('分享');
                            PlayerData.instance.updateShareScore();
                            break;
                        default:
                            break;
                    }
                }
                if (callback) callback(success)
            }

            queryObject = ShareMgr.checkQueryObject(queryObject, shareType);
            const paramObject = {
                queryObject: queryObject,
                shareText: shareText ? shareText : shareData.shareStr,
                panelParam: panelParam,
                shareData: shareData,
                imageUrl: shareData.imageUrl,
                callback: closeCallback,
                showUITips: showUITips,
                msgParam: msgParam,
                screenshotParam: {
                    imgWidth: 500,
                    imgHeight: 400,
                    offset: cc.Vec2.ZERO,
                },
                picName: shareData.sharePicture
            };
            if (!paramObject.imageUrl) {
                paramObject.imageUrl = '';
            }
            ShareMgr.doPlatformShare(paramObject);
        },


        /**
         * 检查并补齐分享透传参数
         * @param {Object} queryObject 分享透传参数
         * @param {ShareType} shareType 分享类型
         * @returns {Object} 补齐后的透传参数
         */
        checkQueryObject: function (queryObject, shareType) {
            if (queryObject === undefined || queryObject === null) {
                queryObject = {};
            }
            if (queryObject.shareType === undefined) {
                queryObject.shareType = shareType;
            }
            if (queryObject.uid === undefined) {
                queryObject.shareUid = PlatformMgr.uid;
            }
            return queryObject;
        },
        /**
         * 调用平台接口进行分享
         * @param {Object} paramObject 参数
         * @param {string} paramObject.shareText 分享标题
         * @param {Object} paramObject.queryObject 分享透传参数
         * @param {Object} paramObject.panelParam UI展示数据参数
         * @param {ShareType} paramObject.queryObject.shareType 分享类型
         * @param {ShareData} paramObject.queryObject.shareData 分享配置数据
         * @param {function} paramObject.callback 回调
         * @param {boolean} paramObject.callback.isSuccess 是否分享成功
         * @param {Object} paramObject.screenshotParam 截屏参数
         * @param {Number} paramObject.screenshotParam.imgWidth 截屏宽度
         * @param {Number} paramObject.screenshotParam.imgHeight 截屏高度
         * @param {cc.Vec2} paramObject.screenshotParam.offset 偏移
         */
        doPlatformShare: function (paramObject) {
            var shareText = paramObject.shareText;
            const queryObject = paramObject.queryObject;
            const shareType = queryObject.shareType;
            const shareData = paramObject.shareData;
            const msgParam = paramObject.msgParam;
            if (queryObject.shareID === undefined) {
                queryObject.shareID = shareData.id;
            }
            if (queryObject.share_point === undefined) {
                queryObject.share_point = shareData.sharePoint;
            }
            // let queryString = ShareMgr.createQueryString(queryObject);

            switch (ShareMgr.platformType) {
                // 微信小游戏分享
                case PlatformType.WECHAT: {
                    if (ShareMgr.isShareing) return;
                    ShareMgr.isShareing = true;

                    ShareMgr.wxShare = () => {
                        ShareMgr.loadEolinkerSettings(shareType.toString(), shareText,
                            paramObject.imageUrl, paramObject.picName, (title, imageUrl, isNetImage, share_pic) => {
                                if (queryObject.share_picture === undefined) {
                                    queryObject.share_picture = share_pic;
                                }
                                if (queryObject.shareRecord === undefined) {
                                    queryObject.shareRecord = ShareMgr.createShareRecord();
                                }

                                let queryString = ShareMgr.createQueryString(queryObject);
                                // if (isNetImage) {
                                AudioEngine.instance.stopAllSound();
                                ShareMgr.doWxShare(paramObject, title, imageUrl, queryString);
                                // } else {
                                //     cc.loader.loadRes(imageUrl, cc.SpriteFrame, function (error, data) {
                                //         if (error) {
                                //             cc.error(error);
                                //         } else if (data) {
                                //             ShareMgr.doWxShare(paramObject, title, data._textureFilename, queryString);
                                //         }
                                //     });
                                // }
                                PlatformMgr.hawkeye_report_share_out(shareType, share_pic);
                            });
                    }

                    ShareMgr.wxShare();
                    break;
                }
                // 浏览器分享，复制链接到剪切板
                case PlatformType.BROWSER: {
                    if (queryObject.share_picture === undefined) {
                        queryObject.share_picture = paramObject.picName;
                    }
                    if (queryObject.shareRecord === undefined) {
                        queryObject.shareRecord = ShareMgr.createShareRecord();
                        console.log('shareRecord: ' + queryObject.shareRecord);
                    }
                    let queryString = ShareMgr.createQueryString(queryObject);
                    // if (paramObject.captureCallback) {
                    //     paramObject.captureCallback();
                    // }
                    // queryString = Tools.getUrlWithoutQueryString() + `?${queryString}`;
                    // Tools.webCopyString(queryString);
                    // ShareMgr.uiMgr.showTipMsgBox(9);
                    if (paramObject.callback) {
                        paramObject.callback(true);
                    }
                    break;
                }
                default:
                    break;
            }
        },

        doWxShare: function (paramObject, title, imageUrl, queryString) {
            ShareMgr.wxOnShowCallBack = function () {
                if (ShareMgr.isShareSuccess()) {
                    if (paramObject.callback) {
                        paramObject.callback(true);
                    }
                    if (paramObject.showUITips) {
                        paramObject.showUITips(true);
                    }
                    ShareMgr.shareFailCount = 0;
                } else {
                    if (paramObject.showUITips) {
                        paramObject.showUITips(false);
                        if (paramObject.callback) {
                            paramObject.callback(false);
                        }
                    } else {
                        ShareMgr.showRandomFailTips(paramObject.callback);
                    }
                }
            }
            if (GameData.instance.isShowLog()) {
                console.log('------------最终分享query-------------', queryString)
            }

            wx.shareAppMessage({
                title: title,
                imageUrl: imageUrl,
                query: queryString,
                complete: function () {
                    console.log('完成')
                },
                cancel: function () {
                    console.log('取消')
                }
            })
        },

        /**
         * 创建透传参数字符串，用于分享出口
         * @param {Object} queryObject 分享透传参数
         * @returns {string} 透传参数字符串
         */
        createQueryString: function (queryObject) {
            let queryString = ''
            switch (ShareMgr.platformType) {
                case PlatformType.QQ: {
                    queryString = JSON.stringify(queryObject);
                    break;
                }
                default: {
                    let flag = true;
                    for (var key in queryObject) {
                        if (queryObject.hasOwnProperty(key)) {
                            const paramStr = `${key}=${queryObject[key]}`;
                            if (flag) {
                                flag = false;
                                queryString = paramStr;
                            } else {
                                queryString += `&${paramStr}`;
                            }
                        }
                    }
                    break;
                }
            }
            // console.log('---------query:' + queryString);
            return queryString;
        },

        /**
         * 生成shareRecard
         */
        createShareRecord: function () {
            var ret = '';

            if (PlatformMgr.uid) {
                ret += '' + PlatformMgr.uid + 'a';
            }
            ret += '' + Tools.getTimestampS();

            return ret;
        },


        loadEolinkerSettings: function (shareType, title, imageUrl, picName, callback) {
            switch (ShareMgr.platformType) {
                // 微信小游戏分享
                case PlatformType.WECHAT: {

                    if (GameData.instance.isInReview) {
                        if (callback) callback(title, imageUrl, false, picName);
                    } else {
                        // PlatformMgr.updateEolinkerSettings((settings) => {
                        var ret = ShareMgr.handleEolinkerSettings(PlatformMgr.eolinkerSettings, shareType, title, imageUrl, picName);
                        if (callback) callback(ret.title, ret.imageUrl, ret.isNetImage, ret.picName);
                        // });
                    }
                    break;
                }
                default: {
                    if (callback) callback(title, imageUrl, false, picName);
                    break;
                }
            }
        },

        handleEolinkerSettings: function (settings, shareType, title, imageUrl, picName) {
            // console.log('shareID:' + shareID);
            // if (GameData.instance.isShowLog()) {
            // console.log('settings:' + JSON.stringify(settings));
            // }
            // TODO 分享使用下发的图片和文字
            var isNetImage = false;
            var shareSettings = settings ? settings : {};
            var useSettingsFlag = shareSettings.useSettingsFlag == 'true';
            var randomID = -1;
            if (useSettingsFlag) {
                if (shareSettings.share_random) {
                    if (shareSettings.share_random[shareType]) {
                        randomID = Tools.getRandomItem(shareSettings.share_random[shareType]);

                        if (randomID >= 0) {
                            if (shareSettings.share_data && shareSettings.share_data[randomID]) {
                                if (shareSettings.share_data[randomID][0]) {
                                    title = shareSettings.share_data[randomID][0];
                                }
                                if (shareSettings.share_data[randomID][1]) {
                                    imageUrl = shareSettings.share_data[randomID][1];
                                    isNetImage = true;
                                }
                                if (shareSettings.share_data[randomID][2]) {
                                    picName = shareSettings.share_data[randomID][2];
                                }
                            }
                        }
                    }
                } else if (shareSettings.share_titles && typeof shareSettings.share_titles[shareType] == 'string') {
                    title = shareSettings.share_titles[shareType];
                } else if (shareSettings.share_title !== undefined && shareSettings.share_title.length > 0) {
                    title = shareSettings.share_title;
                }

                if (shareSettings.share_imgs && typeof shareSettings.share_imgs[shareType] == 'string') {
                    imageUrl = shareSettings.share_imgs[shareType];
                    isNetImage = true;
                } else if (shareSettings.share_img !== undefined && shareSettings.share_img.length > 0) {
                    imageUrl = shareSettings.share_img;
                    isNetImage = true;
                }

                if (shareSettings.fakeShareFlag !== undefined) {
                    ShareMgr.fakeShareFlag = shareSettings.fakeShareFlag;
                }
            }

            if (GameData.instance.isShowLog()) {
                console.log('shareType:' + shareType + ' shareTitle:' + title + ' shareImg:' + imageUrl);
            }
            return {
                title: title,
                imageUrl: imageUrl,
                isNetImage: isNetImage,
                picName: picName
            };
        },


        isShareSuccess: function () {
            if (ShareMgr.fakeShareFlag === 'false') return true;
            if (GameData.instance.isInReview) return true;
            if (ShareMgr.curShareType === ShareType.HOME || ShareMgr.curShareType === ShareType.WIN || ShareMgr.curShareType === ShareType.Friend) return true;

            var data = ConfigData.instance.clientData;
            //根据失败次数判断
            if (ShareMgr.shareFailCount >= data.shareLimitFailCount) {
                if (GameData.instance.isShowLog()) {
                    console.log('失败次数:', ShareMgr.shareFailCount, '大于等于', data.shareLimitFailCount, '次  此次必定成功')
                }
                return true;
            }

            //根据分享时间判断
            var time = PlayerData.instance.getCurTime() - ShareMgr.shareTime;
            if (GameData.instance.isShowLog()) {
                console.log('本次分享时间：', time);
                console.log('本次分享累计失败次数：', ShareMgr.shareFailCount);
                console.log('本次游戏分享累计次数：', PlayerData.instance.allShareCount);
            }
            if (time > (data.shareSuccessWaitTime * 1000)) {
                var successPercent = Tools.getItemOrFinalItem(data.shareSuccessPercents, PlayerData.instance.allShareCount);
                var random = Math.floor((Math.random() * 100));
                PlayerData.instance.updateShareCount();
                if (random < successPercent) {
                    if (GameData.instance.isShowLog()) {
                        console.log('分享概率成功:' + random + ' < ' + successPercent);
                    }
                    return true;
                } else {
                    if (GameData.instance.isShowLog()) {
                        console.log('分享概率失败:' + random + ' > ' + successPercent);
                    }
                    ShareMgr.shareFailCount++;
                    return false;
                }
            } else {
                if (GameData.instance.isShowLog()) {
                    console.log('分享未过' + data.shareSuccessWaitTime + '秒，失败:' + time)
                }
                return false;
            }
        },


        showRandomFailTips: function (callback) {
            var tips = ConfigData.instance.clientData.shareFailTips;
            var str = Tools.getRandomItem(tips);
            wx.showModal({
                title: '提示',
                content: str,
                cancelText: '知道了',
                confirmText: '重新分享',
                success(res) {
                    if (res.confirm) {
                        ShareMgr.wxShare();
                    } else {
                        if (callback) callback(false);
                    }
                }
            })


        },




    },
});