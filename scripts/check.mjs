import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { SITE_ORIGIN } from '../src/seo.mjs';
import { faqs } from '../src/content.mjs';
import { servicePages } from '../src/service-content.mjs';
import { WEB3FORMS_ACCESS_KEY } from '../src/form-config.mjs';
const root = resolve('dist');
const issues = [];
async function list(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? list(join(directory,entry.name)) : join(directory,entry.name)))).flat();
}
const files = (await list(root)).filter(file => file.endsWith('.html'));
const contents = new Map(await Promise.all(files.map(async file => [file,await readFile(file,'utf8')])));
let linkCount = 0;
const indexableCanonicals = new Set();
const titles = new Set();
const descriptions = new Set();
for (const [file,html] of contents) {
  const label = file.slice(root.length + 1);
  if ((html.match(/<h1[\s>]/g)||[]).length !== 1) issues.push(`${label}: expected one h1`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  const expectedCanonical = `${SITE_ORIGIN}/${label === 'index.html' ? '' : label}`;
  if (canonical !== expectedCanonical) issues.push(`${label}: missing or unexpected canonical`);
  if (!title || titles.has(title)) issues.push(`${label}: missing or duplicate title`); else titles.add(title);
  if (!description || descriptions.has(description)) issues.push(`${label}: missing or duplicate description`); else descriptions.add(description);
  if (!html.includes('<link rel="icon" href="/favicon.ico" sizes="any">') || !html.includes('<link rel="icon" href="/assets/images/favicon-48.png" type="image/png" sizes="48x48">') || !html.includes('<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" sizes="180x180">')) issues.push(`${label}: missing a PRESSZILA favicon declaration`);
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  if (label === '404.html' && !noindex) issues.push(`${label}: 404 page must be noindex`);
  if (!noindex && canonical) indexableCanonicals.add(canonical);
  const socialImage = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
  const twitterImage = html.match(/<meta name="twitter:image" content="([^"]+)"/i)?.[1];
  if (!socialImage || !html.includes('<meta name="twitter:card"') || socialImage !== twitterImage) issues.push(`${label}: missing or inconsistent social preview metadata`);
  if (socialImage) {
    try {
      const imageUrl = new URL(socialImage);
      if (imageUrl.origin !== SITE_ORIGIN) throw new Error('Unexpected social image origin');
      await stat(join(root,decodeURIComponent(imageUrl.pathname)));
    } catch { issues.push(`${label}: social image is missing or not on the canonical origin`); }
  }
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (!noindex && scripts.length !== 1) issues.push(`${label}: expected one structured data graph`);
  for (const script of scripts) {
    try {
      const data = JSON.parse(script[1]);
      const graph = data['@graph'];
      if (data['@context'] !== 'https://schema.org' || !Array.isArray(graph) || !graph.some(item => item['@type'] === 'WebPage' && item.url === canonical)) issues.push(`${label}: structured data is missing the canonical WebPage`);
      if (label.startsWith('journal/') && !graph.some(item => item['@type'] === 'BlogPosting')) issues.push(`${label}: missing article structured data`);
      if (label.startsWith('services/') && (!graph.some(item => item['@type'] === 'Service') || !graph.some(item => item['@type'] === 'BreadcrumbList'))) issues.push(`${label}: missing service or breadcrumb structured data`);
      const expectedFaq = label === 'index.html' ? faqs : servicePages.find(page => label === `services/${page.id}.html`)?.questions;
      if (expectedFaq) {
        const faq = graph.find(item => item['@type'] === 'FAQPage');
        const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        const htmlEscape = value => value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
        if (!faq || faq.mainEntity?.length !== expectedFaq.length || expectedFaq.some(([question,answer],index) => faq.mainEntity[index]?.name !== question || faq.mainEntity[index]?.acceptedAnswer?.text !== answer || !visible.includes(htmlEscape(question)) || !visible.includes(htmlEscape(answer)))) issues.push(`${label}: FAQ structured data does not match its visible questions and answers`);
      }
    } catch { issues.push(`${label}: invalid JSON-LD`); }
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if (new Set(ids).size !== ids.length) issues.push(`${label}: duplicate ids`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const destination = match[1].replaceAll('&amp;','&');
    if (/^(https?:|mailto:|tel:|data:)/.test(destination)) continue;
    const url = new URL(destination, `https://presszila.com/${label}`);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const target = join(root,decodeURIComponent(path));
    linkCount++;
    try {
      await stat(target);
      if (url.hash && contents.has(target) && !contents.get(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) issues.push(`${label}: missing anchor ${destination}`);
    } catch { issues.push(`${label}: missing asset or page ${destination}`); }
  }
  for (const match of html.matchAll(/<img\b[^>]+>/g)) {
    if (!/\balt="/.test(match[0])) issues.push(`${label}: image without alt`);
    if (!/\bwidth="/.test(match[0]) || !/\bheight="/.test(match[0])) issues.push(`${label}: image without reserved dimensions`);
  }
}
const legacy = ['index.html','about.html','solutions.html','case-studies.html','testimonials.html','blogs.html','contact.html','quote.html'];
for (const path of legacy) if (!contents.has(join(root,path))) issues.push(`Missing legacy public URL: ${path}`);
const contact = contents.get(join(root,'contact.html'));
const quote = contents.get(join(root,'quote.html'));
if (WEB3FORMS_ACCESS_KEY) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(WEB3FORMS_ACCESS_KEY)) issues.push('Web3Forms access key must be a valid form ID');
  for (const [label, html, subject] of [['Contact', contact, 'New Contact Form Message - PRESSZILA'], ['Quote', quote, 'New Quote Request - PRESSZILA']]) {
    if (!html.includes('action="https://api.web3forms.com/submit"') || !html.includes(`name="access_key" value="${WEB3FORMS_ACCESS_KEY}"`) || !html.includes(`name="subject" value="${subject}"`) || !html.includes('name="redirect" value="https://web3forms.com/success"')) issues.push(`${label} form is missing the Web3Forms destination or message settings`);
  }
} else {
  if (!contact.includes('action="https://formsubmit.co/contact@presszila.com"') || !contact.includes('name="_subject"') || !contact.includes('name="_template"')) issues.push('Contact form destination or settings are incorrect');
  if (!quote.includes('action="https://formsubmit.co/contact@presszila.com"') || !quote.includes('name="_subject" value="New Quote Request - PRESSZILA"') || !quote.includes('name="_template" value="table"')) issues.push('Quote form is missing the FormSubmit destination or message settings');
}
if (/\b(?:id|name)="budget"/i.test(quote)) issues.push('Quote form still contains the removed budget field');
const sitemap = await readFile(join(root,'sitemap.xml'),'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length || sitemapUrls.length !== indexableCanonicals.size || sitemapUrls.some(url => !indexableCanonicals.has(url))) issues.push('Sitemap must contain each indexable canonical exactly once');
const robots = await readFile(join(root,'robots.txt'),'utf8');
if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) issues.push('robots.txt is missing the canonical sitemap');
for (const agent of ['OAI-SearchBot','Claude-SearchBot','PerplexityBot']) if (!robots.includes(`User-agent: ${agent}`)) issues.push(`robots.txt: missing the ${agent} search crawler`);
for (const agent of ['GPTBot','ClaudeBot']) if (!robots.includes(`User-agent: ${agent}\nDisallow: /`)) issues.push(`robots.txt: training opt-out missing for ${agent}`);
for (const [path, size] of [['assets/images/favicon-48.png',48],['assets/images/apple-touch-icon.png',180]]) {
  const image = await readFile(join(root,path));
  if (image.subarray(0,8).toString('hex') !== '89504e470d0a1a0a' || image.readUInt32BE(16) !== size || image.readUInt32BE(20) !== size) issues.push(`${path}: expected a square ${size}px PNG`);
}
const favicon = await readFile(join(root,'favicon.ico'));
const iconSizes = favicon.length >= 6 ? Array.from({length:favicon.readUInt16LE(4)}, (_, index) => favicon[6 + index * 16]) : [];
if (favicon.subarray(0,4).toString('hex') !== '00000100' || ![16,32,48].every(size => iconSizes.includes(size))) issues.push('favicon.ico must contain 16px, 32px, and 48px icons');
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${files.length} pages, ${linkCount} local links/assets, legacy URLs, unique metadata, FAQ structured data, crawler rules, sitemap, icon dimensions, and form destinations.`);
