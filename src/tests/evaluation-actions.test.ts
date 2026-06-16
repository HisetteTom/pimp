import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCriterion,
  updateCriterion,
  deleteCriterion,
  saveTeamEvaluation,
} from '@/app/dashboard/professor/evaluation-actions';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { evaluationCriterion, teamEvaluationScore, team } from '@/db/schema';

// Helper to create a fluent query thenable mock
const createQueryMock = (resolvedValue: any) => {
  const promise = Promise.resolve(resolvedValue);
  const chain: any = {
    limit: vi.fn().mockImplementation(() => chain),
    then: (onfulfilled: any, onrejected: any) => promise.then(onfulfilled, onrejected),
    catch: (onrejected: any) => promise.catch(onrejected),
  };
  return chain;
};

// Mock DB
vi.mock('@/db', () => {
  const mockInsertReturning = vi.fn();
  const mockValues = vi.fn().mockReturnValue({ returning: mockInsertReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockFrom = vi.fn((table) => {
    const scores = (globalThis as any).mockScoreList || [];
    if (table === teamEvaluationScore) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(scores)),
      };
    }
    return {
      where: vi.fn().mockReturnValue(createQueryMock([])),
    };
  });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  const mockReturningFn = vi.fn().mockImplementation(() => {
    return Promise.resolve((globalThis as any).mockReturningVal || []);
  });

  const mockWhereUpdate = vi.fn().mockReturnValue({ returning: mockReturningFn });
  const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

  const mockWhereDelete = vi.fn().mockReturnValue({ returning: mockReturningFn });
  const mockDelete = vi.fn().mockReturnValue({ where: mockWhereDelete });

  return {
    db: {
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
});

// Mock Auth
vi.mock('@/lib/auth', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn(),
      },
    },
  };
});

