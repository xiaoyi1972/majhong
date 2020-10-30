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

class HuSys {
    constructor(_cards) {
        this.cards = _cards;
        this.numArr;
        this.encode();
    }

    reset(_cards) {
        this.cards = null;
        this.cards = _cards;
        this.encode();
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
        let result = true;
        if (this._7Dui(_numArr)) {
        }
        else if (this.pinghu().result) {
        }
        else {
            result = false;
        }
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
        return arr;
    }//找将

    pinghu() {
        let Jiang = this.findJiang();
        let s = { 'result': false, 'Jiang': null, 'combo': null };
        if (Jiang.length != 0) {
            for (let i = 0; i < Jiang.length; i++) {
                let _numArr = this.numArr.slice(0)
                _numArr[Jiang[i]] -= 2;
                let sr = this.chaiPai(_numArr);
                if (sr.result) {
                    s.Jiang = Jiang[i];
                    s.result = sr.result;
                    s.combo = sr.combo;
                    break;
                }
            }
        }
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
                        combo.push(Shun.slice(0))
                        this.spilit(_numArr, Shun, 1)
                    }
                    break;
                case 2: let duiShun = this.findDuiShun(_numArr, i);
                    if (duiShun.length == 0)
                        return s
                    else {
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
        for (var i = 0; i < _numArr.length; i++) {
            if (_numArr[i] > 0) {
                result = false;
            }
        }
        return result;
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

class Cards {
    constructor() {
        this.currentPile = [];
        this.discardPile = [];
        this.rand = new Random();
        this.amount = 108;
        this.discardArea = null;
        this.init();
    }
    init() {
        for (let type_i = 0; type_i < 3; type_i++)
            for (let repeat = 0; repeat < 4; repeat++)
                for (let num_i = 1; num_i < 10; num_i++) {
                    this.currentPile.push(new Card(type_i, num_i, this.currentPile.length));
                }
    }
    delete(_card) {
        this.discardPile.push(_card)
    }
    deleteBy(arr) {
        for (let i_card of arr) {
            let index = this.currentPile.findIndex(((value) => {
                return value.type == i_card.type && value.num == i_card.num;
            }))
            if (index != -1) {
                this.currentPile.splice(index, 1)
            }
        }
    }
    getCard(_player) {
        let x = Math.floor(parseInt(this.rand.random() * this.currentPile.length));
        //let x = Math.floor(this.rand.random() * this.currentPile.length);
        let thisCard = this.currentPile.splice(x, 1);
        return thisCard[0];
    }
}

class Card {
    constructor(_type, _num, _id = -1) {
        this.type = _type;//0:条 1:万 2:筒
        this.num = _num;//1-9
        this.Container = null;
        this.id = _id;
    }
}


class Player {
    constructor(_game) {
        this.name;
        this.baseMultipe = 1;
        this.handCards = [];
        this.cardUI = null;
        this.cards;
        this.hu = new HuSys(this.handCards)
        this.game = _game;
        this.pengTimer = null;
        this.pengCards = [];
        this.gangCards = [];
        this.huCards = [];
        this.pengCardsExist = [];
        this.relatedEvent = null;
        this.canDC = false
        this.huState = false;
        this.huType = "meihu";
        this.outCardsNum = 0;
        this.firstCardType = -1;
        this.daque = false;
        this.direction = -1;//下 0 左 1 上 2 右 3
        this.showOthersArea = null;
        this.showOthersAreaCards = [];//展示给其他人的牌面
        this.botResponse = true;
        this.canPGH = 0;
    }

    CardsTo() {
        let str = "";
        for (let i of this.handCards) {
            str += this.CardTo(i);
            str += '\\'
        }
        return str;
    }

    CardTo(_card) {
        if (_card instanceof Card) {
            return `t${_card.type}n${_card.num}`;
        }
    }

    add(_card) {
        this.handCards.push(_card)
    }

    click = (_card) => {
        if (!this.canDC || this.canPGH) return
        if (_card.type != this.firstCardType && !this.daque) return
        if (this.game.presentEvent != null)
            this.game.presentEvent.handled = true;
        this.blank();
        let index = this.handCards.indexOf(_card);
        this.out(index, 1, this.cards);
        this.sortCard();
    }

    out(pos, num, _cards) {
        let arr = this.handCards.splice(pos, num);
        this.outCardsNum++;
        let e = new GameEvent(null, "dachupai", arr, this, true)
        this.game.insertEndOf(this.game.presentEvent, e);
    }

    sortCard() {
        this.updataStateCardResponse()
        this.handCards.sort(function (a, b) {
            if (a.type != b.type)
                return -(b.type - a.type);
            else
                return -(b.num - a.num);
        });
    }

    moPai = () => {
        let _card = this.cards.getCard(this);
        if (_card == null) {
            return -1;
        }
        /* if (this.name == "甲") {
             _card.type = 1;
             _card.num = 6;
         }*/

        this.handCards.push(_card);
        this.filterCardsCanOutStyle(1);

        if (this.checkPGH(_card)) {
            let e = new GameEvent({
                run: () => { this.ResponsePGH(_card, e); },
                outTime: () => { this.defaultOutTimeFunc('pgh'); }
            },
                "needPGH", null, this);
            this.game.insertFrontOf(this.game.presentEvent, e);
        }
        else {
            let e = new GameEvent({
                run: () => { },
                outTime: () => {
                    this.defaultOutTimeFunc('xydcp');
                }
            },
                "xydcp", null, this);
            this.game.insertEndOf(this.game.presentEvent, e);
        }
    }

    filterCardsCanOutStyle = (typeSwitch = 1) => {
        if (typeSwitch == 0) {
        }
        else if (typeSwitch == 1) {
            let a = this.handCards.filter((card) => {
                return card.type == this.firstCardType;
            })
            if (a.length != 0) {
                this.daque = false;
            }
            else {
                this.daque = true;
            }
        }
    }

    addFull(_cards) {
        for (let i = 0; i < 13; i++) {
            let Rcards = _cards.getCard(this);
            this.add(Rcards);
        }
        this.updataStateCardResponse();
    }

    huClick = () => {
        this.blank();
        this.canPGH = 0;
        this.huCall(this.readyPGHCard);
        this.sortCard();
        let nextEvent = this.game.events[1];
        if (nextEvent.str == "xydcp" && nextEvent.obj == this) {
            this.game.events.splice(1, 1)
        }
        this.game.presentEvent.handled = true;
        this.readyPGHCard = null;
        this.huState = true;
        this.game.HuPlayers.push(this);
        this.game.changeToNextPlayerTurn(this);
        this.game.ifGameEnd()
    }

    pengClick = () => {
        this.blank();
        this.canPGH = 0;
        this.pengCall(this.readyPGHCard);
        this.game.presentEvent.handled = true;
        this.readyPGHCard = null;

        let e = new GameEvent({
            run: () => {
                this.game.changeToNextPlayerTurn(this);
                this.needOutAcard_(e);
            },
            outTime: () => {
                this.defaultOutTimeFunc('xydcp');
            }
        },
            "xydcp", null, this);
        this.game.insertEndOf(this.game.presentEvent, e);
    }

    gangClick = () => {
        this.blank();
        this.canPGH = 0;
        this.gangCall(this.readyPGHCard);
        this.game.presentEvent.handled = true;
        this.readyPGHCard = null;
        if (this.canDC)
            this.moPai();
        this.sortCard();
        this.game.changeToNextPlayerTurn(this);
    }

    cancelClick = () => {
        this.blank();
        this.canPGH = 0;
        this.game.presentEvent.handled = true;
        this.readyPGHCard = null;
        if (this.canDC) {
            let e = new GameEvent({
                run: () => { },
                outTime: () => {
                    this.defaultOutTimeFunc('xydcp');
                }
            },
                "xydcp", null, this);
            this.game.insertEndOf(this.game.presentEvent, e);
        }
    }

    huCall = (_card) => {
        let index = this.handCards.findIndex((x) => {
            return x == _card
        });
        if (index != -1) {
            this.handCards.splice(index, 1)
        }
        this.handCards.push(_card);
        this.hu.reset(this.handCards);
        this.huType = this.hu.specialCardType(this.hu.numArr)
    }

    gangCall = (_card) => {
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let index = this.handCards.findIndex((x) => {
                return x.type == _card.type && x.num == _card.num;
            });
            if (index != -1) {
                let reCard = this.handCards.splice(index, 1)[0];
                arr.push(reCard);
            }
        }
        if (arr.length == 1) {
            for (let i = 0, len = this.pengCardsExist.length; i < len; i++) {
                let nCard = this.pengCardsExist[i][1];
                if (nCard.type == _card.type && nCard.num == _card.num) {
                    this.pengCardsExist[i].push(_card)
                    break;
                }
            }
        }
        else if (arr.length == 3) {
            arr.push(_card);
            this.pengCardsExist.push(arr);
        }
        else if (arr.length == 4) {
            this.pengCardsExist.push(arr);
        }
        this.sortCard();
    }

    pengCall = (_card) => {
        let arr = [];
        for (let i = 0; i < 2; i++) {
            let index = this.handCards.findIndex((x) => {
                return x.type == _card.type && x.num == _card.num;
            });
            let reCard = this.handCards.splice(index, 1)[0];
            arr.push(reCard);
        }
        arr.push(_card);
        this.pengCardsExist.push(arr);
        this.sortCard();
    }

    ResponsePGH = (_card) => {
        this.readyPGHCard = _card;
    }

    SelectDq = () => {
    }

    defaultOutTimeFunc(_str) {
        if (_str == "pgh") {
            if (this.botResponse) {
                if (this.canPGH & Player.pghType.h)
                    this.huClick();
                else if (this.canPGH & Player.pghType.g)
                    this.gangClick();
                else if (this.canPGH & Player.pghType.p)
                    this.pengClick();
            }
            else
                this.cardUI.responseDiv.style.visibility = 'hidden';
        }
        else if (_str == "xydcp") {
            let a;
            if (this.daque)
                a = this.handCards.filter((card) => {
                    return card.type != this.firstCardType;
                })
            else
                a = this.handCards.filter((card) => {
                    return card.type == this.firstCardType;
                })
            let outCard = a[0];
            this.click(outCard);
        }
        else if (_str == "dq") {
            // let num = Math.floor(Math.random() * 3 + 1);
            let num = Math.floor(parseInt(this.cards.rand.random() * 3) + 1)
            /*if (this.name == "甲")
                this.DqTiaoClick();
            else*/
            switch (num % 3) {
                case 0: this.DqWanClick(); break;
                case 1: this.DqTiaoClick(); break;
                case 2: this.DqTongClick(); break;
            }
        }
    }

    checkPGH = (_card) => {
        let count = 0;
        //碰
        let Pengchoice = this.pengCards.filter(item => {
            return (item.type == _card.type && item.num == _card.num);
        });
        //杠
        let Gangchoice = this.gangCards.filter(item => {
            return (item.type == _card.type && item.num == _card.num);
        });
        let GangchoiceFromExistPeng = 0;
        for (let i = 0, len = this.pengCardsExist.length; i < len; i++) {
            let nCard = this.pengCardsExist[i][0];
            if (nCard.type == _card.type && nCard.num == _card.num && this.pengCardsExist[i].length == 3) {
                GangchoiceFromExistPeng = 1;
                break;
            }
        }
        let Huchoice = this.huCards.filter(item => {
            return (item.type == _card.type && item.num == _card.num);
        });

        if (!this.canDC) {
            if (Pengchoice.length > 0) {
                count++;
                this.canPGH |= Player.pghType.p;
            }
            else {
                this.canPGH &= ~(Player.pghType.p);
            }
        }
        if (Gangchoice.length > 0 || (GangchoiceFromExistPeng && this.canDC)) {
            count++;
            this.canPGH |= Player.pghType.g;
        }
        else {
            this.canPGH &= ~(Player.pghType.g);
        }
        if (Huchoice.length > 0) {
            count++;
            this.canPGH |= Player.pghType.h;
        }
        else {
            this.canPGH &= ~(Player.pghType.h);
        }
        if (count > 0)
            return true;
        else {
            this.canPGH = 0;
            return false;
        }
    }

    needOutAcard(_e) {
        if (this.moPai() == -1) {
            _e.handled = true;
            _e.func.outTime = () => { };
            _e.handled = true;
            this.game.events.length = 0;
            this.game.push(new GameEvent(() => { }, "noRemainCard", null, null, true));
        }
        else {
            _e.handled = true;
        }
    }

    needOutAcard_(_e) {
        this.filterCardsCanOutStyle(1);
    }

    updateHuCards() {
        this.hu.reset(this.handCards);
        this.huCards = this.hu.retCanHuCard(this.hu.numArr)
    }

    updatePengCards() {
        this.hu.reset(this.handCards);
        let arr = this.hu.retNumCard(this.hu.numArr, 2);
        arr.forEach(item => {
            if (item.type != this.firstCardType)
                this.pengCards.push(new Card(item.type, item.num));
        })
    }

    updateGangCards() {
        this.hu.reset(this.handCards);
        let arr = this.hu.retNumCard(this.hu.numArr, 3);
        arr.forEach(item => {
            if (item.type != this.firstCardType)
                this.gangCards.push(new Card(item.type, item.num));
        })
    }

    updataStateCardResponse() {
        this.huCards.length = 0
        this.pengCards.length = 0
        this.gangCards.length = 0
        this.updateHuCards()
        this.updatePengCards()
        this.updateGangCards()
    }

    blank() {
    }

    DqWanClick = () => {
        this.firstCardType = 1
        this.blank();
        this.game.presentEvent.handled = true;
    }

    DqTiaoClick = () => {
        this.firstCardType = 0
        this.blank();
        this.game.presentEvent.handled = true;
    }

    DqTongClick = () => {
        this.firstCardType = 2
        this.blank();
        this.game.presentEvent.handled = true;
    }
}
Player.pghType = { p: 1, g: 2, h: 4 };


class Game {
    constructor(_num = 0) {
        this.cards = new Cards();
        this.players = [];
        //this.init(_num);
        this.events = [];
        this.eventHandle;
        this.turn = 0;
        this.timeLimit = -1;
        this.lastTime;
        this.nowTime;
        this.HuPlayers = [];
        this.playersNum = _num;
        this.eventId = -1;
        this.taskQueue = new Map();
    }
    set presentEvent(e) {
        this.events[0] = e;
    }

