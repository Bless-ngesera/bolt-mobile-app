import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { History as HistoryIcon, Calendar, Award, Users, Building } from 'lucide-react-native';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: any;
}

export default function HistoryScreen() {
  const { colors } = useTheme();

  const timelineEvents: TimelineEvent[] = [
    {
      year: '1997',
      title: 'Foundation',
      description:
        'International University of East Africa was established with a vision to provide quality education in the heart of East Africa.',
      icon: Building,
    },
    {
      year: '2001',
      title: 'IT Department Launch',
      description:
        'The Information Technology Department was officially launched, offering cutting-edge programs in computer science and software engineering.',
      icon: Award,
    },
    {
      year: '2010',
      title: 'Campus Expansion',
      description:
        'Major expansion of the IT facilities, including state-of-the-art computer labs and research centers.',
      icon: Building,
    },
    {
      year: '2015',
      title: 'Innovation Hub',
      description:
        'Opened the Innovation and Technology Hub, fostering entrepreneurship and technological advancement among students.',
      icon: Users,
    },
    {
      year: '2020',
      title: 'Smart Campus Initiative',
      description:
        'Launched the Smart Campus Initiative, integrating IoT and AI technologies throughout the university.',
      icon: Award,
    },
    {
      year: '2024',
      title: 'Smart Guide Robot',
      description:
        'Introduced the Smart Guide Robot system to assist students and visitors in navigating the IT Department.',
      icon: Building,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <HistoryIcon size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>University History</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.heroImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
              <Building size={64} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              International University of East Africa
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Empowering minds, transforming futures since 1997
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>About IUEA</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            The International University of East Africa (IUEA) stands as a beacon of academic
            excellence in the region. Established with the mission to provide world-class education,
            IUEA has grown into a leading institution known for its innovative approach to learning
            and commitment to student success.
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            The Information Technology Department has been at the forefront of technological
            advancement, producing graduates who excel in software development, cybersecurity, data
            science, and artificial intelligence.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Journey</Text>

          <View style={styles.timeline}>
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <Animated.View
                  key={event.year}
                  entering={FadeInDown.delay(400 + index * 100).springify()}
                  style={styles.timelineItem}
                >
                  <View style={styles.timelineLeft}>
                    <View
                      style={[styles.timelineIconContainer, { backgroundColor: colors.primary }]}
                    >
                      <Icon size={20} color="#FFFFFF" />
                    </View>
                    {index < timelineEvents.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  <View style={[styles.timelineCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.timelineHeader}>
                      <View
                        style={[styles.yearBadge, { backgroundColor: colors.primaryLight }]}
                      >
                        <Calendar size={14} color={colors.primary} />
                        <Text style={[styles.year, { color: colors.primary }]}>{event.year}</Text>
                      </View>
                    </View>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                      {event.description}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>Quick Facts</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>25+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Years of Excellence
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.accent }]}>5000+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Students</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>50+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  IT Faculty
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.error }]}>100+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Partner Companies
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900).springify()}>
          <View style={[styles.missionCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.missionTitle, { color: colors.text }]}>Our Mission</Text>
            <Text style={[styles.missionText, { color: colors.textSecondary }]}>
              To provide innovative, quality education that empowers students to become leaders in
              technology and drive positive change in society through excellence in teaching,
              research, and community engagement.
            </Text>
          </View>
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
  heroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  year: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  missionCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
});
