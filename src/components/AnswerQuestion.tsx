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
              <Textarea
                className="h-48 max-w-screen-3xl min-h-48 max-h-80"
                value={answer}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
