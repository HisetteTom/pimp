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

    // Strategy: Write badge to a separate file to avoid README merge conflicts
    const badge = `[![Health Score](https://img.shields.io/badge/React_Doctor-${score}%2F100-${color})](https://github.com/millionco/react-doctor)`;
    
    const badgeDir = join(process.cwd(), ".github", "badges");
    if (!existsSync(badgeDir)) {
      mkdirSync(badgeDir, { recursive: true });
    }
    
    const badgeFilePath = join(badgeDir, "react-doctor.md");
    writeFileSync(badgeFilePath, badge);
    console.log(`.github/badges/react-doctor.md updated successfully.`);

    // One-time README update to point to the file if markers exist
    const readmePath = join(process.cwd(), "README.md");
    let readme = readFileSync(readmePath, "utf-8");
    const markerRegex = /<!-- DOCTOR_BADGE_START -->[\s\S]*?<!-- DOCTOR_BADGE_END -->/;
    
    // We replace the markers with a relative link to the badge file or just a placeholder
    // GitHub supports embedding markdown files in other markdown via some tricks, 
    // but the most conflict-free way is to keep the badge in its own file and let the user link to it,
    // or use a stable URL that points to the badge file on the current branch.
    
    // For now, let's keep the README stable by pointing to the file on the current branch
    const stableLink = `<!-- DOCTOR_BADGE_START -->\n[![](https://img.shields.io/badge/Health_Score-Check_Badge-blue) (Check Latest Health Score)](.github/badges/react-doctor.md)\n<!-- DOCTOR_BADGE_END -->`;

    if (markerRegex.test(readme)) {
        // If we still have the old badge in README, we replace it with a stable link that doesn't change with the score
        readme = readme.replace(markerRegex, stableLink);
        writeFileSync(readmePath, readme);
        console.log("README.md updated with stable link to prevent future conflicts.");
    }

  } catch (error) {
    console.error("Error running react-doctor:", error);
    process.exit(1);
  }
}

run();
