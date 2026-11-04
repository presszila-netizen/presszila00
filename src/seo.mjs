// Canonicals deliberately point at the existing public domain, not the private preview.
export const SITE_ORIGIN = 'https://presszila.com';
export const DEFAULT_IMAGE = {
  path: '/assets/images/editorial-hero.webp', width: 1400, height: 1050,
  alt: 'Illustrative editorial portrait for PRESSZILA, a digital PR and branding agency.',
};

export const articleDescriptions = {
  'how-modern-brands-earn-attention': 'Learn how relevance, credible expertise, a clear point of view, and timing can help brands create digital PR stories that connect.',
  'building-stories-journalists-want': 'Explore practical media relations advice for developing relevant story angles, supporting your pitch, and respecting editorial decisions.',
  'turning-ideas-into-narratives': 'Learn how a clear brand narrative connects a central idea with messaging, editorial themes, and consistent communications.',
  'the-calm-before-a-reputation-storm': 'Explore a practical approach to reputation management, from identifying communication risks to preparing facts and responsibilities.',
  'creator-relations-without-the-guesswork': 'Learn how to plan creator partnerships around audience fit, a clear brief, authentic communication, and agreed expectations.',
  'designing-launches-for-momentum': 'Discover how launch strategy, media materials, and consistent messaging can help a new brand or product tell a coherent story.',
};

export function structuredData({ canonical, title, description, image, article, service, breadcrumbs, faqItems }) {
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const webpageId = `${canonical}#webpage`;
  const graph = [
    { '@type':'Organization', '@id':organizationId, name:'PRESSZILA', url:`${SITE_ORIGIN}/`, email:'contact@presszila.com', logo:`${SITE_ORIGIN}/assets/images/logo2.png`, description:'Digital PR, branding, media relations, and professional storytelling.', sameAs:['https://www.linkedin.com/company/presszila-pr/','https://www.instagram.com/presszila'] },
    { '@type':'WebSite', '@id':websiteId, url:`${SITE_ORIGIN}/`, name:'PRESSZILA', publisher:{ '@id':organizationId }, inLanguage:'en' },
    { '@type':'WebPage', '@id':webpageId, url:canonical, name:title, description, isPartOf:{ '@id':websiteId }, inLanguage:'en' },
  ];
  if (article) graph.push({ '@type':'BlogPosting', '@id':`${canonical}#article`, headline:article.title, description, datePublished:article.date, image:`${SITE_ORIGIN}${image.path}`, author:{ '@id':organizationId }, publisher:{ '@id':organizationId }, mainEntityOfPage:{ '@id':webpageId }, inLanguage:'en' });
  if (service) graph.push({ '@type':'Service', '@id':`${canonical}#service`, name:service.name, serviceType:service.name, description, url:canonical, provider:{ '@id':organizationId } });
  if (breadcrumbs?.length) graph.push({ '@type':'BreadcrumbList', itemListElement:breadcrumbs.map((crumb,index)=>({ '@type':'ListItem', position:index+1, name:crumb.name, item:crumb.href.startsWith('https://') ? crumb.href : `${SITE_ORIGIN}${crumb.href}` })) });
  if (faqItems?.length) graph.push({ '@type':'FAQPage', '@id':`${canonical}#faq`, isPartOf:{ '@id':webpageId }, mainEntity:faqItems.map(([question,answer])=>({ '@type':'Question', name:question, acceptedAnswer:{ '@type':'Answer', text:answer } })) });
  return JSON.stringify({ '@context':'https://schema.org', '@graph':graph }).replaceAll('<','\\u003c');
}
