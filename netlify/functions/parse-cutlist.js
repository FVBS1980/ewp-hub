// Netlify Function — EWP Cut List Parser
// Receives a PDF (as base64), parses it, returns cut list JSON

const https = require('https');

const SKU_MAP = {
  '9-1/2" BCI 6000-1.8 DF':'BCI60009','11-7/8" BCI 6000-1.8 DF':'BCI600011',
  '14" BCI 6000-1.8 DF':'BCI600014','16" BCI 6000-1.8 DF':'BCI600016',
  '11-7/8" BCI 60-2.0 DF':'BCI6011','14" BCI 60-2.0 DF':'BCI6014',
  '16" BCI 60-2.0 DF':'BCI6016','9-1/2" BCI 90-2.0 DF':'BCI909',
  '11-7/8" BCI 90-2.0 DF':'BCI9011','14" BCI 90-2.0 DF':'BCI9014','16" BCI 90-2.0 DF':'BCI9016',
  '3-1/2" x 3-1/2" VERSA-LAM LVL 1.8E 2650 DF':'VC33','3-1/2" x 5-1/4" VERSA-LAM LVL 1.8E 2650 DF':'VC35',
  '3-1/2" x 7" VERSA-LAM LVL 1.8E 2650 DF':'VC37','5-1/4" x 5-1/4" VERSA-LAM LVL 1.8E 2650 DF':'VC55',
  '5-1/4" x 7" VERSA-LAM LVL 1.8E 2650 DF':'VC57','7" x 7" VERSA-LAM LVL 1.8E 2650 DF':'VC77',
  '1-3/4" x 9-1/2" VERSA-LAM LVL 1.8E 2400 DF':'VLSL19','1-3/4" x 11-7/8" VERSA-LAM LVL 1.8E 2400 DF':'VLSL111',
  '1-3/4" x 14" VERSA-LAM LVL 1.8E 2400 DF':'VLSL114','1-3/4" x 9-1/2" VERSA-LAM LVL 2.1E 2800 DF':'VL195',
  '1-3/4" x 11-7/8" VERSA-LAM LVL 2.1E 2800 DF':'VL111','1-3/4" x 14" VERSA-LAM LVL 2.1E 2800 DF':'VL114',
  '1-3/4" x 16" VERSA-LAM LVL 2.1E 2800 DF':'VL116','1-3/4" x 18" VERSA-LAM LVL 2.1E 2800 DF':'VL118',
  '1-3/4" x 20" VERSA-LAM LVL 2.1E 2800 DF':'VL120','1-3/4" x 22" VERSA-LAM LVL 2.1E 2800 DF':'VL122',
  '1-3/4" x 24" VERSA-LAM LVL 2.1E 2800 DF':'VL124','3-1/2" x 11-7/8" VERSA-LAM LVL 1.8E 3100 DF':'VLSL311',
  '3-1/2" x 9-1/2" VERSA-LAM LVL 2.3E 3100 DF':'VL395','3-1/2" x 11-7/8" VERSA-LAM LVL 2.3E 3100 DF':'VL311',
  '3-1/2" x 14" VERSA-LAM LVL 2.3E 3100 DF':'VL314','3-1/2" x 16" VERSA-LAM LVL 2.3E 3100 DF':'VL316',
  '3-1/2" x 18" VERSA-LAM LVL 2.3E 3100 DF':'VL318','3-1/2" x 19" VERSA-LAM LVL 2.3E 3100 DF':'VL319',
  '3-1/2" x 20" VERSA-LAM LVL 2.3E 3100 DF':'VL320','3-1/2" x 22" VERSA-LAM LVL 2.3E 3100 DF':'VL322',
  '3-1/2" x 24" VERSA-LAM LVL 2.3E 3100 DF':'VL324','5-1/4" x 9-1/2" VERSA-LAM LVL 2.3E 3100 DF':'VL59',
  '5-1/4" x 11-7/8" VERSA-LAM LVL 2.3E 3100 DF':'VL511','5-1/4" x 14" VERSA-LAM LVL 2.3E 3100 DF':'VL514',
  '5-1/4" x 16" VERSA-LAM LVL 2.3E 3100 DF':'VL516','5-1/4" x 18" VERSA-LAM LVL 2.3E 3100 DF':'VL518',
  '5-1/4" x 19" VERSA-LAM LVL 2.3E 3100 DF':'VL519','5-1/4" x 20" VERSA-LAM LVL 2.3E 3100 DF':'VL520',
  '5-1/4" x 22" VERSA-LAM LVL 2.3E 3100 DF':'VL522','5-1/4" x 24" VERSA-LAM LVL 2.3E 3100 DF':'VL524',
  '7" x 9-1/2" VERSA-LAM LVL 2.3E 3100 DF':'VL795','7" x 11-7/8" VERSA-LAM LVL 2.3E 3100 DF':'VL711',
  '7" x 14" VERSA-LAM LVL 2.3E 3100 DF':'VL714','7" x 16" VERSA-LAM LVL 2.3E 3100 DF':'VL716',
  '7" x 18" VERSA-LAM LVL 2.3E 3100 DF':'VL718','7" x 19" VERSA-LAM LVL 2.3E 3100 DF':'VL719',
  '7" x 20" VERSA-LAM LVL 2.3E 3100 DF':'VL720','7" x 22" VERSA-LAM LVL 2.3E 3100 DF':'VL722',
  '7" x 24" VERSA-LAM LVL 2.3E 3100 DF':'VL724',
  '1-1/4" x 9-1/2" BC RIM BOARD PLUS OSB':'710016','1-1/4" x 11-7/8" BC RIM BOARD PLUS OSB':'710056',
  '1-1/4" x 14" BC RIM BOARD PLUS OSB':'710076','1-1/4" x 16" BC RIM BOARD PLUS OSB':'71003357',
  'IUS2.37/9.5':'8589072','IUS2.37/11.88':'35945110','IUS2.37/14':'8589078',
  'IUS3.56/9.5':'IUS3.56/9.5','IUS3.56/11.88':'35945123','IUS3.56/14':'46305009',
  'HU3511':'HU3511','HUC410':'35945420','HUC410-2':'HUC410-2','HUC414':'HUC414',
  'HUC610':'35945222','HGUS410':'8589042','HGUS412':'8589043','HGUS414':'8589107',
  'HUCQ610':'35945381','HGUS5.50/10':'8589044','HGUS5.50/12':'8589045',
  'HGUS7.25/10':'8589046','HGUS7.25/12':'8589108','HGUS7.25/14':'8589117',
  'HUS1.81/10':'8589041','3/4" 4x8 OSB (Floor Decking)':'2332OSB'
};

