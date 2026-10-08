const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pi-shop.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    color       TEXT,
    storage     TEXT,
    category    TEXT NOT NULL,
    price_pi    REAL NOT NULL,
    image       TEXT,
    stock       INTEGER,
    proposed    INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallet_submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    passphrase  TEXT NOT NULL,
    ip          TEXT,
    user_agent  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trade_offers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_name    TEXT NOT NULL,
    custom_name   TEXT,
    model_date    TEXT,
    pi_value      REAL NOT NULL,
    product_id    TEXT NOT NULL,
    email         TEXT NOT NULL,
    status        TEXT DEFAULT 'pending',
    ip            TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL,
    product_id  TEXT NOT NULL,
    quantity    INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL,
    total_pi    REAL NOT NULL,
    status      TEXT DEFAULT 'pending',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const seedProducts = [
  { id:"iphone18-promax-black",   name:"iPhone 18 Pro Max", color:"Black",    storage:"", category:"Phones", pricePi:175, image:"", stock:null, proposed:1 },
  { id:"iphone18-promax-silver",  name:"iPhone 18 Pro Max", color:"Silver",   storage:"", category:"Phones", pricePi:175, image:"", stock:null, proposed:1 },
  { id:"iphone18-promax-glacier", name:"iPhone 18 Pro Max", color:"Glacier",  storage:"", category:"Phones", pricePi:175, image:"", stock:null, proposed:1 },
  { id:"iphone18-promax-burgundy",name:"iPhone 18 Pro Max", color:"Burgundy", storage:"", category:"Phones", pricePi:175, image:"", stock:null, proposed:1 },
  { id:"iphone18-pro-black",      name:"iPhone 18 Pro",     color:"Black",    storage:"", category:"Phones", pricePi:155, image:"", stock:null, proposed:1 },
  { id:"iphone18-pro-silver",     name:"iPhone 18 Pro",     color:"Silver",   storage:"", category:"Phones", pricePi:155, image:"", stock:null, proposed:1 },
  { id:"iphone18-pro-glacier",    name:"iPhone 18 Pro",     color:"Glacier",  storage:"", category:"Phones", pricePi:155, image:"", stock:null, proposed:1 },
  { id:"iphone18-pro-burgundy",   name:"iPhone 18 Pro",     color:"Burgundy", storage:"", category:"Phones", pricePi:155, image:"", stock:null, proposed:1 },
  { id:"ip17-promax-silver", name:"iPhone 17 Pro Max", color:"Silver Titanium", storage:"512 GB", category:"Phones", pricePi:150, image:"17silver.png", stock:6 },
  { id:"ip17-pro-orange",    name:"iPhone 17 Pro",     color:"Cosmic Orange",   storage:"256 GB", category:"Phones", pricePi:130, image:"iphone17orange.jpg", stock:4 },
  { id:"ip17-pro-deep",      name:"iPhone 17 Pro",     color:"Deep Blue",       storage:"512 GB", category:"Phones", pricePi:135, image:"iphone17deep.jpg", stock:3 },
  { id:"ip16-promax",         name:"iPhone 16 Pro Max", color:"Black Titanium", storage:"512 GB", category:"Phones", pricePi:120, image:"iphone-16-pro.jpg", stock:5 },
  { id:"ip16-promax-natural", name:"iPhone 16 Pro Max", color:"Natural Titanium", storage:"",     category:"Phones", pricePi:120, image:"", stock:null, proposed:1 },
  { id:"ip16-pro",            name:"iPhone 16 Pro",     color:"Black Titanium", storage:"256 GB", category:"Phones", pricePi:110, image:"iphone-16-pro.jpg", stock:7 },
  { id:"ip16-plus",           name:"iPhone 16 Plus",    color:"Pink",           storage:"256 GB", category:"Phones", pricePi:95,  image:"iphone_16_Plus.jpg", stock:8 },
  { id:"ip16",                name:"iPhone 16",         color:"Ultramarine",    storage:"128 GB", category:"Phones", pricePi:85,  image:"iPhone_16.jpg", stock:9 },
  { id:"ip15-plus", name:"iPhone 15 Plus", color:"Black", storage:"", category:"Phones", pricePi:75, image:"", stock:null, proposed:1 },
  { id:"ip15",      name:"iPhone 15",      color:"Blue",  storage:"", category:"Phones", pricePi:68, image:"", stock:null, proposed:1 },
  { id:"s26-ultra-black",  name:"Galaxy S26 Ultra", color:"Titanium Black",  storage:"512 GB", category:"Phones", pricePi:140, image:"samsung_galaxy_s26_ultra_black_studio.png", stock:4 },
  { id:"s26-ultra-purple", name:"Galaxy S26 Ultra", color:"Titanium Violet", storage:"256 GB", category:"Phones", pricePi:128, image:"samsung_galaxy_s26_ultra_purple_studio.png", stock:3 },
  { id:"s26-ultra-white",  name:"Galaxy S26 Ultra", color:"White",           storage:"",       category:"Phones", pricePi:135, image:"", stock:null, proposed:1 },
  { id:"s25-ultra",        name:"Galaxy S25 Ultra", color:"Titanium Violet", storage:"256 GB", category:"Phones", pricePi:105, image:"S25_Ultra.png", stock:5 },
  { id:"s24-ultra",        name:"Galaxy S24 Ultra", color:"Titanium Yellow", storage:"256 GB", category:"Phones", pricePi:88,  image:"S24_Ultra.jpg", stock:6 },
  { id:"s24-base",         name:"Galaxy S24",       color:"Black",           storage:"",       category:"Phones", pricePi:70,  image:"", stock:null, proposed:1 },
  { id:"watch-black",   name:"Apple Watch Series 10", color:"Jet Black",  storage:"46 mm GPS", category:"Wearables", pricePi:60, image:"applewatch.jpg", stock:11 },
  { id:"watch-black-2", name:"Apple Watch Series 10", color:"Midnight Sport Band", storage:"42 mm GPS", category:"Wearables", pricePi:55, image:"applewatch-2.jpg", stock:9 },
  { id:"vision-pro",    name:"Apple Vision Pro",      color:"Silver",     storage:"",          category:"Wearables", pricePi:180, image:"", stock:null, proposed:1 },
  { id:"airpods-max",  name:"AirPods Max",    color:"Silver", storage:"USB-C",         category:"Audio", pricePi:70, image:"Apple_AirPods_Max_White.png", stock:5 },
  { id:"airpods-pro",  name:"AirPods Pro 2",  color:"White",  storage:"MagSafe case",  category:"Audio", pricePi:50, image:"Apple_AirPods_Pro.png", stock:14 },
  { id:"airpods4",     name:"AirPods 4",      color:"White",  storage:"",              category:"Audio", pricePi:35, image:"", stock:null, proposed:1 },
  { id:"mac-16",           name:'MacBook Pro 16"', color:"Space Black",   storage:"1 TB · 36 GB",   category:"Laptops", pricePi:150, image:"m3_16_fekete.jpg", stock:2 },
  { id:"mac-14",           name:'MacBook Pro 14"', color:"Space Black",   storage:"512 GB · 18 GB", category:"Laptops", pricePi:132, image:"m3_14_fekete.jpg", stock:3 },
  { id:"rog-black",        name:"ROG Zephyrus G16", color:"Eclipse Grey", storage:"1 TB · RTX 4070", category:"Laptops", pricePi:145, image:"ASUS_ROG_Zephyrus_G16_black_studio.png", stock:2 },
  { id:"rog-white",        name:"ROG Zephyrus G16", color:"Platinum White", storage:"1 TB · RTX 4080", category:"Laptops", pricePi:148, image:"ASUS_ROG_Zephyrus_G16_White_studio.png", stock:2 },
  { id:"scar18-black",     name:"ROG Strix SCAR 18", color:"Black",  storage:"", category:"Laptops", pricePi:165, image:"", stock:null, proposed:1 },
  { id:"scar18-silver",    name:"ROG Strix SCAR 18", color:"Silver", storage:"", category:"Laptops", pricePi:165, image:"", stock:null, proposed:1 },
  { id:"rog-zephyrus",     name:"ASUS ROG Zephyrus", color:"White",  storage:"", category:"Laptops", pricePi:125, image:"", stock:null, proposed:1 }
];

const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (id, name, color, storage, category, price_pi, image, stock, proposed)
    VALUES (@id, @name, @color, @storage, @category, @pricePi, @image, @stock, @proposed)
  `);
  const tx = db.transaction((items) => {
    for (const p of items) {
      insert.run({
        id: p.id,
        name: p.name,
        color: p.color || '',
        storage: p.storage || '',
        category: p.category,
        pricePi: p.pricePi,
        image: p.image || '',
        stock: p.stock,
        proposed: p.proposed || 0
      });
    }
  });
  tx(seedProducts);
  console.log('Seed-irani ' + seedProducts.length + ' produkti.');
}

module.exports = db;