const Tools = require('Tools');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const PlatformMgr = require('PlatformMgr');
const ConfigData = require('ConfigData');


cc.Class({
    extends: cc.Component,

    properties: {
        tittleTxt: cc.Label, //活动标题
        timeTxt: cc.Label, // 活动时间
        infoTxt: cc.Label, // 活动信息描述
        rewardsTxt: cc.Label,
        rewardTxts: [cc.Label], //社区和问卷链接奖励描述
        rewardTCompletes: [cc.Node], //社区和问卷链接奖励描述

        dogeProBg: cc.Node,
        dogeProBar: cc.Node,

        connectBtn: cc.Node,
        playBtn: cc.Node,

        waitNode: cc.Node,

        okIcons: {
            default: Array,
            type: [cc.Node],
            displayName: "okIcons",
        },
    },

    init: function (world, callback, closeCallback) {
        this.world = world;

        if (callback) callback(this.heroData, this.knifeData);
        this.closeCallback = closeCallback;
        AdvertMgr.instance.fireBaseEvent("page_show_ranking");

        let self = this
        if (PlatformMgr.gm_kp == "" || (PlayerData.instance.bitverseWallet.length > 0 &&  PlatformMgr.nftRankPlayerInfo.length==0)) {
            this.setWaitNodeActive(true)
            PlatformMgr.requestPkey(PlayerData.instance.bitverseWallet, (success) => {
                if (success) {
                    PlayerData.instance.handleRewardScoreData()
                    self.show()
                    self.setWaitNodeActive(false)
                } else {
                    //弹窗提醒
                    AdvertMgr.instance.showPopUp(ConfigData.instance.getUITipStr(28), () => {
                        self.closeBtnClick(false)
                    })
                }
            })
            return
        }
        else{
            this.show()
        }
    },

    show: function () {
        let rewardst = [2, 2]
        if (PlatformMgr.nftRankInfo[4]) {
            rewardst = PlatformMgr.nftRankInfo[4]
        }

        for (let index = 0; index < rewardst.length; index++) {
            if (PlayerData.instance.canGetNFTOtherRewards(index)) {
                if (this.rewardTxts[index]) {
                    this.rewardTxts[index].string = "+" + rewardst[index]
                }
                this.rewardTxts[index].node.active = true
                this.rewardTCompletes[index].active = false
            } else {
                this.rewardTxts[index].node.active = false
                this.rewardTCompletes[index].active = true
            }
        }

        this.rewardsTxt.string = PlatformMgr.nftRankInfo[7]

        //ABtest方案
        //A方案：只保留play按钮，点击去链接钱包，返回后获取到钱包地址，下次点击直接去ranking大赛大厅
        if (PlayerData.instance.ABTestCode[PlayerData.instance.ABTestCode.length - 1] == "A") {
            this.playBtn.active = true
            this.playBtn.x = 0
            this.connectBtn.active = false
        } else {
            this.playBtn.active = true
            this.connectBtn.active = true
        }

        //B方案：connect按钮和play按钮都有

        let strs = PlatformMgr.nftRankInfo[0].split("|")

        let startT = strs[0]
        let endT = strs[1]

        let startDateMD = Tools.timestampToMD(startT * 1000)
        let endDateMD = Tools.timestampToMD(endT * 1000)

        this.tittleTxt.string = PlatformMgr.nftRankInfo[2]

        this.timeTxt.string = startDateMD + "~" + endDateMD

        this.refreshDownBar()

    },

    setWaitNodeActive: function (isActive) {
        this.waitNode.active = isActive;
    },

    refreshDownBar() {
        // //领取了doge之后或者链接完钱包之后，显示bone
        // var heroData = ConfigData.instance.getHeroSkinById(16);
        // var isGet = PlayerData.instance.isOwnHeroSkin(16);
        // //NFT测试，显示是否拥有
        // if (heroData.getWay == 100 && !isGet) {
        //     let own = PlatformMgr.nft_user_datas[heroData.goodsId] || 0
        //     if (own > 0) {
        //         console.log("购买后。同步到本地皮肤数据")
        //         PlayerData.instance.addHeroSkin(heroData.id);
        //         isGet = true
        //     }
        // }
        let isGet = false // 这里应该是活动结束了,领取了奖励

        isGet = isGet || PlayerData.instance.nftLock_auto == 1
        //默认已经安装了google play商店
        let rate = 1
        if (isGet) {
            rate = 4
        } else {
            if (PlayerData.instance.isBitverseInstalled) {
                //Bitverse钱包已经安装
                rate = 2
            }
            if (PlayerData.instance.bitverseWallet) {
                //钱包地址以获取
                rate = 3
            }
        }

        for (let index = 0; index < rate; index++) {
            this.okIcons[index].active = true
        }

        for (let index = rate; index < this.okIcons.length; index++) {
            this.okIcons[index].active = false
        }

        console.log("refreshDoge", rate, PlayerData.instance.isBitverseInstalled, PlayerData.instance.bitverseWallet)

        var extraW = [0, 0, 60, 0]

        this.dogeProBar.width = rate == 4 ? this.dogeProBg.width : this.dogeProBg.width * (rate / 4) + extraW[rate - 1]
    },

    //点击NFT rank按钮切换到rank大赛模式大厅
    onBtnNftRankBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_rankwindow_play_btn", "ab", PlayerData.instance.ABTestCode);
        if (PlayerData.instance.ABTestCode == "" || PlayerData.instance.ABTestCode[PlayerData.instance.ABTestCode.length - 1] == "B") {
            this.world.uiMgr.onBtnNftRankBtnClick()
            this.closeBtnClick(false)
        } else {
            if (PlayerData.instance.bitverseWallet == "") {
                PlatformMgr.connectBitverse()
            } else {
                this.world.uiMgr.onBtnNftRankBtnClick()
                this.closeBtnClick(false)
            }
        }
    },

    //点击钱包按钮
    onWalletBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_rankwindow_connect_btn");
        //去链接钱包
        PlatformMgr.connectBitverse()
    },

    closeBtnClick: function (bool = true) {
        if (this.isAdver) return;
        if (this.closeCallback) this.closeCallback(bool);
        this.node.active = false;
    },


    //点击社区按钮
    onClickDiscordBtn: function () {
        this.world.uiMgr.onClickDiscordBtn()
        this.closeBtnClick(false)
    },

    //点击问卷按钮
    onClickFormBtn: function () {
        this.world.uiMgr.onClickFormBtn()
        this.closeBtnClick(false)
    },

    onClose() {
        this.node.active = false;
    },

});