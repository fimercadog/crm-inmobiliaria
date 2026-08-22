"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  activityFormSchema,
  type ActivityFormInput,
  type ActivityFormOutput,
} from "@/features/activities/activity-form-schema";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPES, type Activity } from "@/types/activity";

interface ActivityFormProps {
  defaultValues?: Partial<ActivityFormInput>;
  onSubmit: SubmitHandler<ActivityFormOutput>;
  submitLabel?: string;
}

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function activityToFormValues(activity: Activity): Partial<ActivityFormInput> {
  return {
    type: activity.type,
    notes: activity.notes,
    occurred_at: toDatetimeLocal(activity.occurred_at),
  };
}

export function ActivityForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: ActivityFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput, unknown, ActivityFormOutput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: { type: "nota", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.type ? "true" : undefined}>
            <FieldLabel htmlFor="type">Tipo</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {ACTIVITY_TYPE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.type ? [errors.type] : undefined} />
          </Field>

          <Field data-invalid={errors.occurred_at ? "true" : undefined}>
            <FieldLabel htmlFor="occurred_at">Fecha</FieldLabel>
            <Input id="occurred_at" type="datetime-local" {...register("occurred_at")} />
            <FieldError errors={errors.occurred_at ? [errors.occurred_at] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.notes ? "true" : undefined}>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea id="notes" rows={4} {...register("notes")} />
          <FieldError errors={errors.notes ? [errors.notes] : undefined} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
