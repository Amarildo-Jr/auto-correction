
interface PerformanceProps {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  averageTimePerQuestion: string;
  difficulty: string;
}

export default function Component() {
  const score = 85;
  const correctAnswers = 42;
  const wrongAnswers = 8;
  const totalQuestions = 50;
  const averageTimePerQuestion = "12 min";
  const difficulty = "Médio";
  const passingScore = 70;
  const performance = score >= passingScore ? "Aprovado" : "Reprovado";

  const performanceStyle =
    score >= passingScore
      ? "bg-green-600 bg-opacity-20 text-green-600"
      : "bg-red-600 bg-opacity-20 text-red-600";

  const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-3xl w-full px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Resultado da Prova</h1>
            <p className="text-muted-foreground">
              Aqui você pode visualizar seu desempenho na prova.
            </p>
          </div>
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Seu Desempenho</h2>
                  <p className="text-muted-foreground">Veja como você se saiu na prova.</p>
                </div>
                <div
                  className={`${performanceStyle} rounded-full px-4 py-2 font-medium`}>
                  {performance}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-xl font-bold text-foreground">Pontuação</h3>
                  <div className="text-4xl font-bold text-foreground">{score}</div>
                  <p className="text-muted-foreground">Pontos obtidos</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-xl font-bold text-foreground">Acertos</h3>
                  <div className="text-4xl font-bold text-foreground">{correctAnswers}</div>
                  <p className="text-muted-foreground">Questões corretas</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-xl font-bold text-foreground">Erros</h3>
                  <div className="text-4xl font-bold text-foreground">{wrongAnswers}</div>
                  <p className="text-muted-foreground">Questões incorretas</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-xl font-bold text-foreground">Aproveitamento</h3>
                  <div className="text-4xl font-bold text-foreground">{accuracy}%</div>
                  <p className="text-muted-foreground">Percentual de acertos</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground">Análise de Desempenho</h2>
            <p className="text-muted-foreground">Veja detalhes sobre seu desempenho na prova.</p>
            <div className="grid gap-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-xl font-bold text-foreground">Tempo Médio</h3>
                  <div className="text-4xl font-bold text-foreground">{averageTimePerQuestion}</div>
                  <p className="text-muted-foreground">Tempo médio por questão</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-xl font-bold text-foreground">Nível de Dificuldade</h3>
                  <div className="text-4xl font-bold text-foreground">{difficulty}</div>
                  <p className="text-muted-foreground">Dificuldade da prova</p>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Feedback do Professor</h2>
                <p className="text-muted-foreground">Seu professor deixou o seguinte feedback sobre seu desempenho:</p>
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <p className="text-muted-foreground">
                    Parabéns pelo excelente desempenho! Você demonstrou domínio dos conteúdos e habilidades avaliadas.
                    Mantenha esse nível de dedicação e esforço. Algumas áreas ainda precisam de mais atenção, mas estou
                    confiante que você conseguirá evoluir ainda mais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
