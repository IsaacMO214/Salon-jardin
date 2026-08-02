import { initDB, pool } from './server/db.ts';

async function fixEncoding() {
  await initDB();
  const tables = ['paquetes_infantiles', 'paquetes_sociales', 'shows', 'servicios_adicionales'];

  const fixString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/├®/g, 'é')
      .replace(/├⌐/g, 'é') // just in case
      .replace(/├¿/g, 'è');
  };

  const fixArray = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr.map(fixString);
  };

  for (const table of tables) {
    const [rows] = await pool.execute(`SELECT * FROM ${table}`);
    for (const row of rows) {
      let changed = false;
      
      let serv = row.servicios;
      if (serv) {
        if (typeof serv === 'string') {
          try { serv = JSON.parse(serv); } catch(e){}
        }
        serv = fixArray(serv);
        changed = true;
      }
      
      let m = row.menus;
      if (m) {
        if (typeof m === 'string') {
          try { m = JSON.parse(m); } catch(e){}
        }
        m = fixArray(m);
        changed = true;
      }
      
      let nombre = row.nombre;
      if (nombre && typeof nombre === 'string') {
        nombre = fixString(nombre);
        changed = true;
      }
      
      let desc = row.descripcion;
      if (desc && typeof desc === 'string') {
        desc = fixString(desc);
        changed = true;
      }

      if (changed) {
        let query = `UPDATE ${table} SET nombre = ?`;
        let params = [nombre];
        
        if (desc !== undefined) {
          query += `, descripcion = ?`;
          params.push(desc);
        }
        if (serv !== undefined) {
          query += `, servicios = ?`;
          params.push(JSON.stringify(serv));
        }
        if (m !== undefined) {
          query += `, menus = ?`;
          params.push(JSON.stringify(m));
        }
        
        query += ` WHERE id = ?`;
        params.push(row.id);
        
        await pool.execute(query, params);
      }
    }
  }

  console.log('Fixed H├®roes -> Héroes!');
  process.exit(0);
}

fixEncoding();
