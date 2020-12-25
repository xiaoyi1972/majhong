var ws = require('nodejs-websocket')
var { Game, GameEvent } = require('./tile.js')

let users = [], usersSocketsMap = new Map(), rooms = []
//let game = new Game(2)

function start(_game) {//开始游戏
    _game.players.forEach((player, index) => {
        player.name = users[index].name
        player.addFull(_game.cards)
        player.sortCard()
        console.log(player.handCards)
    })
    _game.eventLoop()
    _game.push(new GameEvent(() => { }, 'DqSelect', null, null, true))
}

let server = ws.createServer(//服务器流
    socket => {
        // 事件名称为text(读取字符串时，就叫做text)，读取客户端传来的字符串
        socket.on('text', function (str) {//收到文本类型的消息
            let info = JSON.parse(str)
            if (infos.hasOwnProperty(info.type)) {
                infos[info.type](socket, info.content)
            }
            // 在控制台输出前端传来的消息　　
            // console.log(str)
            //向前端回复消息
            //  socket.sendText('服务器端收到客户端端发来的消息了！' + count++)
        })
        socket.on('connect', function (code) {//客户端连接上
            console.log('开启连接', code)
        })
        socket.on('close', function (code) {//客户端断开连接
            users = users.filter(item => { return item.socket != socket })
            OfflineLeaveRoom(socket)
            console.log('关闭连接', code)
        })
        socket.on('error', function (code) {//客户端异常关闭 由刷新页面导致
            // 某些情况如果客户端多次触发连接关闭，会导致connection.close()出现异常，这里try/catch一下
            try {
                socket.close()
                users = users.filter(item => { return item.socket != socket })
                OfflineLeaveRoom(socket)
            } catch (error) {
                console.log('close异常', error)
            }
            console.log('异常关闭', code)
        })
    }).listen(3000)//监听端口

function freshUsersId() {//刷新玩家的id
    let index = 0
    for (let user_i of users) {
        user_i.id = index
        index++
        user_i.socket.sendText(JSON.stringify({ type: `getID`, content: user_i.id }))
    }
}

function broadcast(_info) {//全局广播消息
    for (let connection of server.connections) {
        connection.sendText(_info)
    }
}

function broadcastRemain(_user, _info) {//广播剩余的
    let remainConnections = server.connections.filter(item => {
        return _user.socket != item
    })
    for (let connection of remainConnections) {
        connection.sendText(_info)
    }
}

function broadcastRoomRemain(_room, _user, _info) {//广播房间内剩余的
    let remainUsers = _room.users.filter(item => {
        return _user != item
    })
    for (let user of remainUsers) {
        user.socket.sendText(_info)
    }
}

function broadPeople() {//广播人
    let usersArr = []
    for (let i = 0, len = users.length; i < len; i++) {
        usersArr.push({ id: users[i].id, name: users[i].name })
    }
    broadcast(JSON.stringify({ type: 'freshPeople', content: { players: usersArr, roomid: -1 } }))
}

function freshRoomIds() {//重新分配房间的id号 因为有中间删除 导致断层
    rooms.forEach((itemRoom, index) => {
        itemRoom.users.forEach(itemUser => {
            itemUser.roomIn = index
        })
    })
}

function OfflineLeaveRoom(_socket) {//离线房间处理
    let presentUser = usersSocketsMap.get(_socket)
    if (presentUser != undefined && presentUser.roomIn != -1) {
        let leaveRoom = rooms[presentUser.roomIn]
        leaveRoom.users = leaveRoom.users.filter(item => { return item.socket != _socket })
        if (leaveRoom.users.length == 0) {
            console.log("为0")
            rooms.splice(rooms.indexOf(leaveRoom), 1)
            if (leaveRoom.game instanceof Game) {
                leaveRoom.game.stop();
                leaveRoom.game = null;
            }
            freshRoomIds()
        }
        else {
            broadRoomUsers(leaveRoom)
        }
        usersSocketsMap.delete(_socket)
    }
    broadRoom()
}

function broadRoom() {//广播房间 刷新整个大厅的房间信息
    let roomsArr = []
    for (let i = 0, len = rooms.length; i < len; i++) {
        roomsArr.push({ id: i, name: rooms[i].name, playerAmount: rooms[i].users.length })
    }

    for (let connection of server.connections) {
        let presentUser = usersSocketsMap.get(connection)
        let userId = -1
        if (presentUser.roomIn != -1)
            userId = rooms[presentUser.roomIn].users.indexOf(presentUser)
        connection.sendText(JSON.stringify({
            type: 'freshRoom',
            content: { rooms: roomsArr, roomIn: presentUser.roomIn, userId: userId }
        }))
    }
}

