import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createNotification,
  markAsRead,
  markAllAsRead,
  getNotifications,
} from '@/app/dashboard/actions-notification';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { notification, projectEnrollment, project, checkpoint, task } from '@/db/schema';

// Helper to create a fluent query thenable mock
const createQueryMock = (resolvedValue: any) => {
  const promise = Promise.resolve(resolvedValue);
  const chain: any = {
    orderBy: vi.fn().mockImplementation(() => chain),
    limit: vi.fn().mockImplementation(() => chain),
    then: (onfulfilled: any, onrejected: any) => promise.then(onfulfilled, onrejected),
    catch: (onrejected: any) => promise.catch(onrejected),
  };
  return chain;
};

let mockNotifsList: any[] = [];
let mockEnrollments: any[] = [];
let mockProjects: any[] = [];
let mockCheckpoints: any[] = [];
let mockTasks: any[] = [];

// Mock DB
vi.mock('@/db', () => {
  const mockReturning = vi.fn();
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockFrom = vi.fn((table) => {
    if (table === notification) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(mockNotifsList)),
      };
    }
    if (table === projectEnrollment) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(mockEnrollments)),
      };
    }
    if (table === project) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(mockProjects)),
      };
    }
    if (table === checkpoint) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(mockCheckpoints)),
      };
    }
    if (table === task) {
      return {
        where: vi.fn().mockReturnValue(createQueryMock(mockTasks)),
      };
    }
    return {
      where: vi.fn().mockReturnValue(createQueryMock([])),
    };
  });

  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  const mockWhereUpdate = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

  return {
    db: {
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
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

describe('Notification Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotifsList = [];
    mockEnrollments = [];
    mockProjects = [];
    mockCheckpoints = [];
    mockTasks = [];
  });

  describe('createNotification', () => {
    it('throws unauthorized error if not logged in', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(
        createNotification({
          userId: 'user1',
          title: 'Test Title',
          message: 'Test Message',
          type: 'project_proposed',
        }),
      ).rejects.toThrowError('Unauthorized');
    });

    it('inserts a notification into DB if authorized', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
        session: { id: 'sess1' },
      } as any);

      const insertMock = vi.mocked(db.insert);
      const valuesMock = insertMock().values as any;

      await createNotification({
        userId: 'student1',
        title: 'New Project Proposed',
        message: 'A new project is available.',
        type: 'project_proposed',
        link: '/dashboard/student',
      });

      expect(insertMock).toHaveBeenCalledWith(notification);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'student1',
          title: 'New Project Proposed',
          message: 'A new project is available.',
          type: 'project_proposed',
          link: '/dashboard/student',
        }),
      );
    });

    it('handles database errors silently', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'prof1', role: 'professor' },
      } as any);

      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('DB Error');
      });

      // Should not throw, catch block logs error
      await expect(
        createNotification({
          userId: 'student1',
          title: 'Title',
          message: 'Message',
          type: 'project_proposed',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('markAsRead', () => {
    it('throws unauthorized if session missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(markAsRead(123)).rejects.toThrowError('Unauthorized');
    });

    it('updates specific notification state', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await markAsRead(123);

      expect(updateMock).toHaveBeenCalledWith(notification);
      expect(setMock).toHaveBeenCalledWith({ isRead: true });
    });

    it('throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('DB Update Error');
      });

      await expect(markAsRead(123)).rejects.toThrowError('Failed to update notification');
    });
  });

  describe('markAllAsRead', () => {
    it('throws unauthorized if session missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(markAllAsRead()).rejects.toThrowError('Unauthorized');
    });

    it('updates all notifications to read for user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      const updateMock = vi.mocked(db.update);
      const setMock = updateMock().set;

      await markAllAsRead();

      expect(updateMock).toHaveBeenCalledWith(notification);
      expect(setMock).toHaveBeenCalledWith({ isRead: true });
    });

    it('throws error if database update fails', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
      } as any);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('DB Update Error');
      });

      await expect(markAllAsRead()).rejects.toThrowError('Failed to update notifications');
    });
  });

  describe('getNotifications', () => {
    it('throws unauthorized if session missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);
      await expect(getNotifications()).rejects.toThrowError('Unauthorized');
    });

    it('returns empty array or user notifications list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      mockNotifsList = [
        {
          id: 1,
          userId: 'student1',
          title: 'Task assigned',
          message: 'Do task',
          type: 'task_assigned',
          isRead: false,
        },
      ];

      const result = await getNotifications();
      expect(result).toEqual(mockNotifsList);
    });

    it('triggers alerts for tomorrow project end or checkpoints', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      mockNotifsList = [];
      mockEnrollments = [{ id: 1, projectId: 42, userId: 'student1' }];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      mockProjects = [{ id: 42, name: 'Web Dev Project', dateEnd: tomorrowStr }];
      mockCheckpoints = [
        { id: 9, title: 'Final Deliverable', dueDate: tomorrowStr, projectId: 42 },
      ];
      const insertMock = vi.mocked(db.insert);

      await getNotifications();

      // Should insert tomorrow project end and checkpoint alerts
      expect(insertMock).toHaveBeenCalled();
    });

    it('handles null and invalid project/checkpoint dates gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      mockNotifsList = [];
      mockEnrollments = [{ id: 1, projectId: 42, userId: 'student1' }];

      mockProjects = [{ id: 42, name: 'Web Dev Project', dateEnd: null }];
      mockCheckpoints = [
        { id: 9, title: 'Final Deliverable', dueDate: 'invalid-date', projectId: 42 },
      ];

      const insertMock = vi.mocked(db.insert);

      await getNotifications();

      expect(insertMock).not.toHaveBeenCalled();
    });

    it('triggers task deadline alert when tomorrow and assignee matches', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      mockNotifsList = [];
      mockEnrollments = [{ id: 1, projectId: 42, teamId: 'team123', userId: 'student1' }];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      mockProjects = [];
      mockCheckpoints = [];
      mockTasks = [
        {
          id: 100,
          name: 'Critical Coding Task',
          status: 'todo',
          deadline: tomorrow,
          assigneeId: 'student1',
          teamId: 'team123',
        },
      ];

      const insertMock = vi.mocked(db.insert);

      await getNotifications();

      expect(insertMock).toHaveBeenCalled();
    });

    it('triggers task deadline alert with comma-separated assignees list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      mockNotifsList = [];
      mockEnrollments = [{ id: 1, projectId: 42, teamId: 'team123', userId: 'student1' }];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      mockProjects = [];
      mockCheckpoints = [];
      mockTasks = [
        {
          id: 100,
          name: 'Critical Coding Task 2',
          status: 'todo',
          deadline: tomorrow,
          assignees: 'student1, student2',
          teamId: 'team123',
        },
      ];

      const insertMock = vi.mocked(db.insert);

      await getNotifications();

      expect(insertMock).toHaveBeenCalled();
    });

    it('skips triggering task deadline alerts if already notified', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      mockNotifsList = [
        {
          id: 5,
          userId: 'student1',
          title: 'Task Deadline Tomorrow',
          message: 'Your assigned task "Critical Coding Task 3" has a deadline tomorrow.',
          type: 'task_deadline_tomorrow',
        },
      ];
      mockEnrollments = [{ id: 1, projectId: 42, teamId: 'team123', userId: 'student1' }];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      mockProjects = [];
      mockCheckpoints = [];
      mockTasks = [
        {
          id: 100,
          name: 'Critical Coding Task 3',
          status: 'todo',
          deadline: tomorrow,
          assigneeId: 'student1',
          teamId: 'team123',
        },
        {
          id: 101,
          name: 'Task Far Away',
          status: 'todo',
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days away (triggers return false)
          assigneeId: 'student1',
          teamId: 'team123',
        },
      ];

      const insertMock = vi.mocked(db.insert);

      const res = await getNotifications();

      // No new notifications inserted since it was already notified, and second task is not tomorrow
      expect(insertMock).not.toHaveBeenCalled();
      expect(res).toEqual(mockNotifsList);
    });

    it('skips project end and checkpoint alerts if already notified, and handles non-tomorrow checkpoints', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
        session: { id: 'sess1' },
      } as any);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      mockNotifsList = [
        {
          id: 6,
          userId: 'student1',
          title: 'Project Ending Tomorrow',
          message:
            'Your project "Web Dev Project" is scheduled to end tomorrow. Make sure all deliverables are submitted.',
          type: 'project_end_tomorrow',
        },
        {
          id: 7,
          userId: 'student1',
          title: 'Checkpoint Tomorrow',
          message: 'The checkpoint "Final Deliverable" for your project is scheduled for tomorrow.',
          type: 'checkpoint_tomorrow',
        },
      ];
      mockEnrollments = [{ id: 1, projectId: 42, userId: 'student1' }];
      mockProjects = [{ id: 42, name: 'Web Dev Project', dateEnd: tomorrowStr }];
      mockCheckpoints = [
        { id: 9, title: 'Final Deliverable', dueDate: tomorrowStr, projectId: 42 },
        { id: 10, title: 'Far Away Checkpoint', dueDate: '2026-12-31', projectId: 42 }, // not tomorrow (triggers return false)
      ];

      const insertMock = vi.mocked(db.insert);

      const res = await getNotifications();

      expect(insertMock).not.toHaveBeenCalled();
      expect(res).toEqual(mockNotifsList);
    });

    it('returns empty array and logs error on select error', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'student1', role: 'student' },
      } as any);

      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error('Database select failed');
      });

      const res = await getNotifications();
      expect(res).toEqual([]);
    });
  });
});
