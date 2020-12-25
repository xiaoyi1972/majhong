// 打开一个 web socket  这里端口号和上面监听的需一致
let contactIp = 1 ? 'ws://localhost:3000' : 'ws://192.168.1.3:3000/';
let user = { id: 0, name: "", serverIp: contactIp, roomIn: -1 };
let connectStateText=document.querySelector('.connectState');
let ws = null;
//let ws = new WebSocket('ws://192.168.1.3:3000/');

// Web Socket 已连接上，使用 send() 方法发送数据
let ws_handleFunc = {
    onopen: function () {
        // 这里用一个延时器模拟事件
        // setInterval(function () {
        //ws.send(JSON.stringify({ type: "join", content: user.name }));
        //}, 2000);
        connectStateText.innerHTML='联机';
        ws.send(JSON.stringify({ type: "join", content: user.name }));
    },
    // 这里接受服务器端发过来的消息
    onmessage: function (e) {
        let info = JSON.parse(e.data)
        if (infos.hasOwnProperty(info.type)) {
            infos[info.type](info.content);
        }
    },
    onerror: function (e) {
        connectStateText.innerHTML='脱机';
        user.id = 0;
        game.playersNum = 4;

    },
    onclose: function (e) {
        connectStateText.innerHTML='脱机';
        user.id = 0;
        game.playersNum = 4;

    },
    toBind(_websocket) {
        _websocket.onopen = ws_handleFunc.onopen;
        _websocket.onmessage = ws_handleFunc.onmessage;
        _websocket.onerror = ws_handleFunc.onerror;
        _websocket.onclose = ws_handleFunc.onclose;
    }
}

window.onunload = () => {
    ws.close()
}

let infos = {
    getID: function (_info) {
        user.id = _info;
        //idToAdapt(user.id)

    },
    freshPeople: function (_info) {
        console.log(_info)
        if (game.playing) return;
        if (!Game.server) {
            document.querySelector(".contain").style.display = 'none';
            document.querySelector(".readyRoom").style.display = 'block';
        }
        let playersArr = _info.players, roomId = _info.roomid;
        let amount = playersArr.length;
        for (let player of game.players) {
            player.destroy();
            player = null;
        }
        game.players = [];
        if (!Game.server) {
            waitSets.forEach(item => {
                item.headImage.style.display = 'none';
            })
        }
        playersArr.forEach((userI,index) => {
            let player = game.add();
       
            idToAdapt(user.id == -1 ? amount : user.id);//user.id
            player.name = index==user.id?`${userI.name}[我]`:userI.name;
            player.initShowArea();
            console.log(`player.direction:${player.direction}`)
            if (!Game.server) {
                let divUI = waitSets[player.direction];

                divUI.headImage.style.display = 'flex';
                divUI.text.innerHTML = player.name;
                let num = player.name.charCodeAt(0) % 7 + 1
                divUI.headImage.style.backgroundImage = `url(./headImage/${num}.jpeg)`;
            }
        })
    },
    getCards: function (_info) {

    },
    getGameSeed: function (_info) {
        if (!Game.server) {
            document.querySelector(".contain").style.display = 'block';
            document.querySelector(".readyRoom").style.display = 'none';
        }
        if (_info instanceof Object) {
            game.playersNum = _info.amount;
            game.restart();

            game.cards.rand.setSeed(_info.seed);
            start(_info.users);
        }
    },
    getOper: function (_info) {
        if (_info instanceof Object) {
            game.taskQueue.set(_info.eventId, { player: _info.player, oper: _info.oper, args: _info.args })
            console.log(`收到操作${_info}`)
            //gameToOper(_info.player, _info.oper, _info.args);
        }
    },
    freshRoom: function (_info) {
        let roomArr = _info.rooms;
        user.roomIn = _info.roomIn;
        user.id = _info.userId;
        console.log(`user.id:${user.id}`)
        room.empty();
        roomArr.forEach(item => {
            room.create(item);
        }
        )
        room.selectTo(user.roomIn);
    },
    showRoomUsers: function (_info) {
        infos.freshPeople(_info);
    }
}

function sendOper(_eventId, _operName, _argsCovered = null) {
    //
    if (ws.readyState == 0 || ws.readyState == 3)
        return

    if (opers.hasOwnProperty(_operName)) {
        let operContent = opers[_operName];
        if (_argsCovered != null) {
            operContent.args = _argsCovered;

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

    if (ws.readyState == 0 || ws.readyState == 3) {
        if (!Game.server) {
            document.querySelector(".contain").style.display = 'block';
            document.querySelector(".readyRoom").style.display = 'none';
        }
        game.restart();
        start();
        return;
    }
    else
        ws.send(JSON.stringify({ type: "start", content: user.id }));
}

function tuoguan() {
    game.players[user.id].isbot = true;
}

function gotoHall() {
    game.stop();
    ws.send(JSON.stringify({ type: "gotoHall", content: { name: "我来了" } }));
    document.querySelector(".contain").style.display = 'none';
    document.querySelector(".readyRoom").style.display = 'block';
}

function createRoom() {

    ws.send(JSON.stringify({ type: "createRoom", content: { name: "我来了" } }));
}

function joinRoom() {
    let id = room.electIndex;
    ws.send(JSON.stringify({ type: "joinRoom", content: { roomid: id } }));
}

function getRoomUsers(_id) {
    ws.send(JSON.stringify({ type: "getRoomUsers", content: { roomid: _id } }));
}