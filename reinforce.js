// Wrong Questions 练习页
// 结构：[{ question, options[], answer }, ...]

const REINFORCE_KEY = "uspapReinforceQuestions";
const VOICE_KEY = "uspapVoicePreference";

let quizVoice = null;

// ===== 语音：和其它 quiz 一样 =====
function initQuizVoice() {
  if (typeof speechSynthesis === "undefined") return;

  function chooseVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || !voices.length) return;

    // ⭐ 默认：第一次进入 = 静音
    const preferred = localStorage.getItem(VOICE_KEY) || "mute";

    // 如果是静音，就不要选任何 voice
    if (preferred === "mute") {
      quizVoice = null;
      return;
    }

    let chosen = null;

    if (preferred === "google_us") {
      chosen =
        voices.find(v => v.name.includes("Google US English")) ||
        voices.find(v => v.lang === "en-US" && /female/i.test(v.name));
    } else if (preferred === "aria") {
      chosen =
        voices.find(v => v.name.includes("Aria")) ||
        voices.find(v => v.lang === "en-US" && /aria/i.test(v.name.toLowerCase()));
    } else if (preferred === "samantha") {
      chosen =
        voices.find(v => v.name.includes("Samantha")) ||
        voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("samantha"));
    }

    // 兜底：中文女声 > 中文 > 女声 > 第一个
    if (!chosen) {
      chosen =
        voices.find(v => v.lang.startsWith("zh") && /Female|女/i.test(v.name)) ||
        voices.find(v => v.lang.startsWith("zh")) ||
        voices.find(v => /Female|女/i.test(v.name)) ||
        voices[0];
    }

    quizVoice = chosen;
  }

  chooseVoice();
  if (typeof speechSynthesis.onvoiceschanged !== "undefined") {
    speechSynthesis.onvoiceschanged = chooseVoice;
  }
}


function speakQuestion(text) {
  if (!text || typeof speechSynthesis === "undefined") return;

  // ⭐ 没有设置的时候，默认视为 mute
  const preferred = localStorage.getItem(VOICE_KEY) || "mute";
  if (preferred === "mute") return;

  const utterance = new SpeechSynthesisUtterance(text);
  if (quizVoice) {
    utterance.voice = quizVoice;
    utterance.lang = quizVoice.lang;
  } else {
    utterance.lang = "zh-CN";
  }
  utterance.rate = 1;
  utterance.pitch = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}


// ===== DOM =====
const questionEl = document.getElementById("quiz-question");
const optionsEl  = document.getElementById("quiz-options");
const feedbackEl = document.getElementById("quiz-feedback");
const progressEl = document.getElementById("quiz-progress");
const nextBtn    = document.getElementById("quiz-next-btn");
const refreshBtn = document.getElementById("refresh-btn");
const clearBtn   = document.getElementById("clear-btn");

// ===== 状态 =====
let wrongQuestions = [];
let currentIndex = 0;
let score = 0;
let hasAnsweredCurrent = false;

function loadReinforceQuestions() {
  const raw = localStorage.getItem(REINFORCE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    return [];
  } catch {
    return [];
  }
}

// 打乱数组
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===== 刷新错题 =====
function refreshQuiz() {
  wrongQuestions = loadReinforceQuestions();
  if (!wrongQuestions || wrongQuestions.length === 0) {
    currentIndex = 0;
    score = 0;
    renderEmptyState();
    return;
  }

  shuffleArray(wrongQuestions);
  currentIndex = 0;
  score = 0;
  renderQuestion();
}

// 没有错题时
function renderEmptyState() {
  questionEl.textContent = "No reinforce questions yet. 🎉";
  optionsEl.innerHTML = "";
  feedbackEl.textContent =
    "Go to Wrong Questions. If you miss a question there again, it will appear here for intensive review.";
  feedbackEl.className = "quiz-feedback correct";
  progressEl.textContent = "";
  nextBtn.disabled = true;
}

// 渲染当前题
function renderQuestion() {
  if (!wrongQuestions || wrongQuestions.length === 0) {
    renderEmptyState();
    return;
  }

  const q = wrongQuestions[currentIndex];
  hasAnsweredCurrent = false;

  questionEl.textContent = q.question;
  feedbackEl.textContent = "";
  feedbackEl.className = "quiz-feedback";

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${wrongQuestions.length} · Score: ${score}`;

  speakQuestion(questionEl.textContent);

  optionsEl.innerHTML = "";
  const randomizedOptions = q.options.map((opt, idx) => ({
    text: opt,
    index: idx,
  }));
  shuffleArray(randomizedOptions);

  randomizedOptions.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = item.text;
    btn.dataset.optionIndex = item.index;
    btn.addEventListener("click", () => handleAnswer(item.index));
    optionsEl.appendChild(btn);
  });

  nextBtn.disabled = true;
}

function handleAnswer(selectedIndex) {
  if (hasAnsweredCurrent) return;
  hasAnsweredCurrent = true;

  const q = wrongQuestions[currentIndex];
  const correctIndex = q.answer;

  const optionButtons = optionsEl.querySelectorAll(".quiz-option");
  optionButtons.forEach((btn) => {
    btn.disabled = true;
    const optIndex = Number(btn.dataset.optionIndex);
    if (optIndex === correctIndex) {
      btn.classList.add("correct");
    }
    if (optIndex === selectedIndex && optIndex !== correctIndex) {
      btn.classList.add("incorrect");
    }
  });

  if (selectedIndex === correctIndex) {
    score++;
    // 正确：不显示文字
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback correct";
  } else {
    // 错误：不显示正确答案文字
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback incorrect";
  }

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${wrongQuestions.length} · Score: ${score}`;

  nextBtn.disabled = false;
}

// 下一题
function goToNextQuestion() {
  if (!wrongQuestions || wrongQuestions.length === 0) {
    renderEmptyState();
    return;
  }

  if (currentIndex < wrongQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    questionEl.textContent = "Review finished!";
    optionsEl.innerHTML = "";
    feedbackEl.className = "quiz-feedback correct";
    feedbackEl.textContent =
      `You answered ${score} out of ${wrongQuestions.length} wrong questions correctly this round.`;
    progressEl.textContent = "";
    nextBtn.disabled = true;
  }
}

// 清空错题本
function clearAllWrongQuestions() {
  if (confirm("Clear all wrong questions? 这是清空错题本，确定吗？")) {
    localStorage.removeItem(REINFORCE_KEY);
    wrongQuestions = [];
    currentIndex = 0;
    score = 0;
    renderEmptyState();
  }
}

// 事件绑定
nextBtn.addEventListener("click", goToNextQuestion);
refreshBtn.addEventListener("click", refreshQuiz);
clearBtn.addEventListener("click", clearAllWrongQuestions);

// 初始化
initQuizVoice();
refreshQuiz();

// Service Worker（可选）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch(err =>
        console.error("Service Worker registration failed (wrong):", err)
      );
  });
}
