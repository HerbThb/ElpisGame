/**
 * @fileoverview PanelFriend
 * @author meifan@gameley.cn (梅凡)
 */

const ShareMgr = require('ShareMgr');
const AdvertMgr = require('AdvertMgr');
const PlatformMgr = require('PlatformMgr');
const ShareType = require('Types').ShareType;
const PlatformType = require('Types').PlatformType;

const PanelFriend = cc.Class({
    extends: cc.Component,

    properties: {
        wxSubContextView: cc.Node,
        world: null,
        _texture: null,
        subDomainSprite: cc.Sprite,
        _delayRefreshCanvasTime: 0.2,
        _refreshCanvasElapsed: 0,
        _pollInterval: 0.3,
        _pollSubDomain: false,
        _pollCount: 10,
        _curPollCount: 0,
        _clickInterval: 0.2,
    },

    init: function (world) {
        this.world = world;
        this._clickInterval = 0;
        PlatformMgr.showOpenDataContext();
        this.showOpenDataContext();
        AdvertMgr.instance.showBanner();
        console.log("showBanner PanelFriend init ")
    },

    showOpenDataContext: function () {
        switch (PlatformMgr.platformType) {
            // 微信使用子域进行绘制
            case PlatformType.WECHAT: {
                this._texture = new cc.Texture2D();
                const size = cc.view.getVisibleSize();
                const openDataContext = wx.getOpenDataContext()
                this.sharedCanvas = openDataContext.canvas;
                this.sharedCanvas.width = size.width;
                this.sharedCanvas.height = size.height;

                this.subDomainSprite.node.active = true;

                this._delayRefreshCanvasTime = 0.2;
                this._refreshCanvasElapsed = 0;

                this.resetPollState();
                break;
            }
            default: {
                this.subDomainSprite.node.active = false;
                break;
            }
        }
    },

    onShareBtnClick: function () {
        const self = this;
        ShareMgr.share(ShareType.Friend, (isSuccess) => {
            if (isSuccess) {
                self.world.uiMgr.showTips(1);
            }
        });
    },

    onCloseBtnClick: function () {
        this.node.active = false;
        PlatformMgr.closeOpenDataContext();
        // AdvertMgr.instance.destoryBanner();
    },

    onLeftBtnClick: function () {
        if(this._clickInterval > 0) {
            return;
        }
        this._clickInterval = 0.2;

        PlatformMgr.leftOpenDataContext();
        this.resetPollState();
    },

    onRightBtnClick: function () {
        if(this._clickInterval > 0) {
            return;
        }
        this._clickInterval = 0.2;

        PlatformMgr.rightOpenDataContext();
        this.resetPollState();
    },

    // update (dt) {},
    /** 
     * 定时刷新子域显示
     * @override 
     * */
    update: function (dt) {
        if(this._clickInterval > 0) {
            this._clickInterval -= dt;
        }

        if (PlatformMgr.platformType == PlatformType.WECHAT) {

            if (this._delayRefreshCanvasTime > 0) {
                this._delayRefreshCanvasTime -= dt;
            } else {
                if (this._refreshCanvasElapsed > 0) {
                    this._refreshCanvasElapsed -= dt;
                } else {
                    this._refreshCanvasElapsed = this._pollInterval;
                    this._updateSubDomainCanvas();
                }
            }
        }
    },

    // 刷新子域的纹理
    _updateSubDomainCanvas: function () {
        if (!this.isPollSubDomain()) {
            return;
        }
        if (PlatformMgr.platformType == PlatformType.WECHAT && this._texture) {
            this._texture.initWithElement(this.sharedCanvas);
            this._texture.handleLoadedTexture();
            this.subDomainSprite.spriteFrame = new cc.SpriteFrame(this._texture);
        }
    },

    /**
     * 是否去轮询子域
     */
    isPollSubDomain: function () {
        if (!this._pollSubDomain) return false;
        this._curPollCount++;
        if (this._curPollCount > this._pollCount) {
            this._curPollCount = 0;
            this._pollSubDomain = false;
            return false;
        }
        return true;
    },

    resetPollState: function () {
        this._pollSubDomain = true;
        this._curPollCount = 0;
    },

});