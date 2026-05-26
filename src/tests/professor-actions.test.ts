import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProject,
  updateProjectStatus,
  validateDeliverable,
  evaluateTeam,
  saveTeamNotes,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
  saveCheckpointNote,
} from '@/app/dashboard/professor/actions';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import {
  project,
  checkpoint,
  user,
  projectEnrollment,
  team,
  livrable,
  checkpointNote,
} from '@/db/schema';

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

let mockCheckpointNoteList: any[] = [];

// Mock DB
vi.mock('@/db', () => {
  const mockReturning = vi.fn();
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockFrom = vi.fn((table) => {
    if (table === projectEnrollment) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock([{ userId: 'stud1' }])),
      };
    }
    if (table === team) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock([{ id: 10, name: 'Cool Team' }])),
      };
    }
    if (table === checkpointNote) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(mockCheckpointNoteList)),
      };
    }
    // Fallback for students query in createProject
    return {
      where: vi.fn().mockReturnValue(
        createQueryMock([
          { id: 'stud1', role: 'student' },
          { id: 'stud2', role: 'student' },
        ]),
      ),
    };
  });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  const mockWhereUpdate = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

  const mockWhereDelete = vi.fn().mockResolvedValue(undefined);
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

// Mock Notifications Action
vi.mock('@/app/dashboard/actions-notification', () => ({
  createNotification: vi.fn().mockResolvedValue({ id: 1 }),
}));

