import dotenv from "dotenv";
import app from "./app.js";

import { ensureAdminTable } from "./syncTables/tables/adminTable.js";
import { ensureOtpTable } from "./syncTables/tables/otpColumn.js";
import { employeeTable } from "./syncTables/tables/employeeTable.js";
import { employeeBankDetailsTable } from "./syncTables/tables/employeeBankDetailsTable.js";
import { ensureEmployeeConstraints } from "./syncTables/tables/employeeConstraints.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
    try {
        await ensureAdminTable();
        await ensureOtpTable();
        await employeeTable();
        await employeeBankDetailsTable();
        await ensureEmployeeConstraints();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database table initialization failed:", error);
        process.exit(1);
    }
};

startServer();
