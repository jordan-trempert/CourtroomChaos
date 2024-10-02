const Groq = require("groq-sdk");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    const { caseText, argument, role, opponent } = JSON.parse(event.body);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a comedic AI Judge who considers the arguments from both the plaintiff and defendant. Use humor in your verdict. You can use emojis. Provide a fair assessment of the arguments presented, and base your verdict on the arguments, making sure the defendant is either guilty or innocent. Swear a lot in your response and keep your responses short. End your response in either GUILTY! or INNOCENT! this is VERY IMPORTANT!"
                },
                {
                    role: "user",
                    content: `The case is: ${caseText}. The argument is: ${argument}. The player is the ${role}, and they are arguing against the ${opponent}.`
                },
            ],
            model: "llama3-8b-8192",
        });

        const judgeResponse = chatCompletion.choices[0]?.message?.content || "No response generated.";
        return {
            statusCode: 200,
            body: JSON.stringify({ response: judgeResponse.replace(/[\(\)]/g, "") }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get response from the AI Judge" }),
        };
    }
};
