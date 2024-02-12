import { AnswerQuestion } from "@/components/AnswerQuestion";

export default function ExamPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 w-full h-1/2">
        <h1 className="text-4xl text-blue-800">Exam</h1>
      </div>
      <AnswerQuestion
        id={1}
        question="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt."
        objective={true}
        alternatives={[
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
        ]}
      />
    </div>
  );
}
