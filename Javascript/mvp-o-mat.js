let statements = [];
let currentQuestionIndex = 0;
let userAnswers = {}; 

const BACKEND_URL = "https://backendmvp.onrender.com/api/statements/";

// DOM-Elemente
const startBtn = document.getElementById('startMatBtn');
const heroSection = document.getElementById('hero-section');
const infoSection = document.getElementById('info-section');
const matContainer = document.getElementById('mvpomat-container');
const quizCard = document.getElementById('quiz-card');
const resultCard = document.getElementById('result-card');

startBtn.addEventListener('click', startMvpOMat);

async function startMvpOMat() {
    // 1. Oberflächen wechseln
    heroSection.style.display = 'none';
    infoSection.style.display = 'none';
    matContainer.style.display = 'block';
    
    try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) throw new Error('Netzwerk-Fehler beim Laden der Thesen');
        
        statements = await response.json();
        
        if(statements.length > 15) {
            statements = statements.slice(0, 15);
        }
        
        showQuestion();
    } catch (error) {
        console.error(error);
        document.getElementById('statement-text').innerText = 
            "Fehler beim Laden der Fragen. Bitte überprüfe deine Internetverbindung oder versuche es später noch einmal.";
    }
}

function showQuestion() {
    if (statements.length === 0) return;
    
    const currentStatement = statements[currentQuestionIndex];
    
    document.getElementById('progress-bar').innerText = `These ${currentQuestionIndex + 1} von ${statements.length}`;
    document.getElementById('theme-tag').innerText = currentStatement.theme_name;
    document.getElementById('statement-title').innerText = currentStatement.title;
    document.getElementById('statement-text').innerText = currentStatement.text;
}

function answerQuestion(answer) {
    const currentStatement = statements[currentQuestionIndex];
    userAnswers[currentStatement.id] = answer;
    
    nextStep();
}

function skipQuestion() {
    const currentStatement = statements[currentQuestionIndex];
    userAnswers[currentStatement.id] = 'SKIP';
    
    nextStep();
}

function nextStep() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < statements.length) {
        showQuestion();
    } else {
        calculateResult();
    }
}

function calculateResult() {
    quizCard.style.display = 'none';
    resultCard.style.display = 'block';
    
    let maxPossiblePoints = 0;
    let userPoints = 0;
    
    let comparisonHtml = "";
    
    statements.forEach(stmt => {
        const userAns = userAnswers[stmt.id];
        const mvpAns = stmt.mvp_position;

        if (userAns === 'SKIP') {
            return;
        }

        maxPossiblePoints += 2;

        let pointsForThisRound = 0;
        if (userAns === mvpAns) {
            pointsForThisRound = 2;
        } else if (userAns === 'NEUTRAL') {
            pointsForThisRound = 1;
        } else {
            pointsForThisRound = 0;
        }
        userPoints += pointsForThisRound;

        const translate = { "YES": "Stimme zu", "NO": "Stimme nicht zu", "NEUTRAL": "Neutral", "SKIP": "Übersprungen" };

        comparisonHtml += `
            <details class="result-item">
                <summary>
                    <span>${stmt.id}. ${stmt.title}</span>
                    <span class="result-badge">${translate[userAns]} · MVP: ${translate[mvpAns]}</span>
                </summary>
                <div class="details-body">
                    <p class="stmt-text">"${stmt.text}"</p>
                    <p>Deine Antwort: <strong>${translate[userAns]}</strong> | MVP-Position: <strong>${translate[mvpAns]}</strong></p>
                    <div class="mvp-expl"><strong>Begründung der MVP:</strong> ${stmt.explanation || 'Keine Begründung hinterlegt.'}</div>
                </div>
            </details>
        `;
    });
    
    const finalPercentage = maxPossiblePoints > 0 ? Math.round((userPoints / maxPossiblePoints) * 100) : 0;
    
    document.getElementById('percentage-display').innerText = `${finalPercentage}%`;
    document.getElementById('comparison-list').innerHTML = comparisonHtml;
}