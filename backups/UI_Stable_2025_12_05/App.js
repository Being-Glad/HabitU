import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Modal, Linking, Platform, BackHandler, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { requestWidgetUpdate } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitProvider, useHabits } from './src/context/HabitContext';
import { AuthProvider } from './src/context/AuthContext';
import HabitCard from './src/components/HabitCard';
import CreateHabitScreen from './src/screens/CreateHabitScreen';
import ArchivedHabitsScreen from './src/screens/ArchivedHabitsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HabitDetailsScreen from './src/screens/HabitDetailsScreen';
import ShareHabitScreen from './src/screens/ShareHabitScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import SocialScreen from './src/screens/SocialScreen';
import HabitActionModal from './src/components/HabitActionModal';
import EditHabitScreen from './src/screens/EditHabitScreen';
import FadeInView from './src/components/FadeInView';
import CalendarModal from './src/components/CalendarModal';
import InsightsModal from './src/components/InsightsModal';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HabitGridItem from './src/components/HabitGridItem';
import HabitStreakItem from './src/components/HabitStreakItem';
import { Settings, Plus, LayoutDashboard, Users, TrendingUp, List, Grid, Flame, Gift, BookOpen } from 'lucide-react-native';
import { format } from 'date-fns';
import { HabitWidget } from './src/widget/HabitWidget';
import { HabitListWidget } from './src/widget/HabitListWidget';
import { HabitGridWidget } from './src/widget/HabitGridWidget';
import { HabitWeekWidget } from './src/widget/HabitWeekWidget';
import { HabitStreakWidget } from './src/widget/HabitStreakWidget';
import { MonetizationService } from './src/services/MonetizationService';

