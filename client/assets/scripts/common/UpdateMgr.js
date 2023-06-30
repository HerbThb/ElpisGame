/**
 * @fileoverview UpdateMgr
 * @author <meifan@gameley.cn> (梅凡)
 */

const GameData = require('GameData');
const PlatformMgr = require('PlatformMgr');
const Tools = require('Tools');

 /**
 * UpdateMgr 更新管理器
 */
const UpdateMgr = cc.Class({
    statics: {

        /**
         * 检查是否是新安装，若是则需要清空本地下载资源
         * @param {function} callback 成功回调
         */
        checkNewClient: function (callback) {
            // QQ小游戏由于拉取json太慢，需要把部分json压缩打包，首次进入游戏进行解压缩
            if (PlatformMgr.isPlatformUseWxApi() &&
                // PlatformMgr.platformType === PlatformType.QQMINIAPP &&
                !PlatformMgr.isDevTool &&
                window !== undefined &&
                window.wxDownloader !== undefined &&
                window.wxFsUtils !== undefined &&
                GameData.instance.isEnvironmentCheckUpdate()) {
                console.log('UNZIP_TAG 开始检查解压缩');
                const wxDownloader = window.wxDownloader;
                const wxFsUtils = window.wxFsUtils;
                if (wx.getFileSystemManager) {
                    const fs = wx.getFileSystemManager();
                    const unzipFlag = 'res_unzip_flag_' + GameData.instance.srcVersion;
                    const unzipFlagFilePath = wxDownloader.cacheDir + '/' + unzipFlag;
                    console.log('UNZIP_TAG 开始检查res压缩包 flagFile:' + unzipFlagFilePath);
                    fs.access({
                        path: unzipFlagFilePath,
                        success: function () {
                            console.log('UNZIP_TAG ' + unzipFlagFilePath + ' 存在，已经解压过了~');
                            if (callback) callback();
                        },
                        fail: function () {
                            const storageFlag = Tools.getItem(unzipFlag);
                            if (storageFlag === '1') {
                                console.log('UNZIP_TAG ' + unzipFlag + ' 存在，已经解压过了~');
                                if (callback) callback();
                            } else {
                                const relativePath = '/res/res.' + GameData.instance.srcVersion + '.zip';
                                const url = wxDownloader.REMOTE_SERVER_ROOT + relativePath;
                                const zipFilePath = wxDownloader.cacheDir + relativePath;
                                const zipDirPath = wxDownloader.cacheDir + '/res';
                                console.log('UNZIP_TAG ' + unzipFlag + ' 不存在，需要进行下载和解压 url:' + url);
                                wxFsUtils.exists(zipDirPath, function (exists) {
                                    console.log('UNZIP_TAG 下载目录是否存在:' + exists);
                                    if (!exists) {
                                        wxFsUtils.makeDirSync(zipDirPath, true);
                                    }

                                    wxFsUtils.downloadFile(url, zipFilePath, function (error, downloadFilePath) {
                                        if (error) {
                                            console.error('UNZIP_TAG 下载失败，error:', error);
                                            if (callback) callback();
                                        } else {
                                            console.log('UNZIP_TAG 下载成功，开始解压缩');
                                            const targetPath = wxDownloader.cacheDir;
                                            fs.unzip({
                                                zipFilePath: zipFilePath,
                                                targetPath: targetPath,
                                                success: function () {
                                                    console.log('UNZIP_TAG 解压缩成功，写入缓存文件~');
                                                    const cachedFiles = wxDownloader.getCachedFileList();
                                                    if (cachedFiles) {
                                                        const files = fs.readdirSync(targetPath);
                                                        console.log('UNZIP_TAG 缓存文件夹中的文件数量:' + files.length);
                                                        for (let index = 0; index < files.length; index++) {
                                                            const file = files[index];
                                                            // console.log('UNZIP_TAG 缓存文件索引:' + index + ' file:' + file);
                                                            cachedFiles[file] = 1;
                                                        }
                                                        wxFsUtils.writeFile(wxDownloader.cacheDir + '/' + wxDownloader.cachedFileName, JSON.stringify(cachedFiles), 'utf8');
            
                                                        console.log('UNZIP_TAG 创建flag文件~');
                                                        Tools.setItem(unzipFlag, '1');
                                                        fs.writeFile({
                                                            filePath: unzipFlagFilePath,
                                                            data: '1',
                                                            success: function () {
                                                                console.log('UNZIP_TAG 创建flag文件成功~');
                                                                if (callback) callback();
                                                            },
                                                            fail: function (errMsg) {
                                                                console.log('UNZIP_TAG 创建flag文件失败！errMsg:', errMsg);
                                                                if (callback) callback();
                                                            }
                                                        });
                                                    } else {
                                                        console.log('UNZIP_TAG 缓存信息文件不存在');
                                                        if (callback) callback();
                                                    }
                                                },
                                                fail: function (errMsg) {
                                                    console.log('UNZIP_TAG 解压缩失败！errMsg:', errMsg);
                                                    if (callback) callback();
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        },
                    });
                            
                    
                } else {
                    console.log('UNZIP_TAG wx.getFileSystemManager is undefined');
                    if (callback) callback();
                }
            // } else if (cc.sys.isNative &&
            //     PlatformMgr.platformType !== PlatformType.OPPO && 
            //     PlatformMgr.platformType !== PlatformType.VIVO &&
            //     GameData.instance.isEnvironmentCheckUpdate()) {
            //     UpdateMgr.initNativeAssetsManager();
                
            //     // apk包的version大于js代码里的version,说明js代码是老版本资源,需要清除本地资源并重启游戏
            //     if (GameData.instance.getVersionCode() > GameData.instance.appVersion) {
            //         console.log('versionCode greater than appVersion, need cleanup and restart!');
            //         if (UpdateMgr.cleanupLocalNativeRes(false)) {
            //             // 重启js引擎
            //             return;
            //         }
            //     }
            //     if (callback) callback();
            } else {
                if (callback) callback();
            }
        },

    }
});