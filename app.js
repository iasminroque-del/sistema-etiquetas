const express = require("express");

const app = express();

app.get("/", (req, res) => {

res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Sistema de Etiquetas</title>

<script 
src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

<script 
src="https://unpkg.com/bwip-js/dist/bwip-js-min.js"></script>

<style>

body{
    font-family: Arial;
    background: #f4f6f9;
    padding: 30px;
}

.card{
    background: white;
    max-width: 1200px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
}

label{
    font-weight: bold;
}

select,input{
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    margin-bottom: 15px;
}

button{
    background:#0078d4;
    color:white;
    border:none;
    padding:12px 20px;
    cursor:pointer;
    border-radius:4px;
}

.preview{
    background:white;
    margin-top:20px;
}

/* GM */

#layoutGM{
    width:75mm;
    height:50mm;
    padding-top:15px;
    box-sizing:border-box;
    overflow:hidden;
    display:none;
    background:white;
}

.gm-barcode{
    width:100%;
    display:flex;
    justify-content:center;
    align-items:center;
    margin-top:2px;
    margin-bottom:4px;
    margin-left:-30px;
}

#barcodeGM{
    width:180px;
    height:30px;
    
}

.gm-linha{
    display:flex;
    justify-content:space-between;
}

.gm-info{
    width:70%;
    margin-left:10mm;
}

.codigoGM{
    font-family: Arial Black, Arial, sans-serif
    font-size:18px;
    font-weight:900;
    margin-top:2px;
}

.qtyGM{
font-family: Arial Black, Arial, sans-serif;
    font-size:12px;
    font-weight:900;
    margin-top:6px;
}

.descricaoGM{
font-family: Arial Black, Arial, sans-serif;
letter-spacing:-0.3px;
    font-size:10px;
    font-weight:900;
    margin-top:3px;
}

.gm-datamatrix{
    width:23%;
    
}

#datamatrixGM{
    width:55=px;
    height:55px;
    margin-right:20px;
    scale: 0.8;
}

@media print {

    html,
    body{
        width:75mm;
        height:50mm;
        margin:0;
        padding:0;
        overflow:hidden;
    }

    body *{
        visibility:hidden;
    }

    body.imprimirGM #layoutGM,
    body.imprimirGM #layoutGM *{
        visibility:visible;
    }

    #layoutGM{
        position:absolute;
        left:0;
        top:0;
        border:none !important;
        page-break-after:avoid;
    width:100%;
    height:100%;
 }
}

@page{
    size:75mm 50mm;
    margin:0;
}


/* INMETRO */

#layoutINMETRO{
    width:90mm;
    height:79mm;
    border:none;
    display:none;
    overflow:hidden;
    background:white;

    display:flex;
}

.inmetro-esquerda{
    width:6mm;
    border-right:2px solid black;
    padding-right:0;
}

#inmetroQuantidade{
    font-size:11px;
    font-weight:bold;
    writing-mode:vertical-rl;
    transform:rotate(180deg);

    position:relative;
    left:2.5mm;
    top:2mm;
}

#inmetroCodigoCliente{
    font-size:20px;
    font-weight:bold;
    writing-mode:vertical-rl;
    transform:rotate(180deg);
    margin-top:35mm;
}

.inmetro-direita{
    flex:1;
    padding:2mm;
}

.inmetroProduto{
	font-size:16px;
	font-weight:bold;
	margin-bottom:2mm;
}

.inmetroTexto{
    font-size:9px;
    line-height:1.2;
}

#barcodeINMETRO{
    width:100px;
    height:25px;
    margin-top:5px;

    position:relative;
    top:-1mm;
}

.inmetro-topo{
    margin-bottom:2mm;
}

#conteudoINMETRO{
    transform:rotate(-90deg);
    transform-origin:top left;

    position:relative;

    left:-1mm;
    top:70mm;

    width:70mm;
}

#inmetroDescricaoEN,
#inmetroDescricaoPT{
    font-size:12px;
    font-weight:bold;

    position:relative;
    top:-2mm;
}

#inmetroOrigem,
#inmetroRegistro,
#inmetroSac{
    display:none;
}

