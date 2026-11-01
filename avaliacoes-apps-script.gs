/**
 * Avaliações do Google — Marques Tavares Advocacia
 * Busca nota, total e avaliações do Perfil da Empresa no Google (Places API)
 * e entrega ao site em formato JSON. Guarda o resultado por 6 horas,
 * então o Google é consultado no máximo 4 vezes por dia (fica na cota gratuita).
 *
 * Configuração: Projeto → Configurações do projeto → Propriedades do script
 *   API_KEY  = a chave criada no Google Cloud
 *   PLACE_ID = o identificador do seu perfil (rode descobrirPlaceId para achar)
 */

function doGet() {
  const dados = obterAvaliacoes();
  return ContentService.createTextOutput(JSON.stringify(dados)).setMimeType(ContentService.MimeType.JSON);
}

function obterAvaliacoes() {
  const cache = CacheService.getScriptCache();
  const guardado = cache.get("avaliacoes");
  if (guardado) return JSON.parse(guardado);

  const props = PropertiesService.getScriptProperties();
  try {
    const dados = buscarNoGoogle(props.getProperty("API_KEY"), props.getProperty("PLACE_ID"));
    const texto = JSON.stringify(dados);
    cache.put("avaliacoes", texto, 21600);          // 6 horas
    props.setProperty("ULTIMO_RESULTADO", texto);   // reserva, se o Google falhar
    return dados;
  } catch (e) {
    const reserva = props.getProperty("ULTIMO_RESULTADO");
    return reserva ? JSON.parse(reserva) : { erro: true };
  }
}

function buscarNoGoogle(chave, placeId) {
  const url = "https://places.googleapis.com/v1/places/" + encodeURIComponent(placeId) + "?languageCode=pt-BR";
  const resp = UrlFetchApp.fetch(url, {
    headers: {
      "X-Goog-Api-Key": chave,
      "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews"
    },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) throw new Error(resp.getContentText());
  const p = JSON.parse(resp.getContentText());
  return {
    nota: p.rating || null,
    total: p.userRatingCount || 0,
    link: p.googleMapsUri || "",
    atualizado: new Date().toISOString(),
    avaliacoes: (p.reviews || []).map(r => ({
      nome: (r.authorAttribution || {}).displayName || "Cliente",
      foto: (r.authorAttribution || {}).photoUri || "",
      perfil: (r.authorAttribution || {}).uri || "",
      estrelas: r.rating || 0,
      quando: r.relativePublishTimeDescription || "",
      texto: ((r.originalText || r.text) || {}).text || "",
      link: r.googleMapsUri || ""
    }))
  };
}

/**
 * Rode esta função uma vez pelo editor (botão Executar) para descobrir o PLACE_ID.
 * O resultado aparece no "Registro de execução", embaixo.
 */
function descobrirPlaceId() {
  const chave = PropertiesService.getScriptProperties().getProperty("API_KEY");
  const resp = UrlFetchApp.fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "post",
    contentType: "application/json",
    headers: { "X-Goog-Api-Key": chave, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress" },
    payload: JSON.stringify({ textQuery: "Marques Tavares Advocacia", languageCode: "pt-BR", includePureServiceAreaBusinesses: true }),
    muteHttpExceptions: true
  });
  Logger.log(resp.getContentText());
}

/** Rode para testar: mostra no registro o que o site vai receber e limpa o cache. */
function testar() {
  CacheService.getScriptCache().remove("avaliacoes");
  Logger.log(JSON.stringify(obterAvaliacoes(), null, 2));
}
