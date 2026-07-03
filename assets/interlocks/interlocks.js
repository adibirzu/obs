const state = Object.seal({
  catalog: null,
  scenarios: Object.freeze([]),
  activeDiagramId: 'network',
  query: '',
  domain: 'active',
  category: 'all',
});
let previousFocus = null;

const categoryColors = Object.freeze({
  'Core observability': '#145CA8',
  'Advanced analytics': '#6A3D9A',
  'Governance and optimization': '#256D3F',
  'Network foundation': '#C79200',
  'Network and security': '#B3261E',
  'Network diagnostics': '#E66C1A',
  'Security foundation': '#B3261E',
  'Identity and governance': '#6A3D9A',
  'Cloud foundation': '#D85B19',
  'Lifecycle operations': '#176B65',
  'Integration and automation': '#7651A8',
});

const $ = (selector) => document.querySelector(selector);

function element(tag, options = {}) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.attrs) Object.entries(options.attrs).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

function replaceChildren(target, children) {
  target.replaceChildren(...children);
  return target;
}

function diagramById(id) {
  return state.catalog.diagrams.find((diagram) => diagram.id === id);
}

function domainLabel(id) {
  return diagramById(id)?.sheetName.replace(/^\d+\s*-\s*/, '') ?? id;
}

function buildTabs() {
  const tabs = state.catalog.diagrams.map((diagram, index) => {
    const selected = diagram.id === state.activeDiagramId;
    const button = element('button', {
      className: 'diagram-tab',
      text: `${String(index + 1).padStart(2, '0')}  ${domainLabel(diagram.id)}`,
      attrs: {
        id: `diagram-tab-${diagram.id}`,
        type: 'button',
        role: 'tab',
        'aria-selected': String(selected),
        'aria-controls': 'architecture-board',
        tabindex: selected ? '0' : '-1',
        'data-diagram-id': diagram.id,
      },
    });
    button.style.setProperty('--tab-accent', diagram.accent);
    button.addEventListener('click', () => selectDiagram(diagram.id));
    button.addEventListener('keydown', handleTabKeydown);
    return button;
  });
  replaceChildren($('#diagram-tabs'), tabs);
}

function handleTabKeydown(event) {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const current = tabs.indexOf(event.currentTarget);
  let next = current;
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tabs.length - 1;
  else return;
  event.preventDefault();
  selectDiagram(tabs[next].dataset.diagramId, { focusTab: true });
}

function legendKey(item) {
  const key = element('span', { className: 'legend-key' });
  const swatch = element('i');
  swatch.style.setProperty('--key-color', item.color);
  key.append(swatch, document.createTextNode(item.label));
  return key;
}

const networkUseCaseByGroup = Object.freeze({
  'Core network': 'flow-logs',
  'Network security': 'firewall-waf',
  'Traffic orchestration': 'load-balancer',
  Connectivity: 'hybrid-connectivity',
  'Testing and troubleshooting': 'path-analyzer',
});

function detailUrl(diagramId, useCaseId) {
  const url = new URL('interlock-detail.html', window.location.href);
  url.searchParams.set('diagram', diagramId);
  url.searchParams.set('usecase', useCaseId);
  return url.href;
}

function flowCard(group, color, useCaseId = null, diagramId = null) {
  const card = element('section', { className: 'flow-card' });
  const title = element('strong', { text: group.title });
  const list = element('ul');
  group.items.slice(0, 5).forEach((item) => list.append(element('li', { text: item })));
  card.style.setProperty('--flow-color', color);
  card.append(title, list);
  if (group.signals) card.append(element('div', { className: 'flow-card__signals', text: `Signals · ${group.signals.join(' · ')}` }));
  if (useCaseId) {
    const button = element('a', {
      className: 'flow-card__drilldown',
      text: 'Follow this workflow →',
      attrs: { href: detailUrl(diagramId, useCaseId), 'data-usecase-id': useCaseId, 'aria-label': `Follow the ${group.title} workflow` },
    });
    card.append(button);
  }
  return card;
}

