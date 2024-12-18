from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from dollar import get_dollar
import os
import google.generativeai as genai
import base64
from PIL import Image
from rembg import remove
import uuid
import os
import cv2
from anime_gan import AnimeGAN

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


def validate_mimetype(mime_type, category):
    # Valida qualquer tipo "image/*"
    if category == "image/*":
        return mime_type.startswith("image/")
    elif category == "video/*":
        return mime_type.startswith("video/")
    return mime_type == category


@tool
def fileReader(file_name:str, mime_type:str, conversation_id:str, prompt:str)->str:
    """This tool is called every time the user sends a file, it will make decisions according to the user's prompt and the file format. calling if file_name != None or null"""

    genai.configure(api_key=os.environ["GEAI_TITLE_API_KEY"])

    if validate_mimetype(mime_type, "image/*"):
        print("Imagem:", mime_type)
        generation_config = {
            "temperature": 0,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            system_instruction="Você deve agir como um especialista que toda decisões de qual ferramenta usar para imagem de acordo com o prompt retornar a resposta em uma palavra que é as palavras do array\n\n\n[\"classificar\", \"remover_bg\", \"image_to_black_and_white\" , \"image_to_drawing\"]",
        )

        response = model.generate_content(prompt)
        
        response_text = response.text.strip().lower()


        if "classificar" in response_text:
            result = describeImage(file_name, mime_type, conversation_id, prompt)
            return result
        elif "remover_bg" in response_text:
            result = remove_bg(file_name, conversation_id)
            result_markdown = f"retorne isso para o usuário e quebre a linha para ficar em baixo do texto não remover: ![Image no bg](http://localhost:5000/getfile/{conversation_id}/{result})"
            return result_markdown
        elif "image_to_black_and_white" in response_text:
            result = image_to_black_and_white(file_name, conversation_id)
            result_markdown = f"retorne isso para o usuário e quebre a linha para ficar em baixo do texto: ![Image black white](http://localhost:5000/getfile/{conversation_id}/{result})"
            return result_markdown
        elif "image_to_drawing" in response_text:
            result = image_to_drawing(file_name, conversation_id)
            result_markdown = f"retorne isso para o usuário e quebre a linha para ficar em baixo do texto sem alterar nada: {result}"
            return result_markdown
        else:
            return "Não foi possível realizar a ação solicitada"
    elif validate_mimetype(mime_type, "video/*"):
        print("vídeo")
        generation_config = {
            "temperature": 0,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            system_instruction="Você deve agir como um especialista que toda decisões de qual ferramenta usar para videos de acordo com o prompt retornar a resposta em uma palavra que é as palavras do array\n\n\n[\"transcription\", \"watch_video\"]",
        )

        response = model.generate_content(prompt)


        response_text = response.text.strip().lower()

        if "transcription" in response_text:
            result = video_transcription(file_name, mime_type, conversation_id, prompt)
            return f"Retorna isso sem mudar nada: {result}" 
        elif "watch_video" in response_text:
            result = video_transcription(file_name, mime_type, conversation_id, prompt)
            return f"Retorna isso sem mudar nada: {result}"
        else:
            return "Não foi possível realizar a ação solicitada"
    elif mime_type == "application/pdf":
        result = pdf_transcription(file_name, mime_type, conversation_id, prompt)
        return f"Retorna isso sem mudar nada: {result}"
    else:
        return "Não foi possível realizar a ação solicitada"




