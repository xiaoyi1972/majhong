/*let test = function () {
    let cardm = {//条 //万 //筒
        1: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 3, 0, 0, 0, 0, 0], [0, 3, 0, 0, 0, 2, 0, 0, 3]],
        2: [[1, 2, 2, 1, 1, 1, 1, 3, 2], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
        3: [[1, 1, 1, 0, 0, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 1, 1, 3], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
        4: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 2, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 2, 0, 2, 0, 2, 2]],
        5: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [4, 0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 2, 0, 2, 0, 2, 2]],
        6: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [3, 3, 0, 3, 0, 2, 0, 0, 3], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
        7: [[0, 3, 0, 0, 0, 0, 0, 0, 0], [0, 3, 0, 0, 3, 0, 0, 3, 0], [0, 0, 0, 0, 2, 0, 0, 0, 0]],
        8: [[1, 1, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 2, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0]]
    }

    let hu = new HuSys(game.players[0].handCards)
    function testCard(_player, cards) {
        for (let i = 0; i < cards.length; i++)
            for (let j = 0; j < cards[0].length; j++) {
                for (let m = 0; m < cards[i][j]; m++) {
                    if (cards[i][j] != 0)
                        _player.add(new Card(i, j+1))
                }
            }
    }
    testCard(game.players[0], cardm[8]);
    let hu1 = new HuSys(game.players[0].handCards)
    //console.log(hu1)
    hu1.specialCardType(hu1.numArr)
    let div = document.querySelector('.cardArea')
    let cardUI = new CardUI(div)
    cardUI.createNewCardDiv(cardUI.contain, 2, 1)
    cardUI.createNewCardDiv(cardUI.contain, 2, 2)
    cardUI.createNewCardDiv(cardUI.contain, 2, 3)
    cardUI.createNewCardDiv(cardUI.contain, 2, 4)
    cardUI.createNewCardDiv(cardUI.contain, 2, 5)
    cardUI.createNewCardDiv(cardUI.contain, 2, 6)
    cardUI.createNewCardDiv(cardUI.contain, 2, 7)
    cardUI.createNewCardDiv(cardUI.contain, 2, 8)
    cardUI.createNewCardDiv(cardUI.contain, 2, 9)
    cardUI.createNewCardDiv(cardUI.contain, 1, 2)
    cardUI.createNewCardDiv(cardUI.contain, 1, 2)
    cardUI.createNewCardDiv(cardUI.contain, 0, 5)
    cardUI.createNewCardDiv(cardUI.contain, 0, 5)
    cardUI.createNewCardDiv(cardUI.contain, 0, 5)
}*/

class Cards {
    constructor() {
        this.currentPile = [];
        this.discardPile = [];
        this.rand = new Random();
        this.amount = 108;
        this.init();
    }
    init() {
        for (let type_i = 0; type_i < 3; type_i++)
            for (let repeat = 0; repeat < 4; repeat++)
                for (let num_i = 1; num_i < 10; num_i++) {
                    this.currentPile.push(new Card(type_i, num_i, this.currentPile.length));
                }
    }
    getCard(_player) {
        let x = Math.floor(this.rand.random() * this.currentPile.length);
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
        this.outCardsNum = 0;
        this.firstCardType = -1;
        this.daque = false;
    }

