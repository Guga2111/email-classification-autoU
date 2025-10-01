document.getElementById('upload-form').addEventListener('submit', async function(event) {
    // Impede o comportamento padrão do formulário de recarregar a página
    event.preventDefault();

    const fileInput = document.getElementById('email-file');
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');

    if (fileInput.files.length === 0) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    // A URL do nosso backend Dockerizado
    const backendUrl = 'http://localhost:5001/classify';

    const formData = new FormData();
    formData.append('email_file', fileInput.files[0]);

    // Esconde o resultado anterior e mostra um status de "carregando"
    resultContainer.classList.add('hidden');
    resultContent.textContent = 'Analisando...';
    resultContainer.classList.remove('hidden');

    try {
        // Faz a chamada à API usando fetch
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            // Lança um erro se a resposta da API não for de sucesso (status 2xx)
            throw new Error(data.error || 'Ocorreu um erro na resposta do servidor.');
        }

        // Formata o resultado JSON de forma legível e exibe na tela
        resultContent.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        resultContent.textContent = `Falha na comunicação com o servidor:\n${error.message}`;
    }
});