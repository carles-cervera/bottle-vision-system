import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Scan, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelCard } from "@/components/analyzer/ModelCard";
import { ImageDropzone } from "@/components/analyzer/ImageDropzone";
import { ResultsCard } from "@/components/analyzer/ResultsCard";
// import { AnalysisHistory } from "@/components/analyzer/AnalysisHistory";
// import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import type { ModelType, ModelInfo, AnalysisResult } from "@/types/analysis";

const MODELS: ModelInfo[] = [
  {
    id: 'nivell',
    title: 'Model de Nivell',
    description: 'Detecta si el nivell és correcte.',
    icon: 'gauge',
    endpoint: '/api/analyze/level'
  },
  {
    id: 'tap',
    title: 'Model de Tap',
    description: 'Comprova si el tap està ben col·locat.',
    icon: 'circle-dot',
    endpoint: '/api/analyze/tap'
  }
];

// Replace with your actual API base URL
const API_BASE_URL = 'http://localhost:8000';

export default function Index() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('nivell');
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);


  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    const startTime = performance.now();

    try {
      const formData = new FormData();
      formData.append('file', selectedImage.file);

      const model = MODELS.find(m => m.id === selectedModel)!;
      const response = await fetch(`${API_BASE_URL}${model.endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en l\'anàlisi');
      }

      const data = await response.json();
      const endTime = performance.now();

      const analysisResult: AnalysisResult = {
        id: crypto.randomUUID(),
        model: selectedModel,
        label: data.label || data.prediction || 'Desconegut',
        confidence: data.confidence || data.score || 0.85,
        timestamp: new Date(),
        imageName: selectedImage.file.name,
        imagePreview: selectedImage.preview,
        responseTime: Math.round(endTime - startTime)
      };

      setResult(analysisResult);
    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      // Detalles adicionales para debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconegut';
      alert(`Error en l'anàlisi: ${errorMessage}\n\nRevisa la consola per més detalls.`);
    } finally {
      setIsAnalyzing(false);
    }
  };



  const currentModel = MODELS.find(m => m.id === selectedModel)!;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 bg-card border-r border-border p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-card-foreground">
            Analitzador d'Imatges
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            TFG - Visió per Computador
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Tria el tipus de model
          </h2>
          <div className="space-y-3">
            {MODELS.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={selectedModel === model.id}
                onSelect={() => setSelectedModel(model.id)}
              />
            ))}
          </div>
        </div>

        <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
          <p>
            <span className="font-medium text-card-foreground">Model actiu:</span>{' '}
            {currentModel.title}
          </p>
          <p className="mt-1">
          <span className="font-medium text-card-foreground">Confiança recomanada:</span>{' '}
            0.8
          </p>
          <Link to="/monitor" className="mt-4 block">
            <Button variant="outline" className="w-full">
              <Radio className="w-4 h-4 mr-2" />
              Mode Temps Real
            </Button>
          </Link>
        </div>


      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Anàlisi d'Imatges
            </h2>
            <p className="text-muted-foreground mt-1">
              Puja una imatge per analitzar-la amb el model seleccionat
            </p>
          </div>

          <div className="space-y-6">
            <ImageDropzone
              onImageSelect={(file, preview) => setSelectedImage({ file, preview })}
              selectedImage={selectedImage}
              onClear={() => {
                setSelectedImage(null);
                setResult(null);
              }}
              disabled={isAnalyzing}
            />

            {selectedImage && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analitzant...
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 mr-2" />
                    Analitzar Imatge
                  </>
                )}
              </Button>
            )}

            {result && (
              <ResultsCard 
                result={result} 
                imagePreview={result.imagePreview}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
