"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { login } from "@/features/auth/api";
import { useAppDispatch } from "@/hooks/redux";
import { setCredentials } from "@/store/slices/authSlice";
import { ApiError } from "@/types/api";

const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEMO_USERS = [
  { role: "Administrador", email: "admin@crm.test" },
  { role: "Agente", email: "agente@crm.test" },
  { role: "Asistente", email: "asistente@crm.test" },
];

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function fillDemoUser(email: string) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "password", { shouldValidate: true });
  }

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const { user } = await login(values.email, values.password);
      dispatch(setCredentials({ user }));
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "No fue posible iniciar sesión");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={errors.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={errors.password ? "true" : undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Link href="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Iniciar sesión
        </Button>
      </FieldGroup>

      <div className="mt-6 rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">Usuarios demo</p>
        <p className="text-xs text-muted-foreground">Contraseña para todos: password</p>
        <div className="mt-3 flex flex-col gap-2">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => fillDemoUser(demo.email)}
              className="rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-accent"
            >
              <p className="text-sm font-medium">{demo.role}</p>
              <p className="text-xs text-muted-foreground">{demo.email}</p>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
