var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    port = process.env.PORT || 3001;
    users = {};

app.use(express.static(__dirname + '/static/'));

io.on('connection', function(socket){
    socket.on('new user', function (nickname, callback) {
        if (nickname in users) {
            callback(false);
        } else {
            callback(true);
            users[nickname] = socket;
            io.emit('users', Object.keys(users));
            // io.emit('users', {us: Object.keys(users), nick: nickname});
        }

        io.emit('user join', nickname);


        socket.on('send message', function (data) {
            console.log('public', data);
            io.emit('get message',
                {
                    msg: data,
                    nick: nickname
                }
            );
        });

        socket.on('private message', function (data) {
            console.log(data);
            if (users[data.to]) {
                users[data.to].emit('private message', {msg: data.msg, from: nickname, to: data.to});
                socket.emit('private message', {msg: data.msg, from: nickname, to: data.to});
                console.log({msg: data.msg, from: nickname, to: data.to});
            } else {
                io.emit('private message', 'don\'t find user');
            }
        });

        socket.on('change nickname', function (data) {
            users[data.new] = users[data.old];
            delete users[data.old];
            io.emit('change nickname', {oldName: data.old, newName: data.new});
        });

        socket.on('disconnect', function (data) {
            if (!users[nickname]) return;
            io.emit('disconnect', nickname);
            delete users[nickname];
        });
    });
});


http.listen(port, function(){
    console.log('listening on *:' + port);
});