    get presentEvent() {
        return this.events[0];
    }


    initData() {
        this.cards = new Cards();
        this.players = [];
        this.init(this.playersNum);
        this.events = [];
        this.eventHandle;
        this.turn = 0;
        this.timeLimit = -1;
        this.lastTime;
        this.nowTime;
        this.HuPlayers = [];
        this.eventId = -1;
        this.taskQueue = new Map();
    }

    init(_num) {
        for (let i = 0; i < _num; i++)
            this.add()
    }

    add() {
        let player = new Player(this);
        player.cards = this.cards;
        this.players.push(player)
    }

    start() {
        for (let i of this.players) {
            if (i instanceof Player)
                i.addFull(game.cards);
        }
    }

    restart() {
        clearTimeout(this.eventHandle)
        this.cards = null;
        this.events.length = 0;
        for (let player of this.players) {
            player = null;
        }
        this.initData();
    }


    showResult() {
        let str = "";
        for (let player of this.players) {
            //  player.showHandCards();
            /*str += `玩家:${player.name} 
            胡牌类型:<span style="color:blue">${ScoreList[player.huType.toString()].text}</span> 
            得分:<span style="color:red">${ScoreList[player.huType.toString()].score}</span><br>`;*/
        }
    }

    ifGameEnd() {
        let gameover = this.HuPlayers.length == (this.players.length - 1)
        if (gameover) {
            this.events.length = 0;
            this.showResult();
        }
    }

