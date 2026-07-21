// Promptsmith - Accurate ChatGPT Prompt Generator Engine

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const conceptInput = document.getElementById("concept-input");
    const clearInputBtn = document.getElementById("clear-input-btn");
    const domainRadios = document.querySelectorAll('input[name="domain"]');
    
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

    // LocalStorage keys
    const LOCAL_SAVED_KEY = "promptsmith_saved_prompts";
    const LOCAL_HISTORY_KEY = "promptsmith_history_prompts";

    // Realistic Sample Ideas for Users
    const sampleIdeas = [
        {
            title: "Cold Job Outreach Email",
            category: "Job & Email",
            domain: "business",
            idea: "Write a high-converting, professional cold email to a tech recruiter expressing interest in a Software Engineer role."
        },
        {
            title: "Python Web Scraper Script",
            category: "Coding & Tech",
            domain: "coding",
            idea: "Create a modular Python script using BeautifulSoup to scrape product prices from an e-commerce site and save to CSV."
        },
        {
            title: "Explain Neural Networks Simply",
            category: "Study & Explain",
            domain: "learning",
            idea: "Explain how Artificial Neural Networks learn using a relatable factory assembly line analogy."
        },
        {
            title: "7-Day SQL Query Study Plan",
            category: "Study & Explain",
            domain: "learning",
            idea: "Create a 7-day intensive study roadmap for mastering SQL database queries, joins, and performance indexing."
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
    }

    // -------------------------------------------------------------
    // 2. Render Sample Ideas
    // -------------------------------------------------------------
    function renderSampleIdeas() {
        presetsGrid.innerHTML = "";
        presetsGrid.innerHTML = sampleIdeas.map((item, idx) => `
            <button class="preset-card" data-index="${idx}">
                <div style="font-size: 0.725rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); font-weight:700; margin-bottom:0.25rem;">${item.category}</div>
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

        updateClearBtnVisibility();
        generateMasterPrompt();
        showToast("Sample prompt loaded!");
    }

    // -------------------------------------------------------------
    // 3. Sentence-to-Master Prompt Transformer Logic
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
        const roleConfig = getRoleConfig(selectedDomain);

        let rules = [];
        if (addStepByStep.checked) rules.push("- Break down your reasoning step-by-step before providing the final answer.");
        if (addExamples.checked) rules.push("- Include concrete, practical real-world examples (and code blocks if applicable).");
        if (addNoFluff.checked) rules.push("- Omit introductory pleasantries or fluff comments. Begin directly with the solution.");
        if (addFormatting.checked) rules.push("- Structure the output cleanly in Markdown using headers (H2, H3), bold key terms, and bulleted lists.");

        const promptText = `[ROLE & EXPERT PERSONA]
${roleConfig}

[PRIMARY GOAL]
Directly address and fulfill the following user request:
"${userIdea}"

[CONSTRAINTS & QUALITY RULES]
${rules.length > 0 ? rules.join("\n") : "- Provide an accurate and comprehensive response."}
- Explicitly identify any edge-cases, assumptions, or limitations.

Let's think step-by-step to achieve the best result.`;

        promptOutput.value = promptText;
        updateStats();
        addToHistoryDebounced(userIdea, selectedDomain);
    }

    function getRoleConfig(domain) {
        switch (domain) {
            case "coding": return "Act as a Senior Software Architect and Senior Engineer. Provide robust, clean, and highly optimized technical code solutions adhering to industry best practices.";
            case "business": return "Act as an Executive Business Consultant and Professional Copywriter. Provide high-impact, persuasive, and structured responses.";
            case "learning": return "Act as an Expert First-Principles Educator. Explain complex topics using clear intuition, analogies, and structured breakdowns.";
            default: return "Act as an expert AI Assistant specializing in high-accuracy analysis, clear writing, and logical problem solving.";
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
    }

    // -------------------------------------------------------------
    // 5. Persistence Operations (LocalStorage)
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
    // 6. Event Bindings & Utilities
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

        addStepByStep.checked = true;
        addExamples.checked = true;
        addNoFluff.checked = true;
        addFormatting.checked = true;

        updateClearBtnVisibility();
        generateMasterPrompt();
    }

    // Clean Ambient Particle Motion Canvas Animation
    function initBgAnimation() {
        const canvas = document.getElementById("bg-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        let particles = [];
        const maxParticles = 30;
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", resize);
        resize();
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                this.radius = Math.random() * 1.5 + 1;
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
                ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
                ctx.fill();
            }
        }
        
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    init();
});
