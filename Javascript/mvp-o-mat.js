let statements = [];
let currentQuestionIndex = 0;
let userAnswers = {};

const BACKEND_URL = "https://backendmvp.onrender.com/api/statements/";

const startBtn = document.getElementById('startMatBtn');
const heroSection = document.getElementById('hero-section');
const infoSection = document.getElementById('info-section');
const matContainer = document.getElementById('mvpomat-container');
const quizCard = document.getElementById('quiz-card');
const resultCard = document.getElementById('result-card');

if (startBtn) {
    startBtn.addEventListener('click', startMvpOMat);
} else {
    console.warn('Start button #startMatBtn nicht gefunden; Start-Event wurde nicht registriert.');
}

async function startMvpOMat() {
    heroSection.style.display = 'none';
    infoSection.style.display = 'none';
    matContainer.style.display = 'block';

    try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) {
            const bodyText = await response.text().catch(() => '');
            throw new Error(`HTTP ${response.status} ${response.statusText} ${bodyText}`);
        }

        statements = await response.json();

        if (statements.length > 15) {
            statements = statements.slice(0, 15);
        }

        showQuestion();
    } catch (error) {
        console.error(error);
        const stmtEl = document.getElementById('statement-text');
        if (stmtEl) {
            stmtEl.innerText = `Fehler beim Laden der Fragen: ${error.message}`;
        }
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

        const translate = { "YES": "Zustimmung", "NO": "Ablehnung", "NEUTRAL": "Neutral", "SKIP": "Übersprungen" };
        const matchClass = pointsForThisRound === 2 ? 'match' : (pointsForThisRound === 1 ? 'neutral' : 'nomatch');

        comparisonHtml += `
        <details class="result-item">
            <summary>
                <div class="summary-left">
                    <span class="theme-tag-small">${stmt.theme_name || 'Politik'}</span>
                    <span class="result-title">${stmt.title}</span>
                </div>
                <div class="toggle-icon" aria-hidden="true">+</div>
            </summary>
            <div class="details-body">
                <div class="choices-row ${matchClass}">
                    <span class="choice-pill">Du: ${translate[userAns]}</span>
                    <span class="choice-pill">MVP: ${translate[mvpAns]}</span>
                </div>
                <p class="stmt-text">"${stmt.text}"</p>
                <div class="mvp-expl"><strong>Begründung der MVP:</strong> ${stmt.explanation || 'Keine Begründung hinterlegt.'}</div>
            </div>
        </details>
    `;
    });

    const finalPercentage = maxPossiblePoints > 0 ? Math.round((userPoints / maxPossiblePoints) * 100) : 0;

    document.getElementById('percentage-display').innerText = `${finalPercentage}%`;
    document.getElementById('comparison-list').innerHTML = comparisonHtml;

    let feedbackText = "";
    let feedbackColor = "#1a2b4c";

    if (finalPercentage === 100) {
        feedbackText = "Perfekte Übereinstimmung. Die MVP vertritt genau deine Werte. Werde jetzt Gründungsmitglied und gestalte die Zukunft mit.";
        feedbackColor = "#2e7d32";
    } else if (finalPercentage >= 80) {
        feedbackText = "Hervorragendes Ergebnis. Deine politischen Standpunkte passen sehr gut zum Programm der MVP.";
        feedbackColor = "#2e7d32";
    } else if (finalPercentage >= 50) {
        feedbackText = "Gute Schnittmenge. Du teilst die Mehrheit unserer Kernforderungen für eine transparente und moderne Politik.";
        feedbackColor = "#f57c00";
    } else if (finalPercentage >= 30) {
        feedbackText = "Teilweise Übereinstimmung. Es gibt einige Gemeinsamkeiten, aber auch deutliche Unterschiede zu unseren Positionen.";
        feedbackColor = "#f57c00";
    } else {
        feedbackText = "Geringe Übereinstimmung. Eine andere Partei wäre für dich vermutlich die bessere Wahl.";
        feedbackColor = "#c62828";
    }

    const msgEl = document.getElementById('result-message');
    if (msgEl) {
        msgEl.innerText = feedbackText;
        msgEl.style.color = feedbackColor;
    }
}