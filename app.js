let SELO_OK=false;
const ARIAL="Arial, Liberation Sans, Helvetica, sans-serif";
function t2(x,y,tam,conteudo,peso,esc,alinhar){
 return '<text transform="translate('+x+','+y+') scale('+(esc||1)+',1)" x="0" y="0" font-size="'+tam+'" font-family="'+ARIAL+'"'
  +' font-weight="'+(peso||"normal")+'" fill="#000"'+(alinhar?' text-anchor="'+alinhar+'"':'')+'>'+String(conteudo)+'</text>';
}
function etiquetaINMETRO(pn,p,qtd){
 const cb=p.codigoCliente+qtd;
 const hoje=new Date().toLocaleDateString("pt-BR");
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
 s+=t2(17.25, 39.3, 2.1, cb, "normal", 0.9, "middle");
 s+='<text x="39.5" y="29.8" font-size="5.5" text-anchor="middle" font-family="Segoe UI Symbol, DejaVu Sans, sans-serif" fill="#000">&#9851;</text>';
 s+=t2(39.5, 32.4, 1.8, p.origem, "bold", 0.85, "middle");
 s+='<rect x="55.4" y="7.2" width="3.6" height="3.6" rx="0.4" fill="#000"/>';
 s+=t2(57.2, 9.6, 1.7, "GM", "bold", 1, "middle").replace('fill="#000"','fill="#fff"');
 s+='<circle cx="63" cy="9" r="1.75" fill="none" stroke="#000" stroke-width="0.3"/>';
 s+=t2(63, 9.6, 1.6, "ZF", "bold", 1, "middle");
 s+='<rect x="53.6" y="12.6" width="20" height="20" fill="#fff" stroke="#000" stroke-width="0.3"/>';
 if(SELO_OK){
  s+='<image href="/selo-inmetro.png" x="53.8" y="12.8" width="19.6" height="19.6" preserveAspectRatio="xMidYMid meet"/>';
 } else {
 s+=t2(54.6, 15.2, 1.9, "Segurança", "normal", 0.9);
 s+='<circle cx="57.6" cy="21.4" r="2.3" fill="none" stroke="#000" stroke-width="0.9"/>';
 s+='<path d="M58.4 16.4h3.2l-2.6 4.6h2.6v1h-3.8l2.6-4.6h-2z" fill="#000"/>';
 s+=t2(68.2, 19.8, 2.1, "Registro", "normal", 0.9, "middle");
 s+=t2(68.2, 23.0, 2.0, p.registro, "bold", 0.8, "middle");
 s+=t2(54.6, 27.2, 1.8, "I.Q.A", "bold", 0.9);
 s+=t2(54.6, 30.6, 1.75, "OCP 0009 INMETRO", "bold", 0.85);
 }
 s+=t2(53.6, 36.0, 2.2, "SAC "+p.sac, "bold", 0.85);
 return s;
}
