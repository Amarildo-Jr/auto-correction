"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "./ui/textarea";

interface answerQuestionProps {
  id: number;
  question: string;
  objective: boolean;
  alternatives?: string[];
  setAnswer: (answerId: number) => void;
}

export function AnswerQuestion(props: answerQuestionProps) {
  return (
    <div className="flex">
      <div className="p-4 w-full flex flex-col gap-y-3 h-1/2">
        <h1 className="text-4xl font-sans  text-blue-800">
          Question {props.id}
        </h1>
        <Separator className="" />
        <div>
          <p className="font-semibold">{props.question}</p>
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
                          onClick={() => props.setAnswer(index)}
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
                <Textarea className="h-48 max-w-screen-3xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
