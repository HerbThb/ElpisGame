/* jshint undef: true, unused: true */
/* globals Editor */
/* globals require */
/* globals __dirname */
/* globals setTimeout */
/* globals module */

/**
 * TODO:重新梳理流程
 * Build流程:
 * 1.Build工程
 * 2.移除不用的配置表和资源（2.0后build流程变化，没有正常移除）
 * 3.[Web]修改网页标题和Splash图片
 * 3.[WeChat]修改game.json，去除网络超时参数
 * 4.[WeChat]修改game.js、main.js，为webpack做准备
 * 5.[WeChat]运行webpack打包js
 * 6.[WeChat]移除原工程的game.js、main.js、cocos2d-js-mini.js、/libs、/src，拷贝out/game.js至工程目录
 */

'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const md5File = require('md5-file');
const ncp = require('ncp').ncp;
const os = require('os');
const archiver = require('archiver');
const crypto = require('crypto');
const tool = require('cocos-build-tool');

const CONFIG_FILE_SUB_PATH = path.join('resources', 'config', 'config.json');
const CONFIG_FILE_PATH = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, 'assets', CONFIG_FILE_SUB_PATH);

const unixNodeCmd = '/usr/local/bin/node';
const winNodeCmd = 'C:\\Program\ Files\ (x86)\\nodejs\\node';
const STEP_COUNT = 3;

/** 拷贝选项，是否覆盖 */
const COPY_OPTION_OVERWRITE = 1 << 0;
/** 拷贝选项，完成后是否删除源文件 */
const COPY_OPTION_DELETE_SRC = 1 << 1;
/** 拷贝选项，拷贝前是否删除目标文件 */
const COPY_OPTION_DELETE_DST = 1 << 2;

/**
 * 渠道枚举
 * @enum {number}
 */
const PlatformType = {
    UNKNOWN: -1,
    /** 浏览器 */
    BROWSER: 0,
    /** 微信小游戏 */
    WECHAT: 3,
    /** QQ玩一玩 */
    QQ: 2,
    /** 原生应用 */
    APP: 4,
    /** 绿厂 */
    OPPO: 5,
    /** 蓝厂 */
    VIVO: 6,
    /** qq小游戏 */
    QQminiAPP: 7,
};

let step = 0;
let isProcessing = false;
let _buildDestPath = null;
let _buildPlatform = null;
let compressCallback = null;
let platformType = PlatformType.UNKNOWN;
let isH5 = false;
let isNative = false;

let isMac = false;
let isWin = false;
if (os.platform().indexOf('win32') >= 0 || os.platform().indexOf('win64') >= 0) {
    isWin = true;
} else {
    isMac = true;
}
/** RES版本号 */
let s_resVersion = -1;

/**
 * build开始时的处理
 * @param {string} destPath 目标路径
 * @param {string} platform 目标平台
 * @param {function} callback 完成回调
 */
function buildStartProcess(destPath, platform, callback) {
    // native版本删除res.xxx.json
    if (platform === 'ios' || platform === 'android') {
        if (fs.existsSync(destPath)) {
            var files = fs.readdirSync(destPath);
            for (const file of files) {
                if (file.startsWith('res.') && file.endsWith('.json')) {
                    fs.unlinkSync(path.join(destPath, file));
                }
            }
        }
    }

    let scriptModifyFlag = false;
    let scriptPath = path.join(__dirname, '..', '..', 'assets', 'scripts', 'common');
    let filePath = path.join(scriptPath, 'PlatformMgr.js');
    if (modifyH5SdkCode(filePath, platform)) {
        scriptModifyFlag = true;
    }

    filePath = path.join(scriptPath, 'ShareMgr.js');
    if (modifyH5SdkCode(filePath, platform)) {
        scriptModifyFlag = true;
    }

    if (scriptModifyFlag) {
        Editor.assetdb.refresh('db://assets/scripts/common', (err, results) => {
            if (err) {
                Editor.error('Failed to reimport asset, stack:%s', err.stack);
            } else {
                // Editor.log('Success to reimport asset scripts');
                Editor.assetdb._handleRefreshResults(results);
            }
            if (callback) callback();
        });
    } else {
        if (callback) callback();
    }
}

/**
 * build结束前的处理
 * @param {string} buildDestPath build路径
 * @param {string} platform 目标平台
 * @param {function} callback 完成回调
 */
function beforeBuildFinishProcess(destPath, platform, callback) {
    try {
        // 删除不需要的配置表
        let configDirPath = path.join(destPath, 'res', 'raw-assets', 'resources', 'config');
        rimraf.sync(path.join(configDirPath, 'server'));
        rimraf.sync(path.join(configDirPath, 'plugin'));
        rimraf.sync(path.join(configDirPath, 'tiledmap', 'navi'));

        let tiledmapDirPath = path.join(configDirPath, 'tiledmap');
        fs.readdir(tiledmapDirPath, (err, files) => {
            if (err) {
                // Editor.error(err);
            } else {
                for (const file of files) {
                    const filePath = path.join(tiledmapDirPath, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isFile() && !filePath.endsWith('.png')) {
                        fs.unlink(filePath, err => {
                            if (err) throw err;
                        });
                    }
                }
            }
        });

        switch (platform) {
            case 'web-mobile': {
                // H5版修改标题
                tool.editTextFile(path.join(destPath, 'index.html'), function (str) {
                    return str.replace(/(<title\b[^>]*>)[^<>]*(<\/title>)/i, '$1欢乐枪战$2');
                });
                break;
            }
            case 'wechatgame': {
                // Wechat版修改game.json
                let gameJsonPath = path.join(destPath, 'game.json');
                tool.editTextFile(gameJsonPath, function (str) {
                    let json = JSON.parse(str);
                    // if (json.networkTimeout) {
                    //     delete json.networkTimeout;
                    // }
                    return JSON.stringify(json);
                });
                break;
            }
            case 'qqplay': {
                // QQ-BRICK版修改main.js
                let mainJsPath = path.join(destPath, 'main.js');
                tool.editTextFile(mainJsPath, function (str) {
                    return str.replace(/([\n\t\s]*)(BK\.Script\.loadlib\('GameRes:\/\/libs\/qqplay-adapter\.js'\);)([\n\t\s]*)}/, '$1$2$1BK.Script.loadlib(\'GameRes://libs/h5jssdk.limi.js\');$3}');
                });
                break;
            }
            case 'oppo-runtime':
            case 'vivo-runtime': {
                // OPPO-JSB版和VIVO-JSB版设置platformType
                tool.editTextFile(path.join(destPath, getRelateFilePathWithFullInfo(destPath, 'src/project')), function (str) {
                    var platfromTypeEnum = _buildPlatform === 'vivo-runtime' ? 'VIVO' : 'OPPO';
                    return str.replace(/(platformType ?= ?\w*\.)APP/, '$1' + platfromTypeEnum);
                });
                break;
            }
        }

        copyBuildTemplatesFromPlugin(destPath, platform, () => {
            if (callback) callback();
        });

    } catch (e) {
        Editor.error(e);
        if (callback) callback();
    }

    // if (callback) callback();
}

/**
 * build结束后的处理
 * @param {string} destPath 目标路径
 * @param {string} platform 目标平台
 * @param {function} callback 完成回调
 */
function afterBuildFinishProcess(destPath, platform, callback) {
    // 生成res.[resVersion].json
    generateResFile(destPath, platform);
    
    if (platform === 'wechatgame') {
        // 修复微信音效错乱问题
        // https://forum.cocos.com/t/2-0-9/75030
        let buildDestPath = getBuildTempDestPath(null, platform);
        tool.editTextFile(path.join(buildDestPath, 'game.js'), (str) => {
            var exists = fs.existsSync(path.join(buildDestPath, 'libs', 'wx-fs-utils.js'));
            // Editor.log('wx-fs-utils.js exists:' + exists);
            if (exists) {
                str = str.replace(/(\r?\n)(\r?\n)(window\.boot\(\);)/, '$1wxDownloader.init();$2$3');
            }
            return str;
        });
    }
    callback();
    playSound(getPlatformChineseString(null) + '编译完成');
    Editor.success('#################### Build完成 ####################');
}

/**
 * build完成后各渠道的处理
 * @param {string} buildDestPath build目标路径
 * @param {string} platform build平台
 * @param {function} callback 处理完成回调
 */
