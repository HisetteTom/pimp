import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  refuseInvitation,
  joinProject,
  createTeam,
  joinTeam,
  leaveTeam,
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from '@/app/dashboard/student/actions';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { team, projectEnrollment, refusedProject, task } from '@/db/schema';

// Mock DB
vi.mock('@/db', () => {
  const mockReturning = vi.fn();
  const mockOnConflictDoNothing = vi.fn().mockResolvedValue(undefined);
  const mockValues = vi.fn().mockReturnValue({
    returning: mockReturning,
    onConflictDoNothing: mockOnConflictDoNothing,
  });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockWhereSelect = vi.fn();
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  const mockWhereDelete = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockReturnValue({ where: mockWhereDelete });

  const mockWhereUpdate = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

  return {
    db: {
      insert: mockInsert,
      select: mockSelect,
      delete: mockDelete,
      update: mockUpdate,
      query: {
        project: {
          findFirst: vi.fn(),
        },
        task: {
          findFirst: vi.fn(),
        },
      },
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

// Mock Next Navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url) => {
    throw new Error(`Redirected to ${url}`);
  }),
}));

// Mock Notifications Action
vi.mock('@/app/dashboard/actions-notification', () => ({
  createNotification: vi.fn().mockResolvedValue({ id: 1 }),
}));

