import os
import google.generativeai as genai
from dotenv import load_dotenv

# Carrega a variável de ambiente do arquivo .env
load_dotenv()

try:
    # Configura a API Key
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

    print("Buscando modelos disponíveis para a sua chave de API...")
    print("-" * 50)

    # Itera sobre todos os modelos disponíveis
    for m in genai.list_models():
        # Verifica se o método 'generateContent' é suportado por este modelo
        if 'generateContent' in m.supported_generation_methods:
            print(f"Modelo encontrado: {m.name}")

    print("-" * 50)
    print("Use um dos nomes de modelo listados acima no seu arquivo app.py.")

except Exception as e:
    print(f"Ocorreu um erro: {e}")