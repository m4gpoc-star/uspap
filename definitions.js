// ===== Speech synthesis：出题自动朗读题干 =====

let quizVoice = null;
const VOICE_KEY = "uspapVoicePreference";   // 语音设置 key（通用）
const QUIZ_STATE_KEY = "uspapDefinitionsQuizState"; // ✅ Definitions 专用
const QUIZ_TIMER_KEY = "uspapQuizTimerEnabled";  // 计时器设置（通用）

function isQuizTimerOn() {
  const v = localStorage.getItem(QUIZ_TIMER_KEY);
  // 默认视为开启（避免第一次进来没有设置）
  return v !== "off";
}


// 倒计时相关
const timerEl = document.getElementById("quiz-timer");
let timerId = null;
let timeLeft = 16;


function initQuizVoice() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }

  function chooseVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || !voices.length) return;

    const preferred = localStorage.getItem(VOICE_KEY);
    let chosen = null;

    // 1️⃣ 先根据 Setting 里的偏好来选
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

    // 2️⃣ 如果根据偏好没选到，就用原来的中文女声逻辑兜底
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


// 朗读题干：女声（如果有）、中速
function speakQuestion(text) {
  if (!text || typeof speechSynthesis === "undefined") return;

  // 如果在 Setting 里选了静音，直接不读
  const preferred = localStorage.getItem(VOICE_KEY);
  if (preferred === "mute") {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  if (quizVoice) {
    utterance.voice = quizVoice;
    utterance.lang = quizVoice.lang;
  } else {
    utterance.lang = "zh-CN"; // 兜底用中文
  }

  utterance.rate = 1;   // 中速
  utterance.pitch = 1;  // 正常音调

  // 避免前一题没播完叠在一起
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}



// ===== 错题本功能 =====
const WRONG_KEY = 'uspapWrongQuestions';

// 读取错题（只接受“数组”格式，其他情况一律当成空）
function getWrongQuestions() {
  const raw = localStorage.getItem(WRONG_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


// 保存错题
function saveWrongQuestions(list) {
  localStorage.setItem(WRONG_KEY, JSON.stringify(list));
}

// 加入一条错题（避免重复）
function addWrongQuestion(q) {
  const list = getWrongQuestions();
  const exists = list.some(item => item.question === q.question);
  if (!exists) {
    list.push(q);
    saveWrongQuestions(list);
  }
}

// ====== USPAP Chapter 1–3 Definitions Quiz Question Bank ======

const quizQuestions = [

  // CH1
  {
    question: "Currently, the boards within The Appraisal Foundation include:",
    options: [
      "Board of Trustees, Federal Housing Administration, Fannie Mae",
      "Board of Trustees, Appraisal Standards Board, Appraisal Subcommittee",
      "Appraisal Board, Appraisal Review Board, Administration Board",
      "Appraisal Standards Board, Appraiser Qualifications Board, Board of Trustees"
    ],
    answer: 3
  },
  {
    question: "Which Foundation board is responsible for USPAP?",
    options: [
      "Appraiser Qualifications Board (AQB)",
      "Consumer Financial Protection Bureau (CFPB)",
      "Appraisal Subcommittee (ASC)",
      "Appraisal Standards Board (ASB)"
    ],
    answer: 3
  },
  {
    question: "The Appraisal Foundation has the authority to enforce the requirements of USPAP.",
    options: ["True", "False"],
    answer: 1
  },
  {
    question: "Which entity establishes education and experience requirements for licensing and certification of appraisers?",
    options: [
      "Appraisal Standards Board (ASB)",
      "Appraiser Qualifications Board (AQB)",
      "Board of Trustees (BOT)",
      "Appraisal Subcommittee (ASC)"
    ],
    answer: 1
  },
  {
    question: "Which entity appoints members of the AQB and ASB?",
    options: [
      "They appoint their own members",
      "Appraisal Subcommittee (ASC)",
      "Board of Trustees (BOT)",
      "Fannie Mae"
    ],
    answer: 2
  },
  {
    question: "Qualification criteria for appraiser certification and recertification are disseminated to state appraisal boards by the:",
    options: [
      "Appraiser Qualifications Board (AQB)",
      "Board of Trustees (BOT)",
      "Consumer Financial Protection Bureau (CFPB)",
      "Appraisal Standards Board (ASB)"
    ],
    answer: 0
  },
  {
    question: "Advisory Opinions are best described as:",
    options: [
      "Subject to Fannie Mae requirements",
      "An alternative set of standards",
      "Not part of USPAP, but included as reference material",
      "Issued by the Appraisal Subcommittee (ASC)"
    ],
    answer: 2
  },
  {
    question: "USPAP is written, amended, and interpreted by the:",
    options: [
      "Appraiser Qualifications Board (AQB)",
      "Appraisal Subcommittee (ASC)",
      "Federal Reserve Board (FRB)",
      "Appraisal Standards Board (ASB)"
    ],
    answer: 3
  },
  {
    question: "USPAP is enforced by:",
    options: [
      "State appraiser licensing/certification agencies",
      "The Federal Financial Institutions Examination Council (FFIEC)",
      "Appraisal Subcommittee (ASC)",
      "Appraisal Standards Board (ASB)"
    ],
    answer: 0
  },
  {
    question: "Which entity maintains the official National Registry of state-certified and licensed appraisers?",
    options: [
      "Appraisal Subcommittee (ASC)",
      "Appraiser Qualifications Board (AQB)",
      "Federal Reserve Board (FRB)",
      "Appraisal Standards Board (ASB)"
    ],
    answer: 0
  },
  {
    question: "Which is NOT a responsibility of the Appraisal Subcommittee小组委员会 (ASC)?",
    options: [
      "Writing, interpreting, and amending USPAP",
      "Overseeing each state’s appraiser licensing and certification program",
      "Making an annual report to Congress",
      "Maintaining a National Registry of licensed and certified appraisers"
    ],
    answer: 0
  },
  {
    question: "Who is responsible for issuing credentials to individual appraisers?",
    options: [
      "Appraiser Qualifications Board (AQB)",
      "State appraisal regulatory agencies",
      "Appraisal Practices Board (APB)",
      "Appraisal Subcommittee (ASC)"
    ],
    answer: 1
  },

  // CH1-36
  {
    question: "Which part of USPAP establishes the requirements for workfile content for an appraisal or appraisal review assignment?",
    options: [
      "Jurisdictional Exception Rule",
      "Advisory Opinions",
      "Competency Rule",
      "Record Keeping Rule"
    ],
    answer: 3
  },
  {
    question: "Which of these is considered an integral必须的 part of USPAP and has the same weight as the components they address?",
    options: [
      "USPAP FAQs",
      "Advisory Opinions",
      "Comments",
      "USPAP Q&As"
    ],
    answer: 2
  },
  {
    question: "Why are USPAP Advisory Opinions issued?",
    options: [
      "To revise existing standards",
      "To offer advice and guidance",
      "To interpret existing standards as binding",
      "To establish new appraisal standards"
    ],
    answer: 1
  },

  // CH1-40
  {
    question: "The first step in the appraisal process is:",
    options: [
      "Perform market analysis and highest and best use",
      "Determine scope of work",
      "Identify the problem",
      "Reconcile the value indicators"
    ],
    answer: 2
  },
  {
    question: "Which step in the appraisal process involves communication of the appraiser's opinions and conclusions?",
    options: [
      "Receipt of fee from the client",
      "Identification of the problem",
      "Reporting",
      "Determination of scope of work"
    ],
    answer: 2
  },
  {
    question: "In USPAP, the appraisal process is divided into two distinct types of activity:",
    options: [
      "Opinion and conclusion",
      "Development and reporting",
      "Analysis and appraisal",
      "New and old"
    ],
    answer: 1
  },

  // CH2
  {
    question: "What is the stated purpose of USPAP?",
    options: [
      "Promote and maintain a high level of public trust in appraisal practice",
      "Create requirements so stringent that no appraiser can possibly comply",
      "Establish a federal appraisal enforcement agency",
      "Establish requirements that licensed and certified appraisers must follow"
    ],
    answer: 0
  },
  {
    question: "When obligated强迫的 by law or regulation, an appraiser _______ comply with USPAP.",
    options: ["Must", "Should", "May choose to", "Need not"],
    answer: 0
  },
  {
    question: "The PREAMBLE序言 states that USPAP is intended to benefit:",
    options: [
      "Borrowers in mortgage-lending appraisal assignments",
      "Users of appraisal services only",
      "Appraisers only",
      "Appraisers and users of appraisal services"
    ],
    answer: 3
  },
  {
    question: "An appraiser has the professional responsibility to identify the capacity in which he or she is performing.",
    options: ["False", "True"],
    answer: 1
  },
  {
    question: "The requirement for USPAP compliance in an appraisal assignment could be the result of:",
    options: [
      "Agreement with the client",
      "Voluntary choice by the appraiser",
      "Law or regulation",
      "Any of these answers"
    ],
    answer: 3
  },
  {
    question: "When performing valuation services outside of appraisal practice, an individual must be careful not to __________ the client and other intended users about his or her role.",
    options: [
      "Communicate with",
      "Mislead",
      "Identify"
    ],
    answer: 1
  },
  {
    question: "USPAP states that when an individual is not required by law, regulation, or agreement to comply with USPAP:",
    options: [
      "The Appraisal Foundation can still force compliance",
      "The individual should still comply when he or she is acting as an appraiser",
      "Compliance does not matter because clients do not understand USPAP",
      "The individual should comply only if the service involves real property"
    ],
    answer: 1
  },
  {
    question: "A valuation service that is premised upon基于前提 advocacy:",
    options: [
      "Is an appraisal review assignment under STANDARDS 3 and 4",
      "Can be performed by an individual acting as an appraiser with appropriate disclosure",
      "Must be performed under the SCOPE OF WORK RULE",
      "Cannot be performed by an individual acting as an appraiser"
    ],
    answer: 3
  },

  // CH3
  {
    question: "A preference or inclination that precludes an appraiser's impartiality, independence, or objectivity is:",
    options: [
      "Appraisal practice",
      "Assumption",
      "Market value",
      "Bias"
    ],
    answer: 3
  },
  {
    question: "An appraiser is permitted to be biased when performing an appraisal, as long as the bias is properly disclosed.",
    options: ["True", "False"],
    answer: 1
  },
  {
    question: "If an appraiser assumes a condition to be true, and evidence supports that belief, although that fact is not certain, this is an example of:",
    options: [
      "An assignment condition",
      "A limiting condition",
      "A hypothetical condition",
      "An extraordinary assumption"
    ],
    answer: 3
  },
  {
    question: "If an appraiser assumes a condition to be true that does not exist for the purposes of analysis, this is an example of:",
    options: [
      "A limiting condition",
      "A hypothetical condition",
      "An extraordinary assumption",
      "An assumption"
    ],
    answer: 1
  },
  {
    question: "\"The monetary relationship between properties and those who buy, sell or use those properties\" is the definition of:",
    options: [
      "None of these",
      "Value",
      "Price",
      "Cost"
    ],
    answer: 1
  },
  {
    question: "A signed sales agreement for $950,000 represents:",
    options: ["Cost", "Value", "Price"],
    answer: 2
  },
  {
    question: "By using a published cost manual, an appraiser determines that construction cost is $400,000. This figure represents:",
    options: ["Value", "Cost", "Price"],
    answer: 1
  },
  {
    question: "An appraiser performs an appraisal assignment and develops an opinion of value. This value opinion is:",
    options: [
      "An estimate of fact",
      "An assignment result",
      "A fact"
    ],
    answer: 1
  },
  {
    question: "It is permissible for an appraiser to be engaged in an assignment by an agent acting on behalf of the client.",
    options: ["True", "False"],
    answer: 0
  },
  {
    question: "According to USPAP, the party or parties who engage an appraiser in a specific assignment defines the:",
    options: [
      "Other intended users",
      "Party who pays the fee",
      "Client",
      "Appraiser's peers"
    ],
    answer: 2
  },
  {
    question: "Who is responsible for making the identification of the intended use in an assignment?",
    options: [
      "The intended users themselves",
      "The appraiser",
      "The client",
      "The Appraisal Standards Board"
    ],
    answer: 1
  },
  {
    question: "An intended user is:",
    options: [
      "Anyone who receives the appraisal report from the client",
      "Only the party who pays for the appraisal report",
      "Anyone who uses the appraisal report",
      "A party identified by the appraiser based on communication with the client at the time of the assignment"
    ],
    answer: 3
  },
  {
    question: "Appraisal practice includes only:",
    options: [
      "Valuation services provided by an individual acting as an appraiser",
      "Work completed by licensed and certified appraisers",
      "Market value appraisals",
      "Appraisal and appraisal review"
    ],
    answer: 0
  },
  {
    question: "Which is the broader category of services?",
    options: ["Valuation Services", "Appraisal Practice"],
    answer: 0
  },
  {
    question: "A real estate broker completes a CMA on a property she wants to list. This is considered:",
    options: [
      "A USPAP service",
      "Not an appraisal, but still part of appraisal practice",
      "An appraisal",
      "A valuation service outside of appraisal practice"
    ],
    answer: 3
  },
  {
    question: "A workfile must be maintained for:",
    options: [
      "Oral appraisal reports only",
      "Valuation services that are outside USPAP",
      "Written appraisal reports only",
      "Appraisal and appraisal review assignments only"
    ],
    answer: 3
  },
  {
    question: "In USPAP, each Standard is composed of:",
    options: [
      "Practical advice",
      "Voluntary guidance",
      "Standards Rules",
      "Statements on Appraisal Standards"
    ],
    answer: 2
  },
  {
    question: "\"The type and extent of research and analyses in an appraisal or appraisal review assignment\" is the definition of:",
    options: [
      "Intended use",
      "Report",
      "Scope of work",
      "Signature"
    ],
    answer: 2
  }

];

// ====== Quiz Logic ======

let currentIndex = 0;
let score = 0;
let hasAnsweredCurrent = false;

const questionEl = document.getElementById("quiz-question");
const optionsEl  = document.getElementById("quiz-options");
const feedbackEl = document.getElementById("quiz-feedback");
const progressEl = document.getElementById("quiz-progress");
const nextBtn    = document.getElementById("quiz-next-btn");

// 启动 / 控制计时器
function startTimer() {
  if (!timerEl) return;

  // 如果在 Settings 把计时器关掉
  if (!isQuizTimerOn()) {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    timerEl.textContent = "Timer OFF";
    return;
  }

  // 正常 16 秒倒计时
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  timeLeft = 16;
  timerEl.textContent = `Time left: ${timeLeft}s`;

  timerId = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      timerEl.textContent = "Time's up!";
      handleTimeout();
    } else {
      timerEl.textContent = `Time left: ${timeLeft}s`;
    }
  }, 1000);
}

