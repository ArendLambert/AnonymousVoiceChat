using Microsoft.AspNetCore.SignalR;
using System;
using System.Runtime.Remoting.Contexts;
using System.Threading.Tasks;

namespace V2TChat.Hubs
{
    public class ChatHub : Hub
    {
        private static List<string> Users = new List<string>();

        // Запускается при подключении. Создает пару и высылает команду на подключение
        public override async Task OnConnectedAsync()
        {
            Users.Add(Context.ConnectionId);
            Console.WriteLine(Context.ConnectionId);
            if (Users.Count >= 2)
            {
                var user1 = Users[0];
                var user2 = Users[1];
                await Clients.Client(user1).SendAsync("StartChat", user2);
                await Clients.Client(user2).SendAsync("StartChat", user1);
                Users.RemoveRange(0, 2);
            }
            //return base.OnConnectedAsync();
        }


        // При отключении пользователся удаляет из пула
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Users.Remove(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        // Какая-то фигня чтобы во время звонка не было дисконекта
        // Ещё не отправляет сигналы
        public async Task SendSignal(string receiverId, string signal)
        {
            await Clients.Client(receiverId).SendAsync("ReceiveSignal", Context.ConnectionId, signal);
        }
    }
}
