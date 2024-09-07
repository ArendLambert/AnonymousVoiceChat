const connection = new signalR.HubConnectionBuilder().withUrl("https://192.168.31.75:7071/chatHub").build();

let peer;
let remotePeerId;
let thisPeerId;
let localStream;
let disconnectButton = document.getElementById("disconnectButton");
let connectButton = document.getElementById("connectButton");

// Подключение к серверу
window.addEventListener('load', () => {
    connection.start().then(function () {
        console.log("Connected!");
    }).catch(function (err) {
        return console.error(err.toString());
    });
});

// Дисконект от собеседника     BUTTON
disconnectButton.addEventListener("click", function () {
    function endCall() {
        if (peer != null) {
            peer.destroy();
        }
    }
    connectButton.style.display = "flex";
    disconnectButton.style.display = "none";
    endCall();

    // Отправляем сигнал на сервер для дисконекта второго пользователя
    connection.invoke('DisconnectUser', remotePeerId).catch(function (err) {
        return console.error(err.toString());
    });
});

// Ожидание подключения к собеседнику   BUTTON
connectButton.addEventListener("click", function () {
    connection.invoke('SearchCopmanion');
    connectButton.style.display = "none";
    disconnectButton.style.display = "flex";

    peer = new Peer(connection.connectionId)
    peer.on('open', function (thisPeerId) {
        console.log('My peer ID is: ' + thisPeerId);
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
});

// Подключает пару. Ожидает команду из chatHub
connection.on("StartChat", function (otherUserId) {
    // Написать сюда штобы было аудио
    remotePeerId = otherUserId
    startWebRTC(otherUserId);
});

connection.on("Disconnect", function () {
    if (peer != null) {
        peer.destroy();
    }
    connectButton.style.display = "flex";
    disconnectButton.style.display = "none";
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
        console.log(localStream);

        var call = peer.call(otherUserId, localStream);
        call.on('stream', function (remoteStream) {
            // Отобразить стрим на каком-нибудь элементе в Html
            const audioElement = document.getElementById('remoteAudio');
            audioElement.srcObject = remoteStream;

            // Отсылаем тот самый сигнал соответствия
            peer.on('signal', function (data) {
                connection.invoke('SendSignal', otherUserId, data);
            });
            console.log("Start chat with: " + otherUserId);
        });
    }, function (err) {
        console.log('Failed to get local stream', err);
    });

}