#inmetroFabricante,
#inmetroEndereco,
#inmetroCidade,
#inmetroCnpj{
    position:relative;
    left:1mm;
    top:-1mm;
}

#linhaData{
    display:flex;
    align-items:center;
    gap:6.5mm;

    font-size:8px;
    font-weight:bold;
}

#inmetroData{
    font-size:8px;
    font-weight:bold;

    position:relative;

    left:1mm;
}

#inmetroCodigoRastreio{
    font-size:8px;
    font-weight:bold;

    position:relative;

    left:0mm;
}




</style>

</head>

<body>

<div class="card">

<h1>Sistema de Etiquetas</h1>

<label>Cliente</label>

<select id="cliente" onchange="atualizarProdutos()">
</select>

<label>Produto</label>

<select id="produto" onchange="atualizarPreview()">
</select>

<label>Impressora</label>

<select>
    <option>LIMP00121</option>
    <option>Zebra Linha 2</option>
</select>

<div id="campoGM">

    <label>Quantidade de Etiquetas</label>

    <input id="qtdeEtiquetas"
           type="number"
           value="1"
           min="1"
           oninput="atualizarPreview()">

</div>
<div id="campoINMETRO" style="display:none;">

    <label>Quantidade do Kit</label>

    <select id="tipoKit" onchange="atualizarPreview()">
        <option value="1">1 KIT / UNIT</option>
        <option value="8">8 KIT / UNIT</option>
    </select>

</div>


<div id="campoTipoGM">

    <label>Múltiplo</label>

    <select id="tipoQuantidade" onchange="atualizarPreview()">
        <option value="0008">0008</option>
        <option value="01">01</option>
    </select>

</div>


<button onclick="imprimirEtiqueta()">
    Imprimir
</button>

<hr>

<h3>Pré-visualização da Etiqueta</h3>

<div class="preview">

<div id="layoutGM">

    <div class="gm-barcode">
        <svg id="barcodeGM"></svg>
    </div>

    <div class="gm-linha">

        <div class="gm-info">

            <div class="codigoGM" id="gmCodigo"></div>

            <div class="qtyGM" id="gmQuantidade"></div>

            <div class="descricaoGM" id="gmDescricaoPT"></div>

            <div class="descricaoGM" id="gmDescricaoES"></div>

            <div class="descricaoGM" id="gmDescricaoEN"></div>

        </div>

        <div class="gm-datamatrix">

            <canvas
                id="datamatrixGM"
                width="90"
                height="90">
            </canvas>

        </div>

    </div>

</div>



<div id="layoutINMETRO">

	<div class="inmetro-esquerda">

        <div id="inmetroQuantidade">
            1 KIT / UNIT
        </div>

        <div id="inmetroCodigoCliente"></div>

    </div>


    <div class="inmetro-direita">

<div id="conteudoINMETRO">



<div class="inmetro-topo">

    <div class="inmetro-selo"></div>

</div>

<div
    class="inmetroProduto"
    id="inmetroCodigoProduto">
</div>

      <div
    	class="inmetroDescricao"
    	id="inmetroDescricaoEN">
     </div>


       <div
	  class="inmetroDescricao"
	  id="inmetroDescricaoPT">
       </div>

        <div
            class="inmetroTexto"
            id="inmetroFabricante">
        </div>

        <div
            class="inmetroTexto"
            id="inmetroEndereco">
        </div>

        <div
            class="inmetroTexto"
            id="inmetroCidade">
        </div>

        <div
            class="inmetroTexto"
            id="inmetroCnpj">
        </div>
<div
    class="inmetroTexto"
    id="inmetroOrigem">
</div>

<div
    class="inmetroTexto"
    id="inmetroRegistro">
</div>

<div
    class="inmetroTexto"
    id="inmetroSac">
</div>

<div id="linhaData">

    <span id="inmetroData"></span>

    <span id="inmetroCodigoRastreio"></span>

</div>
        <svg id="barcodeINMETRO"></svg>

    </div>



</div>

</div>

</div>

<script>

