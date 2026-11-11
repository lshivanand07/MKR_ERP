import { syncTable } from "../syncTable.js";

export const employeeTable = async (): Promise<void> => {
  await syncTable("employees", {
    id: {
      type: "INT UNSIGNED AUTO_INCREMENT",
      nullable: false,
    },
    employee_ID: {
      type: "VARCHAR(50)",
      nullable: false,
    },
    name: {
      type: "VARCHAR(150)",
      nullable: false,
    },
    designation: {
      type: "VARCHAR(150)",
      nullable: true,
      defaultSql: "NULL",
    },
    email: {
      type: "VARCHAR(150)",
      nullable: false,
    },
    password: {
      type: "VARCHAR(255)",
      nullable: false,
    },
    employee_img: {
      type: "VARCHAR(500)",
      nullable: true,
      defaultSql: "NULL",
    },
    primary_phone: {
      type: "VARCHAR(20)",
      nullable: true,
      defaultSql: "NULL",
    },
    secondary_phone: {
      type: "VARCHAR(20)",
      nullable: true,
      defaultSql: "NULL",
    },
    gender: {
      type: "VARCHAR(20)",
      nullable: true,
      defaultSql: "NULL",
    },
    date_of_birth: {
      type: "DATE",
      nullable: true,
      defaultSql: "NULL",
    },
    date_of_joining: {
      type: "DATE",
      nullable: true,
      defaultSql: "NULL",
    },
    basic_salary: {
      type: "DECIMAL(12,2)",
      nullable: true,
      defaultSql: "0.00",
    },
    communication_address: {
      type: "TEXT",
      nullable: true,
      defaultSql: "NULL",
    },
    role: {
      type: "VARCHAR(50)",
      nullable: false,
      defaultSql: "'employee'",
    },
    status: {
      type: "VARCHAR(30)",
      nullable: false,
      defaultSql: "'Active'",
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

export const ensureEmployeeTable = employeeTable;
