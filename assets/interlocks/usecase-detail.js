const $ = (selector) => document.querySelector(selector);

function element(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (attrs) Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

function detailUrl(diagramId, useCaseId) {
  const url = new URL(window.location.href);
  url.searchParams.set('diagram', diagramId);
  url.searchParams.set('usecase', useCaseId);
  return url.href;
}

function stage(title, values, color) {
  const card = element('section', { className: 'network-drilldown__pillar' });
  card.style.setProperty('--drill-color', color);
  card.append(element('h2', { text: title }), ...values.map((value) => element('span', { text: value })));
  return card;
}

function guidanceSection(title, values) {
  const section = element('section', { className: 'usecase-detail__guidance' });
  section.append(element('h2', { text: title }));
  const list = element('ul');
  list.append(...values.map(value => element('li', { text: value })));
  section.append(list);
  return section;
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    $('#page-status').textContent = 'Direct workflow link copied.';
  } catch {
    $('#page-status').textContent = 'Use this page URL to share the workflow.';
  }
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const diagramId = params.get('diagram') ?? 'network';
  const registry = { network: window.NETWORK_DRILLDOWNS ?? [], ...(window.DOMAIN_DRILLDOWNS ?? {}) };
  const useCases = registry[diagramId] ?? [];
  const item = useCases.find(({ id }) => id === params.get('usecase')) ?? useCases[0];
  const diagram = window.INTERLOCK_CATALOG?.diagrams.find(({ id }) => id === diagramId);
  if (!item || !diagram) {
    document.title = 'Interlock not found — OCTO Observability Atlas';
    $('#usecase-detail').append(element('h1', { text: 'That interlock could not be found.' }), element('a', { className: 'interlock-button interlock-button--primary', text: 'Return to all interlocks', attrs: { href: 'interlocks.html' } }));
    return;
  }
  const index = useCases.indexOf(item);
  const artifactBase = `assets/diagrams/usecases/${diagramId}/${item.id}`;
  const flow = element('div', { className: 'network-drilldown__flow usecase-detail__flow', attrs: { 'aria-label': `${item.title} service flow` } });
  [["Foundation evidence", item.sources, '#C79200'], ['Observability handoff', item.services, '#145CA8'], ['Operational outcome', [item.outcome], '#256D3F']].forEach(([title, values, color], stageIndex) => {
    flow.append(stage(title, values, color));
    if (stageIndex < 2) flow.append(element('span', { className: 'network-drilldown__arrow', text: '→', attrs: { 'aria-hidden': 'true' } }));
  });
  const guided = element('ol', { className: 'network-drilldown__steps' });
  guided.append(...item.steps.map((step) => element('li', { text: step })));
  const governance = element('div', { className: 'usecase-detail__governance' });
  governance.append(
    guidanceSection('System prerequisites', item.prerequisites),
    guidanceSection('Distributed correlation keys', item.correlationKeys),
    guidanceSection('Empty-result caveat', [item.emptyResult]),
  );
  const sequence = element('nav', { className: 'network-drilldown__sequence', attrs: { 'aria-label': 'Workflow navigation' } });
  sequence.append(
    index > 0 ? element('a', { className: 'network-drilldown__copy-link', text: 'Previous workflow', attrs: { href: detailUrl(diagramId, useCases[index - 1].id) } }) : element('span'),
    element('span', { text: `Workflow ${index + 1} of ${useCases.length}` }),
    index < useCases.length - 1 ? element('a', { className: 'network-drilldown__copy-link', text: 'Next workflow', attrs: { href: detailUrl(diagramId, useCases[index + 1].id) } }) : element('span'),
  );
  const actions = element('div', { className: 'network-drilldown__actions' });
  const copy = element('button', { className: 'network-drilldown__copy-link', text: 'Copy direct link', attrs: { type: 'button' } });
  copy.addEventListener('click', copyLink);
  actions.append(
    copy,
    element('a', { className: 'network-drilldown__copy-link', text: 'Draw.io', attrs: { href: `${artifactBase}.drawio`, download: '' } }),
    element('a', { className: 'network-drilldown__copy-link', text: 'Excalidraw', attrs: { href: `${artifactBase}.excalidraw`, download: '' } }),
    element('a', { className: 'network-drilldown__copy-link', text: 'PDF', attrs: { href: `${artifactBase}.pdf`, download: '' } }),
  );
  const navigator = element('nav', { className: 'usecase-detail__navigator', attrs: { 'aria-label': 'All workflows in this domain' } });
  navigator.append(element('h2', { text: 'All workflows in this domain' }));
  const workflowList = element('ol');
  workflowList.append(...useCases.map((useCase, useCaseIndex) => {
    const listItem = element('li');
    const link = element('a', {
      text: `${String(useCaseIndex + 1).padStart(2, '0')}  ${useCase.title}`,
      attrs: { href: detailUrl(diagramId, useCase.id), 'aria-current': useCase.id === item.id ? 'page' : 'false' },
    });
    listItem.append(link);
    return listItem;
  }));
  navigator.append(workflowList);
  document.title = `${item.title} — ${diagram.title}`;
  $('#detail-back').href = `interlocks.html?diagram=${encodeURIComponent(diagramId)}&usecase=${encodeURIComponent(item.id)}`;
  $('#usecase-detail').replaceChildren(
    element('p', { className: 'network-drilldown__kicker', text: `${diagram.sheetName} / workflow ${String(index + 1).padStart(2, '0')}` }),
    element('h1', { text: item.title, attrs: { id: 'detail-title' } }),
    element('p', { className: 'usecase-detail__trigger', text: `Trigger · ${item.trigger}` }),
    flow,
    element('section', { className: 'usecase-detail__response' }),
    governance,
    element('p', { className: 'network-drilldown__outcome', text: `Outcome · ${item.outcome}` }),
    sequence,
    actions,
    navigator,
  );
  const response = $('.usecase-detail__response');
  response.append(element('h2', { text: 'Guided response' }), guided);
}

render();
