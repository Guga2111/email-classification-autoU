import { useState, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle2, XCircle, HelpCircle, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  classificacao: string;
  sugestao_resposta: string;
  perguntas?: string[];
  datas?: string[];
  acoes?: string[];
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'txt' && fileExtension !== 'pdf') {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo .txt ou .pdf",
      });
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const analyzeEmail = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo antes de analisar",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('email_file', selectedFile);

    try {
      const response = await fetch('http://localhost:5001/classify', { 
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar o arquivo');
      }

      setResult(data);
      toast({
        title: "Análise concluída",
        description: "O email foi analisado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao analisar:', error);
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível conectar ao servidor",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isProductive = result?.classificacao.toLowerCase() === 'produtivo'; 

  const hasKeyInfo = isProductive && result && (
    (result.perguntas && result.perguntas.length > 0) ||
    (result.datas && result.datas.length > 0) ||
    (result.acoes && result.acoes.length > 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analisador de Produtividade
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Envie um arquivo de email para classificá-lo e receber sugestões de resposta inteligentes
          </p>
        </div>

        <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-8 space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-300 ease-in-out
                ${isDragging 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`
                    rounded-full p-4 transition-colors duration-300
                    ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}
                  `}>
                    <Upload className="w-8 h-8" />
                  </div>
                </div>
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-foreground">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      {isDragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: .txt ou .pdf
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={analyzeEmail}
              disabled={!selectedFile || isAnalyzing}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar Email'
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg border-2 animate-scale-in">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-foreground">Resultado da Análise</h2>
                <Badge 
                  variant={isProductive ? "default" : "destructive"}
                  className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${
                    isProductive 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' // Verde para Produtivo
                      : 'bg-red-100 text-red-700 hover:bg-red-100' // Vermelho para Improdutivo
                  }`}
                >
                  {isProductive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {result.classificacao}
                </Badge>
              </div>

              {isProductive && hasKeyInfo && (
                <>
                  <div className="h-px bg-border" /> 

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      💡 Informações Encontradas
                    </h3>
                    <div className="space-y-3">
                      {result.perguntas && result.perguntas.length > 0 && (
                        <div className="space-y-2">
                          {/* Perguntas */}
                          {result.perguntas.map((q, index) => (
                            <div key={`pergunta-${index}`} className="flex items-start gap-3 text-sm">
                              <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-foreground">{q}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.datas && result.datas.length > 0 && (
                        <div className="space-y-2">
                          {/* Datas */}
                          {result.datas.map((d, index) => (
                            <div key={`data-${index}`} className="flex items-start gap-3 text-sm">
                              <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                              <p className="text-foreground">{d}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.acoes && result.acoes.length > 0 && (
                      
                        <div className="space-y-2">
                          {/* Ações */}
                          {result.acoes.map((a, index) => (
                            <div key={`acao-${index}`} className="flex items-start gap-3 text-sm">
                              <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <p className="text-foreground">{a}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="h-px bg-border" /> 
              {/* Sugestão de Resposta */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Sugestão de Resposta
                </h3>
                <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <p className="text-foreground leading-relaxed">
                    {result.sugestao_resposta}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;