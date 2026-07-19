// Promptsmith Professional App Logic & AI Tutor Engine

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const conceptInput = document.getElementById("concept-input");
    const clearInputBtn = document.getElementById("clear-input-btn");
    const personaRadios = document.querySelectorAll('input[name="persona"]');
    const depthBtns = document.querySelectorAll(".depth-btn");
    const formatRadios = document.querySelectorAll('input[name="format"]');
    
    // Add-on checkboxes
    const addAnalogy = document.getElementById("add-analogy");
    const addMisconception = document.getElementById("add-misconception");
    const addExamples = document.getElementById("add-examples");
    const addQuiz = document.getElementById("add-quiz");
    
    // Output & Buttons
    const promptOutput = document.getElementById("prompt-output");
    const copyBtn = document.getElementById("copy-btn");
    const resetBtn = document.getElementById("reset-btn");
    const saveLibraryBtn = document.getElementById("save-library-btn");
    const runTutorBtn = document.getElementById("run-tutor-btn");
    const toast = document.getElementById("toast");
    const presetsGrid = document.getElementById("presets-grid");

    // Collapsible Sidebar & Tabs
    const sidebar = document.getElementById("sidebar");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
    const frameworkTabs = document.querySelectorAll(".framework-tab");
    const editToggle = document.getElementById("edit-toggle");
    const editWarning = document.getElementById("edit-warning");
    const manualEditWrapper = document.getElementById("manual-edit-wrapper");
    
    const tabLinks = document.querySelectorAll(".tab-link");
    const tutorContainer = document.getElementById("tutor-container");
    const tutorLoader = document.getElementById("tutor-loader");
    const tutorContent = document.getElementById("tutor-content");

    // API Key Settings elements
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const saveKeysBtn = document.getElementById("save-keys-btn");
    const geminiKeyInput = document.getElementById("gemini-key-input");
    const openaiKeyInput = document.getElementById("openai-key-input");
    
    // Stats elements
    const statTokens = document.getElementById("stat-tokens");
    const statWords = document.getElementById("stat-words");
    const statFramework = document.getElementById("stat-framework");
    const statComplexity = document.getElementById("stat-complexity");
    
    // Header telemetry elements
    const tickerLoad = document.getElementById("ticker-load");
    const tickerAlign = document.getElementById("ticker-align");
    
    // Sidebar list elements
    const savedList = document.getElementById("saved-list");
    const historyList = document.getElementById("history-list");
    const savedCount = document.getElementById("saved-count");
    const clearHistoryBtn = document.getElementById("clear-history-btn");

    // App State
    let currentDepth = "overview"; // Default depth
    let currentFramework = "rtfc"; // Default framework
    let manualEditMode = false;
    let currentActiveTab = "prompt-tab"; // prompt-tab or tutor-tab

    // LocalStorage keys
    const LOCAL_SAVED_KEY = "promptsmith_saved_prompts";
    const LOCAL_HISTORY_KEY = "promptsmith_history_prompts";
    const LOCAL_GEMINI_KEY = "promptsmith_gemini_api_key";
    const LOCAL_OPENAI_KEY = "promptsmith_openai_api_key";

    // Pre-Baked Simulation Responses for Quick Start Presets
    const tutorSimulations = {
        "quantum computing": {
            html: `<h2>Quantum Computing Tutor Session</h2>
            <p><strong>Quantum Computing</strong> is a multidisciplinary field comprising aspects of computer science, physics, and mathematics that utilizes quantum mechanics to solve complex problems faster than on classical computers.</p>
            
            <h3>Core Mechanics</h3>
            <ul>
                <li><strong>Qubits</strong>: Unlike classical bits that can only be 0 or 1, qubits can exist in a superposition of states.</li>
                <li><strong>Superposition</strong>: The ability of a quantum system to be in multiple states at the same time until it is measured.</li>
                <li><strong>Entanglement</strong>: A quantum connection where qubits link instantly, such that the state of one qubit determines the state of another regardless of distance.</li>
            </ul>

            <h3>The Analogy Master Metaphor</h3>
            <p>Think of a classical computer bit like a light switch: it can either be <strong>ON (1)</strong> or <strong>OFF (0)</strong>. A quantum qubit is like a <strong>spinning coin</strong>. While it's spinning, it is not simply heads or tails; it is a rapid, fluid combination of both states simultaneously. Only when you stop the coin (measure it) does it collapse into a solid heads (1) or tails (0).</p>

            <h3>Common Misconceptions</h3>
            <p>⚠️ <em>"Quantum computers are just faster normal computers."</em><br>
            <strong>Correction:</strong> This is incorrect. Quantum computers aren't designed to run basic software or games faster. Instead, they excel at specific, highly complex mathematical operations—such as cryptography decryption, molecular modeling, and system optimizations—where classical computers would take billions of years to compute.</p>

            <h3>Interactive Checkpoint Quiz</h3>`,
            quiz: [
                {
                    question: "Which quantum mechanical property allows a qubit to represent a combination of 0 and 1 at the same time?",
                    options: ["Quantum Decoherence", "Superposition", "Quantum Entanglement", "Thermal Conduction"],
                    correctIndex: 1,
                    explanation: "Superposition is the state in which a qubit exists in a linear combination of multiple states simultaneously until it is measured."
                },
                {
                    question: "What is quantum entanglement?",
                    options: [
                        "When qubits overheat and get stuck.",
                        "A method to clone and duplicate quantum information.",
                        "A link where qubits share state instantly, regardless of physical separation.",
                        "A bug that crashes quantum compilers."
                    ],
                    correctIndex: 2,
                    explanation: "Quantum entanglement creates a link between qubits where measuring one instantly reveals the state of the other, defying classical distance limitations."
                }
            ]
        },
        "recursion": {
            html: `<h2>Recursion Tutor Session</h2>
            <p><strong>Recursion</strong> is a programming technique where a function calls itself directly or indirectly to solve a problem. It solves problems by breaking them down into smaller, self-similar sub-problems.</p>
            
            <h3>Core Components</h3>
            <ul>
                <li><strong>Base Case</strong>: The terminating condition that stops the recursion from calling itself infinitely.</li>
                <li><strong>Recursive Step</strong>: The part of the function where the problem is reduced in size and the function calls itself.</li>
            </ul>

            <h3>The Analogy Master Metaphor</h3>
            <p>Imagine you are looking at a mirror while holding another mirror behind you. You see a reflection inside a reflection, inside a reflection, stretching off into infinity. Each reflection is a smaller version of the same image (a recursive step). The base case is equivalent to when the light fades or your head blocks the view, stopping the endless loop.</p>

            <h3>Common Misconceptions</h3>
            <p>⚠️ <em>"Recursion is always faster and better than standard loops."</em><br>
            <strong>Correction:</strong> Actually, recursion often uses more memory because each self-call adds a new frame to the call stack. If the recursion goes too deep without hitting a base case, it triggers a <strong>Stack Overflow</strong> error, crashing the program.</p>

            <h3>Interactive Checkpoint Quiz</h3>`,
            quiz: [
                {
                    question: "What is the critical purpose of a 'Base Case' in a recursive function?",
                    options: [
                        "To define the main algorithm loop.",
                        "To stop the recursion and prevent stack overflow.",
                        "To initialize the system variables.",
                        "To export the code to a database."
                    ],
                    correctIndex: 1,
                    explanation: "Without a base case, a recursive function will loop infinitely until it runs out of stack memory, triggering a Stack Overflow."
                },
                {
                    question: "Why can recursive algorithms sometimes be less memory efficient than iterative loops?",
                    options: [
                        "They duplicate data arrays.",
                        "Each function call adds a new execution frame to the call stack.",
                        "They require complex compilers.",
                        "They run on different CPU cores."
                    ],
                    correctIndex: 1,
                    explanation: "Each recursive call allocates stack frame memory. If a function calls itself 10,000 times, 10,000 frames are created, unlike a loop which runs in place."
                }
            ]
        },
        "photosynthesis": {
            html: `<h2>Photosynthesis Tutor Session</h2>
            <p><strong>Photosynthesis</strong> is the biological process by which green plants, algae, and some bacteria convert light energy (usually from the sun) into chemical energy (glucose), using carbon dioxide and water.</p>
            
            <h3>Chemical Equation</h3>
            <p><code>6CO₂ + 6H₂O + Light Energy &rarr; C₆H₁₂O₆ + 6O₂</code></p>

            <h3>Reaction Phases</h3>
            <ul>
                <li><strong>Light-Dependent Reactions</strong>: Occur in the thylakoid membranes; absorb solar energy to generate ATP and NADPH, releasing oxygen.</li>
                <li><strong>Light-Independent Reactions (Calvin Cycle)</strong>: Occur in the stroma; use ATP and NADPH to convert carbon dioxide into sugar (glucose).</li>
            </ul>

            <h3>The Analogy Master Metaphor</h3>
            <p>Think of a plant leaf like a <strong>solar-powered kitchen</strong>. The solar panels on the roof (Chlorophyll) capture sunlight. The kitchen takes raw ingredients: water from the plumbing (roots) and air from the windows (stomata). The chef uses the solar power to bake bread (Glucose) for food, and releases the steam/waste out the back door (Oxygen).</p>

            <h3>Common Misconceptions</h3>
            <p>⚠️ <em>"Plants photosynthesize during the day and don't respire at night."</em><br>
            <strong>Correction:</strong> Plants respire (metabolize sugars for energy) constantly day and night. Photosynthesis only takes place when light is present to drive the chloroplasts, but cellular respiration is a 24/7 metabolic requirement.</p>

            <h3>Interactive Checkpoint Quiz</h3>`,
            quiz: [
                {
                    question: "Which cell pigment is responsible for capturing light energy?",
                    options: ["Hemoglobin", "Melanin", "Chlorophyll", "Carotenoid"],
                    correctIndex: 2,
                    explanation: "Chlorophyll is the green pigment in chloroplasts that absorbs light energy, primarily in the blue and red wavelengths."
                },
                {
                    question: "Where do the light-independent reactions (Calvin Cycle) take place within the chloroplast?",
                    options: ["Thylakoid Membrane", "Stroma", "Mitochondria", "Cell Wall"],
                    correctIndex: 1,
                    explanation: "The Calvin Cycle occurs in the stroma (the fluid-filled space surrounding the grana), utilizing ATP and NADPH generated in the thylakoids."
                }
            ]
        },
        "inflation": {
            html: `<h2>Inflation Tutor Session</h2>
            <p><strong>Inflation</strong> is the general progressive increase in prices and fall in the purchasing value of money over a given period of time.</p>
            
            <h3>Primary Drivers</h3>
            <ul>
                <li><strong>Demand-Pull Inflation</strong>: Occurs when aggregate demand for goods and services outpaces aggregate supply ("too much money chasing too few goods").</li>
                <li><strong>Cost-Push Inflation</strong>: Occurs when aggregate supply decreases due to increases in the cost of wages or raw materials, forcing prices up.</li>
            </ul>

            <h3>The Analogy Master Metaphor</h3>
            <p>Imagine you have a pot of thick tomato soup (the economy) and 10 meatballs (goods). If you pour a glass of water (print more currency) into the pot, you have more volume of soup, but each individual spoonful now has less tomato flavor and substance. Your money has been diluted; you need more spoonfuls (dollars) to get the same value.</p>

            <h3>Common Misconceptions</h3>
            <p>⚠️ <em>"Inflation makes absolutely everyone poorer."</em><br>
            <strong>Correction:</strong> Not everyone. While inflation hurts savers and consumers, it can actually benefit **debtors**. If you owe a fixed amount of debt, inflation makes the real value of that debt shrink because you pay it back with currency that is worth less than when you borrowed it.</p>

            <h3>Interactive Checkpoint Quiz</h3>`,
            quiz: [
                {
                    question: "What causes Cost-Push inflation to occur?",
                    options: [
                        "A reduction in interest rates by central banks.",
                        "An increase in production costs like wages and raw materials.",
                        "A sharp rise in consumer spending.",
                        "A drop in international export tariffs."
                    ],
                    correctIndex: 1,
                    explanation: "Cost-push inflation occurs when raw input costs rise, shifting the aggregate supply curve left and raising retail prices."
                },
                {
                    question: "Who generally benefits from unexpected high inflation?",
                    options: ["Fixed-income pensioners", "People holding cash savings", "Lenders who gave out fixed-rate loans", "Borrowers with fixed-rate debt"],
                    correctIndex: 3,
                    explanation: "Borrowers pay back debt with money that has less purchasing power, transferring wealth from the lender to the borrower."
                }
            ]
        },
        "existentialism": {
            html: `<h2>Existentialism Tutor Session</h2>
            <p><strong>Existentialism</strong> is a philosophical movement exploring the problem of human existence and centering on the experience of thinking, feeling, and acting individuals.</p>
            
            <h3>Core Tenets</h3>
            <ul>
                <li><strong>Existence Precedes Essence</strong>: Humans are not born with a predefined purpose. We exist first, and then we define our meaning and essence through our actions.</li>
                <li><strong>Radical Freedom</strong>: Humans are entirely free and, therefore, fully responsible for their choices and the shape of their lives.</li>
                <li><strong>Absurdity</strong>: The search for inherent meaning in a meaningless universe.</li>
            </ul>

            <h3>The Analogy Master Metaphor</h3>
            <p>Imagine you are placed in front of a completely blank canvas with a brush in your hand. There is no template, no pre-drawn lines, and no sketch to follow. You cannot ask a master painter what the painting 'should' be. You are entirely free—and forced—to paint whatever you choose. The painting's meaning is solely what you create.</p>

            <h3>Common Misconceptions</h3>
            <p>⚠️ <em>"Existentialism is just dark, depressing nihilism."</em><br>
            <strong>Correction:</strong> While nihilism claims there is no meaning and stops there, existentialism is actually **empowering**. It asserts that because there is no pre-established meaning, you have the ultimate freedom and responsibility to create your own meaning and live authentically.</p>

            <h3>Interactive Checkpoint Quiz</h3>`,
            quiz: [
                {
                    question: "What does the existentialist phrase 'Existence precedes essence' mean?",
                    options: [
                        "Your destiny is determined before you are born.",
                        "We are born first, and must define our own purpose through choice and action.",
                        "Physical matter is more important than thoughts.",
                        "Science can explain all human desires."
                    ],
                    correctIndex: 1,
                    explanation: "It means humans have no pre-built nature. We define who we are dynamically through the conscious actions we choose to take."
                },
                {
                    question: "Which philosopher is famous for outlining existentialism in his work 'Being and Nothingness'?",
                    options: ["Immanuel Kant", "Jean-Paul Sartre", "John Locke", "René Descartes"],
                    correctIndex: 1,
                    explanation: "Jean-Paul Sartre was the French philosopher who popularized twentieth-century existentialism, emphasizing radical freedom and bad faith."
                }
            ]
        }
    };

    // -------------------------------------------------------------
    // 1. Initializers & UI State Loader
    // -------------------------------------------------------------
    function init() {
        renderPresets();
        loadSidebarData();
        setupEventListeners();
        loadAPIKeys();
        resetForm();
        initBgAnimation();
        setupDiagnosticsLoop();
    }

    // Load saved keys from LocalStorage
    function loadAPIKeys() {
        const geminiKey = localStorage.getItem(LOCAL_GEMINI_KEY) || "";
        const openaiKey = localStorage.getItem(LOCAL_OPENAI_KEY) || "";
        geminiKeyInput.value = geminiKey;
        openaiKeyInput.value = openaiKey;
    }

    // -------------------------------------------------------------
    // 2. Settings Modal Events
    // -------------------------------------------------------------
    settingsBtn.addEventListener("click", () => {
        settingsModal.classList.add("active");
    });

    closeModalBtn.addEventListener("click", () => {
        settingsModal.classList.remove("active");
    });

    settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove("active");
        }
    });

    saveKeysBtn.addEventListener("click", () => {
        const geminiVal = geminiKeyInput.value.trim();
        const openaiVal = openaiKeyInput.value.trim();
        
        localStorage.setItem(LOCAL_GEMINI_KEY, geminiVal);
        localStorage.setItem(LOCAL_OPENAI_KEY, openaiVal);
        
        settingsModal.classList.remove("active");
        showToast("API Keys Saved successfully!");
    });

    // -------------------------------------------------------------
    // 3. Tab Workspace Switcher
    // -------------------------------------------------------------
    tabLinks.forEach(tab => {
        tab.addEventListener("click", (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            switchTab(targetTab);
        });
    });

    function switchTab(tabId) {
        tabLinks.forEach(t => {
            if (t.dataset.tab === tabId) t.classList.add("active");
            else t.classList.remove("active");
        });

        currentActiveTab = tabId;

        if (tabId === "prompt-tab") {
            promptOutput.style.display = "block";
            tutorContainer.style.display = "none";
            manualEditWrapper.style.display = "flex";
            if (manualEditMode) {
                editWarning.style.display = "flex";
            }
        } else {
            promptOutput.style.display = "none";
            tutorContainer.style.display = "flex";
            manualEditWrapper.style.display = "none";
            editWarning.style.display = "none";
        }
    }

    // -------------------------------------------------------------
    // 4. Quick Start Presets Loader
    // -------------------------------------------------------------
    function renderPresets() {
        presetsGrid.innerHTML = "";
        presetsGrid.innerHTML = presets.map((p, idx) => `
            <button class="preset-card" data-index="${idx}">
                <div style="font-size: 0.725rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--secondary); font-weight:600; margin-bottom:0.25rem;">${p.category}</div>
                <h4>${p.concept}</h4>
                <p>${p.desc}</p>
            </button>
        `).join("");

        // Attach event listeners
        document.querySelectorAll(".preset-card").forEach(card => {
            card.addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                loadPreset(idx);
            });
        });
    }

    function loadPreset(idx) {
        const p = presets[idx];
        conceptInput.value = p.concept;
        
        // Select Persona Radio
        personaRadios.forEach(radio => {
            radio.checked = radio.value === p.persona;
        });

        // Set Depth Button state
        currentDepth = p.depth;
        depthBtns.forEach(btn => {
            if (btn.dataset.depth === p.depth) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Select Format Radio
        formatRadios.forEach(radio => {
            radio.checked = radio.value === p.format;
        });

        // Select Framework Tab
        currentFramework = p.framework;
        frameworkTabs.forEach(tab => {
            if (tab.dataset.framework === p.framework) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });

        // Checkbox states
        addAnalogy.checked = !!p.addons.analogy;
        addMisconception.checked = !!p.addons.misconception;
        addExamples.checked = !!p.addons.examples;
        addQuiz.checked = !!p.addons.quiz;

        // Reset edit overrides on new preset selection
        exitManualEditMode();
        updateClearBtnVisibility();
        generatePrompt();
        
        // Switch back to Prompt tab on fresh preset load
        switchTab("prompt-tab");
        showToast("Preset loaded successfully!");
    }

    // -------------------------------------------------------------
    // 5. Prompt Engineering Formulas (RTFC, CARE, CREATE)
    // -------------------------------------------------------------
    function generatePrompt() {
        if (manualEditMode) return; // Do not overwrite user edits

        const concept = conceptInput.value.trim();
        if (!concept) {
            promptOutput.value = "";
            copyBtn.disabled = true;
            saveLibraryBtn.disabled = true;
            runTutorBtn.disabled = true;
            updateStats();
            return;
        }
        copyBtn.disabled = false;
        saveLibraryBtn.disabled = false;
        runTutorBtn.disabled = false;

        const personaVal = document.querySelector('input[name="persona"]:checked').value;
        const formatVal = document.querySelector('input[name="format"]:checked').value;

        const personaConfig = getPersonaConfig(personaVal);
        const depthConfig = getDepthConfig(currentDepth);
        const formatConfig = getFormatConfig(formatVal);
        const inclusions = getInclusions();

        let promptText = "";

        if (currentFramework === "rtfc") {
            promptText = `[ROLE]
${personaConfig}

[TASK]
Your core objective is to define and explain the concept of "${concept}".

[FORMAT]
${formatConfig}

[CONSTRAINTS]
- Explanation Depth: ${depthConfig}
${inclusions.length > 0 ? inclusions.map(inc => `- Inclusions: ${inc}`).join("\n") : ""}
- Maintain factual precision and avoid filler comments. Start writing the analysis directly.
- Explicitly identify underlying assumptions, boundaries, or prerequisites.

Let's think step-by-step.`;
        } 
        
        else if (currentFramework === "care") {
            const contextMap = {
                expert: `I require an academic-grade, rigorous comprehension of "${concept}" for technical study and engineering work.`,
                eli5: `I am trying to explain the abstract theory of "${concept}" to a younger, non-technical audience who needs immediate clarity.`,
                socratic: `I want to self-assess my understanding of "${concept}" from first-principles reasoning.`,
                analyst: `I am struggling to form an intuitive mental map of "${concept}" and need visual metaphors.`
            };
            
            promptText = `[CONTEXT]
${contextMap[personaVal]}
Tone Model: ${personaConfig}

[ACTION]
Formulate a comprehensive breakdown explaining the mechanics and definition of "${concept}". Depth targets: ${depthConfig}

[RESULT]
${formatConfig}
Ensure absolute clarity and scientific accuracy. Do not include greetings.

[EXAMPLES / ADDITIONS]
${inclusions.length > 0 ? `Structure the response to explicitly include the following details:\n${inclusions.join("\n")}` : "Ensure the explanation incorporates practical use-cases."}

Let's think step-by-step.`;
        } 
        
        else if (currentFramework === "create") {
            promptText = `[CHARACTER]
${personaConfig}

[REQUEST]
Define and explain the concept of "${concept}" with the following depth level: ${depthConfig}

[EXAMPLES & MODULES]
${inclusions.length > 0 ? `Make sure your response explicitly contains these blocks:\n${inclusions.join("\n")}` : "Include concrete real-world manifestations."}

[ADJUSTMENTS]
- Avoid fluff or preamble. Start directly with the definition.
- Specify prerequisites needed to grasp this concept.

[TYPE OF FORMATTING]
${formatConfig}

[EXTRAS]
Ensure high accuracy. Let's think step-by-step.`;
        }

        promptOutput.value = promptText;
        updateStats();
        
        addToHistoryDebounced(concept, currentFramework);
    }

    function getPersonaConfig(persona) {
        switch (persona) {
            case "expert": return "You are an elite academic professor and expert researcher. Your style is highly rigorous, technical, precise, and objective.";
            case "eli5": return "You are an engaging teacher skilled in explaining complex things to a smart 5-year-old child. Avoid jargon entirely, use simple terms, and formulate creative analogies.";
            case "socratic": return "You are a patient Socratic guide. Do not just define the concept. Guide the user by asking 1-2 constructive, logical questions to help them derive the answer.";
            case "analyst": return "You are a master of visualization and analogy engineering. Explain abstract items by mapping them onto highly relatable everyday mechanical models.";
            default: return "";
        }
    }

    function getDepthConfig(depth) {
        switch (depth) {
            case "overview": return "A high-level summary focus. Keep explanations brief, prioritizing the 'big picture'. Limit length to 2-3 paragraphs.";
            case "detailed": return "A detailed intermediate breakdown. Explain the sub-elements, core mechanics, and why the concept matters.";
            case "deepdive": return "An exhaustive, technical analysis. Cover underlying systems, etymology, exceptions, limitations, and edge-cases.";
            default: return "";
        }
    }

    function getFormatConfig(format) {
        switch (format) {
            case "markdown": return "Format the response as a clear Markdown document. Use structural headers (H2, H3), bolding for vital terminology, bullet points, and code/math blocks where appropriate.";
            case "qa": return "Format the response as a structured Q&A. Detail the 3 most essential questions a learner would ask about this, followed by direct, comprehensive answers.";
            case "mindmap": return "Format the response as a nested Markdown bullet outline representing a conceptual Mindmap (showing hierarchy, sub-nodes, and extensions).";
            case "cheat": return "Format the response as a dense, high-utility cheat sheet. Include a summary markdown table of parameters, and quick summary bullet points.";
            default: return "";
        }
    }

    // -------------------------------------------------------------
    // 6. Header Diagnostics Ticker Telemetry
    // -------------------------------------------------------------
    function setupDiagnosticsLoop() {
        // CPU load telemetry fluctuation simulation
        setInterval(() => {
            const mockLoad = Math.floor(Math.random() * 25) + 5; // 5% to 30%
            tickerLoad.textContent = `LOAD: ${mockLoad}%`;
        }, 3000);
        
        // Spotlight Mouse tracking
        document.addEventListener("mousemove", (e) => {
            document.body.style.setProperty("--mouse-x", `${e.clientX}px`);
            document.body.style.setProperty("--mouse-y", `${e.clientY}px`);
        });
    }

    function getInclusions() {
        let inclusions = [];
        if (addAnalogy.checked) inclusions.push("A clear, relatable analogy matching the concept to an everyday process.");
        if (addMisconception.checked) inclusions.push("Common Misconceptions: 2-3 ways people misunderstand this concept and why they are wrong.");
        if (addExamples.checked) inclusions.push("Real-world Applications: 2-3 practical examples of this concept operating in modern science or business.");
        if (addQuiz.checked) inclusions.push("Self-Assessment: 2 multiple-choice questions to test comprehension, with answers/rationales hidden inside a markdown details (spoiler) tag at the end.");
        return inclusions;
    }

    // -------------------------------------------------------------
    // 7. Statistics Engine
    // -------------------------------------------------------------
    function updateStats() {
        const text = promptOutput.value;
        const charCount = text.length;
        const wordCount = charCount > 0 ? text.trim().split(/\s+/).length : 0;
        const tokenEstimate = Math.ceil(charCount / 4.1);
        
        statTokens.textContent = tokenEstimate;
        statWords.textContent = wordCount;
        statFramework.textContent = currentFramework.toUpperCase();
        tickerAlign.textContent = `FRAME: ${currentFramework.toUpperCase()}`;

        let score = 0;
        if (currentDepth === "detailed") score += 1;
        if (currentDepth === "deepdive") score += 2;
        score += getInclusions().length;

        let complexity = "Low";
        if (score >= 3 && score < 5) complexity = "Medium";
        if (score >= 5) complexity = "High";
        
        statComplexity.textContent = complexity;
        if (complexity === "Low") statComplexity.style.color = "#10b981";
        else if (complexity === "Medium") statComplexity.style.color = "#fbbf24";
        else statComplexity.style.color = "#ef4444";
    }

    // -------------------------------------------------------------
    // 8. Manual Edit Mode
    // -------------------------------------------------------------
    editToggle.addEventListener("change", (e) => {
        manualEditMode = e.target.checked;
        if (manualEditMode) {
            promptOutput.removeAttribute("readonly");
            editWarning.style.display = "flex";
            promptOutput.focus();
        } else {
            exitManualEditMode();
            generatePrompt();
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
    // 9. AI Tutor Execution Engine (Simulated & Live Keys)
    // -------------------------------------------------------------
    runTutorBtn.addEventListener("click", () => {
        executeTutorSession();
    });

    function executeTutorSession() {
        const concept = conceptInput.value.trim();
        const prompt = promptOutput.value;
        if (!concept || !prompt) return;

        switchTab("tutor-tab");
        
        tutorLoader.style.display = "flex";
        tutorContent.innerHTML = "";
        tutorContent.style.display = "none";

        const geminiKey = localStorage.getItem(LOCAL_GEMINI_KEY);
        const openaiKey = localStorage.getItem(LOCAL_OPENAI_KEY);

        const simKey = concept.toLowerCase();
        
        if (geminiKey) {
            fetchGeminiAPI(geminiKey, prompt);
        } else if (openaiKey) {
            fetchOpenAIAPI(openaiKey, prompt);
        } else if (tutorSimulations[simKey]) {
            setTimeout(() => {
                renderSimulationTutor(tutorSimulations[simKey]);
            }, 1800);
        } else {
            setTimeout(() => {
                tutorLoader.style.display = "none";
                tutorContent.style.display = "block";
                tutorContent.innerHTML = `
                    <div class="empty-state" style="border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.02);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <h4 style="color: #f87171;">API Key Required</h4>
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; max-width: 320px; line-height: 1.4;">
                            You entered a custom concept <strong>"${concept}"</strong>. To process custom terms, please save a <strong>Gemini or OpenAI API Key</strong> in the Settings panel (gear icon in header).
                        </p>
                        <p style="font-size: 0.75rem; color: var(--secondary); margin-top: 0.5rem;">
                            <em>Tip: You can test the app instantly by clicking any preset card at the bottom (e.g. "Quantum Computing") in Simulation Mode.</em>
                        </p>
                    </div>
                `;
            }, 1000);
        }
    }

    function fetchGeminiAPI(apiKey, prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        })
        .then(response => {
            if (!response.ok) throw new Error("API call failed");
            return response.json();
        })
        .then(data => {
            const rawText = data.candidates[0].content.parts[0].text;
            renderMarkdownTutor(rawText);
        })
        .catch(err => {
            showAPIError(err.message);
        });
    }

    function fetchOpenAIAPI(apiKey, prompt) {
        const url = "https://api.openai.com/v1/chat/completions";
        
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            })
        })
        .then(response => {
            if (!response.ok) throw new Error("API call failed");
            return response.json();
        })
        .then(data => {
            const rawText = data.choices[0].message.content;
            renderMarkdownTutor(rawText);
        })
        .catch(err => {
            showAPIError(err.message);
        });
    }

    function showAPIError(msg) {
        tutorLoader.style.display = "none";
        tutorContent.style.display = "block";
        tutorContent.innerHTML = `
            <div class="empty-state" style="border-color: rgba(239, 68, 68, 0.2);">
                <h4 style="color: #f87171;">Connection Failed</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                    We encountered an error querying the model endpoint. Please verify that your API Key is valid and active.
                </p>
                <p style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace; margin-top: 0.5rem;">
                    Details: ${msg}
                </p>
            </div>
        `;
    }

    function renderMarkdownTutor(rawText) {
        tutorLoader.style.display = "none";
        tutorContent.style.display = "block";
        
        let parsedHTML = parseMarkdown(rawText);
        tutorContent.innerHTML = parsedHTML;
        tutorContent.scrollTop = 0;
    }

    function renderSimulationTutor(simulation) {
        tutorLoader.style.display = "none";
        tutorContent.style.display = "block";
        tutorContent.innerHTML = simulation.html;
        tutorContent.scrollTop = 0;

        if (addQuiz.checked && simulation.quiz) {
            const quizContainer = document.createElement("div");
            quizContainer.className = "quiz-container";
            
            simulation.quiz.forEach((q, qIdx) => {
                const questionEl = document.createElement("div");
                questionEl.className = "quiz-block";
                questionEl.innerHTML = `
                    <div class="quiz-question">${qIdx + 1}. ${escapeHTML(q.question)}</div>
                    <div class="quiz-options-list">
                        ${q.options.map((opt, oIdx) => `
                            <div class="quiz-option" data-q="${qIdx}" data-o="${oIdx}">
                                ${escapeHTML(opt)}
                            </div>
                        `).join("")}
                    </div>
                    <div class="quiz-explanation-box" id="explain-${qIdx}" style="display:none; font-size:0.75rem; color:var(--text-muted); margin-top:0.75rem; line-height:1.45; border-top:1px solid var(--border-color); padding-top:0.5rem;">
                        <strong>Explanation:</strong> ${escapeHTML(q.explanation)}
                    </div>
                `;
                quizContainer.appendChild(questionEl);
            });

            const submitBtn = document.createElement("button");
            submitBtn.className = "quiz-submit-btn";
            submitBtn.textContent = "Submit Answers";
            submitBtn.addEventListener("click", () => {
                gradeSimulationQuiz(simulation.quiz, submitBtn);
            });
            
            quizContainer.appendChild(submitBtn);
            tutorContent.appendChild(quizContainer);

            document.querySelectorAll(".quiz-option").forEach(opt => {
                opt.addEventListener("click", (e) => {
                    const optionEl = e.currentTarget;
                    const qIdx = optionEl.dataset.q;
                    
                    document.querySelectorAll(`.quiz-option[data-q="${qIdx}"]`).forEach(sibling => {
                        sibling.classList.remove("selected");
                    });
                    
                    optionEl.classList.add("selected");
                });
            });
        }
    }

    function gradeSimulationQuiz(questions, submitBtn) {
        let allAnswered = true;
        
        questions.forEach((q, qIdx) => {
            const selected = document.querySelector(`.quiz-option[data-q="${qIdx}"].selected`);
            if (!selected) {
                allAnswered = false;
            }
        });

        if (!allAnswered) {
            alert("Please answer all questions before submitting!");
            return;
        }

        questions.forEach((q, qIdx) => {
            const selected = document.querySelector(`.quiz-option[data-q="${qIdx}"].selected`);
            const selectedIndex = parseInt(selected.dataset.o);
            
            document.querySelectorAll(`.quiz-option[data-q="${qIdx}"]`).forEach(opt => {
                const optIndex = parseInt(opt.dataset.o);
                opt.style.pointerEvents = "none";
                
                if (optIndex === q.correctIndex) {
                    opt.classList.add("correct");
                } else if (optIndex === selectedIndex) {
                    opt.classList.add("incorrect");
                }
            });

            document.getElementById(`explain-${qIdx}`).style.display = "block";
        });

        submitBtn.disabled = true;
        submitBtn.textContent = "Graded";
        submitBtn.style.opacity = 0.5;
        submitBtn.style.cursor = "default";
        showToast("Quiz Graded! Check explanations.");
    }

    function parseMarkdown(md) {
        let html = md;
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n$/gim, '<br>');
        return html;
    }

    // -------------------------------------------------------------
    // 10. Persistence Operations (LocalStorage)
    // -------------------------------------------------------------
    saveLibraryBtn.addEventListener("click", () => {
        const concept = conceptInput.value.trim();
        const text = promptOutput.value;
        if (!concept || !text) return;

        const customName = prompt(`Enter a label for this saved prompt:`, `Prompt: ${concept} (${currentFramework.toUpperCase()})`);
        if (customName === null) return;
        
        const label = customName.trim() || `Prompt: ${concept}`;
        
        const savedItem = {
            id: "saved_" + Date.now(),
            label: label,
            concept: concept,
            framework: currentFramework,
            persona: document.querySelector('input[name="persona"]:checked').value,
            depth: currentDepth,
            format: document.querySelector('input[name="format"]:checked').value,
            addons: {
                analogy: addAnalogy.checked,
                misconception: addMisconception.checked,
                examples: addExamples.checked,
                quiz: addQuiz.checked
            },
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
    function addToHistoryDebounced(concept, framework) {
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            if (!concept) return;
            
            const historyItems = getLocalStorageData(LOCAL_HISTORY_KEY);
            if (historyItems.length > 0 && historyItems[0].concept === concept && historyItems[0].framework === framework) {
                return;
            }

            const historyItem = {
                id: "hist_" + Date.now(),
                concept: concept,
                framework: framework,
                persona: document.querySelector('input[name="persona"]:checked').value,
                depth: currentDepth,
                format: document.querySelector('input[name="format"]:checked').value,
                addons: {
                    analogy: addAnalogy.checked,
                    misconception: addMisconception.checked,
                    examples: addExamples.checked,
                    quiz: addQuiz.checked
                },
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
            savedList.innerHTML = `<div class="empty-state">No saved prompts yet. Click "Save to Library" on a generated prompt to store it.</div>`;
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
                        <span>Concept: ${escapeHTML(item.concept)}</span>
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
                        <div class="sidebar-item-title" style="font-weight: 500;">"${escapeHTML(item.concept)}"</div>
                    </div>
                    <div class="sidebar-item-meta">
                        <span style="color: var(--secondary); font-weight: 600;">${item.framework.toUpperCase()}</span>
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
        conceptInput.value = item.concept;
        
        personaRadios.forEach(radio => {
            radio.checked = radio.value === item.persona;
        });

        currentDepth = item.depth;
        depthBtns.forEach(btn => {
            if (btn.dataset.depth === item.depth) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        formatRadios.forEach(radio => {
            radio.checked = radio.value === item.format;
        });

        currentFramework = item.framework;
        frameworkTabs.forEach(tab => {
            if (tab.dataset.framework === item.framework) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });

        addAnalogy.checked = !!item.addons.analogy;
        addMisconception.checked = !!item.addons.misconception;
        addExamples.checked = !!item.addons.examples;
        addQuiz.checked = !!item.addons.quiz;

        exitManualEditMode();
        updateClearBtnVisibility();
        
        promptOutput.value = item.prompt;
        updateStats();
        
        switchTab("prompt-tab");
        showToast("Prompt configuration loaded!");
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
    // 11. General Event Bindings
    // -------------------------------------------------------------
    function setupEventListeners() {
        toggleSidebarBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });

        conceptInput.addEventListener("input", () => {
            updateClearBtnVisibility();
            generatePrompt();
        });

        clearInputBtn.addEventListener("click", () => {
            conceptInput.value = "";
            updateClearBtnVisibility();
            generatePrompt();
            conceptInput.focus();
        });

        personaRadios.forEach(radio => {
            radio.addEventListener("change", generatePrompt);
        });

        formatRadios.forEach(radio => {
            radio.addEventListener("change", generatePrompt);
        });

        depthBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                depthBtns.forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                currentDepth = e.currentTarget.dataset.depth;
                generatePrompt();
            });
        });

        frameworkTabs.forEach(tab => {
            tab.addEventListener("click", (e) => {
                frameworkTabs.forEach(t => t.classList.remove("active"));
                const target = e.currentTarget;
                target.classList.add("active");
                currentFramework = target.dataset.framework;
                generatePrompt();
            });
        });

        addAnalogy.addEventListener("change", generatePrompt);
        addMisconception.addEventListener("change", generatePrompt);
        addExamples.addEventListener("change", generatePrompt);
        addQuiz.addEventListener("change", generatePrompt);

        copyBtn.addEventListener("click", copyPrompt);
        resetBtn.addEventListener("click", resetForm);
    }

    function copyPrompt() {
        const textToCopy = promptOutput.value;
        if (!conceptInput.value.trim() && !textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Copied prompt to clipboard!");
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
        personaRadios.forEach((radio, idx) => {
            radio.checked = idx === 0;
        });
        currentDepth = "overview";
        depthBtns.forEach((btn, idx) => {
            if (idx === 0) btn.classList.add("active");
            else btn.classList.remove("active");
        });
        formatRadios.forEach((radio, idx) => {
            radio.checked = idx === 0;
        });
        
        currentFramework = "rtfc";
        frameworkTabs.forEach((tab, idx) => {
            if (idx === 0) tab.classList.add("active");
            else tab.classList.remove("active");
        });

        addAnalogy.checked = true;
        addMisconception.checked = true;
        addExamples.checked = true;
        addQuiz.checked = false;

        exitManualEditMode();
        updateClearBtnVisibility();
        generatePrompt();
        
        switchTab("prompt-tab");
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
            // Randomize starting Y coordinates for each column drop
            for (let x = 0; x < columns; x++) {
                drops[x] = Math.random() * -100;
            }
        }
        window.addEventListener("resize", resize);
        resize();
        
        // Matrix Rain & Radar draw function (runs ~30fps for CPU efficiency)
        function draw() {
            // Faint black background overlay to create character trails
            ctx.fillStyle = "rgba(2, 4, 11, 0.085)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 1. Draw Spinning HUD Radar scanner in bottom-right corner
            const radarX = canvas.width - 160;
            const radarY = canvas.height - 160;
            const radarRadius = 100;
            
            if (canvas.width > 768) {
                ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
                ctx.lineWidth = 1;
                
                // Draw Concentric Radar Rings
                for (let r = 25; r <= radarRadius; r += 25) {
                    ctx.beginPath();
                    ctx.arc(radarX, radarY, r, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                // Draw Radar Grid lines (Crosshairs)
                ctx.beginPath();
                ctx.moveTo(radarX - radarRadius - 10, radarY);
                ctx.lineTo(radarX + radarRadius + 10, radarY);
                ctx.moveTo(radarX, radarY - radarRadius - 10);
                ctx.lineTo(radarX, radarY + radarRadius + 10);
                ctx.stroke();
                
                // Draw Sweep Line
                radarSweepAngle += 0.035; // speed of sweep rotation
                ctx.beginPath();
                ctx.moveTo(radarX, radarY);
                ctx.lineTo(
                    radarX + Math.cos(radarSweepAngle) * radarRadius,
                    radarY + Math.sin(radarSweepAngle) * radarRadius
                );
                ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                // Draw rotating scan sweep cone highlight
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
                // Select binary character randomly
                const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
                
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                if (y > 0) {
                    // Calculate color shift based on screen height (fading purple to cyan)
                    const heightRatio = y / canvas.height;
                    const r = Math.floor(168 - heightRatio * 162); // 168 (purple) to 6 (cyan)
                    const g = Math.floor(85 + heightRatio * 97);   // 85 to 182
                    const b = Math.floor(247 - heightRatio * 35);  // 247 to 212
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.16 + 0.06})`; // Faint glowing stream
                    ctx.font = fontSize + "px 'Share Tech Mono', monospace";
                    ctx.fillText(char, x, y);
                }
                
                // Reset drop to top once it goes past screen base
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                } else {
                    drops[i]++;
                }
            }
        }
        
        // Loop at ~30 FPS
        setInterval(draw, 33);
    }

    // Run app initializers
    init();
});
