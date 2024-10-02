const Groq = require("groq-sdk"); // Ensure this line is included at the top

exports.handler = async function (event, context) {
    console.log("Received request:", event);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a comedic AI Judge. Generate a short, funny legal case in 1-3 sentences that describes a quirky scenario and the parties involved. Swear a lot and make up scenarios that make zero sense. DO NOT USE ANIMALS AS PEOPLE, and DO NOT MENTION SOCKS. Provide a humorous verdict without including a case number or formal title. Keep it light and concise, using no more than 50 words. Do not give your verdict. Make sure to provide one piece of evidence. You can use emojis" }
            ],
            model: "llama3-8b-8192",
        });

        const newCase = chatCompletion.choices[0]?.message?.content || "No case generated.";
        return {
            statusCode: 200,
            body: JSON.stringify({ case: newCase }),
        };
    } catch (error) {
        console.error("Error generating case:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate a case from the AI Judge" }),
        };
    }
};
