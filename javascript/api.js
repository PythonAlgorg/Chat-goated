document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatMessages = document.getElementById("chat-messages");
    const toggle = document.getElementById('switchs');

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

        if(sender === "Trinity on"){
            messageElement.style.float = "right";
            messageElement.classList = "messagetrinity"
        }
        
        if(sender === "Chat goated"){
            const img = document.createElement('img');
            img.src = "./assets/images/goat.svg" //<-- met ta source ici
            img.id = "goatIcon"
            messageElement.appendChild(img)
            messageElement.classList = "messageGoat"
        } 
        else {
            messageElement.style.textAlign = "center";
            messageElement.classList.add = "messageSystem"; 
        }
        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);

        chatMessages.appendChild(messageElement);

        scrollToBottom();
        setTimeout(() => chatMessages.scrollIntoView({ behavior: "smooth" }), 600)
    }

    chatForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const resetChatButton = document.getElementById("reset-button");
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        appendMessage("Trinity on", userMessage);
        saveConversationHistory();
        userInput.value = "";
        userInput.focus();

        toggleLoaderVisibility(true);

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
            saveConversationHistory();
        } catch (error) {
            console.error(
                "Erreur lors de la communication avec Ollama:",
                error
            );
            appendMessage(
                "Système",
                "Désolé, une erreur est survenue lors de la communication avec l'IA."
            );
        } finally {
            toggleLoaderVisibility(false);
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
    function saveConversationHistory() {
        localStorage.setItem(
            "conversationHistory",
            JSON.stringify(conversationHistory)
        );
        console.log("Historique de conversation sauvegardé.");
    }
    function loadConversationHistory() {
        const savedHistory = localStorage.getItem("conversationHistory");
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);

            chatMessages.innerHTML = "";
            appendMessage("Système", "Voici où tu en étais")

            conversationHistory.forEach((message) => {
                const sender = message.role === "user" ? "Trinity on" : "Chat goated";
                if(sender === "Trinity on") {
                    appendMessage("Trinity on", message.content);
                } else {
                appendMessage(sender, message.content);
                }
            });
            console.log("Historique de conversation chargé.");
         } else {
            appendMessage(
                "Système",
                "Bienvenue ! Posez votre première question à l'IA."
            );
            console.log("Aucun historique de conversation trouvé.");
        }
    }
    function resetConversation() {
        conversationHistory = [];
        chatMessages.innerHTML = "";
        userInput.value = "";
        userInput.focus();
        appendMessage(
            "Système",
            "Nouvelle conversation démarrée. Posez votre première question !"
        );
        console.log("Conversation réinitialisée.");
       localStorage.removeItem("conversationHistory");
    }
    if (resetButton) {
         resetButton.addEventListener("click", resetConversation);
    }
    function saveConversationHistory() {
        localStorage.setItem(
            "conversationHistory",
            JSON.stringify(conversationHistory)
        );
        console.log("Historique de conversation sauvegardé.");
    }
    loadConversationHistory()
    function toggleLoaderVisibility(show) {
        if (loader) {
            if (show) {
                loader.classList.remove("loader-hidden");
            } else {
                loader.classList.add("loader-hidden");
            }
        }
    }
    function applyTheme(themeName) {
        document.documentElement.setAttribute("data-theme", themeName);
        localStorage.setItem("themePreference", themeName);
        console.log("Thème appliqué et sauvegardé :", themeName);
    }

    function switchs() {
        const currentTheme = localStorage.getItem("themePreference");
        if (currentTheme === "dark") {
            applyTheme("clair");
        } else {
            applyTheme("dark");
        }
    }

    (function initializeTheme() {
        const savedTheme = localStorage.getItem("themePreference");
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            applyTheme("light");
        }
    })();

    if (toggle){
        toggle.addEventListener("click", switchs);
    }
}); 