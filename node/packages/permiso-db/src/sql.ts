export function insert(
  tableName: string,
  params: Record<string, unknown>,
): string {
  const columns = Object.keys(params);
  const values = columns.map((col) => `$(${col})`);

  return `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")})`;
}

export function update(
  tableName: string,
  params: Record<string, unknown>,
): string {
  const setClause = Object.keys(params).map((col) => `${col} = $(${col})`);

  return `UPDATE ${tableName} SET ${setClause.join(", ")}`;
}
