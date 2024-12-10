import google.generativeai as genai
import json
from langdetect import detect
import os



def genTitle(dataChat):
    genai.configure(api_key=os.environ["GOOGLE_TITLE_API"])
    # Detectando o idioma do input da conversa
    input_text = dataChat["input"]
   
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction="Você é um especialista em identificar o idioma do texto. Sua função é:\n1. Identificar o idioma do texto fornecido.\n2. Criar um título pluralizado, sem incluir nenhuma menção ao idioma identificado.\n3. Retornar apenas o título, nada mais.",
    )

    response = model.generate_content(input_text)
    title = response.text.replace('"', '').replace('\n', ' ')
    
    # Adicionando o título gerado ao dataChat
    dataChat["title"] = title
    
    return dataChat

