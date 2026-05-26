export interface StudentDropdownItem {
  id: string;
  name: string;
  email: string;
  role: string | null;
  promo: string | null;
}

export interface ProfDropdownItem {
  id: string;
  name: string;
  email: string;
  role: string | null;
  promo: string | null;
}

export type DialogState = {
  students: StudentDropdownItem[];
  professors: ProfDropdownItem[];
  targetPromos: string[];
  targetUsers: string[];
  coTeachers: string[];
  studentSearch: string;
  profSearch: string;
  checkpoints: { id: string; title: string; dueDate: string }[];
};

export const initialDialogState: DialogState = {
  students: [],
  professors: [],
  targetPromos: [],
  targetUsers: [],
  coTeachers: [],
  studentSearch: '',
  profSearch: '',
  checkpoints: [],
};

export type DialogAction =
  | { type: 'SET_DROPDOWNS'; students: StudentDropdownItem[]; professors: ProfDropdownItem[] }
  | { type: 'SET_TARGET_PROMOS'; promos: string[] }
  | { type: 'SET_TARGET_USERS'; users: string[] }
  | { type: 'SET_CO_TEACHERS'; teachers: string[] }
  | { type: 'SET_STUDENT_SEARCH'; search: string }
  | { type: 'SET_PROF_SEARCH'; search: string }
  | { type: 'SET_CHECKPOINTS'; checkpoints: { id: string; title: string; dueDate: string }[] }
  | { type: 'RESET' };

export function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'SET_DROPDOWNS':
      return { ...state, students: action.students, professors: action.professors };
    case 'SET_TARGET_PROMOS':
      return { ...state, targetPromos: action.promos };
    case 'SET_TARGET_USERS':
      return { ...state, targetUsers: action.users };
    case 'SET_CO_TEACHERS':
      return { ...state, coTeachers: action.teachers };
    case 'SET_STUDENT_SEARCH':
      return { ...state, studentSearch: action.search };
    case 'SET_PROF_SEARCH':
      return { ...state, profSearch: action.search };
    case 'SET_CHECKPOINTS':
      return { ...state, checkpoints: action.checkpoints };
    case 'RESET':
      return initialDialogState;
    default:
      return state;
  }
}
