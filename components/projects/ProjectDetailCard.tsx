'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { updateProject, type UpdateProjectState } from '@/lib/projects/actions';
import { ProjectHub, type ProjectHubData } from '@/components/projects/ProjectHub';
import { Button } from '@/components/ui/Button';
import { DatePicker, type DatePickerHandle } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

type ProjectDetailCardProps = {
  project: ProjectHubData;
  drawing: { url: string; isPdf: boolean } | null;
};

const initialState: UpdateProjectState = {};

export function ProjectDetailCard({ project, drawing }: ProjectDetailCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProject, initialState);
  const wasPending = useRef(false);
  const endDateRef = useRef<DatePickerHandle>(null);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setEditing(false);
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, state.error, router]);

  if (editing) {
    return (
      <form action={formAction}>
        <input type="hidden" name="id" value={project.id} />

        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-200">
              <tr className="align-top">
                <th className="w-[38%] bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900 sm:w-48">
                  Název projektu
                </th>
                <td className="px-4 py-4">
                  <Input name="name" required defaultValue={project.name} />
                </td>
              </tr>
              <tr className="align-top">
                <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">Lokace</th>
                <td className="px-4 py-4">
                  <Input name="location" defaultValue={project.location_hint ?? ''} />
                </td>
              </tr>
              <tr className="align-top">
                <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">Popis</th>
                <td className="px-4 py-4">
                  <Textarea name="description" rows={4} defaultValue={project.description ?? ''} />
                </td>
              </tr>
              <tr className="align-top">
                <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">
                  Začátek stavby
                </th>
                <td className="px-4 py-4">
                  <DatePicker
                    name="construction_start"
                    defaultValue={project.construction_start}
                    onValueChange={() => endDateRef.current?.open()}
                  />
                </td>
              </tr>
              <tr className="align-top">
                <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">
                  Konec stavby
                </th>
                <td className="px-4 py-4">
                  <DatePicker
                    ref={endDateRef}
                    name="construction_end"
                    defaultValue={project.construction_end}
                  />
                </td>
              </tr>
              <tr className="align-top">
                <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">
                  Výkres
                </th>
                <td className="px-4 py-4">
                  <input
                    name="drawing"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-900"
                  />
                  <p className="mt-2 text-xs text-zinc-500">Volitelné — nahraďte stávající výkres</p>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        {state.error ? (
          <p
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Ukládám…' : 'Uložit'}
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={() => setEditing(false)}>
            Zrušit
          </Button>
        </div>
      </form>
    );
  }

  return <ProjectHub project={project} drawing={drawing} onEdit={() => setEditing(true)} />;
}
