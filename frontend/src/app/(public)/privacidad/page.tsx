import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Política de tratamiento de datos | ${SITE_CONFIG.name}`,
  description: "Cómo recolectamos, usamos y protegemos tus datos personales, conforme a la Ley 1581 de 2012.",
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de tratamiento de datos personales" updatedAt="23 de agosto de 2026">
      <p>
        {SITE_CONFIG.name} (en adelante, &quot;nosotros&quot;) es responsable del tratamiento de los datos
        personales que recolecta a través de este sitio web, de acuerdo con la Ley 1581 de 2012, el Decreto
        1377 de 2013 y demás normas que las modifiquen o complementen.
      </p>

      <h2>1. Datos que recolectamos</h2>
      <p>
        Cuando completas un formulario en este sitio (contacto, solicitud de información sobre una propiedad,
        o &quot;vender mi propiedad&quot;), podemos recolectar: nombre, teléfono, correo electrónico, dirección,
        y cualquier información adicional que decidas incluir en el mensaje.
      </p>

      <h2>2. Finalidad del tratamiento</h2>
      <p>Los datos que nos proporcionas se usan exclusivamente para:</p>
      <ul>
        <li>Responder tus solicitudes de información sobre propiedades.</li>
        <li>Contactarte si dejaste tus datos para vender o arrendar un inmueble.</li>
        <li>Dar seguimiento comercial a tu interés, incluyendo contacto por teléfono, correo o WhatsApp.</li>
        <li>Mejorar nuestro servicio de atención al cliente.</li>
      </ul>
      <p>No vendemos ni compartimos tus datos personales con terceros para fines distintos a los aquí descritos.</p>

      <h2>3. Derechos del titular</h2>
      <p>Como titular de tus datos personales, tienes derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Ser informado sobre el uso que se le ha dado a tus datos.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
        <li>Revocar la autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que impida su eliminación.</li>
        <li>Acceder de forma gratuita a tus datos personales que hayan sido objeto de tratamiento.</li>
      </ul>

      <h2>4. Cómo ejercer tus derechos</h2>
      <p>
        Puedes ejercer cualquiera de estos derechos escribiéndonos a{" "}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a> o llamando al{" "}
        <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`}>{SITE_CONFIG.phone}</a>.
      </p>

      <h2>5. Vigencia</h2>
      <p>
        Esta política rige desde su fecha de publicación y permanecerá vigente mientras se mantenga la
        finalidad del tratamiento descrita. Los datos se conservarán durante el tiempo necesario para cumplir
        dicha finalidad, o hasta que el titular solicite su supresión.
      </p>

      <p className="text-xs">
        Este documento es un borrador de referencia y no reemplaza la asesoría de un abogado. Revísalo con tu
        equipo legal antes de publicarlo.
      </p>
    </LegalPage>
  );
}
