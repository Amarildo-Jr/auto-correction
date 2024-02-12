import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface answerQuestionProps {
  id: number;
  question: string;
  objective: boolean;
  alternatives?: string[];
}

export function AnswerQuestion(props: answerQuestionProps) {
  let { id, question, objective, alternatives } = props;
  objective = true;
  alternatives = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
  ];
  return (
    <div className="flex min-h-screen">
      <div className="p-4 w-full flex flex-col gap-y-3 h-1/2">
        <h1 className="text-4xl font-sans  text-blue-800">
          Question {props.id}
        </h1>
        <Separator className="" />
        <div>
          <p className="font-semibold">{props.question}</p>
          <div className="mt-2 flex flex-col gap-y-2">
            <RadioGroup>
              {objective &&
                alternatives.map((alternative, index) => {
                  return (
                    <div key={index} className="flex items-center">
                      <RadioGroupItem
                        id={index.toString()}
                        name={`alternative${index}`}
                        value={`alternative${index}`}
                      />
                      <Label htmlFor={index.toString()} className="ml-2">
                        {alternative}
                      </Label>
                    </div>
                  );
                })}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
