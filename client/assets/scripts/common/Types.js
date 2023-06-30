//持续状态
const KnifeState = cc.Enum({
    Normal: -1, //无状态
    Attack: -1, //攻击状态
    Defence: -1, //龟缩状态
});

//瞬时状态
var KnifeMomentState = cc.Enum({
    Init: -1, //初始化
    Capture: -1, //被抓取  抓取后可以变成AD
    CaptureFinish: -1, //抓取完毕
    Release: -1, //被弹开 弹开后变成无状态
    ReleaseFinish: -1, //弹开完毕
});

const KnifeColliderState = cc.Enum({
    Land: -1, // 在地上
    Attack: -1, // 在人身上
    Throw: -1, // 被扔掉过程中
});

const BuffState = cc.Enum({
    Big: -1,
    Fast: -1,
    Hard: -1,
    Magnet: -1,
    Frenzy: -1,
    Count: -1,
});

const AIMoveState = cc.Enum({
    Normal: -1, // 找下一个路点
    Moving: -1, // 移动中
    Thinking: -1, // 犹豫
});

const ActionState = cc.Enum({
    Begin: -1, // 没开始
    Ing: -1, // 进行中
    End: -1, // 结束
});

/**
 * 队伍颜色
 */
const TEAM_COLOR = [
    new cc.Color().fromHEX('#acb1ba'),
    new cc.Color().fromHEX('#ef8a34'),
    new cc.Color().fromHEX('#76d348'),
    new cc.Color().fromHEX('#5bb7ff'),
    new cc.Color().fromHEX('#d867d9'),
    new cc.Color().fromHEX('#e7d963'),
    new cc.Color().fromHEX('#5e62ff'),
    new cc.Color().fromHEX('#01ddb6'),
    new cc.Color().fromHEX('#ef5d5d'),
];

/**
 * 名字颜色
 */
const NAME_COLOR = [
    new cc.Color().fromHEX('#FFFFFF'),
    new cc.Color().fromHEX('#761111'),
    new cc.Color().fromHEX('#0D8944'),
    new cc.Color().fromHEX('#112E9A'),
    new cc.Color().fromHEX('#8C0063'),
    new cc.Color().fromHEX('#A85C0A'),
    new cc.Color().fromHEX('#FFFFFF'),
    new cc.Color().fromHEX('#097680'),
    new cc.Color().fromHEX('#FFFFFF'),
];


const NoticeType = cc.Enum({
    Attack_One: -1,
    Attack_Two: -1,
    Defence_One: -1,
    Defence_Two: -1,
    Knife: -1,
    Enemy: -1,
    Block: -1,
    Wall: -1,
    Defence: -1,
    Time_30: -1,
    Time_10: -1,
});

const SoundID = cc.Enum({
    Death: -1,
    HitFast: -1,
    HitSlow: -1,
    Spin: -1,
    Kill: -1,
    Start: -1,
    firstblood: -1,
    doublekill: -1,
    tribblekill: -1,
    quadrkill: -1,
    pandakill: -1,
    godlike: -1,
});


/**
 * 缓存池类型
 * @enum {number}
 */
const PoolType = cc.Enum({
    /** 玩家 */
    PLAYER: 0,
    /** 跟随玩家 */
    FOLLOW_PLAYER: 1,
    /** 刀 */
    KNIFE: 2,
    /** 障碍 */
    BLOCK: 3,
    /** 墙 */
    WALL: 4,
    /** 碰撞特效 */
    COLL_EFFECT: 5,
    BLOCK_01: 6,
    BLOCK_02: 7,
    BLOCK_03: 8,
    BLOCK_04: 9,
    BLOCK_05: 10,
    BLOCK_06: 11,
    BLOCK_07: 12,
    BLOCK_08: 13,
    BUFF: 14,
    SHOW_KNIFE_EFFECT: 15,
    DODGE_EFFECT: 16,
    DESTROY_DEFENCE_EFFECT: 17,
    CIRCLE_WALL: 18,
    Effect_Reborn: 19,
    CIRCLE_BLOCK: 20,
    BOX: 21,
    NEZHA_EFFECT: 22,
    COUNT: 23,
});

/**
 * 平台类型
 * @enum {number}
 */
const PlatformType = cc.Enum({
    /** 浏览器 */
    Other: 0,
    /** 微信小游戏 */
    WECHAT: 1,
    /** 浏览器 */
    BROWSER: 2,
    /** iOS原生 */
    IOS: 3,
    /** ANDROID原生 */
    ANDROID: 4,
});

/**
 * 渠道类型
 * @enum {number}
 */
