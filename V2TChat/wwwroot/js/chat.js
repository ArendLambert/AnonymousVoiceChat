const plaintext = 'Some secret text';
const password = 'Secret password';

// Шифрование
const ciphertext = CryptoJS.AES.encrypt(plaintext, password).toString();

// Дешифрование
const bytes = CryptoJS.AES.decrypt(ciphertext, password);
const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

console.log(ciphertext); // Вывод: "U2FsdGVkX1+trOcJq3qZjx0cq4P4o4M4Xg1WzR4Kjw4="
console.log(decryptedText); // Вывод: "Some secret text"




const connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

let peer;
let remotePeerId;
let thisPeerId;
let localStream;
let disconnectButton = document.getElementById("disconnectButton");
let connectButton = document.getElementById("connectButton");

// Подключение к серверу для ожидания подключения к собеседнику
disconnectButton.addEventListener("click", function () {
    function endCall() {
        if (remotePeerId != null) {
            remotePeerId.send("end");
        }
        if (thisPeerId != null) {
            thisPeerId.send("end");
        }
        if (peer != null) {
            peer.destroy();
        }
    }
    connectButton.style.display = "flex";
    disconnectButton.style.display = "none";
    //connection.close();
    console.log("disconnectButton");
    //connection.close();
    endCall();
})
connectButton.addEventListener("click", function () {
    connectButton.style.display = "none";
    disconnectButton.style.display = "flex";
    connection.start().then(function () {
        console.log("Connected!");
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
        console.log(localStream);

        // ШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрование
        //const ciphertext = CryptoJS.AES.encrypt(localStream, password);

        //const bytes = CryptoJS.AES.decrypt(ciphertext, password);
        //const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

        //console.log(ciphertext);
        //console.log(decryptedText);
        // ШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрованиеШифрование

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

            conn.on("data", (data) => {
                if (data == "end") {
                    conn.close();
                    if (peer != null) {
                        peer.destroy();
                    }
                    console.log("the caller ended the call", data);
                }
            });
        });
    }, function (err) {
        console.log('Failed to get local stream', err);
    });

}