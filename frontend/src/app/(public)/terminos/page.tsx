import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Términos y condiciones | ${SITE_CONFIG.name}`,
  description: "Condiciones de uso de este sitio web y del catálogo de propiedades publicado en él.",
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" updatedAt="23 de agosto de 2026">
      <p>
        Al usar este sitio web aceptas los siguientes términos y condiciones. Si no estás de acuerdo con ellos,
        te pedimos no continuar usando el sitio.
      </p>

      <h2>1. Objeto del sitio</h2>
      <p>
        Este sitio publica un catálogo informativo de propiedades en venta y arriendo, y permite a visitantes
        solicitar información, agendar contacto o dejar sus datos para vender o arrendar un inmueble.
      </p>

      <h2>2. Información de las propiedades</h2>
      <p>
        Los precios, características, disponibilidad y fotografías de cada propiedad se actualizan
        periódicamente, pero pueden cambiar sin previo aviso. La información publicada tiene fines
        informativos y no constituye una oferta comercial vinculante. Antes de tomar una decisión, confirma
        los detalles directamente con nuestro equipo.
      </p>

      <h2>3. Uso permitido</h2>
      <p>Al usar este sitio te comprometes a:</p>
      <ul>
        <li>Proporcionar información veraz en los formularios de contacto.</li>
        <li>No usar el sitio para fines fraudulentos o ilegales.</li>
        <li>No intentar acceder a áreas restringidas del sistema sin autorización.</li>
      </ul>

      <h2>4. Propiedad intelectual</h2>
      <p>
        El contenido de este sitio (textos, fotografías, marca y diseño) es propiedad de {SITE_CONFIG.name} o
        de sus propietarios/licenciantes, y no puede reproducirse sin autorización previa.
      </p>

      <h2>5. Tratamiento de datos personales</h2>
      <p>
        El tratamiento de los datos que nos compartas a través de este sitio se rige por nuestra{" "}
        <a href="/privacidad">Política de tratamiento de datos personales</a>.
      </p>

      <h2>6. Limitación de responsabilidad</h2>
      <p>
        No garantizamos que el sitio esté libre de interrupciones o errores. No nos hacemos responsables por
        decisiones tomadas exclusivamente con base en la información publicada aquí, sin confirmación directa
        con nuestro equipo.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Para preguntas sobre estos términos, escríbenos a{" "}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.
      </p>

      <p className="text-xs">
        Este documento es un borrador de referencia y no reemplaza la asesoría de un abogado. Revísalo con tu
        equipo legal antes de publicarlo.
      </p>
    </LegalPage>
  );
}
