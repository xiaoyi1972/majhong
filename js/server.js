var ws = require('nodejs-websocket');
var { Game, GameEvent } = require('./tile.js');

let users = [];
let game = new Game(2);


function start() {
    game.players.forEach((player) => {
        player.addFull(game.cards);
        player.sortCard();
        console.log(player.handCards)
    })
    game.eventLoop();
    game.push(new GameEvent(() => { }, 'DqSelect', null, null, true));
    game.push(new GameEvent(() => { game.letAction() }, 'letAction', null, null, true));
}

let server = ws.createServer(
    socket => {
        // 事件名称为text(读取字符串时，就叫做text)，读取客户端传来的字符串
        socket.on('text', function (str) {
            let info = JSON.parse(str);
            if (infos.hasOwnProperty(info.type)) {
                infos[info.type](socket, info.content);
            }
            // 在控制台输出前端传来的消息　　
            // console.log(str);
            //向前端回复消息
            //  socket.sendText('服务器端收到客户端端发来的消息了！' + count++);
        });
        socket.on('connect', function (code) {
            console.log('开启连接', code)
        })
        socket.on('close', function (code) {
            users = users.filter(item => { return item.socket != socket })
            console.log(users.length)
            console.log('关闭连接', code)
        })
        socket.on('error', function (code) {
            // 某些情况如果客户端多次触发连接关闭，会导致connection.close()出现异常，这里try/catch一下
            try {
                socket.close()
            } catch (error) {
                socket.log('close异常', error)
            }
            socket.log('异常关闭', code)
        })
    }).listen(3000);

function broadcast(_info) {
    for (let connection of server.connections) {
        connection.sendText(_info);
    }
}

function broadcastRemain(_user, _info) {
    let remainConnections = server.connections.filter(item => {
        return _user.socket != item;
    })
    console.log("剩余的玩家socket：" + remainConnections.length)
    for (let connection of remainConnections) {
        connection.sendText(_info);
    }
}

let infos = {
    join: function (_socket, _info) {
        _socket.sendText(JSON.stringify({ type: `getID`, content: users.length }));
        let len = users.length;
        users.push({ name: _info, id: len, socket: _socket });
        console.log("join");
    },
    start: function (_socket, _info) {
        /* _socket.sendText(JSON.stringify({ type: `getCards`, content: game.players[_info].CardsTo() }));
         console.log("他来了");*/
        game.playersNum = users.length;
        game.restart();
        game.cards.rand.seed = 644;//碰牌测试:644 杠牌测试:465
        let info = JSON.stringify({ type: `getGameSeed`, content: { seed: game.cards.rand.seed, amount: game.playersNum }})
        broadcast(info);
        start();
        console.log("start");
    },
    getOper: function (_socket, _info) {
        if (_info instanceof Object) {
            let infoMsg = JSON.stringify({ type: `getOper`, content: _info })
            game.taskQueue.set(_info.eventId, { player: _info.player, oper: _info.oper, args: _info.args })
         //   gameToOper(_info.player, _info.oper, _info.args);
            broadcastRemain(users[_info.player], infoMsg);
        }
    }
}