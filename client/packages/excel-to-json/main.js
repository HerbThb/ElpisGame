'use strict';

const fs = require('fs');
const path = require('path');
const xlsx = require('./lib/xlsx-to-json.js');
const config = require('./config.json');

const SRC_PATH = 'assets/excel';
const DST_PATH = 'assets/resources/config';

const CLIENT_CFG_PATH = path.join('assets', 'resources', 'config');
const FULL_CFG_PATH = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, CLIENT_CFG_PATH);
const FULL_PREFAB_PATH = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, 'assets', 'resources');
const lowQName = "-lowQ"

function readFileList(dirPath, fileList) {
    var files = fs.readdirSync(dirPath);
    files.forEach(function (file, index) {
        var fullPath = path.join(dirPath, file);
        var stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            readFileList(fullPath + path.sep, fileList)
        } else if (file.endsWith('.xlsx') && !file.startsWith('~$')) {
            fileList.push(fullPath);
        }
    })
}

function mkdirsSync(dirpath) {
    try {
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function (dirname) {
                if (dirname !== '') {
                    if (pathtmp) {
                        pathtmp = path.join(pathtmp, dirname);
                    } else {
                        pathtmp = dirname;
                    }
                    if (!fs.existsSync(pathtmp)) {
                        Editor.log("mkdir:" + pathtmp);
                        if (!fs.mkdirSync(pathtmp)) {
                            return false;
                        }
                    }
                }
            });
        }
        return true;
    } catch (e) {
        Editor.log("create dir fail! path=" + dirpath + "\nerrorMsg:" + e);
        return false;
    }
}

/**
 * find - low - q 分界线
 */
function reloadPrefabPath() {
    var map = new Map();
    var rawArray = [];
    fs.readFile(path.join(FULL_CFG_PATH, 'pool-config.json'), 'utf8', function (err, data) {
        if (err) {
            Editor.error(err);
        } else {
            rawArray = JSON.parse(data);
            for (const obj of rawArray) {
                map.set(path.normalize(obj.file), path.normalize(obj.dir));
            }
        }

        findAllPrefab(map);

    });
}

function findAllPrefab(map) {
    var rawArray = [];
    var writeMap = new Map();
    for (var [key, value] of map) {
        var needWrite = false;
        const prefabPath = value;
        var data = fs.readFileSync(path.join(FULL_CFG_PATH, key + '.json'), 'utf8');
        if (data) {
            rawArray = JSON.parse(data);
            for (const obj of rawArray) {
                if (obj.name_lowQ) {
                    var existsLowQ = fs.existsSync(path.join(FULL_PREFAB_PATH, prefabPath, obj.name_lowQ + '.prefab'))
                    if (!existsLowQ) {
                        Editor.log(prefabPath + "目录下  notExist:" + obj.name_lowQ);
                        obj.name_lowQ = "";
                        needWrite = true;
                    }
                } else {
                    const name = obj.name + lowQName
                    var exists = fs.existsSync(path.join(FULL_PREFAB_PATH, prefabPath, name + '.prefab'))
                    if (exists) {
                        Editor.log("exist:" + name + "  未写入：" + key + '.json');
                        obj.name_lowQ = name;
                        needWrite = true
                    }
                }
            }
            if (needWrite) {
                var newData = JSON.stringify(rawArray)
                var keyPath = key + '.json'
                writeMap.set(keyPath, newData);
            }
        } else {
            Editor.error(path.join(FULL_CFG_PATH, key + '.json') + ' ERROR!');
        }
    }
    writeToFile(writeMap);
}

function writeToFile(writeMap) {
    for (var [key, value] of writeMap) {
        Editor.log('重新写入的文件:' + key);
        fs.writeFile(path.join(FULL_CFG_PATH, key), value, 'utf8', function (err, data) {
            if (err) {
                Editor.error(err + "|写入文件失败");
            }
        });
    }
}

module.exports = {
    messages: {
        open() {
            Editor.Panel.open('excel-to-json.panel');
        },

        //
        parse(event, cbParams) {
            //#region 遍历获取excel文件列表
            var fileList = [];
            var fullSrcPath = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, SRC_PATH) + path.sep;
            Editor.success('excel to json start parse, path:' + fullSrcPath);
            readFileList(fullSrcPath, fileList);
            //#endregion

            //#region 具体转换过程
            var fullDstPath = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, DST_PATH);
            for (const filePath of fileList) {
                let srcPath = filePath;
                let subPath = srcPath.substring(fullSrcPath.length);
                let outPath = path.join(fullDstPath, subPath).replace('.xlsx', '.json');
                let outDir = path.dirname(outPath);
                // Editor.log(subPath);

                if (mkdirsSync(outDir)) {
                    xlsx.toJson(srcPath, outDir, config);
                    // xlsxj.toJson(
                    //     srcPath,
                    //     outDir,
                    //     2,
                    //     ","
                    // );
                };
            }
            //#endregion

            Editor.assetdb.refresh('db://' + DST_PATH, (err, results) => {
                if (err) {
                    Editor.assetdb.error('Failed to reimport asset %s, %s', outName, err.stack);
                    return;
                }
                Editor.assetdb._handleRefreshResults(results);
            });

            if (cbParams && cbParams.length >= 2) {
                Editor.Ipc.sendToPanel(cbParams[0], cbParams[1]);
            }

            Editor.success("转换完成! Excel文件数量:" + fileList.length);
            reloadPrefabPath()
        },

        install(event, opts) {
            let fork = require('child_process').fork;
            let cmdStr = Editor.url('app://node_modules/npm/bin/npm-cli.js');
            let child = fork(cmdStr, ['install'], {
                cwd: Editor.url('packages://excel-to-json/'),
                stdio: 'inherit'
            });
            child.on('exit', function (code) {
                Editor.success('Install npm dependencies complete!');
            });
        }
    }
};