function broadRoomUsers(_specificRoom, _presentSocket = null) {//广播房间内的玩家信息
    let roomid = rooms.indexOf(_specificRoom)
    if (_specificRoom == null)
        return
    let roomToUsers = _specificRoom.users
    let usersArr = [], isSelf = false

    roomToUsers.forEach(item => {
        usersArr.push({ id: item.id, name: item.name })
        if (item.socket == _presentSocket) isSelf = true
    })

    roomToUsers.forEach(item => {
        item.socket.sendText(JSON.stringify({ type: 'showRoomUsers', content: { players: usersArr, roomid: roomid } }))
    })
    if (_presentSocket != null && !isSelf) {
        _presentSocket.sendText(JSON.stringify({ type: 'showRoomUsers', content: { players: usersArr, roomid: roomid } }))
    }
}

let infos = {
    join: function (_socket, _info) {//玩家加入
        let len = users.length
        let userInfo = { name: _info, id: len, socket: _socket, roomIn: -1, game: null }
        usersSocketsMap.set(_socket, userInfo)
        users.push(userInfo)
        console.log(`${_info} join`)
        broadRoom()
    },
    start: function (_socket, _info) {//玩家点击 开始了游戏
        let presentUser = usersSocketsMap.get(_socket)
        if (presentUser.roomIn == -1) return;
        let GetRoom = rooms[presentUser.roomIn]

        GetRoom.game = new Game(0)

        let game = GetRoom.game
        game.playersNum = GetRoom.users.length
        game.restart()
        //  game.cards.rand.seed = 360//碰牌测试:644 杠牌测试:465
        let usersArr = []
        for (let i = 0, len = GetRoom.users.length; i < len; i++) {
            usersArr.push({ id: GetRoom.users[i].id, name: GetRoom.users[i].name })
        }
        let info = JSON.stringify({
            type: `getGameSeed`, content: {
                seed: game.cards.rand.seed,
                amount: game.playersNum, users: usersArr
            }
        })
        broadcastRoomRemain(GetRoom, null, info)
        // broadcast(info)
        start(game)
        console.log("start")
    },
    getOper: function (_socket, _info) {//玩家打出的操作
        if (_info instanceof Object) {
            let infoMsg = JSON.stringify({ type: `getOper`, content: _info })
            let presentUser = usersSocketsMap.get(_socket)
            let GetRoom = rooms[presentUser.roomIn]

            let game = GetRoom.game

            game.taskQueue.set(_info.eventId, {
                player: _info.player,
                oper: _info.oper,
                args: _info.args
            })

            broadcastRoomRemain(GetRoom, presentUser, infoMsg)
        }
    },
    createRoom: function (_socket, _info) {
        let roomInfo = { name: _info.name }
        let presentUser = usersSocketsMap.get(_socket)
        if (presentUser.roomIn != -1) return
        roomInfo.users = []
        roomInfo.users.push(presentUser)
        presentUser.roomIn = rooms.length
        rooms.push(roomInfo)
        broadRoom()
        broadRoomUsers(roomInfo)

    },
    joinRoom: function (_socket, _info) {
        let GotoRoom = rooms[_info.roomid], del = false
        let presentUser = usersSocketsMap.get(_socket)
        let oldRoom = presentUser.roomIn == -1 ? null : rooms[presentUser.roomIn]
        if (_info.roomid != -1) {
            if (GotoRoom == oldRoom) return
            GotoRoom.users.push(presentUser)
            presentUser.roomIn = _info.roomid
            if (oldRoom != null) {
                oldRoom.users = oldRoom.users.filter(item => { return item.socket != _socket })
                if (oldRoom.users.length == 0) {
                    console.log("为0")
                    if (oldRoom.game instanceof Game) {
                        oldRoom.game.stop();
                        oldRoom.game = null;
                    }
                    rooms.splice(rooms.indexOf(oldRoom), 1)
                    del = true
                    freshRoomIds()
                }
            }
        }

        broadRoom()
        broadRoomUsers(GotoRoom)
        if (GotoRoom != oldRoom && !del)
            broadRoomUsers(oldRoom)
    },
    getRoomUsers: function (_socket, _info) {
        let GetRoom = rooms[_info.roomid]
        broadRoomUsers(GetRoom, _socket)
    },
    gotoHall: function (_socket, _info) {
        let presentUser = usersSocketsMap.get(_socket)
        if (presentUser.roomIn == -1) return;
        let GetRoom = rooms[presentUser.roomIn]
        broadRoomUsers(GetRoom)
        if (GetRoom.game instanceof Game) {
            GetRoom.game.stop();
            GetRoom.game = null;
        }
    }
}