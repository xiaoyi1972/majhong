class HuSys {
    constructor(_cards) {
        this.cards = _cards;
        this.numArr;
        this.encode();
        //this.msgDiv = this.initMsgDiv();
    }

    reset(_cards) {
        this.cards = null;
        this.cards = _cards;
        this.encode();
    }

    initMsgDiv() {
        var div = document.createElement('div')
        div.classList.add('huMsg');
        document.body.appendChild(div);
        return div;
    }

    retNumCard(_numArr, _Num) {
        let arr = [];
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            if (_numArr[i] >= _Num) {
                arr.push({ 'type': parseInt(i / 10), 'num': i % 10 + 1 }); //0-8 10-18 20-28
            }
        }
        return arr;
    }

    retCanHuCard(_numArr) {
        let arr = [];
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            _numArr[i]++;
            if (this.isHu(_numArr))
                arr.push({ 'type': parseInt(i / 10), 'num': i % 10 + 1 });
            _numArr[i]--;
        }
        return arr;
    }

    isHu(_numArr) {
        //let str;
        let result = true;

        if (this._7Dui(_numArr)) {
            /*if (this._7DuiQing(_numArr))
                str = "qing7dui"
            else
                str = "qidui"*/
        }
        else if (this.pinghu().result) {
            /*if (this.pengpenghu(_numArr)) {
                if (this.qingyise(_numArr))
                    str = "qingdui";
                else if (this.jiangdui(_numArr))
                    str = "jiangdui"
                else
                    str = "duiduihu"
            }
            else if (this.qingyise(_numArr)) {
                str = "qingyise"
            }
            else if (this.yaojiu(_numArr)) {
                str = "yaojiupinghu"
            }
            else
                str = "pinghu"*/
        }
        else {
            // str = "meihu"
            result = false;
        }
        // this.msgDiv.innerHTML = ScoreList[str.toString()].text;
        return result;
    }

    specialCardType(_numArr) {
        let str;
        let result = true;


        if (this._7Dui(_numArr)) {
            if (this._7DuiQing(_numArr))
                //str = "胡牌了 是清7对";
                str = "qing7dui"
            else
                // str = "胡牌了 是7对";
                str = "qidui"
        }
        else if (this.pinghu().result) {
            if (this.count(_numArr)) {
                if (this.pengpenghu(_numArr)) {
                    if (this.qingyise(_numArr))
                        // str = "胡牌了 是清对";
                        str = "qingdui";
                    else if (this.jiangdui(_numArr))
                        // str = "胡牌了 是将对";
                        str = "jiangdui"
                    else
                        // str = "胡牌了 是对对胡";
                        str = "duiduihu"
                }
                else if (this.qingyise(_numArr)) {
                    // str = "胡牌了 是清一色";
                    str = "qingyise"
                }
                else if (this.yaojiu(_numArr)) {
                    //  str = "胡牌了 是幺九平胡";
                    str = "yaojiupinghu"
                }
            }
            else
                //str = "胡牌了 是平胡";
                str = "pinghu"
        }
        else {
            // str = "没胡牌";
            str = "meihu"
            result = false;
        }
       // this.msgDiv.innerHTML = ScoreList[str.toString()].text;
        return str;
    }

    count(_numArr) {
        let num = 0;
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            else {
                if (_numArr[i] > 0) num++;
            }
        }
        return num == 14;
    }

    _7Dui(_numArr) {
        let num = 0;
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            else {
                if (_numArr[i] == 1 || _numArr[i] == 3) return false
                else num += _numArr[i];
            }
        }
        //console.log('num:'+num)
        return num == 14;
    }//7对

    _7DuiQing(_numArr) {
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            else {
                if (_numArr[i] == 4) return true
            }
        }
        return false
    }

    pengpenghu(_numArr) {
        let num = 0;
        for (let i = 0; i < _numArr.length; i++) {
            if (i != 0 && Number.isInteger(i / 9)) continue;
            else {
                if (_numArr[i] == 1 || _numArr[1] == 4) return false
                if (_numArr[i] == 2) num++;
            }
        }
        return num == 1;
    }//碰碰胡

    qingyise(_numArr) {
        let num = new Array(3).fill(0);
        for (let i = 0; i < _numArr.length; i++) {
            if (i != 0 && Number.isInteger(i / 9)) continue;
            else {
                if (_numArr[i] > 0) {
                    let type = parseInt(i / 9)
                    num[type] = 1
                }
            }
        }
        return (num[0] + num[1] + num[2] == 1);
    }//清一色

    yaojiu(_numArr) {
        let num = new Array(4).fill(0);
        let s = this.pinghu();
        if (s.result) {
            if (s.Jiang != null) {
                if (s.Jiang % 10 == 0 || s.Jiang % 10 == 8) //0-8 10-18 20-28
                    for (let i = 0; i < s.combo.length; i++) {
                        for (let j = 0; j < s.combo[0].length; j++) {
                            if (s.combo[i][j] % 10 == 0 || s.combo[i][j] % 10 == 8) {
                                num[i] = 1;
                                break;
                            }
                        }
                    }
                else return false
            }
        }
        else return false;
        return (num[0] + num[1] + num[2] + num[3] == 4);
    }//幺九

    jiangdui(_numArr) {
        let num = new Array(4).fill(0);
        let s = this.pinghu();
        if (s.result) {
            if (s.Jiang != null) {
                if (s.Jiang % 10 == 1 || s.Jiang % 10 == 4 || s.Jiang % 10 == 7) //1-4 11-14 21-14
                    for (let i = 0; i < s.combo.length; i++) {
                        for (let j = 0; j < s.combo[0].length; j++) {
                            if (s.combo[i][j] % 10 == 1 || s.combo[i][j] % 10 == 4 || s.combo[i][j] % 10 == 7) {
                                num[j] = 1;
                            }
                            else return false
                        }
                    }
                else return false
            }
        }
        else return false;
        return (num[0] + num[1] + num[2] + num[3] == 4);
    }//将对

    encode() {
        this.numArr = new Array(30).fill(0)
        for (let i of this.cards) {
            if (i instanceof Card)
                this.numArr[i.type * 10 + i.num - 1] = this.numArr[i.type * 10 + i.num - 1] + 1
        }
    }

    findJiang() {
        let arr = [];
        for (var i = 0; i < this.numArr.length; i++) {
            if (this.numArr[i] > 1) arr.push(i);
        }
        //document.write(arr);
        return arr;
    }//找将

    pinghu() {
        let Jiang = this.findJiang();
        let s = { 'result': false, 'Jiang': null, 'combo': null };
        if (Jiang.length != 0) {
            for (let i = 0; i < Jiang.length; i++) {
                let _numArr = this.numArr.slice(0);
                _numArr[Jiang[i]] -= 2;
                let sr = this.chaiPai(_numArr);
                //console.log(sr)
                if (sr.result) {
                    s.Jiang = Jiang[i];
                    s.result = sr.result;
                    s.combo = sr.combo;
                    break;
                }
            }
            //console.log('找到的将牌:' + Jiang);
        }
        //console.log(s)
        return s;
    }

    chaiPai(_numArr) {
        let result = false;
        let combo = [];
        let s = { 'result': false, 'combo': null };
        for (let i = 0; i < _numArr.length; i++) {
            if (i != 0 && i % 10 == 9) continue;
            switch (_numArr[i]) {
                case 0: break;
                case 1: let Shun = this.findShun(_numArr, i);
                    if (Shun.length == 0)
                        return s
                    else {
                        //console.log('找到的顺牌:' + Shun);
                        combo.push(Shun.slice(0))
                        this.spilit(_numArr, Shun, 1)
                    }
                    break;
                case 2: let duiShun = this.findDuiShun(_numArr, i);
                    if (duiShun.length == 0)
                        return s
                    else {
                        //console.log('找到的对牌:' + duiShun);
                        combo.push(duiShun.slice(0))
                        combo.push(duiShun.slice(0))
                        this.spilit(_numArr, duiShun, 2)
                    }
                    break;
                case 3:
                    _numArr[i] -= 3;
                    combo.push(new Array(3).fill(i))
                    //console.log('找到的刻牌:' + i);
                    break;
                case 4:
                    _numArr[i] -= 3;
                    combo.push(new Array(3).fill(i))
                    let Shun1 = this.findShun(_numArr, i)
                    if (Shun1.length == 0)
                        return s
                    break;
            }
        }
        result = this.ifNoCard(_numArr);
        if (result) {
            s.result = result
            s.combo = combo
            console.log(combo);
        }
        return s
    }//拆成顺牌和刻牌

    findShun(_numArr, _i) {
        var result = [];
        if (!(_i % 10 == 9) && (_i + 2) < 30) {
            if (_numArr[_i + 1] > 0 && _numArr[_i + 2] > 0) {
                result.push(_i);
                result.push(_i + 1);
                result.push(_i + 2);
            }
        }
        return result;
    }

    findDuiShun(_numArr, _i) {
        var result = [];
        if (!(_i % 10 == 9) && (_i + 2) < 30) {
            if (_numArr[_i + 1] > 1 && _numArr[_i + 2] > 1) {
                result.push(_i);
                result.push(_i + 1);
                result.push(_i + 2);
            }
        }
        return result;
    }

    spilit(_numArr, _arr, _delNum) {
        for (let i = 0; i < _arr.length; i++) {
            _numArr[_arr[i]] -= _delNum;
        }
    }

    ifNoCard(_numArr) {
        var result = true
        //console.log(_numArr)
        for (var i = 0; i < _numArr.length; i++) {
            if (_numArr[i] > 0) {
                result = false;
            }
        }
        // console.log('result:' + result)
        return result;
    }
}

let pubSub = {
    subs: [],
    subscribe(key, fn) { //订阅
        if (!this.subs[key]) {
            this.subs[key] = [];
        }
        this.subs[key].push(fn);
    },
    publish(...arg) {//发布
        let args = arg;
        let key = args.shift();
        let fns = this.subs[key];

        if (!fns || fns.length <= 0) return;

        for (let i = 0, len = fns.length; i < len; i++) {
            fns[i](args);
        }
    },
    unSubscribe(key) {
        delete this.subs[key]
    }
}

let ScoreList = {
    qing7dui: { score: 1, text: "清7对" },
    qingdui: { score: 1, text: "清对" },
    jiangdui: { score: 1, text: "将胡" },
    duiduihu: { score: 1, text: "对对胡" },
    qingyise: { score: 1, text: "清一色" },
    yaojiupinghu: { score: 1, text: "幺九平胡" },
    pinghu: { score: 1, text: "平胡" },
    meihu: { score: 0, text: "没胡" },
}