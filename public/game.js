let wins = 0;
let losses = 0;
let totalCases = 0;
let currentCaseText = "";
let playerRole = "plaintiff"; // Default role

document.addEventListener("DOMContentLoaded", startNewCase);

async function startNewCase() {
    document.getElementById("argument-input").value = ""; // Clear input
    document.getElementById("submit-button").style.display = "inline-block"; // Show submit button
    document.getElementById("new-case-button").style.display = "none"; // Hide new case button
    document.getElementById("judge-response").innerText = ""; // Clear judge response

    const caseResponse = await fetch("/.netlify/functions/groq-case");
    const data = await caseResponse.json();
    currentCaseText = data.case;

    const caseDisplay = document.getElementById("case-display");
    caseDisplay.innerText = currentCaseText;
    caseDisplay.classList.add("fade-in"); // Add fade-in class
    updateScoreboard();
}

async function submitArgument() {
    const argument = document.getElementById("argument-input").value;
    playerRole = document.querySelector('input[name="role"]:checked').value; // Get the selected role

    // Determine the opponent based on the player's role
    const opponent = playerRole === "plaintiff" ? "defendant" : "plaintiff";

    const response = await fetch("/.netlify/functions/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseText: currentCaseText, argument, role: playerRole, opponent }),
    });

    const data = await response.json();
    const judgeResponse = data.response;

    // Analyze the response to determine win/loss outcome
    const playerWins = analyzeJudgeResponse(judgeResponse);
    if (playerWins) {
        wins++;
    } else {
        losses++;
    }
    totalCases++;

    updateScoreboard();

    const judgeResponseElement = document.getElementById("judge-response");
    judgeResponseElement.innerText = judgeResponse;
    judgeResponseElement.classList.add("fade-in"); // Add fade-in class
    document.getElementById("submit-button").style.display = "none"; // Hide submit button
    document.getElementById("new-case-button").style.display = "inline-block"; // Show new case button
}

function analyzeJudgeResponse(response) {
    const lowerResponse = response.toLowerCase();

    // Determine win/loss based on player role and judge's response
    if (playerRole === "plaintiff" && lowerResponse.includes("guilty!")) {
        return true; // Win for plaintiff
    } else if (playerRole === "defendant" && lowerResponse.includes("innocent!")) {
        return true; // Win for defendant
    }

    return false; // Any other case is a loss
}

function updateScoreboard() {
    document.getElementById("win-count").innerText = `Wins: ${wins}`;
    document.getElementById("loss-count").innerText = `Losses: ${losses}`;
    const winLossPercentage = totalCases > 0 ? ((wins / totalCases) * 100).toFixed(2) : 0;
    document.getElementById("win-loss-percentage").innerText = `Win/Loss %: ${winLossPercentage}%`;
}
