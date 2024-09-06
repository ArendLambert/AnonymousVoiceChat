const connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

let peer;
let remotePeerId;
let localStream;

// Подключение к серверу для ожидания подключения к собеседнику
document.getElementById("connectButton").addEventListener("click", function () {
    connection.start().then(function () {
        console.log("Connected!");
        peer = new Peer(connection.connectionId)
        peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
        });

        // Как ответить
        peer.on('call', function (call) {
            call.answer(localStream);

            // Что нам делать с пришедшем потоком
            call.on('stream', function (remoteStream) {
                const audioElement = document.getElementById('remoteAudio');
                audioElement.srcObject = remoteStream;
            });
        });
    }).catch(function (err) {
        return console.error(err.toString());
    });
});

// Подключает пару. Ожидает команду из chatHub
connection.on("StartChat", function (otherUserId) {
    // Написать сюда штобы было аудио
    startWebRTC(otherUserId);
});

// Получает сигнал от другого пользователя на проверку соответствия 
connection.on("ReceiveSignal", function (senderId, signal) {
    if (senderId !== otherUserId) return;
    peer.signal(signal);
});

function startWebRTC(otherUserId) {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: false, audio: true }, function (stream) {
        localStream = stream
        var call = peer.call(otherUserId, localStream);
        call.on('stream', function (remoteStream) {
            // Отобразить стрим на каком-нибудь элементе в Html
            const audioElement = document.getElementById('remoteAudio');
            audioElement.srcObject = remoteStream;

            // Отсылаем тот самый сигнал соответствия
            peer.on('signal', function (data) {
                connection.invoke('SendSignal', remotePeerId, data);
            });
            console.log("Start chat with: " + otherUserId);
        });
    }, function (err) {
        console.log('Failed to get local stream', err);
    });
}