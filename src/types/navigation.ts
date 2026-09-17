import type { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  BrowseRooms: undefined;
  MyBookings: undefined;
  AdminDashboard?: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  RoomDetails: { roomId: string };
};
