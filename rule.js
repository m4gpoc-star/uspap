// ===== Speech synthesis：出题自动朗读题干 =====

let quizQuestions = [];

let quizVoice = null;
const VOICE_KEY = "uspapVoicePreference";           // 语音设置 key（通用）
const QUIZ_STATE_KEY = "uspapRuleQuizState";        // ✅ Rule 专用
const QUIZ_TIMER_KEY = "uspapQuizTimerEnabled";     // 计时器设置（通用）

function isQuizTimerOn() {
  const v = localStorage.getItem(QUIZ_TIMER_KEY);
  // 默认视为开启（避免第一次进来没有设置）
  return v !== "off";
}

// 倒计时相关（DOM 在 HTML 中）
const timerEl = document.getElementById("quiz-timer");
let timerId = null;
let timeLeft = 16;

// ===== 初始化语音（和 Definitions 一样） =====
function initQuizVoice() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }

  function chooseVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || !voices.length) return;

    // ⭐ 默认：第一次 = mute
    const preferred = localStorage.getItem(VOICE_KEY) || "mute";

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

// 朗读题干
function speakQuestion(text) {
  if (!text || typeof speechSynthesis === "undefined") return;

  // ⭐ 默认/未设置 = mute，就不读
  const preferred = localStorage.getItem(VOICE_KEY) || "mute";
  if (preferred === "mute") {
    return;
  }

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


// ===== 错题本功能（与 Definitions 共用同一个 Wrong 页面） =====
const WRONG_KEY = "uspapWrongQuestions";

// 读取错题（只接受数组）
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


// ====== Rule Question Bank：CH4–6 ======
quizQuestions = [

  // ===== CH4 =====

  // CH4-8
  {
    question: "Bias is permitted in an appraisal as long as只要 the bias is clearly disclosed in the report.",
    options: [
      "False",
      "True"
    ],
    answer: 0
  },
  {
    question: "In appraisal practice, advocating the cause理由 or interest权益 of any party or issue is:",
    options: [
      "Permitted when done by an unlicensed appraiser",
      "Permitted when a contingent附加 fee is not involved",
      "Not permitted 不被允许",
      "Permitted when appropriately disclosed"
    ],
    answer: 2
  },
  {
    question: "The ethical obligations责任 of USPAP apply to:",
    options: [
      "Appraisal companies",
      "Individual appraisers",
      "Appraisal clients",
      "All of the answers listed"
    ],
    answer: 1
  },

  // CH4-17
  {
    question: "An appraiser must disclose any service he or she provided regarding the subject property for a period of _________ prior之前 to agreeing答应 to perform the assignment.",
    options: [
      "Ten years",
      "Three years",
      "One year",
      "USPAP does not specify a prior time period"
    ],
    answer: 1
  },
  {
    question: "An appraiser is disclosing to a client the fact that she had previously appraised the subject property within the prior three years. When making this disclosure, the appraiser must be careful to:",
    options: [
      "Provide the date and the value conclusion from the prior appraisal",
      "Obtain获得 a release许可 from the previous client in order to proceed with the new assignment",
      "Not disclose confidential机密 information from the previous assignment",
      "Transmit a complete copy of the prior appraisal report and workfile to the new client"
    ],
    answer: 2
  },

  // CH4-24
  {
    question: "An appraiser has been asked to complete an appraisal assignment. The fee is to be paid only if the loan closes. According to USPAP, may the appraiser accept the assignment under these conditions?",
    options: [
      "Yes, as long as the appraiser clearly discloses the basis of such a contingency in the certification附加条件 and in any letter of transmittal正式提交函",
      "No, unless the appraiser receives written permission allowing the transfer of the appraisal to other parties",
      "Yes, this is a business decision between the appraiser and the client",
      "No, the fee arrangement约定 is an unethical contingency以结果为前提 arrangement and violates侵犯了 the ETHICS RULE"
    ],
    answer: 3
  },
  {
    question: "In a real property appraisal assignment prepared for a mortgage抵押贷款 lender出借方, an appraiser is permitted by USPAP to base his or her compensation报酬 for an appraisal assignment on:",
    options: [
      "Whether or not the report is transmitted to the client by the due date",
      "Whether or not the loan transaction closes",
      "The amount of the value opinion",
      "Reconciling综合权衡后确定最终结论 the value conclusion to the high end of the indicated指定的 range"
    ],
    answer: 0
  },

  // CH4-33
  {
    question: "The Confidentiality保密 section of the ETHICS RULE prohibits禁止 an appraiser from disclosing confidential information or _________ to unauthorized parties.",
    options: [
      "The appraiser’s personal financial information",
      "Assignment results 任务结果",
      "Non-confidential information",
      "Physical characteristics"
    ],
    answer: 1
  },
  {
    question: "In most cases, an appraiser may share __________ from an appraisal assignment with other appraisers without obtaining the client’s consent同意.",
    options: [
      "Assignment results",
      "Physical characteristics",
      "Confidential information",
      "All of these"
    ],
    answer: 1
  },
  {
    question: "An appraiser concludes判断 that a subject property has functional inadequacies缺陷. This conclusion is:",
    options: [
      "An assignment result and must be treated as confidential",
      "A conclusion unrelated无关的 to value",
      "An assignment result which may be disclosed to anyone without permission",
      "A physical characteristic and therefore not confidential"
    ],
    answer: 0
  },

  // CH4-38
  {
    question: "The Nondiscrimination不歧视 section of the ETHICS RULE requires an appraiser to be aware知道 of and comply遵从 with ____________ antidiscrimination反歧视 laws and regulations.",
    options: [
      "only federal",
      "federal, state, and local",
      "only international",
      "United States and Canadian"
    ],
    answer: 1
  },
  {
    question: "Which of the following laws is NOT specifically特别的 referenced in the Nondiscrimination section of the ETHICS RULE?",
    options: [
      "Equal Credit Opportunity Act 任何人在申请贷款、信用卡、按揭时，不得因个人身份被歧视。",
      "Dodd-Frank Act 2008 金融危机后出台的“银行 + 贷款 + 评估”全面监管法。",
      "Civil Rights Act of 1866 美国第一部民权法：保障“有色人种也有财产权”。",
      "Fair Housing Act 任何人在“买房、卖房、租房、贷款、广告”中不得歧视。"
    ],
    answer: 1
  },

  // CH4-50
  {
    question: "An appraiser completes an appraisal and transmits the report to the client. The report copy retained in the appraiser’s workfile does not have a signature affixed to it. Is this permissible under USPAP?",
    options: [
      "USPAP does not address this issue",
      "Yes, as long as the report that was sent to the client was signed",
      "No, a true copy must include a signature",
      "Yes, because there is no USPAP requirement for an appraisal report to contain a signature"
    ],
    answer: 2
  },
  {
    question: "An appraiser prepared an appraisal report in April 2021. The appraiser testified作证 in court regarding the value of the property in January 2022. The decision was rendered做出 in February 2022 and was appealed上诉 in April 2022. The appellate受理上诉的 court heard the case in January 2023 and remanded发回 the case for reconsideration再审核 by the lower court. Final disposition决定 of the case occurred发生 in September 2023. At a minimum, how long must the appraiser retain the workfile?",
    options: [
      "September 2025",
      "September 2028",
      "February 2024",
      "April 2026"
    ],
    answer: 3
  },
  {
    question: "Is an appraiser permitted by USPAP to create a workfile after transmitting the report to the client?",
    options: [
      "No",
      "Yes",
      "USPAP does not specify明确规定"
    ],
    answer: 0
  },

  // CH4-55
  {
    question: "Which statement best describes the word “competency胜任力” as it relates描述 to appraisal practice?",
    options: [
      "It is fundamental根本的 to the definition of “appraiser.” ",
      "Lack缺乏 of competency胜任力 is expected预判的 by clients",
      "Clients are required to be competent能干的",
      "It is an ideal, virtually事实上几乎 impossible to achieve"
    ],
    answer: 0
  },

  // CH4-63
  {
    question: "Which of these is NOT one of the steps required by USPAP when an appraiser wishes to perform an assignment for which he or she initially最初 lacks the knowledge and experience?",
    options: [
      "Disclose the lack of knowledge and/or experience to the client",
      "Use a hypothetical假设 condition to complete the assignment as though the appraiser already had the knowledge and experience",
      "Take steps necessary to obtain the necessary knowledge and experience",
      "Disclose, in the report, the lack of knowledge and/or experience and the steps taken to complete the assignment competently"
    ],
    answer: 1
  },
  {
    question: "In order to perform an assignment for which an appraiser initially最初 lacks the knowledge and experience to complete competently胜任的, the appraiser must:",
    options: [
      "Refer转交 the appraisal to an appraiser qualified to complete the assignment",
      "Ask for more time and reduce降低 the fee",
      "Disclose to the client, prior在之前 to agreeing答应 to perform the assignment, the lack of knowledge or experience",
      "Associate with an appraiser qualified to complete the assignment"
    ],
    answer: 2
  },

  // CH4-69
  {
    question: "The requirement to create and maintain a workfile for an appraisal or appraisal review assignment applies to:",
    options: [
      "All appraisers, regardless无论 of credential资格 level ",
      "Only trainees实习生 or assistants助理",
      "Appraisers, clients, and intended users",
      "Only licensed or certified appraisers"
    ],
    answer: 0
  },
  {
    question: "Three appraisers work together on an appraisal assignment. What would NOT be an appropriate workfile arrangement安排 under USPAP?",
    options: [
      "One appraiser maintains custody监护 of the workfile and the other two appraisers make access访问 and retrieval检索 arrangements安排",
      "The workfile is posted on the Internet, so that anyone who wants to see it will be able to access it",
      "The workfile is kept in a neutral location where all three appraisers will be able to access it",
      "Each appraiser maintains a copy of the workfile"
    ],
    answer: 1
  },

  // ===== CH5 =====

  {
    question: "The credibility可信度 of assignment results is measured in the context of:",
    options: [
      "Lending guidelines 贷款指南",
      "The attainment of the clients stipulated result 达到客户约定的结果",
      "The amount of the value conclusion",
      "The intended use"
    ],
    answer: 3
  },
  {
    question: "In order to determine确定 the appropriate scope of work, the appraiser must ___ the problem to be solved.",
    options: [
      "Solve解决",
      "Value",
      "Accept",
      "Identify 识别/确认"
    ],
    answer: 3
  },
  {
    question: "Appraisers have broad ____ and significant ____ in determining the appropriate scope of work in an assignment.",
    options: [
      "Acceptance, liability 验收、责任",
      "Errors, omissions 错误、遗漏",
      "Boundaries, limitations 界限、限制",
      "Flexibility, responsibility 灵活性、责任感"
    ],
    answer: 3
  },
  {
    question: "Examples of assignment conditions include:",
    options: [
      "Extraordinary assumptions 非凡的假设",
      "Hypothetical conditions 假设条件",
      "All of these answers 所有这些答案",
      "Laws and regulations 法律法规"
    ],
    answer: 2
  },
  {
    question: "Intended use is:",
    options: [
      "Not necessary to determine确定 in an appraisal review assignment",
      "Determined by the client on the basis of communication with the appraiser",
      "One of the last determinations to be made before submitting the report",
      "Identified by the appraiser on the basis of communication with the client"
    ],
    answer: 3
  },
  {
    question: "Identification of the intended use of an appraiser's opinions and conclusions is:",
    options: [
      "Not necessary in most appraisal assignments",
      "Necessary only when doing non-mortgage非抵押 assignments",
      "Necessary for determining the appropriate scope of work",
      "Not required unless the client wants the intended use to be disclosed"
    ],
    answer: 2
  },
  {
    question: "The responsibility for determining an appropriate scope of work rests with the:(rest with责任落在谁身上)",
    options: [
      "Appraiser's peers同行",
      "Client",
      "Intended users",
      "Appraiser"
    ],
    answer: 3
  },
  {
    question: "In an appraisal or appraisal review assignment, the scope of work is an ______ process.",
    options: [
      "Unnecessary",
      "Ongoing",
      "Inflexible 缺乏灵活性"
    ],
    answer: 1
  },
  {
    question: "An appraiser's report must contain _____ to allow intended users to understand the scope of work performed.",
    options: [
      "No disclosure",
      "A section titled \"scope of work\"",
      "Sufficient information 足够的信息",
      "A pre-printed statement"
    ],
    answer: 2
  },
  {
    question: "An appraiser must not allow client objectives to cause the assignment results to be ____.",
    options: [
      "Biased",
      "Reliable",
      "Basic",
      "Credible"
    ],
    answer: 0
  },
  {
    question: "The SCOPE OF WORK RULE provides appraisers with significant flexibility. Along with that flexibility comes:",
    options: [
      "Release from liability 免除责任",
      "Deniability 否认",
      "Creative license 创作许可",
      "Responsibility 责任"
    ],
    answer: 3
  },
  {
    question: "If a clients objectives result in an appraiser developing biased assignment results:",
    options: [
      "The appraiser is not responsible; after all, he was just following orders.",
      "The client has violated违反了 USPAP",
      "The appraiser is solely单独 responsible(全权负责)",
      "This is permissible as long as只要 the appraiser discloses the bias"
    ],
    answer: 2
  },
  {
    question: "In reporting the scope of work in an appraisal or appraisal review report:",
    options: [
      "All written reports must contain a specific section titled Scope of Work",
      "Use of pre-printed forms is prohibited被禁止的",
      "The report must contain sufficient足够的 information so that intended users understand the scope of work",
      "The scope of work must be described in narrative记叙文 style"
    ],
    answer: 2
  },
  {
    question: "An appraiser is engaged to appraise a single-unit dwelling住宅. Upon inspection of the property, the appraiser realizes it is a three-unit dwelling. The appraisers best course of action is:",
    options: [
      "Continue with the same scope of work that was initially最初的 planned",
      "Withdraw退出 from the assignment",
      "Use a hypothetical假定的 condition to appraise the property as a single-unit",
      "Reconsider the scope of work before proceeding继续流程"
    ],
    answer: 3
  },
  {
    question: "An appraiser's peers are defined as other appraisers who: 评估师的同行定义为：",
    options: [
      "Have expertise专业技能 and competency胜任能力 in a similar type of assignment",
      "Hold the same level of state licensure",
      "Have a similar level of education",
      "Practice in the same market"
    ],
    answer: 0
  },

  // ===== CH6 =====

  {
    question: "If an assignment involves a jurisdictional管辖权 exception例外, what must an appraiser do?",
    options: [
      "Include a copy of the applicable可适用的 law or regulation as an addendum附录 to the appraisal, appraisal review, or appraisal consulting report",
      "Nothing; the law automatically supersedes接替 USPAP and eliminates消除 any need for disclosure",
      "Identify the law, comply遵从 with the law, disclose in the report the part of USPAP that is voided无效的部分, and cite in the report the law that caused the jurisdictional exception"
    ],
    answer: 2
  },
  {
    question: "If USPAP compliance is mandated强制执行 by federal law, no state or local law can create a jurisdictional exception.",
    options: [
      "False",
      "True"
    ],
    answer: 1
  },
  {
    question: "What is the purpose of the JURISDICTIONAL EXCEPTION RULE? 管辖例外规则的目的是什么？",
    options: [
      "To provide state appraisal regulatory监管 agencies additional enforcement powers",
      "To allow USPAP to preempt优先于 existing laws and regulations",
      "To provide a saving保全条款 or severability可分割条款 clause to preserve维护 the balance协调 of USPAP"
    ],
    answer: 2
  },
  {
    question: "When a law or regulation precludes compliance with any part of USPAP, appraisers must:",
    options: [
      "Ignore USPAP entirely彻底的",
      "Comply with that law or regulation",
      "Be allowed to take exception提出异议 to the law or regulation",
      "Ignore the law and adhere to USPAP"
    ],
    answer: 1
  },
  {
    question: "The use of the JURISDICTIONAL EXCEPTION RULE in an assignment is a matter of choice by an appraiser.",
    options: [
      "True",
      "False"
    ],
    answer: 1
  },
  {
    question: "Is it permissible to use instructions指示 from an attorney as a basis for a jurisdictional exception?",
    options: [
      "No",
      "Yes",
      "USPAP does not specify说明"
    ],
    answer: 0
  },
  {
    question: "As used in the JURISDICTIONAL EXCEPTION RULE, the term law includes ____. ",
    options: [
      "Legislative laws",
      "Administrative行政的 rules and ordinances条例 行政法规及条例",
      "All of these",
      "Court-made laws"
    ],
    answer: 2
  },
  {
    question: "When does a jurisdictional exception occur in an assignment?",
    options: [
      "It is automatic when a law precludes阻止 compliance with a part of USPAP",
      "The appraiser must invoke引用 the Rule",
      "The client must invoke引用 the Rule",
      "The state enforcement agency must approve of the exception to USPAP compliance"
    ],
    answer: 0
  },
  {
    question: "A state passes a law requiring appraisers to keep their workfiles for 10 years after preparation. Is this a jurisdictional exception under USPAP?",
    options: [
      "Yes",
      "No（评估师可以同时遵守 USPAP 和法律）",
      "USPAP does not specify"
    ],
    answer: 1
  }

];


// ====== Quiz Logic（完全沿用 Definitions） ======

let currentIndex = 0;
let score = 0;
let hasAnsweredCurrent = false;

const questionEl = document.getElementById("quiz-question");
const optionsEl = document.getElementById("quiz-options");
const feedbackEl = document.getElementById("quiz-feedback");
const progressEl = document.getElementById("quiz-progress");
const nextBtn = document.getElementById("quiz-next-btn");

// 启动 / 重启计时器
function startTimer() {
  if (!timerEl) return;

  if (!isQuizTimerOn()) {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    timerEl.textContent = "Timer OFF";
    return;
  }

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

// 超时：算错题，正确答案变绿
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

  feedbackEl.textContent = `Time's up! ⏰ Correct answer: "${q.options[correctIndex]}".`;
  feedbackEl.className = "quiz-feedback incorrect";

  addWrongQuestion(q);

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;
  nextBtn.disabled = false;

  setTimeout(() => {
    goToNextQuestion();
  }, 800);
}

// 渲染一题
function renderQuestion() {
  const q = quizQuestions[currentIndex];
  hasAnsweredCurrent = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "quiz-feedback";

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;

  questionEl.textContent = q.question;

  // 自动朗读
  speakQuestion(questionEl.textContent);

  // 选项随机化
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
    btn.addEventListener("click", () => handleAnswer(item.index, btn));
    optionsEl.appendChild(btn);
  });

  nextBtn.disabled = true;
  startTimer();
  saveQuizState();
}

// 点击作答
function handleAnswer(selectedIndex, buttonEl) {
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

// 洗牌所有题目
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

// 保存 / 读取进度
function saveQuizState() {
  try {
    const state = {
      currentIndex,
      score,
      questions: quizQuestions
    };
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch (e) {}
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

// ===== 初始化 =====
initQuizVoice();

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
        console.error("Service Worker registration failed (rule):", err)
      );
  });
}
