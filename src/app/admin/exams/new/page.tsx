'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { examService } from "@/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await examService.create({
        title,
        description,
        duration_minutes: parseInt(duration),
        start_time: startTime,
        end_time: endTime
      });
      router.push('/admin/exams');
    } catch (error) {
      console.error('Erro ao criar prova:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Título da Prova"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Duração (minutos)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="datetime-local"
                placeholder="Data/Hora de Início"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="datetime-local"
                placeholder="Data/Hora de Término"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <Button type="submit">Criar Prova</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 