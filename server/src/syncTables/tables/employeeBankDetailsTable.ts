import { syncTable } from "../syncTable.js";

export const employeeBankDetailsTable = async (): Promise<void> => {
  await syncTable("employee_bank_details", {
    id: {
      type: "INT UNSIGNED AUTO_INCREMENT",
      nullable: false,
    },
    employee_id: {
      type: "INT UNSIGNED",
      nullable: false,
    },
    account_holder_name: {
      type: "VARCHAR(150)",
      nullable: true,
      defaultSql: "NULL",
    },
    bank_name: {
      type: "VARCHAR(150)",
      nullable: true,
      defaultSql: "NULL",
    },
    account_number: {
      type: "VARCHAR(100)",
      nullable: true,
      defaultSql: "NULL",
    },
    ifsc_code: {
      type: "VARCHAR(30)",
      nullable: true,
      defaultSql: "NULL",
    },
    branch_name: {
      type: "VARCHAR(150)",
      nullable: true,
      defaultSql: "NULL",
    },
    upi_id: {
      type: "VARCHAR(150)",
      nullable: true,
      defaultSql: "NULL",
    },
    pan_number: {
      type: "VARCHAR(30)",
      nullable: true,
      defaultSql: "NULL",
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

export const ensureEmployeeBankDetailsTable = employeeBankDetailsTable;
