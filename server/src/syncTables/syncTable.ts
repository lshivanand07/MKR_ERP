
import { db } from "../config/dbConnection.js";
import { RowDataPacket } from "mysql2";

export interface ColumnDefinition {
    type: string;
    nullable: boolean;
    defaultSql?: string;
    onUpdate?: string;
}

export type TableDefinition = Record<string, ColumnDefinition>;

function getColumnSql(def: ColumnDefinition): string {
    const parts = [
        def.type,
        def.nullable ? "NULL" : "NOT NULL",
    ];

    if (def.defaultSql !== undefined) {
        parts.push(`DEFAULT ${def.defaultSql}`);
    }

    if (def.onUpdate) {
        parts.push(`ON UPDATE ${def.onUpdate}`);
    }

    return parts.join(" ");
}

export async function syncTable(
    tableName: string,
    columns: TableDefinition
): Promise<void> {

    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        throw new Error("Invalid table name");
    }

    const columnEntries = Object.entries(columns);

    if (columnEntries.length === 0) {
        throw new Error("At least one column is required");
    }

    // Validate column names and types
    for (const [name, definition] of columnEntries) {

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            throw new Error(`Invalid column name: ${name}`);
        }

        const allowedTypes =
            /^(BIGINT|INT|SMALLINT|TINYINT|VARCHAR\(\d+\)|CHAR\(\d+\)|TEXT|TIMESTAMP|DATETIME|DATE|DECIMAL\(\d+,\d+\))( UNSIGNED)?( AUTO_INCREMENT)?$/i;

        if (!allowedTypes.test(definition.type)) {
            throw new Error(`Invalid column type for ${name}`);
        }
    }

    if (!columns.id) {
        throw new Error(`${tableName} must define its id column`);
    }

    // Check whether table exists
    const [tableRows] = await db.query<RowDataPacket[]>(
        "SHOW TABLES LIKE ?",
        [tableName]
    );

    const tableExists = tableRows.length > 0;

    // ==========================================
    // CREATE TABLE IF NOT EXISTS
    // ==========================================

    if (!tableExists) {

        const definitions = columnEntries.map(
            ([name, def]) =>
                `\`${name}\` ${getColumnSql(def)}`
        );

        await db.query(`
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                ${definitions.join(", ")},
                PRIMARY KEY (\`id\`)
            )
        `);

        console.log(`${tableName} table created successfully.`);

        return;
    }

    // ==========================================
    // GET EXISTING COLUMNS
    // ==========================================

    const [rows] = await db.query<RowDataPacket[]>(
        `SHOW COLUMNS FROM \`${tableName}\``
    );

    const existing = new Map(
        rows.map((row) => [String(row.Field), row])
    );

    const modifiedColumns: string[] = [];

    // ==========================================
    // CHECK AND UPDATE COLUMNS
    // ==========================================

    for (const [name, def] of columnEntries) {

        const current = existing.get(name);

        // Add new column if missing
        if (!current) {

            await db.query(
                `ALTER TABLE \`${tableName}\` ADD COLUMN \`${name}\` ${getColumnSql(def)}`
            );

            modifiedColumns.push(name);

            continue;
        }

        const desiredType = def.type.toLowerCase();

        const desiredNull = def.nullable ? "YES" : "NO";

        const desiredDefault =
            def.defaultSql === undefined
                ? null
                : def.defaultSql.replace(/^'(.*)'$/, "$1");

        const currentType = String(current.Type).toLowerCase();

        const currentNull = String(current.Null);

        const currentDefault = current.Default;

        const defaultMatches =
            desiredDefault === null
                ? currentDefault === null
                : String(currentDefault ?? "").toUpperCase() ===
                  desiredDefault.toUpperCase();

        const desiredUpdate = def.onUpdate
            ? `on update ${def.onUpdate.toLowerCase()}`
            : "";

        const currentExtra = String(current.Extra ?? "").toLowerCase();

        const updateMatches = desiredUpdate
            ? currentExtra.includes(desiredUpdate)
            : !currentExtra.includes("on update");

        // Modify only when a difference exists
        if (
            currentType !== desiredType ||
            currentNull !== desiredNull ||
            !defaultMatches ||
            !updateMatches
        ) {

            await db.query(
                `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${name}\` ${getColumnSql(def)}`
            );

            modifiedColumns.push(name);
        }
    }

    // ==========================================
    // DISPLAY STATUS
    // ==========================================

    if (modifiedColumns.length > 0) {

        modifiedColumns.forEach((name) => {
            console.log(`Modified ${tableName}.${name}`);
        });

    } else {

        const formattedName =
            tableName.charAt(0).toUpperCase() + tableName.slice(1);

        console.log(`${formattedName} table already created.`);
    }
}
