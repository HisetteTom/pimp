import { pgTable, integer, text, real } from 'drizzle-orm/pg-core';
import { project } from './project';
import { team } from './team';

/**
 * Grading criteria set by professors for evaluating project outcomes.
 */
export const evaluationCriterion = pgTable('evaluation_criterion', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  projectId: integer('project_id')
    .references(() => project.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  maxPoints: integer('max_points').notNull().default(20),
});

/**
 * Numeric scores and comments mapped to a team per criterion.
 */
export const teamEvaluationScore = pgTable('team_evaluation_score', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  teamId: integer('team_id')
    .references(() => team.id, { onDelete: 'cascade' })
    .notNull(),
  criterionId: integer('criterion_id')
    .references(() => evaluationCriterion.id, { onDelete: 'cascade' })
    .notNull(),
  score: real('score'),
  comment: text('comment'),
});