    changeToNextPlayerTurn(_player) {
        for (let i = 0, len = this.players.length; i < len; i++)
            this.players[i].canDC = false;
        _player.canDC = true;
        this.turn = this.players.indexOf(_player);
        do {
            this.turn = (this.turn + 1) % this.players.length;
        } while (this.players[this.turn].huState == true)
    }

    letAction() {
        let player = this.players[this.turn];
        for (let i = 0, len = this.players.length; i < len; i++)
            this.players[i].canDC = false;
        player.canDC = true;

        do {
            this.turn = (this.turn + 1) % this.players.length;
        } while (this.players[this.turn].huState == true)

        let e = new GameEvent({
            run: () => { player.needOutAcard(e); },
            outTime: () => {
            }
        },
            "mp", null, player);
        this.push(e);
        this.push(new GameEvent(() => { this.letAction(); }, "letAction", null, null, true));
        console.log("触发了letAction")
    }

    askForCard_(players, _card, _event) {
        for (let player of players) {
            player.ResponsePGH(_card);
            let e = new GameEvent({
                run: () => { },
                outTime: () => { player.defaultOutTimeFunc('pgh'); }
            },
                "needPGH", null, player);
            this.insertFrontOf(this.presentEvent, e);
        }
    }

    askForDqSelect(players) {
        for (let player of players) {
            let e = new GameEvent({
                run: () => { player.SelectDq(); },
                outTime: () => { player.defaultOutTimeFunc('dq'); }
            },
                "PlayerDqSelect", null, player);
            this.push(e);
        }
    }

