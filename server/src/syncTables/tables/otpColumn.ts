import { syncTable } from "../syncTable.js";

export const ensureOtpTable = async (): Promise<void> => {
  await syncTable("otp", {
    id: {
      type: "BIGINT UNSIGNED AUTO_INCREMENT",
      nullable: false,
    },
    email: {
      type: "VARCHAR(100)",
      nullable: false,
    },
    otp_hash: {
      type: "VARCHAR(100)",
      nullable: false,
    },
    expires_at: {
      type: "DATETIME",
      nullable: false,
    },
    is_used: {
      type: "TINYINT",
      nullable: false,
      defaultSql: "0",
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