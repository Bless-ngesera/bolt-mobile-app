import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Building2, Plus, School, X, MapPin, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Faculty {
  id: string;
  name: string;
  floors: number;
}

interface Classroom {
  id: string;
  name: string;
  faculty_id: string;
  floor: number;
  room_type: string;
  faculties?: { name: string };
}

export default function ManageScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);

  const [facultyName, setFacultyName] = useState('');
  const [facultyFloors, setFacultyFloors] = useState('1');

  const [classroomName, setClassroomName] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [classroomFloor, setClassroomFloor] = useState('1');
  const [roomType, setRoomType] = useState('lecture');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .order('name');

      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('*, faculties(name)')
        .order('name');

      if (!facultiesError && facultiesData) setFaculties(facultiesData);
      if (!classroomsError && classroomsData) setClassrooms(classroomsData);
    } catch (error) {
      console.error('Error loading manage data:', error);
    }
  };

  const addFaculty = async () => {
    if (!facultyName.trim()) {
      Alert.alert('Error', 'Please enter faculty name');
      return;
    }

    const { error } = await supabase.from('faculties').insert({
      name: facultyName,
      floors: parseInt(facultyFloors) || 1,
    });

    if (!error) {
      setFacultyName('');
      setFacultyFloors('1');
      setShowFacultyModal(false);
      loadData();
      Alert.alert('Success', 'Faculty added successfully');
    }
  };

  const addClassroom = async () => {
    if (!classroomName.trim() || !selectedFacultyId) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const randomX = Math.random() * 300 + 50;
    const randomY = Math.random() * 300 + 50;

    const { error } = await supabase.from('classrooms').insert({
      name: classroomName,
      faculty_id: selectedFacultyId,
      floor: parseInt(classroomFloor) || 1,
      room_type: roomType,
      x_coordinate: randomX,
      y_coordinate: randomY,
    });

    if (!error) {
      setClassroomName('');
      setSelectedFacultyId('');
      setClassroomFloor('1');
      setRoomType('lecture');
      setShowClassroomModal(false);
      loadData();
      Alert.alert('Success', 'Classroom added successfully');
    }
  };

  const navigateToClassroom = async (classroom: Classroom) => {
    const { data: robotData } = await supabase
      .from('robot_state')
      .select('*')
      .maybeSingle();

    if (robotData) {
      await supabase
        .from('robot_state')
        .update({
          status: 'moving',
          target_classroom_id: classroom.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', robotData.id);

      Alert.alert('Navigation Started', `Robot is moving to ${classroom.name}`);
      router.push('/(tabs)/map');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Building2 size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Manage Facilities</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowFacultyModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Faculty</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => setShowClassroomModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Classroom</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Faculties</Text>
          {faculties.map((faculty, index) => (
            <Animated.View
              key={faculty.id}
              entering={FadeInDown.delay(150 + index * 50).springify()}
              style={[styles.card, { backgroundColor: colors.surface }]}
            >
              <School size={24} color={colors.primary} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{faculty.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  {faculty.floors} Floor{faculty.floors !== 1 ? 's' : ''}
                </Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Classrooms</Text>
          {classrooms.map((classroom, index) => (
            <Animated.View
              key={classroom.id}
              entering={FadeInDown.delay(250 + index * 50).springify()}
              style={[styles.card, { backgroundColor: colors.surface }]}
            >
              <MapPin size={24} color={colors.accent} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{classroom.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  {classroom.faculties?.name} • Floor {classroom.floor} • {classroom.room_type}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.navigateButton, { backgroundColor: colors.primary }]}
                onPress={() => navigateToClassroom(classroom)}
              >
                <Navigation size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      <Modal visible={showFacultyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Faculty</Text>
              <TouchableOpacity onPress={() => setShowFacultyModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Faculty Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              value={facultyName}
              onChangeText={setFacultyName}
              placeholder="e.g., Computer Science"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Number of Floors</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              value={facultyFloors}
              onChangeText={setFacultyFloors}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={addFaculty}
            >
              <Text style={styles.submitButtonText}>Add Faculty</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showClassroomModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Classroom</Text>
              <TouchableOpacity onPress={() => setShowClassroomModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Classroom Name/Code</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              value={classroomName}
              onChangeText={setClassroomName}
              placeholder="e.g., IT-103"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Faculty</Text>
            <ScrollView style={styles.facultyList} nestedScrollEnabled>
              {faculties.map((faculty) => (
                <TouchableOpacity
                  key={faculty.id}
                  style={[
                    styles.facultyOption,
                    {
                      backgroundColor:
                        selectedFacultyId === faculty.id ? colors.primaryLight : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSelectedFacultyId(faculty.id)}
                >
                  <Text
                    style={[
                      styles.facultyOptionText,
                      { color: selectedFacultyId === faculty.id ? colors.primary : colors.text },
                    ]}
                  >
                    {faculty.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Floor</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              value={classroomFloor}
              onChangeText={setClassroomFloor}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Room Type</Text>
            <View style={styles.roomTypeContainer}>
              {['lecture', 'lab', 'office'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.roomTypeButton,
                    {
                      backgroundColor: roomType === type ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setRoomType(type)}
                >
                  <Text
                    style={[
                      styles.roomTypeText,
                      { color: roomType === type ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.accent }]}
              onPress={addClassroom}
            >
              <Text style={styles.submitButtonText}>Add Classroom</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  navigateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  facultyList: {
    maxHeight: 120,
  },
  facultyOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  facultyOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roomTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roomTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  roomTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
