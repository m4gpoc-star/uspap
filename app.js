// 简单的 USPAP 闪卡数据（后面可以慢慢扩充）
const cards = [
  {
    term: "USPAP",
    definition: "Uniform Standards of Professional Appraisal Practice，美国专业评估执业统一标准。"
  },
  {
    term: "Appraisal",
    definition: "在特定时间点，对特定资产或权益进行的有独立、客观依据的价值意见。"
  },
  {
    term: "Scope of Work",
    definition: "评估师为完成一次评估而实际执行的工作范畴与深度（如数据收集、分析方法等）。"
  },
  {
    term: "Ethics Rule",
    definition: "USPAP 中有关诚信、客观、保密与避免偏见的总纲性要求。"
  }
];

let currentIndex = 0;
let flipped = false;

const cardElement = document.getElementById("flashcard");
const termFront = document.getElementById("card-term");
const termBack = document.getElementById("card-term-back");
const defBack = document.getElementById("card-definition");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function renderCard() {
  const card = cards[currentIndex];
  termFront.textContent = card.term;
  termBack.textContent = card.term;
  defBack.textContent = card.definition;

  // 显示正面
  flipped = false;
  cardElement.classList.remove("flipped");
}

cardElement.addEventListener("click", () => {
  flipped = !flipped;
  if (flipped) {
    cardElement.classList.add("flipped");
  } else {
    cardElement.classList.remove("flipped");
  }
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  renderCard();
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % cards.length;
  renderCard();
});

// 页面加载后先渲染一次
renderCard();

// 注册 Service Worker（PWA 必备）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  });
}
