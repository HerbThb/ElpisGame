const { ccclass, property } = cc._decorator;

export interface BaseCellData {
    /** 编号 */
    index: number,
    /** 自定义数据 */
    info: any
}

@ccclass
export default class BaseCell extends cc.Component {
    /** id标识 */
    protected _ID: number = 0;
    /** 格子编号 */
    protected _index: number = -1;

    protected _clickHandler: (itemCell?: BaseCell) => any = () => { };


    setItemInfo(data: BaseCellData) {
        if (!data) return;
        this._index = data.index;
    }

    /** 获取格子编号 */
    getIndex() {
        return this._index;
    }

    /** id标识 */
    getItemID() {
        return this._ID;
    }

    /** 设置点击回调 */
    setClickHandler(cb: (itemCell?: BaseCell) => any) {
        this._clickHandler = cb;
    }

    onClickCell() {
        this._clickHandler(this);
    }
}
