// Improved JS with enhancements, cleanup, and optional new features

// --- AUDIO -------------------------------------------------------
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');

// --- QUIZ DATA ---------------------------------------------------
const quizData = [
    { question: "What does 'let' declare in JavaScript?", options: ["A constant value", "A changeable variable", "A function", "An array"], correct: 1 },
    { question: "Which is the strict equality operator?", options: ["==", "=", "===", "!="], correct: 2 },
    { question: "What is the purpose of a for loop?", options: ["To declare variables", "To repeat code a set number of times", "To handle events", "To style elements"], correct: 1 },
    { question: "How do you select an element by ID in the DOM?", options: ["querySelector", "getElementById", "createElement", "appendChild"], correct: 1 },
    { question: "What is a JavaScript closure?", options: ["Function inside another remembering outer variables", "A block of code", "A variable scope", "Event listener type"], correct: 0 },
    { question: "What does async/await simplify?", options: ["Loops", "Error handling", "Async code readability", "CSS styling"], correct: 2 }
];

// --- STATE -------------------------------------------------------
let currentQuestion = 0;
let score = 0;
let selectedAnswer = -1;
let timerInterval;
let timeLeft = 30;
let highScore = localStorage.getItem('jsQuizHighScore') || 0;
const totalQuestions = quizData.length;

// --- DOM ELEMENTS ------------------------------------------------
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const perfectSound = document.getElementById('perfect-sound');
const startBtn = document.getElementById('start-btn');

// --- PROGRESS BAR ------------------------------------------------
function updateProgress() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = totalQuestions;
}

// --- TIMER -------------------------------------------------------
function startTimer() {
    timeLeft = 30;
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('timer-text').textContent = timeLeft;
    document.getElementById('timer-fill').style.width = '100%';

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-text').textContent = timeLeft;
        document.getElementById('timer-fill').style.width = (timeLeft / 30 * 100) + '%';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion();
        }
    }, 1000);
}

function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        document.getElementById('timer-container').style.display = 'none';
    }
}

// --- LOAD QUESTION ----------------------------------------------
function loadQuestion() {
    try {
        const q = quizData[currentQuestion];
        if (!q) throw new Error('Missing question data');

        document.getElementById('question').textContent = q.question;
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';

        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.classList.add('option');
            btn.onclick = () => selectOption(index);
            optionsDiv.appendChild(btn);
        });

        document.getElementById('next-btn').style.display = 'none';
        selectedAnswer = -1;

        updateProgress();
        startTimer();
    } catch (err) {
        console.error('Failed loading question:', err);
        document.getElementById('question').innerHTML = `<span style="color:red">Error loading question.</span>`;
    }
}

// --- SELECT OPTION ----------------------------------------------
function selectOption(index) {
    if (selectedAnswer !== -1) return;
    selectedAnswer = index;
    clearTimer();

    const options = document.querySelectorAll('.option');
    const correctIndex = quizData[currentQuestion].correct;

    options.forEach((opt, i) => {
        opt.disabled = true;
        opt.classList.remove('correct', 'incorrect');

        if (i === correctIndex) {
            opt.classList.add('correct');
            correctSound.play();
        } else if (i === index) {
            opt.classList.add('incorrect');
            wrongSound.play();
        }
    });

    document.getElementById('next-btn').style.display = 'block';
}

// --- NEXT QUESTION ----------------------------------------------
function nextQuestion() {
    if (selectedAnswer === quizData[currentQuestion].correct) score++;

    currentQuestion++;

    if (currentQuestion < totalQuestions) {
        loadQuestion();
    } else {
        showScore();
    }
}

