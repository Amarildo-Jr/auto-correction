import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Textarea } from "./ui/textarea";

interface answerQuestionProps {
  id: number;
  question: string;
  objective: boolean;
  alternatives?: string[];
  writtenAnswer?: string;
  selectedAnswer: (
    questionId: number,
    writtenAnswer: string,
    alternativeId: number
  ) => void;
}

export function AnswerQuestion(props: answerQuestionProps) {
  const [answer, setAnswer] = useState(props.writtenAnswer || "");
  const [alternativeId, setAlternativeId] = useState(-1);

  // Proteção anti-cola para questões dissertativas
  const handlePreventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    // Mostrar aviso visual
    const element = e.target as HTMLElement
    const originalBorder = element.style.border
    element.style.border = '2px solid #ef4444'
    setTimeout(() => {
      element.style.border = originalBorder
    }, 500)
  }

  const handlePreventKeyboardShortcuts = (e: React.KeyboardEvent) => {
    const isCtrlKey = e.ctrlKey || e.metaKey
    const forbiddenKeys = ['c', 'v', 'x', 'a', 'z', 'y']

    if (isCtrlKey && forbiddenKeys.includes(e.key.toLowerCase())) {
      e.preventDefault()
    }

    // Bloquear F12, Ctrl+Shift+I, Ctrl+U
    if (e.key === 'F12' ||
      (isCtrlKey && e.shiftKey && e.key === 'I') ||
      (isCtrlKey && e.key === 'u')) {
      e.preventDefault()
    }
  }

  const handlePreventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleAnswerChange = (newAnswer: string) => {
    setAnswer(newAnswer);
    props.selectedAnswer(props.id, newAnswer, alternativeId);
  };

  const handleAlternativeChange = (id: number) => {
    setAlternativeId(id);
    props.selectedAnswer(props.id, answer, id);
  };

  return (
    <div className="p-4 w-full flex flex-col gap-y-3 h-1/2">
      <h1 className="text-4xl font-sans  text-sky-800">
        Question {props.id}
      </h1>
      <Separator className="" />
      <div>
        <ReactMarkdown className="font-medium">{props.question}</ReactMarkdown>
        <div className="mt-2 flex flex-col gap-y-2 h-full">
          {props.objective ? (
            <>
              <p className="text-sm italic">Marque a alternativa correta:</p>
              <RadioGroup>
                {(props.alternatives ?? []).map((alternative, index) => {
                  return (
                    <div key={index} className="flex items-center">
                      <RadioGroupItem
                        id={index.toString()}
                        value={`alternative${index}`}
                        onClick={() => handleAlternativeChange(index)}
                      />
                      <Label htmlFor={index.toString()} className="ml-2">
                        {alternative}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center gap-y-2">
              <p className="text-sm italic w-full text-start">
                Responda a questão utilizando o campo de texto abaixo:
              </p>
              <div className="relative w-full">
                <Textarea
                  className="h-48 max-w-screen-3xl min-h-48 max-h-80"
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Digite sua resposta aqui... (Copy/Paste não permitido)"
                  onPaste={handlePreventCopyPaste}
                  onCopy={handlePreventCopyPaste}
                  onCut={handlePreventCopyPaste}
                  onKeyDown={handlePreventKeyboardShortcuts}
                  onContextMenu={handlePreventContextMenu}
                  spellCheck={false}
                  autoComplete="off"
                />
                <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  🛡️ Protegido
                </div>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Por questões de segurança, copiar e colar não são permitidos nesta questão
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
