import os, io, re, json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import PyPDF2

load_dotenv()

app = Flask(__name__)

CORS(app)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    stopwords.words('portuguese')
except LookupError:
    import nltk
    nltk.download('stopwords')
try:
    import nltk
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

stop_words_pt = set(stopwords.words('portuguese'))

def read_text_from_file (file_storage):

    if file_storage.filename.endswith('.txt'):
        return file_storage.read().decode('utf-8')
    elif file_storage.filename.endswith('.pdf'):
        pdf_content = ""
        pdf_stream = io.BytesIO(file_storage.read())
        reader = PyPDF2.PdfReader(pdf_stream)
        for page in reader.pages:
            pdf_content += page.extract_text() or ""
        return pdf_content
    else:
        raise ValueError("Formato de arquivo nao suportado. Use .txt ou .pdf")
    
def classify_and_generate_response_with_ai (email_text):
    prompt = f"""
    Analise o texto de um email e realize as seguintes tarefas:

    1.  **Classificação Principal:** Classifique o email como "Produtivo" ou "Improdutivo".
        * Um email "Produtivo" refere-se a trabalho, tarefas, reuniões, relatórios e comunicações profissionais que exigem atenção.
        * Um email "Improdutivo" é marketing, newsletter, spam ou assuntos estritamente pessoais não urgentes.

    2.  **Sugestão de Resposta:** Crie uma resposta curta, profissional e adequada ao contexto do email.

    3.  **Extração de Informações (APENAS para emails 'Produtivos'):**
        * **'perguntas'**: Extraia todas as perguntas explícitas feitas no email.
        * **'datas'**: Extraia quaisquer datas, prazos ou menções a horários (ex: "amanhã", "próxima sexta", "15/10/2025", "às 14h").
        * **'acoes'**: Identifique e extraia itens de ação claros ou tarefas solicitadas (ex: "enviar o relatório", "revisar o documento", "agendar a reunião").

    **Formato de Saída OBRIGATÓRIO:**
    Sua resposta DEVE ser um único objeto JSON válido. NÃO inclua explicações, apenas o JSON.
    Se um email for 'Improdutivo', os campos de extração devem ser arrays vazios.
    Se nenhuma informação for encontrada para um campo, retorne um array vazio [].

    **Exemplo de JSON de Saída:**
    {{
      "classificacao": "Produtivo",
      "sugestao_resposta": "Claro, revisarei o documento e enviarei o feedback até amanhã.",
      "perguntas": ["Você pode revisar o documento anexo?"],
      "datas": ["amanhã"],
      "acoes": ["revisar o documento anexo", "enviar o feedback"]
    }}

    **Texto do Email para Análise:**
    ---
    {email_text}
    ---
    """

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        response = model.generate_content(prompt)

        response_text = response.text.strip()
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)

        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = response_text
        
        return json.loads(json_str)
    except Exception as e:
        print(f"ERRO: Falha ao chamar a API do Gemini: {e}")

        if 'response' in locals():
            print("Resposta bruta recebida:", response.text)
        return None
    
@app.route('/classify', methods=['POST'])
def classify_email_endpoint ():        
    try:
        raw_text = None

        if 'email_file' in request.files and request.files['email_file'].filename:
            file = request.files['email_file']
            raw_text = read_text_from_file(file)

        elif request.is_json:
            data = request.get_json()
            if data and 'email_text' in data:
                raw_text = data.get('email_text')

        if not raw_text or not raw_text.strip():
            return jsonify({"error": "Nenhum arquivo ou texto foi enviado, ou o conteúdo está vazio"}), 400
            
        ai_result = classify_and_generate_response_with_ai(raw_text)

        if not ai_result:
            return jsonify({"error" : "Falha ao processar com a IA. A resposta não foi um JSON válido."}), 502
            
        return jsonify(ai_result), 200
        
    except ValueError as ve:
        return jsonify({"error" : str(ve)}), 400
    except Exception as e:
        print(f"ERRO INESPERADO: {e}")
        return jsonify({"error" : "Ocorreu um erro interno no servidor"}), 500  
    