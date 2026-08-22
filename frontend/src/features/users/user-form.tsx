"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  createUserFormSchema,
  editUserFormSchema,
  type CreateUserFormInput,
  type CreateUserFormOutput,
  type EditUserFormInput,
  type EditUserFormOutput,
} from "@/features/users/user-form-schema";
import { USER_ROLE_LABELS, USER_ROLES, type CrmUser } from "@/types/user";

export function userToFormValues(user: CrmUser): Partial<EditUserFormInput> {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function CreateUserForm({ onSubmit }: { onSubmit: SubmitHandler<CreateUserFormOutput> }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormInput, unknown, CreateUserFormOutput>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { role: "agente" },
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
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        <Field data-invalid={errors.role ? "true" : undefined}>
          <FieldLabel htmlFor="role">Rol</FieldLabel>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {USER_ROLE_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.role ? [errors.role] : undefined} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Crear usuario
        </Button>
      </div>
    </form>
  );
}

export function EditUserForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<EditUserFormInput>;
  onSubmit: SubmitHandler<EditUserFormOutput>;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormInput, unknown, EditUserFormOutput>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: { role: "agente", ...defaultValues },
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

        <Field data-invalid={errors.role ? "true" : undefined}>
          <FieldLabel htmlFor="role">Rol</FieldLabel>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {USER_ROLE_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.role ? [errors.role] : undefined} />
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