function buildPostProcess(buildDestPath, platform, callback) {
    if (isProcessing) {
        Editor.warn('webpack打包进行中，稍安勿躁。');
        return;
    }
    isProcessing = true;

    buildDestPath = getBuildFinalDestPath(buildDestPath, platform);
    step = 0;
    // baseProcess(buildDestPath, platform);

    if (platform === 'wechatgame') {
        var finishFunc = function () {
            tool.editTextFile(path.join(buildDestPath, 'game.js'), (str) => {
                const addStr = 'require("utils/ald-game.js");\n';
                if (str.startsWith(addStr)) {
                    return null;
                } else {
                    str = addStr + str;
                    return str;
                }
            });
            isProcessing = false;
            if (callback) callback();
        };

        var fun = function (str) {
            // str = str.replace(/prefab\/battle\/bullet/g, 'yuzhiti/fight/zidan');
            // str = str.replace(/prefab\/battle\/effect\/buff/g, 'yuzhiti/fight/xiaoguo/zengyi');
            // str = str.replace(/prefab\/battle\/effect\/charge/g, 'yuzhiti/fight/xiaoguo/xuli');
            // str = str.replace(/prefab\/battle\/effect\/hit/g, 'yuzhiti/fight/xiaoguo/jizhong');
            // str = str.replace(/prefab\/battle\/effect\/player-skill/g, 'yuzhiti/fight/xiaoguo/jineng');
            // str = str.replace(/prefab\/battle\/effect\/supply/g, 'yuzhiti/fight/xiaoguo/zhiyuan');
            // str = str.replace(/prefab\/battle\/emoji/g, 'yuzhiti/fight/biaoqing');
            // str = str.replace(/prefab\/battle\/gun/g, 'yuzhiti/fight/qiang');
            // str = str.replace(/prefab\/battle\/map/g, 'yuzhiti/fight/ditu');
            // str = str.replace(/prefab\/battle\/player\/info/g, 'yuzhiti/fight/wanjia/xinxi');
            // str = str.replace(/prefab\/battle\/player\/skin/g, 'yuzhiti/fight/wanjia/pifu');
            // str = str.replace(/prefab\/battle\/player\/spine/g, 'yuzhiti/fight/wanjia/guge');
            // str = str.replace(/prefab\/battle\/utils/g, 'yuzhiti/fight/gongju');
            str = str.replace(/prefab\/common/g, 'yuzhiti/tongyong');
            str = str.replace(/prefab\/ui\/common/g, 'yuzhiti/crazyui/tongyong');
            str = str.replace(/prefab\/ui\/game/g, 'yuzhiti/crazyui/youxi');
            str = str.replace(/prefab\/ui\/hero/g, 'yuzhiti/crazyui/yingxiong');
            str = str.replace(/prefab\/ui\/instruction/g, 'yuzhiti/crazyui/jieshao');
            str = str.replace(/prefab\/ui\/load/g, 'yuzhiti/crazyui/jiazai');
            str = str.replace(/prefab\/ui\/lobby/g, 'yuzhiti/crazyui/zhuti');
            str = str.replace(/prefab\/ui\/login/g, 'yuzhiti/crazyui/zairuzhong');
            str = str.replace(/prefab\/ui\/player/g, 'yuzhiti/crazyui/wanjia');
            str = str.replace(/prefab\/ui\/popPanel/g, 'yuzhiti/crazyui/topjiemian');
            str = str.replace(/prefab\/ui\/result/g, 'yuzhiti/crazyui/jiesuan');
            str = str.replace(/prefab\/ui\/scenehome/g, 'yuzhiti/crazyui/changjingzhuye');
            str = str.replace(/prefab\/ui\/update/g, 'yuzhiti/crazyui/gengxin');
            str = str.replace(/prefab\/ui\/weapon/g, 'yuzhiti/crazyui/wuqi');
            return str;
        };

        tool.editTextFile(path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'src/settings')), function (str) {
            str = fun(str);
            return str;
        });

        tool.editTextFile(path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'src/project')), function (str) {
            str = fun(str);
            str = tool.replaceProjectFunc(str);
            return str;
        });

        // //[WeChat]修改webpack相关js文件
        // if (modifyWebpackJSFiles(buildDestPath)) {
        //     //[WeChat]运行webpack
        //     runWebpack(buildDestPath, () => {
        //         //[WebChat]拷贝js文件
        //         moveFinalJS(buildDestPath, () => {
        //             finishFunc();
        //         });
        //     });
        // } else {
        //     Editor.error('处理结束，webpack打包异常，详情请查看日志。');
        //     isProcessing = false;
        //     if (callback) callback();
        // }
        finishFunc();
    } else if (isH5 || isNative) {
        isProcessing = false;

        // QQ_H5,修改index.html
        let indexFilePath = path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'index'));
        let indexFileName = null;
        let buildTemplatesPath = null;
        let platfromTypeEnum = null;
        let versionName = null;
        let versionCode = null;
        let resRemoteUrl = null;

        let buildConfig = null;
        let buildConfigPath = path.join(__dirname, '..', '..', 'build-templates', 'build-config.json');
        if (fs.existsSync(buildConfigPath)) {
            buildConfig = JSON.parse(fs.readFileSync(buildConfigPath, 'utf8'));
        }

        switch (platformType) {
            case PlatformType.QQ: {
                platfromTypeEnum = 'QQ';
                buildTemplatesPath = 'qqplay-h5';

                Editor.log('修改index.html, 路径:' + indexFilePath);
                if (fs.existsSync(indexFilePath)) {
                    let str = fs.readFileSync(indexFilePath, 'utf8');
                    if (str && str.length > 0) {
                        // QQ版需要把资源url都加上?_gameid=3319后缀，script引入qqPlayCore.js等脚本
                        str = str.replace(/.css"\/>/, '.css?_gameid=3319"/>');
                        str = str.replace(/(['"])([-\w\./]*\.js)(['"])/g, '$1$2?_gameid=3319$3');
                        str = str.replace(/<\/script>\n<\/body>/, '<\/script>\n<script src="qqPlayCore.js?_gameid=3319"></script>\n<script src="h5jssdk.limi.js?_gameid=3319"></script>\n<script src="WebHook.js?_gameid=3319"></script>\n</body>'); //<script src="h5jssdk.limi.js?_gameid=3319"></script>\n
                        // 给index.html添加md5后缀，后续还需要修改gameConfig.json中对应的url
                        // (其实这一步可以跳过,本意是为了防止更新时拉取到旧页面,但页面是打在包里的,应该不会出现这种情况)
                        let extName = path.extname(indexFilePath);
                        let md5 = crypto.createHash('md5').update(str).digest('hex');
                        fs.unlinkSync(indexFilePath);
                        indexFileName = path.basename(indexFilePath);
                        if (indexFileName.indexOf('.') >= 0) indexFileName = indexFileName.substring(0, indexFileName.indexOf('.'));
                        Editor.log('修改index.html, indexFileName:' + indexFileName);
                        indexFileName += '.' + md5.substring(0, 5) + extName;
                        indexFilePath = path.join(path.dirname(indexFilePath), indexFileName);
                        fs.writeFileSync(indexFilePath, str);
                    }
                } else {
                    Editor.error('index.html不存在');
                    indexFileName = null;
                }

                let mainFilePath = path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'main'));
                tool.editTextFile(mainFilePath, function (str) {
                    return str.replace(/(project\.\w*\.js)'/g, '$1?_gameid=3319\'');
                });
                break;
            }
            case PlatformType.OPPO: {
                platfromTypeEnum = 'OPPO';
                buildTemplatesPath = 'oppo-h5';

                if (buildConfig && buildConfig.oppoResUrl) {
                    resRemoteUrl = buildConfig.oppoResUrl;
                }

                // OPPO版需要引入oppo-sdk.js等脚本
                tool.editTextFile(indexFilePath, function (str) {
                    return str.replace(/<\/div>\n<script src="src\/settings/, '<\/div>\n<script src="oppo-sdk.js"></script>\n<script src="src/settings');
                });
                break;
            }
            case PlatformType.VIVO: {
                break;
            }
            default:
                break;
        }

        if (resRemoteUrl && resRemoteUrl.length > 0) {
            if (!resRemoteUrl.endsWith('/')) {
                resRemoteUrl += '/';
            }
            let mainFilePath = path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'main'));
            tool.editTextFile(mainFilePath, function (str) {
                str = str.replace(/libraryPath: 'res\/import',/, 'libraryPath: \'' + resRemoteUrl + 'res\/import\',');
                str = str.replace(/rawAssetsBase: 'res\/raw-',/, 'rawAssetsBase: \'' + resRemoteUrl + 'res\/raw-\',');
                return str;
            });
        }

        let projectFilePath = path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, (isNative && platformType === PlatformType.VIVO ? 'engine/' : '') + 'src/project'));
        tool.editTextFile(projectFilePath, function (str) {
            if (platfromTypeEnum) {
                str = str.replace(/(platformType ?= ?\w*\.)BROWSER/, '$1' + platfromTypeEnum);
            }
            let found = str.match(/clientVersion ?= ?['"](\d*)['"]/);
            if (found && found[1]) {
                versionCode = Number.parseInt(found[1]);
                versionName = found[1];
                let len = versionName.length;
                versionName = (len > 4 ? (versionName.substring(0, len - 4) + '.') : '') +
                    (len > 2 ? (Number.parseInt(versionName.substring(Math.max(0, len - 4), len - 2)) + '.') : '') +
                    (len > 0 ? (Number.parseInt(versionName.substring(Math.max(0, len - 2), len))) : '0');
                Editor.log('versionCode:' + versionCode + ' versionName:' + versionName);
            } else {
                Editor.error('Can not find versionCode');
            }
            return str;
        });

        if (buildTemplatesPath) {
            copyBuildTemplatesFromPlugin(getBuildFinalDestPath(buildDestPath, platform), buildTemplatesPath, () => {
                // QQ修改gameConfig.json
                if (indexFileName) {
                    let gameConfigFilePath = path.join(buildDestPath, 'gameConfig.json');
                    tool.editTextFile(gameConfigFilePath, function (str) {
                        return str.replace(/index\.(\w*\.)?html/, indexFileName);
                    });
                }
    
                // OPPO修改manifest.json
                if (platformType === PlatformType.OPPO) {
                    let manifestPath = path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'manifest.json'));
                    tool.editTextFile(manifestPath, function (str) {
                        let manifestParam = JSON.parse(str);
                        if (versionName !== null) manifestParam.versionName = versionName;
                        if (versionCode !== null) manifestParam.versionCode = versionCode;
                        return JSON.stringify(manifestParam);
                    });
                }
    
                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }

    } else {
        isProcessing = false;
        if (callback) callback();
    }
}

/**
 * 修改h5sdk相关代码
 * @param {string} filePath 文件路径
 * @param {string} platform 目标平台
 */
function modifyH5SdkCode(filePath, platform) {
    // Editor.log(`修改${path.basename(filePath)}，路径:${filePath}`);
    let ret = false;
    tool.editTextFile(filePath, function (str) {
        let reg = null;
        let replacer = null;
        if (platform === 'wechatgame') {
            reg = /\n\/\/ *(import {H5SDK} from '\.\/h5jssdk';)/;
            replacer = '\n$1';
        } else if (platform === 'qqplay' || platform === 'web-mobile') {
            reg = /\n(import {H5SDK} from '\.\/h5jssdk';)/;
            replacer = '\n// $1';
        }
        if (reg && str.match(reg)) {
            str = str.replace(reg, replacer);
            ret = true;
            return str;
        } else {
            return null;
        }
    });

    return ret;
}

/**
 * 基础处理
 * 拷贝模板文件
 * 生成用于资源更新的res.json
 */
function baseProcess(destPath, platform, callback) {
    copyBuildTemplatesFromPlugin(destPath, platform, () => {
        if (callback) callback();
    });
}

/**
 * 生成资源更新配置文件
 * @param {string} destPath build目标目录
 * @param {string} platform build目标平台
 */
function generateResFile(destPath, platform) {
    let resVersion = 0;
    let projectJsFilePath = path.join(destPath, getRelateFilePathWithFullInfo(destPath, 'src/project'));
    // Editor.log('projectJsFilePath:' + projectJsFilePath);
    if (fs.existsSync(projectJsFilePath)) {
        let str = fs.readFileSync(projectJsFilePath, 'utf8');
        // Editor.log(str);
        let found = str.match(/this.resVersion ?= ?(\d*)/);
        if (found && found[1]) {
            resVersion = Number.parseInt(found[1]);
        } else {
            projectJsFilePath = path.join(destPath, '..', '..', 'assets', 'scripts', 'game', 'data', 'GameData.js');
            // Editor.log('projectJsFilePath:' + projectJsFilePath);
            if (fs.existsSync(projectJsFilePath)) {
                str = fs.readFileSync(projectJsFilePath, 'utf8');
                // Editor.log(str);
                found = str.match(/this.resVersion ?= ?(\d*)/);
                if (found && found[1]) {
                    resVersion = Number.parseInt(found[1]);
                }
            }
        }
        // Editor.log('found:' + found);
        Editor.log('资源版本号:' + resVersion);
    } else {
        Editor.error('project.js不存在，path:' + projectJsFilePath);
    }

    s_resVersion = resVersion;

    if (platform === 'ios' || platform === 'android') {
        // return;
        // native版本
        const manifest = {
            version: resVersion.toString(),
            assets: {}
        };
        var rootPath = destPath;
        if (platformType === PlatformType.VIVO || platformType === PlatformType.OPPO) {
            rootPath = path.join(_buildDestPath, '..', 'jsb-link');
        }
        readDirAssetsToObject(rootPath, path.join(rootPath, 'src'), manifest.assets);
        readDirAssetsToObject(rootPath, path.join(rootPath, 'res'), manifest.assets);
        let targetJsonPath = path.join(rootPath, 'res', 'res.json');
        fs.writeFileSync(targetJsonPath, JSON.stringify(manifest));
        targetJsonPath = path.join(rootPath, 'res.' + resVersion + '.json');
        fs.writeFileSync(targetJsonPath, JSON.stringify(manifest));
    } else {
        // WeChat | QQ-BRICK | QQ-H5 | OPPO-H5 | VIVO-JSB | OPPO-JSB
        const settingJsFilePath = path.join(destPath, getRelateFilePathWithFullInfo(destPath, 'src/settings'));
        if (fs.existsSync(settingJsFilePath)) {
            let str = fs.readFileSync(settingJsFilePath, 'utf8');
            str = 'module.exports=' + str.substring('window._CCSettings='.length);
            let index = str.indexOf(';');
            if (index >= 0) {
                str = str.substring(0, index);
            }
            const targetJsPath = path.join(destPath, 'res', 'res.' + resVersion + '.js');
            fs.writeFileSync(targetJsPath, str);
            delete require.cache[targetJsPath];
            const srcObj = require(targetJsPath);
            fs.unlinkSync(targetJsPath);
            const dstObj = {
                resVersion: resVersion,
                rawAssets: srcObj.rawAssets,
                assetTypes: srcObj.assetTypes,
                packedAssets: srcObj.packedAssets,
                md5AssetsMap: srcObj.md5AssetsMap,
                uuids: srcObj.uuids,
            };
            // Editor.log(dstObj);
    
            str = JSON.stringify(dstObj);
            const targetJsonPath = path.join(destPath, 'res', 'res.' + resVersion + '.json');
            fs.writeFileSync(targetJsonPath, str);
            Editor.log('生成res.json成功:' + targetJsonPath);
            
        } else {
            Editor.error('settings.js不存在，path:' + settingJsFilePath);
        }
    }
}

