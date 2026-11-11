
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "ERP MKRINFOTECH API",
      version: "1.0.0",
      description: "ERP MKRINFOTECH Backend API Documentation",
    },

    servers: [
      {
        url: "https://apierp.mkrinfotech.com/api",
        description: "Production API",
      },
      {
        url: "http://localhost:3001/api",
        description: "Local Development API",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // Apply JWT authentication globally
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.ts"],
});
