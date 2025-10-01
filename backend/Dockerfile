# light python image
FROM python:3.11-slim

WORKDIR /app

# enviroment variables for optimizing docker
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# dependency install on docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN echo ">>>> ESTOU EXECUTANDO A VERSAO CORRETA E MODIFICADA DO DOCKERFILE <<<<"

RUN python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# copy the code
COPY . .

# exposing on port 5000
EXPOSE 5000

# using gunicorn server for prod
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]