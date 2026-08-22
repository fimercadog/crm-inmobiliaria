"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { taskFormSchema, type TaskFormSchema } from "@/features/tasks/task-form-schema";
import { TASK_STATUS_LABELS, TASK_STATUSES, type Task } from "@/types/task";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormSchema>;
  onSubmit: SubmitHandler<TaskFormSchema>;
  submitLabel?: string;
}

export function taskToFormValues(task: Task): Partial<TaskFormSchema> {
  return {
    title: task.title,
    description: task.description ?? undefined,
    due_date: task.due_date ?? undefined,
    status: task.status,
  };
}

export function TaskForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { status: "pendiente", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={errors.title ? "true" : undefined}>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input id="title" {...register("title")} />
          <FieldError errors={errors.title ? [errors.title] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.due_date ? "true" : undefined}>
            <FieldLabel htmlFor="due_date">Fecha límite</FieldLabel>
            <Input id="due_date" type="date" {...register("due_date")} />
            <FieldError errors={errors.due_date ? [errors.due_date] : undefined} />
          </Field>
          <Field data-invalid={errors.status ? "true" : undefined}>
            <FieldLabel htmlFor="status">Estado</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {TASK_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.description ? "true" : undefined}>
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <Textarea id="description" rows={4} {...register("description")} />
          <FieldError errors={errors.description ? [errors.description] : undefined} />
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