// 超时：算错题 + 正确答案变绿 + 自动下一题
function handleTimeout() {
  if (hasAnsweredCurrent) return;
  hasAnsweredCurrent = true;

  const q = quizQuestions[currentIndex];
  const correctIndex = q.answer;

  const optionButtons = optionsEl.querySelectorAll(".quiz-option");
  optionButtons.forEach((btn) => {
    btn.disabled = true;
    const optIndex = Number(btn.dataset.optionIndex);
    if (optIndex === correctIndex) {
      btn.classList.add("correct");
    }
  });

  feedbackEl.textContent =
    `Time's up! ⏰ Correct answer: "${q.options[correctIndex]}".`;
  feedbackEl.className = "quiz-feedback incorrect";

  // 超时也记入错题本
  addWrongQuestion(q);

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;
  nextBtn.disabled = false;

  setTimeout(() => {
    goToNextQuestion();
  }, 800);

  saveQuizState();
}

// 渲染当前题目
function renderQuestion() {
  const q = quizQuestions[currentIndex];
  hasAnsweredCurrent = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "quiz-feedback";

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;

  questionEl.textContent = q.question;

  // 出题时朗读题干
  speakQuestion(questionEl.textContent);

  // 选项随机顺序
  optionsEl.innerHTML = "";
  let randomizedOptions = q.options.map((opt, idx) => ({
    text: opt,
    index: idx
  }));

  for (let i = randomizedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedOptions[i], randomizedOptions[j]] =
      [randomizedOptions[j], randomizedOptions[i]];
  }

  randomizedOptions.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = item.text;
    btn.dataset.optionIndex = item.index;
    btn.addEventListener("click", () => handleAnswer(item.index));
    optionsEl.appendChild(btn);
  });

  nextBtn.disabled = true;
  startTimer();
  saveQuizState();
}

