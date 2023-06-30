var path = require("path");
var fs = require("fs");

// const SKIN_PATH = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, 'assets', 'resources','prefab','ui', 'player', 'skin')
// const SPINE_PATH = path.join(Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path, 'assets', 'res','animation','spine')
const SKIN_ASSETS_PATH = 'db://assets/resources/prefab/ui/player/skin/**/*'
const BATTLE_SKIN_ASSETS_PATH = 'db://assets/resources/prefab/battle/player/skin/**/*'
const SPINE_ASSETS_PATH = 'db://assets/res/spine/**/*'
const EXCLUDE_PATH = (Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path) + path.sep + "packages" + path.sep + "pngquant" + path.sep + "utils" + path.sep + "exclude.json";

var res_path = null;
var list = [];
var excludedList = [];

class utils {

    static getNativeAssetPathByPath(path, buildResults) {
        Editor.assetdb.queryAssets(path, 'texture', (err, assetInfos) => {
            for (let i = 0; i < assetInfos.length; ++i) {
                let tex = assetInfos[i].uuid;
                if (buildResults.containsAsset(tex)) {
                    let path = buildResults.getNativeAssetPath(tex);
                    // Editor.log(`Texture of "${assetInfos[i].url}": ${path}`);
                    let item = {
                        localPath: assetInfos[i].url,
                        buildPath: path,
                    }
                    excludedList.push(item);
                }
            }
            utils.writeToExcludeJson(excludedList);
        });
    }

    static writeToExcludeJson(list) {
        let jsonStr = JSON.stringify(list)
        fs.writeFileSync(EXCLUDE_PATH, jsonStr, 'utf8', function (err, data) {
            if (err) {
                Editor.error(err + "||||写入文件失败");
            }
        });
    }

    static readExcludeJson() {
        let data = fs.readFileSync(EXCLUDE_PATH, 'utf8');
        Editor.log("存入的数据:" + data);
        if (data) {
            Editor.log("排除在外的json文件读取完毕!");
            let arrData = JSON.parse(data);
            for (const item of arrData) {
                excludedList.push(item);
            }
        }
    }

    static onBeforeBuildFinish(options, callback) {
        let buildResults = options.buildResults;

        utils.getNativeAssetPathByPath(SKIN_ASSETS_PATH, buildResults);
        utils.getNativeAssetPathByPath(BATTLE_SKIN_ASSETS_PATH, buildResults);
        utils.getNativeAssetPathByPath(SPINE_ASSETS_PATH, buildResults);

        callback()
    }

    static checkIsExistProject( target){
        let proj_path = Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path;
        res_path = null;

        proj_path = path.sep + "build" + path.sep + target;
        res_path = (Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path) + proj_path + path.sep + "res";

        Editor.log(`正在检测构建工程是否存在：${Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path}${proj_path}`);
        try{
            let state = fs.lstatSync(`${ Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path }${ proj_path }`);
            // Editor.log(state.isDirectory());
            Editor.log(res_path);
            return state.isDirectory();
        }catch(error){
            Editor.error("构建工程不存在!请先构建项目...");
            return false;
        }   
        
    }

    static loadPngFiles(){
        if(!res_path) return;
        list = [];
        excludedList = [];
        utils.readExcludeJson();
        let state = fs.lstatSync(res_path);
        if(state.isDirectory()){
            utils.scanFiles(res_path);
        }
        return list;
    }

    static scanFiles(dir){
        
        let files = fs.readdirSync(dir);
        
        for(let i = 0; i < files.length; i++){
            let file = files[i];
            let file_path = path.join(dir, file);
            // if(file === "spine" || file === "skin") {
            //     continue
            // }
            let stat = fs.lstatSync(file_path);
            if(stat.isDirectory()){
                utils.scanFiles(file_path);
            }else{
                if(utils.isPng(file_path) && !utils.isExclude(file_path)){
                    let item = {
                        path: file_path,
                        before_size: stat.size,
                        name: file,
                    }
                    list.push(item);
                }
            }
        }
    }

    static substringByChar(str, char) {
        let index = str.indexOf(char);
        return str.substring(0, index);
    }

    static isExclude(file_path) {
        // Editor.log("载入list:" + utils.substringByChar(file_path, '.') + "  || excludedList:" + excludedList.length);
        for (let i = 0; i < excludedList.length; i++) {
            // Editor.log("subString:"+ i + ":" + utils.substringByChar(excludedList[i].buildPath, '.'));
            if (utils.substringByChar(excludedList[i].buildPath, '.') == utils.substringByChar(file_path, '.')) {
                // Editor.log("被剔除的图-原路径:" + excludedList[i].localPath + "   构建后路径:" + excludedList[i].buildPath)
                return true;
            }
        }
        return false;
    }

    static isPng(fileName){
        if (path.extname(fileName).toLocaleLowerCase() == ".png") {
            return true
        } else {
            return false
        }
    }
}

module.exports = utils
