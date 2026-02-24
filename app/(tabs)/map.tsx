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
import { getClassrooms, getFaculties, getRobotState, updateRobotState } from '@/lib/storage';
import type { Classroom, RobotState, Faculty } from '@/lib/storage';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  Map as MapIcon,
  MapPin,
  Bot,
  Navigation,
  Search,
  X,
  UserRoundSearch,
} from 'lucide-react-native';

interface ClassroomWithFaculty extends Classroom {
  faculties?: { name: string };
}

export default function MapScreen() {
  const { colors } = useTheme();
  const [classrooms, setClassrooms] = useState<ClassroomWithFaculty[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [robotState, setRobotState] = useState<RobotState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');

  const robotPulse = useSharedValue(1);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    robotPulse.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      false
    );
  }, []);

  const loadData = async () => {
    try {
      const [classroomsData, facultiesData, robotData] = await Promise.all([
        getClassrooms(),
        getFaculties(),
        getRobotState(),
      ]);

      // Enrich classrooms with faculty names
      const enrichedClassrooms: ClassroomWithFaculty[] = classroomsData.map((classroom: Classroom) => ({
        ...classroom,
        faculties: { name: facultiesData.find((f: Faculty) => f.id === classroom.faculty_id)?.name || 'Unknown' },
      }));

      setClassrooms(enrichedClassrooms);
      setFaculties(facultiesData);
      setRobotState(robotData);

      if (robotData.status === 'moving' && robotData.target_classroom_id) {
        simulateRobotMovement(robotData);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  const simulateRobotMovement = async (robot: RobotState) => {
    const target = classrooms.find((c) => c.id === robot.target_classroom_id);
    if (!target) return;

    const deltaX = target.x_coordinate - robot.current_x;
    const deltaY = target.y_coordinate - robot.current_y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 5) {
      await updateRobotState({
        status: 'arrived',
        current_x: target.x_coordinate,
        current_y: target.y_coordinate,
      });
      return;
    }

    const step = 10;
    const newX = robot.current_x + (deltaX / distance) * step;
    const newY = robot.current_y + (deltaY / distance) * step;

    await updateRobotState({
      current_x: newX,
      current_y: newY,
    });
  };

  const navigateToClassroom = async (classroomId: string) => {
    if (!robotState) return;

    try {
      const updated = await updateRobotState({
        status: 'moving',
        target_classroom_id: classroomId,
      });

      setRobotState(updated);

      const classroom = classrooms.find((c) => c.id === classroomId);
      if (classroom) {
        Alert.alert('Navigation Started', `Robot is moving to ${classroom.name}`);
      }
    } catch (error) {
      console.error('Error navigating:', error);
      Alert.alert('Error', 'Failed to navigate');
    }
  };

  const guideStudent = async () => {
    if (!selectedClassroomId) {
      Alert.alert('Error', 'Please select a classroom');
      return;
    }

    await navigateToClassroom(selectedClassroomId);
    setShowGuideModal(false);
    setSelectedFacultyId('');
    setSelectedClassroomId('');
  };

  const robotAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: robotPulse.value }],
  }));

  const filteredClassrooms = classrooms.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.faculties?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const facultyClassrooms = selectedFacultyId
    ? classrooms.filter((c) => c.faculty_id === selectedFacultyId)
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <MapIcon size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Navigation Map</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search classrooms..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.guideButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowGuideModal(true)}
        >
          <UserRoundSearch size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.mapContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.mapTitle, { color: colors.text }]}>IT Department Map</Text>

          <View style={[styles.map, { backgroundColor: colors.background }]}>
            {classrooms.map((classroom) => (
              <TouchableOpacity
                key={classroom.id}
                style={[
                  styles.classroomMarker,
                  {
                    left: classroom.x_coordinate,
                    top: classroom.y_coordinate,
                    backgroundColor: colors.accent,
                  },
                ]}
                onPress={() => navigateToClassroom(classroom.id)}
              >
                <MapPin size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ))}

            {robotState && (
              <Animated.View
                style={[
                  robotAnimStyle,
                  styles.robotMarker,
                  {
                    left: robotState.current_x - 15,
                    top: robotState.current_y - 15,
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Bot size={20} color="#FFFFFF" />
              </Animated.View>
            )}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>Robot</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>Classroom</Text>
            </View>
          </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Classrooms</Text>

        {filteredClassrooms.map((classroom, index) => (
          <Animated.View
            key={classroom.id}
            entering={FadeInDown.delay(200 + index * 50).springify()}
          >
            <TouchableOpacity
              style={[styles.classroomCard, { backgroundColor: colors.surface }]}
              onPress={() => navigateToClassroom(classroom.id)}
            >
              <MapPin size={24} color={colors.accent} />
              <View style={styles.classroomInfo}>
                <Text style={[styles.classroomName, { color: colors.text }]}>
                  {classroom.name}
                </Text>
                <Text style={[styles.classroomDetails, { color: colors.textSecondary }]}>
                  {classroom.faculties?.name} • Floor {classroom.floor} • {classroom.room_type}
                </Text>
              </View>
              <Navigation size={20} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <Modal visible={showGuideModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Guide Student</Text>
              <TouchableOpacity onPress={() => setShowGuideModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Select Faculty</Text>
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
                  onPress={() => {
                    setSelectedFacultyId(faculty.id);
                    setSelectedClassroomId('');
                  }}
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

            {selectedFacultyId && (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Select Classroom</Text>
                <ScrollView style={styles.classroomList} nestedScrollEnabled>
                  {facultyClassrooms.map((classroom) => (
                    <TouchableOpacity
                      key={classroom.id}
                      style={[
                        styles.classroomOption,
                        {
                          backgroundColor:
                            selectedClassroomId === classroom.id
                              ? colors.primaryLight
                              : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setSelectedClassroomId(classroom.id)}
                    >
                      <Text
                        style={[
                          styles.classroomOptionText,
                          {
                            color:
                              selectedClassroomId === classroom.id ? colors.primary : colors.text,
                          },
                        ]}
                      >
                        {classroom.name} - Floor {classroom.floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: selectedClassroomId ? colors.accent : colors.border,
                },
              ]}
              onPress={guideStudent}
              disabled={!selectedClassroomId}
            >
              <Text style={styles.submitButtonText}>Start Guiding</Text>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  guideButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  mapContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  classroomMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -16,
    marginTop: -16,
  },
  robotMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  classroomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  classroomInfo: {
    flex: 1,
  },
  classroomName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classroomDetails: {
    fontSize: 14,
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
  classroomList: {
    maxHeight: 150,
  },
  classroomOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  classroomOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
