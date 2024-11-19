from inside_ia import InsideIA
from dotenv import load_dotenv
from gen_title import genTitle
import os


if __name__ == "__main__":
    dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
    load_dotenv(dotenv_path=dotenv_path)
    api_key = os.getenv("GOOGLE_API_KEY")
    os.environ["GOOGLE_API_KEY"] = api_key
    os.environ["GOOGLE_TITLE_API"] = os.getenv("GEAI_TITLE_API_KEY")
    inside_ai = InsideIA("gemini-1.5-flash", "Olá, o que você consegue fazer ?", "000-1", [])
    response = inside_ai.genResponse()
    updateResponse = genTitle(response)
    # Retorna o JSON já formatado corretamente
    print(updateResponse)
    