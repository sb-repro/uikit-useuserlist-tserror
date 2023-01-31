import {
  createGroupChannelCreateFragment,
  createGroupChannelFragment,
  createGroupChannelListFragment,
  createGroupChannelMembersFragment,
  createGroupChannelSettingsFragment,
  createNativeClipboardService,
  createNativeFileService,
  createNativeMediaService,
  createNativeNotificationService,
  SendbirdUIKitContainer,
  useConnection,
  useSendbirdChat,
} from '@sendbird/uikit-react-native';
import React from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import CameraRoll from '@react-native-community/cameraroll';
import RNFBMessaging from '@react-native-firebase/messaging';
import Video from 'react-native-video';
import * as DocumentPicker from 'react-native-document-picker';
import * as FileAccess from 'react-native-file-access';
import * as ImagePicker from 'react-native-image-picker';
import * as Permissions from 'react-native-permissions';
import * as CreateThumbnail from 'react-native-create-thumbnail';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationContainer,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useGroupChannel} from '@sendbird/uikit-chat-hooks';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Pressable, Text, View} from 'react-native';

const ClipboardService = createNativeClipboardService(Clipboard);
const NotificationService = createNativeNotificationService({
  messagingModule: RNFBMessaging,
  permissionModule: Permissions,
});
const FileService = createNativeFileService({
  fsModule: FileAccess,
  permissionModule: Permissions,
  imagePickerModule: ImagePicker,
  mediaLibraryModule: CameraRoll,
  documentPickerModule: DocumentPicker,
});
const MediaService = createNativeMediaService({
  VideoComponent: Video,
  thumbnailModule: CreateThumbnail,
});

const GroupChannelListFragment = createGroupChannelListFragment();
const GroupChannelCreateFragment = createGroupChannelCreateFragment();
const GroupChannelFragment = createGroupChannelFragment();

const GroupChannelListScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <GroupChannelListFragment
      onPressCreateChannel={channelType => {
        // Navigate to GroupChannelCreate function.
        navigation.navigate('GroupChannelCreate', {channelType});
      }}
      onPressChannel={channel => {
        // Navigate to GroupChannel function.
        navigation.navigate('GroupChannel', {channelUrl: channel.url});
      }}
    />
  );
};

const GroupChannelCreateScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <GroupChannelCreateFragment
      onCreateChannel={async channel => {
        // Navigate to GroupChannel function.
        navigation.replace('GroupChannel', {channelUrl: channel.url});
      }}
      onPressHeaderLeft={() => {
        // Go back to the previous screen.
        navigation.goBack();
      }}
    />
  );
};

const GroupChannelScreen = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<any>();

  const {sdk} = useSendbirdChat();
  const {channel} = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
      onChannelDeleted={() => {
        // Navigate to GroupChannelList function.
        navigation.navigate('GroupChannelList');
      }}
      onPressHeaderLeft={() => {
        // Go back to the previous screen.
        navigation.goBack();
      }}
      onPressHeaderRight={() => {
        // Navigate to GroupChannelSettings function.
        navigation.navigate('GroupChannelSettings', {
          channelUrl: params.channelUrl,
        });
      }}
    />
  );
};

const GroupChannelSettingsFragment = createGroupChannelSettingsFragment();

const GroupChannelSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<any>();

  const {sdk} = useSendbirdChat();
  const {channel} = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelSettingsFragment
      channel={channel}
      onPressMenuModeration={() => {
        navigation.goBack();
      }}
      onPressMenuLeaveChannel={() => {
        navigation.goBack();
      }}
      onPressMenuMembers={() => {
        navigation.navigate('GroupChannelMembers', params);
      }}
      onPressHeaderLeft={() => {
        // Go back to the previous screen.
        navigation.goBack();
      }}
    />
  );
};

const GroupChannelMembersFragment = createGroupChannelMembersFragment();

const GroupChannelMembersScreen = () => {
  const navigation = useNavigation<any>();
  const {params} = useRoute<any>();

  const {sdk} = useSendbirdChat();
  const {channel} = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelMembersFragment
      channel={channel}
      onPressHeaderLeft={() => navigation.goBack()}
      onPressHeaderRight={() => navigation.goBack()}
    />
  );
};

const RootStack = createNativeStackNavigator();
const Navigation = () => {
  const {currentUser} = useSendbirdChat();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!currentUser ? (
          <RootStack.Screen name={'SignIn'} component={SignInScreen} />
        ) : (
          <>
            <RootStack.Screen
              name={'GroupChannelList'}
              component={GroupChannelListScreen}
            />
            <RootStack.Screen
              name={'GroupChannelCreate'}
              component={GroupChannelCreateScreen}
            />
            <RootStack.Screen
              name={'GroupChannel'}
              component={GroupChannelScreen}
            />
            <RootStack.Screen
              name={'GroupChannelSettings'}
              component={GroupChannelSettingsScreen}
            />
            <RootStack.Screen
              name={'GroupChannelMembers'}
              component={GroupChannelMembersScreen}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const SignInScreen = () => {
  const {connect} = useConnection();

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Pressable
        style={{
          width: 120,
          height: 30,
          backgroundColor: '#742DDD',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => connect('USER_ID', {nickname: 'NICKNAME'})}>
        <Text>{'Sign in'}</Text>
      </Pressable>
    </View>
  );
};
const App = () => {
  return (
    <SendbirdUIKitContainer
      appId={'2D7B4CDB-932F-4082-9B09-A1153792DC8D'}
      chatOptions={{localCacheStorage: AsyncStorage}}
      platformServices={{
        file: FileService,
        notification: NotificationService,
        clipboard: ClipboardService,
      }}>
      <Navigation />
    </SendbirdUIKitContainer>
  );
};

export default App;
