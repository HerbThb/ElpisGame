import ListItem from "./ListItem";

const Tools = require('Tools');

const { ccclass, property } = cc._decorator;

@ccclass
// 装备展示列表组件
export default class RankNFTListItem extends ListItem {
    @property(cc.Label)
    rankLabel: cc.Label= null;
    @property(cc.Label)
    nameLabel: cc.Label= null;
    @property(cc.Label)
    scoreLabel: cc.Label= null;

    onLoad(){
    }

    protected dataChanged(){
        let data = this.data
        if (data.rank === -1) {
            // this.rankLabel.node.active = true;
            this.rankLabel.string = '未上榜';
        } else {
            // this.rankLabel.node.active = data.rank > 3;
            this.rankLabel.string = "#" + data.rank;
        }

        this.scoreLabel.string = data.score;

        if(data.adress.length > 10){
            // this.nameLabel.string = Tools.subStrByCharacter(data.adress, 6) + "...." + Tools.subStrByCharacter(data.adress, 15)
            this.nameLabel.string = Tools.subStrByCharacter(data.adress, 6) + "......" + data.adress.substring(data.adress.length-6, data.adress.length);
        }
        else{
            this.nameLabel.string = data.adress
        }
    }

    onClose() {
        this.node.active = false;
    }
}
