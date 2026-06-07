/**
 * Drapeaux de fonctionnalités selon la configuration disponible.
 *
 * Sans clé PayPal configurée, l'app fonctionne en mode « tout gratuit » :
 * pas d'achats réels, les gemmes se gagnent en jouant. C'est le mode visé
 * pour les versions App Store / Google Play (pas d'In-App Purchase à gérer).
 */
const paypalId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

export const PAYMENTS_ENABLED = paypalId !== "" && !paypalId.startsWith("YOUR_");
