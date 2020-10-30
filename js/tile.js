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
        let div = document.createElement('div')
        div.classList.add("discardArea")
        document.body.append(div)
        for (let type_i = 0; type_i < 3; type_i++)
            for (let repeat = 0; repeat < 4; repeat++)
                for (let num_i = 1; num_i < 10; num_i++) {
                    this.currentPile.push(new Card(type_i, num_i, this.currentPile.length));
                }
        this.discardArea = div;
    }
    destroy() {
        this.discardArea.parentNode.removeChild(this.discardArea)
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

    set displayArea(m) {
        if (m)
            this.cardUI.contain.style.display = "block";
        else
            this.cardUI.contain.style.display = "none";
    }

    destroy() {
        if (this.hu.msgDiv != null) {
            this.hu.msgDiv.parentNode.removeChild(this.hu.msgDiv);
        }
        if (this.showOthersArea != null) {
            let child = this.showOthersArea.children;
            for (let n_child of child) {
                n_child.parentNode.removeChild(n_child);
            }
            this.showOthersArea.parentNode.removeChild(this.showOthersArea);
        }

        /* if(this.cardUI.contain != null){
             let child = this.cardUI.contain.children;
             for (let n_child of child) {
                 n_child.parentNode.removeChild(n_child);
             }
         }*/

        for (let card of this.handCards) {
            card.Container.parentNode.removeChild(card.Container);
        }

        for (let card of this.pengCardsExist) {
            for (let i of card) {
                i.Container.parentNode.removeChild(i.Container);
            }
        }

    }

    isLivePresent = () => {

        return this.game.players[user.id] == this;
    }

    showHandCards() {
        //重新展示给别人
        for (let everyOtherAreaCard of this.showOthersAreaCards) {
            everyOtherAreaCard.parentNode.removeChild(everyOtherAreaCard)
        }
        for (let i = 0, len = this.handCards.length; i < len; i++) {
            let oCard = this.getShowOtherCardArea_PH(this.handCards[i].num, this.handCards[i].type)
            if (this.direction == 1 || this.direction == 3) {
                oCard.style.top = 0.270 * 20 * i + 'vh';
            }
            else if (this.direction == 2) {
                oCard.style.left = 0.270 * 13 * i + 'vw';
            }
        }
    }


    initShowArea() {
        let div = document.createElement("div"); //创建p元素
        let str = ""
        switch (this.direction) {
            case 1: str = "West"; break;
            case 2: str = "North"; break;
            case 3: str = "East"; break;
        }
        div.classList.add(`showOtherArea_${str}`)
        document.querySelector('.contain').append(div);
        this.showOthersArea = div
    }

    add(_card) {
        if (this.cardUI != null) {
            _card.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, _card.type, _card.num, this.handCards.length)
            _card.Container.addEventListener('click', () => { this.click(_card) })
            this.getANewShowOtherCardArea(this.handCards.length)
        }
        this.handCards.push(_card)
    }

    click = (_card) => {
        if (!this.canDC || this.canPGH) {
            console.log("出牌速度 过快")
            return
        }
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

        });

        if (this.isLivePresent()) {
            sendOper(this.game.presentEvent.eventId, "chupai", _card.id);
        }

    }

    out(pos, num, _cards) {
        let arr = this.handCards.splice(pos, num);
        this.outCardsNum++;
        for (let i of arr) {
            let divC = this.cardUI.createNewCardDiv(_cards.discardArea, i.type, i.num, 0, 2)
            divC.style.left = _cards.discardPile.length * (270 * 0.2)
            divC.classList.remove('card');
            divC.classList.add('card1');
            _cards.delete(i)
        }
        this.filterCardsCanOutStyle(0);
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
        this.handCards.forEach((value, index) => {
            if (value.Container != null)
                value.Container.style.left = (index * 0.270 * 20) + 'vw'
        })

        //重新展示给别人
        for (let everyOtherAreaCard of this.showOthersAreaCards) {
            everyOtherAreaCard.parentNode.removeChild(everyOtherAreaCard)
        }
        this.showOthersAreaCards = [];
        for (let i = 0, len = this.handCards.length; i < len; i++) {
            this.getANewShowOtherCardArea(i)
        }
    }

    getANewShowOtherCardArea(index) {
        if (this.direction != 0) {
            let card = document.createElement("div"); //创建p元素
            if (this.direction == 1 || this.direction == 3) {
                if (this.direction == 1)
                    card.classList.add('zc')
                else if (this.direction == 3)
                    card.classList.add('zc1')
                card.style.top = 0.700 * 15 * index - 15 / 2.2 * index + 'vh';
            }
            else if (this.direction == 2) {
                card.classList.add('pt3')
                card.style.left = 0.270 * 13 * index + 'vw';
            }
            this.showOthersArea.appendChild(card); //将文本节点做为p元素的子节
            this.showOthersAreaCards.push(card);
        }
    }

    getShowOtherCardArea_PH(index, card_type = -1) {
        let card = document.createElement("div"); //创建p元素
        let type_str = (card_type == 0 ? 'tiao' : (card_type == 1 ? 'wan' : 'tong')).toString();
        let str = `${type_str}/${type_str}_${index.toString()}`;
        let cardDirectStr = "平躺"
        card.style.backgroundImage = `url('./tile/${str}.svg'),url('./tile/head/${cardDirectStr}.svg')`
        if (this.direction != 0) {
            //碰 杠
            if (this.direction == 1 || this.direction == 3) {
                if (this.direction == 1)
                    card.classList.add('zcpt_r')
                else if (this.direction == 3)
                    card.classList.add('zcpt')
                // card.style.top = 700 * 0.12 * index - 55 * index + 'px';
            }
            else if (this.direction == 2) {
                card.classList.add('zcpt_n')
                // card.style.left = 270 * 0.15 * index + 'px';
            }
            this.showOthersArea.appendChild(card); //将div节点做为p元素的子节
        }
        return card;
    }


    moPai = () => {
        let _card = this.cards.getCard(this);
        if (_card == null) {
            return -1;
        }
        this.getANewShowOtherCardArea(this.handCards.length + 0.3)

        _card.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, _card.type, _card.num, this.handCards.length + 0.3)
        _card.Container.addEventListener('click', () => { this.click(_card) });
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
        this.canPGH = 0;
        this.huCall(this.readyPGHCard);
        this.sortCard();
        let nextEvent = this.game.events[1];
        if (nextEvent.str == "xydcp" && nextEvent.obj == this) {
            this.game.events.splice(1, 1)
        }
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;
        this.huState = true;
        this.game.HuPlayers.push(this);
        this.game.changeToNextPlayerTurn(this);
        this.game.ifGameEnd()
        if (this.isLivePresent()) {
            sendOper(eventId, "hu");
        }
    }

    pengClick = () => {
        this.blank();
        this.canPGH = 0;
        this.pengCall(this.readyPGHCard);
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
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
        if (this.isLivePresent()) {
            sendOper(eventId, "peng");
        }
    }

    gangClick = () => {
        this.blank();
        this.canPGH = 0;
        this.gangCall(this.readyPGHCard);
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;
        if (this.canDC)
            this.moPai();
        this.sortCard();
        this.game.changeToNextPlayerTurn(this);
        if (this.isLivePresent()) {
            sendOper(eventId, "gang");
        }
    }

    cancelClick = () => {
        this.blank();
        this.canPGH = 0;
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.responseDiv.style.visibility = 'hidden';
        this.readyPGHCard = null;
        if (this.isLivePresent()) {
            sendOper(eventId, "cancel");
        }
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

    cShow(index, len, i, tuchu = 1) {
        //--展示给别人看
        let ph_card_toShow = this.getShowOtherCardArea_PH(i.num, i.type)
        let scaleRatio = { rl: 20, n: 13 }, fixedCardsAmount = 14
        if (this.direction == 1 || this.direction == 3) {
            ph_card_toShow.style.top = ((fixedCardsAmount + 1 + 2) * 0.700 * 15
                + 0.270 * scaleRatio.rl * index
                - 15 / 2.2 * (fixedCardsAmount + 1 + 2)
                - 1.0 * len
                - len * 0.270 * scaleRatio.rl * 3)
                + 'vh';
            if (tuchu) {
                if (this.direction == 1)
                    ph_card_toShow.style.left = "0.7vh";
                else
                    ph_card_toShow.style.left = "-0.7vh";
            }
            //700 展示的侧面牌高度 0.12缩放比
        }

        else if (this.direction == 2) {
            ph_card_toShow.style.left = ((fixedCardsAmount + 1 + 2 - 3) * 0.270 * 13
                + 0.270 * scaleRatio.n * index
                - 1.0 * len
                - len * 0.270 * scaleRatio.n * 3)
                + 'vw';
            if (tuchu)
                ph_card_toShow.style.top = "-0.7vw";
            //270 展示的侧面牌宽度度 0.12缩放比
        }
        return ph_card_toShow;
    }


    huCall = (_card) => {
        let index = this.handCards.findIndex((x) => {
            return x == _card
        });
        if (index != -1) {
            this.handCards[index].Container.parentNode.removeChild(this.handCards[index].Container)
            this.handCards.splice(index, 1)
        }
        this.handCards.push(_card);

        this.hu.reset(this.handCards);
        this.huType = this.hu.specialCardType(this.hu.numArr)
        _card.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, _card.type, _card.num, this.handCards.length)
        this.cardUI.createHuSign(_card.Container);
        _card.Container.addEventListener('click', () => { this.click(_card) })
    }

    gangCall = (_card) => {
        console.log("NIMADe")
        let arr = [];

        function getPos(index, len) {
            let fixedCardsAmount = 14, scaleRatio = 15;
            let leftNum = ((fixedCardsAmount + 1 - 3) * 0.270 * 20
                + 0.270 * scaleRatio * index
                - 1.0 * len
                - len * 0.270 * scaleRatio * 3)
                + 'vw';
            return leftNum;
        }

        for (let i = 0; i < 4; i++) {
            let index = this.handCards.findIndex((x) => {
                return x.type == _card.type && x.num == _card.num;
            });
            if (index != -1) {
                let reCard = this.handCards.splice(index, 1)[0];
                reCard.Container.parentNode.removeChild(reCard.Container);
                arr.push(reCard);
            }
        }

        if (arr.length == 1) {
            let iTo;
            for (let i = 0, len = this.pengCardsExist.length; i < len; i++) {
                let nCard = this.pengCardsExist[i][1];
                if (nCard.type == _card.type && nCard.num == _card.num) {
                    this.pengCardsExist[i].push(_card)
                    iTo = i;
                    break;
                }
            }

            let i = _card;
            i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + 0, 1)
            i.Container.style.left = getPos(1, iTo)
            i.Container.style.top = "-10px";

            this.cShow(1, iTo, i);
        }

        else if (arr.length == 3) {
            let len = this.pengCardsExist.length
            let divide = Math.floor(270 * 0.2 / 2)
            arr.forEach((i, index) => {
                i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + index, 1)
                i.Container.style.left = getPos(index, len);
                this.cShow(index, len, i, 0);
            })
            let i = _card;
            i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain, i.type, i.num, this.handCards.length + 1, 1)
            i.Container.style.left = getPos(1, len);
            i.Container.style.top = "-10px";

            this.cShow(1, len, i);
            arr.push(_card);
            this.pengCardsExist.push(arr);
        }


        else if (arr.length == 4) {
            let len = this.pengCardsExist.length
            arr.forEach((i, index) => {
                if (index < 3) {
                    i.Container = this.cardUI.createNewCardDiv(this.cardUI.contain,
                        i.type, i.num, this.handCards.length + index, 1)
                    i.Container.style.left = getPos(index, len);

                    this.cShow(index, len, i, 0);
                }
                else if (index == 3) {
                    i.Container.style.left = getPos(1, len);
                    i.Container.style.top = "-10px";
                    this.cShow(1, len, i);
                }
            })
            this.pengCardsExist.push(arr);
        }
        this.sortCard();
    }

    pengCall = (_card) => {
        let arr = [];

        function getPos(index, len) {
            let fixedCardsAmount = 14, scaleRatio = 15;
            let leftNum = ((fixedCardsAmount + 1 - 3) * 0.270 * 20
                + 0.270 * scaleRatio * index
                - 1.0 * len
                - len * 0.270 * scaleRatio * 3)
                + 'vw';
            return leftNum;
        }

        for (let i = 0; i < 2; i++) {
            let index = this.handCards.findIndex((x) => {
                return x.type == _card.type && x.num == _card.num;
            });
            let reCard = this.handCards.splice(index, 1)[0];
            reCard.Container.parentNode.removeChild(reCard.Container);
            arr.push(reCard);
        }
        arr.push(_card);

        let len = this.pengCardsExist.length


        arr.forEach((cardItem, index) => {
            cardItem.Container = this.cardUI.createNewCardDiv(this.cardUI.contain,
                cardItem.type, cardItem.num, this.handCards.length + index, 1)

            cardItem.Container.style.left = getPos(index, len)

            this.cShow(index, len, cardItem, 0);
        })
        this.pengCardsExist.push(arr);
        this.sortCard();
    }

    ResponsePGH = (_card) => {
        console.log("来了老弟");
        this.cardUI.tipDiv.innerHTML = '请选择是否碰/杠/胡牌';
        this.readyPGHCard = _card;
        this.cardUI.responseDiv.style.visibility = 'visible';
    }

    SelectDq = () => {
        this.cardUI.tipDiv.innerHTML = '请选择要打缺的牌的类型';
        this.cardUI.SelectDqDiv.style.visibility = 'visible';
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
            let num = Math.floor(parseInt(this.cards.rand.random() * 3) + 1)
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
                this.cardUI.pengDiv.style.display = 'inline-block';
                count++;
                this.canPGH |= Player.pghType.p;
            }
            else {
                this.cardUI.pengDiv.style.display = 'none';
                this.canPGH &= ~(Player.pghType.p);
            }
        }
        if (Gangchoice.length > 0 || (GangchoiceFromExistPeng && this.canDC)) {
            this.cardUI.gangDiv.style.display = 'inline-block';
            count++;
            this.canPGH |= Player.pghType.g;
        }
        else {
            this.cardUI.gangDiv.style.display = 'none';
            this.canPGH &= ~(Player.pghType.g);
        }
        if (Huchoice.length > 0) {
            this.cardUI.huDiv.style.display = 'inline-block';
            count++;
            this.canPGH |= Player.pghType.h;
        }
        else {
            this.cardUI.huDiv.style.display = 'none';
            this.canPGH &= ~(Player.pghType.h);
        }
        this.cardUI.cancelDiv.style.display = 'inline-block';
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
            this.game.events.length = 0;
            this.game.push(new GameEvent(() => { }, "noRemainCard", null, null, true));

        }
        else {
            this.cardUI.tipDiv.innerHTML = '请打出一张牌';
            _e.handled = true;
        }
    }

    needOutAcard_(_e) {

        this.filterCardsCanOutStyle(1);
        this.cardUI.tipDiv.innerHTML = '请打出一张牌(非摸牌)';
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
        this.cardUI.tipDiv.innerHTML = '';
    }

    bindResponseButton = () => {
        this.cardUI.pengDiv.addEventListener('click', this.pengClick);
        this.cardUI.gangDiv.addEventListener('click', this.gangClick);
        this.cardUI.huDiv.addEventListener('click', this.huClick);
        this.cardUI.cancelDiv.addEventListener('click', this.cancelClick);
    }

    DqWanClick = () => {
        this.firstCardType = 1
        this.blank();
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.SelectDqDiv.style.visibility = 'hidden';
        if (this.isLivePresent()) {
            sendOper(eventId, "dqWan");
        }
    }

    DqTiaoClick = () => {
        this.firstCardType = 0
        this.blank();
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.SelectDqDiv.style.visibility = 'hidden';
        if (this.isLivePresent())
            sendOper(eventId, "dqTiao");
    }

    DqTongClick = () => {
        this.firstCardType = 2
        this.blank();
        let eventId = this.game.presentEvent.eventId
        this.game.presentEvent.handled = true;
        this.cardUI.SelectDqDiv.style.visibility = 'hidden';
        if (this.isLivePresent())
            sendOper(eventId, "dqTong");
    }

    bindSelectDqButton = () => {
        this.cardUI.DqTiaoDiv.addEventListener('click', this.DqTiaoClick);
        this.cardUI.DqWanDiv.addEventListener('click', this.DqWanClick);
        this.cardUI.DqTongDiv.addEventListener('click', this.DqTongClick);
    }
}
Player.pghType = { p: 1, g: 2, h: 4 };


