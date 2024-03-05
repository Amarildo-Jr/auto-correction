"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnswerQuestion } from "./AnswerQuestion";
import { PaginationBar } from "./PaginationBar";
import { Timer } from "./Timer";
import { Button } from "./ui/button";

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
  const [answers, setAnswers] = useState<AnsweredQuestion[]>(
    props.questions.map((question) => {
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
    // Save the current answer before changing the question
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

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="p-4 w-full">
        <h1 className="text-4xl text-blue-800">Exam Name</h1>
        <Timer expiryTimestamp={time} />
        {props.questions.map((question, index) => (
          <div
            key={index}
            className={currentQuestion === question.id ? "" : "hidden"}
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
      <div className="w-full mb-14">
        <div className="flex justify-end">
          <Button
            className="mr-8 px-8"
            onClick={() => {
              router.push("/finish-exam");
              console.log(answers);
            }}
            variant="default"
          >
            Finalizar
          </Button>
        </div>
        <PaginationBar
          current={currentQuestion}
          onChange={changeCurrentQuestion}
          total={props.questions.length}
        />
      </div>
    </div>
  );
};

export { ExamPage };
