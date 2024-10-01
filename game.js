const express = require("express");
const bodyParser = require("body-parser");
const { Groq } = require("groq"); // Make sure to import Groq correctly
const app = express();
const GROQ_API_KEY = GROQ_API_KEY; // Define your API key

app.use(bodyParser.json());

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Endpoint to fetch a new case
app.get("/groq-case", async (req, res) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a comedic AI Judge. Generate a short, funny legal case in 1-3 sentences that describes a quirky scenario and the parties involved. Swear a lot and make up scenarios that make zero sense. DO NOT USE ANIMALS AS PEOPLE, and DO NOT MENTION SOCKS. Provide a humorous verdict without including a case number or formal title. Keep it light and concise, using no more than 50 words. Do not give your verdict. Make sure to provide one piece of evidence"
                },
            ],
            model: "llama3-8b-8192",
        });

        const newCase = chatCompletion.choices[0]?.message?.content || "No case generated.";
        res.json({ case: newCase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate a case from the AI Judge" });
    }
});

// Endpoint to handle AI Judge response
app.post("/groq-chat", async (req, res) => {
    const { caseText, argument, role, opponent } = req.body;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a comedic AI Judge who considers the arguments from both the plaintiff and defendant. Use humor in your verdict. Provide a fair assessment of the arguments presented, and base your verdict on the arguments, making sure the defendant is either guilty or innocent. Swear a lot in your response and keep your responses short. End your response in either GUILTY! or INNOCENT!"
                },
                {
                    role: "user",
                    content: `The case is: ${caseText}. The argument is: ${argument}. The player is the ${role}, and they are arguing against the ${opponent}.`
                },
            ],
            model: "llama3-8b-8192",
        });

        const judgeResponse = chatCompletion.choices[0]?.message?.content || "No response generated.";
        res.json({ response: judgeResponse.replace(/[\(\)]/g, "") }); // Remove parentheses
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get response from the AI Judge" });
    }
});

// Client-side JavaScript
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

    try {
        const caseResponse = await fetch("/groq-case");
        if (!caseResponse.ok) throw new Error("Network response was not ok");
        const data = await caseResponse.json();
        currentCaseText = data.case;
    } catch (error) {
        console.error("Error fetching case:", error);
        document.getElementById("case-display").innerText = "Error fetching case. Please try again.";
        return;
    }

    const caseDisplay = document.getElementById("case-display");
    caseDisplay.innerText = currentCaseText;
    caseDisplay.classList.add("fade-in"); // Add fade-in class
    updateScoreboard();
}

async function submitArgument() {
    const argument = document.getElementById("argument-input").value;
    playerRole = document.querySelector('input[name="role"]:checked').value; // Get the selected role

    const opponent = playerRole === "plaintiff" ? "defendant" : "plaintiff";

    try {
        const response = await fetch("/groq-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caseText: currentCaseText, argument, role: playerRole, opponent }),
        });

        const data = await response.json();
        const judgeResponse = data.response;

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
    } catch (error) {
        console.error("Error submitting argument:", error);
    }
}

function analyzeJudgeResponse(response) {
    const lowerResponse = response.toLowerCase();

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
