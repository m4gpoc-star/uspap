// ===== Speech synthesis：出题自动朗读题干 =====

let quizVoice = null;
const VOICE_KEY = "uspapVoicePreference";           // 语音设置 key（通用）
const QUIZ_STATE_KEY = "uspapStandardQuizState";    // ✅ Standard 专用
const QUIZ_TIMER_KEY = "uspapQuizTimerEnabled";     // 计时器设置（通用）

function isQuizTimerOn() {
  const v = localStorage.getItem(QUIZ_TIMER_KEY);
  return v !== "off";
}

const timerEl = document.getElementById("quiz-timer");
let timerId = null;
let timeLeft = 16;

// ===== 初始化语音（与 Definitions / Rule 一致） =====
function initQuizVoice() {
  if (typeof speechSynthesis === "undefined") return;

  function chooseVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices || !voices.length) return;

    // ⭐ 默认：第一次没有设置时，当作 mute（静音）
    const preferred = localStorage.getItem(VOICE_KEY) || "mute";

    // 如果是静音，就不选任何 voice
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

  // ⭐ 默认或手动设置为静音就不读
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


// ===== 错题本（与 Definitions / Rule 共用） =====
const WRONG_KEY = "uspapWrongQuestions";

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

function saveWrongQuestions(list) {
  localStorage.setItem(WRONG_KEY, JSON.stringify(list));
}

function addWrongQuestion(q) {
  const list = getWrongQuestions();
  const exists = list.some(item => item.question === q.question);
  if (!exists) {
    list.push(q);
    saveWrongQuestions(list);
  }
}

