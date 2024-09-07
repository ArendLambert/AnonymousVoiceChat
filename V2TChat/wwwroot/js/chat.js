const connection = new signalR.HubConnectionBuilder().withUrl("https://192.168.31.75:7071/chatHub").build();

let peer;
let remotePeerId;
let remoteDisconnectPeerId;
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

// Дисконект от собеседника BUTTON
disconnectButton.addEventListener("click", function () {
    function endCall() {
        if (peer != null) {
            peer.destroy();
        }
    }
    enableButton("connectButton");
    disableButton("disconnectButton");
    endCall();

    // Отправляем сигнал на сервер для дисконекта второго пользователя
    connection.invoke('DisconnectUser', remoteDisconnectPeerId).catch(function (err) {
        return console.error(err.toString());
    });
});

// Ожидание подключения к собеседнику BUTTON
connectButton.addEventListener("click", function () {
    connection.invoke('SearchCopmanion');
    disableButton("connectButton");
    enableButton("disconnectButton");

    peer = new Peer(connection.connectionId)
    peer.on('open', function (thisPeerId) {
        console.log('My peer ID is: ' + thisPeerId);
    });

    // Подключаемся к пиру
    peer.on('call', function (call) {
        call.answer(localStream);
        // Получаем поток и отображаем
        call.on('stream', function (remoteStream) {
            const audioElement = document.getElementById('remoteAudio');
            audioElement.srcObject = remoteStream;
        });
    });
});

// Подключает пару. Ожидает команду из chatHub
connection.on("StartChat", function (otherUserId) {
    remoteDisconnectPeerId = otherUserId;
    startWebRTC(otherUserId);
});

// Получение команды на отключение от пира
connection.on("Disconnect", function () {
    if (peer != null) {
        peer.destroy();
    }
    enableButton("connectButton");
    disableButton("disconnectButton");
});

function enableButton(id) {
    let element = document.getElementById(id);
    element.style.display = "inline-block"
}

function disableButton(id) {
    let element = document.getElementById(id);
    element.style.display = "none"
}

// Получает сигнал от другого пользователя на проверку соответствия 
connection.on("ReceiveSignal", function (senderId, signal) {
    if (senderId !== otherUserId) return;
    peer.signal(signal);
});

// Функция записи потока и отправки
function startWebRTC(otherUserId) {
    // Запрос доступа к микрофону
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: false, audio: true }, function (stream) {
        localStream = stream
        console.log(localStream);

        var call = peer.call(otherUserId, localStream);
        call.on('stream', function (remoteStream) {
            // Отобразить стрим на элементе audio в HTML
            const audioElement = document.getElementById('remoteAudio');
            audioElement.srcObject = remoteStream;

            // Отсылаем сигнал соответствия
            peer.on('signal', function (data) {
                connection.invoke('SendSignal', remotePeerId, data);
            });
            console.log("Start chat with: " + otherUserId);
        });
    }, function (err) {
        console.log('Failed to get local stream', err);
    });

}