function flowColumn(title, groups, color, useCaseLookup = () => null, diagramId = null) {
  const column = element('section', { className: 'flow-column' });
  column.style.setProperty('--flow-color', color);
  const stack = element('div', { className: 'flow-stack' });
  groups.forEach((group, index) => stack.append(flowCard(group, color, useCaseLookup(group, index), diagramId)));
  column.append(element('h4', { text: title }), stack);
  return column;
}

function controlGroups(diagram) {
  const categories = new Map();
  diagram.serviceRefs.map((id) => state.catalog.services.find((service) => service.id === id)).filter(Boolean).forEach((service) => {
    const current = categories.get(service.category) ?? [];
    categories.set(service.category, [...current, service.name]);
  });
  return [...categories.entries()].slice(0, 6).map(([title, items]) => ({ title, items: items.slice(0, 6), signals: ['collect', 'correlate', 'analyze'] }));
}

function renderDiagram() {
  const diagram = diagramById(state.activeDiagramId);
  const index = state.catalog.diagrams.findIndex(({ id }) => id === diagram.id) + 1;
  $('.architecture-board').style.setProperty('--board-accent', diagram.accent);
  $('#diagram-index').textContent = `SHEET ${String(index).padStart(2, '0')} / 06`;
  $('#diagram-title').textContent = diagram.title;
  $('#diagram-subtitle').textContent = diagram.subtitle;
  $('#diagram-purpose').textContent = diagram.purpose;
  $('#architecture-board').setAttribute('aria-labelledby', `diagram-tab-${diagram.id}`);
  replaceChildren($('#diagram-legend'), diagram.legend.map(legendKey));

  const flow = [
    flowColumn('Foundation and signal sources', diagram.sourceGroups, diagram.accent, (group, index) => diagram.id === 'network'
      ? networkUseCaseByGroup[group.title]
      : (interlockUseCases[diagram.id] ?? [])[index]?.id, diagram.id),
    element('div', { className: 'flow-arrow', text: '→', attrs: { 'aria-hidden': 'true' } }),
    flowColumn('Observability control plane', controlGroups(diagram), '#145CA8'),
    element('div', { className: 'flow-arrow', text: '→', attrs: { 'aria-hidden': 'true' } }),
    flowColumn('Operations and governance outcomes', diagram.outcomeGroups, '#256D3F'),
  ];
  replaceChildren($('#architecture-flow'), flow);
  replaceChildren($('#workflow-list'), diagram.workflows.map((step) => element('li', { text: step })));
  const useCases = interlockUseCases[diagram.id] ?? [];
  replaceChildren($('#example-list'), diagram.examples.map((example, index) => {
    const useCaseId = useCases[index]?.id;
    const item = element('li');
    if (!useCaseId) return item;
    const button = element('a', {
      className: 'example-drilldown',
      text: example,
      attrs: { href: detailUrl(diagram.id, useCaseId), 'data-usecase-id': useCaseId, 'aria-label': `Open ${example} workflow` },
    });
    item.append(button);
    return item;
  }));
  renderCommunityScenarios();
}

function renderCommunityScenarios() {
  const region = $('#community-scenarios');
  const host = $('#community-scenario-list');
  if (!region || !host) return;
  const queryMatches = state.query.trim() && globalThis.OBS_SCENARIOS
    ? globalThis.OBS_SCENARIOS.matchScenarios(state.scenarios, { query: state.query }).map(({ scenario }) => scenario)
    : state.scenarios;
  const cards = queryMatches.flatMap(scenario => {
    const mappings = (scenario.discovery.interlocks ?? []).filter(({ diagram }) => diagram === state.activeDiagramId);
    if (!mappings.length) return [];
    const card = element('article', { className: 'community-scenario' });
    const mapping = mappings[0];
    const links = element('div', { className: 'community-scenario__links' });
    links.append(
      element('a', { text: 'Follow mapped workflow →', attrs: { href: detailUrl(mapping.diagram, mapping.workflow) } }),
      element('a', { text: 'Read full scenario', attrs: { href: `docs/scenarios/${scenario.id}.md` } }),
    );
    card.append(
      element('strong', { text: scenario.title }),
      element('p', { text: scenario.summary }),
      element('p', { text: `Mapped here: ${mappings.map(({ workflow }) => workflow.replaceAll('-', ' ')).join(' · ')}` }),
      links,
    );
    return [card];
  });
  replaceChildren(host, cards);
  region.hidden = cards.length === 0;
}

