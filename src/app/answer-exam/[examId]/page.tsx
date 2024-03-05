import { ExamPage } from "@/components/ExamPage";
import { Config, JsonDB } from "node-json-db";

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

export default async function ExamMainPage() {
  const duration = 60; // seconds

  const db = new JsonDB(new Config("dataBase", true, false, "/"));

  const questions = await db.getData("/questions");

  return (
    <>
      <ExamPage duration={duration} questions={questions} />
    </>
  );
}
