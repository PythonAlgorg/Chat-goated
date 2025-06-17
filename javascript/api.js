document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatMessages = document.getElementById("chat-messages");

    const OLLAMA_API_URL = "http://localhost:11434/api/chat";

    let conversationHistory = [];

    function appendMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${sender.toLowerCase()}-message`;

        const senderElement = document.createElement("strong");
        senderElement.textContent = sender + ": ";

        const textElement = document.createElement("span");

        const formattedText = formatCodeBlocks(text);
        textElement.innerHTML = formattedText;

        if(sender === "Chat goated"){
            const img = document.createElement('img');
            img.src = "./assets/images/goat.png" //<-- met ta source ici
            img.id = "goatIcon"
            messageElement.appendChild(img)
        }

        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);

        chatMessages.appendChild(messageElement);

        scrollToBottom();
    }

    chatForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        appendMessage("Trinity on", userMessage);
        userInput.value = "";
        userInput.focus();

        try {
            conversationHistory.push({
                role: "user",
                content: userMessage,
            });

            const messages = [{ role: "system" }, ...conversationHistory];

            const requestData = {
                model: "llama3.2:3b",
                messages: messages,
                stream: false,
            };

            const response = await fetch(OLLAMA_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();

            conversationHistory.push({
                role: "assistant",
                content: data.message.content,
            });

            appendMessage("Chat goated", data.message.content);
        } catch (error) {
            console.error(
                "Erreur lors de la communication avec Ollama:",
                error
            );
            appendMessage(
                "Système",
                "Désolé, une erreur est survenue lors de la communication avec l'IA."
            );
        }
    });

    function formatCodeBlocks(text) {
        const formattedText = text.replace(
            /```([a-z]*)\n([\s\S]*?)\n```/g,
            function (match, language, code) {
                return `<pre><code class="language-${language}">${escapeHTML(
                    code
                )}</code></pre>`;
            }
        );

        return formattedText.replace(/`([^`]+)`/g, "<code>$1</code>");
    }

    function escapeHTML(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function scrollToBottom() {
        const start = chatMessages.scrollTop;
        const end = chatMessages.scrollHeight;
        const duration = 800; // durée de l'animation en ms
        const startTime = performance.now();

        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            chatMessages.scrollTop = start + (end - start) * easeProgress;
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        }
        requestAnimationFrame(animateScroll);
    }
});

