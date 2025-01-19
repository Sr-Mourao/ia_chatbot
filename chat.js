import { chat, functions, inicializaChat } from "./inicializaChat.js";
import { incorporarPergunta, incorporarDocumentos, leArquivos } from "./embedding.js";


const arquivos = await leArquivos(["Pacotes_Argentina.txt", "Pacotes_EUA.txt", "Politicas.txt"])
const documentos = await incorporarDocumentos(arquivos)

export async function executaChat(mensagem) {

    console.log("Tamanho do histórico: " + (await chat.getHistory()).length);
    let doc = await incorporarPergunta(mensagem, documentos);
    let prompt = `${mensagem} talvez esse trecho te ajude a formular a resposta ${doc.text}`;
    const result = await chat.sendMessage(prompt);

    const response = await result.response;

    const content = response.candidates[0].content;
    const fc = content.parts[0].functionCall
    const text = content.parts.map(({ text }) => text).join("");

    console.log(fc);

    if (fc) {
        const { name, args } = fc;
        const fn = functions[name];
        if (!fn) {
            throw new Error(`Error na function "${name}"`);
        }
        const fr = {
            functionResponse: {
                name,
                response: {
                    name,
                    content: functions[name](args),
                }
            },
        }

        console.log(fr)

        const request2 = [fr];
        const response2 = await chat.sendMessage(request2);
        const result2 = response2.response;
        return result2.text();
    } else if (text) {
        return text;
    }
}