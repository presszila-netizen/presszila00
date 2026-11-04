import { services, faqs, processSteps, testimonials, agencyMetrics } from './content.mjs';
import { servicePages } from './service-content.mjs';
import { SITE_ORIGIN, DEFAULT_IMAGE, structuredData } from './seo.mjs';
import { WEB3FORMS_ACCESS_KEY } from './form-config.mjs';

export const arrow = '<svg class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const diagonal = '<svg class="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const star = '<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="m50 0 8 31 27-16-16 27 31 8-31 8 16 27-27-16-8 31-8-31-27 16 16-27L0 50l31-8-16-27 27 16Z"/></svg>';
export const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
export const button = (text, href, secondary = false) => `<a class="button${secondary ? ' button-secondary' : ''}" href="${href}">${text}${arrow}</a>`;
export const eyebrow = text => `<p class="eyebrow"><span aria-hidden="true"></span>${text}</p>`;
export const breadcrumbNav = crumbs => `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.map((crumb,index) => `<li>${index === crumbs.length - 1 ? `<span aria-current="page">${escape(crumb.name)}</span>` : `<a href="${escape(crumb.href)}">${escape(crumb.name)}</a>`}</li>`).join('')}</ol></nav>`;

// Original editorial photographs are illustrative, not client placements.
export function editorialPhoto(name, alt = '', className = '', eager = false) {
  const dimensions = { hero:[1400,1050], story:[1122,1402], journal:[1400,1050], contact:[1400,1050], creator:[1400,1050], launch:[1400,1050] };
  const [width,height] = dimensions[name];
  return `<img class="${className}" src="/assets/images/editorial-${name}.webp" alt="${escape(alt)}" width="${width}" height="${height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

export function serviceIcon(id) {
  const paths = {
    'digital-pr':'<path d="m4 10 12-5v14L4 14v-4Z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2M6 15l1 5h4l-2-4M4 10H2v4h2"/>',
    'media-relations':'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 8h4v4H7zM14 8h3M14 12h3M7 16h10"/>',
    'brand-strategy':'<path d="m12 2 9 10-9 10L3 12 12 2Z"/><path d="m12 7 4 5-4 5-4-5 4-5Z"/>',
    'content-storytelling':'<path d="m14 5 5 5M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15l-1 5Z"/><path d="M13 20h7"/>',
    'reputation-management':'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    'creator-relations':'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5v1"/>',
    'launch-campaigns':'<path d="M14 4c3-2 7-1 7-1s1 4-1 7L11 19l-6-6 9-9Z"/><circle cx="16" cy="8" r="1.5"/><path d="m8 10-5 1-1 5 4-1M14 17l-1 5 5-1 1-5M7 18l-4 3"/>',
    'social-creative':'<path d="M20 13a7 7 0 0 1-7 7H5l-4 3V10a7 7 0 0 1 7-7h5a7 7 0 0 1 7 7v3Z"/><path d="m9 8 5 4-5 4V8Z"/>',
  };
  return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id] || paths['brand-strategy']}</svg>`;
}

export function publicationSlider() {
  const publications = [
    '<img src="/assets/images/forbes.png" alt="Forbes" width="1000" height="281" loading="lazy">',
    '<img src="/assets/images/enter3.png" alt="Entrepreneur" width="203" height="44" loading="lazy">',
    '<span class="publication-name business-insider">BUSINESS<br>INSIDER</span>',
    '<span class="publication-name fortune">FORTUNE</span>',
    '<span class="publication-name reuters"><span aria-hidden="true">◉</span> REUTERS</span>',
    '<span class="publication-name usa"><span aria-hidden="true">●</span> USA TODAY</span>',
    '<img src="/assets/images/msn.png" alt="MSN" width="342" height="147" loading="lazy">',
  ];
  const group = duplicate => `<div class="publication-group" ${duplicate ? 'aria-hidden="true" inert' : 'role="list" aria-label="Publications"'}>${publications.map((logo,index) => `<span class="publication-slot${index === 6 ? ' publication-msn' : ''}"${duplicate ? '' : ' role="listitem"'}>${logo}</span>`).join('')}</div>`;
  return `<section class="media-section" aria-label="Publication possibilities"><div class="container">
    <div class="media-heading"><p class="eyebrow">THE MEDIA LANDSCAPE</p><div class="media-controls"><p>The right story. A relevant audience.</p><button class="icon-button publication-toggle" type="button" aria-label="Pause publication slider" aria-pressed="false" aria-controls="publication-track" hidden><svg class="pause-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 4v12M13 4v12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><svg class="play-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 9 6-9 6V4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button></div></div>
    <div class="publication-logos" role="group" aria-label="Publication logos. Focus here to pause the slider." tabindex="0"><div class="publication-track" id="publication-track">${group(false)}${group(true)}</div></div>
    <p class="media-note">Publication options are discussed around your story, audience, and agreed scope.</p>
  </div></section>`;
}

