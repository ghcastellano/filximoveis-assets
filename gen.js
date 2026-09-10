const fs = require('fs');
const props = require('./properties.json');
const IMG_DIR = '/Users/gustavohenriquecastellano/filximoveis/public/imoveis';
const files = fs.readdirSync(IMG_DIR);
const extOf = (code) => {
  const f = files.find((x) => x.startsWith(code + '.'));
  return f ? f.slice(code.length) : '.jpg';
};

// widescreen / high-res photos worth featuring
const FEATURED = new Set([
  '2887785', '3343519', '3345086', '2732523', '2961080', '2688507', '2667721', '2586006',
]);

// Clean truncated CMS descriptions: decode leftover entities, drop trailing
// partial entity/fragment, keep only complete sentences.
function cleanDesc(s) {
  if (!s) return '';
  s = s
    .replace(/&agrave;/g, 'à').replace(/&egrave;/g, 'è').replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò').replace(/&ugrave;/g, 'ù')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
    .replace(/&acirc;/g, 'â').replace(/&ecirc;/g, 'ê').replace(/&ocirc;/g, 'ô')
    .replace(/&atilde;/g, 'ã').replace(/&otilde;/g, 'õ').replace(/&ccedil;/g, 'ç')
    .replace(/&ordm;/g, 'º').replace(/&sup2;?/g, '²').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&hellip;/g, '…');
  // strip a trailing partial entity with no semicolon (e.g. "C&ocir")
  s = s.replace(/&[a-zA-Z]{1,8};?\s*$/g, '').trim();
  // remove trailing ellipsis/dots
  s = s.replace(/[.…]+\s*$/g, '').trim();
  // keep only up to the last complete sentence punctuation
  const m = s.match(/^[\s\S]*[.!?]/);
  s = m ? m[0].trim() : (s.length >= 60 ? s.trim() + '.' : '');
  // drop any remaining stray entities in the middle
  s = s.replace(/&[a-zA-Z]{1,8};/g, '').replace(/\s{2,}/g, ' ').trim();
  return s;
}

const norm = (p) => {
  const [cidade, ...rest] = (p.city || '').split(',').map((s) => s.trim());
  const bairro = rest.join(', ');
  const price = parseInt((p.price || '').replace(/[^\d]/g, '')) || 0;
  const tipo = p.type || 'Imóvel';
  return {
    code: p.code,
    slug: p.slug,
    url: p.url,
    tipo,
    cidade: cidade || 'Itanhaém',
    bairro: bairro || '',
    price,
    priceLabel: price ? 'R$ ' + price.toLocaleString('pt-BR') : 'Consulte',
    dorm: p.dorm || null,
    banho: p.banho || null,
    suite: p.suite || null,
    vaga: p.vaga || null,
    area: p.area || null,
    desc: cleanDesc(p.desc),
    img: `/imoveis/${p.code}${extOf(p.code)}`,
    featured: FEATURED.has(p.code),
  };
};

const data = props.map(norm);

const header = `// Imóveis reais da Oliveira FILX Imóveis — dados e fotos capturados de filximoveis.com.br.
// Prototipo de apresentacao. Precos e detalhes conforme o anuncio original.

export type Property = {
  code: string;
  slug: string;
  url: string;
  tipo: string;
  cidade: string;
  bairro: string;
  price: number;
  priceLabel: string;
  dorm: number | null;
  banho: number | null;
  suite: number | null;
  vaga: number | null;
  area: string | null;
  desc: string;
  img: string;
  featured: boolean;
};

export const PROPERTIES: Property[] = ${JSON.stringify(data, null, 2)};

export const CIDADES = [...new Set(PROPERTIES.map((p) => p.cidade))].sort();
export const TIPOS = [...new Set(PROPERTIES.map((p) => p.tipo))].sort();
`;

fs.writeFileSync('/Users/gustavohenriquecastellano/filximoveis/lib/properties.ts', header);
console.log('wrote lib/properties.ts with', data.length, 'properties');
console.log('featured:', data.filter((d) => d.featured).length);
console.log('cidades:', [...new Set(data.map((d) => d.cidade))].join(', '));
console.log('tipos:', [...new Set(data.map((d) => d.tipo))].join(', '));
