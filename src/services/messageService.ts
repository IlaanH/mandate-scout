import { ScoredListing, MessageType, GeneratedMessage } from '@/types/listing';

interface MessageTemplates {
  email: { subject: string; body: string };
  sms: string;
  call_script: string;
}

// Generate personalized messages based on detected signals
export function generateMessage(
  listing: ScoredListing, 
  type: MessageType
): GeneratedMessage {
  const templates = buildTemplates(listing);
  
  let content: string;
  let subject: string | undefined;

  switch (type) {
    case 'email':
      subject = templates.email.subject;
      content = templates.email.body;
      break;
    case 'sms':
      content = templates.sms;
      break;
    case 'call_script':
      content = templates.call_script;
      break;
  }

  return {
    type,
    subject,
    content,
    listing,
    timestamp: new Date()
  };
}

function buildTemplates(listing: ScoredListing): MessageTemplates {
  const { signals, city, address, propertyType, surface, price, dpeClass, daysOnline } = listing;
  
  // Determine main hook based on signals
  const hasDpeFG = signals.some(s => s.id === 'dpe_f' || s.id === 'dpe_g');
  const hasPriceDrop = signals.some(s => s.id === 'price_drop' || s.id === 'multiple_price_drops');
  const isOld = signals.some(s => s.category === 'age');
  const hasMultipleDrops = signals.some(s => s.id === 'multiple_price_drops');

  // Build personalized hooks
  let emailHook = '';
  let smsHook = '';
  let callOpener = '';

  if (hasDpeFG && hasPriceDrop && isOld) {
    emailHook = `Je me permets de vous contacter car votre bien situé ${address || `à ${city}`} présente plusieurs caractéristiques qui méritent attention. Avec les nouvelles réglementations sur les passoires thermiques (DPE ${dpeClass}) et le temps passé sur le marché, il est peut-être temps d'envisager une nouvelle stratégie de vente.`;
    smsHook = `Bonjour, je suis agent immobilier. Votre ${propertyType.toLowerCase()} DPE ${dpeClass} est en ligne depuis ${daysOnline}j. Je peux vous aider à accélérer la vente. Disponible pour en parler ?`;
    callOpener = `Expliquer que vous avez remarqué son annonce en ligne depuis ${daysOnline} jours, et que les contraintes DPE peuvent compliquer la situation. Proposer un accompagnement gratuit.`;
  } else if (hasDpeFG) {
    emailHook = `Je vous contacte au sujet de votre ${propertyType.toLowerCase()} ${address || `à ${city}`}. Avec un DPE ${dpeClass}, vous êtes sans doute informé des nouvelles contraintes réglementaires qui impactent ce type de bien. En tant qu'expert local, je peux vous accompagner pour optimiser votre vente avant les échéances.`;
    smsHook = `Bonjour, agent immobilier à ${city}. Votre bien DPE ${dpeClass} nécessite une stratégie adaptée. Je peux vous aider. Échange rapide possible ?`;
    callOpener = `Mentionner les nouvelles réglementations DPE et leur impact sur la valorisation. Proposer une estimation gratuite tenant compte de ces contraintes.`;
  } else if (hasPriceDrop) {
    const dropContext = hasMultipleDrops ? 'plusieurs baisses de prix' : 'une baisse de prix';
    emailHook = `J'ai remarqué que votre annonce pour le ${propertyType.toLowerCase()} à ${city} a connu ${dropContext}. Cette situation est souvent frustrante pour un vendeur. Je peux vous proposer une nouvelle approche pour toucher les bons acheteurs.`;
    smsHook = `Bonjour, agent à ${city}. J'ai vu la baisse sur votre ${propertyType.toLowerCase()}. Je peux vous aider à trouver le bon acheteur. Intéressé ?`;
    callOpener = `Faire preuve d'empathie sur la difficulté de vendre. Expliquer que vous avez des acheteurs qualifiés correspondant à ce type de bien.`;
  } else if (isOld) {
    emailHook = `Votre ${propertyType.toLowerCase()} est en vente depuis maintenant ${daysOnline} jours. Ce délai peut s'expliquer par plusieurs facteurs : positionnement prix, visibilité, ciblage. Je vous propose un diagnostic gratuit pour relancer efficacement votre vente.`;
    smsHook = `Bonjour, votre annonce à ${city} est en ligne depuis ${daysOnline}j. Un regard expert pourrait aider. Disponible pour un appel rapide ?`;
    callOpener = `Ne pas critiquer les efforts du vendeur. Expliquer que le marché évolue et qu'un nouveau regard peut débloquer la situation.`;
  } else {
    emailHook = `Je vous contacte au sujet de votre ${propertyType.toLowerCase()} à ${city}. En tant qu'agent immobilier spécialisé sur ce secteur, je pense pouvoir vous aider à optimiser votre vente.`;
    smsHook = `Bonjour, agent immobilier à ${city}. Votre ${propertyType.toLowerCase()} m'intéresse. Pouvons-nous échanger ?`;
    callOpener = `Se présenter et expliquer votre expertise locale. Proposer une estimation gratuite.`;
  }

  const priceFormatted = new Intl.NumberFormat('fr-FR').format(price);
  
  return {
    email: {
      subject: `Votre ${propertyType.toLowerCase()} à ${city} - Proposition d'accompagnement`,
      body: `Bonjour,

${emailHook}

Quelques informations sur votre bien :
• ${propertyType} de ${surface}m²
• Prix affiché : ${priceFormatted}€
• Localisation : ${city}

Je suis disponible pour un échange téléphonique de 15 minutes, sans engagement, afin de vous présenter ma méthode de travail et les résultats que je peux obtenir.

Seriez-vous disponible cette semaine ?

Bien cordialement,

[Votre nom]
Agent immobilier
[Téléphone]`
    },
    sms: smsHook,
    call_script: `📞 SCRIPT D'APPEL - ${propertyType} ${city}

🎯 OBJECTIF : Obtenir un RDV de visite/estimation

📋 INFORMATIONS CLÉS :
- Bien : ${propertyType} ${surface}m² à ${priceFormatted}€
- Localisation : ${address || city}
- DPE : ${dpeClass}
- En ligne depuis : ${daysOnline} jours
- Signaux : ${signals.map(s => s.label).join(', ') || 'Standard'}

🗣️ ACCROCHE :
"Bonjour, je suis [Votre nom], agent immobilier à ${city}. Je vous appelle au sujet de votre ${propertyType.toLowerCase()} que vous avez mis en vente."

💡 APPROCHE :
${callOpener}

❓ QUESTIONS CLÉS :
1. "Avez-vous eu beaucoup de visites depuis la mise en vente ?"
2. "Quel est votre délai idéal pour concrétiser cette vente ?"
3. "Avez-vous déjà travaillé avec un agent immobilier ?"

🎁 PROPOSITION DE VALEUR :
- Estimation gratuite et sans engagement
- Connaissance du marché local
- Réseau d'acheteurs qualifiés
- Accompagnement personnalisé

✅ OBJECTIF DE SORTIE :
Proposer un RDV : "Je vous propose de passer voir le bien cette semaine, cela me permettra de vous donner une estimation précise et de vous expliquer comment je peux vous aider. Êtes-vous disponible [jour] à [heure] ?"`
  };
}

// Store for saved messages per listing (in-memory for MVP)
const savedMessages: Map<string, GeneratedMessage[]> = new Map();

export function saveMessage(message: GeneratedMessage): void {
  const listingId = message.listing.id;
  const existing = savedMessages.get(listingId) || [];
  existing.push(message);
  savedMessages.set(listingId, existing);
}

export function getSavedMessages(listingId: string): GeneratedMessage[] {
  return savedMessages.get(listingId) || [];
}
