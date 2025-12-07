// === Keys, 与 quiz.js 保持一致 ===
const VOICE_KEY = "uspapVoicePreference";
const QUIZ_TIMER_KEY = "uspapQuizTimerEnabled";

document.addEventListener("DOMContentLoaded", () => {

  // ====== 语音设置 ======
  const voiceSelect = document.getElementById("voice-select");
  if (voiceSelect) {
    const savedVoice = localStorage.getItem(VOICE_KEY) || "mute";
    voiceSelect.value = savedVoice;

    voiceSelect.addEventListener("change", () => {
      localStorage.setItem(VOICE_KEY, voiceSelect.value);
    });
  }

  // ====== Quiz 16 秒计时设置 ======
  const quizTimerSelect = document.getElementById("quiz-timer-select");
  if (quizTimerSelect) {
    const savedTimer = localStorage.getItem(QUIZ_TIMER_KEY) || "on";
    quizTimerSelect.value = savedTimer;

    quizTimerSelect.addEventListener("change", () => {
      localStorage.setItem(QUIZ_TIMER_KEY, quizTimerSelect.value);
    });
  }

  // 可选：Settings 页面也注册 service worker（会增强缓存）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .catch(err => console.error("SW registration failed:", err));
  }
});
