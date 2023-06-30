
const {ccclass, property} = cc._decorator;

export default class ListItem extends cc.Component {
    /**当前项ID，0表示第一项 */
    public itemID:number = 0;
    /**数据 */
    public data:any;
    
    /**
     * 刷新
     * @param itemID 当前项ID
     * @param data   数据
     */
    public updateItem(itemID, data) {
        this.itemID = itemID;
        this.data = data;
        this.dataChanged();
    }

    /**数据改变 */
    protected dataChanged(){
        
    }

}
