const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
const path = require("path"); // Import path module

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Endpoint to fetch a new case
app.get("/groq-case", async (req, res) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a comedic AI Judge. Generate a short, funny legal case in 1-3 sentences that describes a quirky scenario and the parties involved. Swear a lot and make up scenarios that make zero sense. DO NOT USE ANIMALS AS PEOPLE, and DO NOT MENTION SOCKS. Provide a humorous verdict without including a case number or formal title. Keep it light and concise, using no more than 50 words. Do not give your verdict. Make sure to provide one piece of evidence" },
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


// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
