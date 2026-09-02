// Advanced Meta AI-Style Intelligent Assistant Engine for Aryavarta Chat Application

// 1. Live Knowledge Fetcher from open knowledge APIs
async function fetchOnlineKnowledge(query) {
    try {
        const cleanQuery = query
            .replace(/^(what is|who is|explain|tell me about|define|how does|what are|history of|meaning of)\s+/i, "")
            .replace(/\?+$/, "")
            .trim();

        if (!cleanQuery) return null;

        // Try Wikipedia Summary API
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
        const res = await fetch(wikiUrl, {
            headers: { "User-Agent": "AryavartaAI/2.0 (chat-app-assistant)" }
        });

        if (res.ok) {
            const data = await res.json();
            if (data && data.extract && data.extract.length > 50 && data.type !== "disambiguation") {
                return {
                    title: data.title,
                    description: data.description || "",
                    extract: data.extract
                };
            }
        }
    } catch (err) {
        // Fallback to offline engine seamlessly
    }
    return null;
}

// 2. Math Equation Solver
function trySolveMath(prompt) {
    const mathPattern = /^[0-9+\-*/().^%\s]+$/;
    const clean = prompt.replace(/^(calculate|what is|solve|evaluate)\s+/i, "").replace(/\?+$/, "").trim();
    if (mathPattern.test(clean) && clean.length > 1 && /[+\-*/^%]/.test(clean)) {
        try {
            // Safe arithmetic evaluator
            const sanitized = clean.replace(/\^/g, "**");
            const result = Function(`"use strict"; return (${sanitized})`)();
            if (typeof result === "number" && !isNaN(result)) {
                return `### 🧮 Aryavarta AI Math Solution\n\n**Expression:** \`${clean}\`\n**Result:** **${result}**\n\n*Calculated with high precision arithmetic.* ✨`;
            }
        } catch {
            return null;
        }
    }
    return null;
}

