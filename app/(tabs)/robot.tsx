import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getRobotState, updateRobotState } from '@/lib/storage';
import type { RobotState } from '@/lib/storage';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  Bot,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
  Hand,
  Power,
  Battery,
  BatteryCharging,
  CircleAlert,
} from 'lucide-react-native';

export default function RobotControl() {
  const { colors } = useTheme();
  const [robotState, setRobotState] = useState<RobotState | null>(null);
  const [armPosition, setArmPosition] = useState<'raised' | 'lowered'>('lowered');
  const robotScale = useSharedValue(1);

  useEffect(() => {
    loadRobotState();
    const interval = setInterval(loadRobotState, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadRobotState = async () => {
    try {
      const data = await getRobotState();
      setRobotState(data);
    } catch (error) {
      console.error('Error loading robot state:', error);
    }
  };

  const updateRobotStateLocal = async (updates: Partial<RobotState>) => {
    if (!robotState) return;

    try {
      const updated = await updateRobotState({ ...updates, id: robotState.id });
      setRobotState(updated);
    } catch (error) {
      console.error('Error updating robot state:', error);
    }
  };

  const moveRobot = async (direction: string, deltaX: number, deltaY: number) => {
    if (!robotState) return;

    robotScale.value = withSpring(0.9, {}, () => {
      robotScale.value = withSpring(1);
    });

    const newX = Math.max(0, Math.min(400, robotState.current_x + deltaX));
    const newY = Math.max(0, Math.min(400, robotState.current_y + deltaY));

    await updateRobotStateLocal({
      current_x: newX,
      current_y: newY,
      status: 'moving',
    });

    setTimeout(() => {
      updateRobotStateLocal({ status: 'idle' });
    }, 1000);
  };

  const rotateRobot = async (direction: 'cw' | 'ccw') => {
    robotScale.value = withSpring(0.9, {}, () => {
      robotScale.value = withSpring(1);
    });

    await updateRobotStateLocal({ status: 'moving' });
    setTimeout(() => {
      updateRobotStateLocal({ status: 'idle' });
    }, 800);
  };

  const toggleArm = () => {
    setArmPosition((prev) => (prev === 'raised' ? 'lowered' : 'raised'));
  };

  const emergencyStop = async () => {
    await updateRobotStateLocal({ status: 'idle', target_classroom_id: null });
    Alert.alert('Emergency Stop', 'Robot has been stopped');
  };

  const robotAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: robotScale.value }],
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return colors.success;
      case 'moving':
        return colors.primary;
      case 'arrived':
        return colors.accent;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getBatteryIcon = () => {
    if (!robotState) return Battery;
    if (robotState.battery_level > 80) return BatteryCharging;
    return Battery;
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Bot size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Robot Control</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.statusCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.statusHeader}>
            <Animated.View style={robotAnimStyle}>
              <Bot size={48} color={colors.primary} />
            </Animated.View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Current Status
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(robotState?.status || 'idle') },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {(robotState?.status || 'idle').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.batteryContainer}>
            <BatteryIcon size={24} color={colors.textSecondary} />
            <View style={styles.batteryInfo}>
              <Text style={[styles.batteryLabel, { color: colors.textSecondary }]}>
                Battery Level
              </Text>
              <Text style={[styles.batteryText, { color: colors.text }]}>
                {robotState?.battery_level || 0}%
              </Text>
            </View>
            <View
              style={[
                styles.batteryBar,
                {
                  backgroundColor: colors.border,
                  width: 100,
                },
              ]}
            >
              <View
                style={[
                  styles.batteryFill,
                  {
                    width: `${robotState?.battery_level || 0}%`,
                    backgroundColor:
                      (robotState?.battery_level || 0) > 20 ? colors.success : colors.error,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.positionContainer}>
            <Text style={[styles.positionLabel, { color: colors.textSecondary }]}>
              Position: X: {Math.round(robotState?.current_x || 0)}, Y:{' '}
              {Math.round(robotState?.current_y || 0)}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.controlCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Manual Movement</Text>

          <View style={styles.dpadContainer}>
            <View style={styles.dpadRow}>
              <View style={styles.dpadSpace} />
              <TouchableOpacity
                style={[styles.dpadButton, { backgroundColor: colors.primary }]}
                onPress={() => moveRobot('up', 0, -20)}
              >
                <ChevronUp size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.dpadSpace} />
            </View>

            <View style={styles.dpadRow}>
              <TouchableOpacity
                style={[styles.dpadButton, { backgroundColor: colors.primary }]}
                onPress={() => moveRobot('left', -20, 0)}
              >
                <ChevronLeft size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={[styles.dpadCenter, { backgroundColor: colors.background }]}>
                <Bot size={24} color={colors.textSecondary} />
              </View>
              <TouchableOpacity
                style={[styles.dpadButton, { backgroundColor: colors.primary }]}
                onPress={() => moveRobot('right', 20, 0)}
              >
                <ChevronRight size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.dpadRow}>
              <View style={styles.dpadSpace} />
              <TouchableOpacity
                style={[styles.dpadButton, { backgroundColor: colors.primary }]}
                onPress={() => moveRobot('down', 0, 20)}
              >
                <ChevronDown size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.dpadSpace} />
            </View>
          </View>

          <View style={styles.rotateContainer}>
            <TouchableOpacity
              style={[styles.rotateButton, { backgroundColor: colors.accent }]}
              onPress={() => rotateRobot('ccw')}
            >
              <RotateCcw size={24} color="#FFFFFF" />
              <Text style={styles.rotateText}>Rotate Left</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rotateButton, { backgroundColor: colors.accent }]}
              onPress={() => rotateRobot('cw')}
            >
              <RotateCw size={24} color="#FFFFFF" />
              <Text style={styles.rotateText}>Rotate Right</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={[styles.controlCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Robot Arm</Text>
          <TouchableOpacity
            style={[styles.armButton, { backgroundColor: colors.primary }]}
            onPress={toggleArm}
          >
            <Hand size={24} color="#FFFFFF" />
            <Text style={styles.armButtonText}>
              {armPosition === 'raised' ? 'Lower Arm' : 'Raise Arm'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.armStatus, { color: colors.textSecondary }]}>
            Arm Position: {armPosition.toUpperCase()}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.emergencyContainer}
        >
          <TouchableOpacity
            style={[styles.emergencyButton, { backgroundColor: colors.error }]}
            onPress={emergencyStop}
          >
            <CircleAlert size={28} color="#FFFFFF" />
            <Text style={styles.emergencyText}>EMERGENCY STOP</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  batteryInfo: {
    flex: 1,
  },
  batteryLabel: {
    fontSize: 12,
  },
  batteryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  batteryBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  positionContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  positionLabel: {
    fontSize: 14,
  },
  controlCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dpadButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadCenter: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadSpace: {
    width: 64,
    height: 64,
  },
  rotateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  rotateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  rotateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  armButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  armButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  armStatus: {
    textAlign: 'center',
    fontSize: 14,
  },
  emergencyContainer: {
    marginBottom: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