const dados = {

    GM: {

        produtos: {

            "52171287": {
                descricaoPT: 'PASTILHAS 14"',
		descricaoEN: 'PADS 14"',
		descricaoES: 'PASTILLAS 14"'
            },

            "52171288": {
                descricaoPT: 'PASTILHAS 15"',
		descricaoEN: 'PADS 15"',
		descricaoES: 'PASTILLAS 15"'
            }

        }

    },

    INMETRO: {

        produtos: {

            "A038M863": {

                codigoCliente: "52171287",
		
		quantidade: "1 KIT / UNIT",

                descricaoEN:
                "PADS KIT, DISC BRAKE",

                descricaoPT:
                "CJ DE PASTILHAS, FREIO A DISCO",

                fabricante:
                "ZF AUTOMOTIVE",

                endereco:
                "VIA ANHANGUERA KM 147",

                cidade:
                "13486-915 LIMEIRA SP BRAZIL",

                cnpj:
                "CNPJ 60.857.349/0001 76",

registro: "004484/2019",

sac: "0800 0111 100",

origem: "MADE IN MEXICO"


            }

        }

    }

};

function carregarClientes(){

    const cliente =
        document.getElementById("cliente");

    Object.keys(dados).forEach(nome => {

        let option =
            document.createElement("option");

        option.value = nome;
        option.text = nome;

        cliente.appendChild(option);

    });

}

function imprimirEtiqueta(){

    const cliente =
        document.getElementById("cliente").value;

    if(cliente === "GM"){

        document.body.className =
            "imprimirGM";

        window.print();

        return;

    }

    imprimirINMETRO();

}
function imprimirINMETRO(){

    const etiqueta =
        document.getElementById(
            "layoutINMETRO"
        ).outerHTML;

    const janela =
        window.open("", "_blank");

    janela.document.write(
        '<html>' +
        '<body style="margin:0;">' +
        etiqueta +
        '</body>' +
        '</html>'
    );

    janela.document.close();

    janela.print();

}

function atualizarProdutos(){

    const cliente =
        document.getElementById("cliente").value;

    const produto =
        document.getElementById("produto");

    produto.innerHTML = "";

    Object.keys(
        dados[cliente].produtos
    ).forEach(codigo => {

        let option =
            document.createElement("option");

        option.value = codigo;
        option.text = codigo;

        produto.appendChild(option);

    });

    atualizarPreview();

}

