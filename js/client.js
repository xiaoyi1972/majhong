// 打开一个 web socket  这里端口号和上面监听的需一致
let user = { id: 0 };
let ws = new WebSocket('ws://localhost:3000/');

// Web Socket 已连接上，使用 send() 方法发送数据
ws.onopen = function () {
    // 这里用一个延时器模拟事件
    // setInterval(function () {
    ws.send(JSON.stringify({ type: "join", content: "wlaile" }));
    //}, 2000);
}
// 这里接受服务器端发过来的消息
ws.onmessage = function (e) {
    let info = JSON.parse(e.data)
    if (infos.hasOwnProperty(info.type)) {
        infos[info.type](info.content);
    }
}

window.onunload = () => {
    ws.close()
}

let infos = {
    getID: function (_info) {
        user.id = _info;
        //idToAdapt(user.id)
        console.log("id是:" + user.id);
    },
    getCards: function (_info) {
        console.log("牌是:" + _info);
    },
    getGameSeed: function (_info) {
        if (_info instanceof Object) {
            game.playersNum = _info.amount;
            game.restart();
            console.log("seed:" + _info.seed);
            game.cards.rand.setSeed(_info.seed);
            start();
        }
    },
    getOper: function (_info) {
        console.log("操作来了")
        console.log(_info)
        if (_info instanceof Object) {
            game.taskQueue.set(_info.eventId, { player: _info.player, oper: _info.oper, args: _info.args })
            //gameToOper(_info.player, _info.oper, _info.args);
        }
    }
}

function gameToOper(_id, _oper, _args) {
    let player = game.players[_id];
    if (_oper == "SelectDaque") {
        switch (_args) {
            case 0: player.DqWanClick(); break;
            case 1: player.DqTiaoClick(); break;
            case 2: player.DqTongClick(); break;
        }
    }
    else if (_oper == "OutCard") {
        let card = player.handCards.find(item => {
            return item.id == _args;
        });
        console.log(card)
        player.click(card);
    }
    else if (_oper == "SelectOper") {
        switch (_args) {
            case 0: player.huClick(); break;
            case 1: player.pengClick(); break;
            case 2: player.gangClick(); break;
            case 3: player.cancelClick(); break;
        }
    }
}

function sendOper(_eventId, _operName, _argsCovered = null) {
    console.log(ws.readyState)
    if (ws.readyState == 0||ws.readyState == 3)
        return
    console.log("事件id:" + _eventId)
    if (opers.hasOwnProperty(_operName)) {
        let operContent = opers[_operName];
        if (_argsCovered != null) {
            operContent.args = _argsCovered;
            console.log(`被覆盖的参数:${_argsCovered}`)
        }
        ws.send(JSON.stringify({
            type: "getOper",
            content: { eventId: _eventId, player: user.id, oper: operContent.oper, args: operContent.args }
        }));
    }
}

let opers = {
    dqWan: { oper: "SelectDaque", args: 0 },
    dqTiao: { oper: "SelectDaque", args: 1 },
    dqTong: { oper: "SelectDaque", args: 2 },
    chupai: { oper: "OutCard", args: -1 },
    peng: { oper: "SelectOper", args: 1 },
    gang: { oper: "SelectOper", args: 2 },
    hu: { oper: "SelectOper", args: 0 },
    cancel: { oper: "SelectOper", args: 3 },
}

function StartGame() {
    ws.send(JSON.stringify({ type: "start", content: user.id }));
}