// 点击作答
function handleAnswer(selectedIndex) {
  if (hasAnsweredCurrent) return;
  hasAnsweredCurrent = true;

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  const q = quizQuestions[currentIndex];
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
    feedbackEl.textContent = "Correct! ✅  Keep going.";
    feedbackEl.classList.add("correct");
  } else {
    feedbackEl.textContent =
      `Incorrect. ❌  Correct answer: "${q.options[correctIndex]}".`;
    feedbackEl.classList.add("incorrect");

    // 答错：加入错题本（用上面已经定义好的 addWrongQuestion）
    addWrongQuestion(q);
  }

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;
  nextBtn.disabled = false;

  saveQuizState();
}

// 下一题
function goToNextQuestion() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  if (currentIndex < quizQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    questionEl.textContent = "Quiz finished!";
    optionsEl.innerHTML = "";
    feedbackEl.className = "quiz-feedback correct";
    feedbackEl.textContent =
      `You answered ${score} out of ${quizQuestions.length} questions correctly.`;
    nextBtn.disabled = true;
    if (timerEl) {
      timerEl.textContent = "Done";
    }
  }

  saveQuizState();
}

nextBtn.addEventListener("click", goToNextQuestion);

// 洗牌按钮用到的函数（如果你在 HTML 里有 Shuffle 按钮）
function shuffleQuiz() {
  for (let i = quizQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quizQuestions[i], quizQuestions[j]] =
      [quizQuestions[j], quizQuestions[i]];
  }
  currentIndex = 0;
  score = 0;
  renderQuestion();
  saveQuizState();
}

// 进度保存 / 恢复（和 Rule / Standard 一致）
function saveQuizState() {
  try {
    const state = {
      currentIndex,
      score,
      questions: quizQuestions
    };
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    // 本地存储失败就算了
  }
}

function loadQuizState() {
  const raw = localStorage.getItem(QUIZ_STATE_KEY);
  if (!raw) return false;

  try {
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.questions) || state.questions.length === 0) {
      return false;
    }

    quizQuestions.length = 0;
    state.questions.forEach(q => quizQuestions.push(q));

    currentIndex = Number.isInteger(state.currentIndex) ? state.currentIndex : 0;
    score = typeof state.score === "number" ? state.score : 0;

    if (currentIndex < 0 || currentIndex >= quizQuestions.length) {
      currentIndex = 0;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// 初始化：先准备语音
initQuizVoice();

// 有历史就恢复，没有就洗牌开局
if (!loadQuizState()) {
  shuffleQuiz();
} else {
  renderQuestion();
}

// Service Worker（可选）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) =>
        console.error("Service Worker registration failed (definitions):", err)
      );
  });
}

