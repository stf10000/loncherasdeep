// Configuración central de Pequedoctor.
// Cambia estos valores antes de publicar. No necesitas editar componentes.
export const AMAZON_KDP_URL =
  "https://www.amazon.com/s?k=De+la+Lactancia+a+la+Mesa";

export const MERIDA_APPOINTMENT_URL =
  "https://wa.me/584247482393?text=Hola%2C%20quiero%20agendar%20una%20evaluaci%C3%B3n%20de%20alergias%20e%20intolerancias%20con%20Pequedoctor.";

// Endpoint que recibe el correo del lead magnet. También puede ser un webhook de
// Make, Zapier, n8n o Formspree. Si queda vacío, el desbloqueo local sigue funcionando.
export const LEAD_WEBHOOK_URL = "https://formspree.io/f/REEMPLAZA_TU_ID";

export const PEQUEDOCTOR_WEBSITE_URL = "https://pequedoctor.wordpress.com/";

export const CONFIG = Object.freeze({
  AMAZON_KDP_URL,
  MERIDA_APPOINTMENT_URL,
  LEAD_WEBHOOK_URL,
  PEQUEDOCTOR_WEBSITE_URL,
});
