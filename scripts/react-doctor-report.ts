import { diagnose } from "react-doctor/api";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function run() {
  console.log("Running react-doctor diagnosis...");
  
  try {
    const result = await diagnose(".");
    // console.log("Full result:", JSON.stringify(result, null, 2));
    
    const score = typeof result.score === "object" ? result.score.score : result.score;
    
    if (typeof score !== "number") {
      console.error("Failed to get a numeric score from react-doctor.", result.score);
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

    // Replace the existing badge line between markers
    const markerRegex = /<!-- DOCTOR_BADGE_START -->[\s\S]*?<!-- DOCTOR_BADGE_END -->/g;
    const badgeWithMarkers = `<!-- DOCTOR_BADGE_START -->${badge}<!-- DOCTOR_BADGE_END -->`;

    if (markerRegex.test(readme)) {
        readme = readme.replace(markerRegex, badgeWithMarkers);
    } else {
        // Fallback: replace any Health Score badge line
        const badgeRegex = /\[\!\[Health Score\].*?\n/g;
        if (badgeRegex.test(readme)) {
            readme = readme.replace(badgeRegex, `${badgeWithMarkers}\n`);
        } else {
            // Append after title if possible
            readme = readme.replace(/(# .*\n)/, `$1\n${badgeWithMarkers}\n`);
        }
    }

    writeFileSync(readmePath, readme);
    console.log("README.md updated successfully.");
  } catch (error) {
    console.error("Error running react-doctor:", error);
    process.exit(1);
  }
}

run();