function selectDiagram(id, { focusTab = false } = {}) {
  state.activeDiagramId = id;
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const selected = tab.dataset.diagramId === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected && focusTab) tab.focus();
  });
  renderDiagram();
  renderServices();
  $('#page-status').textContent = `${domainLabel(id)} interlock selected.`;
}

function populateFilters() {
  const domainOptions = state.catalog.diagrams.map((diagram) => element('option', { text: domainLabel(diagram.id), attrs: { value: diagram.id } }));
  $('#domain-filter').append(...domainOptions);
  const categories = [...new Set(state.catalog.services.map(({ category }) => category))].sort();
  $('#category-filter').append(...categories.map((category) => element('option', { text: category, attrs: { value: category } })));
}

function filteredServices() {
  const query = state.query.trim().toLocaleLowerCase();
  const activeDomain = state.domain === 'active' ? state.activeDiagramId : state.domain;
  return state.catalog.services.filter((service) => {
    const domainMatch = activeDomain === 'all' || service.domains.includes(activeDomain);
    const categoryMatch = state.category === 'all' || service.category === state.category;
    const haystack = [service.name, service.summary, service.interlock, ...service.signals].join(' ').toLocaleLowerCase();
    return domainMatch && categoryMatch && (!query || haystack.includes(query));
  });
}