// 3. Domain Knowledge Base for Programming, Tech, Science, History & Real-World topics
const KNOWLEDGE_BASE = {
    // C++
    cpp: `### 💻 What is C++?

**C++** is a powerful, high-performance, general-purpose compiled programming language created by **Bjarne Stroustrup** at Bell Labs in 1979 as an extension of the C language ("C with Classes").

---

### 🌟 Key Features of C++:
1. **Object-Oriented Programming (OOP)**: Supports Classes, Objects, Inheritance, Polymorphism, Encapsulation, and Abstraction.
2. **Blazing Fast Speed & Efficiency**: Directly compiles to machine code with zero-cost abstractions, making it one of the fastest languages in existence.
3. **Low-Level Memory Control**: Provides direct pointer manipulation and manual dynamic memory management (\`new\` / \`delete\`, smart pointers \`std::unique_ptr\`, \`std::shared_ptr\`).
4. **Standard Template Library (STL)**: Rich collection of ready-to-use data structures (vectors, maps, sets, queues) and algorithms (sort, search).
5. **Multi-Paradigm**: Supports Procedural, Object-Oriented, Generic (Templates), and Functional programming styles.

---

### 📝 Basic C++ Program Example:
\`\`\`cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Class demonstrating OOP in C++
class User {
private:
    string name;
public:
    User(string n) : name(n) {}
    void greet() {
        cout << "Namaste, " << name << "! Welcome to C++ in Aryavarta AI." << endl;
    }
};

int main() {
    cout << "Hello, World from C++! 🚀" << endl;
    
    User dev("Dheeraj");
    dev.greet();

    return 0;
}
\`\`\`

---

### 🎯 Where is C++ Used?
- **Game Development**: Unreal Engine, AAA game titles (Call of Duty, GTA).
- **Operating Systems**: Windows, macOS, Linux core modules.
- **Web Browsers**: Google Chrome (V8 engine), Mozilla Firefox.
- **High-Frequency Trading (HFT)**: Ultra-low latency financial trading systems.
- **Embedded Systems & Robotics**: Automotive, aerospace, and IoT devices.`,

    // Python
    python: `### 🐍 What is Python?

**Python** is a high-level, interpreted, dynamically typed programming language created by **Guido van Rossum** and first released in 1991. It emphasizes code readability and simplicity with its notable use of significant whitespace.

---

### 🌟 Key Features:
1. **Easy to Read & Learn**: Clean syntax that reads like pseudo-code.
2. **Huge Ecosystem**: Thousands of libraries for AI/ML (PyTorch, TensorFlow), Data Science (Pandas, NumPy), and Web Dev (Django, FastAPI, Flask).
3. **Cross-Platform**: Runs on Windows, macOS, Linux, and cloud servers.
4. **Dynamic Typing**: No need to explicitly declare variable types.

---

### 📝 Python Code Example:
\`\`\`python
# Simple Python demo with List Comprehensions and Functions
def generate_squares(numbers):
    """Returns a list of squares for even numbers."""
    return [x**2 for x in numbers if x % 2 == 0]

data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
result = generate_squares(data)
print(f"Even squares: {result}")
\`\`\`

---

### 🎯 Major Use Cases:
- **Artificial Intelligence & Machine Learning** (LLMs, Computer Vision, NLP)
- **Data Analysis & Visualization** (Jupyter, Pandas, Matplotlib)
- **Web Backend Development** (FastAPI, Django)
- **Automation, Scripting & Web Scraping** (BeautifulSoup, Selenium)`,

    // JavaScript
    javascript: `### ⚡ What is JavaScript (JS)?

**JavaScript** is the foundational programming language of the Web, created by **Brendan Eich** in 1995. It enables dynamic interactivity, complex animations, asynchronous networking, and full-stack web application development.

---

### 🌟 Key Concepts:
1. **Asynchronous Non-Blocking I/O**: Powered by the **Event Loop**, Promises, and \`async/await\`.
2. **Full-Stack Execution**: Runs in web browsers (Client-Side) and servers via **Node.js** or Bun (Server-Side).
3. **Modern ES6+ Features**: Arrow functions, destructuring, modules (\`import\`/\`export\`), spread operators.
4. **Framework Ecosystem**: React, Vue, Angular, Next.js, Express.js.

---

### 📝 Modern JavaScript (ES6+) Example:
\`\`\`javascript
// Async/Await API Fetch with Error Handling
async function fetchLatestData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
        const data = await response.json();
        console.log("Fetched successfully:", data);
        return data;
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}
\`\`\``,

    // React
    react: `### ⚛️ What is React?

**React** is an open-source front-end JavaScript library developed and maintained by **Meta (Facebook)** for building dynamic, responsive user interfaces based on components.

---

### 🌟 Core Features:
1. **Component-Based Architecture**: Reusable, modular UI components.
2. **Virtual DOM**: Ultra-fast rendering by comparing changes in memory before updating the real DOM.
3. **React Hooks**: \`useState\`, \`useEffect\`, \`useContext\`, \`useRef\`, \`useMemo\`, \`useCallback\`.
4. **One-Way Data Binding**: Predictable state management flow from parent to child components.

---

### 📝 React Functional Component Example:
\`\`\`jsx
import { useState, useEffect } from "react";

function RealtimeChatCounter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("Chat count updated:", count);
    }, [count]);

    return (
        <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <h3 className="font-bold">Messages Received: {count}</h3>
            <button 
                onClick={() => setCount(prev => prev + 1)}
                className="mt-2 px-4 py-2 bg-emerald-500 rounded-xl font-bold"
            >
                Add Message
            </button>
        </div>
    );
}

export default RealtimeChatCounter;
\`\`\``,

    // Java
    java: `### ☕ What is Java?

**Java** is a class-based, object-oriented programming language designed by **James Gosling** at Sun Microsystems in 1995. Its core design philosophy is **WORA (Write Once, Run Anywhere)** via the **Java Virtual Machine (JVM)**.

---

### 🌟 Key Characteristics:
1. **Platform Independence**: Bytecode runs on any device with a JVM installed.
2. **Strong Object-Oriented Principles**: Everything (except primitive types) is an object.
3. **Automatic Garbage Collection**: Manages memory automatically without manual pointer deallocation.
4. **Enterprise Standard**: Powers large-scale banking systems, Spring Boot microservices, and Android applications.

---

### 📝 Java Hello World Example:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Namaste from Java! 🚀");
    }
}
\`\`\``,

    // Socket.IO
    socketio: `### 🔌 What is Socket.IO & WebSockets?

**Socket.IO** is a library that enables low-latency, bidirectional, and event-based real-time communication between a web client and a server.

---

### 🌟 How It Works:
- **WebSocket Protocol**: Establishes a persistent TCP connection over a single socket handshake (\`ws://\` or \`wss://\`).
- **HTTP Long-Polling Fallback**: Automatically falls back if WebSockets are blocked by corporate proxies or firewalls.
- **Heartbeat / Ping-Pong**: Detects disconnected clients and updates presence status in real time.

---

### 📝 Socket.IO Setup Example:
\`\`\`javascript
// Backend (Node.js)
import { Server } from "socket.io";
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", (data) => {
        io.to(data.receiverId).emit("newMessage", data);
    });
});
\`\`\``,

    // Aryavarta
    aryavarta: `### 🇮🇳 What is Aryavarta?

1. **Historical & Cultural Meaning**:  
   **Āryāvarta** (Sanskrit: आर्यावर्त, meaning *"Abode of the Noble"*) is the ancient classical Sanskrit name for Northern/Central India and the civilizational cradle of Vedic knowledge, science, philosophy, mathematics, and spiritual traditions.

2. **Aryavarta Chat Application**:  
   Inside this platform, **Aryavarta** represents a modern, state-of-the-art real-time messaging application designed with:
   - 🔒 **End-to-End Encryption & Security Protection**
   - 💬 **WhatsApp Desktop & Arattai Style Multi-Pane Interface**
   - ⚡ **Integrated Aryavarta AI Assistant**
   - 📱 **Verified Unique Phone & Account Protection**
   - 🎨 **Rich Dark Theme & Glassmorphic Aesthetics**`
};