/**
 * 递归读取文件夹内的文件信息并写入object
 * @param {string} rootPath 根目录路径
 * @param {string} dir 目录路径
 * @param {object} obj 要写入的object
 */
function readDirAssetsToObject (rootPath, dir, obj) {
    if (!fs.existsSync(dir)) {
        Editor.error('readDirAssetsToObject error: dir not exists, path:' + dir);
        return;
    }
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir);
    var subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
        // skip hiden file
        if (subpaths[i][0] === '.') {
            continue;
        }
        // skip res config file
        if (subpaths[i].startsWith('res.') && subpaths[i].endsWith('.json')) {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDirAssetsToObject(rootPath, subpath, obj);
        }
        else if (stat.isFile()) {
            // Size in Bytes
            size = stat.size;
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath, 'binary')).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(rootPath, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size' : size,
                'md5' : md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

function copyBuildTemplatesFromPlugin(buildDestPath, platform, callback) {
    var dest = buildDestPath;
    var src = path.join(__dirname, 'build-templates', platform);
    Editor.log('copyBuildTemplatesFromPlugin src:' + src + ' dst:' + dest);
    if (fs.existsSync(src)) {
        copyDir(src, dest, COPY_OPTION_OVERWRITE, callback);
    } else {
        if (callback) callback();
    }
}

function copyBuildTemplates(buildDestPath, platform, callback) {
    var dest = getBuildFinalDestPath(buildDestPath, platform);
    var src = path.join(__dirname, '..', '..', 'build-templates', platform);
    if (fs.existsSync(src)) copyDir(src, dest, COPY_OPTION_OVERWRITE, callback);
}

/**
 * 修改webpack相关js文件
 * @param {string} buildDestPath build目标路径
 */
function modifyWebpackJSFiles(buildDestPath, isPipe = true) {
    const tip = '修改webpack相关js';
    if (isPipe) {
        step++;
        Editor.log(`[${step}/${STEP_COUNT}] ` + tip);
    } else {
        Editor.log(tip);
    }

    buildDestPath = getBuildFinalDestPath(buildDestPath);

    // 修改main.js
    let filePath = path.join(buildDestPath, getRelateFilePathWithFullInfo(buildDestPath, 'main'));
    Editor.log('修改main.js, 路径:' + filePath);
    if (fs.existsSync(filePath)) {
        let str = fs.readFileSync(filePath, 'utf8');
        if (str && str.length > 0) {
            str = str.replace(/[\n\t\s]*var bundledScript = [\s\S\n]*jsList = \[bundledScript\];[\n\t\s]*}/, '');
            str = str.replace(/(require\([w\'][^\.].*)/g, '// $1');
            fs.writeFileSync(filePath, str);
        }
    } else {
        Editor.error('main.js不存在');
        return false;
    }

    // 修改game.js
    filePath = path.join(buildDestPath, 'game.js');
    Editor.log('修改game.js, 路径:' + filePath);
    if (fs.existsSync(filePath)) {
        let str = fs.readFileSync(filePath, 'utf8');
        // Editor.log('game.json:' + str);
        if (str && str.length > 0) {
            str = str.replace(/require\('([^.])/g, 'require\(\'./$1');
            str = str.replace(/require\(settings\.debug.*\r?\n/g, '');
            str = str.replace(/[^\/](require\('\.\/libs\/sub-context-adapter'\);)/g, '//$1');
            // require\('\.src/settings[^;]*;\n
            let re = /(require\(\'.\/src\/settings[^;]*;\r?\n)(var settings = window\._CCSettings;\r?\n)/;
            let found = str.match(re);
            if (found) {
                Editor.log('found:', found);
                let foundStr = found[1];
                let index = found.index;
                str =
                    str.substring(0, index) +
                    `require('./${getRelateFilePathWithFullInfo(buildDestPath, 'cocos2d-js-min')}');\n` +
                    foundStr +
                    `require('./${getRelateFilePathWithFullInfo(buildDestPath, 'src/project')}');\n` +
                    (found[2] ? found[2] : '') +
                    str.substring(index + foundStr.length + (found[2] ? found[2].length : 0));
            }
            // Editor.log('after delete:' + str);
            fs.writeFileSync(filePath, str);
        }
    } else {
        Editor.error('game.js不存在');
        return false;
    }

    return true;
}

/**
 * 拷贝build工程（废弃，直接在build工程中进行修改）
 */
function copyBuildProject(buildDestPath) {
    buildDestPath = getBuildFinalDestPath(buildDestPath);
    if (!fs.existsSync(buildDestPath)) {
        Editor.error('can\'t find build path:' + buildDestPath);
        return;
    }

    // delete dest dir
    let dest = path.join(__dirname, path.basename(buildDestPath));
    Editor.log('dest:' + dest);

    if (fs.existsSync(dest)) {
        rimraf(dest, (err) => {
            if (err) {
                Editor.error('rm clone dest error:' + err);
            } else {
                Editor.log('rm clone dest finish');
                copyDir(buildDestPath, dest);
            }
        });
    } else {
        copyDir(buildDestPath, dest);
    }
}

/**
 * 运行webpack打包js文件
 * @param {string} buildDestPath build目标路径
 * @param {function} callback 回调
 */
function runWebpack(buildDestPath, callback, isPipe = true) {
    const tip = '运行webpack打包js，该过程耗时较长，请耐心等候...';
    if (isPipe) {
        step++;
        Editor.log(`[${step}/${STEP_COUNT}] ` + tip);
    } else {
        Editor.log(tip);
    }

    let cmd = '';
    // Editor.log('platform:' + os.platform() + ' indexOf(win):' + os.platform().indexOf('win'));
    if (os.platform().indexOf('win32') >= 0 || os.platform().indexOf('win64') >= 0) {
        cmd = winNodeCmd;
    } else {
        cmd = unixNodeCmd;
    }
    // Editor.log('Node cmd:' + cmd);

    var dstDirPath = path.join(__dirname, '..', '..', 'temp', 'webpackOut');
    if (!fs.existsSync(dstDirPath)) {
        tool.mkDirByPathSync(dstDirPath);
    }

    tool.runShell(
        cmd,
        [
            path.join(__dirname, 'node_modules', 'webpack', 'bin', 'webpack'),
            path.join(buildDestPath, 'game.js'),
            '--config',
            path.join(__dirname, 'webpack.config.js'),
            '-o',
            path.join(dstDirPath, 'game.js')
        ], 
        () => {
            if (callback) {
                callback();
            }
        }
    );
}

/**
 * 移除原来的js，拷贝打包后的js
 * @param {string} buildDestPath build目标路径
 */
function moveFinalJS(buildDestPath, callback) {
    step++;
    Editor.log(`[${step}/${STEP_COUNT}] 拷贝打包后的js文件`);
    
    buildDestPath = getBuildFinalDestPath(buildDestPath);
    deleteFile(buildDestPath, 'src');
    deleteFile(buildDestPath, 'libs');
    deleteFile(buildDestPath, 'main');
    deleteFile(buildDestPath, 'cocos2d-js-min');
    deleteFile(buildDestPath, 'game.js', () => {
        ncp(path.join(__dirname, '..', '..', 'temp', 'webpackOut', 'game.js'), path.join(buildDestPath, 'game.js'), {
            clobber: true,
            stopOnErr: true,
        },
        (err) => {
            if (err) {
                Editor.error('copy game.js error:' + err);
            }
            if (callback) callback();
            Editor.log('###################### Webpack打包完成 #####################');
        });
    });
}

/**
 * 修改微信project.json文件，不检查url合法性
 * @param {string} buildDestPath build目标路径
 */
function modifyWechatProjectJson(buildDestPath) {
    buildDestPath = getBuildFinalDestPath(buildDestPath);
    let filePath = path.join(buildDestPath, 'project.config.json');
    Editor.log(`修改project.config.json，路径:${filePath}`);
    if (fs.existsSync(filePath)) {
        let str = fs.readFileSync(filePath, 'utf8');
        // Editor.log('game.json:' + str);
        if (str && str.length > 0) {
            let json = JSON.parse(str);
            if (json.setting && json.setting.urlCheck) {
                json.setting.urlCheck = false;
            }
            str = JSON.stringify(json);
            // Editor.log('after delete:' + str);
            fs.writeFileSync(filePath, str);
        }
    } else {
        Editor.error('game.json not exists');
    }
}

/** 
 * 压缩纹理
 * @param {string} platform 目标平台
 * @param {function} callback 完成回调
 */
function compressTexture(platform, callback) {
    platform = getBuildPlatform(platform);
    if (platform === 'vivo-runtime' || platform === 'oppo-runtime') {
        platform = 'jsb-link';
    }
    Editor.Ipc.sendToMain('pngquant:open', null, function () {
        Editor.Ipc.sendToPanel("pngquant", 'pngquant:startCompress', platform);
    });
    compressCallback = callback;
}

/** 
 * 移动res到测试资源服务器
 * @param {string} platform 目标平台
 * @param {function} callback 完成回调
 */
function moveResToServer (platform, callback) {
    Editor.log('开始上传res目录至服务器');
    tool.runShell(
        'sh',
        [
            platform === 'wechatgame' ? '/Users/liqing/CodeRunner/Shell/teagame/move_wechat_res_to_mini.sh' : 
            platform === 'qqplay' ? '/Users/liqing/CodeRunner/Shell/teagame/move_qq_res_to_mini.sh' :
            platform === 'web-mobile' ? '/Users/liqing/CodeRunner/Shell/teagame/move_qq_h5_res_to_mini.sh' :
            platform === 'ios' || platform === 'android' ? '/Users/liqing/CodeRunner/Shell/teagame/move_native_res_to_mini.sh' :
            platform === ''
        ], 
        () => {
            Editor.log(`上传res执行完成`);
            playSound('资源上传完成');
            if (callback) {
                callback();
            }
        }
    );
}

/**
 * 使用shell脚本移动src文件夹
 * 路径是写死在shell脚本里的，使用不便，已废弃
 * @deprecated
 */
function moveResLocalByShell (callback, platform) {
    Editor.log('开始移动res目录至备份文件夹');
    tool.runShell(
        'sh',
        [
            platform === 'wechatgame' ? '/Users/liqing/CodeRunner/Shell/teagame/move_wechat_res_local.sh' : '/Users/liqing/CodeRunner/Shell/teagame/move_qq_res_local.sh'
        ], 
        () => {
            Editor.log(`移动res执行完成`);
            if (callback) {
                callback();
            }
        }
    );
}

/**
 * 获取res-pub资源svn目录路径
 * @param {string} platform 
 */
function getResPubDirPath (platform) {
    platform = getBuildPlatform(platform);
    var dstPath = getBuildFinalDestPath(null, platform);
    while (dstPath) {
        var tmp = path.join(dstPath, 'res-pub');
        // Editor.log('tmp:' + tmp);
        if (fs.existsSync(tmp)) {
            dstPath = tmp;
            break;
        } else {
            var index = dstPath.lastIndexOf(path.sep);
            if (index >= 0) {
                dstPath = dstPath.substring(0, index);
            } else {
                if (!dstPath.endsWith('res-pub')) {
                    dstPath = null;
                }
                break;
            }
            // Editor.log('dstPath:' + dstPath);
        }
    }
    return dstPath;
}

/**
 * 使用nodejs移动res文件夹到svn的res-pub目录
 * native版本还要移动src文件夹和资源配置文件res.xxx.json
 * qq和wx版本需要在移动后删除源文件夹
 * @param {string} platform 目标平台
 * @param {function} callback 完成回调
 */
function moveResLocalByNodejs (platform, callback) {
    Editor.log('开始移动res到res-pub目录');
    platform = getBuildPlatform(platform);
    var dstPath = getResPubDirPath(platform);
    if (!dstPath || !fs.existsSync(dstPath)) {
        Editor.error('Can\'t find res-pub directory');
        if (callback) callback();
        return;
    }
    var idDeleteSrc = true;
    var subDirPaths = ['res'];
    var srcPath = getBuildTempDestPath(null, platform);
    if (platform === 'wechatgame') {
        switch (platformType) {
            case PlatformType.WECHAT: {
                dstPath = path.join(dstPath, 'res-wechat');
                break;
            }
            case PlatformType.QQminiAPP: {
                dstPath = path.join(dstPath, 'res-qqminiapp');
                break;
            }
            default: {
                Editor.error('error platformType:' + platformType);
                break;
            }
        }
        // dstPath = path.join(dstPath, 'res-wechat');
    } else if (platform === 'qqplay') {
        dstPath = path.join(dstPath, 'res-qqhd');
    } else if (platform === 'web-mobile') {
        idDeleteSrc = false;
        switch(platformType) {
            // QQ H5版
            case PlatformType.QQ: {
                dstPath = path.join(dstPath, 'res-qqhd');
                break;
            }
            // OPPO H5版
            case PlatformType.OPPO: {
                dstPath = path.join(dstPath, 'res-oppo');
                break;
            }
            default: {
                dstPath = path.join(dstPath, 'web-mobile');
                break;
            }
        }
    } else if (platform === 'vivo-runtime') {
        dstPath = path.join(dstPath, 'res-vivo');
        idDeleteSrc = false;
    } else if (platform === 'oppo-runtime') {
        dstPath = path.join(dstPath, 'res-oppo');
        idDeleteSrc = false;
    } else if (platform === 'ios' || platform === 'android') {
        dstPath = path.join(dstPath, 'res-native');
        // native版需要更新脚本资源
        subDirPaths.push('src');
        // native版资源需要打在包里，所以源文件不删除
        idDeleteSrc = false;
        // 资源配置文件生成了两份：
        // jsb-link/res.xxx.json要在检查资源更新时下发给客户端，资源更新时需要更到服务器上
        // jsb-link/res/res.json要打进包内，用于安装后首次资源更新
        var files = fs.readdirSync(srcPath);
        for (const file of files) {
            if (file.startsWith('res.') && file.endsWith('.json')) {
                subDirPaths.push(file);
            }
        }
    } else {
        subDirPaths = null;
    }

    Editor.log('srcPath:' + srcPath);
    Editor.log('dstPath:' + dstPath);

    if (!fs.existsSync(dstPath)) {
        fs.mkdirSync(dstPath);
    }

    // 拷贝res.xxx.json完成回调，进行资源拷贝
    var copyResCallback = function () {
        Editor.log('subDirPaths:' + subDirPaths);
        if (subDirPaths && subDirPaths.length > 0) {
            var option = idDeleteSrc ? COPY_OPTION_DELETE_SRC : 0;
            if (!fs.existsSync(dstPath)) {
                fs.mkdirSync(dstPath);
            }
            let finishCount = 0;
            for (let index = 0; index < subDirPaths.length; index++) {
                const subDir = subDirPaths[index];
                const src = path.join(srcPath, subDir);
                const dst = path.join(dstPath, subDir);
                const copyCallback = function () {
                    finishCount++;
                    if (finishCount === subDirPaths.length && callback) callback();
                };
                const stats = fs.statSync(src);
                Editor.log('copy src:' + src);
                Editor.log('copy dst:' + dst);
                if (stats.isDirectory()) {
                    copyDir(src, dst, option, copyCallback);
                } else {
                    copyFile(src, dst, option, copyCallback);
                }
            }
        } else {
            if (callback) callback();
        }
    };

    // QQ和微信平台拷贝res.xxx.json
    // 在打包测试阶段，同一资源版本有可能会打多次，资源配置文件需要覆盖
    if (platform === 'ios' || platform === 'android') {
        copyResCallback();
    } else {
        var destResPath = path.join(dstPath, 'res');
        if (!fs.existsSync(destResPath)) {
            tool.mkDirByPathSync(destResPath);
        }
        var resSrcPath = path.join(srcPath, 'res');
        var skipCallback = false;
        if (fs.existsSync(resSrcPath)) {
            var files1 = fs.readdirSync(resSrcPath);
            for (const file of files1) {
                if (file.startsWith('res.') && file.endsWith('.json')) {
                    skipCallback = true;
                    copyFile(path.join(resSrcPath, file), destResPath, COPY_OPTION_DELETE_DST, () => {
                        copyResCallback();
                    });
                    break;
                }
            }
        }
        if (!skipCallback) copyResCallback();
    }
}

function getBuildSvnPath (platform) {
    platform = getBuildPlatform(platform);
    if (platform === 'ios' || platform === 'android') {
        // if (callback) callback();
        return null;
    }

    var srcPath = getBuildTempDestPath(null, platform);
    var dstPath = path.join(getBuildTempDestPath(null, platform), '..', '..', '..');
    while (dstPath) {
        var tmp = path.join(dstPath, 'build');
        // Editor.log('tmp:' + tmp);
        if (fs.existsSync(tmp)) {
            dstPath = tmp;
            break;
        } else {
            var index = dstPath.lastIndexOf(path.sep);
            if (index >= 0) {
                dstPath = dstPath.substring(0, index);
            } else {
                if (!dstPath.endsWith('build')) {
                    dstPath = null;
                }
                break;
            }
            // Editor.log('dstPath:' + dstPath);
        }
    }
    if (!dstPath || !fs.existsSync(dstPath)) {
        Editor.error('Can\'t find build directory');
        // if (callback) callback();
        return null;
    }
    if (platform === 'web-mobile') {
        switch(platformType) {
            // QQ H5版
            case PlatformType.QQ: {
                dstPath = path.join(dstPath, 'qqplay');
                break;
            }
            // OPPO H5版
            case PlatformType.OPPO: {
                dstPath = path.join(dstPath, 'oppo');
                break;
            }
            default: {
                dstPath = path.join(dstPath, 'web-mobile');
                break;
            }
        }
    } else if (platform === 'wechatgame') {
        switch (platformType) {
            case PlatformType.WECHAT: {
                dstPath = path.join(dstPath, 'wechatgame');
                break;
            }
            // case PlatformType.TOUTIAO: {
            //     dstPath = path.join(dstPath, 'toutiao');
            //     break;
            // }
            case PlatformType.QQminiAPP: {
                dstPath = path.join(dstPath, 'qqminiapp');
                break;
            }
            default: {
                Editor.error('error platformType:' + platformType);
                break;
            }
        }
    } else if (platform === 'vivo-runtime' || platform === 'oppo-runtime') {
        dstPath = path.join(dstPath, platform.replace('-runtime', ''));
    } else {
        dstPath = path.join(dstPath, srcPath.substring(srcPath.lastIndexOf(path.sep) + 1));
    }
    return dstPath;
}

function moveBuildByNodejs (platform, callback) {
    Editor.log('开始移动build文件夹');
    platform = getBuildPlatform(platform);
    var srcPath = getBuildTempDestPath(null, platform);
    var dstPath = getBuildSvnPath(platform);
    if (!dstPath || !fs.existsSync(dstPath)) {
        Editor.error('Can\'t find build directory');
        if (callback) callback();
        return;
    }
    if (!fs.existsSync(dstPath)) fs.mkdirSync(dstPath);
    // Editor.log('srcPath:' + srcPath);
    // Editor.log('dstPath:' + dstPath);
    copyDir(srcPath, dstPath, COPY_OPTION_DELETE_DST, () => {
        if (callback) callback();
    }, function (fileName) {
        return fileName !== 'res';
    });
}

function generateZipPackageByNodejs (platform, callback) {
    if (platform === 'qqplay' || platform === 'web-mobile') {
        Editor.log('开始打zip包');
        callback = checkCallback(callback);
    
        var buildDestPath = getBuildFinalDestPath(null, platform);
        if (!fs.existsSync(buildDestPath)) {
            Editor.error('buildDestPath not exists, path:' + buildDestPath);
            return;
        }
    
        var filePath = null;
        if (platformType === PlatformType.OPPO) {
            filePath = path.join(getBuildTempPath(), 'unsigned.zip');
        } else {
            filePath = path.join(buildDestPath, '..', 'cmshow_game_3319.zip');
        }
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            // Editor.log('unlink path:' + filePath);
        }
    
        // create a file to stream archive data to.
        var output = fs.createWriteStream(filePath);
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
    
        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
            // Editor.log(archive.pointer() + ' total bytes');
            // Editor.log('archiver has been finalized and the output file descriptor has closed.');
            var bytes = archive.pointer();
            var count = 0;
            while (bytes >= 1024) {
                bytes /= 1024;
                count++;
            }
            var str = bytes.toFixed(2) + (count == 0 ? 'B' : count == 1 ? 'KB' : count == 2 ? 'MB' : count == 3 ? 'GB' : 'toooooLargeB');
            Editor.log('Zip压缩完成，总大小：' + str);
            if (callback) {
                callback();
            }
        });
    
        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function() {
            Editor.log('Data has been drained');
        });
    
        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });
    
        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            throw err;
        });
    
        // pipe archive data to the file
        archive.pipe(output);
    
        var dirFilter = ['res'];
        var fileFilter = ['debug_config.json'];
        var files = fs.readdirSync(buildDestPath);
        for (const file of files) {
            if (file.startsWith('.') || file.length === 0) {
                continue;
            }
            // Editor.log(file);
            var subFilePath = path.join(buildDestPath, file);
            var stat = fs.statSync(subFilePath);
            if (stat.isDirectory()) {
                if (dirFilter.indexOf(file) < 0) {
                    archive.directory(subFilePath, file);
                }
            } else {
                if (fileFilter.indexOf(file) < 0) {
                    archive.file(subFilePath, {name:file});
                }
            }
        }
        archive.finalize();
    } else {
        if (callback) callback();
    }
}

function signZipPackage (platform, callback) {
    platform = getBuildPlatform(platform);
    if (platform === 'web-mobile' && platformType === PlatformType.OPPO) {
        var unsignedZipPath = path.join(getBuildTempPath(), 'unsigned.zip');
        if (!fs.existsSync(unsignedZipPath)) {
            Editor.log(unsignedZipPath);
            Editor.error('签名失败，zip包不存在，请先打zip包');
            if (callback) callback();
            return;
        }
    
        var destPath = path.join(__dirname, '..', '..', 'build', 'com.gameley.teagame.nearme.gamecenter.gpk');
        tool.runShell('python', [
            path.join(__dirname, 'shell', 'sign.py'),
            path.join(__dirname, 'shell', 'gameley.keystore'),
            unsignedZipPath,
            destPath
        ], () => {
            Editor.success('签名完成');
            if (callback) callback();
        },
        false);
    } else {
        if (callback) callback();
    }
}

let s_jsonCount = 0;

function copyJsonFileToBuildDir (platform, callback) {
    // Editor.log('开始移动res到res-pub目录');
    platform = getBuildPlatform(platform);
    var srcPath = getBuildTempDestPath(null, platform);
    Editor.log('srcPath:' + srcPath);

    // 拷贝res.xxx.json完成回调，进行资源拷贝
    // var copyResCallback = function () {
    //     Editor.log('subDirPaths:' + subDirPaths);
    //     if (subDirPaths && subDirPaths.length > 0) {
    //         var option = idDeleteSrc ? COPY_OPTION_DELETE_SRC : 0;
    //         if (!fs.existsSync(dstPath)) {
    //             fs.mkdirSync(dstPath);
    //         }
    //         let finishCount = 0;
    //         for (let index = 0; index < subDirPaths.length; index++) {
    //             const subDir = subDirPaths[index];
    //             const src = path.join(srcPath, subDir);
    //             const dst = path.join(dstPath, subDir);
    //             const copyCallback = function () {
    //                 finishCount++;
    //                 if (finishCount === subDirPaths.length && callback) callback();
    //             };
    //             const stats = fs.statSync(src);
    //             Editor.log('copy src:' + src);
    //             Editor.log('copy dst:' + dst);
    //             if (stats.isDirectory()) {
    //                 copyDir(src, dst, option, copyCallback);
    //             } else {
    //                 copyFile(src, dst, option, copyCallback);
    //             }
    //         }
    //     } else {
    //         if (callback) callback();
    //     }
    // };

    Editor.log('copyJsonFileToBuildDir platform:' + platform);
    if (platform === 'wechatgame') {
        // Editor.log('QQMINIAPP copyJsonFileToBuildDir');
        const buildDirPath = getBuildTempDestPath(null, platform); //getBuildSvnPath(platform);
        const buildResDirPath = path.join(buildDirPath, 'res');
        const resPubDirPath = buildResDirPath;// path.join(getResPubDirPath(buildDirPath), 'res-qqminiapp');

        const rmCallback = function () {
            // Editor.log('rmCallback');
            const copyList = [];
            s_jsonCount = 0;
            findAllJsonFile(buildResDirPath, copyList);
            // copyJsonFileToBuildDir({
            //     cfgFilePath: path.join(__dirname, 'shell', 'res_filter.txt'),
            //     resDirPath: resPubDirPath,
            //     buildDirPath: buildDirPath,
            //     limitSize: Number.MAX_SAFE_INTEGER
            // });

            let finishCount = 0;
            let totalSize = 0;
            const zipDirPath = path.join(resPubDirPath, 'zip');

            var copyFunc = function () {
                Editor.log('start copy json files, zipDirPath:' + zipDirPath);
                const set = new Set();
                const regex = new RegExp(isWin ? '\\\\' : '/', 'g');
                for (const fileInfo of copyList) {
                    totalSize += fileInfo.size;
                    const srcPath = fileInfo.path;
                    const relativePath = srcPath.substring(srcPath.indexOf(path.sep + 'res' + path.sep) + 1);
                    const cachePath = relativePath.replace(regex, '-');
                    set.add(srcPath);
                    Editor.log('fileInfo.path: ' + srcPath + ', relativePath: ' + relativePath + ', cachePath: ' + cachePath);
                    copyFile(srcPath, path.join(zipDirPath, cachePath), COPY_OPTION_OVERWRITE, () => {
                        ++finishCount;
                        set.delete(srcPath);
                        if (finishCount === copyList.length) {
                            Editor.log('copy json file to zip dir finish!');
                            try {
                                const resVersion = s_resVersion >= 0 ? s_resVersion : -1;
                                const zipFilePath = path.join(resPubDirPath, 'res' + (resVersion >= 0 ? '.' + resVersion : '') + '.zip');
                                generateZip(zipDirPath, zipFilePath, callback);
                            } catch (e) {
                                Editor.error(e);
                                if (callback) callback();
                            }
                        }
                        // Editor.log('copy finish count:' + finishCount + ' / ' + copyList.length);
                        // if (finishCount >= copyList.length - 1) {
                        //     Editor.log('left set size:' + set.size);
                        //     for (const value of set) {
                        //         Editor.log('left:' + value);
                        //     }
                        // }
                    });
                    // 最最开始的那个几json直接扔包里
                    // if (fileInfo.index <= 10) {
                    //     const dstPath = path.join(buildDirPath, relativePath);
                    //     const dirPath = path.dirname(dstPath);
                    //     mkDirByPathSync(dirPath);
                    //     copyFile(srcPath, dstPath, COPY_OPTION_OVERWRITE, null);
                    // }
                }
                Editor.log(`拷贝的json文件数量:${copyList.length}  总大小:${(totalSize/1024).toFixed(2)} KB`);
            };

            if (fs.existsSync(zipDirPath)) {
                deleteDir(zipDirPath, false, copyFunc);
            } else {
                fs.mkdirSync(zipDirPath);
                copyFunc();
            }
        };

        // if (fs.existsSync(buildResDirPath)) {
        //     rimraf(buildResDirPath, (error) => {
        //         if (error) {
        //             Editor.error(error);
        //         }
        //         rmCallback();
        //     });
        // } else {
            rmCallback();
        // }
    } else {
        if (callback) callback();
    }
}

function generateZip (zipDirPath, zipFilePath, callback) {
    Editor.log('generateZip zipDir:' + zipDirPath + ' zipFilePath:' + zipFilePath);

    if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
    }

    // create a file to stream archive data to.
    var output = fs.createWriteStream(zipFilePath);
    var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
        // Editor.log(archive.pointer() + ' total bytes');
        // Editor.log('archiver has been finalized and the output file descriptor has closed.');
        var bytes = archive.pointer();
        var count = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            count++;
        }
        var str = bytes.toFixed(2) + (count == 0 ? 'B' : count == 1 ? 'KB' : count == 2 ? 'MB' : count == 3 ? 'GB' : 'toooooLargeB');
        Editor.log('Zip压缩完成，总大小：' + str);

        deleteDir(zipDirPath, true, callback);

        // if (callback) {
        //     callback();
        // }
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
        Editor.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    var files = fs.readdirSync(zipDirPath);

    for (const file of files) {
        var filePath = path.join(zipDirPath, file);
        archive.file(filePath, {name:file});
        // Editor.log('archive file:' + filePath);
    }
    archive.finalize();
}

