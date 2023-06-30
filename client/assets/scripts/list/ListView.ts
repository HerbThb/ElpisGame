const {ccclass, property} = cc._decorator;

@ccclass
export default class ListView extends cc.Component {
    /**列表选项 */
    @property(cc.Prefab)
    public item:cc.Prefab = null;

    /**列表选项类 */
    @property(cc.String)
    public itemClass:string = "";

    /**列表滚动容器 */
    @property(cc.ScrollView)
    public scrollView:cc.ScrollView = null;

    @property(cc.Node)
    public scrollcontent:cc.Node = null;

    /**列表项之间间隔 */
    @property(cc.Integer)
    public spacing:number = 0;

    /**是否是垂直显示 */
    @property(cc.Boolean)
    public isVertical:boolean = true;

    /**列表项实例数量 */
    private spawnCount:number = 0;
    /**距离scrollView中心点的距离，超过这个距离的item会被重置，一般设置为 scrollVIew.height/2 + item.heigt/2 + spaceing，因为这个距离item正好超出scrollView显示范围 */
    private bufferZone:number = 0;
    /**列表项总数 */
    public totalCount:number = 0;
    /**scrollView的内容容器 */
    private content:cc.Node = null;
    /**存放列表项实例的数组 */
    private items:Array<cc.Node> = [];
    /**刷新列表计时 */
    private updateTimer:number = 0;
    /**刷新列表间隔 */
    private updateInterval:number = 0;
    /**上一次content的Y值，用于和现在content的Y值比较，得出是向上还是向下滚动 */
    private lastContentPosY:number = 0;
    /**上一次content的X值，用于和现在content的X值比较，得出是向左还是向右滚动 */
    private lastContentPosX:number = 0;

    /**列表项数据 */
    private itemDataList:any = [];
    /**item的高度 */
    private itemHeight:number = 0;
     /**item的宽度 */
     private itemWidth:number = 0;

    onLoad() {
        //初始化
        this.content = this.scrollcontent;
        this.items = [];
        this.updateTimer = 0;
        this.updateInterval = 0.1;
        this.lastContentPosY = 0;
        this.lastContentPosX = 0;
        this.itemHeight = this.item.data.height;
        this.itemWidth = this.item.data.width;
        this.content.removeAllChildren();
        
        //计算创建的item实例数量，比当前scrollView容器能放下的item数量再加上2个
        if(this.isVertical) 
            this.spawnCount = Math.round(this.scrollView.node.height/( this.itemHeight + this.spacing)) + 2;
        else
            this.spawnCount = Math.round(this.scrollView.node.width /(this.itemWidth + this.spacing)) + 2;

        //计算bufferZone
        if(this.isVertical){
            this.bufferZone = this.scrollView.node.height / 2 +  this.itemHeight / 2 + this.spacing;
        }else{
            this.bufferZone = this.scrollView.node.width / 2 + this.itemWidth / 2 + this.spacing;
        }
        //暂停滚动
        this.enabled = false;
        this.scrollView.enabled = false;
    }

    /**
     * 设置item的数据
     * @example
     *   setData([{id:1,msg:"a"},{id:2,msg:"b"}])
     * @param itemDataList item数据列表
     */
    public setData(itemDataList:any){
        //复制item数据，如果item数据源改变，则需要重新setData一次来显示新数据
        this.itemDataList = itemDataList.slice();
        this.totalCount = this.itemDataList.length;
        this.createItem();
        //运行滚动
        this.enabled = true;
        this.scrollView.enabled = true;
    }
    
    /**创建item实例 */
    private createItem () {
        if(this.isVertical)
            this.content.height = this.totalCount * ( this.itemHeight + this.spacing) + this.spacing;
        else
            this.content.width = this.totalCount * (this.itemWidth + this.spacing) + this.spacing;

        this.clearAllItem();
        let len = this.totalCount < this.spawnCount?this.totalCount:this.spawnCount;
        for (let i = 0; i < len; i++) { // spawn items, we only need to do this once
            let item = cc.instantiate(this.item);
            this.content.addChild(item);
            if(this.isVertical)
                item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
            else
                item.setPosition(item.width * (0.5 + i) + (this.spacing * i), 0);

            item.getComponent(this.itemClass).updateItem(i, this.itemDataList[i]);
            this.items.push(item);
        }
    }

