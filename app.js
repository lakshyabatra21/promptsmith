// Promptsmith - Freeform Idea to ChatGPT Master Prompt Generator Engine

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const conceptInput = document.getElementById("concept-input"); // Freeform Idea Textarea
    const clearInputBtn = document.getElementById("clear-input-btn");
    const domainRadios = document.querySelectorAll('input[name="domain"]');
    const toneBtns = document.querySelectorAll('.depth-btn[data-tone]');
    
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

    // Collapsible Sidebar
    const sidebar = document.getElementById("sidebar");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
    const editToggle = document.getElementById("edit-toggle");
    const editWarning = document.getElementById("edit-warning");
    const manualEditWrapper = document.getElementById("manual-edit-wrapper");
    
    // Stats elements
    const statTokens = document.getElementById("stat-tokens");
    const statWords = document.getElementById("stat-words");
    const statQuality = document.getElementById("stat-quality");
    
    // Header telemetry elements
    const tickerLoad = document.getElementById("ticker-load");
    const tickerAlign = document.getElementById("ticker-align");
    
    // Sidebar list elements
    const savedList = document.getElementById("saved-list");
    const historyList = document.getElementById("history-list");
    const savedCount = document.getElementById("saved-count");
    const clearHistoryBtn = document.getElementById("clear-history-btn");

    // App State
    let currentTone = "expert"; // Default tone
    let currentDomain = "general"; // Default domain
    let manualEditMode = false;

    // LocalStorage keys
    const LOCAL_SAVED_KEY = "promptsmith_saved_prompts";
    const LOCAL_HISTORY_KEY = "promptsmith_history_prompts";

    // Sample Example Ideas for quick testing
    const sampleIdeas = [
        {
            title: "Cold Email to Recruiter",
            category: "Job & Business",
            domain: "business",
            tone: "expert",
            idea: "Write a high-converting, professional cold email to a tech recruiter expressing interest in a Full-Stack Software Engineering role."
        },
        {
            title: "Python Web Scraper",
            category: "Coding & Tech",
            domain: "coding",
            tone: "expert",
            idea: "Create a modular Python script using BeautifulSoup to scrape product prices from an e-commerce website and export the clean data to CSV."
        },
        {
            title: "Explain Neural Networks",
            category: "Study & Concept",
            domain: "learning",
            tone: "simple",
            idea: "Explain how Artificial Neural Networks learn and adjust weights using a relatable factory assembly line analogy."
        },
        {
            title: "7-Day SQL Study Roadmap",
            category: "Study & Exam Prep",
            domain: "learning",
            tone: "expert",
            idea: "Create an intensive 7-day study roadmap for mastering SQL database queries, joins, and performance indexing from scratch."
        }
    ];

    // -------------------------------------------------------------
    // 1. Initializers
    // -------------------------------------------------------------
    function init() {
        renderSampleIdeas();
        loadSidebarData();
        setupEventListeners();
        resetForm();
        initBgAnimation();
        setupDiagnosticsLoop();
    }

    // -------------------------------------------------------------
    // 2. Render Quick Sample Ideas
    // -------------------------------------------------------------
    function renderSampleIdeas() {
        presetsGrid.innerHTML = "";
        presetsGrid.innerHTML = sampleIdeas.map((item, idx) => `
            <button class="preset-card" data-index="${idx}">
                <div style="font-size: 0.725rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--secondary); font-weight:600; margin-bottom:0.25rem;">${item.category}</div>
                <h4>${item.title}</h4>
                <p>"${item.idea}"</p>
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
        currentDomain = item.domain;

        currentTone = item.tone;
        toneBtns.forEach(btn => {
            if (btn.dataset.tone === item.tone) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        exitManualEditMode();
        updateClearBtnVisibility();
        generateMasterPrompt();
        showToast("Example idea loaded!");
    }

    // -------------------------------------------------------------
    // 3. Freeform Sentence-to-Prompt Engine
    // -------------------------------------------------------------
    function generateMasterPrompt() {
        if (manualEditMode) return;

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
        currentDomain = selectedDomain;

        const roleConfig = getRoleConfig(selectedDomain);
        const toneConfig = getToneConfig(currentTone);

        let instructionsList = [];
        if (addStepByStep.checked) instructionsList.push("- Break down your reasoning step-by-step using first-principles logic before providing the final answer.");
        if (addExamples.checked) instructionsList.push("- Include concrete, practical real-world examples (and well-commented code snippets if relevant).");
        if (addNoFluff.checked) instructionsList.push("- Omit introductory pleasantries, filler phrases, or conversational preamble. Begin directly with the core solution.");
        if (addFormatting.checked) instructionsList.push("- Format the response cleanly in Markdown using structural headers (H2, H3), bolding for vital terminology, bullet points, and syntax-highlighted code blocks.");

        const promptText = `[ROLE & EXPERT PERSONA]
${roleConfig}

[PRIMARY OBJECTIVE]
Your goal is to address the following user request in full detail:
"${userIdea}"

[TONE & INSTRUCTION STYLE]
${toneConfig}

[EXECUTION CONSTRAINTS & REQUIREMENTS]
${instructionsList.length > 0 ? instructionsList.join("\n") : "- Provide a clear, thorough, and highly accurate response."}
- Explicitly state any underlying assumptions, prerequisites, or potential edge-cases.

Let me know if you need any clarifying details before beginning. Let's think step-by-step.`;

        promptOutput.value = promptText;
        updateStats();
        addToHistoryDebounced(userIdea, currentDomain);
    }

    function getRoleConfig(domain) {
        switch (domain) {
            case "coding": return "Act as an elite Senior Software Architect and Principal Engineer. Your code solutions should be robust, clean, modular, and adhere to industry best practices.";
            case "business": return "Act as a top-tier Executive Consultant and Professional Communications Strategist. Your responses should be persuasive, polished, structured, and high-impact.";
            case "learning": return "Act as a world-class Academic Instructor and First-Principles Educator. You excel at taking complex topics and breaking them down into digestible, intuitive mental models.";
            default: return "Act as a knowledgeable, highly capable AI Assistant with deep expertise across technology, strategy, and analytical problem-solving.";
        }
    }

    function getToneConfig(tone) {
        switch (tone) {
            case "expert": return "Maintain an authoritative, precise, and academically rigorous tone. Prioritize technical accuracy, depth, and structured logic.";
            case "simple": return "Use clear, intuitive language. Avoid unnecessary jargon, use simple analogies, and explain terms clearly as if teaching a beginner.";
            case "creative": return "Adopt an engaging, dynamic, and imaginative style. Use vivid metaphors and compelling framing to bring the response to life.";
            default: return "Maintain a clear, professional, and helpful tone.";
        }
    }

    // -------------------------------------------------------------
    // 4. Statistics Engine
    // -------------------------------------------------------------
    function updateStats() {
        const text = promptOutput.value;
        const charCount = text.length;
        const wordCount = charCount > 0 ? text.trim().split(/\s+/).length : 0;
        const tokenEstimate = Math.ceil(charCount / 4.1);
        
        statTokens.textContent = tokenEstimate;
        statWords.textContent = wordCount;
        tickerAlign.textContent = `MODE: ${currentDomain.toUpperCase()} TRANSFORMER`;
    }

    // -------------------------------------------------------------
    // 5. Diagnostics Telemetry & Mouse Spotlight
    // -------------------------------------------------------------
    function setupDiagnosticsLoop() {
        setInterval(() => {
            const mockLoad = Math.floor(Math.random() * 20) + 5;
            tickerLoad.textContent = `LOAD: ${mockLoad}%`;
        }, 3000);
        
        document.addEventListener("mousemove", (e) => {
            document.body.style.setProperty("--mouse-x", `${e.clientX}px`);
            document.body.style.setProperty("--mouse-y", `${e.clientY}px`);
        });
    }

    // -------------------------------------------------------------
    // 6. Manual Edit Mode
    // -------------------------------------------------------------
    editToggle.addEventListener("change", (e) => {
        manualEditMode = e.target.checked;
        if (manualEditMode) {
            promptOutput.removeAttribute("readonly");
            editWarning.style.display = "flex";
            promptOutput.focus();
        } else {
            exitManualEditMode();
            generateMasterPrompt();
        }
    });

    function exitManualEditMode() {
        manualEditMode = false;
        editToggle.checked = false;
        promptOutput.setAttribute("readonly", true);
        editWarning.style.display = "none";
    }

    promptOutput.addEventListener("input", () => {
        if (manualEditMode) {
            updateStats();
        }
    });

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
            domain: currentDomain,
            tone: currentTone,
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
                domain: domain,
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
            savedList.innerHTML = `<div class="empty-state">No saved prompts yet. Generate a prompt and click "Save to Library" to store it.</div>`;
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
                        <span>${item.domain.toUpperCase()}</span>
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
            historyList.innerHTML = `<div class="empty-state">Your recent generated prompts will appear here.</div>`;
        } else {
            historyList.innerHTML = history.map(item => `
                <div class="sidebar-item" data-id="${item.id}">
                    <div class="sidebar-item-header">
                        <div class="sidebar-item-title" style="font-weight: 500;">"${escapeHTML(item.idea.substring(0, 35))}..."</div>
                    </div>
                    <div class="sidebar-item-meta">
                        <span style="color: var(--secondary); font-weight: 600;">${item.domain.toUpperCase()}</span>
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
        
        domainRadios.forEach(radio => {
            radio.checked = radio.value === item.domain;
        });

        currentTone = item.tone || "expert";
        toneBtns.forEach(btn => {
            if (btn.dataset.tone === currentTone) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        exitManualEditMode();
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
    // 8. General Event Bindings
    // -------------------------------------------------------------
    function setupEventListeners() {
        toggleSidebarBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });

        conceptInput.addEventListener("input", () => {
            updateClearBtnVisibility();
            generateMasterPrompt();
        });

        clearInputBtn.addEventListener("click", () => {
            conceptInput.value = "";
            updateClearBtnVisibility();
            generateMasterPrompt();
            conceptInput.focus();
        });

        domainRadios.forEach(radio => {
            radio.addEventListener("change", generateMasterPrompt);
        });

        toneBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                toneBtns.forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                currentTone = e.currentTarget.dataset.tone;
                generateMasterPrompt();
            });
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
            clearInputBtn.style.display = "block";
        } else {
            clearInputBtn.style.display = "none";
        }
    }

    function resetForm() {
        conceptInput.value = "";
        domainRadios.forEach((radio, idx) => {
            radio.checked = idx === 0;
        });
        currentTone = "expert";
        toneBtns.forEach((btn, idx) => {
            if (idx === 0) btn.classList.add("active");
            else btn.classList.remove("active");
        });

        addStepByStep.checked = true;
        addExamples.checked = true;
        addNoFluff.checked = true;
        addFormatting.checked = true;

        exitManualEditMode();
        updateClearBtnVisibility();
        generateMasterPrompt();
    }

    // Holographic Matrix Binary Rain & Tech Radar Canvas Animation
    function initBgAnimation() {
        const canvas = document.getElementById("bg-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        let columns;
        let drops = [];
        const fontSize = 14;
        const binaryChars = "01".split("");
        let radarSweepAngle = 0;
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = [];
            for (let x = 0; x < columns; x++) {
                drops[x] = Math.random() * -100;
            }
        }
        window.addEventListener("resize", resize);
        resize();
        
        function draw() {
            ctx.fillStyle = "rgba(2, 4, 11, 0.085)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 1. Draw Spinning HUD Radar scanner in bottom-right corner
            const radarX = canvas.width - 160;
            const radarY = canvas.height - 160;
            const radarRadius = 100;
            
            if (canvas.width > 768) {
                ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
                ctx.lineWidth = 1;
                
                for (let r = 25; r <= radarRadius; r += 25) {
                    ctx.beginPath();
                    ctx.arc(radarX, radarY, r, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                ctx.beginPath();
                ctx.moveTo(radarX - radarRadius - 10, radarY);
                ctx.lineTo(radarX + radarRadius + 10, radarY);
                ctx.moveTo(radarX, radarY - radarRadius - 10);
                ctx.lineTo(radarX, radarY + radarRadius + 10);
                ctx.stroke();
                
                radarSweepAngle += 0.035;
                ctx.beginPath();
                ctx.moveTo(radarX, radarY);
                ctx.lineTo(
                    radarX + Math.cos(radarSweepAngle) * radarRadius,
                    radarY + Math.sin(radarSweepAngle) * radarRadius
                );
                ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(radarX, radarY);
                ctx.arc(
                    radarX, radarY, radarRadius, 
                    radarSweepAngle - 0.25, radarSweepAngle, false
                );
                ctx.closePath();
                ctx.fillStyle = "rgba(6, 182, 212, 0.015)";
                ctx.fill();
            }
            
            // 2. Draw Falling Matrix Binary Rain
            for (let i = 0; i < drops.length; i++) {
                const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
                
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                if (y > 0) {
                    const heightRatio = y / canvas.height;
                    const r = Math.floor(168 - heightRatio * 162);
                    const g = Math.floor(85 + heightRatio * 97);
                    const b = Math.floor(247 - heightRatio * 35);
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.16 + 0.06})`;
                    ctx.font = fontSize + "px 'Share Tech Mono', monospace";
                    ctx.fillText(char, x, y);
                }
                
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                } else {
                    drops[i]++;
                }
            }
        }
        
        setInterval(draw, 33);
    }

    init();
});
