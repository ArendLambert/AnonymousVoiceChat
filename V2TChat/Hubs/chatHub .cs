using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using System.Linq;
using V2TChat.Models;

namespace V2TChat.Hubs
{
    public class ChatHub : Hub
    {
        private static List<string> Users = new List<string>();
        private static List<Pair> UsersPairs = new List<Pair>();

        // Выбор собеседника из пула
        public async Task SearchCopmanion()
        {
            Users.Add(Context.ConnectionId);
            if (Users.Count >= 2)
            {
                Pair pair = new Pair(Users[0], Users[1]);
                await Clients.Client(pair.First).SendAsync("StartChat", pair.Second);
                await Clients.Client(pair.Second).SendAsync("StartChat", pair.First);
                UsersPairs.Add(pair);
                Users.RemoveRange(0, 2);
            }
        }


        // При отключении пользователя удаляет из пула и отключает из соединения
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Pair? pair = UsersPairs.Where(p => p.First == Context.ConnectionId || p.Second == Context.ConnectionId).FirstOrDefault();
            await base.OnDisconnectedAsync(exception);

            if (pair == null)
            {
                return;
            }

            if (pair.Second == Context.ConnectionId)
            {
                await DisconnectUser(pair.First);
            }
            if (pair.First == Context.ConnectionId)
            {
                await DisconnectUser(pair.Second);
            }
            UsersPairs.Remove(pair);

        }

        // Сигнал проверки соответсвия
        public async Task SendSignal(string receiverId, string signal)
        {
            await Clients.Client(receiverId).SendAsync("ReceiveSignal", Context.ConnectionId, signal);
        }

        // Отключает пользователя из соединения
        public async Task DisconnectUser(string userId)
        {
            await Clients.Client(userId).SendAsync("Disconnect");
        }
    }
}
