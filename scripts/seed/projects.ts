import { db } from "./db";
import { project } from "../../src/db/schema/project";

export async function seedProjects() {
  console.log("Creating 9 realistic projects…");
  const projectsData = [
    {
      name: "Autonomous Drone Delivery System",
      description: "Build an autonomous pathfinding algorithm for package delivery drones in low-altitude urban airspaces, complete with landing pad detection.",
      status: "proposed",
      dateStart: "2026-06-01",
      dateEnd: "2026-09-30",
      maxGroups: 6,
      maxMembersPerGroup: 4,
    },
    {
      name: "Decentralized Carbon Offset Registry",
      description: "Design a decentralized platform utilizing smart contracts to track, audit, and trade greenhouse gas emission tokens transparently.",
      status: "proposed",
      dateStart: "2026-07-15",
      dateEnd: "2026-11-30",
      maxGroups: 5,
      maxMembersPerGroup: 5,
    },
    {
      name: "Smart Traffic Flow Controller",
      description: "Apply computer vision algorithms at intersections to orchestrate traffic signals dynamically, optimizing traffic flows and reducing idle times.",
      status: "validated",
      dateStart: "2026-05-01",
      dateEnd: "2026-08-31",
      maxGroups: 4,
      maxMembersPerGroup: 5,
    },
    {
      name: "AI-Powered Patient Triage Portal",
      description: "Develop a diagnostic support system assisting clinic staff to categorize and prioritize patient queues based on severe symptoms and case history.",
      status: "ongoing",
      dateStart: "2026-03-01",
      dateEnd: "2026-06-30",
      maxGroups: 8,
      maxMembersPerGroup: 4,
    },
    {
      name: "Greenhouse Hydroponic Automator",
      description: "Assemble microcontrollers measuring humidity, light, and mineral feeds, integrating real-time telemetry into a visual analytics control panel.",
      status: "ongoing",
      dateStart: "2026-02-15",
      dateEnd: "2026-06-15",
      maxGroups: 6,
      maxMembersPerGroup: 5,
    },
    {
      name: "Real-Time Microgrid Balancer",
      description: "Model regional electricity networks balancing solar, wind, and storage battery feeds dynamically against consumer load curves.",
      status: "late",
      dateStart: "2026-01-10",
      dateEnd: "2026-05-15",
      maxGroups: 5,
      maxMembersPerGroup: 5,
    },
    {
      name: "Biometric Identity Guard System",
      description: "Develop a multi-factor local credentials gatehouse checking localized face keypoints and hardware verification tags.",
      status: "delivered",
      dateStart: "2025-11-01",
      dateEnd: "2026-04-15",
      maxGroups: 4,
      maxMembersPerGroup: 4,
    },
    {
      name: "Augmented Reality Museum Guide",
      description: "Create an interactive mobile viewport rendering localized historical scenes and artifacts over existing museum halls.",
      status: "presented",
      dateStart: "2025-09-01",
      dateEnd: "2026-03-31",
      maxGroups: 6,
      maxMembersPerGroup: 5,
    },
    {
      name: "Secure Remote Voting Module",
      description: "A secure protocol leveraging zero-knowledge proofs to allow secure voting while preserving strict voter privacy.",
      status: "closed",
      dateStart: "2025-08-01",
      dateEnd: "2026-02-01",
      maxGroups: 4,
      maxMembersPerGroup: 5,
    }
  ];

  const insertedProjects = await db.insert(project).values(projectsData).returning();
  return insertedProjects;
}
