import { DataSource } from "typeorm";
import { config } from "dotenv";
import { AnalyticsEntity } from "../src/analytics/entities/analytics.entity";

config();

async function verifyData() {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "superapp",
    entities: [AnalyticsEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log("Database connection established");

    const analyticsRepo = dataSource.getRepository(AnalyticsEntity);
    
    // Get total count
    const totalCount = await analyticsRepo.count();
    console.log(`Total analytics records: ${totalCount}`);

    // Get count by type
    const countByType = await analyticsRepo
      .createQueryBuilder("analytics")
      .select("analytics.type, COUNT(*) as count")
      .groupBy("analytics.type")
      .getRawMany();
    console.log("\nCount by type:");
    console.table(countByType);

    // Get count by category
    const countByCategory = await analyticsRepo
      .createQueryBuilder("analytics")
      .select("analytics.category, COUNT(*) as count")
      .groupBy("analytics.category")
      .getRawMany();
    console.log("\nCount by category:");
    console.table(countByCategory);

    // Get sample records
    const sampleRecords = await analyticsRepo.find({ take: 5 });
    console.log("\nSample records:");
    console.log(JSON.stringify(sampleRecords, null, 2));

    await dataSource.destroy();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error verifying data:", error);
    process.exit(1);
  }
}

verifyData(); 