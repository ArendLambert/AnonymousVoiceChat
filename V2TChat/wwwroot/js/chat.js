const connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();


// Подключение к серверу для ожидания подключения к собеседнику
document.getElementById("connectButton").addEventListener("click", function () {
    connection.start().then(function () {
        console.log("Connected!");
    }).catch(function (err) {
        return console.error(err.toString());
    });
});

// Подключает пару. Ожидает команду из chatHub
connection.on("StartChat", function (otherUserId) {
    // Написать сюда штобы было аудио
    console.log("Start chat with: " + otherUserId);
});