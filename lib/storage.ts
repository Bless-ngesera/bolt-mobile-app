import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

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

// Initialize storage on app load to prevent constraint errors
let storageInitialized = false;

export async function initializeStorage(): Promise<void> {
  if (storageInitialized) return;
  
  try {
    // Ensure robot_state exists (prevents concurrent insert race conditions)
    const existingRobot = await AsyncStorage.getItem(ROBOT_STATE_KEY);
    if (!existingRobot) {
      await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(DEMO_ROBOT_STATE));
    }
    
    // Ensure faculties exist
    const existingFaculties = await AsyncStorage.getItem(FACULTIES_KEY);
    if (!existingFaculties) {
      await AsyncStorage.setItem(FACULTIES_KEY, JSON.stringify(DEMO_FACULTIES));
    }
    
    // Ensure classrooms exist
    const existingClassrooms = await AsyncStorage.getItem(CLASSROOMS_KEY);
    if (!existingClassrooms) {
      await AsyncStorage.setItem(CLASSROOMS_KEY, JSON.stringify(DEMO_CLASSROOMS));
    }
    
    storageInitialized = true;
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
    storageInitialized = true;
  }
}

const USE_REMOTE = ((process.env.EXPO_PUBLIC_USE_REMOTE_DB === 'true' || process.env.SUPABASE_USE_REMOTE === 'true') && !!supabase) || false;

// Faculty Functions
export async function getFaculties(): Promise<Faculty[]> {
  if (USE_REMOTE && supabase) {
    try {
      const { data, error } = await supabase.from('faculties').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('Supabase getFaculties error:', error);
        // fallback to local
      } else if (data) {
        return data as Faculty[];
      }
    } catch (err) {
      console.error('Supabase getFaculties exception:', err);
    }
  }

  try {
    const data = await AsyncStorage.getItem(FACULTIES_KEY);
    return data ? JSON.parse(data) : DEMO_FACULTIES;
  } catch (error) {
    console.error('Error getting faculties:', error);
    return DEMO_FACULTIES;
  }
}

export async function addFaculty(faculty: Omit<Faculty, 'id' | 'created_at'>): Promise<Faculty> {
  if (USE_REMOTE && supabase) {
    try {
      const { data, error } = await supabase.from('faculties').insert({ name: faculty.name, floors: faculty.floors }).select().single();
      if (error) throw error;
      return data as Faculty;
    } catch (err) {
      console.error('Supabase addFaculty failed, falling back:', err);
      // continue to local fallback
    }
  }

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
  if (USE_REMOTE && supabase) {
    try {
      const { data, error } = await supabase.from('classrooms').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('Supabase getClassrooms error:', error);
      } else if (data) {
        return data as Classroom[];
      }
    } catch (err) {
      console.error('Supabase getClassrooms exception:', err);
    }
  }

  try {
    const data = await AsyncStorage.getItem(CLASSROOMS_KEY);
    return data ? JSON.parse(data) : DEMO_CLASSROOMS;
  } catch (error) {
    console.error('Error getting classrooms:', error);
    return DEMO_CLASSROOMS;
  }
}