// --- SCORE SCREEN ------------------------------------------------
function showScore() {
    clearTimer();
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('score-container').style.display = 'block';

    const percentage = Math.round((score / totalQuestions) * 100);
    document.getElementById('score-circle-text').textContent = score;
    document.getElementById('total-score').textContent = totalQuestions;

    // Celebration text & quotes
    const celebrationText = document.getElementById('celebration-text');
    const quoteText = document.getElementById('quote-text');

    // Motivational quotes list
    const quotes = [
        "Keep pushing—success is built one step at a time!",
        "Every mistake is progress. Great job!",
        "You're improving—don't stop now!",
        "Believe in the process.",
        "Small progress is still progress!",
        "Your future self will thank you."
    ];

    // Special zero-score messages
    const zeroMessages = [
        "Everyone starts somewhere—don't stop!",
        "Failure is the first step to mastery!",
        "Hey, at least you tried. Try again!",
        "Zero? No worries. Let's get that score UP next run!"
    ];

    if (percentage === 100) {
        celebrationText.textContent = "🎉 PERFECT SCORE! 🎉";
    } else if (percentage >= 60) {
        celebrationText.textContent = "🎉 CONGRATULATIONS! 🎉";
    } else if (percentage === 0) {
        celebrationText.textContent = "😅 Oops!";
        quoteText.textContent = zeroMessages[Math.floor(Math.random() * zeroMessages.length)];
    } else {
        celebrationText.textContent = "Good Job!";
    }

    // If not zero, give motivation quote
    if (percentage > 0) {
        quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }

    // Confetti effect
    launchConfetti();

    let feedback = percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep practicing!";
    document.getElementById('feedback').textContent = feedback;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('jsQuizHighScore', highScore);
        document.getElementById('high-score').style.display = 'block';
        document.getElementById('high-score-val').textContent = highScore;
    }

    if (percentage === 100) {
        try { startFireworks(); } catch {}
        try { checkAndPlayPerfect(score, totalQuestions); } catch {}
    }
}

// --- RESTART -----------------------------------------------------
function restartQuiz() {
    currentQuestion = 0;
    score = 0;

    document.getElementById('question-container').style.display = 'block';
    document.getElementById('score-container').style.display = 'none';

    quizData.sort(() => Math.random() - 0.5);
    loadQuestion();
}

// --- KEYBOARD CONTROL -------------------------------------------
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('next-btn').style.display === 'block') {
        nextQuestion();
    }
});

// --- INITIALIZE --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
});

// --- START BUTTON ------------------------------------------------
if (startBtn) {
    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        quizContainer.classList.remove('hidden');

        if (perfectSound) {
            perfectSound.play().then(() => {
                perfectSound.pause();
                perfectSound.currentTime = 0;
            }).catch(() => {});
        }
    });
}

// --- PERFECT SOUND CHECK ----------------------------------------
function checkAndPlayPerfect(scoreVal, maxScore) {
    if (scoreVal === maxScore && perfectSound) {
        perfectSound.currentTime = 0;
        perfectSound.volume = 0.9;
        perfectSound.play().catch(() => {});
    }
}

// --- FIREWORKS ---------------------------------------------------
function startFireworks() {
    const container = document.createElement('div');
    container.classList.add('fireworks-container');
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const fw = document.createElement('div');
        fw.classList.add('firework');

        const angle = Math.random() * 360;
        const rad = angle * Math.PI / 180;
        const distance = 150 + Math.random() * 100;

        fw.style.setProperty('--x', `${Math.cos(rad) * distance}px`);
        fw.style.setProperty('--y', `${Math.sin(rad) * distance}px`);
        fw.style.left = Math.random() * window.innerWidth + 'px';
        fw.style.top = Math.random() * window.innerHeight + 'px';
        fw.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;

        container.appendChild(fw);
        setTimeout(() => fw.remove(), 1500);
    }

    setTimeout(() => container.remove(), 1600);
}
function launchConfetti() {
    for (let i = 0; i < 40; i++) {
        const conf = document.createElement("div");
        conf.classList.add("confetti");

        conf.style.setProperty("--x", Math.random() * 100 + "vw");
        conf.style.setProperty("--hue", Math.floor(Math.random() * 360));

        document.body.appendChild(conf);

        setTimeout(() => conf.remove(), 2500);
    }
}
