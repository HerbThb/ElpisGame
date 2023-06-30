var WeiShuSdk = require("WeiShuSdk");
const PlatformMgr = require('PlatformMgr');
cc.Class({
    extends: cc.Component,
    properties: {
        btn: cc.Button,
        app: cc.Label,
        listCfg: [],
        display: false, //是否显示自身
        autoRef: false, //是否自动刷新动图
        seqSlot: true, //是否顺序播放动图
        bog: 5, //单图自动刷新间隔/秒
        swTimes:2, //如果自动刷新 播放几次后自动刷新
        anim: cc.Animation, //动画组件
        playTimes: 0 //单动画播放次数
    },

    enableDisplay() {
        if(this.cfg){
            this.node.opacity = 255;
        }else{
            this.display = true;
        }
    },

    onLoad () {
        this.node.opacity = 0;
        if(WeiShuSdk.userData.vidStamp && (WeiShuSdk.getTimeSpanAt0() < WeiShuSdk.userData.vidStamp)){
            return; //今天已看过视频广告 广告组件已关闭
        }
        this.idx = -1;
        this.processCfg();
        
        this.btn.node.on("click", this.onNav, this);
    },

    onDisable() {
        this.btn.node.off("click", this.onNav, this);
        this.autoRef &&  this.anim.off("stop", this.chkAutoRef, this);
    },

    onEnable(){
        this.btn.node.on("click", this.onNav, this);
        this.autoRef &&  this.anim.on("stop", this.chkAutoRef, this);
    },

    processCfg() {
        let url = WeiShuSdk.baseUrl + "Gif2End/knife666_gif.json";
        this.listCfg = [];
        let self = this;
        cc.loader.load( url, function( err, res) {
            if (res && res.data){
                (self.listCfg = res.data);
                self.autoRef = !!res.autoRef;
                self.seqSlot = !!res.seqSlot; //是否顺序播放 否则随机播放
                self.bog = res.bog;
                self.swTimes = res.swTimes;
                self.playTimes = 0;
                self.regBoards();
                self.anim.on("stop", self.chkAutoRef, self); //播放完成检查自动刷新
            }
        });
    },

    regBoards() { //注册新动图
        if(!this.listCfg) return;
        let len = this.listCfg.length;
        if(this.seqSlot){ //顺序播放
            this.idx = (this.idx >= len - 1) ? 0 : (this.idx + 1);
        }else{ //随机播放
            this.idx = Math.random() * len|0;
        }
        let res = this.listCfg[this.idx];
        if(!res) return;
        this.fetchAd(res);
    },

    fetchAd(cfg){ //拉取动图广告
        if(cfg.mod == 1){ //序列帧动画
            if(this.anim.getAnimationState(cfg.raw)){
                this.playNext(cfg, cfg.raw);
                return;
            }
            let urls = [];
            for(let i=1;i<cfg.count;i++) {
                urls.push(WeiShuSdk.baseUrl + "Gif2End/anim/" + cfg.raw +"/" + i + ".png");
            }
            let self = this;
            cc.loader.load(urls, function( err, res) {
                let spfs = [];
                for(let j=0; j<cfg.count-1; j++){
                    let sp = new cc.SpriteFrame(urls[j]);
                    spfs.push(sp);
                }
                let clip = cc.AnimationClip.createWithSpriteFrames(spfs, cfg.interval);
                clip.name = cfg.raw;
                clip.speed = 1;
                self.anim.addClip(clip);
                self.playNext(cfg, cfg.raw);
            });
        }else{ //单图
            let name = cfg.raw.split('.')[0];
            if(this.anim.getAnimationState(name)){
                this.playNext(cfg, name);
                (this.autoRef) && this.scheduleOnce(this.regBoards, this.bog);
                return;
            }
            let url = WeiShuSdk.baseUrl + "Gif2End/img/" + cfg.raw;
            let sp = new cc.SpriteFrame(url);
            let clip = cc.AnimationClip.createWithSpriteFrames([sp]); 
            clip.name = name;
            clip.speed = 1;
            this.anim.addClip(clip);
            this.playNext(cfg, name);
            (this.autoRef) && this.scheduleOnce(this.regBoards, this.bog);
        }
    },

    playNext(cfg, name){ //播放下一个动图
        this.anim.play(name);
        this.cfg = cfg;
        this.app.string = cfg.name;
        this.display && (this.node.opacity = 255);
    },

    chkAutoRef(){
        if(this.autoRef){ 
            this.playTimes += 1;
            if(this.cfg.mod == 1){
                if(this.playTimes < this.swTimes){
                    this.anim.play(this.anim.currentClip.name)
                }else{
                    this.playTimes = 0;
                    this.regBoards();
                }
            }
        }else{
            this.anim.play(this.anim.currentClip.name)
        }
    },

    onNav() { //跳转到小游戏
        let self = this;
        if(!this.cfg) return;
        if (wx.navigateToMiniProgram){
            wx.navigateToMiniProgram({
                appId: self.cfg.appid,
                path: self.cfg.path,
                success: res=>{
                    console.log("nav successed");
                    PlatformMgr.adStatis(self.cfg);
                },
                fail: res=>{
                    self.unschedule(self.regBoards);
                    self.playTimes = 0;
                    self.regBoards(); //刷新动图
                }
            });
        }
    }
});