const ChannelType = cc.Enum({
    /** 未知 */
    Other: 0,
    /** rb0 */
    RiceBall: 1,
    /** rb1 */
    RiceBall_1: 2,
    /** rb3 
     *MAX广告聚合 
     *增加开屏和banner广告;增加一些广告源 
     *增加埋点
     */
    RiceBall_2: 3,
});

/**
 * 分享类型
 * @enum {number}
 */
const ShareType = cc.Enum({
    /** 没有分享 */
    NONE: -2,
    /** 首页分享 */
    HOME: 0,
    /** 胜利分享 */
    WIN: 1,
    /** 金币翻倍 */
    MultipGold: 2,
    /** 复活 */
    Revive: 3,
    /** 开局加刀 */
    AddKnife: 4,
    /** 解锁皮肤 */
    UnlockSkin: 5,
    /** 试用皮肤 */
    TryOutSkin: 6,
    /** 保星 */
    ProtectStar: 7,
    /** 排行榜 */
    Friend: 8,
    /** 签到 */
    Sign: 9,
    /** 成长升级节点 */
    GrowNode: 10, // 
    /** 离线收益翻倍 */
    OfflineGold: 11,
    /** 成长金币不足 */
    NotEnoughMoney: 12,
    /** 刷新日常任务 */
    RefreshDailyTask: 13, //
    /** 翻倍日常任务奖励 */
    MultipDailyTask: 14, //
    /** 结算二次翻倍奖励 */
    MultipAgain: 15, //
    /** 段位升级 */
    LevelUp: 16, //
    /** 新人邀请 */
    Invite: 17, //


});

const AdverType = cc.Enum({
    Revive: -1, // 复活 0
    MultipGold: -1, // 结算金币翻倍 1
    UnlockSkin: -1, // 段位解锁皮肤 2
    TryOutSkin: -1, // 试用皮肤 3
    ProtectStar: -1, // 保星 4
    Sign: -1, // 签到 5
    WatchAdver: -1, // 累计看广告得皮肤 6
    NotEnoughMoney: -1, // 金币不足 7
    GrowNode: -1, // 成长升级节点 8
    OfflineGold: -1, // 离线收益翻倍 9
    MultipDailyTask: -1, //翻倍日常任务奖励 10
    RefreshDailyTask: -1, //刷新日常任务 11
    MultipAgain: -1, //结算二次翻倍奖励 12
    AddKnife: -1,    //13
    BuySkin: -1,        //14
    TreasurBox: -1, //15
    ShopFreeDiamond: -1, //16

    //新增
    UnlockHeroSkin:-1, // 17
    Missions:-1,
    AddKey:-1,
});

/**
 * ai配置枚举
 */
const AICfgType = cc.Enum({

    /** 开局减速 */
    Slow: -1,
    /** 有判断玩家是否防御的能力 */
    HeroDefence: -1,
    /** 面对玩家龟缩的犹豫时间 */
    HeroDefenceThinking: -1,
    /** 比玩家刀更少（逃跑、防御） */
    KnifeLess: -1,
    /** 防御行为的持续时间 */
    DefenceTime: -1,
    /** 是否判断ai在附近 */
    AINear: -1,
    /** 是否会主动捡刀 */
    PickKnife: -1,
    /** 主动捡刀直到多少把 */
    NoPickKnifeNum: -1,
    /** 在玩家进攻时直接冲上来 */
    TowardHero: -1,
    /** 玩家防御的傻瓜行为（冲上来） */
    HeroDefenceSilly: -1,
    /** 比玩家刀多傻瓜行为（逃跑） */
    KnifeMoreSilly: -1,
    /** 保持和平 */
    peace: -1,
    /** 追击时长 */
    towardTime: -1,
    /** 自己刀很少 */
    LowKnife: -1,
    /** 拥有比玩家更多的刀（4把）(即使玩家防御也冲上来) */
    moreKnifeToward: -1,
    /** 刀少于玩家 逃跑前是否思考 */
    lessKnifeEscape: -1,
    /** 复活次数 */
    ReviveTotal: -1,

});

/**
 * 新手期ai额外配置
 */
const AIFreshCfgType = cc.Enum({
    noPickNum: -1,
    noDefence: -1,
    removeToward: -1,
});


/**
 * 任务类型
 * @enum {number}
 */
const TaskType = cc.Enum({
    /** 累计登录天数任务 */
    LOGIN: 0,
    /** 游戏场次任务 */
    PLAYCOUNT: 1,
    /** 击败人数任务 */
    KILLCOUNT: 2,
    /** 达到指定段位任务 */
    RANK: 3,
    /** 对应皮肤累计看视频任务 */
    ADVERCOUNT: 4,
    /** 端午任务 */
    DUANWU: 5,
    /** 九宫格宝箱任务 */
    TREASUREBOX: 6,
});

/**
 * 每日任务类型
 * @enum {number}
 */