    /**清理item实例 */
    private clearAllItem(){
        for(let i=0,len=this.items.length;i<len;i++){
            let item = this.items[i];
            item.destroy();
        }
        this.items.length = 0;
    }
    
    /**获取item在scrollView的局部坐标 */
    private getPositionInView(item) { 
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }
 
    update(dt) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;
        let items = this.items;
        let buffer = this.bufferZone;
        if(this.isVertical){
            let isDown = this.content.y < this.lastContentPosY; // scrolling direction
            let offset = ( this.itemHeight + this.spacing) * items.length;
            for (let idx = 0; idx < items.length; ++idx) {
                let viewPos = this.getPositionInView(items[idx]);
                if (isDown) {
                    // if away from buffer zone and not reaching top of content
                    if (viewPos.y < -buffer && items[idx].y + offset < 0) {
                        //console.log("更新A前,items[i]:" + i +"viewPos.y:",viewPos.y,"buffer:" ,buffer,"items[i].y:", items[i].y,"offset:",offset,"this.content.height:",this.content.height);
                        items[idx].y = items[idx].y + offset;
                        let item = items[idx].getComponent(this.itemClass);
                        let itemId = item.itemID - items.length; // update item id
                        //item.updateItem(itemId);
                        if(itemId > this.itemDataList.length)
                            continue;
    
                        item.updateItem(itemId,this.itemDataList[itemId]);
                        //console.log("更新A后,tmpID:",item.tmplID,"itemId:" ,itemId,"viewPosY:", viewPos.y,"buffer:",buffer,"offset:",offset);
                    }
                } else {
                    // if away from buffer zone and not reaching bottom of content
                    if (viewPos.y > buffer && items[idx].y - offset > -this.content.height) {
                        //console.log("更新B前,items[i]:" + i +"viewPos.y:",viewPos.y,"buffer:" ,buffer,"items[i].y:", items[i].y,"offset:",offset,"this.content.height:",this.content.height);
                        items[idx].y = items[idx].y - offset;
                        let item = items[idx].getComponent(this.itemClass);
                        let itemId = item.itemID + items.length;
                        //item.updateItem(itemId);
                        if(itemId > this.itemDataList.length)
                            continue;
    
                        item.updateItem(itemId,this.itemDataList[itemId]);
                        //console.log("更新B后,tmpID:",item.tmplID,"itemId:" ,itemId,"viewPosY:", viewPos.y,"items[i].y:",items[i].y,"buffer:",buffer,"offset:",offset);
                    }
                }
            }
            // update lastContentPosY
            this.lastContentPosY = this.content.y;
        }else{
            // 向右移动
            let isLeft = this.content.x > this.lastContentPosX; // scrolling direction
            let offset = ( this.itemWidth + this.spacing) * items.length;
            for (let idx = 0; idx < items.length; ++idx) {
                let viewPos = this.getPositionInView(items[idx]);
                if (isLeft) {
                    if (viewPos.x > buffer && items[idx].x + offset > this.content.width) {
                        items[idx].x = items[idx].x - offset;
                        let item = items[idx].getComponent(this.itemClass);
                        let itemId = item.itemID - items.length;
                        if(itemId > this.itemDataList.length)
                            continue;
    
                        item.updateItem(itemId,this.itemDataList[itemId]);
                    }
                } else {
                    if(viewPos.x < -buffer && -items[idx].x - offset > -this.content.width){
                        items[idx].x = items[idx].x + offset;
                        let item = items[idx].getComponent(this.itemClass);
                        let itemId = item.itemID + items.length; 

                        if(itemId > this.itemDataList.length)
                            continue;
    
                        item.updateItem(itemId,this.itemDataList[itemId]);
                    }
                }
            }
            this.lastContentPosX = this.content.x;
        }
    }
    
    /**
     * 滚动到指定位置
     * @param vec2 位置
     */
    public scrollToFixedPosition (vec2:cc.Vec2) {
        this.scrollView.scrollToOffset(vec2, 2);
    }

    public scrollToTop () {
        this.scrollView.scrollToTop(0.2);
    }

    /**销毁 */
    public onDestroy(){
        
    }
}
