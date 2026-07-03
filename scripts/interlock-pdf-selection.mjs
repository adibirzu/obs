export function selectDiagrams(diagrams, requestedIds) {
  if (requestedIds.length === 0) return [...diagrams];

  const selected = diagrams.filter(({ id }) => requestedIds.includes(id));
  const unknownId = requestedIds.find((id) => !diagrams.some((diagram) => diagram.id === id));
  if (unknownId) throw new Error(`Unknown diagram id: ${unknownId}`);
  return selected;
}
