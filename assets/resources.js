/* =========================================================================
   Shared "Learn more" resource catalog.
   Sourced from oracle-devrel/technology-engineering/observability-and-management
   plus the OCI Observability blog and team Medium publications.
   Consumed by both the guide (assets/guide.js) and the launchpad
   (assets/launchpad-resources.js).
   ========================================================================= */
window.OBS_RESOURCES = [
  {
    key: "library", label: "Observability library", comp: null, module: "module-home",
    items: [
      { title: "Oracle DevRel — Observability & Management library", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management", summary: "The full oracle-devrel/technology-engineering observability collection: APM, Logging, Log Analytics, Monitoring, Database Management, Ops Insights, cost, and shared assets." },
      { title: "OCI Observability & Management — product overview", url: "https://www.oracle.com/manageability/", summary: "The canonical list of OCI Observability and Management services." },
      { title: "OCI Observability blog", url: "https://blogs.oracle.com/observability/", summary: "Latest insights, trends, and updates on multicloud observability and management." },
    ],
  },
  {
    key: "monitoring", label: "OCI Monitoring", comp: "metric", module: "module-monitoring",
    items: [
      { title: "Custom metrics with the Python SDK — service-limit monitoring", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/oci-monitoring/custom-metrics/custom-metric-python-SDK-services-limit-monitoring", summary: "A custom metric namespace that tracks OCI service limits so alarms fire before a limit is reached." },
      { title: "Custom metrics with OCI Functions — service-limit monitoring", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/oci-monitoring/custom-metrics/custom-metric-FN-services-limit-monitoring", summary: "An OCI Function publishes service-limit usage as a custom metric for proactive alarms and notifications." },
      { title: "Customised alarm notification in OCI", url: "https://karthicin.medium.com/customised-alarm-notification-in-oci-e5b367ca20bc", summary: "Shape OCI Monitoring alarm notifications into clearer, more actionable alerts." },
    ],
    projects: [
      { title: "oci-metrics-report", url: "https://github.com/adibirzu/oci-metrics-report", summary: "Query and visualise OCI Monitoring metrics with MQL support." },
      { title: "oci-monitoring-view", url: "https://github.com/adibirzu/oci-monitoring-view", summary: "Visualisation front end for OCI Monitoring metrics." },
      { title: "oci-container-monitoring", url: "https://github.com/adibirzu/oci-container-monitoring", summary: "Container Instance and OKE monitoring demo (Terraform + scripts)." },
    ],
  },
  {
    key: "logging", label: "OCI Logging", comp: "log", module: "module-loganalytics",
    items: [
      { title: "Stream OCI logs to Splunk", url: "https://learnoci.cloud/stream-oci-logs-to-splunk-v9-1-c71c93e470fe", summary: "Forward OCI Logging service logs into Splunk for centralized analysis." },
      { title: "OKE log collection using OCI Logging", url: "https://learnoci.cloud/oke-log-collection-using-oci-logging-3f1e732928b3", summary: "Collect logs from Oracle Kubernetes Engine workloads with the OCI Logging service." },
      { title: "Ingest Data Safe audit events in OCI Logging", url: "https://learnoci.cloud/how-to-ingest-data-safe-audit-events-in-oci-logging-efc1d65eefad", summary: "Route Oracle Data Safe audit events into OCI Logging for unified monitoring." },
      { title: "Use auditd logs in OCI with the Logging service", url: "https://learnoci.cloud/use-auditd-logs-in-oci-with-logging-service-5caa13719315", summary: "Collect Linux auditd security logs from OCI instances into OCI Logging." },
    ],
    projects: [
      { title: "oci-splunk", url: "https://github.com/adibirzu/oci-splunk", summary: "Splunk SIEM integration for OCI — Kafka Connect streaming from OCI to Splunk indexes." },
      { title: "oci2azurelogs", url: "https://github.com/adibirzu/oci2azurelogs", summary: "Stream OCI logs into Azure Event Hub and Microsoft Sentinel via an Azure Function." },
      { title: "gcplogs2oci", url: "https://github.com/adibirzu/gcplogs2oci", summary: "Stream GCP Cloud Logging into OCI Log Analytics — without VMs." },
    ],
  },
  {
    key: "logging-analytics", label: "OCI Logging Analytics", comp: "analyze", module: "module-loganalytics",
    items: [
      { title: "Mastering cloud cost control with OCI Log Analytics", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/logging-analytics/finops", summary: "Import the FinOps FOCUS cost-and-usage report into Logging Analytics for custom spend dashboards." },
      { title: "Inject Oracle Fusion HCM logs into Logging Analytics", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/logging-analytics/fusion-hcm-to-la", summary: "Use predefined parsers and sources to ingest Fusion HCM application logs via REST API." },
      { title: "OCI Logging Analytics demo", url: "https://www.youtube.com/watch?v=1bJb92put4k", summary: "Index, search, analyse, and visualise log data with Oracle Logging Analytics." },
    ],
    projects: [
      { title: "logan-security-dashboard", url: "https://github.com/adibirzu/logan-security-dashboard", summary: "Prebuilt security dashboards for OCI Logging Analytics (Next.js monorepo)." },
      { title: "oci-log-analytics-detections", url: "https://github.com/adibirzu/oci-log-analytics-detections", summary: "Detection rules and content for OCI Logging Analytics." },
      { title: "OCILoggingAnalytics", url: "https://github.com/adibirzu/OCILoggingAnalytics", summary: "Reusable OCI Logging Analytics assets — sources, parsers, dashboards." },
      { title: "LoggingAnalyticsFiles", url: "https://github.com/adibirzu/LoggingAnalyticsFiles", summary: "Sources and parsers created for security use cases in OCI Logging Analytics." },
      { title: "mcp-oci-logan-server", url: "https://github.com/adibirzu/mcp-oci-logan-server", summary: "MCP server exposing OCI Logging Analytics to AI agents." },
    ],
  },
  {
    key: "apm", label: "OCI Application Performance Monitoring", comp: "apm", module: "module-apm",
    items: [
      { title: "How to get started with OCI APM", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/application-performance-monitoring/How%20to%20Use%20APM", summary: "A three-part series on dashboards, alarms, availability monitors, and the Trace Explorer." },
      { title: "Connect OCI APM with Logging Analytics", url: "https://blogs.oracle.com/observability/post/connect-apm-with-log-analytics-and-more", summary: "Link APM traces with Logging Analytics and create dynamic links for faster troubleshooting." },
      { title: "Use OCI APM in Kubernetes for a Java application", url: "https://karthicin.medium.com/how-to-use-oci-apm-in-kubernetes-environment-for-java-application-56de2c770a69", summary: "Instrument and trace a Java application running on Kubernetes with OCI APM." },
      { title: "Store APM synthetic monitor error logs in OCI Logging", url: "https://karthicin.medium.com/storing-apm-synthetic-monitor-error-logs-in-oci-logging-c2296ce6072f", summary: "Capture and store error logs from APM synthetic availability monitors in OCI Logging." },
    ],
    projects: [
      { title: "oci-apm-monitoring", url: "https://github.com/adibirzu/oci-apm-monitoring", summary: "Synthetic APM trace and RUM data generation for OCI Application Performance Monitoring." },
      { title: "octo-observability-demo", url: "https://github.com/adibirzu/octo-observability-demo", summary: "End-to-end OCI observability reference platform — one trace context across services." },
    ],
  },
  {
    key: "database-management", label: "OCI Database Management", comp: "db", module: "module-dbmgmt",
    items: [
      { title: "OCI Database Management demo", url: "https://www.youtube.com/watch?v=3k9jrkOlBkc", summary: "Performance diagnostics and fleet monitoring for Oracle Databases." },
      { title: "Database Management add-ons for OCI Landing Zone", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/database-management/LZ-addons", summary: "Step-by-step guides and IaC add-ons to enable Database Management within a Landing Zone." },
      { title: "Enable observability for an OCI-native database deployment", url: "https://medium.com/@erikasciunzi/enable-observability-for-oci-native-database-deploy-235484953e46", summary: "Turn on OCI Observability and Management for natively deployed OCI databases." },
      { title: "OCI Database Management — PDB support and new features", url: "https://learnoci.cloud/oci-database-management-new-features-announced-f9991cba2cc2", summary: "Review newly announced features, including monitoring for pluggable databases (PDBs)." },
    ],
    projects: [
      { title: "mcp-oci-database-observatory", url: "https://github.com/adibirzu/mcp-oci-database-observatory", summary: "MCP server for OCI database observability — expose Database Management to AI agents." },
      { title: "oci-dbman-opsi", url: "https://github.com/adibirzu/oci-dbman-opsi", summary: "Database Management and Operations Insights enablement assets." },
    ],
  },
  {
    key: "operations-insights", label: "OCI Ops Insights", comp: "insight", module: "module-opsinsights",
    items: [
      { title: "OCI Ops Insights demo", url: "https://www.youtube.com/watch?v=Y45kPRn_c7s", summary: "Resource-capacity analysis, forecasting, and SQL performance across a database fleet." },
      { title: "Ops Insights add-ons for OCI Landing Zone", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/operations-insights/LZ-addons", summary: "Step-by-step guides and IaC add-ons to enable Operations Insights within a Landing Zone." },
      { title: "Enable Ops Insights on Autonomous Database Serverless", url: "https://medium.com/@rishabhghosh24/enable-oci-ops-insight-on-oracle-autonomous-database-serverless-61efab78f927", summary: "Enable Operations Insights for Oracle Autonomous Database Serverless instances." },
      { title: "Enable Operations Insights for Oracle DBCS", url: "https://learnoci.cloud/how-to-enable-operations-insight-for-oracle-dbcs-51dac10da833", summary: "Enable Operations Insights for Oracle Database Cloud Service databases." },
    ],
    projects: [
      { title: "mcp_oci_opsi", url: "https://github.com/adibirzu/mcp_oci_opsi", summary: "MCP server for OCI Operations Insights — capacity and SQL analytics for agents." },
    ],
  },
  {
    key: "shared", label: "Hybrid and shared assets", comp: "agent", module: "module-dbmgmt",
    items: [
      { title: "Enable O&M for external databases with Terraform", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/shared-assets/external-database-enablement", summary: "Terraform asset enabling Database Management, Ops Insights, and Stack Monitoring for many external databases from JSON input." },
    ],
    projects: [
      { title: "Multicloud", url: "https://github.com/adibirzu/Multicloud", summary: "Scripts for multi-cloud observability services." },
      { title: "ObservabilityKB", url: "https://github.com/adibirzu/ObservabilityKB", summary: "Knowledge base for OCI observability topics." },
    ],
  },
  {
    key: "cost", label: "Cost and usage", comp: null, module: "module-home",
    items: [
      { title: "Tenancy usage and cost reports (Usage2ADW)", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/tenancy-usage-cost-reports", summary: "Load OCI usage and cost reports into Autonomous Data Warehouse for granular spend analysis and OAC visualisations." },
    ],
    projects: [
      { title: "oci-usage-to-adw-function", url: "https://github.com/adibirzu/oci-usage-to-adw-function", summary: "OCI Function that loads usage and cost data into Autonomous Data Warehouse." },
      { title: "oci-scheduled-report-automation", url: "https://github.com/adibirzu/oci-scheduled-report-automation", summary: "Email an OCI Scheduled Report as an attachment when it lands in Object Storage." },
    ],
  },
  {
    key: "ai", label: "AI agents, MCP, and Zero Trust", comp: "ai_agents", module: "module-ai",
    items: [],
    projects: [
      { title: "oci-zpr-visibility", url: "https://github.com/adibirzu/oci-zpr-visibility", summary: "OCI Zero Trust Packet Routing visibility — flow correlation, findings, and Log Analytics detection dashboards." },
      { title: "oci-mcp-gateway", url: "https://github.com/adibirzu/oci-mcp-gateway", summary: "Centralized OKE gateway for OCI MCP servers (260+ tools) — JWT auth, health, audit logging." },
      { title: "multi-mcp-gateway", url: "https://github.com/adibirzu/multi-mcp-gateway", summary: "Unified HTTP gateway for orchestrating multiple Model Context Protocol servers." },
      { title: "oci-skills", url: "https://github.com/adibirzu/oci-skills", summary: "Tenancy-agnostic OCI admin skill pack — IAM, security, observability, and database." },
      { title: "DevVisualization", url: "https://github.com/adibirzu/DevVisualization", summary: "Local-first project knowledge graph (KAG) — a read-only code knowledge surface for agents." },
    ],
  },
  {
    key: "landing-zone", label: "Landing Zone and operating entities", comp: "iam", module: "module-home",
    items: [
      { title: "Database Management add-ons for OCI Landing Zone", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/database-management/LZ-addons", summary: "IaC add-ons to enable Database Management within an OCI Landing Zone." },
      { title: "Ops Insights add-ons for OCI Landing Zone", url: "https://github.com/oracle-devrel/technology-engineering/tree/main/observability-and-management/operations-insights/LZ-addons", summary: "IaC add-ons to enable Operations Insights within an OCI Landing Zone." },
    ],
    projects: [
      { title: "oci-landing-zone-operating-entities", url: "https://github.com/adibirzu/oci-landing-zone-operating-entities", summary: "OCI Operating Entities (OE) Landing Zone blueprints — the secure base that observability add-ons attach to." },
    ],
  },
];
