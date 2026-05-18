import { diagnose } from "react-doctor/api";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

async function run() {
  console.log("Running react-doctor diagnosis...");
  
  try {
    const result = await diagnose(".");
    
    const scoreObj = result.score;
    if (!scoreObj) {
      console.error("No score returned from react-doctor.");
      process.exit(1);
    }

    const score = typeof scoreObj === "object" ? scoreObj.score : scoreObj;
    if (typeof score !== "number") {
      console.error("Failed to get a numeric score from react-doctor.", scoreObj);
      process.exit(1);
    }

    let color = "red";
    if (score > 85) color = "brightgreen";
    else if (score > 70) color = "green";
    else if (score > 50) color = "yellow";
    else if (score > 25) color = "orange";

    console.log(`Score: ${score}, Color: ${color}`);

    // Create JSON for shields.io dynamic badge
    const badgeData = {
      schemaVersion: 1,
      label: "React Doctor",
      message: `${score}/100`,
      color: color,
    };
    
    const badgeDir = join(process.cwd(), ".github", "badges");
    if (!existsSync(badgeDir)) {
      mkdirSync(badgeDir, { recursive: true });
    }
    
    const jsonPath = join(badgeDir, "react-doctor.json");
    writeFileSync(jsonPath, JSON.stringify(badgeData, null, 2));
    console.log(`.github/badges/react-doctor.json updated.`);

    // Update README with STATIC dynamic-badge link
    // This link never changes, so NO MERGE CONFLICTS.
    // It fetches the JSON from the current branch.
    const readmePath = join(process.cwd(), "README.md");
    let readme = readFileSync(readmePath, "utf-8");
    
    // We need to know repo owner and name for the raw.githubusercontent link
    // Defaulting to placeholders or trying to infer if possible, 
    // but better to use a relative link if shields.io supports it (it doesn't directly).
    // However, we can use a placeholder that the user can fix or we can try to guess.
    
    // For local dev, we use a generic label. In CI, we can use env vars.
    const repo = process.env.GITHUB_REPOSITORY || "HisetteTom/pimp";
    const branch = process.env.GITHUB_REF_NAME || "main";
    
    const dynamicBadgeUrl = `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/${repo}/${branch}/.github/badges/react-doctor.json`;
    const badgeMarkdown = `[![Health Score](${dynamicBadgeUrl})](https://github.com/millionco/react-doctor)`;
    const stableLink = `<!-- DOCTOR_BADGE_START -->\n${badgeMarkdown}\n<!-- DOCTOR_BADGE_END -->`;

    const markerRegex = /<!-- DOCTOR_BADGE_START -->[\s\S]*?<!-- DOCTOR_BADGE_END -->/;

    if (markerRegex.test(readme)) {
        // Force update if it's the placeholder or missing
        if (!readme.includes(repo) || !readme.includes("img.shields.io/endpoint")) {
            readme = readme.replace(markerRegex, stableLink);
            writeFileSync(readmePath, readme);
            console.log("README.md updated with real repo dynamic link.");
        }
    }

  } catch (error) {
    console.error("Error running react-doctor:", error);
    process.exit(1);
  }
}

run();
