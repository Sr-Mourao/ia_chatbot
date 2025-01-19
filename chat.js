import { chat } from "./inicializaChat.js";

export async function executaChat(mensagem) {
    const result = await chat.sendMessage(mensagem);
    console.log("Tamanho do histórico: " + (await chat.getHistory()).length);
    const response = await result.response;
    return response.text();
}