    gameToOper = (_id, _oper, _args) => {
        let player = this.players[_id];
        if (_oper == "SelectDaque") {
            console.log("选择了打缺:" + (_args == 0 ? '万' : (_args == 1 ? '条' : '万')))
            switch (_args) {
                case 0: player.DqWanClick(); break;
                case 1: player.DqTiaoClick(); break;
                case 2: player.DqTongClick(); break;
            }
        }
        else if (_oper == "OutCard") {
            console.log(`打出了牌 玩家_id:${_id} 牌的id:${_args}`)
            let card = player.handCards.find(item => {
                return item.id == _args;
            });
            console.log(card)
            player.click(card);
        }
        else if (_oper == "SelectOper") {
            let arr = ["胡", "碰", "杠", "取消"]
            console.log(`来了 ${arr[_args]}`)
            switch (_args) {
                case 0: player.huClick(); break;
                case 1: player.pengClick(); break;
                case 2: player.gangClick(); break;
                case 3: player.cancelClick(); break;
            }
        }
    }

    eventLoop = () => {
        let overtime = false;
        if (this.events.length != 0) {
            let e = this.events[0];
            let otherHandle = this.taskQueue.get(e.eventId)
            if (otherHandle != undefined)
                this.gameToOper(otherHandle.player, otherHandle.oper, otherHandle.args)
            if (e.handled) {
                this.events.splice(0, 1);
            }
            if (this.lastTime == null)
                this.lastTime = new Date();
            let a = new Date();
            let deltaTime = (a.getTime() - this.lastTime.getTime()) / 1000;
            // //console.log(deltaTime)
            //if (e.obj != this.players[0] || 1) overtime = true;
            //else 
            if (deltaTime >= this.timeLimit && this.timeLimit != -1) overtime = true;

            if (e instanceof GameEvent) {
                if (e.str == "dachupai") {
                    let players = this.players.filter(item => {
                        return (item != e.obj && item.checkPGH(e.ret[0]) && item.huState == false);
                    })
                    this.askForCard_(players, e.ret[0], e);
                }
                else if (e.str == "needPGH") {
                    if (e.func.run != null) {
                        e.func.run();
                        e.func.run = null;
                    }
                }
                else if (e.str == "xydcp" || e.str == "mp") {
                    if (e.func.run != null) {
                        e.func.run();
                        e.func.run = null;
                    }
                }
                else if (e.str == "letAction") {
                    if (e.func != null) e.func();
                }
                else if (e.str == "noRemainCard") {
                    this.showResult()
                    if (e.func != null) e.func();
                }
                else if (e.str == "DqSelect") {
                    this.askForDqSelect(this.players);
                }
                else if (e.str == "PlayerDqSelect") {
                    if (e.func.run != null) {
                        e.func.run();
                        e.func.run = null;
                    }
                }
                if (overtime) {
                    console.log("超时")
                    this.lastTime = null;
                    e.handled = true;
                    if (e.func != null) {
                        if (e.func.outTime != null) {//超时执行默认函数
                            e.func.outTime();
                            e.func.outTime = null;
                        }
                    }
                }
            }
        }
        this.eventHandle = setTimeout(this.eventLoop, 1);
    }

