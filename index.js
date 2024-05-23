import { FilesetResolver, LlmInference } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';

const input = document.getElementById('input');
const submit = document.getElementById('submit');
const clear = document.getElementById('clear');
const mainContent = document.getElementById('main-content');

const modelFileName = 'gemma-2b-it-gpu-int4.bin'; 

function createConversationBlock(inputText) {
    const conversation = document.createElement('div');
    conversation.className = 'conversation';

    const inputArea = document.createElement('textarea');
    inputArea.className = 'userInput';
    inputArea.value = "Input: " + inputText;
    inputArea.readOnly = true;
    inputArea.style.height = '50px';

    const outputArea = document.createElement('textarea');
    outputArea.className = 'llmOutput'
    outputArea.value = "Output: Generating...";
    outputArea.readOnly = true;
    adjustTextareaHeight(outputArea);

    mainContent.appendChild(inputArea);
    mainContent.appendChild(outputArea);
    // mainContent.appendChild(conversation);

    scrollToBottom();

    return outputArea;
}

function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    var newHeight = textarea.scrollHeight + 'px';
    textarea.style.height = newHeight;
    if (textarea.scrollHeight > 300) {
        textarea.style.height = '300px';
    }
}

function scrollToBottom() {
    mainContent.scrollTop = mainContent.scrollHeight;
}

async function llmInference() {
    submit.value = 'Loading the model...';
    submit.disabled = true;

    try {
        const genaiFileset = await FilesetResolver.forGenAiTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm');
        const llmInference = await LlmInference.createFromOptions(genaiFileset, {
            baseOptions: {modelAssetPath: modelFileName},
            maxTokens: 1000,
            topK: 5,
            temperature: 0.8,
            randomSeed: 42
        });

        submit.onclick = async () => {
            submit.disabled = true;
            const inputText = input.value;
            const outputArea = createConversationBlock(inputText);

            llmInference.generateResponse(inputText, (partialResults, complete) => {
                if (complete) {
                    outputArea.value += "\n" + partialResults;
                    adjustTextareaHeight(outputArea);
                    submit.disabled = false;
                    input.value = '';
                    scrollToBottom();
                } else {
                    if (outputArea.value.includes("Generating...")) {
                        outputArea.value = "Output: " + partialResults;
                    } else {
                        outputArea.value += partialResults;
                    }
                    adjustTextareaHeight(outputArea);
                }
            });
        };

        clear.onclick = () => {
            mainContent.innerHTML = '';
        };

        submit.disabled = false;
        submit.value = 'Get Response';
    } catch (error) {
        console.error('Failed to initialize the model:', error);
        alert('Failed to initialize the task.');
    }
}

llmInference();