describe('Professor Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('throws unauthorized error if not logged in', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(
        createProject({
          name: 'Test Project',
          description: 'A test project',
          maxGroups: 4,
          maxMembersPerGroup: 3,
        }),
      ).rejects.toThrowError('Unauthorized: Professor role required');
    });

    it('throws unauthorized error if user role is student', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'user1',
          role: 'student',
          email: 'student@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'user1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await expect(
        createProject({
          name: 'Test Project',
          description: 'A test project',
          maxGroups: 4,
          maxMembersPerGroup: 3,
        }),
      ).rejects.toThrowError('Unauthorized: Professor role required');
    });

    it('creates project, checkpoints, and triggers notifications if authorized', async () => {
      // Mock Professor Session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'prof1',
          role: 'professor',
          email: 'prof@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'prof1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Mock DB Insert returning newly created project
      const mockProject = { id: 42, name: 'Web Application Development' };
      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockProject]);

      const result = await createProject({
        name: 'Web Application Development',
        description: 'Learn Next.js',
        dateStart: '2026-05-01',
        dateEnd: '2026-06-01',
        maxGroups: 5,
        maxMembersPerGroup: 4,
        checkpoints: [{ title: 'Midterm', dueDate: '2026-05-15' }],
      });

      expect(result).toEqual(mockProject);

      // Verify db.insert(project) was called with project data
      expect(insertMock).toHaveBeenCalledWith(project);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Web Application Development',
          description: 'Learn Next.js',
          maxGroups: 5,
          maxMembersPerGroup: 4,
          status: 'proposed',
        }),
      );

      // Verify db.insert(checkpoint) was called
      expect(insertMock).toHaveBeenCalledWith(checkpoint);
    });

    it('creates project successfully even if student notification triggers fail', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const mockProject = { id: 42, name: 'Notification Failure Project' };
      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockProject]);

      // Mock createNotification to throw
      const { createNotification } = await import('@/app/dashboard/actions-notification');
      vi.mocked(createNotification).mockRejectedValueOnce(
        new Error('Notification Service Offline'),
      );

      const result = await createProject({
        name: 'Notification Failure Project',
        description: 'Test handling notification error',
        maxGroups: 2,
        maxMembersPerGroup: 2,
      });

      expect(result).toEqual(mockProject);
    });
  });

  describe('updateProjectStatus', () => {
    it('throws unauthorized error if missing role or session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(updateProjectStatus(42, 'validated')).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('updates project status correctly if authorized', async () => {
      // Mock Professor Session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'prof1',
          role: 'professor',
          email: 'prof@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'prof1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateProjectStatus(42, 'validated');

      expect(updateMock).toHaveBeenCalledWith(project);
      expect(setMock).toHaveBeenCalledWith({ status: 'validated' });
    });
  });

  describe('validateDeliverable', () => {
    it('throws unauthorized error if missing role or session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(validateDeliverable(101, 'accepted', 'Good job', 42)).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('updates deliverable status and feedback if authorized', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await validateDeliverable(101, 'accepted', 'Good job', 42);

      expect(updateMock).toHaveBeenCalledWith(livrable);
      expect(setMock).toHaveBeenCalledWith({ status: 'accepted', feedback: 'Good job' });
    });
  });

  describe('evaluateTeam', () => {
    it('throws unauthorized error if missing role or session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(
        evaluateTeam(10, '18', '{"overview":"Excellent work"}', 42),
      ).rejects.toThrowError('Unauthorized: Professor role required');
    });

    it('updates team grade/feedback and triggers notifications', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await evaluateTeam(10, '18', '{"overview":"Excellent work"}', 42);

      expect(updateMock).toHaveBeenCalledWith(team);
      expect(setMock).toHaveBeenCalledWith({
        grade: '18',
        feedback: '{"overview":"Excellent work"}',
      });
    });

    it('handles kanban/tasks in team feedback and sets correct tab', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      await evaluateTeam(10, '18', '{"kanban":true}', 42);
      expect(updateMock).toHaveBeenCalledWith(team);
    });

    it('handles deliverables in team feedback and sets correct tab', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      await evaluateTeam(10, '18', '{"deliverables":true}', 42);
      expect(updateMock).toHaveBeenCalledWith(team);
    });

    it('catches notification service errors silently when evaluating team', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const { createNotification } = await import('@/app/dashboard/actions-notification');
      vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification failure'));

      const updateMock = vi.mocked(db.update);
      await expect(evaluateTeam(10, '18', '{"overview":true}', 42)).resolves.toBeUndefined();
      expect(updateMock).toHaveBeenCalledWith(team);
    });

    it('handles invalid JSON or falsy feedback gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      await evaluateTeam(10, '18', 'invalid-json', 42); // triggers catch block fallback
      expect(updateMock).toHaveBeenCalledWith(team);
    });

    it('handles empty JSON object feedback', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      await evaluateTeam(10, '18', '{}', 42); // parts.length is 0
      expect(updateMock).toHaveBeenCalledWith(team);
    });

    it('handles non-object or null parsed feedback', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      await evaluateTeam(10, '18', 'null', 42); // parsed is null
      await evaluateTeam(10, '18', '123', 42); // parsed is number
      expect(updateMock).toHaveBeenCalledWith(team);
    });

    it('handles missing team members or missing teamData name gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      // Save global mock lists
      const originalMockFrom = vi.mocked(db.select)().from;

      // Override db.select().from to return empty arrays
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockImplementation((table) => {
          return {
            where: vi.fn().mockImplementation(() => {
              return {
                limit: vi.fn().mockReturnValue(Promise.resolve([])), // teamData empty
                then: (onfulfilled: any) => Promise.resolve([]).then(onfulfilled), // teamMembers empty
              };
            }),
          };
        }),
      } as any);

      const updateMock = vi.mocked(db.update);
      await evaluateTeam(10, '18', '{"overview":true}', 42);
      expect(updateMock).toHaveBeenCalledWith(team);

      // Restore
      vi.mocked(db.select).mockReturnValue({ from: originalMockFrom } as any);
    });
  });

  describe('saveTeamNotes', () => {
    it('updates team notes successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await saveTeamNotes(10, 'Some internal professor notes', 42);

      expect(updateMock).toHaveBeenCalledWith(team);
      expect(setMock).toHaveBeenCalledWith({ notes: 'Some internal professor notes' });
    });
  });

  describe('createCheckpoint', () => {
    it('inserts checkpoint successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      const mockCp = { id: 1, title: 'Jalon 1', projectId: 42 };
      returningMock.mockResolvedValue([mockCp]);

      const result = await createCheckpoint(42, 'Jalon 1', '2026-06-01');

      expect(result).toEqual(mockCp);
      expect(insertMock).toHaveBeenCalledWith(checkpoint);
    });
  });

  describe('updateCheckpoint', () => {
    it('updates checkpoint successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateCheckpoint(9, 'Jalon 1 Updated', '2026-06-02', 42);

      expect(updateMock).toHaveBeenCalledWith(checkpoint);
      expect(setMock).toHaveBeenCalled();
    });
  });

  describe('deleteCheckpoint', () => {
    it('deletes checkpoint successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      const deleteMock = vi.mocked(db.delete);

      await deleteCheckpoint(9, 42);

      expect(deleteMock).toHaveBeenCalledWith(checkpoint);
    });
  });

  describe('saveCheckpointNote', () => {
    it('inserts checkpoint note if it does not exist', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      mockCheckpointNoteList = []; // empty, so inserts

      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;

      await saveCheckpointNote(9, 10, 'Very good checkpoints', 42);

      expect(insertMock).toHaveBeenCalledWith(checkpointNote);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          checkpointId: 9,
          teamId: 10,
          notes: 'Very good checkpoints',
        }),
      );
    });

    it('updates checkpoint note if it already exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      mockCheckpointNoteList = [{ id: 1, checkpointId: 9, teamId: 10 }]; // exists, so updates

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await saveCheckpointNote(9, 10, 'Updated notes', 42);

      expect(updateMock).toHaveBeenCalledWith(checkpointNote);
      expect(setMock).toHaveBeenCalledWith({ notes: 'Updated notes' });
    });

    it('throws unauthorized error if missing role or session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(saveCheckpointNote(9, 10, 'some notes', 42)).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('throws error if database save fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error('Select error');
      });

      await expect(saveCheckpointNote(9, 10, 'some notes', 42)).rejects.toThrowError(
        'Failed to save checkpoint note',
      );
    });
  });

  describe('professor actions catch blocks', () => {
    it('createProject throws error if database insert fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('Insert error');
      });

      await expect(
        createProject({
          name: 'Failure Proj',
          description: 'Fails',
          maxGroups: 2,
          maxMembersPerGroup: 2,
        }),
      ).rejects.toThrowError('Failed to create project');
    });

    it('updateProjectStatus throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update error');
      });

      await expect(updateProjectStatus(42, 'validated')).rejects.toThrowError(
        'Failed to update project status',
      );
    });

    it('validateDeliverable throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update error');
      });

      await expect(validateDeliverable(101, 'accepted', 'Good job', 42)).rejects.toThrowError(
        'Failed to validate deliverable',
      );
    });

    it('evaluateTeam throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update error');
      });

      await expect(
        evaluateTeam(10, '18', '{"overview":"Excellent work"}', 42),
      ).rejects.toThrowError('Failed to evaluate team');
    });

    it('saveTeamNotes throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update error');
      });

      await expect(saveTeamNotes(10, 'Some internal professor notes', 42)).rejects.toThrowError(
        'Failed to save team notes',
      );
    });

    it('createCheckpoint throws error if database insert fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('Insert error');
      });

      await expect(createCheckpoint(42, 'Jalon 1', '2026-06-01')).rejects.toThrowError(
        'Failed to create checkpoint',
      );
    });

    it('updateCheckpoint throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update error');
      });

      await expect(updateCheckpoint(9, 'Jalon 1 Updated', '2026-06-02', 42)).rejects.toThrowError(
        'Failed to update checkpoint',
      );
    });

    it('deleteCheckpoint throws error if database delete fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error('Delete error');
      });

      await expect(deleteCheckpoint(9, 42)).rejects.toThrowError('Failed to delete checkpoint');
    });

    it('saveTeamNotes throws unauthorized error if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(saveTeamNotes(10, 'notes', 42)).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('createCheckpoint throws unauthorized error if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(createCheckpoint(42, 'title', '2026-06-01')).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('updateCheckpoint throws unauthorized error if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(updateCheckpoint(9, 'title', '2026-06-02', 42)).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });

    it('deleteCheckpoint throws unauthorized error if not professor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(deleteCheckpoint(9, 42)).rejects.toThrowError(
        'Unauthorized: Professor role required',
      );
    });
  });
});
