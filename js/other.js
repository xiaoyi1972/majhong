Object.prototype.clone = function () {
    var root;
    (() => {
        // =============
        let x = this;
        const uniqueList = []; // 用来去重
        // =============
        // 循环数组
        if (x instanceof Array) {
            root = [];
        }
        else root = {};
        const loopList = [
            {
                parent: root,
                key: undefined,
                data: x,
            }
        ];

        while (loopList.length) {
            // 深度优先
            const node = loopList.pop();
            const parent = node.parent;
            const key = node.key;
            const data = node.data;
            var find = function (arr, item) {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].source === item) {
                        return arr[i];
                    }
                }

                return null;
            }
            // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
            let res = parent;
            if (typeof key !== 'undefined') {
                res = parent[key] = {};
            }

            // =============
            // 数据已经存在
            let uniqueData = find(uniqueList, data);
            if (uniqueData) {
                parent[key] = uniqueData.target;
                break; // 中断本次循环
            }

            // 数据不存在
            // 保存源数据，在拷贝数据中对应的引用
            uniqueList.push({
                source: data,
                target: res,
            });
            // =============

            for (let k in data) {
                if (data.hasOwnProperty(k)) {
                    if (typeof data[k] === 'object') {
                        // 下一次循环
                        loopList.push({
                            parent: res,
                            key: k,
                            data: data[k],
                        });
                    } else {
                        res[k] = data[k];
                    }
                }
            }
        }
    })()
    return root
}

class Random {
    constructor(_seed = Math.floor(new Date().getMilliseconds())) {
        this.setSeed(_seed)
    }
    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280.0;
    }
    setSeed(_seed) {
        this.seed = _seed
    }
};

class Events {
    constructor() {
        this.events = {};
    }
    addListeners(fn, callback) {
        this.events[fn] = events[fn] || [];
        this.events[fn].push(callback);
    }
    removeListeners(fn, callback) {
        this.events[fn] = this.events[fn].filter(item => {
            return item != callback;
        })
    }
    fireEvent(fn, param) {
        // var args = Array.prototype.slice.call(arguments, 0), me = this;
        if (events[fn]) {
            events[fn].forEach(item => {
                item.call(this, param);
            })
        }
    }
}

class Thread {
    constructor(_func) {
        this.func = _func;
        this.blob = null;
        this.script;
        this.handle = null;
    }
    start() {
        this.blob = new Blob(this.convert(this.func), { type: 'text/javascript' });
        this.script = window.URL.createObjectURL(this.blob);
        this.handle = new Worker(this.script);
    }
    end() {
        this.handle.terminate();
        this.blob = null;
        window.URL.revokeObjectURL(this.script);
        this.handle = null;
    }
    convert(foo) {
        return [foo.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]];
        //return [foo.toString()];
    }
}
