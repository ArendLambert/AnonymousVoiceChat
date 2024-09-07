namespace V2TChat.Models
{
    public class Pair
    {
        public Pair(string first, string second)
        {
            First = first;
            Second = second;
        }

        public string First { get; private set; } = string.Empty;
        public string Second { get; private set; } = string.Empty;
    }
}
