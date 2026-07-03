(function installWorkflowGovernance(global) {
  const unique = values => [...new Set(values)];

  function telemetryContracts(workflow) {
    const sourceText = workflow.sources.join(' ').toLowerCase();
    const serviceText = workflow.services.join(' ').toLowerCase();
    const text = `${sourceText} ${serviceText}`;
    return Object.freeze([
      ...(serviceText.includes('log analytics') || serviceText.includes('logan') ? ['logan'] : []),
      ...(text.includes('prometheus') ? ['prometheus'] : []),
      ...(serviceText.includes('application performance monitoring') || serviceText.includes('apm') || sourceText.includes('trace') ? ['apm'] : []),
    ].filter((value, index, values) => values.indexOf(value) === index));
  }

  function prerequisites(workflow, contracts) {
    return Object.freeze(unique([
      'OCI IAM read access is scoped to the intended tenancy, compartments, and telemetry resources.',
      'Signal collection, retention, clocks, and the investigation time window are validated before querying.',
      'Resource ownership and escalation routes are mapped before an operational action is assigned.',
      ...(contracts.includes('logan') ? ['Required log sources, parsers, entities, and log groups are enabled in Logan.'] : []),
      ...(contracts.includes('prometheus') ? ['Prometheus exporters and scrape or remote-write delivery target a metric backend, not Logan.'] : []),
      ...(contracts.includes('apm') ? ['APM or OpenTelemetry tracing is instrumented end to end and propagates W3C trace context.'] : []),
    ]));
  }

  function correlationKeys(workflow) {
    const text = [...workflow.sources, ...workflow.services, workflow.title].join(' ').toLowerCase();
    return Object.freeze(unique([
      'trace_id',
      'service.name',
      'resource_or_entity_id',
      'event_time_utc',
      'tenant_key',
      ...(text.includes('network') || text.includes('flow') || text.includes('load balancer') ? ['source.ip', 'destination.ip', 'source.port', 'destination.port', 'network.protocol'] : []),
      ...(text.includes('identity') || text.includes('iam') || text.includes('audit') ? ['principal_id', 'request_id'] : []),
      ...(text.includes('deployment') || text.includes('release') || text.includes('change') ? ['deployment_id', 'change_id'] : []),
    ]));
  }

  function enhance(workflow) {
    const contracts = telemetryContracts(workflow);
    return Object.freeze({
      ...workflow,
      prerequisites: prerequisites(workflow, contracts),
      correlationKeys: correlationKeys(workflow),
      telemetryContracts: contracts,
      emptyResult: 'An empty result is inconclusive and does not prove absence. Confirm permissions, tenancy and compartment scope, region, collection health, parser and field mappings, and the time window before widening or simplifying the query.',
    });
  }

  global.enhanceInterlockWorkflow = enhance;
  global.enhanceInterlockWorkflowRegistry = registry => Object.freeze(Object.fromEntries(
    Object.entries(registry).map(([domain, workflows]) => [domain, Object.freeze(workflows.map(enhance))]),
  ));
})(globalThis);