    add(_card) {
        if (this.cardUI != null) {
            _card.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, _card.type, _card.num, this.handCards.length)
            _card.Container.addEventListener('click', () => { this.click(_card) })
        }
        this.handCards.push(_card)
    }

    click = (_card) => {
        if (!this.canDC) return
        if (_card.type != this.firstCardType && !this.daque) return
        if (this.game.presentEvent != null)
            this.game.presentEvent.handled = true;
        this.blank();
        let index = this.handCards.indexOf(_card);
        this.out(index, 1, this.cards);
        this.sortCard();
        _card.Container.classList.add('animeOut');
        _card.Container.addEventListener("animationend", () => {
            _card.Container.parentNode.removeChild(_card.Container);
            //this.moPai()
        });
    }

    out(pos, num, _cards) {
        let arr = this.handCards.splice(pos, num);
        this.outCardsNum++;
        if (this.outCardsNum == 1)
            this.firstCardType = arr[0].type;
        this.updataStateCardResponse()
        for (let i of arr)
            _cards.discardPile.push(i)
        this.filterCardsCanOutStyle(0);
        let e = new GameEvent(null, "dachupai", arr, this, true)
        this.game.insertEndOf(this.game.presentEvent, e);
        // this.game.push(new GameEvent(() => {this.game.letAction(); }, "letAction", null, null, true));
    }

    sortCard() {

        this.updataStateCardResponse()
        this.handCards.sort(function (a, b) {
            if (a.type != b.type)
                return -(b.type - a.type);
            else
                return -(b.num - a.num);
        });
        this.handCards.forEach((value, index) => {
            if (value.Container != null)
                value.Container.style.left = (index * 270 * 0.27) + 'px'
        })
    }

    moPai = () => {
        let _card = this.cards.getCard(this);
        if (_card == null) {
            return -1;
        }
        //_card.type = 0;
        //_card.num = 1;
        _card.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, _card.type, _card.num, this.handCards.length + 1)
        _card.Container.addEventListener('click', () => { this.click(_card) });
        this.handCards.push(_card);
        this.hu.reset(this.handCards)
        this.hu.encode();
        this.hu.specialCardType(this.hu.numArr);
        this.filterCardsCanOutStyle(1);

        if (this.checkPGH(_card)) {
            let e = new GameEvent({
                run: () => { this.ResponsePGH(_card, e); },
                outTime: () => { this.defaultOutTimeFunc('pgh'); }
            },
                "needPGH", null, this);
            this.game.insertFrontOf(this.game.presentEvent, e);
        }

    }

    filterCardsCanOutStyle = (typeSwitch = 1) => {
        if (typeSwitch == 0) {
            this.handCards.forEach((card) => {
                card.Container.classList.remove("ban");
            })
        }
        else if (typeSwitch == 1) {
            let a = this.handCards.filter((card) => {
                return card.type == this.firstCardType;
            })
            if (a.length != 0) {
                this.daque = false;
                this.handCards.forEach((card) => {
                    if (card.type != this.firstCardType)
                        card.Container.classList.add("ban");
                })
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

    ifpinghu() {
        let hu = false;
        return hu;
    }


    huClick = () => {
        this.blank();
        let _card = this.readyPGHCard;
        this.handCards.push(_card);
        _card.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, _card.type, _card.num, this.handCards.length)
        _card.Container.addEventListener('click', () => { this.click(_card) })
        this.sortCard();
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;
        this.huState = true;
        this.game.changeToNextPlayerTurn(this);
        alert('胡了')
    }

    pengClick = () => {
        //if (this.pengTimer != null)
        //    clearTimeout(this.pengTimer);
        this.blank();
        this.pengCall(this.readyPGHCard);
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;

        let e = new GameEvent({
            run: () => {
                this.game.changeToNextPlayerTurn(this);
                this.needOutAcard_(e);

                // this.game.letAction(); 
            },
            outTime: () => { //player.defaultOutTimeFunc('xydcp'); 
            }
        },
            "xydcp", null, this);
        this.game.insertEndOf(this.game.presentEvent, e);
        //console.log(this.game.events)
    }

    gangClick = () => {
        //if (this.pengTimer != null)
        //    clearTimeout(this.pengTimer);
        this.blank();
        this.gangCall(this.readyPGHCard);
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;

        this.moPai();
        this.sortCard();
        this.game.changeToNextPlayerTurn(this);

        /*let e = new GameEvent({
            run: () => {

                //this.game.changeToNextPlayerTurn(this);
                // this.needOutAcard_(e);

                // this.game.letAction(); 
            },
            outTime: () => { //player.defaultOutTimeFunc('xydcp'); 
            }
        },
            "xydcp", null, this);
        this.game.insertEndOf(this.game.presentEvent, e);*/


        //console.log(this.game.events)
    }

    cancelClick = () => {
        this.blank();
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;
    }

    huCall = (_card) => {
    }

    gangCall = (_card) => {
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let index = this.handCards.findIndex((x) => {
                return x.type == _card.type && x.num == _card.num;
            });
            //console.log(index)
            if (index != -1) {
                let reCard = this.handCards.splice(index, 1)[0];
                reCard.Container.parentNode.removeChild(reCard.Container);
                arr.push(reCard);
            }
        }

        if (arr.length == 1) {
            let indexCard;
            for (let i = 0, len = this.pengCardsExist.length; i < len; i++) {
                let nCard = this.pengCardsExist[i][1];
                if (nCard.type == _card.type && nCard.num == _card.num) {
                    indexCard = nCard;
                    this.pengCardsExist[i].push(_card)
                    break;
                }
            }

            let i = _card;
            i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + 0, 1)
            i.Container.style.left = indexCard.Container.style.left;
            i.Container.style.top = "-10px";
        }

        else if (arr.length == 3) {
            let len = this.pengCardsExist.length
            let divide = Math.floor(0.17 * 270 / 2)
            arr.forEach((i, index) => {
                i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + index, 1)
                if (len == 0)
                    i.Container.style.left = ((this.handCards.length + 1 + 2) * 270 * 0.27 + 0.17 * 270 * index) + 'px';
                else {
                    let front = this.pengCardsExist[0][0];
                    i.Container.style.left = (parseInt(front.Container.style.left) - (3 * len - index) * 0.17 * 270 - divide * len) + 'px';
                }
            })
            let i = _card;
            i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + 1, 1)
            i.Container.style.left = arr[1].Container.style.left;
            i.Container.style.top = "-10px";
            arr.push(_card);
            this.pengCardsExist.push(arr);
        }


        else if (arr.length == 4) {
            //console.log(4)
            let len = this.pengCardsExist.length
            let divide = Math.floor(0.17 * 270 / 2)
            let iCard;
            arr.forEach((i, index) => {

                if (index < 3) {
                    i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + index, 1)
                    if (len == 0)
                        i.Container.style.left = ((this.handCards.length + 1 + 2) * 270 * 0.27 + 0.17 * 270 * index) + 'px';
                    else {
                        let front = this.pengCardsExist[0][0];
                        i.Container.style.left = (parseInt(front.Container.style.left) - (3 * len - index) * 0.17 * 270 - divide * len) + 'px';
                    }
                }
                else if (index == 3) {
                    iCard = i
                }
            })
            //let i = _card;
            iCard.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, iCard.type, iCard.num, this.handCards.length + 1, 1)
            iCard.Container.style.left = arr[1].Container.style.left;
            iCard.Container.style.top = "-10px";
            this.pengCardsExist.push(arr);
        }


        //this.pengCards.push(arr);
        this.sortCard();
        //console.log(this.pengCards);
    }

    pengCall = (_card) => {
        let arr = [];
        for (let i = 0; i < 2; i++) {
            let index = this.handCards.findIndex((x) => {
                return x.type == _card.type && x.num == _card.num;
            });
            let reCard = this.handCards.splice(index, 1)[0];
            reCard.Container.parentNode.removeChild(reCard.Container);
            arr.push(reCard);
        }
        arr.push(_card);
        //console.log(arr)

        let len = this.pengCardsExist.length
        let divide = Math.floor(0.17 * 270 / 2)
        arr.forEach((i, index) => {

            i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + index, 1)
            if (len == 0)
                i.Container.style.left = ((this.handCards.length + 1) * 270 * 0.27 + 0.17 * 270 * index) + 'px';
            else {
                let front = this.pengCardsExist[0][0];
                i.Container.style.left = (parseInt(front.Container.style.left) - (3 * (len) - index) * 0.17 * 270 - divide * len) + 'px';
            }
        })
        this.pengCardsExist.push(arr);
        this.sortCard();
        //console.log(this.pengCards);
    }

    ResponsePGH = (_card, _e) => {
        console.log("来了老弟");
        this.cardUI.tipDiv.innerHTML = '请选择是否碰/杠/胡牌';
        //this.relatedEvent = _e; //响应的事件对象
        this.readyPGHCard = _card;
        this.cardUI.responseDiv.style.visibility = 'visible';
        // this.cardUI.responseDiv.style.display = 'none';
    }

    defaultOutTimeFunc(_str) {
        if (_str == "pgh") {
            this.cardUI.responseDiv.style.visibility = 'hidden';
        }
        else if (_str == "xydcp") {
            let outCard = this.handCards[this.handCards.length - 1];
            this.click(outCard);
        }
    }

    checkPGH = (_card) => {
        /*this.hu.encode();
        let arr = this.hu.retNumCard(this.hu.numArr, 2);
        //console.log(arr)
        let choice = arr.filter(item => {
            return (item.type == _card.type && item.num == _card.num);
        });*/
        let count = 0;
        //碰
        let Pengchoice = this.pengCards.filter(item => {
            return (item.type == _card.type && item.num == _card.num);
        });
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
                this.cardUI.pengDiv.style.display = 'inline-block';
                count++;
                //return true;
            }
            else {
                this.cardUI.pengDiv.style.display = 'none';
                //return false;
            }
        }
        if (Gangchoice.length > 0 || (GangchoiceFromExistPeng && this.canDC)) {
            this.cardUI.gangDiv.style.display = 'inline-block';
            count++;
            //return true;
        }
        else {
            this.cardUI.gangDiv.style.display = 'none';
            //return false;
        }
        if (Huchoice.length > 0) {
            this.cardUI.huDiv.style.display = 'inline-block';
            count++;
            //return true;
        }
        else {
            this.cardUI.huDiv.style.display = 'none';
            //return false;
        }
        //this.cardUI.cancelDiv.style.display = 'none';
        this.cardUI.cancelDiv.style.display = 'inline-block';
        if (count > 0)
            return true;
        else
            return false;
    }

    needOutAcard(_e) {
        // this.relatedEvent = _e; //响应的事件对象
        if (this.moPai() == -1) {
            _e.func.outTime = () => { };
            _e.handled = true;
            this.game.events.length = 0;
            this.game.push(new GameEvent(() => { alert("牌打完了") }, "noRemainCard", null, null, true));

        }
        else
            this.cardUI.tipDiv.innerHTML = '请打出一张牌';
    }

    needOutAcard_(_e) {
        // this.relatedEvent = _e; //响应的事件对象
        this.filterCardsCanOutStyle(1);
        this.cardUI.tipDiv.innerHTML = '请打出一张牌(非摸牌)';
    }

    updateHuCards() {
        this.huCards = this.hu.retCanHuCard(this.hu.numArr)
        //console.log(this.name, this.huCards)
    }

    updatePengCards() {
        this.hu.reset(this.handCards);
        //this.hu.encode();
        let arr = this.hu.retNumCard(this.hu.numArr, 2);
        arr.forEach(item => {
            this.pengCards.push(new Card(item.type, item.num));
        })
    }

    updateGangCards() {
        this.hu.reset(this.handCards);
        //this.hu.encode();
        let arr = this.hu.retNumCard(this.hu.numArr, 3);
        arr.forEach(item => {
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
        this.cardUI.tipDiv.innerHTML = '';
    }

    gang() {
        //console.log('询问当前玩家杠牌');
    }

    bindResponseButton = () => {
        this.cardUI.pengDiv.addEventListener('click', this.pengClick);
        this.cardUI.gangDiv.addEventListener('click', this.gangClick);
        this.cardUI.huDiv.addEventListener('click', this.huClick);
        this.cardUI.cancelDiv.addEventListener('click', this.cancelClick);
    }
}

class Game {
    constructor(_num = 0) {
        this.cards = new Cards();
        this.players = [];
        this.init(_num);
        this.events = [];
        this.eventHandle;
        this.turn = 0;
        this.timeLimit = -1;
        this.lastTime;
        this.nowTime;
    }
    set presentEvent(e) {
        this.events[0] = e;
    }

    get presentEvent() {
        return this.events[0];
    }

    init(_num) {
        for (let i = 0; i < _num; i++)
            this.add()
    }

    add() {
        this.players.push(new Player(this))
    }

    start() {
        for (let i of this.players) {
            if (i instanceof Player)
                i.addFull(game.cards);
        }
    }

    changeToNextPlayerTurn(_player) {
        //let player = this.players[this.turn];
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
        //player.moPai();
        for (let i = 0, len = this.players.length; i < len; i++)
            this.players[i].canDC = false;
        player.canDC = true;

        do {
            this.turn = (this.turn + 1) % this.players.length;
        } while (this.players[this.turn].huState == true)
        //this.turn = (this.turn + 1) % this.players.length;
        let e = new GameEvent({
            run: () => { player.needOutAcard(e); },
            outTime: () => {
                player.defaultOutTimeFunc('xydcp');
            }
        },
            "xydcp", null, player);
        this.push(e);
        this.push(new GameEvent(() => { this.letAction(); }, "letAction", null, null, true));
        console.log("触发了letAction")
    }

    askForCard_(players, _card, _event) {
        for (let player of players) {
            let e = new GameEvent({
                run: () => { player.ResponsePGH(_card, e); },
                outTime: () => { player.defaultOutTimeFunc('pgh'); }
            },
                "needPGH", null, player);
            this.insertEndOf(_event, e);
        }
        //this.push(new GameEvent(() => { this.letAction(); }, "letAction", null, null, true));
    }

    eventLoop = () => {
        let overtime = false;
        if (this.events.length != 0) {
            let e = this.events[0];
            if (e.handled) {
                this.events.splice(0, 1);
            }
            if (this.lastTime == null)
                this.lastTime = new Date();
            let a = new Date();
            let deltaTime = (a.getTime() - this.lastTime.getTime()) / 1000;
            // //console.log(deltaTime)
            if (deltaTime >= this.timeLimit && this.timeLimit != -1) overtime = true;

            if (e instanceof GameEvent) {
                if (e.str == "dachupai") {
                    let players = this.players.filter(item => {
                        return (item != e.obj && item.checkPGH(e.ret[0]));
                    })
                    this.askForCard_(players, e.ret[0], e);
                }
                else if (e.str == "needPGH") {
                    if (e.func.run != null) {
                        e.func.run();
                        e.func.run = null;
                    }
                }
                else if (e.str == "xydcp") {
                    if (e.func.run != null) {
                        e.func.run();
                        e.func.run = null;
                    }
                }
                else if (e.str == "letAction") {
                    if (e.func != null) e.func();
                }
                else if (e.str == "noRemainCard") {
                    if (e.func != null) e.func();
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
        // this.eventHandle = requestAnimationFrame(this.eventLoop);
        this.eventHandle = setTimeout(this.eventLoop, 1);
    }

    push(e) {
        if (e instanceof GameEvent)
            this.events.push(e);
    }

    insertEndOf(_nowE, _e) {
        if (_e instanceof GameEvent && _nowE instanceof GameEvent) {
            let index = this.events.indexOf(_nowE);
            this.events.splice(index + 1, 0, _e);
        }
    }

    insertFrontOf(_nowE, _e) {
        if (_e instanceof GameEvent && _nowE instanceof GameEvent) {
            let index = this.events.indexOf(_nowE);
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
        ////console.log(this.func);
    }
}

class CardUI {
    constructor(_contain) {
        this.contain = _contain;
        this.responseDiv = this.initResponseDiv();
        this.tipDiv = this.initTipDiv();
        this.pengDiv;
        this.gangDiv;
        this.huDiv;
        this.cancelDiv;
    }
    createNewCardDiv(contain, type, index, n = 0, dir = 0) {
        let card = document.createElement("div"); //创建p元素
        let str = (type == 0 ? 'tiao' : (type == 1 ? 'wan' : 'tong')).toString() + index.toString();
        card.style.left = (n * 100 * 0.7) + 'px'
        let card1 = document.createElement("div"); //创建p元素
        let card2 = document.createElement("div"); //创建p元素
        let card3 = document.createElement("div"); //创建p元素
        card3.classList.add(str);
        card.appendChild(card1);
        card.appendChild(card2);
        card.appendChild(card3);
        if (dir == 0)
            card.classList.add("standCard");
        else if (dir == 1)
            card.classList.add("lieCard");
        contain.appendChild(card); //将文本节点做为p元素的子节
        return card;
    }
    initResponseDiv() {
        let pDiv = document.createElement('div')
        pDiv.classList.add('selectOper');
        for (let i = 0; i < 4; i++) {
            let cDiv = document.createElement('div');
            switch (i) {
                case 0: cDiv.classList.add('peng');
                    cDiv.innerHTML = '碰';
                    this.pengDiv = cDiv;
                    break;
                case 1:
                    cDiv.classList.add('peng');
                    cDiv.innerHTML = '杠';
                    this.gangDiv = cDiv;
                    break;
                case 2:
                    cDiv.classList.add('peng');
                    cDiv.innerHTML = '胡';
                    this.huDiv = cDiv;
                    break;
                case 3:
                    cDiv.classList.add('peng');
                    cDiv.innerHTML = "取消";
                    this.cancelDiv = cDiv;
                    break;
            }
            pDiv.appendChild(cDiv);
        }
        this.contain.appendChild(pDiv);
        return pDiv;
    }
    initTipDiv() {
        let pDiv = document.createElement('div')
        pDiv.classList.add('tip');
        this.contain.appendChild(pDiv);
        return pDiv;
    }
}


let cardm = {//条 //万 //筒
    1: [[0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 3, 0, 0, 0, 0, 0], [0, 3, 0, 0, 0, 2, 0, 0, 3]],
    2: [[1, 2, 2, 1, 1, 1, 1, 2, 2], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]],
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
}


let div = document.querySelector('.cardArea');
let test_div = document.querySelector('.testPlayer1');
let test_div2 = document.querySelector('.testPlayer2');

let cardUI = new CardUI(div);
let cardUI1 = new CardUI(test_div)
let cardUI2 = new CardUI(test_div2)

let game = new Game(3);
game.players[0].cardUI = cardUI;
game.players[0].cards = game.cards;
game.players[1].cardUI = cardUI1;
game.players[1].cards = game.cards;
game.players[2].cardUI = cardUI2;
game.players[2].cards = game.cards;

game.players[0].name = "甲";
game.players[1].name = "乙";
game.players[2].name = "丙";


game.players[0].bindResponseButton();
game.players[1].bindResponseButton();
game.players[2].bindResponseButton();
/*
game.players[0].cardUI.pengDiv.addEventListener('click', game.players[0].pengClick);
game.players[0].cardUI.gangDiv.addEventListener('click', game.players[0].gangClick);
game.players[0].cardUI.huDiv.addEventListener('click', game.players[0].huClick);

game.players[1].cardUI.pengDiv.addEventListener('click', game.players[1].pengClick);
game.players[1].cardUI.gangDiv.addEventListener('click', game.players[1].gangClick);
game.players[1].cardUI.huDiv.addEventListener('click', game.players[1].huClick);

game.players[2].cardUI.pengDiv.addEventListener('click', game.players[2].pengClick);
game.players[2].cardUI.gangDiv.addEventListener('click', game.players[2].gangClick);
game.players[2].cardUI.huDiv.addEventListener('click', game.players[2].huClick);*/

game.players.forEach((player) => {
    player.addFull(game.cards)
})
/*game.players[0].addFull(game.cards)
game.players[1].addFull(game.cards)
game.players[2].addFull(game.cards)*/

//game.start()
//testCard(game.players[0], cardm[2])
//testCard(game.players[1], cardm[2])
//testCard(game.players[2], cardm[2])
//console.log(game)

game.players[0].sortCard()
game.players[1].sortCard()
game.players[2].sortCard()

game.eventLoop();



game.push(new GameEvent(() => { game.letAction() }, 'letAction', null, null, true));

