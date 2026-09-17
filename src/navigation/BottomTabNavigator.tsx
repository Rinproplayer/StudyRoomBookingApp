import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabParamList } from '../types/navigation';
import { BrowseRoomsScreen } from '../screens/BrowseRoomsScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { useUserStore } from '../store/useUserStore';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.borderLight,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: Colors.textPrimary,
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Tab 1: Khám phá phòng */}
      <Tab.Screen
        name="BrowseRooms"
        component={BrowseRoomsScreen}
        options={{
          title: 'Khám Phá Phòng Học',
          tabBarLabel: 'Tìm phòng',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Tab Admin: Chỉ hiển thị khi đăng nhập tài khoản Quản trị viên */}
      {isAdmin && (
        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Quản Trị Campus (Admin)',
            tabBarLabel: 'Quản trị',
            tabBarActiveTintColor: '#B45309',
            tabBarIcon: ({ size, focused }) => (
              <Ionicons
                name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
                size={size}
                color={focused ? '#B45309' : Colors.textMuted}
              />
            ),
          }}
        />
      )}

      {/* Tab 2: Lịch đặt */}
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'Lịch Đặt Của Tôi',
          tabBarLabel: 'Lịch đặt',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 3: Hồ sơ cá nhân */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Hồ Sơ Sinh Viên',
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
