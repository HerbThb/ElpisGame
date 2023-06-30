const ConfigData = require('ConfigData');
const PlayerData = require('PlayerData');
const AdvertMgr = require('AdvertMgr');
const PlatformMgr = require('PlatformMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        //language
        noThanksLabel: cc.Label,

        dogeNode: cc.Node,

        boneNode: cc.Node,

        toggle_btn_1: cc.Toggle,
        toggle_btn_2: cc.Toggle,


        dogeProBg: cc.Node,
        dogeProBar: cc.Node,

        okIcons: {
            default: Array,
            type: [cc.Node],
            displayName: "okIcons",
        },

        btn_bone_get: cc.Node,
        btn_bone_play: cc.Node,

        isProcessNode: cc.Node,
        processBar: cc.Node,

        progressLabel: cc.Label,
        progressLabelFull: cc.Label,

        doge_btn_node : cc.Node,

        status: "",
        isDressed : false,
    },

    init: function (world, callback, closeCallback) {
        this.world = world;

        this.heroData = ConfigData.instance.getHeroSkinById(16);
        this.knifeData = ConfigData.instance.getKnifeSkinById(102);
        if (callback) callback(this.heroData, this.knifeData);
        this.closeCallback = closeCallback;

        var isOwnHeroSkin = PlayerData.instance.isOwnHeroSkin(this.heroData.id);
        var isOwnKnifeSkin = PlayerData.instance.isOwnKnifeSkin(this.knifeData.id);

        this.noThanksLabel.string = "No,thanks";
        this.isDressed = false

        this.dogeNode.active = this.boneNode.active = false

        //领取了doge之后或者链接完钱包之后，显示bone
        var heroData = ConfigData.instance.getHeroSkinById(16);
        var isGet = PlayerData.instance.isOwnHeroSkin(16);

        //NFT测试，显示是否拥有
        if (heroData.getWay == 100 && !isGet) {
            let own = PlatformMgr.nft_user_datas[heroData.goodsId] || 0
            if (own > 0) {
                console.log("购买后。同步到本地皮肤数据")
                PlayerData.instance.addHeroSkin(heroData.id);
                isGet = true
            }
        }

        //已经发送请求后直接显示第二个NFT
        isGet = isGet || PlayerData.instance.nftLock_auto == 1

        if (isGet) {
            this.doge_btn_node.active = false
            this.showBoneNode()
            this.toggle_btn_2.isChecked = true
            AdvertMgr.instance.fireBaseEvent("get_nft_skin_free_show", "ntype", "hero");
            return
        }
        //默认打开doge
        this.showDogeNode()
        
        this.toggle_btn_1.isChecked = true
        this.toggle_btn_2.isChecked = false

        AdvertMgr.instance.fireBaseEvent("get_nft_skin_free_show", "ntype", "weapon");

    },

    //狗头界面按钮
    onClickGetBtn: function () {
        console.log(" PlayerData.instance.nftLock_auto ", PlayerData.instance.nftLock_auto)
        console.log(" PlayerData.instance.bitverseWallet ", PlayerData.instance.bitverseWallet)

        AdvertMgr.instance.fireBaseEvent("click_n_wallet_connect");

        if (PlayerData.instance.nftLock_auto == 1) {
            // AdvertMgr.instance.showUITips(25)
            this.world.uiMgr.showPanelPopUp(ConfigData.instance.getUITipStr(25))
            return
        }

        //走NFT领取流程
        //如果没有钱包地址，链接钱包
        if (PlayerData.instance.bitverseWallet == "") {
            PlatformMgr.connectBitverse()
        } else {
            let data = {
                "id": 16,
                "sort": 14,
                "quality": 8,
                "name": "Doge",
                "url": "texture/hero/player202",
                "hexColor": "#5e62ff",
                "handColor": "#febe9b",
                "getWay": 100,
                "priceType": 0,
                "price": 600000,
                "introduce": "600K gold coins to buy",
                "initKnifeCount": 4,
                "property": 0,
                "propertyParam": 15,
                "propertyTips": "speed+5%",
                "goodsId": 203,
                "goodsName": "Hero#003",
                "token": "87391307324056457762808332143355011852238642475825273327608161608735819564008"
            }

            PlatformMgr.requestNFTGet(data, PlayerData.instance.bitverseWallet, () => {
                this.world.uiMgr.showPanelPopUp(ConfigData.instance.getUITipStr(25))
                if (PlayerData.instance.nftLock_auto == 0) {
                    PlayerData.instance.nftLock_auto = 1
                }
            })
        }

        this.closeBtnClick();
    },



    setStatus(status) {
        this.status = status
    },

    //骨头界面按钮
    onBtnClick() {
        let canGet = PlayerData.instance.winCount >= PlayerData.instance.nftWinCount

        console.log(" PlayerData.instance.nftLock_req ", PlayerData.instance.nftLock_req)
        console.log(" PlayerData.instance.bitverseWallet ", PlayerData.instance.bitverseWallet)

        if (PlayerData.instance.nftLock_req == 1) {
            // AdvertMgr.instance.showUITips(25)
            this.world.uiMgr.showPanelPopUp(ConfigData.instance.getUITipStr(25))
            return
        }

        if (canGet) {
            AdvertMgr.instance.fireBaseEvent("click_n_get");
            //走NFT领取流程
            //如果没有钱包地址，链接钱包
            if (PlayerData.instance.bitverseWallet == "") {
                PlatformMgr.connectBitverse()
            } else {
                let data = {
                    "id": 102,
                    "sort": 40,
                    "quality": 8,
                    "name": "NFT3",
                    "url": "texture/weapon/dao202",
                    "getWay": 100,
                    "priceType": 0,
                    "price": 0,
                    "introduce": "",
                    "initKnifeCount": 8,
                    "property": 0,
                    "propertyParam": 20,
                    "propertyTips": "Dodge+20%",
                    "goodsId": 103,
                    "goodsName": "Weapon#003",
                    "token": "87391307324056457762808332143355011852238642475825273327608161607636307936232"
                }
                PlatformMgr.requestNFTGet(data, PlayerData.instance.bitverseWallet, () => {
                    this.world.uiMgr.showPanelPopUp(ConfigData.instance.getUITipStr(25))
                    if (PlayerData.instance.nftLock_req == 0) {
                        AdvertMgr.instance.fireBaseEvent("click_n_get_success");
                        PlayerData.instance.nftLock_req = 1
                    }
                })
            }

        } else {

            if (this.status == "battle") {
                this.onClose();
                return
            }

            PlayerData.instance.nftToPlayCount++
            AdvertMgr.instance.fireBaseEvent("click_n_play", "round", PlayerData.instance.nftToPlayCount);

            this.world.onEquipKnifeSkin(PlayerData.instance.knifeSkin, true);

            //去玩游戏
            this.world.onStartBtnClick(null, null);
        }
        this.closeBtnClick();
    },


    showDogeNode() {
        this.onDress()
        this.refreshDoge()
        this.dogeNode.active = true
        this.boneNode.active = false
    },

    refreshDoge() {
        //领取了doge之后或者链接完钱包之后，显示bone
        var heroData = ConfigData.instance.getHeroSkinById(16);
        var isGet = PlayerData.instance.isOwnHeroSkin(16);
        //NFT测试，显示是否拥有
        if (heroData.getWay == 100 && !isGet) {
            let own = PlatformMgr.nft_user_datas[heroData.goodsId] || 0
            if (own > 0) {
                console.log("购买后。同步到本地皮肤数据")
                PlayerData.instance.addHeroSkin(heroData.id);
                isGet = true
            }
        }

        //已经发送请求后直接显示第二个NFT
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

        console.log("refreshDoge",rate,PlayerData.instance.isBitverseInstalled,PlayerData.instance.bitverseWallet)

        var extraW = [0,0,60,0]

        this.dogeProBar.width = rate == 4 ? this.dogeProBg.width : this.dogeProBg.width * (rate / 4) + extraW[rate-1]
    },


    showBoneNode() {
        this.offDress(false)
        this.refreshBone()
        this.dogeNode.active = false
        this.boneNode.active = true
    },

    refreshBone() {
        let canGet = PlayerData.instance.winCount >= PlayerData.instance.nftWinCount

        this.processBar.width = canGet ? this.isProcessNode.width : PlayerData.instance.winCount / PlayerData.instance.nftWinCount * this.isProcessNode.width

        this.progressLabel.string = PlayerData.instance.winCount

        // this.progressLabelFull.string = PlayerData.instance.nftWinCount

        this.btn_bone_get.active = canGet

        this.btn_bone_play.active = !canGet
    },

    onDress(){
        if (this.isDressed) {
            return
        }
        this.Dress(true)

        let self = this.world

        PlayerData.instance.addExtraKnife(6);

        self.onEquipHeroSkin(this.heroData, false);
        self.onEquipKnifeSkin(this.knifeData, false);
        self.changeLocalKnifesCount(this.knifeData.initKnifeCount);

        self.localPlayer.followPlayer.node.group = 'ui';
        self.localPlayer.followPlayer.node.parent = self.tempNode;
        self.localPlayer.followPlayer.followPlayerScale.changeScaleMultip(0.7);

        self.localPlayer.node.group = 'ui';
        self.localPlayer.node.parent = self.tempNode;

        self.localPlayer.heroScale.changeScaleMultip(0.6);

        self.localPlayer.node.y += 80;

    },

    Dress(bool){
        this.isDressed = bool
    },

    offDress (success) {
        if (!this.isDressed){
            return
        }
        this.Dress(false)

        let self = this.world
        var playerParent = self.localPlayer.node.parent;
        var followPlayerParent = self.localPlayer.followPlayer.node.parent;
        self.uiMgr.activeGoldNode(true);
        self.uiMgr.activeDiamondNode(true);
        if (!success) {
            PlayerData.instance.addExtraKnife(-6);
            self.onEquipHeroSkin(PlayerData.instance.heroSkin, true);
            self.onEquipKnifeSkin(PlayerData.instance.knifeSkin, true);
            self.changeLocalKnifesCount(PlayerData.instance.knifeSkin.initKnifeCount);
        } else {
            //成功获取
            self.onEquipHeroSkin(this.heroData, false);
            self.onEquipKnifeSkin(this.knifeData, false);
            self.changeLocalKnifesCount(this.knifeData.initKnifeCount);
            self.uiMgr.showActiveSuitEffect();
        }
        self.localPlayer.node.group = 'default';
        self.localPlayer.node.parent = playerParent;
        self.localPlayer.heroScale.changeScaleMultip(1);

        self.localPlayer.node.y = 0;
        self.localPlayer.followPlayer.node.group = 'heroWall';
        self.localPlayer.followPlayer.node.parent = followPlayerParent;
        self.localPlayer.followPlayer.followPlayerScale.changeScaleMultip(1);
    },

    closeBtnClick: function () {
        if (this.isAdver) return;
        if (this.closeCallback) this.closeCallback(false);
        this.node.active = false;
        // AdvertMgr.instance.destoryBanner();
        this.offDress(false)
    },

    onClose() {
        this.node.active = false;
    },

});