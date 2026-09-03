/**
 * OCI Observability & Management Platform
 * Interactive Presentation Application
 */

(function() {
    'use strict';

    const MODULE_ORDER = ['home', 'monitoring', 'ebs', 'fusion', 'integrations', 'loganalytics', 'apm', 'opsinsights', 'dbmgmt', 'ai'];
    const MODULE_LABELS = {
        home: 'Launchpad',
        monitoring: 'Monitoring',
        ebs: 'E-Business Suite',
        fusion: 'Fusion & OIC',
        integrations: 'Integrations',
        loganalytics: 'Log Analytics',
        apm: 'APM',
        opsinsights: 'Ops Insights',
        dbmgmt: 'Database Mgmt',
        ai: 'AI / GenAI'
    };
    const MODULE_SECTION_LABELS = {
        integrations: {
            overview: 'Overview',
            prometheus: 'Prometheus Ingestion',
            fusion: 'Fusion & OIC Lane',
            mcp: 'MCP & LoganAI',
            response: 'PagerDuty & Responders',
            blueprints: 'Reference Blueprints',
            surfaces: 'MCP Surfaces'
        }
    };
    const IS_PUBLIC_MODE = document.body?.dataset.publicMode === 'true';
    const SITE_TITLE = 'portal.octodemo.cloud | OCI Observability Launchpad';
    const COMMAND_ITEMS = [
        {
            id: 'home',
            type: 'module',
            target: 'home',
            label: 'Launchpad',
            description: 'Start here with role-based paths and troubleshooting journeys.',
            category: 'Module',
            keywords: ['home', 'launchpad', 'start', 'getting started']
        },
        {
            id: 'monitoring',
            type: 'module',
            target: 'monitoring',
            label: 'Monitoring',
            description: 'Metrics, alarms, dashboards, and health baselines.',
            category: 'Module',
            keywords: ['metrics', 'alarms', 'dashboards', 'slo']
        },
        {
            id: 'loganalytics',
            type: 'module',
            target: 'loganalytics',
            label: 'Log Analytics',
            description: 'Parser-driven investigation, clustering, anomaly detection, and LoganAI.',
            category: 'Module',
            keywords: ['logs', 'loganai', 'investigation', 'anomaly']
        },
        {
            id: 'apm',
            type: 'module',
            target: 'apm',
            label: 'APM',
            description: 'Distributed tracing, synthetic monitoring, and real user experience.',
            category: 'Module',
            keywords: ['traces', 'rum', 'synthetics', 'performance']
        },
        {
            id: 'dbmgmt',
            type: 'module',
            target: 'dbmgmt',
            label: 'Database Management',
            description: 'Performance Hub, AWR workflows, SQL tuning, and fleet visibility.',
            category: 'Module',
            keywords: ['database', 'awr', 'sql', 'performance hub']
        },
        {
            id: 'opsinsights',
            type: 'module',
            target: 'opsinsights',
            label: 'Ops Insights',
            description: 'Capacity planning, trend analysis, and long-range optimization.',
            category: 'Module',
            keywords: ['capacity', 'forecasting', 'trends']
        },
        {
            id: 'fusion',
            type: 'module',
            target: 'fusion',
            label: 'Fusion & OIC',
            description: 'Enterprise application troubleshooting and business-flow observability.',
            category: 'Module',
            keywords: ['fusion', 'oic', 'enterprise apps', 'business flow']
        },
        {
            id: 'integrations',
            type: 'module',
            target: 'integrations',
            label: 'Integrations',
            description: 'Prometheus, MCP, Service Connector Hub, Slack, PagerDuty, and automation.',
            category: 'Module',
            keywords: ['prometheus', 'mcp', 'slack', 'pagerduty', 'automation']
        },
        {
            id: 'integrations-prometheus',
            type: 'section',
            target: 'integrations',
            section: 'prometheus',
            label: 'Prometheus ingestion lane',
            description: 'Management Agent and Monitoring patterns for Prometheus metrics, correlated with separate Logan evidence.',
            category: 'Deep dive',
            keywords: ['prometheus', 'ingestion', 'oke', 'slo', 'management agent']
        },
        {
            id: 'integrations-fusion',
            type: 'section',
            target: 'integrations',
            section: 'fusion',
            label: 'Fusion & OIC deep dive',
            description: 'Packaged-app observability, business-flow troubleshooting, and enterprise app pivots.',
            category: 'Deep dive',
            keywords: ['fusion', 'oic', 'enterprise apps', 'business flow']
        },
        {
            id: 'integrations-mcp',
            type: 'section',
            target: 'integrations',
            section: 'mcp',
            label: 'MCP and LoganAI workflows',
            description: 'Copilot-ready observability with live OCI logs, metrics, AWR, and security context.',
            category: 'Deep dive',
            keywords: ['mcp', 'loganai', 'copilot', 'llm', 'genai']
        },
        {
            id: 'integrations-response',
            type: 'section',
            target: 'integrations',
            section: 'response',
            label: 'PagerDuty and responder handoffs',
            description: 'Notifications, Slack, PagerDuty, and Functions for incident-response loops.',
            category: 'Deep dive',
            keywords: ['pagerduty', 'slack', 'incident', 'response', 'notifications']
        },
        {
            id: 'integrations-blueprints',
            type: 'section',
            target: 'integrations',
            section: 'blueprints',
            label: 'Integration reference blueprints',
            description: 'Pick the operating model that matches platform teams, enterprise apps, or on-call operations.',
            category: 'Deep dive',
            keywords: ['blueprint', 'architecture', 'platform team', 'operating model']
        },
        {
            id: 'ai',
            type: 'module',
            target: 'ai',
            label: 'AI / GenAI',
            description: 'LoganAI, copilots, and AI-assisted observability workflows.',
            category: 'Module',
            keywords: ['ai', 'genai', 'copilot', 'assistant']
        },
        {
            id: 'oracle-docs',
            type: 'external',
            href: 'https://docs.oracle.com/en-us/iaas/Content/cloud-adoption-framework/monitoring-and-observability.htm',
            label: 'Oracle monitoring and observability guidance',
            description: 'Official Oracle documentation for OCI monitoring and observability adoption.',
            category: 'Docs',
            keywords: ['docs', 'documentation', 'adoption']
        },
        {
            id: 'livelabs',
            type: 'external',
            href: 'https://livelabs.oracle.com/',
            label: 'Oracle LiveLabs',
            description: 'Hands-on labs for OCI observability scenarios and architecture patterns.',
            category: 'Lab',
            keywords: ['labs', 'hands on', 'training']
        }
    ];

    // ============================================
    // State Management
    // ============================================
    const state = {
        currentModule: 'home',
        currentUseCase: 'lost-order',
        cloudGuardMode: localStorage.getItem('oci-cloud-guard') || 'free',
        commandResults: [],
        currentSection: null,
        selectedCluster: null,
        animationFrameId: null,
        liveStatsIntervalId: null,
        pendingRouteOptions: null,
        theme: localStorage.getItem('oci-theme') || 'redwood',
        tier: localStorage.getItem('oci-tier') || 'free'
    };

    // ============================================
    // DOM Elements Cache
    // ============================================
    const elements = {
        moduleTriggers: null,
        navItems: null,
        modules: null,
        useCaseTabs: null,
        useCaseContents: null,
        securityHalo: null,
        mindmap: null,
        connectionLines: null,
        sectionRouteTriggers: null,
        commandPalette: null,
        commandPaletteInput: null,
        commandPaletteResults: null,
        commandPaletteEmpty: null,
        closeCommandPalette: null,
        mobileNavToggle: null,
        mobileNavClose: null,
        mobileNavBackdrop: null,
        mobileDrawer: null,
        mobileCurrentModule: null,
        mobileMapItems: null
    };
    const runtime = {
        initializedFeatures: new Set(),
        revealObserver: null,
        counterObserver: null,
        mobileMapObserver: null,
        pendingMobileMapSection: null,
        mobileNavReturnFocus: null,
        mobileNavBackgroundState: []
    };
    const REVEAL_SELECTOR = [
        '.service-card',
        '.stat-card',
        '.step-item',
        '.pillar-card',
        '.example-card',
        '.mcp-server-card',
        '.namespace-card',
        '.section-header',
        '.resources-card',
        '.tier-comparison-section',
        '.certification-container',
        '.integration-lane-card',
        '.integration-blueprint-card',
        '.integration-hero-copy',
        '.integration-signal-card',
        '.launchpad-shell',
        '.persona-card',
        '.workflow-card',
        '.knowledge-card'
    ].join(', ');
    const MODULE_FEATURES = {
        home: [
            { key: 'home:pillar-dnd', init: initPillarDragDrop },
            { key: 'home:mindmap-drag', init: initMindmapDrag },
            { key: 'home:service-cards', init: initServiceCardEnhancements }
        ],
        monitoring: [
            { key: 'monitoring:query-builder', init: initQueryBuilder }
        ],
        ebs: [
            { key: 'ebs:data-flow', init: initDataFlowAnimations }
        ],
        fusion: [
            { key: 'fusion:sankey', init: initSankeyInteractions }
        ],
        apm: [
            { key: 'apm:waterfall', init: initWaterfallInteractions },
            { key: 'apm:map', init: initMapInteractions }
        ],
        ai: [
            { key: 'ai:chat', init: initChatInterface }
        ]
    };

    // ============================================
    // Initialization
    // ============================================
    function init() {
        enforcePublicMode();
        cacheElements();
        bindEvents();
        initModernUX();
        initTheme();
        initTierToggle();
        initCloudGuardToggle();
        initScalePatternState();
        initRouting();
        initLaunchpadMobileMap();
        initMindmapConnections();
        initAnimations();
        initCounters();
        /* Platform initialized */
    }

    function enforcePublicMode() {
        if (!IS_PUBLIC_MODE) return;

        document.querySelectorAll('[data-private-only]').forEach(node => {
            node.remove();
        });
    }

    function initModernUX() {
        document.documentElement.classList.toggle(
            'supports-view-transitions',
            typeof document.startViewTransition === 'function'
        );
        renderCommandResults('');
    }

    // ============================================
    // Theme Management
    // ============================================
    function initTheme() {
        // Apply saved theme on load
        const savedTheme = localStorage.getItem('oci-theme') || 'redwood';
        state.theme = savedTheme;
        applyTheme(savedTheme);

        // Bind theme options
        document.querySelectorAll('[data-theme-picker]').forEach(themeOptions => {
            themeOptions.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', () => {
                    const theme = option.dataset.theme;
                    setTheme(theme);
                });
            });
        });

        // Keep the compact toggles working
        document.querySelectorAll('#themeToggle, #mobileThemeToggle').forEach(toggle => {
            toggle.addEventListener('click', toggleThemeLegacy);
        });
    }

    function setTheme(theme) {
        state.theme = theme;
        applyTheme(theme);
        localStorage.setItem('oci-theme', theme);
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else if (theme === 'redwood') {
            document.documentElement.setAttribute('data-theme', 'redwood');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
    }

    function toggleThemeLegacy() {
        if (state.theme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }

    // ============================================
    // Tier Toggle Management
    // ============================================
    function initTierToggle() {
        document.querySelectorAll('[data-toggle-kind="tier"]').forEach(toggle => {
            bindOptionCluster(toggle, '.toggle-option', option => setTier(option.dataset.value));
        });

        applyTier(state.tier);
    }

    function setTier(tier) {
        state.tier = tier;
        applyTier(tier);
        localStorage.setItem('oci-tier', tier);
    }

    function applyTier(tier) {
        document.documentElement.setAttribute('data-tier', tier);
        syncToggleGroup('tier', tier);

        // Update visibility of tier-specific content (feature tags)
        document.querySelectorAll('[data-tier-required]').forEach(el => {
            const required = el.dataset.tierRequired;
            if (required === 'paid' && tier === 'free') {
                el.classList.add('tier-locked');
            } else {
                el.classList.remove('tier-locked');
            }
        });

        // Update tier badges visibility in service card headers
        document.querySelectorAll('.tier-badges .tier-badge').forEach(el => {
            const badgeType = el.classList.contains('free') ? 'free' :
                              el.classList.contains('paid') ? 'paid' : 'enterprise';
            // Show relevant badges based on selected tier
            if (tier === 'free') {
                el.style.display = (badgeType === 'free' || badgeType === 'enterprise') ? 'inline-flex' : 'none';
            } else {
                el.style.display = (badgeType === 'paid' || badgeType === 'enterprise') ? 'inline-flex' : 'none';
            }
        });

        // Note: Capability rows use CSS opacity based on [data-tier] attribute
        // No JS manipulation needed - CSS handles the visual differentiation
    }

    function initCloudGuardToggle() {
        document.querySelectorAll('[data-toggle-kind="cloud-guard"]').forEach(toggle => {
            bindOptionCluster(toggle, '.toggle-option', option => setCloudGuardMode(option.dataset.value));
        });

        applyCloudGuardMode(state.cloudGuardMode);
    }

    function setCloudGuardMode(value) {
        state.cloudGuardMode = value;
        localStorage.setItem('oci-cloud-guard', value);
        applyCloudGuardMode(value);
    }

    function applyCloudGuardMode(value) {
        syncToggleGroup('cloud-guard', value);

        if (elements.securityHalo) {
            elements.securityHalo.classList.toggle('paid', value === 'paid');
        }

        const badge = document.getElementById('cloudGuardBadge');
        if (badge) {
            badge.querySelector('span').textContent = value === 'paid' ? 'Cloud Guard Paid' : 'Cloud Guard';
        }
    }

    function syncToggleGroup(kind, value) {
        document.querySelectorAll(`[data-toggle-kind="${kind}"]`).forEach(toggle => {
            toggle.dataset.value = value;
            toggle.querySelectorAll('.toggle-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.value === value);
                opt.setAttribute('aria-pressed', String(opt.dataset.value === value));
            });
        });
    }

    function bindOptionCluster(container, selector, onSelect) {
        const options = [...container.querySelectorAll(selector)];
        container.setAttribute('role', 'group');
        options.forEach(option => {
            option.setAttribute('role', 'button');
            option.tabIndex = 0;
            option.addEventListener('click', () => onSelect(option));
            option.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(option);
                    return;
                }
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const currentIndex = options.indexOf(option);
                const nextIndex = event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                        ? options.length - 1
                        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
                options[nextIndex].focus();
            });
        });
    }

    function cacheElements() {
        elements.moduleTriggers = document.querySelectorAll('[data-module]');
        elements.navItems = document.querySelectorAll('.nav-item');
        elements.modules = document.querySelectorAll('.module');
        elements.useCaseTabs = document.querySelectorAll('.use-case-tab');
        elements.useCaseContents = document.querySelectorAll('.use-case-content');
        elements.sectionRouteTriggers = document.querySelectorAll('[data-route-module]');
        elements.securityHalo = document.getElementById('securityHalo');
        elements.mindmap = document.getElementById('mindmap');
        elements.connectionLines = document.getElementById('connectionLines');
        elements.commandPalette = document.getElementById('commandPalette');
        elements.commandPaletteInput = document.getElementById('commandPaletteInput');
        elements.commandPaletteResults = document.getElementById('commandPaletteResults');
        elements.commandPaletteEmpty = document.getElementById('commandPaletteEmpty');
        elements.closeCommandPalette = document.getElementById('closeCommandPalette');
        elements.mobileNavToggle = document.getElementById('mobileNavToggle');
        elements.mobileNavClose = document.getElementById('mobileNavClose');
        elements.mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
        elements.mobileDrawer = document.getElementById('mobileDrawer');
        elements.mobileCurrentModule = document.getElementById('mobileCurrentModule');
        elements.mobileMapItems = document.querySelectorAll('[data-launchpad-section]');
    }

    // ============================================
    // Event Bindings
    // ============================================
    function bindEvents() {
        // Navigation
        elements.moduleTriggers.forEach(item => {
            if (item.tagName !== 'BUTTON' && item.tagName !== 'A') {
                item.tabIndex = 0;
                item.setAttribute('role', 'button');
            }
            item.addEventListener('click', handleNavClick);
            item.addEventListener('keydown', handleNavKeydown);
        });

        elements.sectionRouteTriggers.forEach(item => {
            item.addEventListener('click', handleSectionRouteClick);
            item.addEventListener('keydown', handleSectionRouteKeydown);
        });

        // Use Case Tabs
        elements.useCaseTabs.forEach(tab => {
            tab.addEventListener('click', handleUseCaseClick);
        });

        // Pillar nodes navigate to their matching module.
        document.querySelectorAll('.pillar-node .node-content').forEach(trigger => {
            trigger.addEventListener('click', handlePillarClick);
            bindKeyboardActivation(trigger);
        });

        // Cluster bubbles
        document.querySelectorAll('.cluster-bubble').forEach(bubble => {
            bubble.addEventListener('click', handleClusterClick);
        });

        // Brazil marker on map
        const brazilMarker = document.getElementById('brazilMarker');
        if (brazilMarker) {
            brazilMarker.addEventListener('click', handleBrazilClick);
            bindKeyboardActivation(brazilMarker);
        }

        // Stuck job click
        const stuckJob = document.getElementById('stuckJob');
        if (stuckJob) {
            stuckJob.addEventListener('click', handleStuckJobClick);
        }

        // Query suggestions
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', handleSuggestionClick);
        });

        // Quick prompts for AI
        document.querySelectorAll('.prompt-chip').forEach(chip => {
            chip.addEventListener('click', handlePromptClick);
        });

        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', handleViewToggle);
        });

        document.querySelectorAll('[data-command-palette-trigger]').forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openCommandPalette();
            });
        });

        if (elements.closeCommandPalette) {
            elements.closeCommandPalette.addEventListener('click', closeCommandPalette);
        }

        if (elements.commandPalette) {
            elements.commandPalette.addEventListener('cancel', (event) => {
                event.preventDefault();
                closeCommandPalette();
            });
            elements.commandPalette.addEventListener('click', (event) => {
                if (event.target === elements.commandPalette) {
                    closeCommandPalette();
                }
            });
        }

        if (elements.commandPaletteInput) {
            elements.commandPaletteInput.addEventListener('input', (event) => {
                renderCommandResults(event.currentTarget.value);
            });
            elements.commandPaletteInput.addEventListener('keydown', handleCommandPaletteKeydown);
        }

        if (elements.commandPaletteResults) {
            elements.commandPaletteResults.addEventListener('click', handleCommandResultClick);
        }

        if (elements.mobileNavToggle) {
            elements.mobileNavToggle.addEventListener('click', toggleMobileNav);
        }

        if (elements.mobileNavClose) {
            elements.mobileNavClose.addEventListener('click', closeMobileNav);
        }

        if (elements.mobileNavBackdrop) {
            elements.mobileNavBackdrop.addEventListener('click', closeMobileNav);
        }

        window.addEventListener('hashchange', handleHashChange);
        document.addEventListener('keydown', handleGlobalKeydown);

        // Window resize for mindmap connections
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768) {
                closeMobileNav();
            }
            ensureModuleFeatures(state.currentModule);
            initMindmapConnections();
        }, 250));
    }

    function bindKeyboardActivation(control) {
        control.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                control.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
            }
        });
    }

    // ============================================
    // Navigation Handlers
    // ============================================
    function handleNavClick(e) {
        const item = e.currentTarget;
        const module = item.dataset.module;
        routeToModule(module);
    }

    function handleNavKeydown(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        handleNavClick(e);
    }

    function handleSectionRouteClick(e) {
        const item = e.currentTarget;
        routeToModule(item.dataset.routeModule, {
            section: item.dataset.routeSection || null
        });
    }

    function handleSectionRouteKeydown(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        handleSectionRouteClick(e);
    }

    function routeToModule(module, { section = null } = {}) {
        const shouldCloseMobile = document.body.classList.contains('mobile-nav-open');

        if (shouldCloseMobile) {
            closeMobileNav();
        }

        const nextHash = buildRouteHash(module, section);
        state.pendingRouteOptions = {
            closeMobile: true,
            behavior: 'smooth',
            useTransition: true,
            section: normalizeModuleSection(module, section)
        };
        if (window.location.hash !== nextHash) {
            window.location.hash = nextHash;
            return;
        }

        navigateToModule(module, state.pendingRouteOptions);
        state.pendingRouteOptions = null;
    }

    function handlePillarClick(e) {
        const pillar = e.currentTarget.closest('.pillar-node')?.dataset.pillar;
        const moduleMap = {
            'monitoring': 'monitoring',
            'stack': 'ebs',
            'apm': 'apm',
            'logs': 'loganalytics',
            'opsinsights': 'opsinsights',
            'dbmgmt': 'dbmgmt'
        };

        const targetModule = moduleMap[pillar];
        if (targetModule && targetModule !== state.currentModule) {
            const navItem = document.querySelector(`.nav-item[data-module="${targetModule}"]`);
            if (navItem) navItem.click();
        }
    }

    // ============================================
    // Use Case Handlers
    // ============================================
    function handleUseCaseClick(e) {
        const tab = e.currentTarget;
        const usecase = tab.dataset.usecase;

        if (usecase === state.currentUseCase) return;

        // Update tabs
        elements.useCaseTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content
        elements.useCaseContents.forEach(content => content.classList.remove('active'));
        const targetContent = document.getElementById(`usecase-${usecase}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        state.currentUseCase = usecase;
    }

    // ============================================
    // Routing + Mobile Navigation
    // ============================================
    function initRouting() {
        const restoredModule = window.OBS_STATE?.read?.().module;
        if (MODULE_ORDER.includes(restoredModule)) {
            const url = new URL(window.location.href);
            url.hash = buildRouteHash(restoredModule, null);
            history.replaceState(null, '', url);
        } else if (!window.location.hash) {
            history.replaceState(null, '', '#home');
        }

        handleHashChange();
    }

    function handleHashChange() {
        const route = parseRoute(window.location.hash);
        if (route.redirected && window.location.hash !== '#home') {
            history.replaceState(null, '', '#home');
        }
        const routeOptions = {
            closeMobile: true,
            behavior: 'auto',
            useTransition: false,
            section: route.section,
            ...(state.pendingRouteOptions || {})
        };
        state.pendingRouteOptions = null;
        navigateToModule(route.module, routeOptions);
    }

    function parseRoute(hash) {
        const rawHash = (hash || '').replace(/^#/, '').trim().toLowerCase();
        const [rawModuleToken, rawSectionToken] = rawHash.split('/');
        const normalizedModule = rawModuleToken.startsWith('module-') ? rawModuleToken.replace(/^module-/, '') : rawModuleToken;
        const module = MODULE_ORDER.includes(normalizedModule) ? normalizedModule : 'home';
        return {
            module,
            section: normalizeModuleSection(module, rawSectionToken || null),
            redirected: false
        };
    }

    function normalizeModuleSection(module, section) {
        if (!section) return null;
        const normalizedSection = String(section).trim().toLowerCase();
        return MODULE_SECTION_LABELS[module] && MODULE_SECTION_LABELS[module][normalizedSection]
            ? normalizedSection
            : null;
    }

    function buildRouteHash(module, section) {
        const normalizedSection = normalizeModuleSection(module, section);
        return normalizedSection ? `#${module}/${normalizedSection}` : `#${module}`;
    }

    function getActiveModuleSection(module, section) {
        if (!MODULE_SECTION_LABELS[module]) return null;
        return normalizeModuleSection(module, section) || Object.keys(MODULE_SECTION_LABELS[module])[0];
    }

    function getAvailableCommandItems() {
        return COMMAND_ITEMS.filter((item) => !(IS_PUBLIC_MODE && item.privateOnly));
    }

    function getModuleElement(module) {
        return document.getElementById(`module-${module}`);
    }

    function ensureModuleFeatures(module) {
        const moduleRoot = getModuleElement(module);
        if (!moduleRoot) return;

        const features = MODULE_FEATURES[module] || [];
        features.forEach(({ key, init }) => {
            if (runtime.initializedFeatures.has(key)) return;
            const result = init(moduleRoot);
            if (result !== false) {
                runtime.initializedFeatures.add(key);
            }
        });
    }

    function navigateToModule(module, { closeMobile = true, behavior = 'auto', useTransition = false, section = null } = {}) {
        const targetModule = document.getElementById(`module-${module}`);
        if (!targetModule) return;

        const commitNavigation = () => {
            elements.moduleTriggers.forEach(trigger => {
                trigger.classList.toggle('active', trigger.dataset.module === module);
            });

            elements.modules.forEach(mod => mod.classList.remove('active'));
            targetModule.classList.add('active');
            state.currentModule = module;
            state.currentSection = getActiveModuleSection(module, section);
            window.OBS_STATE?.replace?.({ module });
            ensureModuleFeatures(module);
            registerModuleAnimations(module);

            syncModuleChrome(module, section);

            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
            window.scrollTo({ top: 0, behavior });

            syncModuleSectionState(module, section, behavior);

            if (runtime.pendingMobileMapSection && module === 'home') {
                const pendingSection = runtime.pendingMobileMapSection;
                runtime.pendingMobileMapSection = null;
                requestAnimationFrame(() => scrollToLaunchpadSection(pendingSection));
            }

            if (module === 'home') {
                setTimeout(initMindmapConnections, 100);
            }

            if (closeMobile) {
                closeMobileNav();
            }
        };

        const shouldAnimate = useTransition && typeof document.startViewTransition === 'function' && state.currentModule !== module;
        if (shouldAnimate) {
            const transition = document.startViewTransition(() => {
                commitNavigation();
            });
            // Rapid keyboard or navigation actions can supersede a transition.
            // The navigation has already committed, so cancellation is expected
            // and must not surface as an unhandled browser rejection.
            for (const completion of [transition.ready, transition.finished, transition.updateCallbackDone]) {
                completion?.catch(() => {});
            }
            return;
        }

        commitNavigation();
    }

    function syncModuleChrome(module, section) {
        if (elements.mobileCurrentModule) {
            elements.mobileCurrentModule.textContent = MODULE_LABELS[module] || MODULE_LABELS.home;
        }

        const moduleLabel = MODULE_LABELS[module] || MODULE_LABELS.home;
        const normalizedSection = normalizeModuleSection(module, section);
        const sectionLabel = normalizedSection
            ? MODULE_SECTION_LABELS[module][normalizedSection]
            : null;

        document.title = module === 'home'
            ? SITE_TITLE
            : `${sectionLabel ? `${sectionLabel} • ` : ''}${moduleLabel} • ${SITE_TITLE}`;

        if (module !== 'home') {
            setLaunchpadMobileMapCurrent('active-module');
        }
    }

    function setLaunchpadMobileMapCurrent(section) {
        elements.mobileMapItems?.forEach(item => {
            const active = item.dataset.launchpadSection === section;
            if (active) item.setAttribute('aria-current', 'location');
            else item.removeAttribute('aria-current');
        });
    }

    function scrollToLaunchpadSection(section) {
        const target = section === 'active-module'
            ? getModuleElement(state.currentModule)
            : document.getElementById(section);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setLaunchpadMobileMapCurrent(section);
    }

    function initLaunchpadMobileMap() {
        if (!elements.mobileMapItems?.length) return;

        elements.mobileMapItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.launchpadSection;
                if (section !== 'active-module' && state.currentModule !== 'home') {
                    runtime.pendingMobileMapSection = section;
                    routeToModule('home');
                    return;
                }
                scrollToLaunchpadSection(section);
            });
        });

        const sections = [...elements.mobileMapItems]
            .map(item => document.getElementById(item.dataset.launchpadSection))
            .filter(Boolean);
        if (!sections.length || typeof IntersectionObserver !== 'function') return;

        runtime.mobileMapObserver = new IntersectionObserver(entries => {
            if (state.currentModule !== 'home') return;
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
            if (visible) setLaunchpadMobileMapCurrent(visible.target.id);
        }, { rootMargin: '-112px 0px -60% 0px', threshold: [0.05, 0.35, 0.65] });
        sections.forEach(section => runtime.mobileMapObserver.observe(section));
        setLaunchpadMobileMapCurrent(state.currentModule === 'home' ? 'lp-start' : 'active-module');
    }

    function initScalePatternState() {
        const control = document.querySelector('[data-scale-pattern]');
        if (!control) return;
        const apply = value => {
            const active = value === control.dataset.scalePattern;
            control.setAttribute('aria-pressed', String(active));
            control.closest('.lp-step')?.classList.toggle('is-selected', active);
        };
        apply(window.OBS_STATE?.read?.()['scale-pattern']);
        control.addEventListener('click', () => {
            const value = control.dataset.scalePattern;
            window.OBS_STATE?.replace?.({ 'scale-pattern': value });
            apply(value);
        });
    }

    function syncModuleSectionState(module, section, behavior) {
        const activeIntegrationSection = getActiveModuleSection(module, section);
        document.querySelectorAll('[data-route-module="integrations"][data-route-section]').forEach(trigger => {
            trigger.classList.toggle('active', module === 'integrations' && trigger.dataset.routeSection === activeIntegrationSection);
        });

        document.querySelectorAll('[data-integration-section]').forEach(sectionElement => {
            sectionElement.classList.toggle('is-spotlit', module === 'integrations' && sectionElement.dataset.integrationSection === activeIntegrationSection);
        });

        if (module !== 'integrations') {
            return;
        }

        const shouldScrollToSection = normalizeModuleSection(module, section);
        if (!shouldScrollToSection) {
            return;
        }

        const targetSection = document.querySelector(`[data-integration-section="${shouldScrollToSection}"]`);
        if (!targetSection) {
            return;
        }

        requestAnimationFrame(() => {
            targetSection.scrollIntoView({
                behavior,
                block: 'start'
            });
        });
    }

    function toggleMobileNav() {
        if (document.body.classList.contains('mobile-nav-open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    function openMobileNav() {
        if (document.body.classList.contains('mobile-nav-open')) return;
        runtime.mobileNavReturnFocus = elements.mobileNavToggle;
        hideMobileNavBackground();
        document.body.classList.add('mobile-nav-open');
        if (elements.mobileNavToggle) {
            elements.mobileNavToggle.setAttribute('aria-expanded', 'true');
            elements.mobileNavToggle.setAttribute('aria-label', 'Close navigation');
        }
        if (elements.mobileDrawer) {
            elements.mobileDrawer.setAttribute('aria-hidden', 'false');
        }
        requestAnimationFrame(() => mobileDrawerFocusableElements()[0]?.focus({ preventScroll: true }));
    }

    function closeMobileNav() {
        const wasOpen = document.body.classList.contains('mobile-nav-open');
        document.body.classList.remove('mobile-nav-open');
        if (elements.mobileNavToggle) {
            elements.mobileNavToggle.setAttribute('aria-expanded', 'false');
            elements.mobileNavToggle.setAttribute('aria-label', 'Open navigation');
        }
        if (elements.mobileDrawer) {
            elements.mobileDrawer.setAttribute('aria-hidden', 'true');
        }
        restoreMobileNavBackground();
        if (wasOpen && runtime.mobileNavReturnFocus?.isConnected) {
            runtime.mobileNavReturnFocus.focus({ preventScroll: true });
        }
        runtime.mobileNavReturnFocus = null;
    }

    function mobileNavBackgroundElements() {
        return ['.sidebar', '.mobile-header', '.launchpad-mobile-map', '.main-content']
            .map(selector => document.querySelector(selector))
            .filter(Boolean);
    }

    function hideMobileNavBackground() {
        runtime.mobileNavBackgroundState = mobileNavBackgroundElements().map(element => ({
            element,
            inert: element.inert,
            ariaHidden: element.getAttribute('aria-hidden')
        }));
        runtime.mobileNavBackgroundState.forEach(({ element }) => {
            element.inert = true;
            element.setAttribute('aria-hidden', 'true');
        });
    }

    function restoreMobileNavBackground() {
        runtime.mobileNavBackgroundState.forEach(({ element, inert, ariaHidden }) => {
            element.inert = inert;
            if (ariaHidden === null) element.removeAttribute('aria-hidden');
            else element.setAttribute('aria-hidden', ariaHidden);
        });
        runtime.mobileNavBackgroundState = [];
    }

    function mobileDrawerFocusableElements() {
        if (!elements.mobileDrawer) return [];
        const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return [...elements.mobileDrawer.querySelectorAll(selector)].filter(element => {
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
        });
    }

    function trapMobileNavFocus(event) {
        if (event.key !== 'Tab' || !document.body.classList.contains('mobile-nav-open')) return;
        const focusable = mobileDrawerFocusableElements();
        if (!focusable.length) {
            event.preventDefault();
            elements.mobileDrawer?.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (!elements.mobileDrawer.contains(active)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function handleGlobalKeydown(e) {
        if (e.key === 'Tab' && document.body.classList.contains('mobile-nav-open')) {
            trapMobileNavFocus(e);
            return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openCommandPalette();
            return;
        }

        if (e.key === '/' && !isTextInputTarget(e.target) && !isCommandPaletteOpen()) {
            e.preventDefault();
            openCommandPalette();
            return;
        }

        if (e.key === 'Escape') {
            if (isCommandPaletteOpen()) {
                closeCommandPalette();
                return;
            }
            closeMobileNav();
        }
    }

    function isTextInputTarget(target) {
        if (!target) return false;
        const tagName = target.tagName ? target.tagName.toLowerCase() : '';
        return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
    }

    function isCommandPaletteOpen() {
        if (!elements.commandPalette) return false;
        return elements.commandPalette.open || elements.commandPalette.classList.contains('is-open');
    }

    function openCommandPalette() {
        if (!elements.commandPalette) return;

        renderCommandResults(elements.commandPaletteInput ? elements.commandPaletteInput.value : '');

        if (typeof elements.commandPalette.showModal === 'function') {
            if (!elements.commandPalette.open) {
                elements.commandPalette.showModal();
            }
        } else {
            elements.commandPalette.classList.add('is-open');
            elements.commandPalette.setAttribute('open', 'open');
        }

        requestAnimationFrame(() => {
            if (elements.commandPaletteInput) {
                elements.commandPaletteInput.focus();
                elements.commandPaletteInput.select();
            }
        });
    }

    function closeCommandPalette() {
        if (!elements.commandPalette) return;

        if (typeof elements.commandPalette.close === 'function' && elements.commandPalette.open) {
            elements.commandPalette.close();
        } else {
            elements.commandPalette.classList.remove('is-open');
            elements.commandPalette.removeAttribute('open');
        }
    }

    function getFilteredCommandItems(query) {
        const needle = (query || '').trim().toLowerCase();
        if (!needle) {
            return getAvailableCommandItems().slice(0, 8);
        }

        const rankedItems = getAvailableCommandItems().map((item) => {
            const haystack = [
                item.label,
                item.description,
                item.category,
                ...(item.keywords || [])
            ].join(' ').toLowerCase();
            const startsWith = item.label.toLowerCase().startsWith(needle) ? 2 : 0;
            const includes = haystack.includes(needle) ? 1 : 0;
            return { item, score: startsWith + includes };
        }).filter(({ score }) => score > 0);

        rankedItems.sort((left, right) => right.score - left.score || left.item.label.localeCompare(right.item.label));
        return rankedItems.map(({ item }) => item);
    }

    function renderCommandResults(query) {
        if (!elements.commandPaletteResults) return;

        state.commandResults = getFilteredCommandItems(query);

        if (state.commandResults.length === 0) {
            elements.commandPaletteResults.innerHTML = '';
            if (elements.commandPaletteEmpty) {
                elements.commandPaletteEmpty.hidden = false;
            }
            return;
        }

        if (elements.commandPaletteEmpty) {
            elements.commandPaletteEmpty.hidden = true;
        }

        elements.commandPaletteResults.innerHTML = state.commandResults.map((item, index) => `
            <button
                type="button"
                class="command-result${index === 0 ? ' is-primary' : ''}"
                data-command-index="${index}"
                role="option"
                aria-selected="${index === 0 ? 'true' : 'false'}"
            >
                <span class="command-result-copy">
                    <strong>${item.label}</strong>
                    <span>${item.description}</span>
                </span>
                <span class="command-result-meta">${item.category}</span>
            </button>
        `).join('');
    }

    function handleCommandPaletteKeydown(event) {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        const [firstResult] = state.commandResults;
        if (firstResult) {
            executeCommandItem(firstResult);
        }
    }

    function handleCommandResultClick(event) {
        const result = event.target.closest('.command-result');
        if (!result) return;

        const index = Number.parseInt(result.dataset.commandIndex || '-1', 10);
        if (Number.isNaN(index) || index < 0) return;

        const item = state.commandResults[index];
        if (item) {
            executeCommandItem(item);
        }
    }

    function executeCommandItem(item) {
        if (!item) return;

        closeCommandPalette();

        if (item.type === 'module') {
            routeToModule(item.target);
            return;
        }

        if (item.type === 'section') {
            routeToModule(item.target, { section: item.section });
            return;
        }

        if (item.type === 'path') {
            window.location.href = item.href;
            return;
        }

        if (item.type === 'external') {
            window.open(item.href, '_blank', 'noopener');
        }
    }

    // ============================================
    // Mindmap Connections
    // ============================================
    function initMindmapConnections() {
        if (!elements.connectionLines || !elements.mindmap) return;
        if (state.currentModule !== 'home' || window.innerWidth <= 768) return;

        const svg = elements.connectionLines;
        const mindmapRect = elements.mindmap.getBoundingClientRect();

        // Clear existing lines
        svg.innerHTML = '';

        // Set SVG dimensions
        svg.setAttribute('width', mindmapRect.width);
        svg.setAttribute('height', mindmapRect.height);

        // Get central node position
        const centralNode = document.getElementById('centralNode');
        if (!centralNode) return;

        const centralRect = centralNode.getBoundingClientRect();
        const centerX = centralRect.left + centralRect.width / 2 - mindmapRect.left;
        const centerY = centralRect.top + centralRect.height / 2 - mindmapRect.top;

        // Draw lines to pillar nodes
        document.querySelectorAll('.pillar-node').forEach(pillar => {
            const pillarRect = pillar.getBoundingClientRect();
            const pillarX = pillarRect.left + pillarRect.width / 2 - mindmapRect.left;
            const pillarY = pillarRect.top + pillarRect.height / 2 - mindmapRect.top;

            const line = createConnectionLine(centerX, centerY, pillarX, pillarY);
            svg.appendChild(line);
        });

        // Add gradient definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'lineGradient';
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:rgba(199, 70, 52, 0.6)"/>
            <stop offset="100%" style="stop-color:rgba(199, 70, 52, 0.1)"/>
        `;
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }

    function createConnectionLine(x1, y1, x2, y2) {
        // Create a subtle curved path instead of a straight dashed line
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len === 0) return document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Perpendicular offset for curve control point
        const curvature = len * 0.08;
        const nx = -dy / len;
        const ny = dx / len;

        const mx = (x1 + x2) / 2 + nx * curvature;
        const my = (y1 + y2) / 2 + ny * curvature;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
        path.setAttribute('stroke', 'url(#lineGradient)');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        path.style.opacity = '0.4';
        return path;
    }

    // ============================================
    // Interactive Elements
    // ============================================
    function handleClusterClick(e) {
        const bubble = e.currentTarget;
        const label = bubble.querySelector('.cluster-label').textContent;

        // Update cluster detail panel
        const detailPanel = document.querySelector('.cluster-detail-panel');
        if (detailPanel) {
            const count = bubble.querySelector('.cluster-count').textContent;
            detailPanel.querySelector('h4').textContent = `Cluster: ${label} (${count} records)`;
        }

        // Visual feedback
        document.querySelectorAll('.cluster-bubble').forEach(b => {
            b.style.opacity = b === bubble ? '1' : '0.5';
        });

        setTimeout(() => {
            document.querySelectorAll('.cluster-bubble').forEach(b => {
                b.style.opacity = '1';
            });
        }, 2000);
    }

    function handleBrazilClick(event) {
        event?.preventDefault();
        const regionDetail = document.getElementById('regionDetail');
        if (regionDetail) {
            regionDetail.scrollIntoView({ behavior: 'smooth', block: 'center' });
            regionDetail.classList.add('highlight');
            setTimeout(() => regionDetail.classList.remove('highlight'), 2000);
        }
    }

    function handleStuckJobClick() {
        const detailPanel = document.getElementById('jobDetailPanel');
        if (detailPanel) {
            detailPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            detailPanel.style.animation = 'none';
            detailPanel.offsetHeight; // Trigger reflow
            detailPanel.style.animation = 'pulseHighlight 0.5s ease-out';
        }
    }

    function handleSuggestionClick(e) {
        const text = e.currentTarget.textContent;
        const queryInput = document.querySelector('.query-input');
        if (queryInput) {
            queryInput.value = text;
            queryInput.focus();
        }
    }

    function handlePromptClick(e) {
        const text = e.currentTarget.textContent;
        const chatInput = document.querySelector('.chat-input');
        if (chatInput) {
            chatInput.value = text;
            chatInput.focus();
        }
    }

    function handleViewToggle(e) {
        const btn = e.currentTarget;
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    // ============================================
    // Animations
    // ============================================
    function initAnimations() {
        runtime.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    runtime.revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        runtime.counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    runtime.counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        registerModuleAnimations(state.currentModule);
    }

    function registerModuleAnimations(module) {
        const moduleRoot = getModuleElement(module);
        if (!moduleRoot || !runtime.revealObserver || !runtime.counterObserver) return;

        moduleRoot.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
            if (el.dataset.revealRegistered === 'true') return;
            el.dataset.revealRegistered = 'true';
            el.classList.add('reveal-on-scroll');
            runtime.revealObserver.observe(el);
        });

        moduleRoot.querySelectorAll('.stat-value').forEach(stat => {
            if (stat.dataset.counterRegistered === 'true') return;
            stat.dataset.counterRegistered = 'true';
            runtime.counterObserver.observe(stat);
        });
    }

    function initCounters() {
        // Initialize any dynamic counters
        updateLiveStats();
        if (state.liveStatsIntervalId !== null) return;
        state.liveStatsIntervalId = window.setInterval(() => {
            if (document.hidden) {
                return;
            }
            updateLiveStats();
        }, 5000);
    }

    function updateLiveStats() {
        // Simulate live updates
        const statValues = document.querySelectorAll('.module.active .stat-value');
        statValues.forEach(stat => {
            const currentText = stat.textContent;
            // Only update numeric values
            if (/^[\d.]+/.test(currentText)) {
                const num = parseFloat(currentText);
                const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
                const newNum = num * (1 + variance);

                if (currentText.includes('M')) {
                    stat.textContent = newNum.toFixed(1) + 'M';
                } else if (currentText.includes('GB')) {
                    stat.textContent = Math.round(newNum) + ' GB';
                } else if (currentText.includes('ms')) {
                    stat.textContent = Math.round(newNum) + 'ms';
                } else if (currentText.includes('%')) {
                    stat.textContent = Math.min(100, newNum).toFixed(1) + '%';
                }
            }
        });
    }

    function animateCounter(element) {
        const text = element.textContent;
        const match = text.match(/^([\d.]+)(.*)$/);
        if (!match) return;

        const targetValue = parseFloat(match[1]);
        const suffix = match[2];
        const duration = 1500;
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;

            if (targetValue >= 100) {
                element.textContent = Math.round(currentValue) + suffix;
            } else {
                element.textContent = currentValue.toFixed(1) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ============================================
    // Data Flow Animation Enhancement
    // ============================================
    function initDataFlowAnimations(moduleRoot) {
        if (!moduleRoot) return false;

        moduleRoot.querySelectorAll('.data-flow').forEach(flow => {
            const existingParticles = flow.querySelectorAll('.flow-particle').length;
            for (let i = existingParticles; i < 3; i++) {
                const particle = document.createElement('div');
                particle.className = 'flow-particle';
                particle.style.animationDelay = `${i * 0.5}s`;
                flow.appendChild(particle);
            }
        });

        return true;
    }

    // ============================================
    // Sankey Diagram Interactivity
    // ============================================
    function initSankeyInteractions(moduleRoot) {
        if (!moduleRoot) return false;

        const sankeyNodes = moduleRoot.querySelectorAll('.sankey-node');
        sankeyNodes.forEach(node => {
            if (node.dataset.sankeyBound === 'true') return;
            node.dataset.sankeyBound = 'true';
            node.addEventListener('mouseenter', () => {
                // Highlight connected flows
                const nodeType = node.classList.contains('source') ? 'source' :
                                 node.classList.contains('middleware') ? 'middleware' : 'destination';
                highlightFlows(nodeType, moduleRoot);
            });

            node.addEventListener('mouseleave', () => {
                resetFlowHighlights(moduleRoot);
            });
        });

        return true;
    }

    function highlightFlows(nodeType, root = document) {
        const flows = root.querySelectorAll('.sankey-flow');
        flows.forEach((flow, index) => {
            if ((nodeType === 'source' && index === 0) ||
                (nodeType === 'middleware') ||
                (nodeType === 'destination' && index === 1)) {
                flow.style.opacity = '1';
            } else {
                flow.style.opacity = '0.3';
            }
        });
    }

    function resetFlowHighlights(root = document) {
        root.querySelectorAll('.sankey-flow').forEach(flow => {
            flow.style.opacity = '1';
        });
    }

    // ============================================
    // Trace Waterfall Interactivity
    // ============================================
    function initWaterfallInteractions(moduleRoot) {
        if (!moduleRoot) return false;

        const waterfallRows = moduleRoot.querySelectorAll('.waterfall-row');
        waterfallRows.forEach(row => {
            if (row.dataset.waterfallBound === 'true') return;
            row.dataset.waterfallBound = 'true';
            row.addEventListener('click', () => {
                const serviceName = row.querySelector('.service-name').textContent.trim();
                showTraceDetail(serviceName);
            });
        });

        return true;
    }

    function showTraceDetail(serviceName) {
        // Could expand to show more details about the trace span
        /* Trace detail view placeholder */
    }

    // ============================================
    // World Map Interactions
    // ============================================
    function initMapInteractions(moduleRoot) {
        if (!moduleRoot) return false;

        const markers = moduleRoot.querySelectorAll('.session-marker');
        const regionDetail = moduleRoot.querySelector('#regionDetail');

        markers.forEach(marker => {
            if (marker.dataset.mapBound === 'true') return;
            marker.dataset.mapBound = 'true';
            marker.addEventListener('click', () => {
                const title = marker.querySelector('title')?.textContent || '';
                if (regionDetail) {
                    updateRegionDetail(title, moduleRoot);
                }
            });
        });

        return true;
    }

    function updateRegionDetail(info, root = document) {
        // Parse and display region info
        const parts = info.split(':');
        if (parts.length >= 2) {
            const region = parts[0].trim();
            const regionDetail = root.querySelector('#regionDetail');
            if (regionDetail) {
                regionDetail.querySelector('h4').textContent = `${region} - Performance Analysis`;
            }
        }
    }

    // ============================================
    // Chat Interface Simulation
    // ============================================
    function initChatInterface(moduleRoot) {
        if (!moduleRoot || moduleRoot.dataset.chatReady === 'true') return moduleRoot ? true : false;

        const chatInput = moduleRoot.querySelector('.chat-input');
        const chatSend = moduleRoot.querySelector('.chat-send');

        if (chatSend && chatInput) {
            chatSend.addEventListener('click', () => {
                const message = chatInput.value.trim();
                if (message) {
                    addUserMessage(message);
                    chatInput.value = '';
                    simulateAIResponse(message);
                }
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    chatSend.click();
                }
            });
        }

        moduleRoot.dataset.chatReady = 'true';
        return true;
    }

    function addUserMessage(text) {
        const chatWindow = document.getElementById('chatWindow');
        if (!chatWindow) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${escapeHtml(text)}</p>
            </div>
        `;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function simulateAIResponse(query) {
        const chatWindow = document.getElementById('chatWindow');
        if (!chatWindow) return;

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Replace typing indicator with actual response
        setTimeout(() => {
            typingDiv.remove();
            const response = generateAIResponse(query);
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message assistant';
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    </svg>
                </div>
                <div class="message-content">
                    <p>${response}</p>
                </div>
            `;
            chatWindow.appendChild(messageDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 1500);
    }

    function generateAIResponse(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('error') || lowerQuery.includes('trend')) {
            return 'I analyzed error trends across your infrastructure. Over the past week, there was a 23% increase in errors, primarily originating from the payment-service cluster. The spike correlates with deployment #1247 on Tuesday. I recommend reviewing the recent changes to the transaction timeout settings.';
        }

        if (lowerQuery.includes('cpu') || lowerQuery.includes('performance')) {
            return 'CPU usage comparison across regions shows: <strong>US-East</strong> averaging 45%, <strong>EU-West</strong> at 62%, and <strong>Asia-Pacific</strong> at 78%. The elevated usage in APAC appears related to a misconfigured auto-scaling policy. I can help you adjust the scaling thresholds.';
        }

        if (lowerQuery.includes('incident') || lowerQuery.includes('similar')) {
            return 'I found 3 similar incidents in the past 90 days. All involved the same pattern: database connection pool exhaustion during peak hours. The recommended fix from previous resolutions was increasing the max pool size from 50 to 100 connections.';
        }

        if (lowerQuery.includes('report')) {
            return 'I\'ve generated a draft incident report summarizing: <strong>Timeline</strong>, <strong>Impact Assessment</strong>, <strong>Root Cause Analysis</strong>, and <strong>Remediation Steps</strong>. The report includes data from Log Analytics, APM traces, and infrastructure metrics. Would you like me to export it as a PDF?';
        }

        if (lowerQuery.includes('log') || lowerQuery.includes('logan')) {
            return 'I queried Log Analytics using ML clustering. Found <strong>4 distinct clusters</strong> in the last 24 hours: (1) Authentication failures - 2,341 events from <code>auth-service</code>, (2) Timeout errors - 847 from <code>api-gateway</code>, (3) DB connection resets - 156 from <code>order-service</code>, (4) Healthy baseline - 458K events. Cluster #1 shows a brute-force pattern. Shall I create a Cloud Guard responder rule?';
        }

        if (lowerQuery.includes('database') || lowerQuery.includes('db') || lowerQuery.includes('sql') || lowerQuery.includes('awr')) {
            return 'AWR analysis for the last 1 hour shows: <strong>Top Wait Event:</strong> <code>db file sequential read</code> (42% of DB time). Top SQL by elapsed time: <code>SELECT * FROM orders o JOIN customers c ON o.cust_id=c.id WHERE o.status=:1</code> - missing index on <code>orders.status</code>. Buffer cache hit ratio: 89% (target: >95%). <strong>Recommendation:</strong> Create index <code>CREATE INDEX idx_orders_status ON orders(status)</code> and increase <code>SGA_TARGET</code>.';
        }

        if (lowerQuery.includes('memory') || lowerQuery.includes('oom') || lowerQuery.includes('leak')) {
            return 'Memory analysis across your fleet: 3 hosts are approaching critical thresholds. <strong>Host prod-api-03</strong>: 94% memory usage (RSS growing 50MB/day - possible leak in Java heap). <strong>Host prod-worker-07</strong>: 91% (OOM killer triggered twice this week). Ops Insights forecasts prod-api-03 will hit OOM in ~3 days at current growth rate. Recommend enabling heap dump on OOM and reviewing the connection pool configuration.';
        }

        if (lowerQuery.includes('latency') || lowerQuery.includes('slow') || lowerQuery.includes('timeout')) {
            return 'APM distributed trace analysis reveals the latency bottleneck: <strong>P99 latency</strong> spiked to 4.2s (baseline: 800ms) starting at 14:00 UTC. Trace breakdown: <code>frontend</code> → <code>api-gateway</code> (12ms) → <code>order-service</code> (45ms) → <code>inventory-db</code> (<strong>3.8s</strong>). The inventory database is the root cause - running a long-running batch job that\'s competing for I/O. Consider scheduling batch jobs during off-peak hours.';
        }

        if (lowerQuery.includes('alarm') || lowerQuery.includes('alert') || lowerQuery.includes('notification')) {
            return 'Current alarm status: <strong>3 Critical</strong>, <strong>7 Warning</strong>, <strong>142 OK</strong>. Critical alarms: (1) <code>prod-db-01 CPU > 95%</code> for 15 min, (2) <code>api-gateway error rate > 5%</code>, (3) <code>disk usage > 90%</code> on <code>prod-logs-02</code>. The disk alarm is recurring - Log Analytics archive job hasn\'t run since Monday. Shall I trigger the archive job via OCI Functions?';
        }

        if (lowerQuery.includes('cost') || lowerQuery.includes('budget') || lowerQuery.includes('spending')) {
            return 'Observability cost analysis for this month: <strong>Total: $2,847</strong> (within $3,500 budget). Breakdown: Log Analytics storage $1,240 (43%), APM traces $680 (24%), Custom Metrics $520 (18%), DB Management $407 (14%). <strong>Optimization opportunity:</strong> Moving 60-day-old logs to archive storage could save ~$380/month. 3 unused APM domains detected - decommissioning could save $120/month.';
        }

        if (lowerQuery.includes('security') || lowerQuery.includes('threat') || lowerQuery.includes('breach')) {
            return 'Security posture summary from Cloud Guard: <strong>Security Score: 82/100</strong>. <strong>5 Critical findings:</strong> (1) Public bucket detected in Production compartment, (2) Instance with unrestricted SSH access (0.0.0.0/0), (3) Unencrypted block volumes (2 instances), (4) IAM user without MFA, (5) Outdated OS image (CVE-2024-3094). Responder recipes are ready for auto-remediation on findings #1 and #2. Shall I activate them?';
        }

        return 'I\'m analyzing your query across multiple data sources including Log Analytics, APM, Monitoring, and Database Management. Based on the available data, I can provide insights about performance trends, error patterns, capacity planning, security posture, or cost optimization. Try asking about specific areas like "Show error trends", "Analyze database performance", or "Check alarm status".';
    }

    // ============================================
    // Utility Functions
    // ============================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Keyboard Navigation
    // ============================================
    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Arrow keys to navigate modules
            if (e.altKey) {
                const currentIndex = MODULE_ORDER.indexOf(state.currentModule);

                if (e.key === 'ArrowRight' && currentIndex < MODULE_ORDER.length - 1) {
                    const nextModule = MODULE_ORDER[currentIndex + 1];
                    routeToModule(nextModule);
                } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    const prevModule = MODULE_ORDER[currentIndex - 1];
                    routeToModule(prevModule);
                }
            }
        });
    }

    // ============================================
    // CSS Animation Injection
    // ============================================
    function injectAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulseHighlight {
                0% { box-shadow: 0 0 0 0 rgba(199, 70, 52, 0.4); }
                70% { box-shadow: 0 0 0 20px rgba(199, 70, 52, 0); }
                100% { box-shadow: 0 0 0 0 rgba(199, 70, 52, 0); }
            }

            .highlight {
                animation: pulseHighlight 0.8s ease-out;
            }

            .cluster-bubble {
                transition: transform 0.3s ease, opacity 0.3s ease;
            }

            .sankey-flow {
                transition: opacity 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // Pillar Cards Drag and Drop
    // ============================================
    function initPillarDragDrop(moduleRoot) {
        if (!moduleRoot) return false;

        const pillarsGrid = moduleRoot.querySelector('#pillarsGrid');
        if (!pillarsGrid) {
            return;
        }
        if (pillarsGrid.dataset.dragReady === 'true') {
            return true;
        }
        pillarsGrid.dataset.dragReady = 'true';

        let draggedCard = null;

        // Use event delegation on the grid container
        pillarsGrid.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.pillar-card');
            if (!card) return;

            draggedCard = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.pillarId || '');

            // Use setTimeout to allow the drag image to be captured
            setTimeout(() => {
                card.style.opacity = '0.4';
            }, 0);
        });

        pillarsGrid.addEventListener('dragend', (e) => {
            const card = e.target.closest('.pillar-card');
            if (!card) return;

            card.classList.remove('dragging');
            card.style.opacity = '';
            draggedCard = null;

            // Remove drag-over from all cards
            pillarsGrid.querySelectorAll('.pillar-card').forEach(c => {
                c.classList.remove('drag-over');
            });
        });

        pillarsGrid.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const card = e.target.closest('.pillar-card');
            if (card && card !== draggedCard) {
                // Remove drag-over from all, then add to current
                pillarsGrid.querySelectorAll('.pillar-card').forEach(c => {
                    c.classList.remove('drag-over');
                });
                card.classList.add('drag-over');
            }
        });

        pillarsGrid.addEventListener('dragleave', (e) => {
            const card = e.target.closest('.pillar-card');
            if (card) {
                card.classList.remove('drag-over');
            }
        });

        pillarsGrid.addEventListener('drop', (e) => {
            e.preventDefault();

            const targetCard = e.target.closest('.pillar-card');
            if (!targetCard || !draggedCard || targetCard === draggedCard) return;

            targetCard.classList.remove('drag-over');

            const allCards = [...pillarsGrid.querySelectorAll('.pillar-card')];
            const draggedIndex = allCards.indexOf(draggedCard);
            const targetIndex = allCards.indexOf(targetCard);

            if (draggedIndex < targetIndex) {
                targetCard.parentNode.insertBefore(draggedCard, targetCard.nextSibling);
            } else {
                targetCard.parentNode.insertBefore(draggedCard, targetCard);
            }

            // Save order to localStorage
            savePillarOrder();

            // Visual feedback
            draggedCard.style.animation = 'none';
            draggedCard.offsetHeight; // Trigger reflow
            draggedCard.style.animation = 'dropBounce 0.3s ease-out';
        });

        // Load saved order on init
        loadPillarOrder();

        return true;
    }

    function savePillarOrder() {
        const pillarsGrid = document.getElementById('pillarsGrid');
        if (!pillarsGrid) return;

        const order = [...pillarsGrid.querySelectorAll('.pillar-card')]
            .map(card => card.dataset.pillarId);
        localStorage.setItem('pillar-order', JSON.stringify(order));
    }

    function loadPillarOrder() {
        const pillarsGrid = document.getElementById('pillarsGrid');
        if (!pillarsGrid) return;

        const savedOrder = localStorage.getItem('pillar-order');
        if (!savedOrder) return;

        try {
            const order = JSON.parse(savedOrder);
            const cards = pillarsGrid.querySelectorAll('.pillar-card');
            const cardMap = new Map();

            cards.forEach(card => {
                cardMap.set(card.dataset.pillarId, card);
            });

            order.forEach(id => {
                const card = cardMap.get(id);
                if (card) {
                    pillarsGrid.appendChild(card);
                }
            });
        } catch (e) {
            console.warn('Could not load pillar order:', e);
        }
    }

    // ============================================
    // Mindmap Node Dragging
    // ============================================
    function initMindmapDrag(moduleRoot) {
        if (!moduleRoot || window.innerWidth <= 768) return false;

        const mindmapContainer = moduleRoot.querySelector('#mindmapContainer');
        const mindmap = moduleRoot.querySelector('#mindmap');
        if (!mindmapContainer || !mindmap) return false;
        if (mindmapContainer.dataset.dragReady === 'true') return true;
        mindmapContainer.dataset.dragReady = 'true';

        let activeNode = null;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;

        // Get all draggable nodes
        const draggableNodes = mindmap.querySelectorAll('.draggable-node');

        draggableNodes.forEach(node => {
            // Store initial position
            const rect = node.getBoundingClientRect();
            const containerRect = mindmap.getBoundingClientRect();
            node.dataset.initialX = rect.left - containerRect.left;
            node.dataset.initialY = rect.top - containerRect.top;

            // Mouse down event
            node.addEventListener('mousedown', (e) => {
                // Don't drag if clicking on EOL badge link
                if (e.target.closest('.eol-badge')) return;

                e.preventDefault();
                activeNode = node;
                startX = e.clientX;
                startY = e.clientY;

                // Get current transform or position
                const style = window.getComputedStyle(node);
                const transform = style.transform;

                if (transform && transform !== 'none') {
                    const matrix = new DOMMatrix(transform);
                    initialX = matrix.m41;
                    initialY = matrix.m42;
                } else {
                    initialX = 0;
                    initialY = 0;
                }

                node.classList.add('dragging');
                document.body.style.cursor = 'grabbing';
            });
        });

        // Mouse move - track on document for smooth dragging
        document.addEventListener('mousemove', (e) => {
            if (!activeNode) return;

            e.preventDefault();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Update position
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;

            // For pillar nodes, adjust the transform
            if (activeNode.classList.contains('pillar-node')) {
                const pillar = activeNode.dataset.pillar;
                const baseTransforms = {
                    'monitoring': { x: 280, y: 0 },
                    'stack': { x: 140, y: -242 },
                    'apm': { x: -140, y: -242 },
                    'logs': { x: -280, y: 0 },
                    'opsinsights': { x: -140, y: 242 },
                    'dbmgmt': { x: 140, y: 242 }
                };
                const base = baseTransforms[pillar] || { x: 0, y: 0 };
                activeNode.style.transform = `translate(calc(-50% + ${base.x + deltaX}px), calc(-50% + ${base.y + deltaY}px))`;
            } else {
                // For other nodes (enablers, services)
                activeNode.style.transform = `translate(${newX}px, ${newY}px)`;
            }

            // Redraw connections
            initMindmapConnections();
        });

        // Mouse up - finish dragging
        document.addEventListener('mouseup', () => {
            if (!activeNode) return;

            activeNode.classList.remove('dragging');
            document.body.style.cursor = '';

            // Save position to localStorage
            saveMindmapPositions();

            activeNode = null;
        });

        // Reset button
        const resetBtn = document.getElementById('resetPositions');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetMindmapPositions);
        }

        // Load saved positions
        loadMindmapPositions();

        return true;
    }

    function saveMindmapPositions() {
        const mindmap = document.getElementById('mindmap');
        if (!mindmap) return;

        const positions = {};
        const draggableNodes = mindmap.querySelectorAll('.draggable-node');

        draggableNodes.forEach(node => {
            const id = node.dataset.pillar || node.dataset.enabler || node.dataset.service;
            if (id) {
                positions[id] = node.style.transform;
            }
        });

        localStorage.setItem('mindmap-positions', JSON.stringify(positions));
        localStorage.setItem('mindmap-layout-version', 'v2');
    }

    function loadMindmapPositions() {
        const mindmap = document.getElementById('mindmap');
        if (!mindmap) return;

        // Clear stale positions from previous layout version
        const layoutVersion = 'v2';
        if (localStorage.getItem('mindmap-layout-version') !== layoutVersion) {
            localStorage.removeItem('mindmap-positions');
            localStorage.setItem('mindmap-layout-version', layoutVersion);
            return;
        }

        const saved = localStorage.getItem('mindmap-positions');
        if (!saved) return;

        try {
            const positions = JSON.parse(saved);
            const draggableNodes = mindmap.querySelectorAll('.draggable-node');

            draggableNodes.forEach(node => {
                const id = node.dataset.pillar || node.dataset.enabler || node.dataset.service;
                if (id && positions[id]) {
                    node.style.transform = positions[id];
                }
            });

            // Redraw connections after loading positions
            setTimeout(initMindmapConnections, 100);
        } catch (e) {
            console.warn('Could not load mindmap positions:', e);
        }
    }

    function resetMindmapPositions() {
        const mindmap = document.getElementById('mindmap');
        if (!mindmap) return;

        // Clear saved positions
        localStorage.removeItem('mindmap-positions');

        // Reset pillar nodes to default transforms
        const pillarDefaults = {
            'monitoring': 'translate(calc(-50% + 280px), -50%)',
            'stack': 'translate(calc(-50% + 140px), calc(-50% - 242px))',
            'apm': 'translate(calc(-50% - 140px), calc(-50% - 242px))',
            'logs': 'translate(calc(-50% - 280px), -50%)',
            'opsinsights': 'translate(calc(-50% - 140px), calc(-50% + 242px))',
            'dbmgmt': 'translate(calc(-50% + 140px), calc(-50% + 242px))'
        };

        document.querySelectorAll('.pillar-node').forEach(node => {
            const pillar = node.dataset.pillar;
            if (pillar && pillarDefaults[pillar]) {
                node.style.transform = pillarDefaults[pillar];
            }
        });

        // Reset other draggable nodes
        document.querySelectorAll('.enabler-node, .oci-service-node').forEach(node => {
            node.style.transform = '';
        });

        // Redraw connections
        setTimeout(initMindmapConnections, 100);
    }

    // ============================================
    // Service Cards Interactivity
    // ============================================
    function initServiceCardEnhancements(moduleRoot) {
        if (!moduleRoot) return false;

        // Add hover effects and click tracking for service cards
        const serviceCards = moduleRoot.querySelectorAll('.service-card');

        serviceCards.forEach(card => {
            if (card.dataset.serviceCardReady === 'true') return;
            card.dataset.serviceCardReady = 'true';
            card.addEventListener('mouseenter', () => {
                // Add subtle glow on hover
                const serviceName = card.querySelector('h3')?.textContent;
                if (serviceName) {
                }
            });
        });

        // EOL service card special handling
        const eolCards = moduleRoot.querySelectorAll('.eol-service');
        eolCards.forEach(card => {
            if (card.dataset.eolReady === 'true') return;
            card.dataset.eolReady = 'true';
            card.addEventListener('click', (e) => {
                // If clicking the EOL link, don't prevent default
                if (e.target.closest('.eol-link')) {
                    return;
                }
            });
        });

        return true;
    }

    // ============================================
    // Query Builder (Monitoring Module)
    // ============================================
    function initQueryBuilder(moduleRoot) {
        if (!moduleRoot || moduleRoot.dataset.queryBuilderReady === 'true') return moduleRoot ? true : false;

        // Metric names by namespace (sample data)
        const metricsByNamespace = {
            'oci_computeagent': ['CpuUtilization', 'MemoryUtilization', 'DiskBytesRead', 'DiskBytesWritten', 'NetworkBytesIn', 'NetworkBytesOut', 'LoadAverage'],
            'oci_compute_infrastructure_health': ['instance_status', 'health_status', 'maintenance_reboot'],
            'oci_autonomous_database': ['CpuUtilization', 'StorageUsed', 'SessionCount', 'ExecutionCount', 'RunningStatementCount', 'SQLStatements'],
            'oci_database': ['CpuUtilization', 'StorageUsedPercent', 'SessionsActive', 'ParseCount', 'ExecuteCount'],
            'oci_vcn': ['VnicFromNetworkBytes', 'VnicToNetworkBytes', 'VnicFromNetworkPackets', 'VnicToNetworkPackets'],
            'oci_lbaas': ['ActiveConnections', 'BytesReceived', 'BytesSent', 'FailedSSLClientCertVerify', 'FailedSSLHandshake'],
            'oci_objectstorage': ['ObjectCount', 'StoredBytes', 'GetRequests', 'PutRequests', 'DeleteRequests'],
            'oci_blockstore': ['VolumeReadOps', 'VolumeWriteOps', 'VolumeReadBytes', 'VolumeWriteBytes', 'VolumeReadThroughput'],
            'oci_streaming': ['PublishMessageCount', 'ConsumeMessageCount', 'PublishBytes', 'ConsumeBytes'],
            'oci_faas': ['FunctionInvocationCount', 'FunctionExecutionDuration', 'FunctionMemoryUtilization', 'FunctionResponseCount'],
            'oracle_apm_synthetics': ['availability', 'responseTime', 'dnsTime', 'connectTime', 'sslHandshakeTime'],
            'oracle_apm_rum': ['pageLoadTime', 'domContentLoaded', 'firstPaint', 'firstContentfulPaint', 'jsErrors']
        };

        // Initialize tag inputs
        initTagInput('compartmentsInput', 'compartmentSearch', 'selectedCompartments', 'compartmentDropdown');
        initTagInput('regionsInput', 'regionSearch', 'selectedRegions', 'regionDropdown', true);

        // Initialize namespace searchable select
        initNamespaceSelect();

        // Initialize add region button
        const addRegionBtn = document.getElementById('addRegionBtn');
        const regionSearchInput = document.getElementById('regionSearch');
        if (addRegionBtn && regionSearchInput) {
            addRegionBtn.addEventListener('click', () => {
                const value = regionSearchInput.value.trim();
                if (value) {
                    addTag('selectedRegions', value);
                    regionSearchInput.value = '';
                }
            });

            regionSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addRegionBtn.click();
                }
            });
        }

        function initTagInput(containerId, inputId, tagsContainerId, dropdownId, allowCustom = false) {
            const container = document.getElementById(containerId);
            const input = document.getElementById(inputId);
            const dropdown = document.getElementById(dropdownId);

            if (!container || !input || !dropdown) return;

            // Show dropdown on focus
            input.addEventListener('focus', () => {
                dropdown.classList.add('active');
            });

            // Filter dropdown on input
            input.addEventListener('input', () => {
                const filter = input.value.toLowerCase();
                const items = dropdown.querySelectorAll('.dropdown-item');
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(filter) ? 'block' : 'none';
                });
            });

            // Select item from dropdown
            dropdown.addEventListener('click', (e) => {
                const item = e.target.closest('.dropdown-item');
                if (item && !item.classList.contains('disabled')) {
                    const value = item.dataset.value;
                    if (value) {
                        addTag(tagsContainerId, value);
                        input.value = '';
                        dropdown.classList.remove('active');
                    }
                }
            });

            // Close dropdown on outside click
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });

            // Remove tag handler
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-remove')) {
                    e.target.closest('.tag').remove();
                }
            });
        }

        function addTag(containerId, value) {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Check if already exists
            const existing = [...container.querySelectorAll('.tag')]
                .some(candidate => candidate.dataset.value === value);
            if (existing) return;

            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.dataset.value = value;
            tag.appendChild(document.createTextNode(`${value} `));

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'tag-remove';
            removeButton.dataset.value = value;
            removeButton.setAttribute('aria-label', `Remove ${value}`);
            removeButton.textContent = '×';
            tag.appendChild(removeButton);
            container.appendChild(tag);
        }

        function initNamespaceSelect() {
            const input = document.getElementById('namespaceSearch');
            const dropdown = document.getElementById('namespaceDropdown');
            const metricInput = document.getElementById('metricNameSearch');
            const metricDropdown = document.getElementById('metricNameDropdown');

            if (!input || !dropdown) return;

            let selectedNamespace = '';

            // Show dropdown on focus
            input.addEventListener('focus', () => {
                dropdown.classList.add('active');
            });

            // Filter dropdown on input
            input.addEventListener('input', () => {
                const filter = input.value.toLowerCase();
                const items = dropdown.querySelectorAll('.dropdown-item:not(.add-custom)');
                let hasMatch = false;

                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    const value = item.dataset.value?.toLowerCase() || '';
                    const show = text.includes(filter) || value.includes(filter);
                    item.style.display = show ? 'block' : 'none';
                    if (show && item.dataset.value) hasMatch = true;
                });

                // Show sections based on child visibility
                dropdown.querySelectorAll('.dropdown-section').forEach(section => {
                    let nextItem = section.nextElementSibling;
                    let hasVisibleChild = false;
                    while (nextItem && !nextItem.classList.contains('dropdown-section')) {
                        if (nextItem.style.display !== 'none' && nextItem.classList.contains('dropdown-item')) {
                            hasVisibleChild = true;
                        }
                        nextItem = nextItem.nextElementSibling;
                    }
                    section.style.display = hasVisibleChild ? 'block' : 'none';
                });
            });

            // Select namespace
            dropdown.addEventListener('click', (e) => {
                const item = e.target.closest('.dropdown-item');
                if (!item) return;

                if (item.classList.contains('add-custom')) {
                    // Prompt for custom namespace
                    const customNs = prompt('Enter custom namespace:');
                    if (customNs && customNs.trim()) {
                        selectNamespace(customNs.trim());
                    }
                } else if (item.dataset.value) {
                    selectNamespace(item.dataset.value);
                }
                dropdown.classList.remove('active');
            });

            // Close dropdown on outside click
            document.addEventListener('click', (e) => {
                if (!input.closest('.searchable-select').contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });

            // Allow typing custom namespace and pressing Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = input.value.trim();
                    if (value) {
                        selectNamespace(value);
                        dropdown.classList.remove('active');
                    }
                }
            });

            function selectNamespace(namespace) {
                selectedNamespace = namespace;
                input.value = namespace;

                // Mark as selected in dropdown
                dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.toggle('selected', item.dataset.value === namespace);
                });

                // Enable and populate metric names
                if (metricInput && metricDropdown) {
                    metricInput.disabled = false;
                    metricInput.placeholder = 'Search metrics...';

                    // Get metrics for this namespace
                    const metrics = metricsByNamespace[namespace] || [];

                    metricDropdown.innerHTML = '';
                    if (metrics.length === 0) {
                        metricDropdown.innerHTML = '<div class="dropdown-item disabled">No metrics found for this namespace</div>';
                        metricDropdown.innerHTML += '<div class="dropdown-item add-custom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add custom metric...</div>';
                    } else {
                        metrics.forEach(metric => {
                            const item = document.createElement('div');
                            item.className = 'dropdown-item';
                            item.dataset.value = metric;
                            item.textContent = metric;
                            metricDropdown.appendChild(item);
                        });
                        const addCustom = document.createElement('div');
                        addCustom.className = 'dropdown-item add-custom';
                        addCustom.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add custom metric...';
                        metricDropdown.appendChild(addCustom);
                    }

                    // Initialize metric select behavior
                    initMetricSelect();
                }
            }

            function initMetricSelect() {
                if (!metricInput || !metricDropdown) return;

                metricInput.addEventListener('focus', () => {
                    metricDropdown.classList.add('active');
                });

                metricInput.addEventListener('input', () => {
                    const filter = metricInput.value.toLowerCase();
                    metricDropdown.querySelectorAll('.dropdown-item:not(.add-custom)').forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(filter) ? 'block' : 'none';
                    });
                });

                metricDropdown.addEventListener('click', (e) => {
                    const item = e.target.closest('.dropdown-item');
                    if (!item) return;

                    if (item.classList.contains('add-custom')) {
                        const customMetric = prompt('Enter custom metric name:');
                        if (customMetric && customMetric.trim()) {
                            metricInput.value = customMetric.trim();
                        }
                    } else if (item.dataset.value) {
                        metricInput.value = item.dataset.value;
                    }
                    metricDropdown.classList.remove('active');
                });

                document.addEventListener('click', (e) => {
                    if (!metricInput.closest('.searchable-select').contains(e.target)) {
                        metricDropdown.classList.remove('active');
                    }
                });
            }
        }

        // Add Query button
        const addQueryBtn = document.getElementById('addQuery');
        if (addQueryBtn) {
            let queryCount = 1;
            addQueryBtn.addEventListener('click', () => {
                queryCount++;
                const queryContainer = document.querySelector('.query-builder-container');
                if (!queryContainer) return;

                const newCard = document.createElement('div');
                newCard.className = 'query-card';
                newCard.id = `queryCard${queryCount}`;
                newCard.innerHTML = `
                    <div class="query-header">
                        <span class="query-title">Query ${queryCount}</span>
                        <div class="query-actions">
                            <button class="btn-ghost remove-query" title="Remove query" style="padding: 4px 8px; font-size: 12px; color: var(--error);">Remove</button>
                        </div>
                    </div>
                    <div class="query-form">
                        <div class="query-row">
                            <div class="query-field">
                                <label class="field-label">METRIC NAMESPACE</label>
                                <div class="searchable-select">
                                    <input type="text" class="select-input" placeholder="Type namespace (e.g., oci_computeagent)...">
                                </div>
                            </div>
                            <div class="query-field">
                                <label class="field-label">METRIC NAME</label>
                                <div class="searchable-select">
                                    <input type="text" class="select-input" placeholder="Type metric name...">
                                </div>
                            </div>
                            <div class="query-field small">
                                <label class="field-label">INTERVAL</label>
                                <select class="query-select">
                                    <option value="1m">1 minute</option>
                                    <option value="5m">5 minutes</option>
                                    <option value="1h" selected>1 hour</option>
                                    <option value="1d">1 day</option>
                                </select>
                            </div>
                            <div class="query-field small">
                                <label class="field-label">STATISTIC</label>
                                <select class="query-select">
                                    <option value="mean" selected>Mean</option>
                                    <option value="sum">Sum</option>
                                    <option value="max">Max</option>
                                    <option value="min">Min</option>
                                    <option value="p99">P99</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;

                // Insert before the query actions/results
                const existingResults = document.getElementById('queryResults');
                if (existingResults) {
                    queryContainer.insertBefore(newCard, existingResults);
                } else {
                    queryContainer.appendChild(newCard);
                }

                // Bind remove button
                newCard.querySelector('.remove-query').addEventListener('click', () => {
                    newCard.remove();
                });
            });
        }

        function appendQuerySummary(container, prefix, namespace, metric) {
            container.appendChild(document.createTextNode(prefix));
            const namespaceValue = document.createElement('strong');
            namespaceValue.textContent = namespace;
            container.appendChild(namespaceValue);
            container.appendChild(document.createTextNode(' / '));
            const metricValue = document.createElement('strong');
            metricValue.textContent = metric;
            container.appendChild(metricValue);
        }

        function appendSparkline(container, points, height = 60) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', `0 0 200 ${height}`);
            svg.style.cssText = `width: ${height === 60 ? '100%; max-width: 300px' : '200px'}; height: ${height}px;${height === 60 ? ' margin-top: 8px;' : ''}`;
            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', points);
            polyline.setAttribute('fill', 'none');
            polyline.setAttribute('stroke', 'var(--monitoring-color)');
            polyline.setAttribute('stroke-width', '2');
            svg.appendChild(polyline);
            container.appendChild(svg);
        }

        function renderEmptyQueryResults(results) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'padding: 40px; text-align: center;';
            const message = document.createElement('div');
            message.style.cssText = 'font-size: 14px; color: var(--text-muted);';
            message.textContent = 'Please configure at least one query with a namespace';
            wrapper.appendChild(message);
            results.replaceChildren(wrapper);
        }

        function renderQueryResults(results, queries) {
            const wrapper = document.createElement('div');
            wrapper.style.padding = '24px';
            const heading = document.createElement('h4');
            heading.style.cssText = 'color: var(--text-primary); margin-bottom: 16px;';
            heading.textContent = 'Query Results';
            wrapper.appendChild(heading);

            queries.forEach((query, index) => {
                const card = document.createElement('div');
                card.style.cssText = 'padding: 16px; background: var(--surface-2); border-radius: 8px; margin-bottom: 12px;';
                const summary = document.createElement('div');
                summary.style.cssText = 'font-size: 14px; color: var(--text-primary); margin-bottom: 4px;';
                appendQuerySummary(summary, `Query ${index + 1}: `, query.namespace, query.metric);
                card.appendChild(summary);

                const note = document.createElement('div');
                note.style.cssText = 'font-size: 12px; color: var(--text-muted);';
                note.textContent = '(Demo - connect to OCI API for real data)';
                card.appendChild(note);
                appendSparkline(card, `0,${40 + Math.random() * 15} 40,${20 + Math.random() * 20} 80,${30 + Math.random() * 15} 120,${15 + Math.random() * 20} 160,${25 + Math.random() * 15} 200,${10 + Math.random() * 20}`);
                wrapper.appendChild(card);
            });
            results.replaceChildren(wrapper);
        }

        function renderExecutedQuery(results, namespace, metric) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'padding: 40px; text-align: center;';
            const summary = document.createElement('div');
            summary.style.cssText = 'font-size: 16px; color: var(--text-primary); margin-bottom: 8px;';
            appendQuerySummary(summary, 'Query executed for ', namespace, metric);
            wrapper.appendChild(summary);

            const note = document.createElement('div');
            note.style.cssText = 'font-size: 13px; color: var(--text-muted);';
            note.textContent = '(This is a demo - connect to OCI API for real metrics data)';
            wrapper.appendChild(note);

            const chart = document.createElement('div');
            chart.style.cssText = 'margin-top: 24px; padding: 20px; background: var(--surface-2); border-radius: 8px; display: inline-block;';
            appendSparkline(chart, '0,60 30,50 60,55 90,30 120,40 150,20 180,35 200,25', 80);
            wrapper.appendChild(chart);
            results.replaceChildren(wrapper);
        }

        // Run All Queries button
        const runAllBtn = document.getElementById('runAllQueries');
        if (runAllBtn) {
            runAllBtn.addEventListener('click', () => {
                const allCards = document.querySelectorAll('.query-card');
                const results = document.getElementById('queryResults');
                if (!results) return;

                const queries = [];
                allCards.forEach(card => {
                    const ns = card.querySelector('.select-input')?.value || 'N/A';
                    const metric = card.querySelectorAll('.select-input')[1]?.value || 'N/A';
                    if (ns && ns !== 'N/A') {
                        queries.push({ namespace: ns, metric: metric || 'all metrics' });
                    }
                });

                if (queries.length === 0) {
                    renderEmptyQueryResults(results);
                    return;
                }

                renderQueryResults(results, queries);
            });
        }

        // Initialize dimension adding
        const addDimensionBtn = document.getElementById('addDimension1');
        const dimensionsList = document.getElementById('dimensionsList1');
        if (addDimensionBtn && dimensionsList) {
            addDimensionBtn.addEventListener('click', () => {
                const row = document.createElement('div');
                row.className = 'dimension-row';
                row.innerHTML = `
                    <input type="text" class="select-input" placeholder="Dimension name">
                    <input type="text" class="select-input" placeholder="Dimension value">
                    <button class="tag-remove" title="Remove dimension">&times;</button>
                `;
                row.querySelector('.tag-remove').addEventListener('click', () => row.remove());
                dimensionsList.appendChild(row);
            });
        }

        // Run query button (placeholder action)
        const runQueryBtn = document.getElementById('runQuery1');
        if (runQueryBtn) {
            runQueryBtn.addEventListener('click', () => {
                const namespace = document.getElementById('namespaceSearch')?.value;
                const metric = document.getElementById('metricNameSearch')?.value;

                if (!namespace) {
                    alert('Please select a namespace');
                    return;
                }
                if (!metric) {
                    alert('Please select a metric');
                    return;
                }

                // Show placeholder result
                const results = document.getElementById('queryResults');
                if (results) {
                    renderExecutedQuery(results, namespace, metric);
                }
            });
        }

        moduleRoot.dataset.queryBuilderReady = 'true';
        return true;
    }

    let clipboardStatusTimer;

    function announceClipboardStatus(message, { error = false } = {}) {
        const status = document.getElementById('clipboardStatus');
        if (!status) return;
        clearTimeout(clipboardStatusTimer);
        status.setAttribute('role', error ? 'alert' : 'status');
        status.setAttribute('aria-live', error ? 'assertive' : 'polite');
        status.textContent = message;
        status.classList.add('has-message');
        clipboardStatusTimer = setTimeout(() => {
            status.classList.remove('has-message');
            status.textContent = '';
        }, 5000);
    }

    async function copyTextWithFallback(rawText) {
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
            await navigator.clipboard.writeText(rawText);
            announceClipboardStatus('Copied to clipboard.');
            return true;
        } catch (clipboardError) {
            const previousFocus = document.activeElement;
            const textarea = document.createElement('textarea');
            textarea.value = rawText;
            textarea.setAttribute('aria-hidden', 'true');
            textarea.style.cssText = 'position:fixed; inset:auto auto 0 -9999px; opacity:0;';
            document.body.appendChild(textarea);
            try {
                textarea.select();
                if (typeof document.execCommand !== 'function' || !document.execCommand('copy')) {
                    throw new Error('Legacy copy command unavailable');
                }
                announceClipboardStatus('Copied to clipboard.');
                return true;
            } catch (fallbackError) {
                console.warn('Clipboard copy blocked', clipboardError, fallbackError);
                announceClipboardStatus('Copy failed. Select the visible code and copy it manually.', { error: true });
                return false;
            } finally {
                textarea.remove();
                if (previousFocus instanceof HTMLElement) previousFocus.focus();
            }
        }
    }

    function showCopyFeedback(button, copied) {
        const originalText = button.textContent;
        button.textContent = copied ? 'Copied!' : 'Copy manually';
        if (copied) {
            button.style.background = '#2ea44f';
            button.style.color = '#ffffff';
            button.style.borderColor = '#2ea44f';
        }
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 2000);
    }

    // ============================================
    // Audience Guidance Panel Interactions
    // ============================================
    function initAudienceGuidance() {
        const tabs = document.querySelectorAll('.audience-tab');
        const panels = document.querySelectorAll('.audience-panel');

        if (tabs.length > 0 && panels.length > 0) {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetPanelId = tab.getAttribute('aria-controls');

                    // Update tab active states
                    tabs.forEach(t => {
                        t.classList.toggle('active', t === tab);
                        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
                    });

                    // Update panel active states
                    panels.forEach(p => {
                        p.classList.toggle('active', p.id === targetPanelId);
                    });
                });
            });
        }

        // Subtabs for practitioners (otel, ocl, mql)
        const subtabs = document.querySelectorAll('.subtab-btn');
        const codePanels = document.querySelectorAll('.code-panel');

        if (subtabs.length > 0 && codePanels.length > 0) {
            subtabs.forEach(subtab => {
                subtab.addEventListener('click', () => {
                    const targetSubtab = subtab.dataset.subtab;
                    const targetPanelId = `subtab-panel-${targetSubtab}`;

                    // Update subtab active states
                    subtabs.forEach(st => {
                        st.classList.toggle('active', st === subtab);
                    });

                    // Update code panel active states
                    codePanels.forEach(cp => {
                        cp.classList.toggle('active', cp.id === targetPanelId);
                    });
                });
            });
        }

        // Copy code helper
        const copyBtns = document.querySelectorAll('.copy-code-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = btn.dataset.copyTarget;
                const codeElement = document.getElementById(targetId);
                if (codeElement) {
                    showCopyFeedback(btn, await copyTextWithFallback(codeElement.textContent));
                }
            });
        });
    }

    // ==========================================================================
    // OCI Implementation Hub & Service Inspector Interactions
    // ==========================================================================
    function initImplementationHub() {
        const timelineNodes = [...document.querySelectorAll('.timeline-node')];
        const levelTabs = [...document.querySelectorAll('.level-tab')];
        const phasePanels = [...document.querySelectorAll('.phase-panel')];
        const levelPanels = [...document.querySelectorAll('.level-content')];

        const phaseOrder = ['phase1', 'phase2', 'phase3', 'phase4'];

        function bindRovingTablist(tabs, activate) {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => activate(tab));
                tab.addEventListener('keydown', event => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const currentIndex = tabs.indexOf(event.currentTarget);
                    const nextIndex = event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                            ? tabs.length - 1
                            : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                    activate(tabs[nextIndex], { focus: true });
                });
            });
        }

        function syncAudienceControls(phase) {
            levelTabs.forEach(tab => tab.setAttribute('aria-controls', `${phase}-${tab.dataset.level}-panel`));
        }

        function activatePhase(node, { focus = false } = {}) {
            const selectedPhase = node.dataset.phase;
            const currentIndex = phaseOrder.indexOf(selectedPhase);
            timelineNodes.forEach(tab => {
                const selected = tab === node;
                tab.classList.toggle('active', selected);
                tab.classList.toggle('completed', phaseOrder.indexOf(tab.dataset.phase) < currentIndex);
                tab.setAttribute('aria-selected', String(selected));
                tab.tabIndex = selected ? 0 : -1;
            });
            phasePanels.forEach(panel => {
                const selected = panel.dataset.phase === selectedPhase;
                panel.classList.toggle('active', selected);
                panel.hidden = !selected;
            });
            syncAudienceControls(selectedPhase);
            if (focus) node.focus();
        }

        function activateAudience(tab, { focus = false } = {}) {
            const selectedLevel = tab.dataset.level;
            levelTabs.forEach(candidate => {
                const selected = candidate === tab;
                candidate.classList.toggle('active', selected);
                candidate.setAttribute('aria-selected', String(selected));
                candidate.tabIndex = selected ? 0 : -1;
            });
            levelPanels.forEach(panel => {
                const selected = panel.dataset.level === selectedLevel;
                panel.classList.toggle('active', selected);
                panel.hidden = !selected;
            });
            if (focus) tab.focus();
        }

        if (!timelineNodes.length || !levelTabs.length) return;
        bindRovingTablist(timelineNodes, activatePhase);
        bindRovingTablist(levelTabs, activateAudience);
        activatePhase(timelineNodes.find(tab => tab.getAttribute('aria-selected') === 'true') || timelineNodes[0]);
        activateAudience(levelTabs.find(tab => tab.getAttribute('aria-selected') === 'true') || levelTabs[0]);
    }

    const SERVICE_DETAILS = {
        monitoring: {
            title: "OCI Monitoring",
            eyebrow: "Metric Collection & Alerting",
            levels: {
                level1: {
                    value: "Provides enterprise-grade metrics collection, customizable dashboards, and intelligent alarms to safeguard application availability and track SLA agreements.",
                    roi: "Reduces MTTR by up to 35% via automatic alarm routing and pager integration.",
                    compliance: "SOC2 Trust Criteria, ISO 42001 SLA validation"
                },
                level2: {
                    practices: "Leverage standardized metric namespaces (e.g. oci_computeagent, oci_lbaas) for resource groups. Build a clear, hierarchical alerting policy rather than one-off alerts to prevent responder fatigue.",
                    migration: "Oracle recommends migrating standard VM monitoring tasks from custom local cron scripts to native OCI Monitoring telemetry to consolidate metrics ingestion and dashboard logic."
                },
                level3: {
                    codeTitle: "OCI Monitoring Query Language (MQL) Alarm",
                    code: "CpuUtilization[1m]{resourceId = \"ocid1.instance.oc1..example\"}.mean() > 85",
                    openSourceDesc: "Scrape OCI Monitoring metrics directly into your Prometheus instance using the OCI Prometheus Exporter.",
                    openSourceTitle: "Prometheus Config (prometheus.yml)",
                    openSourceCode: "scrape_configs:\n  - job_name: 'oci-metrics-exporter'\n    static_configs:\n      - targets: ['localhost:9187']"
                }
            }
        },
        logs: {
            title: "Logging & Log Analytics",
            eyebrow: "Unified Log Ingestion & ML Clustering",
            levels: {
                level1: {
                    value: "Centralizes audit trails, system logs, and custom application records in a tamper-resistant, secure vault. Simplifies security compliance audits and diagnostic research.",
                    roi: "Cuts log management overhead by 50%+ through auto-partitioning and unified retention rules.",
                    compliance: "GDPR, HIPAA, SOC2 Audit Logging, ISO 27001"
                },
                level2: {
                    practices: "Separate OCI service logs (e.g. API Gateway, Object Storage logs) into specific log groups. Use Log Analytics ML-driven clustering to isolate rare log anomalies in millions of rows automatically.",
                    migration: "Route custom application log folders via Management Agent to OCI Log Analytics, archiving raw streams automatically to low-cost Object Storage via Service Connector Hub."
                },
                level3: {
                    codeTitle: "Log Analytics Query Language (OCL)",
                    code: "'Log Source' = 'OCI APM Trace' | summarize count() by 'Log Source' | sort -count()",
                    openSourceDesc: "Forward log records from local virtual machines or Kubernetes pods using Fluentd to OCI Log Analytics.",
                    openSourceTitle: "Fluentd Configuration (td-agent.conf)",
                    openSourceCode: "<source>\n  @type tail\n  path /var/log/app/portal.log\n  pos_file /var/log/td-agent/portal.pos\n  tag oci.loganalytics.portal\n  <parse>\n    @type json\n  </parse>\n</source>\n\n<match oci.loganalytics.**>\n  @type oci_log_analytics\n  namespace <TENANCY_NAMESPACE>\n  log_group_id ocid1.loggroup.oc1..example\n</match>"
                }
            }
        },
        apm: {
            title: "OCI APM",
            eyebrow: "End-to-End Tracing & RUM",
            levels: {
                level1: {
                    value: "Tracks customer experience metrics, client-side browser performance (RUM), and distributed transaction traces across gateways and databases.",
                    roi: "40% reduction in debug time by visually mapping the exact service causing the bottleneck.",
                    compliance: "UX SLA validation, distributed audits"
                },
                level2: {
                    practices: "Instrument applications using standard OpenTelemetry libraries. Define a standardized context propagation path across HTTP header boundaries. Configure trace sampling rate to control ingest costs.",
                    migration: "Migrate client-side tracking to OCI APM RUM script injection, and deploy OpenTelemetry Java/Node agents for automatic, zero-code framework instrumentation."
                },
                level3: {
                    codeTitle: "OpenTelemetry Java Agent Configuration",
                    code: "export OTEL_EXPORTER_OTLP_ENDPOINT=\"<APM_OTLP_ENDPOINT>\"\nexport OTEL_EXPORTER_OTLP_HEADERS=\"Authorization=Bearer <APM_PRIVATE_KEY>\"\nexport OTEL_SERVICE_NAME=\"payment-service\"",
                    openSourceDesc: "Integrate Real User Monitoring (RUM) tracing on your frontend website by injecting the APM browser agent snippet.",
                    openSourceTitle: "Browser JavaScript Agent",
                    openSourceCode: "window.apmrum = {\n  endpointUrl: '<APM_RUM_COLLECTOR_ENDPOINT>',\n  username: '<APM_RUM_PUBLIC_KEY>'\n};"
                }
            }
        },
        stack: {
            title: "Stack Monitoring",
            eyebrow: "Enterprise App Discovery",
            levels: {
                level1: {
                    value: "Discovers and models complex enterprise application stacks (such as E-Business Suite, WebLogic, PeopleSoft, and Oracle Database fleets) in unified topological views.",
                    roi: "Saves manual infrastructure auditing by dynamically mapping and tracking stack inter-dependencies.",
                    compliance: "ITIL Configuration Management (CMDB)"
                },
                level2: {
                    practices: "Perform resource stack discovery using unified Management Agents. Map WebLogic domain topologies directly to underlying database instance resources to monitor application-to-database wait states.",
                    migration: "Plan Stack Monitoring transitions: Oracle is standardizing on unified Management Agents for all host discovery. Migrate traditional agents to the unified mgmt_agent architecture."
                },
                level3: {
                    codeTitle: "Management Agent Discovery CLI Command",
                    code: "sudo /opt/oracle/mgmt_agent/agent_inst/bin/setup.sh \\\n  --service oci --profile default \\\n  --key /opt/oracle/mgmt_agent/agent_inst/config/regkey.txt",
                    openSourceDesc: "Deploy Management Agents using Docker containers for containerized Kubernetes workloads.",
                    openSourceTitle: "Docker Deployment Command",
                    openSourceCode: "docker run -d --name mgmt-agent \\\n  --network=host \\\n  -v /opt/oracle/mgmt_agent/config:/opt/oracle/mgmt_agent/agent_inst/config \\\n  container-registry.oracle.com/oci/mgmt_agent:latest"
                }
            }
        },
        opsinsights: {
            title: "Operations Insights",
            eyebrow: "Resource Forecasting & SQL Analysis",
            levels: {
                level1: {
                    value: "Machine learning capacities forecast future bottlenecks (CPU, storage, database IO) up to 30 days in advance. Minimizes hardware wastage by identifying idle resources.",
                    roi: "Up to 25% compute spend reduction by detecting and right-sizing over-provisioned systems.",
                    compliance: "FinOps Capacity Auditing, Green Compute SLA"
                },
                level2: {
                    practices: "Review capacity forecast trend dashboards weekly. Set policy rules that automatically alert the DevOps team when a database volume is projected to exceed 85% capacity within a 30-day window.",
                    migration: "Link critical database resource telemetry directly into Operations Insights SQL Warehouse to automatically isolate queries showing degradation trends over time."
                },
                level3: {
                    codeTitle: "Query Capacity Trends via OCI CLI",
                    code: "oci ops-insights summarize-resource-utilization-trends \\\n  --compartment-id <COMPARTMENT_OCID> \\\n  --resource-type host",
                    openSourceDesc: "Retrieve ML-derived forecasting metrics programmatically for customized reporting dashboards.",
                    openSourceTitle: "Python SDK Forecasting Call",
                    openSourceCode: "import oci\nconfig = oci.config.from_file()\nclient = oci.ops_insights.OpsInsightsClient(config)\nresponse = client.summarize_resource_utilization_trends(\n    compartment_id=\"<COMPARTMENT_OCID>\",\n    resource_type=\"host\"\n)\nprint(response.data)"
                }
            }
        },
        dbmgmt: {
            title: "Database Management",
            eyebrow: "Performance Hub & SQL Diagnostics",
            levels: {
                level1: {
                    value: "Ensures Oracle Database fleets run at peak performance. Active Performance Hub access allows administrators and engineers to troubleshoot query wait states and locks in real-time.",
                    roi: "Eliminates database-related application stalls and downtime by resolving SQL regressions in minutes.",
                    compliance: "Database audit logs, transaction SLA"
                },
                level2: {
                    practices: "Configure SQL plan baselines for critical transactional queries. Ensure automatic SQL Tuning Advisor tasks run during off-peak maintenance hours to prevent lock contentions on high-load tables.",
                    migration: "Enable unified Database Management endpoints on Autonomous Databases and co-managed DB systems to replace legacy Enterprise Manager setups."
                },
                level3: {
                    codeTitle: "Create SQL Tuning Task (PL/SQL)",
                    code: "DECLARE\n  l_sql_tune_task VARCHAR2(30);\nBEGIN\n  l_sql_tune_task := DBMS_SQLTUNE.create_tuning_task(\n    sql_id => '8t721mxgq52sw',\n    task_name => 'tune_portal_orders'\n  );\nEND;",
                    openSourceDesc: "Run SQL workload metrics extraction programmatically via Oracle Database REST API interfaces.",
                    openSourceTitle: "REST Endpoint Call (cURL)",
                    openSourceCode: "curl --config <TMP_0600_CURL_CONFIG> \\\n  -X GET <DB_MANAGEMENT_ENDPOINT>/ords/<DB_API_PATH>/performance/ash"
                }
            }
        }
    };

    const FUTURE_CAPABILITY_DETAILS = {
        'cross-signal': {
            title: 'Cross-signal investigation',
            summary: 'A planning direction for a more connected investigation experience across observability signals.',
            prepare: 'Preserve trace IDs, entity identifiers, workload labels, timestamps, and change references across the signals you collect today. Keep each signal in its documented system of record until a supported correlation path is available.',
            validate: 'Confirm the supported services, data residency, retention, query semantics, access model, costs, and tenancy availability before changing an operational runbook.'
        },
        'unified-logging': {
            title: 'Unified logging experience',
            summary: 'A planning direction for a more consistent exploration path across logging experiences.',
            prepare: 'Inventory saved searches, dashboards, log groups, parsers, and alert dependencies. Record their owner, input fields, retention, and the operational decision each supports.',
            validate: 'Verify any supported navigation, query, dashboard, retention, and alert behavior in your target tenancy. Do not assume feature parity or automatic migration.'
        },
        'ai-investigation': {
            title: 'AI-assisted investigation',
            summary: 'A planning direction for governed assistance that connects operational evidence, hypotheses, and human decisions.',
            prepare: 'Create redacted incident exemplars, trusted runbooks, approval boundaries, and a clear audit trail for evidence, recommendations, actions, and outcomes.',
            validate: 'Require human approval for consequential actions. Evaluate evidence grounding, identity and data controls, latency, cost, error handling, and auditability in a bounded environment.'
        },
        'packaged-solutions': {
            title: 'Packaged workload solutions',
            summary: 'A planning direction for repeatable observability content for selected infrastructure and application workloads.',
            prepare: 'Baseline workload ownership, version, topology, source telemetry, known failure modes, and the alerts or dashboards operators actually use.',
            validate: 'Confirm workload and version coverage, prerequisites, collection scope, permissions, performance overhead, retention, and rollback before applying a packaged solution.'
        },
        'open-instrumentation': {
            title: 'Open instrumentation adoption',
            summary: 'A planning direction for simpler adoption of portable telemetry patterns.',
            prepare: 'Standardize semantic conventions, resource attributes, sampling policy, cardinality limits, secret handling, and network egress controls across OpenTelemetry and Prometheus-oriented collectors.',
            validate: 'Test supported receivers, exporters, authentication, rate limits, cost, and signal fidelity with a representative workload before replacing a production pipeline.'
        },
        'guided-collection': {
            title: 'Guided collection setup',
            summary: 'A planning direction for more repeatable collection setup and proof of what is connected.',
            prepare: 'Define a target inventory, least-privilege access pattern, network path, collection owner, expected signals, and a success receipt for every onboarding path.',
            validate: 'Verify exact resource coverage, data arrival, field quality, access separation, error states, and teardown or rollback behavior. Configuration alone is not ingestion proof.'
        }
    };

    function initServiceInspector() {
        const inspectorTriggers = document.querySelectorAll('.service-card__inspect');
        const inspector = document.getElementById('serviceInspector');
        const scrim = document.getElementById('inspectorScrim');
        const closeBtn = document.getElementById('closeInspector');
        const titleEl = document.getElementById('inspectorTitle');
        const eyebrowEl = document.getElementById('inspectorEyebrow');
        const bodyEl = document.getElementById('inspectorBody');

        if (!inspector || !scrim || !closeBtn || !titleEl || !eyebrowEl || !bodyEl) return;
        let previousFocus = null;

        function inspectorFocusableElements() {
            return [...inspector.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
                .filter(element => !element.closest('[hidden]') && getComputedStyle(element).visibility !== 'hidden');
        }

        function closeInspector() {
            if (!inspector.classList.contains('is-open')) return;
            inspector.classList.remove('is-open');
            inspector.setAttribute('aria-hidden', 'true');
            inspector.inert = true;
            if (previousFocus?.isConnected) previousFocus.focus();
            previousFocus = null;
        }

        function trapInspectorFocus(event) {
            if (!inspector.classList.contains('is-open')) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeInspector();
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = inspectorFocusableElements();
            if (!focusable.length) {
                event.preventDefault();
                inspector.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            } else if (!inspector.contains(document.activeElement)) {
                event.preventDefault();
                first.focus();
            }
        }

        function openInspector(serviceId, trigger) {
            const data = SERVICE_DETAILS[serviceId];
            const future = FUTURE_CAPABILITY_DETAILS[serviceId];
            if (!data && !future) return;
            previousFocus = trigger ?? document.activeElement;

            if (future) {
                titleEl.textContent = future.title;
                eyebrowEl.textContent = 'Future capability direction · safe harbor';
                bodyEl.innerHTML = `
                    <div class="future-detail">
                        <p class="future-detail__notice"><strong>Planning direction only.</strong> This is not public product documentation, a commitment, a release date, or evidence that the capability is available in a customer tenancy.</p>
                        <section><h3>What it could improve</h3><p>${future.summary}</p></section>
                        <section><h3>Prepare now</h3><p>${future.prepare}</p></section>
                        <section><h3>Validate before adoption</h3><p>${future.validate}</p></section>
                    </div>`;
                inspector.inert = false;
                inspector.classList.add('is-open');
                inspector.setAttribute('aria-hidden', 'false');
                closeBtn.focus();
                return;
            }

            titleEl.textContent = data.title;
            eyebrowEl.textContent = data.eyebrow;

            // Render Inspector body with custom tabs
            bodyEl.innerHTML = `
                <div class="inspector-tab-header" role="tablist" aria-label="Service detail lens">
                    <button type="button" class="inspector-tab-btn" id="inspector-tab-level1" data-tab="level1" role="tab" aria-controls="inspector-panel-level1" aria-selected="false" tabindex="-1">Level 1: Executive</button>
                    <button type="button" class="inspector-tab-btn" id="inspector-tab-level2" data-tab="level2" role="tab" aria-controls="inspector-panel-level2" aria-selected="false" tabindex="-1">Level 2: Management</button>
                    <button type="button" class="inspector-tab-btn" id="inspector-tab-level3" data-tab="level3" role="tab" aria-controls="inspector-panel-level3" aria-selected="false" tabindex="-1">Level 3: Practitioner</button>
                </div>
                <div class="inspector-tab-content" id="inspector-panel-level1" data-tab="level1" role="tabpanel" aria-labelledby="inspector-tab-level1" hidden>
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-top:0; color:var(--text-primary); font-size:16px;">Core Business Value</h4>
                        <p style="font-size:14px; line-height:1.6; color:var(--text-secondary);">${data.levels.level1.value}</p>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                        <div style="background:var(--bg-secondary); padding:16px; border-radius:8px; border:1px solid var(--border-subtle);">
                            <span style="font-size:12px; font-weight:700; color:var(--oci-red); text-transform:uppercase;">ROI Indicator</span>
                            <p style="font-size:18px; font-weight:700; color:var(--blue-deep); margin:4px 0 0 0;">${data.levels.level1.roi}</p>
                        </div>
                        <div style="background:var(--bg-secondary); padding:16px; border-radius:8px; border:1px solid var(--border-subtle);">
                            <span style="font-size:12px; font-weight:700; color:var(--oci-red); text-transform:uppercase;">Compliance Mapping</span>
                            <p style="font-size:14px; font-weight:600; color:var(--text-primary); margin:4px 0 0 0;">${data.levels.level1.compliance}</p>
                        </div>
                    </div>
                </div>
                <div class="inspector-tab-content" id="inspector-panel-level2" data-tab="level2" role="tabpanel" aria-labelledby="inspector-tab-level2" hidden>
                    <h4 style="margin-top:0; color:var(--text-primary); font-size:16px;">Operational Best Practices</h4>
                    <p style="font-size:14px; line-height:1.6; color:var(--text-secondary); margin-bottom:16px;">${data.levels.level2.practices}</p>
                    <div style="background:linear-gradient(135deg, rgba(4,83,111,0.05) 0%, rgba(199,70,52,0.02) 100%); padding:16px; border-radius:8px; border-left:4px solid var(--blue-deep);">
                        <h5 style="margin-top:0; margin-bottom:8px; color:var(--blue-deep); font-size:14px;">Lifecycle &amp; Migration Guidance</h5>
                        <p style="font-size:13px; line-height:1.5; color:var(--text-secondary); margin:0;">${data.levels.level2.migration}</p>
                    </div>
                </div>
                <div class="inspector-tab-content" id="inspector-panel-level3" data-tab="level3" role="tabpanel" aria-labelledby="inspector-tab-level3" hidden>
                    <h4 style="margin-top:0; color:var(--text-primary); font-size:16px;">Technical Configuration Sample</h4>
                    <div class="code-panel">
                        <div class="code-header">
                            <span>${data.levels.level3.codeTitle}</span>
                            <button type="button" class="copy-code-btn" data-copy-target="inspector-code-snippet">Copy</button>
                        </div>
                        <pre><code id="inspector-code-snippet">${data.levels.level3.code}</code></pre>
                    </div>
                    
                    <h4 style="margin-top:20px; color:var(--text-primary); font-size:16px;">Open Source Equivalent / Integration</h4>
                    <p style="font-size:14px; line-height:1.6; color:var(--text-secondary); margin-bottom:12px;">${data.levels.level3.openSourceDesc}</p>
                    <div class="code-panel">
                        <div class="code-header">
                            <span>${data.levels.level3.openSourceTitle}</span>
                            <button type="button" class="copy-code-btn" data-copy-target="inspector-os-snippet">Copy</button>
                        </div>
                        <pre><code id="inspector-os-snippet">${data.levels.level3.openSourceCode}</code></pre>
                    </div>
                </div>
            `;

            // Bind inspector tab switching
            const tabs = bodyEl.querySelectorAll('.inspector-tab-btn');
            const contents = bodyEl.querySelectorAll('.inspector-tab-content');
            function activateInspectorTab(tab, { focus = false, persist = true } = {}) {
                const targetTab = tab.dataset.tab;
                tabs.forEach((item, index) => {
                    const active = item === tab;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-selected', String(active));
                    item.tabIndex = active ? 0 : -1;
                    if (active && persist) window.OBS_STATE?.replace?.({ lens: String(index) });
                });
                contents.forEach(content => {
                    const active = content.dataset.tab === targetTab;
                    content.classList.toggle('active', active);
                    content.hidden = !active;
                });
                if (focus) tab.focus();
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', () => activateInspectorTab(tab));
                tab.addEventListener('keydown', event => {
                    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const currentIndex = [...tabs].indexOf(tab);
                    const nextIndex = event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                            ? tabs.length - 1
                            : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                    activateInspectorTab(tabs[nextIndex], { focus: true });
                });
            });

            const restoredLens = Number.parseInt(window.OBS_STATE?.read?.().lens ?? window.__obsLens ?? '0', 10);
            activateInspectorTab(tabs[Number.isInteger(restoredLens) && restoredLens >= 0 && restoredLens < tabs.length ? restoredLens : 0], { persist: false });

            // Bind newly rendered copy buttons
            bodyEl.querySelectorAll('.copy-code-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const targetId = btn.dataset.copyTarget;
                    const codeElement = document.getElementById(targetId);
                    if (codeElement) {
                        showCopyFeedback(btn, await copyTextWithFallback(codeElement.textContent));
                    }
                });
            });

            inspector.inert = false;
            inspector.classList.add('is-open');
            inspector.setAttribute('aria-hidden', 'false');
            closeBtn.focus();
        }

        inspectorTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                openInspector(trigger.dataset.serviceId, trigger);
            });
        });

        document.querySelectorAll('.service-card').forEach(card => {
            card.tabIndex = 0;
            card.addEventListener('click', event => {
                if (event.target.closest('a, button, input, select, textarea')) return;
                const trigger = card.querySelector('.service-card__inspect');
                if (trigger) openInspector(trigger.dataset.serviceId, card);
            });
            card.addEventListener('keydown', event => {
                if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
                event.preventDefault();
                const trigger = card.querySelector('.service-card__inspect');
                if (trigger) openInspector(trigger.dataset.serviceId, card);
            });
        });

        document.querySelectorAll('.future-capability').forEach(tile => {
            const showDetails = () => openInspector(tile.dataset.futureId, tile);
            tile.addEventListener('click', showDetails);
            tile.addEventListener('keydown', event => {
                if (!['Enter', ' '].includes(event.key)) return;
                event.preventDefault();
                showDetails();
            });
        });

        closeBtn.addEventListener('click', closeInspector);
        scrim.addEventListener('click', closeInspector);
        inspector.addEventListener('keydown', trapInspectorFocus);
    }

    // ============================================
    // Initialize Additional Features
    // ============================================
    function initAdditionalFeatures() {
        initKeyboardNav();
        injectAnimationStyles();
        initAudienceGuidance();
        initImplementationHub();
        initServiceInspector();
    }

    // ============================================
    // Boot
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        init();
        initAdditionalFeatures();
    });

})();
