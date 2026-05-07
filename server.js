const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const portfolioFile = path.join(__dirname, "portfolio.json");
const submissionsFile = path.join(__dirname, "contact-submissions.json");

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});
app.use(express.static(publicDir));

async function readPortfolio() {
    const file = await fs.readFile(portfolioFile, "utf8");
    return JSON.parse(file);
}

async function readSubmissions() {
    try {
        const file = await fs.readFile(submissionsFile, "utf8");
        return JSON.parse(file);
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
}

async function saveSubmission(submission) {
    const submissions = await readSubmissions();
    submissions.unshift(submission);
    await fs.writeFile(submissionsFile, JSON.stringify(submissions, null, 2));
}

function normalizeField(value, maxLength) {
    return String(value || "").trim().slice(0, maxLength);
}

function isReadOnlyFilesystemError(error) {
    return ["EROFS", "EPERM", "EACCES"].includes(error?.code);
}

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/portfolio", async (_req, res) => {
    try {
        const portfolio = await readPortfolio();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: "Unable to load portfolio content." });
    }
});

app.get("/api/projects", async (_req, res) => {
    try {
        const portfolio = await readPortfolio();
        res.json(portfolio.projects);
    } catch (error) {
        res.status(500).json({ message: "Unable to load project list." });
    }
});

app.post("/api/contact", async (req, res) => {
    try {
        const submission = {
            id: Date.now().toString(36),
            name: normalizeField(req.body.name, 80),
            email: normalizeField(req.body.email, 120),
            subject: normalizeField(req.body.subject, 120),
            message: normalizeField(req.body.message, 1500),
            createdAt: new Date().toISOString()
        };

        if (!submission.name || !submission.email || !submission.subject || !submission.message) {
            return res.status(400).json({ message: "Please fill out every field in the contact form." });
        }

        await saveSubmission(submission);
        return res.status(201).json({ message: "Message received. It has been saved for you." });
    } catch (error) {
        if (isReadOnlyFilesystemError(error)) {
            return res.status(503).json({
                message: "This host can serve the site, but message storage is not enabled here yet.",
                fallback: "mailto"
            });
        }

        return res.status(500).json({ message: "Unable to save the message right now." });
    }
});

app.listen(port, () => {
    console.log(`Site is live at http://localhost:${port}`);
});
