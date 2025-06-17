const output = document.getElementById("output");
const input = document.getElementById("command-input");

const commands = ["exit", "rgbtograyscale", "rgbtohex", "hextorgb"];

let state = {
  currentCommand: null,
  argsNeeded: 0,
  args: []
};

function printOutput(text, colorClass = "green") {
  const line = document.createElement("div");
  if (colorClass) line.classList.add(colorClass);
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function isCommand(inputText) {
  inputText = inputText.toLowerCase();
  return commands.includes(inputText) || inputText.endsWith(" to hex");
}

function executeCommand(cmd, args) {
  cmd = cmd.toLowerCase();

  if (cmd === "exit") {
    printOutput("Au revoir !", "yellow");
    input.disabled = true;
    return;
  }

  if (cmd === "rgbtograyscale") {
    let r = Number(args[0]);
    let g = Number(args[1]);
    let b = Number(args[2]);
    if ([r,g,b].some(v => isNaN(v) || v < 0 || v > 255)) {
      printOutput("Valeurs RGB invalides (0-255).", "red");
      return;
    }
    const gray = Math.round(0.299*r + 0.587*g + 0.114*b);
    printOutput(`Gris calculé : ${gray} (Hex : #${gray.toString(16).padStart(2,"0").repeat(3)})`, "cyan");
    return;
  }

  if (cmd === "rgbtohex") {
    let r = Number(args[0]);
    let g = Number(args[1]);
    let b = Number(args[2]);
    if ([r,g,b].some(v => isNaN(v) || v < 0 || v > 255)) {
      printOutput("Valeurs RGB invalides (0-255).", "red");
      return;
    }
    let hex = "#" +
      r.toString(16).padStart(2,"0") +
      g.toString(16).padStart(2,"0") +
      b.toString(16).padStart(2,"0");
    printOutput(`Hex : ${hex}`, "cyan");
    return;
  }

  if (cmd === "hextorgb") {
    let hex = args[0].replace(/^#/, "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) {
      printOutput("Hex invalide. Format attendu : RRGGBB", "red");
      return;
    }
    let r = parseInt(hex.slice(0,2),16);
    let g = parseInt(hex.slice(2,4),16);
    let b = parseInt(hex.slice(4,6),16);
    printOutput(`R=${r}`, "red");
    printOutput(`V=${g}`, "green");
    printOutput(`B=${b}`, "blue");
    return;
  }

  if (cmd.endsWith(" to hex")) {
    // Ex: "255 to hex"
    let numberStr = cmd.split(" ")[0];
    let num = Number(numberStr);
    if (isNaN(num) || num < 0) {
      printOutput("Nombre invalide.", "red");
      return;
    }
    printOutput(`Hexadecimal : ${num.toString(16)}`, "cyan");
    return;
  }

  printOutput("Commande inconnue.", "red");
}

function requestNextArg() {
  if (!state.currentCommand) return;

  if (state.currentCommand === "rgbtohex" || state.currentCommand === "rgbtograyscale") {
    const labels = ["Rouge", "Vert", "Bleu"];
    const colors = ["red", "green", "blue"];
    printOutput(`Entre la valeur ${labels[state.args.length]} :`, colors[state.args.length]);
  } else if (state.currentCommand === "hextorgb") {
    printOutput("Entre le code hex (ex: FF00FF) :", "cyan");
  }
}

// Gestion de la saisie
document.getElementById("command-form").addEventListener("submit", e => {
  e.preventDefault();
  let userInput = input.value.trim();
  if (!userInput) return;
  printOutput(`>>> ${userInput}`, "yellow");
  input.value = "";

  // Gestion de l'annulation
  if (userInput.toLowerCase() === "cancel") {
    if (state.currentCommand) {
      printOutput("Commande annulée.", "red");
      state.currentCommand = null;
      state.argsNeeded = 0;
      state.args = [];
    } else {
      printOutput("Aucune commande en cours à annuler.", "red");
    }
    return;
  }

  // Si c'est une commande complète (et pas juste un argument en attente)
  if (isCommand(userInput)) {
    // Reset état pour nouvelle commande
    state.currentCommand = userInput.toLowerCase();
    state.args = [];
    if (state.currentCommand === "exit") {
      executeCommand(state.currentCommand, []);
      return;
    }
    if (state.currentCommand === "rgbtohex" || state.currentCommand === "rgbtograyscale") {
      state.argsNeeded = 3;
      requestNextArg();
    } else if (state.currentCommand === "hextorgb") {
      state.argsNeeded = 1;
      requestNextArg();
    } else if (state.currentCommand.endsWith(" to hex")) {
      executeCommand(state.currentCommand, []);
      state.currentCommand = null;
      state.argsNeeded = 0;
      return;
    } else {
      printOutput("Commande inconnue.", "red");
      state.currentCommand = null;
      return;
    }
    return;
  }

  // Sinon on est en mode saisie d'arguments pour commande en cours
  if (state.currentCommand && state.argsNeeded > 0) {
    state.args.push(userInput);
    state.argsNeeded--;
    if (state.argsNeeded === 0) {
      executeCommand(state.currentCommand, state.args);
      state.currentCommand = null;
      state.args = [];
    } else {
      requestNextArg();
    }
  } else {
    printOutput("Commande inconnue. Tape une commande valide.", "red");
  }
});
