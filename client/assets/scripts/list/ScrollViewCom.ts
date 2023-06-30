import BaseCell from "./BaseCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollViewCom extends cc.Component {
    /** 格子预制件 */
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    /** x间隔 */
    @property(cc.Float)
    spacingX: number = 0;

    /** y间隔 */
    @property(cc.Float)
    spacingY: number = 0;

    /** 实例化格子个数 */
    @property(cc.Float)
    spawnCount: number = 0;

    private _content: cc.Node = null;
    private _items: cc.Node[] = [];
    private _updateTimer: number = 0;
    private _updateInterval: number = 0.05;
    private _lastContentPosY: number = 0;
    private _col: number = 0;
    private _row: number = 0;
    // private _itemListData: Item[] = [];
    private _itemListData = [];

    private _clickItemHandler: (item: BaseCell) => any = () => { }

    public onLoad() {
        this._content = this.node.getComponent(cc.ScrollView).content;
        this.initialize();
        this.createCell();
    }

    /** 初始化Item(通用，不要在onLoad及之前使用)  */
    public setItemInfo(data: any[]) {
        this._itemListData = data;
        this.initialize();
        this.hideAllCell();
        for (let i = 0; i < this._items.length; ++i) {
            let item = this._items[i].getComponent(BaseCell);
            if (item){
                let cellIndex = item.getIndex();
                cellIndex = cellIndex == -1 ? i : cellIndex;
                let itemData = {
                    index: cellIndex,
                    info: data[cellIndex]
                }
                item.setItemInfo(itemData);
                item.node.active = !!data[cellIndex];
            }else{
                console.error(`** [ScrollViewCom] BaseCell脚本或基类组件不存在 **`);
            }
        }
    }

    /** 初始化滑动面板 */
    private initialize() {
        let prefabInfo = this.itemPrefab.data;
        let itemCount = this._itemListData.length;
        this._col = Math.floor(this.node.width / (prefabInfo.width + this.spacingX));
        this._row = Math.ceil(itemCount / this._col);
        this._content.height = this._row * (prefabInfo.height + this.spacingY);
    }

    /** 创建格子 */
    private createCell() {
        let prefabInfo = this.itemPrefab.data;
        for (let i = 0; i < this.spawnCount; ++i) {
            let item = cc.instantiate(this.itemPrefab);
            this._content.addChild(item);
            let x = (-this.node.width * 0.5 + prefabInfo.width * 0.5) + (i % this._col * (prefabInfo.width + this.spacingX));
            let y = - item.height * 0.5 - (Math.floor(i / this._col) * (item.height + this.spacingY));
            item.setPosition(x, y);
            item.active = false;
            this._items.push(item);
        }
    }


    /** 设置点击格子回调 */
    public setClickItemHandler(cb: (itemCell: BaseCell) => any) {
        this._clickItemHandler = cb;
        for (let i = 0; i < this.spawnCount; ++i) {
            this._items[i].getComponent(this.itemPrefab.name).setClickHandler(this._clickItemHandler.bind(this));
        }
    }

    /** 设置滑动面板高度 */
    public setViewHeight(height: number) {
        this.node.height = height;
        let node = this.node.getChildByName("scrollBg");
        node.height = height;
        cc.find("view", this.node).height = height - 30;
    }

    public setViewBgOpacity(opacity: number) {
        let node = this.node.getChildByName("scrollBg");
        node.opacity = opacity;
    }
    // /** 设置格子数据 */
    // private setCellData(cellID: number, data: ItemCellData) {
    //     let cell = this._items[cellID];
    //     if (cell) {
    //         let cellInstance = cell.getComponent(ItemCell);
    //         cellInstance.initCell(data);
    //         cell.active = true;
    //     }
    // }


    private hideAllCell() {
        this._items.forEach((cell: cc.Node) => {
            cell.active = false;
        });
    }

    /** 获取格子在scrollview里的坐标 */
    private getPositionInView(item: cc.Node) {
        let wPos = item.parent.convertToWorldSpaceAR(item.position);
        let vPos = this.node.convertToNodeSpaceAR(wPos);
        return vPos;
    }

    update(dt: number) {
        this._updateTimer += dt;
        if (this._updateTimer < this._updateInterval) return;
        this._updateTimer = 0;
        let items = this._items;
        let scrollView = this.node.getComponent(cc.ScrollView);
        let isDown = Math.floor(scrollView.content.y) <= this._lastContentPosY;
        let offset = (this.itemPrefab.data.height + this.spacingY) * Math.ceil(this._items.length / this._col);

        for (let i = 0; i < items.length; ++i) {
            let item = items[i];
            let viewPos = this.getPositionInView(item);
            let itemIstance = item.getComponent(BaseCell);
            if (isDown) {
                if (viewPos.y < -this.node.height + (0.5 - this.node.anchorY) * this.node.height && item.y + offset <= 0) {
                    item.y = item.y + offset;
                    let cellIndex = itemIstance.getIndex() - items.length;
                    cellIndex = cellIndex <= 0 ? 0 : cellIndex;
                    let itemInfo = this._itemListData[cellIndex];
                    let itemData: any = {
                        index: cellIndex,
                    }
                    if (itemInfo) {
                        itemData = {
                            index: cellIndex,
                            info: itemInfo
                        }
                    }
                    itemIstance.setItemInfo(itemData);
                    item.active = itemInfo;
                }
            } else {
                if (viewPos.y > this.node.height + (0.5 - this.node.anchorY) * this.node.height && item.y - offset >= -scrollView.content.height) {
                    item.y = item.y - offset;
                    let cellIndex = itemIstance.getIndex() + items.length;
                    cellIndex = cellIndex <= 0 ? 0 : cellIndex;
                    let itemInfo = this._itemListData[cellIndex];
                    let itemData: any = {
                        index: cellIndex,
                    }
                    if (itemInfo) {
                        itemData = {
                            index: cellIndex,
                            info: itemInfo
                        }
                    }
                    itemIstance.setItemInfo(itemData);
                    item.active = itemInfo;
                }
            }
        }
        this._lastContentPosY = scrollView.content.y;
    }
}
