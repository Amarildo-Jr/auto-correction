import { Logo } from "@/components/Logo";

export default function ExamFinished() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full px-20 text-center">
        <Logo className="w-30 h-30 pb-5" dark={true} />
        <div className="pb-10">
          <h1 className="text-6xl font-semibold">Prova Finalizada</h1>
          <p className="mt-3 text-2xl">
            Parabéns, você finalizou a prova! Aguarde o resultado.
          </p>
        </div>
      </main>
    </div>
  );
}
