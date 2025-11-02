export default function parseQuiz(rawText) {
  const text = new TextDecoder("utf-8").decode(
    new TextEncoder().encode(rawText)
  );

  // 2️⃣ Split into individual lines
  const lines = text.split("\n").map((l) => l.trim());

  const quizzes = [];
  let i = 0;

  while (i < lines.length) {
    // Skip empty lines
    while (i < lines.length && lines[i] === "") i++;
    if (i >= lines.length) break;

    // --- Question ---
    const question = lines[i++];
    if (!question) break;

    // Skip to next non-empty (correct answer)
    while (i < lines.length && lines[i] === "") i++;
    if (i >= lines.length) break;

    const correctAnswer = lines[i++];

    // --- Other options ---
    const options = [correctAnswer];
    while (i < lines.length && lines[i] !== "") {
      options.push(lines[i++]);
    }

    // Shuffle options
    const shuffled = options
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((obj) => obj.value);

    const correctIndex = shuffled.indexOf(correctAnswer);

    quizzes.push({
      question,
      options: shuffled,
      correctAnswer: correctIndex,
    });
  }

  return quizzes;
}