// ====== Standard CH7–CH12 ======
const quizQuestions = [
  // ==== CH7-4 ==== STANDARD 1 
  {
    question: "The requirements of STANDARD 1 can be used as a checklist by an appraiser who is developing a real property appraisal. ",
    options: [
      "False",
      "True"
    ],
    answer: 1
  },
  {
    question: "Which statement is FALSE regarding STANDARD 1?",
    options: [
      "It mirrors对照着 the appraisal process. ",
      "It contains six Standards Rules. ",
      "It can be used as a checklist for proper development.",
      "It covers real and personal property appraisal development. "
    ],
    answer: 3
  },

  // ==== CH7-14 ==== Intended user / minor errors / anonymous client
  {
    question: "If a mortgage抵押贷款 borrower receives a copy of an appraisal report from a mortgage lender as a result of disclosure requirements, which is true? ",
    options: [
      "This is an illegal act by the lender, who is subject遭受 to prosecution起诉.",
      "The appraiser can void作废 the appraisal at his/her discretion自行决定.",
      "The borrower is now considered an intended user under USPAP.",
      "This does not make the borrower an intended user."
    ],
    answer: 3
  },
  {
    question: "When does a series of minor errors potentially result in a USPAP violation违反? ",
    options: [
      "When the series of errors affects the credibility可信度 of the results.",
      "When there are more than 3 such errors in the report.",
      "When the client has to request corrections after the report is completed.",
      "When the errors were made by a trainee实习生 assisting the appraiser. "
    ],
    answer: 0
  },
  {
    question: "An appraiser’s client wishes to remain anonymous匿名的 and asks the appraiser not to include the client’s identity in an appraisal report. What should the appraiser do? ",
    options: [
      "Identify the client by an alias化名 in the report.",
      "Omit the client’s identity from the report but document it in the workfile.",
      "Withdraw退出 from the assignment.",
      "Insist坚决要求 on including the client’s identity in the report against the client’s wishes. "
    ],
    answer: 1
  },

  // ==== CH7-21 ==== Exposure time
  {
    question: "Which statement is TRUE regarding exposure time? ",
    options: [
      "It is necessary in all appraisal assignments.",
      "It is always assumed假定 to precede早于 the effective date of the appraisal. ",
      "It is always assumed to begin on the effective date and extend into the future."
    ],
    answer: 1
  },
  {
    question: "Exposure time is:",
    options: [
      "Not required to be reported. ",
      "An opinion developed by an appraiser.",
      "A fact to be found.",
      "Unnecessary in most appraisal assignments."
    ],
    answer: 1
  },

  // ==== CH7-32 ==== Inspection / relevant characteristics
  {
    question: "What is the primary purpose of an appraiser making an inspection of the subject property?",
    options: [
      "To prove to the client that the appraiser knows the property.",
      "To collect information about characteristics that are relevant to value.",
      "To meet the USPAP requirement that all subject properties be inspected. ",
      "All of the answers listed. "
    ],
    answer: 1
  },
  {
    question: "An example of a relevant property characteristic that could affect a real property appraisal assignment would be:",
    options: [
      "The type of report requested by the client.",
      "The fact that the subject property is affected by an easement地役权.",
      "The amount of time given for the appraiser to complete the assignment."
    ],
    answer: 1
  },

  // ==== CH7-33 ==== Extraordinary assumption / hypothetical condition ====
  {
    question: "An extraordinary assumption may be used in an assignment only if:",
    options: [
      "Required to develop credible results.",
      "Accompanied伴随着 by a limiting condition. ",
      "Approved by the client.",
      "Mandated by law or regulation. "
    ],
    answer: 0
  },
  {
    question: "When an appraiser provides a current value opinion on a proposed new building, he or she is utilizing利用 a(an) __________ that the proposed improvements地上的在建项目 are completed as of the effective date of the appraisal. ",
    options: [
      "Unethical contingency.",
      "Limiting condition.",
      "Extraordinary assumption.",
      "Hypothetical condition."
    ],
    answer: 3
  },

  // ====CH7-36==== Assignment conditions
  {
    question: "An unacceptable assignment condition would be a condition that: ",
    options: [
      "Limits the scope of work so that the value opinion is not credible.",
      "Limits report content, resulting in a misleading report.",
      "Precludes排除 an appraiser's impartiality公正.",
      "All of the answers listed. 列出的所有答案。"
    ],
    answer: 3
  },

  // ====CH7-50 ====Approaches to value / sales comparison
  {
    question: "When developing a sales comparison approach销售比较法 under USPAP, the appraiser must:",
    options: [
      "Follow time and distance guidelines specified by SR 1-4. ",
      "Consider at least three comparable sales.",
      "Analyze such data as are available to indicate a value conclusion."
    ],
    answer: 2
  },
  {
    question: "Which statement is TRUE regarding USPAP and the three approaches方法 to value?",
    options: [
      "An appraiser must develop all three approaches in every appraisal assignment.",
      "An assignment condition may require an appraiser to develop an approach that he or she would otherwise否则 consider unnecessary.",
      "USPAP requires at least two approaches to be developed in every assignment.",
      "USPAP requires specific methodology方法 for cost and income, but not for sales comparison."
    ],
    answer: 1
  },

  // ====CH7-59==== Sales / listing history
  {
    question: "When analyzing the subject property’s sales and transfer history in a real property appraisal assignment, an appraiser is required by USPAP to analyze: ",
    options: [
      "Only the most recent sale/transfer within the last three years.",
      "The most recent sale or transfer regardless不管怎样 of when it occurred发生.",
      "Prior sales or transfers of both subject and comparable properties. ",
      "All sales or transfers of the subject within three years prior to the effective date. "
    ],
    answer: 3
  },
  {
    question: "When analyzing listings of the subject property in a real property appraisal assignment, USPAP requires an appraiser to analyze, at a minimum: ",
    options: [
      "All listings that occurred within the last three years. 过去三年内发生的所有挂牌。",
      "Current listings. 当前列表（生效日仍然有效的挂牌信息）。",
      "All listings that occurred within the last year."
    ],
    answer: 1
  },

  // ====CH7-66====Development / prior listings / reconciliation
  {
    question: "In the development of an appraisal, the appraiser is required to:",
    options: [
      "Make a personal inspection of the subject property.",
      "Not commit犯错 a substantial实质的 error that significantly显著的 affects the appraisal. ",
      "Use all three approaches方法 to value.",
      "Inspect the comparable sales by at least driving by them."
    ],
    answer: 1
  },
  {
    question: "When is it necessary to analyze prior listings of the subject property in a real property appraisal assignment? ",
    options: [
      "When such analysis is relevant to the current assignment.",
      "Only in non-residential real property appraisal.",
      "In all appraisal assignments, regardless不管 of property type.",
      "Only in real property appraisal assignments."
    ],
    answer: 0
  },
  {
    question: "The process of reconciliation权衡评估 entails需要:",
    options: [
      "Careful consideration of the quality and quantity数量 of data.、",
      "Changing adjustments调节 to bring indicated values into a tighter狭窄的 range.、",
      "Finding additional comparable sales at the client's request.",
      "Averaging indicated values to arrive at a final opinion."
    ],
    answer: 0
  },

  // ====STANDARD 2 ==== 
  // ====CH8-5====reporting forms / report options
  {
    question: "The use of standard appraisal reporting forms:",
    options: [
      "Is mandated依法的 by STANDARD 2.",
      "Is not required by STANDARD 2.",
      "Requires approval by the ASB and AQB.",
      "Is prohibited被禁止 by USPAP."
    ],
    answer: 1
  },
  {
    question: "STANDARD 2 sets forth带来 requirements for:",
    options: [
      "Appraisal report content.",
      "Style and format of a real property appraisal report.",
      "The use of standard appraisal forms."
    ],
    answer: 0
  },
  // ====CH8-12====
  {
    question: "What is the essential difference between the two real property reporting options (Appraisal Report vs Restricted受限的 Appraisal Report)? ",
    options: [
      "The content and level of information.",
      "The report form and format prescribed规定 by USPAP.",
      "An Appraisal Report is the shorter option.",
      "A Restricted Appraisal Report does not require a workfile."
    ],
    answer: 0
  },

{
  question: "The two written report options stated in Standards Rule 2-2 are",
  options: [
    "Appraisal Report and Automated Valuation Model",
    "Written Appraisal Report and Electronic Appraisal Report",
    "Form Report and Narrative Report",
    "Appraisal Report and Restricted Appraisal Report."
  ],
  answer: 3
},


  // ====CH8-20====Report contents / dates / anonymous client again
  {
    question: "Which of the following is NOT required by USPAP to be in an Appraisal Report? ",
    options: [
      "Name or type of other intended users.",
      "Client's specific name.",
      "Type and definition of value.",
      "Effective date of appraisal."
    ],
    answer: 1
  },
  {
    question: "When reporting the results of an appraisal, dates that must be included are:",
    options: [
      "Effective date and inspection date.",
      "Effective date and report date.",
      "Inspection date and report date.",
      "Inspection date and assignment date."
    ],
    answer: 1
  },
  {
    question: "An appraiser’s client requests anonymity匿名 and asks that their identity身份 not appear in the Appraisal Report. What must the appraiser do? ",
    options: [
      "State in the report that the client’s identity has been withheld滞留 at the client’s request.",
      "Use care not to violate违反 the Confidentiality保密 section of the ETHICS RULE. 注意不要违反伦理规则的保密部分。",
      "Document the identity of the client in the workfile.",
      "All of these actions must be taken."
    ],
    answer: 3
  },

  // ====CH8-23====Scope of work reporting / excluding approaches
  {
    question: "In an Appraisal Report, the scope范围 of work used to develop评估过程 the appraisal must be:",
    options: [
      "Summarized.",
      "Described.",
      "Stated.",
      "Omitted."
    ],
    answer: 0
  },
  {
    question: "An appraiser determines决定 that the cost approach(成本法) is not necessary in an appraisal assignment, and therefore does not develop it. In the Restricted受限 Appraisal Report, what must the appraiser do?",
    options: [
      "State the reason for the exclusion排除 of the approach.",
      "Develop the approach and keep it in the workfile for later.",
      "Omit the approach without mentioning提及 it.",
      "Develop the approach and put it in the report anyway."
    ],
    answer: 0
  },

  // ====CH8-29====Restricted with other intended users / extraordinary assumptions in report / certification
  {
    question: "An appraiser is preparing a Restricted Appraisal Report where there are intended users in addition to the client. Which statement is true? ",
    options: [
      "These additional intended users must be identified in the report by type.",
      "These additional intended users may be identified by either name or type.",
      "They must be identified by name. 必须以姓名识别。",
      "Using a Restricted Appraisal Report in this situation violates违反 USPAP."
    ],
    answer: 3
  },
  {
    question: "When an extraordinary assumption is used in an appraisal, the report must state the extraordinary assumption and: ",
    options: [
      "State that its use may have affected the assignment results.",
      "Also value the property without the extraordinary assumption.",
      "Provide proof证明 of client approval.",
      "Explain it only in an addendum附录."
    ],
    answer: 0
  },
  {
    question: "All written appraisal reports prepared in compliance with USPAP must contain:",
    options: [
      "Adequate足够的 detail so any reader can understand the process.",
      "Maps, sketches草图, and photographs. 地图、草图和照片。",
      "A letter of transmittal传输.",
      "A signed certification."
    ],
    answer: 3
  },

  // ====CH8-39====Certification / bias
  {
    question: "According to USPAP, any appraiser who signs any part of an appraisal report is required to: ",
    options: [
      "Sign a certification.",
      "Sign the letter of transmittal.",
      "Inspect the property.",
      "Read the report."
    ],
    answer: 0
  },
  {
    question: "What is the purpose of including a signed certification in an appraisal report? ",
    options: [
      "For the appraiser to acknowledge ethical obligations义务.",
      "To prove that a written report was provided.",
      "To certify the appraiser was of sound mind心智健全.",
      "Because Fannie Mae requires it.。"
    ],
    answer: 0
  },
  {
    question: "Which of the following best describes bias in appraisal practice?",
    options: [
      "It is acceptable if disclosed prior to accepting the assignment.",
      "It is not permitted.",
      "It is permitted in market analysis.",
      "It is allowed, as long as it is disclosed in the report."
    ],
    answer: 1
  },

  // ====CH8-41====Oral real property reports
  {
    question: "To the extent范围内 possible and appropriate合适, oral appraisal reports for real property must address对应 the substantive实质性的 matters that apply to a(n):",
    options: [
      "Appraisal Review Report.",
      "Restricted Appraisal Report.",
      "Appraisal Report."
    ],
    answer: 2
  },
  {
    question: "An appraiser provides an oral report of a real property appraisal. Which statement is CORRECT?",
    options: [
      "A signed and dated certification must be inserted into the workfile. ",
      "Because it is oral, the appraiser does not have to sign a certification.",
      "The appraiser has no USPAP reporting obligations义务.",
      "The appraiser must send a written certification to the client afterward. "
    ],
    answer: 0
  },

  // ====CH8-52==== New assignment / readdress / prior client release
  {
    question: "If a client requests a more current valuation on a property that was the subject of a prior assignment, this is a: ",
    options: [
      "Recertification重新认证 of value. 价值重新认证。",
      "New assignment. ",
      "Appraisal consulting assignment.",
      "Extension of a prior先前的 assignment. "
    ],
    answer: 1
  },
  {
    question: "USPAP requires an appraiser to obtain获得 a release from a previous client before appraising the same property for a new client.",
    options: [
      "False",
      "True"
    ],
    answer: 0
  },
  {
    question: "An appraiser completes an appraisal for Bank A. Two months later Bank B asks him to “readdress” his prior report to them. Which statement is TRUE about USPAP obligations? ",
    options: [
      "He can readdress the report if he obtains permission from Bank A.",
      "He is not permitted to do a new appraisal for Bank B. ",
      "He is not permitted to “readdress” the report to Bank B.",
      "He can readdress only if value/market conditions have not changed."
    ],
    answer: 2
  },

  // ====CH-====Trainee / supervising appraiser
  {
    question: "A trainee’s name is stated正式表明 in the certification as having provided significant assistance, but the trainee does not sign. Is a description of the trainee’s assistance also required in the certification?",
    options: [
      "Yes",
      "USPAP is silent on this issue.",
      "No"
    ],
    answer: 0
  },
  {
    question: "If a supervising appraiser makes changes to a trainee's appraisal report which the trainee does not agree with, the trainee should:",
    options: [
      "Not sign the certification.",
      "Give the supervisor blanket permission to sign all reports.",
      "Sign the certification because the supervisor knows best."
    ],
    answer: 0
  },

  // ==== CH9 Standard 3 ====
  // ====CH9-4====Appraisal review – subject / reviewer / development
  {
    question: "The subject of an appraisal review assignment may be: ",
    options: [
      "Any work completed by a state licensed or certified appraiser.",
      "Any written work that is part of appraisal practice.",
      "A property previously valued by another appraiser.",
      "Another appraiser’s work that is completed as part of an appraisal or appraisal review assignment."
    ],
    answer: 3
  },
  {
    question: "In STANDARD 3, the word “reviewer” means:",
    options: [
      "A mortgage underwriter checking a report for errors. ",
      "An automated program checking math.",
      "All of these.",
      "An appraiser who is performing an appraisal review."
    ],
    answer: 3
  },
  {
    question: "A reviewer is performing an appraisal review on a residential appraisal report. USPAP requires the reviewer to: ",
    options: [
      "Develop an opinion of value of the property under review.",
      "Identify whether it is necessary to develop his or her own value opinion.",
      "Inform检举 the state agency if there are any deficiencies缺陷",
      "Contact the appraiser who completed the work"
    ],
    answer: 1
  },
  // ====CH9-11====
  {
    question: "When developing an appraisal review, USPAP requires a reviewer to identify the appraiser who completed the work under review:",
    options: [
      "Without exception.",
      "And work with the appraiser to correct errors.",
      "Unless the identity has been withheld保留(隐瞒) by the client.",
      "And personally contact that appraiser if there are questions."
    ],
    answer: 2
  },
  {
    question: "When performing an appraisal review, may a reviewer use information that was available to the original appraiser but not considered?",
    options: [
      "Yes",
      "No",
      "USPAP does not address this issue."
    ],
    answer: 0
  },
  // ====CH9-13====

  {
    question: "In performing an appraisal review, a reviewer may use information that was not available to the original appraiser in the normal course of business, as long as the information: ",
    options: [
      "Supports the original value opinion. ",
      "Is not used in developing the reviewer’s opinion of the quality of the work. ",
      "Discredits质疑 the original value opinion."
    ],
    answer: 1
  },

  // ====CH9-24====Two-stage assignment / complaint / own value under Std1
{
  question: "An appraisal review can be a two-stage阶段 assignment, which includes both an appraisal review and a value opinion by the reviewer.",
  options: [
    "False",
    "True"
  ],
  answer: 1
},
  {
    question: "Is a reviewer permitted to file a complaint投诉 with a state appraisal regulatory agency without the client’s consent许可? ",
    options: [
      "USPAP does not specify. USPAP",
      "No ",
      "Yes "
    ],
    answer: 2
  },
  {
    question: "Which statement is TRUE regarding USPAP and the appraisal review process for real property?",
    options: [
      "A reviewer is required to develop his or her own opinion of value if the original is not credible.",
      "If the reviewer develops his or her own opinion of value, it must be developed under STANDARD 1.",
      "In an appraisal review assignment, the subject of the review is the appraiser.",
      "The reviewer is prohibited被禁止 from developing an opinion of value. "
    ],
    answer: 1
  },

  // ====CH10-6====Appraisal review reporting / content / forms / certs
  {
    question: "A reviewer is responsible for ensuring that there is __________ in a review report so that it can be properly understood by __________.",
    options: [
      "Credible data; anyone.",
      "Meaningful有意义的 analysis; anyone.",
      "Sufficient充足的 information; intended users. ",
      "Current information; intended users. "
    ],
    answer: 2
  },
  {
    question: "An appraisal review report: 估价审查报告：",
    options: [
      "Has no minimum content requirements under USPAP. 在 USPAP 下没有最低要求。",
      "Must be written. 必须是书面形式。",
      "Must be separate from the work under review. 必须与正在审查的工作分开。",
      "Must use a pre-printed form. 必须使用预先打印的表格。"
    ],
    answer: 2
  },
  {
    question: "A reviewer uses a pre-printed form created by the client that lacks space for all USPAP-required items. What should the reviewer do? ",
    options: [
      "Use a different form.",
      "Withdraw退出 from the assignment.",
      "Fill out the form and omit everything that does not fit.",
      "Supplement补充 the form with the required content items. "
    ],
    answer: 3
  },
  // ====CH10-11====
  {
    question: "A reviewer develops her own value opinion that differs from the original. When reporting her value in the appraisal review report, what must she do? ",
    options: [
      "Simply state she disagrees with the value conclusion. ",
      "Provide data and analysis that match Appraisal Report requirements.",
      "State her value opinion and reference info retained保留 in the workfile.",
      "List specific Standards Rules violated by the original appraiser."
    ],
    answer: 1
  },
  {
    question: "A reviewer is preparing an appraisal review report. The identity of the appraiser who completed the work under review was not provided by the client. What should the reviewer do?",
    options: [
      "Request the identity in writing because USPAP requires the client to provide it.",
      "State in the appraisal review report that the appraiser’s identity was withheld扣留 by the client.",
      "Withdraw退出 from the assignment.",
      "Do not mention the issue."
    ],
    answer: 1
  },
  // ====CH10-15====
  {
    question: "As part of an appraisal review assignment, a reviewer develops his own opinion of value that differs from the original. How many certifications does USPAP require in the appraisal review report?",
    options: [
      "1",
      "2",
      "3",
      "4"
    ],
    answer: 0
  },
  {
    question: "Is a reviewer permitted by USPAP to use information that was not available to the original appraiser to discredit the work under review?",
    options: [
      "No",
      "USPAP does not address this issue.",
      "Yes"
    ],
    answer: 0
  },
  // ====CH10-18====
  {
    question: "If a reviewer provides an oral report of an appraisal review, what is required? ",
    options: [
      "The reviewer is precluded無法 from developing his or her own opinion of value.",
      "A signed certification must be inserted into the workfile.",
      "The reviewer has violated USPAP.",
      "It is not necessary to sign a certification."
    ],
    answer: 1
  },
  // ====CH10-21====
  {
    question: "If an appraiser is asked to develop an opinion of the quality of another appraiser's work and to agree or disagree with the value conclusion, this is:",
    options: [
      "An appraisal consulting assignment.",
      "A two-stage assignment.",
      "The appraiser must prepare a written report.",
      "The appraiser would violate USPAP by doing it."
    ],
    answer: 1
  },

  // ====CH11-5====STANDARD 5 / 6 / mass appraisal
  {
    question: "STANDARD 5 is most similar in structure to:",
    options: [
      "STANDARD 4",
      "STANDARD 2",
      "An Advisory Opinion",
      "STANDARD 1"
    ],
    answer: 3
  },
  {
    question: "STANDARD 5, Mass Appraisal Development, applies to: ",
    options: [
      "Both real and personal property.",
      "Real property only.",
      "Real property only for ad valorem taxation.",
      "Personal property only."
    ],
    answer: 0
  },
  // ====CH11-21====
  {
    question: "Notifications sent to property owners of the results of a mass批量 appraisal, which may be required by public policy, are considered:被看作 ",
    options: [
      "Notifications, not reports. ",
      "Reports under STANDARD 2.",
      "Violations違反 of the ETHICS RULE.",
      "Reports under STANDARD 6."
    ],
    answer: 1
  },
  {
    question: "An appraiser is engaged by a county assessment board委员会 to appraise an apartment building for ad valorem taxation(从价征税). Which USPAP STANDARD(S) apply? ",
    options: [
      "STANDARDS 5 and 6",
      "STANDARDS 7 and 8",
      "There are no USPAP Standards for this type.",
      "STANDARDS 1 and 2"
    ],
    answer: 3
  },

  //====CH11-35  ====Personal property / business / AVM / AO
  {
    question: "In a personal property appraisal assignment that includes multiple objects, which is TRUE?",
    options: [
      "The appraiser must be licensed as a personal property appraiser. ",
      "All objects must have the same value.",
      "Objects more significant to the assignment results should be the focus of analysis.",
      "All objects must get the same focus regardless不管 of value or significance."
    ],
    answer: 2
  },
  {
    question: "When appraising personal property, the appraiser must analyze prior sales of the subject over what time period? ",
    options: [
      "A reasonable and applicable time.",
      "Five years.",
      "Three years.",
      "One year. "
    ],
    answer: 0
  },
  //====CH11-36  ====
  {
    question: "An appraiser will report an appraisal in a Restricted Appraisal Report. May the development process be abbreviated简短 because the report is less detailed? ",
    options: [
      "USPAP does not specify. USPAP",
      "No, the development must still meet USPAP.",
      "Yes, a shorter report allows a simpler process."
    ],
    answer: 1
  },
  {
    question: "Which of the following reports require a signed certification?",
    options: [
      "Only real property appraisal reports.",
      "All reports except mass appraisal.",
      "All oral and written reports covered in USPAP. USPAP",
      "Only personal property and appraisal review reports. "
    ],
    answer: 2
  },
  //====CH11-50  ====
  {
    question: "An appraiser's certification in a business or intangible无形 asset资产 appraisal report does NOT:",
    options: [
      "State that the analysis is in conformity with USPAP.",
      "Contain a reference to inspection of the subject property. ",
      "Have to be included in a Restricted Appraisal Report.",
      "State that the appraiser has no bias. "
    ],
    answer: 1
  },
  {
    question: "A written business appraisal report must be prepared in accordance with which options? ",
    options: [
      "Narrative Appraisal Report or Form Appraisal Report.",
      "Appraisal Report or Summary Appraisal Report.",
      "Appraisal Report or Restricted Appraisal Report.",
      "Complete Appraisal Report or Limited Appraisal Report."
    ],
    answer: 2
  },
  //====CH12-11====Advisory Opinions====

  {
    question: "An appraisal that takes into consideration the full effect of known environmental contamination would be considered:",
    options: [
      "Hypothetical condition.",
      "Extraordinary assumption. ",
      "\"As-is\".原样的",
      "Subject to remediation补救."
    ],
    answer: 2
  },
  {
    question: "Which statement BEST describes Advisory Opinions?",
    options: [
      "They interpret解释 USPAP and are intended to be enforceable.",
      "They are not part of USPAP but illustrate说明 applicability适用性 and provide guidance.",
      "They are part of USPAP and they are the ASB's way of addressing应对 changes in appraisal marketplace.",
      "They establish supplemental补充的 standards that build on STANDARDS 1–10."
    ],
    answer: 1
  },
  //====CH12-16====
  {
    question: "An appraiser provides raw原始的/生肉 AVM自动估值模型 output to a client. This is:",
    options: [
      "An appraisal under STANDARDS 1 and 2.",
      "A violation违反 of the ETHICS RULE.",
      "Not an appraisal; however, a workfile is required by USPAP.",
      "Not an appraisal, and no workfile is required."
    ],
    answer: 3
  },

  // Market value / federally regulated / AO-33 / dates
  {
    question: "An appraiser agrees to provide a market value appraisal for a client. Which statement is true? ",
    options: [
      "Market value is the only type of value, so defining it is unnecessary.",
      "There is only one definition of market value, so identification识别 is unimportant.",
      "All market value definitions are essentially本质上 the same and interchangeable可互换的.",
      "It is essential that the appraiser identify the source of the definition of value to be used."
    ],
    answer: 3
  },
  //====CH12-20====
  {
    question: "If a borrower attempts to engage an appraiser to complete an appraisal for a federally-regulated lending transaction, the appraiser should disclose: ",
    options: [
      "That the lender must directly engage the appraiser, and the report can be readdressed改变报告的指向 with written permission.",
      "That the lender must engage the appraiser, and the appraiser cannot later readdress the report.",
      "That the borrower may order the appraisal and it can later be readdressed.",
      "That the appraiser is too busy to accept borrower-clients."
    ],
    answer: 1
  },
  {
    question: "Regulations and guidelines that apply to an appraisal for a federally-regulated lending transaction are:",
    options: [
      "Assignment conditions.",
      "Hypothetical conditions.",
      "Limiting conditions.",
      "Jurisdictional exceptions."
    ],
    answer: 0
  },
  //====CH12-25 ====
  {
    question: "According to AO-33, the results of discounted cash flow (DCF) analysis should:",
    options: [
      "Not be referred牵扯到 to as an appraisal.",
      "Not be included in an appraisal report.",
      "Be expressed表达 as a single-point value conclusion.",
      "Be tested and checked for errors and reasonableness."
    ],
    answer: 3
  },
  {
    question: "What type of appraisal is indicated by the phrase, “On September 10, 2012, the market value of the subject property was $200,000”?",
    options: [
      "Concurrent并发的",
      "Prospective预期的",
      "Retrospective回顾性的",
      "Current"
    ],
    answer: 2
  },
  {
    question: "What does the effective date of an appraisal establish?",
    options: [
      "The approximate大致 date the appraiser can expect payment.",
      "The context背景与语境 of the value opinion.",
      "The date the report was prepared.",
      "The date the certification was signed."
    ],
    answer: 1
  }
];

