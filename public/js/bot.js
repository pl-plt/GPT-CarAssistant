import OpenAI from "openai";
//const openai = require("openai");

const openai = new OpenAI();

const assistantPrompt = "You are a helpful assistant."


function askAssistant() {
    const question = document.getElementById("inputText").value;
    answer(text);
}

async function answer(text = "null") {

    if (text === "null") {
        alert("Please enter a question.");
        return;
    }

    // Create a new chat completion
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: assistantPrompt },
            {
                role: "user",
                content: "text",
            },
        ],
    });
    console.log(completion.choices[0].message.content);
    return;
}

export { askAssistant };