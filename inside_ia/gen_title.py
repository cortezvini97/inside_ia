import google.generativeai as genai
import json
from langdetect import detect
import os



def genTitle(dataChat):
    genai.configure(api_key=os.environ["GOOGLE_TITLE_API"])
    # Detectando o idioma do input da conversa
    input_text = dataChat["input"]
    detected_language = detect(input_text)  # Retorna o código do idioma (ex: 'en' para inglês, 'pt' para português)
    
    dataChatStr = json.dumps(dataChat)
    # Ajustando o prompt baseado no idioma detectado
    if detected_language == 'en':
        prompt = f"Generate a single title in English based on the conversation: {dataChatStr}. Respond with only the title."
    elif detected_language == 'pt':
        prompt = f"Crie um título único em português com base na conversa: {dataChatStr}. Responda apenas com o título."
    elif detected_language == 'es':
        prompt = f"Genera un título único en español basado en la conversación: {dataChatStr}. Responde solo con el título."
    else:
        prompt = f"Generate a single title based on the conversation: {dataChatStr}. Respond with only the title."

    # Definindo o modelo e gerando a resposta
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    title = response.text.replace('"', '').replace('\n', ' ')
    
    # Adicionando o título gerado ao dataChat
    dataChat["title"] = title
    
    return dataChat

