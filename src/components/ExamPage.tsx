"use client";

import { useState } from "react";
import { AnswerQuestion } from "./AnswerQuestion";
import { PaginationBar } from "./PaginationBar";

interface AnsweredQuestion {
  id: number;
  answersId: number[];
}

interface Question {
  id: number;
  question: string;
  objective: boolean;
  alternatives?: string[];
}

const ExamPage = (props: { questions: Question[] }) => {
  const [answers, setAnswers] = useState<AnsweredQuestion[]>(
    props.questions.map((question) => {
      return { id: question.id, answersId: [] };
    })
  );
  const [currentQuestion, setCurrentQuestion] = useState(1);

  function setAnsweredQuestion(id: number, answerId: number) {
    setAnswers(
      answers.map((answer) => {
        if (answer.id === id) {
          return { ...answer, answersId: [answerId] };
        }
        return answer;
      })
    );
  }

  function changeCurrentQuestion(id: number) {
    setCurrentQuestion(id);
  }

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="p-4 w-full">
        <h1 className="text-4xl text-blue-800">Exam Name</h1>
        {props.questions.map((question, index) => {
          return (
            <div
              key={index}
              className={currentQuestion === question.id ? "" : "hidden"}
            >
              <AnswerQuestion
                id={question.id}
                question={question.question}
                objective={question.objective}
                alternatives={question.alternatives}
                setAnswer={(answerId) =>
                  setAnsweredQuestion(question.id, answerId)
                }
              />
            </div>
          );
        })}
      </div>
      <PaginationBar
        current={currentQuestion}
        onChange={changeCurrentQuestion}
        total={props.questions.length}
      />
    </div>
  );
};

export { ExamPage };