function oppoAdbPush (callback) {
    var srcPath = path.join(__dirname, '..', '..', 'build', 'com.gameley.teagame.nearme.gamecenter.gpk');
    if (!fs.existsSync(srcPath)) {
        Editor.error('oppo adb push error, file not exists, path:' + srcPath);
        if (callback) callback();
        return;
    }

    tool.runShell('python', [
        path.join(__dirname, 'shell', 'adb_push.py'),
        path.join(__dirname, 'build-templates', 'oppo-h5', 'debug_config.json'),
        '/sdcard/Android/data/com.nearme.play/files/debug_config.json',
        srcPath,
        '/sdcard/Android/data/com.nearme.play/files/com.gameley.teagame.nearme.gamecenter.gpk'
    ], () => {
        Editor.success('ADB push 完成');
        if (callback) callback();
    },
    true);
}

function vivoAdbPush (callback) {
    var srcPath = path.join(__dirname, '..', '..', 'build', 'qgame', 'dist', 'vivo.teagame.gameley.com.rpk');
    if (!fs.existsSync(srcPath)) {
        Editor.error('oppo adb push error, file not exists, path:' + srcPath);
        if (callback) callback();
        return;
    }

    tool.runShell('python', [
        path.join(__dirname, 'shell', 'adb_push.py'),
        srcPath,
        '/sdcard/Download/vivo.teagame.gameley.com.rpk'
        // '/sdcard/Android/data/com.nearme.instant.platform/files/vivo.teagame.gameley.com.rpk'
    ], () => {
        Editor.success('ADB push 完成');
        if (callback) callback();
    },
    true);
} 