    push(e) {
        if (e instanceof GameEvent) {
            this.eventId++;
            e.eventId = this.eventId;
            this.events.push(e);
        }
    }

    insertEndOf(_nowE, _e) {
        if (_e instanceof GameEvent && _nowE instanceof GameEvent) {
            let index = this.events.indexOf(_nowE);
            this.eventId++;
            _e.eventId = this.eventId;
            this.events.splice(index + 1, 0, _e);
        }
    }

    insertFrontOf(_nowE, _e) {
        if (_e instanceof GameEvent && _nowE instanceof GameEvent) {
            let index = this.events.indexOf(_nowE);
            this.eventId++;
            _e.eventId = this.eventId;
            this.events.splice(index, 0, _e);
        }
    }
}

class GameEvent {
    constructor(_func = null, _str = "", _ret = null, _obj = null, _handled = false) {
        this.func = _func;
        this.str = _str;
        this.ret = _ret;
        this.obj = _obj;
        this.handled = _handled;
        this.eventId = -1;
    }
}

let cardm = {//条 //万 //筒
    1: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 3, 0, 0, 0, 0, 0], [0, 3, 0, 0, 0, 2, 0, 0, 3]],
    2: [[3, 3, 3, 3, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    3: [[1, 1, 1, 0, 0, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 1, 1, 3], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    4: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 2, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 2, 0, 2, 0, 2, 1]],
    5: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [4, 0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 2, 0, 2, 0, 2, 2]],
    6: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [3, 3, 0, 3, 0, 2, 0, 0, 3], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    7: [[0, 3, 0, 0, 0, 0, 0, 0, 0], [0, 3, 0, 0, 3, 0, 0, 3, 0], [0, 0, 0, 0, 2, 0, 0, 0, 0]],
    8: [[1, 1, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 2, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0]],
    9: [[3, 1, 1, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 2, 0, 0, 0, 0], [1, 1, 1, 1, 1, 0, 0, 0, 0]],
    10: [[1, 2, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0, 1, 1, 1], [2, 2, 0, 0, 0, 0, 0, 0, 0]],
    12: [[1, 2, 2, 1, 1, 1, 1, 0, 0], [1, 1, 1, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    11: [[2, 3, 3, 3, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    12: [[0, 2, 2, 2, 1, 1, 1, 1, 3], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    13: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 3, 1, 1, 1, 2, 2, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
    14: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [4, 4, 4, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
}

function testCard(_player, cards) {
    //console.log(cards)
    for (let i = 0; i < cards.length; i++)
        for (let j = 0; j < cards[0].length; j++) {
            for (let m = 0; m < cards[i][j]; m++) {
                if (cards[i][j] != 0)
                    _player.add(new Card(i, j + 1))
            }
        }
    _player.cards.deleteBy(_player.handCards)
}

function start(_game) {
    _game.players.forEach((player) => {
        player.addFull(game.cards);
        player.sortCard();
    })
    /* game.eventLoop();
     game.push(new GameEvent(() => { }, 'DqSelect', null, null, true));
     game.push(new GameEvent(() => { game.letAction() }, 'letAction', null, null, true));*/
}



module.exports = { Game, GameEvent };
//module.exports = GameEvent;
