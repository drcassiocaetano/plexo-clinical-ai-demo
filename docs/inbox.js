const copy = {
  en: {
    kicker: 'Clinical product work sample · Fictional messages', headline: 'After the visit',
    lede: 'Three messages arrive at the clinic. Choose who should handle each one and follow it through to review.',
    inbox: 'Inbox', original: 'Original message · PT-BR', route: 'Who should handle this?',
    front: 'Front desk', doctor: 'Physician', fresh: 'New', done: 'Reviewed',
    pending: 'Awaiting review', received: 'Assigned to', reviewed: 'Reviewed by',
    finish: 'Record simulated review', next: 'Open next message', restart: 'Start again',
    progress: 'messages reviewed', completed: 'All three messages have been reviewed.',
    notesLabel: 'Product decision', notesTitle: 'Ownership after handoff',
    notesCopy: 'An incoming exam still needs someone to read it. The prototype keeps each item open after assignment until the person responsible reviews it. All actions are simulated in this browser.',
    artwork: 'View the original Portuguese artwork', work: 'Read the physician’s clinical note evaluation'
  },
  pt: {
    kicker: 'Portfólio de produto clínico · Mensagens fictícias', headline: 'Depois da consulta',
    lede: 'Três mensagens chegaram ao consultório. Escolha quem cuida de cada uma e acompanhe até a revisão.',
    inbox: 'Caixa de entrada', original: 'Mensagem original · PT-BR', route: 'Quem deve cuidar desta mensagem?',
    front: 'Secretaria', doctor: 'Médico', fresh: 'Nova', done: 'Revisada',
    pending: 'Aguardando revisão', received: 'Responsável', reviewed: 'Revisada por',
    finish: 'Registrar revisão simulada', next: 'Abrir próxima mensagem', restart: 'Recomeçar',
    progress: 'mensagens revisadas', completed: 'As três mensagens passaram por revisão.',
    notesLabel: 'Decisão de produto', notesTitle: 'Quem acompanha até o fim',
    notesCopy: 'Um exame recebido ainda precisa ser lido. No protótipo, cada mensagem continua pendente depois do encaminhamento até a pessoa responsável registrar a revisão. Todas as ações são simuladas neste navegador.',
    artwork: 'Ver as artes originais em português', work: 'Ler a revisão médica de uma evolução gerada por IA'
  }
};

const cases = [
  {
    quote: '“Vocês podem me enviar o recibo da consulta?”', translation: '“Could you send me the receipt for my visit?”', owner: 'front',
    en: {subject:'Visit receipt', hint:'Use the administrative queue for this request.', retry:'The front desk can handle a receipt. Try assigning it there.', detail:'The front desk checks the receipt request. It remains open until someone reviews it.'},
    pt: {subject:'Recibo da consulta', hint:'Este pedido pode ser resolvido pela equipe administrativa.', retry:'A secretaria pode cuidar do recibo. Encaminhe o pedido para ela.', detail:'A secretaria confere o pedido de recibo. Ele continua pendente até a revisão da equipe.'}
  },
  {
    quote: '“Saiu o exame. Mandando aqui pra o senhor ver.”', translation: '“My test result is back. I’m sending it for you to review.”', owner: 'doctor',
    en: {subject:'Test result received', hint:'The sender has asked for the result to be reviewed.', retry:'The front desk can acknowledge receipt. A physician still needs to review the result.', detail:'The result is in the physician’s queue. Receipt alone does not complete the review.'},
    pt: {subject:'Resultado de exame', hint:'A mensagem pede que o resultado seja avaliado.', retry:'A secretaria pode confirmar o recebimento. A avaliação do resultado cabe ao médico.', detail:'O resultado está na fila do médico. O recebimento, por si só, deixa a revisão pendente.'}
  },
  {
    quote: '“Doutor, lembrei agora — aquele remédio pode dar enjoo?”', translation: '“Doctor, I just remembered. Could that medication cause nausea?”', owner: 'doctor',
    en: {subject:'Medication question', hint:'The patient has not named the medication.', retry:'The drug is unspecified. Keep the question open for the physician.', detail:'The physician needs the medication name and relevant context before replying. The prototype sends no medical advice.'},
    pt: {subject:'Dúvida sobre medicação', hint:'A mensagem não identifica qual é o medicamento.', retry:'O remédio não foi identificado. Encaminhe a pergunta para revisão médica.', detail:'O médico precisa identificar o medicamento e conferir o contexto antes de responder. O protótipo não envia orientação.'}
  }
];