export function logo(className = '') {
  return `<a class="brand ${className}" href="/index.html" aria-label="PRESSZILA home"><span class="brand-mark" aria-hidden="true"><img class="brand-symbol" src="/assets/images/logo2.png" alt="" width="500" height="500"><img class="brand-blue" src="/assets/images/logo2.png" alt="" width="500" height="500"></span><span class="brand-wordmark" aria-hidden="true"><span class="brand-name"><img src="/assets/images/logo2.png" alt="" width="500" height="500"></span><small>VISIBILITY WITH INTELLIGENCE</small></span></a>`;
}

export function header(active) {
  const links = [['about.html','About'],['solutions.html','Services'],['case-studies.html','Our approach'],['testimonials.html','Testimonials'],['blogs.html','Journal'],['contact.html','Contact']];
  return `<header class="site-header" id="site-header"><div class="container header-inner">
    ${logo()}
    <nav class="primary-nav" id="primary-nav" aria-label="Main navigation">
      <div class="nav-links">${links.map(([page,label]) => `<a href="/${page}"${active === page ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div>
      ${button('Get Featured','/quote.html')}
      <a class="mobile-email" href="mailto:contact@presszila.com">contact@presszila.com ${diagonal}</a>
    </nav>
    <div class="header-controls"><button class="icon-button theme-toggle" type="button" aria-label="Switch to dark theme" aria-pressed="false" hidden><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="moon" d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z" stroke="currentColor" stroke-width="1.5"/><g class="sun" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></g></svg></button>
    <button class="icon-button menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span></button></div>
  </div></header><button class="menu-backdrop" tabindex="-1" aria-label="Close navigation" hidden></button>`;
}

export function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-top">
    <div class="footer-intro">${logo('footer-logo')}<p>Good stories deserve<br>a bigger audience.</p><a class="footer-email" href="mailto:contact@presszila.com">contact@presszila.com ${diagonal}</a></div>
    <div class="footer-links"><div><p class="footer-label">Explore</p><a href="/about.html">About PRESSZILA</a><a href="/solutions.html">Our services</a><a href="/case-studies.html">Our approach</a><a href="/blogs.html">The journal</a><a href="/testimonials.html">Testimonials</a></div>
    <div><p class="footer-label">Let’s talk</p><a href="/quote.html">Get featured ${diagonal}</a><a href="/contact.html">Contact us</a><p class="footer-label social-label">Follow the story</p><a href="https://www.linkedin.com/company/presszila-pr/" target="_blank" rel="noopener noreferrer">LinkedIn ${diagonal}</a><a href="https://www.instagram.com/presszila?stkn=a3RuaDZqZXMzZGkw" target="_blank" rel="noopener noreferrer">Instagram ${diagonal}</a><a href="https://www.facebook.com/share/1Dha5wkRme/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Facebook ${diagonal}</a></div></div>
  </div><div class="footer-signature" aria-hidden="true"><span>PRESSZILA</span><span class="footer-signature-mark">${star}</span></div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} PRESSZILA. All rights reserved.</span><span>Digital PR. Real perspective.</span><a href="#top">Back to top ↑</a></div></div></footer>`;
}

export function finalCTA() {
  return `<section class="final-cta"><span class="cta-decoration" aria-hidden="true">${star}</span><div class="container final-cta-inner"><div data-reveal>${eyebrow('YOUR NEXT CHAPTER')}<h2>Let’s make your<br>story <em>travel.</em></h2><p>Bring your ambition. We’ll help you find the words,<br class="desktop-break"> the direction, and the right opportunity.</p></div><div class="cta-action" data-reveal><a class="circle-cta" href="/quote.html" aria-label="Get featured — tell us your story">${diagonal}<span>Get Featured</span></a><a class="text-link" href="/contact.html">Start a conversation ${arrow}</a></div></div></section>`;
}

export function page({file, title, description, content, cta = true, noindex = false, article = null, service = null, breadcrumbs = null, socialImage = DEFAULT_IMAGE}) {
  const canonical = `${SITE_ORIGIN}/${file === 'index.html' ? '' : file}`;
  const imageUrl = `${SITE_ORIGIN}${socialImage.path}`;
  const faqItems = file === 'index.html' ? faqs : service?.questions;
  const schema = noindex ? '' : structuredData({canonical,title,description,image:socialImage,article,service,breadcrumbs,faqItems});
  return `<!doctype html><html lang="en" data-theme="light"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark">
    <title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${canonical}">${noindex ? '<meta name="robots" content="noindex, follow">' : ''}
    <meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:site_name" content="PRESSZILA"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="${socialImage.width}"><meta property="og:image:height" content="${socialImage.height}"><meta property="og:image:alt" content="${escape(socialImage.alt)}">${article ? `<meta property="article:published_time" content="${article.date}">` : ''}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${imageUrl}"><meta name="twitter:image:alt" content="${escape(socialImage.alt)}">
    <link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/images/favicon-48.png" type="image/png" sizes="48x48"><link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" sizes="180x180"><link rel="preload" href="/assets/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/newsreader-italic-latin.woff2" as="font" type="font/woff2" crossorigin>
    <script src="/assets/js/theme.js"></script><link rel="stylesheet" href="/assets/css/style.css"><script src="/assets/js/script.js" defer></script>
    ${schema ? `<script type="application/ld+json">${schema}</script>` : ''}
  </head><body id="top"><a class="skip-link" href="#main">Skip to content</a>${header(file)}<main id="main" tabindex="-1">${content}${cta ? finalCTA() : ''}${!['contact.html','quote.html','404.html'].includes(file) ? '<aside class="mobile-inquiry" aria-label="Start your PR brief" hidden><div><span>YOUR NEXT CHAPTER</span><strong>Let’s tell your story.</strong></div>'+button('Get Featured','/quote.html')+'</aside>' : ''}</main>${footer()}</body></html>`;
}

export function intro(label, headline, text, extra = '') {
  return `<section class="page-intro"><div class="container">${eyebrow(label)}<div class="intro-grid"><h1>${headline}</h1><div class="intro-copy"><p>${text}</p>${extra}</div></div></div></section>`;
}

export function serviceRows(items = services.slice(0,4)) {
  const visuals = ['journal','creator','story','launch'];
  return `<div class="service-list">${items.map((service, index) => `<a class="service-row" href="${servicePages.some(page => page.id === service.id) ? `/services/${service.id}.html` : `/solutions.html#${service.id}`}" data-reveal><span class="row-number" aria-hidden="true">${serviceIcon(service.id)}</span><div class="service-row-name"><h3>${escape(service.name)}</h3><span>0${index + 1} / ${service.type}</span></div><p>${service.short}</p><span class="service-row-photo" aria-hidden="true">${editorialPhoto(visuals[index % visuals.length],'','')}</span><span class="round-arrow">${diagonal}</span></a>`).join('')}</div>`;
}

export function processSection() {
  return `<section class="section process-section" id="process"><div class="container"><div class="section-heading" data-reveal><div>${eyebrow('FROM FIRST WORD TO WHAT’S NEXT')}<h2>A clear path.<br><em>A stronger story.</em></h2></div><p>Thoughtful at every step.<br>Focused on where you want to go.</p></div><ol class="process-list">${processSteps.map(([name,text],i) => `<li data-reveal style="--reveal-delay:${i*65}ms"><span class="process-number">0${i+1}<span aria-hidden="true">${arrow}</span></span><h3>${name}</h3><p>${text}</p></li>`).join('')}</ol></div></section>`;
}

export function impactSection() {
  return `<section class="impact-section" aria-labelledby="impact-heading"><div class="container"><div class="impact-banner"><div class="impact-intro">${eyebrow('PRESSZILA IN NUMBERS')}<h2 id="impact-heading">A wider world<br>of <em>stories.</em></h2><p>Every number is a story, a connection, and a chance to be seen.</p></div><div class="impact-art" aria-hidden="true">${editorialPhoto('journal','','impact-photo')}</div></div><ul class="impact-grid">${agencyMetrics.map((metric,index)=>`<li class="impact-card" data-reveal style="--reveal-delay:${index*65}ms"><p class="impact-number"><span class="visually-hidden">${metric.spoken}</span><span aria-hidden="true" data-count-to="${metric.value}" data-count-decimals="${metric.decimals || 0}">${metric.display}</span><span aria-hidden="true">${metric.suffix}</span></p><h3>${metric.label}</h3><p>${metric.description}</p></li>`).join('')}</ul></div></section>`;
}

export function testimonialsSection(full = false) {
  const cards = testimonials.map((review, index) => {
    const excerpt = !full && review.paragraphs.length > 1;
    const paragraphs = full ? review.paragraphs : review.paragraphs.slice(0, 1);
    return `<article class="testimonial-card" id="review-${review.id}" data-reveal style="--reveal-delay:${index * 65}ms"><div class="testimonial-top"><span class="testimonial-stars" role="img" aria-label="5 out of 5 stars"><span aria-hidden="true">★★★★★</span></span><span class="testimonial-quote-mark" aria-hidden="true">“</span></div><blockquote class="testimonial-quote">${paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</blockquote><div class="testimonial-author"><span class="testimonial-avatar" aria-hidden="true">${review.initials}</span><div><cite>${escape(review.name)}</cite><span>Trustpilot · October 2026</span></div></div><div class="testimonial-actions"><a href="${review.source}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escape(review.name)}’s review on Trustpilot">Read on Trustpilot ${diagonal}</a>${excerpt ? `<a href="/testimonials.html#review-${review.id}">Read full review ${arrow}</a>` : ''}</div></article>`;
  }).join('');
  return `<section class="section testimonials-section ${full ? 'testimonials-full' : 'testimonials-preview'}" id="testimonials"><div class="container"><div class="section-heading" data-reveal><div>${eyebrow('CLIENT PERSPECTIVES')}<h2>In their<br><em>own words.</em></h2></div>${full ? '<p>Thoughts shared by clients about their experience with PRESSZILA.</p>' : `<a class="text-link" href="/testimonials.html#testimonials">Read all reviews ${arrow}</a>`}</div><div class="testimonial-grid">${cards}</div></div></section>`;
}

export function faqSection() {
  return `<section class="section faq-section"><div class="container faq-layout"><div data-reveal>${eyebrow('A LITTLE MORE CLARITY')}<h2>Good questions.<br><em>Clear answers.</em></h2><p>Have something else in mind?</p><a class="text-link" href="/contact.html">Let’s talk ${arrow}</a></div><div class="faq-list">${faqs.map(([question,answer],index) => `<details class="faq"><summary aria-controls="faq-${index}"><span>${question}</span><span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-answer" id="faq-${index}"><p>${answer}</p></div></details>`).join('')}</div></div></section>`;
}

export function editorialVisual() {
  return `<figure class="editorial-visual"><div class="visual-grid" aria-hidden="true"></div><div class="visual-index" aria-hidden="true"><span>THE PRESSZILA EDIT</span><span>VOL. 01</span></div>
  <div class="magazine magazine-back" aria-hidden="true"><span>STORY / STRATEGY / VISIBILITY</span></div>
  <div class="magazine magazine-front">${editorialPhoto('hero','An editorial portrait of a professional in a contemporary studio.','hero-photo',true)}<div class="hero-photo-label" aria-hidden="true"><span>A STORY WORTH TELLING</span><strong>A bigger<br><em>audience.</em></strong></div></div>
  <div class="visual-seal" aria-hidden="true"><span>WORTH<br>TALKING<br>ABOUT.</span>${diagonal}</div><div class="visual-note" aria-hidden="true">Your story. In focus. ${diagonal}</div><figcaption><span class="caption-line"></span>STORY. STRATEGY. VISIBILITY.</figcaption></figure>`;
}

export function inquiryForm(kind = 'contact') {
  const quote = kind === 'quote';
  const useWeb3Forms = Boolean(WEB3FORMS_ACCESS_KEY);
  const subject = quote ? 'New Quote Request - PRESSZILA' : 'New Contact Form Message - PRESSZILA';
  const field = (id, label, type = 'text', required = false, autocomplete = '') => `<div class="field"><label for="${id}">${label}${required ? ' <span aria-hidden="true">*</span>' : ' <span class="optional">(optional)</span>'}</label><input id="${id}" name="${id}" type="${type}" ${required ? 'required' : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''} maxlength="${id === 'email' ? 254 : 160}" aria-describedby="${id}-error"><span class="field-error" id="${id}-error"></span></div>`;
  const select = (id,label,options,required=false) => `<div class="field ${['service','timeline'].includes(id)?'full':''}"><label for="${id}">${label}${required?' <span aria-hidden="true">*</span>':' <span class="optional">(optional)</span>'}</label><select id="${id}" name="${id}" ${required?'required':''} aria-describedby="${id}-error"><option value="">${id==='service'?'Select a service':'Select an option'}</option>${options.map(value => `<option>${escape(value)}</option>`).join('')}</select><span class="field-error" id="${id}-error"></span></div>`;
  return `<form class="inquiry-form" action="${useWeb3Forms ? 'https://api.web3forms.com/submit' : 'https://formsubmit.co/contact@presszila.com'}" method="POST"${useWeb3Forms ? ' data-provider="web3forms"' : ''} aria-labelledby="form-heading">
    ${useWeb3Forms ? `<input type="hidden" name="access_key" value="${escape(WEB3FORMS_ACCESS_KEY)}"><input type="hidden" name="subject" value="${subject}"><input type="hidden" name="from_name" value="PRESSZILA"><input type="hidden" name="redirect" value="https://web3forms.com/success"><input type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" aria-hidden="true">` : `<input type="hidden" name="_subject" value="${subject}"><input type="hidden" name="_template" value="table">`}
    <div class="form-heading"><h2 id="form-heading">${quote?'Tell us your story.':'A good place to start.'}</h2><p>Fields marked <span aria-hidden="true">*</span> are required.</p></div>
    <div class="form-grid">${field('name','Your name','text',true,'name')}${field('email','Email address','email',true,'email')}${field('company','Company / brand','text',false,'organization')}${field('phone','Phone number','tel',false,'tel')}
    ${select('service','What can we help with?',services.map(service=>service.name==='Launch Campaigns'?'Launch Campaign':service.name),quote)}
    ${quote ? select('timeline','Your preferred timing',['ASAP','Within 2 weeks','Within 1 month','1–3 months','Flexible']) : ''}
    <div class="field full"><label for="message">${quote?'Project details':'Your message'} <span aria-hidden="true">*</span></label><textarea name="message" id="message" rows="5" required maxlength="8000" aria-describedby="message-hint message-error" placeholder="Tell us about your brand, your goals, and what you have in mind."></textarea><span class="field-hint" id="message-hint">A little context helps us start a useful conversation.</span><span class="field-error" id="message-error"></span></div></div>
    <div class="form-status" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></div><div class="form-bottom"><button class="button" type="submit"><span>${quote?'Request a Quote':'Send Message'}</span>${arrow}</button><p>Prefer email? <a href="mailto:contact@presszila.com">Write to us ${diagonal}</a></p></div>
    <noscript><p class="form-note">Your message will continue through our form service for verification and confirmation.</p></noscript>
  </form>`;
}
