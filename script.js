let flashcards = [];
let currentIndex = 0;

async function loadFlashcards() {
  //   const response = await fetch("data.json");
  //   flashcards = await response.json();

  fetch("data.txt")
    .then((response) => response.text())
    .then((text) => {
      flashcards = parseFlashcardText(text); // [{ Qus: ..., Ans: ... }]
      console.log(flashcards);
      showCard(currentIndex);
    });
}
function toggleStar() {
  flashcards[currentIndex].starred = !flashcards[currentIndex].starred;
  updateStarIcon();
}
function updateStarIcon() {
  const starIcon = document.getElementById("star-icon");
  if (!starIcon) return;
  if (flashcards[currentIndex].starred) {
    starIcon.textContent = "★"; // Sao đầy
  } else {
    starIcon.textContent = "☆"; // Sao rỗng
  }
}

function parseFlashcardText(text) {
  const lines = text.split("??");
  const flashcards = lines
    .map((line) => {
      const parts = line.split("**").map((p) => p.trim());
      if (!parts[0]) return null; // bỏ qua nếu thiếu câu hỏi

      return {
        question: parts[0],
        answer: parts[1] || "",
        explanation: parts[2] || "",
        starred: false,
      };
    })
    .filter(Boolean); // loại null
  return flashcards;
}
function shuffleFlashcards(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function loadFlashcardsChaos() {
  const button = document.getElementById("shuffle-button");
  const isActive = button.classList.toggle("active"); // toggle class 'active'

  if (isActive) {
    flashcards = shuffleFlashcards(flashcards);
    currentIndex = 0;
    showCard(currentIndex);
  } else {
    loadFlashcards(); // hoặc reset về thứ tự ban đầu nếu bạn muốn
  }
}

function showCard(index) {
  const container = document.getElementById("flashcard-container");

  container.classList.add("fade-out");

  // setTimeout(() => {
  container.innerHTML = ""; // clear card

  const cardData = flashcards[index];
  const card = createFlashcard(cardData);
  container.appendChild(card);

  updateCardCounter(index + 1, flashcards.length);
  updateStarIcon();

  container.classList.remove("fade-out");
  container.classList.add("fade-in");
}

function exportStarredCards() {
  const starred = flashcards.filter((card) => card.starred);
  const text = starred
    .map((card) => `${card.question}**${card.answer}**${card.explanation}`)
    .join("??");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "starred_flashcards.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function updateCardCounter(current, total) {
  const counter = document.getElementById("card-counter");
  counter.textContent = `${current} / ${total}`;
}


function createFlashcard(data) {
  const card = document.createElement("div");
  card.className = "flashcard";
  card.onclick = () => card.classList.toggle("flipped");

  const front = document.createElement("textarea");
  front.className = "front";
  front.value = data.question;
  front.readOnly = true;

  const back = document.createElement("textarea");
  back.className = "back";
  back.value = `${data.answer}\n\n ================= EXPLANATION ================= \n\n${data.explanation}`;
  back.readOnly = true;

  adjustFontSize(front, data.question.length);
  adjustFontSize(back, data.answer.length + data.explanation.length);

  card.appendChild(front);
  card.appendChild(back);

  return card;
}

function adjustFontSize(element, length) {
  let size = 24; // mặc định
  if (length > 100) size = 22;
  if (length > 200) size = 20;
  if (length > 300) size = 18;
  if (length > 400) size = 16;
  if (length > 600) size = 14;
  element.style.fontSize = `${size}px`;
}

function nextCard() {
  currentIndex = (currentIndex + 1) % flashcards.length;
  showCard(currentIndex);
}

function prevCard() {
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  showCard(currentIndex);
}

loadFlashcards();
document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("mode-toggle");
  const body = document.body;

  // Lấy trạng thái chế độ từ localStorage
  const currentMode = localStorage.getItem("mode");
  if (currentMode === "dark") {
    body.classList.add("dark-mode");
    toggleSwitch.checked = true;
  }

  toggleSwitch.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("mode", "dark");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("mode", "light");
    }
  });
  document.addEventListener("keydown", handleKeyFlip);
});

document.getElementById("export-marked").addEventListener("click", function () {
  const markedCards = document.querySelectorAll(
    ".flashcard[data-marked='true']"
  );
  let content = "";

  markedCards.forEach((card) => {
    const question = card.querySelector(".front")?.textContent?.trim() || "";
    const answer = card.querySelector(".back")?.value?.trim() || "";
    content += `Q: ${question}\nA: ${answer}\n\n`;
  });

  if (!content) {
    alert("No cards marked!");
    return;
  }

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "marked_cards.txt";
  link.click();
});
function handleKeyFlip(e) {
  if (e.code === "Space" && e.target.tagName !== "TEXTAREA") {
    const currentCard = document.querySelector(".flashcard");
    if (currentCard) currentCard.click(); // hoặc dùng toggle("flipped")
  }
}
function handleKeyFlip(e) {
  // Không xử lý nếu đang gõ trong textarea
  if (e.target.tagName === "TEXTAREA") return;

  switch (e.code) {
    case "Space":
      e.preventDefault(); // Ngăn scroll trang
      const currentCard = document.querySelector(".flashcard");
      if (currentCard) currentCard.click(); // lật thẻ
      break;
    case "ArrowRight":
      nextCard(); // chuyển thẻ sau
      break;
    case "ArrowLeft":
      prevCard(); // chuyển thẻ trước
      break;
  }
}

