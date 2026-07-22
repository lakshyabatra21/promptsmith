// Promptsmith - Smart Intent-Aware ChatGPT & Image Prompt Generator Engine

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const conceptInput = document.getElementById("concept-input");
    const clearInputBtn = document.getElementById("clear-input-btn");
    const micBtn = document.getElementById("mic-btn");
    const listeningIndicator = document.getElementById("listening-container");
    const domainRadios = document.querySelectorAll('input[name="domain"]');
    const autocorrectBanner = document.getElementById("autocorrect-banner");
    const autocorrectText = document.getElementById("autocorrect-text");
    
    // Enhancers checkboxes
    const addStepByStep = document.getElementById("add-step-by-step");
    const addExamples = document.getElementById("add-examples");
    const addNoFluff = document.getElementById("add-no-fluff");
    const addFormatting = document.getElementById("add-formatting");
    
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

    // LocalStorage keys
    const LOCAL_SAVED_KEY = "promptsmith_saved_prompts";
    const LOCAL_HISTORY_KEY = "promptsmith_history_prompts";

    // Common technology & prompt typos dictionary
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

    // Sample Ideas
    const sampleIdeas = [
        {
            title: "Cinematic Portrait Photo",
            category: "Photo & Image AI",
            domain: "photo",
            idea: "A cinematic portrait of a cybernetic engineer in a futuristic neon lab, shot on 85mm lens, golden hour lighting, 8k hyperrealistic."
        },
        {
            title: "Product Background Editing",
            category: "Photo & Image AI",
            domain: "photo",
            idea: "Edit an existing product photo to place a luxury perfume bottle on a sleek black marble surface surrounded by soft water ripples."
        },
        {
            title: "Cold Job Outreach Email",
            category: "Job & Email",
            domain: "business",
            idea: "Write a high-converting, professional cold email to a tech recruiter expressing interest in a Software Engineer role."
        },
        {
            title: "Explain Neural Networks Simply",
            category: "Study & Explain",
            domain: "learning",
            idea: "Explain how Artificial Neural Networks learn using a factory assembly line analogyy."
        }
    ];

    // -------------------------------------------------------------
    // 1. Initializers
    // -------------------------------------------------------------
    function init() {
        renderSampleIdeas();
        loadSidebarData();
        setupEventListeners();
        setupVoiceDictation();
        resetForm();
        initBgAnimation();
    }

    // -------------------------------------------------------------
    // 2. Robust Web Speech API (Voice Dictation Module)
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
                    // Process spelling correction on input
                    processSpellingCorrection();
                    generateMasterPrompt();
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
        if (waveId) {
            cancelAnimationFrame(waveId);
            waveId = null;
        }
    }

    // -------------------------------------------------------------
    // Sine-wave visualizer animation
    // -------------------------------------------------------------
    function startVoiceWaveAnimation() {
        const waveCanvas = document.getElementById("voice-wave-canvas");
        if (!waveCanvas) return;
        const waveCtx = waveCanvas.getContext("2d");
        
        let step = 0;
        function render() {
            if (!isListening) return;
            waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
            step += 0.15;
            
            // Draw three overlapping sine waves (Cyan, Indigo, faint Purple)
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
        // Run auto-correction on loaded samples if necessary
        processSpellingCorrection();
        generateMasterPrompt();
        showToast("Sample prompt loaded!");
    }

    // -------------------------------------------------------------
    // 4. Live Spelling Auto-Correct System
    // -------------------------------------------------------------
    let autocorrectTimeout;
    function processSpellingCorrection() {
        const text = conceptInput.value;
        if (!text.trim()) {
            autocorrectBanner.style.display = "none";
            return;
        }

        // Tokenize words, check against autocorrect dictionary
        const words = text.split(/\s+/);
        let correctedWords = [];
        let correctedCount = 0;
        let correctionList = [];

        words.forEach(word => {
            // Strip punctuation for matching
            const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
            if (typoDict[cleanWord]) {
                const correctedValue = typoDict[cleanWord];
                // Keep original case if capitalized
                const isCapitalized = word[0] === word[0].toUpperCase();
                const replacement = isCapitalized 
                    ? correctedValue[0].toUpperCase() + correctedValue.slice(1)
                    : correctedValue;
                
                // Re-apply punctuation
                const puncStart = word.match(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']*/)[0];
                const puncEnd = word.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']*$/)[0];
                
                correctedWords.push(puncStart + replacement + puncEnd);
                correctedCount++;
                correctionList.push(`${cleanWord} → ${correctedValue}`);
            } else {
                correctedWords.push(word);
            }
        });

        if (correctedCount > 0) {
            conceptInput.value = correctedWords.join(" ");
            autocorrectText.textContent = `Auto-corrected spelling: ${correctionList.join(", ")}`;
            autocorrectBanner.style.display = "flex";

            clearTimeout(autocorrectTimeout);
            autocorrectTimeout = setTimeout(() => {
                autocorrectBanner.style.display = "none";
            }, 5000);
        }
    }

    // -------------------------------------------------------------
    // 5. Smart Intent & Photo/Image Generation Logic
    // -------------------------------------------------------------
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

        let promptText = "";

        if (activeIntent === "photo") {
            promptText = `[AI IMAGE & PHOTOGRAPHY GENERATION / EDITING PROMPT]

SUBJECT & CONCEPT REQUEST:
"${userIdea}"

OPTIMIZED MIDJOURNEY / DALL-E 3 / STABLE DIFFUSION PROMPT:
/imagine prompt: ${userIdea}, shot on 85mm f/1.4 lens, professional studio lighting, hyperrealistic, 8k resolution, ultra-detailed textures, volumetric atmospheric depth, photorealistic render, color graded --ar 16:9 --style raw --v 6.0

ChatGPT PHOTO EDITING INSTRUCTIONS (For ChatGPT Vision / Photoshop AI):
1. IMAGE COMPOSITION: Analyze the provided image and apply the edit specified: "${userIdea}".
2. LIGHTING & COLOR: Match key light directions, ambient fill shadows, and color temperature.
3. SUBJECT ISOLATION: Retain original subject sharpness while modifying background elements seamlessly.
4. FINAL OUTPUT: Provide step-by-step editing parameters (exposure, contrast, highlights, shadows, color balance) to achieve this look.`;
        }
        else if (activeIntent === "coding") {
            promptText = `[SYSTEM ROLE: SENIOR SOFTWARE ARCHITECT & ENGINEER]

PROJECT OBJECTIVE:
Develop a production-grade, optimized technical solution for the following request:
"${userIdea}"

TECHNICAL REQUIREMENTS & CODE SPECIFICATION:
1. CODE QUALITY: Write clean, modular, and well-commented code following industry best practices.
2. ARCHITECTURE: Include robust exception handling, edge-case checks, and optimal time/space complexity.
3. EXPLANATION: Include a brief technical walkthrough detailing key functions, dependencies, and setup steps.
${addExamples.checked ? "4. DEMO CODE: Provide a complete, runnable code sample that can be tested immediately.\n" : ""}${addNoFluff.checked ? "5. CONCISENESS: Skip conversational greetings. Start directly with the code solution.\n" : ""}
Let's build this step-by-step using clean code standards.`;
        } 
        else if (activeIntent === "business") {
            promptText = `[EXPERT ROLE: EXECUTIVE COMMUNICATIONS & STRATEGY CONSULTANT]

COMMUNICATION MISSION:
Formulate a high-impact, persuasive deliverable for the following request:
"${userIdea}"

STRATEGIC BLUEPRINT & STRUCTURE:
1. SUBJECT LINE / HEADING: Provide 3 high-converting title or subject line options.
2. HOOK & VALUE PROP: Begin with a compelling opening statement establishing immediate value.
3. CONCISENESS: Keep the body text concise, action-focused, and free of unnecessary fluff.
4. CALL-TO-ACTION (CTA): Conclude with a clear, friction-free next step for the reader.
${addFormatting.checked ? "5. LAYOUT: Format with clean headers, bold key phrases, and bullet points.\n" : ""}
Let's draft this professional response step-by-step.`;
        }
        else if (activeIntent === "learning") {
            promptText = `[PEDAGOGICAL ROLE: FIRST-PRINCIPLES EDUCATOR & CONCEPT ANALYST]

TEACHING GOAL:
Create a comprehensive, easy-to-understand breakdown for:
"${userIdea}"

MASTERCLASS STRUCTURE:
1. THE BIG PICTURE: Explain the core baseline concept in 2-3 simple, jargon-free sentences.
2. MENTAL MODEL & METAPHOR: Map the concept onto a relatable everyday analogy or real-world process.
3. CORE MECHANICS: Explain the top 3 key sub-components or underlying mechanisms.
4. COMMON MISCONCEPTIONS: Highlight 2 common misunderstandings people have about this topic and clarify why they are wrong.
${addStepByStep.checked ? "5. CHECKPOINT: End with a 2-question self-check quiz to test comprehension.\n" : ""}
Let's break down this concept step-by-step.`;
        }
        else {
            promptText = `[MASTER ROLE: SENIOR SUBJECT MATTER EXPERT & STRATEGIST]

TASK OVERVIEW:
Provide an authoritative, detailed, and structured response addressing:
"${userIdea}"

DELIVERABLE FRAMEWORK:
1. EXECUTIVE SUMMARY: Provide a high-level summary of the core solution.
2. ACTIONABLE STEPS: Detail a step-by-step methodology covering all primary milestones.
${addExamples.checked ? "3. PRACTICAL EXAMPLES: Include 2-3 real-world scenarios illustrating the solution.\n" : ""}${addNoFluff.checked ? "4. DIRECT OUTPUT: Eliminate conversational filler. Begin directly with Section 1.\n" : ""}
${addFormatting.checked ? "Format with clean Markdown headers, bold terms, and structured bullet points." : ""} Let me know if you need any adjustments.`;
        }

        promptOutput.value = promptText;
        updateStats();
        addToHistoryDebounced(userIdea, selectedDomain);
    }

    // -------------------------------------------------------------
    // 6. Statistics Engine
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
    // 7. Persistence Operations (LocalStorage)
    // -------------------------------------------------------------
    saveLibraryBtn.addEventListener("click", () => {
        const idea = conceptInput.value.trim();
        const text = promptOutput.value;
        if (!idea || !text) return;

        const customName = prompt(`Enter a label for this saved prompt:`, `Prompt: ${idea.substring(0, 30)}...`);
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
            if (historyItems.length > 20) historyItems.pop();
            
            setLocalStorageData(LOCAL_HISTORY_KEY, historyItems);
            loadSidebarData();
        }, 1200);
    }

    function loadSidebarData() {
        const saved = getLocalStorageData(LOCAL_SAVED_KEY);
        const history = getLocalStorageData(LOCAL_HISTORY_KEY);

        savedCount.textContent = saved.length;

        savedList.innerHTML = "";
        if (saved.length === 0) {
            savedList.innerHTML = `<div class="empty-state">No saved prompts yet. Click "Save" to store a prompt.</div>`;
        } else {
            savedList.innerHTML = saved.map(item => `
                <div class="sidebar-item" data-id="${item.id}">
                    <div class="sidebar-item-header">
                        <div class="sidebar-item-title">${escapeHTML(item.label)}</div>
                        <button class="sidebar-item-delete" data-id="${item.id}" title="Delete Saved Prompt">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
                    }
                });
            });
        }

        historyList.innerHTML = "";
        if (history.length === 0) {
            historyList.innerHTML = `<div class="empty-state">Your recent generations will appear here.</div>`;
        } else {
            historyList.innerHTML = history.map(item => `
                <div class="sidebar-item" data-id="${item.id}">
                    <div class="sidebar-item-header">
                        <div class="sidebar-item-title" style="font-weight: 500;">"${escapeHTML(item.idea.substring(0, 35))}..."</div>
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
    // 8. Event Bindings & Utilities
    // -------------------------------------------------------------
    function setupEventListeners() {
        toggleSidebarBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });

        conceptInput.addEventListener("input", () => {
            updateClearBtnVisibility();
            // Process spelling correction on input
            processSpellingCorrection();
            generateMasterPrompt();
        });

        clearInputBtn.addEventListener("click", () => {
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

        addStepByStep.addEventListener("change", generateMasterPrompt);
        addExamples.addEventListener("change", generateMasterPrompt);
        addNoFluff.addEventListener("change", generateMasterPrompt);
        addFormatting.addEventListener("change", generateMasterPrompt);

        copyBtn.addEventListener("click", copyPrompt);
        resetBtn.addEventListener("click", resetForm);
    }

    function copyPrompt() {
        const textToCopy = promptOutput.value;
        if (!conceptInput.value.trim() && !textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Copied Master Prompt to clipboard!");
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
        conceptInput.value = "";
        stopListening();
        autocorrectBanner.style.display = "none";
        domainRadios.forEach((radio, idx) => {
            radio.checked = idx === 0;
        });

        addStepByStep.checked = true;
        addExamples.checked = true;
        addNoFluff.checked = true;
        addFormatting.checked = true;

        updateClearBtnVisibility();
        generateMasterPrompt();
    }

    // -------------------------------------------------------------
    // 9. Technical AI Neural Data-Flow Background Canvas
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