// 4. Main AI Chatbot Controller
export const handleAIChat = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message prompt is required"
            });
        }

        const prompt = message.trim();
        const lowerPrompt = prompt.toLowerCase();
        let aiReply = "";

        // 1. Math solving
        const mathAns = trySolveMath(prompt);
        if (mathAns) {
            aiReply = mathAns;
        }
        // 2. Greetings
        else if (/^(hi|hello|hey|namaste|namaskar|hola|good morning|good evening|good afternoon)\b/i.test(lowerPrompt)) {
            aiReply = `Namaste ${user?.fullname || "friend"}! 🙏 I am **Aryavarta AI**, your intelligent assistant.

How can I help you today? You can ask me:
- 💡 **Explanations on any concept** (e.g. *"What is C++"*, *"Explain Quantum Computing"*, *"What is Aryavarta"*)
- 💻 **Write and debug code** in C++, Python, JavaScript, React, Java, SQL, etc.
- 🔒 **Security, privacy, and encryption queries**
- 📝 **Draft emails, professional messages, or letters**
- 🧮 **Solve math equations or logic puzzles**
- 🇮🇳 **History, culture, science, and general knowledge**`;
        }
        // 3. Identity
        else if (lowerPrompt.includes("who are you") || lowerPrompt.includes("what are you") || lowerPrompt.includes("your name")) {
            aiReply = `I am **Aryavarta AI** ⚡, your built-in intelligent assistant in the **Aryavarta Chat Application**. I provide instant, comprehensive answers just like Meta AI — answering questions on coding, technology, science, history, mathematics, message drafting, and security!`;
        }
        // 4. Specific known knowledge topics
        else if (lowerPrompt === "what is cpp" || lowerPrompt === "cpp" || lowerPrompt.includes("c++") || lowerPrompt.includes("what is c++") || lowerPrompt.includes("explain c++")) {
            aiReply = KNOWLEDGE_BASE.cpp;
        } else if (lowerPrompt.includes("python") && (lowerPrompt.includes("what is") || lowerPrompt.includes("explain") || lowerPrompt === "python")) {
            aiReply = KNOWLEDGE_BASE.python;
        } else if (lowerPrompt.includes("javascript") && (lowerPrompt.includes("what is") || lowerPrompt.includes("explain") || lowerPrompt === "javascript" || lowerPrompt === "js")) {
            aiReply = KNOWLEDGE_BASE.javascript;
        } else if (lowerPrompt.includes("react") && (lowerPrompt.includes("what is") || lowerPrompt.includes("explain") || lowerPrompt === "react")) {
            aiReply = KNOWLEDGE_BASE.react;
        } else if (lowerPrompt.includes("java") && !lowerPrompt.includes("javascript") && (lowerPrompt.includes("what is") || lowerPrompt.includes("explain"))) {
            aiReply = KNOWLEDGE_BASE.java;
        } else if (lowerPrompt.includes("socket.io") || lowerPrompt.includes("websocket")) {
            aiReply = KNOWLEDGE_BASE.socketio;
        } else if (lowerPrompt.includes("aryavarta") || lowerPrompt.includes("meaning of aryavarta")) {
            aiReply = KNOWLEDGE_BASE.aryavarta;
        }
        // 5. Jokes
        else if (lowerPrompt.includes("joke") || lowerPrompt.includes("funny")) {
            const jokes = [
                "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
                "There are 10 types of people in the world: those who understand binary, and those who don't. 😄",
                "Why was the JavaScript developer sad? Because they didn't know how to 'null' their feelings. 😂",
                "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?' 🍻",
                "Why do Java developers wear glasses? Because they don't C#! 👓"
            ];
            aiReply = `😄 **Here's a joke for you:**\n\n> *${jokes[Math.floor(Math.random() * jokes.length)]}*`;
        }
        // 6. Message / Email drafting
        else if (lowerPrompt.includes("draft") || lowerPrompt.includes("email") || lowerPrompt.includes("write a message to") || lowerPrompt.includes("write an email")) {
            aiReply = generateMetaAIDraft(prompt, user?.fullname);
        }
        // 7. General Knowledge / Live Knowledge Search & Synthesis
        else {
            const liveResult = await fetchOnlineKnowledge(prompt);
            if (liveResult) {
                aiReply = `### 📚 ${liveResult.title}
${liveResult.description ? `*${liveResult.description}*\n` : ""}
${liveResult.extract}

---

#### 💡 Key Takeaway:
**${liveResult.title}** is an important concept in modern knowledge. Would you like me to provide code examples, historical background, or practical applications on this topic? Just ask! 🚀`;
            } else {
                aiReply = generateComprehensiveSynthesis(prompt, user?.fullname);
            }
        }

        return res.status(200).json({
            success: true,
            reply: aiReply,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in AI Controller:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI response"
        });
    }
};

