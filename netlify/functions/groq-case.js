exports.handler = async function (event, context) {
    console.log("Received request:", event);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a comedic AI Judge..." }
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
