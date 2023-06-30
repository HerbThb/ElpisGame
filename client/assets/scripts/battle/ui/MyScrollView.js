cc.Class({
    extends: cc.Component,

    properties: {
        lastLine: -1,
        itemPool: [],
        compPool: [],
        itemPrefab: cc.Prefab,
        perLine: 1,
        gapX: 0,
        gapY: 0,
        maxShow: 3,
    },


    // onLoad() {
    //     this.init({
    //         length: 100
    //     }, (line) => {
    //         console.log(line);
    //     }, {
    //         itemPrefab: this.itemPrefab,
    //         className: cc.Label,
    //         gapX: 10,
    //         gapY: 10,
    //         perLine: 1,
    //     })
    // },
    /**
     * @param  {Array} datas//需要展示的数据
     * @param  {function} callback //滑动时的回调函数，把当前最底行的行数传进去
     * @param  {object} params //ui布局的各种参数
     */
    init(datas, params, callback) {
        this.datas = datas;
        this.datasLength = datas.length;
        this.callback = callback;
        this.itemPrefab = params.itemPrefab;
        this.className = params.className;
        // this.target = params.target;
        this.gapX = params.gapX ? params.gapX : 0;
        this.gapY = params.gapY ? params.gapY : 0;
        this.perLine = params.perLine ? params.perLine : 1;
        this.maxShow = params.maxShow ? params.maxShow : 10;
        this.srollview = this.getComponent(cc.ScrollView);
        // this.node.children[0].getComponent(cc.Mask).enabled = false;

        //生成可在mask内循环滚动的prefab
        var item = cc.instantiate(this.itemPrefab);

        this.startX = params.startX || params.startX === 0 ? params.startX : -item.width / 2;
        this.startY = params.startY || params.startY === 0 ? params.startY : item.height / 2;
        // this.itemPool[0] = item;
        this.itemWidth = item.width + this.gapX;
        this.itemHeight = item.height + this.gapY;
        this.itemLine = Math.ceil(this.srollview.node.height / this.itemHeight) + 1;
        this.itemCount = this.itemLine * this.perLine;
        if (this.maxShow) {
            this.srollview.content.height = this.itemHeight * this.maxShow;
        }
        else {
            this.maxLine = Math.ceil(this.datasLength / this.perLine);
            this.srollview.content.height = this.itemHeight * this.maxLine;
        }


        this.compPool = [];
        this.lastLine = -1;
        // var length = this.itemPool.length > this.datasLength ? this.itemPool.length : this.datasLength;
        // for (let i = 0; i < length; i++) {
        //     if (!this.datas[i]) {
        //         if (this.itemPool[i]) this.itemPool[i].active = false;
        //         continue;
        //     }

        //     if (!this.itemPool[i]) {
        //         this.itemPool[i] = cc.instantiate(this.itemPrefab);
        //     }

        //     item = this.itemPool[i];
        //     item.active = true;
        //     item.parent = this.srollview.content;
        //     var line = Math.floor(i / this.perLine);
        //     var rank = i % this.perLine;
        //     // item.line = line;
        //     item.x = rank * this.itemWidth + this.startX;
        //     item.y = -((this.itemHeight * line) + this.startY);

        //     this.compPool[i] = this.itemPool[i].getComponent(this.className);
        //     this.compPool[i].init(datas[i]);
        //     // this.compPool[i].setOnItemClick(this.target, this.compPool[i]);
        // }
        this.isInit = true;
        // this.onScrollView(false);
        return this.itemPool;
    },

    onScrollView(event) {

        var curScrollHeight = event ? this.srollview.getScrollOffset().y : 0;
        var startLine = Math.floor(curScrollHeight / this.itemHeight);
        if (startLine < 0) {
            startLine = 0;
        }
        if (startLine === this.lastLine) return;
        this.lastLine = startLine;
        var endLine = startLine + this.itemLine - 1;


        // console.log('startLine', startLine)
        var offset, finalLine, finalIndex, line;
        // var length = this.itemPool.length > this.datasLength ? this.itemPool.length : this.datasLength;
        var length = this.itemPool.length > this.datasLength ? this.itemPool.length : this.itemLine + this.maxShow;

        if(this.isInit ){
            for (let i = 0; i < length; i++) {
                let item = this.itemPool[i];
                line = this.maxShow ? Math.floor(i / this.maxShow) : Math.floor(i / this.perLine);
                if (!item) {
                    item = cc.instantiate(this.itemPrefab);
                    this.itemPool[i] = item;
                    item.active = true;
                    item.parent = this.srollview.content;
                    var line = Math.floor(i / this.perLine);
                    var rank = i % this.perLine;
                    item.x = rank * this.itemWidth + this.startX;
                    item.y = -((this.itemHeight * line) + this.startY);
                }

                if (!this.compPool[i]) {
                    this.compPool[i] = item.getComponent(this.className);
                    if (this.datas[i]) this.compPool[i].init(this.datas[i]);
                }

                item.active = this.datas[i] ? true : false;
            }
        }
        else{
            for (let i = startLine; i < endLine; i++) {
                let item = this.itemPool[i];
                line = this.maxShow ? Math.floor(i / this.maxShow) : Math.floor(i / this.perLine);
                if (this.datas[i]) item.getComponent(this.className).init(this.datas[i]);
            }
        }



        this.isInit = false;
    },

    scrollToRank(rank, time) {
        this.lastLine = -1;
        var offset = (rank - Math.floor(this.itemCount / 2)) * this.itemHeight
        this.srollview.scrollToOffset(cc.v2(0, offset), time)
        // setTimeout(() => {
        //     this.srollview.scrollToOffset(cc.v2(0, offset + 10), time)
        // }, (time + 0.1) * 1000)
    },


    refresh(datas) {
        this.datas = datas;
        this.datasLength = datas.length;

        if (this.maxShow) {
            this.srollview.content.height = this.itemHeight * this.maxShow;
        }
        else {
            this.maxLine = Math.ceil(this.datasLength / this.perLine);
            this.srollview.content.height = this.itemHeight * this.maxLine;
        }
        for (let i = 0; i < this.datasLength; i++) {
            if (this.compPool[i] && this.datas[i]) {
                this.compPool[i].init(this.datas[i]);
            }
        }

    }
});