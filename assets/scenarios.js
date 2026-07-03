/* Runtime loader and deterministic matcher for community scenario definitions. */
(() => {
  "use strict";

  let cachedLoad = null;
  const normalize = value => String(value ?? "").trim().toLocaleLowerCase();
  const words = value => normalize(value).split(/[^a-z0-9-]+/).filter(Boolean);
  const unique = values => [...new Set(values)];
  const freezeScenario = scenario => Object.freeze({ ...scenario });

  function validateScenario(scenario) {
    const errors = [];
    const requireArray = (value, label, minimum = 1) => {
      if (!Array.isArray(value) || value.length < minimum) errors.push(`${label} requires at least ${minimum} item${minimum === 1 ? "" : "s"}`);
    };
    if (!scenario || typeof scenario !== "object") return ["scenario must be an object"];
    if (scenario.schemaVersion !== "1.0.0") errors.push("schemaVersion must be 1.0.0");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenario.id || "")) errors.push("id must be lowercase kebab-case");
    if (!scenario.title || !scenario.summary) errors.push("title and summary are required");
    if (!scenario.ownership?.communityAuthor || !scenario.ownership?.projectMaintainer) errors.push("community and maintainer ownership are required");
    requireArray(scenario.ownership?.serviceOwners, "ownership.serviceOwners");
    requireArray(scenario.discovery?.queryTerms, "discovery.queryTerms");
    requireArray(scenario.discovery?.finderPatterns, "discovery.finderPatterns");
    requireArray(scenario.discovery?.interlocks, "discovery.interlocks");
    requireArray(scenario.topology?.environments, "topology.environments", 2);
    if (new Set((scenario.topology?.environments ?? []).map(({ provider }) => provider)).size < 2) errors.push("topology requires at least two peer providers");
    requireArray(scenario.telemetry?.metrics, "telemetry.metrics", 3);
    for (const [index, metric] of (scenario.telemetry?.metrics ?? []).entries()) {
      if (![metric.name, metric.unit, metric.owner, metric.source, metric.failureThreshold].every(Boolean)) errors.push(`telemetry.metrics[${index}] is incomplete`);
      requireArray(metric.dimensions, `telemetry.metrics[${index}].dimensions`);
    }
    for (const contract of ["logs", "traces"]) {
      if (!scenario.telemetry?.[contract]?.owner) errors.push(`telemetry.${contract}.owner is required`);
      requireArray(scenario.telemetry?.[contract]?.requiredFields, `telemetry.${contract}.requiredFields`);
      requireArray(scenario.telemetry?.[contract]?.prohibitedFields, `telemetry.${contract}.prohibitedFields`);
    }
    requireArray(scenario.failurePoints, "failurePoints", 3);
    for (const [index, failure] of (scenario.failurePoints ?? []).entries()) {
      if (![failure.id, failure.component, failure.symptom, failure.firstAction].every(Boolean)) errors.push(`failurePoints[${index}] is incomplete`);
      requireArray(failure.evidence, `failurePoints[${index}].evidence`);
      requireArray(failure.interlocks, `failurePoints[${index}].interlocks`);
    }
    requireArray(scenario.workflow?.prerequisites, "workflow.prerequisites");
    requireArray(scenario.workflow?.correlationKeys, "workflow.correlationKeys");
    requireArray(scenario.workflow?.steps, "workflow.steps");
    if (!/inconclusive/i.test(scenario.workflow?.emptyResult || "")) errors.push("workflow.emptyResult must state that empty results are inconclusive");
    requireArray(scenario.references, "references");
    if ((scenario.references ?? []).some(reference => !/^https:\/\//.test(reference))) errors.push("references must use HTTPS");
    return errors;
  }

  async function load(indexUrl = "assets/scenarios/index.json") {
    if (cachedLoad) return cachedLoad;
    cachedLoad = (async () => {
      const response = await fetch(indexUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Scenario index request failed with ${response.status}`);
      const index = await response.json();
      if (index.schemaVersion !== "1.0.0" || !Array.isArray(index.scenarios)) throw new Error("Scenario index is invalid");
      const baseUrl = new URL(indexUrl, window.location.href);
      const scenarios = await Promise.all(index.scenarios.map(async file => {
        const scenarioUrl = new URL(file, baseUrl);
        const scenarioResponse = await fetch(scenarioUrl, { headers: { Accept: "application/json" } });
        if (!scenarioResponse.ok) throw new Error(`Scenario request failed with ${scenarioResponse.status}`);
        const scenario = await scenarioResponse.json();
        const errors = validateScenario(scenario);
        if (errors.length) throw new Error(`Scenario ${file} is invalid: ${errors.join("; ")}`);
        return freezeScenario(scenario);
      }));
      return Object.freeze(scenarios);
    })();
    return cachedLoad.catch(error => {
      cachedLoad = null;
      throw error;
    });
  }

  function matchScenarios(scenarios, criteria = {}) {
    const queryWords = words(criteria.query);
    return scenarios.map(scenario => {
      const discovery = scenario.discovery ?? {};
      const searchable = unique([
        scenario.id,
        scenario.title,
        scenario.summary,
        ...(discovery.queryTerms ?? []),
        ...(scenario.topology?.environments ?? []).flatMap(environment => [environment.provider, environment.runtime, ...(environment.workloads ?? [])]),
      ].flatMap(words));
      const queryScore = queryWords.reduce((score, word) => score + (searchable.some(candidate => candidate.includes(word) || word.includes(candidate)) ? 1 : 0), 0);
      const traitScore = [
        [criteria.persona, discovery.personas],
        [criteria.industry, discovery.industries],
        [criteria.goal, discovery.goals],
        [criteria.pattern, discovery.finderPatterns],
      ].reduce((score, [value, accepted]) => score + (value && (accepted ?? []).includes(value) ? 1 : 0), 0);
      return { scenario, score: queryScore + traitScore, queryScore, traitScore };
    }).filter(({ score }) => score > 0).sort((left, right) => right.score - left.score || left.scenario.title.localeCompare(right.scenario.title));
  }

  globalThis.OBS_SCENARIOS = Object.freeze({ load, matchScenarios, validateScenario });
})();
