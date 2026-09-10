const fs = require('fs');
let html = fs.readFileSync('/Users/gustavohenriquecastellano/filximoveis-assets/home.html', 'latin1');

function dec(s) {
  return (s || '')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&acirc;/g, 'â')
    .replace(/&ecirc;/g, 'ê').replace(/&ocirc;/g, 'ô').replace(/&atilde;/g, 'ã')
    .replace(/&otilde;/g, 'õ').replace(/&ccedil;/g, 'ç')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Oacute;/g, 'Ó')
    .replace(/&Iacute;/g, 'Í').replace(/&Uacute;/g, 'Ú').replace(/&Atilde;/g, 'Ã')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&ordm;/g, 'º').replace(/&sup2;/g, '²').replace(/&#39;/g, "'").replace(/&hellip;/g, '…')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

const cards = [];
const seen = new Set();
const re = /<a href="\/imovel\/(\d+)\/([^"]+)"\s+title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
let m;
while ((m = re.exec(html))) {
  const [, code, slug, titleRaw, inner] = m;
  const img = (inner.match(/data-src="(https:\/\/imgs2[^"]+)"/) || inner.match(/data-lazy="(https:\/\/imgs2[^"]+)"/) || [])[1];
  if (!img || seen.has(code)) continue;
  seen.add(code);
  const t = dec(titleRaw);
  const typeM = inner.match(/class="[^"]*item__name[^"]*"[^>]*>([\s\S]*?)<\/h3>/) || inner.match(/<h3(?![^>]*ft_cidade)[^>]*>([\s\S]*?)<\/h3>/);
  const type = typeM ? dec(typeM[1]) : (t.split(' para ')[0] || '');
  const locM = inner.match(/class="[^"]*item__location[^"]*"[^>]*>([\s\S]*?)<\/p>/) || inner.match(/class="ft_cidade"[^>]*>([\s\S]*?)<\/h3>/);
  const city = locM ? dec(locM[1]) : '';
  const descM = inner.match(/class="[^"]*item__description[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  const desc = descM ? dec(descM[1]).replace(/…$|\.\.\.$/, '') : '';
  const priceM = inner.match(/R\$\s?([\d.]+)/);
  const price = priceM ? 'R$ ' + priceM[1] : '';
  const spec = (r) => { const x = t.match(r); return x ? parseInt(x[1]) : null; };
  const areaM = t.match(/([\d.,]+)\s*m²/) || t.match(/([\d.,]+)\s*m2/);
  cards.push({
    code, slug, url: `https://www.filximoveis.com.br/imovel/${code}/${slug}`,
    title: t, type, city, price, desc,
    dorm: spec(/(\d+)\s*dormit/), banho: spec(/(\d+)\s*banheiro/),
    suite: spec(/(\d+)\s*su[ií]te/), vaga: spec(/(\d+)\s*vaga/),
    area: areaM ? areaM[1] : null,
    img,
  });
}

fs.writeFileSync('/Users/gustavohenriquecastellano/filximoveis-assets/properties.json', JSON.stringify(cards, null, 2));
console.log('parsed', cards.length, 'properties\n');
console.log(cards.map((c) => `${c.code} | ${c.type.padEnd(11)} | ${(c.city||'?').padEnd(28)} | ${(c.price||'?').padEnd(14)} | d${c.dorm||'-'} b${c.banho||'-'} s${c.suite||'-'} v${c.vaga||'-'} ${c.area||''}`).join('\n'));
