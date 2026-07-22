// Promptsmith - High-Trust Next-Gen Hybrid AI Prompt Expansion Engine

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
            title: "Beautiful Python Web Scraper",
            category: "Code & Tech",
            domain: "coding",
            idea: "Write a python web scrpe script using beautifulsoup to get product details."
        },
        {
            title: "Cold Email to Tech Recruiter",
            category: "Career & Business",
            domain: "business",
            idea: "Write a cold outreach email to a tech recruter for a software developer role."
        },
        {
            title: "Explain Quantum Physics simply",
            category: "Concept Explain",
            domain: "learning",
            idea: "Explain quantume physics in simple terms with a factory analogyy."
        },
        {
            title: "Cinematic Portrait Prompt",
            category: "Photo & Image AI",
            domain: "photo",
            idea: "A photograpgh of an old astronaut looking at a neon city on Mars."
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

    // Intent Detector for Auto-Detect fallback
    function detectIntent(userSentence) {
        const text = userSentence.toLowerCase();

        if (text.match(/photo|image|picture|edit|photograph|portrait|camera|lighting|midjourney|dall-e|photoshop|background|background removal|render|8k|lens|aspect ratio/)) {
            return "photo";
        }
        if (text.match(/code|python|javascript|react|html|css|sql|script|build|develop|bug|api|database|algorithm|function|scrape|web|app|debug|fix|program/)) {
            return "coding";
        }
        if (text.match(/email|job|resume|cover letter|recruiter|interview|business|sales|pitch|marketing|client|strategy|manager|career|post|linkedin/)) {
            return "business";
        }
        if (text.match(/explain|teach|understand|analogy|concept|math|physics|science|history|learn|study|roadmap|summary|difference|how does|why/)) {
            return "learning";
        }
        return "general";
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
            
            drawSineWave(waveCtx, waveCanvas, step, 11, "rgba(56, 189, 248, 0.65)", 1.5, 0.05);
            drawSineWave(waveCtx, waveCanvas, step + 2, 7, "rgba(129, 140, 248, 0.5)", 1.0, 0.08);
            drawSineWave(waveCtx, waveCanvas, step + 4, 14, "rgba(56, 189, 248, 0.2)", 2.0, 0.03);
            
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
                
                // Defensive extraction of punctuation prefixes and suffixes (prevents Null Pointer crash)
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

        promptOutput.value = "Optimizing via Live AI... Please wait...";
        promptOutput.style.opacity = "0.6";

        let systemInstruction = `You are a world-class prompt engineer. Your goal is to transform the user's raw idea into an extremely powerful, detailed, and context-expanded prompt targeting other LLM AI Agents (like ChatGPT, Claude, and Gemini).
DO NOT talk to the user. Do NOT write greetings, summaries, or conversational filler.
DO NOT use markdown code blocks (\`\`\` or \`\`\`markdown) to wrap your prompt.
Write ONLY the final prompt body itself. The prompt must start directly with the instruction directive (e.g. "Act as a..." or "You are...").
Ensure the engineered prompt is purely accurate, direct, and completely ready to run.

User Raw Idea: "${userIdea}"
Target Category: ${activeIntent.toUpperCase()}`;

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
            addToHistoryDebounced(userIdea, activeIntent);

        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("Live API Error:", err);
            promptOutput.style.opacity = "1";
            
            // Graceful Fallback to Local Engine
            generateLocalTemplate(userIdea, activeIntent);
        }
    }

    // -------------------------------------------------------------
    // 7. Offline Local Prompt Templates Generator
    // -------------------------------------------------------------
    function generateLocalTemplate(userIdea, activeIntent) {
        let promptText = "";

        if (activeIntent === "photo") {
            const isEditing = userIdea.toLowerCase().match(/edit|change|remove|replace|modify/);
            if (isEditing) {
                promptText = `ACT AS A DIGITAL RETOUCHER AND PHOTOSHOP AI SPECIALIST. Modify the following visual asset based on these instructions: "${userIdea}".

TECHNICAL PARAMETERS:
1. Composition: Align light source coordinates and contrast values between elements.
2. Feathering: Blend edges of replaced layers using a 1.5px radius mask to eliminate seams.
3. Light & Shadows: Match ambient light direction. Render contact shadows and soft cast shadows.
4. Color Balance: Match ambient Kelvin temperature to fit the background color space.
5. Manually edit Photoshop Exposure, Highlights, Shadows, and Color channels to complete the request.`;
            } else {
                promptText = `ACT AS A COMMERCIAL PHOTOGRAPHER. Generate an ultra-detailed image generation command matching this concept: "${userIdea}".

OUTPUT FORMAT (Write only this line):
/imagine prompt: ${userIdea}, shot on Hasselblad H6D-100c, 85mm lens, f/1.4 aperture, cinematic Rembrandt lighting, volumetric mist, hyperrealistic skin textures, 8k resolution, color graded in warm teal and orange --ar 16:9 --style raw --v 6.0`;
            }
        }
        else if (activeIntent === "coding") {
            let language = "modern code";
            if (userIdea.toLowerCase().match(/python/)) language = "Python 3.11+";
            else if (userIdea.toLowerCase().match(/javascript|js/)) language = "modern ES6+ JavaScript";
            else if (userIdea.toLowerCase().match(/react/)) language = "React 18";
            else if (userIdea.toLowerCase().match(/html|css/)) language = "semantic HTML5 & CSS Grid";
            else if (userIdea.toLowerCase().match(/sql/)) language = "PostgreSQL";

            let details = "";
            if (userIdea.toLowerCase().match(/scrape|scraper/)) {
                details = `
- Implement rotating User-Agents and custom headers to bypass scraping blocks.
- Wrap execution blocks in try-except statements managing HTTP 403, 429, and timeouts.
- Implement a 1.5s rate-limit delay between loops.
- Export all data structures into CSV.`;
            } else if (userIdea.toLowerCase().match(/react|app|web/)) {
                details = `
- Write clean functional components using React Hooks (useState, useEffect).
- Keep component states modular and implement useMemo optimizations.
- Ensure layouts are fully responsive and meet accessibility guidelines.`;
            } else if (userIdea.toLowerCase().match(/sql|database/)) {
                details = `
- Provide performance indexing recommendations.
- Avoid nested subqueries; use JOIN operations or Common Table Expressions (CTEs).`;
            }

            promptText = `ACT AS A PRINCIPAL SOFTWARE ARCHITECT. Write a production-grade, modular implementation in ${language} for: "${userIdea}".
${details}
STANDARDS:
1. Maintain clean variables and descriptive names.
2. Include try-catch validation blocks.
3. Write clean, readable code with inline comments.
4. Output a single copy-pasteable script including a mock runnable test case. Avoid conversational conversational intros.`;
        } 
        else if (activeIntent === "business") {
            const isEmail = userIdea.toLowerCase().match(/email|outreach|message/);
            if (isEmail) {
                promptText = `ACT AS A CONVERSION COPYWRITER. Write a high-converting cold outreach template targeting: "${userIdea}".

STRUCTURE CONSTRAINTS:
1. Provide 3 optimized subject lines under 6 words.
2. Hook: Lead with a personalized value hook in the first 2 sentences. No generic openings.
3. Core Value: Bullet point 2 achievements with quantifiable metrics.
4. CTA: Close with a low-barrier appointment scheduling question.
5. Limit total email length to under 150 words.`;
            } else {
                promptText = `ACT AS A STRATEGIC MANAGEMENT CONSULTANT. Formulate a business framework for: "${userIdea}".

STRUCTURE CONSTRAINTS:
1. Executive Summary: Provide a 3-sentence project objective.
2. Implementation Roadmap: Provide a step-by-step milestone timeline.
3. Success Metrics: Define 3 key performance indicators (KPIs).
4. Risk Profile: Outline 2 operational risks and mitigation plans.`;
            }
        }
        else if (activeIntent === "learning") {
            promptText = `ACT AS A FIRST-PRINCIPLES PEDAGOGIST. Explain this concept step-by-step: "${userIdea}".

DELIVERABLE LAYOUT:
1. Under 10s: Explain the core concept simply to a child.
2. Metaphor: Map the concept mechanics onto a familiar everyday object or system (e.g. plumbing/cooking).
3. Technical Terms: Explain the top 3 specialized terms.
4. Misconceptions: Correct 2 common myths.
5. Quiz: End with a 2-question self-check.`;
        }
        else {
            promptText = `ACT AS A SENIOR SUBJECT MATTER EXPERT. Deliver a highly detailed, professional execution plan for: "${userIdea}".

DELIVERABLE LAYOUT:
1. Executive Summary: Deliver a concise overview of the solution.
2. Technical Roadmap: Outline a step-by-step implementation guide covering all prerequisites.
3. Practical Application: Highlight 2 concrete examples of how this is applied in industry.
4. Format: Use clean markdown headers, bold terms, and structured list items. Avoid conversational greetings and start directly with the analysis.`;
        }

        promptOutput.value = promptText;
        updateStats();
        addToHistoryDebounced(userIdea, activeIntent);
    }

    // -------------------------------------------------------------
    // Main Orchestrator
    // -------------------------------------------------------------
    function generateMasterPrompt() {
        const userIdea = conceptInput.value.trim();
        if (!userIdea) {
            promptOutput.value = "";
            copyBtn.disabled = true;
            saveLibraryBtn.disabled = true;
            updateStats();
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

    // -------------------------------------------------------------
    // 8. Statistics Engine
    // -------------------------------------------------------------
    function updateStats() {
        const text = promptOutput.value;
        const charCount = text.length;
        const wordCount = charCount > 0 ? text.trim().split(/\s+/).length : 0;
        const tokenEstimate = Math.ceil(charCount / 4.1);
        
        statTokens.textContent = tokenEstimate;
        statWords.textContent = wordCount;
    }

    // -------------------------------------------------------------
    // 9. Persistence Operations (LocalStorage)
    // -------------------------------------------------------------
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
                        sidebar.classList.add("collapsed"); // Close library drawer on load
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
                    sidebar.classList.add("collapsed"); // Close library drawer on load
                });
            });
        }
    }

    function loadSavedConfig(item) {
        conceptInput.value = item.idea;
        updateClearBtnVisibility();
        promptOutput.value = item.prompt;
        updateStats();
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
    // 11. Technical AI Neural Data-Flow Background Canvas
    // -------------------------------------------------------------
    function initBgAnimation() {
        const canvas = document.getElementById("bg-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        let nodes = [];
        let pulses = [];
        let floatingGlyphs = [];
        let maxNodes = 45;
        const connectionDist = 140;
        let mouseX = -1000;
        let mouseY = -1000;
        
        const aiGlyphs = ["01", "10", "λ", "Σ", "f(x)", "AI", "GPT", "θ", "∇", "1", "0"];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            maxNodes = window.innerWidth < 768 ? 18 : 45;
            populateNodes();
            populateGlyphs();
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

        class NeuralNode {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.8 + 1.2;
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
                ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
                ctx.fill();
            }
        }

        class FloatingGlyph {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 50;
                this.vy = - (Math.random() * 0.4 + 0.2);
                this.char = aiGlyphs[Math.floor(Math.random() * aiGlyphs.length)];
                this.opacity = Math.random() * 0.2 + 0.05;
                this.size = Math.floor(Math.random() * 6 + 10);
            }
            update() {
                this.y += this.vy;
                if (this.y < -20) this.reset();
            }
            draw() {
                ctx.font = `${this.size}px 'Inter', monospace`;
                ctx.fillStyle = `rgba(129, 140, 248, ${this.opacity})`;
                ctx.fillText(this.char, this.x, this.y);
            }
        }

        function populateNodes() {
            nodes = [];
            for (let i = 0; i < maxNodes; i++) {
                nodes.push(new NeuralNode());
            }
        }

        function populateGlyphs() {
            floatingGlyphs = [];
            const glyphCount = window.innerWidth < 768 ? 10 : 20;
            for (let i = 0; i < glyphCount; i++) {
                floatingGlyphs.push(new FloatingGlyph());
            }
        }

        resize();

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < floatingGlyphs.length; i++) {
                floatingGlyphs[i].update();
                floatingGlyphs[i].draw();
            }

            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];
                n1.update();
                n1.draw();

                const mouseDx = n1.x - mouseX;
                const mouseDy = n1.y - mouseY;
                const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                if (mouseDist < 160) {
                    const alpha = (1 - mouseDist / 160) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }

                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();

                        if (Math.random() < 0.003) {
                            pulses.push({
                                x: n1.x, y: n1.y,
                                targetX: n2.x, targetY: n2.y,
                                progress: 0
                            });
                        }
                    }
                }
            }

            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += 0.04;
                const currX = p.x + (p.targetX - p.x) * p.progress;
                const currY = p.y + (p.targetY - p.y) * p.progress;

                ctx.beginPath();
                ctx.arc(currX, currY, 2, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                if (p.progress >= 1) {
                    pulses.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    init();
});
