const express = require("express");

const app = express();

app.get("/", (req, res) => {

res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sistema de Etiquetas</title>

<style>

*{box-sizing:border-box;font-family:"Segoe UI",Arial,sans-serif}

body{
 margin:0;
 background:#f3f5f9;
 color:#1d2433;
}

header{
 background:#0b3c7d;
 color:white;
 padding:14px 24px;
 display:flex;
 justify-content:space-between;
 align-items:center;
}

header h1{margin:0;font-size:20px}
header small{opacity:.8}

main{
 display:grid;
 grid-template-columns:440px 1fr;
 gap:22px;
 padding:20px;
 max-width:1400px;
 margin:auto;
}

@media(max-width:900px){
 main{grid-template-columns:1fr}
}

.card{
 background:white;
 border:1px solid #d5dbe5;
 border-radius:10px;
 padding:22px;
}

.passo{
 display:flex;
 align-items:center;
 gap:10px;
 font-weight:700;
 font-size:16px;
 margin:18px 0 8px;
}

.passo:first-child{margin-top:0}

.passo span{
 background:#1565c0;
 color:white;
 border-radius:50%;
 width:26px;
 height:26px;
 display:inline-flex;
 align-items:center;
 justify-content:center;
 font-size:13px;
}

select,input{
 width:100%;
 padding:12px;
 border:1px solid #d5dbe5;
 border-radius:6px;
 font-size:15px;
 background:white;
}

select:focus,input:focus{outline:2px solid #1565c0}

.desc{
 background:#eef4ff;
 border-left:4px solid #1565c0;
 padding:10px 12px;
 margin-top:8px;
 font-size:14px;
 min-height:40px;
}

.msg{color:#c62828;font-size:13px;margin-top:12px;min-height:16px}

.btn-print{
 width:100%;
 margin-top:20px;
 background:#1b8a3a;
 color:white;
 border:none;
 border-radius:6px;
 padding:14px;
 font-size:18px;
 font-weight:700;
 cursor:pointer;
}

.btn-print:disabled{background:#9bb5a3;cursor:not-allowed}

.prev-titulo{margin:0 0 20px;font-size:19px}

#preview{display:flex;flex-wrap:wrap;gap:12px;align-content:flex-start}

.vazio{color:#7a8599;text-align:center;padding:60px 0;width:100%}

/* ===== ETIQUETAS (base) ===== */

.etq{
 position:relative;
 border:1px solid black;
 background:white;
 color:black;
 overflow:hidden;
}

/* ===== GM HOLOGRÁFICA 75x50mm ===== */

.gm{width:75mm;height:50mm;border-radius:2mm}

/* ===== INMETRO 80x42mm ===== */

.inm{width:80mm;height:42mm;padding:3mm}
.inmetroTitulo{font-size:18px;font-weight:bold;font-family:Arial}
.inmetroDescricao{font-size:10px;margin-top:4px;font-family:Arial}
.inmetroInfo{font-size:8px;margin-top:4px;font-family:Arial}

/* ===== IMPRESSÃO ===== */

@media print{
 header,.form,.prev-titulo{display:none!important}
 body,main{background:white;padding:0;margin:0;display:block}
 .card{border:none;padding:0}
 #preview{display:block}
 .etq{border:none!important;border-radius:0;page-break-after:always;break-after:page}
}

</style>

<style id="pageSize">@page{size:75mm 50mm;margin:0}</style>

</head>

<body>

<header>
 <div>
  <h1>Sistema de Etiquetas</h1>
  <small>Identificação de materiais por cliente</small>
 </div>
 <small id="dataHora"></small>
</header>

<main>

<section class="card form">

 <div class="passo"><span>1</span>Cliente</div>
 <select id="cliente"></select>

 <div class="passo"><span>2</span>Tipo de etiqueta</div>
 <select id="tipo"></select>

 <div class="passo"><span>3</span>Part Number</div>
 <input id="produto" list="listaPN" placeholder="Digite ou selecione o Part Number">
 <datalist id="listaPN"></datalist>
 <div class="desc" id="descricao">Descrição do material aparecerá aqui</div>

 <div class="passo"><span>4</span>Quantidade de peças por embalagem</div>
 <input id="quantidade" type="number" min="1" placeholder="Ex: 50">

 <div class="passo"><span>5</span>Quantidade de etiquetas</div>
 <input id="copias" type="number" min="1" max="500" value="1">

 <div class="passo"><span>6</span>Impressora</div>
 <select id="impressora">
  <option value="">Selecione a impressora</option>
  <option>Zebra Linha 1</option>
  <option>Zebra Linha 2</option>
 </select>

 <div class="msg" id="msg"></div>

 <button class="btn-print" id="btnImprimir" type="button" disabled>🖨️ Imprimir</button>

</section>

<section class="card">
 <h3 class="prev-titulo">Pré-visualização</h3>
 <div id="preview">
  <div class="vazio">Preencha os campos para visualizar a etiqueta</div>
 </div>
</section>

</main>

<script>

/* =========================================================
   DADOS – EDITE AQUI
   cliente -> tipos de etiqueta -> part numbers
   ========================================================= */

const dados = {

 GM: {

  tipos: {

   "GM Holográfica": {

    layout: "gmHolo", largura: 75, altura: 50,

    produtos: {

     "26272686": {
      descPT: "CJ. SERVO FREI",
      descES: "CJ. FRENO SERV",
      descEN: "ASSY BOOS",
      codigo: "1582"
     },

     "52171287": {
      descPT: 'PASTILHAS 14"',
      descES: 'PASTILLAS 14"',
      descEN: 'PADS 14"',
      codigo: "0000"
     },

     "52171288": {
      descPT: 'PASTILHAS 15"',
      descES: 'PASTILLAS 15"',
      descEN: 'PADS 15"',
      codigo: "0000"
     }

    }

   },

   "INMETRO": {

    layout: "inmetro", largura: 80, altura: 42,

    produtos: {

     "A038M863": {
      codigoCliente: "52171287",
      descricaoEN: "PADS KIT, DISC BRAKE",
      descricaoPT: "CJ DE PASTILHAS, FREIO A DISCO",
      fabricante: "TRW AUTOMOTIVE",
      endereco: "VIA ANHANGUERA KM 147",
      cidade: "13486 915 LIMEIRA SP BRAZIL",
      cnpj: "60.857.349/0001 76"
     }

    }

   }

  }

 }

 // STELLANTIS: { tipos: { ... } },
 // HONDA:      { tipos: { ... } }

};

/* Fixos da GM Holográfica */
const GM_PREFIXO = "89700";
const GM_UNIDADE = "UNID/UNIT";
const GM_DATAMATRIX = "{GM}"; // campos: {GM} {QTY} {COD} {DATA}

/* =========================================================
   CÓDIGO DE BARRAS CODE 128 (não precisa mexer)
   ========================================================= */

const C128=["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"];

/* Retorna um <svg> do código de barras posicionado em x,y com largura w e altura h (em mm) */
function barcodeSVG(texto, x, y, w, h){
 const vals=[104]; let soma=104;
 texto.split("").forEach(function(c,i){
  const v=Math.max(0,Math.min(94,c.charCodeAt(0)-32));
  vals.push(v); soma+=v*(i+1);
 });
 vals.push(soma%103); vals.push(106);
 let px=0, rects="";
 vals.forEach(function(v){
  C128[v].split("").forEach(function(b,j){
   b=+b;
   if(j%2===0) rects+='<rect x="'+px+'" y="0" width="'+b+'" height="100"/>';
   px+=b;
  });
 });
 return '<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" viewBox="0 0 '+px+' 100" preserveAspectRatio="none" shape-rendering="crispEdges">'+rects+'</svg>';
}

/* =========================================================
   DATA MATRIX ECC200 (não precisa mexer)
   ========================================================= */

const DM=(function(){
 const EXP=new Array(512),LOG=new Array(256);let x=1;
 for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x12D;}
 for(let i=255;i<512;i++)EXP[i]=EXP[i-255];
 const mul=function(a,b){return a&&b?EXP[LOG[a]+LOG[b]]:0;};
 const SZ=[[10,3,5,1],[12,5,7,1],[14,8,10,1],[16,12,12,1],[18,18,14,1],[20,22,18,1],[22,30,20,1],[24,36,24,1],[26,44,28,1],[32,62,36,2],[36,86,42,2],[40,114,48,2],[44,144,56,2],[48,174,68,2]];
 function encodeASCII(s){
  const b=new TextEncoder().encode(s),o=[];
  for(let i=0;i<b.length;i++){
   const c=b[i],n=b[i+1];
   if(c>=48&&c<=57&&n>=48&&n<=57){o.push(130+(c-48)*10+(n-48));i++;}
   else if(c<128)o.push(c+1); else {o.push(235,c-127);}
  }
  return o;
 }
 function rs(data,n){
  let g=[1];
  for(let i=1;i<=n;i++){const ng=new Array(g.length+1).fill(0);
   for(let j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=mul(g[j],EXP[i]);}g=ng;}
  const e=new Array(n).fill(0);
  for(const d of data){const f=d^e[0];e.shift();e.push(0);for(let k=0;k<n;k++)e[k]^=mul(g[k+1],f);}
  return e;
 }
 function encode(s){
  const cw=encodeASCII(s);
  const sz=SZ.find(function(z){return z[1]>=cw.length;});
  if(!sz) throw new Error("Conteúdo grande demais para o Data Matrix");
  const N=sz[0],nd=sz[1],ne=sz[2],R=sz[3];
  if(cw.length<nd){cw.push(129);while(cw.length<nd){let p=129+((149*(cw.length+1))%253)+1;if(p>254)p-=254;cw.push(p);}}
  const all=cw.concat(rs(cw,ne));
  const d=N/R-2,nrow=d*R,ncol=d*R,A=new Array(nrow*ncol).fill(0);
  function mod(r,c,ch,bit){if(r<0){r+=nrow;c+=4-((nrow+4)%8);}if(c<0){c+=ncol;r+=4-((ncol+4)%8);}A[r*ncol+c]=ch*10+bit;}
  function utah(r,c,ch){mod(r-2,c-2,ch,1);mod(r-2,c-1,ch,2);mod(r-1,c-2,ch,3);mod(r-1,c-1,ch,4);mod(r-1,c,ch,5);mod(r,c-2,ch,6);mod(r,c-1,ch,7);mod(r,c,ch,8);}
  function c1(ch){mod(nrow-1,0,ch,1);mod(nrow-1,1,ch,2);mod(nrow-1,2,ch,3);mod(0,ncol-2,ch,4);mod(0,ncol-1,ch,5);mod(1,ncol-1,ch,6);mod(2,ncol-1,ch,7);mod(3,ncol-1,ch,8);}
  function c2(ch){mod(nrow-3,0,ch,1);mod(nrow-2,0,ch,2);mod(nrow-1,0,ch,3);mod(0,ncol-4,ch,4);mod(0,ncol-3,ch,5);mod(0,ncol-2,ch,6);mod(0,ncol-1,ch,7);mod(1,ncol-1,ch,8);}
  function c3(ch){mod(nrow-3,0,ch,1);mod(nrow-2,0,ch,2);mod(nrow-1,0,ch,3);mod(0,ncol-2,ch,4);mod(0,ncol-1,ch,5);mod(1,ncol-1,ch,6);mod(2,ncol-1,ch,7);mod(3,ncol-1,ch,8);}
  function c4(ch){mod(nrow-1,0,ch,1);mod(nrow-1,ncol-1,ch,2);mod(0,ncol-3,ch,3);mod(0,ncol-2,ch,4);mod(0,ncol-1,ch,5);mod(1,ncol-3,ch,6);mod(1,ncol-2,ch,7);mod(1,ncol-1,ch,8);}
  let ch=1,row=4,col=0;
  do{
   if(row===nrow&&col===0)c1(ch++);
   if(row===nrow-2&&col===0&&ncol%4)c2(ch++);
   if(row===nrow-2&&col===0&&ncol%8===4)c3(ch++);
   if(row===nrow+4&&col===2&&!(ncol%8))c4(ch++);
   do{if(row<nrow&&col>=0&&!A[row*ncol+col])utah(row,col,ch++);row-=2;col+=2;}while(row>=0&&col<ncol);
   row+=1;col+=3;
   do{if(row>=0&&col<ncol&&!A[row*ncol+col])utah(row,col,ch++);row+=2;col-=2;}while(row<nrow&&col>=0);
   row+=3;col+=1;
  }while(row<nrow||col<ncol);
  if(!A[nrow*ncol-1]){A[nrow*ncol-1]=-1;A[(nrow-1)*ncol-2]=-1;A[nrow*ncol-2]=-2;A[(nrow-1)*ncol-1]=-2;}
  const M=[];for(let i=0;i<N;i++)M.push(new Array(N).fill(0));
  for(let ry=0;ry<R;ry++)for(let rx=0;rx<R;rx++){
   const oy=ry*(d+2),ox=rx*(d+2);
   for(let i=0;i<d+2;i++){M[oy+i][ox]=1;M[oy+d+1][ox+i]=1;if(i%2===0)M[oy][ox+i]=1;if(i%2===1)M[oy+i][ox+d+1]=1;}
  }
  for(let i=0;i<nrow;i++)for(let j=0;j<ncol;j++){
   const v=A[i*ncol+j];let on;
   if(v===-1)on=1;else if(v===-2)on=0;else{const c=Math.floor(v/10),b=v%10;on=(all[c-1]>>(8-b))&1;}
   M[Math.floor(i/d)*(d+2)+1+i%d][Math.floor(j/d)*(d+2)+1+j%d]=on;
  }
  return {M:M,N:N};
 }
 /* Retorna um <svg> do Data Matrix posicionado em x,y com lado "tam" (em mm) */
 function svg(s,x,y,tam){
  const r=encode(s);let p="";
  for(let yy=0;yy<r.N;yy++)for(let c=0;c<r.N;c++)if(r.M[yy][c])p+="M"+c+" "+yy+"h1v1h-1z";
  return '<svg x="'+x+'" y="'+y+'" width="'+tam+'" height="'+tam+'" viewBox="0 0 '+r.N+' '+r.N+'" shape-rendering="crispEdges"><path d="'+p+'"/></svg>';
 }
 return {svg:svg};
})();

/* =========================================================
   LÓGICA DO APP
   ========================================================= */

function el(id){ return document.getElementById(id); }

function dataJuliana(){
 const d=new Date();
 const dia=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);
 return String(d.getFullYear()).slice(2)+String(dia).padStart(3,"0");
}

function tipoAtual(){
 const c=dados[el("cliente").value];
 return c ? c.tipos[el("tipo").value] : null;
}

function produtoAtual(){
 const t=tipoAtual();
 if(!t) return null;
 const pn=el("produto").value.trim().toUpperCase();
 return t.produtos[pn] ? {pn:pn, info:t.produtos[pn]} : null;
}

function carregarClientes(){
 el("cliente").innerHTML=Object.keys(dados).map(function(c){
  return '<option value="'+c+'">'+c+'</option>';
 }).join("");
 atualizarTipos();
}

function atualizarTipos(){
 const tipos=Object.keys(dados[el("cliente").value].tipos);
 el("tipo").innerHTML=tipos.map(function(t){
  return '<option value="'+t+'">'+t+'</option>';
 }).join("");
 atualizarProdutos();
}

function atualizarProdutos(){
 const t=tipoAtual();
 el("listaPN").innerHTML=Object.keys(t.produtos).map(function(pn){
  const p=t.produtos[pn];
  return '<option value="'+pn+'">'+(p.descPT||p.descricaoPT)+'</option>';
 }).join("");
 el("produto").value="";
 atualizarPreview();
}

/* =========================================================
   LAYOUT GM HOLOGRÁFICA – 75 x 50 mm
   Todas as medidas abaixo estão em MILÍMETROS.
   REC = recuo das informações a partir da borda esquerda.
   ========================================================= */
function etiquetaGM(pn,p,qtd){
 const cod=GM_PREFIXO+p.codigo, jul=dataJuliana();
 const dmTxt=GM_DATAMATRIX.replace("{GM}",pn).replace("{QTY}",qtd).replace("{COD}",cod).replace("{DATA}",jul);
 const qtdTxt=qtd+" "+GM_UNIDADE;
 const REC=13; // 1,3 cm

 const NARROW="Arial Narrow, Roboto Condensed, Arial, sans-serif";
 const CALIBRI="Calibri, Carlito, Arial, sans-serif";

 /* texto: x, linha de base (y), tamanho da fonte, fonte, conteúdo, largura fixa (opcional) */
 function txt(x,y,tam,fonte,conteudo,largura){
  return '<text x="'+x+'" y="'+y+'" font-size="'+tam+'" font-family="'+fonte+'" font-weight="700"'
   +(largura?' textLength="'+largura+'" lengthAdjust="spacingAndGlyphs"':'')+'>'+conteudo+'</text>';
 }

 return '<div class="etq gm"><svg viewBox="0 0 75 50" style="width:75mm;height:50mm;display:block">'
  + barcodeSVG(cod, REC+3.2, 3.2, 19.8, 6.6)                          // código de barras
  + txt(REC+3.2, 12.2, 2.5, CALIBRI, cod, 11)                          // 897001582
  + txt(REC+22.6, 12.2, 2.5, CALIBRI, jul, 6.2)                        // 26237
  + txt(REC, 18.9, 3.1, NARROW, "GM#", 5.9)                            // GM#
  + txt(REC+6.2, 18.8, 4.5, NARROW, pn, (1.86*pn.length).toFixed(2))  // 26272686
  + txt(REC, 25.0, 2.5, NARROW, "QTY.", 5.7)                           // QTY.
  + txt(REC+6.2, 25.0, 4.7, NARROW, qtdTxt, (1.91*qtdTxt.length).toFixed(2)) // 1 UNID/UNIT
  + txt(REC, 30.7, 2.9, CALIBRI, p.descPT)                             // descrição PT
  + txt(REC, 34.6, 2.9, CALIBRI, p.descES)                             // descrição ES
  + txt(REC, 38.5, 2.9, CALIBRI, p.descEN)                             // descrição EN
  + DM.svg(dmTxt, 55.4, 12.3, 12.9)                                    // Data Matrix
  + '</svg></div>';
}

/* ----- Layout INMETRO 80x42mm ----- */
function etiquetaINMETRO(pn,p){
 return '<div class="etq inm">'
  +'<div class="inmetroTitulo">'+p.codigoCliente+'</div>'
  +'<div class="inmetroTitulo">'+pn+'</div>'
  +'<div class="inmetroDescricao">'+p.descricaoEN+'</div>'
  +'<div class="inmetroDescricao">'+p.descricaoPT+'</div>'
  +'<div class="inmetroInfo">'+p.fabricante+'</div>'
  +'<div class="inmetroInfo">'+p.endereco+'</div>'
  +'<div class="inmetroInfo">'+p.cidade+'</div>'
  +'<div class="inmetroInfo">'+p.cnpj+'</div>'
  +'</div>';
}

function atualizarPreview(){
 const t=tipoAtual(), prod=produtoAtual();
 const qtd=parseInt(el("quantidade").value,10);
 const copias=parseInt(el("copias").value,10);
 let erro="";

 if(prod){
  const p=prod.info;
  el("descricao").textContent = t.layout==="gmHolo"
   ? p.descPT+" | "+p.descES+" | "+p.descEN
   : p.descricaoPT+" | Cód. cliente: "+p.codigoCliente;
 } else {
  el("descricao").textContent = el("produto").value
   ? "⚠️ Part Number não encontrado para este cliente/tipo"
   : "Descrição do material aparecerá aqui";
 }

 if(el("quantidade").value && !(qtd>0)) erro="Quantidade de peças inválida.";
 if(el("copias").value && !(copias>=1 && copias<=500)) erro="Quantidade de etiquetas deve ser entre 1 e 500.";
 el("msg").textContent=erro;

 const ok = prod && qtd>0 && copias>=1 && copias<=500 && el("impressora").value && !erro;
 el("btnImprimir").disabled = !ok;

 if(prod && qtd>0){
  const n=Math.min(Math.max(copias||1,1),500);
  const html = t.layout==="gmHolo" ? etiquetaGM(prod.pn,prod.info,qtd) : etiquetaINMETRO(prod.pn,prod.info);
  el("preview").innerHTML = html.repeat(n);
  el("pageSize").textContent = "@page{size:"+t.largura+"mm "+t.altura+"mm;margin:0}";
 } else {
  el("preview").innerHTML = '<div class="vazio">Preencha os campos para visualizar a etiqueta</div>';
 }
}

el("cliente").addEventListener("change",atualizarTipos);
el("tipo").addEventListener("change",atualizarProdutos);
["produto","quantidade","copias","impressora"].forEach(function(id){
 el(id).addEventListener("input",atualizarPreview);
 el(id).addEventListener("change",atualizarPreview);
});
el("btnImprimir").addEventListener("click",function(){
 atualizarPreview();
 window.print();
});

setInterval(function(){
 el("dataHora").textContent=new Date().toLocaleString("pt-BR");
},1000);

window.onload = carregarClientes;

</script>

</body>
</html>
`);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

 console.log("Servidor iniciado na porta " + PORT);

});
