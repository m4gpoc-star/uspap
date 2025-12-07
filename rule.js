// ===== Speech synthesis：出题自动朗读题干 =====

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

// ====== USPAP Chapter 4–6 Rule Quiz Question Bank ======

const quizQuestions = [
  {
    question: "The credibility of assignment results is measured in the context of: 作业结果的可信度是根据以下情况来衡量的：",
    options: [
      "Lending guidelines 贷款指南",
      "The attainment of the clients stipulated result 达到客户约定的结果’",
      "The amount of the value conclusion 价值结论的数量",
      "The intended use 预期用途",
    ],
    answer: 3
  },
  {
    question: "________ In order to determine the appropriate scope of work, the appraiser must ________ the problem to be solved. 为了确定适当的工作范围，评估师必须要解决的问题。",
    options: [
      "Solve 解决",
      "Value 价值",
      "Accept 接受",
      "Identify 确认",
    ],
    answer: 3
  },
  {
    question: "_________  _________ Appraisers have broad _________ and significant _________ in determining the appropriate scope of work in an assignment. 评估师在确定一项任务的适当工作范围时具有广泛的和显著的能力。",
    options: [
      "Acceptance, liability 验收、责任",
      "Errors, omissions 错误、遗漏",
      "Boundaries, limitations 界限、限制",
      "Flexibility, responsibility 灵活性、责任感",
    ],
    answer: 3
  },
  {
    question: "Examples of assignment conditions include: 分配条件的示例包括：",
    options: [
      "Extraordinary assumptions 非凡的假设",
      "Hypothetical conditions 假设条件",
      "All of these answers 所有这些答案",
      "Laws and regulations 法律法规",
    ],
    answer: 2
  },
  {
    question: "Intended use is: 预期用途是：",
    options: [
      "Not necessary to determine in an appraisal review assignment 无需在评估审查任务中确定",
      "Determined by the client on the basis of communication with the appraiser 由客户根据与评估师的沟通情况确定",
      "One of the last determinations to be made before submitting the report 提交报告前要做的最后决定之一",
      "Identified by the appraiser on the basis of communication with the client 由评估师根据与客户的沟通确定",
    ],
    answer: 3
  },
  {
    question: "Identification of the intended use of an appraiser's opinions and conclusions is: 确定评估师意见和结论的预期用途是：",
    options: [
      "Not necessary in most appraisal assignments 在大多数评估任务中没有必要",
      "Necessary only when doing non-mortgage assignments 仅在进行非抵押任务时才需要",
      "Necessary for determining the appropriate scope of work 确定适当的工作范围所必需的",
      "Not required unless the client wants the intended use to be disclosed 除非客户希望披露预期用途，否则无需披露",
    ],
    answer: 2
  },
  {
    question: "The responsibility for determining an appropriate scope of work rests with the: 确定适当的工作范围的责任在于：",
    options: [
      "Appraiser's peers 评估师的同行",
      "Client 客户",
      "Intended users 目标用户",
      "Appraiser 估价师",
    ],
    answer: 3
  },
  {
    question: "___________ In an appraisal or appraisal review assignment, the scope of work is an ___________ process. 在评估或评估审查任务中，工作范围是一个过程。",
    options: [
      "Unnecessary 不必要",
      "Ongoing 正在进行",
      "Inflexible 缺乏灵活性",
    ],
    answer: 1
  },
  {
    question: "____________ An appraiser's report must contain ____________ to allow intended users to understand the scope of work performed. 评估师的报告必须包含以便目标用户了解所执行工作的范围。",
    options: [
      "No disclosure 未披露",
      "A section titled \"scope of work\" 标题为“工作范围”的部分",
      "Sufficient information 足够的信息",
      "A pre-printed statement 预先打印的声明",
    ],
    answer: 2
  },
  {
    question: "An appraiser must not allow client objectives to cause the assignment results to be _________. 评估师不得让客户的目标导致任务结果不尽如人意。",
    options: [
      "Biased 有偏见",
      "Reliable 可靠的",
      "Basic 基本的",
      "Credible 可信",
    ],
    answer: 0
  },
  {
    question: "The SCOPE OF WORK RULE provides appraisers with significant flexibility. Along with that flexibility comes: 工作范围规则为评估师提供了极大的灵活性。此外，这种灵活性还包括：",
    options: [
      "Release from liability 免除责任",
      "Deniability 否认",
      "Creative license 创作许可",
      "Responsibility 责任",
    ],
    answer: 3
  },
  {
    question: "If a clients objectives result in an appraiser developing biased assignment results: 如果客户的目标导致评估师得出有偏见的任务结果：’",
    options: [
      "The appraiser is not responsible; after all, he was just following orders 估价师没有责任，毕竟他只是奉命行事",
      "USPAP The client has violated USPAP 客户违反了",
      "The appraiser is solely responsible 评估师全权负责",
      "This is permissible as long as the appraiser discloses the bias 只要评估师披露偏见，这是允许的",
    ],
    answer: 2
  },
  {
    question: "In reporting the scope of work in an appraisal or appraisal review report: 在评估或评估审查报告中报告工作范围时：",
    options: [
      "All written reports must contain a specific section titled Scope of Work 所有书面报告必须包含一个标题为“工作范围”的特定部分“”",
      "Use of pre-printed forms is prohibited 禁止使用预印表格",
      "The report must contain sufficient information so that intended users understand the scope of work 报告必须包含足够的信息，以便目标用户了解工作范围",
      "The scope of work must be described in narrative style 工作范围必须以叙述方式描述",
    ],
    answer: 2
  },
  {
    question: "An appraiser is engaged to appraise a single-unit dwelling. Upon inspection of the property, the appraiser realizes it is a three-unit dwelling. The appraisers best course of action is: 一位估价师受聘对一套单户住宅进行估价。在对该房产进行勘察后，估价师发现这是一套三户住宅。估价师的最佳做法是：’",
    options: [
      "Continue with the same scope of work that was initially planned 继续进行最初计划的工作范围",
      "Withdraw from the assignment 退出任务",
      "Use a hypothetical condition to appraise the property as a single-unit 使用假设条件对房产进行单体评估",
      "Reconsider the scope of work before proceeding 在继续之前重新考虑工作范围",
    ],
    answer: 3
  },
  {
    question: "An appraiser's peers are defined as other appraisers who: 评估师的同行定义为：",
    options: [
      "Have expertise and competency in a similar type of assignment 具备类似任务的专业知识和能力",
      "Hold the same level of state licensure 持有相同级别的州执照",
      "Have a similar level of education 具有相似的教育水平",
      "Practice in the same market 在同一市场实践",
    ],
    answer: 0
  },
  {
    question: "If an assignment involves a jurisdictional exception, what must an appraiser do? 如果任务涉及管辖例外情况，评估师必须做什么？",
    options: [
      "Include a copy of the applicable law or regulation as an addendum to the appraisal, appraisal review, or appraisal consulting report 将适用法律或法规的副本作为评估、评估审查或评估咨询报告的附录",
      "USPAPNothing; the law automatically supersedes USPAP and eliminates any need for disclosure 无需；法律自动取代，并消除任何披露的需要",
      "USPAP  Identify the law, comply with the law, disclose in the report the part of USPAP that is voided, and cite in the report the law that caused the jurisdictional exception 识别法律、遵守法律、在报告中披露中无效的部分，并在报告中引用导致管辖例外的法律",
    ],
    answer: 2
  },
  {
    question: "USPAPIf USPAP compliance is mandated by federal law, no state or local law can create a jurisdictional exception. 如果联邦法律规定必须遵守，则任何州或地方法律都不能产生管辖例外。",
    options: [
      "错误的",
      "真的",
    ],
    answer: 1
  },
  {
    question: "What is the purpose of the JURISDICTIONAL EXCEPTION RULE? 管辖例外规则的目的是什么？",
    options: [
      "To provide state appraisal regulatory agencies additional enforcement powers 赋予州评估监管机构额外的执法权力",
      "USPAP To allow USPAP to preempt existing laws and regulations 允许优先于现有法律法规",
      "USPAP To provide a saving or severability clause to preserve the balance of USPAP 提供保留或可分割条款以维护的平衡",
    ],
    answer: 2
  },
  {
    question: "USPAP When a law or regulation precludes compliance with any part of USPAP, appraisers must: 当法律或法规妨碍遵守的任何部分时，评估师必须：",
    options: [
      "USPAP Ignore USPAP entirely 完全忽略",
      "Comply with that law or regulation 遵守该法律或法规",
      "Be allowed to take exception to the law or regulation 被允许对法律或法规提出异议",
      "USPAPIgnore the law and adhere to USPAP 无视法律，遵守",
    ],
    answer: 1
  },
  {
    question: "The use of the JURISDICTIONAL EXCEPTION RULE in an assignment is a matter of choice by an appraiser. 在任务中使用司法例外规则是评估师的选择。",
    options: [
      "真的",
      "错误的",
    ],
    answer: 1
  },
  {
    question: "Is it permissible to use instructions from an attorney as a basis for a jurisdictional exception? 是否可以使用律师的指示作为管辖权例外的依据？",
    options: [
      "不",
      "是的",
      "USPAP  USPAP does not specify 没有具体说明",
    ],
    answer: 0
  },
  {
    question: "____________As used in the JURISDICTIONAL EXCEPTION RULE, the term law includes ____________. 在管辖权例外规则中，“法律”一词包括。“”",
    options: [
      "Legislative laws 立法法",
      "Administrative rules and ordinances 行政法规及条例",
      "All of这些答案",
      "Court-made laws 法院制定的法律",
    ],
    answer: 2
  },
  {
    question: "When does a jurisdictional exception occur in an assignment? 何时在转让中会出现管辖权例外？",
    options: [
      "USPAP It is automatic when a law precludes compliance with a part of USPAP 当法律禁止遵守的一部分时，它是自动的",
      "The appraiser must invoke the Rule 评估师必须援引规则",
      "The client must invoke the Rule 客户端必须调用规则",
      "USPAP The state enforcement agency must approve of the exception to USPAP compliance 州执法机构必须批准合规例外",
    ],
    answer: 0
  },
  {
    question: "10USPAPA state passes a law requiring appraisers to keep their workfiles for 10 years after preparation. Is this a jurisdictional exception under USPAP? 某州通过了一项法律，要求评估师在准备工作完成后保留其工作档案年。这是否属于下的司法管辖例外？",
    options: [
      "是的",
      "USPAP10USPAP 不（这不被视为司法管辖权例外，因为它并不妨碍评估师遵守。评估师可以通过将其工作档案保存年，同时遵守和法律规定。）",
      "USPAP USPAP does not specify 没有具体说明",
    ],
    answer: 1
  },
];