def image_to_drawing(image_name, conversation_id):
    file_path = f"./files/{conversation_id}/{image_name}"
    imagem = cv2.imread(file_path)
    imagem_pb = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)
    imagem_invertida = cv2.bitwise_not(imagem_pb)
    imagem_blur = cv2.GaussianBlur(imagem_invertida, (55, 55), 0)
    imagem_blur_invertida = cv2.bitwise_not(imagem_blur)
    imagem_desenho = cv2.divide(imagem_pb, imagem_blur_invertida, scale=256.0)
    unique_id = str(uuid.uuid4())
    file_path_sketch = f"./files/{conversation_id}/{unique_id}.jpg"
    cv2.imwrite(file_path_sketch, imagem_desenho)

    # Cartoon Sketch
    
    unique_id_cartoon_Sketch = str(uuid.uuid4())


    file_path_cartoon_sketch = f"./files/{conversation_id}/{unique_id_cartoon_Sketch}.jpg"

    anime_sketch = AnimeGAN(model="AnimeGANv3_PortraitSketch_25", file_path=file_path, device_name="CPU")
    mat_sketch, scale_sketch = anime_sketch.load_test_data()
    res_sketch = anime_sketch.converter(mat_sketch, scale_sketch)
    cv2.imwrite(file_path_cartoon_sketch, res_sketch)

    # Cartoon

    unique_id_cartoon = str(uuid.uuid4())

    file_path_cartoon = f"./files/{conversation_id}/{unique_id_cartoon}.jpg"

    gray = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)
    edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, 9)

    color = cv2.bilateralFilter(imagem, 9, 300, 300)


    cartoon = cv2.bitwise_and(color, color, mask=edges)
    

    cv2.imwrite(file_path_cartoon, cartoon)

    # Hayao

    unique_id_hayao = str(uuid.uuid4())

    file_path_hayao = f"./files/{conversation_id}/{unique_id_hayao}.jpg"

    anime_hayao = AnimeGAN(model="AnimeGANv3_Hayao_STYLE_36", file_path=file_path, device_name="CPU")
    mat_hayao, scale_hayao = anime_hayao.load_test_data()
    res_hayao = anime_hayao.converter(mat_hayao, scale_hayao)
    cv2.imwrite(file_path_hayao, res_hayao)

    
    response = f"""
        # 1. Sketch Style

        ![Image_Sketch](http://localhost:5000/getfile/{conversation_id}/{unique_id}.jpg)
        
        # 2. Cartoon Sketch Style

        ![Image_Cartoon_Sketch](http://localhost:5000/getfile/{conversation_id}/{unique_id_cartoon_Sketch}.jpg)

        # 3. Cartoon Style

        ![Image_Cartoon](http://localhost:5000/getfile/{conversation_id}/{unique_id_cartoon}.jpg)

        # 4. Hayao Style

        ![Image_Hayao](http://localhost:5000/getfile/{conversation_id}/{unique_id_hayao}.jpg)
        
    """

    return response

def image_to_black_and_white(image_name:str, conversation_id:str):
    file_path = f"./files/{conversation_id}/{image_name}"
    imagem = cv2.imread(file_path)
    imagem_pb = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)
    unique_id = str(uuid.uuid4())
    file_path_pb = f"./files/{conversation_id}/{unique_id}"
    cv2.imwrite(f"{file_path_pb}.jpg", imagem_pb)
    return unique_id+".jpg"

def remove_bg(image_name:str, conversation_id:str):
    file_path = f"./files/{conversation_id}/{image_name}"
    original_image = Image.open(file_path)
    unique_id = str(uuid.uuid4())  # Gera um UUID e converte para string
    # Define o caminho para o arquivo temporário
    no_bg_path = f"./files/{conversation_id}/{unique_id}.png"
    no_bg_img = remove(original_image)
    no_bg_img.save(no_bg_path)
    return unique_id+".png"

    




def describeImage(image_name:str, mime_type:str, conversation_id:str, prompt:str)->str:
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

    #file_uploaded = genai.upload_file(f"./files/{conversation_id}/{image_name}", mime_type=mime_type)
    file_path = f"./files/{conversation_id}/{image_name}"
    with open(file_path, "rb") as f:
        buffer = f.read()
    f.close()

    file_base64 = base64.b64encode(buffer).decode("utf-8")

    file = {
        "inline_data": {
            "data": file_base64,
            "mime_type": mime_type,
        }
    }

    
    response = model.generate_content(
        [file, "\n\n", prompt]
    )

    print("Response: ", response.text)

    return response.text #response.text

# videos



def video_transcription(video_name:str, mime_type:str, conversation_id:str, prompt:str)->str:
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

    file_path = f"./files/{conversation_id}/{video_name}"
    with open(file_path, "rb") as f:
        buffer = f.read()
    f.close()

    file_base64 = base64.b64encode(buffer).decode("utf-8")

    file = {
        "inline_data": {
            "data": file_base64,
            "mime_type": mime_type,
        }
    }

    
    response = model.generate_content(
        [file, "\n\n", prompt]
    )

    print("Response: ", response.text)

    return response.text #response.text

# FILE

def pdf_transcription(pdf_name:str, mime_type:str, conversation_id:str, prompt:str)->str:
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

    file_path = f"./files/{conversation_id}/{pdf_name}"
    with open(file_path, "rb") as f:
        buffer = f.read()
    f.close()

    file_base64 = base64.b64encode(buffer).decode("utf-8")

    file = {
        "inline_data": {
            "data": file_base64,
            "mime_type": mime_type,
        }
    }

    response = model.generate_content(
        [file, "\n\n", prompt]
    )

    print("Response: ", response.text)

    return response.text #response.text



def getTools():
    tools = [dollarexchange, fileReader]
    return tools