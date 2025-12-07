import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Modal, Linking, Platform, BackHandler, Alert, LayoutAnimation, UIManager, FlatList } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { requestWidgetUpdate } from 'react-native-android-widget';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitProvider, useHabits } from './src/context/HabitContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AlertProvider, useAlert } from './src/context/AlertContext';
import CustomAlert from './src/components/CustomAlert';
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
import CelebrationModal from './src/components/CelebrationModal';
import ScaleButton from './src/components/ScaleButton';
import TabTransition from './src/components/TabTransition';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, ZoomIn } from 'react-native-reanimated';

const MainScreen = () => {
  const { user } = useAuth();
  const { habits, addHabit, archiveHabit, isHabitDue, settings, updateSettings, isInsightsUnlocked, unlockTheme } = useHabits();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'resources', 'social', 'settings'
  const [isViewSwitcherOpen, setViewSwitcherOpen] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isArchiveVisible, setArchiveVisible] = useState(false);
  const [isInsightsVisible, setInsightsVisible] = useState(false);
  // Removed individual visibility states for main tabs
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [actionHabit, setActionHabit] = useState(null);
  const [editHabit, setEditHabit] = useState(null);
  const [calendarHabit, setCalendarHabit] = useState(null);
  const [shareHabit, setShareHabit] = useState(null);
  const [widgetConfigId, setWidgetConfigId] = useState(null);
  const [widgetConfigName, setWidgetConfigName] = useState(null);

  // Pulse animation for empty state
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

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
      // Handle back button to go to Home tab if on another tab
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }

      // Existing modal back handling
      if (widgetConfigId) { setWidgetConfigId(null); return true; }
      if (isInsightsVisible) { setInsightsVisible(false); return true; }
      if (calendarHabit) { setCalendarHabit(null); return true; }
      if (editHabit) { setEditHabit(null); return true; }
      if (actionHabit) { setActionHabit(null); return true; }
      if (isCreateModalVisible) { setCreateModalVisible(false); return true; }
      if (isArchiveVisible) { setArchiveVisible(false); return true; }
      if (selectedHabitId) { setSelectedHabitId(null); return true; }
      if (shareHabit) { setShareHabit(null); return true; }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [
    activeTab, // Added activeTab dependency
    widgetConfigId, isInsightsVisible, calendarHabit, editHabit, actionHabit,
    isCreateModalVisible, isArchiveVisible, selectedHabitId, shareHabit
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
    try {
      if (!widgetConfigId) {
        console.error('[App] No widgetConfigId found when selecting habit');
        return;
      }

      console.log('[App] Selecting habit for Widget ID:', widgetConfigId);

      const existingConfigStr = await AsyncStorage.getItem('widget_config');
      console.log('[App] Existing Config (Before Save):', existingConfigStr);
      const config = existingConfigStr ? JSON.parse(existingConfigStr) : {};

      const widgetName = widgetConfigName || 'HabitWidget';
      const parsedId = parseInt(widgetConfigId, 10);

      if (isNaN(parsedId)) {
        console.error('[App] Invalid Widget ID parsed:', widgetConfigId);
        showAlert('Error', 'Invalid Widget Configuration. Please try removing and adding the widget again.');
        setWidgetConfigId(null);
        return;
      }

      const strId = String(parsedId);

      console.log(`[App] SAVING CONFIG: Widget ${strId} -> Habit ${habit.name} (${habit.id})`);

      config[strId] = {
        habitId: habit.id,
        widgetName: widgetName
      };

      console.log('[App] New Config (After Save):', JSON.stringify(config));
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
        widgetId: parsedId,
      });

      setWidgetConfigId(null);
      setWidgetConfigName(null); // Clear name too
      showAlert('Success', `Widget linked to ${habit.name}!`);
    } catch (e) {
      console.error('Failed to configure widget', e);
      showAlert('Error', 'Failed to configure widget.');
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

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [isShareLoading, setShareLoading] = useState(false);

  const handleInsightsPress = () => {
    if (isInsightsUnlocked()) {
      try {
        setInsightsVisible(true);
      } catch (error) {
        console.error("Error opening insights:", error);
      }
    } else {
      showAlert(
        "Premium Insights Locked",
        "Unlock detailed stats and charts for 3 days by sharing the app!",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: isShareLoading ? "Verifying..." : "Share to Unlock",
            onPress: async () => {
              if (isShareLoading) return;
              setShareLoading(true);

              try {
                const success = await MonetizationService.unlockViaShare('insights');

                setShareLoading(false);

                if (success) {
                  unlockTheme('insights', 'Premium Insights');
                  setCelebrationMessage("Insights unlocked for 3 days. Enjoy!");
                  setShowCelebration(true);
                  // Open after a brief delay so they see the celebration first? 
                  // Or let them open it manually. 
                  // Let's open it automatically after celebration closure or just let them click again.
                  // For now, let's just celebrate.
                  setTimeout(() => setInsightsVisible(true), 2500); // Auto-open after party
                }
              } catch (e) {
                setShareLoading(false);
                showAlert("Error", "Something went wrong.");
              }
            }
          }
        ]
      );
    }
  }


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

  const renderHomeContent = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HabitU</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <ScaleButton onPress={handleInsightsPress} style={styles.iconButton}>
            <TrendingUp color="#a1a1aa" size={20} />
          </ScaleButton>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* View Switcher */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Today's Habits</Text>
          <View style={[styles.viewSwitcher, isViewSwitcherOpen && { paddingRight: 8 }]}>
            {/* If Closed, show ONLY the active one (as a toggle) */}
            {!isViewSwitcherOpen && (
              <ScaleButton
                style={[styles.viewButton, { backgroundColor: accentColor }]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setViewSwitcherOpen(true);
                }}
              >
                {settings.viewMode === 'list' && <List color="#000" size={20} />}
                {settings.viewMode === 'grid' && <Grid color="#000" size={20} />}
                {settings.viewMode === 'streak' && <Flame color="#000" size={20} />}
              </ScaleButton>
            )}

            {/* If Open, show ALL options */}
            {isViewSwitcherOpen && (
              <>
                <ScaleButton
                  style={[styles.viewButton, settings.viewMode === 'list' && { backgroundColor: accentColor }]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    updateSettings({ viewMode: 'list' });
                    setViewSwitcherOpen(false);
                  }}
                >
                  <List color={settings.viewMode === 'list' ? '#000' : '#a1a1aa'} size={20} />
                </ScaleButton>

                <ScaleButton
                  style={[styles.viewButton, settings.viewMode === 'grid' && { backgroundColor: accentColor }]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    updateSettings({ viewMode: 'grid' });
                    setViewSwitcherOpen(false);
                  }}
                >
                  <Grid color={settings.viewMode === 'grid' ? '#000' : '#a1a1aa'} size={20} />
                </ScaleButton>

                <ScaleButton
                  style={[styles.viewButton, settings.viewMode === 'streak' && { backgroundColor: accentColor }]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    updateSettings({ viewMode: 'streak' });
                    setViewSwitcherOpen(false);
                  }}
                >
                  <Flame color={settings.viewMode === 'streak' ? '#000' : '#a1a1aa'} size={20} />
                </ScaleButton>
              </>
            )}
          </View>
        </View>

        {todaysHabits.length === 0 ? (
          <Animated.View entering={ZoomIn.duration(500)} style={styles.emptyStateContainer}>
            <ScaleButton
              style={[styles.emptyIconBg, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}
              onPress={() => setCreateModalVisible(true)}
            >
              <Animated.View style={animatedPulseStyle}>
                <Plus color={accentColor} size={40} />
              </Animated.View>
            </ScaleButton>
            <Text style={styles.emptyStateTitle}>No Habits Due Today</Text>
            <Text style={styles.emptyStateSubtitle}>You're all caught up! Or create a new habit to get started.</Text>
            <ScaleButton onPress={() => setCreateModalVisible(true)} style={[styles.createButton, { backgroundColor: accentColor }]}>
              <Text style={styles.createButtonText}>Create Habit</Text>
            </ScaleButton>
          </Animated.View>
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
                {todaysHabits.map((habit, index) => (
                  <View key={habit.id} style={{ width: '50%' }}>
                    <FadeInView delay={index * 50} duration={500} style={{ flex: 1 }}>
                      <HabitGridItem
                        habit={habit}
                        onPress={() => setActionHabit(habit)}
                      />
                    </FadeInView>
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
                .map((habit, index) => (
                  <FadeInView key={habit.id} delay={index * 50} duration={500}>
                    <HabitStreakItem
                      habit={habit}
                      onPress={() => setActionHabit(habit)}
                    />
                  </FadeInView>
                ))
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" hidden={true} />

      {/* Tab Content Container */}
      <View style={{ flex: 1 }}>
        <TabTransition isActive={activeTab === 'home'}>
          {renderHomeContent()}
        </TabTransition>

        <TabTransition isActive={activeTab === 'resources'}>
          <ResourcesScreen onClose={() => setActiveTab('home')} />
        </TabTransition>

        <TabTransition isActive={activeTab === 'social'}>
          <SocialScreen onClose={() => setActiveTab('home')} />
        </TabTransition>

        <TabTransition isActive={activeTab === 'settings'}>
          <SettingsScreen
            onClose={() => setActiveTab('home')}
            onOpenArchive={() => setArchiveVisible(true)}
          />
        </TabTransition>
      </View>

      {/* Bottom Navigation */}
      {/* Bottom Navigation - Hidden on Login Screen */}
      {!(activeTab === 'social' && !user) && (
        <View style={[styles.navbar, { width: '90%', left: '5%' }]}>
          <ScaleButton onPress={() => setActiveTab('home')}>
            <LayoutDashboard color={activeTab === 'home' ? accentColor : "#a1a1aa"} size={24} />
          </ScaleButton>

          <ScaleButton onPress={() => setActiveTab('resources')}>
            <BookOpen color={activeTab === 'resources' ? accentColor : "#a1a1aa"} size={24} />
          </ScaleButton>

          <ScaleButton onPress={() => setCreateModalVisible(true)} style={[styles.fab, { backgroundColor: accentColor, shadowColor: accentColor, borderColor: backgroundColor }]}>
            <Plus color="#000" size={24} />
          </ScaleButton>

          <ScaleButton onPress={() => setActiveTab('social')}>
            <Users color={activeTab === 'social' ? accentColor : "#a1a1aa"} size={24} />
          </ScaleButton>

          <ScaleButton onPress={() => setActiveTab('settings')}>
            <Settings color={activeTab === 'settings' ? accentColor : "#a1a1aa"} size={24} />
          </ScaleButton>
        </View>
      )}

      {/* Modals */}
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

      {/* Archive Screen as Modal now since it's sub-navigation */}
      {isArchiveVisible && (
        <Modal visible={true} onRequestClose={() => setArchiveVisible(false)} animationType="slide">
          <ArchivedHabitsScreen onClose={() => setArchiveVisible(false)} />
        </Modal>
      )}

      {/* Widget Configuration Modal */}
      <Modal
        visible={!!widgetConfigId}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setWidgetConfigId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Habit for Widget</Text>

            {activeHabits.length > 0 ? (
              <FlatList
                data={activeHabits}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <ScaleButton
                    style={styles.habitOption}
                    onPress={() => handleWidgetConfigSelect(item)}
                  >
                    <Text style={styles.habitOptionIcon}>{item.icon === 'star' ? '⭐' : '📝'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.habitOptionText}>{item.name}</Text>
                      <Text style={{ fontSize: 12, color: '#a1a1aa' }}>
                        {item.category || 'General'}
                      </Text>
                    </View>
                    <Plus size={20} color="#52525b" />
                  </ScaleButton>
                )}
              />
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: 20, fontSize: 16 }}>
                  No active habits found.{'\n'}Add one to start using widgets.
                </Text>
                <ScaleButton
                  style={[styles.createButton, { backgroundColor: '#2dd4bf' }]}
                  onPress={() => {
                    setWidgetConfigId(null);
                    setTimeout(() => setCreateModalVisible(true), 500);
                  }}
                >
                  <Text style={styles.createButtonText}>Create Habit</Text>
                </ScaleButton>
              </View>
            )}

            <ScaleButton
              style={styles.closeButton}
              onPress={() => setWidgetConfigId(null)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </ScaleButton>
          </View>
        </View>
      </Modal>

      <CelebrationModal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
        message={celebrationMessage}
      />
    </SafeAreaView >
  );
};


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <HabitProvider>
          <AlertProvider>
            <MainScreen />
            <CustomAlert />
          </AlertProvider>
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
    zIndex: 100, // Ensure on top of TabTransition
    elevation: 100,
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
    elevation: 101, // FAB higher than navbar
    zIndex: 101,
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
