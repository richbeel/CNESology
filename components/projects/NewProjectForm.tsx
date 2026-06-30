'use client';

import { useActionState, useRef } from 'react';
import { createProject, type CreateProjectState } from '@/lib/projects/actions';
import { Button } from '@/components/ui/Button';
import { DatePicker, type DatePickerHandle } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

const initialState: CreateProjectState = {};

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const endDateRef = useRef<DatePickerHandle>(null);

  return (
    <form action={formAction} className="mt-8">
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-200">
            <tr className="align-top">
              <th className="w-[38%] bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900 sm:w-48">
                Název projektu
              </th>
              <td className="px-4 py-4">
                <Input name="name" required placeholder="např. Parkoviště Dukelská" />
              </td>
            </tr>
            <tr className="align-top">
              <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">Lokace</th>
              <td className="px-4 py-4">
                <Input name="location" placeholder="např. Třinec, ul. Dukelská" />
              </td>
            </tr>
            <tr className="align-top">
              <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">Popis</th>
              <td className="px-4 py-4">
                <Textarea
                  name="description"
                  placeholder="Stručný popis zakázky, rozsah prací…"
                  rows={4}
                />
              </td>
            </tr>
            <tr className="align-top">
              <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">
                Začátek stavby
              </th>
              <td className="px-4 py-4">
                <DatePicker
                  name="construction_start"
                  onValueChange={() => endDateRef.current?.open()}
                />
                <p className="mt-2 text-xs text-zinc-500">Volitelné</p>
              </td>
            </tr>
            <tr className="align-top">
              <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">
                Konec stavby
              </th>
              <td className="px-4 py-4">
                <DatePicker ref={endDateRef} name="construction_end" />
                <p className="mt-2 text-xs text-zinc-500">Volitelné</p>
              </td>
            </tr>
            <tr className="align-top">
              <th className="bg-zinc-50 px-4 py-4 text-left font-medium text-zinc-900">
                Vložení výkresu
              </th>
              <td className="px-4 py-4">
                <input
                  name="drawing"
                  type="file"
                  required
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-900"
                />
                <p className="mt-2 text-xs text-zinc-500">PDF nebo obrázek, max. 50 MB</p>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      {state.error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Ukládám…' : 'Vytvořit projekt'}
        </Button>
      </div>
    </form>
  );
}
