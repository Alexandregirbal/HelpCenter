const input = "josé";

if (input.includes("j")) {
  console.log("j");
}

if (input.includes("s")) {
  console.log("s");
}

const checkLetter = (word, letter) => {
  return word.includes(letter);
};
