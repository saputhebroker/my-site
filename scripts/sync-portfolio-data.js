const fs = require("fs/promises");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourceFile = path.join(rootDir, "portfolio.json");
const publicDir = path.join(rootDir, "public");
const publicJsonFile = path.join(publicDir, "portfolio.json");
const publicJsFile = path.join(publicDir, "portfolio-data.js");

async function main() {
    const file = await fs.readFile(sourceFile, "utf8");
    const portfolio = JSON.parse(file);
    const json = JSON.stringify(portfolio, null, 2);
    const js = `// Generated from portfolio.json. Run "npm run build" after content updates.\nwindow.PORTFOLIO_DATA = ${json};\n`;

    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(publicJsonFile, `${json}\n`, "utf8");
    await fs.writeFile(publicJsFile, js, "utf8");

    console.log("Synced portfolio content to public assets.");
}

main().catch((error) => {
    console.error("Failed to sync portfolio content.");
    console.error(error);
    process.exit(1);
});
