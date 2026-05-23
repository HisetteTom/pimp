import { db } from './db';
import { task } from '../../src/db/schema/task';
import { livrable } from '../../src/db/schema/livrable';
import { faker } from '@faker-js/faker';

interface SeedTasksProps {
  insertedTeams: any[];
  enrollmentsToInsert: any[];
}

export async function seedTasks({ insertedTeams, enrollmentsToInsert }: SeedTasksProps) {
  console.log('Populating realistic tasks and deliverables…');
  const getInt = faker.number.int.bind(faker.number);

  const tasksData = [];
  const deliverablesData = [];

  const taskTemplates = [
    {
      name: 'Initial Project Scope Definition',
      desc: 'Define functional requirements, milestones and team responsibilities.',
      status: 'done',
      priority: 'high',
    },
    {
      name: 'Database Schema Draft',
      desc: 'Design entity relation diagram and write migrations.',
      status: 'done',
      priority: 'medium',
    },
    {
      name: 'API Architecture Design',
      desc: 'Model RESTful route controllers and structure server schemas.',
      status: 'in_progress',
      priority: 'high',
    },
    {
      name: 'User Interface Mockups',
      desc: 'Create interactive Figma blueprints for all key dashboard panels.',
      status: 'in_progress',
      priority: 'medium',
    },
    {
      name: 'Automated Integration Tests',
      desc: 'Configure Jest or Vitest framework suites targeting core backend mutations.',
      status: 'todo',
      priority: 'low',
    },
    {
      name: 'Docker Deployment Setup',
      desc: 'Compose local containers isolating database and authentication runtimes.',
      status: 'todo',
      priority: 'high',
    },
  ];

  const deliverableTemplates = [
    {
      name: 'System Architecture Charter',
      source: 'https://example.com/system-charter-v1.pdf',
      status: 'approved',
      feedback: 'Excellent initial layout. High fidelity diagram.',
    },
    {
      name: 'Figma Interface Design PDF',
      source: 'https://example.com/figma-export.pdf',
      status: 'approved',
      feedback: 'Matches standard design rules. Highly accessible.',
    },
    {
      name: 'Working Code Repository ZIP',
      source: 'https://example.com/repo-backup.zip',
      status: 'pending',
      feedback: null,
    },
    {
      name: 'Deployment Blueprint',
      source: 'https://example.com/docker-deploy.yml',
      status: 'rejected',
      feedback: 'Container ports conflict with local auth configuration. Please fix and resubmit.',
    },
  ];

  for (const t of insertedTeams) {
    const teamMembers: string[] = [];
    for (const e of enrollmentsToInsert) {
      if (e.teamId === t.id) {
        teamMembers.push(e.userId);
      }
    }

    // Add 4-6 tasks
    const numTasks = getInt({ min: 4, max: 6 });
    for (let k = 0; k < numTasks; k++) {
      const template = taskTemplates[k % taskTemplates.length];
      const assigneeId =
        teamMembers.length > 0
          ? teamMembers[getInt({ min: 0, max: teamMembers.length - 1 })]
          : null;

      tasksData.push({
        name: template.name,
        description: template.desc,
        status: template.status,
        priority: template.priority,
        teamId: t.id,
        assigneeId,
        createdAt: new Date(),
      });
    }

    // Add 2-3 deliverables
    const numDelivs = getInt({ min: 2, max: 3 });
    for (let d = 0; d < numDelivs; d++) {
      const template = deliverableTemplates[d % deliverableTemplates.length];
      deliverablesData.push({
        name: template.name,
        source: template.source,
        teamId: t.id,
        status: template.status,
        feedback: template.feedback,
        createdAt: new Date(),
      });
    }
  }

  if (tasksData.length > 0) {
    await db.insert(task).values(tasksData);
  }
  if (deliverablesData.length > 0) {
    await db.insert(livrable).values(deliverablesData);
  }
}
