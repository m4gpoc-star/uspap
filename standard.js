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

// ====== Standard 题库（Ch 7–12） ======
const quizQuestions = [
  // STANDARD 1 概念
  {
    question: "The requirements of STANDARD 1 can be used as a checklist by an appraiser who is developing a real property appraisal. 标准 1 的要求可供正在进行不动产评估的评估师用作清单。",
    options: [
      "False 错误的",
      "True 真的"
    ],
    answer: 1
  },
  {
    question: "Which statement is FALSE regarding STANDARD 1? 关于标准 1，哪个陈述是错误的？",
    options: [
      "It mirrors the appraisal process. 它反映了评估过程。",
      "It contains six Standards Rules. 它包含六条标准规则。",
      "It can be used as a checklist for proper development. 它可以用作正确开发的清单。",
      "It covers real and personal property appraisal development. 它涵盖不动产和动产评估发展。"
    ],
    answer: 3
  },

  // Intended user / minor errors / anonymous client
  {
    question: "If a mortgage borrower receives a copy of an appraisal report from a mortgage lender as a result of disclosure requirements, which is true? 如果抵押贷款借款人根据披露要求收到贷款机构出具的评估报告副本，哪项说法正确？",
    options: [
      "This is an illegal act by the lender, who is subject to prosecution. 这是贷款人的违法行为，将被起诉。",
      "The appraiser can void the appraisal at his/her discretion. 评估师可自行决定取消评估。",
      "The borrower is now considered an intended user under USPAP. 借款人现在被视为 USPAP 下的预期用户。",
      "This does not make the borrower an intended user. 这并不意味着借款人是预期用户。"
    ],
    answer: 3
  },
  {
    question: "When does a series of minor errors potentially result in a USPAP violation? 一系列小错误何时可能导致违反 USPAP？",
    options: [
      "When the series of errors affects the credibility of the results. 当一系列错误影响结果的可信度时。",
      "When there are more than 3 such errors in the report. 当报告中出现 3 个以上此类错误时。",
      "When the client has to request corrections after the report is completed. 当客户在报告完成后要求评估师进行更正时。",
      "When the errors were made by a trainee assisting the appraiser. 当错误是由协助评估师的实习生犯下的时。"
    ],
    answer: 0
  },
  {
    question: "An appraiser’s client wishes to remain anonymous and asks the appraiser not to include the client’s identity in an appraisal report. What should the appraiser do? 一位评估师的客户希望保持匿名，并要求评估师不要在评估报告中透露客户的身份。评估师应该怎么做？",
    options: [
      "Identify the client by an alias in the report. 通过报告中的别名识别客户。",
      "Omit the client’s identity from the report but document it in the workfile. 在报告中省略客户身份，但在工作文件中记录客户身份。",
      "Withdraw from the assignment. 退出任务。",
      "Insist on including the client’s identity in the report against the client’s wishes. 违背客户意愿，坚持在报告中写明客户身份。"
    ],
    answer: 1
  },

  // Exposure time
  {
    question: "Which statement is TRUE regarding exposure time? 关于曝光时间的陈述中哪一项是正确的？",
    options: [
      "It is necessary in all appraisal assignments. 在所有评估任务中它都是必要的。",
      "It is always assumed to precede the effective date of the appraisal. 它总是被认为早于评估生效日期。",
      "It is always assumed to begin on the effective date and extend into the future. 它总是被认为从评估生效日期开始并延伸到未来。"
    ],
    answer: 1
  },
  {
    question: "Exposure time is: 曝光时间为：",
    options: [
      "Not required to be reported. 无需报告。",
      "An opinion developed by an appraiser. 评估师提出的意见。",
      "A fact to be found. 有待发现的事实。",
      "Unnecessary in most appraisal assignments. 在大多数评估任务中没有必要。"
    ],
    answer: 1
  },

  // Inspection / relevant characteristics
  {
    question: "What is the primary purpose of an appraiser making an inspection of the subject property? 评估师对标的财产进行检查的主要目的是什么？",
    options: [
      "To prove to the client that the appraiser knows the property. 向客户证明评估师了解该房产。",
      "To collect information about characteristics that are relevant to value. 收集与价值相关的特征信息。",
      "To meet the USPAP requirement that all subject properties be inspected. 为了满足 USPAP 对所有标的财产进行检查的要求。",
      "All of the answers listed. 列出的所有答案。"
    ],
    answer: 1
  },
  {
    question: "An example of a relevant property characteristic that could affect a real property appraisal assignment would be: 可能影响不动产评估任务的相关财产特征示例如下：",
    options: [
      "The type of report requested by the client. 客户要求的报告类型。",
      "The fact that the subject property is affected by an easement. 标的财产受到地役权影响的事实。",
      "The amount of time given for the appraiser to complete the assignment. 评估师完成任务所需的时间。"
    ],
    answer: 1
  },

  // Extraordinary assumption / hypothetical condition
  {
    question: "An extraordinary assumption may be used in an assignment only if: 仅在下列情况下才可以在任务中使用非常假设：",
    options: [
      "Required to develop credible results. 需要得出可信的结果。",
      "Accompanied by a limiting condition. 伴随限制条件。",
      "Approved by the client. 经客户批准。",
      "Mandated by law or regulation. 法律或法规规定。"
    ],
    answer: 0
  },
  {
    question: "When an appraiser provides a current value opinion on a proposed new building, he or she is utilizing a(an) __________ that the proposed improvements are completed as of the effective date of the appraisal. 当评估师对拟建的新建筑提供当前价值意见时，他或她正在利用 ________ 以确保拟建的改进在评估生效日期之前完成。",
    options: [
      "Unethical contingency. 不道德的偶然事件。",
      "Limiting condition. 限制条件。",
      "Extraordinary assumption. 非凡的假设。",
      "Hypothetical condition. 假设条件。"
    ],
    answer: 3
  },

  // Assignment conditions
  {
    question: "An unacceptable assignment condition would be a condition that: 不可接受的分配条件是：",
    options: [
      "Limits the scope of work so that the value opinion is not credible. 将工作范围限制在价值意见不可信的范围内。",
      "Limits report content, resulting in a misleading report. 限制报告内容，导致报告具有误导性。",
      "Precludes an appraiser's impartiality. 妨碍评估师的公正性。",
      "All of the answers listed. 列出的所有答案。"
    ],
    answer: 3
  },

  // Approaches to value / sales comparison
  {
    question: "When developing a sales comparison approach under USPAP, the appraiser must: 据 USPAP 制定销售比较方法时，评估师必须：",
    options: [
      "Follow time and distance guidelines specified by SR 1-4. 必须遵守 SR 1-4 规定的时间和距离准则。",
      "Consider at least three comparable sales. 必须考虑至少三个可比销售。",
      "Analyze such data as are available to indicate a value conclusion. 必须分析可用的数据，以得出价值结论。"
    ],
    answer: 2
  },
  {
    question: "Which statement is TRUE regarding USPAP and the three approaches to value? 关于 USPAP 和三种价值方法的陈述中哪一项是正确的？",
    options: [
      "An appraiser must develop all three approaches in every appraisal assignment. 评估师必须在每次评估任务中制定所有三种评估方法。",
      "An assignment condition may require an appraiser to develop an approach that he or she would otherwise consider unnecessary. 任务条件可能要求评估师制定一种他或她原本认为不必要的方法。",
      "USPAP requires at least two approaches to be developed in every assignment. USPAP 要求在每次评估任务中至少开发三种方法中的两种。",
      "USPAP requires specific methodology for cost and income, but not for sales comparison. USPAP 要求采用特定的方法来制定成本和收入方法，但不要求采用销售比较方法。"
    ],
    answer: 1
  },

  // Sales / listing history
  {
    question: "When analyzing the subject property’s sales and transfer history in a real property appraisal assignment, an appraiser is required by USPAP to analyze: 在进行不动产评估任务时分析标的物业的销售和转让历史时，USPAP 要求评估师分析：",
    options: [
      "Only the most recent sale/transfer within the last three years. 仅限最近三年内发生的标的物业的出售或转让。",
      "The most recent sale or transfer regardless of when it occurred. 标的物业的最近一次出售或转让，无论发生时间。",
      "Prior sales or transfers of both subject and comparable properties. 先前出售或转让标的物业和类似物业的情况。",
      "All sales or transfers of the subject within three years prior to the effective date. 评估生效日前三年内发生的所有标的物业的销售或转让。"
    ],
    answer: 3
  },
  {
    question: "When analyzing listings of the subject property in a real property appraisal assignment, USPAP requires an appraiser to analyze, at a minimum: 在分析不动产评估任务中的标的物业清单时，USPAP 要求至少分析：",
    options: [
      "All listings that occurred within the last three years. 过去三年内发生的所有挂牌。",
      "Current listings. 当前列表（生效日仍然有效的挂牌信息）。",
      "All listings that occurred within the last year. 去年发生的所有挂牌。"
    ],
    answer: 1
  },

  // Development / prior listings / reconciliation
  {
    question: "In the development of an appraisal, the appraiser is required to: 在进行评估时，评估师需要：",
    options: [
      "Make a personal inspection of the subject property. 对标的房产进行亲自检查。",
      "Not commit a substantial error that significantly affects the appraisal. 不犯重大影响评估的重大错误。",
      "Use all three approaches to value. 使用所有三种方法来评估。",
      "Inspect the comparable sales by at least driving by them. 至少驾车经过检查可比销售。"
    ],
    answer: 1
  },
  {
    question: "When is it necessary to analyze prior listings of the subject property in a real property appraisal assignment? 在进行不动产评估任务时，何时需要分析标的物业的先前挂牌？",
    options: [
      "When such analysis is relevant to the current assignment. 当此类分析与当前任务相关时。",
      "Only in non-residential real property appraisal. 仅限非住宅房地产估价。",
      "In all appraisal assignments, regardless of property type. 在所有评估任务中。",
      "Only in real property appraisal assignments. 仅在房地产评估任务中。"
    ],
    answer: 0
  },
  {
    question: "The process of reconciliation entails: 和解（综合权衡）过程需要：",
    options: [
      "Careful consideration of the quality and quantity of data. 仔细考虑数据的质量和数量。",
      "Changing adjustments to bring indicated values into a tighter range. 更改调整以使指示值进入更严格的范围。",
      "Finding additional comparable sales at the client's request. 按客户要求寻找更多可比销售。",
      "Averaging indicated values to arrive at a final opinion. 对指示值进行平均。"
    ],
    answer: 0
  },

  // STANDARD 2 / reporting forms / report options
  {
    question: "The use of standard appraisal reporting forms: 使用标准评估报告表：",
    options: [
      "Is mandated by STANDARD 2. 符合标准 2。",
      "Is not required by STANDARD 2. 标准 2 不要求。",
      "Requires approval by the ASB and AQB. 需要获得 ASB 和 AQB 的批准。",
      "Is prohibited by USPAP. 被 USPAP 禁止。"
    ],
    answer: 1
  },
  {
    question: "STANDARD 2 sets forth requirements for: 标准 2 规定了以下要求：",
    options: [
      "Appraisal report content. 评估报告内容。",
      "Style and format of a real property appraisal report. 不动产评估报告的样式和格式。",
      "The use of standard appraisal forms. 标准评估表的使用。"
    ],
    answer: 0
  },
  {
    question: "What is the essential difference between the two real property reporting options (Appraisal Report vs Restricted Appraisal Report)? 这两种报告选项之间的本质区别是什么？",
    options: [
      "The content and level of information. 信息的内容和级别。",
      "The report form and format prescribed by USPAP. USPAP 规定的报告表格和格式。",
      "An Appraisal Report is the shorter option. 评估报告是更简短的选择。",
      "A Restricted Appraisal Report does not require a workfile. 限制性评估报告不需要工作文件。"
    ],
    answer: 0
  },

  // Report contents / dates / anonymous client again
  {
    question: "Which of the following is NOT required by USPAP to be in an Appraisal Report? 下列哪一项不是 USPAP 要求出现在评估报告中的？",
    options: [
      "Name or type of other intended users. 其他预期用户的姓名或类型。",
      "Client's specific name. 客户的具体姓名。",
      "Type and definition of value. 价值的类型和定义。",
      "Effective date of appraisal. 评估生效日期。"
    ],
    answer: 1
  },
  {
    question: "When reporting the results of an appraisal, dates that must be included are: 报告评估结果时，必须包括以下日期：",
    options: [
      "Effective date and inspection date. 生效日期和检查日期。",
      "Effective date and report date. 生效日期和报告日期。",
      "Inspection date and report date. 检查日期和报告日期。",
      "Inspection date and assignment date. 检查日期和分配日期。"
    ],
    answer: 1
  },
  {
    question: "An appraiser’s client requests anonymity and asks that their identity not appear in the Appraisal Report. What must the appraiser do? 一位评估师的客户要求匿名，并要求其身份不出现在评估报告中。评估师必须怎么做？",
    options: [
      "State in the report that the client’s identity has been withheld at the client’s request. 在报告中说明，应客户要求，已隐瞒客户身份。",
      "Use care not to violate the Confidentiality section of the ETHICS RULE. 注意不要违反伦理规则的保密部分。",
      "Document the identity of the client in the workfile. 在工作文件中记录客户的身份。",
      "All of these actions must be taken. 所有这些行动都必须采取。"
    ],
    answer: 3
  },

  // Scope of work reporting / excluding approaches
  {
    question: "In an Appraisal Report, the scope of work used to develop the appraisal must be: 在评估报告中，用于制定评估的工作范围必须被：",
    options: [
      "Summarized. 总结（概要说明）。",
      "Described. 描述。",
      "Stated. 声明。",
      "Omitted. 省略。"
    ],
    answer: 0
  },
  {
    question: "An appraiser determines that the cost approach is not necessary in an appraisal assignment, and therefore does not develop it. In the Restricted Appraisal Report, what must the appraiser do? 某评估师认为在某项评估任务中无需采用成本法，因此未制定该方法。在该任务的限制性评估报告中，评估师必须做什么？",
    options: [
      "State the reason for the exclusion of the approach. 说明排除该方法的原因。",
      "Develop the approach and keep it in the workfile for later. 制定方法并保存在工作文件中。",
      "Omit the approach without mentioning it. 报告中省略该方法而不提及。",
      "Develop the approach and put it in the report anyway. 无论如何都要制定并写入报告。"
    ],
    answer: 0
  },

  // Restricted with other intended users / extraordinary assumptions in report / certification
  {
    question: "An appraiser is preparing a Restricted Appraisal Report where there are intended users in addition to the client. Which statement is true? 一位评估师正在准备一份限制性评估报告，其中除了客户之外还有其他预期用户。哪项陈述是正确的？",
    options: [
      "These additional intended users must be identified in the report by type. 必须按类型识别这些额外的预期用户。",
      "These additional intended users may be identified by either name or type. 这些额外的预期用户可以通过名称或类型来识别。",
      "They must be identified by name. 必须以姓名识别。",
      "Using a Restricted Appraisal Report in this situation violates USPAP. 在这种情况下使用限制性评估报告违反 USPAP。"
    ],
    answer: 1
  },
  {
    question: "When an extraordinary assumption is used in an appraisal, the report must state the extraordinary assumption and: 当评估中使用了非常假设时，报告必须说明该非常假设，并：",
    options: [
      "State that its use may have affected the assignment results. 说明其使用可能影响了作业结果。",
      "Also value the property without the extraordinary assumption. 在没有非常假设的情况下对房产进行估值。",
      "Provide proof of client approval. 提供客户批准的证明。",
      "Explain it only in an addendum. 仅在附录中解释。"
    ],
    answer: 0
  },
  {
    question: "All written appraisal reports prepared in compliance with USPAP must contain: 所有按照 USPAP 准备的书面评估报告必须包含：",
    options: [
      "Adequate detail so any reader can understand the process. 足够细节让任何人理解评估过程。",
      "Maps, sketches, and photographs. 地图、草图和照片。",
      "A letter of transmittal. 传送信。",
      "A signed certification. 签署的证明。"
    ],
    answer: 3
  },

  // Certification / bias
  {
    question: "According to USPAP, any appraiser who signs any part of an appraisal report is required to: 根据 USPAP，任何签署评估报告任何部分的评估师都必须：",
    options: [
      "Sign a certification. 签署证明。",
      "Sign the letter of transmittal. 签署转让函。",
      "Inspect the property. 检查财产。",
      "Read the report. 阅读报告。"
    ],
    answer: 0
  },
  {
    question: "What is the purpose of including a signed certification in an appraisal report? 在评估报告中包含签名证明的目的是什么？",
    options: [
      "For the appraiser to acknowledge ethical obligations. 评估师应承认自己的道德义务。",
      "To prove that a written report was provided. 证明评估师提供了书面报告。",
      "To certify the appraiser was of sound mind. 证明评估师心智健全。",
      "Because Fannie Mae requires it. 因为房利美要求。"
    ],
    answer: 0
  },
  {
    question: "Which of the following best describes bias in appraisal practice? 以下哪项最能描述评估实践中的偏见？",
    options: [
      "It is acceptable if disclosed prior to accepting the assignment. 如果在接受任务之前披露，则可以接受。",
      "It is not permitted. 不允许。",
      "It is permitted in market analysis. 在市场分析中允许。",
      "It is allowed, as long as it is disclosed in the report. 允许，只要在报告中披露。"
    ],
    answer: 1
  },

  // Oral real property reports
  {
    question: "To the extent possible and appropriate, oral appraisal reports for real property must address the substantive matters that apply to a(n): 在可能和适当的范围内，不动产口头评估报告必须解决适用于下列哪一种书面报告的实质性问题？",
    options: [
      "Appraisal Review Report. 评估审查报告。",
      "Restricted Appraisal Report. 限制性评估报告。",
      "Appraisal Report. 评估报告。"
    ],
    answer: 2
  },
  {
    question: "An appraiser provides an oral report of a real property appraisal. Which statement is CORRECT? 一位估价师提供了一份关于不动产估价的口头报告。哪项陈述是正确的？",
    options: [
      "A signed and dated certification must be inserted into the workfile. 必须将签名并注明日期的证明插入工作文件中。",
      "Because it is oral, the appraiser does not have to sign a certification. 由于是口头报告，无需签署证明。",
      "The appraiser has no USPAP reporting obligations. 没有 USPAP 报告义务。",
      "The appraiser must send a written certification to the client afterward. 必须向客户发送书面证明。"
    ],
    answer: 0
  },

  // New assignment / readdress / prior client release
  {
    question: "If a client requests a more current valuation on a property that was the subject of a prior assignment, this is a: 如果客户要求对先前转让的财产进行更新的估价，则这是一个：",
    options: [
      "Recertification of value. 价值重新认证。",
      "New assignment. 新任务。",
      "Appraisal consulting assignment. 评估咨询任务。",
      "Extension of a prior assignment. 先前任务的延长。"
    ],
    answer: 1
  },
  {
    question: "USPAP requires an appraiser to obtain a release from a previous client before appraising the same property for a new client. USPAP 要求评估师在为新客户评估同一房产之前，必须获得之前客户的许可。",
    options: [
      "False 错误的",
      "True 真的"
    ],
    answer: 0
  },
  {
    question: "An appraiser completes an appraisal for Bank A. Two months later Bank B asks him to “readdress” his prior report to them. Which statement is TRUE about USPAP obligations? 一位评估师为 A 银行完成评估。两个月后 B 银行要求他“重新提交”该报告。哪一项陈述正确？",
    options: [
      "He can readdress the report if he obtains permission from Bank A. 如果获得 A 银行许可即可重新提交。",
      "He is not permitted to do a new appraisal for Bank B. 不允许为 B 银行做新评估。",
      "He is not permitted to “readdress” the report to Bank B. 他不被允许将报告“重新提交”给 B 银行。",
      "He can readdress only if value/market conditions have not changed. 仅在价值或市场未变时可重提。"
    ],
    answer: 2
  },

  // Trainee / supervising appraiser
  {
    question: "A trainee’s name is stated in the certification as having provided significant assistance, but the trainee does not sign. Is a description of the trainee’s assistance also required in the certification? 一名实习生提供了重要协助但未签名，其姓名写在证明中。证明中是否也需要包含协助描述？",
    options: [
      "Yes 是的。",
      "USPAP is silent on this issue. USPAP 对此保持沉默。",
      "No 不需要。"
    ],
    answer: 0
  },
  {
    question: "If a supervising appraiser makes changes to a trainee's appraisal report which the trainee does not agree with, the trainee should: 如果监督评估师对受训人员的报告作出其不同意的修改，受训人员应：",
    options: [
      "Not sign the certification. 不签署认证。",
      "Give the supervisor blanket permission to sign all reports. 授予主管全面授权。",
      "Sign the certification because the supervisor knows best. 仍然签名，因为主管最懂。"
    ],
    answer: 0
  },

  // Appraisal review – subject / reviewer / development
  {
    question: "The subject of an appraisal review assignment may be: 评估审查任务的主题可能是：",
    options: [
      "Any work completed by a state licensed or certified appraiser. 由国家许可或认证的评估师完成的任何工作。",
      "Any written work that is part of appraisal practice. 任何作为评估实践一部分的书面工作。",
      "A property previously valued by another appraiser. 之前已由另一位评估师评估过的房产。",
      "Another appraiser’s work that is completed as part of an appraisal or appraisal review assignment. 作为评估或评估审查任务一部分完成的另一个评估师的工作。"
    ],
    answer: 3
  },
  {
    question: "In STANDARD 3, the word “reviewer” means: 在标准 3 中，“审阅者”一词的含义是：",
    options: [
      "A mortgage underwriter checking a report for errors. 抵押贷款承销商。",
      "An automated program checking math. 自动程序。",
      "All of these. 以上全部。",
      "An appraiser who is performing an appraisal review. 正在进行评估审查的评估师。"
    ],
    answer: 3
  },
  {
    question: "A reviewer is performing an appraisal review on a residential appraisal report. USPAP requires the reviewer to: 一位审核员正在对住宅评估报告进行审核。USPAP 要求审核员：",
    options: [
      "Develop an opinion of value of the property under review. 对所审查的财产形成价值意见。",
      "Identify whether it is necessary to develop his or her own value opinion. 确定是否有必要在审查中形成自己的价值意见。",
      "Inform the state agency if there are any deficiencies. 通知州监管机构。",
      "Contact the appraiser who completed the work. 联系原评估师。"
    ],
    answer: 1
  },
  {
    question: "When developing an appraisal review, USPAP requires a reviewer to identify the appraiser who completed the work under review: 在开展评估审查时，USPAP 要求审查人员确定完成审查工作的评估人员：",
    options: [
      "Without exception. 无一例外。",
      "And work with the appraiser to correct errors. 与评估师合作纠正错误。",
      "Unless the identity has been withheld by the client. 除非客户隐瞒身份。",
      "And personally contact that appraiser if there are questions. 如有疑问必须亲自联系。"
    ],
    answer: 2
  },
  {
    question: "When performing an appraisal review, may a reviewer use information that was available to the original appraiser but not considered? 在进行评估复核时，复核人员是否可以使用原评估师可获得但未考虑的信息？",
    options: [
      "Yes 是的。",
      "No 不能。",
      "USPAP does not address this issue. USPAP 未涉及。"
    ],
    answer: 0
  },
  {
    question: "In performing an appraisal review, a reviewer may use information that was not available to the original appraiser in the normal course of business, as long as the information: 在进行评估复核时，复核人员可以使用原评估师在正常业务过程中无法获得的信息，只要该信息：",
    options: [
      "Supports the original value opinion. 支持原价值意见。",
      "Is not used in developing the reviewer’s opinion of the quality of the work. 不用于形成审稿人对工作质量的意见。",
      "Discredits the original value opinion. 用来否定原价值意见。"
    ],
    answer: 1
  },

  // Two-stage assignment / complaint / own value under Std1
  {
    question: "An appraisal review can be a two-stage assignment, which includes both an appraisal review and a value opinion by the reviewer. 评估审查可以分为两个阶段，包括评估审查和审查员的价值意见。",
    options: [
      "False 错误的",
      "True 真的"
    ],
    answer: 1
  },
  {
    question: "Is a reviewer permitted to file a complaint with a state appraisal regulatory agency without the client’s consent? 审查员是否可以在未经客户同意的情况下向州监管机构投诉？",
    options: [
      "USPAP does not specify. USPAP 没有具体说明。",
      "No 不能。",
      "Yes 可以。"
    ],
    answer: 2
  },
  {
    question: "Which statement is TRUE regarding USPAP and the appraisal review process for real property? 关于 USPAP 和不动产评估审查流程，哪项陈述是正确的？",
    options: [
      "A reviewer is required to develop his or her own opinion of value if the original is not credible. 如果原始价值不可信，审阅者必须形成自己的价值观。",
      "If the reviewer develops his or her own opinion of value, it must be developed under STANDARD 1. 如果评审者形成自己的价值观，则必须按照标准 1 的要求来形成。",
      "In an appraisal review assignment, the subject of the review is the appraiser. 在评估审查任务中，审查对象是评估师。",
      "The reviewer is prohibited from developing an opinion of value. 审查者不得形成价值意见。"
    ],
    answer: 1
  },

  // Appraisal review reporting / content / forms / certs
  {
    question: "A reviewer is responsible for ensuring that there is __________ in a review report so that it can be properly understood by __________. 审阅者有责任确保审阅报告中包含 __________，以便 __________ 能够正确理解。",
    options: [
      "Credible data; anyone. 可靠的数据；任何人。",
      "Meaningful analysis; anyone. 有意义的分析；任何人。",
      "Sufficient information; intended users. 足够的信息；预期使用人。",
      "Current information; intended users. 当前信息；预期使用人。"
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
    question: "A reviewer uses a pre-printed form created by the client that lacks space for all USPAP-required items. What should the reviewer do? 审核员使用客户的预印表格，但其空间不足以满足 USPAP 要求。审核员应该怎么做？",
    options: [
      "Use a different form. 使用不同的表格。",
      "Withdraw from the assignment. 退出任务。",
      "Fill out the form and omit everything that does not fit. 省略不合适的内容。",
      "Supplement the form with the required content items. 用所需内容项补充表格。"
    ],
    answer: 3
  },
  {
    question: "A reviewer develops her own value opinion that differs from the original. When reporting her value in the appraisal review report, what must she do? 复核人员形成了与原价值不同的价值意见，在报告中必须做什么？",
    options: [
      "Simply state she disagrees with the value conclusion. 只写“不同意”即可。",
      "Provide data and analysis that match Appraisal Report requirements. 提供符合评估报告要求的数据和分析。",
      "State her value opinion and reference info retained in the workfile. 陈述价值并引用保存在工作底稿中的信息。",
      "List specific Standards Rules violated by the original appraiser. 列出原评估师违反的标准规则。"
    ],
    answer: 1
  },
  {
    question: "A reviewer is preparing an appraisal review report. The identity of the appraiser who completed the work under review was not provided by the client. What should the reviewer do? 客户未提供原评估师身份，审查员应怎么做？",
    options: [
      "Request the identity in writing because USPAP requires the client to provide it. 书面要求客户提供身份。",
      "State in the appraisal review report that the appraiser’s identity was withheld by the client. 在报告中说明评估师身份被客户隐瞒。",
      "Withdraw from the assignment. 退出任务。",
      "Do not mention the issue. 报告中不提此事。"
    ],
    answer: 1
  },
  {
    question: "As part of an appraisal review assignment, a reviewer develops his own opinion of value that differs from the original. How many certifications does USPAP require in the appraisal review report? 评估复核任务中，复核人员形成自己的价值意见，与原评估师不同。USPAP 要求报告中包含多少份认证？",
    options: [
      "1",
      "2",
      "3",
      "4"
    ],
    answer: 1
  },
  {
    question: "Is a reviewer permitted by USPAP to use information that was not available to the original appraiser to discredit the work under review? USPAP 是否允许审稿人使用原评估师无法获得的信息来诋毁所评审的作品？",
    options: [
      "No 不允许。",
      "USPAP does not address this issue. USPAP 未说明。",
      "Yes 允许。"
    ],
    answer: 0
  },
  {
    question: "If a reviewer provides an oral report of an appraisal review, what is required? 如果评审员提供评估评审的口头报告，必须做什么？",
    options: [
      "The reviewer is precluded from developing his or her own opinion of value. 无法形成自己的价值观。",
      "A signed certification must be inserted into the workfile. 必须将签名证明插入工作文件。",
      "The reviewer has violated USPAP. 违反 USPAP。",
      "It is not necessary to sign a certification. 无需签名。"
    ],
    answer: 1
  },
  {
    question: "If an appraiser is asked to develop an opinion of the quality of another appraiser's work and to agree or disagree with the value conclusion, this is: 如果要求评估师对另一位评估师的工作质量发表意见，并同意或不同意价值结论，这是：",
    options: [
      "An appraisal consulting assignment. 评估咨询任务。",
      "A two-stage assignment. 一个两阶段任务。",
      "The appraiser must prepare a written report. 必须准备书面报告。",
      "The appraiser would violate USPAP by doing it. 这么做会违反 USPAP。"
    ],
    answer: 1
  },

  // STANDARD 5 / 6 / mass appraisal
  {
    question: "STANDARD 5 is most similar in structure to: STANDARD 5 的结构最类似于：",
    options: [
      "STANDARD 4",
      "STANDARD 2",
      "An Advisory Opinion",
      "STANDARD 1"
    ],
    answer: 3
  },
  {
    question: "STANDARD 5, Mass Appraisal Development, applies to: 标准 5（批量评估的制定）适用于：",
    options: [
      "Both real and personal property. 同时适用于不动产和动产。",
      "Real property only. 仅不动产。",
      "Real property only for ad valorem taxation. 仅用于从价税收的不动产。",
      "Personal property only. 仅动产。"
    ],
    answer: 0
  },
  {
    question: "Notifications sent to property owners of the results of a mass appraisal, which may be required by public policy, are considered: 按公共政策要求发送给业主的批量评估结果通知被视为：",
    options: [
      "Notifications, not reports. 通知而不是报告。",
      "Reports under STANDARD 2. 标准 2 报告。",
      "Violations of the ETHICS RULE. 违反伦理规则。",
      "Reports under STANDARD 6. 标准 6 下的报告。"
    ],
    answer: 3
  },
  {
    question: "An appraiser is engaged by a county assessment board to appraise an apartment building for ad valorem taxation. Which USPAP STANDARD(S) apply? 评估师受县评估委员会委托，为从价税收评估一栋公寓楼。适用哪些标准？",
    options: [
      "STANDARDS 5 and 6",
      "STANDARDS 7 and 8",
      "There are no USPAP Standards for this type. 没有适用标准。",
      "STANDARDS 1 and 2"
    ],
    answer: 3
  },

  // Personal property / business / AVM / AO
  {
    question: "In a personal property appraisal assignment that includes multiple objects, which is TRUE? 在包含多件物品的个人财产评估任务中，下列哪项正确？",
    options: [
      "The appraiser must be licensed as a personal property appraiser. 必须持有个人财产评估执照。",
      "All objects must have the same value. 所有对象价值必须相同。",
      "Objects more significant to the assignment results should be the focus of analysis. 对结果更重要的对象应是分析重点。",
      "All objects must get the same focus regardless of value or significance. 都要同等关注。"
    ],
    answer: 2
  },
  {
    question: "When appraising personal property, the appraiser must analyze prior sales of the subject over what time period? 在评估动产时，必须分析标的以往交易的时间范围是：",
    options: [
      "A reasonable and applicable time. 合理且适用的时间。",
      "Five years. 五年。",
      "Three years. 三年。",
      "One year. 一年。"
    ],
    answer: 0
  },
  {
    question: "An appraiser will report an appraisal in a Restricted Appraisal Report. May the development process be abbreviated because the report is less detailed? 评估报告将以限制性报告形式出具，是否可以因此简化评估过程？",
    options: [
      "USPAP does not specify. USPAP 没有具体说明。",
      "No, the development must still meet USPAP. 不可以，发展过程仍须满足 USPAP。",
      "Yes, a shorter report allows a simpler process. 可以。"
    ],
    answer: 1
  },
  {
    question: "Which of the following reports require a signed certification? 下列哪种报告需要签署的认证？",
    options: [
      "Only real property appraisal reports. 仅不动产评估报告。",
      "All reports except mass appraisal. 除批量报告外的所有报告。",
      "All oral and written reports covered in USPAP. USPAP 涵盖的所有口头和书面报告。",
      "Only personal property and appraisal review reports. 仅个人财产和评估审查报告。"
    ],
    answer: 2
  },
  {
    question: "An appraiser's certification in a business or intangible asset appraisal report does NOT: 业务或无形资产评估报告中的认证不会：",
    options: [
      "State that the analysis is in conformity with USPAP. 声明按 USPAP 执行。",
      "Contain a reference to inspection of the subject property. 包含对标的检查的说明。",
      "Have to be included in a Restricted Appraisal Report. 不必包含在限制性评估报告中。",
      "State that the appraiser has no bias. 声明评估师没有偏见。"
    ],
    answer: 2
  },
  {
    question: "A written business appraisal report must be prepared in accordance with which options? 书面的业务评估报告必须按下列哪种选项编制？",
    options: [
      "Narrative Appraisal Report or Form Appraisal Report. 叙述式或表格式报告。",
      "Appraisal Report or Summary Appraisal Report. 评估报告或概要报告。",
      "Appraisal Report or Restricted Appraisal Report. 评估报告或限制性评估报告。",
      "Complete Appraisal Report or Limited Appraisal Report. 完整或有限评估报告。"
    ],
    answer: 2
  },
  {
    question: "An appraisal that takes into consideration the full effect of known environmental contamination would be considered: 将已知环境污染的全部影响计入评估，被视为：",
    options: [
      "Hypothetical condition. 假设条件。",
      "Extraordinary assumption. 非凡假设。",
      "\"As-is\". 按现状。",
      "Subject to remediation. 有待补救。"
    ],
    answer: 2
  },
  {
    question: "Which statement BEST describes Advisory Opinions? 以下哪项最能描述 Advisory Opinions（咨询意见）？",
    options: [
      "They interpret USPAP and are intended to be enforceable. 对 USPAP 要求进行解释并具有强制性。",
      "They are not part of USPAP but illustrate applicability and provide guidance. 它们不是 USPAP 的一部分，但说明适用性并提供指导。",
      "They are part of USPAP and address marketplace changes. 它们是 USPAP 的一部分，用来应对市场变化。",
      "They establish supplemental standards that build on STANDARDS 1–10. 它们制定补充标准。"
    ],
    answer: 1
  },
  {
    question: "An appraiser provides raw AVM output to a client. This is: 一位评估师向客户提供未修改的 AVM 原始输出，这属于：",
    options: [
      "An appraisal under STANDARDS 1 and 2. 标准 1、2 下的评估。",
      "A violation of the ETHICS RULE. 违反伦理规则。",
      "Not an appraisal; however, a workfile is required by USPAP. 不是评估，但仍需工作底稿。",
      "Not an appraisal, and no workfile is required. 不是评估，也无需工作底稿。"
    ],
    answer: 3
  },

  // Market value / federally regulated / AO-33 / dates
  {
    question: "An appraiser agrees to provide a market value appraisal for a client. Which statement is true? 一位评估师同意为客户提供市场价值评估，哪项说法正确？",
    options: [
      "Market value is the only type of value, so defining it is unnecessary. 市场价值是唯一类型，不必定义。",
      "There is only one definition of market value, so identification is unimportant. 只有一个定义，因此不必说明来源。",
      "All market value definitions are essentially the same and interchangeable. 所有定义基本相同。",
      "It is essential that the appraiser identify the source of the definition of value to be used. 关键是要说明采用的价值定义来源。"
    ],
    answer: 3
  },
  {
    question: "If a borrower attempts to engage an appraiser to complete an appraisal for a federally-regulated lending transaction, the appraiser should disclose: 如果借款人试图直接雇佣评估师完成联邦监管贷款交易的评估，评估师应披露：",
    options: [
      "That the lender must directly engage the appraiser, and the report can be readdressed with written permission. 贷款人必须直接聘请评估师，且书面许可后可重新提交报告。",
      "That the lender must engage the appraiser, and the appraiser cannot later readdress the report. 贷款人必须聘请评估师，评估师之后不能“重新修改”报告。",
      "That the borrower may order the appraisal and it can later be readdressed. 借款人可以订评估，之后可重提。",
      "That the appraiser is too busy to accept borrower-clients. 评估师太忙。"
    ],
    answer: 1
  },
  {
    question: "Regulations and guidelines that apply to an appraisal for a federally-regulated lending transaction are: 适用于联邦监管贷款交易评估的法规和准则属于：",
    options: [
      "Assignment conditions. 分配条件。",
      "Hypothetical conditions. 假设条件。",
      "Limiting conditions. 限制条件。",
      "Jurisdictional exceptions. 司法例外。"
    ],
    answer: 0
  },
  {
    question: "According to AO-33, the results of discounted cash flow (DCF) analysis should: 根据 AO-33，DCF 分析的结果应：",
    options: [
      "Not be referred to as an appraisal. 不称为评估。",
      "Not be included in an appraisal report. 不写入报告。",
      "Be expressed as a single-point value conclusion. 仅以单点数值表达。",
      "Be tested and checked for errors and reasonableness. 进行测试并检查错误与合理性。"
    ],
    answer: 3
  },
  {
    question: "What type of appraisal is indicated by the phrase, “On September 10, 2012, the market value of the subject property was $200,000”? 句子“2012 年 9 月 10 日，该标的物业的市场价值为 200,000 美元”表示哪种类型的评估？",
    options: [
      "Concurrent. 并发的。",
      "Prospective. 预期的。",
      "Retrospective. 回顾性的。",
      "Current. 当前的。"
    ],
    answer: 2
  },
  {
    question: "What does the effective date of an appraisal establish? 评估的生效日期确定了什么？",
    options: [
      "The approximate date the appraiser can expect payment. 大致收款日期。",
      "The context of the value opinion. 价值意见的背景与语境。",
      "The date the report was prepared. 报告编写日期。",
      "The date the certification was signed. 认证签署日期。"
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
