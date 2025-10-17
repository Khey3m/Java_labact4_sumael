// Improved JS: Added timer extension, localStorage for high score, error handling, progressupdates, and better UX (e.g., disable options after selection).
// All code is modular, commented, and uses const/let appropriately.
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');

const quizData = [
    {
        question: "What does 'let' declare in JavaScript?",
        options: ["A constant value", "A changeable variable", "A function", "An array"],
        correct: 1
    },
    {
        question: "Which is the strict equality operator?",
        options: ["==", "=", "===", "!="],
        correct: 2
    },
    {
        question: "What is the purpose of a for loop?",
        options: ["To declare variables", "To repeat code a set number of times", "To handleevents", "To style elements"],
        correct: 1
    },
    {
        question: "How do you select an element by ID in the DOM?",
        options: ["query Selector", "get Element ById", "create Element", "append Child"],
        correct: 1
    },
    {
        question: "What is a JavaScript closure?",
        options: [
            "A function inside another function that remembers outer variables",
            "A block of code that runs once",
            "A variable with limited scope",
            "A type of event listener"
        ],
        correct: 0
    },
    {
        question: "What does async/await simplify in JavaScript?",
        options: [
            "Loop creation",
            "Error handling",
            "Asynchronous code readability",
            "CSS styling"
        ],
        correct: 2
    }
    // Students: Add more here for extension!
];
let currentQuestion = 0;
let score = 0;
let totalQuestions = quizData.length;
let selectedAnswer = -1;
let timerInterval; // For per-question timer
let timeLeft = 30; // 30 seconds per question
let highScore = localStorage.getItem('jsQuizHighScore') || 0;

// Utility: Update progress bar
function updateProgress() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = totalQuestions;
}
// Extension: Start timer for each question
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
            nextQuestion(); // Auto-advance on timeout
        }
    }, 1000);
}
// Extension: Clear timer
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        document.getElementById('timer-container').style.display = 'none';
    }
}
function loadQuestion() {
    try {
        const q = quizData[currentQuestion];
        if (!q) throw new Error('No question data');

        document.getElementById('question').textContent = q.question;
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';

        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.classList.add('option');
            btn.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
            btn.onclick = () => selectOption(index);
            optionsDiv.appendChild(btn);
        });
        document.getElementById('next-btn').style.display = 'none';
        updateProgress();
        startTimer(); // Extension: Timer starts
    } catch (error) {
        console.error('Error loading question:', error);
        document.getElementById('question').innerHTML = '<p style="color: red;">Error loadingquestion. Check console.</p>';
    }

}
function selectOption(index) {
    console.log('Selected option index:', index); // Debugging log
    if (selectedAnswer !== -1) return; // Prevent multiple selections
    selectedAnswer = index;
    clearTimer(); // Stop timer on answer
    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        opt.disabled = true; // Disable after selection
        opt.classList.remove('correct', 'incorrect');
        if (i === quizData[currentQuestion].correct) {
            opt.classList.add('correct');
            correctSound.play();
        } else if (i === index && index !== quizData[currentQuestion].correct) {
            opt.classList.add('incorrect');
            wrongSound.play();
        }

    });

    document.getElementById('next-btn').style.display = 'block';
}
function nextQuestion() {
    if (selectedAnswer === quizData[currentQuestion].correct) {
        score++;
    }
    currentQuestion++;
    selectedAnswer = -1;
    if (currentQuestion < totalQuestions) {
        loadQuestion();
    } else {
        showScore();
    }
}
function showScore() {
    clearTimer();
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('score-container').style.display = 'block';
    const percentage = Math.round((score / totalQuestions) * 100);
    document.getElementById('score-circle-text').textContent = score;
    document.getElementById('total-score').textContent = totalQuestions;
    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = totalQuestions;
    let feedback = '';
    if (percentage >= 80) feedback = "Outstanding! You're a JavaScript wizard. 🌟";
    else if (percentage >= 60) feedback = "Well done! Keep practicing those concepts. 👍";
    else feedback = "Good start—dive back into the lecture notes for a refresh. 📚";
    if (percentage === 100) {
        console.log("🎉 Perfect score! Launching confetti...");
        // Use a library or CSS animation if you want visuals.
    }

    document.getElementById('feedback').textContent = feedback;
    // Extension: High score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('jsQuizHighScore', highScore);
        document.getElementById('high-score').style.display = 'block';
        document.getElementById('high-score-val').textContent = highScore;
    }

    // Play perfect sound if perfect score (ensure audio unlocked on Start)
    try {
        checkAndPlayPerfect(score, totalQuestions);
    } catch (err) {
        console.warn('Error attempting to play perfect sound', err);
    }
}
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = -1;
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('score-container').style.display = 'none';
    document.getElementById('high-score').style.display = 'none';
    loadQuestion();
    quizData.sort(() => Math.random() - 0.5);

}
// Initialize on page load
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('next-btn').style.display === 'block') {
        nextQuestion();
    }
});

document.addEventListener('DOMContentLoaded', loadQuestion);

const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const perfectSound = document.getElementById('perfect-sound');
const startBtn = document.getElementById('start-btn');

// Unlock audio on first user interaction (Start button)
if (startBtn && perfectSound) {
    startBtn.addEventListener('click', () => {
        perfectSound.play()
            .then(() => {
                perfectSound.pause();
                perfectSound.currentTime = 0;
            })
            .catch(() => {/* ignore if blocked */});
    });
}

// Call this when quiz ends
function checkAndPlayPerfect(scoreVal, maxScore) {
    if (!perfectSound) return;
    if (scoreVal === maxScore) {
        perfectSound.currentTime = 0;
        perfectSound.volume = 0.9;
        perfectSound.play().then(() => {
            console.log('Perfect sound played');
        }).catch((err) => {
            console.warn('Playback blocked or failed:', err);
        });
    }
}

if (startBtn) {
  startBtn.addEventListener('click', () => {
    // hide start, show quiz
    startScreen?.classList.add('hidden');
    quizContainer?.classList.remove('hidden');

    // unlock audio (workaround for autoplay restrictions)
    if (perfectSound) {
      perfectSound.play().then(() => {
        perfectSound.pause();
        perfectSound.currentTime = 0;
      }).catch(() => {/* ignored */});
    }

    // focus first interactive element and optionally start timer/quiz logic
    const firstInteractive = document.querySelector('.option, #next-btn, input, button');
    if (firstInteractive) firstInteractive.focus();

    // call existing initializer if present
    if (typeof startQuiz === 'function') startQuiz();
  });
}