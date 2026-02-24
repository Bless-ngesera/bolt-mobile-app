import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Bot,
  Building2,
  Navigation,
  History,
  LogOut,
  Sun,
  Moon,
  UserCircle2,
  Settings,
} from 'lucide-react-native';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();
  const router = useRouter();

  const menuItems = [
    {
      title: 'Robot Control',
      icon: Bot,
      description: 'Control robot movement and status',
      onPress: () => router.push('/(tabs)/robot'),
      color: colors.primary,
    },
    {
      title: 'Faculty & Classroom',
      icon: Building2,
      description: 'Manage faculties and classrooms',
      onPress: () => router.push('/(tabs)/manage'),
      color: '#10B981',
    },
    {
      title: 'Navigate & Guide',
      icon: Navigation,
      description: 'Guide students to classrooms',
      onPress: () => router.push('/(tabs)/map'),
      color: '#F59E0B',
    },
    {
      title: 'School History',
      icon: History,
      description: 'View university history',
      onPress: () => router.push('/(tabs)/history'),
      color: '#8B5CF6',
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <UserCircle2 size={14} color="#FFFFFF" />
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.themeCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.themeRow}>
            <Sun size={24} color={mode === 'light' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
            </Text>
            <Moon size={24} color={mode === 'dark' ? colors.primary : colors.textSecondary} />
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

        {menuItems.map((item, index) => (
          <Animated.View
            key={item.title}
            entering={FadeInDown.delay(200 + index * 100).springify()}
          >
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <item.icon size={28} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  themeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
  },
});
