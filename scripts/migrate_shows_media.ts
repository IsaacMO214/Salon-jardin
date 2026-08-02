import { initDB, readDB, writeDB, pool } from "./server/db";

async function run() {
  await initDB();
  const data = await readDB();
  
  let newGallery = [...(data.galeria || [])];
  
  for (const show of data.shows) {
    if (show.fotos && Array.isArray(show.fotos)) {
      show.fotos.forEach((url: string) => {
        newGallery.push({ 
            id: 'gal-' + Date.now() + Math.floor(Math.random() * 100000), 
            url, 
            categoria: 'shows' 
        });
      });
    }
    if (show.videoUrl && typeof show.videoUrl === 'string' && show.videoUrl.trim() !== '') {
        newGallery.push({ 
            id: 'gal-' + Date.now() + Math.floor(Math.random() * 100000), 
            url: show.videoUrl, 
            categoria: 'shows' 
        });
    }
    
    // Clear out individual show media
    show.fotos = [];
    show.videoUrl = "";
  }
  
  data.galeria = newGallery;
  const ok = await writeDB(data);
  if (ok) {
      console.log("Migration complete. Gallery has " + data.galeria.length + " items.");
  } else {
      console.log("Migration failed during writeDB.");
  }
  
  await pool.end();
}

run();
