from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from dollar import get_dollar
import os
import google.generativeai as genai

def get_genai_response(message):
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
    response = llm.invoke(message)
    return response

@tool
def dollarexchange(question:str)->str:
    """This tool receives as input the question about the dollar exchange rate that the user wants to know in real time."""
    print("certo")
    context = get_dollar()
    messages = [
        SystemMessage(content="Você deve analizar os dados e falar a cotação do dolar de acordo com a moeda que o usuário passar."),
        HumanMessage(content=f"{context}\n\n{question}"),
    ]
    response = get_genai_response(messages)
    return response


@tool
def describeImage(image_name:str, mime_type:str, conversation_id:str, prompt:str)->str:
    """This tool receive as image and return a description of the image."""
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
    )

    file_uploaded = genai.upload_file(f"./files/{conversation_id}/{image_name}", mime_type=mime_type)

    
    response = model.generate_content(
        [file_uploaded, "\n\n", prompt]
    )

    print("Response: ", response.text)

    return response.text #response.text



def getTools():
    tools = [dollarexchange, describeImage]
    return tools