function moveQQPlayH5ToSubDir (platform, callback) {
    if (platform !== 'web-mobile' || platformType !== PlatformType.QQ) {
        if (callback) callback();
        return;
    }

    let qqH5SubDirs = [];
    let buildDestPath = getBuildFinalDestPath(null, platform);
    let gameConfigFilePath = path.join(buildDestPath, 'gameConfig.json');
    if (fs.existsSync(gameConfigFilePath)) {
        let str = fs.readFileSync(gameConfigFilePath, 'utf-8');
        let gameConfigObj = JSON.parse(str);
        if (gameConfigObj.enterUrl) {
            let htmlIndex = gameConfigObj.enterUrl.indexOf('.html');
            let domainEndIndex = gameConfigObj.enterUrl.lastIndexOf('/', htmlIndex);
            let domainStartIndex = gameConfigObj.enterUrl.indexOf('://') + 3;
            let domainStr = gameConfigObj.enterUrl.substring(domainStartIndex, domainEndIndex);
            let subPathIndex = domainStr.indexOf('/');
            if (subPathIndex >= 0) {
                domainStr = domainStr.substring(subPathIndex + 1);
                qqH5SubDirs = domainStr.split('/');
                Editor.log(qqH5SubDirs);

                if (qqH5SubDirs.length > 0) {
                    let moveDestPath = path.join(buildDestPath, qqH5SubDirs.join(path.sep));
                    let files = fs.readdirSync(buildDestPath);
                    let count = 0;
                    function copyCallback () {
                        if (++count >= files.length && callback) callback();
                    }
                    let filter = [qqH5SubDirs[0], 'res', 'gameConfig.json', 'inviteIcon.png', 'main.js'];
                    for (const file of files) {
                        if (filter.includes(file)) {
                            copyCallback();
                        } else {
                            var src = path.join(buildDestPath, file);
                            var dst = path.join(moveDestPath, file);
                            var stat = fs.statSync(src);
                            if (stat.isDirectory()) {
                                copyDir(src, dst, COPY_OPTION_DELETE_DST | COPY_OPTION_DELETE_SRC, () => {
                                    copyCallback();
                                });
                            } else {
                                copyFile(src, dst, COPY_OPTION_DELETE_DST | COPY_OPTION_DELETE_SRC, () => {
                                    copyCallback();
                                });
                            }
                        }
                    }
                } else {
                    if (callback) callback();
                }
            } else {
                if (callback) callback();
            }
        }
    }
}

