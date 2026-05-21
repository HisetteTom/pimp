import { diagnose } from "react-doctor/api";
import { readFileSync, writeFileSync } from "fs";
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

    const badge = `[![Health Score](https://img.shields.io/badge/React_Doctor-${score}%2F100-${color})](https://github.com/millionco/react-doctor)`;
    const readmePath = join(process.cwd(), "README.md");
    let readme = readFileSync(readmePath, "utf-8");

    const markerRegex = /<!-- DOCTOR_BADGE_START -->[\s\S]*?<!-- DOCTOR_BADGE_END -->/;
    const badgeWithMarkers = `<!-- DOCTOR_BADGE_START -->\n${badge}\n<!-- DOCTOR_BADGE_END -->`;

    if (markerRegex.test(readme)) {
        readme = readme.replace(markerRegex, badgeWithMarkers);
        writeFileSync(readmePath, readme);
        console.log("README.md updated with static badge (required for private repo).");
    } else {
        console.error("Markers not found in README.md");
        process.exit(1);
    }

  } catch (error) {
    console.error("Error running react-doctor:", error);
    process.exit(1);
  }
}

run();