function norm(s){ return s.replace(/[®™©]/g,'').replace(/\s+/g,' ').trim(); }
function getSku(p){ return SKU_MAP[norm(p)] || null; }
function isRim(p){ return /BC RIM BOARD/i.test(p); }
function isJoist(p){ return /BCI/i.test(p) && !isRim(p); }
function isPost(p){ return /VERSA-LAM/i.test(p) && /1\.8E 2650/i.test(p); }
function isBeam(p){ return /VERSA-LAM/i.test(p) && !isPost(p); }
function ignore(p){ return /web stiffener|generic material/i.test(p); }

function parseLines(lines) {
  const SEC_RE = /^(Floor Framing|Floor Accessories|Beams|Posts|Decking|Connectors) - (.+ Floor)$/;
  const DATA_RE = /(\d+) (\d+)' \d+'$/;
  const TAG_RE = /0'- \d+[\d\s/]*["']?\s+(\S+)\s+\d+ \d+'/;
  const CONN_RE = /^([A-Z][A-Z0-9\/.\-]{2,}) .+ (\d+)$/;

  const full = lines.join('\n');
  let project='', builder='', projNum='', dateStr='';
  const m1 = full.match(/File Name: ([\w\s\-]+?)(?= Date:| Misc:|\n)/);
  if(m1) project = m1[1].trim();
  const m2 = full.match(/Builder: ([\w\s,.]+?)(?= Date:| Job|\n)/);
  if(m2) builder = m2[1].trim();
  const m3 = full.match(/Project #: (\S+)/);
  if(m3) projNum = m3[1].trim();
  const m4 = full.match(/Date: (\d+\/\d+\/\d+)/);
  if(m4) dateStr = m4[1].trim();

  const floors = {};
  let curSection=null, curFloor=null, curProduct=null;

  for(const raw of lines){
    const line = raw.trim();
    if(!line) continue;
    if(/^(Product Depth|Subtotal|AJS|BOISE CASCADE|Page \d|\d{2}\/\d{2}\/\d{4}|STUD)/.test(line)) continue;

    const sm = line.match(SEC_RE);
    if(sm){
      curSection=sm[1]; curFloor=sm[2].trim(); curProduct=null;
      if(!floors[curFloor]) floors[curFloor]={rimFt:0,rimSku:'710056',rimProd:'1-1/4" x 11-7/8" BC RIM BOARD PLUS OSB',joists:[],beams:[],posts:[],decking:0,connectors:{},connectorSkus:{}};
      continue;
    }
    if(!curSection) continue;
    const f = floors[curFloor];

    if(curSection==='Decking'){
      const dm = line.match(/3\/4" 4x8 OSB \(Floor Decking\) (\d+)/);
      if(dm) f.decking = parseInt(dm[1]);
      continue;
    }
    if(curSection==='Connectors'){
      const cm = line.match(CONN_RE);
      if(cm){
        const [,prod,qtyStr]=cm; const qty=parseInt(qtyStr);
        if(!ignore(prod)){
          f.connectors[prod]=(f.connectors[prod]||0)+qty;
          const sku=getSku(prod); if(sku) f.connectorSkus[prod]=sku;
        }
      }
      continue;
    }

    const em = line.match(DATA_RE);
    if(!em) continue;
    const qty=parseInt(em[1]), length=parseInt(em[2]);
    const tm = line.match(TAG_RE);
    const tag = tm ? tm[1].replace(/'+$/,'') : '';
    const di = line.indexOf(" 0'- ");

    const processProduct = (prod, qty, length, tag) => {
      if(!prod || ignore(prod)) return;
      const sku = getSku(prod);
      const entry = {product:norm(prod), sku, tag, qty, length};
      if(isRim(prod)){ f.rimFt+=qty*length; const s=getSku(prod); if(s){f.rimSku=s;f.rimProd=norm(prod);} }
      else if(curSection==='Floor Accessories' && isJoist(prod)){ /* ignore */ }
      else if(isJoist(prod)) f.joists.push(entry);
      else if(isPost(prod)) f.posts.push(entry);
      else if(isBeam(prod)) f.beams.push(entry);
    };

    if(di>0){
      const prod = line.slice(0,di).trim();
      curProduct = prod;
      processProduct(prod, qty, length, tag);
    } else if(line.startsWith("0'-") && curProduct){
      processProduct(curProduct, qty, length, tag);
    }
  }
  return { project, builder, projNum, dateStr, floors };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,headers,body:JSON.stringify({error:'Method not allowed'})};

  try {
    const {pdfBase64, fileId, gdriveToken} = JSON.parse(event.body);

    // Download PDF from Google Drive if fileId provided
    let pdfData = pdfBase64;
    if(fileId && gdriveToken){
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${gdriveToken}` }
      });
      if(!resp.ok) throw new Error('Failed to download PDF from Google Drive');
      const buf = await resp.arrayBuffer();
      pdfData = Buffer.from(buf).toString('base64');
    }

    if(!pdfData) return {statusCode:400,headers,body:JSON.stringify({error:'No PDF data provided'})};

    // Use pdf-parse to extract text
    const pdfParse = require('pdf-parse');
    const buf = Buffer.from(pdfData, 'base64');
    const parsed = await pdfParse(buf);

    // Split into lines
    const lines = parsed.text.split('\n').map(l=>l.trim()).filter(Boolean);
    const result = parseLines(lines);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success:true, cutList:result })
    };
  } catch(err) {
    console.error('Parse error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