const DailyTaskType = cc.Enum({
    /** 击杀敌人数量xx人 */
    KILL_COUNT: 0,
    /** 战斗中累计拾取xx把飞刀 */
    TOTAL_PICK_KNIFE_COUNT: 1,
    /** 战斗中拾取飞刀的最高数 */
    MAX_PICK_KNIFE_COUNT: 2,
    /** 战斗内累计拼掉对手飞刀数量 */
    KILL_KNIFE_COUNT: 3,
    /** 战斗局数 */
    PLAY_COUNT: 4,
    /** 战斗胜利次数 */
    WIN_COUNT: 5
});


/**
 *  战斗 模式
 * @enum {number}
 */
const BattleModeType = cc.Enum({
    /**  */
    Normal: 0,
    /**NFT   世界 大赛 */
    NFT_RANK: 1,
});

/**
 * 发布环境
 */
const Environment = cc.Enum({
    // 开发环境
    Develop: -1,
    // 发布环境
    Publish: -1,
    // 测试环境
    Test: -1,
    // QA环境
    QA: -1,
    // 体验环境
    Trial: -1
});


const ItemType = cc.Enum({
    MONEY: -1,
    KNIFE_SKIN: -1,
    HERO_SKIN: -1,
    ZONG_ZI: -1,
    CARD: -1,
    COUNT: -1,
});

const OpenDataMsgType = cc.Enum({
    idle: -1,
    Show: -1,
    Close: -1,
    Left: -1,
    Right: -1,
    Mini: -1,
    CloseMini: -1,
});

const FrenzyAddType = cc.Enum({
    pick: -1,
    throw: -1,
    kill: -1,
    revive: -1,
    tryFrenzy: -1,
    born: -1
});

const KnifeSkinProperty = cc.Enum({
    Dodge: -1,
});

const HeroSkinProperty = cc.Enum({
    Speed: -1,
});

const GrowType = cc.Enum({
    Attack: -1,
    Defence: -1,
    Speed: -1,
    Gold: -1,
    Offline: -1,
});

const MapType = cc.Enum({
    Rect: -1,
    Circle: -1,
});

const HeroRebornEffectState = cc.Enum({
    Close: -1,
    waitToShow: -1,
    Open: -1,
});

//分步开放的阶段枚举
const StageType = cc.Enum({
    Free: 0,
    Share: 1,
    Adver: 2,
});

const SuitType = cc.Enum({
    DEFAULT: 0,
    SPIDERMAN: 1, //蜘蛛侠
    PIKAQIU: 2, //皮卡丘
    NEZHA: 3, //哪吒
    ULTRAMAN: 4, //奥特曼
    BATMAN: 5, //辩护侠
    YELLOWMAN: 6 //小黄人
});

const CustomFunnelEvent = cc.Enum({
    default: -1,
    Login_Start: 100,
    Login_Suc: 101,
    Load_UserData: 102,
    Load_ConfigData: 103,
    Switch_BattleFire: 104,
    World_Init: 105,
    World_Finish: 106,
    UI_Match: 107,
    First_Game_Start: 108,
    Kill_One: 109,
    Kill_Two: 110,
    Kill_Three: 111,
    First_Game_Finish: 112,
    GameOverPanel: 113,
    BackToHome: 114,
    RankUpEnd: 115,
    NewHeroClose: 116,
    GameTwo: 117,
});

/**
 * 操作系统类型
 * @enum {number}
 */
const OSType = cc.Enum({
    UNKNOWN: 0,
    IOS: 1,
    ANDROID: 2,
});

const ItemGetType = cc.Enum({
    DIAMOND: -1,
    GOLD: -1,
    ADVER: -1,
    RANK: -1,
    TASK: -1,
    BOX: -1,
    NFT: -1,
});

const NFTUnLockType = cc.Enum({
    /** 游玩次数 */
    PLAY_COUNT: 20,
    /** 胜利次数 */
    WIN_COUNT: 30
});

module.exports = {
    NFTUnLockType,
    ItemGetType,
    SuitType,
    KnifeState,
    KnifeMomentState,
    KnifeColliderState,
    AIMoveState,
    ActionState,
    TEAM_COLOR,
    NoticeType,
    SoundID,
    NAME_COLOR,
    PoolType,
    PlatformType,
    ChannelType,
    ShareType,
    AICfgType,
    TaskType,
    DailyTaskType,
    AdverType,
    Environment,
    ItemType,
    OpenDataMsgType,
    BuffState,
    FrenzyAddType,
    KnifeSkinProperty,
    HeroSkinProperty,
    AIFreshCfgType,
    GrowType,
    MapType,
    HeroRebornEffectState,
    StageType,
    CustomFunnelEvent,
    OSType,
    BattleModeType,
};