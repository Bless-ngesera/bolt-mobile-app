import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Faculty {
  id: string;
  name: string;
  floors: number;
  created_at?: string;
}

export interface Classroom {
  id: string;
  name: string;
  faculty_id: string;
  floor: number;
  room_type: string;
  x_coordinate: number;
  y_coordinate: number;
  created_at?: string;
}

export interface RobotState {
  id: string;
  status: string;
  battery_level: number;
  current_x: number;
  current_y: number;
  target_classroom_id?: string | null;
  updated_at?: string;
}

const FACULTIES_KEY = 'faculties';
const CLASSROOMS_KEY = 'classrooms';
const ROBOT_STATE_KEY = 'robot_state';

// Initialize with demo data
const DEMO_FACULTIES: Faculty[] = [
  { id: 'fac-1', name: 'Information Technology', floors: 3, created_at: new Date().toISOString() },
  { id: 'fac-2', name: 'Engineering', floors: 4, created_at: new Date().toISOString() },
];

const DEMO_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-1',
    name: 'IT-101',
    faculty_id: 'fac-1',
    floor: 1,
    room_type: 'lecture',
    x_coordinate: 50,
    y_coordinate: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cls-2',
    name: 'IT-102',
    faculty_id: 'fac-1',
    floor: 1,
    room_type: 'lab',
    x_coordinate: 150,
    y_coordinate: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cls-3',
    name: 'IT-201',
    faculty_id: 'fac-1',
    floor: 2,
    room_type: 'lecture',
    x_coordinate: 50,
    y_coordinate: 200,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cls-4',
    name: 'IT-202',
    faculty_id: 'fac-1',
    floor: 2,
    room_type: 'lab',
    x_coordinate: 150,
    y_coordinate: 200,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cls-5',
    name: 'IT-301',
    faculty_id: 'fac-1',
    floor: 3,
    room_type: 'office',
    x_coordinate: 50,
    y_coordinate: 300,
    created_at: new Date().toISOString(),
  },
];

const DEMO_ROBOT_STATE: RobotState = {
  id: 'robot-1',
  status: 'idle',
  battery_level: 100,
  current_x: 0,
  current_y: 0,
  target_classroom_id: null,
  updated_at: new Date().toISOString(),
};

// Faculty Functions
export async function getFaculties(): Promise<Faculty[]> {
  try {
    const data = await AsyncStorage.getItem(FACULTIES_KEY);
    return data ? JSON.parse(data) : DEMO_FACULTIES;
  } catch (error) {
    console.error('Error getting faculties:', error);
    return DEMO_FACULTIES;
  }
}

export async function addFaculty(faculty: Omit<Faculty, 'id' | 'created_at'>): Promise<Faculty> {
  try {
    const faculties = await getFaculties();
    const newFaculty: Faculty = {
      ...faculty,
      id: `fac-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    faculties.push(newFaculty);
    await AsyncStorage.setItem(FACULTIES_KEY, JSON.stringify(faculties));
    return newFaculty;
  } catch (error) {
    console.error('Error adding faculty:', error);
    throw error;
  }
}

// Classroom Functions
export async function getClassrooms(): Promise<Classroom[]> {
  try {
    const data = await AsyncStorage.getItem(CLASSROOMS_KEY);
    return data ? JSON.parse(data) : DEMO_CLASSROOMS;
  } catch (error) {
    console.error('Error getting classrooms:', error);
    return DEMO_CLASSROOMS;
  }
}

export async function addClassroom(classroom: Omit<Classroom, 'id' | 'created_at'>): Promise<Classroom> {
  try {
    const classrooms = await getClassrooms();
    const newClassroom: Classroom = {
      ...classroom,
      id: `cls-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    classrooms.push(newClassroom);
    await AsyncStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
    return newClassroom;
  } catch (error) {
    console.error('Error adding classroom:', error);
    throw error;
  }
}

// Robot State Functions
export async function getRobotState(): Promise<RobotState> {
  try {
    const data = await AsyncStorage.getItem(ROBOT_STATE_KEY);
    return data ? JSON.parse(data) : DEMO_ROBOT_STATE;
  } catch (error) {
    console.error('Error getting robot state:', error);
    return DEMO_ROBOT_STATE;
  }
}

export async function updateRobotState(updates: Partial<RobotState>): Promise<RobotState> {
  try {
    const current = await getRobotState();
    const updated: RobotState = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating robot state:', error);
    throw error;
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([FACULTIES_KEY, CLASSROOMS_KEY, ROBOT_STATE_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

// Reset to demo data
export async function resetToDemoData(): Promise<void> {
  try {
    await clearAllData();
    await AsyncStorage.setItem(FACULTIES_KEY, JSON.stringify(DEMO_FACULTIES));
    await AsyncStorage.setItem(CLASSROOMS_KEY, JSON.stringify(DEMO_CLASSROOMS));
    await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(DEMO_ROBOT_STATE));
  } catch (error) {
    console.error('Error resetting to demo data:', error);
    throw error;
  }
}
