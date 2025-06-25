'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClassDetailPage() {
  const { classId } = useParams();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você faria a chamada para a API para buscar os dados da turma
    setLoading(false);
  }, [classId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Provas Agendadas</h3>
              {/* Lista de provas */}
            </div>
            <div>
              <h3 className="font-semibold">Colegas</h3>
              {/* Lista de alunos */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 