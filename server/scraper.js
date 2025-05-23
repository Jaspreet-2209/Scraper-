const puppeteer = require("puppeteer");
const mongoose = require("mongoose");

// MongoDB connection
mongoose.connect("mongodb+srv://jaspreetsingh221309:O9PDqR5HChAJt9lU@cluster0.vumkhpm.mongodb.net/eventsdb", {

  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Mongoose schema and model
const eventSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  time: String,
});

const Event = mongoose.model("Event", eventSchema);

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://whatson.cityofsydney.nsw.gov.au/", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector(".event_tile-name-link");

    const titles = await page.$$eval(".event_tile-name-link", els =>
      els.map(el => el.innerText.trim())
    );

    const categories = await page.$$eval("a.event_tile-category-link", els =>
      els.map(el => el.innerText.trim())
    );

    const locations = await page.$$eval("a.event_card_location-content", els =>
      els.map(el => el.innerText.trim())
    );

    const times = await page.$$eval("footer.event_tile-footer", els =>
      els.map(el => el.innerText.trim())
    );

    const events = titles.map((_, i) => ({
      title: titles[i] || "",
      category: categories[i] || "",
      location: locations[i] || "",
      time: times[i] || "",
    }));

    // Clear existing entries (optional)
    await Event.deleteMany({});
    await Event.insertMany(events);

    console.log(`✅ Saved ${events.length} events to MongoDB`);
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Scraping error:", error);
    process.exit(1);
  }
})();