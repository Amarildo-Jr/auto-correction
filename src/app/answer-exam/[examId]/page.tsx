import { ExamPage } from "@/components/ExamPage";

const questions = [
  {
    id: 1,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: true,
    alternatives: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    ],
  },
  {
    id: 2,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: true,
    alternatives: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    ],
  },
  {
    id: 3,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: true,
    alternatives: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    ],
  },
  {
    id: 4,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 5,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 6,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: true,
    alternatives: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    ],
  },
  {
    id: 7,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 8,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 9,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 10,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: true,
    alternatives: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    ],
  },
  {
    id: 11,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 12,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 13,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: false,
  },
  {
    id: 14,
    question:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    objective: true,
    alternatives: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus",
      "Lorem ipsum dolor sit amet",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis nunc vitae libero luctus, a lacinia nunc tincidunt.",
    ],
  },
];

export default function ExamMainPage() {
  const duration = 60; // seconds
  return (
    <>
      <ExamPage questions={questions} duration={duration} />
    </>
  );
}