/**
 * native版本移除代码md5信息
 * 因为main.js无法热更，所以其中的require语句不能含有js的md5信息
 */
function removeSrcMd5Info (platform, callback) {
    platform = getBuildPlatform(platform);
    if (platform === 'ios' || platform === 'android') {
        Editor.log('开始移除脚本文件名中的md5信息');
        var buildDestPath = getBuildFinalDestPath(_buildDestPath, platform);
        var srcPath = path.join(buildDestPath, 'src');
        if (fs.existsSync(srcPath)) {
            var files = fs.readdirSync(srcPath);
            for (const file of files) {
                var strs = file.split('.');
                if (strs.length >= 3) {
                    var index = strs.length - 2;
                    var md5Str = strs[index];
                    if (md5Str.length === 5) {
                        strs.splice(index, 1);
                        var newFileName = strs.join('.');
                        fs.renameSync(path.join(srcPath, file), path.join(srcPath, newFileName));
                    }
                }
            }
        }
    
        var mainPath = path.join(buildDestPath, 'main.js');
        if (fs.existsSync(mainPath)) {
            let str = fs.readFileSync(mainPath, 'utf8');
            // Editor.log(`${path.basename(mainPath)}:${str}`);
            if (str && str.length > 0) {
                let reg = /'src\/([^\s]*)(\.\w{5})\.js'/g;
                let replacer = '\'src/$1.js\'';
                // Editor.log('reg:' + reg);
                if (reg && str.match(reg)) {
                    str = str.replace(reg, replacer);
                    fs.writeFileSync(mainPath, str);
                    // Editor.log('replace and save');
                }
            }
        }
    }
    if (callback) callback();
}

function zipQQPlayByShell () {
    Editor.log('开始打包QQPlay');

    var filePath = path.join(getBuildFinalDestPath(null, 'qqplay'), '..', 'cmshow_game_3319.zip');
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        Editor.log('unlink path:' + filePath);
    }

    tool.runShell(
        'sh',
        [
            path.join(__dirname, 'shell', 'zip_qq.sh'),
        ],
        () => {
            Editor.log(`打包QQPlay执行完成`);
        }
    );
}

//#region 工具方法

function getBuildPlatform(defaultPlatform) {
    if (_buildPlatform === null) {
        if (!defaultPlatform) {
            defaultPlatform = 'wechatgame';
        }
        return defaultPlatform;
    } else {
        return _buildPlatform;
    }
}

/**
 * 获取build中间路径
 * 注意:oppo-runtime和vivo-runtime会先build到jsb-link路径，然后再拷贝到最终路径
 * @param {string} buildDestPath build路径，若为null则默认取本工程微信路径
 * @param {string} platform 目标平台
 */
function getBuildTempDestPath(buildDestPath = null, platform = null) {
    if (platform === 'oppo-runtime' || platform === 'vivo-runtime') {
        return path.join(__dirname, '..', '..', 'build', 'jsb-link');
    }
    if (buildDestPath == null) {
        buildDestPath = path.join(__dirname, '..', '..', 'build');
        let subPath = 'wechatgame';
        switch (platform) {
            case 'ios':
            case 'android': {
                subPath = 'jsb-link';
                break;
            }
            default: {
                subPath = platform ? platform : 'wechatgame';
            }
        }
        buildDestPath = path.join(buildDestPath, subPath);
        // Editor.log('buildDestPath:' + buildDestPath);
    }
    return buildDestPath;
}

/**
 * 获取build最终路径
 * 注意:oppo-runtime和vivo-runtime会先build到jsb-link路径，然后再拷贝到最终路径
 * @param {string} buildDestPath build路径，若为null则默认取本工程微信路径
 * @param {string} platform 目标平台
 */
function getBuildFinalDestPath(buildDestPath = null, platform = null) {
    if (platform === 'oppo-runtime') {
        return path.join(__dirname, '..', '..', 'build', 'quickgame');
    }
    if (platform === 'vivo-runtime') {
        return path.join(__dirname, '..', '..', 'build', 'qgame');
    }
    if (buildDestPath == null) {
        buildDestPath = path.join(__dirname, '..', '..', 'build');
        let subPath = 'wechatgame';
        switch (platform) {
            case 'ios':
            case 'android': {
                subPath = 'jsb-link';
                break;
            }
            default: {
                subPath = platform ? platform : 'wechatgame';
            }
        }
        buildDestPath = path.join(buildDestPath, subPath);
        // Editor.log('buildDestPath:' + buildDestPath);
    }
    return buildDestPath;
}

/**
 * 获取build临时文件夹路径
 * 该文件夹用于存放build过程中的未签名压缩包等临时文件
 */
function getBuildTempPath() {
    var ret = path.join(__dirname, '..', '..', 'build', 'temp');
    try {
        if (!fs.existsSync(ret)) {
            fs.mkdirSync(ret);
        }
    } catch (e) {
        Editor.error(e);
    }
    return ret;
}

function backupFile(fileFullPath, isOverwrite = false) {
    if (!fs.existsSync(fileFullPath)) return;
    var backupPath = getBackupFilePath(fileFullPath);
    var isDstExists = fs.existsSync(backupPath);
    if (!isOverwrite && isDstExists) return;
    if (isDstExists) fs.unlinkSync(backupPath);
    fs.copyFileSync(fileFullPath, backupPath);
}

function restoreFile(fileFullPath) {
    var backupPath = getBackupFilePath(fileFullPath);
    var isDstExists = fs.existsSync(backupPath);
    if (!isDstExists) {
        Editor.error('restore file fail, backup not exists, path:' + backupPath);
        return;
    }
    if (fs.existsSync(fileFullPath)) {
        fs.unlinkSync(fileFullPath);
    }
    fs.copyFileSync(backupPath, fileFullPath);
}

function getBackupFilePath(fileFullPath) {
    var buildTempPath = getBuildTempPath();
    var fileName = path.basename(fileFullPath);
    var backupPath = path.join(buildTempPath, fileName);
    return backupPath;
}

/**
 * 获取目标平台的中文名，用于语音提示
 * @param {string} platform 目标平台
 */
function getPlatformChineseString(platform = null) {
    platform = getBuildPlatform(platform);
    switch (platform.toLowerCase()) {
        case 'wechatgame': {
            return '微信';
        }
        case 'qqplay': {
            return '扣扣';
        }
        case 'ios': {
            return '苹果';
        }
        case 'android': {
            return '安卓';
        }
        case 'web-mobile': {
            return '挨嗤五';
        }
        default: {
            return '未知';
        }
    }
}

/**
 * 获取包含md5和后缀名的文件相对路径
 * @param {string} rootDirPath 目录路径
 * @param {string} relateFilePath 文件相对于目录子路径，不包含md5和后缀名
 * @returns {string} 包含md5和后缀名的文件相对路径
 */
function getRelateFilePathWithFullInfo(rootDirPath, relateFilePath) {
    if (!fs.existsSync(rootDirPath)) {
        Editor.error('getRelateFilePathWithFullInfo error, rootDirPath not exists:' + rootDirPath);
        return relateFilePath;
    }
    let subDirPath = '';
    if (relateFilePath.indexOf('/') >= 0) {
        subDirPath = path.dirname(relateFilePath);
        rootDirPath = path.join(rootDirPath, subDirPath);
    }
    let fileName = path.basename(relateFilePath);
    const files = fs.readdirSync(rootDirPath);
    for (const file of files) {
        // Editor.log('loop file:' + file);
        if (file.startsWith(fileName)) {
            // const relateFilePath = path.join(rootDirPath, file);
            // const stat = fs.statSync(relateFilePath);
            // if (stat.isFile()) {
            // Editor.log('find file:' + file);
            return (subDirPath.length > 0 ? subDirPath + '/' : '') + path.basename(file); // 此处不能使用join，require中路径统一使用'/'分隔
            // }
        }
    }
    return relateFilePath;
}

/**
 * 拷贝目录
 * @param {string} src 源路径
 * @param {string} dest 目标路径
 * @param {number} option 拷贝选项，详见COPY_OPTION_XXX，注意：COPY_OPTION_OVERWRITE选项不生效
 * @param {function} callback 回调
 * @param {regex|function} filter 过滤规则
 */
function copyDir(src, dest, option = 0, callback = null, filter = null) {
    if (!src || !fs.existsSync(src)) {
        Editor.warn('copyDir error, src not exists:' + src);
        if (callback) callback();
        return;
    }

    if ((option & COPY_OPTION_DELETE_DST) !== 0) {
        if (fs.existsSync(dest)) {
            deleteWithPath(dest, () => {
                _copyDirInternal(src, dest, option, callback, filter);
            });
        } else {
            _copyDirInternal(src, dest, option, callback, filter);
        }
    } else {
        _copyDirInternal(src, dest, option, callback, filter);
    }
}

/**
 * 使用ncp拷贝目录
 * @param {string} src 源路径
 * @param {string} dest 目标路径
 * @param {number} option 拷贝选项，详见COPY_OPTION_XXX，注意：COPY_OPTION_OVERWRITE选项不生效
 * @param {function} callback 回调
 * @param {regex|function} filter 过滤规则
 */
function _copyDirInternal(src, dest, option = 0, callback = null, filter = null) {
    if (!fs.existsSync(dest)) {
        tool.mkDirByPathSync(dest);
    }
    if ((option & COPY_OPTION_OVERWRITE) !== 0) {
        _deleteDestFile(src, dest);
    }
    ncp(src, dest, {
        // 注：此处拷贝文件夹时如果传true会导致收不到完成回调，故OVERWRITE选项不可用
        clobber: false, //((option & COPY_OPTION_OVERWRITE) !== 0),
        stopOnErr: true,
        filter: filter
    }, 
    function (err) {
        if (err) {
            Editor.error(`copy ${src} -> ${dest} error:${err}`);
        } else {
            Editor.log(`copy ${src} -> ${dest} finish`);
        }
        if ((option & COPY_OPTION_DELETE_SRC) !== 0) {
            deleteWithPath(src, () => {
                if (callback) callback();                
            });
        } else {
            if (callback) callback();
        }
    });
}

function _deleteDestFile(src, dst) {
    var files = fs.readdirSync(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const dstPath = path.join(dst, file);
        // Editor.log('_deleteDestFile:' + srcPath + ' <-> ' + dstPath);
        if (fs.existsSync(dstPath)) {
            const stat = fs.statSync(srcPath);
            if (stat.isDirectory()) {
                _deleteDestFile(srcPath, dstPath);
            } else {
                fs.unlinkSync(dstPath);
                // Editor.success('_deleteDestFile:' + dstPath);
            }
        }
    }
}

