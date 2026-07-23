// Promptsmith - High-Trust Next-Gen Cybernetic AI Prompt Engine

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const conceptInput = document.getElementById("concept-input");
    const clearInputBtn = document.getElementById("clear-input-btn");
    const micBtn = document.getElementById("mic-btn");
    const listeningIndicator = document.getElementById("listening-container");
    const waveContainer = document.getElementById("wave-container");
    const domainRadios = document.querySelectorAll('input[name="domain"]');
    const autocorrectBanner = document.getElementById("autocorrect-banner");
    const autocorrectText = document.getElementById("autocorrect-text");
    const liveModeBadge = document.getElementById("live-mode-badge");
    
    // Settings Modal elements
    const settingsModal = document.getElementById("settings-modal");
    const openSettingsBtn = document.getElementById("open-settings-btn");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const apiProviderSelect = document.getElementById("api-provider");
    const apiKeyInput = document.getElementById("api-key-input");
    const apiKeyFieldContainer = document.getElementById("api-key-field-container");

    // Output & Buttons
    const promptOutput = document.getElementById("prompt-output");
    const copyBtn = document.getElementById("copy-btn");
    const resetBtn = document.getElementById("reset-btn");
    const saveLibraryBtn = document.getElementById("save-library-btn");
    const toast = document.getElementById("toast");
    const presetsGrid = document.getElementById("presets-grid");

    // Sidebar
    const sidebar = document.getElementById("sidebar");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
    
    // Stats elements
    const statTokens = document.getElementById("stat-tokens");
    const statWords = document.getElementById("stat-words");
    
    // Sidebar list elements
    const savedList = document.getElementById("saved-list");
    const historyList = document.getElementById("history-list");
    const savedCount = document.getElementById("saved-count");
    const clearHistoryBtn = document.getElementById("clear-history-btn");

    // AI Agent Launcher Links
    const linkChatgpt = document.querySelector(".link-chatgpt");
    const linkClaude = document.querySelector(".link-claude");
    const linkGemini = document.querySelector(".link-gemini");
    const linkCopilot = document.querySelector(".link-copilot");

    // Speech-to-Text State
    let recognition = null;
    let isListening = false;
    let waveId = null;
    let apiAbortController = null;

    // LocalStorage keys
    const LOCAL_SAVED_KEY = "promptsmith_saved_prompts";
    const LOCAL_HISTORY_KEY = "promptsmith_history_prompts";
    const LOCAL_PROVIDER_KEY = "promptsmith_api_provider";
    const LOCAL_KEY_KEY = "promptsmith_api_secret_key";

    // Typo Dictionary
    const typoDict = {
        "quantume": "quantum",
        "pythn": "python",
        "recruter": "recruiter",
        "photograpgh": "photography",
        "pepople": "people",
        "recusion": "recursion",
        "photosthesis": "photosynthesis",
        "existentialsm": "existentialism",
        "chatgpt": "ChatGPT",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "writea": "write a",
        "creater": "create",
        "developement": "development",
        "scrpe": "scrape",
        "desing": "design",
        "analogyy": "analogy",
        "codee": "code",
        "algoritm": "algorithm",
        "datbase": "database",
        "articel": "article"
    };

    // Preset Ideas
    const sampleIdeas = [
        {
            title: "Resolve CPU Memory Leak",
            category: "Tough Debugging",
            domain: "coding",
            idea: "Help me debug a slow node.js heap memory leak crash happening in production."
        },
        {
            title: "Scale Microservice Architecture",
            category: "System Design",
            domain: "coding",
            idea: "Scale my user authentication system to handle 15,000 requests per second with Docker."
        },
        {
            title: "Crisis Business Negotiation",
            category: "Crisis Strategy",
            domain: "business",
            idea: "Prepare a strategic negotiation response for a client demanding a 40% contract rate cut."
        },
        {
            title: "Explain Zero-Knowledge Proofs",
            category: "Advanced Concept",
            domain: "learning",
            idea: "Explain cryptographic Zero-Knowledge Proofs (ZKP) simply using first-principles."
        }
    ];

    // -------------------------------------------------------------
    // 1. Initializers
    // -------------------------------------------------------------
    function init() {
        renderSampleIdeas();
        loadSidebarData();
        loadSettings();
        setupEventListeners();
        setupVoiceDictation();
        resetForm();
        initBgAnimation();
        updateBadgeState();
    }

    // Intent Detector
    function detectIntent(userSentence) {
        const text = userSentence.toLowerCase();

        if (text.match(/photo|image|picture|edit|photograph|portrait|camera|lighting|midjourney|dall-e|photoshop|background|background removal|render|8k|lens|aspect ratio/)) {
            return "photo";
        }
        if (text.match(/code|python|javascript|react|html|css|sql|script|build|develop|bug|api|database|algorithm|function|scrape|web|app|debug|fix|program|leak|race|crash|cors|deadlock|kubernetes|docker|scale|microservice/)) {
            return "coding";
        }
        if (text.match(/email|job|resume|cover letter|recruiter|interview|business|sales|pitch|marketing|client|strategy|manager|career|post|linkedin|crisis|negotiation|contract|deal/)) {
            return "business";
        }
        if (text.match(/explain|teach|understand|analogy|concept|math|physics|science|history|learn|study|roadmap|summary|difference|how does|why|cryptography|quantum|zero-knowledge|blockchain/)) {
            return "learning";
        }
        return "general";
    }

    // Dynamic Complexity Analyzer
    function getComplexity(userIdea) {
        const text = userIdea.toLowerCase();
        const wordCount = userIdea.split(/\s+/).length;
        
        // Critical keywords indicating tough situations
        const hasToughKeywords = text.match(/leak|race|deadlock|crash|cors|lock|scale|kubernetes|docker|load balancer|architect|microservice|crisis|negotiation|contract|deal|cryptography|quantum|zero-knowledge|blockchain|formula|hasselblad| Rembrandt/);
        
        if (wordCount >= 7 || hasToughKeywords) {
            return "advanced";
        }
        return "simple";
    }

    // -------------------------------------------------------------
    // 2. Web Speech API (Voice Dictation Module)
    // -------------------------------------------------------------
    function setupVoiceDictation() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            let initialText = "";

            recognition.onstart = () => {
                isListening = true;
                initialText = conceptInput.value;
                micBtn.classList.add("active");
                listeningIndicator.style.display = "flex";
                waveContainer.style.display = "block";
                showToast("🎙️ Listening... Speak your request!");
                startVoiceWaveAnimation();
            };

            recognition.onresult = (event) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                if (currentTranscript.trim()) {
                    conceptInput.value = (initialText ? initialText.trim() + " " : "") + currentTranscript.trim();
                    updateClearBtnVisibility();
                    
                    clearTimeout(autocorrectTimeout);
                    autocorrectTimeout = setTimeout(() => {
                        processSpellingCorrection(true);
                    }, 500);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                stopListening();

                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    alert("Microphone Permission Blocked!\n\nTo enable voice typing:\n1. Click the Lock icon 🔒 in your browser address bar.\n2. Turn ON 'Microphone' permission.\n3. Refresh the page and try again!");
                } else if (event.error === "no-speech") {
                    showToast("No speech detected. Click mic to try again!");
                } else {
                    showToast("Voice typing error: " + event.error);
                }
            };

            recognition.onend = () => {
                stopListening();
            };

            micBtn.addEventListener("click", () => {
                if (isListening) {
                    try { recognition.stop(); } catch (e) {}
                    stopListening();
                } else {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        } else {
            micBtn.addEventListener("click", () => {
                alert("Speech recognition is not supported in this browser. Please open the website in Google Chrome or Microsoft Edge!");
            });
        }
    }

    function stopListening() {
        isListening = false;
        micBtn.classList.remove("active");
        listeningIndicator.style.display = "none";
        waveContainer.style.display = "none";
        if (waveId) {
            cancelAnimationFrame(waveId);
            waveId = null;
        }
    }

    function startVoiceWaveAnimation() {
        const waveCanvas = document.getElementById("voice-wave-canvas");
        if (!waveCanvas) return;
        const waveCtx = waveCanvas.getContext("2d");
        
        let step = 0;
        function render() {
            if (!isListening) return;
            waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
            step += 0.15;
            
            drawSineWave(waveCtx, waveCanvas, step, 11, "rgba(0, 242, 254, 0.65)", 1.5, 0.05);
            drawSineWave(waveCtx, waveCanvas, step + 2, 7, "rgba(155, 81, 224, 0.5)", 1.0, 0.08);
            drawSineWave(waveCtx, waveCanvas, step + 4, 14, "rgba(0, 242, 254, 0.2)", 2.0, 0.03);
            
            waveId = requestAnimationFrame(render);
        }
        render();
    }

    function drawSineWave(ctx, canvas, step, amplitude, color, lineWidth, speed) {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        
        const width = canvas.width;
        const height = canvas.height;
        const mid = height / 2;
        
        ctx.moveTo(0, mid);
        for (let x = 0; x < width; x++) {
            const y = mid + Math.sin(x * speed + step) * amplitude;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // -------------------------------------------------------------
    // 3. Render Sample Ideas
    // -------------------------------------------------------------
    function renderSampleIdeas() {
        presetsGrid.innerHTML = "";
        presetsGrid.innerHTML = sampleIdeas.map((item, idx) => `
            <button class="preset-card" data-index="${idx}">
                <div style="font-size: 0.725rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); font-weight:700; margin-bottom:0.25rem;">${escapeHTML(item.category)}</div>
                <h4>${escapeHTML(item.title)}</h4>
                <p>"${escapeHTML(item.idea)}"</p>
            </button>
        `).join("");

        document.querySelectorAll(".preset-card").forEach(card => {
            card.addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                loadSampleIdea(idx);
            });
        });
    }

    function loadSampleIdea(idx) {
        const item = sampleIdeas[idx];
        conceptInput.value = item.idea;
        
        domainRadios.forEach(radio => {
            radio.checked = radio.value === item.domain;
        });

        updateClearBtnVisibility();
        processSpellingCorrection(true);
        generateMasterPrompt();
        showToast("Sample prompt loaded!");
    }

    // -------------------------------------------------------------
    // 4. Debounced Spelling Autocorrect (Preserves Cursor Focus)
    // -------------------------------------------------------------
    let autocorrectTimeout;
    function processSpellingCorrection(force = false) {
        const text = conceptInput.value;
        if (!text.trim()) {
            autocorrectBanner.style.display = "none";
            return;
        }

        const selectionStart = conceptInput.selectionStart;
        const selectionEnd = conceptInput.selectionEnd;

        const words = text.split(/\s+/);
        let correctedWords = [];
        let correctedCount = 0;
        let correctionList = [];

        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
            if (typoDict[cleanWord]) {
                const correctedValue = typoDict[cleanWord];
                const isCapitalized = word[0] === word[0].toUpperCase();
                const replacement = isCapitalized 
                    ? correctedValue[0].toUpperCase() + correctedValue.slice(1)
                    : correctedValue;
                
                const puncStartMatch = word.match(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']+/);
                const puncEndMatch = word.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']+$/);
                const puncStart = puncStartMatch ? puncStartMatch[0] : "";
                const puncEnd = puncEndMatch ? puncEndMatch[0] : "";
                
                correctedWords.push(puncStart + replacement + puncEnd);
                correctedCount++;
                correctionList.push(`${cleanWord} → ${correctedValue}`);
            } else {
                correctedWords.push(word);
            }
        });

        if (correctedCount > 0) {
            conceptInput.value = correctedWords.join(" ");
            conceptInput.setSelectionRange(selectionStart, selectionEnd);

            autocorrectText.textContent = `Auto-corrected: ${correctionList.join(", ")}`;
            autocorrectBanner.style.display = "flex";

            clearTimeout(autocorrectTimeout);
            autocorrectTimeout = setTimeout(() => {
                autocorrectBanner.style.display = "none";
            }, 6000);
        }
    }

    // -------------------------------------------------------------
    // 5. Settings Modal Handling & Badges
    // -------------------------------------------------------------
    function loadSettings() {
        const savedProvider = localStorage.getItem(LOCAL_PROVIDER_KEY) || "none";
        const savedKey = localStorage.getItem(LOCAL_KEY_KEY) || "";

        apiProviderSelect.value = savedProvider;
        apiKeyInput.value = savedKey;

        toggleApiKeyField();
    }

    function toggleApiKeyField() {
        const val = apiProviderSelect.value;
        if (val === "none") {
            apiKeyFieldContainer.style.display = "none";
        } else {
            apiKeyFieldContainer.style.display = "flex";
            if (val === "gemini") {
                apiKeyInput.placeholder = "Paste your Google Gemini API Key...";
            } else {
                apiKeyInput.placeholder = "Paste your OpenAI API Key (sk-...)...";
            }
        }
    }

    function updateBadgeState() {
        const provider = localStorage.getItem(LOCAL_PROVIDER_KEY) || "none";
        const apiKey = localStorage.getItem(LOCAL_KEY_KEY) || "";

        if (provider !== "none" && apiKey.trim() !== "") {
            liveModeBadge.textContent = `LIVE ${provider.toUpperCase()} AI`;
            liveModeBadge.className = "mode-badge badge-live";
        } else {
            liveModeBadge.textContent = "LOCAL ENGINE";
            liveModeBadge.className = "mode-badge badge-local";
        }
    }

    // -------------------------------------------------------------
    // 6. Live API Call Pipelines (Gemini & OpenAI)
    // -------------------------------------------------------------
    async function runLiveAIGenerator(userIdea, activeIntent, provider, apiKey) {
        if (apiAbortController) {
            apiAbortController.abort();
        }
        apiAbortController = new AbortController();

        promptOutput.value = "Thinking in real-time... Please wait...";
        promptOutput.style.opacity = "0.6";

        const complexity = getComplexity(userIdea);

        let systemInstruction = `You are a world-class prompt engineering architect. Your objective is to compile the user's raw idea into a highly accurate prompt that guarantees correct execution on other AI tools (ChatGPT, Claude, Gemini).

CORE COMPILATION RULES:
1. No Rigid Outlines: Do NOT use static headings like "[ROLE]" or "[CONSTRAINTS]". Write a naturally flowing, authoritative prompt.
2. Analyze Complexity (Current Target: ${complexity.toUpperCase()}):
   - Simple Mode: Keep it direct, clean, and concise. Get straight to the task.
   - Advanced Mode: Expand the request to include expert personas, precise technical edge-case directives, performance testing instructions, and safety guidelines.
3. Strict Output Compliance: Output ONLY the engineered prompt itself. No introductions (like "Here is your prompt:"), greetings, or markdown code block syntax (\`\`\` or \`\`\`markdown).

User Raw Idea: "${userIdea}"
Domain context: ${activeIntent.toUpperCase()}`;

        try {
            if (provider === "gemini") {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: systemInstruction }]
                        }]
                    }),
                    signal: apiAbortController.signal
                });

                if (!response.ok) {
                    throw new Error(`Gemini status code: ${response.status}`);
                }

                const data = await response.json();
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    promptOutput.value = data.candidates[0].content.parts[0].text.trim();
                } else {
                    throw new Error("Empty candidate tokens returned.");
                }
            } 
            else if (provider === "openai") {
                const endpoint = `https://api.openai.com/v1/chat/completions`;
                
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are a professional prompt builder." },
                            { role: "user", content: systemInstruction }
                        ],
                        temperature: 0.7
                    }),
                    signal: apiAbortController.signal
                });

                if (!response.ok) {
                    throw new Error(`OpenAI status code: ${response.status}`);
                }

                const data = await response.json();
                if (data.choices && data.choices[0].message.content) {
                    promptOutput.value = data.choices[0].message.content.trim();
                } else {
                    throw new Error("Empty OpenAI choice payload.");
                }
            }

            promptOutput.style.opacity = "1";
            updateStats();
            updateLauncherLinks();
            addToHistoryDebounced(userIdea, activeIntent);

        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("Live API Error:", err);
            promptOutput.style.opacity = "1";
            
            // Fallback to Local Engine
            generateLocalTemplate(userIdea, activeIntent);
        }
    }

    // -------------------------------------------------------------
    // 7. Real-Time Local Prompt Templates (Tough Situation Aware)
    // -------------------------------------------------------------
    function generateLocalTemplate(userIdea, activeIntent) {
        let promptText = "";
        const complexity = getComplexity(userIdea);
        const lowerIdea = userIdea.toLowerCase();

        if (activeIntent === "photo") {
            const isEditing = lowerIdea.match(/edit|change|remove|replace|modify/);
            if (complexity === "simple") {
                if (isEditing) {
                    promptText = `Modify this image: "${userIdea}". Smoothly blend the modified elements and balance the lighting so it matches the original background.`;
                } else {
                    promptText = `Generate a realistic photograph of: "${userIdea}". Shot with cinematic focus and natural lighting.`;
                }
            } else {
                if (isEditing) {
                    promptText = `Act as an expert digital compositor. Modify the image based on this objective: "${userIdea}". Align shadows and relight subjects to match the direction of the key light source. Use a feathered 1.5px boundary mask to blend modifications, align contrast curves, match ambient color space Kelvin temperatures, and output manual channel instructions for Photoshop.`;
                } else {
                    promptText = `Act as a cinematic art director. Generate a Midjourney image command for: "${userIdea}". Output only: /imagine prompt: ${userIdea}, shot on Hasselblad H6D-100c, 85mm lens, f/1.4 aperture, cinematic Rembrandt lighting, volumetric sunbeams, warm golden hour rim light, highly detailed textures, amber color grade --ar 16:9 --style raw --v 6.0`;
                }
            }
        }
        else if (activeIntent === "coding") {
            let language = "code";
            if (lowerIdea.match(/python/)) language = "Python";
            else if (lowerIdea.match(/javascript|js/)) language = "JavaScript";
            else if (lowerIdea.match(/react/)) language = "React";
            else if (lowerIdea.match(/html|css/)) language = "HTML & CSS";
            else if (lowerIdea.match(/sql/)) language = "SQL";

            const isDebugging = lowerIdea.match(/leak|race|crash|cors|deadlock|bug|error|slow|heap/);
            const isScaling = lowerIdea.match(/scale|kubernetes|docker|load balancer|architect|microservice|distributed/);

            if (complexity === "simple") {
                if (isDebugging) {
                    promptText = `Analyze and fix the following programming issue: "${userIdea}". Find the root cause, write corrected code, and outline the fix simply.`;
                } else {
                    promptText = `Write a clean, readable, and optimized ${language} function for: "${userIdea}". Include brief docstrings and a quick test case.`;
                }
            } else {
                if (isDebugging) {
                    promptText = `Act as a Staff Debugging Specialist. Troubleshoot this critical runtime failure: "${userIdea}". First, outline a diagnostic strategy using memory profiling tools (like Chrome DevTools or heapdumps). Second, analyze potential race conditions or lock patterns. Third, write modular, corrected code using safe resource disposal blocks and event handlers. Finally, document how to verify the solution under load.`;
                } else if (isScaling) {
                    promptText = `Act as a Principal Infrastructure Architect. Scale this component: "${userIdea}". Provide a distributed architecture layout utilizing load balancers, caching layers, and microservice segregation. Write clean Dockerfile definitions, outline caching rules (e.g. Redis key expiration), specify Kubernetes deployment topologies with health probes, and show a modular configuration script.`;
                } else {
                    promptText = `Act as a Senior Software Developer. Write a production-grade, highly optimized solution in ${language} for: "${userIdea}". Implement modular separation of concerns, wrap operations in robust error catching blocks, prevent resource leakage, and provide a single copy-pasteable script with a runnable test case.`;
                }
            }
        } 
        else if (activeIntent === "business") {
            const isEmail = lowerIdea.match(/email|outreach|message/);
            const isCrisis = lowerIdea.match(/crisis|negotiation|contract|deal|dispute|problem/);

            if (complexity === "simple") {
                if (isEmail) {
                    promptText = `Write a brief, engaging cold outreach message for: "${userIdea}". Keep it direct, professional, and under 120 words.`;
                } else {
                    promptText = `Outline a basic business approach for: "${userIdea}". Highlight the core objectives and list key action items.`;
                }
            } else {
                if (isCrisis) {
                    promptText = `Act as a Senior Business Negotiator. Develop a strategic crisis response and negotiation guide for: "${userIdea}". Outline 3 target outcomes, detail a step-by-step communication strategy applying negotiation heuristics (e.g., behavioral labeling, calibrating questions), write 3 ready-to-send email templates, and list 2 operational risks with backup mitigation strategies.`;
                } else if (isEmail) {
                    promptText = `Act as a conversion copywriter. Write a highly persuasive cold email template for: "${userIdea}". Generate 3 short subject lines (<6 words), lead with a personalized value hook statement in the first 2 sentences, list 2 metrics-driven achievements using bullet points, end with a low-barrier call to action, and limit total word count to 150.`;
                } else {
                    promptText = `Act as a management consultant. Formulate a professional business framework for: "${userIdea}". Provide an executive summary, a milestone roadmap, define 3 quantifiable success KPIs, and outline a risk mitigation profile.`;
                }
            }
        }
        else if (activeIntent === "learning") {
            const isAdvancedScience = lowerIdea.match(/cryptography|quantum|zero-knowledge|blockchain|physics|math|calculus/);

            if (complexity === "simple") {
                promptText = `Explain this concept simply to a beginner: "${userIdea}". Use an easy everyday metaphor to clarify how it works.`;
            } else {
                if (isAdvancedScience) {
                    promptText = `Act as a theoretical physicist and research educator. Explain the advanced concept "${userIdea}" using first principles. Provide a 3-sentence ELI5 baseline description, map the mechanics onto a detailed metaphorical system, explain the top 3 equations or underlying mathematical properties, outline 2 limitations or current research bottlenecks, and provide a 2-question conceptual quiz.`;
                } else {
                    promptText = `Act as a first-principles educator. Explain this concept step-by-step: "${userIdea}". Lead with an ELI10 baseline explanation, map its mechanics to a real-world metaphor, break down 3 core technical terminologies, correct 2 common misconceptions, and end with a 2-question self-check quiz.`;
                }
            }
        }
        else {
            promptText = `Act as a Senior Consultant. Deliver a highly detailed, professional execution plan for: "${userIdea}". Provide an executive summary, a technical roadmap covering all prerequisites, highlight 2 practical industry use cases, and use clean markdown layout structure.`;
        }

        promptOutput.value = promptText;
        updateStats();
        updateLauncherLinks();
        addToHistoryDebounced(userIdea, activeIntent);
    }

    // Dynamic Pre-Filled URL Links Constructor
    function updateLauncherLinks() {
        const text = promptOutput.value.trim();
        if (!text) {
            linkChatgpt.href = "https://chatgpt.com";
            linkClaude.href = "https://claude.ai";
            linkGemini.href = "https://gemini.google.com";
            linkCopilot.href = "https://copilot.microsoft.com";
            return;
        }

        const encodedText = encodeURIComponent(text);

        linkChatgpt.href = `https://chatgpt.com/?q=${encodedText}`;
        linkGemini.href = `https://gemini.google.com/app?prompt=${encodedText}`;
        linkCopilot.href = `https://copilot.microsoft.com/?q=${encodedText}`;
        linkClaude.href = "https://claude.ai";
    }

    // Main Orchestrator
    function generateMasterPrompt() {
        const userIdea = conceptInput.value.trim();
        if (!userIdea) {
            promptOutput.value = "";
            copyBtn.disabled = true;
            saveLibraryBtn.disabled = true;
            updateStats();
            updateLauncherLinks();
            return;
        }
        copyBtn.disabled = false;
        saveLibraryBtn.disabled = false;

        const selectedDomain = document.querySelector('input[name="domain"]:checked').value;
        const activeIntent = (selectedDomain === "general") ? detectIntent(userIdea) : selectedDomain;

        const provider = localStorage.getItem(LOCAL_PROVIDER_KEY) || "none";
        const apiKey = localStorage.getItem(LOCAL_KEY_KEY) || "";

        if (provider !== "none" && apiKey.trim() !== "") {
            runLiveAIGenerator(userIdea, activeIntent, provider, apiKey);
        } else {
            generateLocalTemplate(userIdea, activeIntent);
        }
    }

    // Statistics Engine
    function updateStats() {
        const text = promptOutput.value;
        const charCount = text.length;
        const wordCount = charCount > 0 ? text.trim().split(/\s+/).length : 0;
        const tokenEstimate = Math.ceil(charCount / 4.1);
        
        statTokens.textContent = tokenEstimate;
        statWords.textContent = wordCount;
    }

    // Persistence Operations (LocalStorage)
    saveLibraryBtn.addEventListener("click", () => {
        const idea = conceptInput.value.trim();
        const text = promptOutput.value;
        if (!idea || !text) return;

        const customName = prompt("Enter a label for this saved prompt:", `Prompt: ${idea.substring(0, 30)}...`);
        if (customName === null) return;
        
        const label = customName.trim() || `Prompt: ${idea.substring(0, 25)}`;
        
        const savedItem = {
            id: "saved_" + Date.now(),
            label: label,
            idea: idea,
            prompt: text,
            date: new Date().toLocaleDateString()
        };

        const savedItems = getLocalStorageData(LOCAL_SAVED_KEY);
        savedItems.unshift(savedItem);
        setLocalStorageData(LOCAL_SAVED_KEY, savedItems);
        
        loadSidebarData();
        showToast("Saved to library!");
    });

    let historyTimeout;
    function addToHistoryDebounced(idea, domain) {
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            if (!idea) return;
            
            const historyItems = getLocalStorageData(LOCAL_HISTORY_KEY);
            if (historyItems.length > 0 && historyItems[0].idea === idea) {
                return;
            }

            const historyItem = {
                id: "hist_" + Date.now(),
                idea: idea,
                prompt: promptOutput.value,
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            historyItems.unshift(historyItem);
            if (historyItems.length > 10) historyItems.pop();
            
            setLocalStorageData(LOCAL_HISTORY_KEY, historyItems);
            loadSidebarData();
        }, 2000);
    }

    function loadSidebarData() {
        const saved = getLocalStorageData(LOCAL_SAVED_KEY);
        const history = getLocalStorageData(LOCAL_HISTORY_KEY);

        savedCount.textContent = saved.length;

        savedList.innerHTML = "";
        if (saved.length === 0) {
            savedList.innerHTML = `<div class="empty-state">No saved prompts yet.</div>`;
        } else {
            savedList.innerHTML = saved.map(item => `
                <div class="sidebar-item" data-id="${item.id}">
                    <div class="sidebar-item-header">
                        <div class="sidebar-item-title">${escapeHTML(item.label)}</div>
                        <button class="sidebar-item-delete" data-id="${item.id}" title="Delete Saved Prompt">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div class="sidebar-item-meta">
                        <span>${item.date}</span>
                    </div>
                </div>
            `).join("");

            document.querySelectorAll("#saved-list .sidebar-item").forEach(el => {
                el.addEventListener("click", (e) => {
                    const deleteBtn = e.target.closest(".sidebar-item-delete");
                    const id = el.dataset.id;
                    if (deleteBtn) {
                        deleteSavedItem(id);
                    } else {
                        const item = saved.find(item => item.id === id);
                        loadSavedConfig(item);
                        sidebar.classList.add("collapsed");
                    }
                });
            });
        }

        historyList.innerHTML = "";
        if (history.length === 0) {
            historyList.innerHTML = `<div class="empty-state">No recent history.</div>`;
        } else {
            historyList.innerHTML = history.map(item => `
                <div class="sidebar-item" data-id="${item.id}">
                    <div class="sidebar-item-header">
                        <div class="sidebar-item-title" style="font-weight: 500;">"${escapeHTML(item.idea.substring(0, 32))}..."</div>
                    </div>
                    <div class="sidebar-item-meta">
                        <span>${item.date}</span>
                    </div>
                </div>
            `).join("");

            document.querySelectorAll("#history-list .sidebar-item").forEach(el => {
                el.addEventListener("click", () => {
                    const id = el.dataset.id;
                    const item = history.find(item => item.id === id);
                    loadSavedConfig(item);
                    sidebar.classList.add("collapsed");
                });
            });
        }
    }

    function loadSavedConfig(item) {
        conceptInput.value = item.idea;
        updateClearBtnVisibility();
        promptOutput.value = item.prompt;
        updateStats();
        updateLauncherLinks();
        showToast("Saved prompt loaded!");
    }

    function deleteSavedItem(id) {
        const saved = getLocalStorageData(LOCAL_SAVED_KEY);
        const filtered = saved.filter(item => item.id !== id);
        setLocalStorageData(LOCAL_SAVED_KEY, filtered);
        loadSidebarData();
        showToast("Deleted from library.");
    }

    clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Clear all generation history?")) {
            setLocalStorageData(LOCAL_HISTORY_KEY, []);
            loadSidebarData();
            showToast("History cleared.");
        }
    });

    function getLocalStorageData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    function setLocalStorageData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function handleAgentClick(e) {
        const text = promptOutput.value.trim();
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast("Copied to clipboard! Launching agent...");
            }).catch(err => {
                console.error("Copy failed", err);
            });
        }
    }

    // -------------------------------------------------------------
    // 10. Event Bindings & Utilities
    // -------------------------------------------------------------
    function setupEventListeners() {
        toggleSidebarBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });

        // Settings Modal controls
        openSettingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "flex";
        });

        closeSettingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "none";
        });

        settingsModal.addEventListener("click", (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = "none";
            }
        });

        apiProviderSelect.addEventListener("change", toggleApiKeyField);

        saveSettingsBtn.addEventListener("click", () => {
            const provider = apiProviderSelect.value;
            const apiKey = apiKeyInput.value.trim();

            localStorage.setItem(LOCAL_PROVIDER_KEY, provider);
            localStorage.setItem(LOCAL_KEY_KEY, apiKey);

            settingsModal.style.display = "none";
            updateBadgeState();
            showToast("Configuration saved!");
            generateMasterPrompt();
        });

        // Typing event with debounce
        let typingTimeout;
        conceptInput.addEventListener("input", () => {
            updateClearBtnVisibility();
            
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                processSpellingCorrection();
                generateMasterPrompt();
            }, 800);
        });

        conceptInput.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                processSpellingCorrection();
                generateMasterPrompt();
            }
        });

        clearInputBtn.addEventListener("click", () => {
            if (apiAbortController) apiAbortController.abort();
            conceptInput.value = "";
            stopListening();
            autocorrectBanner.style.display = "none";
            updateClearBtnVisibility();
            generateMasterPrompt();
            conceptInput.focus();
        });

        domainRadios.forEach(radio => {
            radio.addEventListener("change", generateMasterPrompt);
        });

        copyBtn.addEventListener("click", copyPrompt);
        resetBtn.addEventListener("click", resetForm);

        // Click handlers on launcher links to perform auto-copy to clipboard
        document.querySelectorAll(".agent-btn").forEach(btn => {
            btn.addEventListener("click", handleAgentClick);
        });
    }

    function copyPrompt() {
        const textToCopy = promptOutput.value;
        if (!conceptInput.value.trim() && !textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy text: ", err);
            promptOutput.select();
        });
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function updateClearBtnVisibility() {
        if (conceptInput.value.length > 0) {
            clearInputBtn.style.display = "flex";
        } else {
            clearInputBtn.style.display = "none";
        }
    }

    function resetForm() {
        if (apiAbortController) apiAbortController.abort();
        conceptInput.value = "";
        stopListening();
        autocorrectBanner.style.display = "none";
        domainRadios.forEach((radio, idx) => {
            radio.checked = idx === 0;
        });

        updateClearBtnVisibility();
        generateMasterPrompt();
    }

    // -------------------------------------------------------------
    // 11. Cyber Neural Grid Background Canvas
    // -------------------------------------------------------------
    function initBgAnimation() {
        const canvas = document.getElementById("bg-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        let nodes = [];
        let connections = [];
        let maxNodes = 50;
        let mouseX = -1000;
        let mouseY = -1000;
        
        // AI themed tokens floating in background
        const aiTerms = [
            "NeuralNet", "f(x)", "[0.98]", "Weights", "Token", 
            "API", "Tensor", "LLM", "Prompt", "Matrix", "Sigmoid"
        ];
        let termObjects = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            maxNodes = window.innerWidth < 768 ? 20 : 50;
            populateNodes();
            populateTerms();
        }
        window.addEventListener("resize", resize);

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        window.addEventListener("touchmove", (e) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
        });
        window.addEventListener("mouseleave", () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        class Node {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.radius = Math.random() * 2 + 1;
                this.glowColor = Math.random() > 0.5 ? "rgba(0, 242, 254, " : "rgba(155, 81, 224, ";
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.glowColor + "0.65)";
                ctx.fill();
            }
        }

        class Term {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 50;
                this.vy = - (Math.random() * 0.25 + 0.15);
                this.text = aiTerms[Math.floor(Math.random() * aiTerms.length)];
                this.opacity = Math.random() * 0.12 + 0.04;
                this.size = Math.floor(Math.random() * 5 + 10);
            }
            update() {
                this.y += this.vy;
                if (this.y < -20) this.reset();
            }
            draw() {
                ctx.font = `600 ${this.size}px 'Share Tech Mono', monospace`;
                ctx.fillStyle = `rgba(0, 242, 254, ${this.opacity})`;
                ctx.fillText(this.text, this.x, this.y);
            }
        }

        function populateNodes() {
            nodes = [];
            for (let i = 0; i < maxNodes; i++) {
                nodes.push(new Node());
            }
        }

        function populateTerms() {
            termObjects = [];
            const count = window.innerWidth < 768 ? 6 : 15;
            for (let i = 0; i < count; i++) {
                termObjects.push(new Term());
            }
        }

        resize();

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw floating AI terms
            termObjects.forEach(term => {
                term.update();
                term.draw();
            });

            // Draw neural nodes
            nodes.forEach((n1, idx) => {
                n1.update();
                n1.draw();

                // Mouse interaction glow lines
                const mDx = n1.x - mouseX;
                const mDy = n1.y - mouseY;
                const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
                if (mDist < 160) {
                    const alpha = (1 - mDist / 160) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                }

                // Connect adjacent nodes
                for (let j = idx + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        const alpha = (1 - dist / 140) * 0.16;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = n1.glowColor + `${alpha})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        }
        animate();
    }

    init();
});
