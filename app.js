const express = require("express");
const { exec } = require("child_process");

const app = express();

/* =========================================================
   LISTA AS IMPRESSORAS INSTALADAS NO WINDOWS
   (funciona quando o servidor roda no próprio computador)
   ========================================================= */
app.get("/impressoras", (req, res) => {

 if (process.platform !== "win32") {
  return res.json({ local: false, impressoras: [] });
 }

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