function atualizarPreview(){

    const cliente =
        document.getElementById("cliente").value;



	if(cliente === "GM"){

	document.getElementById("campoGM")
          .style.display = "block";

	document.getElementById("campoINMETRO")
          .style.display = "none";

	document.getElementById("campoTipoGM")
	  .style.display = "block";
}


	if(cliente === "INMETRO"){

	document.getElementById("campoGM")
          .style.display = "none";

	document.getElementById("campoINMETRO")
          .style.display = "block";

	document.getElementById("campoTipoGM")
	  .style.display = "none";
}


    const produto =
        document.getElementById("produto").value;

    const qtdeEtiquetas =
        document.getElementById("qtdeEtiquetas").value;

    const tipoQuantidade =
    	document.getElementById("tipoQuantidade").value;

    document.getElementById("layoutGM")
        .style.display = "none";

    document.getElementById("layoutINMETRO")
        .style.display = "none";



    if(cliente === "GM"){

        const produtoInfo =
            dados.GM.produtos[produto];

        document.getElementById("layoutGM")
            .style.display = "block";

        document.getElementById("gmCodigo")
            .innerText = "GM#" + produto;

     if(tipoQuantidade === "0008"){

         document.getElementById("gmQuantidade")
            .innerText =
            "QTY. 0008";

}

      if(tipoQuantidade === "01"){

          document.getElementById("gmQuantidade")
           .innerText =
           "QTY. 01 UNID/UNIT";
}

        document.getElementById("gmDescricaoPT")
    	    .innerText =
            produtoInfo.descricaoPT;

	document.getElementById("gmDescricaoEN")
            .innerText =
            produtoInfo.descricaoEN;

	document.getElementById("gmDescricaoES")
           .innerText =
            produtoInfo.descricaoES;

	console.log("Gerando barcode para:", produto);

	JsBarcode(
    		"#barcodeGM",
    		produto,
    		{
       			format: "CODE128",
        		width: 1.2,
        		height: 25,
        		displayValue: false,
			margin: 0
    		}
	);
	const conteudoDataMatrix =
	"CODIGO:" + produto +
	"|PT:" + produtoInfo.descricaoPT +
	"|EN:" + produtoInfo.descricaoEN +
	"|ES:" + produtoInfo.descricaoES;

	bwipjs.toCanvas(
    	"datamatrixGM",
    	{
        bcid: "datamatrix",
        text: conteudoDataMatrix,
        scale: 1
    }
);

	console.log("barcode criado");
	}

    if(cliente === "INMETRO"){

        const produtoInfo =
            dados.INMETRO.produtos[produto];

        document.getElementById("layoutINMETRO")
            .style.display = "flex";

        document.getElementById("inmetroCodigoCliente")
            .innerText =
            produtoInfo.codigoCliente;

        document.getElementById("inmetroCodigoProduto")
            .innerText =
            produto;

        document.getElementById("inmetroDescricaoEN")
            .innerText =
            produtoInfo.descricaoEN;

        document.getElementById("inmetroDescricaoPT")
            .innerText =
            produtoInfo.descricaoPT;

        document.getElementById("inmetroFabricante")
            .innerText =
            produtoInfo.fabricante;

        document.getElementById("inmetroEndereco")
            .innerText =
            produtoInfo.endereco;

        document.getElementById("inmetroCidade")
            .innerText =
            produtoInfo.cidade;

        document.getElementById("inmetroCnpj")
            .innerText =
            produtoInfo.cnpj;

const tipoKit =
    document.getElementById("tipoKit").value;

document.getElementById("inmetroQuantidade")
    .innerText =
    tipoKit + " KIT / UNIT";

document.getElementById("inmetroOrigem")
    .innerText =
    produtoInfo.origem;

document.getElementById("inmetroRegistro")
    .innerText =
    produtoInfo.registro;

document.getElementById("inmetroSac")
    .innerText =
    produtoInfo.sac;

const hoje = new Date();

const dataFormatada =
    String(hoje.getDate()).padStart(2,'0') + "/" +
    String(hoje.getMonth() + 1).padStart(2,'0') + "/" +
    hoje.getFullYear();

document.getElementById("inmetroData")
    .innerText = dataFormatada;


/* Semana do ano */

const inicioAno =
    new Date(hoje.getFullYear(), 0, 1);

const dias =
    Math.floor(
        (hoje - inicioAno) /
        (24 * 60 * 60 * 1000)
    );

const semana =
    Math.ceil(
        (dias + inicioAno.getDay() + 1) / 7
    );

/* Turno */

const hora = hoje.getHours();

let turno = 1;

if(hora >= 14 && hora < 22){
    turno = 2;
}

if(hora >= 22 || hora < 6){
    turno = 3;
}

/* Tabela ZF */

const tabelaTurnos = {

    1: ["X","A","D","G","M","Q","U"],

    2: ["Y","B","E","J","N","R","V"],

    3: ["Z","C","F","K","P","T","W"]

};

const diaSemana =
    hoje.getDay();

const letraDia =
    tabelaTurnos[turno][diaSemana];

/* Letra do Ano */

const letrasAno = {

    2024: "M",
    2025: "N",
    2026: "P"

};

const letraAno =
    letrasAno[hoje.getFullYear()] || "";

/* Monta o código */

const semanaTexto =
    semana.toString().padStart(2,"0");

const codigoData =

    semanaTexto.charAt(0) +

    letraDia +

    semanaTexto.charAt(1) +

    letraAno;

document.getElementById(
    "inmetroCodigoRastreio"
).innerText =
    codigoData;


	JsBarcode(
    	     "#barcodeINMETRO",
              produtoInfo.codigoCliente,
              {
                format:"CODE128",
                width:1,
                height:25,
                displayValue:false,
                margin:0
    	      }
);



    }

}

window.onload = function(){

    carregarClientes();

    atualizarProdutos();

};

</script>

</body>

</html>

`);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Servidor iniciado");

});