const get = id => document.getElementById(id);
const storageKey = 'plexo.work-sample.inbox.v1';
const steps = ['new', 'assigned', 'reviewed'];
let lang = 'en';
let selected = 0;
let statuses = cases.map(() => 'new');
let feedback = '';

try {
  const saved = JSON.parse(sessionStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.statuses) && saved.statuses.length === cases.length && saved.statuses.every(step => steps.includes(step))) {
    statuses = saved.statuses;
    if (Number.isInteger(saved.selected) && cases[saved.selected]) selected = saved.selected;
    if (saved.lang === 'pt') lang = 'pt';
  }
} catch { /* The demo can also run without browser storage. */ }

function persist() {
  try { sessionStorage.setItem(storageKey, JSON.stringify({ statuses, selected, lang })); } catch { /* Storage is optional. */ }
}
function label(step) {
  return copy[lang][{new:'fresh', assigned:'pending', reviewed:'done'}[step]];
}
function choose(i) {
  selected = i;
  feedback = '';
  persist();
  render();
}
function action(labelText, run) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = labelText;
  button.addEventListener('click', run);
  get('actions').append(button);
}
function transition(step) {
  statuses[selected] = step;
  feedback = '';
  persist();
  render();
  get('action-title').focus();
}
function route(owner) {
  if (owner === cases[selected].owner) {
    transition('assigned');
  } else {
    feedback = cases[selected][lang].retry;
    get('feedback').textContent = feedback;
  }
}
function render() {
  const t = copy[lang];
  const item = cases[selected];
  const local = item[lang];
  const state = statuses[selected];
  const count = statuses.filter(s => s === 'reviewed').length;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.title = t.headline + ' · Plexo Clínico';
  get('language').value = lang;
  for (const [id, value] of Object.entries({
    kicker:t.kicker, headline:t.headline, lede:t.lede, 'inbox-title':t.inbox, 'msg-label':t.original,
    subject:local.subject, quote:item.quote, translation:lang === 'en' ? item.translation : '',
    state:label(state), feedback, progress:count === cases.length ? t.completed : count + '/3 ' + t.progress,
    restart:t.restart, 'notes-label':t.notesLabel, 'notes-title':t.notesTitle, 'notes-copy':t.notesCopy,
    'art-link':t.artwork, 'case-link':t.work
  })) get(id).textContent = value;
  get('list').replaceChildren();
  cases.forEach((entry, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item';
    button.setAttribute('aria-pressed', String(i === selected));
    button.append(document.createTextNode(entry[lang].subject));
    const small = document.createElement('small');
    small.textContent = label(statuses[i]);
    button.append(small);
    button.addEventListener('click', () => { choose(i); get('subject').focus(); });
    get('list').append(button);
  });
  get('actions').replaceChildren();
  get('feedback').textContent = feedback;
  if (state === 'new') {
    get('action-title').textContent = t.route;
    get('prompt').textContent = local.hint;
    action(t.front, () => route('front'));
    action(t.doctor, () => route('doctor'));
  } else {
    const owner = t[item.owner];
    get('action-title').textContent = (state === 'assigned' ? t.received : t.reviewed) + ' · ' + owner;
    get('prompt').textContent = state === 'assigned' ? local.detail : '';
    if (state === 'assigned') action(t.finish, () => transition('reviewed'));
    else if (count !== cases.length) {
      action(t.next, () => { choose(statuses.findIndex(s => s !== 'reviewed')); get('subject').focus(); });
    }
  }
}
get('subject').tabIndex = -1;
get('action-title').tabIndex = -1;
get('language').addEventListener('change', e => {
  lang = e.target.value === 'pt' ? 'pt' : 'en';
  feedback = '';
  persist();
  render();
});
get('restart').addEventListener('click', () => { statuses = cases.map(() => 'new'); choose(0); get('subject').focus(); });
render();
