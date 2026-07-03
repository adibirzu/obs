# Reference scenario: retail checkout across four environments

Status: Reference implementation<br>
Machine-readable definition: [`assets/scenarios/retail-checkout-multicloud.json`](../../assets/scenarios/retail-checkout-multicloud.json)<br>
Closest Finder patterns: Hybrid enterprise estate, Cloud-native on OKE<br>
Operating profiles: Build and Operate; Retail; Diagnose and Protect

This scenario follows one customer checkout from an AWS storefront through an Azure payment adapter and an OCI order service to an on-premises Oracle Database. It demonstrates how a community contribution must separate metrics, log and event records, and traces while still carrying enough shared context to investigate one incident.

No customer payload, cloud identifier, address, credential, or production endpoint is included. Validate service configuration and metric availability in the target environment before adapting any threshold.

## Topology

| Stage | Environment | Runtime | Responsibility | Telemetry egress |
|---|---|---|---|---|
| Storefront | AWS | Amazon EKS | Web storefront and Cart API | Controlled HTTPS for OpenTelemetry and structured logs |
| Payments | Azure | Azure Kubernetes Service | Payment adapter and fraud-decision client | Controlled HTTPS for OpenTelemetry and approved events |
| Orders | OCI | Oracle Kubernetes Engine | Order API and inventory reservation | OCI service identity over approved private or service-gateway paths |
| System of record | On-premises | Oracle Database | Order and inventory schemas | Management Gateway or controlled outbound HTTPS |

Request route:

1. The customer starts checkout at the AWS storefront.
2. The Cart API calls the Azure payment adapter.
3. The payment adapter calls the OCI Order API.
4. The Order API writes through the enterprise boundary to the on-premises database.
5. Collectors export each signal to its governed destination. Shared keys link evidence; they do not merge ownership contracts.

The service-level objective is 99.9% successful checkout completion with p95 end-to-end latency below 2.5 seconds over a rolling 30-day window.

## Telemetry contract

### Metrics

| Metric | Unit | Authority | Failure point |
|---|---:|---|---|
| `http.server.request.duration` | seconds | Application metric backend | p95 above 1.2 seconds for ten minutes |
| `http.client.request.duration` | seconds | Application metric backend | p95 above 800 milliseconds for a cross-cloud dependency |
| `kube_pod_container_status_restarts_total` | restarts | Prometheus | More than three restarts in fifteen minutes |
| `container_cpu_usage_seconds_total` | seconds | Prometheus | Sustained use above 85% of the configured limit |
| `otelcol_exporter_send_failed_spans` | spans | Prometheus | Any increase for five minutes |
| `CpuUtilization` | percent | OCI Monitoring | Mean above 85% for fifteen minutes after validating the namespace |
| `db.client.operation.duration` | seconds | Application metric backend | p95 above 500 milliseconds for order writes |

Thresholds are reference operating hypotheses, not universal defaults. Confirm the metric exists, returns datapoints, uses the expected unit, and has stable dimensions before creating an alarm.

### Log and event records

Oracle Log Analytics (Logan) owns approved parsed records such as checkout application logs, payment decisions, Kubernetes events, OCI Audit events, and database alert records. Required fields are `event_time`, `service_name`, `severity`, `trace_id`, `deployment_environment`, `cloud_provider`, and `event_type`.

Do not add metric samples, span duration, `parent_span_id`, payment details, credentials, prompts, or customer-identifying payloads to this contract. Prometheus exporter output may be collected as investigation records, but the metric backend remains authoritative.

### Traces

Application Performance Monitoring owns trace and span topology. OpenTelemetry Protocol traffic travels through an approved collector using a private ingest credential that is never committed or exposed client-side. Required attributes include `trace_id`, `span_id`, `parent_span_id`, `service.name`, `span.kind`, `span.status`, and `cloud.provider`.

Retain all failed synthetic checkouts and an approved probabilistic sample of successful traffic. Use exemplars or `trace_id` to navigate to metrics and logs without copying Logan-specific or metric-specific metadata into spans.

### Shared correlation keys

`trace_id`, `span_id`, `service.name`, `service.instance.id`, `cloud.provider`, `cloud.region`, `k8s.cluster.name`, `deployment.environment.name`, `scenario_run_id`, `order_reference_hash`, and `event_time`.

`order_reference_hash` must be non-reversible and approved for operational use. It is not a substitute for data-classification review.

## Failure points

| Failure | Observable symptom | Evidence | Interlock handoff |
|---|---|---|---|
| AWS storefront saturation | Latency, CPU, and restarts rise together | HTTP server duration, CPU, restart counter | Operations & Lifecycle / Capacity planning |
| Azure payment timeout | Payment error ratio or client latency rises | HTTP client duration, payment event, span status | End-to-end / Customer journey |
| Azure-to-OCI route loss | Payment adapter cannot reach Order API | Client latency, connection error, route and flow evidence | Network / Hybrid connectivity |
| OCI Order API regression | 5xx responses rise after deployment | Server duration, span status, deployment event | End-to-end / Release validation |
| On-premises write contention | Order write spans slow with database waits | DB client duration, alert record, database performance evidence | Operations & Lifecycle / Database insight |
| Collector export loss | Trace coverage falls while the service appears healthy | Failed-span counter, collector log, synthetic integrity check | Operations & Lifecycle / Fleet health |

## Incident workflow

### Prerequisites

- Named service owners and an incident commander for the checkout journey.
- Synchronized UTC clocks and stable `service.name` values.
- OpenTelemetry instrumentation and collector health metrics in every Kubernetes environment.
- Approved IAM, egress, encryption, and retention policy for every handoff.
- A Logan source and parser association for every approved log or event record.
- Validated metric scrape targets and recording rules.
- A privacy-safe synthetic checkout that emits a deterministic `scenario_run_id`.

### Response

1. Detect customer impact from the synthetic checkout and SLO burn signal.
2. Open the failing trace and locate the first unhealthy service boundary.
3. Pivot by `trace_id` and UTC window into Logan for related logs and change events.
4. Inspect Prometheus or OCI Monitoring for saturation, restarts, and collector loss.
5. Assign the failing boundary to its service owner and follow the mapped Interlock workflow.
6. Validate recovery with a new synthetic checkout and retain privacy-safe incident evidence.

### Empty-result behavior

A zero-row query or missing trace is inconclusive. Verify permissions, account or tenancy, compartment, region, time window, clock skew, parser and source association, collector and exporter health, field mappings, and correlation-key propagation before concluding that an event did not occur.

## Ownership

- Community author: topology hypothesis, reproducible synthetic evidence, runbook, and public-source citations.
- Project maintainer: schema, security, editorial quality, discovery mappings, and merge decision.
- Service owners: thresholds, operational action, escalation, and production validation for their boundary.
- Observability platform team: collectors, signal contracts, retention, access, and cross-cloud handoffs.

The Atlas maintainers do not certify a contributed architecture for production. Adopters retain responsibility for tenancy-specific IAM, privacy, networking, capacity, cost, and service-limit validation.

## References

- [OCI Monitoring](https://docs.oracle.com/en-us/iaas/Content/Monitoring/home.htm)
- [OCI Log Analytics](https://docs.oracle.com/en-us/iaas/log-analytics/home.htm)
- [OCI Application Performance Monitoring](https://docs.oracle.com/en-us/iaas/application-performance-monitoring/home.htm)
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/)
