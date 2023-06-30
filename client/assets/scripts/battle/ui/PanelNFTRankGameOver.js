const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const PlatformMgr = require('PlatformMgr');


cc.Class({
    extends: cc.Component,

    properties: {
        scoreTxt: cc.Label,
        rankTxt: cc.Label,
        resultTxt: cc.Label,
        rewardTxts: [cc.Label],
        rewardTCompletes: [cc.Node], //社区和问卷链接奖励描述

        dogeProBg: cc.Node,
        dogeProBar: cc.Node,

        content: cc.Node,


        okIcons: {
            default: Array,
            type: [cc.Node],
            displayName: "okIcons",
        },

        itemHeroSkin: cc.Prefab,
        itemKnifeSkin: cc.Prefab,

        connectNode: cc.Node,
        confirmNode: cc.Node,
        itemNode: cc.Node,
        bgImg_1: cc.Node,
        bgImg_2: cc.Node,
    },

    init: function (world) {
        this.world = world;
        AdvertMgr.instance.fireBaseEvent("page_show_ranking_settlement");
        this.show()
    },


    show: function () {
        var rank = this.world.localPlayer.rank;

        var win = rank === 1;
        this.win = rank === 1;
        // let scores = PlatformMgr.nftRankInfo[6] 
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

        let scores = PlayerData.instance.nftRankScores

        let deltaScore = scores[rank - 1] + PlayerData.instance.getSkinScoreAdd()

        this.scoreTxt.string = Math.max(0, (Number(PlayerData.instance.nftRankScore) + Number(deltaScore))) + ""

        this.resultTxt.string = (deltaScore < 0 ? "" : "+") + deltaScore


        if (PlayerData.instance.bitverseWallet == "") { //没有钱包地址
            // PlatformMgr.connectBitverse()
            this.refreshDownBar()

            this.confirmNode.active = false
            this.connectNode.active = true

            this.rankTxt.string = "???";

        } else {
            this.content.destroyAllChildren()
            this.initItems()
            //进行本地排序
            // nftRank  
            let array = []
            if (PlayerData.instance.holidayWorldRankData && PlayerData.instance.holidayWorldRankData[0] && PlayerData.instance.holidayWorldRankData[0].rankInfo) {
                array = PlayerData.instance.holidayWorldRankData[0].rankInfo
            }

            let nftRank = 0

            if (array.length == 0) {
                // 'score' => $sql->score,
                // 'rank' => 0, //客户端排序
                // 'id' => $sql->uid,
                // 'adress' => $sql->adress
                PlayerData.instance.myWorldRankData = {
                    score: Math.max(0, PlayerData.instance.nftRankScore + deltaScore),
                    rank: 1,
                    adress: PlayerData.instance.bitverseWallet,
                    id: 0,
                }
                nftRank = 1
            } else {
                for (let index = 0; index < array.length; index++) {
                    let rankData = array[index]
                    if (rankData.adress == PlayerData.instance.bitverseWallet) {
                        //玩家自己
                        rankData.score = Math.max(0, rankData.score + deltaScore)
                        nftRank = rankData.rank
                        array[index] = rankData
                        break;
                    }
                }
                // PlayerData.instance.holidayWorldRankData[0].rankInfo = array.map((item)=>{return item})

                let myRank = PlayerData.instance.handleHolidayRankData(PlayerData.instance.holidayWorldRankData[0])
                let deltaRank = myRank.rank - nftRank

                PlayerData.instance.myWorldRankData = {
                    score: myRank.score,
                    rank: myRank.rank,
                    adress: PlayerData.instance.bitverseWallet,
                    id: 0,
                }
                nftRank = myRank.rank
            }

            this.rankTxt.string = nftRank;

            this.confirmNode.active = true
            this.connectNode.active = false
        }
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

        // isGet = isGet || PlayerData.instance.nftLock_auto == 1
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


    initItems() {
        let shopDatas = ConfigData.instance.getNFTSKins()

        let canBuy = false
        for (let i = 0; i < shopDatas.length; i++) {
            const data = shopDatas[i];
            var isGet = PlayerData.instance.isOwnHeroSkin(data.id) || PlayerData.instance.isOwnKnifeSkin(data.id)
            if (isGet) {
                console.log("已获得皮肤", data.id, data.name)
                continue
            }
            canBuy = true
            var itemNode = cc.instantiate(this.itemHeroSkin);
            itemNode.parent = this.content;
            itemNode.active = true;
            var itemNodeSc = itemNode.getComponent('ItemHeroNFTRankOver');
            // itemComp.setOnItemClick(this, itemComp);

            itemNodeSc.init(data, this.world);
            console.log(data.name, data.goodsName)
        }

        if (!canBuy) {
            this.itemNode.active = false
            this.bgImg_1.active = false
            this.bgImg_2.active = true
        }
    },


    refresh: function () {
        this.content.destroyAllChildren()
        this.initItems()
    },


    onCnfirmBtnClick: function () {
        AdvertMgr.instance.fireBaseEvent("click_ranking_settlement_confirm");
        this.world.restartGame();
    },

    onConnectBtnClick: function () {
        // AdvertMgr.instance.showPanelPopUpGame(ConfigData.instance.getUITipStr(24), () => {
        //     PlayerData.instance.bitverseWallet = "0xxxasa"

        //     AdvertMgr.instance.uiMgr.refreshWalletIcon(true)

        //     PlayerData.instance.rankLocalModify()

        //     AdvertMgr.instance.uiMgr.refreshNFTGameOverPanelShow()

        // })
        PlatformMgr.connectBitverse()
    },

    closeBtnClick: function () {
        this.world.restartGame();
        // if (this.closeCallback) this.closeCallback(false);
        // this.node.active = false;
    },

    //点击社区按钮
    onClickDiscordBtn: function () {
        this.world.uiMgr.onClickDiscordBtn()
        this.world.restartGame();
    },

    //点击问卷按钮
    onClickFormBtn: function () {
        this.world.uiMgr.onClickFormBtn()
        this.world.restartGame();
    },

    onClose() {
        this.node.active = false;
    },

});