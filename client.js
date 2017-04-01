angular
    .module('ChatSocket', [])
    .controller('ChatCtrl', ChatCtrl)
    .factory('socket', socket)
    .filter('myDateFormat', function myDateFormat(){
        return function(text) {
            return new Date(text);
        }
    });

function socket() {
    var socket = io();
    return socket;
}

function ChatCtrl($scope, socket, $timeout) {
    $scope.users = [];
    $scope.selectedItem = 0;
    $scope.currentUser = 'public';
    $scope.msg = '';
    $scope.nickWrap = true;
    $scope.chatWrap = false;
    $scope.nickError = false;
    $scope.nickErr = '';


    $scope.setNickname = function() {
        if ($scope.nickname) {
            socket.emit('new user', $scope.nickname, function (data) {
                console.log('setNickname cb:', $scope.nickname, data);
                if (data) {
                    $scope.nickWrap = false;
                    $scope.chatWrap = true;
                } else {
                    $scope.nickError = true;
                    $scope.nickErr = 'That user name is already taken! Try again!';
                }
                $scope.$apply();
            })
        } else {
            $scope.nickError = true;
            $scope.nickErr = 'No nickname!';
        }

        $scope.chatOnce = {
            'public': []
        };

        socket.on('users', function (data) {
            $scope.users = data;
            for(let i=0; i < $scope.users.length; i++){
                $scope.chatOnce[$scope.users[i]] = [];
            }
            $scope.usersObj = Object.keys($scope.chatOnce);
            $scope.$apply();
        });

        socket.on('user join', function (data) {
            $scope.nickCurr = data;
            let infoMsg = {
                "type": "info",
                "msg": "User " + data + " has joined"
            };
            $scope.chatOnce.public.push(infoMsg);
            $scope.$apply();
        });

        $scope.nickname = '';
    };

    $scope.send = function () {
        if ($scope.currentUser == 'public') {
            if ($scope.msg) {
                socket.emit('send message', $scope.msg);
                $scope.msg = '';
            } else {
                alert('you don\'t write message!!!')
            }
        } else {
            let obj = {
                    to: $scope.currentUser,
                };
            if ($scope.msg) {
                obj.msg = $scope.msg;
                socket.emit('private message', obj);
                $scope.msg = '';
            } else {
                alert('you don\'t write message!!!')
            }
        }
    };

    socket.on('get message', function(data){
        let chatMsg = {
            "type": "chat",
            "msg": data.msg,
            "nick": data.nick,
            "created": Date()
        };
        $scope.chatOnce.public.push(chatMsg);
        $scope.$apply();
    });

    $scope.showPrivate = function (index) {
        $scope.selectedItem = index;
        $scope.currentUser = $scope.usersObj[index];
    };

    socket.on('private message', function (data) {
        let privateMsg = {
            "type": "chat",
            "msg": data.msg,
            "from": data.from,
            "to": data.to,
            "created": Date()
        };
        $scope.chatOnce[privateMsg.from].push(privateMsg);
        $scope.chatOnce[privateMsg.to].push(privateMsg);
        $scope.$apply();
    });

    socket.on('disconnect', function (data) {
        for(let i=0; i < $scope.usersObj.length; i++) {
            if ($scope.usersObj[i] == data) {
                $scope.index = i;
            }
        }
        $scope.usersObj.splice($scope.index, 1);

        let infoMsg = {
            "type": "info",
            "msg": "User " + data + " has left"
        };
        $scope.chatOnce.public.push(infoMsg);
        $scope.$apply();
    });

    // $scope.editNick = function () {
    //     let obj = {
    //         old: $scope.nickCurr,
    //         new: prompt('Enter new nickname:')
    //     };
    //     socket.emit('change nickname', obj);
    // };
    //
    // socket.on('change nickname', function (data) {
    //     for (let i = 0; i < $scope.users.length; i++) {
    //         if ($scope.users[i] === data.oldName) {
    //             $scope.users[i] = data.newName;
    //             delete $scope.chatOnce[data.oldName];
    //             $scope.$apply();
    //         }
    //     }
    //
    //     let infoMsg = {
    //         "type": "info",
    //         "msg": 'User ' + data.oldName + ' is now known as ' + data.newName
    //     };
    //     $scope.chatOnce.public.push(infoMsg);
    //     $scope.$apply();
    // });

}