function serviceCard(service) {
  const card = element('article', { className: 'service-card' });
  card.style.setProperty('--card-color', categoryColors[service.category] ?? '#145CA8');
  const titleId = `service-${service.id}-title`;
  const button = element('button', {
    className: 'service-card__button',
    text: 'View service details',
    attrs: { type: 'button', 'aria-describedby': titleId },
  });
  const signals = element('div', { className: 'service-card__signals' });
  service.signals.slice(0, 3).forEach((signal) => signals.append(element('span', { text: signal })));
  card.append(
    element('span', { className: 'service-card__category', text: service.category }),
    element('h3', { text: service.name, attrs: { id: titleId } }),
    element('p', { text: service.summary }),
    signals,
  );
  button.addEventListener('click', () => openService(service));
  const foot = element('footer', { className: 'service-card__foot' });
  const source = element('a', { text: 'Official docs ↗', attrs: { href: service.docs, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Official Oracle documentation for ${service.name}` } });
  foot.append(button, element('span', { text: `${service.domains.length} interlock${service.domains.length === 1 ? '' : 's'}` }), source);
  card.append(foot);
  return card;
}

function renderServices() {
  const services = filteredServices();
  replaceChildren($('#service-grid'), services.map(serviceCard));
  $('#service-status').textContent = `${services.length} of ${state.catalog.services.length} services shown · ${state.domain === 'active' ? domainLabel(state.activeDiagramId) : state.domain === 'all' ? 'all diagrams' : domainLabel(state.domain)}`;
  $('#empty-state').hidden = services.length !== 0;
  renderCommunityScenarios();
}

function tags(target, values, labeler = (value) => value) {
  replaceChildren(target, values.map((value) => element('span', { text: labeler(value) })));
}

function openService(service) {
  previousFocus = document.activeElement;
  $('#dialog-category').textContent = service.category;
  $('#dialog-title').textContent = service.name;
  $('#dialog-summary').textContent = service.summary;
  $('#dialog-interlock').textContent = service.interlock;
  tags($('#dialog-signals'), service.signals);
  tags($('#dialog-domains'), service.domains, domainLabel);
  $('#dialog-docs').href = service.docs;
  $('#service-dialog').showModal();
}

function renderArtifacts() {
  const cards = state.catalog.diagrams.map((diagram, index) => {
    const card = element('article', { className: 'artifact-card' });
    const titleId = `artifact-${diagram.id}-title`;
    const header = element('header');
    header.append(
      element('span', { text: `Poster ${String(index + 1).padStart(2, '0')}` }),
      element('h3', { text: domainLabel(diagram.id), attrs: { id: titleId } }),
    );
    const links = element('div', { className: 'artifact-card__links' });
    links.append(
      element('a', {
        text: 'Draw.io',
        attrs: { href: `assets/diagrams/interlocks-documented/${diagram.id}-documented.drawio`, download: '', 'aria-describedby': titleId },
      }),
      element('a', {
        text: 'Excalidraw',
        attrs: { href: `assets/diagrams/interlocks-documented/${diagram.id}-documented.excalidraw`, download: '', 'aria-describedby': titleId },
      }),
      element('a', {
        text: 'PDF',
        attrs: { href: `assets/diagrams/interlocks-documented/${diagram.id}-documented.pdf`, download: '', 'aria-describedby': titleId },
      }),
    );
    card.append(header, element('p', { text: diagram.subtitle }), links);
    return card;
  });
  replaceChildren($('#artifact-library'), cards);
}

const interlockUseCases = Object.freeze({
  network: window.NETWORK_DRILLDOWNS ?? [],
  ...(window.DOMAIN_DRILLDOWNS ?? {}),
});

function urlUseCase() {
  const params = new URLSearchParams(window.location.search);
  return { diagram: params.get('diagram'), useCase: params.get('usecase') };
}

function bindControls() {
  $('#service-search').addEventListener('input', (event) => { state.query = event.target.value; renderServices(); });
  $('#domain-filter').addEventListener('change', (event) => { state.domain = event.target.value; renderServices(); });
  $('#category-filter').addEventListener('change', (event) => { state.category = event.target.value; renderServices(); });
  $('#print-catalog').addEventListener('click', () => window.print());
  $('#clear-filters').addEventListener('click', clearFilters);
  $('#dialog-close').addEventListener('click', () => $('#service-dialog').close());
  $('#service-dialog').addEventListener('click', (event) => { if (event.target === $('#service-dialog')) $('#service-dialog').close(); });
  $('#service-dialog').addEventListener('close', () => {
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    previousFocus = null;
  });
}

function clearFilters() {
  state.query = '';
  state.domain = 'active';
  state.category = 'all';
  $('#service-search').value = '';
  $('#domain-filter').value = 'active';
  $('#category-filter').value = 'all';
  renderServices();
}

function showLoadError(error) {
  console.error('Unable to load interlock catalog', error);
  $('#diagram-title').textContent = 'The interlock catalog could not be loaded.';
  $('#diagram-subtitle').textContent = 'Serve this repository over HTTP, or download the editable Draw.io file directly.';
  $('#load-error').hidden = false;
  $('#page-status').textContent = 'The interactive catalog could not be loaded. Editable files remain available.';
}

async function loadCatalog() {
  if (window.INTERLOCK_CATALOG) return window.INTERLOCK_CATALOG;
  const response = await fetch('assets/interlocks/catalog.json');
  if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`);
  return response.json();
}

async function init() {
  try {
    state.catalog = Object.freeze(await loadCatalog());
    try {
      state.scenarios = globalThis.OBS_SCENARIOS ? await globalThis.OBS_SCENARIOS.load() : Object.freeze([]);
    } catch (scenarioError) {
      console.error('Unable to load community scenarios', scenarioError);
      state.scenarios = Object.freeze([]);
    }
    const requested = urlUseCase();
    if (requested.diagram && diagramById(requested.diagram)) state.activeDiagramId = requested.diagram;
    buildTabs();
    populateFilters();
    bindControls();
    renderDiagram();
    renderServices();
    renderArtifacts();
  } catch (error) {
    showLoadError(error);
  }
}

init();