class Game {
    constructor(_num = 0) {
        this.cards = new Cards();
        this.players = [];
        // this.init(_num);
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
        this.cards.destroy();
        this.cards = null;
        this.events.length = 0;
        for (let player of this.players) {
            player.destroy();
            player = null;
        }
        this.initData();
    }

    showResult() {
        let str = "";
        for (let player of this.players) {
            player.showHandCards();
            str += `玩家:${player.name} 
            胡牌类型:<span style="color:blue">${ScoreList[player.huType.toString()].text}</span> 
            得分:<span style="color:red">${ScoreList[player.huType.toString()].score}</span><br>`;
        }
        document.querySelector(".result").innerHTML = str;
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


    eventLoop = () => {
        let overtime = false;
        if (this.events.length != 0) {

            let e = this.events[0];
            let otherHandle = this.taskQueue.get(e.eventId)
            if (otherHandle != undefined) {
                gameToOper(otherHandle.player, otherHandle.oper, otherHandle.args)
            }
            if (e.handled) {
                this.events.splice(0, 1);
            }
            if (this.lastTime == null)
                this.lastTime = new Date();
            let a = new Date();
            let deltaTime = (a.getTime() - this.lastTime.getTime()) / 1000;
            if (e.obj != game.players[0] || 1) overtime = true;
            if (deltaTime >= this.timeLimit && this.timeLimit != -1) overtime = true;

            if (e instanceof GameEvent) {
                if (e.str == "dachupai") {
                    let players = this.players.filter(item => {
                        return (item != e.obj && item.checkPGH(e.ret[0]) && item.huState == false);
                    })
                    //console.log("打出了牌:")
                    //console.log(e.ret[0])
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

class CardUI {
    constructor(_contain) {
        this.contain = _contain;
        this.responseDiv = this.initResponseDiv();
        this.tipDiv = this.initTipDiv();
        this.SelectDqDiv = this.initSelectDqDiv();
        this.pengDiv;
        this.gangDiv;
        this.huDiv;
        this.cancelDiv;
        this.DqTiaoDiv;
        this.DqTongDiv;
        this.DqWanDiv;
    }
    createNewCardDiv(contain, type, index, n = 0, dir = 0) {
        let card = document.createElement("div"); //创建p元素
        let type_str = (type == 0 ? 'tiao' : (type == 1 ? 'wan' : 'tong')).toString();
        let str = `${type_str}/${type_str}_${index.toString()}`;
        card.style.left = (n * 270 * 0.25) + 'px'
        card.classList.add("card");
        let cardDirectStr;
        if (dir == 0) {
            card.classList.add("standCard");
            cardDirectStr = "树立"
        }
        else if (dir == 1) {
            card.classList.add("lieCard");
            cardDirectStr = "平躺"
        }
        else if (dir == 2) {
            card.classList.add("discardCard");
            cardDirectStr = "平躺"
        }
        card.style.backgroundImage = `url('./tile/${str}.svg'),url('./tile/head/${cardDirectStr}.svg')`
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
    initSelectDqDiv() {
        let pDiv = document.createElement('div')
        pDiv.classList.add('selectOper');
        for (let i = 0; i < 3; i++) {
            let cDiv = document.createElement('div');
            switch (i) {
                case 0:
                    cDiv.classList.add('DqSelect');
                    cDiv.innerHTML = '条';
                    cDiv.style.color = "limegreen"
                    this.DqTiaoDiv = cDiv;
                    break;
                case 1: cDiv.classList.add('DqSelect');
                    cDiv.innerHTML = '万';
                    cDiv.style.color = "rgb(255,0,0)"
                    this.DqWanDiv = cDiv;
                    break;
                case 2:
                    cDiv.classList.add('DqSelect');
                    cDiv.innerHTML = '筒';
                    cDiv.style.color = "rgb(0,0,255)"
                    this.DqTongDiv = cDiv;
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
    createHuSign(_container) {
        let huSign = document.createElement("div"); //创建p元素
        huSign.classList.add("huSign")
        huSign.innerHTML = "胡"
        _container.appendChild(huSign)
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

    for (let i = 0; i < cards.length; i++)
        for (let j = 0; j < cards[0].length; j++) {
            for (let m = 0; m < cards[i][j]; m++) {
                if (cards[i][j] != 0)
                    _player.add(new Card(i, j + 1))
            }
        }
    _player.cards.deleteBy(_player.handCards)
}

function idToAdapt(_id) {
    for (let i = 0, len = game.players.length; i < len; i++) {
        game.players[i].direction = i;
        let dir = game.players[i].direction - _id
        dir = (dir < 0) ? (dir + 4) : dir
        game.players[i].direction = dir % 4
    }
}


let div = document.querySelector('.cardArea');
let test_div = document.querySelector('.testPlayer1');
let test_div2 = document.querySelector('.testPlayer2');
let test_div3 = document.querySelector('.testPlayer3');



let divUIs = [];

let game = new Game(4);


for (let i = 0, len = 4; i < 4; i++) {
    let divUI = document.createElement("div"); //创建div
    str = "testPlayer";
    document.querySelector(".contain").append(divUI);
    divUI.classList.add(str)
    let cardUI = new CardUI(divUI)
    divUIs.push(cardUI)
}


function start() {


    idToAdapt(user.id);
    game.players.forEach((player, index) => {
        player.cardUI = divUIs[index];

        if (player.direction != 0) {
            player.displayArea = false;
        }
        player.initShowArea();
        player.bindResponseButton();
        player.bindSelectDqButton();
        player.addFull(game.cards);
        player.sortCard();

    })
    game.eventLoop();
    game.push(new GameEvent(() => { }, 'DqSelect', null, null, true));
    game.push(new GameEvent(() => { game.letAction() }, 'letAction', null, null, true));
}

game.restart();
start();


window.onresize = function () {
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;
    let str = "宽度：" + width + "，高度：" + height;
    console.log(str)
    //document.querySelector(".contain").style.height = height + 'px'
    console.log(document.querySelector(".contain").style.height)
}