// ====== Quiz 逻辑（与 Rule / Definitions 一致） ======

let currentIndex = 0;
let score = 0;
let hasAnsweredCurrent = false;

const questionEl = document.getElementById("quiz-question");
const optionsEl = document.getElementById("quiz-options");
const feedbackEl = document.getElementById("quiz-feedback");
const progressEl = document.getElementById("quiz-progress");
const nextBtn = document.getElementById("quiz-next-btn");

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

  // 不显示“Time's up / 正确答案”文字，只用颜色提示
  feedbackEl.textContent = "";
  feedbackEl.className = "quiz-feedback incorrect";

  addWrongQuestion(q);

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;
  nextBtn.disabled = false;

  setTimeout(() => {
    goToNextQuestion();
  }, 800);
}


function renderQuestion() {
  const q = quizQuestions[currentIndex];
  hasAnsweredCurrent = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "quiz-feedback";

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;

  questionEl.textContent = q.question;

  speakQuestion(questionEl.textContent);

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
    // 正确：只用绿色按钮提示
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback correct";
  } else {
    // 错误：只用红色 / 绿色按钮提示，不写出正确答案
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback incorrect";
    addWrongQuestion(q);
  }

  progressEl.textContent =
    `Question ${currentIndex + 1} of ${quizQuestions.length} · Score: ${score}`;
  nextBtn.disabled = false;

  saveQuizState();
}


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

function saveQuizState() {
  try {
    const state = {
      currentIndex,
      score,
      questions: quizQuestions
    };
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  } catch {}
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
  } catch {
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
        console.error("Service Worker registration failed (standard):", err)
      );
  });
}