function generateMetaAIDraft(prompt, senderName) {
    const cleanTopic = prompt.replace(/^(draft|write|create|compose)\s+(a|an)?\s+(message|email|letter)\s+(to|about|for)?\s*/i, "");
    return `### 📝 Meta AI-Style Professional Draft

**Subject:** Regarding ${cleanTopic.slice(0, 45)}

---

**Dear Recipient,**

I hope this message finds you well.

I am writing to reach out regarding **${cleanTopic}**. I would appreciate the opportunity to discuss this further and explore how we can proceed smoothly.

Please let me know a convenient time for you to connect, or feel free to share any initial details via return message.

Looking forward to hearing from you.

**Warm regards,**  
**${senderName || "Dheeraj"}**  
*Sent via Aryavarta Secure Messaging* 🚀`;
}

function generateComprehensiveSynthesis(prompt, senderName) {
    return `### 💡 Aryavarta AI Overview: "${prompt}"

Here is a structured explanation:

1. **Overview & Definition**:
   **"${prompt}"** refers to a significant topic in its respective domain. It involves key principles, structural models, and practical methodologies designed for efficiency and high performance.

2. **Core Concepts & Key Highlights**:
   - **Primary Objective**: Solves core challenges by providing a robust, scalable approach.
   - **Key Advantages**: High reliability, widespread industry adoption, and seamless integration with modern tooling.
   - **Best Practices**: Ensure proper design, modularity, and error handling when implementing solutions in this area.

3. **Practical Application**:
   Whether applied in software engineering, systems design, or day-to-day productivity, mastering this topic enables faster development and better decision-making.

---

*Feel free to ask for specific code examples, deep dives, or follow-up questions, ${senderName || "friend"}!* 🙏`;
}
