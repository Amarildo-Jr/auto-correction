'use client';

import { ExamPage } from "@/components/ExamPage";
import { examService } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExamDetailPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await examService.getById(Number(examId));
        setExam(data);
      } catch (error) {
        console.error('Erro ao carregar prova:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return <ExamPage questions={exam.questions} duration={exam.duration} />;
}