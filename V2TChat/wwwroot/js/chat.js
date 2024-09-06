const connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

let peer;
let remotePeerId;
let localStream;

// Подключение к серверу для ожидания подключения к собеседнику
document.getElementById("connectButton").addEventListener("click", function () {
    connection.start().then(function () {
        console.log("Connected!");
        peer = new Peer(connection.connectionId)
    }).catch(function (err) {
        return console.error(err.toString());
    });
});

// Подключает пару. Ожидает команду из chatHub
connection.on("StartChat", function (otherUserId) {
    // Написать сюда штобы было аудио
    startWebRTC();
    console.log("Start chat with: " + otherUserId);
});

// Получает сигнал от другого пользователя на проверку соответствия 
connection.on("ReceiveSignal", function (senderId, signal) {
    if (senderId !== otherUserId) return;
    peer.signal(signal);
});

function startWebRTC() {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: false, audio: true }, function (stream) {
        var call = peer.call(otherUserId, stream);
        call.on('stream', function (remoteStream) {
            // Отобразить стрим на каком-нибудь элементе в Html
            const audioElement = document.getElementById('remoteAudio');
            audioElement.srcObject = remoteStream;
        });
    }, function (err) {
        console.log('Failed to get local stream', err);
    });
}