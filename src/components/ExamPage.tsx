"use client";

import { ProgressBar } from "@/components/ProgressBar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnswerQuestion } from "./AnswerQuestion";
import { PaginationBar } from "./PaginationBar";
import { Timer } from "./Timer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface AnsweredQuestion {
  id: number;
  type?: "objective" | "written";
  writtenAnswer: string;
  alternativeId: number;
}

interface Question {
  id: number;
  question: string;
  objective: boolean;
  alternatives?: string[];
  writtenAnswer?: string;
}

const ExamPage = (props: { questions: Question[]; duration: number }) => {
  // Garantir que questions seja sempre um array válido
  const questions = Array.isArray(props.questions) ? props.questions : [];

  const [answers, setAnswers] = useState<AnsweredQuestion[]>(
    questions.map((question) => {
      return {
        id: question.id,
        type: question.objective ? "objective" : "written",
        writtenAnswer: question.writtenAnswer || "",
        alternativeId: -1,
      };
    })
  );
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const changeCurrentQuestion = (question: number) => {
    const currentAnswer = answers.find(
      (answer) => answer.id === currentQuestion
    );
    if (currentAnswer) {
      setAnswers((prevAnswers) => {
        const updatedAnswers = prevAnswers.map((answer) =>
          answer.id === currentQuestion ? currentAnswer : answer
        );
        return updatedAnswers;
      });
    }
    setCurrentQuestion(question);
  };

  const selectedAnswer = (
    questionId: number,
    writtenAnswer: string,
    alternativeId: number
  ) => {
    const newAnswers = answers.map((answer) => {
      if (answer.id === questionId) {
        return {
          ...answer,
          writtenAnswer,
          alternativeId,
        };
      }
      return answer;
    });
    setAnswers(newAnswers);
  };

  const time = new Date();
  time.setSeconds(time.getSeconds() + props.duration);

  const router = useRouter();

  // Se não há questões, mostrar mensagem
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Nenhuma questão encontrada</h2>
          <p className="text-gray-500">Esta prova não possui questões disponíveis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="p-4 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-semibold text-sky-800">Prova 1 - Introdução à Programação</h1>
          <div className="flex gap-x-4">
            <Timer expiryTimestamp={time} />
            <AlertDialog>
              <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 bg-sky-800 text-white shadow hover:bg-sky-500 px-6 py-2">
                Finalizar Prova
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar finalização</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você não poderá retornar à prova após finalizá-la. Tem
                    certeza de que deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      router.push("/student/finish-exam");
                      console.log(answers);
                    }}
                  >
                    Finalizar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <ProgressBar
          current={currentQuestion}
          total={questions.length}
          className="mt-4"
        />

        <div className="mt-8">
          {questions.map((question, index) => (
            <div
              key={index}
              className={`transition-opacity duration-300 ${currentQuestion === question.id ? "opacity-100" : "hidden"
                }`}
            >
              <AnswerQuestion
                id={question.id}
                question={question.question}
                objective={question.objective}
                alternatives={question.alternatives}
                selectedAnswer={selectedAnswer}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full mb-10">
        <PaginationBar
          current={currentQuestion}
          onChange={changeCurrentQuestion}
          total={questions.length}
        />
      </div>
    </div>
  );
};

export { ExamPage };

