/**
 * Cadastro de clientes — Marques Tavares Advocacia
 * Recebe o formulário de marquestavares.com.br/cadastro.html,
 * grava na planilha, gera contrato e procuração preenchidos e avisa por e-mail.
 *
 * Configure só o bloco abaixo.
 */
const CONFIG = {
  EMAIL_AVISO: "COLE_AQUI_SEU_EMAIL",              // quem recebe o aviso de novo cadastro
  PASTA_CLIENTES: "",          // ID da pasta do Drive onde ficam as pastas dos clientes
  MODELO_CONTRATO: "",         // ID do Google Docs do contrato de honorários (com {{marcações}})
  MODELO_PROCURACAO: "",       // ID do Google Docs da procuração (com {{marcações}})
  // Opcional: contrato diferente por assunto. Deixe "" para usar o MODELO_CONTRATO.
  CONTRATO_POR_ASSUNTO: {
    "Casamento e pacto antenupcial": "",
    "Análise pré-compra de imóvel": "",
    "Divórcio": "",
    "Inventário": "",
    "Outro assunto": ""
  }
};

const COLUNAS = [
  "data_envio", "assunto", "nome", "cpf", "rg", "mae", "nacionalidade", "estado_civil", "profissao",
  "email", "whatsapp", "contato", "cep", "rua", "numero", "complemento", "bairro", "cidade", "uf",
  "relato", "tem_prazo", "prazo", "origem", "aceite", "pasta"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = Object.assign({}, e.parameter);
    d.data_envio = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
    d.nome = (d.nome || "").trim();
    d.pasta = gerarDocumentos(d);
    gravar(d);
    avisar(d);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    MailApp.sendEmail(CONFIG.EMAIL_AVISO, "Erro no cadastro do site", String(err && err.stack || err));
    return ContentService.createTextOutput("erro");
  } finally {
    lock.releaseLock();
  }
}

function gravar(d) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight("bold").setBackground("#1F3864").setFontColor("#FFFFFF");
  }
  // o apóstrofo impede o Sheets de transformar CPF/CEP em número
  aba.appendRow(COLUNAS.map(c => ["cpf", "cep", "whatsapp", "rg", "numero"].includes(c) && d[c] ? "'" + d[c] : (d[c] || "")));
}

function dataBR(iso) {
  if (!iso) return "";
  const [a, m, dd] = iso.split("-");
  return `${dd}/${m}/${a}`;
}

function marcacoes(d) {
  const endereco = [d.rua, d.numero, d.complemento, d.bairro].filter(String).join(", ") +
    `, ${d.cidade}/${d.uf}, CEP ${d.cep}`;
  const qualificacao = `${d.nome.toUpperCase()}, ${d.nacionalidade}, ${d.estado_civil}, ${d.profissao}` +
    (d.mae ? `, filho(a) de ${d.mae}` : "") +
    (d.rg ? `, portador(a) do RG nº ${d.rg}` : "") +
    `, inscrito(a) no CPF sob o nº ${d.cpf}, residente e domiciliado(a) na ${endereco}, e-mail ${d.email}, telefone ${d.whatsapp}`;
  const hoje = new Date();
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return Object.assign({}, d, {
    NOME: d.nome.toUpperCase(),
    endereco: endereco,
    qualificacao: qualificacao,
    data_hoje: `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`
  });
}

function preencher(idModelo, nomeArquivo, pasta, m) {
  const copia = DriveApp.getFileById(idModelo).makeCopy(nomeArquivo, pasta);
  const doc = DocumentApp.openById(copia.getId());
  const partes = [doc.getBody(), doc.getHeader(), doc.getFooter()].filter(Boolean);
  Object.keys(m).forEach(k => {
    const v = String(m[k] || "").replace(/\$/g, "$$$$");
    partes.forEach(p => p.replaceText("\\{\\{" + k + "\\}\\}", v));
  });
  doc.saveAndClose();
  return copia;
}

function gerarDocumentos(d) {
  if (!CONFIG.PASTA_CLIENTES) return "";
  const m = marcacoes(d);
  const raiz = DriveApp.getFolderById(CONFIG.PASTA_CLIENTES);
  const data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  const pasta = raiz.createFolder(`${data} - ${d.nome} - ${d.assunto}`);
  const contrato = CONFIG.CONTRATO_POR_ASSUNTO[d.assunto] || CONFIG.MODELO_CONTRATO;
  if (contrato) preencher(contrato, `Contrato de honorários - ${d.nome}`, pasta, m);
  if (CONFIG.MODELO_PROCURACAO) preencher(CONFIG.MODELO_PROCURACAO, `Procuração - ${d.nome}`, pasta, m);
  return pasta.getUrl();
}

function avisar(d) {
  const linhas = COLUNAS.filter(c => d[c] && c !== "aceite").map(c => `${c}: ${d[c]}`).join("\n");
  MailApp.sendEmail({
    to: CONFIG.EMAIL_AVISO,
    subject: `Novo cadastro: ${d.nome} (${d.assunto})`,
    body: `Novo cadastro recebido pelo site.\n\n${d.pasta ? "Documentos: " + d.pasta + "\n\n" : ""}${linhas}`
  });
}

/** Rode esta função uma vez pelo editor para autorizar o acesso ao Drive, Docs e Gmail. */
function autorizar() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActiveSpreadsheet();
  MailApp.getRemainingDailyQuota();
}
