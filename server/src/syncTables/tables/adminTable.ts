import { syncTable } from "../syncTable.js";


// Create or synchronize admin table
export const ensureAdminTable = async (): Promise<void> => {

await syncTable("admin", {

id: {
type: "BIGINT UNSIGNED AUTO_INCREMENT",
nullable: false,
},

first_name: {
type: "VARCHAR(100)",
nullable: true,
defaultSql: "NULL",
},

last_name: {
type: "VARCHAR(100)",
nullable: true,
defaultSql: "NULL",
},

phone: {
type: "VARCHAR(30)",
nullable: true,
defaultSql: "NULL",
},

email: {
type: "VARCHAR(254)",
nullable: true,
defaultSql: "NULL",
},

profile_image: {
type: "VARCHAR(500)",
nullable: true,
defaultSql: "NULL",
},

role: {
type: "VARCHAR(20)",
nullable: false,
defaultSql: "'admin'",
},

created_at: {
type: "TIMESTAMP",
nullable: true,
defaultSql: "CURRENT_TIMESTAMP",
},

updated_at: {
type: "TIMESTAMP",
nullable: true,
defaultSql: "CURRENT_TIMESTAMP",
onUpdate: "CURRENT_TIMESTAMP",
},

});
};

