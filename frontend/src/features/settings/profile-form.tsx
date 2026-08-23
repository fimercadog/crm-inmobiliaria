"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  profileFormSchema,
  type ProfileFormInput,
  type ProfileFormOutput,
} from "@/features/settings/profile-form-schema";

interface ProfileFormProps {
  defaultValues: Pick<ProfileFormInput, "name" | "email">;
  onSubmit: SubmitHandler<ProfileFormOutput>;
}

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={errors.password ? "true" : undefined}>
          <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
          <Input id="password" type="password" placeholder="Dejar en blanco para no cambiarla" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        <Field data-invalid={errors.current_password ? "true" : undefined}>
          <FieldLabel htmlFor="current_password">Contraseña actual</FieldLabel>
          <Input
            id="current_password"
            type="password"
            placeholder="Solo necesaria si vas a cambiar tu contraseña"
            {...register("current_password")}
          />
          <FieldError errors={errors.current_password ? [errors.current_password] : undefined} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