describe('Evaluation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).mockReturningVal = [];
    (globalThis as any).mockScoreList = [];
  });

  describe('createCriterion', () => {
    it('throws unauthorized if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(createCriterion({ projectId: 42, name: 'Code Quality' })).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('inserts criterion successfully if professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const insertReturningMock = valuesMock().returning;
      const mockCriterion = { id: 1, name: 'Code Quality', projectId: 42 };
      insertReturningMock.mockResolvedValue([mockCriterion]);

      const result = await createCriterion({
        projectId: 42,
        name: 'Code Quality',
        description: 'Clean and readable',
        maxPoints: 20,
      });

      expect(result).toEqual(mockCriterion);
      expect(insertMock).toHaveBeenCalledWith(evaluationCriterion);
    });
  });

  describe('updateCriterion', () => {
    it('updates criterion details successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const mockCriterion = { id: 1, name: 'Updated Name' };
      (globalThis as any).mockReturningVal = [mockCriterion];

      const result = await updateCriterion({
        id: 1,
        name: 'Updated Name',
        description: 'New Description',
        maxPoints: 15,
      });

      expect(result).toEqual(mockCriterion);
      expect(db.update).toHaveBeenCalledWith(evaluationCriterion);
    });
  });

  describe('deleteCriterion', () => {
    it('deletes criterion successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const mockCriterion = { id: 1 };
      (globalThis as any).mockReturningVal = [mockCriterion];

      const result = await deleteCriterion(1);

      expect(result).toEqual(mockCriterion);
      expect(db.delete).toHaveBeenCalledWith(evaluationCriterion);
    });
  });

  describe('saveTeamEvaluation', () => {
    it('saves global grades and criterion scores by inserting if none exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      (globalThis as any).mockScoreList = []; // none exists

      const updateMock = vi.mocked(db.update);
      const insertMock = vi.mocked(db.insert);

      const result = await saveTeamEvaluation({
        teamId: 10,
        projectId: 42,
        globalGrade: '17',
        juryFeedback: 'Very good presentation',
        supervisorNotes: 'Consistent progress',
        scores: [{ criterionId: 1, score: 18, comment: 'Excellent' }],
      });

      expect(result).toEqual({ success: true });
      expect(updateMock).toHaveBeenCalledWith(team);
      expect(insertMock).toHaveBeenCalledWith(teamEvaluationScore);
    });

    it('updates criterion scores if they already exist', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      (globalThis as any).mockScoreList = [{ id: 99, teamId: 10, criterionId: 1 }]; // already exists

      const updateMock = vi.mocked(db.update);

      const result = await saveTeamEvaluation({
        teamId: 10,
        projectId: 42,
        globalGrade: '17',
        juryFeedback: 'Very good presentation',
        supervisorNotes: 'Consistent progress',
        scores: [{ criterionId: 1, score: 18, comment: 'Excellent' }],
      });

      expect(result).toEqual({ success: true });
      expect(updateMock).toHaveBeenCalledWith(team);
      expect(updateMock).toHaveBeenCalledWith(teamEvaluationScore);
    });

    it('saves successfully with jury role and handles empty/null scores and comments', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'jury1', role: 'professor' },
      } as any);

      const insertMock = vi.mocked(db.insert);

      // Test inserting scores with undefined score and comment (covers fallback null inside insert)
      (globalThis as any).mockScoreList = [];
      await saveTeamEvaluation({
        teamId: 10,
        projectId: 42,
        globalGrade: '15',
        juryFeedback: 'Feedback',
        supervisorNotes: 'Notes',
        scores: [{ criterionId: 1, score: undefined, comment: undefined }],
      });
      expect(insertMock).toHaveBeenCalledWith(teamEvaluationScore);

      // Test updating scores with undefined score and comment (covers fallback null inside update)
      (globalThis as any).mockScoreList = [{ id: 99, teamId: 10, criterionId: 1 }];
      const updateMock = vi.mocked(db.update);
      await saveTeamEvaluation({
        teamId: 10,
        projectId: 42,
        globalGrade: '15',
        juryFeedback: 'Feedback',
        supervisorNotes: 'Notes',
        scores: [{ criterionId: 1, score: undefined, comment: undefined }],
      });
      expect(updateMock).toHaveBeenCalledWith(teamEvaluationScore);
    });

    it('throws error if database save fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Save Error');
      });

      await expect(
        saveTeamEvaluation({
          teamId: 10,
          projectId: 42,
          globalGrade: '17',
          juryFeedback: 'Feedback',
          supervisorNotes: 'Notes',
          scores: [],
        }),
      ).rejects.toThrowError('Failed to save team evaluation');
    });

    it('throws unauthorized error if missing role or session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(
        saveTeamEvaluation({
          teamId: 10,
          projectId: 42,
          globalGrade: '17',
          juryFeedback: 'Feedback',
          supervisorNotes: 'Notes',
          scores: [],
        }),
      ).rejects.toThrowError('Unauthorized: Professor or Jury role required');
    });
  });

  describe('Evaluation Actions Edge Cases and Error Flows', () => {
    it('createCriterion uses default maxPoints and null description when not specified', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const insertReturningMock = valuesMock().returning;
      insertReturningMock.mockResolvedValue([
        { id: 1, name: 'Default Cp', projectId: 42, maxPoints: 20 },
      ]);

      const result = await createCriterion({
        projectId: 42,
        name: 'Default Cp',
      });

      expect(result.maxPoints).toBe(20);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
          maxPoints: 20,
        }),
      );
    });

    it('createCriterion throws error if database insert fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('Insert error');
      });

      await expect(
        createCriterion({
          projectId: 42,
          name: 'Fails',
        }),
      ).rejects.toThrowError('Failed to create criterion');
    });

    it('updateCriterion uses default maxPoints and null description when not specified', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const mockCriterion = { id: 1, name: 'Updated Name', maxPoints: 20 };
      (globalThis as any).mockReturningVal = [mockCriterion];

      const result = await updateCriterion({
        id: 1,
        name: 'Updated Name',
      });

      expect(result).toEqual(mockCriterion);
    });

    it('updateCriterion throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update error');
      });

      await expect(
        updateCriterion({
          id: 1,
          name: 'Fails',
        }),
      ).rejects.toThrowError('Failed to update criterion');
    });

    it('updateCriterion throws unauthorized error if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(
        updateCriterion({
          id: 1,
          name: 'Fails',
        }),
      ).rejects.toThrowError('Unauthorized: Professor role required');
    });

    it('deleteCriterion throws unauthorized if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(deleteCriterion(1)).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('deleteCriterion throws error if database delete fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error('Delete error');
      });

      await expect(deleteCriterion(1)).rejects.toThrowError('Failed to delete criterion');
    });
  });
});
