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

    retEveryTypeCount(_numArr) {
        let arr = new Array(3).fill(0);
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            switch (parseInt(i / 10)) {
                case 0: arr[0] += _numArr[i]; break;
                case 1: arr[1] += _numArr[i]; break;
                case 2: arr[2] += _numArr[i]; break;
            }
        }
        return arr;
    }

    retNumCard(_numArr, _Num) {
        let arr = [];
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            if (_numArr[i] >= _Num) {
                arr.push({ 'type': parseInt(i / 10), 'num': i % 10 + 1, amount: _numArr[i] });
                //0-8 10-18 20-28
            }
        }
        return arr;
    }

    retMaxJiao(_numArr) {
        let arr = this.retCanHuCard(_numArr), ScoreTypeArr = [];
        for (let i of arr) {
            let index = i.type * 10 + i.num - 1;
            _numArr[index]++;
            ScoreTypeArr.push(HuSys.ScoreList[this.specialCardType(_numArr).toString()].score);
            _numArr[index]--;
        }
        return Math.max(...ScoreTypeArr);
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
        }
        else if (this.pinghu(_numArr).result) {
        }
        else {

            result = false;
        }
        return result;
    }

    specialCardType(_numArr) {
        let str;
        let result = true;
        let isQ = this.qingyise(_numArr)
        //console.log(`isQ:${isQ}`)
        let isDaigen = this.Daigen(_numArr);
        if (this._7Dui(_numArr)) {
            if (isQ && isDaigen == 0)
                str = "qing7dui"//str = "胡牌了 是清7对";
            else if (isDaigen > 0 && isQ)
                str = "qinglong7dui" //str = "胡牌了 是清龙7对";
            else if (isDaigen > 0 && !isQ)
                str = "long7dui"//str = "胡牌了 是龙7对";
            else
                str = "qidui"// str = "胡牌了 是7对";
        }
        else if (this.pinghu(_numArr).result) {
            console.log(`牌数:${this.count(_numArr)}`)
            if (this.count(_numArr)) {
                if (this.pengpenghu(_numArr)) {
                    if (isQ)
                        str = "qingdui";// str = "胡牌了 是清对";
                    else if (this.jiangdui(_numArr))
                        str = "jiangdui" // str = "胡牌了 是将对";
                    else
                        str = "duiduihu"// str = "胡牌了 是对对胡";
                }
                else if (isQ) {
                    str = "qingyise"// str = "胡牌了 是清一色";
                }
                else if (this.yaojiu(_numArr)) {
                    if (isQ)
                        str = "qingyaojiupinghu"   //  str = "胡牌了 是青幺九平胡";
                    else
                        str = "yaojiupinghu"//  str = "胡牌了 是幺九平胡";
                }
                else
                    str = "pinghu"
            }
            else {
                console.log(`没来`)
                if (isQ) {
                    str = "qingyise"// str = "胡牌了 是清一色";
                }
                else 
                str = "pinghu" //str = "胡牌了 是平胡";
            }
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
                if (_numArr[i] > 0) num += _numArr[i];
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
        ////console.log('num:'+num)
        return num == 14;
    }//7对

    Daigen(_numArr) {
        let num = 0;
        for (let i = 0; i < _numArr.length; i++) {
            if (i % 10 == 9) continue;
            else {
                if (_numArr[i] == 4) num++;
            }
        }
        return num;
    }

    pengpenghu(_numArr) {
        let num = 0;
        for (let i = 0; i < _numArr.length; i++) {
            if (i != 0 && Number.isInteger(i / 9)) continue;
            else {
                if (_numArr[i] == 1 || _numArr[1] == 4) return false;
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
        let s = this.pinghu(_numArr);
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
        let s = this.pinghu(_numArr);
        if (s.result) {
            if (s.Jiang != null) {
                if (s.Jiang % 10 == 1 || s.Jiang % 10 == 4 || s.Jiang % 10 == 7) //1-4 11-14 21-14
                    for (let i = 0; i < s.combo.length; i++) {
                        for (let j = 0; j < s.combo[0].length; j++) {
                            if (s.combo[i][j] % 10 == 1 || s.combo[i][j] % 10 == 4 || s.combo[i][j] % 10 == 7) {
                                num[i] = 1;
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
            //if (i instanceof Card)
            this.numArr[i.type * 10 + i.num - 1]++;
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

    pinghu(_numArr) {
        let Jiang = this.findJiang();
        let s = { 'result': false, 'Jiang': null, 'combo': null };
        if (Jiang.length != 0) {
            for (let i = 0; i < Jiang.length; i++) {
                let _tonumArr = _numArr.slice(0);
                _tonumArr[Jiang[i]] -= 2;
                let sr = this.chaiPai(_tonumArr);
                ////console.log(sr)
                if (sr.result) {
                    s.Jiang = Jiang[i];
                    s.result = sr.result;
                    s.combo = sr.combo;
                    break;
                }
            }
            ////console.log('找到的将牌:' + Jiang);
        }
        ////console.log(s)
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
                case 1:
                    let Shun = this.findShun(_numArr, i);
                    if (Shun.length == 0)
                        return s
                    else {
                        ////console.log('找到的顺牌:' + Shun);
                        combo.push(Shun.slice(0))
                        this.spilit(_numArr, Shun, 1)
                    }
                    break;
                case 2: let duiShun = this.findDuiShun(_numArr, i);
                    if (duiShun.length == 0)
                        return s
                    else {
                        ////console.log('找到的对牌:' + duiShun);
                        combo.push(duiShun.slice(0))
                        combo.push(duiShun.slice(0))
                        this.spilit(_numArr, duiShun, 2)
                    }
                    break;
                case 3:
                    _numArr[i] -= 3;
                    combo.push(new Array(3).fill(i))
                    ////console.log('找到的刻牌:' + i);
                    break;
                case 4:
                    _numArr[i] -= 3;
                    combo.push(new Array(3).fill(i))
                    let Shun1 = this.findShun(_numArr, i)
                    if (Shun1.length == 0)
                        return s
                    else {
                        ////console.log('找到的顺牌:' + Shun);
                        combo.push(Shun1.slice(0))
                        this.spilit(_numArr, Shun1, 1)
                    }
                    break;
            }
        }
        result = this.ifNoCard(_numArr);
        if (result) {
            s.result = result
            s.combo = combo
            //console.log(combo);
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
        ////console.log(_numArr)
        for (var i = 0; i < _numArr.length; i++) {
            if (_numArr[i] > 0) {
                result = false;
            }
        }
        // //console.log('result:' + result)
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

HuSys.ScoreList = {
    qidui: { score: 4, text: "7对" },//3
    daigen1: { score: 2, text: "带1根" },//2
    daigen2: { score: 4, text: "带2根" },//3
    daigen3: { score: 8, text: "带3根" },//4
    long7dui: { score: 16, text: "龙7对" },//5
    qing7dui: { score: 16, text: "清7对" },//5
    qinglong7dui: { score: 32, text: "清龙7对" },//6
    qingdui: { score: 8, text: "清对" },//4
    jiangdui: { score: 8, text: "将对" },//4
    duiduihu: { score: 2, text: "对对胡" },//2
    qingyise: { score: 4, text: "清一色" },//3
    yaojiupinghu: { score: 4, text: "幺九平胡" },//3
    qingyaojiupinghu: { score: 16, text: "清幺九平胡" },//5
    pinghu: { score: 1, text: "平胡" },
    meihu: { score: 0, text: "没胡" },
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HuSys };
}