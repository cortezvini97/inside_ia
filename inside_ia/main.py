from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
from inside_ia import InsideIA
from dotenv import load_dotenv
from gen_title import genTitle
import os


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './files'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/chat")
def hello():
    return "Hello"

@app.route("/chatCreate", methods=['POST'])
def chatCreate():
    data = request.get_json()
    print(data["conversation_id"])
    if data["file"] != None:
        inside_ia = InsideIA(data["model"], data["userprompt"], data["conversation_id"], data["history"], data["file"])
    else:
        inside_ia = InsideIA(data["model"], data["userprompt"], data["conversation_id"], data["history"])
    response = inside_ia.genResponse()
    updateResponse = genTitle(response)
    # Retorna o JSON já formatado corretamente
    return jsonify(updateResponse)

@app.route("/chat", methods=['POST'])
def chat():
    data = request.get_json()
    if data["file"] != None:
        inside_ia = InsideIA(data["model"], data["userprompt"], data["conversation_id"], data["history"], data["file"])
    else:
        inside_ia = InsideIA(data["model"], data["userprompt"], data["conversation_id"], data["history"])
    response = inside_ia.genResponse()
    return jsonify(response)


@app.route("/getfile/<conversation_id>/<file_name>")
def getfile(conversation_id, file_name):
    try:
        # Caminho da pasta onde os arquivos estão organizados por conversation_id
        directory = f"{app.config['UPLOAD_FOLDER']}/{conversation_id}"
        
        # Envia o arquivo para o navegador
        return send_from_directory(directory, file_name, as_attachment=False)  # `as_attachment=False` exibe no navegador
    except FileNotFoundError:
        abort(404, description="File not found.")


if __name__ == "__main__":
    dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
    load_dotenv(dotenv_path=dotenv_path)
    api_key = os.getenv("GOOGLE_API_KEY")
    os.environ["GOOGLE_API_KEY"] = api_key
    os.environ["GOOGLE_TITLE_API"] = os.getenv("GEAI_TITLE_API_KEY")
    os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
    app.run(debug=True)