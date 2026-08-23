"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { resetPassword } from "@/features/auth/api";
import { ApiError } from "@/types/api";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token || !email) {
      setFormError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }

    setFormError(null);
    try {
      await resetPassword(email, token, values.password);
      toast.success("Contraseña actualizada correctamente");
      router.push("/login");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "No fue posible restablecer la contraseña");
    }
  }

  if (!token || !email) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Este enlace no es válido o ya expiró. Solicita uno nuevo para continuar.
        </p>
        <Link href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={errors.password ? "true" : undefined}>
          <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        <Field data-invalid={errors.password_confirmation ? "true" : undefined}>
          <FieldLabel htmlFor="password_confirmation">Confirmar contraseña</FieldLabel>
          <Input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password_confirmation}
            {...register("password_confirmation")}
          />
          <FieldError errors={errors.password_confirmation ? [errors.password_confirmation] : undefined} />
        </Field>

        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Restablecer contraseña
        </Button>
      </FieldGroup>
    </form>
  );
}
