// 简单的 USPAP 英文闪卡
const flashcards = [
  {
    term: "USPAP",
    definition:
      "Uniform Standards of Professional Appraisal Practice – the generally accepted standards for professional appraisal practice in the U.S."
  },
  {
    term: "The Appraisal Foundation (TAF)",
    definition:
      "A non-profit organization that establishes, improves, and promotes appraisal standards and appraiser qualifications."
  },
  {
    term: "Appraisal Standards Board (ASB)",
    definition:
      "The board within TAF that writes, amends, and interprets USPAP."
  },
  {
    term: "Appraiser Qualifications Board (AQB)",
    definition:
      "The board within TAF that establishes minimum education, experience, and examination requirements for appraiser licensing and certification."
  },
  {
    term: "Appraisal Subcommittee (ASC)",
    definition:
      "A federal agency that oversees each state’s appraiser regulatory program and maintains the National Registry of state-licensed and certified appraisers."
  },
  {
    term: "Purpose of USPAP",
    definition:
      "To promote and maintain a high level of public trust in appraisal practice by establishing requirements for appraisers."
  },
  {
    term: "Appraisal Practice vs. Valuation Services",
    definition:
      "Valuation Services is the broad category of all value-related services. Appraisal Practice is a subset – valuation services performed by an individual acting as an appraiser."
  },
  {
    term: "Scope of Work",
    definition:
      "The type and extent of research and analyses in an appraisal or appraisal review assignment."
  }
];

let currentIndex = 0;
let showFront = true;

const termEl = document.getElementById("flash-term");
const defEl = document.getElementById("flash-definition");
const progressEl = document.getElementById("flash-progress");
const cardEl = document.getElementById("flash-card");
const prevBtn = document.getElementById("flash-prev");
const nextBtn = document.getElementById("flash-next");

function updateFlashcard() {
  const card = flashcards[currentIndex];
  progressEl.textContent = `Card ${currentIndex + 1} / ${flashcards.length}`;

  if (showFront) {
    termEl.textContent = card.term;
    defEl.textContent = "";
  } else {
    termEl.textContent = card.term;
    defEl.textContent = card.definition;
  }

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === flashcards.length - 1;
}

function toggleFlashSide() {
  showFront = !showFront;
  updateFlashcard();
}

function nextFlashcard() {
  if (currentIndex < flashcards.length - 1) {
    currentIndex++;
    showFront = true;
    updateFlashcard();
  }
}

function prevFlashcard() {
  if (currentIndex > 0) {
    currentIndex--;
    showFront = true;
    updateFlashcard();
  }
}

// 初始化
if (termEl && defEl && progressEl) {
  updateFlashcard();
}