export async function addClassroom(classroom: Omit<Classroom, 'id' | 'created_at'>): Promise<Classroom> {
  if (USE_REMOTE && supabase) {
    try {
      const { data, error } = await supabase.from('classrooms').insert({
        name: classroom.name,
        faculty_id: classroom.faculty_id,
        floor: classroom.floor,
        room_type: classroom.room_type,
        x_coordinate: classroom.x_coordinate,
        y_coordinate: classroom.y_coordinate,
      }).select().single();
      if (error) throw error;
      return data as Classroom;
    } catch (err) {
      console.error('Supabase addClassroom failed, falling back:', err);
    }
  }

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

// Guard against concurrent robot state initialization
let robotStateInitPromise: Promise<RobotState> | null = null;

// Robot State Functions
export async function getRobotState(): Promise<RobotState> {
  // First check local storage (fast path)
  try {
    const data = await AsyncStorage.getItem(ROBOT_STATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting robot state from local storage:', error);
  }

  // If remote is enabled, try to fetch/initialize remotely
  if (USE_REMOTE && supabase) {
    try {
      const { data, error } = await supabase.from('robot_state').select('*').limit(1).single();
      if (!error && data) {
        // Found remote robot state, cache it locally
        await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(data));
        return data as RobotState;
      }

      // No remote robot state exists - try to create one (with race condition guard)
      if (!robotStateInitPromise) {
        robotStateInitPromise = (async () => {
          try {
            const { data: created, error: createErr } = await supabase
              .from('robot_state')
              .insert({ 
                status: DEMO_ROBOT_STATE.status, 
                battery_level: DEMO_ROBOT_STATE.battery_level, 
                current_x: DEMO_ROBOT_STATE.current_x, 
                current_y: DEMO_ROBOT_STATE.current_y 
              })
              .select()
              .single();

            if (createErr) {
              console.error('Supabase create initial robot_state failed:', createErr);
              // If it's a unique constraint, another request beat us to it - try to fetch it
              if (createErr.code === '23505') {
                const { data: fetched } = await supabase
                  .from('robot_state')
                  .select('*')
                  .limit(1)
                  .single();
                const result = (fetched as RobotState) || DEMO_ROBOT_STATE;
                await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(result));
                return result;
              }
              return DEMO_ROBOT_STATE;
            }
            
            await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(created));
            return created as RobotState;
          } finally {
            robotStateInitPromise = null;
          }
        })();
      }

      const initialized = await robotStateInitPromise;
      return initialized || DEMO_ROBOT_STATE;
    } catch (err) {
      console.error('Supabase getRobotState exception:', err);
    }
  }

  // Fallback to demo data
  try {
    await AsyncStorage.setItem(ROBOT_STATE_KEY, JSON.stringify(DEMO_ROBOT_STATE));
  } catch (e) {
    console.error('Error caching demo robot state:', e);
  }
  return DEMO_ROBOT_STATE;
}

export async function updateRobotState(updates: Partial<RobotState>): Promise<RobotState> {
  if (USE_REMOTE && supabase) {
    try {
      const current = await getRobotState();
      const payload = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString(),
      } as any;

      const { data, error } = await supabase.from('robot_state').update(payload).eq('id', current.id).select().single();
      if (error) throw error;
      return data as RobotState;
    } catch (err) {
      console.error('Supabase updateRobotState failed, falling back:', err);
    }
  }

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
  if (USE_REMOTE && supabase) {
    try {
      await supabase.from('classrooms').delete().neq('id', '');
      await supabase.from('faculties').delete().neq('id', '');
      await supabase.from('robot_state').delete().neq('id', '');
      return;
    } catch (err) {
      console.error('Supabase clearAllData failed, falling back to local:', err);
    }
  }

  try {
    await AsyncStorage.multiRemove([FACULTIES_KEY, CLASSROOMS_KEY, ROBOT_STATE_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

// Reset to demo data
export async function resetToDemoData(): Promise<void> {
  if (USE_REMOTE && supabase) {
    try {
      await clearAllData();
      // insert faculties
      for (const f of DEMO_FACULTIES) {
        await supabase.from('faculties').insert({ name: f.name, floors: f.floors });
      }
      // get IT faculty id
      const { data: facData } = await supabase.from('faculties').select('id,name').eq('name', 'Information Technology').limit(1).single();
      const itId = facData ? (facData as any).id : null;
      if (itId) {
        for (const c of DEMO_CLASSROOMS) {
          await supabase.from('classrooms').insert({ name: c.name, faculty_id: itId, floor: c.floor, room_type: c.room_type, x_coordinate: c.x_coordinate, y_coordinate: c.y_coordinate });
        }
      }
      await supabase.from('robot_state').insert({ status: DEMO_ROBOT_STATE.status, battery_level: DEMO_ROBOT_STATE.battery_level, current_x: DEMO_ROBOT_STATE.current_x, current_y: DEMO_ROBOT_STATE.current_y });
      return;
    } catch (err) {
      console.error('Supabase resetToDemoData failed, falling back to local:', err);
    }
  }

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
