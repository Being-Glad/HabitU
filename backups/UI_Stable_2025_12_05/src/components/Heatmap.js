import React from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { eachDayOfInterval, subDays, format, startOfWeek, addDays, isSameDay, startOfDay } from 'date-fns';

const Heatmap = ({ completedDates, color, showMonthLabels = true, showDayLabels = true, theme = 'dark', weekStart = 'Monday', isHabitDue, highlightCurrentDay = false }) => {
    const today = startOfDay(new Date());
    const isLight = theme === 'light';
    const emptyColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const futureBorderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const labelColor = isLight ? '#52525b' : '#a1a1aa';
    const dayLabelColor = isLight ? '#71717a' : '#52525b';

    // Ensure we end on today, but start 26 weeks ago aligned to the start day (approx 6 months)
    const weekStartsOn = weekStart === 'Sunday' ? 0 : 1;

    // Find the Start Day of the current week
    const currentWeekStart = startOfWeek(today, { weekStartsOn });

    // Find the earliest date in the data
    const dateKeys = Object.keys(completedDates || {});
    let earliestDate = new Date();
    if (dateKeys.length > 0) {
        // Sort to find the oldest date
        dateKeys.sort();
        const firstDataDate = new Date(dateKeys[0]);
        if (firstDataDate < earliestDate) {
            earliestDate = firstDataDate;
        }
    }

    // Default to at least 1 year (52 weeks) ago
    const oneYearAgo = subDays(currentWeekStart, 52 * 7);

    // Use the older of the two dates (earliest data or 1 year ago)
    // We also align it to the start of that week
    let rawStartDate = earliestDate < oneYearAgo ? earliestDate : oneYearAgo;
    const startDate = startOfWeek(rawStartDate, { weekStartsOn });

    // We need to generate days from the calculated start date up to the end of the current week
    // This ensures the graph spans from the earliest history right up to today
    const endDate = addDays(currentWeekStart, 6);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    // Group by weeks (columns)
    const weeks = [];
    let currentWeek = [];

    days.forEach((day, index) => {
        currentWeek.push(day);
        if (currentWeek.length === 7 || index === days.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    const renderMonthLabels = () => {
        if (!showMonthLabels) return null;

        return (
            <View style={{ flexDirection: 'row', marginBottom: 4, height: 12 }}>
                {weeks.map((week, index) => {
                    const firstDay = week[0];
                    const prevWeek = weeks[index - 1];
                    const isNewMonth = !prevWeek || format(firstDay, 'MMM') !== format(prevWeek[0], 'MMM');

                    // Logic to show Year: if it's the first label shown, OR if the month is January
                    const showYear = isNewMonth && (index === 0 || format(firstDay, 'MMM') === 'Jan');
                    const labelText = showYear ? format(firstDay, "MMM ''yy") : format(firstDay, 'MMM');

                    // Each column is 10px + 3px gap = 13px wide
                    return (
                        <View key={index} style={{ width: 13, alignItems: 'flex-start', overflow: 'visible' }}>
                            {isNewMonth && (
                                <Text style={{
                                    color: labelColor,
                                    fontSize: 9,
                                    width: 60, // Increased width to fit Year
                                    position: 'absolute',
                                    left: 0
                                }} numberOfLines={1}>
                                    {labelText}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderDayLabels = () => {
        if (!showDayLabels) return null;
        const dayLabels = weekStart === 'Sunday'
            ? ['Sun', '', 'Tue', '', 'Thu', '', 'Sat']
            : ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

        return (
            <View style={{ marginRight: 6, paddingTop: 16, justifyContent: 'space-between', height: 108 }}>
                {dayLabels.map((label, index) => (
                    <Text key={index} style={{ color: dayLabelColor, fontSize: 9, height: 10, lineHeight: 10 }}>
                        {label}
                    </Text>
                ))}
            </View>
        );
    };

    const scrollViewRef = React.useRef(null);

    React.useEffect(() => {
        // Scroll to end on mount and when completedDates change
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100); // Small delay to ensure layout is ready
        }
    }, [completedDates]);

    return (
        <View style={{ paddingVertical: 8, flexDirection: 'row' }}>
            {renderDayLabels()}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingLeft: 4, paddingRight: 4 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                <Pressable onPress={(e) => e.stopPropagation && e.stopPropagation()}>
                    <View>
                        {renderMonthLabels()}
                        <View style={{ flexDirection: 'row', gap: 3 }}>
                            {weeks.map((week, wIndex) => (
                                <View key={wIndex} style={{ gap: 3 }}>
                                    {week.map((day) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const isCompleted = completedDates?.[dateStr];
                                        const isFuture = day > today;
                                        const isDue = isHabitDue ? isHabitDue(day) : true;
                                        const isToday = isSameDay(day, today);

                                        let backgroundColor = emptyColor;
                                        if (isCompleted) {
                                            backgroundColor = color;
                                        } else if (!isDue && !isFuture) {
                                            backgroundColor = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
                                        } else if (isFuture) {
                                            backgroundColor = 'transparent';
                                        }

                                        const shouldHighlight = isToday && highlightCurrentDay;
                                        const borderColor = shouldHighlight ? color : (isFuture ? futureBorderColor : 'transparent');
                                        const borderWidth = shouldHighlight ? 2 : (isFuture ? 1 : 0);

                                        return (
                                            <View
                                                key={dateStr}
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 2,
                                                    backgroundColor,
                                                    borderWidth: borderWidth,
                                                    borderColor: borderColor,
                                                    opacity: (!isDue && !isCompleted && !isFuture) ? 0.5 : 1
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default Heatmap;