function findAllJsonFile(dirPath, filelist) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    var files = fs.readdirSync(dirPath);
    var length = files.length;
    var pushCount = 0;

    var pushFileIntoList = function (file, filePath, stat) {
        Editor.log('push file:' + file + ' of ' + dirPath + ' ' + (pushCount + 1) + ' / ' + length);

        filelist.push({
            path: filePath,
            size: stat.size,
            index: s_jsonCount,
        });

        pushCount ++;
        s_jsonCount ++;
        
    };

    if (length > 0) {
        for (const file of files) {
            

            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if(file.endsWith('.json')) {
                pushFileIntoList(file, filePath, stat);
            } else if (stat.isDirectory()) {
                findAllJsonFile(filePath, filelist);
                // rimraf(filePath, (err) => {
                //     if (err) {
                //         Editor.error('rm clone dest error:' + err);
                //     } else {
                //         Editor.log('rm clone dest finish');
                //     }
                //     deleteFinishFunc(file);
                // });
                // deleteDir(filePath, true, () => {
                //     deleteFinishFunc();
                // });
            }
            //  else {
            //     fs.unlinkSync(filePath);
            //     deleteFinishFunc(file);
            // }
        }
    }
}

function deleteDir(dirPath, isDeleteSelf, callback) {
    if (!fs.existsSync(dirPath)) {
        if (callback) callback();
        return;
    }

    var files = fs.readdirSync(dirPath);
    var deleteCount = 0;
    var length = files.length;
    var deleteFinishFunc = function (file) {
        Editor.log('delete file:' + file + ' of ' + dirPath + ' ' + (deleteCount + 1) + ' / ' + length);
        deleteCount++;
        if (deleteCount >= length) {
            if (isDeleteSelf) fs.rmdirSync(dirPath);
            if (callback) callback();
            Editor.log('delete dir finish:' + dirPath);
        }
    };
    if (length > 0) {
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                rimraf(filePath, (err) => {
                    if (err) {
                        Editor.error('rm clone dest error:' + err);
                    } else {
                        Editor.log('rm clone dest finish');
                    }
                    deleteFinishFunc(file);
                });
                // deleteDir(filePath, true, () => {
                //     deleteFinishFunc();
                // });
            } else {
                fs.unlinkSync(filePath);
                deleteFinishFunc(file);
            }
        }
    } else {
        deleteFinishFunc(null);
    }
}

/**
 * 拷贝文件
 * @param {string} src 源路径
 * @param {string} dest 目标路径
 * @param {number} option 拷贝选项，详见COPY_OPTION_XXX，注意：COPY_OPTION_OVERWRITE选项不生效(ncp的clobber参数不好使)
 * @param {function} callback 回调
 */
function copyFile(src, dest, option = COPY_OPTION_DELETE_DST, callback = null) {
    if (!src || !fs.existsSync(src)) {
        Editor.warn('copyFile error, src not exists:' + src);
        if (callback) callback();
        return;
    }
    // Editor.log(`start copy ${src} -> ${dest}`);
    // Editor.log(`start copy option:${option}`);
    var clobber = ((option & COPY_OPTION_OVERWRITE) !== 0);
    // Editor.log('clobber:' + clobber);
    // Editor.log('((option & COPY_OPTION_DELETE_DST) !== 0):' + ((option & COPY_OPTION_DELETE_DST) !== 0));
    if (((option & COPY_OPTION_DELETE_DST) !== 0)) {
        var destFilePath = path.join(dest, path.basename(src));
        // Editor.log('destFilePath:' + destFilePath);
        if (fs.existsSync(destFilePath)) {
            fs.unlinkSync(destFilePath);
        }
    }
    ncp(src, dest, {
        clobber: clobber, // 传true也并不一定会覆盖，神马玩意儿
        stopOnErr: true,
    },
    function (err) {
        if (err) {
            Editor.error(`copy ${src} -> ${dest} error:${err}`);
        } else {
            Editor.log(`copy ${src} -> ${dest} finish`);
        }
        if ((option & COPY_OPTION_DELETE_SRC) !== 0) {
            fs.unlinkSync(src);
        }
        if (callback) callback(err);
    });
}

/**
 * 删除文件
 * @param {string} dirPath 目录路径
 * @param {string} filePath 文件子路径，不带md5和后缀名
 * @param {function} callback 回调
 */
function deleteFile(dirPath, filePath, callback) {
    filePath = path.join(dirPath, getRelateFilePathWithFullInfo(dirPath, filePath));
    deleteWithPath(filePath, callback);
}

/**
 * 删除文件或文件夹
 * @param {string} deletePath 路径
 * @param {function} callback 回调
 */
function deleteWithPath(deletePath, callback) {
    if (fs.existsSync(deletePath)) {
        rimraf(deletePath, (error) => {
            if (error) {
                Editor.error('delete error:' + error);
            } else {
                Editor.log('成功删除:' + deletePath);
            }
            if (callback) {
                callback(error);
            }
        });
    } else {
        if (callback) callback(null);
    }
}

/**
 * 递归读取文件列表
 * @param {string} dir 目录路径s
 * @param {Array} list 文件列表
 */
function readDirRecursively(dir, list) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readDirRecursively(filePath, list);
        } else {
            list.push(filePath);
        }
    }
}

function generateConfigJson(dest) {
    try {
        const resPath = path.join(dest, 'res');
        const resPathLength = resPath.length + 1;
        const files = [];
        readDirRecursively(resPath, files);

        const configObj = {};
        configObj.resVersion = 1;
        configObj.md5AssetsMap = {};
        // let buildConfigFilePath = null;
        let saveConfigFilePath = null;
        for (let index = 0; index < files.length; index++) {
            const filePath = files[index];
            let subPath = filePath.substring(resPathLength);
            // Editor.log(subPath);
            if (subPath.startsWith('raw-')) {
                subPath = subPath.substring('raw-'.length);
            } else {
                let sepIndex = subPath.indexOf(path.sep);
                if (sepIndex >= 0) {
                    subPath = subPath.substring(sepIndex + 1);
                }
            }
            let fileName = path.basename(subPath);
            let extName = path.extname(fileName);
            let md5Str = path.extname(fileName.substring(0, fileName.length - extName.length))
            md5Str = md5Str.substring(1);
            fileName = fileName.substring(0, fileName.indexOf(md5Str) - 1) + extName;
            let key = (path.join(path.dirname(subPath), fileName)).replace('\\', '/');
            configObj.md5AssetsMap[key] = md5Str;
            if (fileName === 'config.json') {
                // buildConfigFilePath = filePath;
                saveConfigFilePath = path.join(path.dirname(filePath), fileName);
            }
        }
        let content = JSON.stringify(configObj);
        fs.writeFileSync(CONFIG_FILE_PATH, content);
        // if (buildConfigFilePath) {
        //     fs.writeFileSync(buildConfigFilePath, content);
        // }

        md5File(CONFIG_FILE_PATH, (err, hash) => {
            if (err) {
                Editor.error(err);
            } else {
                Editor.log('md5 of config.json:' + hash);
                // Editor.log('savePath:' + saveConfigFilePath);
                if (saveConfigFilePath) {
                    let extName = path.extname(saveConfigFilePath);
                    let pathWithoutExt = saveConfigFilePath.substring(0, saveConfigFilePath.length - extName.length);
                    saveConfigFilePath = pathWithoutExt + '.' + hash.substring(0, 5) + extName;
                    // Editor.log('save new config to:' + saveConfigFilePath);
                    fs.writeFileSync(saveConfigFilePath, content);
                }
            }
        });
    } catch (e) {
        Editor.error(e);
    }
}

function playSound(words) {
    if (!isMac) return;
    if (!words) words = "";
    tool.runShell('sh', [
        path.join(__dirname, 'shell', 'play_sound.sh'),
        words
    ]);
}

 /**
  * 流水管线处理
  * @param {array} pipeline 管线数组,数组元素是fuction或者object
  *     function元素:    格式必须为function (platform, callback)的函数
  *     object元素:      格式为{func:处理函数, [argArray]:函数参数, [options]:选项参数, [desc]:处理描述]
  *     options格式:     {delayTime:处理后的延时}
  * @param {string} platform 目标平台
  * @param {function} finishCallback 完成回调
  */
function processPipeline(pipeline, platform, finishCallback) {
    var index = 0;
    var length = pipeline.length;

    var callback = function () {
        if (index < length) {
            var currentProcess = pipeline[index++];
            var func = null;
            var argArray = null;
            var desc = '';
            if (typeof currentProcess == 'function') {
                func = currentProcess;
                desc = func.name;
                argArray = [platform, callback];
            } else {
                func = currentProcess.func;
                argArray = currentProcess.argArray || [platform];
                if (currentProcess.options && currentProcess.options.delayTime !== undefined) {
                    // Editor.success('currentProcess.options.delayTime:' + currentProcess.options.delayTime);
                    argArray.push(function delayCallback () {
                        setTimeout(() => {
                            callback();
                        }, currentProcess.options.delayTime);
                    });
                } else {
                    argArray.push(callback);
                }
                desc = currentProcess.desc || func.name;
            }
            Editor.success(`[${index}/${length}] ${desc}`);
            // Editor.success(argArray);
            if (func) {
                func.apply(null, argArray);
            } else {
                callback();
            }
        } else {
            if (finishCallback) finishCallback();
        }
    };

    callback();
}

/**
 * 获取渠道枚举
 * @param {string} platform build选项中的渠道平台标识字符串
 */
function getBuildPlatformType(platform) {
    switch (platform) {
        case 'wechatgame':
            return PlatformType.WECHAT;
        case 'qqplay':
            return PlatformType.QQ;
        case 'web-mobile':
            return PlatformType.BROWSER;
        case 'oppo-runtime':
            return PlatformType.OPPO;
        case 'vivo-runtime':
            return PlatformType.VIVO;
        case 'android':
        case 'ios':
            return PlatformType.APP;
        default:
            return PlatformType.UNKNOWN;
    }
}

function setPlatformType(_platform, _platformType, _isH5, _isNative) {
    _buildPlatform = _platform;
    platformType = (_platformType !== null && _platformType !== undefined) ? _platformType : getBuildPlatformType(_platform);

    if (_isH5 !== undefined) {
        isH5 = _isH5;
    } else {
        isH5 = _platform == 'web-mobile';
    }

    if (_isNative !== undefined) {
        isNative = _isNative;
    } else {
        isNative = _platform == 'android' || _platform == 'ios' || _platform == 'oppo-runtime' || _platform == 'vivo-runtime';
    }
}

function checkCallback(callback) {
    if (!callback || typeof callback !== 'function') {
        callback = null;
    }
    return callback;
}

//#endregion 工具方法

/**
 * 这个事件会在**构建开始**时触发
 */
function onBuildStart(options, callback) {
    Editor.log('<<< onBuildStart >>> options:', options);
    _buildDestPath = options.dest;
    setPlatformType(options.actualPlatform);
    var buildDestPath = getBuildTempDestPath(null, _buildPlatform);
    buildStartProcess(buildDestPath, _buildPlatform, callback);
}

/**
 * 这个事件会在**构建结束前**触发
 * 此时除了计算文件 MD5、原生平台的加密脚本以外，大部分构建操作都已执行完毕。
 */
function onBeforeBuildFinish(options, callback) {
    Editor.log('<<< onBeforeBuildFinish >>>');
    var buildDestPath = getBuildTempDestPath(null, _buildPlatform);
    beforeBuildFinishProcess(buildDestPath, _buildPlatform, callback);
}

/**
 * 这个事件会在**构建结束后**触发
 */
