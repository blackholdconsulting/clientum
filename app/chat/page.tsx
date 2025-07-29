const handleSend = async () => {
  if (!input.trim()) return;

  const newMessage = { from: "user", text: input };
  setMessages((prev) => [...prev, newMessage]);
  const userInput = input;
  setInput("");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Eres un asistente de Clientum." },
          ...messages.map((msg) => ({
            role: msg.from === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          { role: "user", content: userInput },
        ],
      }),
    });

    const data = await res.json();
    if (data.content) {
      setMessages((prev) => [...prev, { from: "bot", text: data.content }]);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