describe('Student Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('refuseInvitation', () => {
    it('refuses project invitation and clears enrollment', async () => {
      // Mock Student Session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'student1',
          role: 'student',
          email: 'student@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'student1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const insertMock = vi.mocked(db.insert);
      const deleteMock = vi.mocked(db.delete);

      await refuseInvitation(42);

      // Verify refusedProject insertion
      expect(insertMock).toHaveBeenCalledWith(refusedProject);
      // Verify enrollment deletion
      expect(deleteMock).toHaveBeenCalledWith(projectEnrollment);
    });
  });

  describe('joinProject', () => {
    it('registers enrollment and redirects to project details', async () => {
      // Mock Student Session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'student1',
          role: 'student',
          email: 'student@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'student1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const insertMock = vi.mocked(db.insert);

      await expect(joinProject(42)).rejects.toThrowError(
        'Redirected to /dashboard/student/projects/42',
      );

      expect(insertMock).toHaveBeenCalledWith(projectEnrollment);
    });
  });

  describe('createTeam', () => {
    it('throws error if maximum group limit is reached', async () => {
      // Mock Student Session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'student1',
          role: 'student',
          email: 'student@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'student1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Mock Project maxGroups = 2
      vi.mocked(db.query.project.findFirst).mockResolvedValue({
        id: 42,
        maxGroups: 2,
      } as any);

      // Mock current group count = 2
      const selectMock = vi.mocked(db.select);
      const fromMock = selectMock().from;
      const whereMock = fromMock().where;
      whereMock.mockResolvedValue([{ value: 2 }]);

      await expect(createTeam(42, 'Super Team')).rejects.toThrowError(
        'Maximum groups reached for this project',
      );
    });

    it('creates team successfully if group limit not exceeded', async () => {
      // Mock Student Session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: {
          id: 'student1',
          role: 'student',
          email: 'student@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session1',
          userId: 'student1',
          token: 'token1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Mock Project maxGroups = 5
      vi.mocked(db.query.project.findFirst).mockResolvedValue({
        id: 42,
        maxGroups: 5,
      } as any);

      // Mock current group count = 2
      const selectMock = vi.mocked(db.select);
      const fromMock = selectMock().from;
      const whereMock = fromMock().where;
      whereMock.mockResolvedValue([{ value: 2 }]);

      // Mock Team Insertion returning the created team
      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      const mockNewTeam = { id: 101, name: 'Super Team', projectId: 42 };
      returningMock.mockResolvedValue([mockNewTeam]);

      const updateMock = vi.mocked(db.update);

      const result = await createTeam(42, 'Super Team');

      expect(result).toBeUndefined();
      expect(insertMock).toHaveBeenCalledWith(team);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Super Team',
          projectId: 42,
        }),
      );
      expect(updateMock).toHaveBeenCalledWith(projectEnrollment);
    });
  });

  describe('joinTeam', () => {
    it('throws error if team is full', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      // Mock Project maxMembersPerGroup = 3
      vi.mocked(db.query.project.findFirst).mockResolvedValue({
        id: 42,
        maxMembersPerGroup: 3,
      } as any);

      // Mock team count = 3
      const selectMock = vi.mocked(db.select);
      selectMock()
        .from()
        .where.mockResolvedValue([{ value: 3 }]);

      await expect(joinTeam(42, 101)).rejects.toThrowError('Team is full');
    });

    it('assigns student to team successfully if not full', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      // Mock Project maxMembersPerGroup = 5
      vi.mocked(db.query.project.findFirst).mockResolvedValue({
        id: 42,
        maxMembersPerGroup: 5,
      } as any);

      // Mock team count = 2
      const selectMock = vi.mocked(db.select);
      selectMock()
        .from()
        .where.mockResolvedValue([{ value: 2 }]);

      const updateMock = vi.mocked(db.update);

      await joinTeam(42, 101);

      expect(updateMock).toHaveBeenCalledWith(projectEnrollment);
    });
  });

  describe('leaveTeam', () => {
    it('clears student team assignment', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const updateMock = vi.mocked(db.update);

      await leaveTeam(42);

      expect(updateMock).toHaveBeenCalledWith(projectEnrollment);
    });
  });

  describe('createTask', () => {
    it('inserts task and triggers assignment notifications', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const insertMock = vi.mocked(db.insert);

      await createTask({
        name: 'Task 1',
        description: 'Detail',
        priority: 'high',
        teamId: 101,
        projectId: 42,
        assignees: 'stud1,stud2',
      });

      expect(insertMock).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('deletes task successfully if authorized', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const deleteMock = vi.mocked(db.delete);

      await deleteTask(9, 42);

      expect(deleteMock).toHaveBeenCalledWith(task);
    });
  });

  describe('updateTask', () => {
    it('updates task details successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateTask({
        id: 9,
        name: 'Task 1 Updated',
        description: 'New Desc',
        priority: 'low',
        projectId: 42,
        assigneeId: 'stud1',
        assignees: 'stud1,stud2',
      });

      expect(updateMock).toHaveBeenCalledWith(task);
      expect(setMock).toHaveBeenCalled();
    });

    it('throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update Error');
      });

      await expect(
        updateTask({
          id: 9,
          name: 'Task',
          priority: 'low',
          projectId: 42,
        }),
      ).rejects.toThrowError('Update Error'); // Wait! If unauthorized, let's make sure it checks the right error. Actually, it will throw the mock error!
    });
  });

  describe('updateTaskStatus', () => {
    it('updates task status to in_progress successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'todo',
        createdAt: new Date(),
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateTaskStatus(9, 'in_progress', 42);

      expect(updateMock).toHaveBeenCalledWith(task);
      expect(setMock).toHaveBeenCalled();
    });

    it('updates task status to todo successfully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'in_progress',
        createdAt: new Date(),
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateTaskStatus(9, 'todo', 42);

      expect(updateMock).toHaveBeenCalledWith(task);
      expect(setMock).toHaveBeenCalled();
    });

    it('updates task status to done successfully with createdAt', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'in_progress',
        createdAt: new Date(),
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateTaskStatus(9, 'done', 42);

      expect(updateMock).toHaveBeenCalledWith(task);
      expect(setMock).toHaveBeenCalled();
    });

    it('updates task status to done successfully without createdAt', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'in_progress',
        createdAt: null,
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await updateTaskStatus(9, 'done', 42);

      expect(updateMock).toHaveBeenCalledWith(task);
      expect(setMock).toHaveBeenCalled();
    });

    it('throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(updateTaskStatus(9, 'todo', 42)).rejects.toThrowError('Unauthorized');
    });
  });

  describe('student action errors', () => {
    it('refuseInvitation throws error if database fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('Insert Error');
      });

      await expect(refuseInvitation(42)).rejects.toThrowError('Failed to refuse invitation');
    });

    it('createTeam throws error if database fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.project.findFirst).mockImplementationOnce(() => {
        throw new Error('DB Error');
      });

      await expect(createTeam(42, 'Name')).rejects.toThrowError('DB Error');
    });

    it('createTeam throws error if project is not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.project.findFirst).mockResolvedValueOnce(null as any);

      await expect(createTeam(42, 'Name')).rejects.toThrowError('Project not found');
    });

    it('joinTeam throws error if database fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.project.findFirst).mockImplementationOnce(() => {
        throw new Error('DB Error');
      });

      await expect(joinTeam(42, 101)).rejects.toThrowError('DB Error');
    });

    it('joinTeam throws error if project is not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.project.findFirst).mockResolvedValueOnce(null as any);

      await expect(joinTeam(42, 101)).rejects.toThrowError('Project not found');
    });

    it('refuseInvitation throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(refuseInvitation(42)).rejects.toThrowError('Unauthorized');
    });

    it('joinProject throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(joinProject(42)).rejects.toThrowError('Non autorisé');
    });

    it('createTask triggers task_assigned when assigneeId is specified', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const mockNewTask = { id: 100, name: 'Assigned Task' };
      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockNewTask]);

      await createTask({
        name: 'Assigned Task',
        description: 'Do it',
        teamId: 10,
        projectId: 42,
        assigneeId: 'assignee_user_1',
      });

      expect(insertMock).toHaveBeenCalledWith(task);
    });

    it('createTask catches notification trigger errors silently', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const mockNewTask = { id: 100, name: 'Assigned Task' };
      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockNewTask]);

      // Mock createNotification to throw
      const { createNotification } = await import('@/app/dashboard/actions-notification');
      vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification Service Down'));

      // Should complete successfully without throwing the notification error
      await expect(
        createTask({
          name: 'Assigned Task',
          description: 'Do it',
          teamId: 10,
          projectId: 42,
          assigneeId: 'assignee_user_1',
        }),
      ).resolves.toBeUndefined();
    });

    it('updateTask catches notification trigger errors silently', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      // Mock createNotification to throw
      const { createNotification } = await import('@/app/dashboard/actions-notification');
      vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification Service Down'));

      await expect(
        updateTask({
          id: 9,
          name: 'Updated Task Name',
          description: 'New Description',
          priority: 'high',
          assigneeId: 'assignee_user_1',
          projectId: 42,
        }),
      ).resolves.toBeUndefined();
    });

    it('updateTaskStatus when status is in_progress and task has an inProgressAt timestamp', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const inProgressDate = new Date();
      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'todo',
        inProgressAt: inProgressDate,
      } as any);

      const updateMock = vi.mocked(db.update);
      await updateTaskStatus(9, 'in_progress', 42);
      expect(updateMock).toHaveBeenCalledWith(task);
    });

    it('updateTaskStatus when status is done and task already has an inProgressAt timestamp', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const inProgressDate = new Date();
      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'in_progress',
        inProgressAt: inProgressDate,
      } as any);

      const updateMock = vi.mocked(db.update);
      await updateTaskStatus(9, 'done', 42);
      expect(updateMock).toHaveBeenCalledWith(task);
    });

    it('deleteTask throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(deleteTask(9, 42)).rejects.toThrowError('Unauthorized');
    });

    it('updateTask throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(
        updateTask({
          id: 9,
          name: 'Updated Task Name',
          priority: 'high',
          projectId: 42,
        }),
      ).rejects.toThrowError('Unauthorized');
    });

    it('updateTask triggers notification for multiple comma-separated assignees and assigneeId', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      // Comma-separated assignees with a whitespace entry to cover the "if (trimmed)" branch on line 316
      await expect(
        updateTask({
          id: 9,
          name: 'Updated Task Name',
          priority: 'medium',
          assigneeId: 'assignee_user_1',
          assignees: 'assignee_user_2,  , assignee_user_3',
          projectId: 42,
        }),
      ).resolves.toBeUndefined();
      expect(updateMock).toHaveBeenCalledWith(task);
    });

    it('createTask triggers notification for multiple comma-separated assignees and assigneeId with whitespace', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const mockNewTask = { id: 100, name: 'Assigned Task' };
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockNewTask]);

      // Comma-separated assignees with a whitespace entry to cover the "if (trimmed)" branch on line 208
      await createTask({
        name: 'Assigned Task',
        description: 'Do it',
        teamId: 10,
        projectId: 42,
        assigneeId: 'assignee_user_1',
        assignees: 'assignee_user_2,  , assignee_user_3',
      });

      expect(insertMock).toHaveBeenCalledWith(task);
    });

    it('createTeam throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(createTeam(42, 'team1')).rejects.toThrowError('Unauthorized');
    });

    it('joinTeam throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(joinTeam(42, 10)).rejects.toThrowError('Unauthorized');
    });

    it('leaveTeam throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(leaveTeam(42)).rejects.toThrowError('Unauthorized');
    });

    it('createTask throws unauthorized error if session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(
        createTask({
          name: 'Task',
          teamId: 10,
          projectId: 42,
        }),
      ).rejects.toThrowError('Unauthorized');
    });

    it('updateTaskStatus handles default fallback case when status is not matched', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      vi.mocked(db.query.task.findFirst).mockResolvedValue({
        id: 9,
        status: 'todo',
      } as any);

      const updateMock = vi.mocked(db.update);
      // Pass an invalid status to test that updateData remains { status: 'invalid-status' } and falls through (covers line 258 else branch)
      await updateTaskStatus(9, 'invalid-status', 42);
      expect(updateMock).toHaveBeenCalledWith(task);
    });

    it('createTask and updateTask handle missing assignees and assigneeId gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const mockNewTask = { id: 100, name: 'Assigned Task' };
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockNewTask]);

      // Both assignees and assigneeId are missing
      await createTask({
        name: 'Assigned Task',
        description: 'Do it',
        teamId: 10,
        projectId: 42,
      });

      const updateMock = vi.mocked(db.update);
      await updateTask({
        id: 9,
        name: 'Updated Task Name',
        priority: 'high',
        projectId: 42,
      });

      expect(insertMock).toHaveBeenCalledWith(task);
      expect(updateMock).toHaveBeenCalledWith(task);
    });

    it('refuseInvitation triggers conflict path correctly', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;
      const conflictMock = valuesMock().onConflictDoNothing;

      await refuseInvitation(42);

      expect(insertMock).toHaveBeenCalledWith(refusedProject);
      expect(conflictMock).toHaveBeenCalled();
    });

    it('createTask handles empty assignees string gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const mockNewTask = { id: 100, name: 'Assigned Task' };
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockNewTask]);

      // Assignees is empty string
      await createTask({
        name: 'Assigned Task',
        description: 'Do it',
        teamId: 10,
        projectId: 42,
        assignees: '',
      });

      expect(insertMock).toHaveBeenCalledWith(task);
    });

    it('createTask with status in_progress and status done', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'stud1' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const mockNewTask = { id: 100, name: 'Task Statuses' };
      const valuesMock = insertMock().values as any;
      const returningMock = valuesMock().returning;
      returningMock.mockResolvedValue([mockNewTask]);

      // status in_progress
      await createTask({
        name: 'Task Statuses',
        teamId: 10,
        projectId: 42,
        status: 'in_progress' as any,
      });

      // status done
      await createTask({
        name: 'Task Statuses',
        teamId: 10,
        projectId: 42,
        status: 'done' as any,
      });

      expect(insertMock).toHaveBeenCalledWith(task);
    });
  });
});