// 把 CH4 Question.docx 的题目也 push 进来
quizQuestions.push(
  // CH4-8
  {
    question: "Bias is permitted in an appraisal as long as只要 the bias is clearly disclosed in the report.",
    options: [
      "False 错误的",
      "True 正确的"
    ],
    answer: 0
  },
  {
    question: "In appraisal practice, advocating the cause理由 or interest权益 of any party or issue is:",
    options: [
      "Permitted when done by an unlicensed appraiser 由未持牌评估师执行时允许",
      "Permitted when a contingent附加 fee is not involved 未涉及附加费用时允许",
      "Not permitted 不被允许",
      "Permitted when appropriately disclosed披露 适当披露时允许"
    ],
    answer: 2
  },
  {
    question: "The ethical obligations of USPAP apply to:",
    options: [
      "Appraisal companies 评估公司",
      "Individual appraisers 个体评估师",
      "Appraisal clients 评估客户",
      "All of the answers listed 以上全部"
    ],
    answer: 1
  },

  // CH4-17
  {
    question: "An appraiser must disclose any service he or she provided regarding the subject property for a period of _________ prior之前 to agreeing答应 to perform the assignment.",
    options: [
      "Ten years 十年",
      "Three years 三年",
      "One year 一年",
      "USPAP does not specify a prior time period 未规定之前的时间范围"
    ],
    answer: 1
  },
  {
    question: "An appraiser is disclosing to a client the fact that she had previously appraised the subject property within the prior three years. When making this disclosure, the appraiser must be careful to:",
    options: [
      "Provide the date and the value conclusion from the prior appraisal 提供上一次评估的日期和价值结论",
      "Obtain获得 a release许可 from the previous client in order to proceed with the new assignment 为继续当前任务而从前一位客户处获得许可",
      "Not disclose confidential机密 information from the previous assignment 不得披露上一次任务中的机密信息",
      "Transmit a complete copy of the prior appraisal report and workfile to the new client 向新客户传送完整的上一份评估报告及工作底稿"
    ],
    answer: 2
  },

  // CH4-24
  {
    question: "An appraiser has been asked to complete an appraisal assignment. The fee is to be paid only if the loan closes. According to USPAP, may the appraiser accept the assignment under these conditions?",
    options: [
      "Yes, as long as the appraiser clearly discloses the basis of such a contingency in the certification附加条件 and in any letter of transmittal正式提交函",
      "No, unless the appraiser receives written permission allowing the transfer of the appraisal to other parties 除非收到书面许可允许报告转移给其他方",
      "Yes, this is a business decision between the appraiser and the client 是的，这是评估师与客户之间的商业决定",
      "No, the fee arrangement约定 is an unethical contingency以结果为前提 arrangement and violates侵犯了 the ETHICS RULE 这种收费约定是不道德的附带条件，违反伦理规则"
    ],
    answer: 3
  },
  {
    question: "In a real property appraisal assignment prepared for a mortgage抵押贷款 lender出借方, an appraiser is permitted by USPAP to base his or her compensation报酬 for an appraisal assignment on:",
    options: [
      "Whether or not the report is transmitted to the client by the due date 报告是否在截止日期前送达客户",
      "Whether or not the loan transaction closes 贷款交易是否完成",
      "The amount of the value opinion 价值意见的高低",
      "Reconciling综合权衡后确定最终结论 the value conclusion to the high end of the indicated指定的 range 将最终价值结论调到区间上限"
    ],
    answer: 0
  },

  // CH4-33
  {
    question: "The Confidentiality section of the ETHICS RULE prohibits禁止 an appraiser from disclosing confidential information or _________ to unauthorized parties.",
    options: [
      "The appraiser’s personal financial information 评估师的个人财务信息",
      "Assignment results 任务结果",
      "Non-confidential information 非机密信息",
      "Physical characteristics 实物特征"
    ],
    answer: 1
  },
  {
    question: "In most cases, an appraiser may share __________ from an appraisal assignment with other appraisers without obtaining the client’s consent同意.",
    options: [
      "Assignment results 任务结果",
      "Physical characteristics 实物特征",
      "Confidential information 机密信息",
      "All of these 以上全部"
    ],
    answer: 1
  },
  {
    question: "An appraiser concludes判断 that a subject property has functional inadequacies缺陷. This conclusion is:",
    options: [
      "An assignment result and must be treated as confidential 属于任务结果，必须视为机密",
      "A conclusion unrelated无关的 to value 与价值无关的结论",
      "An assignment result which may be disclosed to anyone without permission 可向任何人披露的任务结果",
      "A physical characteristic and therefore not confidential 属于物理特征，因此不是机密"
    ],
    answer: 0
  },

  // CH4-38
  {
    question: "The Nondiscrimination不歧视 section of the ETHICS RULE requires an appraiser to be aware知道 of and comply遵从 with ____________ antidiscrimination反歧视 laws and regulations.",
    options: [
      "only federal 仅联邦",
      "federal, state, and local 联邦、州及地方",
      "only international 仅国际",
      "United States and Canadian 美国与加拿大"
    ],
    answer: 1
  },
  {
    question: "Which of the following laws is NOT specifically referenced in the Nondiscrimination section of the ETHICS RULE?",
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
      "USPAP does not address this issue 未涉及该问题",
      "Yes, as long as the report that was sent to the client was signed 只要发给客户的版本签了字即可",
      "No, a true copy must include a signature 否，真实副本必须包含签名",
      "Yes, because there is no USPAP requirement for an appraisal report to contain a signature 是的，因为并未要求报告必须含有签名"
    ],
    answer: 2
  },
  {
    question: "An appraiser prepared an appraisal report in April 2021. The appraiser testified作证 in court regarding the value of the property in January 2022. The decision was rendered做出 in February 2022 and was appealed上诉 in April 2022. The appellate受理上诉的 court heard the case in January 2023 and remanded发回 the case for reconsideration再审核 by the lower court. Final disposition决定 of the case occurred发生 in September 2023. At a minimum, how long must the appraiser retain the workfile?",
    options: [
      "September 2025 2025年9月",
      "September 2028 2028年9月",
      "February 2024 2024年2月",
      "April 2026 2026年4月"
    ],
    answer: 3
  },
  {
    question: "Is an appraiser permitted by USPAP to create a workfile after transmitting the report to the client?",
    options: [
      "No 不允许",
      "Yes 允许",
      "USPAP does not specify明确规定 未作具体规定"
    ],
    answer: 0
  },

  // CH4-55
  {
    question: "Which statement best describes the word “competency胜任力” as it relates描述 to appraisal practice?",
    options: [
      "It is fundamental根本的 to the definition of “appraiser.” 它是“评估师”定义的根本要素",
      "Lack缺乏 of competency is expected预判的 by clients 客户预期评估师会不胜任",
      "Clients are required to be competent能干的 客户必须具备胜任力",
      "It is an ideal, virtually事实上几乎 impossible to achieve 只是一种理想，几乎无法实现"
    ],
    answer: 0
  },

  // CH4-63
  {
    question: "Which of these is NOT one of the steps required by USPAP when an appraiser wishes to perform an assignment for which he or she initially最初 lacks the knowledge and experience?",
    options: [
      "Disclose the lack of knowledge and/or experience to the client 向客户披露缺乏相应知识/经验",
      "Use a hypothetical假设 condition to complete the assignment as though the appraiser already had the knowledge and experience 使用假设条件，好像已经具备知识与经验一样完成任务",
      "Take steps necessary to obtain the necessary knowledge and experience 采取必要步骤获得相应知识和经验",
      "Disclose, in the report, the lack of knowledge and/or experience and the steps taken to complete the assignment competently 在报告中披露缺乏知识/经验以及为胜任完成任务所采取的步骤"
    ],
    answer: 1
  },
  {
    question: "In order to perform an assignment for which an appraiser initially lacks the knowledge and experience to complete competently, the appraiser must:",
    options: [
      "Refer转交 the appraisal to an appraiser qualified to complete the assignment 将任务转交给有资质的评估师",
      "Ask for more time and reduce降低 the fee 要求更长时间并降低费用",
      "Disclose to the client, prior在之前 to agreeing答应 to perform the assignment, the lack of knowledge or experience 在同意接单前向客户披露自身知识或经验不足",
      "Associate with an appraiser qualified to complete the assignment 与有资质完成该任务的评估师合作"
    ],
    answer: 2
  },

  // CH4-69
  {
    question: "The requirement to create and maintain a workfile for an appraisal or appraisal review assignment applies to:",
    options: [
      "All appraisers, regardless无论 of credential资格 level 所有评估师，不论资格等级",
      "Only trainees实习生 or assistants助理 仅实习生或助理",
      "Appraisers, clients, and intended users 评估师、客户及预期使用人",
      "Only licensed or certified appraisers 仅持证或注册评估师"
    ],
    answer: 0
  },
  {
    question: "Three appraisers work together on an appraisal assignment. What would NOT be an appropriate workfile arrangement安排 under USPAP?",
    options: [
      "One appraiser maintains custody监护 of the workfile and the other two appraisers make access访问 and retrieval检索 arrangements安排 由一名评估师保管工作底稿，其他两名约定访问方式",
      "The workfile is posted on the Internet, so that anyone who wants to see it will be able to access it 将工作底稿放在互联网上，任何人都可访问",
      "The workfile is kept in a neutral location where all three appraisers will be able to access it 将底稿存放在三人都可访问的中立地点",
      "Each appraiser maintains a copy of the workfile 每位评估师都保存一份底稿"
    ],
    answer: 1
  }
);

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
