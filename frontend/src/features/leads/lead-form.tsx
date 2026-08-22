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
  leadFormSchema,
  type LeadFormInput,
  type LeadFormOutput,
} from "@/features/leads/lead-form-schema";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STATUS_LABELS, LEAD_STATUSES, type Lead } from "@/types/lead";

interface LeadFormProps {
  defaultValues?: Partial<LeadFormInput>;
  onSubmit: SubmitHandler<LeadFormOutput>;
  submitLabel?: string;
}

export function leadToFormValues(lead: Lead): Partial<LeadFormInput> {
  return {
    name: lead.name,
    phone: lead.phone ?? undefined,
    email: lead.email ?? undefined,
    source: lead.source,
    status: lead.status,
    notes: lead.notes ?? undefined,
  };
}

export function LeadForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, unknown, LeadFormOutput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { source: "manual", status: "nuevo", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={errors.name ? "true" : undefined}>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input id="name" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>
          <Field data-invalid={errors.phone ? "true" : undefined}>
            <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
            <Input id="phone" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </Field>
          <Field data-invalid={errors.email ? "true" : undefined}>
            <FieldLabel htmlFor="email">Correo</FieldLabel>
            <Input id="email" type="email" {...register("email")} />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.source ? "true" : undefined}>
            <FieldLabel htmlFor="source">Origen</FieldLabel>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {LEAD_SOURCE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.source ? [errors.source] : undefined} />
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
                    {LEAD_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {LEAD_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>
        </div>

        <Field data-invalid={errors.notes ? "true" : undefined}>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea id="notes" rows={3} {...register("notes")} />
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
