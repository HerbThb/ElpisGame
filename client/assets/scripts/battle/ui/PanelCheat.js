const PlayerData = require('PlayerData');
const ConfigData = require('ConfigData');
const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        goldEditBox: cc.EditBox,
        scoreEditBox: cc.EditBox,
        killEditBox: cc.EditBox,
        playEditBox: cc.EditBox,
        winEditBox: cc.EditBox,
        timeEditBox: cc.EditBox,
        signEditBox: cc.EditBox,
        offlineEditBox: cc.EditBox,
        GrowEditBoxs: [cc.EditBox],
        adverEditBox: cc.EditBox,

        timeOffsetEditBox: cc.EditBox,
        setkillEditBox: cc.EditBox,

        abVersionLabel: cc.Label,

        walletEditBox: cc.EditBox,
        rankScoreEditBox: cc.EditBox,

        webUrlEditBox : cc.EditBox,
    },

    start() {
        console.log("panelcheat start")
    },

    onEnable() {
        console.log("panelcheat onEnable")

        if (this.abVersionLabel) {
            this.abVersionLabel.string = PlayerData.instance.ABTestCode
        }
    },

    onClose() {
        this.node.active = false;
    },

    onAddMoney() {
        PlayerData.instance.showGold = Number(this.goldEditBox.string);
        PlayerData.instance.gold = Number(this.goldEditBox.string);
        PlayerData.instance.zongZi = Number(this.goldEditBox.string);
        PlayerData.instance.saveUserData()
        PlatformMgr.syncNFTRankPlayerInfo(PlayerData.instance.bitverseWallet)
        cc.director.loadScene("Battle");
    },

    onAddScore() {
        PlayerData.instance.rankStar = Number(this.scoreEditBox.string);
        PlayerData.instance.oldRankData = ConfigData.instance.getRankDataByStar(PlayerData.instance.rankStar);
        PlayerData.instance.rankData = ConfigData.instance.getRankDataByStar(PlayerData.instance.rankStar);
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onAddKill() {
        PlayerData.instance.killCount = Number(this.killEditBox.string);
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onSetKill() {
        PlayerData.instance.setHolidayScore(Number(this.setkillEditBox.string));
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onAddPlay() {
        PlayerData.instance.showPanelSignFlag = false;
        PlayerData.instance.playCount = Number(this.playEditBox.string);
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onAddWin() {
        PlayerData.instance.showPanelSignFlag = false;
        PlayerData.instance.winCount = Number(this.winEditBox.string);
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onAddTime() {
        GameData.instance.gameTime = Number(this.timeEditBox.string);
        // PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onAddSign() {
        PlayerData.instance.onDaySpan()
        PlayerData.instance.cheatOffset += 86400000;
        PlayerData.instance.showPanelSignFlag = false;
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onResetShareDailyRequest() {
        PlatformMgr.resetShareDailyRequest(() => {
            this.onAddSign();
        })
    },

    onAddTimeOffset() {
        PlayerData.instance.cheatOffset += Number(this.timeOffsetEditBox.string) * 60000;
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onAddOffline() {
        PlayerData.instance.getOfflineGoldTime -= Number(this.offlineEditBox.string) * 3600000;
        PlayerData.instance.lastChangeGoldMultipTime -= Number(this.offlineEditBox.string) * 3600000;
        PlayerData.instance.offlineFlag = false;
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },
    // update (dt) {},
    onAddRepay() {
        PlayerData.instance.hasRepay = false;
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onSetGrow(event, type) {
        var index = Number(type);
        PlayerData.instance.growLevel[index] = Number(this.GrowEditBoxs[index].string) - 1;
        PlayerData.instance.saveUserData();
        cc.director.loadScene("Battle");
    },

    onAddWatchAdver() {
        PlayerData.instance.totalAdverCount = Number(this.adverEditBox.string);
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onClearTreasure() {
        PlayerData.instance.treasureTurn = 0;
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onOpenMaxAdDebugView() {
        // PlayerData.instance.treasureTurn = 0;
        // PlayerData.instance.saveUserData()
        // cc.director.loadScene("Battle");
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManage",
            "openMaxAdDebug",
            "()V");
    },

    onAddDiamond() {
        PlayerData.instance.zongZi = Number(this.goldEditBox.string);
        PlayerData.instance.saveUserData()
        cc.director.loadScene("Battle");
    },

    onModifyWallet() {
        PlayerData.instance.bitverseWallet = this.walletEditBox.string
        PlayerData.instance.saveUserData()
        this.rankModify()
        cc.director.loadScene("Battle");
    },

    onOpenUrlClick: function () {
        let uri = this.webUrlEditBox.string
        if(uri==""){
            uri = "www.baidu.com"
        }
        AdvertMgr.instance.webViewOpen(uri)
    },

    onModifyRankingScore() {
        PlayerData.instance.nftRankScore = Math.max(0,Number(this.rankScoreEditBox.string))
        PlayerData.instance.saveUserData()
        this.rankModify()
        cc.director.loadScene("Battle");
    },

    rankModify: function () {
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
                score: PlayerData.instance.nftRankScore,
                rank: 1,
                adress: PlayerData.instance.bitverseWallet,
                id: 0,
            }
            nftRank = 1
        }
        else {
            let hasMine = false
            for (let index = 0; index < array.length; index++) {
                let rankData = array[index]
                if (rankData.adress == PlayerData.instance.bitverseWallet) {
                    //玩家自己
                    rankData.score = PlayerData.instance.nftRankScore
                    nftRank = rankData.rank
                    array[index] = rankData
                    hasMine = true
                    break;
                }
            }

            if(!hasMine){
                PlayerData.instance.myWorldRankData = {
                    score: PlayerData.instance.nftRankScore,
                    rank: -1,
                    adress: PlayerData.instance.bitverseWallet,
                    id: 0,
                }
                PlayerData.instance.holidayWorldRankData[0].count++;
                PlayerData.instance.holidayWorldRankData[0].rankInfo.push(PlayerData.instance.myWorldRankData)
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
            nftRank = myRank
        }
    }

});