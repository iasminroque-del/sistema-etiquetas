const express = require("express");
const { exec } = require("child_process");
const app = express();
/* LISTA AS IMPRESSORAS DO WINDOWS (só quando roda no próprio computador) */
app.get("/impressoras", (req, res) => {
 if (process.platform !== "win32") return res.json({ local: false, impressoras: [] });
 const cmd = 'powershell -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name | ConvertTo-Json"';
 exec(cmd, { encoding: "utf8" }, (erro, saida) => {
  if (erro) return res.json({ local: false, impressoras: [] });
  let lista = [];
  try { lista = JSON.parse(saida || "[]"); } catch (e) { lista = []; }
  if (!Array.isArray(lista)) lista = [lista];
  res.json({ local: true, impressoras: lista });
 });
});
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
body{margin:0;background:#f3f5f9;color:#1d2433;}
header{background:#0b3c7d;color:white;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;}
header h1{margin:0;font-size:20px}
header small{opacity:.8}
main{display:grid;grid-template-columns:440px 1fr;gap:22px;padding:20px;max-width:1400px;margin:auto;}
@media(max-width:900px){main{grid-template-columns:1fr}}
.card{background:white;border:1px solid #d5dbe5;border-radius:10px;padding:22px;}
.passo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:16px;margin:18px 0 8px;}
.passo:first-child{margin-top:0}
.passo span{background:#1565c0;color:white;border-radius:50%;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;}
select,input{width:100%;padding:12px;border:1px solid #d5dbe5;border-radius:6px;font-size:15px;background:white;}
select:focus,input:focus{outline:2px solid #1565c0}
.desc{background:#eef4ff;border-left:4px solid #1565c0;padding:10px 12px;margin-top:8px;font-size:14px;min-height:40px;}
.msg{color:#c62828;font-size:13px;margin-top:12px;min-height:16px}
.btn-print{width:100%;margin-top:20px;background:#1b8a3a;color:white;border:none;border-radius:6px;padding:14px;font-size:18px;font-weight:700;cursor:pointer;}
.btn-print:disabled{background:#9bb5a3;cursor:not-allowed}
.prev-titulo{margin:0 0 20px;font-size:19px}
#preview{display:flex;flex-wrap:wrap;gap:12px;align-content:flex-start}
.vazio{color:#7a8599;text-align:center;padding:60px 0;width:100%}
.etq{position:relative;border:1px solid black;background:white;color:black;overflow:hidden;}
.gm{width:75mm;height:50mm;border-radius:2mm}
.pag{border:none;box-shadow:0 0 0 1px #c9ced8;background:white}
@media screen{#preview .pag{zoom:1.8}}
@media print{
header,.form,.prev-titulo{display:none!important}
body,main{background:white;padding:0;margin:0;display:block}
.card{border:none;padding:0}
#preview{display:block}
.etq{border:none!important;border-radius:0;box-shadow:none!important;background:white!important;page-break-after:always;break-after:page}
.borda{display:none}
}
</style>
<style id="pageSize">@page{size:75mm 50mm;margin:0}</style>
</head>
<body>
<header>
 <div><h1>Sistema de Etiquetas</h1><small>Identificação de materiais por cliente</small></div>
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
 <select id="quantidade">
  <option value="1">1</option>
  <option value="008">008</option>
 </select>
 <div class="passo"><span>5</span>Quantidade de etiquetas</div>
 <input id="copias" type="number" min="1" max="500" value="1">
 <div class="passo"><span>6</span>Impressora</div>
 <select id="impressora"><option value="">Carregando impressoras...</option></select>
 <div class="msg" id="msg"></div>
 <button class="btn-print" id="btnImprimir" type="button" disabled>Imprimir</button>
</section>
<section class="card">
 <h3 class="prev-titulo">Pré-visualização</h3>
 <div id="preview"><div class="vazio">Preencha os campos para visualizar a etiqueta</div></div>
</section>
</main>
<script>
/* =========================================================
   DADOS – EDITE AQUI
   ========================================================= */
const dados = {
 GM: {
  tipos: {
   "GM Holográfica": {
    layout: "gmHolo", largura: 75, altura: 50,
    produtos: {
     "26272686": { descPT: "CJ. SERVO FREI", descES: "CJ. FRENO SERV", descEN: "ASSY BOOS", codigo: "1582" },
     "52171287": { descPT: 'PASTILHAS 14"', descES: 'PASTILLAS 14"', descEN: 'PADS 14"', codigo: "0000" },
     "52171288": { descPT: 'PASTILHAS 15"', descES: 'PASTILLAS 15"', descEN: 'PADS 15"', codigo: "0000" }
    }
   },
   "INMETRO": {
    layout: "inmetro",
    produtos: {
     "A038M863": {
      codigoCliente: "52171287",
      unidade: "KIT / UNIT",
      descricaoEN: "PADS KIT, DISC BRAKE",
      descricaoPT: "CJ DE PASTILHAS, FREIO A DISCO",
      fabricante: "ZF AUTOMOTIVE",
      endereco: "VIA ANHANGUERA KM 147",
      cidade: "13486 915 LIMEIRA SP BRAZIL",
      cnpj: "60.857.349/0001 76",
      lote: "3G3P",
      origem: "MADE IN MEXICO",
      registro: "004484/2019",
      sac: "0800 0111 100"
     }
    }
   }
  }
 }
 // STELLANTIS: { tipos: { ... } },
};
/* Fixos da GM Holográfica */
const GM_PREFIXO = "89700";
const GM_UNIDADE = "UNID/UNIT";
const GM_DATAMATRIX = "{GM}|{PT}|{ES}|{EN}";
/* Fixos da etiqueta de selo (medidas em mm) */
const INM_W = 77;        // comprimento de cada etiqueta (7,7 cm)
const INM_H = 43;        // largura de cada etiqueta (4,3 cm)
const INM_COLUNAS = 2;   // etiquetas lado a lado no rolo
const INM_MARGEM = 4;    // margem da borda do papel até a 1ª etiqueta (0,4 cm)
const INM_GAP = 2;       // espaço entre as duas etiquetas (0,2 cm)
const INM_PAPEL = 90;    // largura total do papel (9,0 cm)
/* =========================================================
   CÓDIGO DE BARRAS CODE 128 (não precisa mexer)
   ========================================================= */
const C128=["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"];
function codigos128(texto,modoC){
 const v=[];
 if(modoC && /^[0-9]{2,}$/.test(texto)){
  v.push(105); let i=0;
  for(;i+1<texto.length;i+=2) v.push(parseInt(texto.substr(i,2),10));
  if(i<texto.length){ v.push(100); v.push(texto.charCodeAt(i)-32); }
 } else {
  v.push(104);
  texto.split("").forEach(function(c){ v.push(Math.max(0,Math.min(94,c.charCodeAt(0)-32))); });
 }
 let soma=v[0];
 for(let k=1;k<v.length;k++) soma+=v[k]*k;
 v.push(soma%103); v.push(106);
 return v;
}
function barcodeSVG(texto, x, y, w, h, modoC){
 let px=0, rects="";
 codigos128(texto,modoC).forEach(function(v){
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
 let pn=el("produto").value.trim().toUpperCase();
 if(!t.produtos[pn]){
  const k=Object.keys(t.produtos).find(function(k){ return t.produtos[k].codigoCliente===pn; });
  if(k) pn=k;
 }
 return t.produtos[pn] ? {pn:pn, info:t.produtos[pn]} : null;
}
function carregarClientes(){
 el("cliente").innerHTML=Object.keys(dados).map(function(c){ return '<option value="'+c+'">'+c+'</option>'; }).join("");
 atualizarTipos();
}
function atualizarTipos(){
 el("tipo").innerHTML=Object.keys(dados[el("cliente").value].tipos).map(function(t){ return '<option value="'+t+'">'+t+'</option>'; }).join("");
 atualizarProdutos();
}
function atualizarProdutos(){
 const t=tipoAtual();
 el("listaPN").innerHTML=Object.keys(t.produtos).map(function(pn){
  const p=t.produtos[pn];
  return '<option value="'+pn+'">'+(p.codigoCliente?p.codigoCliente+" - ":"")+(p.descPT||p.descricaoPT)+'</option>';
 }).join("");
 el("produto").value="";
 atualizarPreview();
}
/* Texto da GM: x, linha de base y, tamanho, fonte, conteúdo, peso, mm por letra */
function txt(x,y,tam,fonte,conteudo,peso,porLetra){
 conteudo=String(conteudo);
 const w=porLetra ? porLetra*conteudo.length : 0;
 return '<text x="'+x+'" y="'+y+'" font-size="'+tam+'" font-family="'+fonte+'" font-weight="'+(peso||"normal")+'" fill="#000"'
  +(w?' textLength="'+w.toFixed(2)+'" lengthAdjust="spacingAndGlyphs"':'')+'>'+conteudo+'</text>';
}
const NARROW="Arial Narrow, Liberation Sans Narrow, Roboto Condensed, Arial, sans-serif";
const CALIBRI="Calibri, Carlito, Arial, sans-serif";
/* =========================================================
   LAYOUT GM HOLOGRÁFICA – 75 x 50 mm (medidas em mm)
   ========================================================= */
function etiquetaGM(pn,p,qtd){
 const cod=GM_PREFIXO+p.codigo, jul=dataJuliana();
 const dmTxt=GM_DATAMATRIX.replace("{GM}",pn).replace("{PT}",p.descPT).replace("{ES}",p.descES).replace("{EN}",p.descEN)
  .replace("{QTY}",qtd).replace("{COD}",cod).replace("{DATA}",jul);
 const qtdTxt=qtd+" "+GM_UNIDADE;
 const REC=13; // recuo esquerdo 1,3 cm
 return '<div class="etq gm"><svg viewBox="0 0 75 50" style="width:75mm;height:50mm;display:block">'
  + barcodeSVG(pn, REC+3.2, 3.2, 19.8, 6.6)
  + txt(REC+3.2, 12.2, 2.5, CALIBRI, cod, "bold", 11/9)
  + txt(REC, 18.9, 3.1, NARROW, "GM#", "bold", 5.9/3)
  + txt(REC+6.2, 18.8, 4.5, NARROW, pn, "bold", 1.86)
  + txt(REC, 25.0, 2.5, NARROW, "QTY.", "bold", 5.7/4)
  + txt(REC+6.2, 25.0, 4.7, NARROW, qtdTxt, "bold", 1.91)
  + txt(REC, 30.7, 2.9, CALIBRI, p.descPT, "bold")
  + txt(REC, 34.6, 2.9, CALIBRI, p.descES, "bold")
  + txt(REC, 38.5, 2.9, CALIBRI, p.descEN, "bold")
  + DM.svg(dmTxt, 55.4, 12.3, 12.9)
  + '</svg></div>';
}
/* =========================================================
   LAYOUT DA ETIQUETA DE SELO – 77 x 43 mm, girada, 2 por linha
   ========================================================= */
const LOGOS={
 "logo-zf.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACPAQAAAAAALw49AAACkklEQVR42sWWTY7bMAyFPzFG41287KrxEXqD+GSNMCdLb9AjuD2BBujCBRyzC/3RdibZtVpkhDfkM/lESoT/tZwueSvp7zfctDY6qKr6FXRRVQ2JI/4uACqG61P8h/U86wRXHQ10VQ9HnWxQE8B1qdBRbwAnE8ZJU3Bj+eLXPwDcfVfZU5DnubLfEsFSE1xtBGjuCbrjE/S5UPghyxBKYiFZDT8yFNq0qUEf5xxDFXeJjnIv0OISV/lgpBBojEw3DwJtqNA4gEBn9e1BoDdI6CL9rUJTjPVqTz1+SuM6qqrqXMsE2nzUkkrALMl2WmpE9tUnNCnjLOxjq/anc64DeHfO9QMCMcWkUAChAygnP/VITnEyXH3SJK65Q8DvvkjhTakKF4ChnJGxsmrPUbPbKXbH/DihfIIVcnPpJADeqpXfOMpDLgtNVnr4jgiQxV47LluofUkfgK4W54gY5pi4z47Tlqt/SR91Dk+tmqTMCLx3z7n2kFvV/kdW8pDLv3ZsqvQfWM1bneEQ4KRzFpDz3rGPkJH+SRD9Glra9WlotBqMzZC5wnN6mEB1LKEuuZFrIyzIup4j19uq6p0tyXdHbZjdVy8cVK1Wsq1nUiOrrRFZ9SYQEBis9G2uaKd5hRGBvnvcVvX+Rcx9Y+7Ni5oFYnss9qVAM+w8rZmLV63bHMX2sopWN4M1E0h8CUqKITqbkugiVzDh9yNIeQliRcSjOsyr4OtrX7cC6ky1pXB9CazJHJdx92SOJYo+Q+XtZMj2x6U84H67O5Z3W3NJt/fdDHCpB5jHATM8hIMHOJqSSbPF2bazLoDT2V5WboQv/MbeguoPmiYNZ1V0xvHu44TBakJS1XEzpGkZ0/Kz2sOvfzMi/gWCSQBvTkixKQAAAABJRU5ErkJggg==",
"logo-gm.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACYAQAAAABLnd9AAAABEElEQVR42u2WTQ6CQAyFXwtRFi44gIkcwRvgUTzKeDO4CUdgSQxOXTgqzJQ4BjZGuuPLg/4MbQf4DSOIj4RZ07H+gcoHia5c4b/ApFfgPqlCeMaRpEFph9BgFygJYCAfQ9a8pwAFMHNPJz94E4Qk6UDvYG6tklEv0wUxHjShsnPRxhaZRrD48ox43LBlC5BYEhs2LM/6GQh9hPIgBib1YPGuS4x3Ex1npsAKbezrJw/WZkqZK7BBE+uomFX59jmKF+niRlVmyvA/dJCLbCWxH4d/Stq42GghdVNxvtqOXdaxGXUTyvA0ewiAV9M/4A1XZfGV1XDxLbINS3Fm14UyDz4GTE1rQVaoQ+X2C2L8sN0Bvw1DkPJgizEAAAAASUVORK5CYII=",
 "Inmetro.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAB8AQAAAADGSIbUAAABPUlEQVR42u3WsZHCMBCFYVl4OAUXEJKZEijBpVCKSrlSXAIlOLzQgQMPY7wX2Nbsyj8zHi7FGR8SD7Q7iwpx28e7veiaLX3RynH/Z34wf0REpF1fVSIiMq880/aS0BMWkdJrwithICwJD/gzI2FNeCUMhEfCAg85bg45nbM+ZOfcibYHwiNhgSVuCC+EJ8JvQk+oyqzerwkvhGfCMsOOvshg42d82PgZxZbZqwqFDH9M/IKd6bIFe1PmBScTv6CNN60YMmx1mVfsdJlXNPErzvE3ixJVmb1pkJChjk/4q+ITjqrLEk6qzAkl7u7PO+FAOBI+cdZhfzaEd8KBcCR84qSNNGmrdSDolR1tHwgfhIJzPtKcryA9xRvsCSdCwX+ZmrAl7Ah7wolw6TJPN4gM25e3i8PnevA2Fv+77P0BhwtvmyXEhCIAAAAASUVORK5CYII=",
 "IQA-PRETO.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACSAQAAAADqBvwmAAACi0lEQVR42t2WO27cQAyG/xktIhWLaEsXAaIj+AABrKPkCLmBVabMEXwUHcFHUDqXKraYAFoxBckhR9ZuEgdpsoVlfSCHb44C4fUv4ha8hM4o8W8F8Cj/k8IJQL2FgBMVmAAArUAx9AIAOIudwIpBrHqXLiLSe5eSvLT+zBeBZ6/+JHD16jm+R1O/ZDiaZMqwNUmDyQw9Z7gYHDNcLczg0quSvkyDwtXBUeHi4KQwOTgrnB1Me3VfFE4OrgpHbPwMVPjONJa+s/evGmxkuO513VKAaU99ZihRfvAu0CzV4WfNNeKXL2i95MRBEI0AULHkBADvANxvB+EOwFEzEiUfn7170YUccpqI1I5Ysp7nRyc6Ag8AgFM+kwCggf3NkqcioQI7dwgQfY5j+extxCYAtLgBB4CPRLGoxuDVw60d0nOR4t56KV87henaCjrcUj9d22Dp5lpr/mQBXofN36n/PkxvU09vst5s4ewll61686szJw/XW5IjVzT6pW8Du9ufvjH3ziRpsugX8FpKTnvqs0XbA5H7PRVpjX6/z7ZYdud9yCGNO+uCBlMfJTgOONi6wOxuSEQZnrPf8Sp5sdECos5Jhx95pHKWvuOr34rWMxURzaipyOcntSbu5ZtxYsksXO1t72OO3126D1xQNjSUt3sDaBrFzgq03qVQXFKdS22+zk5usSbghGiz2xR1P7itss1pJwF1iJv1l+9i8b6XgvYM+1zl1afLf1JIie9yQAkIcqbtv2eLLfpPiqhzMUjViG++WHwnXSRaIuJbspZnnqOja7NO464EPmlg2tg1d0Cw77oZqPnIypr2PdAA3/R4Uv2W++fBfSsuaGnU2VFIc5t0ICjQv960/y38CYyTm3hQvQ6NAAAAAElFTkSuQmCC",
 "reciclagem.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgAQAAAACjtFqAAAADU0lEQVR42s2WP67cRgzGf8NdZAXEiFSkiKunI7zS3cp9DpMDBHjKTXKTqHCRNiewnCqlDKSQDa2YgjMjjlYbvNIq9g9FDsmP30cpKABf6pntEvv684uGEMK5MA68B7hFV1VVVah7gBdVVTVPhbmziC18haUFGJ1xgbUBmHwi0ApgdsYZ6Pd1TsCHeI4P5++95wh8jmUUnnNvBWfjkI9zbQKEIfe5hWtbJjLPeNAQjZazARh18NmlAuBrSjQDXGaAeioSYbP4K3lOAPUCcAnJcwJoBOAmRZuQYZI8hDbkk2Ubl8FcFeHdDpD4YwB4itl1l2wLD9CCfUjGwx0tdyExkeERu03Izw8TVVZ3SMbpyHOMw8htC66+hLQAPx2Ff+fwqJIxeIAzSoN9jxEkm9Gzef+e86mqLhBUV4CrfoyeAhLB6uhisaEH+BeA25T4OXKJ09C5VjXjRG3Zg46XxKU3xJnBuGwqftJ4ccqsy3K7sRpuV9XxGh1ngqrNQueXaBxBVc4A/TmFj2RlJD9V4EWFYaOdbZYBob3jLOicUNQMqXD2nqPzrF0eapWCNDdbKNticXnknjTLtqycEpGUcOPgimzd7Pm5bmoATasi1WlLVDaoXHj53zarrOWM7uUT+TXKghO3raFJOLhk9jgau+edpzUvE+z1tchR1/b5PB/c+hmPCDICnLKEemA9tyWXtkkH/ZSwG4BTlExTNC9W8vdldvM54RGR3LHrVap02+vdF6OGSCVuf2yJxK3O1XI0rFl1qrOJ/iqhjAxAhzp+TKraE1R2IweEYtdPQMcbhI4dbs8lQ0agDaa43PoA8MP9s4Nm+gd0cqtCVVUves+lzxVCxdsmgdSDNoAuvINTWnmDqRjewS2EDkC7rScrckkDPSYtgV/SwzwpREoN5J38m6ngqmlXFMWPjp/d3UDEYTI4z3bYc9uf2SfVCPy4keZYsJFi6QHLNbZe6wHITRG+HJ15zhg8gG7/syuMoXgWx5I0G8Ttn/5hR2Fn7LxntxfrwzpbL9b06G68Ljl6Y0mvMZVHpInG835ZilsL+Y1IHDUCcMl3nzS2fbIXlZj9ZQXofy1mQFCg++PR3PfGltd6NkfG6tXh5yOjvDo8HHoOruf/Df+Gjf8BSQOvUQxU/esAAAAASUVORK5CYII="
};
const ARIAL="Arial, Liberation Sans, Helvetica, sans-serif";
function t2(x,y,tam,conteudo,peso,esc,alinhar){
 return '<text transform="translate('+x+','+y+') scale('+(esc||1)+',1)" x="0" y="0" font-size="'+tam+'" font-family="'+ARIAL+'"'
  +' font-weight="'+(peso||"normal")+'" fill="#000"'+(alinhar?' text-anchor="'+alinhar+'"':'')+'>'+String(conteudo)+'</text>';
}
function etiquetaINMETRO(pn,p,qtd){
 const cb=p.codigoCliente;   // código de barras = código do material
 const hoje=new Date().toLocaleDateString("pt-BR");
 function img(nome,x,y,w,h){ return '<image href="'+LOGOS[nome]+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid meet"/>'; }
 let s='<rect class="borda" x="0.3" y="0.3" width="'+(INM_W-0.6)+'" height="'+(INM_H-0.6)+'" rx="1.5" fill="none" stroke="#000" stroke-width="0.3"/>';
 s+=t2(3.5, 5.2, 5.4, p.codigoCliente, "bold", 0.85);
 s+=t2(73.5, 4.9, 3.6, qtd+" "+p.unidade, "bold", 0.85, "end");
 s+='<line x1="0" y1="6.1" x2="'+INM_W+'" y2="6.1" stroke="#000" stroke-width="0.35"/>';
 s+=t2(3.5, 11.0, 4.6, pn, "normal", 0.85);
 s+=t2(3.5, 14.9, 3.1, p.descricaoEN, "bold", 0.85);
 s+=t2(3.5, 18.2, 3.1, p.descricaoPT, "bold", 0.85);
 s+=t2(3.5, 20.9, 2.2, p.fabricante, "normal", 0.85);
 s+=t2(3.5, 23.1, 2.2, p.endereco, "normal", 0.85);
 s+=t2(3.5, 25.3, 2.2, p.cidade, "normal", 0.85);
 s+=t2(3.5, 27.5, 2.2, "CNPJ "+p.cnpj, "normal", 0.85);
 s+=t2(3.5, 30.0, 2.5, hoje, "normal", 0.85);
 s+=t2(25.5, 30.0, 2.5, p.lote, "normal", 0.85);
 s+=barcodeSVG(cb, 3.5, 30.7, 27.5, 6.2, true);
 /* reciclagem e origem */
 s+=img("reciclagem.png", 37, 25.2, 5, 5);
 s+=t2(39.5, 32.4, 1.8, p.origem, "bold", 0.85, "middle");
 /* logos GM e ZF (desenhados) */
 s+=img("logo-gm.png", 59.2, 7.45, 4.0, 3.8);
 s+=img("logo-zf.png", 64.2, 7.4, 3.8, 3.9);
 /* selo: logo IQA + N + textos */
 s+='<rect x="53.6" y="12.6" width="20" height="21" fill="#fff" stroke="#000" stroke-width="0.3"/>';
 s+=t2(63.6, 15.5, 2.0, "Segurança", "bold", 0.9, "middle");
 s+=img("IQA-PRETO.png", 54.6, 17.15, 7.0, 6.4);
 s+=img("Inmetro.png", 63.3, 17.15, 8.2, 6.4);
 s+=t2(58.1, 25.4, 2.0, "I.Q.A", "bold", 0.9, "middle");
 s+=t2(67.4, 25.4, 2.0, "INMETRO", "bold", 0.9, "middle");
 s+=t2(58.1, 27.2, 1.6, "OCP 0009", "bold", 0.9, "middle").replace('<text ','<text letter-spacing="0.05" ');
 s+=t2(63.6, 29.8, 2.3, "Registro", "normal", 0.9, "middle");
 s+=t2(63.6, 32.6, 2.3, p.registro, "normal", 0.9, "middle");
 s+=t2(63.6, 36.6, 2.2, "SAC "+p.sac, "bold", 0.85, "middle");
 return s;
}
/* Monta uma "folha" de 9 cm com as etiquetas lado a lado, giradas */
function folhaINMETRO(etqs){
 const PW=INM_PAPEL, PH=INM_W;
 let g="";
 etqs.forEach(function(e,c){
  const x=INM_MARGEM+c*(INM_H+INM_GAP);
  g+='<g transform="translate('+x+','+PH+') rotate(-90)">'+e+'</g>';
 });
 return '<div class="etq pag" style="width:'+PW+'mm;height:'+PH+'mm"><svg viewBox="0 0 '+PW+' '+PH+'" style="width:'+PW+'mm;height:'+PH+'mm;display:block">'+g+'</svg></div>';
}
function atualizarPreview(){
 const t=tipoAtual(), prod=produtoAtual();
 const qtd=parseInt(el("quantidade").value,10);
 const qtdTxt=el("quantidade").value;
 const copias=parseInt(el("copias").value,10);
 let erro="";
 if(prod){
  const p=prod.info;
  el("descricao").textContent = t.layout==="gmHolo"
   ? p.descPT+" | "+p.descES+" | "+p.descEN
   : p.descricaoPT+" | Cód. cliente: "+p.codigoCliente;
 } else {
  el("descricao").textContent = el("produto").value ? "Part Number não encontrado para este cliente/tipo" : "Descrição do material aparecerá aqui";
 }
 if(el("quantidade").value && !(qtd>0)) erro="Quantidade de peças inválida.";
 if(el("copias").value && !(copias>=1 && copias<=500)) erro="Quantidade de etiquetas deve ser entre 1 e 500.";
 el("msg").textContent=erro;
 el("btnImprimir").disabled = !(prod && qtd>0 && copias>=1 && copias<=500 && el("impressora").value && !erro);
 if(prod && qtd>0){
  const n=Math.min(Math.max(copias||1,1),500);
  let html="", W, H;
  if(t.layout==="gmHolo"){
     html=etiquetaGM(prod.pn,prod.info,qtdTxt).repeat(n); W=75; H=50;
  } else {
    const e=etiquetaINMETRO(prod.pn,prod.info,qtdTxt);
   for(let i=0;i<n;i+=INM_COLUNAS){
    const lista=[]; for(let c=0;c<INM_COLUNAS;c++) lista.push(e);
    html+=folhaINMETRO(lista);
   }
   W=INM_PAPEL; H=INM_W;
  }
  el("preview").innerHTML=html;
  el("pageSize").textContent="@page{size:"+W+"mm "+H+"mm;margin:0}";
 } else {
  el("preview").innerHTML='<div class="vazio">Preencha os campos para visualizar a etiqueta</div>';
 }
}
el("cliente").addEventListener("change",atualizarTipos);
el("tipo").addEventListener("change",atualizarProdutos);
["produto","quantidade","copias","impressora"].forEach(function(id){
 el(id).addEventListener("input",atualizarPreview);
 el(id).addEventListener("change",atualizarPreview);
});
el("btnImprimir").addEventListener("click",function(){ atualizarPreview(); window.print(); });
setInterval(function(){ el("dataHora").textContent=new Date().toLocaleString("pt-BR"); },1000);
/* IMPRESSORAS DO COMPUTADOR */
const IMPRESSORAS_PADRAO = ["Zebra Linha 1", "Zebra Linha 2"];
function carregarImpressoras(){
 fetch("/impressoras").then(function(r){ return r.json(); }).then(function(d){
  preencherImpressoras((d.impressoras && d.impressoras.length) ? d.impressoras : IMPRESSORAS_PADRAO);
 }).catch(function(){ preencherImpressoras(IMPRESSORAS_PADRAO); });
}
function preencherImpressoras(lista){
 const salva=localStorage.getItem("impressoraEtiquetas");
 el("impressora").innerHTML='<option value="">Selecione a impressora</option>'+lista.map(function(n){
  return '<option value="'+n+'"'+(n===salva?' selected':'')+'>'+n+'</option>';
 }).join("");
 atualizarPreview();
}
el("impressora").addEventListener("change",function(){ localStorage.setItem("impressoraEtiquetas", el("impressora").value); });
window.onload=function(){ carregarClientes(); carregarImpressoras(); };
</script>
</body>
</html>
`);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log("Servidor iniciado na porta " + PORT);
});
