import { pool, initDB } from "./server/db";

async function run() {
  await initDB();
  try {
    await pool.execute("ALTER TABLE paquetes_sociales ADD COLUMN orden INT DEFAULT 0");
    console.log("Added orden to paquetes_sociales");
  } catch(e: any) {
    console.log("Error on paquetes_sociales:", e.message);
  }
  
  try {
    await pool.execute("ALTER TABLE paquetes_infantiles ADD COLUMN orden INT DEFAULT 0");
    console.log("Added orden to paquetes_infantiles");
  } catch(e: any) {
    console.log("Error on paquetes_infantiles:", e.message);
  }
  
  await pool.end();
}

run();