function onBuildFinished(options, callback) {
    Editor.log('<<< onBuildFinished >>>');
    var buildDestPath = getBuildTempDestPath(null, _buildPlatform);
    afterBuildFinishProcess(buildDestPath, _buildPlatform, callback);
}

module.exports = {
    load() {
        // execute when package loaded
        Editor.Builder.on('before-change-files', onBeforeBuildFinish);
        Editor.Builder.on('build-start', onBuildStart);
        Editor.Builder.on('build-finished', onBuildFinished);
    },

    unload() {
        // execute when package unloaded
        Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
        Editor.Builder.removeListener('build-start', onBuildStart);
        Editor.Builder.removeListener('build-finished', onBuildFinished);
    },

    // register your ipc messages here
    messages: {
        DevelopTest() {
            // removeSrcMd5Info('android');
            // playSound(getPlatformChineseString('ios') + '编译完成');
            // platformType = PlatformType.OPPO;
            // buildPostProcess(_buildDestPath, 'web-mobile');
            // moveQQPlayH5ToSubDir('web-mobile', () => {
            //     Editor.success('move finish');
            // });

            // setPlatformType('vivo-runtime', PlatformType.VIVO, false, true);
            // buildPostProcess(null, 'vivo-runtime');

            // Editor.log(tool);
            // Editor.log(tool.desc);
            tool.runShell('ls', [], () => {
                Editor.log('ls finish');
            },
            true);
        },

        GenerateConfigJson() {
            // generateConfigJson(path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, 'build', 'web-mobile'));
        },

        /** 微信基础处理(生成res.json等) */
        WechatBaseProcess() {
            baseProcess(_buildDestPath, 'wechatgame');
        },

        /** QQ基础处理(生成res.json等) */
        QQPlayBaseProcess() {
            baseProcess(_buildDestPath, 'qqplay');
        },

        /** Android/iOS基础处理(生成res.json等) */
        JsbBaseProcess() {
            baseProcess(_buildDestPath, 'android');
        },

        QQPlayBuildPostProcess() {
            platformType = PlatformType.QQ;
            buildPostProcess(_buildDestPath, 'web-mobile');
        },

        OppoBuildPostProcess() {
            platformType = PlatformType.OPPO;
            buildPostProcess(_buildDestPath, 'web-mobile');
        },

        /** 修改Webpack相关JS */
        WechatModifyWebpackJSFile() {
            modifyWebpackJSFiles(_buildDestPath, false);
        },

        WechatBuildPostProcess() {
            buildPostProcess(_buildDestPath, 'wechatgame');
        },

        /** 取消微信URL合法性检查 */
        WechatUncheckUrl() {
            modifyWechatProjectJson(_buildDestPath);
        },

        QQMiniAppBuildPostProcess() {
            setPlatformType('wechatgame', PlatformType.QQminiAPP, false, false);
            buildPostProcess(_buildDestPath, 'wechatgame');
        },

        /** QQPlay打压缩包 */
        QQPlayZip(callback) {
            platformType = PlatformType.QQ;
            callback = checkCallback(callback);
            generateZipPackageByNodejs('qqplay', callback);
        },

        /** QQPlay-H5打压缩包 */
        QQPlayZipH5(callback) {
            platformType = PlatformType.QQ;
            callback = checkCallback(callback);
            generateZipPackageByNodejs('web-mobile', callback);
        },

        /** QQPlay拷贝build模板文件 */
        QQPlayCopyBuildTemplates() {
            copyBuildTemplates(null, 'qqplay');
            copyBuildTemplatesFromPlugin();
        },

        /** QQPlay-H5拷贝build模板文件 */
        QQPlayH5CopyBuildTemplates() {
            copyBuildTemplatesFromPlugin(getBuildFinalDestPath(null, 'web-mobile'), 'qqplay-h5');
        },

        /**  */
        QQPlayH5MoveFileToSubDir() {
            moveQQPlayH5ToSubDir('web-mobile', () => {
                Editor.success('move finish');
            });
        },

        OppoH5Zip(callback) {
            platformType = PlatformType.OPPO;
            callback = checkCallback(callback);
            generateZipPackageByNodejs('web-mobile', callback);
        },

        OppoH5SignPackage () {
            platformType = PlatformType.OPPO;
            signZipPackage('web-mobile', () => {
                Editor.success('oppo h5 sign package finish');
            });
        },

        OppoAdbPush () {
            oppoAdbPush();
        },

        VivoAdbPush() {
            vivoAdbPush();
        },

        /** 移除native版本的md5信息 */
        CommonRemoveSrcMd5Info() {
            removeSrcMd5Info('android', () => {
                Editor.success('移除脚本文件md5信息完成');
            });
        },

        /** 修改H5SDK相关代码 */
        CommonModifyH5SdkCode() {
            const platform = getBuildPlatform();
            buildStartProcess(null, platform, null);
        },

        /** 压缩纹理 */
        CommonCompressTexture(callback) {
            compressTexture(null, callback);
        },

        /** 压缩纹理完成回调 */
        'build-pipeline:onCompressFinish' () {
            // Editor.log('onCompressFinish');
            if (compressCallback && typeof compressCallback === 'function') {
                compressCallback();
                compressCallback = null;
            }
        },

        /** 移动资源到文件服务器(mac) */
        CommonMoveResToServer() {
            const platform = getBuildPlatform();
            moveResToServer(platform, null);
        },

        /** 移动资源到本地svn文件夹 */
        CommonMoveResLocal(callback, platform) {
            platform = getBuildPlatform(platform);
            callback = checkCallback(callback);
            moveResLocalByNodejs(platform, callback);
        },

        CommonMoveResLocalNative() {
            moveResLocalByNodejs('android', null);
        },

        /** 移动build到本地svn文件夹 */
        CommonMoveBuildLocal(callback) {
            const platform = getBuildPlatform();
            callback = checkCallback(callback);
            moveBuildByNodejs(platform, callback);
        },

        WechatPublishAutoProcess() {
            setPlatformType('wechatgame', PlatformType.WECHAT, false, false);
            this.messages.CommonPublishAutoProcess('wechatgame');
        },

        QQMiniAppPublishAutoProcess() {
            setPlatformType('wechatgame', PlatformType.QQminiAPP, false, false);
            this.messages.CommonPublishAutoProcess('wechatgame');
        },

        QQPublishAutoProcess() {
            platformType = PlatformType.QQ;
            this.messages.CommonPublishAutoProcess('web-mobile');
        },

        OppoDebugAutoProcess() {
            setPlatformType('web-mobile', PlatformType.OPPO, false, true);
            this.messages.CommonDebugAutoProcess('web-mobile');
        },

        OppoPublishAutoProcess() {
            platformType = PlatformType.OPPO;
            this.messages.CommonPublishAutoProcess('web-mobile');
        },

        VivoDebugAutoProcess() {
            setPlatformType('vivo-runtime', PlatformType.VIVO, false, true);
            this.messages.CommonDebugAutoProcess('vivo-runtime');
        },

        VivoPublishAutoProcess() {
            setPlatformType('vivo-runtime', PlatformType.VIVO, false, true);
            this.messages.CommonPublishAutoProcess('vivo-runtime');
        },

        /** DEBUG一条龙处理 */
        CommonDebugAutoProcess(platform) {
            Editor.success('#################### 打包开始 ####################');
            platform = _buildPlatform ? _buildPlatform : getBuildPlatform(platform);
            Editor.success('目标平台:' + platform + (platform === 'web-mobile' ? ' platformType:' + platformType : ''));

            var pipeline = null;
            if (platform === 'web-mobile') {
                pipeline = [
                    {
                        func: buildPostProcess,
                        argArray: [_buildDestPath, platform],
                        desc: '基础处理',
                    },
                    {
                        func: moveQQPlayH5ToSubDir,
                        options: { delayTime: 100 },
                        desc: '按url移动文件夹位置(仅QQ-H5版本)',
                    },
                    {
                        func: generateZipPackageByNodejs,
                        options: { delayTime: 100 },
                        desc: '生成zip压缩包',
                    },
                    {
                        func: signZipPackage,
                        desc: '签名(仅OPPO-H5版本)'
                    }
                ];
            } else {
                pipeline = [
                    {
                        func: buildPostProcess,
                        argArray: [_buildDestPath, platform],
                        desc: '基础处理',
                    },
                    {
                        func: moveResLocalByNodejs,
                        options: { delayTime: 100 },
                        desc: '移动res文件夹到source/res-pub',
                    },
                    {
                        func: moveBuildByNodejs,
                        options: { delayTime: 100 },
                        desc: '移动build文件夹到source/build',
                    },
                    {
                        func: removeSrcMd5Info,
                        options: { delayTime: 100 },
                        desc: '移除js文件名中的md5信息(仅JSB版本)',
                    },
                    {
                        func: moveQQPlayH5ToSubDir,
                        options: { delayTime: 100 },
                        desc: '按url移动文件夹位置(仅QQ-H5版本)',
                    },
                    {
                        func: generateZipPackageByNodejs,
                        options: { delayTime: 100 },
                        desc: '生成zip压缩包',
                    },
                    {
                        func: signZipPackage,
                        desc: '签名(仅OPPO-H5版本)'
                    }
                ];
            }

            processPipeline(pipeline, platform, () => {
                // 微信取消url合法性检查
                if (platform === 'wechat') {
                    modifyWechatProjectJson(_buildDestPath);
                }
                Editor.success('#################### 打包完成 ####################');
                playSound(getPlatformChineseString(platform) + '打包完成');
            });
        },

        /** PUBLISH一条龙处理 */
        CommonPublishAutoProcess(platform) {
            Editor.success('#################### 打包开始 ####################');
            platform = getBuildPlatform(platform);
            if (platform === 'web-mobile' && platformType === PlatformType.BROWSER) {
                platformType = PlatformType.QQ;
            }
            Editor.success('目标平台:' + platform + ' platformType:' + platformType);

            var pipeline = [
                // {
                //     func: buildPostProcess,
                //     argArray: [_buildDestPath, platform],
                //     desc: '基础处理',
                // },
                {
                    func: compressTexture,
                    desc: '压缩纹理',
                },
                {
                    func: copyJsonFileToBuildDir,
                    options: { delayTime: 100 },
                    desc: '压缩res-pub里所有的json文件成为一个zip',
                },
                {
                    func: moveResLocalByNodejs,
                    options: { delayTime: 100 },
                    desc: '移动res文件夹到source/res-pub',
                },
                {
                    func: moveBuildByNodejs,
                    options: { delayTime: 100 },
                    desc: '移动build文件夹到source/build',
                },
                // {
                //     func: removeSrcMd5Info,
                //     options: { delayTime: 100 },
                //     desc: '移除js文件名中的md5信息(仅JSB版本)',
                // },
                // {
                //     func: moveQQPlayH5ToSubDir,
                //     options: { delayTime: 100 },
                //     desc: '按url移动文件夹位置(仅QQ-H5版本)',
                // },
                // {
                //     func: generateZipPackageByNodejs,
                //     options: { delayTime: 200 },
                //     desc: '生成zip压缩包',
                // },
                // {
                //     func: signZipPackage,
                //     desc: '签名(仅OPPO-H5版本)'
                // }
            ];

            processPipeline(pipeline, platform, () => {
                Editor.success('#################### 打包完成 ####################');
                playSound(getPlatformChineseString(platform) + '打包完成');
            });
        },
    },
};