const MainScreen = () => {
  const { habits, addHabit, archiveHabit, isHabitDue, settings, updateSettings, isInsightsUnlocked, unlockTheme } = useHabits();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isArchiveVisible, setArchiveVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInsightsVisible, setInsightsVisible] = useState(false);
  const [isResourcesVisible, setResourcesVisible] = useState(false);
  const [isSocialVisible, setSocialVisible] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [actionHabit, setActionHabit] = useState(null);
  const [editHabit, setEditHabit] = useState(null);
  const [calendarHabit, setCalendarHabit] = useState(null);
  const [shareHabit, setShareHabit] = useState(null);
  const [widgetConfigId, setWidgetConfigId] = useState(null);
  const [widgetConfigName, setWidgetConfigName] = useState(null);

  // Onboarding State
  const [hasLaunched, setHasLaunched] = useState(null); // null = loading, false = first time, true = returning
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem('hasLaunched');
      if (value === null) {
        setHasLaunched(false);
      } else {
        setHasLaunched(true);
      }
    } catch (e) {
      setHasLaunched(true); // Fallback
    }
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setHasLaunched(true);
    setShowOnboarding(false);
  };

  useEffect(() => {
    const backAction = () => {
      if (widgetConfigId) {
        setWidgetConfigId(null);
        return true;
      }
      if (isInsightsVisible) {
        setInsightsVisible(false);
        return true;
      }
      if (isResourcesVisible) {
        setResourcesVisible(false);
        return true;
      }
      if (calendarHabit) {
        setCalendarHabit(null);
        return true;
      }
      if (editHabit) {
        setEditHabit(null);
        return true;
      }
      if (actionHabit) {
        setActionHabit(null);
        return true;
      }
      if (isCreateModalVisible) {
        setCreateModalVisible(false);
        return true;
      }
      if (isArchiveVisible) {
        setArchiveVisible(false);
        return true;
      }
      if (isSettingsVisible) {
        setSettingsVisible(false);
        return true;
      }
      if (isSocialVisible) {
        setSocialVisible(false);
        return true;
      }
      if (selectedHabitId) {
        setSelectedHabitId(null);
        return true;
      }
      if (shareHabit) {
        setShareHabit(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [
    widgetConfigId, isInsightsVisible, isResourcesVisible, calendarHabit, editHabit, actionHabit,
    isCreateModalVisible, isArchiveVisible, isSettingsVisible, isSocialVisible,
    selectedHabitId, shareHabit
  ]);

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      handleUrl(url);
    };

    const handleUrl = (url) => {
      if (!url) return;
      // Format: habitu://widget-config/{widgetName}/{widgetId}
      if (url.includes('widget-config')) {
        // Remove trailing slash if present
        const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        const parts = cleanUrl.split('/');

        const configIndex = parts.indexOf('widget-config');

        if (configIndex !== -1 && parts.length > configIndex + 2) {
          const name = parts[configIndex + 1];
          const id = parts[configIndex + 2];

          if (id && name) {
            setWidgetConfigId(id);
            setWidgetConfigName(name);
            return;
          }
        }

        const id = parts[parts.length - 1];
        const name = parts[parts.length - 2];

        if (id && name && name !== 'widget-config') {
          setWidgetConfigId(id);
          setWidgetConfigName(name);
        } else if (id) {
          setWidgetConfigId(id);
          setWidgetConfigName('HabitWidget');
        }
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleWidgetConfigSelect = async (habit) => {
    if (!widgetConfigId) return;

    try {
      const existingConfigStr = await AsyncStorage.getItem('widget_config');
      const config = existingConfigStr ? JSON.parse(existingConfigStr) : {};

      const widgetName = widgetConfigName || 'HabitWidget';
      config[widgetConfigId] = {
        habitId: habit.id,
        widgetName: widgetName
      };
      await AsyncStorage.setItem('widget_config', JSON.stringify(config));

      const renderWidgetContent = () => {
        const commonProps = {
          name: habit.name,
          streak: habit.streak || 0,
          color: habit.color,
          completedDates: habit.completedDates || habit.logs || {},
          icon: habit.icon,
          habitId: habit.id,
          weekStart: settings.weekStart,
          showStreak: settings.showStreakCount,
          showLabels: settings.showDayLabels
        };

        switch (widgetName) {
          case 'HabitListWidget':
            return <HabitListWidget habits={activeHabits} />;
          case 'HabitGridWidget':
            return <HabitGridWidget {...commonProps} />;
          case 'HabitWeekWidget':
            return <HabitWeekWidget {...commonProps} />;
          case 'HabitStreakWidget':
            return <HabitStreakWidget {...commonProps} />;
          default:
            return <HabitWidget {...commonProps} />;
        }
      };

      requestWidgetUpdate({
        widgetName: widgetName,
        renderWidget: renderWidgetContent,
        widgetId: widgetConfigId,
      });

      setWidgetConfigId(null);
      alert(`Widget linked to ${habit.name}!`);
    } catch (e) {
      console.error('Failed to configure widget', e);
    }
  };

  const activeHabits = habits.filter(h => !h.archived);
  const [groupBy, setGroupBy] = useState('none');

  const today = new Date();
  const todaysHabits = activeHabits.filter(h => isHabitDue(h, today));

  const groupedHabits = React.useMemo(() => {
    if (groupBy === 'none') {
      return todaysHabits.length > 0 ? { 'All': todaysHabits } : {};
    }

    const groups = {};
    todaysHabits.forEach(habit => {
      const category = habit.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(habit);
    });

    return groups;
  }, [todaysHabits, groupBy]);

  const handleCreateHabit = (habitData) => {
    addHabit(habitData);
    setCreateModalVisible(false);
  };

  const handleHabitAction = (action, habit) => {
    setActionHabit(null);
    switch (action) {
      case 'calendar':
        setCalendarHabit(habit);
        break;
      case 'edit':
        setEditHabit(habit);
        break;
      case 'share':
        setShareHabit(habit);
        break;
      case 'archive':
        archiveHabit(habit.id);
        break;
    }
  };

  const handleSupport = async () => {
    await MonetizationService.openDonation();
  };

  const handleInsightsPress = () => {
    if (isInsightsUnlocked()) {
      setInsightsVisible(true);
    } else {
      Alert.alert(
        "Premium Insights Locked",
        "Unlock detailed stats and charts for 3 days by sharing the app!",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Share to Unlock",
            onPress: async () => {
              const success = await MonetizationService.unlockViaShare('insights');
              if (success) {
                unlockTheme('insights'); // Reuse unlockTheme
                Alert.alert("Unlocked!", "Insights unlocked for 3 days.");
                setInsightsVisible(true);
              }
            }
          }
        ]
      );
    }
  };

  if (hasLaunched === null) return null;

  if (hasLaunched === false) {
    if (showOnboarding) {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
    return <WelcomeScreen onNext={() => setShowOnboarding(true)} />;
  }

  if (shareHabit) {
    return <ShareHabitScreen habit={shareHabit} onClose={() => setShareHabit(null)} />;
  }

  if (selectedHabitId) {
    return <HabitDetailsScreen habitId={selectedHabitId} onClose={() => setSelectedHabitId(null)} />;
  }

  if (isSocialVisible) {
    return <SocialScreen onClose={() => setSocialVisible(false)} />;
  }

  if (isArchiveVisible) {
    return <ArchivedHabitsScreen onClose={() => setArchiveVisible(false)} />;
  }

  if (isSettingsVisible) {
    return (
      <SettingsScreen
        onClose={() => setSettingsVisible(false)}
        onOpenArchive={() => {
          setArchiveVisible(true);
        }}
      />
    );
  }

  const accentColor = settings.accentColor || '#2dd4bf';
  const themeId = settings.theme || 'dark';

  const getBackgroundColor = () => {
    switch (themeId) {
      case 'midnight': return '#000000';
      case 'slate': return '#0f172a';
      case 'coffee': return '#1c1917';
      default: return '#0f0f0f';
    }
  };

  const backgroundColor = getBackgroundColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" hidden={true} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HabitU</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setResourcesVisible(true)} style={styles.iconButton}>
            <BookOpen color="#a1a1aa" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleInsightsPress} style={styles.iconButton}>
            <TrendingUp color="#a1a1aa" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSupport} style={styles.iconButton}>
            <Gift color="#a1a1aa" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconButton}>
            <Settings color="#a1a1aa" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* View Switcher */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Today's Habits</Text>
          <View style={styles.viewSwitcher}>
            <TouchableOpacity
              style={[styles.viewButton, settings.viewMode === 'list' && { backgroundColor: accentColor }]}
              onPress={() => updateSettings({ viewMode: 'list' })}
            >
              <List color={settings.viewMode === 'list' ? '#000' : '#a1a1aa'} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, settings.viewMode === 'grid' && { backgroundColor: accentColor }]}
              onPress={() => updateSettings({ viewMode: 'grid' })}
            >
              <Grid color={settings.viewMode === 'grid' ? '#000' : '#a1a1aa'} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, settings.viewMode === 'streak' && { backgroundColor: accentColor }]}
              onPress={() => updateSettings({ viewMode: 'streak' })}
            >
              <Flame color={settings.viewMode === 'streak' ? '#000' : '#a1a1aa'} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {todaysHabits.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}>
              <Plus color={accentColor} size={40} />
            </View>
            <Text style={styles.emptyStateTitle}>No Habits Due Today</Text>
            <Text style={styles.emptyStateSubtitle}>You're all caught up! Or create a new habit to get started.</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(true)} style={[styles.createButton, { backgroundColor: accentColor }]}>
              <Text style={styles.createButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {settings.viewMode === 'list' && (
              todaysHabits.map((habit, index) => (
                <FadeInView key={habit.id} delay={index * 50} duration={500}>
                  <HabitCard
                    habit={habit}
                    onPress={() => setActionHabit(habit)}
                    onShare={() => setShareHabit(habit)}
                  />
                </FadeInView>
              ))
            )}

            {settings.viewMode === 'grid' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
                {todaysHabits.map(habit => (
                  <View key={habit.id} style={{ width: '50%' }}>
                    <HabitGridItem
                      habit={habit}
                      onPress={() => setActionHabit(habit)}
                    />
                  </View>
                ))}
              </View>
            )}

            {settings.viewMode === 'streak' && (
              todaysHabits
                .sort((a, b) => {
                  // Sort by streak length descending
                  const getStreak = (h) => {
                    let s = 0;
                    let d = new Date();
                    const dates = h.completedDates || h.logs || {};
                    if (!dates[format(d, 'yyyy-MM-dd')]) d.setDate(d.getDate() - 1);
                    while (dates[format(d, 'yyyy-MM-dd')]) { s++; d.setDate(d.getDate() - 1); }
                    return s;
                  };
                  return getStreak(b) - getStreak(a);
                })
                .map(habit => (
                  <HabitStreakItem
                    key={habit.id}
                    habit={habit}
                    onPress={() => setActionHabit(habit)}
                  />
                ))
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <LayoutDashboard color={accentColor} size={20} />

        <TouchableOpacity onPress={() => setCreateModalVisible(true)} style={[styles.fab, { backgroundColor: accentColor, shadowColor: accentColor, borderColor: backgroundColor }]}>
          <Plus color="#000" size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSocialVisible(true)}>
          <Users color="#a1a1aa" size={20} />
        </TouchableOpacity>
      </View>

      <CreateHabitScreen
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleCreateHabit}
      />

      <HabitActionModal
        visible={!!actionHabit}
        habit={actionHabit}
        onClose={() => setActionHabit(null)}
        onAction={handleHabitAction}
      />

      <EditHabitScreen
        visible={!!editHabit}
        habit={editHabit}
        onClose={() => setEditHabit(null)}
      />

      <CalendarModal
        visible={!!calendarHabit}
        habit={calendarHabit}
        onClose={() => setCalendarHabit(null)}
      />

      <InsightsModal
        visible={isInsightsVisible}
        onClose={() => setInsightsVisible(false)}
      />

      {
        isResourcesVisible && (
          <ResourcesScreen onClose={() => setResourcesVisible(false)} />
        )
      }

      {/* Widget Configuration Modal */}
      <Modal
        visible={!!widgetConfigId}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWidgetConfigId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Habit for Widget</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {activeHabits.map(habit => (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.habitOption}
                  onPress={() => handleWidgetConfigSelect(habit)}
                >
                  <Text style={styles.habitOptionIcon}>{habit.icon === 'star' ? '⭐' : '📝'}</Text>
                  <Text style={styles.habitOptionText}>{habit.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setWidgetConfigId(null)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
};


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <HabitProvider>
          <MainScreen />
        </HabitProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28, // Reduced from 32
    fontWeight: 'bold',
    color: '#fff',
  },
  iconButton: {
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    borderRadius: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    paddingHorizontal: 20,
  },
  navbar: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    width: '80%',
    height: 60, // Reduced from 70
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 30, // Adjusted radius
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fab: {
    width: 48, // Reduced from 56
    height: 48, // Reduced from 56
    borderRadius: 24,
    backgroundColor: '#2dd4bf',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -32, // Adjusted for new height
    borderWidth: 4,
    borderColor: '#0f0f0f',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: '80%',
  },
  createButton: {
    backgroundColor: '#2dd4bf',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#27272a',
    borderRadius: 16,
    marginBottom: 12,
  },
  habitOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  habitOptionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#a1a1aa',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'ShadowsIntoLight', // Assuming this font is loaded, or fallback
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: '#2dd4bf',
  },
  groupSection: {
    marginBottom: 24,
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a1a1aa',
    marginBottom: 12,
    marginLeft: 4,
  },
});
